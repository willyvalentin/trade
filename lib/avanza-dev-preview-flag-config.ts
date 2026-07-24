export type AvanzaDevPreviewFlagEnvironmentScope =
  | "default"
  | "dev_test_only"
  | "production_forbidden";

export type AvanzaDevPreviewFlagSource =
  | "default_disabled"
  | "explicit_test_fixture"
  | "explicit_dev_config";

export type AvanzaDevPreviewFlagConfigInput = {
  environmentScope?: AvanzaDevPreviewFlagEnvironmentScope;
  explicitPreviewOnlyFlag?: boolean;
  source?: AvanzaDevPreviewFlagSource;
};

export type AvanzaDevPreviewFlagConfig = {
  canCallBridge: false;
  canEnableSelectedRecommendationPreview: boolean;
  canExecute: false;
  canFetchLocalhost: false;
  environmentScope: AvanzaDevPreviewFlagEnvironmentScope;
  explicitPreviewOnlyFlag: boolean;
  label: string;
  reason: string;
  source: AvanzaDevPreviewFlagSource;
};

export function buildAvanzaDevPreviewFlagConfig({
  environmentScope = "default",
  explicitPreviewOnlyFlag = false,
  source = "default_disabled",
}: AvanzaDevPreviewFlagConfigInput = {}): AvanzaDevPreviewFlagConfig {
  if (environmentScope === "production_forbidden") {
    return {
      canCallBridge: false,
      canEnableSelectedRecommendationPreview: false,
      canExecute: false,
      canFetchLocalhost: false,
      environmentScope,
      explicitPreviewOnlyFlag: false,
      label: "Production preview flag forbidden",
      reason:
        "selectedRecommendation preview flag enablement is forbidden in production. The preview-only flag is forced false.",
      source: "default_disabled",
    };
  }

  const canEnableSelectedRecommendationPreview =
    environmentScope === "dev_test_only" &&
    explicitPreviewOnlyFlag &&
    (source === "explicit_test_fixture" || source === "explicit_dev_config");

  if (canEnableSelectedRecommendationPreview) {
    return {
      canCallBridge: false,
      canEnableSelectedRecommendationPreview: true,
      canExecute: false,
      canFetchLocalhost: false,
      environmentScope,
      explicitPreviewOnlyFlag: true,
      label: "Dev/test selectedRecommendation preview flag",
      reason:
        "Explicit dev/test preview flag may allow preview-only selectedRecommendation derivation. Bridge calls, local fetches, and execution remain forbidden.",
      source,
    };
  }

  return {
    canCallBridge: false,
    canEnableSelectedRecommendationPreview: false,
    canExecute: false,
    canFetchLocalhost: false,
    environmentScope: "default",
    explicitPreviewOnlyFlag: false,
    label: "selectedRecommendation preview flag disabled",
    reason:
      "Default config keeps explicitPreviewOnlyFlag false and selectedRecommendation preview disabled.",
    source: "default_disabled",
  };
}

export const avanzaDevPreviewFlagDefaultConfig =
  buildAvanzaDevPreviewFlagConfig();

export const avanzaDevPreviewFlagExplicitTestFixtureConfig =
  buildAvanzaDevPreviewFlagConfig({
    environmentScope: "dev_test_only",
    explicitPreviewOnlyFlag: true,
    source: "explicit_test_fixture",
  });

export const avanzaDevPreviewFlagProductionForbiddenConfig =
  buildAvanzaDevPreviewFlagConfig({
    environmentScope: "production_forbidden",
    explicitPreviewOnlyFlag: true,
    source: "explicit_dev_config",
  });
