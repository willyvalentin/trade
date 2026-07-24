import {
  avanzaDisabledLocalDevBridgeRunnerFixtures,
} from "./avanza-disabled-local-dev-bridge-runner-fixtures";
import {
  avanzaLocalDevBridgeActivationChecklistFixtures,
} from "./avanza-local-dev-bridge-activation-checklist-fixtures";
import {
  avanzaLocalDevBridgeReadinessCheckpointFixtures,
} from "./avanza-local-dev-bridge-readiness-checkpoint-fixtures";
import {
  buildAvanzaManualLocalDevInvocationApprovalRunbook,
  type AvanzaManualLocalDevInvocationApprovalRunbook,
  type AvanzaManualLocalDevInvocationApprovalRunbookStatus,
} from "./avanza-manual-local-dev-invocation-approval-runbook";
import {
  avanzaModelOnlyLocalDevBridgeDryRunFixtures,
} from "./avanza-model-only-local-dev-bridge-dry-runner-fixtures";

export type AvanzaManualLocalDevInvocationApprovalRunbookFixtureId =
  | "ready_for_manual_review"
  | "approved_for_disabled_invocation_adapter_design"
  | "approved_for_model_only_invocation_adapter_design"
  | "blocked_missing_checkpoint"
  | "blocked_missing_evidence_review"
  | "blocked_missing_safety_review"
  | "runtime_invocation_requested_forbidden"
  | "real_run_requested_forbidden"
  | "production_readiness_requested_forbidden"
  | "unredacted_evidence_forbidden"
  | "bridge_boundary_confirmed"
  | "smoke_invocation_remains_blocked"
  | "terminal_script_invocation_remains_blocked"
  | "browser_automation_locked"
  | "credential_access_locked"
  | "cookies_session_forbidden"
  | "bankid_automation_forbidden"
  | "order_submission_forbidden"
  | "final_kop_salj_human_only"
  | "supabase_writes_locked"
  | "ui_simplicity_protected";

