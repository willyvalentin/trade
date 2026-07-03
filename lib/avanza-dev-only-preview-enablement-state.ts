import {
  avanzaDevOnlyPreviewEnablementCandidateChecklist,
  avanzaDevOnlyPreviewEnablementDefaultChecklist,
  buildAvanzaDevOnlyPreviewEnablementChecklist,
  type AvanzaDevOnlyPreviewEnablementChecklist,
} from "@/lib/avanza-dev-only-preview-enablement-checklist";
import {
  avanzaDevPreviewFlagDefaultConfig,
  avanzaDevPreviewFlagExplicitTestFixtureConfig,
  avanzaDevPreviewFlagProductionForbiddenConfig,
  buildAvanzaDevPreviewFlagConfig,
  type AvanzaDevPreviewFlagConfig,
  type AvanzaDevPreviewFlagConfigInput,
} from "@/lib/avanza-dev-preview-flag-config";
import {
  avanzaHandoffPreviewActiveSourceMode,
  avanzaHandoffPreviewSourceModes,
  type AvanzaHandoffPreviewSourceModeModel,
} from "@/lib/avanza-handoff-preview-source-mode";
import {
  avanzaGameStopHandoffPreActivationGateFixture,
} from "@/lib/avanza-handoff-package-preview-fixtures";
import {
  avanzaSelectedRecommendationPreWiringDefaultChecklist,
  avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist,
  buildAvanzaSelectedRecommendationPreWiringChecklist,
  type AvanzaSelectedRecommendationPreWiringChecklist,
} from "@/lib/avanza-selected-recommendation-pre-wiring-checklist";
import {
  buildAvanzaSelectedRecommendationPreviewIntegrationGuard,
  type AvanzaSelectedRecommendationPreviewIntegrationGuardDecision,
} from "@/lib/avanza-selected-recommendation-preview-integration-guard";

export type AvanzaDevOnlyPreviewEnablementOverallStatus =
  | "disabled"
  | "candidate_for_dev_preview"
  | "blocked";

export type BuildAvanzaDevOnlyPreviewEnablementStateInput = {
  controlsDisabled?: boolean;
  previewFlagConfig?: AvanzaDevPreviewFlagConfig;
  previewFlagConfigInput?: AvanzaDevPreviewFlagConfigInput;
  proposedSourceMode?: AvanzaHandoffPreviewSourceModeModel;
};

export type AvanzaDevOnlyPreviewEnablementState = {
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canRenderSelectedRecommendationPreview: boolean;
  enablementChecklist: AvanzaDevOnlyPreviewEnablementChecklist;
  integrationGuard: AvanzaSelectedRecommendationPreviewIntegrationGuardDecision;
  label: string;
  overallStatus: AvanzaDevOnlyPreviewEnablementOverallStatus;
  preWiringChecklist: AvanzaSelectedRecommendationPreWiringChecklist;
  previewFlagConfig: AvanzaDevPreviewFlagConfig;
  reason: string;
};

function buildIntegrationGuard(
  previewFlagConfig: AvanzaDevPreviewFlagConfig,
) {
  return buildAvanzaSelectedRecommendationPreviewIntegrationGuard({
    explicitPreviewOnlyFlag:
      previewFlagConfig.canEnableSelectedRecommendationPreview,
    forceBlocked: previewFlagConfig.environmentScope === "production_forbidden",
    blockedReason:
      previewFlagConfig.environmentScope === "production_forbidden"
        ? "Production scope forbids selectedRecommendation preview derivation."
        : null,
  });
}

function statusFromChecklist(
  previewFlagConfig: AvanzaDevPreviewFlagConfig,
  enablementChecklist: AvanzaDevOnlyPreviewEnablementChecklist,
): AvanzaDevOnlyPreviewEnablementOverallStatus {
  if (previewFlagConfig.environmentScope === "production_forbidden") {
    return "blocked";
  }

  if (enablementChecklist.status === "candidate_for_dev_preview") {
    return "candidate_for_dev_preview";
  }

  if (enablementChecklist.status === "blocked") {
    return "blocked";
  }

  return "disabled";
}

