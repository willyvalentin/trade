import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFirstRealAvanzaFillOnlyPocImplementationStubDecision,
  firstRealAvanzaFillOnlyPocBlockedSelectors,
  firstRealAvanzaFillOnlyPocForbiddenFinalSelectors,
  firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags,
  firstRealAvanzaFillOnlyPocPlannedFutureFieldTargets,
  type FirstRealAvanzaFillOnlyPocImplementationStubInput,
} from "../../lib/first-real-avanza-fill-only-poc-implementation-stub";
import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const stubPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-implementation-stub.ts",
);
const now = "2026-06-29T18:30:00.000Z";

function validApproval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-29T18:00:00.000Z",
      ends_at: "2026-06-29T19:00:00.000Z",
      evaluated_at: "2026-06-29T18:30:00.000Z",
    },
    operator_present: true,
    max_amount_cap_sek: 1000,
    scope: {
      buy_only: true,
      order_type: "limit",
      sizing_mode: "amount",
      stop_point: "before_granska_kop",
      review_click_allowed: false,
      review_click_requested: false,
      final_confirm_allowed: false,
      final_confirm_requested: false,
      credentials_or_2fa_handling_allowed: false,
      unattended_run_allowed: false,
    },
    acknowledgements: {
      no_final_confirm: true,
      no_review_click_first_poc: true,
      no_credentials_or_2fa_handling: true,
      no_unattended_run: true,
      account_human_verified: true,
      instrument_human_verified: true,
      kill_switch_cancel_plan: true,
      evidence_plan: true,
    },
  };

  return {
    ...base,
    ...overrides,
    approval_window: {
      ...base.approval_window,
      ...overrides.approval_window,
    },
    scope: {
      ...base.scope,
      ...overrides.scope,
    },
    acknowledgements: {
      ...base.acknowledgements,
      ...overrides.acknowledgements,
    },
  };
}

function buyPayload(
  overrides: Partial<SemiAutoAvanzaAgentPayload> = {},
): SemiAutoAvanzaAgentPayload {
  return {
    ...buildSemiAutoRecommendationBuyPayload(
      {
        recommendation_id: "rec-first-fill-only-poc-stub-001",
        recommendation_fingerprint: "first-fill-only-poc-stub-fp-001",
        ticker: "GME",
        quantity: 1,
        order_type: "limit",
        entry_price: 800,
        limit_price: 800,
        stop_price: 760,
        target_price: 900,
        created_at: "2026-06-29T18:25:00.000Z",
        expires_at: "2026-06-29T18:45:00.000Z",
        stale_after: "2026-06-29T18:40:00.000Z",
        broker_target_label: "First fill-only POC implementation stub fixture",
      },
      { now },
    ).payload,
    ...overrides,
  };
}

type DryRunOverrides = Partial<
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

