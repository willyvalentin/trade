import {
  buildAvanzaDisabledLocalDevBridgeRunnerReport,
} from "./avanza-disabled-local-dev-bridge-runner";
import {
  avanzaDisabledLocalDevBridgeRunnerFixtures,
} from "./avanza-disabled-local-dev-bridge-runner-fixtures";
import {
  buildAvanzaModelOnlyLocalDevBridgeDryRunReport,
  type AvanzaModelOnlyLocalDevBridgeDryRunReport,
  type AvanzaModelOnlyLocalDevBridgeDryRunStatus,
} from "./avanza-model-only-local-dev-bridge-dry-runner";
import {
  avanzaLocalDevBridgeActivationChecklistFixtures,
} from "./avanza-local-dev-bridge-activation-checklist-fixtures";
import {
  avanzaLocalDevBridgeContractFixtures,
} from "./avanza-local-dev-bridge-contract-fixtures";

export type AvanzaModelOnlyLocalDevBridgeDryRunFixtureId =
  | "model_only_dry_run_ready_recommendation_buy"
  | "model_only_dry_run_ready_live_position_sell"
  | "combined_login_then_order_dry_run_simulation"
  | "login_smoke_simulation_stops_before_invocation"
  | "order_smoke_simulation_stops_before_invocation"
  | "blocked_missing_disabled_runner_report"
  | "blocked_missing_bridge_contract"
  | "blocked_missing_activation_checklist"
  | "blocked_checklist_not_approved"
  | "blocked_bridge_gate_locked"
  | "smoke_invocation_forbidden"
  | "terminal_script_invocation_forbidden"
  | "browser_automation_forbidden"
  | "credential_access_forbidden"
  | "cookies_session_forbidden"
  | "bankid_automation_forbidden"
  | "order_submission_forbidden"
  | "final_kop_salj_human_only"
  | "supabase_write_forbidden"
  | "dry_run_completed_to_invocation_boundary";

