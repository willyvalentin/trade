import {
  buildAvanzaDisabledLocalDevBridgeRunnerReport,
  type AvanzaDisabledLocalDevBridgeRunnerReport,
  type AvanzaDisabledLocalDevBridgeRunnerStatus,
} from "./avanza-disabled-local-dev-bridge-runner";
import {
  avanzaLocalDevBridgeActivationChecklistFixtures,
} from "./avanza-local-dev-bridge-activation-checklist-fixtures";
import {
  avanzaLocalDevBridgeContractFixtures,
} from "./avanza-local-dev-bridge-contract-fixtures";

export type AvanzaDisabledLocalDevBridgeRunnerFixtureId =
  | "disabled_by_default"
  | "blocked_missing_bridge_contract"
  | "blocked_missing_activation_checklist"
  | "blocked_checklist_not_approved"
  | "ready_disabled_report"
  | "bridge_gate_locked"
  | "smoke_invocation_forbidden"
  | "terminal_script_invocation_forbidden"
  | "browser_automation_forbidden"
  | "credential_access_forbidden"
  | "cookies_session_forbidden"
  | "bankid_automation_forbidden"
  | "order_submission_forbidden"
  | "final_kop_salj_human_only"
  | "supabase_write_forbidden"
  | "settlement_reconciliation_future_only"
  | "report_only_skeleton_valid";

export type AvanzaDisabledLocalDevBridgeRunnerFixture = {
  fixtureId: AvanzaDisabledLocalDevBridgeRunnerFixtureId;
  label: string;
  expectedStatus: AvanzaDisabledLocalDevBridgeRunnerStatus;
  report: AvanzaDisabledLocalDevBridgeRunnerReport;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const readyBridgeContract = avanzaLocalDevBridgeContractFixtures.find(
  (fixture) => fixture.fixtureId === "draft_ready_recommendation_buy_orchestration",
)?.contract;

const approvedChecklist = avanzaLocalDevBridgeActivationChecklistFixtures.find(
  (fixture) => fixture.fixtureId === "approved_for_disabled_runner_design",
)?.checklist;

const manualReviewChecklist = avanzaLocalDevBridgeActivationChecklistFixtures.find(
  (fixture) => fixture.fixtureId === "ready_for_manual_review",
)?.checklist;

const approvedRunnerInputs = {
  activationChecklist: approvedChecklist,
  bridgeContract: readyBridgeContract,
  envOptInPresent: true,
  explicitRunnerDesignApprovalPresent: true,
  manualTerminalConfirmationPresent: true,
  mode: "report_only" as const,
  now: fixtureNow,
  realRunFlagPresent: true,
};

function fixture(
  fixtureId: AvanzaDisabledLocalDevBridgeRunnerFixtureId,
  label: string,
  expectedStatus: AvanzaDisabledLocalDevBridgeRunnerStatus,
  report: AvanzaDisabledLocalDevBridgeRunnerReport,
): AvanzaDisabledLocalDevBridgeRunnerFixture {
  return { expectedStatus, fixtureId, label, report };
}

function build(
  runnerId: AvanzaDisabledLocalDevBridgeRunnerFixtureId,
  overrides: Parameters<typeof buildAvanzaDisabledLocalDevBridgeRunnerReport>[0] = {},
) {
  return buildAvanzaDisabledLocalDevBridgeRunnerReport({
    runnerId,
    now: fixtureNow,
    ...overrides,
  });
}

function buildApproved(
  runnerId: AvanzaDisabledLocalDevBridgeRunnerFixtureId,
  overrides: Parameters<typeof buildAvanzaDisabledLocalDevBridgeRunnerReport>[0] = {},
) {
  return buildAvanzaDisabledLocalDevBridgeRunnerReport({
    runnerId,
    ...approvedRunnerInputs,
    ...overrides,
  });
}

export const avanzaDisabledLocalDevBridgeRunnerFixtures:
  AvanzaDisabledLocalDevBridgeRunnerFixture[] = [
    fixture(
      "disabled_by_default",
      "Disabled by default",
      "blocked_missing_bridge_contract",
      build("disabled_by_default"),
    ),
    fixture(
      "blocked_missing_bridge_contract",
      "Blocked missing bridge contract",
      "blocked_missing_bridge_contract",
      build("blocked_missing_bridge_contract", {
        activationChecklist: approvedChecklist,
        explicitRunnerDesignApprovalPresent: true,
      }),
    ),
    fixture(
      "blocked_missing_activation_checklist",
      "Blocked missing activation checklist",
      "blocked_missing_activation_checklist",
      build("blocked_missing_activation_checklist", {
        bridgeContract: readyBridgeContract,
      }),
    ),
    fixture(
      "blocked_checklist_not_approved",
      "Blocked checklist not approved",
      "blocked_checklist_not_approved",
      build("blocked_checklist_not_approved", {
        activationChecklist: manualReviewChecklist,
        bridgeContract: readyBridgeContract,
        explicitRunnerDesignApprovalPresent: true,
      }),
    ),
    fixture(
      "ready_disabled_report",
      "Ready disabled report",
      "ready_disabled_report",
      buildApproved("ready_disabled_report"),
    ),
    fixture(
      "bridge_gate_locked",
      "Bridge gate locked",
      "blocked_bridge_gate_locked",
      buildApproved("bridge_gate_locked", {
        envOptInPresent: false,
      }),
    ),
    fixture(
      "smoke_invocation_forbidden",
      "Smoke invocation forbidden",
      "blocked_smoke_invocation_forbidden",
      buildApproved("smoke_invocation_forbidden", {
        mode: "invocation_forbidden",
      }),
    ),
    fixture(
      "terminal_script_invocation_forbidden",
      "Terminal script invocation forbidden",
      "blocked_bridge_gate_locked",
      buildApproved("terminal_script_invocation_forbidden", {
        manualTerminalConfirmationPresent: false,
      }),
    ),
    fixture(
      "browser_automation_forbidden",
      "Browser automation forbidden",
      "ready_disabled_report",
      buildApproved("browser_automation_forbidden"),
    ),
    fixture(
      "credential_access_forbidden",
      "Credential access forbidden",
      "ready_disabled_report",
      buildApproved("credential_access_forbidden"),
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "ready_disabled_report",
      buildApproved("cookies_session_forbidden"),
    ),
    fixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "ready_disabled_report",
      buildApproved("bankid_automation_forbidden"),
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "ready_disabled_report",
      buildApproved("order_submission_forbidden"),
    ),
    fixture(
      "final_kop_salj_human_only",
      "Final KOP/SALJ human-only",
      "ready_disabled_report",
      buildApproved("final_kop_salj_human_only"),
    ),
    fixture(
      "supabase_write_forbidden",
      "Supabase write forbidden",
      "ready_disabled_report",
      buildApproved("supabase_write_forbidden"),
    ),
    fixture(
      "settlement_reconciliation_future_only",
      "Settlement reconciliation future only",
      "ready_disabled_report",
      buildApproved("settlement_reconciliation_future_only"),
    ),
    fixture(
      "report_only_skeleton_valid",
      "Report-only skeleton valid",
      "ready_disabled_report",
      buildApproved("report_only_skeleton_valid"),
    ),
  ];
