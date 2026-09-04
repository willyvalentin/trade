import {
  TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION,
  tureSetupAnalystReadOnlyContextToolPolicies,
} from "./ture-setup-analyst-read-only-context-tools";
import {
  TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
  tureSetupAnalystReadOnlyToolIds,
  type TureSetupAnalystReadOnlyToolId,
  type TureSetupAnalystShadowAssessment,
  validateTureSetupAnalystShadowAssessment,
} from "./ture-setup-analyst-shadow-contract";

export const TURE_SETUP_ANALYST_SHADOW_TRACE_CONTRACT_VERSION =
  "ture_setup_analyst_shadow_trace_contract_v1" as const;

export type TureSetupAnalystShadowTracePrivacy = Readonly<{
  metadata_only: true;
  contains_secrets: false;
  contains_unnecessary_personal_data: false;
  raw_prompt_retained: false;
  raw_model_output_retained: false;
}>;

export const TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY: TureSetupAnalystShadowTracePrivacy =
  Object.freeze({
    metadata_only: true,
    contains_secrets: false,
    contains_unnecessary_personal_data: false,
    raw_prompt_retained: false,
    raw_model_output_retained: false,
  });

export type TureSetupAnalystShadowTraceAuthority = Readonly<{
  mode: "metadata_only_shadow";
  may_perform_io: false;
  may_persist_or_export_trace: false;
  may_change_canonical_recommendation: false;
  may_change_ranking: false;
  may_change_execution_eligibility: false;
  may_change_position_state: false;
  may_change_risk_settings: false;
  may_place_or_cancel_orders: false;
  may_submit_broker_instructions: false;
}>;

export const TURE_SETUP_ANALYST_SHADOW_TRACE_AUTHORITY: TureSetupAnalystShadowTraceAuthority =
  Object.freeze({
    mode: "metadata_only_shadow",
    may_perform_io: false,
    may_persist_or_export_trace: false,
    may_change_canonical_recommendation: false,
    may_change_ranking: false,
    may_change_execution_eligibility: false,
    may_change_position_state: false,
    may_change_risk_settings: false,
    may_place_or_cancel_orders: false,
    may_submit_broker_instructions: false,
  });

export type TureSetupAnalystShadowTrace = Readonly<{
  trace_contract_version: typeof TURE_SETUP_ANALYST_SHADOW_TRACE_CONTRACT_VERSION;
  contract_version: typeof TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION;
  mode: "metadata_only_shadow";
  trace_id: string;
  assessment_identity: Readonly<{
    candidate_id: string;
    recommendation_id: string;
  }>;
  versions: Readonly<{
    agent_version: string;
    model_version: string;
    prompt_version: string;
    toolset_version: typeof TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION;
  }>;
  tool_ids: readonly TureSetupAnalystReadOnlyToolId[];
  timing: Readonly<{
    latency_ms: number;
  }>;
  usage: Readonly<{
    input_tokens: number;
    output_tokens: number;
    estimated_cost_usd: number;
  }>;
  privacy: TureSetupAnalystShadowTracePrivacy;
  authority: TureSetupAnalystShadowTraceAuthority;
}>;

export type CreateTureSetupAnalystShadowTraceInput = Readonly<{
  assessment: TureSetupAnalystShadowAssessment;
  trace_id: string;
  agent_version: string;
  model_version: string;
  prompt_version: string;
  toolset_version: typeof TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION;
  tool_ids: readonly TureSetupAnalystReadOnlyToolId[];
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  privacy: TureSetupAnalystShadowTracePrivacy;
}>;

const inputKeys = [
  "agent_version",
  "assessment",
  "estimated_cost_usd",
  "input_tokens",
  "latency_ms",
  "model_version",
  "output_tokens",
  "privacy",
  "prompt_version",
  "tool_ids",
  "toolset_version",
  "trace_id",
] as const;

const privacyKeys = [
  "contains_secrets",
  "contains_unnecessary_personal_data",
  "metadata_only",
  "raw_model_output_retained",
  "raw_prompt_retained",
] as const;

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

function isSafeTraceId(value: unknown): value is string {
  return (
    hasText(value, 200) &&
    /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(value)
  );
}

function isBoundedNonNegativeInteger(
  value: unknown,
  maximum: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= maximum
  );
}

function isBoundedNonNegativeNumber(
  value: unknown,
  maximum: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= maximum
  );
}

