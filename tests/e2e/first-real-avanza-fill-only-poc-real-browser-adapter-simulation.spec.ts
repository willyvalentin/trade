import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { buildFirstFillOnlyPocExecutionDryRunAdapterDecision } from "../../lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton";
import { buildFirstFillOnlyPocManualRunSetupDecision } from "../../lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import {
  buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision,
  type FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest,
} from "../../lib/first-real-avanza-fill-only-poc-real-browser-adapter-skeleton";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const simulationPath = join(
  repoRoot,
  "tests/e2e/first-real-avanza-fill-only-poc-real-browser-adapter-simulation.spec.ts",
);
const skeletonPath = join(
  repoRoot,
  "lib/first-real-avanza-fill-only-poc-real-browser-adapter-skeleton.ts",
);
const now = "2026-06-30T15:30:00.000Z";

const expectedBrowserCapabilities = {
  can_launch_browser: false,
  can_attach_to_browser: false,
  can_access_avanza: false,
  can_query_dom: false,
  can_read_session_storage: false,
  can_read_cookies: false,
} as const;

const expectedExecutionCapabilities = {
  can_fill_fields: false,
  can_click_review: false,
  can_click_final_confirm: false,
  can_submit_order: false,
  can_place_order: false,
} as const;

function approval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T15:00:00.000Z",
      ends_at: "2026-06-30T16:00:00.000Z",
      evaluated_at: "2026-06-30T15:30:00.000Z",
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

function payload(
  overrides: Partial<SemiAutoAvanzaAgentPayload> = {},
): SemiAutoAvanzaAgentPayload {
  return {
    ...buildSemiAutoRecommendationBuyPayload(
      {
        recommendation_id: "rec-first-fill-only-real-browser-simulation-001",
        recommendation_fingerprint:
          "first-fill-only-real-browser-simulation-fp-001",
        ticker: "GME",
        quantity: 1,
        order_type: "limit",
        entry_price: 800,
        limit_price: 800,
        stop_price: 760,
        target_price: 900,
        created_at: "2026-06-30T15:25:00.000Z",
        expires_at: "2026-06-30T15:45:00.000Z",
        stale_after: "2026-06-30T15:40:00.000Z",
        broker_target_label: "First fill-only real browser simulation fixture",
      },
      { now },
    ).payload,
    ...overrides,
  };
}

type SimulationOverrides = {
  request?: Partial<FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest>;
  static_payload?: Partial<FirstFillOnlyPocDryRunDecisionInput["static_payload"]>;
  selector_readiness?: Partial<
    FirstFillOnlyPocDryRunDecisionInput["selector_readiness"]
  >;
  operator_approval?: Partial<
    FirstFillOnlyPocDryRunDecisionInput["operator_approval"]
  >;
  approval?: Partial<FirstFillOnlyPocApprovalStateInput> | null;
};

function simulationRequest(
  overrides: SimulationOverrides = {},
): FirstRealAvanzaFillOnlyPocRealBrowserAdapterSkeletonRequest {
  const safePayload: FirstFillOnlyPocDryRunDecisionInput["static_payload"] = {
    payload: payload(overrides.static_payload?.payload ?? {}),
    order_form: "avancerad",
    requested_action: "fill_only",
    max_amount_cap_sek: 1000,
    currency: "SEK",
    order_type: "limit",
    side: "buy",
    ...overrides.static_payload,
  };
  const selectorReadiness = {
    available_selector_keys: getRequiredFirstFillOnlySelectorKeys(),
    requested_selectors: [],
    sizing_mode: "amount",
    total_amount_selector_available: true,
    total_amount_text: "800 SEK",
    generated_selector_strategy_used: false,
    validation_errors: [],
    review_click_requested: false,
    ...overrides.selector_readiness,
  } satisfies FirstFillOnlyPocDryRunDecisionInput["selector_readiness"];
  const operatorApproval = {
    approval_decision: "approved_for_first_fill_only_poc",
    account_human_verified: true,
    instrument_human_verified: true,
    price_currency_human_verified: true,
    ...overrides.operator_approval,
  } satisfies FirstFillOnlyPocDryRunDecisionInput["operator_approval"];
  const approvalSnapshot =
    overrides.approval === null ? null : approval(overrides.approval);
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
    planned_artifacts: [
      "real_browser_adapter_skeleton_simulation_report",
      "no_browser_access_statement",
      "no_fill_click_submit_statement",
    ],
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
  const manualDecision = buildFirstFillOnlyPocManualRunSetupDecision({
    manual_run_setup_adapter_enabled: true,
    approval_snapshot: approvalSnapshot,
    operator_setup_evidence_snapshot: operatorSetup,
    payload_snapshot: safePayload,
    selector_readiness_snapshot: selectorReadiness,
    operator_approval_snapshot: operatorApproval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    requested_actions: requestedActions,
  });
  const executionDecision = buildFirstFillOnlyPocExecutionDryRunAdapterDecision({
    execution_dry_run_adapter_enabled: true,
    manual_run_setup_decision_snapshot: manualDecision,
    approval_snapshot: approvalSnapshot,
    operator_setup_snapshot: operatorSetup,
    payload_snapshot: safePayload,
    selector_readiness_snapshot: selectorReadiness,
    operator_approval_snapshot: operatorApproval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    requested_actions: requestedActions,
  });

  return {
    real_browser_adapter_enabled: true,
    real_browser_adapter_safety_gate_decision:
      "real_browser_adapter_safety_gate_ready",
    execution_dry_run_decision_snapshot: executionDecision,
    manual_run_setup_decision_snapshot: manualDecision,
    approval_snapshot: approvalSnapshot,
    operator_setup_snapshot: operatorSetup,
    payload_snapshot: safePayload,
    selector_readiness_snapshot: selectorReadiness,
    operator_approval_snapshot: operatorApproval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: evidencePlan,
    operator_presence_confirmed: true,
    requested_actions: requestedActions,
    ...overrides.request,
  };
}

