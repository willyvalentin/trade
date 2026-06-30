import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import {
  buildFirstFillOnlyPocExecutionDryRunAdapterDecision,
  type FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision,
} from "../../lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import {
  buildFirstFillOnlyPocManualRunSetupDecision,
  type FirstRealAvanzaFillOnlyPocManualRunSetupDecision,
} from "../../lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import {
  buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision,
  firstRealAvanzaFillOnlyPocRealBrowserCapabilityFlags,
  firstRealAvanzaFillOnlyPocRealBrowserExecutionCapabilityFlags,
  type FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
} from "../../lib/first-real-avanza-fill-only-poc-real-browser-adapter-skeleton";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const skeletonPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-real-browser-adapter-skeleton.ts",
);
const now = "2026-06-30T14:30:00.000Z";

const allFalseBrowserCapabilities = {
  can_launch_browser: false,
  can_attach_to_browser: false,
  can_access_avanza: false,
  can_query_dom: false,
  can_read_session_storage: false,
  can_read_cookies: false,
} as const;

const allFalseExecutionCapabilities = {
  can_fill_fields: false,
  can_click_review: false,
  can_click_final_confirm: false,
  can_submit_order: false,
  can_place_order: false,
} as const;

function validApproval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T14:00:00.000Z",
      ends_at: "2026-06-30T15:00:00.000Z",
      evaluated_at: "2026-06-30T14:30:00.000Z",
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
        recommendation_id: "rec-first-fill-only-real-browser-skeleton-001",
        recommendation_fingerprint:
          "first-fill-only-real-browser-skeleton-fp-001",
        ticker: "GME",
        quantity: 1,
        order_type: "limit",
        entry_price: 800,
        limit_price: 800,
        stop_price: 760,
        target_price: 900,
        created_at: "2026-06-30T14:25:00.000Z",
        expires_at: "2026-06-30T14:45:00.000Z",
        stale_after: "2026-06-30T14:40:00.000Z",
        broker_target_label: "First fill-only real browser skeleton fixture",
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

type SafeRequestOverrides = Partial<
  Omit<
    FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
    | "approval_snapshot"
    | "payload_snapshot"
    | "selector_readiness_snapshot"
    | "operator_approval_snapshot"
    | "manual_run_setup_decision_snapshot"
    | "execution_dry_run_decision_snapshot"
  >
> & {
  approval_snapshot?: Partial<FirstFillOnlyPocApprovalStateInput> | null;
  dry_run?: DryRunOverrides;
  manual_run_setup_decision_snapshot?:
    | FirstRealAvanzaFillOnlyPocManualRunSetupDecision
    | null;
  execution_dry_run_decision_snapshot?:
    | FirstRealAvanzaFillOnlyPocExecutionDryRunAdapterDecision
    | null;
};

