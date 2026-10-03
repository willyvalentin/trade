import "server-only";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import { readCompletedMarketRegime, type MarketRegime } from "@/lib/market-regime";
import { getUsEquityMarketSession } from "@/lib/us-equity-market-calendar";
import { throwIfAborted } from "@/lib/operation-abort";
import { COMPLETED_DAILY_INTRADAY_INPUT_POLICY_VERSION } from "@/lib/scanner-decision-input-snapshot";

export const COMPLETED_BENCHMARK_REUSE_ALLOCATION_VERSION = "completed_benchmark_regular_session_reuse_v2" as const;
export type CompletedBenchmarkReuse = Readonly<{ market_regime: MarketRegime }>;
// Only a server-side validated owner/source read can free benchmark credits.
// Caller-supplied JSON, serialized objects and old process cache do not qualify.
const validated = new WeakSet<CompletedBenchmarkReuse>();
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function instant(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? Date.parse(value) : NaN;
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
  const result = Object.freeze({ market_regime: regime });
  validated.add(result);
  return result;
}

export async function isValidCompletedBenchmarkReuse(value: CompletedBenchmarkReuse, now: Date) {
  if (!validated.has(value) || !Number.isFinite(now.getTime())) return false;
  const session = getUsEquityMarketSession(now);
  return session.verification_status === "verified" && session.freshness_status === "current" &&
    !!session.session_open && !!session.session_close && now.getTime() >= Date.parse(session.session_open) &&
    now.getTime() < Date.parse(session.session_close) &&
    (await readCompletedMarketRegime(value.market_regime, now)) !== null;
}
