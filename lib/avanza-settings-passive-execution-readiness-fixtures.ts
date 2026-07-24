import {
  buildAvanzaPassiveExecutionReadinessPreview,
  type AvanzaPassiveExecutionReadinessPreviewInput,
  type AvanzaPassiveExecutionReadinessPreviewModel,
  type AvanzaPassiveExecutionReadinessPreviewStatus,
} from "./avanza-passive-execution-readiness-preview";

export type AvanzaSettingsPassiveExecutionReadinessFixtureId =
  | "settings_passive_readiness_ready"
  | "settings_incomplete_profile"
  | "settings_local_dev_only_warning"
  | "settings_no_trade_ui_wiring"
  | "settings_no_api_route_wiring"
  | "settings_browser_automation_not_wired"
  | "settings_smoke_tests_separate"
  | "settings_final_kop_salj_human_only"
  | "settings_production_not_ready";

export type AvanzaSettingsPassiveExecutionReadinessFixture = {
  fixtureId: AvanzaSettingsPassiveExecutionReadinessFixtureId;
  label: string;
  expectedStatus: AvanzaPassiveExecutionReadinessPreviewStatus;
  model: AvanzaPassiveExecutionReadinessPreviewModel;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const settingsReadyInput: AvanzaPassiveExecutionReadinessPreviewInput = {
  localDevOnly: true,
  loginReady: true,
  orderPrepReady: true,
  profileReady: true,
  settlementReady: true,
  source: "manual_review",
};

function fixture(
  fixtureId: AvanzaSettingsPassiveExecutionReadinessFixtureId,
  label: string,
  expectedStatus: AvanzaPassiveExecutionReadinessPreviewStatus,
  input: AvanzaPassiveExecutionReadinessPreviewInput = {},
): AvanzaSettingsPassiveExecutionReadinessFixture {
  return {
    fixtureId,
    label,
    expectedStatus,
    model: buildAvanzaPassiveExecutionReadinessPreview({
      ...settingsReadyInput,
      ...input,
      now: fixtureNow,
      previewId: `settings-passive-readiness-${fixtureId}`,
      statusOverride: input.statusOverride ?? expectedStatus,
    }),
  };
}

export const avanzaSettingsPassiveExecutionReadinessFixtures:
  AvanzaSettingsPassiveExecutionReadinessFixture[] = [
    fixture(
      "settings_passive_readiness_ready",
      "Settings passive readiness ready",
      "ready_passive_preview",
      {
        reason:
          "Settings can display passive execution readiness without activating handoff.",
        selectedSide: "unknown",
        selectedTicker: "settings-model-only",
      },
    ),
    fixture(
      "settings_incomplete_profile",
      "Incomplete profile",
      "incomplete_profile",
      {
        profileReady: false,
        reason: "Profile readiness is incomplete in Settings.",
        warnings: ["Complete the passive Avanza execution profile first."],
      },
    ),
    fixture(
      "settings_local_dev_only_warning",
      "Local-dev only warning",
      "local_dev_only",
      {
        orderPrepReady: false,
        reason: "Readiness is visible for local-dev planning only.",
        warnings: ["Local-dev smoke tests remain separate terminal-only steps."],
      },
    ),
    fixture(
      "settings_no_trade_ui_wiring",
      "No Trade UI wiring",
      "blocked",
      {
        blockedReasons: ["Trade UI order flow is not wired from Settings."],
        reason: "Settings readiness is separate from Trade UI order flow.",
      },
    ),
    fixture(
      "settings_no_api_route_wiring",
      "No API route wiring",
      "blocked",
      {
        blockedReasons: ["API route execution is disabled/not wired."],
        reason: "Settings readiness cannot call API routes.",
      },
    ),
    fixture(
      "settings_browser_automation_not_wired",
      "Browser automation not wired",
      "blocked",
      {
        blockedReasons: ["Browser automation from app runtime is not wired."],
        reason: "Settings readiness cannot start Avanza/browser automation.",
      },
    ),
    fixture(
      "settings_smoke_tests_separate",
      "Smoke tests separate",
      "blocked",
      {
        blockedReasons: ["Smoke tests cannot run from Settings UI."],
        reason: "Local-dev smoke tests are separate terminal-only flows.",
      },
    ),
    fixture(
      "settings_final_kop_salj_human_only",
      "Final KOP/SALJ human-only",
      "blocked",
      {
        blockedReasons: ["Final KOP/SALJ remains human-only."],
        reason: "Settings cannot click final KOP/SALJ.",
      },
    ),
    fixture(
      "settings_production_not_ready",
      "Production not ready",
      "blocked",
      {
        blockedReasons: ["Production readiness is not claimed."],
        reason: "Settings readiness is passive and not production ready.",
      },
    ),
  ];
