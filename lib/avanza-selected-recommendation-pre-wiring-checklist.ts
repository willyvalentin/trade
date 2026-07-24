import {
  avanzaHandoffPreviewActiveSourceMode,
  avanzaHandoffPreviewSourceModes,
  type AvanzaHandoffPreviewSourceModeModel,
} from "@/lib/avanza-handoff-preview-source-mode";
import {
  avanzaSelectedRecommendationPreviewIntegrationDefaultGuard,
  type AvanzaSelectedRecommendationPreviewIntegrationGuardDecision,
} from "@/lib/avanza-selected-recommendation-preview-integration-guard";

export type AvanzaSelectedRecommendationPreWiringChecklistRowStatus =
  | "ready"
  | "blocked"
  | "advisory"
  | "enforced";

export type AvanzaSelectedRecommendationPreWiringChecklistRow = {
  detail: string;
  id: string;
  label: string;
  status: AvanzaSelectedRecommendationPreWiringChecklistRowStatus;
};

export type AvanzaSelectedRecommendationPreWiringChecklistSummaryStatus =
  | "not_ready_for_wiring"
  | "candidate_for_preview_only_wiring";

export type AvanzaSelectedRecommendationPreWiringChecklistSummary = {
  advisoryCount: number;
  blockedCount: number;
  enforcedCount: number;
  label: string;
  readyCount: number;
  reason: string;
  status: AvanzaSelectedRecommendationPreWiringChecklistSummaryStatus;
};

export type AvanzaSelectedRecommendationPreWiringChecklist = {
  rows: AvanzaSelectedRecommendationPreWiringChecklistRow[];
  summary: AvanzaSelectedRecommendationPreWiringChecklistSummary;
};

export type BuildAvanzaSelectedRecommendationPreWiringChecklistInput = {
  adapterAvailable?: boolean;
  derivedPreviewStateHelperAvailable?: boolean;
  integrationGuard?: AvanzaSelectedRecommendationPreviewIntegrationGuardDecision;
  sourceMode?: AvanzaHandoffPreviewSourceModeModel;
  staticFixtureRemainsDefault?: boolean;
  tradeUiUsesStaticFixture?: boolean;
};

function countRows(
  rows: AvanzaSelectedRecommendationPreWiringChecklistRow[],
  status: AvanzaSelectedRecommendationPreWiringChecklistRowStatus,
) {
  return rows.filter((row) => row.status === status).length;
}

