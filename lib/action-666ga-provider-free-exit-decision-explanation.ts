const contractVersion =
  "action_666ga_provider_free_exit_decision_explanation_v1" as const;
const noExecutionAuthority = "advisory_projection_no_execution_authority" as const;

type DecisionClassification = Readonly<{
  decision_status: string;
  decision_reason: string;
  decision_priority: number;
}>;

type ClassifiedExplanation = Readonly<
  DecisionClassification & {
    advisory_copy: string;
  }
>;

export type Action666gaExitDecisionExplanationResult = Readonly<{
  contract_version: typeof contractVersion;
  projection_state: "projected" | "rejected";
  authority: typeof noExecutionAuthority;
  classification: DecisionClassification | null;
  advisory_copy: string | null;
  rejection_code:
    | "invalid_input_shape"
    | "unsupported_decision_classification"
    | null;
  runtime_wired: false;
  side_effects_performed: false;
}>;

const explanations: readonly ClassifiedExplanation[] = Object.freeze([
  Object.freeze({
    decision_status: "exit_full",
    decision_reason: "hard_stop",
    decision_priority: 1,
    advisory_copy:
      "Beslutet är klassificerat som hård stop. Texten återger endast en redan deklarerad klassificering.",
  }),
  Object.freeze({
    decision_status: "exit_full",
    decision_reason: "invalidation",
    decision_priority: 2,
    advisory_copy:
      "Beslutet är klassificerat som invalidation. Texten återger endast en redan deklarerad klassificering.",
  }),
  Object.freeze({
    decision_status: "exit_full",
    decision_reason: "session_close",
    decision_priority: 3,
    advisory_copy:
      "Beslutet är klassificerat som sessionsstängning. Texten återger endast en redan deklarerad klassificering.",
  }),
  Object.freeze({
    decision_status: "exit_full",
    decision_reason: "final_target",
    decision_priority: 4,
    advisory_copy:
      "Beslutet är klassificerat som slutmål. Texten återger endast en redan deklarerad klassificering.",
  }),
  Object.freeze({
    decision_status: "exit_partial",
    decision_reason: "first_target_partial",
    decision_priority: 5,
    advisory_copy:
      "Beslutet är klassificerat som första delmål. Texten återger endast en redan deklarerad klassificering.",
  }),
  Object.freeze({
    decision_status: "move_stop",
    decision_reason: "profit_protection_stop_move",
    decision_priority: 6,
    advisory_copy:
      "Beslutet är klassificerat som vinstskydd. Texten återger endast en redan deklarerad klassificering.",
  }),
  Object.freeze({
    decision_status: "hold",
    decision_reason: "hold",
    decision_priority: 7,
    advisory_copy:
      "Beslutet är klassificerat som avvakta. Texten återger endast en redan deklarerad klassificering.",
  }),
]);

function invalidResult(
  rejectionCode: Exclude<
    Action666gaExitDecisionExplanationResult["rejection_code"],
    null
  >,
): Action666gaExitDecisionExplanationResult {
  return Object.freeze({
    contract_version: contractVersion,
    projection_state: "rejected",
    authority: noExecutionAuthority,
    classification: null,
    advisory_copy: null,
    rejection_code: rejectionCode,
    runtime_wired: false,
    side_effects_performed: false,
  });
}

function closedClassification(value: unknown): DecisionClassification | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const names = Object.getOwnPropertyNames(candidate);
  const expected = [
    "decision_priority",
    "decision_reason",
    "decision_status",
  ];
  if (
    names.length !== expected.length ||
    Object.getOwnPropertySymbols(candidate).length !== 0 ||
    !expected.every((field) => names.includes(field))
  ) {
    return null;
  }

  const descriptors = Object.getOwnPropertyDescriptors(candidate);
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
 * Projects an already-declared exit-decision classification into fixed Swedish
 * advisory copy. It performs no evaluation, I/O, persistence or runtime wiring.
 */
export function projectAction666gaExitDecisionExplanation(
  input: unknown,
): Action666gaExitDecisionExplanationResult {
  const classification = closedClassification(input);
  if (!classification) return invalidResult("invalid_input_shape");

  const explanation = explanations.find(
    (candidate) =>
      candidate.decision_status === classification.decision_status &&
      candidate.decision_reason === classification.decision_reason &&
      candidate.decision_priority === classification.decision_priority,
  );
  if (!explanation) return invalidResult("unsupported_decision_classification");

  return Object.freeze({
    contract_version: contractVersion,
    projection_state: "projected",
    authority: noExecutionAuthority,
    classification,
    advisory_copy: explanation.advisory_copy,
    rejection_code: null,
    runtime_wired: false,
    side_effects_performed: false,
  });
}
