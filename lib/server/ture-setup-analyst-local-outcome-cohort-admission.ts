import "server-only";

import {
  isTureSetupAnalystIssuedCanonicalOutcomeProjection,
  type TureSetupAnalystCanonicalOutcomeProjection,
} from "./ture-setup-analyst-canonical-outcome-projection";

/**
 * This is a process-local intake boundary for already-issued AI-02.1/AI-02.2
 * projections. It does not load a cohort, retain its members, or authorize an
 * evaluation. A future reader must still be separately admitted.
 */
export const TURE_SETUP_ANALYST_LOCAL_OUTCOME_COHORT_ADMISSION_VERSION =
  "ture_setup_analyst_local_outcome_cohort_admission_v1" as const;

export type TureSetupAnalystLocalOutcomeCohortAdmissionAuthority = Readonly<{
  mode: "server_only_local_outcome_cohort_admission";
  may_read_repository: false;
  may_invoke_model: false;
  may_invoke_context_tools: false;
  may_perform_io: false;
  may_persist_cohort: false;
  may_create_evaluation_dataset: false;
  may_admit_offline_evaluation: false;
  may_bind_runtime: false;
  may_promote_model_or_policy: false;
  may_change_canonical_recommendation: false;
  may_change_ranking: false;
  may_change_execution_eligibility: false;
  may_change_position_state: false;
  may_change_risk_settings: false;
  may_place_or_cancel_orders: false;
  may_submit_broker_instructions: false;
}>;

export const TURE_SETUP_ANALYST_LOCAL_OUTCOME_COHORT_ADMISSION_AUTHORITY: TureSetupAnalystLocalOutcomeCohortAdmissionAuthority =
  Object.freeze({
    mode: "server_only_local_outcome_cohort_admission",
    may_read_repository: false,
    may_invoke_model: false,
    may_invoke_context_tools: false,
    may_perform_io: false,
    may_persist_cohort: false,
    may_create_evaluation_dataset: false,
    may_admit_offline_evaluation: false,
    may_bind_runtime: false,
    may_promote_model_or_policy: false,
    may_change_canonical_recommendation: false,
    may_change_ranking: false,
    may_change_execution_eligibility: false,
    may_change_position_state: false,
    may_change_risk_settings: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type AdmitTureSetupAnalystLocalOutcomeCohortInput = Readonly<{
  projections: readonly TureSetupAnalystCanonicalOutcomeProjection[];
}>;

type TerminalOutcome =
  | "target_before_stop"
  | "stop_before_target"
  | "no_entry"
  | "neither";

export type TureSetupAnalystLocalOutcomeCohortAdmission = Readonly<{
  cohort_admission_version: typeof TURE_SETUP_ANALYST_LOCAL_OUTCOME_COHORT_ADMISSION_VERSION;
  mode: "server_only_local_outcome_cohort_admission";
  cohort_status: "source_only_admitted";
  evidence: Readonly<{
    sample_type: TureSetupAnalystCanonicalOutcomeProjection["evidence"]["sample_type"];
    cohort: TureSetupAnalystCanonicalOutcomeProjection["evidence"]["cohort"];
    member_count: number;
    decision_day_range: Readonly<{
      first: string;
      last: string;
    }>;
    terminal_outcome_counts: Readonly<Record<TerminalOutcome, number>>;
  }>;
  offline_evaluation_disposition: "not_admitted";
  authority: TureSetupAnalystLocalOutcomeCohortAdmissionAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["projections"] as const;
const terminalOutcomes = [
  "target_before_stop",
  "stop_before_target",
  "no_entry",
  "neither",
] as const;

function hasExactOwnDataKeys(
  value: unknown,
  keys: readonly string[],
): value is PlainRecord {
  if (!value || typeof value !== "object") return false;

  try {
    if (Object.getPrototypeOf(value) !== Object.prototype) return false;

    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key !== "string")) return false;
    if (ownKeys.length !== keys.length) return false;
    if (![...ownKeys].every((key) => keys.includes(key as never))) return false;

    return ownKeys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return Boolean(
        descriptor &&
          descriptor.enumerable &&
          Object.prototype.hasOwnProperty.call(descriptor, "value"),
      );
    });
  } catch {
    return false;
  }
}