export type AvanzaManualLocalDevInvocationApprovalRunbookFixture = {
  fixtureId: AvanzaManualLocalDevInvocationApprovalRunbookFixtureId;
  label: string;
  expectedStatus: AvanzaManualLocalDevInvocationApprovalRunbookStatus;
  runbook: AvanzaManualLocalDevInvocationApprovalRunbook;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

const bridgeReadinessCheckpoint =
  avanzaLocalDevBridgeReadinessCheckpointFixtures.find(
    (fixture) => fixture.fixtureId === "ready_for_model_only_boundary_review",
  )?.checkpoint;
const modelOnlyDryRunReport =
  avanzaModelOnlyLocalDevBridgeDryRunFixtures.find(
    (fixture) => fixture.fixtureId === "dry_run_completed_to_invocation_boundary",
  )?.report;
const disabledRunnerReport = avanzaDisabledLocalDevBridgeRunnerFixtures.find(
  (fixture) => fixture.fixtureId === "ready_disabled_report",
)?.report;
const activationChecklist = avanzaLocalDevBridgeActivationChecklistFixtures.find(
  (fixture) => fixture.fixtureId === "approved_for_disabled_runner_design",
)?.checklist;

const readyInputs = {
  activationChecklist,
  bridgeReadinessCheckpoint,
  disabledRunnerReport,
  modelOnlyDryRunReport,
  now: fixtureNow,
};

function fixture(
  fixtureId: AvanzaManualLocalDevInvocationApprovalRunbookFixtureId,
  label: string,
  expectedStatus: AvanzaManualLocalDevInvocationApprovalRunbookStatus,
  runbook: AvanzaManualLocalDevInvocationApprovalRunbook,
): AvanzaManualLocalDevInvocationApprovalRunbookFixture {
  return { expectedStatus, fixtureId, label, runbook };
}

function build(
  runbookId: AvanzaManualLocalDevInvocationApprovalRunbookFixtureId,
  overrides: Parameters<typeof buildAvanzaManualLocalDevInvocationApprovalRunbook>[0] = {},
) {
  return buildAvanzaManualLocalDevInvocationApprovalRunbook({
    runbookId,
    ...readyInputs,
    ...overrides,
  });
}

export const avanzaManualLocalDevInvocationApprovalRunbookFixtures:
  AvanzaManualLocalDevInvocationApprovalRunbookFixture[] = [
    fixture(
      "ready_for_manual_review",
      "Ready for manual review",
      "ready_for_manual_review",
      build("ready_for_manual_review"),
    ),
    fixture(
      "approved_for_disabled_invocation_adapter_design",
      "Approved for disabled invocation adapter design",
      "approved_for_invocation_adapter_design",
      build("approved_for_disabled_invocation_adapter_design", {
        evidenceReviewed: true,
        invocationAdapterDesignRequested: true,
        operatorReviewed: true,
        safetyReviewed: true,
      }),
    ),
    fixture(
      "approved_for_model_only_invocation_adapter_design",
      "Approved for model-only invocation adapter design",
      "approved_for_invocation_adapter_design",
      build("approved_for_model_only_invocation_adapter_design", {
        evidenceReviewed: true,
        invocationAdapterDesignRequested: true,
        modelOnlyAdapterDesignRequested: true,
        operatorReviewed: true,
        safetyReviewed: true,
      }),
    ),
    fixture(
      "blocked_missing_checkpoint",
      "Blocked missing checkpoint",
      "blocked_missing_checkpoint",
      build("blocked_missing_checkpoint", {
        bridgeReadinessCheckpoint: undefined,
      }),
    ),
    fixture(
      "blocked_missing_evidence_review",
      "Blocked missing evidence review",
      "blocked_missing_evidence",
      build("blocked_missing_evidence_review", {
        invocationAdapterDesignRequested: true,
        operatorReviewed: true,
        safetyReviewed: true,
      }),
    ),
    fixture(
      "blocked_missing_safety_review",
      "Blocked missing safety review",
      "review_incomplete",
      build("blocked_missing_safety_review", {
        evidenceReviewed: true,
        invocationAdapterDesignRequested: true,
        operatorReviewed: true,
      }),
    ),
    fixture(
      "runtime_invocation_requested_forbidden",
      "Runtime invocation requested forbidden",
      "blocked_safety_risk",
      build("runtime_invocation_requested_forbidden", {
        runtimeInvocationRequested: true,
      }),
    ),
    fixture(
      "real_run_requested_forbidden",
      "Real run requested forbidden",
      "real_run_forbidden",
      build("real_run_requested_forbidden", {
        realRunRequested: true,
      }),
    ),
    fixture(
      "production_readiness_requested_forbidden",
      "Production readiness requested forbidden",
      "production_forbidden",
      build("production_readiness_requested_forbidden", {
        productionReadinessRequested: true,
      }),
    ),
    fixture(
      "unredacted_evidence_forbidden",
      "Unredacted evidence forbidden",
      "blocked_safety_risk",
      build("unredacted_evidence_forbidden", {
        evidence: [
          {
            accepted: true,
            allowedToPersist: false,
            evidenceId: "unredacted-evidence-forbidden",
            forbidden: false,
            kind: "redacted_screenshot",
            label: "Unredacted evidence forbidden",
            mayContainSensitiveData: true,
            redactionRequired: true,
            safeSummary: "Rejected because evidence may contain sensitive data.",
          },
        ],
      }),
    ),
    fixture(
      "bridge_boundary_confirmed",
      "Bridge boundary confirmed",
      "ready_for_manual_review",
      build("bridge_boundary_confirmed"),
    ),
    fixture(
      "smoke_invocation_remains_blocked",
      "Smoke invocation remains blocked",
      "ready_for_manual_review",
      build("smoke_invocation_remains_blocked"),
    ),
    fixture(
      "terminal_script_invocation_remains_blocked",
      "Terminal script invocation remains blocked",
      "ready_for_manual_review",
      build("terminal_script_invocation_remains_blocked"),
    ),
    fixture(
      "browser_automation_locked",
      "Browser automation locked",
      "ready_for_manual_review",
      build("browser_automation_locked"),
    ),
    fixture(
      "credential_access_locked",
      "Credential access locked",
      "ready_for_manual_review",
      build("credential_access_locked"),
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "ready_for_manual_review",
      build("cookies_session_forbidden"),
    ),
    fixture(
      "bankid_automation_forbidden",
      "BankID automation forbidden",
      "ready_for_manual_review",
      build("bankid_automation_forbidden"),
    ),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "ready_for_manual_review",
      build("order_submission_forbidden"),
    ),
    fixture(
      "final_kop_salj_human_only",
      "Final KÖP/SÄLJ human-only",
      "ready_for_manual_review",
      build("final_kop_salj_human_only"),
    ),
    fixture(
      "supabase_writes_locked",
      "Supabase writes locked",
      "ready_for_manual_review",
      build("supabase_writes_locked"),
    ),
    fixture(
      "ui_simplicity_protected",
      "UI simplicity protected",
      "ready_for_manual_review",
      build("ui_simplicity_protected"),
    ),
  ];
