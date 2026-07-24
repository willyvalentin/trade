import {
  buildAvanzaHeadlessExecutionArchitectureCheckpoint,
  type AvanzaHeadlessExecutionArchitectureCheckpoint,
  type AvanzaHeadlessExecutionArchitectureCheckpointStatus,
} from "./avanza-headless-execution-architecture-checkpoint";

export type AvanzaHeadlessExecutionArchitectureCheckpointFixtureId =
  | "full_headless_architecture_ready_for_review"
  | "ready_for_local_dev_bridge_design"
  | "blocked_for_real_execution"
  | "blocked_for_production"
  | "ui_simplicity_gate_locked"
  | "trade_ui_execution_gate_locked"
  | "api_route_execution_gate_locked"
  | "local_dev_bridge_gate_ready_for_manual_review"
  | "browser_automation_gate_locked"
  | "credential_access_gate_locked"
  | "cookies_session_forbidden"
  | "bankid_automation_forbidden"
  | "order_submit_forbidden"
  | "final_kop_salj_human_only"
  | "supabase_write_locked"
  | "settlement_write_locked"
  | "production_readiness_blocked";

export type AvanzaHeadlessExecutionArchitectureCheckpointFixture = {
  fixtureId: AvanzaHeadlessExecutionArchitectureCheckpointFixtureId;
  label: string;
  expectedStatus: AvanzaHeadlessExecutionArchitectureCheckpointStatus;
  checkpoint: AvanzaHeadlessExecutionArchitectureCheckpoint;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

function build(
  fixtureId: AvanzaHeadlessExecutionArchitectureCheckpointFixtureId,
  status: AvanzaHeadlessExecutionArchitectureCheckpointStatus,
  overrides: Parameters<typeof buildAvanzaHeadlessExecutionArchitectureCheckpoint>[0] = {},
) {
  return buildAvanzaHeadlessExecutionArchitectureCheckpoint({
    checkpointId: fixtureId,
    now: fixtureNow,
    status,
    ...overrides,
  });
}

function fixture(
  fixtureId: AvanzaHeadlessExecutionArchitectureCheckpointFixtureId,
  label: string,
  expectedStatus: AvanzaHeadlessExecutionArchitectureCheckpointStatus,
  checkpoint: AvanzaHeadlessExecutionArchitectureCheckpoint,
): AvanzaHeadlessExecutionArchitectureCheckpointFixture {
  return { checkpoint, expectedStatus, fixtureId, label };
}

export const avanzaHeadlessExecutionArchitectureCheckpointFixtures:
  AvanzaHeadlessExecutionArchitectureCheckpointFixture[] = [
    fixture(
      "full_headless_architecture_ready_for_review",
      "Full headless architecture ready for review",
      "ready_for_review",
      build("full_headless_architecture_ready_for_review", "ready_for_review"),
    ),
    fixture(
      "ready_for_local_dev_bridge_design",
      "Ready for local-dev bridge design",
      "ready_for_local_dev_bridge_design",
      build("ready_for_local_dev_bridge_design", "ready_for_local_dev_bridge_design"),
    ),
    fixture(
      "blocked_for_real_execution",
      "Blocked for real execution",
      "blocked_for_real_execution",
      build("blocked_for_real_execution", "blocked_for_real_execution"),
    ),
    fixture(
      "blocked_for_production",
      "Blocked for production",
      "blocked_for_production",
      build("blocked_for_production", "blocked_for_production"),
    ),
    fixture(
      "ui_simplicity_gate_locked",
      "UI simplicity gate locked",
      "ready_for_review",
      build("ui_simplicity_gate_locked", "ready_for_review"),
    ),
    fixture(
      "trade_ui_execution_gate_locked",
      "Trade UI execution gate locked",
      "ready_for_review",
      build("trade_ui_execution_gate_locked", "ready_for_review"),
    ),
    fixture(
      "api_route_execution_gate_locked",
      "API route execution gate locked",
      "ready_for_review",
      build("api_route_execution_gate_locked", "ready_for_review"),
    ),
    fixture(
      "local_dev_bridge_gate_ready_for_manual_review",
      "Local-dev bridge gate ready for manual review",
      "ready_for_review",
      build("local_dev_bridge_gate_ready_for_manual_review", "ready_for_review", {
        localDevBridgeGateStatus: "ready_for_manual_review",
      }),
    ),
    fixture(
      "browser_automation_gate_locked",
      "Browser automation gate locked",
      "ready_for_review",
      build("browser_automation_gate_locked", "ready_for_review"),
    ),
    fixture(
      "credential_access_gate_locked",
      "Credential access gate locked",
      "ready_for_review",
      build("credential_access_gate_locked", "ready_for_review"),
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "ready_for_review",
      build("cookies_session_forbidden", "ready_for_review"),
    ),
    fixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "ready_for_review",
      build("bankid_automation_forbidden", "ready_for_review"),
    ),
    fixture(
      "order_submit_forbidden",
      "Order submit forbidden",
      "ready_for_review",
      build("order_submit_forbidden", "ready_for_review"),
    ),
    fixture(
      "final_kop_salj_human_only",
      "Final KOP/SALJ human-only",
      "ready_for_review",
      build("final_kop_salj_human_only", "ready_for_review"),
    ),
    fixture(
      "supabase_write_locked",
      "Supabase write locked",
      "ready_for_review",
      build("supabase_write_locked", "ready_for_review"),
    ),
    fixture(
      "settlement_write_locked",
      "Settlement write locked",
      "ready_for_review",
      build("settlement_write_locked", "ready_for_review"),
    ),
    fixture(
      "production_readiness_blocked",
      "Production readiness blocked",
      "blocked_for_production",
      build("production_readiness_blocked", "blocked_for_production"),
    ),
  ];
