import "server-only";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import { calculateScannerValues, calculateCompletedCurrentInputFeatures } from "@/lib/scanner";
import { readCompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import { readCurrentSessionContext } from "@/lib/scanner-current-session-context";
import { calculateIntradayIndicators, withAdmissibleRecentIntradayVolume,
  PROVIDER_CLOSED_BAR_PRICE_BASIS } from "@/lib/intraday-indicators";
import { readOwnedOriginalInputScanRun, replayScannerHistoricalInputs } from "@/lib/server/scanner-historical-input-replay";
import { SCANNER_CURRENT_INPUT_ARCHIVE_VERSION, SCANNER_CURRENT_INPUT_CALCULATOR_VERSION,
  currentInputArchiveIsBounded } from "@/lib/server/scanner-current-input-archive";

export const SCANNER_ORIGINAL_INPUT_REPLAY_VERSION = "scanner_original_input_replay_v1" as const;
export const SCANNER_CURRENT_INPUT_FEATURES = ["latest_close", "distance_to_20d_high", "session_open", "session_high", "session_low",
  "recent_change_percent", "recent_range_position", "recent_higher_highs_count", "recent_higher_lows_count",
  "recent_bullish_candles", "recent_volume_ratio", "latest_range_percent", "range_expansion_ratio",
  "proposed_entry_low", "proposed_entry_high", "proposed_stop_loss", "proposed_target_1", "proposed_target_2", "proposed_risk_reward"] as const;
type Status = "matched" | "mismatch" | "unavailable" | "invalid_source";
type Member = { candidate_id: string; ticker: string; status: Status; reason: string | null;
  historical_status: Status; current_status: Status; mismatched_features: string[]; mismatched_indicators: string[] };
export type ScannerOriginalInputReplay = {
  replay_version: typeof SCANNER_ORIGINAL_INPUT_REPLAY_VERSION;
  scope: "25_original_scanner_features_and_indicators_from_validated_parsed_bars";
  status: "available" | "unavailable"; reason: string | null; scan_run_id: string | null;
  original_candidate_count: number; matched_count: number; historical_matched_count: number; current_matched_count: number;
  current_session_features_checked: boolean; members: Member[];
  original_null_features_preserved: true; original_provider_json_reproduced: false;
  input_fitness_proven: false; recommendation_quality_proven: false;
};
function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const row = object(value);
  return row ? `{${Object.keys(row).sort().map(key => `${JSON.stringify(key)}:${stableJson(row[key])}`).join(",")}}`
    : JSON.stringify(value) ?? "null";
}
function instant(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return NaN;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value ? time : NaN;
}
function result(id: string | null, reason: string | null, members: Member[] = [], checked = false): ScannerOriginalInputReplay {
  return { replay_version: SCANNER_ORIGINAL_INPUT_REPLAY_VERSION,
    scope: "25_original_scanner_features_and_indicators_from_validated_parsed_bars",
    status: reason ? "unavailable" : "available", reason, scan_run_id: id, original_candidate_count: members.length,
    matched_count: members.filter(member => member.status === "matched").length,
    historical_matched_count: members.filter(member => member.historical_status === "matched").length,
    current_matched_count: members.filter(member => member.current_status === "matched").length,
    current_session_features_checked: checked, members, original_null_features_preserved: true,
    original_provider_json_reproduced: false, input_fitness_proven: false, recommendation_quality_proven: false };
}

/** Original closed bars and the ORIGINAL two arithmetic clocks. A match means
 * reproducible arithmetic, including nulls; not fully observed inputs or alpha. */
