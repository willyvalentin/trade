import {
  avanzaDisabledLocalDevInvocationAdapterContractFixtures,
} from "./avanza-disabled-local-dev-invocation-adapter-contract-fixtures";
import {
  validateAvanzaDisabledInvocationAdapterPayload,
  type AvanzaDisabledInvocationAdapterPayloadCandidate,
  type AvanzaDisabledInvocationAdapterPayloadValidationReport,
  type AvanzaDisabledInvocationAdapterPayloadValidationStatus,
} from "./avanza-disabled-invocation-adapter-payload-validator";

export type AvanzaDisabledInvocationAdapterPayloadValidatorFixtureId =
  | "valid_payload_for_design_review"
  | "invalid_missing_adapter_contract"
  | "invalid_missing_request_shape"
  | "invalid_missing_safe_payload"
  | "raw_credentials_detected"
  | "cookies_detected"
  | "session_tokens_detected"
  | "account_numbers_detected"
  | "order_ids_detected"
  | "bankid_artifacts_detected"
  | "unredacted_screenshots_detected"
  | "raw_broker_confirmations_detected"
  | "api_route_reference_detected"
  | "smoke_script_reference_detected"
  | "browser_runtime_handle_detected"
  | "supabase_write_payload_detected"
  | "can_invoke_target_now_true_blocked"
  | "can_run_terminal_script_now_true_blocked"
  | "can_use_browser_automation_now_true_blocked"
  | "runtime_capability_detected"
  | "invocation_boundary_crossed_blocked";