function hasStrictPrivacy(value: unknown): boolean {
  if (!hasExactOwnDataKeys(value, privacyKeys)) return false;

  return (
    ownData(value, "metadata_only") === true &&
    ownData(value, "contains_secrets") === false &&
    ownData(value, "contains_unnecessary_personal_data") === false &&
    ownData(value, "raw_prompt_retained") === false &&
    ownData(value, "raw_model_output_retained") === false
  );
}

function readToolIds(value: unknown): readonly TureSetupAnalystReadOnlyToolId[] | null {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    return null;
  }

  try {
    const ownKeys = Reflect.ownKeys(value);
    if (ownKeys.some((key) => typeof key === "symbol")) return null;
    const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
    const length = lengthDescriptor?.value;
    if (
      typeof length !== "number" ||
      !Number.isSafeInteger(length) ||
      length < 0 ||
      length > tureSetupAnalystReadOnlyToolIds.length ||
      ownKeys.length !== length + 1 ||
      !ownKeys.includes("length")
    ) {
      return null;
    }

    const toolIds: TureSetupAnalystReadOnlyToolId[] = [];
    for (let index = 0; index < length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      const toolId = descriptor?.value;
      if (
        !descriptor ||
        !descriptor.enumerable ||
        !Object.prototype.hasOwnProperty.call(descriptor, "value") ||
        !tureSetupAnalystReadOnlyToolIds.includes(
          toolId as TureSetupAnalystReadOnlyToolId,
        ) ||
        toolIds.includes(toolId as TureSetupAnalystReadOnlyToolId)
      ) {
        return null;
      }
      toolIds.push(toolId as TureSetupAnalystReadOnlyToolId);
    }

    return Object.freeze(toolIds);
  } catch {
    return null;
  }
}

export function createTureSetupAnalystShadowTrace(
  input: CreateTureSetupAnalystShadowTraceInput,
): TureSetupAnalystShadowTrace {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst shadow trace input.");
  }

  const assessmentResult = validateTureSetupAnalystShadowAssessment(
    ownData(input, "assessment"),
  );
  const traceId = ownData(input, "trace_id");
  const agentVersion = ownData(input, "agent_version");
  const modelVersion = ownData(input, "model_version");
  const promptVersion = ownData(input, "prompt_version");
  const toolsetVersion = ownData(input, "toolset_version");
  const toolIds = readToolIds(ownData(input, "tool_ids"));
  const latencyMs = ownData(input, "latency_ms");
  const inputTokens = ownData(input, "input_tokens");
  const outputTokens = ownData(input, "output_tokens");
  const estimatedCostUsd = ownData(input, "estimated_cost_usd");

  if (
    !assessmentResult.valid ||
    !isSafeTraceId(traceId) ||
    assessmentResult.assessment.trace_id !== traceId ||
    agentVersion !== assessmentResult.assessment.agent_version ||
    modelVersion !== assessmentResult.assessment.model_version ||
    promptVersion !== assessmentResult.assessment.prompt_version ||
    toolsetVersion !== TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION ||
    !toolIds ||
    !isBoundedNonNegativeInteger(latencyMs, 300_000) ||
    !isBoundedNonNegativeInteger(inputTokens, 1_000_000) ||
    !isBoundedNonNegativeInteger(outputTokens, 1_000_000) ||
    !isBoundedNonNegativeNumber(estimatedCostUsd, 1_000) ||
    !hasStrictPrivacy(ownData(input, "privacy"))
  ) {
    throw new TypeError("Invalid Ture Setup Analyst shadow trace input.");
  }

  const policyToolIds = new Set(
    tureSetupAnalystReadOnlyContextToolPolicies.map((policy) => policy.tool_id),
  );
  if (toolIds.some((toolId) => !policyToolIds.has(toolId))) {
    throw new TypeError("Invalid Ture Setup Analyst shadow trace input.");
  }

  return Object.freeze({
    trace_contract_version: TURE_SETUP_ANALYST_SHADOW_TRACE_CONTRACT_VERSION,
    contract_version: TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
    mode: "metadata_only_shadow",
    trace_id: traceId,
    assessment_identity: Object.freeze({
      candidate_id: assessmentResult.assessment.candidate_id,
      recommendation_id: assessmentResult.assessment.recommendation_id,
    }),
    versions: Object.freeze({
      agent_version: agentVersion,
      model_version: modelVersion,
      prompt_version: promptVersion,
      toolset_version: TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION,
    }),
    tool_ids: toolIds,
    timing: Object.freeze({ latency_ms: latencyMs }),
    usage: Object.freeze({
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost_usd: estimatedCostUsd,
    }),
    privacy: TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY,
    authority: TURE_SETUP_ANALYST_SHADOW_TRACE_AUTHORITY,
  });
}
