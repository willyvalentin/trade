import {
  buildAvanzaHeadlessExecutionContract,
  type AvanzaHeadlessExecutionContractInput,
} from "./avanza-headless-execution-data-contract";
import {
  selectNextAvanzaHeadlessExecutionContract,
  type AvanzaHeadlessExecutionContractSelectionReason,
  type AvanzaHeadlessExecutionContractSelectorResult,
  type AvanzaHeadlessExecutionContractSelectorStatus,
} from "./avanza-headless-execution-contract-selector";

export type AvanzaHeadlessExecutionContractSelectorFixtureId =
  | "selects_recommendation_entry_buy"
  | "selects_live_position_exit_over_entry"
  | "selects_stop_loss_exit_over_target"
  | "selects_target_exit_over_entry"
  | "selects_highest_confidence_entry"
  | "selects_best_reward_risk_entry"
  | "all_candidates_blocked"
  | "no_candidates"
  | "missing_ticker_candidate_blocked"
  | "market_order_candidate_blocked"
  | "ui_hidden_under_surface"
  | "no_order_submission"
  | "final_human_click_required";

export type AvanzaHeadlessExecutionContractSelectorFixture = {
  fixtureId: AvanzaHeadlessExecutionContractSelectorFixtureId;
  label: string;
  expectedStatus: AvanzaHeadlessExecutionContractSelectorStatus;
  expectedSelectionReason: AvanzaHeadlessExecutionContractSelectionReason;
  result: AvanzaHeadlessExecutionContractSelectorResult;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const entryBase: AvanzaHeadlessExecutionContractInput = {
  confidence: 0.75,
  entryPrice: 58.2,
  instrumentName: "Nokia Oyj",
  intent: "entry_buy",
  limitPrice: 58.4,
  orderType: "limit",
  profileReady: true,
  quantity: 120,
  recommendationId: "rec-selector-entry-001",
  rewardRisk: 2.1,
  side: "buy",
  source: "recommendation",
  stopLoss: 54.8,
  targetPrice: 66.8,
  ticker: "NOKIA",
};

const targetExit: AvanzaHeadlessExecutionContractInput = {
  confidence: 0.7,
  instrumentName: "Volvo B",
  intent: "exit_sell",
  limitPrice: 286.2,
  orderType: "limit",
  positionId: "position-selector-target-001",
  profileReady: true,
  quantity: 40,
  rewardRisk: 1.6,
  side: "sell",
  source: "live_position",
  stopLoss: 266.4,
  targetPrice: 286.2,
  ticker: "VOLV B",
  warnings: ["Target exit candidate modeled."],
};

const stopLossExit: AvanzaHeadlessExecutionContractInput = {
  ...targetExit,
  limitPrice: 266.4,
  positionId: "position-selector-stop-001",
  targetPrice: 286.2,
  warnings: ["Stop-loss exit candidate modeled."],
};

function fixture(
  fixtureId: AvanzaHeadlessExecutionContractSelectorFixtureId,
  label: string,
  expectedStatus: AvanzaHeadlessExecutionContractSelectorStatus,
  expectedSelectionReason: AvanzaHeadlessExecutionContractSelectionReason,
  input: Parameters<typeof selectNextAvanzaHeadlessExecutionContract>[0],
): AvanzaHeadlessExecutionContractSelectorFixture {
  return {
    expectedSelectionReason,
    expectedStatus,
    fixtureId,
    label,
    result: selectNextAvanzaHeadlessExecutionContract({
      now: fixtureNow,
      profileReady: true,
      ...input,
    }),
  };
}

export const avanzaHeadlessExecutionContractSelectorFixtures:
  AvanzaHeadlessExecutionContractSelectorFixture[] = [
    fixture(
      "selects_recommendation_entry_buy",
      "Selects recommendation entry BUY when no exits",
      "selected",
      "entry_buy_ready",
      {
        recommendations: [entryBase],
      },
    ),
    fixture(
      "selects_live_position_exit_over_entry",
      "Selects live-position exit SELL over recommendation entry",
      "selected",
      "target_exit_priority",
      {
        livePositions: [targetExit],
        recommendations: [entryBase],
      },
    ),
    fixture(
      "selects_stop_loss_exit_over_target",
      "Selects stop-loss exit over target exit",
      "selected",
      "stop_loss_exit_priority",
      {
        livePositions: [targetExit, stopLossExit],
        recommendations: [entryBase],
      },
    ),
    fixture(
      "selects_target_exit_over_entry",
      "Selects target exit over entry",
      "selected",
      "target_exit_priority",
      {
        livePositions: [targetExit],
        recommendations: [entryBase],
      },
    ),
    fixture(
      "selects_highest_confidence_entry",
      "Selects highest confidence entry",
      "selected",
      "highest_confidence",
      {
        recommendations: [
          { ...entryBase, confidence: 0.62, recommendationId: "rec-low-confidence" },
          { ...entryBase, confidence: 0.91, recommendationId: "rec-high-confidence" },
        ],
      },
    ),
    fixture(
      "selects_best_reward_risk_entry",
      "Selects best reward:risk when confidence ties",
      "selected",
      "best_reward_risk",
      {
        recommendations: [
          {
            ...entryBase,
            confidence: 0.8,
            recommendationId: "rec-lower-reward-risk",
            rewardRisk: 1.5,
          },
          {
            ...entryBase,
            confidence: 0.8,
            recommendationId: "rec-better-reward-risk",
            rewardRisk: 3.2,
          },
        ],
      },
    ),
    fixture(
      "all_candidates_blocked",
      "All candidates blocked",
      "all_candidates_blocked",
      "blocked_candidates_only",
      {
        recommendations: [
          buildAvanzaHeadlessExecutionContract({
            ...entryBase,
            blockers: ["Candidate blocked for fixture."],
          }),
        ],
      },
    ),
    fixture("no_candidates", "No candidates", "no_candidates", "no_valid_candidates", {
      recommendations: [],
      livePositions: [],
    }),
    fixture(
      "missing_ticker_candidate_blocked",
      "Missing ticker candidate blocked",
      "all_candidates_blocked",
      "blocked_candidates_only",
      {
        recommendations: [{ ...entryBase, ticker: undefined }],
      },
    ),
    fixture(
      "market_order_candidate_blocked",
      "Market order candidate blocked",
      "all_candidates_blocked",
      "blocked_candidates_only",
      {
        recommendations: [{ ...entryBase, orderType: "market_forbidden" }],
      },
    ),
    fixture(
      "ui_hidden_under_surface",
      "UI hidden under surface",
      "selected",
      "entry_buy_ready",
      {
        recommendations: [
          {
            ...entryBase,
            warnings: ["UI hidden under surface; selector remains agent-readable only."],
          },
        ],
      },
    ),
    fixture(
      "no_order_submission",
      "No order submission",
      "selected",
      "entry_buy_ready",
      {
        recommendations: [
          {
            ...entryBase,
            warnings: ["No order submission from selector output."],
          },
        ],
      },
    ),
    fixture(
      "final_human_click_required",
      "Final human click required",
      "selected",
      "entry_buy_ready",
      {
        recommendations: [
          {
            ...entryBase,
            warnings: ["Final human KÖP/SÄLJ required."],
          },
        ],
      },
    ),
  ];
