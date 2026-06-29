import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision,
  gatedRealAvanzaFillOnlyAdapterSkeletonCapabilityFlags,
  gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions,
  gatedRealAvanzaFillOnlyAdapterSkeletonPlannedSequence,
  type GatedRealAvanzaFillOnlyAdapterSkeletonRequest,
} from "../../lib/gated-real-avanza-fill-only-adapter-skeleton";
import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const skeletonPath = join(
  repoRoot,
  "lib/gated-real-avanza-fill-only-adapter-skeleton.ts",
);
const now = "2026-06-30T08:30:00.000Z";

function validApproval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T08:00:00.000Z",
      ends_at: "2026-06-30T09:00:00.000Z",
      evaluated_at: "2026-06-30T08:30:00.000Z",
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
        recommendation_id: "rec-gated-real-avanza-fill-only-skeleton-001",
        recommendation_fingerprint:
          "gated-real-avanza-fill-only-skeleton-fp-001",
        ticker: "GME",
        quantity: 1,
        order_type: "limit",
        entry_price: 800,
        limit_price: 800,
        stop_price: 760,
        target_price: 900,
        created_at: "2026-06-30T08:25:00.000Z",
        expires_at: "2026-06-30T08:45:00.000Z",
        stale_after: "2026-06-30T08:40:00.000Z",
        broker_target_label: "Gated real Avanza fill-only skeleton fixture",
      },
      { now },
    ).payload,
    ...overrides,
  };
}

