import {
  avanzaDisabledLocalDevBridgeRunnerFixtures,
} from "./avanza-disabled-local-dev-bridge-runner-fixtures";
import {
  avanzaHeadlessExecutionArchitectureCheckpointFixtures,
} from "./avanza-headless-execution-architecture-checkpoint-fixtures";
import {
  avanzaLocalDevBridgeActivationChecklistFixtures,
} from "./avanza-local-dev-bridge-activation-checklist-fixtures";
import {
  avanzaLocalDevBridgeContractFixtures,
} from "./avanza-local-dev-bridge-contract-fixtures";
import {
  buildAvanzaLocalDevBridgeReadinessCheckpoint,
  type AvanzaLocalDevBridgeReadinessCheckpoint,
  type AvanzaLocalDevBridgeReadinessCheckpointStatus,
} from "./avanza-local-dev-bridge-readiness-checkpoint";
import {
  avanzaModelOnlyLocalDevBridgeDryRunFixtures,
} from "./avanza-model-only-local-dev-bridge-dry-runner-fixtures";

export type AvanzaLocalDevBridgeReadinessCheckpointFixtureId =
  | "ready_for_model_only_boundary_review"
  | "blocked_at_invocation_boundary"
  | "blocked_for_runtime_invocation"
  | "blocked_for_real_execution"
  | "blocked_for_production"
  | "bridge_contract_ready"
  | "activation_checklist_ready"
  | "disabled_runner_skeleton_ready"
  | "model_only_dry_run_ready"
  | "smoke_runner_invocation_blocked"
  | "terminal_script_invocation_blocked"
  | "browser_automation_locked"
  | "credential_access_locked"
  | "cookies_session_forbidden"
  | "bankid_automation_forbidden"
  | "order_submission_forbidden"
  | "final_kop_salj_human_only"
  | "supabase_write_locked"
  | "trade_ui_active_handoff_forbidden"
  | "api_route_activation_forbidden"
  | "production_readiness_blocked";

