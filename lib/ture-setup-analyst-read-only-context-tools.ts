import {
  TURE_SETUP_ANALYST_AUTHORITY,
  TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
  tureSetupAnalystReadOnlyToolIds,
  type TureSetupAnalystReadOnlyToolId,
  type TureSetupAnalystShadowRequest,
} from "./ture-setup-analyst-shadow-contract";

export const TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION =
  "ture_setup_analyst_read_only_context_boundary_v1" as const;

export type TureSetupAnalystReadOnlyContextToolPolicy = Readonly<{
  tool_id: TureSetupAnalystReadOnlyToolId;
  context_scope:
    | "candidate"
    | "intraday_indicators"
    | "market_regime"
    | "ranking"
    | "recommendation_plan"
    | "portfolio_risk";
  includes_candidate_id: boolean;
  includes_recommendation_id: boolean;
}>;

const readOnlyToolPolicies = [
  {
    tool_id: "getCandidateContext",
    context_scope: "candidate",
    includes_candidate_id: true,
    includes_recommendation_id: false,
  },
  {
    tool_id: "getIntradayIndicators",
    context_scope: "intraday_indicators",
    includes_candidate_id: true,
    includes_recommendation_id: false,
  },
  {
    tool_id: "getMarketRegime",
    context_scope: "market_regime",
    includes_candidate_id: false,
    includes_recommendation_id: false,
  },
  {
    tool_id: "getRankingContext",
    context_scope: "ranking",
    includes_candidate_id: true,
    includes_recommendation_id: true,
  },
  {
    tool_id: "getRecommendationPlanContext",
    context_scope: "recommendation_plan",
    includes_candidate_id: false,
    includes_recommendation_id: true,
  },
  {
    tool_id: "getPortfolioRiskContext",
    context_scope: "portfolio_risk",
    includes_candidate_id: false,
    includes_recommendation_id: true,
  },
] as const satisfies readonly TureSetupAnalystReadOnlyContextToolPolicy[];

export const tureSetupAnalystReadOnlyContextToolPolicies: readonly TureSetupAnalystReadOnlyContextToolPolicy[] =
  Object.freeze(readOnlyToolPolicies.map((policy) => Object.freeze({ ...policy })));

export type TureSetupAnalystReadOnlyContextToolAuthority = Readonly<{
  mode: "read_only";
  adapter_status: "unbound";
  may_perform_io: false;
  may_write_context: false;
  may_change_canonical_recommendation: false;
  may_change_ranking: false;
  may_change_execution_eligibility: false;
  may_change_position_state: false;
  may_change_risk_settings: false;
  may_place_or_cancel_orders: false;
  may_submit_broker_instructions: false;
}>;

