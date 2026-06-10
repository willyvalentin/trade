import {
  compareExecutionIntentPriority,
  validateExecutionIntent,
  type ExecutionIntent,
  type ExecutionIntentValidationResult,
} from "@/lib/execution";

export type ExecutionCandidatePickReason =
  | "no_candidates"
  | "no_valid_candidates"
  | "selected_only_valid_candidate"
  | "selected_highest_priority";

export type ExecutionCandidateInput =
  | Partial<ExecutionIntent>
  | null
  | undefined;

export type InvalidExecutionCandidate = {
  intent: ExecutionCandidateInput;
  validation: ExecutionIntentValidationResult;
  errors: string[];
  warnings: string[];
};

export type ExecutionCandidatePickerResult = {
  selectedIntent: ExecutionIntent | null;
  validIntents: ExecutionIntent[];
  invalidIntents: InvalidExecutionCandidate[];
  reason: ExecutionCandidatePickReason;
};

function isValidExecutionIntent(
  intent: ExecutionCandidateInput,
): intent is ExecutionIntent {
  return validateExecutionIntent(intent).valid;
}

export function getValidExecutionIntents(
  intents: readonly ExecutionCandidateInput[],
): ExecutionIntent[] {
  return intents.filter(isValidExecutionIntent);
}

export function getInvalidExecutionIntents(
  intents: readonly ExecutionCandidateInput[],
): InvalidExecutionCandidate[] {
  return intents.flatMap((intent) => {
    const validation = validateExecutionIntent(intent);

    if (validation.valid) {
      return [];
    }

    return [
      {
        intent,
        validation,
        errors: validation.errors,
        warnings: validation.warnings,
      },
    ];
  });
}

export function sortExecutionIntentsByPriority(
  intents: readonly ExecutionIntent[],
): ExecutionIntent[] {
  return [...intents].sort(compareExecutionIntentPriority);
}

export function pickNextExecutionIntent(
  intents: readonly ExecutionCandidateInput[],
): ExecutionCandidatePickerResult {
  const validIntents = getValidExecutionIntents(intents);
  const invalidIntents = getInvalidExecutionIntents(intents);
  const sortedValidIntents = sortExecutionIntentsByPriority(validIntents);
  const selectedIntent = sortedValidIntents[0] ?? null;

  if (intents.length === 0) {
    return {
      selectedIntent: null,
      validIntents: sortedValidIntents,
      invalidIntents,
      reason: "no_candidates",
    };
  }

  if (!selectedIntent) {
    return {
      selectedIntent: null,
      validIntents: sortedValidIntents,
      invalidIntents,
      reason: "no_valid_candidates",
    };
  }

  return {
    selectedIntent,
    validIntents: sortedValidIntents,
    invalidIntents,
    reason:
      sortedValidIntents.length === 1
        ? "selected_only_valid_candidate"
        : "selected_highest_priority",
  };
}

export function pickNextExecutionIntentFromGroups(
  groups: readonly (readonly ExecutionCandidateInput[])[],
): ExecutionCandidatePickerResult {
  return pickNextExecutionIntent(groups.flat());
}