export function buildAvanzaDevOnlyPreviewEnablementState({
  controlsDisabled = true,
  previewFlagConfig,
  previewFlagConfigInput,
  proposedSourceMode,
}: BuildAvanzaDevOnlyPreviewEnablementStateInput = {}): AvanzaDevOnlyPreviewEnablementState {
  const resolvedPreviewFlagConfig =
    previewFlagConfig ?? buildAvanzaDevPreviewFlagConfig(previewFlagConfigInput);
  const integrationGuard = buildIntegrationGuard(resolvedPreviewFlagConfig);
  const resolvedSourceMode =
    proposedSourceMode ??
    (resolvedPreviewFlagConfig.canEnableSelectedRecommendationPreview
      ? avanzaHandoffPreviewSourceModes.selected_recommendation_preview_only
      : avanzaHandoffPreviewActiveSourceMode);
  const preWiringChecklist = buildAvanzaSelectedRecommendationPreWiringChecklist({
    integrationGuard,
    sourceMode: resolvedSourceMode,
  });
  const enablementChecklist = buildAvanzaDevOnlyPreviewEnablementChecklist({
    controlsDisabled,
    integrationGuard,
    preActivationGate: avanzaGameStopHandoffPreActivationGateFixture,
    previewFlagConfig: resolvedPreviewFlagConfig,
    preWiringChecklist,
    proposedSourceMode: resolvedSourceMode,
  });
  const overallStatus = statusFromChecklist(
    resolvedPreviewFlagConfig,
    enablementChecklist,
  );
  const canRenderSelectedRecommendationPreview =
    overallStatus === "candidate_for_dev_preview" &&
    resolvedPreviewFlagConfig.canEnableSelectedRecommendationPreview &&
    integrationGuard.canRenderPreviewOnlyState &&
    preWiringChecklist.summary.status === "candidate_for_preview_only_wiring" &&
    enablementChecklist.status === "candidate_for_dev_preview";

  if (overallStatus === "candidate_for_dev_preview") {
    return {
      canCallBridge: false,
      canExecute: false,
      canFetchLocalhost: false,
      canRenderSelectedRecommendationPreview,
      enablementChecklist,
      integrationGuard,
      label: "Candidate for dev/test selectedRecommendation preview",
      overallStatus,
      preWiringChecklist,
      previewFlagConfig: resolvedPreviewFlagConfig,
      reason:
        "Explicit dev/test preview flag, preview-only guard, pre-wiring checklist, and enablement checklist all allow preview rendering. Bridge calls, local fetches, execution, enabled controls, and unlocked gates remain forbidden.",
    };
  }

  if (overallStatus === "blocked") {
    return {
      canCallBridge: false,
      canExecute: false,
      canFetchLocalhost: false,
      canRenderSelectedRecommendationPreview: false,
      enablementChecklist,
      integrationGuard,
      label: "Dev/test selectedRecommendation preview blocked",
      overallStatus,
      preWiringChecklist,
      previewFlagConfig: resolvedPreviewFlagConfig,
      reason:
        resolvedPreviewFlagConfig.environmentScope === "production_forbidden"
          ? "Production scope forbids selectedRecommendation preview derivation."
          : enablementChecklist.reason,
    };
  }

  return {
    canCallBridge: false,
    canExecute: false,
    canFetchLocalhost: false,
    canRenderSelectedRecommendationPreview: false,
    enablementChecklist,
    integrationGuard,
    label: "Dev/test selectedRecommendation preview disabled",
    overallStatus,
    preWiringChecklist,
    previewFlagConfig: resolvedPreviewFlagConfig,
    reason:
      "Default state keeps explicitPreviewOnlyFlag false and selectedRecommendation preview disabled by default.",
  };
}

export const avanzaDevOnlyPreviewEnablementDefaultState =
  buildAvanzaDevOnlyPreviewEnablementState({
    previewFlagConfig: avanzaDevPreviewFlagDefaultConfig,
  });

export const avanzaDevOnlyPreviewEnablementCandidateState =
  buildAvanzaDevOnlyPreviewEnablementState({
    previewFlagConfig: avanzaDevPreviewFlagExplicitTestFixtureConfig,
  });

export const avanzaDevOnlyPreviewEnablementProductionForbiddenState =
  buildAvanzaDevOnlyPreviewEnablementState({
    previewFlagConfig: avanzaDevPreviewFlagProductionForbiddenConfig,
  });

export const avanzaDevOnlyPreviewEnablementLegacyDefaultChecklist =
  avanzaDevOnlyPreviewEnablementDefaultChecklist;

export const avanzaDevOnlyPreviewEnablementLegacyCandidateChecklist =
  avanzaDevOnlyPreviewEnablementCandidateChecklist;

export const avanzaSelectedRecommendationPreWiringLegacyDefaultChecklist =
  avanzaSelectedRecommendationPreWiringDefaultChecklist;

export const avanzaSelectedRecommendationPreWiringLegacyCandidateChecklist =
  avanzaSelectedRecommendationPreWiringPreviewOnlyCandidateChecklist;
