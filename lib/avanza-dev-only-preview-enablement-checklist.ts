import {
  avanzaDevPreviewFlagDefaultConfig,
  avanzaDevPreviewFlagExplicitTestFixtureConfig,
  type AvanzaDevPreviewFlagConfig,
} from "@/lib/avanza-dev-preview-flag-config";
import {
  avanzaHandoffPreviewActiveSourceMode,
  avanzaHandoffPreviewSourceModes,
  type AvanzaHandoffPreviewSourceModeModel,
} from "@/lib/avanza-handoff-preview-source-mode";
import {
  type AvanzaHandoffPreActivationGate,
} from "@/lib/avanza-handoff-pre-activation-gate";
import {
  avanzaGameStopHandoffPreActivationGateFixture,
} from "@/lib/avanza-handoff-package-preview-fixtures";
import {
  avanzaHandoffSafetyBoundarySummary,
  type AvanzaHandoffSafetyBoundarySummary,
} from "@/lib/avanza-handoff-safety-boundary-summary";
import {
  avanzaSelectedRecommendationPreWiringDefaultChecklist,
  avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
  type AvanzaSelectedRecommendationPreWiringChecklist,
} from "@/lib/avanza-selected-recommendation-pre-wiring-checklist";
import {
  avanzaSelectedRecommendationPreviewIntegrationDefaultGuard,
  buildAvanzaSelectedRecommendationPreviewIntegrationGuard,
  type AvanzaSelectedRecommendationPreviewIntegrationGuardDecision,
} from "@/lib/avanza-selected-recommendation-preview-integration-guard";

export type AvanzaDevOnlyPreviewEnablementChecklistStatus =
  | "not_allowed"
  | "candidate_for_dev_preview"
  | "blocked";

export type AvanzaDevOnlyPreviewEnablementChecklistRowStatus =
  | "ready"
  | "blocked"
  | "advisory"
  | "enforced";

export type AvanzaDevOnlyPreviewEnablementChecklistRow = {
  detail: string;
  id: string;
  label: string;
  status: AvanzaDevOnlyPreviewEnablementChecklistRowStatus;
};

export type AvanzaDevOnlyPreviewEnablementChecklist = {
  advisories: string[];
  blockers: string[];
  label: string;
  reason: string;
  rows: AvanzaDevOnlyPreviewEnablementChecklistRow[];
  status: AvanzaDevOnlyPreviewEnablementChecklistStatus;
};

export type BuildAvanzaDevOnlyPreviewEnablementChecklistInput = {
  controlsDisabled?: boolean;
  defaultSourceMode?: AvanzaHandoffPreviewSourceModeModel;
  explicitDevTestFlagRequired?: boolean;
  integrationGuard?: AvanzaSelectedRecommendationPreviewIntegrationGuardDecision;
  preActivationGate?: AvanzaHandoffPreActivationGate;
  previewFlagConfig?: AvanzaDevPreviewFlagConfig;
  preWiringChecklist?: AvanzaSelectedRecommendationPreWiringChecklist;
  proposedSourceMode?: AvanzaHandoffPreviewSourceModeModel;
  safetyBoundarySummary?: AvanzaHandoffSafetyBoundarySummary;
};

const defaultLockedPreActivationGate: AvanzaHandoffPreActivationGate = {
  advisories: ["Total-read unresolved/advisory"],
  blockers: [],
  gateStatus: "locked",
  label: "Pre-activation gate: Locked",
  reasons: [
    "Static fixture source",
    "Selected recommendation preview disabled by default",
  ],
  requiredNextSteps: [
    "Keep controls disabled",
    "Require a separate dev/test preview enablement step",
  ],
  severity: "neutral",
};

function boundaryStatus(
  safetyBoundarySummary: AvanzaHandoffSafetyBoundarySummary,
  id: string,
) {
  return safetyBoundarySummary.boundaries.find((boundary) => boundary.id === id)
    ?.status;
}

function rowLabels(
  rows: AvanzaDevOnlyPreviewEnablementChecklistRow[],
  status: AvanzaDevOnlyPreviewEnablementChecklistRowStatus,
) {
  return rows.filter((row) => row.status === status).map((row) => row.label);
}

