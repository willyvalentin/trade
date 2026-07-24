import {
  avanzaLocalDevBridgeReadinessCheckpointFixtures,
} from "./avanza-local-dev-bridge-readiness-checkpoint-fixtures";
import {
  buildAvanzaDisabledLocalDevInvocationAdapterContract,
  type AvanzaDisabledLocalDevInvocationAdapterContract,
  type AvanzaDisabledLocalDevInvocationAdapterContractStatus,
} from "./avanza-disabled-local-dev-invocation-adapter-contract";
import {
  avanzaManualLocalDevInvocationApprovalRunbookFixtures,
} from "./avanza-manual-local-dev-invocation-approval-runbook-fixtures";
import {
  avanzaModelOnlyLocalDevBridgeDryRunFixtures,
} from "./avanza-model-only-local-dev-bridge-dry-runner-fixtures";

export type AvanzaDisabledLocalDevInvocationAdapterContractFixtureId =
  | "disabled_contract_ready_login_smoke_target"
  | "disabled_contract_ready_order_chain_target"
  | "disabled_contract_ready_combined_login_then_order_target"
  | "review_only_target"
  | "blocked_missing_approval_runbook"
  | "blocked_missing_checkpoint"
  | "blocked_missing_dry_run_report"
  | "blocked_design_not_approved"
  | "runtime_approval_requested_forbidden"
  | "invocation_boundary_locked"
  | "smoke_runner_invocation_locked"
  | "terminal_script_invocation_locked"
  | "browser_automation_locked"
  | "credential_payload_forbidden"
  | "cookies_session_payload_forbidden"
  | "account_order_id_payload_forbidden"
  | "bankid_automation_forbidden"
  | "order_submission_forbidden"
  | "final_kop_salj_human_only"
  | "supabase_write_locked"
  | "trade_ui_execution_locked"
  | "api_route_activation_locked";

