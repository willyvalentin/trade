import "server-only";

import {
  consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization,
  type FixedReadOnlyDirectSpawnResult,
} from "@/lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter";
import {
  neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion,
  type SpawnToRawCompletionNeutralizationResult,
} from "@/lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core";

export * from "@/lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core";

export type DormantServerOnlySpawnToRawCompletionNeutralizationInput = Readonly<{
  directSpawnResult: FixedReadOnlyDirectSpawnResult;
}>;

export function neutralizeOriginalFixedReadOnlyDirectSpawnToRawCompletion(input: DormantServerOnlySpawnToRawCompletionNeutralizationInput): SpawnToRawCompletionNeutralizationResult {
  const consumedSource = consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization(input);
  return neutralizeFixedReadOnlyDirectSpawnSourceToRawCompletion(consumedSource);
}
