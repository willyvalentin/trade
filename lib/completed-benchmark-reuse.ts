import "server-only";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import { readCompletedMarketRegime, marketRegimeFromCompletedHistories, type MarketRegime } from "@/lib/market-regime";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import { throwIfAborted } from "@/lib/operation-abort";
import { COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION } from "@/lib/scanner-decision-input-snapshot";
import { getConfiguredApplicationOwnerUserId } from "@/lib/application-session-core";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { readCompletedDailyContext, type CompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import { PREPARED_BENCHMARK_CONTEXT_POLICY_VERSION, preparedBenchmarkTickers, preparedBenchmarkClaim,
  readPreparedBenchmarkSourceReceipt, type PreparedBenchmarkSourceReceipt } from "@/lib/server/prepared-benchmark-source";

export const COMPLETED_BENCHMARK_REUSE_ALLOCATION_VERSION = "completed_benchmark_regular_session_reuse_v2" as const;
export type CompletedBenchmarkReuse = Readonly<{ market_regime: MarketRegime }>;
// Only a server-side validated owner/source read can free benchmark credits.
// Caller-supplied JSON, serialized objects and old process cache do not qualify.
const validated = new WeakSet<CompletedBenchmarkReuse>();
const preparedSources = new WeakMap<CompletedBenchmarkReuse, {
  owner: string; tradingDate: string; sources: readonly PreparedBenchmarkSourceReceipt[];
}>();
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function instant(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? Date.parse(value) : NaN;
}
// Only detached, reconstructed JSON capsules reach this helper. A shallow
// outer freeze cannot protect a WeakSet-branded handle's budget authority.
function freezeOwnedInput<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) freezeOwnedInput(child);
    Object.freeze(value);
  }
  return value;
}

export async function readOwnedCompletedBenchmarkReuse(input: {
  row: unknown; owner: string; now: Date; signal?: AbortSignal;
}): Promise<CompletedBenchmarkReuse | null> {
  throwIfAborted(input.signal);
  const row = input.row;
  if (!record(row) || row.owner_user_id !== input.owner || !input.owner ||
    row.data_mode !== "supabase_record" || !["completed", "empty", "partial", "degraded"].includes(String(row.status)) ||
    typeof row.id !== "string" || !row.id || typeof row.run_fingerprint !== "string" || !row.run_fingerprint ||
    !record(row.payload_json) || !Number.isFinite(input.now.getTime())) return null;
  const observed = instant(row.observed_at), completed = instant(row.completed_at);
  if (!Number.isFinite(observed) || !Number.isFinite(completed)) return null;
  const session = getUsEquityMarketSession(input.now);
  const originalSession = getUsEquityMarketSession(new Date(observed));
  // Serving-window labels describe an old publication cadence, not whether
  // completed historical inputs remain valid. Require actual regular-session
  // clocks before accepting its known between-window label; never unknown/closed.
  if (!Number.isFinite(observed) || !Number.isFinite(completed) || completed < observed || completed > input.now.getTime() ||
    session.verification_status !== "verified" || session.freshness_status !== "current" ||
    !session.session_open || !session.session_close ||
    input.now.getTime() < Date.parse(session.session_open) || input.now.getTime() >= Date.parse(session.session_close) ||
    originalSession.verification_status !== "verified" || originalSession.freshness_status !== "current" ||
    !originalSession.session_open || !originalSession.session_close ||
    observed < Date.parse(originalSession.session_open) || completed >= Date.parse(originalSession.session_close) ||
    row.trading_date !== session.market_date || originalSession.market_date !== session.market_date ||
    !["morning", "midday", "power_hour", "outside_window"].includes(String(row.window))) return null;
  const source = { id: row.id, run_fingerprint: row.run_fingerprint,
    trading_date: row.trading_date as string,
    window: row.window as "morning" | "midday" | "power_hour" | "outside_window",
    observed_at: row.observed_at as string, payload_json: row.payload_json };
  const decision = candidateDecisionRecordFromScanRun(source);
  if (!decision || decision.record_version !== "candidate_decision_record_v4" ||
    decision.versions.input_policy_version !== COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION ||
    !decisionLineageReceiptFromScanRun(source, decision) ||
    instant(decision.decision_timestamp) < observed || instant(decision.decision_timestamp) > completed) return null;
  const regime = await readCompletedMarketRegime(row.payload_json.market_regime, input.now);
  throwIfAborted(input.signal);
  if (!regime?.input_evidence || instant(regime.input_evidence.evaluated_at) > instant(decision.decision_timestamp)) return null;
  regime.input_evidence.reuse = {
    policy_version: COMPLETED_BENCHMARK_REUSE_ALLOCATION_VERSION,
    source_window: source.window, source_regular_session_verified: true,
    source_scan_run_id: row.id, source_scan_run_fingerprint: row.run_fingerprint,
    source_decision_timestamp: decision.decision_timestamp,
    original_classified_at: regime.input_evidence.evaluated_at,
    revalidated_at: input.now.toISOString(), benchmark_provider_calls: 0,
    scanner_provider_call_cap: 8, whole_scan_provider_call_cap: 8,
  };
  const result = Object.freeze({ market_regime: freezeOwnedInput(structuredClone(regime)) });
  validated.add(result);
  return result;
}