export function buildAvanzaSelectedRecommendationPreWiringChecklist({
  adapterAvailable = true,
  derivedPreviewStateHelperAvailable = true,
  integrationGuard = avanzaSelectedRecommendationPreviewIntegrationDefaultGuard,
  sourceMode = avanzaHandoffPreviewActiveSourceMode,
  staticFixtureRemainsDefault = true,
  tradeUiUsesStaticFixture = true,
}: BuildAvanzaSelectedRecommendationPreWiringChecklistInput = {}): AvanzaSelectedRecommendationPreWiringChecklist {
  const rows: AvanzaSelectedRecommendationPreWiringChecklistRow[] = [
    {
      detail:
        integrationGuard.status === "disabled"
          ? "Default guard is disabled; real selectedRecommendation state cannot be read."
          : "Default-disabled guard has been explicitly overridden for preview-only derivation.",
      id: "integration_guard_default_disabled",
      label: "Integration guard default disabled",
      status: integrationGuard.status === "disabled" ? "blocked" : "ready",
    },
    {
      detail:
        integrationGuard.status === "preview_only_allowed"
          ? "Explicit preview-only guard is present for derivation tests or future guarded wiring."
          : "A separate explicit preview-only flag is required before any selectedRecommendation derivation attempt.",
      id: "explicit_preview_only_flag_required",
      label: "Explicit preview-only flag required",
      status:
        integrationGuard.status === "preview_only_allowed"
          ? "ready"
          : "blocked",
    },
    {
      detail: staticFixtureRemainsDefault
        ? "The active/default source remains static_fixture."
        : "The default source has been changed and must be reviewed before wiring.",
      id: "source_mode_default_static_fixture",
      label: "Source mode default static_fixture",
      status: staticFixtureRemainsDefault ? "enforced" : "blocked",
    },
    {
      detail:
        sourceMode.activeMode === "selected_recommendation_preview_only"
          ? "Proposed derivation source is selected_recommendation_preview_only, which remains future/locked."
          : "Proposed derivation source is not selected_recommendation_preview_only.",
      id: "selected_recommendation_preview_only_inactive_future",
      label: "selected_recommendation_preview_only inactive/future",
      status:
        sourceMode.activeMode === "selected_recommendation_preview_only"
          ? "ready"
          : "blocked",
    },
    {
      detail: derivedPreviewStateHelperAvailable
        ? "Pure derived preview-state helper is available."
        : "Pure derived preview-state helper is missing.",
      id: "derived_helper_exists",
      label: "Derived helper exists",
      status: derivedPreviewStateHelperAvailable ? "ready" : "blocked",
    },
    {
      detail: adapterAvailable
        ? "Pure selectedRecommendation adapter is available."
        : "Pure selectedRecommendation adapter is missing.",
      id: "adapter_exists",
      label: "Adapter exists",
      status: adapterAvailable ? "ready" : "blocked",
    },
    {
      detail: tradeUiUsesStaticFixture
        ? "Trade UI still renders static fixture data; no real selectedRecommendation state is wired."
        : "Trade UI static fixture source has been changed and needs a separate review.",
      id: "trade_ui_still_uses_static_fixture",
      label: "Trade UI still uses static fixture",
      status: tradeUiUsesStaticFixture ? "enforced" : "advisory",
    },
    {
      detail: "Bridge calls remain forbidden for preview-only derivation.",
      id: "no_bridge_calls_allowed",
      label: "No bridge calls allowed",
      status: integrationGuard.canCallBridge ? "blocked" : "enforced",
    },
    {
      detail: "Trade UI localhost fetch remains forbidden.",
      id: "no_localhost_fetch_allowed",
      label: "No localhost fetch allowed",
      status: integrationGuard.canFetchLocalhost ? "blocked" : "enforced",
    },
    {
      detail: "Execution remains forbidden; this is preview-only derivation.",
      id: "no_execution_allowed",
      label: "No execution allowed",
      status: integrationGuard.canExecute ? "blocked" : "enforced",
    },
    {
      detail: "Any future handoff control must remain disabled.",
      id: "no_active_button_allowed",
      label: "No active button allowed",
      status: "enforced",
    },
    {
      detail: "Pre-activation gate must remain locked for preview-only wiring.",
      id: "pre_activation_gate_must_remain_locked",
      label: "Pre-activation gate must remain locked",
      status: "enforced",
    },
    {
      detail: "Total-read remains advisory and cannot create execution readiness.",
      id: "total_read_remains_advisory",
      label: "Total-read remains advisory",
      status: "advisory",
    },
  ];

  const blockedCount = countRows(rows, "blocked");
  const advisoryCount = countRows(rows, "advisory");
  const enforcedCount = countRows(rows, "enforced");
  const readyCount = countRows(rows, "ready");
  const candidate =
    blockedCount === 0 &&
    integrationGuard.status === "preview_only_allowed" &&
    sourceMode.activeMode === "selected_recommendation_preview_only" &&
    adapterAvailable &&
    derivedPreviewStateHelperAvailable;

  return {
    rows,
    summary: {
      advisoryCount,
      blockedCount,
      enforcedCount,
      label: candidate
        ? "Candidate for preview-only wiring"
        : "Not ready for selectedRecommendation wiring",
      readyCount,
      reason: candidate
        ? "Explicit preview-only guard and future source mode are present. Bridge calls, local fetch, execution, active buttons, and unlocked gates remain forbidden."
        : "SelectedRecommendation preview wiring is not ready because required preview-only guard/source conditions are not satisfied.",
      status: candidate
        ? "candidate_for_preview_only_wiring"
        : "not_ready_for_wiring",
    },
  };
}

export const avanzaSelectedRecommendationPreWiringDefaultChecklist =
  buildAvanzaSelectedRecommendationPreWiringChecklist();

export const avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist =
  buildAvanzaSelectedRecommendationPreWiringChecklist({
    integrationGuard: {
      canCallBridge: false,
      canExecute: false,
      canFetchLocalhost: false,
      canReadSelectedRecommendation: true,
      canRenderPreviewOnlyState: true,
      canSwitchSourceModeToSelectedRecommendationPreviewOnly: true,
      canUseDerivedPreviewStateHelper: true,
      label: "Selected recommendation preview-only derivation allowed",
      reason:
        "Explicit preview-only guard allows read-only selectedRecommendation derivation.",
      status: "preview_only_allowed",
    },
    sourceMode:
      avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only,
  });
