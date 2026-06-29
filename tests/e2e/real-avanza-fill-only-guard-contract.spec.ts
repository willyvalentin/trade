import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  classifyRealAvanzaFillOnlyAction,
  evaluateRealAvanzaFillOnlyGuard,
  evaluateSelectorPolicyForFirstFillOnlyPoc,
  getForbiddenFinalSelectors,
  getRequiredFirstFillOnlySelectors,
  isGeneratedSelectorStrategyRejected,
  isSelectorAllowedReadForFirstPoc,
  isSelectorBlockedForFirstPoc,
  isSelectorForbiddenFinalAction,
  isSelectorFutureFillCandidate,
} from "../../lib/real-avanza-fill-only-guard";
import {
  buildSemiAutoLivePositionSellPayload,
  buildSemiAutoRecommendationBuyPayload,
} from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const guardPath = join(repoRoot, "lib/real-avanza-fill-only-guard.ts");
const now = "2026-06-29T14:30:00.000Z";

const buyInput = {
  recommendation_id: "rec-real-avanza-fill-guard-001",
  recommendation_fingerprint: "recommendation-real-avanza-fill-guard-fp-001",
  ticker: "VOLV B",
  quantity: 4,
  order_type: "limit",
  entry_price: 200,
  limit_price: 200,
  stop_price: 195,
  target_price: 215,
  created_at: "2026-06-29T14:25:00.000Z",
  expires_at: "2026-06-29T14:45:00.000Z",
  stale_after: "2026-06-29T14:40:00.000Z",
  broker_target_label: "Real Avanza fill-only POC guard fixture",
} as const;

function buyPayload(
  overrides: Partial<SemiAutoAvanzaAgentPayload> = {},
): SemiAutoAvanzaAgentPayload {
  return {
    ...buildSemiAutoRecommendationBuyPayload(buyInput, { now }).payload,
    ...overrides,
  };
}

function sellPayload(): SemiAutoAvanzaAgentPayload {
  return buildSemiAutoLivePositionSellPayload(
    {
      position_id: "position-real-avanza-fill-guard-001",
      ticker: "VOLV B",
      quantity: 4,
      order_type: "limit_reference",
      entry_price: 200,
      limit_price: 200,
      stop_price: 195,
      target_price: 215,
      intent: "manual_exit",
      created_at: "2026-06-29T14:25:00.000Z",
      expires_at: "2026-06-29T14:45:00.000Z",
      stale_after: "2026-06-29T14:40:00.000Z",
      broker_target_label: "Real Avanza fill-only POC guard fixture",
    },
    { now },
  ).payload;
}

function evaluate(
  overrides: Partial<Parameters<typeof evaluateRealAvanzaFillOnlyGuard>[0]> = {},
) {
  return evaluateRealAvanzaFillOnlyGuard({
    payload: buyPayload(),
    order_form: "avancerad",
    currency: "SEK",
    ...overrides,
  });
}