function safeRequest(
  overrides: SafeRequestOverrides = {},
): FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest {
  const {
    approval_snapshot: approvalOverride,
    dry_run: dryRunOverride,
    manual_run_setup_decision_snapshot: manualOverride,
    execution_dry_run_decision_snapshot: executionOverride,
    ...requestOverrides
  } = overrides;
  const harness = dryRun(dryRunOverride);
  const approval =
    approvalOverride === null ? null : validApproval(approvalOverride);
  const operatorSetup = {
    setup_decision: "operator_setup_ready_for_manual_run_setup",
    operator_present: true,
    manual_login_ready: true,
    avanza_page_opened_by_operator: true,
    credentials_or_2fa_handled_by_operator: true,
    kill_switch_cancel_plan_ready: true,
    account_verified: true,
    instrument_verified: true,
  } as const;
  const evidencePlan = {
    evidence_plan_acknowledged: true,
    screenshot_redaction_acknowledged: true,
    real_browser_skeleton_evidence_acknowledged: true,
    planned_artifacts: ["manual_operator_notes", "real_browser_skeleton_notes"],
  } as const;
  const requestedActions = {
    review_click_requested: false,
    final_confirm_requested: false,
    order_submit_requested: false,
    credential_or_session_handling_requested: false,
    browser_launch_requested: false,
    avanza_access_requested: false,
    dom_query_requested: false,
    field_fill_requested: false,
    sell_requested: false,
    stop_loss_requested: false,
    glidande_requested: false,
    account_change_requested: false,
    side_switch_requested: false,
    steppers_requested: false,
    select_all_account_requested: false,
  } as const;
  const base = {
    real_browser_adapter_enabled: true,
    real_browser_adapter_safety_gate_decision:
      "real_browser_adapter_safety_gate_ready",
    approval_snapshot: approval,
    operator_setup_snapshot: operatorSetup,
    payload_snapshot: harness.static_payload,
    selector_readiness_snapshot: harness.selector_readiness,
    operator_approval_snapshot: harness.operator_approval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    operator_presence_confirmed: true,
    requested_actions: requestedActions,
  } satisfies FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest;
  const manualDecision =
    manualOverride === undefined
      ? buildFirstFillOnlyPocManualRunSetupDecision({
          manual_run_setup_adapter_enabled: true,
          approval_snapshot: approval,
          operator_setup_evidence_snapshot: operatorSetup,
          payload_snapshot: harness.static_payload,
          selector_readiness_snapshot: harness.selector_readiness,
          operator_approval_snapshot: harness.operator_approval,
          intended_amount_sek: 800,
          intended_price: 800,
          cap_sek: 1000,
          evidence_plan: evidencePlan,
          requested_actions: requestedActions,
        })
      : manualOverride;
  const executionDecision =
    executionOverride === undefined
      ? buildFirstFillOnlyPocExecutionDryRunAdapterDecision({
          execution_dry_run_adapter_enabled: true,
          manual_run_setup_decision_snapshot: manualDecision,
          approval_snapshot: approval,
          operator_setup_snapshot: operatorSetup,
          payload_snapshot: harness.static_payload,
          selector_readiness_snapshot: harness.selector_readiness,
          operator_approval_snapshot: harness.operator_approval,
          intended_amount_sek: 800,
          intended_price: 800,
          cap_sek: 1000,
          evidence_plan: evidencePlan,
          requested_actions: requestedActions,
        })
      : executionOverride;

  return {
    ...base,
    manual_run_setup_decision_snapshot: manualDecision,
    execution_dry_run_decision_snapshot: executionDecision,
    ...requestOverrides,
  };
}

