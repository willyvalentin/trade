import "server-only";

import type { FixedReadOnlyDirectSpawnResult } from "@/lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter";
import {
  neutralizeOriginalFixedReadOnlyDirectSpawnToRawCompletion,
} from "@/lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter";
import {
  buildDormantNeutralizationToGitInterpretationOrchestrationResult,
  type DormantNeutralizationToGitInterpretationResult,
} from "@/lib/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator-core";

export function orchestrateOriginalFixedReadOnlyDirectSpawnGitVersionInterpretation(
  directSpawnResult: FixedReadOnlyDirectSpawnResult,
): DormantNeutralizationToGitInterpretationResult {
  const neutralizationResult = neutralizeOriginalFixedReadOnlyDirectSpawnToRawCompletion({ directSpawnResult });
  return buildDormantNeutralizationToGitInterpretationOrchestrationResult({
    neutralizationResult,
    orchestrationTimestamp: new Date().toISOString(),
  });
}
