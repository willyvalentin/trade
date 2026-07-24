import {
  avanzaDisabledLocalDevInvocationAdapterContractFixtures,
} from "./avanza-disabled-local-dev-invocation-adapter-contract-fixtures";
import {
  avanzaDisabledInvocationAdapterPayloadValidatorFixtures,
} from "./avanza-disabled-invocation-adapter-payload-validator-fixtures";
import {
  buildAvanzaInvocationAdapterDesignCheckpoint,
  type AvanzaInvocationAdapterDesignCheckpoint,
  type AvanzaInvocationAdapterDesignCheckpointStatus,
} from "./avanza-invocation-adapter-design-checkpoint";
import {
  avanzaLocalDevBridgeReadinessCheckpointFixtures,
} from "./avanza-local-dev-bridge-readiness-checkpoint-fixtures";
import {
  avanzaManualLocalDevInvocationApprovalRunbookFixtures,
} from "./avanza-manual-local-dev-invocation-approval-runbook-fixtures";

export type AvanzaInvocationAdapterDesignCheckpointFixtureId =
  | "ready_for_design_review"
  | "ready_for_disabled_adapter_review"
  | "blocked_missing_adapter_contract"
  | "blocked_missing_payload_validator"
  | "blocked_invalid_payload"
  | "blocked_runtime_requested"
  | "blocked_real_run_requested"
  | "blocked_production_requested"
  | "safe_payload_shape_validated"
  | "sensitive_payload_rejected"
  | "invocation_boundary_locked"
  | "smoke_runner_invocation_locked"
  | "terminal_script_invocation_locked"
  | "browser_automation_locked"
  | "credential_access_locked"
  | "cookies_session_forbidden"
  | "bankid_automation_forbidden"
  | "order_submission_forbidden"
  | "final_kop_salj_human_only"
  | "supabase_writes_locked"
  | "trade_ui_execution_locked"
  | "api_route_activation_locked"
  | "production_readiness_blocked";