type DryRunOverrides = {
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

function safeRequest(
  overrides: Partial<
    Omit<
      GatedRealAvanzaFillOnlyAdapterSkeletonRequest,
      "approval_snapshot" | "dry_run"
    >
  > & {
    approval_snapshot?: Partial<FirstFillOnlyPocApprovalStateInput> | null;
    dry_run?: DryRunOverrides;
  } = {},
): GatedRealAvanzaFillOnlyAdapterSkeletonRequest {
  const {
    approval_snapshot: approvalSnapshotOverride,
    dry_run: dryRunOverride,
    ...requestOverrides
  } = overrides;
  const harness = dryRun(dryRunOverride);
  const approvalSnapshot =
    approvalSnapshotOverride === null
      ? null
      : validApproval(approvalSnapshotOverride);

  return {
    adapter_skeleton_enabled: true,
    ...requestOverrides,
    approval_snapshot: approvalSnapshot,
    payload_snapshot: harness.static_payload,
    selector_readiness_snapshot: harness.selector_readiness,
    operator_approval_snapshot: harness.operator_approval,
    operator_setup_snapshot: {
      operator_present: true,
      manual_login_ready: true,
      avanza_page_opened_by_operator: true,
      credentials_or_2fa_handled_by_operator: true,
      kill_switch_cancel_plan_ready: true,
    },
    evidence_plan_snapshot: {
      evidence_plan_acknowledged: true,
      planned_artifacts: ["manual_operator_notes"],
    },
  };
}

test.describe("gated real Avanza fill-only adapter skeleton", () => {
  test("defaults to disabled", () => {
    const decision = buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision();

    expect(decision.status).toBe("disabled");
    expect(decision.adapter_skeleton_enabled).toBe(false);
    expect(decision.blocked_reasons).toContain("adapter_skeleton_disabled");
  });

  test("disabled state keeps all capabilities false", () => {
    const decision = buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision();

    expect(decision.capability_flags).toEqual({
      can_access_avanza: false,
      can_launch_browser: false,
      can_query_dom: false,
      can_fill_fields: false,
      can_click_review: false,
      can_click_final_confirm: false,
      can_submit_order: false,
    });
    expect(decision.capability_flags).toEqual(
      gatedRealAvanzaFillOnlyAdapterSkeletonCapabilityFlags,
    );
  });

  test("enabled without approval blocks", () => {
    const decision = buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision(
      safeRequest({ approval_snapshot: null }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.ready_for_manual_run_setup).toBe(false);
    expect(decision.blocked_reasons).toContain("approval_snapshot_missing");
  });

  test("enabled with invalid guard or harness blocks", () => {
    const decision = buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision(
      safeRequest({
        dry_run: {
          static_payload: {
            order_form: "stop_loss",
            order_type: "stop_loss",
          },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "implementation_stub:dry_run:order_type_not_limit",
    );
    expect(decision.blocked_reasons).toContain(
      "implementation_stub:dry_run:fill_only_guard:stop_loss_deferred_for_first_poc",
    );
  });

  test("enabled with safe approval, guard, and harness can return ready", () => {
    const decision =
      buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision(safeRequest());

    expect(decision.status).toBe("ready_for_manual_run_setup");
    expect(decision.ready_for_manual_run_setup).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.implementation_stub_decision?.status).toBe("stub_ready");
  });

  test("ready state still keeps all capabilities false", () => {
    const decision =
      buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision(safeRequest());

    expect(decision.capability_flags).toEqual({
      can_access_avanza: false,
      can_launch_browser: false,
      can_query_dom: false,
      can_fill_fields: false,
      can_click_review: false,
      can_click_final_confirm: false,
      can_submit_order: false,
    });
  });

  test("ready state exposes planned sequence metadata", () => {
    const decision =
      buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision(safeRequest());

    expect(decision.planned_sequence.map((step) => step.key)).toEqual([
      "verify_instrument",
      "verify_account",
      "verify_buy_side",
      "verify_limit_avancerad",
      "fill_amount",
      "fill_price",
      "read_total_amount",
      "stop_before_review",
    ]);
    expect(gatedRealAvanzaFillOnlyAdapterSkeletonPlannedSequence).toEqual(
      decision.planned_sequence,
    );
  });

  test("ready state exposes evidence requirements", () => {
    const decision =
      buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision(safeRequest());

    expect(decision.evidence_requirements).toEqual(
      expect.arrayContaining([
        "before_screenshot",
        "after_fill_screenshot",
        "guard_decision_output",
        "no_review_click_statement",
        "no_final_click_statement",
        "no_order_placed_statement",
        "manual_operator_notes",
      ]),
    );
  });

  test("ready state exposes hard forbidden selectors", () => {
    const decision =
      buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision(safeRequest());

    expect(decision.hard_forbidden_selectors).toEqual(
      expect.arrayContaining([
        'button[data-e2e="orderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="confirmOrderButton"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
      ]),
    );
  });

  test("review click remains forbidden and blocked", () => {
    const review = gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions.find(
      (action) => action.key === "review_click",
    );

    expect(review?.blocked).toBe(true);
    expect(review?.selectors).toContain(
      'button[data-e2e="orderButton"][data-mint-button-theme="buy"]',
    );
  });

  test("final confirm remains forbidden", () => {
    const finalConfirm =
      gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions.find(
        (action) => action.key === "final_confirm",
      );

    expect(finalConfirm?.blocked).toBe(true);
    expect(finalConfirm?.selectors).toEqual(
      expect.arrayContaining([
        'button[data-e2e="confirmOrderButton"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
      ]),
    );
  });

  test("sell, Stop Loss, and Glidande remain blocked", () => {
    const keys = gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions.map(
      (action) => action.key,
    );

    expect(keys).toEqual(
      expect.arrayContaining(["sell", "stop_loss", "glidande"]),
    );
  });

  test("account change, side switch, steppers, and Välj alla på kontot are forbidden", () => {
    const keys = gatedRealAvanzaFillOnlyAdapterSkeletonForbiddenActions.map(
      (action) => action.key,
    );

    expect(keys).toEqual(
      expect.arrayContaining([
        "account_change",
        "side_switch",
        "steppers",
        "select_all_account",
      ]),
    );
  });

  test("stop point remains before review", () => {
    const decision =
      buildGatedRealAvanzaFillOnlyAdapterSkeletonDecision(safeRequest());

    expect(decision.stop_point).toBe("before_review_button");
    expect(
      decision.planned_sequence.find((step) => step.key === "stop_before_review")
        ?.mode,
    ).toBe("hard_stop");
  });

  test("module imports remain pure and non-executing", () => {
    const source = readFileSync(skeletonPath, "utf8");
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

  test("function names and result statuses never imply order placement", () => {
    const source = readFileSync(skeletonPath, "utf8");
    const executableNames = source.match(/function\s+\w+|export function\s+\w+/g) ?? [];
    const statusValues = [
      "disabled",
      "blocked",
      "ready_for_manual_run_setup",
      "failed_safety",
    ];

    expect(executableNames.join(" ")).not.toMatch(
      /submit|place|order|confirm|buy|sell/i,
    );
    expect(statusValues.join(" ")).not.toMatch(/submit|place|confirm|executed/i);
  });
});
