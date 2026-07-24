import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  findRealAvanzaSelectorMappingEntry,
  realAvanzaDeferredSelectorKeys,
  realAvanzaDisallowedStableSelectorStrategies,
  realAvanzaFirstFillOnlyRequiredSelectorKeys,
  realAvanzaForbiddenFinalSelectors,
  realAvanzaSelectorMapping,
} from "../../lib/real-avanza-selector-mapping-contract";

const repoRoot = process.cwd();
const contractPath = join(repoRoot, "lib/real-avanza-selector-mapping-contract.ts");

const criticalEntries = [
  "open_search_button",
  "search_input",
  "search_result_row",
  "instrument_market_info_panel",
  "account_selector_collapsed",
  "account_selected_option",
  "side_switch_buy_state",
  "side_switch_sell_state",
  "amount_input",
  "quantity_input",
  "price_input",
  "order_type_limit_checked",
  "order_type_stop_loss",
  "order_type_glidande",
  "order_type_active_indicator",
  "fees_total",
  "total_amount",
  "expanded_fee_fx_details",
  "review_buy_button",
  "review_sell_button",
  "confirmation_modal",
  "final_confirm_button",
  "final_confirm_buy_button",
  "final_confirm_sell_button",
  "cancel_button",
] as const;

function entry(key: string) {
  const item = findRealAvanzaSelectorMappingEntry(key);

  if (!item) {
    throw new Error(`Missing selector mapping entry: ${key}`);
  }

  return item;
}

