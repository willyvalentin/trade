import "server-only";
import { createHash } from "node:crypto";
import { relativePlanContextPolicy, RELATIVE_PLAN_CONTEXT_SHADOW_VERSION } from "@/lib/scanner-relative-plan-context-shadow";
import { parseRecommendationEvaluationCharterDefinition, type RecommendationEvaluationCharterDefinition } from "@/lib/recommendation-evaluation-charter";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";
import { SCANNER_SCORE_PROBABILITY_CALIBRATION_POLICY_VERSION, SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_SAMPLE,
  SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_BUCKET_SAMPLE } from "@/lib/scanner-score-probability-calibration";
import { AUTOMATION_ROUTE_VERSION, RECOMMENDATION_PUBLISH_POLICY_VERSION, BUILD_MARKER } from "@/lib/publish-path-versions";

// Canonical decision build identity is the route/policy/marker tuple, NOT a
// Netlify deploy ID. The latter identifies the freeze runtime separately and
// must never be silently substituted for the original decision attribution.
export const relativePlanCanonicalBuildIdentity = `${AUTOMATION_ROUTE_VERSION}:${RECOMMENDATION_PUBLISH_POLICY_VERSION}:${BUILD_MARKER}`;
const retainedV3BuildIdentity = "action_148_publish_path_v1:selective_top_3_strong_valid_v3_preserve_explicit_no_trade:selective_top_3_v3_2026_09_17";

