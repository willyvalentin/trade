import "server-only";
import type { CandidateDecisionCapture, CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import type { CompletedDailyContext } from "@/lib/scanner-completed-daily-context";

export const SCANNER_HISTORICAL_INPUT_ARCHIVE_VERSION = "scanner_historical_input_archive_v1" as const;
// Bump if any of the six retained historical formulas change. An archive may
// not silently replay through a different calculator.
export const SCANNER_HISTORICAL_FEATURE_CALCULATOR_VERSION = "scanner_historical_feature_calculator_v1" as const;
export const SCANNER_HISTORICAL_INPUT_MAX_BYTES = 2 * 1048576;
type Archive = {
  archive_version: typeof SCANNER_HISTORICAL_INPUT_ARCHIVE_VERSION;
  calculator_version: typeof SCANNER_HISTORICAL_FEATURE_CALCULATOR_VERSION;
  scan_run_id: string;
  scan_run_fingerprint: string;
  decision_timestamp: string;
  entries: Array<{ candidate_id: string; ticker: string; historical_context: CompletedDailyContext }>;
};
export function historicalInputArchiveIsBounded(value: unknown) {
  try { return Buffer.byteLength(JSON.stringify(value) ?? "", "utf8") <= SCANNER_HISTORICAL_INPUT_MAX_BYTES; }
  catch { return false; }
}
/** Capture is independent of the calculator: retained historical baselines
 * need no newer scanner export. The new reader alone imports the calculator.
 * Never synthesize bars or alter normalized input/decision/lineage identity. */
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
  // Keep the full original population when the optional diagnostic is too big;
  // archive absence is an explicit reproduction gap, never a scan failure.
  return historicalInputArchiveIsBounded(archive) ? archive : null;
}