function dryRun(overrides: DryRunOverrides = {}): FirstFillOnlyPocDryRunDecisionInput {
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
      approval_decision: "approved_for_first_fill_only_poc",
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

type SafeInputOverrides = Partial<
  Omit<FirstRealAvanzaFillOnlyPocImplementationStubInput, "approval" | "dry_run">
> & {
  approval?: Partial<FirstFillOnlyPocApprovalStateInput>;
  dry_run?: DryRunOverrides;
};

function safeInput(
  overrides: SafeInputOverrides = {},
): FirstRealAvanzaFillOnlyPocImplementationStubInput {
  return {
    approval: validApproval(overrides.approval),
    dry_run: dryRun(overrides.dry_run),
  };
}

test.describe("first real Avanza fill-only POC implementation stub", () => {
  test("defaults to not approved without explicit approval", () => {
    const decision = buildFirstRealAvanzaFillOnlyPocImplementationStubDecision({
      approval: {},
      dry_run: dryRun(),
    });

    expect(decision.status).toBe("not_approved");
    expect(decision.stub_ready).toBe(false);
    expect(decision.blocked_reasons).toContain("approval:not_approved_yet");
  });

  test("returns stub_ready only with valid approval and safe harness decision", () => {
    const decision =
      buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(safeInput());

    expect(decision.status).toBe("stub_ready");
    expect(decision.stub_ready).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.approval_state.status).toBe(
      "approved_for_first_fill_only_poc",
    );
    expect(decision.dry_run_decision.status).toBe("approved_for_stub_only");
  });

  test("never enables Avanza access", () => {
    expect(
      firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags
        .can_access_avanza,
    ).toBe(false);
  });

  test("never enables browser launch or control", () => {
    expect(
      firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags
        .can_launch_browser,
    ).toBe(false);
  });

  test("never enables DOM querying", () => {
    expect(
      firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags.can_query_dom,
    ).toBe(false);
  });

  test("never enables field filling in this action", () => {
    expect(
      firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags.can_fill_fields,
    ).toBe(false);
  });

  test("never enables review click", () => {
    expect(
      firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags
        .can_click_review,
    ).toBe(false);
  });

  test("never enables final confirm click", () => {
    expect(
      firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags
        .can_click_final_confirm,
    ).toBe(false);
  });

  test("never enables order submit", () => {
    expect(
      firstRealAvanzaFillOnlyPocImplementationStubCapabilityFlags
        .can_submit_order,
    ).toBe(false);
  });

  test("exposes planned amount, price, total, instrument, side, and order type selectors", () => {
    expect(firstRealAvanzaFillOnlyPocPlannedFutureFieldTargets).toEqual({
      amount: 'input[data-e2e="inputAmount"]',
      price: 'input[data-e2e="inputPrice"]',
      total: 'output[data-e2e="expandOrderAmount"]',
      instrument_summary: '[data-e2e="orderMarketInfoPanel"]',
      side_buy_verification:
        'button[data-e2e="switchSideButton"][aria-label="Byt till sälj"]',
      order_type_limit_verification: 'input[type="radio"][value="Limit"]',
    });
  });

  test("exposes forbidden final selectors", () => {
    expect(firstRealAvanzaFillOnlyPocForbiddenFinalSelectors).toEqual(
      expect.arrayContaining([
        'button[data-e2e="confirmOrderButton"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
      ]),
    );
  });

  test("exposes blocked review selector", () => {
    expect(firstRealAvanzaFillOnlyPocBlockedSelectors.review_buy_button).toBe(
      'button[data-e2e="orderButton"][data-mint-button-theme="buy"]',
    );
  });

  test("stop point is before review button", () => {
    const decision =
      buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(safeInput());

    expect(decision.stop_point).toBe("before_review_button");
  });

  test("blocks if approval is missing", () => {
    const decision = buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(
      safeInput({ approval: { explicit_user_approval: false } }),
    );

    expect(decision.status).toBe("not_approved");
    expect(decision.blocked_reasons).toContain(
      "approval:explicit_user_approval_missing",
    );
  });

  test("blocks if approval allows review click", () => {
    const decision = buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(
      safeInput({ approval: { scope: { review_click_allowed: true } } }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain(
      "approval:review_click_allowed_or_requested",
    );
  });

  test("blocks if approval allows final confirm", () => {
    const decision = buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(
      safeInput({ approval: { scope: { final_confirm_allowed: true } } }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain(
      "approval:final_confirm_allowed_or_requested",
    );
  });

  test("blocks if cap exceeds 1000 SEK", () => {
    const decision = buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(
      safeInput({
        approval: { max_amount_cap_sek: 1001 },
        dry_run: { static_payload: { max_amount_cap_sek: 1001 } },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toEqual(
      expect.arrayContaining([
        "approval:cap_exceeds_policy",
        "dry_run:cap_exceeds_policy",
      ]),
    );
  });

  test("blocks if side is invalid", () => {
    const decision = buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(
      safeInput({
        approval: { scope: { buy_only: false } },
        dry_run: {
          static_payload: {
            side: "sell",
            payload: buyPayload({ side: "sell" } as never),
          },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("approval:scope_not_buy_only");
    expect(decision.blocked_reasons).toContain("dry_run:side_not_buy");
  });

  test("blocks if order type is invalid", () => {
    const decision = buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(
      safeInput({
        approval: { scope: { order_type: "stop_loss" } },
        dry_run: {
          static_payload: {
            order_form: "stop_loss",
            order_type: "stop_loss",
          },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("approval:order_type_not_limit");
    expect(decision.blocked_reasons).toContain("dry_run:order_type_not_limit");
  });

  test("blocks if selector policy or harness decision fails", () => {
    const decision = buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(
      safeInput({
        dry_run: {
          selector_readiness: {
            available_selector_keys: getRequiredFirstFillOnlySelectorKeys().filter(
              (key) => key !== "total_amount",
            ),
            total_amount_selector_available: false,
          },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toEqual(
      expect.arrayContaining([
        "dry_run:selector_readiness_missing",
        "dry_run:total_amount_selector_missing",
      ]),
    );
  });

  test("module imports remain pure and non-executing", () => {
    const source = readFileSync(stubPath, "utf8");
    const forbidden = [
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
      "locator(",
      "goto(",
      ".click(",
      ".fill(",
    ];

    for (const token of forbidden) {
      expect(source).not.toContain(token);
    }
  });
});
