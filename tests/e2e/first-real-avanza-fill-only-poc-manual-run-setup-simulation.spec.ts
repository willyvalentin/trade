import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildFirstFillOnlyPocManualRunSetupDecision,
  type FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest,
} from "../../lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter";
import type { FirstFillOnlyPocApprovalStateInput } from "../../lib/first-real-avanza-fill-only-poc-approval-state-contract";
import type { FirstFillOnlyPocDryRunDecisionInput } from "../../lib/first-real-avanza-fill-only-poc-dry-run-harness";
import { getRequiredFirstFillOnlySelectorKeys } from "../../lib/real-avanza-fill-only-guard";
import { buildSemiAutoRecommendationBuyPayload } from "../../lib/semi-auto-agent-payload-builder";
import type { SemiAutoAvanzaAgentPayload } from "../../lib/semi-auto-agent-payload-contract";

const repoRoot = process.cwd();
const simulationSpecPath = join(
  repoRoot,
  "tests/e2e/first-real-avanza-fill-only-poc-manual-run-setup-simulation.spec.ts",
);
const now = "2026-06-30T12:30:00.000Z";
const token = (...parts: string[]) => parts.join("");

const allFalseCapabilities = {
  can_access_avanza: false,
  can_launch_browser: false,
  can_query_dom: false,
  can_fill_fields: false,
  can_click_review: false,
  can_click_final_confirm: false,
  can_submit_order: false,
} as const;