function ownData(value: PlainRecord, key: string): unknown {
  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function readFrozenIssuedProjectionList(
  value: unknown,
): readonly TureSetupAnalystCanonicalOutcomeProjection[] | null {
  if (!Array.isArray(value) || !Object.isFrozen(value)) return null;

  try {
    if (Object.getPrototypeOf(value) !== Array.prototype) return null;

    const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
    const length = lengthDescriptor?.value;
    if (
      !lengthDescriptor ||
      lengthDescriptor.enumerable ||
      !Object.prototype.hasOwnProperty.call(lengthDescriptor, "value") ||
      typeof length !== "number" ||
      !Number.isSafeInteger(length) ||
      length < 1
    ) {
      return null;
    }

    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.length !== length + 1 || !ownKeys.includes("length")) return null;

    const projections: TureSetupAnalystCanonicalOutcomeProjection[] = [];
    for (let index = 0; index < length; index += 1) {
      const key = String(index);
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (
        !descriptor ||
        !descriptor.enumerable ||
        !Object.prototype.hasOwnProperty.call(descriptor, "value") ||
        !ownKeys.includes(key) ||
        !isTureSetupAnalystIssuedCanonicalOutcomeProjection(descriptor.value)
      ) {
        return null;
      }

      projections.push(descriptor.value);
    }

    return projections;
  } catch {
    return null;
  }
}

function invalidInput(): never {
  throw new TypeError("Invalid Ture Setup Analyst local outcome cohort input.");
}

export function admitTureSetupAnalystLocalOutcomeCohort(
  input: AdmitTureSetupAnalystLocalOutcomeCohortInput,
): TureSetupAnalystLocalOutcomeCohortAdmission {
  if (!Object.isFrozen(input) || !hasExactOwnDataKeys(input, inputKeys)) {
    return invalidInput();
  }

  const projections = readFrozenIssuedProjectionList(ownData(input, "projections"));
  if (!projections) return invalidInput();

  const first = projections[0]?.evidence;
  if (!first) return invalidInput();

  const canonicalIdentities = new Set<string>();
  const decisionDays: string[] = [];
  const terminalOutcomeCounts: Record<TerminalOutcome, number> = {
    target_before_stop: 0,
    stop_before_target: 0,
    no_entry: 0,
    neither: 0,
  };

  for (const projection of projections) {
    const evidence = projection.evidence;
    if (
      evidence.sample_type !== first.sample_type ||
      evidence.cohort !== first.cohort ||
      canonicalIdentities.has(evidence.canonical_identity) ||
      !terminalOutcomes.includes(evidence.terminal_outcome)
    ) {
      return invalidInput();
    }

    canonicalIdentities.add(evidence.canonical_identity);
    decisionDays.push(evidence.decision_day);
    terminalOutcomeCounts[evidence.terminal_outcome] += 1;
  }

  const sortedDecisionDays = [...decisionDays].sort();
  const firstDecisionDay = sortedDecisionDays[0];
  const lastDecisionDay = sortedDecisionDays.at(-1);
  if (!firstDecisionDay || !lastDecisionDay) return invalidInput();

  return Object.freeze({
    cohort_admission_version:
      TURE_SETUP_ANALYST_LOCAL_OUTCOME_COHORT_ADMISSION_VERSION,
    mode: "server_only_local_outcome_cohort_admission",
    cohort_status: "source_only_admitted",
    evidence: Object.freeze({
      sample_type: first.sample_type,
      cohort: first.cohort,
      member_count: projections.length,
      decision_day_range: Object.freeze({
        first: firstDecisionDay,
        last: lastDecisionDay,
      }),
      terminal_outcome_counts: Object.freeze({ ...terminalOutcomeCounts }),
    }),
    offline_evaluation_disposition: "not_admitted",
    authority: TURE_SETUP_ANALYST_LOCAL_OUTCOME_COHORT_ADMISSION_AUTHORITY,
  });
}