export type AvanzaDisabledLocalDevInvocationAdapterContractFixture = {
  fixtureId: AvanzaDisabledLocalDevInvocationAdapterContractFixtureId;
  label: string;
  expectedStatus: AvanzaDisabledLocalDevInvocationAdapterContractStatus;
  contract: AvanzaDisabledLocalDevInvocationAdapterContract;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const approvalRunbook =
  avanzaManualLocalDevInvocationApprovalRunbookFixtures.find(
    (fixture) =>
      fixture.fixtureId === "approved_for_disabled_invocation_adapter_design",
  )?.runbook;
const reviewOnlyApprovalRunbook =
  avanzaManualLocalDevInvocationApprovalRunbookFixtures.find(
    (fixture) => fixture.fixtureId === "ready_for_manual_review",
  )?.runbook;
const bridgeReadinessCheckpoint =
  avanzaLocalDevBridgeReadinessCheckpointFixtures.find(
    (fixture) => fixture.fixtureId === "ready_for_model_only_boundary_review",
  )?.checkpoint;
const modelOnlyDryRunReport =
  avanzaModelOnlyLocalDevBridgeDryRunFixtures.find(
    (fixture) => fixture.fixtureId === "dry_run_completed_to_invocation_boundary",
  )?.report;

const readyInputs = {
  approvalRunbook,
  bridgeReadinessCheckpoint,
  designOnlyApprovalPresent: true,
  modelOnlyDryRunReport,
  now: fixtureNow,
};

function fixture(
  fixtureId: AvanzaDisabledLocalDevInvocationAdapterContractFixtureId,
  label: string,
  expectedStatus: AvanzaDisabledLocalDevInvocationAdapterContractStatus,
  contract: AvanzaDisabledLocalDevInvocationAdapterContract,
): AvanzaDisabledLocalDevInvocationAdapterContractFixture {
  return { contract, expectedStatus, fixtureId, label };
}

function build(
  adapterContractId: AvanzaDisabledLocalDevInvocationAdapterContractFixtureId,
  overrides: Parameters<
    typeof buildAvanzaDisabledLocalDevInvocationAdapterContract
  >[0] = {},
) {
  return buildAvanzaDisabledLocalDevInvocationAdapterContract({
    adapterContractId,
    ...readyInputs,
    ...overrides,
  });
}

export const avanzaDisabledLocalDevInvocationAdapterContractFixtures:
  AvanzaDisabledLocalDevInvocationAdapterContractFixture[] = [
    fixture(
      "disabled_contract_ready_login_smoke_target",
      "Disabled contract ready for login smoke target",
      "disabled_contract_ready",
      build("disabled_contract_ready_login_smoke_target", {
        target: "login_smoke_runner",
      }),
    ),
    fixture(
      "disabled_contract_ready_order_chain_target",
      "Disabled contract ready for order chain target",
      "disabled_contract_ready",
      build("disabled_contract_ready_order_chain_target", {
        target: "order_chain_smoke_runner",
      }),
    ),
    fixture(
      "disabled_contract_ready_combined_login_then_order_target",
      "Disabled contract ready for combined login then order target",
      "disabled_contract_ready",
      build("disabled_contract_ready_combined_login_then_order_target", {
        target: "combined_login_then_order",
      }),
    ),
    fixture(
      "review_only_target",
      "Review-only target",
      "disabled_contract_ready",
      build("review_only_target", {
        target: "review_only",
      }),
    ),
    fixture(
      "blocked_missing_approval_runbook",
      "Blocked missing approval runbook",
      "blocked_missing_approval_runbook",
      build("blocked_missing_approval_runbook", {
        approvalRunbook: undefined,
      }),
    ),
    fixture(
      "blocked_missing_checkpoint",
      "Blocked missing checkpoint",
      "blocked_missing_bridge_readiness_checkpoint",
      build("blocked_missing_checkpoint", {
        bridgeReadinessCheckpoint: undefined,
      }),
    ),
    fixture(
      "blocked_missing_dry_run_report",
      "Blocked missing dry-run report",
      "blocked_missing_dry_run_report",
      build("blocked_missing_dry_run_report", {
        modelOnlyDryRunReport: undefined,
      }),
    ),
    fixture(
      "blocked_design_not_approved",
      "Blocked design not approved",
      "blocked_design_not_approved",
      build("blocked_design_not_approved", {
        approvalRunbook: reviewOnlyApprovalRunbook,
        designOnlyApprovalPresent: false,
      }),
    ),
    fixture(
      "runtime_approval_requested_forbidden",
      "Runtime approval requested forbidden",
      "blocked_runtime_not_approved",
      build("runtime_approval_requested_forbidden", {
        runtimeApprovalPresent: true,
      }),
    ),
    fixture(
      "invocation_boundary_locked",
      "Invocation boundary locked",
      "disabled_contract_ready",
      build("invocation_boundary_locked"),
    ),
    fixture(
      "smoke_runner_invocation_locked",
      "Smoke runner invocation locked",
      "disabled_contract_ready",
      build("smoke_runner_invocation_locked"),
    ),
    fixture(
      "terminal_script_invocation_locked",
      "Terminal script invocation locked",
      "disabled_contract_ready",
      build("terminal_script_invocation_locked"),
    ),
    fixture(
      "browser_automation_locked",
      "Browser automation locked",
      "disabled_contract_ready",
      build("browser_automation_locked"),
    ),
    fixture(
      "credential_payload_forbidden",
      "Credential payload forbidden",
      "disabled_contract_ready",
      build("credential_payload_forbidden"),
    ),
    fixture(
      "cookies_session_payload_forbidden",
      "Cookies/session payload forbidden",
      "disabled_contract_ready",
      build("cookies_session_payload_forbidden"),
    ),
    fixture(
      "account_order_id_payload_forbidden",
      "Account/order id payload forbidden",
      "disabled_contract_ready",
      build("account_order_id_payload_forbidden"),
    ),
    fixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "disabled_contract_ready",
      build("bankid_automation_forbidden"),
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "disabled_contract_ready",
      build("order_submission_forbidden"),
    ),
    fixture(
      "final_kop_salj_human_only",
      "Final KÖP/SÄLJ human-only",
      "disabled_contract_ready",
      build("final_kop_salj_human_only"),
    ),
    fixture(
      "supabase_write_locked",
      "Supabase write locked",
      "disabled_contract_ready",
      build("supabase_write_locked"),
    ),
    fixture(
      "trade_ui_execution_locked",
      "Trade UI execution locked",
      "disabled_contract_ready",
      build("trade_ui_execution_locked"),
    ),
    fixture(
      "api_route_activation_locked",
      "API route activation locked",
      "disabled_contract_ready",
      build("api_route_activation_locked"),
    ),
  ];