test.describe("first fill-only POC real browser adapter skeleton simulation", () => {
  test("positive local simulation reaches ready while all capabilities stay false", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest(),
    );

    expect(decision.status).toBe("ready_for_real_browser_adapter_setup");
    expect(decision.ready_for_real_browser_adapter_setup).toBe(true);
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.browser_capability_flags).toEqual(
      expectedBrowserCapabilities,
    );
    expect(decision.execution_capability_flags).toEqual(
      expectedExecutionCapabilities,
    );
    expect(decision.stop_point).toBe("before_review_button");
    expect(decision.planned_browser_checks.map((step) => step.key)).toContain(
      "stop_before_review",
    );
    expect(decision.planned_field_metadata.amount).toMatchObject({
      value: 800,
      mode: "metadata_only_no_fill",
    });
    expect(decision.planned_field_metadata.price).toMatchObject({
      value: 800,
      mode: "metadata_only_no_fill",
    });
    expect(decision.safety_confirmations.no_browser_launch).toBe(true);
    expect(decision.safety_confirmations.no_dom_query).toBe(true);
    expect(decision.safety_confirmations.no_field_fill).toBe(true);
    expect(decision.safety_confirmations.no_order_placement).toBe(true);
  });

  test("disabled adapter remains disabled", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({ request: { real_browser_adapter_enabled: false } }),
    );

    expect(decision.status).toBe("disabled");
    expect(decision.browser_capability_flags).toEqual(
      expectedBrowserCapabilities,
    );
    expect(decision.execution_capability_flags).toEqual(
      expectedExecutionCapabilities,
    );
  });

  test("missing real browser safety gate readiness blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({
        request: { real_browser_adapter_safety_gate_decision: "not_ready" },
      }),
    );

    expect(decision.ready_for_real_browser_adapter_setup).toBe(false);
    expect(decision.blocked_reasons).toContain(
      "real_browser_adapter_safety_gate_not_ready",
    );
  });

  test("missing execution dry-run readiness blocks", () => {
    const disabledExecution = buildFirstFillOnlyPocExecutionDryRunAdapterDecision();
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({
        request: { execution_dry_run_decision_snapshot: disabledExecution },
      }),
    );

    expect(decision.ready_for_real_browser_adapter_setup).toBe(false);
    expect(decision.blocked_reasons).toContain("execution_dry_run:disabled");
  });

  test("missing manual setup readiness blocks", () => {
    const disabledManual = buildFirstFillOnlyPocManualRunSetupDecision();
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({
        request: {
          manual_run_setup_decision_snapshot: disabledManual,
          execution_dry_run_decision_snapshot: null,
        },
      }),
    );

    expect(decision.ready_for_real_browser_adapter_setup).toBe(false);
    expect(decision.blocked_reasons).toContain("manual_run_setup:disabled");
  });

  test("missing operator presence blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({ request: { operator_presence_confirmed: false } }),
    );

    expect(decision.ready_for_real_browser_adapter_setup).toBe(false);
    expect(decision.blocked_reasons).toContain(
      "operator_presence:not_confirmed",
    );
  });

  test("review requested fails safety without enabling clicks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({
        request: { requested_actions: { review_click_requested: true } },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("review_click_requested");
    expect(decision.execution_capability_flags.can_click_review).toBe(false);
  });

  test("final confirm requested fails safety without enabling submit", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({
        request: { requested_actions: { final_confirm_requested: true } },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("final_confirm_requested");
    expect(decision.execution_capability_flags.can_click_final_confirm).toBe(
      false,
    );
    expect(decision.execution_capability_flags.can_submit_order).toBe(false);
  });

  test("credential or session handling requested fails safety", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({
        request: {
          requested_actions: {
            credential_or_session_handling_requested: true,
          },
        },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain(
      "credential_or_session_handling_requested",
    );
    expect(decision.browser_capability_flags.can_read_cookies).toBe(false);
    expect(decision.browser_capability_flags.can_read_session_storage).toBe(
      false,
    );
  });

  test("cap above 1000 SEK blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({
        request: { cap_sek: 1001 },
        static_payload: { max_amount_cap_sek: 1001 },
      }),
    );

    expect(decision.ready_for_real_browser_adapter_setup).toBe(false);
    expect(decision.blocked_reasons).toContain("cap_exceeds_policy");
  });

  test("wrong side blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({
        static_payload: {
          side: "sell",
          payload: payload({ side: "sell" }),
        },
      }),
    );

    expect(decision.ready_for_real_browser_adapter_setup).toBe(false);
    expect(decision.blocked_reasons).toContain("side_not_buy");
  });

  test("wrong order type blocks", () => {
    const decision = buildFirstFillOnlyPocRealBrowserAdapterSkeletonDecision(
      simulationRequest({
        static_payload: {
          order_type: "market",
          payload: payload({ order_type: "market" }),
        },
      }),
    );

    expect(decision.ready_for_real_browser_adapter_setup).toBe(false);
    expect(decision.blocked_reasons).toContain(
      "order_type_not_limit_or_avancerad",
    );
  });

  test("simulation and skeleton sources remain pure and non-executing", () => {
    const skeletonSource = readFileSync(skeletonPath, "utf8");
    const runtimeForbidden = [
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
    ];

    for (const forbidden of runtimeForbidden) {
      expect(skeletonSource).not.toContain(forbidden);
    }

    expect(readFileSync(simulationPath, "utf8")).toContain(
      "positive local simulation reaches ready while all capabilities stay false",
    );
  });
});
