import {
  buildAvanzaSharpSemiAutoExecutionPhaseCheckpoint,
  type AvanzaSharpSemiAutoExecutionPhaseCheckpoint,
  type AvanzaSharpSemiAutoExecutionPhaseStatus,
} from "./avanza-sharp-semi-auto-execution-phase-checkpoint";

export type AvanzaSharpSemiAutoExecutionPhaseCheckpointFixtureId =
  | "phase_complete"
  | "ready_for_roadmap_review"
  | "ready_for_manual_local_dev_test_planning"
  | "ready_for_additional_model_only_design"
  | "blocked_for_runtime"
  | "blocked_for_production"
  | "manual_local_dev_test_runbook_allowed"
  | "additional_model_only_validation_allowed"
  | "settlement_model_checkpoint_allowed"
  | "safety_audit_allowed"
  | "runtime_invocation_forbidden"
  | "production_forbidden"
  | "visual_trade_ui_expansion_not_recommended"
  | "active_handoff_not_recommended"
  | "smoke_runner_invocation_forbidden"
  | "browser_automation_locked"
  | "credential_access_locked"
  | "cookies_session_forbidden"
  | "final_kop_salj_human_only";

export type AvanzaSharpSemiAutoExecutionPhaseCheckpointFixture = {
  fixtureId: AvanzaSharpSemiAutoExecutionPhaseCheckpointFixtureId;
  label: string;
  expectedStatus: AvanzaSharpSemiAutoExecutionPhaseStatus;
  checkpoint: AvanzaSharpSemiAutoExecutionPhaseCheckpoint;
};

const fixtureNow = "2026-07-07T12:00:00.000Z";

function build(
  checkpointId: AvanzaSharpSemiAutoExecutionPhaseCheckpointFixtureId,
  overrides: Parameters<typeof buildAvanzaSharpSemiAutoExecutionPhaseCheckpoint>[0] = {},
) {
  return buildAvanzaSharpSemiAutoExecutionPhaseCheckpoint({
    checkpointId,
    includeRoadmap: true,
    now: fixtureNow,
    ...overrides,
  });
}

function fixture(
  fixtureId: AvanzaSharpSemiAutoExecutionPhaseCheckpointFixtureId,
  label: string,
  expectedStatus: AvanzaSharpSemiAutoExecutionPhaseStatus,
  checkpoint: AvanzaSharpSemiAutoExecutionPhaseCheckpoint,
): AvanzaSharpSemiAutoExecutionPhaseCheckpointFixture {
  return { checkpoint, expectedStatus, fixtureId, label };
}

export const avanzaSharpSemiAutoExecutionPhaseCheckpointFixtures:
  AvanzaSharpSemiAutoExecutionPhaseCheckpointFixture[] = [
    fixture(
      "phase_complete",
      "Phase complete",
      "phase_complete",
      build("phase_complete"),
    ),
    fixture(
      "ready_for_roadmap_review",
      "Ready for roadmap review",
      "ready_for_roadmap_review",
      build("ready_for_roadmap_review", { roadmapReviewRequested: true }),
    ),
    fixture(
      "ready_for_manual_local_dev_test_planning",
      "Ready for manual local-dev test planning",
      "ready_for_manual_local_dev_test_planning",
      build("ready_for_manual_local_dev_test_planning", {
        preferredNextWorkstream: "manual_local_dev_test_runbook",
      }),
    ),
    fixture(
      "ready_for_additional_model_only_design",
      "Ready for additional model-only design",
      "ready_for_additional_model_only_design",
      build("ready_for_additional_model_only_design", {
        preferredNextWorkstream: "additional_model_only_validation",
      }),
    ),
    fixture(
      "blocked_for_runtime",
      "Blocked for runtime",
      "blocked_for_runtime",
      build("blocked_for_runtime", { runtimeRequested: true }),
    ),
    fixture(
      "blocked_for_production",
      "Blocked for production",
      "blocked_for_production",
      build("blocked_for_production", { productionRequested: true }),
    ),
    fixture(
      "manual_local_dev_test_runbook_allowed",
      "Manual local-dev test runbook allowed",
      "ready_for_manual_local_dev_test_planning",
      build("manual_local_dev_test_runbook_allowed", {
        preferredNextWorkstream: "manual_local_dev_test_runbook",
      }),
    ),
    fixture(
      "additional_model_only_validation_allowed",
      "Additional model-only validation allowed",
      "ready_for_additional_model_only_design",
      build("additional_model_only_validation_allowed", {
        preferredNextWorkstream: "additional_model_only_validation",
      }),
    ),
    fixture(
      "settlement_model_checkpoint_allowed",
      "Settlement model checkpoint allowed",
      "ready_for_additional_model_only_design",
      build("settlement_model_checkpoint_allowed", {
        preferredNextWorkstream: "settlement_model_checkpoint",
      }),
    ),
    fixture(
      "safety_audit_allowed",
      "Safety audit allowed",
      "ready_for_additional_model_only_design",
      build("safety_audit_allowed", {
        preferredNextWorkstream: "safety_audit",
      }),
    ),
    fixture(
      "runtime_invocation_forbidden",
      "Runtime invocation forbidden",
      "blocked_for_runtime",
      build("runtime_invocation_forbidden", { runtimeRequested: true }),
    ),
    fixture(
      "production_forbidden",
      "Production forbidden",
      "blocked_for_production",
      build("production_forbidden", { productionRequested: true }),
    ),
    fixture(
      "visual_trade_ui_expansion_not_recommended",
      "Visual Trade UI expansion not recommended",
      "ready_for_roadmap_review",
      build("visual_trade_ui_expansion_not_recommended", {
        roadmapReviewRequested: true,
      }),
    ),
    fixture(
      "active_handoff_not_recommended",
      "Active handoff not recommended",
      "ready_for_roadmap_review",
      build("active_handoff_not_recommended", {
        roadmapReviewRequested: true,
      }),
    ),
    fixture(
      "smoke_runner_invocation_forbidden",
      "Smoke runner invocation forbidden",
      "ready_for_roadmap_review",
      build("smoke_runner_invocation_forbidden", {
        roadmapReviewRequested: true,
      }),
    ),
    fixture(
      "browser_automation_locked",
      "Browser automation locked",
      "ready_for_roadmap_review",
      build("browser_automation_locked", { roadmapReviewRequested: true }),
    ),
    fixture(
      "credential_access_locked",
      "Credential access locked",
      "ready_for_roadmap_review",
      build("credential_access_locked", { roadmapReviewRequested: true }),
    ),
    fixture(
      "cookies_session_forbidden",
      "Cookies/session forbidden",
      "ready_for_roadmap_review",
      build("cookies_session_forbidden", { roadmapReviewRequested: true }),
    ),
    fixture(
      "final_kop_salj_human_only",
      "Final KOP/SALJ human-only",
      "ready_for_roadmap_review",
      build("final_kop_salj_human_only", { roadmapReviewRequested: true }),
    ),
  ];
