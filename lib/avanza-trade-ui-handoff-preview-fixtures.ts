import {
  avanzaHandoffPackageBuilderFixtures,
} from "./avanza-handoff-package-builder-fixtures";
import type {
  AvanzaHandoffPackage,
  AvanzaHandoffPackageBuilderResult,
} from "./avanza-handoff-package-builder";

export type AvanzaTradeUiHandoffPreviewStatus =
  | "preview_disabled"
  | "package_unavailable"
  | "package_blocked"
  | "package_ready_read_only"
  | "package_ready_fill_only_preview";

export type AvanzaTradeUiHandoffPreviewModel = {
  blockedReasons: string[];
  canCallBridge: false;
  canExecute: false;
  canFetchLocalhost: false;
  canPoll: false;
  canPrepareFill: boolean;
  canProceedToHandoff: false;
  controlsEnabled: false;
  gateLocked: true;
  label: string;
  package?: AvanzaHandoffPackage;
  reason: string;
  status: AvanzaTradeUiHandoffPreviewStatus;
  warnings: string[];
};

export type AvanzaTradeUiHandoffPreviewFixtureId =
  | "preview_disabled"
  | "package_unavailable"
  | "package_blocked_source_invalid"
  | "package_blocked_invalid_quantity"
  | "package_blocked_missing_ticker"
  | "package_ready_read_only_buy"
  | "package_ready_read_only_sell"
  | "package_ready_read_only_missing_target_warning"
  | "package_ready_fill_only_preview";

export type AvanzaTradeUiHandoffPreviewRenderMode =
  | "disabled_or_empty"
  | "blocked"
  | "read_only_package"
  | "fill_only_metadata";

export type AvanzaTradeUiHandoffPreviewFixture = {
  builderResult: AvanzaHandoffPackageBuilderResult;
  expectedRenderMode: AvanzaTradeUiHandoffPreviewRenderMode;
  expectedStatus: AvanzaTradeUiHandoffPreviewStatus;
  id: AvanzaTradeUiHandoffPreviewFixtureId;
  label: string;
  modelResult: AvanzaTradeUiHandoffPreviewModel;
};

function previewStatusForBuilderResult(
  result: AvanzaHandoffPackageBuilderResult,
): AvanzaTradeUiHandoffPreviewStatus {
  if (result.status === "handoff_disabled") {
    return "preview_disabled";
  }

  if (result.status === "source_unavailable") {
    return "package_unavailable";
  }

  if (result.status === "handoff_ready_read_only") {
    return "package_ready_read_only";
  }

  if (result.status === "handoff_ready_fill_only") {
    return "package_ready_fill_only_preview";
  }

  return "package_blocked";
}

function renderModeForPreviewStatus(
  status: AvanzaTradeUiHandoffPreviewStatus,
): AvanzaTradeUiHandoffPreviewRenderMode {
  if (status === "preview_disabled" || status === "package_unavailable") {
    return "disabled_or_empty";
  }

  if (status === "package_ready_read_only") {
    return "read_only_package";
  }

  if (status === "package_ready_fill_only_preview") {
    return "fill_only_metadata";
  }

  return "blocked";
}

function buildPreviewFixture(
  id: AvanzaTradeUiHandoffPreviewFixtureId,
  label: string,
  builderFixtureId: string,
): AvanzaTradeUiHandoffPreviewFixture {
  const builderFixture = avanzaHandoffPackageBuilderFixtures.find(
    (fixture) => fixture.id === builderFixtureId,
  );

  if (!builderFixture) {
    throw new Error(`Missing Avanza handoff package builder fixture: ${builderFixtureId}`);
  }

  const builderResult = builderFixture.result;
  const status = previewStatusForBuilderResult(builderResult);
  const expectedRenderMode = renderModeForPreviewStatus(status);

  return {
    builderResult,
    expectedRenderMode,
    expectedStatus: status,
    id,
    label,
    modelResult: {
      blockedReasons: builderResult.blockedReasons,
      canCallBridge: false,
      canExecute: false,
      canFetchLocalhost: false,
      canPoll: false,
      canPrepareFill: status === "package_ready_fill_only_preview",
      canProceedToHandoff: false,
      controlsEnabled: false,
      gateLocked: true,
      label,
      package: builderResult.package,
      reason: builderResult.reason,
      status,
      warnings: builderResult.warnings,
    },
  };
}

export const avanzaTradeUiHandoffPreviewFixtures: AvanzaTradeUiHandoffPreviewFixture[] =
  [
    buildPreviewFixture(
      "preview_disabled",
      "Preview disabled",
      "handoff_disabled",
    ),
    buildPreviewFixture(
      "package_unavailable",
      "Package unavailable",
      "source_unavailable",
    ),
    buildPreviewFixture(
      "package_blocked_source_invalid",
      "Package blocked: source invalid",
      "source_invalid",
    ),
    buildPreviewFixture(
      "package_blocked_invalid_quantity",
      "Package blocked: invalid quantity",
      "risk_blocked_invalid_quantity",
    ),
    buildPreviewFixture(
      "package_blocked_missing_ticker",
      "Package blocked: missing ticker",
      "risk_blocked_missing_ticker",
    ),
    buildPreviewFixture(
      "package_ready_read_only_buy",
      "Valid BUY preview",
      "handoff_ready_read_only_buy",
    ),
    buildPreviewFixture(
      "package_ready_read_only_sell",
      "Valid SELL preview",
      "handoff_ready_read_only_sell",
    ),
    buildPreviewFixture(
      "package_ready_read_only_missing_target_warning",
      "Warning: missing target",
      "handoff_ready_read_only_missing_target_warning",
    ),
    buildPreviewFixture(
      "package_ready_fill_only_preview",
      "Fill-only readiness preview",
      "handoff_ready_fill_only",
    ),
  ];
