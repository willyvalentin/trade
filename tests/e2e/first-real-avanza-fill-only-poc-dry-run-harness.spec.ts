import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFirstFillOnlyPocDryRunDecision,
  type FirstFillOnlyPocDryRunDecisionInput,
} from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const harnessPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-dry-run-harness.ts",
);
const now = "2026-06-29T15:30:00.000Z";

type SafeInputOverrides = Partial<
  Omit<
    FirstFillOnlyPocDryRunDecisionInput,
    "static_payload" | "selector_readiness" | "operator_approval"
  >
> & {
  static_payload?: Partial<FirstFillOnlyPocDryRunDecisionInput["static_payload"]>;
  selector_readiness?: Partial<
    FirstFillOnlyPocDryRunDecisionInput["selector_readiness"]
  >;
  operator_approval?: Partial<
    FirstFillOnlyPocDryRunDecisionInput["operator_approval"]
  >;
};

function buyPayload(
  overrides: Partial<SemiAutoAvanzaAgentPayload> = {},
): SemiAutoAvanzaAgentPayload {
  return {
    ...buildSemiAutoRecommendationBuyPayload(
      {
        recommendation_id: "rec-first-fill-only-poc-harness-001",
        recommendation_fingerprint: "first-fill-only-poc-harness-fp-001",
        ticker: "GME",
        quantity: 1,
        order_type: "limit",
        entry_price: 800,
        limit_price: 800,
        stop_price: 760,
        target_price: 900,
        created_at: "2026-06-29T15:25:00.000Z",
        expires_at: "2026-06-29T15:45:00.000Z",
        stale_after: "2026-06-29T15:40:00.000Z",
        broker_target_label: "First fill-only POC harness fixture",
      },
      { now },
    ).payload,
    ...overrides,
  };
}

function safeInput(overrides: SafeInputOverrides = {}): FirstFillOnlyPocDryRunDecisionInput {
  const base: FirstFillOnlyPocDryRunDecisionInput = {
    static_payload: {
      payload: buyPayload(),
      order_form: "avancerad",
      requested_action: "fill_only",
      max_amount_cap_sek: 1000,
      currency: "SEK",
      order_type: "limit",
      side: "buy",
    },
    selector_readiness: {
      available_selector_keys: getRequiredFirstFillOnlySelectorKeys(),
      requested_selectors: [],
      sizing_mode: "amount",
      total_amount_selector_available: true,
      total_amount_text: "800 SEK",
      generated_selector_strategy_used: false,
      validation_errors: [],
      review_click_requested: false,
    },
    operator_approval: {
      approval_decision: "approved_for_stub_only",
      account_human_verified: true,
      instrument_human_verified: true,
      price_currency_human_verified: true,
    },
  };

  return {
    ...base,
    ...overrides,
    static_payload: {
      ...base.static_payload,
      ...overrides.static_payload,
    },
    selector_readiness: {
      ...base.selector_readiness,
      ...overrides.selector_readiness,
    },
    operator_approval: {
      ...base.operator_approval,
      ...overrides.operator_approval,
    },
  };
}