test.describe("first fill-only POC real browser adapter skeleton", () => {
  test("defaults to disabled", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision();

    expect(decision.status).toBe("disabled");
    expect(decision.real_browser_adapter_enabled).toBe(false);
    expect(decision.blocked_reasons).toContain("real_browser_adapter_disabled");
  });

  test("disabled result has all browser capability flags false", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision();

    expect(decision.browser_capability_flags).toEqual(allFalseBrowserCapabilities);
    expect(decision.browser_capability_flags).toEqual(
      firstRealAvanzaFillOnlyPocRealBrowserCapabilityFlags,
    );
  });

  test("disabled result has all execution capability flags false", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision();

    expect(decision.execution_capability_flags).toEqual(
      allFalseExecutionCapabilities,
    );
    expect(decision.execution_capability_flags).toEqual(
      firstRealAvanzaFillOnlyPocRealBrowserExecutionCapabilityFlags,
    );
  });

  test("enabled without real browser safety gate readiness blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({ real_browser_adapter_safety_gate_decision: "not_ready" }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "real_browser_adapter_safety_gate_not_ready",
    );
  });

  test("enabled without execution dry-run readiness blocks", () => {
    const disabledExecution = buildFirstFillOnlyPocExecutionDryRunAdapterDecision();
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({ execution_dry_run_decision_snapshot: disabledExecution }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("execution_dry_run:disabled");
  });

  test("enabled without manual setup readiness blocks", () => {
    const disabledManual = buildFirstFillOnlyPocManualRunSetupDecision();
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({
        manual_run_setup_decision_snapshot: disabledManual,
        execution_dry_run_decision_snapshot: null,
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("manual_run_setup:disabled");
  });

  test("enabled without approval blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({
        approval_snapshot: null,
        manual_run_setup_decision_snapshot: null,
        execution_dry_run_decision_snapshot: null,
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("approval_snapshot_missing");
  });

  test("enabled without operator setup blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({ operator_setup_snapshot: null }),
    );

    expect(decision.ready_for_real_browser_adapter_setup).toBe(false);
    expect(decision.blocked_reasons).toContain("operator_setup_snapshot_missing");
  });

  test("enabled without operator presence blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({ operator_presence_confirmed: false }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "operator_presence:not_confirmed",
    );
  });

  test("enabled with cap above 1000 SEK blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({
        cap_sek: 1001,
        dry_run: {
          static_payload: { max_amount_cap_sek: 1001 },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("cap_exceeds_policy");
  });

  test("enabled with wrong side blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({
        dry_run: {
          static_payload: {
            side: "sell",
            payload: buyPayload({ side: "sell" }),
          },
        },
      }),
    );

    expect(decision.ready_for_real_browser_adapter_setup).toBe(false);
    expect(decision.blocked_reasons).toContain("side_not_buy");
  });

  test("enabled with wrong order type blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({
        dry_run: {
          static_payload: {
            order_type: "market",
            payload: buyPayload({ order_type: "market" }),
          },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "order_type_not_limit_or_avancerad",
    );
  });

  test("enabled with review requested blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({
        requested_actions: { review_click_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("review_click_requested");
  });

  test("enabled with final confirm requested blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({
        requested_actions: { final_confirm_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("final_confirm_requested");
  });

  test("enabled with credential or session handling requested blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      safeRequest({
        requested_actions: { credential_or_session_handling_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain(
      "credential_or_session_handling_requested",
    );
  });

  test("enabled with safe setup can return ready for real browser adapter setup", () => {
    const decision =
      buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(safeRequest());

    expect(decision.status).toBe("ready_for_real_browser_adapter_setup");
    expect(decision.ready_for_real_browser_adapter_setup).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
  });

  test("ready result still has all browser capability flags false", () => {
    const decision =
      buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(safeRequest());

    expect(decision.browser_capability_flags).toEqual(
      allFalseBrowserCapabilities,
    );
  });

  test("ready result still has all execution capability flags false", () => {
    const decision =
      buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(safeRequest());

    expect(decision.execution_capability_flags).toEqual(
      allFalseExecutionCapabilities,
    );
  });

  test("ready result exposes planned browser checks metadata", () => {
    const decision =
      buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(safeRequest());

    expect(decision.planned_browser_checks.map((step) => step.key)).toEqual([
      "browser_manually_opened_by_operator",
      "avanza_manually_logged_in_by_operator",
      "operator_verifies_account",
      "operator_verifies_instrument",
      "verify_buy_side",
      "verify_limit_avancerad",
      "prepare_amount_field_metadata",
      "prepare_price_field_metadata",
      "prepare_total_read_metadata",
      "stop_before_review",
    ]);
  });

  test("ready result exposes planned field metadata but no fill function", () => {
    const decision =
      buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(safeRequest());
    const source = readFileSync(skeletonPath, "utf8");

    expect(decision.planned_field_metadata.amount).toMatchObject({
      value: 800,
      mode: "metadata_only_no_fill",
    });
    expect(decision.planned_field_metadata.price).toMatchObject({
      value: 800,
      mode: "metadata_only_no_fill",
    });
    expect(source).not.toMatch(/function\s+fill/i);
    expect(source).not.toMatch(/=>\s*.*\.fill\(/);
  });

  test("ready result stop point is before review", () => {
    const decision =
      buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(safeRequest());

    expect(decision.stop_point).toBe("before_review_button");
    expect(
      decision.planned_browser_checks.find(
        (step) => step.key === "stop_before_review",
      )?.mode,
    ).toBe("hard_stop");
  });

  test("ready result exposes evidence requirements", () => {
    const decision =
      buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(safeRequest());

    expect(decision.evidence_requirements).toEqual(
      expect.arrayContaining([
        "before_screenshot",
        "after_fill_screenshot",
        "real_browser_adapter_safety_gate_decision",
        "execution_dry_run_adapter_decision_output",
        "manual_run_setup_decision_output",
        "real_browser_skeleton_decision_output",
        "no_fill_click_submit_statement",
      ]),
    );
  });

  test("ready result exposes hard forbidden selectors", () => {
    const decision =
      buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(safeRequest());

    expect(decision.hard_forbidden_selectors).toEqual(
      expect.arrayContaining([
        'button[data-e2e="confirmOrderButton"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]',
      ]),
    );
  });

  test("ready result exposes blocked review selectors", () => {
    const decision =
      buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(safeRequest());

    expect(decision.blocked_review_selectors).toEqual(
      expect.arrayContaining([
        'button[data-e2e="orderButton"][data-mint-button-theme="buy"]',
        'button[data-e2e="orderButton"][data-mint-button-theme="sell"]',
      ]),
    );
  });

  test("result and function names do not imply order placement", () => {
    const source = readFileSync(skeletonPath, "utf8");
    const exportedNames = Array.from(
      source.matchAll(/export (?:const|function|type) ([A-Za-z0-9_]+)/g),
      (match) => match[1]?.toLowerCase() ?? "",
    ).join(" ");

    expect(exportedNames).not.toContain("placeorder");
    expect(exportedNames).not.toContain("orderplacement");
  });

  test("module imports remain pure and local", () => {
    const source = readFileSync(skeletonPath, "utf8");

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