export const RELATIVE_PLAN_PROSPECTIVE_COMPARISON_VERSION = "relative_plan_prospective_comparison_v1" as const;
export const RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION = "relative_plan_prospective_freeze_receipt_v1" as const;
type Window = { start_at: string; end_at: string };
type Partition = "training" | "held_out" | "walk_forward";
export type RelativePlanProspectivePlanInput = {
  owner_user_id: string;
  source_revision: { commit_ref: string; build_identity: string; deploy_id: string };
  windows: Record<Partition, Window>;
};
export type RelativePlanProspectivePlan = RelativePlanProspectivePlanInput & {
  contract_version: typeof RELATIVE_PLAN_PROSPECTIVE_COMPARISON_VERSION;
  plan_fingerprint: string;
  model_version: typeof RELATIVE_PLAN_CONTEXT_SHADOW_VERSION;
  model_fingerprint: string;
  charter: RecommendationEvaluationCharterDefinition;
  charter_fingerprint: string;
  reproduction_basis: "retained_normalized_inputs_and_original_geometry_only";
  upstream_provider_version: "unavailable_disclosed";
  enrollment: {
    contract_version: "relative_plan_decision_time_enrollment_v1";
    primary_k: 3;
    held_out_decisions: 30;
    walk_forward_decisions: 30;
    ordering: "decision_timestamp_then_run_fingerprint";
    eligibility_basis: "original_complete_assessed_point_in_time_population_before_outcomes";
    missing_outcomes: "retained_in_enrolled_denominator";
    historical_decisions: "excluded_not_retroactively_admitted";
    overflow: "retained_diagnostic_not_reselected_after_outcomes";
  };
  calibration: {
    policy_version: typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_POLICY_VERSION;
    minimum_sample: typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_SAMPLE;
    minimum_bucket_sample: typeof SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_BUCKET_SAMPLE;
    fitting_basis: "training_decisions_and_mature_outcomes_before_held_out_start";
    ordinal_scores_are_probabilities: false;
  };
  comparison: { minimum_precision_lift: 0.03; reject_maximum_precision_lift: 0 };
  authority: { collection: false; provider: false; ranking: false; publication: false; promotion: false; broker: false };
};
export type RelativePlanProspectiveFreeze = {
  contract_version: typeof RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION;
  freeze_id: string;
  owner_user_id: string;
  frozen_at: string;
  plan: RelativePlanProspectivePlan;
};

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value));
}
function keys(value: unknown, expected: string[]): value is Record<string, unknown> {
  return record(value) && Object.keys(value).length === expected.length && expected.every(key => Object.hasOwn(value, key));
}
export function relativePlanSemanticJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(relativePlanSemanticJson).join(",")}]`;
  if (record(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${relativePlanSemanticJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
export function relativePlanSemanticFingerprint(value: unknown): string {
  return createHash("sha256").update(relativePlanSemanticJson(value)).digest("hex");
}
export function relativePlanProspectiveCharter(): RecommendationEvaluationCharterDefinition {
  // Reuse every existing full-charter threshold, concentration limit and
  // disclosed feasibility requirement. Only the declared hypothesis/basis differs.
  const charter = parseRecommendationEvaluationCharterDefinition({
    ...scannerClockPriorShadowEvaluationCharterDefinition,
    hypothesis: "Assessing an unchanged original first-target distance against the preceding twelve closed five-minute bars improves same-population K=3 precision by at least 0.03, with the frozen full recommendation-quality charter unchanged.",
    eligible_universe: "Every original member of each prospective complete, assessed v4 US-equity opportunity set under scanner_candidate_ranking_v1.2. Eligibility is fixed from original point-in-time inputs before outcomes; rejected, partial, unassessed and historical decisions remain explicitly excluded diagnostics, never a post-outcome shortlist.",
    outcome_rules: {
      ...scannerClockPriorShadowEvaluationCharterDefinition.outcome_rules,
      semantics: "One unchanged-plan canonical mature 60m outcome per original identity. Target-first pays original first-target R, stop-first -1R, no entry zero exposure; ambiguous or unmeasured outcomes stay missing. No shorter-horizon substitution, raw-provider replay claim or post-outcome population reduction.",
    },
  });
  if (!charter) throw new Error("relative_plan_charter_definition_invalid");
  return charter;
}

function utcInstant(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
function buildPlanForExactIdentity(value: unknown, frozenAt: string, buildIdentity: string): RelativePlanProspectivePlan | null {
  if (!utcInstant(frozenAt) || !keys(value, ["owner_user_id", "source_revision", "windows"]) ||
    typeof value.owner_user_id !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value.owner_user_id) ||
    !keys(value.source_revision, ["commit_ref", "build_identity", "deploy_id"]) ||
    typeof value.source_revision.commit_ref !== "string" || !/^[a-f0-9]{40}$/.test(value.source_revision.commit_ref) ||
    value.source_revision.build_identity !== buildIdentity ||
    typeof value.source_revision.deploy_id !== "string" || !/^[a-f0-9]{24}$/.test(value.source_revision.deploy_id) ||
    !keys(value.windows, ["training", "held_out", "walk_forward"])) return null;
  const windows = {} as Record<Partition, Window>;
  for (const name of ["training", "held_out", "walk_forward"] as const) {
    const window = value.windows[name];
    if (!keys(window, ["start_at", "end_at"]) || !utcInstant(window.start_at) || !utcInstant(window.end_at) ||
      Date.parse(window.start_at) >= Date.parse(window.end_at)) return null;
    windows[name] = { start_at: window.start_at, end_at: window.end_at };
  }
  // The authoritative database freeze precedes every source decision. Preserve
  // a full primary-horizon embargo between fitting/evaluation partitions.
  if (Date.parse(frozenAt) >= Date.parse(windows.training.start_at) ||
    Date.parse(windows.training.end_at) + 3600000 > Date.parse(windows.held_out.start_at) ||
    Date.parse(windows.held_out.end_at) + 3600000 > Date.parse(windows.walk_forward.start_at) ||
    Date.parse(windows.walk_forward.end_at) - Date.parse(frozenAt) > 180 * 86400000) return null;
  const charter = relativePlanProspectiveCharter();
  const body: Omit<RelativePlanProspectivePlan, "plan_fingerprint"> = {
    contract_version: RELATIVE_PLAN_PROSPECTIVE_COMPARISON_VERSION,
    owner_user_id: value.owner_user_id,
    source_revision: { commit_ref: value.source_revision.commit_ref, build_identity: value.source_revision.build_identity,
      deploy_id: value.source_revision.deploy_id },
    windows, model_version: RELATIVE_PLAN_CONTEXT_SHADOW_VERSION,
    model_fingerprint: relativePlanSemanticFingerprint(relativePlanContextPolicy),
    charter, charter_fingerprint: relativePlanSemanticFingerprint(charter),
    reproduction_basis: "retained_normalized_inputs_and_original_geometry_only" as const,
    upstream_provider_version: "unavailable_disclosed" as const,
    enrollment: { contract_version: "relative_plan_decision_time_enrollment_v1" as const, primary_k: 3 as const,
      held_out_decisions: 30 as const, walk_forward_decisions: 30 as const,
      ordering: "decision_timestamp_then_run_fingerprint" as const,
      eligibility_basis: "original_complete_assessed_point_in_time_population_before_outcomes" as const,
      missing_outcomes: "retained_in_enrolled_denominator" as const,
      historical_decisions: "excluded_not_retroactively_admitted" as const,
      overflow: "retained_diagnostic_not_reselected_after_outcomes" as const },
    calibration: { policy_version: SCANNER_SCORE_PROBABILITY_CALIBRATION_POLICY_VERSION,
      minimum_sample: SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_SAMPLE,
      minimum_bucket_sample: SCANNER_SCORE_PROBABILITY_CALIBRATION_MINIMUM_BUCKET_SAMPLE,
      fitting_basis: "training_decisions_and_mature_outcomes_before_held_out_start" as const,
      ordinal_scores_are_probabilities: false as const },
    comparison: { minimum_precision_lift: 0.03 as const, reject_maximum_precision_lift: 0 as const },
    authority: { collection: false as const, provider: false as const, ranking: false as const,
      publication: false as const, promotion: false as const, broker: false as const },
  };
  return { ...body, plan_fingerprint: relativePlanSemanticFingerprint(body) };
}

/** NEW plans use only the current producer. Historical receipt validation
 * below must not confer authority to create a new old-policy comparison. */
export function buildRelativePlanProspectivePlan(value: unknown, frozenAt: string): RelativePlanProspectivePlan | null {
  return buildPlanForExactIdentity(value, frozenAt, relativePlanCanonicalBuildIdentity);
}

/** A receipt is necessary, not sufficient, for any quality decision. The
 * caller must supply the trusted owner, never an owner copied from request data. */
export function verifiedRelativePlanProspectiveFreeze(value: unknown, expectedOwner: string): RelativePlanProspectiveFreeze | null {
  if (!keys(value, ["contract_version", "freeze_id", "owner_user_id", "frozen_at", "plan"]) ||
    value.contract_version !== RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION || value.owner_user_id !== expectedOwner ||
    typeof value.freeze_id !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value.freeze_id) ||
    !utcInstant(value.frozen_at) || !record(value.plan)) return null;
  const revision = value.plan.source_revision;
  if (!record(revision) || (revision.build_identity !== relativePlanCanonicalBuildIdentity &&
    revision.build_identity !== retainedV3BuildIdentity)) return null;
  // Reproduce the retained tuple verbatim; never substitute today's identity
  // into an immutable plan or accept an unknown/self-rehashed policy alias.
  const plan = buildPlanForExactIdentity({ owner_user_id: value.plan.owner_user_id,
    source_revision: revision, windows: value.plan.windows }, value.frozen_at, revision.build_identity);
  if (!plan || plan.owner_user_id !== expectedOwner || relativePlanSemanticJson(plan) !== relativePlanSemanticJson(value.plan)) return null;
  return { contract_version: RELATIVE_PLAN_PROSPECTIVE_RECEIPT_VERSION, freeze_id: value.freeze_id,
    owner_user_id: expectedOwner, frozen_at: value.frozen_at, plan };
}