export const TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_TOOL_AUTHORITY: TureSetupAnalystReadOnlyContextToolAuthority =
  Object.freeze({
    mode: "read_only",
    adapter_status: "unbound",
    may_perform_io: false,
    may_write_context: false,
    may_change_canonical_recommendation: false,
    may_change_ranking: false,
    may_change_execution_eligibility: false,
    may_change_position_state: false,
    may_change_risk_settings: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type TureSetupAnalystReadOnlyContextToolRequest = Readonly<{
  boundary_version: typeof TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION;
  contract_version: typeof TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION;
  mode: "unbound_read_only";
  tool_id: TureSetupAnalystReadOnlyToolId;
  context_scope: TureSetupAnalystReadOnlyContextToolPolicy["context_scope"];
  input_fields: readonly ("canonical_snapshot_id" | "as_of" | "candidate_id" | "recommendation_id")[];
  source: Readonly<{
    canonical_snapshot_id: string;
    as_of: string;
  }>;
  subject: Readonly<{
    candidate_id: string | null;
    recommendation_id: string | null;
  }>;
  response_requirements: Readonly<{
    source_provenance_required: true;
    source_timestamp_must_not_exceed_as_of: true;
    freshness_must_be_explicit: true;
    unavailable_must_be_explicit: true;
    data_minimization_mode: "policy_bound";
  }>;
  authority: TureSetupAnalystReadOnlyContextToolAuthority;
}>;

export type CreateTureSetupAnalystReadOnlyContextToolRequestInput = Readonly<{
  shadow_request: TureSetupAnalystShadowRequest;
  tool_id: TureSetupAnalystReadOnlyToolId;
}>;

const shadowRequestKeys = [
  "allowed_tools",
  "authority",
  "candidate_id",
  "canonical_snapshot_id",
  "captured_at",
  "contract_version",
  "mode",
  "plan_snapshot",
  "recommendation_id",
] as const;

const shadowAuthorityKeys = [
  "may_change_canonical_recommendation",
  "may_change_execution_eligibility",
  "may_change_position_state",
  "may_change_ranking",
  "may_change_risk_settings",
  "may_place_or_cancel_orders",
  "may_submit_broker_instructions",
  "shadow_only",
] as const;

const planSnapshotKeys = ["entry_price", "stop_price", "target_price"] as const;

const inputKeys = ["shadow_request", "tool_id"] as const;

function hasExactOwnDataKeys(
  value: unknown,
  keys: readonly string[],
): value is Record<string, unknown> {
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

function ownData(value: Record<string, unknown>, key: string): unknown {
  return Object.getOwnPropertyDescriptor(value, key)?.value;
}

function hasText(value: unknown, maximumLength = 200): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maximumLength
  );
}

function isTimestamp(value: unknown): value is string {
  return hasText(value, 100) && Number.isFinite(Date.parse(value));
}

function hasCanonicalAllowedTools(value: unknown): boolean {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    return false;
  }

  try {
    if (!Object.isFrozen(value)) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key === "symbol")) return false;
    if (
      ownKeys.length !== tureSetupAnalystReadOnlyToolIds.length + 1 ||
      !ownKeys.includes("length") ||
      Object.getOwnPropertyDescriptor(value, "length")?.value !==
        tureSetupAnalystReadOnlyToolIds.length
    ) {
      return false;
    }

    return tureSetupAnalystReadOnlyToolIds.every((toolId, index) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      return (
        Boolean(descriptor?.enumerable) &&
        Object.prototype.hasOwnProperty.call(descriptor, "value") &&
        descriptor?.value === toolId
      );
    });
  } catch {
    return false;
  }
}

function hasShadowOnlyAuthority(value: unknown): boolean {
  if (!Object.isFrozen(value) || !hasExactOwnDataKeys(value, shadowAuthorityKeys)) {
    return false;
  }

  return (
    ownData(value, "shadow_only") === true &&
    ownData(value, "may_change_canonical_recommendation") === false &&
    ownData(value, "may_change_ranking") === false &&
    ownData(value, "may_change_execution_eligibility") === false &&
    ownData(value, "may_change_position_state") === false &&
    ownData(value, "may_change_risk_settings") === false &&
    ownData(value, "may_place_or_cancel_orders") === false &&
    ownData(value, "may_submit_broker_instructions") === false
  );
}

function hasCanonicalPlanSnapshot(value: unknown): boolean {
  if (!Object.isFrozen(value) || !hasExactOwnDataKeys(value, planSnapshotKeys)) {
    return false;
  }

  return planSnapshotKeys.every((key) => {
    const price = ownData(value, key);
    return typeof price === "number" && Number.isFinite(price) && price > 0;
  });
}

