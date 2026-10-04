import "server-only";

import { createHash } from "node:crypto";
import { getConfiguredApplicationOwnerUserId } from "@/lib/application-session-core";
import { buildBasicFreeDiscoveryCreditReservationClaimId } from "@/lib/basic-free-discovery-credit-reservation-store";
import { getIntradayScanWindow } from "@/lib/intraday-scan-window";
import { getDailyCandlesWithRetainedHistory } from "@/lib/market-data";
import { throwIfAborted } from "@/lib/operation-abort";
import { isProviderRateLimitLikeError } from "@/lib/provider-rate-limit";
import { buildRealScannerBaseCandidateSelection } from "@/lib/real-scanner-candidate-generation";
import { captureCompletedDailyContext, readCompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { getUsEquityMarketSession, usEquityMarketCalendarDataset } from "@/lib/us-equity-market-calendar";
import { prepareBasicFreeDiscoveryCreditReservation, finalizeBasicFreeDiscoveryCreditReservation } from "@/lib/server/basic-free-discovery-credit-reservation-persistence";

export const COMPLETED_SESSION_HISTORY_PREPARATION_VERSION = "completed_session_history_preparation_v1" as const;
export const COMPLETED_SESSION_HISTORY_RESUMPTION_VERSION = "completed_history_terminal_failure_resumption_v1" as const;
type Member = {
  ticker: string;
  status: "pending" | "available" | "acquired" | "blocked";
  claim_id: string | null;
  captured_at: string | null;
  content_sha256: string | null;
  blocker: string | null;
};
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function budget(value: string | undefined, maximum: number) {
  return value && /^[1-9][0-9]*$/.test(value) && Number(value) <= maximum ? Number(value) : null;
}
function minute(now: Date) {
  return new Date(Math.floor(now.getTime() / 60000) * 60000).toISOString();
}

/** Fixed-purpose, server-owned history acquisition, NOT a scheduler or route.
 * One call acquires at most eight histories. The caller may resume in another
 * minute, but cannot supply tickers, dates, prices, owners or claim identities.
 * Valid same-day histories cost no additional credits. An ambiguous prior
 * attempt cannot be retried under a different minute or cohort fingerprint.
 * No current-price, candidate, publication, outcome or execution authority.
 */
export async function prepareCompletedSessionHistories(options: { signal?: AbortSignal } = {}) {
  const signal = AbortSignal.any([AbortSignal.timeout(45000), ...(options.signal ? [options.signal] : [])]);
  const abortedReason = () => options.signal?.aborted ? "history_preparation_aborted" : "history_preparation_deadline_exhausted";
  const started = new Date();
  const session = getUsEquityMarketSession(started);
  const owner = getConfiguredApplicationOwnerUserId();
  const dailyBudget = budget(process.env.TURE_BASIC_FREE_CATALOG_DAILY_CREDIT_BUDGET, 800);
  const minuteBudget = budget(process.env.TURE_BASIC_FREE_CATALOG_PER_MINUTE_CREDIT_BUDGET, 8);
  const members: Member[] = [];
  let fingerprint: string | null = null;
  let requested = 0;
  let reserved = 0;
  let finalized = 0;
  let accountingComplete = true;
  const result = (blocker: string | null) => ({
    policy_version: COMPLETED_SESSION_HISTORY_PREPARATION_VERSION,
    resumption_policy_version: COMPLETED_SESSION_HISTORY_RESUMPTION_VERSION,
    started_at: started.toISOString(), completed_at: new Date().toISOString(),
    trading_date: session.market_date, universe_fingerprint: fingerprint,
    scope: "server_selected_original_regular_session_universe" as const,
    status: blocker ? "blocked" as const : members.every(row => row.status === "available" || row.status === "acquired")
      ? "complete" as const : "partial" as const,
    blocker, original_members: members,
    requested_credits: requested, reserved_credits: reserved, finalized_credits: finalized,
    reservation_accounting_complete: accountingComplete,
    cost_scope: "current_invocation_known_credits_durable_ledger_is_authoritative" as const,
    current_price_allowed: false, publication_allowed: false, broker_allowed: false,
  });
  if (Object.keys(options).some(key => key !== "signal")) return result("history_preparation_request_invalid");
  // Preparation is same-day before a verified open. Normalized current-session
  // scanning keeps its separate regular-hours gate, unchanged.
  if (!owner || process.env.TWELVE_DATA_PLAN_MODE !== "free" || !dailyBudget || !minuteBudget)
    return result("history_preparation_owner_plan_or_budget_unavailable");
  if (!usEquityMarketCalendarDataset || session.verification_status !== "verified" || session.freshness_status !== "current" ||
    !session.market_date || !session.session_open || !session.session_close ||
    started.getTime() >= Date.parse(session.session_open)) return result("history_preparation_session_unavailable");
  const tickers = new Set<string>();
  for (let slot = Date.parse(session.session_open); slot < Date.parse(session.session_close); slot += 900000) {
    const now = new Date(slot);
    const selection = buildRealScannerBaseCandidateSelection({ scanWindow: getIntradayScanWindow(now),
      requestedScanBudget: 8, selectionMode: "scheduled_rotating", now });
    if (!selection.selection || selection.candidates.length !== 8) return result("history_preparation_original_selection_unavailable");
    selection.candidates.forEach(candidate => tickers.add(candidate.ticker));
  }
  if (!tickers.size || tickers.size > 256) return result("history_preparation_original_selection_unavailable");
  members.push(...[...tickers].map(ticker => ({ ticker, status: "pending" as const,
    claim_id: null, captured_at: null, content_sha256: null, blocker: null })));
  fingerprint = `sha256:${createHash("sha256").update(JSON.stringify({ policy: COMPLETED_SESSION_HISTORY_PREPARATION_VERSION,
    date: session.market_date, calendar: usEquityMarketCalendarDataset.dataset_fingerprint, tickers: [...tickers] })).digest("hex")}`;
  const { client } = getServerSupabaseClient();
  if (!client) return result("history_preparation_cache_unavailable");
  try {
    throwIfAborted(signal);
    // A capped API page is not an absent, unpaid history. Prove the complete
    // fixed selection before finalizing claims or reserving another credit.
    // ticker is unique; its database order and keyset predicate agree even
    // when PostgREST returns fewer rows than the requested page size.
    const readSignal = AbortSignal.any([signal, AbortSignal.timeout(5000)]);
    const rows = new Map<string, { ticker: string; raw: unknown; updated_at: string | null }>();
    let expectedCount: number | null = null;
    let cursor: string | null = null;
    for (let page = 0; page < 256; page++) {
      throwIfAborted(readSignal);
      let query = client.from("scanner_cache").select("ticker,raw,updated_at", { count: "exact" })
        .in("ticker", [...tickers]).order("ticker", { ascending: true }).limit(64);
      if (cursor !== null) query = query.gt("ticker", cursor);
      const cached = await query.abortSignal(readSignal);
      throwIfAborted(readSignal);
      if (cached.error || !Array.isArray(cached.data) || !Number.isSafeInteger(cached.count) ||
        cached.count === null || cached.count < 0 || cached.count > tickers.size)
        return result("history_preparation_cache_unavailable");
      if (expectedCount === null) expectedCount = cached.count;
      if (cached.count !== expectedCount - rows.size || cached.data.length > 64 ||
        cached.data.length > cached.count || (!cached.data.length && cached.count !== 0))
        return result("history_preparation_cache_unavailable");
      for (const row of cached.data) {
        if (!row || typeof row.ticker !== "string" || !tickers.has(row.ticker) || rows.has(row.ticker))
          return result("history_preparation_cache_unavailable");
        rows.set(row.ticker, row);
      }
      if (rows.size === expectedCount) break;
      cursor = cached.data.at(-1)?.ticker ?? null;
      if (cursor === null) return result("history_preparation_cache_unavailable");
    }
    if (expectedCount === null || rows.size !== expectedCount) return result("history_preparation_cache_unavailable");
    const finalCount = await client.from("scanner_cache").select("ticker", { count: "exact", head: true })
      .in("ticker", [...tickers]).abortSignal(readSignal);
    throwIfAborted(readSignal);
    if (finalCount.error || finalCount.count !== expectedCount) return result("history_preparation_cache_unavailable");
    for (const member of members) {
      throwIfAborted(signal);
      const raw = record(rows.get(member.ticker)?.raw);
      const context = await readCompletedDailyContext(raw.completed_daily_context,
        member.ticker, new Date());
      if (context) {
        const preparation = record(raw.completed_history_preparation);
        if (preparation.policy_version === COMPLETED_SESSION_HISTORY_PREPARATION_VERSION && preparation.owner_user_id === owner) {
          const execution = `${COMPLETED_SESSION_HISTORY_PREPARATION_VERSION}|${owner}|${session.market_date}|${member.ticker}`;
          const claimId = buildBasicFreeDiscoveryCreditReservationClaimId({ trading_date: session.market_date,
            execution_fingerprint: execution });
          if (preparation.content_sha256 !== context.content_sha256 || preparation.execution_fingerprint !== execution ||
            preparation.claim_id !== claimId) return result("history_preparation_cached_claim_binding_unavailable");
          // Repair only finalization of the already persisted, validated source.
          // The provider is never retried to repair a missing terminal receipt.
          const finish = await finalizeBasicFreeDiscoveryCreditReservation({ claim_id: claimId,
            execution_fingerprint: execution, status: "completed", finalized_at: new Date().toISOString() },
          { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) });
          if (!finish.finalization_proven) {
            accountingComplete = false;
            return result("history_preparation_finalization_unproven");
          }
          member.claim_id = claimId;
        }
        Object.assign(member, { status: "available", captured_at: context.captured_at,
          content_sha256: context.content_sha256 });
      }
    }
    for (const member of members.filter(row => row.status === "pending")) {
      // A retained failure consumes no new invocation credit, but never refunds
      // its original claim. Limit NEW reservations rather than visited members.
      if (reserved >= minuteBudget) break;
      throwIfAborted(signal);
      const now = new Date();
      if (getUsEquityMarketSession(now).market_date !== session.market_date ||
        now.getTime() >= Date.parse(session.session_open)) return result("history_preparation_session_expired");
      const bucket = minute(now);
      // Identity deliberately excludes invocation time and universe membership:
      // changing either cannot buy this same owner's history again today.
      const execution = `${COMPLETED_SESSION_HISTORY_PREPARATION_VERSION}|${owner}|${session.market_date}|${member.ticker}`;
      const claimId = buildBasicFreeDiscoveryCreditReservationClaimId({ trading_date: session.market_date,
        execution_fingerprint: execution });
      const claimInput = { claim_id: claimId,
        execution_fingerprint: execution, owner_user_id: owner, trading_date: session.market_date,
        minute_bucket: bucket, catalog_observation: false, requested_credits: 1,
        declared_daily_credit_budget: dailyBudget, declared_per_minute_credit_budget: minuteBudget };
      let claim = await prepareBasicFreeDiscoveryCreditReservation(claimInput, { signal });
      if (claim.status === "reservation_unavailable" || claim.status === "already_failed") {
        // The immutable claim includes its ORIGINAL minute. A later invocation
        // may only recover that exact identity from the owner-bound ledger,
        // never relax the RPC's immutable-minute/conflict checks.
        const prior = await client.from("basic_free_discovery_credit_reservations")
          .select("claim_id,status,minute_bucket,finalized_at")
          .eq("owner_user_id", owner).eq("trading_date", session.market_date)
          .eq("execution_fingerprint", execution).abortSignal(signal).maybeSingle();
        throwIfAborted(signal);
        const saved = prior.data;
        if (!prior.error && saved?.claim_id === claimId && saved.status === "failed" &&
          typeof saved.minute_bucket === "string" &&
          Number.isFinite(Date.parse(saved.minute_bucket)) && Date.parse(saved.minute_bucket) <= now.getTime() &&
          typeof saved.finalized_at === "string" && Number.isFinite(Date.parse(saved.finalized_at)) &&
          Date.parse(saved.finalized_at) >= Date.parse(saved.minute_bucket) &&
          Date.parse(saved.finalized_at) <= now.getTime()) {
          claim = await prepareBasicFreeDiscoveryCreditReservation({ ...claimInput,
            minute_bucket: new Date(saved.minute_bucket).toISOString() }, { signal });
          if (claim.provider_execution_allowed || claim.status !== "already_failed" ||
            claim.claim_id !== claimId || claim.idempotent !== true) {
            accountingComplete = false;
            member.status = "blocked";
            member.claim_id = claimId;
            member.blocker = "history_preparation_prior_failure_unproven";
            return result(member.blocker);
          }
        } else if (claim.status === "already_failed") {
          accountingComplete = false;
          member.status = "blocked";
          member.claim_id = claimId;
          member.blocker = "history_preparation_prior_failure_unproven";
          return result(member.blocker);
        }
      }
      if (!claim.provider_execution_allowed || claim.claim_id !== claimId) {
        if (claim.status === "reservation_unavailable") accountingComplete = false;
        member.status = "blocked";
        member.claim_id = claim.claim_id;
        member.blocker = claim.safe_blocker ?? "history_preparation_reservation_unavailable";
        // Only the exact owner's already-finalized failed claim may yield to
        // another original member. Preserve the claim namespace: a new resume
        // policy must not mint another paid identity for this failed source.
        // In-progress, ambiguous or completed-but-missing sources still stop.
        if (!claim.provider_execution_allowed && claim.claim_id === claimId &&
          claim.status === "already_failed" && claim.idempotent === true) {
          const terminal = await finalizeBasicFreeDiscoveryCreditReservation({ claim_id: claimId,
            execution_fingerprint: execution, status: "failed", finalized_at: new Date().toISOString() },
          { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) });
          throwIfAborted(signal);
          if (!terminal.finalization_proven || terminal.status !== "already_failed") {
            accountingComplete = false;
            member.blocker = "history_preparation_prior_failure_unproven";
            return result(member.blocker);
          }
          continue;
        }
        return result(member.blocker);
      }
      reserved += 1;
      member.claim_id = claimId;
      let failure: string | null = null;
      try {
        throwIfAborted(signal);
        if (minute(new Date()) !== bucket || Date.now() >= Date.parse(session.session_open))
          throw new Error("history_preparation_reservation_window_expired");
        requested += 1;
        const response = await getDailyCandlesWithRetainedHistory(member.ticker, 60, { signal });
        throwIfAborted(signal);
        const context = await captureCompletedDailyContext(response.completed_response, member.ticker, new Date());
        if (!context || getUsEquityMarketSession(new Date()).market_date !== session.market_date)
          throw new Error("history_preparation_attributable_context_unavailable");
        const old = rows.get(member.ticker);
        const raw = { ...record(old?.raw), completed_daily_context: context,
          completed_history_preparation: { policy_version: COMPLETED_SESSION_HISTORY_PREPARATION_VERSION,
            owner_user_id: owner, universe_fingerprint: fingerprint, claim_id: claimId,
            execution_fingerprint: execution, minute_bucket: bucket, content_sha256: context.content_sha256 } };
        // Never freshen the legacy derived-price clock or replace its fields.
        // A concurrent scanner update must not be overwritten after acquisition.
        const write = old
          ? client.from("scanner_cache").update({ raw }).eq("ticker", member.ticker).eq("updated_at", old.updated_at).select("ticker")
          : client.from("scanner_cache").insert({ ticker: member.ticker, raw, updated_at: context.latest_completed_at }).select("ticker");
        const saved = await write.abortSignal(signal);
        throwIfAborted(signal);
        if (saved.error || saved.data?.length !== 1) throw new Error("history_preparation_cache_write_unavailable");
        Object.assign(member, { status: "acquired", captured_at: context.captured_at, content_sha256: context.content_sha256 });
      } catch (error) {
        member.status = "blocked";
        const safeInternalReasons = ["history_preparation_reservation_window_expired",
          "history_preparation_attributable_context_unavailable", "history_preparation_cache_write_unavailable"];
        failure = signal.aborted ? abortedReason()
          : error instanceof Error && safeInternalReasons.includes(error.message) ? error.message
          : isProviderRateLimitLikeError(error) ? "history_preparation_provider_rate_limited" : "history_preparation_acquisition_failed";
        member.blocker = failure;
      }
      // Even an abort finalizes outside its cancelled transport. Failed and
      // uncertain reservations remain charged; never repair them by re-fetching.
      const finish = await finalizeBasicFreeDiscoveryCreditReservation({ claim_id: claimId,
        execution_fingerprint: execution, status: failure ? "failed" : "completed", finalized_at: new Date().toISOString() },
      { signal: AbortSignal.timeout(5000) });
      if (!finish.finalization_proven) {
        accountingComplete = false;
        return result("history_preparation_finalization_unproven");
      }
      finalized += 1;
      if (failure) return result(failure);
    }
    return result(null);
  } catch {
    return result(signal.aborted ? abortedReason() : "history_preparation_cache_unavailable");
  }
}