export type AvanzaModelOnlyLocalDevBridgeDryRunFixture = {
  fixtureId: AvanzaModelOnlyLocalDevBridgeDryRunFixtureId;
  label: string;
  expectedStatus: AvanzaModelOnlyLocalDevBridgeDryRunStatus;
  report: AvanzaModelOnlyLocalDevBridgeDryRunReport;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const buyBridgeContract = avanzaLocalDevBridgeContractFixtures.find(
  (fixture) => fixture.fixtureId === "draft_ready_recommendation_buy_orchestration",
)?.contract;
const sellBridgeContract = avanzaLocalDevBridgeContractFixtures.find(
  (fixture) => fixture.fixtureId === "draft_ready_live_position_sell_orchestration",
)?.contract;
const combinedBridgeContract = avanzaLocalDevBridgeContractFixtures.find(
  (fixture) => fixture.fixtureId === "combined_login_then_order_request_candidate",
)?.contract;
const loginBridgeContract = avanzaLocalDevBridgeContractFixtures.find(
  (fixture) => fixture.fixtureId === "login_smoke_request_candidate",
)?.contract;
const orderBridgeContract = avanzaLocalDevBridgeContractFixtures.find(
  (fixture) => fixture.fixtureId === "order_chain_smoke_request_candidate",
)?.contract;

const approvedChecklist = avanzaLocalDevBridgeActivationChecklistFixtures.find(
  (fixture) => fixture.fixtureId === "approved_for_disabled_runner_design",
)?.checklist;
const manualReviewChecklist = avanzaLocalDevBridgeActivationChecklistFixtures.find(
  (fixture) => fixture.fixtureId === "ready_for_manual_review",
)?.checklist;

const readyDisabledRunnerReport = avanzaDisabledLocalDevBridgeRunnerFixtures.find(
  (fixture) => fixture.fixtureId === "ready_disabled_report",
)?.report;

function readyDisabledRunnerFor(
  runnerId: string,
  bridgeContract = buyBridgeContract,
) {
  return buildAvanzaDisabledLocalDevBridgeRunnerReport({
    activationChecklist: approvedChecklist,
    bridgeContract,
    envOptInPresent: true,
    explicitRunnerDesignApprovalPresent: true,
    manualTerminalConfirmationPresent: true,
    mode: "report_only",
    now: fixtureNow,
    realRunFlagPresent: true,
    runnerId,
  });
}

const readyDryRunInputs = {
  activationChecklist: approvedChecklist,
  bridgeContract: buyBridgeContract,
  disabledRunnerReport: readyDisabledRunnerReport,
  mode: "model_only" as const,
  now: fixtureNow,
};

function fixture(
  fixtureId: AvanzaModelOnlyLocalDevBridgeDryRunFixtureId,
  label: string,
  expectedStatus: AvanzaModelOnlyLocalDevBridgeDryRunStatus,
  report: AvanzaModelOnlyLocalDevBridgeDryRunReport,
): AvanzaModelOnlyLocalDevBridgeDryRunFixture {
  return { expectedStatus, fixtureId, label, report };
}

function build(
  dryRunId: AvanzaModelOnlyLocalDevBridgeDryRunFixtureId,
  overrides: Parameters<typeof buildAvanzaModelOnlyLocalDevBridgeDryRunReport>[0] = {},
) {
  return buildAvanzaModelOnlyLocalDevBridgeDryRunReport({
    dryRunId,
    now: fixtureNow,
    ...overrides,
  });
}

function buildReady(
  dryRunId: AvanzaModelOnlyLocalDevBridgeDryRunFixtureId,
  overrides: Parameters<typeof buildAvanzaModelOnlyLocalDevBridgeDryRunReport>[0] = {},
) {
  return build(dryRunId, {
    ...readyDryRunInputs,
    ...overrides,
  });
}

export const avanzaModelOnlyLocalDevBridgeDryRunFixtures:
  AvanzaModelOnlyLocalDevBridgeDryRunFixture[] = [
    fixture(
      "model_only_dry_run_ready_recommendation_buy",
      "Model-only dry run ready recommendation BUY",
      "model_dry_run_ready",
      buildReady("model_only_dry_run_ready_recommendation_buy"),
    ),
    fixture(
      "model_only_dry_run_ready_live_position_sell",
      "Model-only dry run ready live-position SELL",
      "model_dry_run_ready",
      buildReady("model_only_dry_run_ready_live_position_sell", {
        bridgeContract: sellBridgeContract,
        disabledRunnerReport: readyDisabledRunnerFor(
          "sell-disabled-runner-report",
          sellBridgeContract,
        ),
      }),
    ),
    fixture(
      "combined_login_then_order_dry_run_simulation",
      "Combined login then order dry-run simulation",
      "model_dry_run_ready",
      buildReady("combined_login_then_order_dry_run_simulation", {
        bridgeContract: combinedBridgeContract,
        disabledRunnerReport: readyDisabledRunnerFor(
          "combined-disabled-runner-report",
          combinedBridgeContract,
        ),
        simulateCombinedLoginThenOrder: true,
      }),
    ),
    fixture(
      "login_smoke_simulation_stops_before_invocation",
      "Login smoke simulation stops before invocation",
      "model_dry_run_ready",
      buildReady("login_smoke_simulation_stops_before_invocation", {
        bridgeContract: loginBridgeContract,
        disabledRunnerReport: readyDisabledRunnerFor(
          "login-disabled-runner-report",
          loginBridgeContract,
        ),
        simulateLoginSmoke: true,
      }),
    ),
    fixture(
      "order_smoke_simulation_stops_before_invocation",
      "Order smoke simulation stops before invocation",
      "model_dry_run_ready",
      buildReady("order_smoke_simulation_stops_before_invocation", {
        bridgeContract: orderBridgeContract,
        disabledRunnerReport: readyDisabledRunnerFor(
          "order-disabled-runner-report",
          orderBridgeContract,
        ),
        simulateOrderSmoke: true,
      }),
    ),
    fixture(
      "blocked_missing_disabled_runner_report",
      "Blocked missing disabled runner report",
      "blocked_missing_disabled_runner_report",
      build("blocked_missing_disabled_runner_report", {
        activationChecklist: approvedChecklist,
        bridgeContract: buyBridgeContract,
      }),
    ),
    fixture(
      "blocked_missing_bridge_contract",
      "Blocked missing bridge contract",
      "blocked_missing_bridge_contract",
      build("blocked_missing_bridge_contract", {
        activationChecklist: approvedChecklist,
        disabledRunnerReport: readyDisabledRunnerReport,
      }),
    ),
    fixture(
      "blocked_missing_activation_checklist",
      "Blocked missing activation checklist",
      "blocked_missing_activation_checklist",
      build("blocked_missing_activation_checklist", {
        bridgeContract: buyBridgeContract,
        disabledRunnerReport: readyDisabledRunnerReport,
      }),
    ),
    fixture(
      "blocked_checklist_not_approved",
      "Blocked checklist not approved",
      "blocked_checklist_not_approved_for_design",
      build("blocked_checklist_not_approved", {
        activationChecklist: manualReviewChecklist,
        bridgeContract: buyBridgeContract,
        disabledRunnerReport: readyDisabledRunnerReport,
      }),
    ),
    fixture(
      "blocked_bridge_gate_locked",
      "Blocked bridge gate locked",
      "blocked_bridge_gate_locked",
      buildReady("blocked_bridge_gate_locked", {
        disabledRunnerReport: avanzaDisabledLocalDevBridgeRunnerFixtures.find(
          (item) => item.fixtureId === "bridge_gate_locked",
        )?.report,
      }),
    ),
    fixture(
      "smoke_invocation_forbidden",
      "Smoke invocation forbidden",
      "blocked_smoke_invocation_forbidden",
      buildReady("smoke_invocation_forbidden", {
        mode: "invocation_forbidden",
      }),
    ),
    fixture(
      "terminal_script_invocation_forbidden",
      "Terminal script invocation forbidden",
      "blocked_bridge_gate_locked",
      buildReady("terminal_script_invocation_forbidden", {
        disabledRunnerReport: avanzaDisabledLocalDevBridgeRunnerFixtures.find(
          (item) => item.fixtureId === "terminal_script_invocation_forbidden",
        )?.report,
      }),
    ),
    fixture(
      "browser_automation_forbidden",
      "Browser automation forbidden",
      "model_dry_run_ready",
      buildReady("browser_automation_forbidden"),
    ),
    fixture(
      "credential_access_forbidden",
      "Credential access forbidden",
      "model_dry_run_ready",
      buildReady("credential_access_forbidden"),
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "model_dry_run_ready",
      buildReady("cookies_session_forbidden"),
    ),
    fixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "model_dry_run_ready",
      buildReady("bankid_automation_forbidden"),
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "model_dry_run_ready",
      buildReady("order_submission_forbidden"),
    ),
    fixture(
      "final_kop_salj_human_only",
      "Final KOP/SALJ human-only",
      "model_dry_run_ready",
      buildReady("final_kop_salj_human_only"),
    ),
    fixture(
      "supabase_write_forbidden",
      "Supabase write forbidden",
      "model_dry_run_ready",
      buildReady("supabase_write_forbidden"),
    ),
    fixture(
      "dry_run_completed_to_invocation_boundary",
      "Dry run completed to invocation boundary",
      "model_dry_run_ready",
      buildReady("dry_run_completed_to_invocation_boundary"),
    ),
  ];