function readCanonicalShadowRequest(value: unknown): Readonly<{
  candidate_id: string;
  recommendation_id: string;
  canonical_snapshot_id: string;
  captured_at: string;
}> | null {
  if (!Object.isFrozen(value) || !hasExactOwnDataKeys(value, shadowRequestKeys)) {
    return null;
  }

  const contractVersion = ownData(value, "contract_version");
  const mode = ownData(value, "mode");
  const candidateId = ownData(value, "candidate_id");
  const recommendationId = ownData(value, "recommendation_id");
  const canonicalSnapshotId = ownData(value, "canonical_snapshot_id");
  const capturedAt = ownData(value, "captured_at");

  if (
    contractVersion !== TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION ||
    mode !== "shadow_only" ||
    !hasText(candidateId) ||
    !hasText(recommendationId) ||
    !hasText(canonicalSnapshotId) ||
    !isTimestamp(capturedAt) ||
    !hasCanonicalPlanSnapshot(ownData(value, "plan_snapshot")) ||
    !hasCanonicalAllowedTools(ownData(value, "allowed_tools")) ||
    !hasShadowOnlyAuthority(ownData(value, "authority"))
  ) {
    return null;
  }

  return Object.freeze({
    candidate_id: candidateId,
    recommendation_id: recommendationId,
    canonical_snapshot_id: canonicalSnapshotId,
    captured_at: capturedAt,
  });
}

function policyFor(
  toolId: TureSetupAnalystReadOnlyToolId,
): TureSetupAnalystReadOnlyContextToolPolicy | null {
  return (
    tureSetupAnalystReadOnlyContextToolPolicies.find(
      (policy) => policy.tool_id === toolId,
    ) ?? null
  );
}

export function createTureSetupAnalystReadOnlyContextToolRequest(
  input: CreateTureSetupAnalystReadOnlyContextToolRequestInput,
): TureSetupAnalystReadOnlyContextToolRequest {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst read-only context tool input.");
  }

  const shadowRequest = readCanonicalShadowRequest(ownData(input, "shadow_request"));
  const toolId = ownData(input, "tool_id");
  if (
    !shadowRequest ||
    !tureSetupAnalystReadOnlyToolIds.includes(toolId as TureSetupAnalystReadOnlyToolId)
  ) {
    throw new TypeError("Invalid Ture Setup Analyst read-only context tool input.");
  }

  const policy = policyFor(toolId as TureSetupAnalystReadOnlyToolId);
  if (!policy) {
    throw new TypeError("Unsupported Ture Setup Analyst read-only context tool.");
  }

  const inputFields: Array<
    "canonical_snapshot_id" | "as_of" | "candidate_id" | "recommendation_id"
  > = [
    "canonical_snapshot_id",
    "as_of",
  ];
  if (policy.includes_candidate_id) inputFields.push("candidate_id");
  if (policy.includes_recommendation_id) inputFields.push("recommendation_id");

  return Object.freeze({
    boundary_version: TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION,
    contract_version: TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
    mode: "unbound_read_only",
    tool_id: policy.tool_id,
    context_scope: policy.context_scope,
    input_fields: Object.freeze(inputFields),
    source: Object.freeze({
      canonical_snapshot_id: shadowRequest.canonical_snapshot_id,
      as_of: shadowRequest.captured_at,
    }),
    subject: Object.freeze({
      candidate_id: policy.includes_candidate_id ? shadowRequest.candidate_id : null,
      recommendation_id: policy.includes_recommendation_id
        ? shadowRequest.recommendation_id
        : null,
    }),
    response_requirements: Object.freeze({
      source_provenance_required: true,
      source_timestamp_must_not_exceed_as_of: true,
      freshness_must_be_explicit: true,
      unavailable_must_be_explicit: true,
      data_minimization_mode: "policy_bound",
    }),
    authority: TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_TOOL_AUTHORITY,
  });
}

export const tureSetupAnalystReadOnlyContextToolBoundaryReferences = Object.freeze({
  source_contract: "docs/action-336-intelligence-context-schema-draft.md",
  fixture_contract: "docs/action-342-intelligence-context-static-fixture-spec.md",
  inherited_shadow_authority: TURE_SETUP_ANALYST_AUTHORITY.shadow_only,
});