export async function isValidCompletedBenchmarkReuse(value: CompletedBenchmarkReuse, now: Date) {
  if (!validated.has(value) || !Number.isFinite(now.getTime())) return false;
  const session = getUsEquityMarketSession(now);
  const prepared = preparedSources.get(value);
  if (prepared && (prepared.owner !== getConfiguredApplicationOwnerUserId() || prepared.tradingDate !== session.market_date ||
    !value.market_regime.input_evidence || !prepared.sources.every(source => {
      const context = source.ticker === "SPY" ? value.market_regime.input_evidence!.spy : value.market_regime.input_evidence!.qqq;
      return readPreparedBenchmarkSourceReceipt(source, { owner: prepared.owner, tradingDate: prepared.tradingDate, context }) !== null;
    }))) return false;
  return session.verification_status === "verified" && session.freshness_status === "current" &&
    !!session.session_open && !!session.session_close && now.getTime() >= Date.parse(session.session_open) &&
    now.getTime() < Date.parse(session.session_close) &&
    (await readCompletedMarketRegime(value.market_regime, now)) !== null;
}

// PostgREST serializes SQL instants with UTC offsets and up to six fractional
// digits. Compare all microseconds; Date.parse alone truncates hostile futures.
function sqlInstantMicros(value: unknown): bigint | null {
  if (typeof value !== "string") return null;
  const parsed = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?(?:Z|\+00:00)$/.exec(value);
  if (!parsed) return null;
  const second = Date.parse(`${parsed[1]}.000Z`);
  if (!Number.isFinite(second) || new Date(second).toISOString().slice(0, 19) !== parsed[1]) return null;
  return BigInt(second) * BigInt(1000) + BigInt((parsed[2] ?? "").padEnd(6, "0"));
}

/** Fixed-purpose actual database read, not a caller-row or serialized-handle
 * admission. Both signed originals and their owner's finalized paid claims
 * must exist before the first regular scan can reuse benchmark credits. */
