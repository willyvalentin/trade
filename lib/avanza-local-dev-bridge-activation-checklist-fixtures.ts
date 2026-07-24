import {
  buildAvanzaLocalDevBridgeActivationChecklist,
  type AvanzaLocalDevBridgeActivationChecklist,
  type AvanzaLocalDevBridgeActivationChecklistStatus,
} from "./avanza-local-dev-bridge-activation-checklist";
import {
  avanzaHeadlessExecutionArchitectureCheckpointFixtures,
} from "./avanza-headless-execution-architecture-checkpoint-fixtures";
import {
  avanzaLocalDevBridgeContractFixtures,
} from "./avanza-local-dev-bridge-contract-fixtures";

export type AvanzaLocalDevBridgeActivationChecklistFixtureId =
  | "ready_for_manual_review"
  | "approved_for_disabled_runner_design"
  | "blocked_missing_operator_review"
  | "blocked_missing_safety_review"
  | "blocked_missing_credential_provider_review"
  | "blocked_missing_bankid_policy_review"
  | "blocked_missing_final_click_policy_review"
  | "blocked_missing_order_submit_policy_review"
  | "blocked_missing_supabase_write_policy_review"
  | "blocked_for_real_execution"
  | "real_run_forbidden"
  | "model_only_dry_run_not_yet_approved"
  | "bridge_gate_still_locked"
  | "smoke_runner_invocation_blocked"
  | "terminal_only_future_path_confirmed"
  | "ui_simplicity_protected"
  | "production_readiness_blocked";