test.describe("first real Avanza fill-only POC dry-run harness stub", () => {
  test("returns not_approved when approval is missing", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        operator_approval: {
          approval_decision: "not_approved_yet",
          account_human_verified: true,
          instrument_human_verified: true,
          price_currency_human_verified: true,
        },
      }),
    );

    expect(decision.status).toBe("not_approved");
    expect(decision.approved_for_stub_only).toBe(false);
    expect(decision.blocked_reasons).toContain("approval_missing");
  });

  test("returns approved_for_stub_only for a safe local-only simulation", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(safeInput());

    expect(decision.status).toBe("approved_for_stub_only");
    expect(decision.approved_for_stub_only).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.parsed_total_amount_sek).toBe(800);
    expect(decision.guard_status).toBe("approved_for_fill_only_poc");
    expect(decision.selector_policy_status).toBe("ready");
  });

  test("safe local simulation keeps every real-action flag false", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(safeInput());

    expect(decision.real_action_flags).toEqual({
      real_avanza_access: false,
      browser_automation: false,
      dom_querying: false,
      field_filling: false,
      clicking: false,
      submit: false,
      review_click_allowed: false,
      final_confirm_allowed: false,
    });
  });

  test("blocks if cap exceeds 1000 SEK", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        static_payload: { max_amount_cap_sek: 1001 },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("cap_exceeds_policy");
  });

  test("blocks if total amount selector metadata is missing", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        selector_readiness: {
          available_selector_keys: getRequiredFirstFillOnlySelectorKeys().filter(
            (key) => key !== "total_amount",
          ),
          total_amount_selector_available: false,
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toEqual(
      expect.arrayContaining([
        "selector_readiness_missing",
        "total_amount_selector_missing",
      ]),
    );
  });

  test("blocks if total amount cannot be parsed as SEK", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        selector_readiness: { total_amount_text: "800 USD" },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.parsed_total_amount_sek).toBeNull();
    expect(decision.blocked_reasons).toContain("total_amount_unparseable");
  });

  test("blocks if total amount exceeds cap", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        selector_readiness: { total_amount_text: "1 001 SEK" },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("total_amount_exceeds_cap");
  });

  test("blocks if automatic submit is true", () => {
    const base = buyPayload();
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        static_payload: {
          payload: {
            ...base,
            authority: {
              ...base.authority,
              automatic_submit_allowed: true,
            },
          } as never,
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toEqual(
      expect.arrayContaining([
        "fill_only_guard:automatic_submit_allowed",
        "fill_only_guard_blocked",
      ]),
    );
  });

  test("blocks if side is not buy", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        static_payload: {
          payload: buyPayload({ side: "sell" } as never),
          side: "sell",
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toEqual(
      expect.arrayContaining([
        "side_not_buy",
        "fill_only_guard:sell_deferred_for_first_poc",
      ]),
    );
  });

  test("blocks if order type is not Limit/Avancerad", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        static_payload: {
          payload: buyPayload({ order_type: "market" } as never),
          order_type: "market",
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("order_type_not_limit");
  });

  test("blocks if account is not human-verified", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        operator_approval: {
          approval_decision: "approved_for_stub_only",
          account_human_verified: false,
          instrument_human_verified: true,
          price_currency_human_verified: true,
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("account_not_human_verified");
  });

  test("blocks if instrument is not human-verified", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        operator_approval: {
          approval_decision: "approved_for_stub_only",
          account_human_verified: true,
          instrument_human_verified: false,
          price_currency_human_verified: true,
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("instrument_not_human_verified");
  });

  test("blocks if price/currency is not human-verified", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        operator_approval: {
          approval_decision: "approved_for_stub_only",
          account_human_verified: true,
          instrument_human_verified: true,
          price_currency_human_verified: false,
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "price_currency_not_human_verified",
    );
  });

  test("blocks if validation errors are present", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        selector_readiness: { validation_errors: ["ui_amount_warning"] },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("validation_errors_present");
  });

  test("fails safety if review click is requested", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        selector_readiness: { review_click_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("review_click_requested");
  });

  test("fails safety if any final confirm selector is targeted", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        selector_readiness: {
          requested_selectors: ['button[data-e2e="confirmOrderButton"]'],
        },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("final_selector_targeted");
  });

  test("fails safety if generated selector strategy is used", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(
      safeInput({
        selector_readiness: {
          requested_selectors: ["#list-item-link-0"],
          generated_selector_strategy_used: true,
        },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain(
      "generated_selector_strategy_used",
    );
  });

  test("exposes evidence requirements", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(safeInput());

    expect(decision.evidence_requirements).toEqual(
      expect.arrayContaining([
        "before_screenshot",
        "after_fill_screenshot",
        "guard_decision_output",
        "cap_decision_output",
        "selector_policy_output",
        "no_review_click_statement",
        "no_final_click_statement",
        "no_order_placed_statement",
      ]),
    );
  });

  test("exposes forbidden selectors", () => {
    const decision = buildFirstFillOnlyPocDryRunDecision(safeInput());

    expect(decision.forbidden_selectors).toEqual(
      expect.arrayContaining([
        'button[data-e2e="confirmOrderButton"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
      ]),
    );
  });

  test("module imports remain pure and local", () => {
    const source = readFileSync(harnessPath, "utf8");

    for (const forbidden of [
      "@playwright/test",
      "playwright",
      "puppeteer",
      "chromium",
      "document.",
      "window.",
      "fetch(",
      "process.env",
      "@supabase",
      "createClient",
      ".from(",
      ".insert(",
      "SERVICE_ROLE",
      "service-role",
      "/api/",
      "provider",
      "run-scan",
      "audit-writer",
      ".click(",
      ".locator(",
      ".goto(",
      "avanza.se",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