export async function readPreparedCompletedBenchmarkReuse(options: { ownerUserId: string; signal?: AbortSignal }): Promise<CompletedBenchmarkReuse | null> {
  if (!options || Object.keys(options).some(key => !["ownerUserId", "signal"].includes(key))) return null;
  throwIfAborted(options.signal);
  const owner = getConfiguredApplicationOwnerUserId(), now = new Date();
  const session = getUsEquityMarketSession(now);
  // The configured operator's paid source cannot free another generator
  // owner's credits, even when both operations are internal server calls.
  if (!owner || options.ownerUserId !== owner || process.env.TWELVE_DATA_PLAN_MODE !== "free" || session.verification_status !== "verified" ||
    session.freshness_status !== "current" || !session.market_date || !session.session_open || !session.session_close ||
    now.getTime() < Date.parse(session.session_open) || now.getTime() >= Date.parse(session.session_close)) return null;
  const { client } = getServerSupabaseClient();
  if (!client) return null;
  const signal = AbortSignal.any([AbortSignal.timeout(5000), ...(options.signal ? [options.signal] : [])]);
  try {
    const cached = await client.from("scanner_cache").select("ticker,raw", { count: "exact" })
      .in("ticker", [...preparedBenchmarkTickers]).limit(2).abortSignal(signal);
    throwIfAborted(options.signal);
    if (cached.error || cached.count !== 2 || cached.data?.length !== 2) return null;
    const contexts = new Map<string, CompletedDailyContext>();
    const sources: PreparedBenchmarkSourceReceipt[] = [];
    for (const ticker of preparedBenchmarkTickers) {
      const rows = cached.data.filter(row => row.ticker === ticker);
      if (rows.length !== 1 || !record(rows[0].raw)) return null;
      const raw = rows[0].raw;
      const context = await readCompletedDailyContext(raw.completed_daily_context, ticker, now);
      const metadata = raw.completed_history_preparation;
      if (!context || !record(metadata) || metadata.policy_version !== "completed_session_history_preparation_v1" ||
        metadata.owner_user_id !== owner || Date.parse(context.captured_at) >= Date.parse(session.session_open)) return null;
      const source = readPreparedBenchmarkSourceReceipt(metadata.benchmark_source_receipt,
        { owner, tradingDate: session.market_date, context });
      if (!source || metadata.claim_id !== source.claim_id || metadata.execution_fingerprint !== source.execution_fingerprint ||
        metadata.minute_bucket !== source.minute_bucket || metadata.content_sha256 !== source.content_sha256) return null;
      contexts.set(ticker, context);
      sources.push(source);
    }
    const identities = preparedBenchmarkTickers.map(ticker => preparedBenchmarkClaim(owner, session.market_date!, ticker));
    const paid = await client.from("basic_free_discovery_credit_reservations")
      .select("contract_version,claim_id,execution_fingerprint,owner_user_id,trading_date,minute_bucket,requested_credits,status,provider_attempted,finalized_at", { count: "exact" })
      .eq("owner_user_id", owner).eq("trading_date", session.market_date)
      .in("claim_id", identities.map(identity => identity.claim_id)).limit(2).abortSignal(signal);
    throwIfAborted(options.signal);
    if (paid.error || paid.count !== 2 || paid.data?.length !== 2) return null;
    for (const source of sources) {
      const rows = paid.data.filter(row => row.claim_id === source.claim_id);
      if (rows.length !== 1) return null;
      const row = rows[0], finished = sqlInstantMicros(row.finalized_at), minute = sqlInstantMicros(row.minute_bucket);
      if (row.contract_version !== "basic_free_discovery_credit_reservation_v1" || row.provider_attempted !== true ||
        row.owner_user_id !== owner || row.trading_date !== session.market_date || row.status !== "completed" ||
        row.requested_credits !== 1 || row.execution_fingerprint !== source.execution_fingerprint || finished === null ||
        minute !== sqlInstantMicros(source.minute_bucket) || finished < BigInt(Date.parse(source.captured_at)) * BigInt(1000) ||
        finished > BigInt(now.getTime()) * BigInt(1000)) return null;
    }
    const regime = await marketRegimeFromCompletedHistories({ spy: contexts.get("SPY"), qqq: contexts.get("QQQ"), now });
    throwIfAborted(options.signal);
    if (!regime?.input_evidence || signal.aborted) return null;
    regime.input_evidence.reuse = { policy_version: PREPARED_BENCHMARK_CONTEXT_POLICY_VERSION,
      source_kind: "owner_prepared_history_claims", owner_user_id: owner, trading_date: session.market_date,
      source_claim_ids: [sources[0].claim_id, sources[1].claim_id],
      original_captured_at: { spy: contexts.get("SPY")!.captured_at, qqq: contexts.get("QQQ")!.captured_at },
      original_classified_at: now.toISOString(), revalidated_at: now.toISOString(),
      source_signatures_verified: true, benchmark_provider_calls: 0,
      scanner_provider_call_cap: 8, whole_scan_provider_call_cap: 8 };
    const result = Object.freeze({ market_regime: freezeOwnedInput(structuredClone(regime)) });
    preparedSources.set(result, { owner, tradingDate: session.market_date, sources });
    validated.add(result);
    return result;
  } catch {
    throwIfAborted(options.signal);
    return null;
  }
}