export type AvanzaLocalDevBridgeActivationChecklistFixture = {
  fixtureId: AvanzaLocalDevBridgeActivationChecklistFixtureId;
  label: string;
  expectedStatus: AvanzaLocalDevBridgeActivationChecklistStatus;
  checklist: AvanzaLocalDevBridgeActivationChecklist;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const readyBridgeContract = avanzaLocalDevBridgeContractFixtures.find(
  (fixture) => fixture.fixtureId === "draft_ready_recommendation_buy_orchestration",
)?.contract;
const readyArchitectureCheckpoint =
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

const approvedReviews = {
  bankIdPolicyReviewed: true,
  cookieSessionPolicyReviewed: true,
  credentialProviderReviewed: true,
  disabledRunnerDesignRequested: true,
  finalClickPolicyReviewed: true,
  operatorReviewed: true,
  orderSubmitPolicyReviewed: true,
  safetyReviewed: true,
  supabaseWritePolicyReviewed: true,
} as const;

const documentedFutureGates = {
  envOptInDocumented: true,
  manualTerminalConfirmationDocumented: true,
  realRunFlagDocumented: true,
} as const;

function fixture(
  fixtureId: AvanzaLocalDevBridgeActivationChecklistFixtureId,
  label: string,
  expectedStatus: AvanzaLocalDevBridgeActivationChecklistStatus,
  checklist: AvanzaLocalDevBridgeActivationChecklist,
): AvanzaLocalDevBridgeActivationChecklistFixture {
  return { checklist, expectedStatus, fixtureId, label };
}

function build(
  checklistId: AvanzaLocalDevBridgeActivationChecklistFixtureId,
  overrides: Parameters<typeof buildAvanzaLocalDevBridgeActivationChecklist>[0] = {},
) {
  return buildAvanzaLocalDevBridgeActivationChecklist({
    architectureCheckpoint: readyArchitectureCheckpoint,
    bridgeContract: readyBridgeContract,
    checklistId,
    now: fixtureNow,
    ...documentedFutureGates,
    ...overrides,
  });
}

function buildApproved(
  checklistId: AvanzaLocalDevBridgeActivationChecklistFixtureId,
  overrides: Parameters<typeof buildAvanzaLocalDevBridgeActivationChecklist>[0] = {},
) {
  return build(checklistId, {
    ...approvedReviews,
    ...overrides,
  });
}

export const avanzaLocalDevBridgeActivationChecklistFixtures:
  AvanzaLocalDevBridgeActivationChecklistFixture[] = [
    fixture(
      "ready_for_manual_review",
      "Ready for manual review",
      "ready_for_manual_review",
      build("ready_for_manual_review"),
    ),
    fixture(
      "approved_for_disabled_runner_design",
      "Approved for disabled runner design",
      "approved_for_disabled_runner_design",
      buildApproved("approved_for_disabled_runner_design"),
    ),
    fixture(
      "blocked_missing_operator_review",
      "Blocked missing operator review",
      "ready_for_manual_review",
      buildApproved("blocked_missing_operator_review", {
        operatorReviewed: false,
      }),
    ),
    fixture(
      "blocked_missing_safety_review",
      "Blocked missing safety review",
      "ready_for_manual_review",
      buildApproved("blocked_missing_safety_review", {
        safetyReviewed: false,
      }),
    ),
    fixture(
      "blocked_missing_credential_provider_review",
      "Blocked missing credential provider review",
      "ready_for_manual_review",
      buildApproved("blocked_missing_credential_provider_review", {
        credentialProviderReviewed: false,
      }),
    ),
    fixture(
      "blocked_missing_bankid_policy_review",
      "Blocked missing BankID policy review",
      "ready_for_manual_review",
      buildApproved("blocked_missing_bankid_policy_review", {
        bankIdPolicyReviewed: false,
      }),
    ),
    fixture(
      "blocked_missing_final_click_policy_review",
      "Blocked missing final click policy review",
      "ready_for_manual_review",
      buildApproved("blocked_missing_final_click_policy_review", {
        finalClickPolicyReviewed: false,
      }),
    ),
    fixture(
      "blocked_missing_order_submit_policy_review",
      "Blocked missing order submit policy review",
      "ready_for_manual_review",
      buildApproved("blocked_missing_order_submit_policy_review", {
        orderSubmitPolicyReviewed: false,
      }),
    ),
    fixture(
      "blocked_missing_supabase_write_policy_review",
      "Blocked missing Supabase write policy review",
      "ready_for_manual_review",
      buildApproved("blocked_missing_supabase_write_policy_review", {
        supabaseWritePolicyReviewed: false,
      }),
    ),
    fixture(
      "blocked_for_real_execution",
      "Blocked for real execution",
      "blocked_for_real_execution",
      buildApproved("blocked_for_real_execution", {
        architectureCheckpoint: realExecutionBlockedArchitectureCheckpoint,
      }),
    ),
    fixture(
      "real_run_forbidden",
      "Real run forbidden",
      "blocked_for_real_execution",
      buildApproved("real_run_forbidden", {
        architectureCheckpoint: realExecutionBlockedArchitectureCheckpoint,
      }),
    ),
    fixture(
      "model_only_dry_run_not_yet_approved",
      "Model-only dry-run not yet approved",
      "ready_for_manual_review",
      build("model_only_dry_run_not_yet_approved"),
    ),
    fixture(
      "bridge_gate_still_locked",
      "Bridge gate still locked",
      "ready_for_manual_review",
      build("bridge_gate_still_locked"),
    ),
    fixture(
      "smoke_runner_invocation_blocked",
      "Smoke runner invocation blocked",
      "ready_for_manual_review",
      build("smoke_runner_invocation_blocked"),
    ),
    fixture(
      "terminal_only_future_path_confirmed",
      "Terminal-only future path confirmed",
      "ready_for_manual_review",
      build("terminal_only_future_path_confirmed"),
    ),
    fixture(
      "ui_simplicity_protected",
      "UI simplicity protected",
      "ready_for_manual_review",
      build("ui_simplicity_protected"),
    ),
    fixture(
      "production_readiness_blocked",
      "Production readiness blocked",
      "forbidden",
      buildApproved("production_readiness_blocked", {
        architectureCheckpoint: productionBlockedArchitectureCheckpoint,
      }),
    ),
  ];