test.describe("real Avanza fill-only guard contract", () => {
  test("approves valid semi-auto Avancerad buy within the 1000 SEK cap for future fill-only POC", () => {
    const decision = evaluate();

    expect(decision).toMatchObject({
      approved_for_fill_only_poc: true,
      blocking_reasons: [],
      notional_amount_sek: 800,
      status: "approved_for_fill_only_poc",
    });
    expect(decision.policy_flags).toEqual({
      max_amount_cap_sek: 1000,
      automatic_submit_allowed_false: true,
      final_submit_forbidden: true,
      human_final_confirmation_required: true,
      advanced_buy_only: true,
      cap_never_authorizes_submit: true,
    });
    expect(decision.selector_policy.status).toBe("ready");
    expect(decision.selector_policy.required_selectors_present).toBe(true);
    expect(decision.selector_policy.forbidden_final_selectors).toEqual(
      expect.arrayContaining([
        'button[data-e2e="confirmOrderButton"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
      ]),
    );
  });

  test("blocks the same Avancerad buy above the 1000 SEK cap", () => {
    const decision = evaluate({
      payload: buyPayload({ quantity: 6 }),
    });

    expect(decision.status).toBe("blocked");
    expect(decision.notional_amount_sek).toBe(1200);
    expect(decision.blocking_reasons).toContain("cap_exceeded");
  });

  test("blocks missing cap inputs when no explicit total is present", () => {
    const decision = evaluate({
      payload: buyPayload({ quantity: 0, entry_price: null, limit_price: null }),
    });

    expect(decision.status).toBe("blocked");
    expect(decision.notional_amount_sek).toBeNull();
    expect(decision.blocking_reasons).toEqual(
      expect.arrayContaining([
        "missing_quantity_or_amount",
        "missing_price",
        "cap_cannot_be_calculated",
      ]),
    );
  });

  test("blocks unknown currency or missing FX conversion", () => {
    const decision = evaluate({
      currency: "USD",
      fx_to_sek_rate: null,
    });

    expect(decision.status).toBe("blocked");
    expect(decision.notional_amount_sek).toBeNull();
    expect(decision.blocking_reasons).toContain("unknown_currency_or_fx");
  });

  test("blocks automatic-submit-allowed payloads", () => {
    const payload = buyPayload({
      authority: {
        ...buyPayload().authority,
        automatic_submit_allowed: true,
        agent_can_submit_order: true,
      },
    } as never);
    const decision = evaluate({ payload });

    expect(decision.status).toBe("blocked");
    expect(decision.blocking_reasons).toEqual(
      expect.arrayContaining([
        "automatic_submit_allowed",
        "agent_submit_allowed",
      ]),
    );
  });

  test("blocks non-semi-auto payloads", () => {
    const decision = evaluate({
      payload: buyPayload({ mode: "automatic" } as never),
    });

    expect(decision.status).toBe("blocked");
    expect(decision.blocking_reasons).toContain("non_semi_auto_payload");
  });

  test("blocks sell payloads for the first POC", () => {
    const decision = evaluate({
      payload: sellPayload(),
    });

    expect(decision.status).toBe("blocked");
    expect(decision.blocking_reasons).toContain(
      "sell_deferred_for_first_poc",
    );
  });

  test("blocks Stop Loss order form for the first POC", () => {
    const decision = evaluate({
      order_form: "stop_loss",
    });

    expect(decision.status).toBe("blocked");
    expect(decision.blocking_reasons).toEqual(
      expect.arrayContaining([
        "unsupported_order_form",
        "stop_loss_deferred_for_first_poc",
      ]),
    );
  });

  test("blocks Glidande order form for the first POC", () => {
    const decision = evaluate({
      order_form: "glidande",
    });

    expect(decision.status).toBe("blocked");
    expect(decision.blocking_reasons).toEqual(
      expect.arrayContaining([
        "unsupported_order_form",
        "glidande_deferred_for_first_poc",
      ]),
    );
  });

  test("blocks missing quantity or amount", () => {
    const decision = evaluate({
      payload: buyPayload({ quantity: 0 }),
    });

    expect(decision.status).toBe("blocked");
    expect(decision.blocking_reasons).toEqual(
      expect.arrayContaining([
        "missing_quantity_or_amount",
        "cap_cannot_be_calculated",
      ]),
    );
  });

  test("blocks missing price unless explicit total SEK is present", () => {
    const missingPrice = evaluate({
      payload: buyPayload({ entry_price: null, limit_price: null }),
    });
    const explicitTotal = evaluate({
      payload: buyPayload({ entry_price: null, limit_price: null }),
      explicit_total_amount_sek: 900,
    });

    expect(missingPrice.status).toBe("blocked");
    expect(missingPrice.blocking_reasons).toEqual(
      expect.arrayContaining(["missing_price", "cap_cannot_be_calculated"]),
    );

    expect(explicitTotal.status).toBe("approved_for_fill_only_poc");
    expect(explicitTotal.notional_amount_sek).toBe(900);
    expect(explicitTotal.blocking_reasons).toEqual([]);
  });

  test("always forbids final submit action", () => {
    const decision = evaluate({
      requested_action: "final_submit",
    });

    expect(decision.status).toBe("blocked");
    expect(decision.blocking_reasons).toContain(
      "final_submit_action_forbidden",
    );
  });

  test("classifies Bekrafta kop and Bekrafta salj strings as forbidden final actions", () => {
    for (const action of [
      "Bekräfta köp",
      "Bekrafta kop",
      "Bekräfta sälj",
      "Bekrafta salj",
    ]) {
      expect(classifyRealAvanzaFillOnlyAction(action)).toBe(
        "final_submit_forbidden",
      );
    }
  });

  test("cap never authorizes submit", () => {
    const decision = evaluate();

    expect(decision.approved_for_fill_only_poc).toBe(true);
    expect(decision.policy_flags.cap_never_authorizes_submit).toBe(true);
    expect(decision.policy_flags.final_submit_forbidden).toBe(true);
  });

  test("exposes final forbidden selectors from the selector contract", () => {
    expect(getForbiddenFinalSelectors()).toEqual(
      expect.arrayContaining([
        'button[data-e2e="confirmOrderButton"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
      ]),
    );
    expect(isSelectorForbiddenFinalAction('button[data-e2e="confirmOrderButton"]')).toBe(
      true,
    );
    expect(
      isSelectorForbiddenFinalAction(
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
      ),
    ).toBe(true);
    expect(
      isSelectorForbiddenFinalAction(
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
      ),
    ).toBe(true);
  });

  test("keeps review buttons blocked for first POC without classifying them as final", () => {
    const reviewBuy = 'button[data-e2e="orderButton"][data-mint-button-theme="buy"]';
    const reviewSell =
      'button[data-e2e="orderButton"][data-mint-button-theme="sell"]';

    expect(isSelectorForbiddenFinalAction(reviewBuy)).toBe(false);
    expect(isSelectorBlockedForFirstPoc(reviewBuy)).toBe(true);
    expect(isSelectorForbiddenFinalAction(reviewSell)).toBe(false);
    expect(isSelectorBlockedForFirstPoc(reviewSell)).toBe(true);

    const policy = evaluateSelectorPolicyForFirstFillOnlyPoc();

    expect(policy.review_selectors_blocked_by_default).toEqual(
      expect.arrayContaining([reviewBuy, reviewSell]),
    );
  });

  test("keeps amount, quantity, and price as future fill candidates that still require approval", () => {
    for (const selector of [
      'input[data-e2e="inputAmount"]',
      'input[data-e2e="inputVolume"]',
      'input[data-e2e="inputPrice"]',
    ]) {
      expect(isSelectorFutureFillCandidate(selector)).toBe(true);
      expect(isSelectorForbiddenFinalAction(selector)).toBe(false);
    }

    const policy = evaluateSelectorPolicyForFirstFillOnlyPoc();

    expect(policy.future_fill_candidate_selectors).toEqual(
      expect.arrayContaining([
        'input[data-e2e="inputAmount"]',
        'input[data-e2e="inputVolume"]',
        'input[data-e2e="inputPrice"]',
      ]),
    );
  });

  test("requires total amount selector metadata for cap verification", () => {
    const policy = evaluateSelectorPolicyForFirstFillOnlyPoc();
    const missingTotal = evaluateSelectorPolicyForFirstFillOnlyPoc({
      available_selector_keys: policy.required_selector_keys.filter(
        (key) => key !== "total_amount",
      ),
    });

    expect(policy.total_amount_required_for_cap_verification).toBe(true);
    expect(policy.required_selectors).toContain(
      'output[data-e2e="expandOrderAmount"]',
    );
    expect(missingTotal.status).toBe("blocked");
    expect(missingTotal.required_selectors_present).toBe(false);
    expect(missingTotal.missing_required_selector_keys).toContain("total_amount");
  });

  test("keeps account selector read-only and human verified", () => {
    const selector = 'button[aria-haspopup="listbox"]';
    const policy = evaluateSelectorPolicyForFirstFillOnlyPoc();

    expect(isSelectorAllowedReadForFirstPoc(selector)).toBe(true);
    expect(isSelectorFutureFillCandidate(selector)).toBe(false);
    expect(isSelectorBlockedForFirstPoc(selector)).toBe(false);
    expect(policy.account_selector_read_only_human_verify).toBe(true);
  });

  test("blocks sell-side, Stop Loss, Glidande, and generated selector strategies for first POC readiness", () => {
    const sellSide =
      'button[data-e2e="switchSideButton"][aria-label="Byt till köp"]';
    const stopLoss =
      'mint-toggle-switch-option[data-e2e="selectOrderTypeOption_StopLossAbsolute"]';
    const glidande =
      'mint-toggle-switch-option[data-e2e="selectOrderTypeOption_StopLossDelta"]';

    for (const selector of [sellSide, stopLoss, glidande]) {
      expect(isSelectorBlockedForFirstPoc(selector)).toBe(true);
    }

    expect(isGeneratedSelectorStrategyRejected("#list-item-link-0")).toBe(true);
    expect(isGeneratedSelectorStrategyRejected("#aza-select-id-3")).toBe(true);
    expect(isGeneratedSelectorStrategyRejected("[_ngcontent-ng-c123]")).toBe(true);

    const rejected = evaluateSelectorPolicyForFirstFillOnlyPoc({
      requested_selectors: ["#list-item-link-0"],
    });

    expect(rejected.status).toBe("blocked");
    expect(rejected.generated_selector_strategy_rejected).toBe(true);
    expect(rejected.rejected_generated_selectors).toContain("#list-item-link-0");
  });

  test("requires buy-side and Avancerad/Limit selector readiness", () => {
    const required = getRequiredFirstFillOnlySelectors();
    const policy = evaluateSelectorPolicyForFirstFillOnlyPoc();

    expect(required).toEqual(
      expect.arrayContaining([
        '[data-e2e="orderMarketInfoPanel"]',
        'button[data-e2e="switchSideButton"][aria-label="Byt till sälj"]',
        'input[type="radio"][value="Limit"]',
        'input[data-e2e="inputAmount"]',
        'input[data-e2e="inputPrice"]',
        'output[data-e2e="expandOrderAmount"]',
      ]),
    );
    expect(policy.side_buy_state_required).toBe(true);
    expect(policy.limit_order_type_required).toBe(true);
  });

  test("no selector policy can make a final selector allowed", () => {
    const finalSelector = 'button[data-e2e="confirmOrderButton"]';
    const policy = evaluateSelectorPolicyForFirstFillOnlyPoc({
      requested_selectors: [finalSelector],
    });

    expect(isSelectorForbiddenFinalAction(finalSelector)).toBe(true);
    expect(isSelectorBlockedForFirstPoc(finalSelector)).toBe(true);
    expect(isSelectorAllowedReadForFirstPoc(finalSelector)).toBe(false);
    expect(isSelectorFutureFillCandidate(finalSelector)).toBe(false);
    expect(policy.status).toBe("blocked");
    expect(policy.forbidden_selectors_present).toContain(finalSelector);
  });

  test("human final confirmation remains required", () => {
    const decision = evaluate();
    const missingHumanConfirmation = evaluate({
      payload: buyPayload({
        authority: {
          ...buyPayload().authority,
          human_final_confirmation_required: false,
        },
      } as never),
    });

    expect(decision.policy_flags.human_final_confirmation_required).toBe(true);
    expect(missingHumanConfirmation.status).toBe("blocked");
    expect(missingHumanConfirmation.blocking_reasons).toContain(
      "human_final_confirmation_not_required",
    );
  });

  test("guard source has no browser or Avanza automation imports", () => {
    const source = readFileSync(guardPath, "utf8");

    for (const forbidden of [
      "@playwright/test",
      "playwright",
      "puppeteer",
      "chromium",
      "firefox",
      "webkit",
      ".goto(",
      ".click(",
      ".locator(",
      "avanza.se",
      "real-avanza-browser-agent",
      "avanza-browser-agent",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  test("guard source has no fetch, Supabase, service-role, env, provider, route, or scan imports", () => {
    const source = readFileSync(guardPath, "utf8");

    for (const forbidden of [
      "fetch(",
      "createClient",
      ".from(",
      ".insert(",
      "Supabase",
      "SUPABASE",
      "SERVICE_ROLE",
      "service-role",
      "process.env",
      "provider",
      "run-scan",
      "/api/",
      "scanner",
      "market-loop",
      "recordTrade",
      "updateTrade",
      "trade_stats_pnl_mutated: true",
      "document.",
      "window.",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
