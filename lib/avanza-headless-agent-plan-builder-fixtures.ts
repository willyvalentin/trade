import {
  buildAvanzaHeadlessExecutionContract,
  type AvanzaHeadlessExecutionContractInput,
} from "./avanza-headless-execution-data-contract";
import {
  selectNextAvanzaHeadlessExecutionContract,
} from "./avanza-headless-execution-contract-selector";
import {
  buildAvanzaHeadlessAgentPlan,
  type AvanzaHeadlessAgentPlan,
  type AvanzaHeadlessAgentPlanStatus,
} from "./avanza-headless-agent-plan-builder";

export type AvanzaHeadlessAgentPlanBuilderFixtureId =
  | "recommendation_entry_buy_ready_plan"
  | "live_position_exit_sell_ready_plan"
  | "missing_selected_contract"
  | "selected_contract_blocked"
  | "incomplete_contract"
  | "market_order_blocked"
  | "profile_incomplete_warning"
  | "login_unknown_plan"
  | "private_customer_login_path"
  | "company_customer_login_path"
  | "stop_before_final_confirmation"
  | "user_final_click_required"
  | "bankid_forbidden_manual_only"
  | "settlement_reconciliation_planned"
  | "no_order_submission"
  | "no_supabase_write"
  | "ui_hidden_under_surface";

export type AvanzaHeadlessAgentPlanBuilderFixture = {
  fixtureId: AvanzaHeadlessAgentPlanBuilderFixtureId;
  label: string;
  expectedStatus: AvanzaHeadlessAgentPlanStatus;
  plan: AvanzaHeadlessAgentPlan;
};

const fixtureNow = "2026-07-06T12:00:00.000Z";

const recommendationBuy: AvanzaHeadlessExecutionContractInput = {
  confidence: 0.82,
  entryPrice: 58.2,
  instrumentName: "Nokia Oyj",
  intent: "entry_buy",
  isin: "FI0009000681",
  limitPrice: 58.4,
  marketPlace: "Stockholm",
  orderType: "limit",
  profileReady: true,
  quantity: 120,
  recommendationId: "rec-plan-buy-001",
  rewardRisk: 2.4,
  side: "buy",
  source: "recommendation",
  stopLoss: 54.8,
  targetPrice: 66.8,
  ticker: "NOKIA",
};

const livePositionSell: AvanzaHeadlessExecutionContractInput = {
  confidence: 0.74,
  instrumentName: "Volvo B",
  intent: "exit_sell",
  isin: "SE0000115446",
  limitPrice: 286.2,
  marketPlace: "Stockholm",
  orderType: "limit",
  positionId: "position-plan-sell-001",
  profileReady: true,
  quantity: 40,
  rewardRisk: 1.7,
  side: "sell",
  source: "live_position",
  stopLoss: 266.4,
  targetPrice: 286.2,
  ticker: "VOLV B",
  warnings: ["Target exit candidate modeled."],
};

function selectedPlan(
  selectedContractInput: AvanzaHeadlessExecutionContractInput,
  overrides: Parameters<typeof buildAvanzaHeadlessAgentPlan>[0] = {},
) {
  const selectorResult = selectNextAvanzaHeadlessExecutionContract({
    livePositions:
      selectedContractInput.source === "live_position"
        ? [selectedContractInput]
        : [],
    now: fixtureNow,
    profileReady: selectedContractInput.profileReady === true,
    recommendations:
      selectedContractInput.source === "recommendation"
        ? [selectedContractInput]
        : [],
  });

  return buildAvanzaHeadlessAgentPlan({
    customerType: "private",
    loginKnown: true,
    now: fixtureNow,
    profileReady: selectedContractInput.profileReady === true,
    selectorResult,
    ...overrides,
  });
}

function fixture(
  fixtureId: AvanzaHeadlessAgentPlanBuilderFixtureId,
  label: string,
  expectedStatus: AvanzaHeadlessAgentPlanStatus,
  plan: AvanzaHeadlessAgentPlan,
): AvanzaHeadlessAgentPlanBuilderFixture {
  return { expectedStatus, fixtureId, label, plan };
}

