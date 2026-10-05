import "server-only";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import { replayScannerHistoricalInputs } from "@/lib/server/scanner-historical-input-replay";
import { replayScannerOriginalInputs } from "@/lib/server/scanner-original-input-replay";

/** New learning jobs only. Available original evidence cannot contradict used
 * inputs. Absence/partial retention remains a disclosed reproduction gap, not
 * a new input-fitness claim. Never filter/relabel members or reinterpret v1
 * sealed capsules. The caller supplies the complete already-owned population;
 * no source acquisition, current cache, clock override or database write. */
export async function relativePlanOriginalInputConflict(runs: RecommendationScanRun[]): Promise<
  "original_input_evidence_invalid" | "original_input_arithmetic_conflicting" | "original_input_reproduction_unavailable" | null
> {
  for (const run of runs) {
    const historical = run.payload_json.scanner_historical_input_archive != null;
    const current = run.payload_json.scanner_current_input_archive != null;
    if (!historical && !current) continue;
    try {
      // Complete replay intentionally preserves unavailable historical members.
      // Check the historical envelope separately: an invalid present envelope
      // must not disappear behind a valid current archive or missing member.
      if (historical) {
        const replay = await replayScannerHistoricalInputs(run);
        if (replay.status !== "available" || replay.members.some(member => member.status === "invalid_source"))
          return "original_input_evidence_invalid";
        if (replay.members.some(member => member.status === "mismatch"))
          return "original_input_arithmetic_conflicting";
      }
      if (current) {
        const replay = await replayScannerOriginalInputs(run);
        if (replay.status !== "available" || replay.members.some(member => member.status === "invalid_source"))
          return "original_input_evidence_invalid";
        if (replay.members.some(member => member.status === "mismatch"))
          return "original_input_arithmetic_conflicting";
        // If a current source IS retained but its arithmetic cannot be
        // checked (e.g. its historical dependency is missing), keep that gap
        // explicit rather than treating the unexamined source as consistent.
        const entries = (run.payload_json.scanner_current_input_archive as { entries: Array<{ candidate_id: string }> }).entries;
        if (replay.members.some(member => member.current_status === "unavailable" &&
          entries.some(entry => entry.candidate_id === member.candidate_id)))
          return "original_input_reproduction_unavailable";
      }
    } catch { return "original_input_evidence_invalid"; }
  }
  return null;
}
