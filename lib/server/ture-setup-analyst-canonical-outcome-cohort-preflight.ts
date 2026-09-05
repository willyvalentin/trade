import "server-only";

import {
  isTureSetupAnalystIssuedCanonicalOutcomeProjection,
  type TureSetupAnalystCanonicalOutcomeProjection,
} from "./ture-setup-analyst-canonical-outcome-projection";

export const TURE_SETUP_ANALYST_CANONICAL_OUTCOME_COHORT_PREFLIGHT_VERSION =
  "ture_setup_analyst_canonical_outcome_cohort_preflight_v1" as const;

export type TureSetupAnalystCanonicalOutcomeCohortPreflightAuthority = Readonly<{
  mode: "server_only_canonical_outcome_cohort_preflight";
  may_read_repository: false;
  may_invoke_model: false;
  may_invoke_context_tools: false;
  may_perform_io: false;
  may_persist_cohort: false;
  may_form_offline_dataset: false;
  may_run_offline_evaluation: false;
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

export const TURE_SETUP_ANALYST_CANONICAL_OUTCOME_COHORT_PREFLIGHT_AUTHORITY: TureSetupAnalystCanonicalOutcomeCohortPreflightAuthority =
  Object.freeze({
    mode: "server_only_canonical_outcome_cohort_preflight",
    may_read_repository: false,
    may_invoke_model: false,
    may_invoke_context_tools: false,
    may_perform_io: false,
    may_persist_cohort: false,
    may_form_offline_dataset: false,
    may_run_offline_evaluation: false,
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

export type PreflightTureSetupAnalystCanonicalOutcomeCohortInput = Readonly<{
  projections: readonly unknown[];
}>;

export type TureSetupAnalystCanonicalOutcomeCohortPreflight = Readonly<{
  preflight_version: typeof TURE_SETUP_ANALYST_CANONICAL_OUTCOME_COHORT_PREFLIGHT_VERSION;
  mode: "server_only_canonical_outcome_cohort_preflight";
  preflight_status: "source_only_preflighted";
  evidence: Readonly<{
    cohort:
      | "visible_recommendation_quality"
      | "research_only_recommendation_quality"
      | "shadow_recommendation_quality"
      | "historical_synthetic_recommendation_quality"
      | "rejected_candidate_counterfactual"
      | "no_trade_counterfactual";
    primary_horizon: "60m";
    projection_count: number;
    decision_day_range: Readonly<{
      first: string;
      last: string;
    }>;
  }>;
  offline_evaluation_disposition: "not_admitted";
  authority: TureSetupAnalystCanonicalOutcomeCohortPreflightAuthority;
}>;

type PlainRecord = Record<string, unknown>;

const inputKeys = ["projections"] as const;
const maximumProjectionCount = 256;

function hasExactOwnDataKeys(
  value: unknown,
  keys: readonly string[],
): value is PlainRecord {
  if (!value || typeof value !== "object" || !Object.isFrozen(value)) {
    return false;
  }

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

function isFrozenDenseDataArray(value: unknown): value is readonly unknown[] {
  if (!Array.isArray(value) || !Object.isFrozen(value)) return false;

  try {
    if (Object.getPrototypeOf(value) !== Array.prototype) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (
      ownKeys.some(
        (key) =>
          typeof key !== "string" ||
          (key !== "length" && !/^(?:0|[1-9]\d*)$/.test(key)),
      )
    ) {
      return false;
    }
    if (value.length < 1 || value.length > maximumProjectionCount) return false;

    const elementKeys = ownKeys.filter((key) => key !== "length");
    if (elementKeys.length !== value.length) return false;

    return Array.from({ length: value.length }, (_, index) => index).every((index) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
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

function issuedProjection(value: unknown): TureSetupAnalystCanonicalOutcomeProjection | null {
  if (!isTureSetupAnalystIssuedCanonicalOutcomeProjection(value)) return null;
  if (
    !Object.isFrozen(value) ||
    value.offline_evaluation_disposition !== "not_admitted" ||
    value.mode !== "server_only_canonical_outcome_projection" ||
    value.projection_status !== "source_only_projected"
  ) {
    return null;
  }
  return value;
}

export function preflightTureSetupAnalystCanonicalOutcomeCohort(
  input: PreflightTureSetupAnalystCanonicalOutcomeCohortInput,
): TureSetupAnalystCanonicalOutcomeCohortPreflight {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst canonical outcome cohort preflight input.");
  }

  const candidates = ownData(input, "projections");
  if (!isFrozenDenseDataArray(candidates)) {
    throw new TypeError("Invalid Ture Setup Analyst canonical outcome cohort preflight input.");
  }

  const projections = candidates.map(issuedProjection);
  if (projections.some((projection) => projection === null)) {
    throw new TypeError("Invalid Ture Setup Analyst canonical outcome cohort preflight input.");
  }

  const admitted = projections as TureSetupAnalystCanonicalOutcomeProjection[];
  const first = admitted[0];
  const identities = new Set<string>();
  const decisionDays: string[] = [];
  for (const projection of admitted) {
    if (
      projection.evidence.cohort !== first.evidence.cohort ||
      projection.evidence.primary_horizon !== first.evidence.primary_horizon ||
      identities.has(projection.evidence.canonical_identity)
    ) {
      throw new TypeError("Invalid Ture Setup Analyst canonical outcome cohort preflight input.");
    }
    identities.add(projection.evidence.canonical_identity);
    decisionDays.push(projection.evidence.decision_day);
  }

  decisionDays.sort();
  const preflight = Object.freeze({
    preflight_version: TURE_SETUP_ANALYST_CANONICAL_OUTCOME_COHORT_PREFLIGHT_VERSION,
    mode: "server_only_canonical_outcome_cohort_preflight",
    preflight_status: "source_only_preflighted",
    evidence: Object.freeze({
      cohort: first.evidence.cohort,
      primary_horizon: first.evidence.primary_horizon,
      projection_count: admitted.length,
      decision_day_range: Object.freeze({
        first: decisionDays[0],
        last: decisionDays[decisionDays.length - 1],
      }),
    }),
    offline_evaluation_disposition: "not_admitted",
    authority: TURE_SETUP_ANALYST_CANONICAL_OUTCOME_COHORT_PREFLIGHT_AUTHORITY,
  });

  return preflight;
}
