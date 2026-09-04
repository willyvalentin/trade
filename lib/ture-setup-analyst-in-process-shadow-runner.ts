import {
  TURE_SETUP_ANALYST_SHADOW_TRACE_AUTHORITY,
  TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY,
  createTureSetupAnalystShadowTrace,
  type TureSetupAnalystShadowTrace,
  type TureSetupAnalystShadowTracePrivacy,
} from "./ture-setup-analyst-shadow-trace-contract";
import { TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION } from "./ture-setup-analyst-read-only-context-tools";
import {
  type TureSetupAnalystReadOnlyToolId,
  type TureSetupAnalystShadowAssessment,
  validateTureSetupAnalystShadowAssessment,
} from "./ture-setup-analyst-shadow-contract";

export const TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_VERSION =
  "ture_setup_analyst_in_process_shadow_runner_v1" as const;

export type TureSetupAnalystInProcessShadowRunnerAuthority = Readonly<{
  mode: "in_process_shadow_only";
  provider_status: "unbound";
  may_invoke_model: false;
  may_invoke_context_tools: false;
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

export const TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_AUTHORITY: TureSetupAnalystInProcessShadowRunnerAuthority =
  Object.freeze({
    mode: "in_process_shadow_only",
    provider_status: "unbound",
    may_invoke_model: false,
    may_invoke_context_tools: false,
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

export type TureSetupAnalystInProcessShadowTraceMetadata = Readonly<{
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

export type RunTureSetupAnalystInProcessShadowInput = Readonly<{
  accepted_assessment: Readonly<TureSetupAnalystShadowAssessment>;
  trace_metadata: TureSetupAnalystInProcessShadowTraceMetadata;
}>;

export type TureSetupAnalystInProcessShadowRun = Readonly<{
  runner_version: typeof TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_VERSION;
  mode: "in_process_shadow_only";
  run_status: "shadow_trace_emitted";
  trace: TureSetupAnalystShadowTrace;
  authority: TureSetupAnalystInProcessShadowRunnerAuthority;
}>;

const inputKeys = ["accepted_assessment", "trace_metadata"] as const;

const traceMetadataKeys = [
  "agent_version",
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

function isAcceptedAssessment(
  value: unknown,
): value is Readonly<TureSetupAnalystShadowAssessment> {
  if (!Object.isFrozen(value)) return false;

  return validateTureSetupAnalystShadowAssessment(value).valid;
}

export function runTureSetupAnalystInProcessShadow(
  input: RunTureSetupAnalystInProcessShadowInput,
): TureSetupAnalystInProcessShadowRun {
  if (!hasExactOwnDataKeys(input, inputKeys)) {
    throw new TypeError("Invalid Ture Setup Analyst in-process shadow run input.");
  }

  const acceptedAssessment = ownData(input, "accepted_assessment");
  const traceMetadata = ownData(input, "trace_metadata");
  if (
    !isAcceptedAssessment(acceptedAssessment) ||
    !hasExactOwnDataKeys(traceMetadata, traceMetadataKeys)
  ) {
    throw new TypeError("Invalid Ture Setup Analyst in-process shadow run input.");
  }

  const trace = createTureSetupAnalystShadowTrace({
    assessment: acceptedAssessment,
    trace_id: ownData(traceMetadata, "trace_id") as string,
    agent_version: ownData(traceMetadata, "agent_version") as string,
    model_version: ownData(traceMetadata, "model_version") as string,
    prompt_version: ownData(traceMetadata, "prompt_version") as string,
    toolset_version: ownData(traceMetadata, "toolset_version") as typeof TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION,
    tool_ids: ownData(traceMetadata, "tool_ids") as readonly TureSetupAnalystReadOnlyToolId[],
    latency_ms: ownData(traceMetadata, "latency_ms") as number,
    input_tokens: ownData(traceMetadata, "input_tokens") as number,
    output_tokens: ownData(traceMetadata, "output_tokens") as number,
    estimated_cost_usd: ownData(traceMetadata, "estimated_cost_usd") as number,
    privacy: ownData(traceMetadata, "privacy") as TureSetupAnalystShadowTracePrivacy,
  });

  if (
    trace.privacy !== TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY ||
    trace.authority !== TURE_SETUP_ANALYST_SHADOW_TRACE_AUTHORITY
  ) {
    throw new TypeError("Invalid Ture Setup Analyst in-process shadow run input.");
  }

  return Object.freeze({
    runner_version: TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_VERSION,
    mode: "in_process_shadow_only",
    run_status: "shadow_trace_emitted",
    trace,
    authority: TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_AUTHORITY,
  });
}