test.describe("real Avanza selector mapping contract", () => {
  test("includes all critical selector entries from the Action 1016 evidence", () => {
    const keys = realAvanzaSelectorMapping.map((item) => item.key);

    for (const key of criticalEntries) {
      expect(keys).toContain(key);
    }
  });

  test("marks final confirm selectors as hard-stop forbidden final actions", () => {
    const general = entry("final_confirm_button");
    const buy = entry("final_confirm_buy_button");
    const sell = entry("final_confirm_sell_button");

    for (const item of [general, buy, sell]) {
      expect(item.classifications).toContain("forbidden_final_action");
      expect(item.firstPocBehavior).toBe("forbidden");
      expect(item.hardStop).toBe(true);
    }

    expect(realAvanzaForbiddenFinalSelectors).toEqual(
      expect.arrayContaining([
        'button[data-e2e="confirmOrderButton"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
      ]),
    );
  });

  test("keeps review buttons non-final but blocked for the first POC", () => {
    const buy = entry("review_buy_button");
    const sell = entry("review_sell_button");

    expect(buy.selector).toBe(
      'button[data-e2e="orderButton"][data-mint-button-theme="buy"]',
    );
    expect(buy.classifications).not.toContain("forbidden_final_action");
    expect(buy.classifications).toContain("future_click_candidate");
    expect(buy.firstPocBehavior).toBe("block");

    expect(sell.selector).toBe(
      'button[data-e2e="orderButton"][data-mint-button-theme="sell"]',
    );
    expect(sell.classifications).toContain("deferred");
    expect(sell.classifications).not.toContain("forbidden_final_action");
    expect(sell.firstPocBehavior).toBe("block");
  });

  test("keeps amount, quantity, and price as future fill candidates requiring human verification", () => {
    for (const key of ["amount_input", "quantity_input", "price_input"]) {
      const item = entry(key);

      expect(item.classifications).toContain("future_fill_candidate");
      expect(item.classifications).toContain("human_verify_required");
      expect(item.firstPocBehavior).toBe("allowed_fill_after_approval");
      expect(item.stability).toBe("high");
    }
  });

  test("requires total amount as read-only cap verification", () => {
    const total = entry("total_amount");

    expect(total.selector).toBe('output[data-e2e="expandOrderAmount"]');
    expect(total.classifications).toContain("read_only");
    expect(total.classifications).toContain("human_verify_required");
    expect(total.firstPocBehavior).toBe("allowed_read");
    expect(total.requiredForFirstFillOnlyPoc).toBe(true);
    expect(total.riskNotes.join(" ")).toContain("1,000 SEK cap");
  });

  test("keeps account selectors read-only and human-verified", () => {
    for (const key of ["account_selector_collapsed", "account_selected_option"]) {
      const item = entry(key);

      expect(item.classifications).toContain("read_only");
      expect(item.classifications).toContain("human_verify_required");
      expect(item.firstPocBehavior).toBe("allowed_read");
      expect(item.classifications).not.toContain("future_fill_candidate");
      expect(item.classifications).not.toContain("future_click_candidate");
    }
  });

  test("encodes buy and sell side state boundaries", () => {
    const buy = entry("side_switch_buy_state");
    const sell = entry("side_switch_sell_state");

    expect(buy.selector).toContain('aria-label="Byt till sälj"');
    expect(buy.firstPocBehavior).toBe("allowed_read");
    expect(buy.requiredForFirstFillOnlyPoc).toBe(true);

    expect(sell.selector).toContain('aria-label="Byt till köp"');
    expect(sell.classifications).toContain("deferred");
    expect(sell.firstPocBehavior).toBe("block");
  });

  test("requires Avancerad Limit and blocks Stop Loss and Glidande", () => {
    const limit = entry("order_type_limit_checked");
    const stopLoss = entry("order_type_stop_loss");
    const glidande = entry("order_type_glidande");

    expect(limit.selector).toBe('input[type="radio"][value="Limit"]');
    expect(limit.classifications).toContain("read_only");
    expect(limit.requiredForFirstFillOnlyPoc).toBe(true);
    expect(limit.firstPocBehavior).toBe("allowed_read");

    for (const item of [stopLoss, glidande]) {
      expect(item.classifications).toContain("deferred");
      expect(item.firstPocBehavior).toBe("block");
    }
  });

  test("keeps search-stage selectors deferred unless separately approved", () => {
    for (const key of [
      "open_search_button",
      "search_input",
      "search_result_row",
    ]) {
      const item = entry(key);

      expect(item.stages).toContain("search_stage");
      expect(item.classifications).toContain("deferred");
      expect(item.firstPocBehavior).toBe("block");
      expect(realAvanzaDeferredSelectorKeys).toContain(key);
    }
  });

  test("lists generated ids/classes as disallowed stable selector strategies", () => {
    expect(realAvanzaDisallowedStableSelectorStrategies).toEqual(
      expect.arrayContaining([
        "_ngcontent-*",
        "_nghost-*",
        "generated ids such as aza-select-id-3",
        "#list-item-link-0",
      ]),
    );
  });

  test("does not permit final submit or review clicks in first POC behavior", () => {
    for (const item of realAvanzaSelectorMapping) {
      if (item.classifications.includes("forbidden_final_action")) {
        expect(item.firstPocBehavior).toBe("forbidden");
      }

      if (item.selector.includes("orderButton")) {
        expect(item.firstPocBehavior).toBe("block");
      }
    }

    expect(
      realAvanzaFirstFillOnlyRequiredSelectorKeys,
    ).toEqual(
      expect.arrayContaining([
        "instrument_market_info_panel",
        "account_selector_collapsed",
        "side_switch_buy_state",
        "amount_input",
        "price_input",
        "order_type_limit_checked",
        "total_amount",
      ]),
    );
  });

  test("module remains pure static data with no browser, route, env, provider, or audit imports", () => {
    const source = readFileSync(contractPath, "utf8");

    expect(source).not.toMatch(/^import\s/m);
    expect(source).not.toContain("document.");
    expect(source).not.toContain("window.");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("@supabase");
    expect(source).not.toContain("SERVICE_ROLE");
    expect(source).not.toContain("/api/");
    expect(source).not.toContain("provider");
    expect(source).not.toContain("audit-writer");
    expect(source).not.toContain("playwright");
    expect(source).not.toContain("puppeteer");
    expect(source).not.toContain("chromium");
  });
});
