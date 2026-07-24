import {
  buildAvanzaLocalDevBridgeContract,
  type AvanzaLocalDevBridgeContract,
  type AvanzaLocalDevBridgeContractStatus,
} from "./avanza-local-dev-bridge-contract";
import {
  avanzaHeadlessExecutionOrchestrationPipelineFixtures,
} from "./avanza-headless-execution-orchestration-pipeline-fixtures";

export type AvanzaLocalDevBridgeContractFixtureId =
  | "draft_ready_recommendation_buy_orchestration"
  | "draft_ready_live_position_sell_orchestration"
  | "blocked_missing_orchestration"
  | "blocked_orchestration_not_ready"
  | "blocked_local_dev_bridge_gate_locked"
  | "combined_login_then_order_request_candidate"
  | "login_smoke_request_candidate"
  | "order_chain_smoke_request_candidate"
  | "env_opt_in_missing"
  | "manual_terminal_confirmation_missing"
  | "real_run_flag_missing"
  | "browser_automation_gate_locked"
  | "credential_gate_locked"
  | "cookies_session_forbidden"
  | "bankid_automation_forbidden"
  | "order_submit_forbidden"
  | "final_kop_salj_human_only"
  | "supabase_write_locked"
  | "no_smoke_runner_invocation";

export type AvanzaLocalDevBridgeContractFixture = {
  fixtureId: AvanzaLocalDevBridgeContractFixtureId;
  label: string;
  expectedStatus: AvanzaLocalDevBridgeContractStatus;
  contract: AvanzaLocalDevBridgeContract;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const recommendationBuyReport =
  avanzaHeadlessExecutionOrchestrationPipelineFixtures.find(
    (fixture) => fixture.fixtureId === "recommendation_buy_orchestration_ready",
  )?.report;
const livePositionSellReport =
  avanzaHeadlessExecutionOrchestrationPipelineFixtures.find(
    (fixture) => fixture.fixtureId === "live_position_sell_orchestration_ready",
  )?.report;
const blockedReport = avanzaHeadlessExecutionOrchestrationPipelineFixtures.find(
  (fixture) => fixture.fixtureId === "no_candidates",
)?.report;

function fixture(
  fixtureId: AvanzaLocalDevBridgeContractFixtureId,
  label: string,
  expectedStatus: AvanzaLocalDevBridgeContractStatus,
  contract: AvanzaLocalDevBridgeContract,
): AvanzaLocalDevBridgeContractFixture {
  return { contract, expectedStatus, fixtureId, label };
}

function build(
  fixtureId: AvanzaLocalDevBridgeContractFixtureId,
  overrides: Parameters<typeof buildAvanzaLocalDevBridgeContract>[0] = {},
) {
  return buildAvanzaLocalDevBridgeContract({
    bridgeContractId: fixtureId,
    explicitOperatorApprovalPresent: false,
    localDevOnly: true,
    manualTerminalConfirmationPresent: false,
    now: fixtureNow,
    orchestrationReport: recommendationBuyReport,
    requestKind: "order_chain_smoke",
    ...overrides,
  });
}

export const avanzaLocalDevBridgeContractFixtures:
  AvanzaLocalDevBridgeContractFixture[] = [
    fixture(
      "draft_ready_recommendation_buy_orchestration",
      "Draft ready from recommendation BUY orchestration",
      "draft_ready",
      build("draft_ready_recommendation_buy_orchestration"),
    ),
    fixture(
      "draft_ready_live_position_sell_orchestration",
      "Draft ready from live-position SELL orchestration",
      "draft_ready",
      build("draft_ready_live_position_sell_orchestration", {
        orchestrationReport: livePositionSellReport,
      }),
    ),
    fixture(
      "blocked_missing_orchestration",
      "Blocked missing orchestration",
      "blocked_missing_orchestration",
      build("blocked_missing_orchestration", { orchestrationReport: undefined }),
    ),
    fixture(
      "blocked_orchestration_not_ready",
      "Blocked orchestration not ready",
      "blocked_orchestration_not_ready",
      build("blocked_orchestration_not_ready", {
        orchestrationReport: blockedReport,
      }),
    ),
    fixture(
      "blocked_local_dev_bridge_gate_locked",
      "Blocked local-dev bridge gate locked",
      "blocked_gate_locked",
      build("blocked_local_dev_bridge_gate_locked", { localDevOnly: false }),
    ),
    fixture(
      "combined_login_then_order_request_candidate",
      "Combined login then order request candidate",
      "draft_ready",
      build("combined_login_then_order_request_candidate", {
        requestKind: "combined_login_then_order",
      }),
    ),
    fixture(
      "login_smoke_request_candidate",
      "Login smoke request candidate",
      "draft_ready",
      build("login_smoke_request_candidate", { requestKind: "login_smoke" }),
    ),
    fixture(
      "order_chain_smoke_request_candidate",
      "Order chain smoke request candidate",
      "draft_ready",
      build("order_chain_smoke_request_candidate", {
        requestKind: "order_chain_smoke",
      }),
    ),
    fixture(
      "env_opt_in_missing",
      "Env opt-in missing",
      "draft_ready",
      build("env_opt_in_missing", { envOptInPresent: false }),
    ),
    fixture(
      "manual_terminal_confirmation_missing",
      "Manual terminal confirmation missing",
      "draft_ready",
      build("manual_terminal_confirmation_missing", {
        manualTerminalConfirmationPresent: false,
      }),
    ),
    fixture(
      "real_run_flag_missing",
      "Real-run flag missing",
      "draft_ready",
      build("real_run_flag_missing", { realRunFlagPresent: false }),
    ),
    fixture(
      "browser_automation_gate_locked",
      "Browser automation gate locked",
      "draft_ready",
      build("browser_automation_gate_locked"),
    ),
    fixture(
      "credential_gate_locked",
      "Credential gate locked",
      "draft_ready",
      build("credential_gate_locked"),
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "draft_ready",
      build("cookies_session_forbidden"),
    ),
    fixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "draft_ready",
      build("bankid_automation_forbidden"),
    ),
    fixture(
      "order_submit_forbidden",
      "Order submit forbidden",
      "draft_ready",
      build("order_submit_forbidden"),
    ),
    fixture(
      "final_kop_salj_human_only",
      "Final KOP/SALJ human-only",
      "draft_ready",
      build("final_kop_salj_human_only"),
    ),
    fixture(
      "supabase_write_locked",
      "Supabase write locked",
      "draft_ready",
      build("supabase_write_locked"),
    ),
    fixture(
      "no_smoke_runner_invocation",
      "No smoke runner invocation",
      "draft_ready",
      build("no_smoke_runner_invocation"),
    ),
  ];