export type AvanzaLocalDevBridgeReadinessCheckpointFixture = {
  fixtureId: AvanzaLocalDevBridgeReadinessCheckpointFixtureId;
  label: string;
  expectedStatus: AvanzaLocalDevBridgeReadinessCheckpointStatus;
  checkpoint: AvanzaLocalDevBridgeReadinessCheckpoint;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const bridgeContract = avanzaLocalDevBridgeContractFixtures.find(
  (fixture) => fixture.fixtureId === "draft_ready_recommendation_buy_orchestration",
)?.contract;
const activationChecklist = avanzaLocalDevBridgeActivationChecklistFixtures.find(
  (fixture) => fixture.fixtureId === "approved_for_disabled_runner_design",
)?.checklist;
const disabledRunnerReport = avanzaDisabledLocalDevBridgeRunnerFixtures.find(
  (fixture) => fixture.fixtureId === "ready_disabled_report",
)?.report;
const dryRunReport = avanzaModelOnlyLocalDevBridgeDryRunFixtures.find(
  (fixture) => fixture.fixtureId === "dry_run_completed_to_invocation_boundary",
)?.report;
const invocationForbiddenDryRunReport =
  avanzaModelOnlyLocalDevBridgeDryRunFixtures.find(
    (fixture) => fixture.fixtureId === "smoke_invocation_forbidden",
  )?.report;
const architectureCheckpoint =
  avanzaHeadlessExecutionArchitectureCheckpointFixtures.find(
    (fixture) => fixture.fixtureId === "full_headless_architecture_ready_for_review",
  )?.checkpoint;
const realExecutionBlockedArchitectureCheckpoint =
  avanzaHeadlessExecutionArchitectureCheckpointFixtures.find(
    (fixture) => fixture.fixtureId === "blocked_for_real_execution",
  )?.checkpoint;
const productionBlockedArchitectureCheckpoint =
  avanzaHeadlessExecutionArchitectureCheckpointFixtures.find(
    (fixture) => fixture.fixtureId === "blocked_for_production",
  )?.checkpoint;

const readyInputs = {
  activationChecklist,
  architectureCheckpoint,
  bridgeContract,
  disabledRunnerReport,
  dryRunReport,
  now: fixtureNow,
};

function fixture(
  fixtureId: AvanzaLocalDevBridgeReadinessCheckpointFixtureId,
  label: string,
  expectedStatus: AvanzaLocalDevBridgeReadinessCheckpointStatus,
  checkpoint: AvanzaLocalDevBridgeReadinessCheckpoint,
): AvanzaLocalDevBridgeReadinessCheckpointFixture {
  return { checkpoint, expectedStatus, fixtureId, label };
}

function build(
  checkpointId: AvanzaLocalDevBridgeReadinessCheckpointFixtureId,
  overrides: Parameters<typeof buildAvanzaLocalDevBridgeReadinessCheckpoint>[0] = {},
) {
  return buildAvanzaLocalDevBridgeReadinessCheckpoint({
    checkpointId,
    ...readyInputs,
    ...overrides,
  });
}

export const avanzaLocalDevBridgeReadinessCheckpointFixtures:
  AvanzaLocalDevBridgeReadinessCheckpointFixture[] = [
    fixture(
      "ready_for_model_only_boundary_review",
      "Ready for model-only boundary review",
      "ready_for_model_only_boundary_review",
      build("ready_for_model_only_boundary_review", {
        operatorReviewed: true,
        safetyReviewed: true,
      }),
    ),
    fixture(
      "blocked_at_invocation_boundary",
      "Blocked at invocation boundary",
      "blocked_at_invocation_boundary",
      build("blocked_at_invocation_boundary"),
    ),
    fixture(
      "blocked_for_runtime_invocation",
      "Blocked for runtime invocation",
      "blocked_for_runtime_invocation",
      build("blocked_for_runtime_invocation", {
        dryRunReport: invocationForbiddenDryRunReport,
      }),
    ),
    fixture(
      "blocked_for_real_execution",
      "Blocked for real execution",
      "blocked_for_real_execution",
      build("blocked_for_real_execution", {
        architectureCheckpoint: realExecutionBlockedArchitectureCheckpoint,
      }),
    ),
    fixture(
      "blocked_for_production",
      "Blocked for production",
      "blocked_for_production",
      build("blocked_for_production", {
        architectureCheckpoint: productionBlockedArchitectureCheckpoint,
      }),
    ),
    fixture(
      "bridge_contract_ready",
      "Bridge contract ready",
      "blocked_at_invocation_boundary",
      build("bridge_contract_ready"),
    ),
    fixture(
      "activation_checklist_ready",
      "Activation checklist ready",
      "blocked_at_invocation_boundary",
      build("activation_checklist_ready"),
    ),
    fixture(
      "disabled_runner_skeleton_ready",
      "Disabled runner skeleton ready",
      "blocked_at_invocation_boundary",
      build("disabled_runner_skeleton_ready"),
    ),
    fixture(
      "model_only_dry_run_ready",
      "Model-only dry-run ready",
      "blocked_at_invocation_boundary",
      build("model_only_dry_run_ready"),
    ),
    fixture(
      "smoke_runner_invocation_blocked",
      "Smoke runner invocation blocked",
      "blocked_at_invocation_boundary",
      build("smoke_runner_invocation_blocked"),
    ),
    fixture(
      "terminal_script_invocation_blocked",
      "Terminal script invocation blocked",
      "blocked_at_invocation_boundary",
      build("terminal_script_invocation_blocked"),
    ),
    fixture(
      "browser_automation_locked",
      "Browser automation locked",
      "blocked_at_invocation_boundary",
      build("browser_automation_locked"),
    ),
    fixture(
      "credential_access_locked",
      "Credential access locked",
      "blocked_at_invocation_boundary",
      build("credential_access_locked"),
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "blocked_at_invocation_boundary",
      build("cookies_session_forbidden"),
    ),
    fixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "blocked_at_invocation_boundary",
      build("bankid_automation_forbidden"),
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "blocked_at_invocation_boundary",
      build("order_submission_forbidden"),
    ),
    fixture(
      "final_kop_salj_human_only",
      "Final KOP/SALJ human-only",
      "blocked_at_invocation_boundary",
      build("final_kop_salj_human_only"),
    ),
    fixture(
      "supabase_write_locked",
      "Supabase write locked",
      "blocked_at_invocation_boundary",
      build("supabase_write_locked"),
    ),
    fixture(
      "trade_ui_active_handoff_forbidden",
      "Trade UI active handoff forbidden",
      "blocked_at_invocation_boundary",
      build("trade_ui_active_handoff_forbidden"),
    ),
    fixture(
      "api_route_activation_forbidden",
      "API route activation forbidden",
      "blocked_at_invocation_boundary",
      build("api_route_activation_forbidden"),
    ),
    fixture(
      "production_readiness_blocked",
      "Production readiness blocked",
      "blocked_for_production",
      build("production_readiness_blocked", {
        architectureCheckpoint: productionBlockedArchitectureCheckpoint,
      }),
    ),
  ];
