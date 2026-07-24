import {
  buildAvanzaPassiveExecutionReadinessPreview,
  type AvanzaPassiveExecutionReadinessPreviewInput,
  type AvanzaPassiveExecutionReadinessPreviewModel,
  type AvanzaPassiveExecutionReadinessPreviewStatus,
} from "./avanza-passive-execution-readiness-preview";

export type AvanzaPassiveExecutionReadinessPreviewFixtureId =
  | "passive_preview_ready"
  | "incomplete_profile"
  | "recommendation_source_buy"
  | "recommendation_source_sell"
  | "live_position_source_sell_exit"
  | "local_dev_only_warning"
  | "no_trade_ui_wiring"
  | "no_api_route_wiring"
  | "no_browser_automation"
  | "final_click_forbidden"
  | "order_submission_forbidden"
  | "smoke_test_from_ui_forbidden"
  | "production_not_ready";

export type AvanzaPassiveExecutionReadinessPreviewFixture = {
  fixtureId: AvanzaPassiveExecutionReadinessPreviewFixtureId;
  label: string;
  expectedStatus: AvanzaPassiveExecutionReadinessPreviewStatus;
  model: AvanzaPassiveExecutionReadinessPreviewModel;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const readyInput: AvanzaPassiveExecutionReadinessPreviewInput = {
  localDevOnly: true,
  loginReady: true,
  orderPrepReady: true,
  profileReady: true,
  settlementReady: true,
  source: "fixture",
};

function fixture(
  fixtureId: AvanzaPassiveExecutionReadinessPreviewFixtureId,
  label: string,
  expectedStatus: AvanzaPassiveExecutionReadinessPreviewStatus,
  input: AvanzaPassiveExecutionReadinessPreviewInput = {},
): AvanzaPassiveExecutionReadinessPreviewFixture {
  return {
    fixtureId,
    label,
    expectedStatus,
    model: buildAvanzaPassiveExecutionReadinessPreview({
      ...readyInput,
      ...input,
      now: fixtureNow,
      previewId: `fixture-${fixtureId}`,
      statusOverride: input.statusOverride ?? expectedStatus,
    }),
  };
}

export const avanzaPassiveExecutionReadinessPreviewFixtures:
  AvanzaPassiveExecutionReadinessPreviewFixture[] = [
    fixture(
      "passive_preview_ready",
      "Passive preview ready",
      "ready_passive_preview",
      {
        reason: "All readiness stacks are visible as passive preview only.",
        selectedSide: "buy",
        selectedTicker: "NOKIA",
      },
    ),
    fixture("incomplete_profile", "Incomplete profile", "incomplete_profile", {
      profileReady: false,
      reason: "Ture Settings profile readiness is incomplete.",
      warnings: ["Complete the passive Avanza profile readiness check first."],
    }),
    fixture(
      "recommendation_source_buy",
      "Recommendation source buy",
      "ready_passive_preview",
      {
        selectedSide: "buy",
        selectedTicker: "NOKIA",
        source: "recommendation",
      },
    ),
    fixture(
      "recommendation_source_sell",
      "Recommendation source sell",
      "ready_passive_preview",
      {
        selectedSide: "sell",
        selectedTicker: "ERIC B",
        source: "recommendation",
      },
    ),
    fixture(
      "live_position_source_sell_exit",
      "Live position source sell/exit",
      "ready_passive_preview",
      {
        selectedSide: "sell",
        selectedTicker: "VOLV B",
        source: "live_position",
        warnings: ["Live position source remains passive and read-only."],
      },
    ),
    fixture(
      "local_dev_only_warning",
      "Local-dev only warning",
      "local_dev_only",
      {
        orderPrepReady: false,
        reason: "Readiness is modeled for local-dev visibility only.",
        warnings: ["Local-dev smoke tests are separate terminal-only steps."],
      },
    ),
    fixture("no_trade_ui_wiring", "No Trade UI wiring", "blocked", {
      blockedReasons: ["Trade UI execution wiring is not present."],
      reason: "Readiness preview confirms Trade UI execution is unavailable.",
    }),
    fixture("no_api_route_wiring", "No API route wiring", "blocked", {
      blockedReasons: ["API route execution wiring is disabled/not wired."],
      reason: "Readiness preview confirms API execution is unavailable.",
    }),
    fixture("no_browser_automation", "No browser automation", "blocked", {
      blockedReasons: ["Browser automation from app runtime is not wired."],
      reason: "Readiness preview confirms browser automation is unavailable.",
    }),
    fixture("final_click_forbidden", "Final click forbidden", "blocked", {
      blockedReasons: ["Final KÖP/SÄLJ click is human-only."],
      reason: "The agent must never click final KÖP/SÄLJ.",
    }),
    fixture(
      "order_submission_forbidden",
      "Order submission forbidden",
      "blocked",
      {
        blockedReasons: ["Order submission by agent is unavailable."],
        reason: "The passive preview cannot submit orders.",
      },
    ),
    fixture(
      "smoke_test_from_ui_forbidden",
      "Smoke test from UI forbidden",
      "blocked",
      {
        blockedReasons: ["Smoke tests cannot run from Trade UI."],
        reason: "Local-dev smoke tests are separate terminal-only flows.",
      },
    ),
    fixture("production_not_ready", "Production not ready", "blocked", {
      blockedReasons: ["Production readiness is not claimed."],
      reason: "The passive readiness preview is not production ready.",
    }),
  ];