export async function replayScannerOriginalInputs(run: RecommendationScanRun): Promise<ScannerOriginalInputReplay> {
  const record = candidateDecisionRecordFromScanRun(run);
  if (!record || record.record_version !== "candidate_decision_record_v4" || !decisionLineageReceiptFromScanRun(run, record)) {
    return result(run.id, "original_input_decision_or_lineage_unavailable");
  }
  const historical = await replayScannerHistoricalInputs(run);
  const members: Member[] = historical.members.map(member => ({ ...member, historical_status: member.status,
    mismatched_features: [...member.mismatched_features],
    current_status: "unavailable", status: member.status === "mismatch" || member.status === "invalid_source" ? member.status : "unavailable",
    reason: member.reason ?? "original_current_bars_or_clocks_not_retained", mismatched_indicators: [] }));
  const raw = run.payload_json.scanner_current_input_archive, archive = object(raw);
  if (raw == null) return result(run.id, "original_current_bars_or_clocks_not_retained", members);
  if (!currentInputArchiveIsBounded(raw) || !archive || Object.keys(archive).length !== 6 ||
    archive.archive_version !== SCANNER_CURRENT_INPUT_ARCHIVE_VERSION ||
    archive.calculator_version !== SCANNER_CURRENT_INPUT_CALCULATOR_VERSION || archive.scan_run_id !== record.scan_run_id ||
    archive.scan_run_fingerprint !== record.scan_run_fingerprint || archive.decision_timestamp !== record.decision_timestamp ||
    !Array.isArray(archive.entries) || archive.entries.length > record.candidates.length) {
    return result(run.id, "current_archive_invalid", members);
  }
  const entries = new Map<string, Record<string, unknown>>();
  for (const rawEntry of archive.entries) {
    const entry = object(rawEntry), candidate = record.candidates.find(row => row.candidate_id === entry?.candidate_id);
    if (!entry || Object.keys(entry).length !== 4 || !candidate || candidate.ticker !== entry.ticker ||
      entries.has(candidate.candidate_id) || !object(entry.current_context) || !object(entry.calculation_clock)) {
      return result(run.id, "current_archive_invalid", members);
    }
    entries.set(candidate.candidate_id, entry);
  }
  const historyEntries = object(run.payload_json.scanner_historical_input_archive)?.entries;
  let checked = false;
  for (const member of members) {
    const candidate = record.candidates.find(row => row.candidate_id === member.candidate_id)!;
    const snapshot = candidate.data.input_snapshot, entry = entries.get(member.candidate_id);
    if (!snapshot?.current_session || !entry) continue;
    const historicalMember = historical.members.find(row => row.candidate_id === member.candidate_id)!;
    if (historicalMember.status === "unavailable" || historicalMember.status === "invalid_source") continue;
    const clock = object(entry.calculation_clock)!;
    const indicatorAt = instant(clock.indicator_observed_at), volumeAt = instant(clock.volume_observed_at);
    const fail = (reason: string) => { member.current_status = "invalid_source";
      member.status = "invalid_source"; member.reason = reason; };
    if (Object.keys(clock).length !== 2 || !Number.isFinite(indicatorAt) || !Number.isFinite(volumeAt) ||
      indicatorAt < instant(snapshot.current_session.captured_at) || volumeAt < indicatorAt || volumeAt > instant(snapshot.captured_at)) {
      fail("original_current_calculation_clock_invalid"); continue;
    }
    const context = await readCurrentSessionContext(entry.current_context, member.ticker, new Date(snapshot.captured_at));
    if (!context) { fail("original_current_context_invalid"); continue; }
    const { candles, ...evidence } = context;
    if (stableJson(evidence) !== stableJson(snapshot.current_session)) {
      fail("current_context_not_bound_to_original_input"); continue;
    }
    const historyEntry = Array.isArray(historyEntries) ? historyEntries.find(value => object(value)?.candidate_id === member.candidate_id) : null;
    const history = await readCompletedDailyContext(object(historyEntry)?.historical_context, member.ticker, new Date(snapshot.captured_at));
    if (!history) { fail("original_historical_context_unavailable_for_current_arithmetic"); continue; }
    const indicators = withAdmissibleRecentIntradayVolume(calculateIntradayIndicators(candles, {
      interval: context.interval, observedAtSeconds: indicatorAt / 1000, priceBasis: PROVIDER_CLOSED_BAR_PRICE_BASIS,
    }), false, volumeAt / 1000);
    const values = calculateCompletedCurrentInputFeatures(calculateScannerValues(history.candles), indicators,
      indicators.latestPrice ?? undefined, context, false);
    const differences = SCANNER_CURRENT_INPUT_FEATURES.filter(key => (values[key] ?? null) !== snapshot.features[key]);
    const retainedIndicators = object(snapshot.intraday_indicators);
    const expectedIndicators = indicators as unknown as Record<string, unknown>;
    const indicatorDifferences = [...new Set([...Object.keys(expectedIndicators), ...Object.keys(retainedIndicators ?? {})])]
      .filter(key => stableJson(expectedIndicators[key]) !== stableJson(retainedIndicators?.[key]));
    member.mismatched_features.push(...differences); member.mismatched_indicators = indicatorDifferences;
    member.current_status = differences.length || indicatorDifferences.length ? "mismatch" : "matched";
    member.status = member.historical_status === "mismatch" || member.current_status === "mismatch" ? "mismatch" : "matched";
    member.reason = member.status === "mismatch" ? "original_scanner_arithmetic_mismatch" : null;
    checked = true;
  }
  return result(run.id, null, members, checked);
}

export async function readOwnedScannerOriginalInputReplay(ownerUserId: string, scanRunId: string) {
  const run = await readOwnedOriginalInputScanRun(ownerUserId, scanRunId);
  return run ? replayScannerOriginalInputs(run) : result(null, "owned_original_run_unavailable");
}