export type AvanzaInvocationAdapterDesignCheckpointFixture = {
  fixtureId: AvanzaInvocationAdapterDesignCheckpointFixtureId;
  label: string;
  expectedStatus: AvanzaInvocationAdapterDesignCheckpointStatus;
  checkpoint: AvanzaInvocationAdapterDesignCheckpoint;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const approvalRunbook =
  avanzaManualLocalDevInvocationApprovalRunbookFixtures.find(
    (fixture) =>
      fixture.fixtureId === "approved_for_disabled_invocation_adapter_design",
  )?.runbook;
const bridgeReadinessCheckpoint =
  avanzaLocalDevBridgeReadinessCheckpointFixtures.find(
    (fixture) => fixture.fixtureId === "ready_for_model_only_boundary_review",
  )?.checkpoint;
const boundaryLockedCheckpoint =
  avanzaLocalDevBridgeReadinessCheckpointFixtures.find(
    (fixture) => fixture.fixtureId === "blocked_at_invocation_boundary",
  )?.checkpoint;
const adapterContract =
  avanzaDisabledLocalDevInvocationAdapterContractFixtures.find(
    (fixture) => fixture.fixtureId === "disabled_contract_ready_order_chain_target",
  )?.contract;
const validPayloadValidationReport =
  avanzaDisabledInvocationAdapterPayloadValidatorFixtures.find(
    (fixture) => fixture.fixtureId === "valid_payload_for_design_review",
  )?.report;
const invalidPayloadValidationReport =
  avanzaDisabledInvocationAdapterPayloadValidatorFixtures.find(
    (fixture) => fixture.fixtureId === "invalid_missing_safe_payload",
  )?.report;
const sensitivePayloadValidationReport =
  avanzaDisabledInvocationAdapterPayloadValidatorFixtures.find(
    (fixture) => fixture.fixtureId === "raw_credentials_detected",
  )?.report;

const readyInputs = {
  adapterContract,
  approvalRunbook,
  bridgeReadinessCheckpoint,
  designReviewed: true,
  now: fixtureNow,
  payloadReviewed: true,
  payloadValidationReport: validPayloadValidationReport,
};

function fixture(
  fixtureId: AvanzaInvocationAdapterDesignCheckpointFixtureId,
  label: string,
  expectedStatus: AvanzaInvocationAdapterDesignCheckpointStatus,
  checkpoint: AvanzaInvocationAdapterDesignCheckpoint,
): AvanzaInvocationAdapterDesignCheckpointFixture {
  return { checkpoint, expectedStatus, fixtureId, label };
}

function build(
  checkpointId: AvanzaInvocationAdapterDesignCheckpointFixtureId,
  overrides: Parameters<typeof buildAvanzaInvocationAdapterDesignCheckpoint>[0] = {},
) {
  return buildAvanzaInvocationAdapterDesignCheckpoint({
    checkpointId,
    ...readyInputs,
    ...overrides,
  });
}

export const avanzaInvocationAdapterDesignCheckpointFixtures:
  AvanzaInvocationAdapterDesignCheckpointFixture[] = [
    fixture(
      "ready_for_design_review",
      "Ready for design review",
      "ready_for_design_review",
      build("ready_for_design_review"),
    ),
    fixture(
      "ready_for_disabled_adapter_review",
      "Ready for disabled adapter review",
      "ready_for_disabled_adapter_review",
      build("ready_for_disabled_adapter_review", {
        designReviewed: false,
        payloadReviewed: false,
      }),
    ),
    fixture(
      "blocked_missing_adapter_contract",
      "Blocked missing adapter contract",
      "blocked_missing_adapter_contract",
      build("blocked_missing_adapter_contract", {
        adapterContract: undefined,
      }),
    ),
    fixture(
      "blocked_missing_payload_validator",
      "Blocked missing payload validator",
      "blocked_missing_payload_validator",
      build("blocked_missing_payload_validator", {
        payloadValidationReport: undefined,
      }),
    ),
    fixture(
      "blocked_invalid_payload",
      "Blocked invalid payload",
      "blocked_payload_invalid",
      build("blocked_invalid_payload", {
        payloadValidationReport: invalidPayloadValidationReport,
      }),
    ),
    fixture(
      "blocked_runtime_requested",
      "Blocked runtime requested",
      "blocked_runtime_requested",
      build("blocked_runtime_requested", {
        runtimeRequested: true,
      }),
    ),
    fixture(
      "blocked_real_run_requested",
      "Blocked real-run requested",
      "blocked_for_real_execution",
      build("blocked_real_run_requested", {
        realRunRequested: true,
      }),
    ),
    fixture(
      "blocked_production_requested",
      "Blocked production requested",
      "blocked_for_production",
      build("blocked_production_requested", {
        productionRequested: true,
      }),
    ),
    fixture(
      "safe_payload_shape_validated",
      "Safe payload shape validated",
      "ready_for_design_review",
      build("safe_payload_shape_validated"),
    ),
    fixture(
      "sensitive_payload_rejected",
      "Sensitive payload rejected",
      "blocked_payload_invalid",
      build("sensitive_payload_rejected", {
        payloadValidationReport: sensitivePayloadValidationReport,
      }),
    ),
    fixture(
      "invocation_boundary_locked",
      "Invocation boundary locked",
      "blocked_invocation_boundary_locked",
      build("invocation_boundary_locked", {
        bridgeReadinessCheckpoint: boundaryLockedCheckpoint,
      }),
    ),
    fixture(
      "smoke_runner_invocation_locked",
      "Smoke runner invocation locked",
      "ready_for_design_review",
      build("smoke_runner_invocation_locked"),
    ),
    fixture(
      "terminal_script_invocation_locked",
      "Terminal script invocation locked",
      "ready_for_design_review",
      build("terminal_script_invocation_locked"),
    ),
    fixture(
      "browser_automation_locked",
      "Browser automation locked",
      "ready_for_design_review",
      build("browser_automation_locked"),
    ),
    fixture(
      "credential_access_locked",
      "Credential access locked",
      "ready_for_design_review",
      build("credential_access_locked"),
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "ready_for_design_review",
      build("cookies_session_forbidden"),
    ),
    fixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "ready_for_design_review",
      build("bankid_automation_forbidden"),
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "ready_for_design_review",
      build("order_submission_forbidden"),
    ),
    fixture(
      "final_kop_salj_human_only",
      "Final KOP/SALJ human-only",
      "ready_for_design_review",
      build("final_kop_salj_human_only"),
    ),
    fixture(
      "supabase_writes_locked",
      "Supabase writes locked",
      "ready_for_design_review",
      build("supabase_writes_locked"),
    ),
    fixture(
      "trade_ui_execution_locked",
      "Trade UI execution locked",
      "ready_for_design_review",
      build("trade_ui_execution_locked"),
    ),
    fixture(
      "api_route_activation_locked",
      "API route activation locked",
      "ready_for_design_review",
      build("api_route_activation_locked"),
    ),
    fixture(
      "production_readiness_blocked",
      "Production readiness blocked",
      "ready_for_design_review",
      build("production_readiness_blocked"),
    ),
  ];
