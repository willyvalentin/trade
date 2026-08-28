const contractVersion =
  "action_666gj_provider_free_exit_explanation_presentation_key_v1" as const;
const noExecutionAuthority = "advisory_projection_no_execution_authority" as const;

type DecisionClassification = Readonly<{
  decision_status: string;
  decision_reason: string;
  decision_priority: number;
}>;

type ClassifiedPresentationKey = Readonly<
  DecisionClassification & {
    presentation_key: string;
  }
>;

export type Action666gjExitExplanationPresentationKeyResult = Readonly<{
  contract_version: typeof contractVersion;
  projection_state: "projected" | "rejected";
  authority: typeof noExecutionAuthority;
  classification: DecisionClassification | null;
  presentation_key: string | null;
  rejection_code:
    | "invalid_input_shape"
    | "unsupported_decision_classification"
    | null;
  runtime_wired: false;
  side_effects_performed: false;
}>;

const presentationKeys: readonly ClassifiedPresentationKey[] = Object.freeze([
  Object.freeze({
    decision_status: "exit_full",
    decision_reason: "hard_stop",
    decision_priority: 1,
    presentation_key: "exit_full_hard_stop",
  }),
  Object.freeze({
    decision_status: "exit_full",
    decision_reason: "invalidation",
    decision_priority: 2,
    presentation_key: "exit_full_invalidation",
  }),
  Object.freeze({
    decision_status: "exit_full",
    decision_reason: "session_close",
    decision_priority: 3,
    presentation_key: "exit_full_session_close",
  }),
  Object.freeze({
    decision_status: "exit_full",
    decision_reason: "final_target",
    decision_priority: 4,
    presentation_key: "exit_full_final_target",
  }),
  Object.freeze({
    decision_status: "exit_partial",
    decision_reason: "first_target_partial",
    decision_priority: 5,
    presentation_key: "exit_partial_first_target_partial",
  }),
  Object.freeze({
    decision_status: "move_stop",
    decision_reason: "profit_protection_stop_move",
    decision_priority: 6,
    presentation_key: "move_stop_profit_protection_stop_move",
  }),
  Object.freeze({
    decision_status: "hold",
    decision_reason: "hold",
    decision_priority: 7,
    presentation_key: "hold_hold",
  }),
]);

function invalidResult(
  rejectionCode: Exclude<
    Action666gjExitExplanationPresentationKeyResult["rejection_code"],
    null
  >,
): Action666gjExitExplanationPresentationKeyResult {
  return Object.freeze({
    contract_version: contractVersion,
    projection_state: "rejected",
    authority: noExecutionAuthority,
    classification: null,
    presentation_key: null,
    rejection_code: rejectionCode,
    runtime_wired: false,
    side_effects_performed: false,
  });
}

function readOwnDescriptors(candidate: object) {
  try {
    return {
      names: Object.getOwnPropertyNames(candidate),
      symbols: Object.getOwnPropertySymbols(candidate),
      descriptors: Object.getOwnPropertyDescriptors(candidate),
    };
  } catch {
    return null;
  }
}

function closedClassification(value: unknown): DecisionClassification | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const own = readOwnDescriptors(candidate);
  if (!own) return null;

  const { names, symbols, descriptors } = own;
  const expected = [
    "decision_priority",
    "decision_reason",
    "decision_status",
  ];
  if (
    names.length !== expected.length ||
    symbols.length !== 0 ||
    !expected.every((field) => names.includes(field))
  ) {
    return null;
  }

  const status = descriptors.decision_status;
  const reason = descriptors.decision_reason;
  const priority = descriptors.decision_priority;
  if (
    !status ||
    !reason ||
    !priority ||
    !("value" in status) ||
    !("value" in reason) ||
    !("value" in priority) ||
    typeof status.value !== "string" ||
    typeof reason.value !== "string" ||
    typeof priority.value !== "number" ||
    !Number.isSafeInteger(priority.value)
  ) {
    return null;
  }

  return Object.freeze({
    decision_status: status.value,
    decision_reason: reason.value,
    decision_priority: priority.value,
  });
}

/**
 * Projects an already-declared closed exit classification into one fixed,
 * provider-free presentation key. It performs no evaluation, I/O or runtime wiring.
 */
export function projectAction666gjExitExplanationPresentationKey(
  input: unknown,
): Action666gjExitExplanationPresentationKeyResult {
  const classification = closedClassification(input);
  if (!classification) return invalidResult("invalid_input_shape");

  const presentation = presentationKeys.find(
    (candidate) =>
      candidate.decision_status === classification.decision_status &&
      candidate.decision_reason === classification.decision_reason &&
      candidate.decision_priority === classification.decision_priority,
  );
  if (!presentation) return invalidResult("unsupported_decision_classification");

  return Object.freeze({
    contract_version: contractVersion,
    projection_state: "projected",
    authority: noExecutionAuthority,
    classification,
    presentation_key: presentation.presentation_key,
    rejection_code: null,
    runtime_wired: false,
    side_effects_performed: false,
  });
}