function validApproval(
  overrides: Partial<FirstFillOnlyPocApprovalStateInput> = {},
): FirstFillOnlyPocApprovalStateInput {
  const base: FirstFillOnlyPocApprovalStateInput = {
    requested_decision: "approved_for_first_fill_only_poc",
    explicit_user_approval: true,
    approval_window: {
      starts_at: "2026-06-30T12:00:00.000Z",
      ends_at: "2026-06-30T13:00:00.000Z",
      evaluated_at: "2026-06-30T12:30:00.000Z",
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
        recommendation_id: "rec-first-fill-only-manual-setup-simulation-001",
        recommendation_fingerprint:
          "first-fill-only-manual-setup-simulation-fp-001",
        ticker: "GME",
        quantity: 1,
        order_type: "limit",
        entry_price: 800,
        limit_price: 800,
        stop_price: 760,
        target_price: 900,
        created_at: "2026-06-30T12:25:00.000Z",
        expires_at: "2026-06-30T12:45:00.000Z",
        stale_after: "2026-06-30T12:40:00.000Z",
        broker_target_label: "First fill-only manual setup simulation fixture",
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

type SimulationOverrides = Partial<
  Omit<
    FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest,
    | "approval_snapshot"
    | "payload_snapshot"
    | "selector_readiness_snapshot"
    | "operator_approval_snapshot"
  >
> & {
  approval_snapshot?: Partial<FirstFillOnlyPocApprovalStateInput> | null;
  dry_run?: DryRunOverrides;
};

function simulationInput(
  overrides: SimulationOverrides = {},
): FirstRealAvanzaFillOnlyPocManualRunSetupAdapterRequest {
  const {
    approval_snapshot: approvalOverride,
    dry_run: dryRunOverride,
    ...requestOverrides
  } = overrides;
  const harness = dryRun(dryRunOverride);

  return {
    manual_run_setup_adapter_enabled: true,
    approval_snapshot:
      approvalOverride === null ? null : validApproval(approvalOverride),
    operator_setup_evidence_snapshot: {
      setup_decision: "operator_setup_ready_for_manual_run_setup",
      operator_present: true,
      manual_login_ready: true,
      avanza_page_opened_by_operator: true,
      credentials_or_2fa_handled_by_operator: true,
      kill_switch_cancel_plan_ready: true,
      account_verified: true,
      instrument_verified: true,
    },
    payload_snapshot: harness.static_payload,
    selector_readiness_snapshot: harness.selector_readiness,
    operator_approval_snapshot: harness.operator_approval,
    intended_amount_sek: 800,
    intended_price: 800,
    cap_sek: 1000,
    evidence_plan: {
      evidence_plan_acknowledged: true,
      screenshot_redaction_acknowledged: true,
      planned_artifacts: ["manual_operator_notes", "local_simulation_report"],
    },
    requested_actions: {
      review_click_requested: false,
      final_confirm_requested: false,
      order_submit_requested: false,
    },
    ...requestOverrides,
  };
}

test.describe("first fill-only POC manual run setup simulation", () => {
  test("positive local simulation reaches ready while keeping capabilities false", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      simulationInput(),
    );

    expect(decision.status).toBe("ready_for_fill_only_manual_setup");
    expect(decision.ready_for_fill_only_manual_setup).toBe(true);
    expect(decision.capability_flags).toEqual(allFalseCapabilities);
    expect(decision.skeleton_decision?.status).toBe("ready_for_manual_run_setup");
    expect(decision.implementation_stub_decision?.status).toBe("stub_ready");
    expect(decision.dry_run_decision?.status).toBe("approved_for_stub_only");
    expect(decision.guard_decision?.status).toBe(
      "approved_for_fill_only_poc",
    );
    expect(decision.selector_policy?.status).toBe("ready");
  });

  test("positive local simulation exposes instruction metadata only", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      simulationInput(),
    );
    const instructionKeys = decision.planned_instructions.map((step) => step.key);

    expect(instructionKeys).toEqual([
      "verify_instrument",
      "verify_account",
      "verify_buy_side",
      "verify_limit_avancerad",
      "planned_fill_amount",
      "planned_fill_price",
      "read_total_amount",
      "stop_before_review",
    ]);
    expect(decision.stop_point).toBe("before_review_button");
    expect(decision.blocked_reasons).toEqual([]);
    expect(decision.planned_instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "planned_fill_amount",
          value: 800,
          mode: "future_separate_run_metadata",
        }),
        expect.objectContaining({
          key: "planned_fill_price",
          value: 800,
          mode: "future_separate_run_metadata",
        }),
        expect.objectContaining({
          key: "stop_before_review",
          mode: "hard_stop",
        }),
      ]),
    );
  });

  test("disabled adapter simulation remains disabled", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      simulationInput({ manual_run_setup_adapter_enabled: false }),
    );

    expect(decision.status).toBe("disabled");
    expect(decision.capability_flags).toEqual(allFalseCapabilities);
  });

  test("missing setup evidence blocks simulation", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      simulationInput({ operator_setup_evidence_snapshot: null }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain(
      "operator_setup_evidence_missing",
    );
  });

  test("review requested blocks simulation", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      simulationInput({
        requested_actions: { review_click_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("review_click_requested");
  });

  test("final confirm requested blocks simulation", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      simulationInput({
        requested_actions: { final_confirm_requested: true },
      }),
    );

    expect(decision.status).toBe("failed_safety");
    expect(decision.blocked_reasons).toContain("final_confirm_requested");
  });

  test("cap above 1000 SEK blocks simulation", () => {
    const decision = buildFirstFillOnlyPocManualRunSetupDecision(
      simulationInput({
        cap_sek: 1001,
        dry_run: {
          static_payload: { max_amount_cap_sek: 1001 },
        },
      }),
    );

    expect(decision.status).toBe("blocked");
    expect(decision.blocked_reasons).toContain("cap_exceeds_policy");
  });

  test("simulation spec remains local and non-executing", () => {
    const source = readFileSync(simulationSpecPath, "utf8");

    for (const forbidden of [
      token("puppet", "eer"),
      token("chromium", ".launch"),
      token("document", "."),
      token("window", "."),
      token("fetch", "("),
      token("process", ".env"),
      token("@", "supabase"),
      token("create", "Client"),
      token(".", "from", "("),
      token(".", "insert", "("),
      token("SERVICE", "_ROLE"),
      token("service", "-role"),
      token("/", "api", "/"),
      token("run", "-scan"),
      token("audit", "-writer"),
      token(".", "click", "("),
      token(".", "locator", "("),
      token(".", "goto", "("),
      token("avanza", ".se"),
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
