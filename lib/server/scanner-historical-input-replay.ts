import "server-only";

import type { CandidateDecisionCapture, CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import { candidateDecisionRecordFromScanRun } from "@/lib/candidate-decision-readback";
import { decisionLineageReceiptFromScanRun } from "@/lib/decision-lineage-receipt";
import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";
import { calculateScannerValues, SCANNER_HISTORICAL_FEATURE_CALCULATOR_VERSION } from "@/lib/scanner";
import { readCompletedDailyContext, type CompletedDailyContext } from "@/lib/scanner-completed-daily-context";
import { recommendationScanRunFromPersistenceRow, type RecommendationScanRun } from "@/lib/recommendation-scan-run";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export const SCANNER_HISTORICAL_INPUT_ARCHIVE_VERSION = "scanner_historical_input_archive_v1" as const;
export const SCANNER_HISTORICAL_FEATURE_REPLAY_VERSION = "scanner_historical_feature_replay_v1" as const;
export const SCANNER_HISTORICAL_INPUT_MAX_BYTES = 2 * 1048576;
export const SCANNER_HISTORICAL_FEATURES = ["ma20", "ma50", "high_20d", "change_5d_percent",
  "average_range_percent", "previous_close"] as const;
type Feature = typeof SCANNER_HISTORICAL_FEATURES[number];
type Archive = {
  archive_version: typeof SCANNER_HISTORICAL_INPUT_ARCHIVE_VERSION;
  calculator_version: typeof SCANNER_HISTORICAL_FEATURE_CALCULATOR_VERSION;
  scan_run_id: string;
  scan_run_fingerprint: string;
  decision_timestamp: string;
  entries: Array<{ candidate_id: string; ticker: string; historical_context: CompletedDailyContext }>;
};
type Member = { candidate_id: string; ticker: string;
  status: "matched" | "mismatch" | "unavailable" | "invalid_source";
  reason: string | null; mismatched_features: Feature[] };
export type ScannerHistoricalFeatureReplay = {
  replay_version: typeof SCANNER_HISTORICAL_FEATURE_REPLAY_VERSION;
  scope: "six_historical_features_from_original_validated_parsed_bars";
  status: "available" | "unavailable";
  reason: string | null;
  scan_run_id: string | null;
  original_candidate_count: number;
  matched_count: number;
  members: Member[];
  current_session_features_checked: false;
  original_provider_json_reproduced: false;
  recommendation_quality_proven: false;
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
function bounded(value: unknown) {
  try { return Buffer.byteLength(JSON.stringify(value) ?? "", "utf8") <= SCANNER_HISTORICAL_INPUT_MAX_BYTES; }
  catch { return false; }
}
function result(scanRunId: string | null, reason: string | null, members: Member[] = []): ScannerHistoricalFeatureReplay {
  return { replay_version: SCANNER_HISTORICAL_FEATURE_REPLAY_VERSION,
    scope: "six_historical_features_from_original_validated_parsed_bars", status: reason ? "unavailable" : "available",
    reason, scan_run_id: scanRunId, original_candidate_count: members.length,
    matched_count: members.filter(member => member.status === "matched").length, members,
    current_session_features_checked: false, original_provider_json_reproduced: false, recommendation_quality_proven: false };
}

/** Additive sidecar only: the normalized input/decision/lineage contracts and
 * their fingerprints remain unchanged. Never synthesize bars from features. */
export function buildScannerHistoricalInputArchive(
  capture: CandidateDecisionCapture | null | undefined, record: CandidateDecisionRecord | null,
): Archive | null {
  if (!capture || record?.record_version !== "candidate_decision_record_v4") return null;
  const observations = new Map(capture.observed_candidates.map(candidate => [candidate.ticker, candidate]));
  const archive: Archive = { archive_version: SCANNER_HISTORICAL_INPUT_ARCHIVE_VERSION,
    calculator_version: SCANNER_HISTORICAL_FEATURE_CALCULATOR_VERSION,
    scan_run_id: record.scan_run_id, scan_run_fingerprint: record.scan_run_fingerprint,
    decision_timestamp: record.decision_timestamp, entries: record.candidates.flatMap(candidate => {
      const context = observations.get(candidate.ticker)?.historical_input_context;
      return context ? [{ candidate_id: candidate.candidate_id, ticker: candidate.ticker, historical_context: context }] : [];
    }) };
  // An oversized diagnostic cannot truncate the original population or stop
  // the normal decision. Its absence is an explicit reproduction gap.
  return bounded(archive) ? archive : null;
}

/** Recompute using the SAME historical calculator as the scanner, revalidating
 * parsed bars at the ORIGINAL capture clock. No current cache or provider path. */
export async function replayScannerHistoricalInputs(scanRun: RecommendationScanRun): Promise<ScannerHistoricalFeatureReplay> {
  const record = candidateDecisionRecordFromScanRun(scanRun);
  if (!record || record.record_version !== "candidate_decision_record_v4" || !decisionLineageReceiptFromScanRun(scanRun, record)) {
    return result(scanRun.id, "original_input_decision_or_lineage_unavailable");
  }
  const missingMembers: Member[] = record.candidates.map(candidate => ({ candidate_id: candidate.candidate_id,
    ticker: candidate.ticker, status: "unavailable", reason: "original_historical_bars_not_retained", mismatched_features: [] }));
  const raw = scanRun.payload_json.scanner_historical_input_archive;
  if (raw == null) return result(scanRun.id, "original_historical_bars_not_retained", missingMembers);
  const archive = object(raw);
  if (!bounded(raw) || !archive || Object.keys(archive).length !== 6 ||
    archive.archive_version !== SCANNER_HISTORICAL_INPUT_ARCHIVE_VERSION ||
    archive.calculator_version !== SCANNER_HISTORICAL_FEATURE_CALCULATOR_VERSION ||
    archive.scan_run_id !== record.scan_run_id || archive.scan_run_fingerprint !== record.scan_run_fingerprint ||
    archive.decision_timestamp !== record.decision_timestamp || !Array.isArray(archive.entries) ||
    archive.entries.length > record.candidates.length) return result(scanRun.id, "historical_archive_invalid", missingMembers);
  const entries = new Map<string, Record<string, unknown>>();
  for (const value of archive.entries) {
    const entry = object(value);
    const candidate = record.candidates.find(candidate => candidate.candidate_id === entry?.candidate_id);
    if (!entry || Object.keys(entry).length !== 3 || !candidate || candidate.ticker !== entry.ticker ||
      entries.has(candidate.candidate_id) || !object(entry.historical_context)) {
      return result(scanRun.id, "historical_archive_invalid", missingMembers);
    }
    entries.set(candidate.candidate_id, entry);
  }
  const members: Member[] = [];
  for (const candidate of record.candidates) {
    const entry = entries.get(candidate.candidate_id), snapshot = candidate.data.input_snapshot;
    const base = { candidate_id: candidate.candidate_id, ticker: candidate.ticker, mismatched_features: [] as Feature[] };
    if (!entry || !snapshot) {
      members.push({ ...base, status: "unavailable", reason: "original_historical_bars_not_retained" }); continue;
    }
    const context = await readCompletedDailyContext(entry.historical_context, candidate.ticker, new Date(snapshot.captured_at));
    if (!context) {
      members.push({ ...base, status: "invalid_source", reason: "original_historical_context_invalid" }); continue;
    }
    const { candles, ...evidence } = context;
    if (stableJson(evidence) !== stableJson(snapshot.historical_context)) {
      members.push({ ...base, status: "invalid_source", reason: "historical_context_not_bound_to_original_input" }); continue;
    }
    const values = { ...calculateScannerValues(candles), previous_close: candles.at(-1)!.close };
    const mismatches = SCANNER_HISTORICAL_FEATURES.filter(key => values[key] !== snapshot.features[key]);
    members.push({ ...base, status: mismatches.length ? "mismatch" : "matched",
      reason: mismatches.length ? "original_historical_feature_mismatch" : null, mismatched_features: [...mismatches] });
  }
  return result(scanRun.id, null, members);
}

/** Fixed-purpose owner read: one durable run, no caller inputs/clock or writes.
 * Database failures remain unavailable, never an empty successful replay. */
export async function readOwnedScannerHistoricalInputReplay(ownerUserId: string, scanRunId: string) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  if (!owner || typeof scanRunId !== "string" || !/^rec_scan_run_[a-z0-9]{1,16}$/.test(scanRunId)) {
    return result(null, "owned_original_run_unavailable");
  }
  const { client } = getServerSupabaseClient();
  if (!client) return result(null, "owned_original_run_unavailable");
  try {
    const { data, error } = await client.from("recommendation_scan_runs").select("*")
      .eq("owner_user_id", owner).eq("id", scanRunId).limit(1).maybeSingle();
    if (error || !data || data.owner_user_id !== owner || data.id !== scanRunId) return result(null, "owned_original_run_unavailable");
    const run = recommendationScanRunFromPersistenceRow(data);
    return run ? await replayScannerHistoricalInputs(run) : result(null, "owned_original_run_unavailable");
  } catch { return result(null, "owned_original_run_unavailable"); }
}