export function buildAvanzaDevOnlyPreviewEnablementChecklist({
  controlsDisabled = true,
  defaultSourceMode = avanzaHandoffPreviewActiveSourceMode,
  explicitDevTestFlagRequired = true,
  integrationGuard = avanzaSelectedRecommendationPreviewIntegrationDefaultGuard,
  preActivationGate = defaultLockedPreActivationGate,
  previewFlagConfig = avanzaDevPreviewFlagDefaultConfig,
  preWiringChecklist = avanzaSelectedRecommendationPreWiringDefaultChecklist,
  proposedSourceMode = defaultSourceMode,
  safetyBoundarySummary = avanzaHandoffSafetyBoundarySummary,
}: BuildAvanzaDevOnlyPreviewEnablementChecklistInput = {}): AvanzaDevOnlyPreviewEnablementChecklist {
  const noBridgeCalls =
    !integrationGuard.canCallBridge &&
    !previewFlagConfig.canCallBridge &&
    !proposedSourceMode.bridgeCallsAllowed &&
    boundaryStatus(safetyBoundarySummary, "no_trade_ui_bridge_call") ===
      "enforced";
  const noLocalhostFetch =
    !integrationGuard.canFetchLocalhost &&
    !previewFlagConfig.canFetchLocalhost &&
    !proposedSourceMode.tradeUiLocalhostFetchAllowed &&
    boundaryStatus(safetyBoundarySummary, "no_trade_ui_localhost_fetch") ===
      "enforced";
  const noExecution =
    !integrationGuard.canExecute &&
    !previewFlagConfig.canExecute &&
    !proposedSourceMode.executionAllowed &&
    boundaryStatus(safetyBoundarySummary, "no_order_placement") === "enforced";
  const noRunnerFill =
    boundaryStatus(safetyBoundarySummary, "no_runner_fill_endpoint") ===
    "enforced";
  const totalReadAdvisory =
    boundaryStatus(safetyBoundarySummary, "total_read_unresolved_advisory") ===
    "advisory";

  const rows: AvanzaDevOnlyPreviewEnablementChecklistRow[] = [
    {
      detail:
        defaultSourceMode.activeMode === "static_fixture"
          ? "The default Trade UI preview source remains static_fixture."
          : "The default Trade UI preview source is no longer static_fixture.",
      id: "default_static_fixture_remains_active",
      label: "Default static_fixture remains active",
      status:
        defaultSourceMode.activeMode === "static_fixture"
          ? "enforced"
          : "blocked",
    },
    {
      detail: `Preview flag config source is ${previewFlagConfig.source}.`,
      id: "preview_flag_config_source",
      label: "Preview flag config source",
      status:
        previewFlagConfig.source === "default_disabled"
          ? "enforced"
          : "ready",
    },
    {
      detail: `explicitPreviewOnlyFlag is ${String(
        previewFlagConfig.explicitPreviewOnlyFlag,
      )}.`,
      id: "preview_flag_explicit_value",
      label: "explicitPreviewOnlyFlag value",
      status:
        previewFlagConfig.explicitPreviewOnlyFlag &&
        previewFlagConfig.canEnableSelectedRecommendationPreview
          ? "ready"
          : "enforced",
    },
    {
      detail: `Preview flag environment scope is ${previewFlagConfig.environmentScope}.`,
      id: "preview_flag_environment_scope",
      label: "Environment scope",
      status:
        previewFlagConfig.environmentScope === "production_forbidden"
          ? "blocked"
          : previewFlagConfig.environmentScope === "dev_test_only"
            ? "ready"
            : "enforced",
    },
    {
      detail:
        previewFlagConfig.environmentScope === "production_forbidden"
          ? "Production scope forbids selectedRecommendation preview flag enablement."
          : "Production preview flag enablement remains forbidden.",
      id: "preview_flag_production_forbidden",
      label: "Production forbidden state",
      status:
        previewFlagConfig.environmentScope === "production_forbidden"
          ? "blocked"
          : "enforced",
    },
    {
      detail: previewFlagConfig.canEnableSelectedRecommendationPreview
        ? "Preview flag config can enable selectedRecommendation preview in dev/test only."
        : "Preview flag config cannot enable selectedRecommendation preview.",
      id: "preview_flag_can_enable_selected_recommendation_preview",
      label: "canEnableSelectedRecommendationPreview",
      status: previewFlagConfig.canEnableSelectedRecommendationPreview
        ? "ready"
        : "blocked",
    },
    {
      detail: previewFlagConfig.explicitPreviewOnlyFlag
        ? "The preview-only flag is explicitly true in the provided config."
        : "The default preview-only flag remains false.",
      id: "explicit_preview_only_flag_default_false",
      label: "explicitPreviewOnlyFlag default false",
      status: !previewFlagConfig.explicitPreviewOnlyFlag ? "enforced" : "ready",
    },
    {
      detail: "Preview flag config cannot call the bridge, fetch localhost, or execute.",
      id: "preview_flag_forbids_bridge_local_fetch_execution",
      label: "Preview flag forbids bridge/local fetch/execution",
      status:
        !previewFlagConfig.canCallBridge &&
        !previewFlagConfig.canFetchLocalhost &&
        !previewFlagConfig.canExecute
          ? "enforced"
          : "blocked",
    },
    {
      detail:
        integrationGuard.status === "disabled"
          ? "The default integration guard disables selectedRecommendation preview."
          : "The integration guard has been explicitly changed from the disabled default.",
      id: "selected_recommendation_preview_disabled_by_default",
      label: "selectedRecommendation preview disabled by default",
      status: integrationGuard.status === "disabled" ? "enforced" : "ready",
    },
    {
      detail: explicitDevTestFlagRequired
        ? "A separate dev/test flag is required before preview derivation may run."
        : "The dev/test flag requirement is missing.",
      id: "explicit_dev_test_flag_required",
      label: "Explicit dev/test flag required",
      status: explicitDevTestFlagRequired ? "enforced" : "blocked",
    },
    {
      detail:
        proposedSourceMode.activeMode === "selected_recommendation_preview_only"
          ? "The proposed source mode is selected_recommendation_preview_only for dev/test preview only."
          : "The proposed source mode is not selected_recommendation_preview_only.",
      id: "selected_recommendation_preview_only_required_dev_test",
      label:
        "Source mode selected_recommendation_preview_only required only in dev/test",
      status:
        proposedSourceMode.activeMode === "selected_recommendation_preview_only"
          ? "ready"
          : "blocked",
    },
    {
      detail:
        integrationGuard.status === "preview_only_allowed"
          ? "The integration guard allows preview-only derivation."
          : "The integration guard does not allow preview-only derivation.",
      id: "integration_guard_must_allow_preview_only",
      label: "Integration guard must allow preview-only",
      status:
        integrationGuard.status === "preview_only_allowed"
          ? "ready"
          : "blocked",
    },
    {
      detail:
        preWiringChecklist.summary.status === "candidate_for_preview_only_wiring"
          ? "The pre-wiring checklist is a preview-only wiring candidate."
          : "The pre-wiring checklist is not a preview-only wiring candidate.",
      id: "pre_wiring_candidate_required",
      label:
        "Pre-wiring checklist must be candidate_for_preview_only_wiring",
      status:
        preWiringChecklist.summary.status ===
        "candidate_for_preview_only_wiring"
          ? "ready"
          : "blocked",
    },
    {
      detail:
        preActivationGate.gateStatus === "locked"
          ? "The pre-activation gate remains locked."
          : "The pre-activation gate is not locked.",
      id: "pre_activation_gate_must_remain_locked",
      label: "Pre-activation gate must remain locked",
      status:
        preActivationGate.gateStatus === "locked" ? "enforced" : "blocked",
    },
    {
      detail: controlsDisabled
        ? "Any handoff controls remain disabled."
        : "A handoff control is not disabled.",
      id: "controls_must_remain_disabled",
      label: "Controls must remain disabled",
      status: controlsDisabled ? "enforced" : "blocked",
    },
    {
      detail: "Bridge calls remain forbidden for dev/test preview derivation.",
      id: "no_bridge_calls",
      label: "No bridge calls",
      status: noBridgeCalls ? "enforced" : "blocked",
    },
    {
      detail: "Trade UI localhost fetch remains forbidden.",
      id: "no_localhost_fetch",
      label: "No localhost fetch",
      status: noLocalhostFetch ? "enforced" : "blocked",
    },
    {
      detail: "No polling may be introduced for preview enablement.",
      id: "no_polling",
      label: "No polling",
      status:
        boundaryStatus(safetyBoundarySummary, "no_polling") === "enforced"
          ? "enforced"
          : "blocked",
    },
    {
      detail: "Runner and fill invocation remain forbidden.",
      id: "no_runner_fill_invocation",
      label: "No runner/fill invocation",
      status: noRunnerFill ? "enforced" : "blocked",
    },
    {
      detail: "Click, review, final confirmation, submit, and order actions remain forbidden.",
      id: "no_click_review_final_submit_order",
      label: "No click/review/final/submit/order",
      status: noExecution ? "enforced" : "blocked",
    },
    {
      detail: "Credential, session, and BankID handling remain out of scope.",
      id: "no_credential_session_handling",
      label: "No credential/session handling",
      status:
        boundaryStatus(
          safetyBoundarySummary,
          "no_credentials_session_bankid_cookies_storage",
        ) === "enforced"
          ? "enforced"
          : "blocked",
    },
    {
      detail: "No Supabase execution record may be written.",
      id: "no_supabase_write",
      label: "No Supabase write",
      status:
        boundaryStatus(safetyBoundarySummary, "no_supabase_execution_write") ===
        "enforced"
          ? "enforced"
          : "blocked",
    },
    {
      detail: "Total-read remains advisory and cannot create execution readiness.",
      id: "total_read_advisory",
      label: "Total-read advisory",
      status: totalReadAdvisory ? "advisory" : "blocked",
    },
  ];

  const blockers = rowLabels(rows, "blocked");
  const advisories = rowLabels(rows, "advisory");
  const candidate =
    blockers.length === 0 &&
    previewFlagConfig.explicitPreviewOnlyFlag &&
    previewFlagConfig.canEnableSelectedRecommendationPreview &&
    previewFlagConfig.environmentScope === "dev_test_only" &&
    integrationGuard.status === "preview_only_allowed" &&
    preWiringChecklist.summary.status ===
      "candidate_for_preview_only_wiring" &&
    proposedSourceMode.activeMode === "selected_recommendation_preview_only" &&
    preActivationGate.gateStatus === "locked" &&
    controlsDisabled &&
    noBridgeCalls &&
    noLocalhostFetch &&
    noExecution;

  if (candidate) {
    return {
      advisories,
      blockers,
      label: "Candidate for dev/test selectedRecommendation preview",
      reason:
        "Explicit dev/test preview conditions are present. Bridge calls, localhost fetch, execution, enabled controls, and unlocked gates remain forbidden.",
      rows,
      status: "candidate_for_dev_preview",
    };
  }

  if (
    !explicitDevTestFlagRequired ||
    !controlsDisabled ||
    !noBridgeCalls ||
    !noLocalhostFetch ||
    !noExecution ||
    preActivationGate.gateStatus !== "locked"
  ) {
    return {
      advisories,
      blockers,
      label: "Dev/test selectedRecommendation preview blocked",
      reason:
        "One or more hard safety requirements failed. Do not enable preview derivation.",
      rows,
      status: "blocked",
    };
  }

  return {
    advisories,
    blockers,
    label: "Dev/test selectedRecommendation preview not allowed",
    reason:
      `Default static_fixture remains active, explicitPreviewOnlyFlag is ${String(
        previewFlagConfig.explicitPreviewOnlyFlag,
      )}, preview flag source is ${previewFlagConfig.source}, and the integration guard is disabled.`,
    rows,
    status: "not_allowed",
  };
}

export const avanzaDevOnlyPreviewEnablementDefaultChecklist =
  buildAvanzaDevOnlyPreviewEnablementChecklist();

export const avanzaDevOnlyPreviewEnablementCandidateChecklist =
  buildAvanzaDevOnlyPreviewEnablementChecklist({
    integrationGuard: buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
      explicitPreviewOnlyFlag: true,
    }),
    preActivationGate: avanzaGameStopHandoffPreActivationGateFixture,
    previewFlagConfig: avanzaDevPreviewFlagExplicitTestFixtureConfig,
    preWiringChecklist:
      avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
    proposedSourceMode:
      avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
  });
