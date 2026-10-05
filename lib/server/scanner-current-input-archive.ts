import "server-only";
import type { CandidateDecisionCapture, CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import type { CurrentSessionContext } from "@/lib/scanner-current-session-context";

export const SCANNER_CURRENT_INPUT_ARCHIVE_VERSION = "scanner_current_input_archive_v1" as const;
// Bump for any change to the nineteen producer formulas OR their indicators.
export const SCANNER_CURRENT_INPUT_CALCULATOR_VERSION = "scanner_current_input_calculator_v1" as const;
export const SCANNER_CURRENT_INPUT_MAX_BYTES = 2 * 1048576;
export type ScannerCurrentInputCalculationClock = {
  indicator_observed_at: string;
  volume_observed_at: string;
};
type Archive = {
  archive_version: typeof SCANNER_CURRENT_INPUT_ARCHIVE_VERSION;
  calculator_version: typeof SCANNER_CURRENT_INPUT_CALCULATOR_VERSION;
  scan_run_id: string;
  scan_run_fingerprint: string;
  decision_timestamp: string;
  entries: Array<{ candidate_id: string; ticker: string; current_context: CurrentSessionContext;
    calculation_clock: ScannerCurrentInputCalculationClock }>;
};
export function currentInputArchiveIsBounded(value: unknown) {
  try { return Buffer.byteLength(JSON.stringify(value) ?? "", "utf8") <= SCANNER_CURRENT_INPUT_MAX_BYTES; }
  catch { return false; }
}
// Capture imports no scanner/replayer: historical baseline bundles need no
// new calculator export. This optional archive changes no decision identity.
export function buildScannerCurrentInputArchive(capture: CandidateDecisionCapture | null | undefined,
  record: CandidateDecisionRecord | null): Archive | null {
  if (!capture || record?.record_version !== "candidate_decision_record_v4") return null;
  const observations = new Map(capture.observed_candidates.map(candidate => [candidate.ticker, candidate]));
  const archive: Archive = { archive_version: SCANNER_CURRENT_INPUT_ARCHIVE_VERSION,
    calculator_version: SCANNER_CURRENT_INPUT_CALCULATOR_VERSION, scan_run_id: record.scan_run_id,
    scan_run_fingerprint: record.scan_run_fingerprint, decision_timestamp: record.decision_timestamp,
    entries: record.candidates.flatMap(candidate => {
      const observed = observations.get(candidate.ticker);
      return observed?.current_input_context && observed.current_input_calculation_clock
        ? [{ candidate_id: candidate.candidate_id, ticker: candidate.ticker,
          current_context: observed.current_input_context, calculation_clock: observed.current_input_calculation_clock }] : [];
    }) };
  return currentInputArchiveIsBounded(archive) ? archive : null;
}