export type AvanzaDisabledInvocationAdapterPayloadValidatorFixture = {
  fixtureId: AvanzaDisabledInvocationAdapterPayloadValidatorFixtureId;
  label: string;
  expectedStatus: AvanzaDisabledInvocationAdapterPayloadValidationStatus;
  report: AvanzaDisabledInvocationAdapterPayloadValidationReport;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const adapterContract =
  avanzaDisabledLocalDevInvocationAdapterContractFixtures.find(
    (fixture) => fixture.fixtureId === "disabled_contract_ready_order_chain_target",
  )?.contract;

const basePayload: AvanzaDisabledInvocationAdapterPayloadCandidate = {
  bridgeContractId: "bridge-contract-summary",
  canAccessCredentials: false,
  canApproveRuntimeInvocation: false,
  canCallApiRoute: false,
  canCrossInvocationBoundaryNow: false,
  canInvokeSmokeRunnerNow: false,
  canInvokeTargetNow: false,
  canRunTerminalScriptNow: false,
  canSubmitOrder: false,
  canUseBrowserAutomationNow: false,
  canWriteSupabase: false,
  checkpointId: "bridge-readiness-checkpoint-summary",
  checklistOrRunbookId: "manual-runbook-summary",
  dryRunId: "model-only-dry-run-summary",
  localDevOnly: true,
  modelOnlyDefault: true,
  requestId: "disabled-adapter-payload-design-review",
  requestKind: "design_review_payload",
  safePayloadSummary: [
    "selected ticker",
    "side",
    "quantity",
    "limit price",
    "request kind",
    "dry-run id",
    "bridge checkpoint id",
    "approval runbook id",
  ],
  selectedLimitPrice: 123.45,
  selectedQuantity: 10,
  selectedSide: "buy",
  selectedTicker: "SAFE",
  target: "order_chain_smoke_runner",
  terminalOnly: true,
};

function fixture(
  fixtureId: AvanzaDisabledInvocationAdapterPayloadValidatorFixtureId,
  label: string,
  expectedStatus: AvanzaDisabledInvocationAdapterPayloadValidationStatus,
  payloadOverrides: AvanzaDisabledInvocationAdapterPayloadCandidate = {},
  options: Partial<
    Parameters<typeof validateAvanzaDisabledInvocationAdapterPayload>[0]
  > = {},
): AvanzaDisabledInvocationAdapterPayloadValidatorFixture {
  const report = validateAvanzaDisabledInvocationAdapterPayload({
    adapterContract,
    now: fixtureNow,
    payloadCandidate: {
      ...basePayload,
      ...payloadOverrides,
    },
    validationId: fixtureId,
    ...options,
  });

  return { expectedStatus, fixtureId, label, report };
}

export const avanzaDisabledInvocationAdapterPayloadValidatorFixtures:
  AvanzaDisabledInvocationAdapterPayloadValidatorFixture[] = [
    fixture(
      "valid_payload_for_design_review",
      "Valid payload for design review",
      "valid_for_design_review",
    ),
    fixture(
      "invalid_missing_adapter_contract",
      "Invalid missing adapter contract",
      "invalid_missing_adapter_contract",
      {},
      { adapterContract: undefined },
    ),
    fixture(
      "invalid_missing_request_shape",
      "Invalid missing request shape",
      "invalid_missing_request_shape",
      {},
      {
        adapterContract: adapterContract
          ? { ...adapterContract, requestShape: undefined }
          : undefined,
      },
    ),
    fixture(
      "invalid_missing_safe_payload",
      "Invalid missing safe payload",
      "invalid_missing_safe_payload",
      { safePayloadSummary: [] },
    ),
    fixture(
      "raw_credentials_detected",
      "Raw credentials detected",
      "invalid_sensitive_payload_detected",
      { raw_credentials: "forbidden" },
    ),
    fixture(
      "cookies_detected",
      "Cookies detected",
      "invalid_sensitive_payload_detected",
      { cookies: "forbidden" },
    ),
    fixture(
      "session_tokens_detected",
      "Session tokens detected",
      "invalid_sensitive_payload_detected",
      { session_tokens: "forbidden" },
    ),
    fixture(
      "account_numbers_detected",
      "Account numbers detected",
      "invalid_sensitive_payload_detected",
      { account_numbers: "forbidden" },
    ),
    fixture(
      "order_ids_detected",
      "Order IDs detected",
      "invalid_sensitive_payload_detected",
      { order_ids: "forbidden" },
    ),
    fixture(
      "bankid_artifacts_detected",
      "BankID artifacts detected",
      "invalid_sensitive_payload_detected",
      { bankid_artifacts: "forbidden" },
    ),
    fixture(
      "unredacted_screenshots_detected",
      "Unredacted screenshots detected",
      "invalid_sensitive_payload_detected",
      { unredacted_screenshots: "forbidden" },
    ),
    fixture(
      "raw_broker_confirmations_detected",
      "Raw broker confirmations detected",
      "invalid_sensitive_payload_detected",
      { broker_confirmations_raw: "forbidden" },
    ),
    fixture(
      "api_route_reference_detected",
      "API route reference detected",
      "invalid_sensitive_payload_detected",
      { api_route_reference: "forbidden" },
    ),
    fixture(
      "smoke_script_reference_detected",
      "Smoke script reference detected",
      "invalid_sensitive_payload_detected",
      { smoke_script_reference: "forbidden" },
    ),
    fixture(
      "browser_runtime_handle_detected",
      "Browser runtime handle detected",
      "invalid_sensitive_payload_detected",
      { browser_runtime_handle: "forbidden" },
    ),
    fixture(
      "supabase_write_payload_detected",
      "Supabase write payload detected",
      "invalid_sensitive_payload_detected",
      { supabase_write_payload: "forbidden" },
    ),
    fixture(
      "can_invoke_target_now_true_blocked",
      "canInvokeTargetNow true blocked",
      "invalid_invocation_boundary_crossed",
      { canInvokeTargetNow: true },
    ),
    fixture(
      "can_run_terminal_script_now_true_blocked",
      "canRunTerminalScriptNow true blocked",
      "invalid_invocation_boundary_crossed",
      { canRunTerminalScriptNow: true },
    ),
    fixture(
      "can_use_browser_automation_now_true_blocked",
      "canUseBrowserAutomationNow true blocked",
      "invalid_invocation_boundary_crossed",
      { canUseBrowserAutomationNow: true },
    ),
    fixture(
      "runtime_capability_detected",
      "Runtime capability detected",
      "invalid_runtime_capability_detected",
      { canInvokeSmokeRunnerNow: true },
    ),
    fixture(
      "invocation_boundary_crossed_blocked",
      "Invocation boundary crossed blocked",
      "invalid_invocation_boundary_crossed",
      { canCrossInvocationBoundaryNow: true },
    ),
  ];