export const avanzaHeadlessAgentPlanBuilderFixtures:
  AvanzaHeadlessAgentPlanBuilderFixture[] = [
    fixture(
      "recommendation_entry_buy_ready_plan",
      "Recommendation BUY ready plan",
      "ready_plan",
      selectedPlan(recommendationBuy),
    ),
    fixture(
      "live_position_exit_sell_ready_plan",
      "Live-position SELL ready plan",
      "ready_plan",
      selectedPlan(livePositionSell),
    ),
    fixture(
      "missing_selected_contract",
      "Missing selected contract",
      "missing_selected_contract",
      buildAvanzaHeadlessAgentPlan({ now: fixtureNow }),
    ),
    fixture(
      "selected_contract_blocked",
      "Selected contract blocked",
      "selected_contract_blocked",
      buildAvanzaHeadlessAgentPlan({
        now: fixtureNow,
        profileReady: true,
        selectedContract: buildAvanzaHeadlessExecutionContract({
          ...recommendationBuy,
          blockers: ["Risk policy blocked this fixture."],
          now: fixtureNow,
        }),
      }),
    ),
    fixture(
      "incomplete_contract",
      "Incomplete contract",
      "incomplete_contract",
      buildAvanzaHeadlessAgentPlan({
        now: fixtureNow,
        profileReady: true,
        selectedContract: buildAvanzaHeadlessExecutionContract({
          ...recommendationBuy,
          now: fixtureNow,
          quantity: undefined,
        }),
      }),
    ),
    fixture(
      "market_order_blocked",
      "Market order blocked",
      "unsafe_contract",
      buildAvanzaHeadlessAgentPlan({
        now: fixtureNow,
        profileReady: true,
        selectedContract: buildAvanzaHeadlessExecutionContract({
          ...recommendationBuy,
          now: fixtureNow,
          orderType: "market_forbidden",
        }),
      }),
    ),
    fixture(
      "profile_incomplete_warning",
      "Profile incomplete warning",
      "ready_plan",
      selectedPlan(
        {
          ...recommendationBuy,
          profileReady: false,
        },
        { profileReady: false },
      ),
    ),
    fixture(
      "login_unknown_plan",
      "Login unknown plan",
      "ready_plan",
      selectedPlan(recommendationBuy, { loginKnown: false }),
    ),
    fixture(
      "private_customer_login_path",
      "Private customer login path",
      "ready_plan",
      selectedPlan(recommendationBuy, { customerType: "private" }),
    ),
    fixture(
      "company_customer_login_path",
      "Company customer login path",
      "ready_plan",
      selectedPlan(recommendationBuy, { customerType: "company" }),
    ),
    fixture(
      "stop_before_final_confirmation",
      "Stop before final confirmation",
      "ready_plan",
      selectedPlan(recommendationBuy),
    ),
    fixture(
      "user_final_click_required",
      "User final click required",
      "ready_plan",
      selectedPlan(recommendationBuy),
    ),
    fixture(
      "bankid_forbidden_manual_only",
      "BankID forbidden manual-only",
      "ready_plan",
      selectedPlan(recommendationBuy, { loginKnown: false }),
    ),
    fixture(
      "settlement_reconciliation_planned",
      "Settlement reconciliation planned",
      "ready_plan",
      selectedPlan(livePositionSell),
    ),
    fixture(
      "no_order_submission",
      "No order submission",
      "ready_plan",
      selectedPlan(recommendationBuy),
    ),
    fixture(
      "no_supabase_write",
      "No Supabase write",
      "ready_plan",
      selectedPlan(recommendationBuy),
    ),
    fixture(
      "ui_hidden_under_surface",
      "UI hidden under surface",
      "ready_plan",
      selectedPlan(recommendationBuy),
    ),
  ];
