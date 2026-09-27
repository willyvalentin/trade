import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";
import {
  scannerClockPriorShadowForwardEvaluationReadbackFromUnknown,
} from "@/lib/scanner-clock-prior-shadow-forward-evaluation-readback";

const planId = "11111111-1111-4111-8111-111111111111";
const resultId = "22222222-2222-4222-8222-222222222222";
const planFingerprint = "a".repeat(64);
const resultFingerprint = "b".repeat(64);
const diagnosticFingerprint = "c".repeat(64);

const authority = {
  can_request_provider_data: false,
  can_reserve_provider_credits: false,
  can_change_ranking_or_publication: false,
  can_promote_policy: false,
  can_publish_candidate: false,
  can_create_paper_position: false,
  can_execute_broker_action: false,
};

function partition(name: "held_out" | "walk_forward") {
  return {
    partition: name,
    opportunity_set_count: 30,
    no_trade_opportunity_set_count: 2,
    ranked_candidate_count: 84,
    trading_day_count: 8,
    baseline_precision: { value: 0.6 },
    candidate_precision: { value: 0.4 },
    precision_delta: {
      value: -0.2,
      conservative_lower: -0.3,
      conservative_upper: -0.1,
    },
    evidence_complete: true,
  };
}

function availablePayload() {
  return {
    status: "available",
    plan_receipt: {
      plan_id: planId,
      plan_fingerprint: planFingerprint,
    },
    durable_result_receipt: {
      result_id: resultId,
      result_fingerprint: resultFingerprint,
      recorded_at: "2026-10-24T00:01:00.000Z",
    },
    evaluation: {
      status: "decision_ready",
      decision: "narrow",
      reason_codes: ["held_out_clear_narrow_boundary"],
      partitions: [partition("held_out"), partition("walk_forward")],
      shadow_only: true,
      live_ranking_effect: false,
      publication_effect: false,
      causal_improvement_claimed: false,
    },
    context_diagnostic: {
      contract_version: "scanner_clock_prior_shadow_context_diagnostic_v1",
      diagnostic_fingerprint: diagnosticFingerprint,
      source: {
        result_id: resultId,
        result_fingerprint: resultFingerprint,
        plan_id: planId,
        plan_fingerprint: planFingerprint,
        terminal_decision: "narrow",
      },
      status: "conservative_regression_detected",
      pair_counts: {
        total: 1,
        eligible: 1,
        conservative_regression: 1,
        missing_arm: 0,
        incomplete_partition_coverage: 0,
        minimum_resolved_not_met: 0,
      },
      priority_context: {
        dimension: "regime",
        key: "risk_off",
        eligibility: "eligible",
        classification: "conservative_regression",
        baseline: {
          resolved_outcome_count: 24,
          precision: { value: 0.75 },
        },
        candidate: {
          resolved_outcome_count: 24,
          precision: { value: 0.42 },
        },
        precision_delta: -0.33,
        conservative_regression_gap: 0.08,
        expectancy_delta_r: -0.21,
      },
      shadow_only: true,
      live_ranking_effect: false,
      publication_effect: false,
      causal_improvement_claimed: false,
    },
    authority,
  };
}

test("normalizes an exact terminal decision and renders its priority context", () => {
  const readback = scannerClockPriorShadowForwardEvaluationReadbackFromUnknown(
    availablePayload(),
  );

  expect(readback.status).toBe("available");
  expect(readback.evaluation?.decision).toBe("narrow");
  expect(readback.evaluation?.partitions).toHaveLength(2);
  expect(readback.context_diagnostic?.priority_context).toMatchObject({
    dimension: "regime",
    key: "risk_off",
    baseline_resolved_outcomes: 24,
    candidate_resolved_outcomes: 24,
  });

  const panelSource = readFileSync(
    resolve(process.cwd(), "app/clock-prior-forward-evaluation-panel.tsx"),
    "utf8",
  );
  expect(panelSource).toContain("Clock-neutral policy decision");
  expect(panelSource).toContain("priority.dimension");
  expect(panelSource).toContain("priority.key");
  expect(panelSource).toContain("Shadow readback only");
  expect(panelSource).toContain("readback.plan?.plan_fingerprint");
  expect(panelSource).toContain("readback.durable_result?.result_fingerprint");
});

test("keeps a non-terminal evaluation explicit without inventing context", () => {
  const payload = availablePayload();
  payload.durable_result_receipt = null as never;
  payload.context_diagnostic = null as never;
  payload.evaluation = {
    ...payload.evaluation,
    status: "evidence_incomplete",
    decision: "pending",
    partitions: [partition("held_out")],
  };

  const readback = scannerClockPriorShadowForwardEvaluationReadbackFromUnknown(
    payload,
  );
  expect(readback.status).toBe("available");
  expect(readback.durable_result).toBeNull();
  expect(readback.context_diagnostic).toBeNull();
  expect(readFileSync(
    resolve(process.cwd(), "app/clock-prior-forward-evaluation-panel.tsx"),
    "utf8",
  )).toContain("Context triage remains unavailable");
});

test("surfaces an owner-bound not-ready response without treating it as a result", () => {
  const readback = scannerClockPriorShadowForwardEvaluationReadbackFromUnknown({
    blocker: "clock_prior_forward_evaluation_plan_or_charter_not_found",
    authority,
  }, 409);

  expect(readback.status).toBe("not_ready");
  expect(readback.evaluation).toBeNull();
  expect(readback.blocker).toBe(
    "clock_prior_forward_evaluation_plan_or_charter_not_found",
  );
});

test("fails closed on context/result lineage drift or non-inert authority", () => {
  const drifted = availablePayload();
  drifted.context_diagnostic.source.result_fingerprint = "d".repeat(64);
  expect(
    scannerClockPriorShadowForwardEvaluationReadbackFromUnknown(drifted).status,
  ).toBe("invalid");

  const authorized = availablePayload();
  authorized.authority.can_promote_policy = true as never;
  expect(
    scannerClockPriorShadowForwardEvaluationReadbackFromUnknown(authorized).status,
  ).toBe("invalid");

  const missingTerminalDiagnostic = availablePayload();
  missingTerminalDiagnostic.context_diagnostic = null as never;
  expect(
    scannerClockPriorShadowForwardEvaluationReadbackFromUnknown(
      missingTerminalDiagnostic,
    ).status,
  ).toBe("invalid");
});

test("the product integration is GET-only and mounts the readback in Ture", () => {
  const source = readFileSync(resolve(process.cwd(), "app/trade-app.tsx"), "utf8");
  const start = source.indexOf("async function fetchClockPriorForwardEvaluationReadback");
  const end = source.indexOf("type OutcomeBackfillOperation", start);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);

  const fetchSlice = source.slice(start, end);
  expect(fetchSlice).toContain(
    '"/api/app/scanner-clock-prior-shadow-forward-evaluation"',
  );
  expect(fetchSlice).toContain('cache: "no-store"');
  expect(fetchSlice).not.toContain("method:");
  expect(source).toContain("<ClockPriorForwardEvaluationPanel");
  expect(source).toContain("readback={clockPriorForwardEvaluationReadback}");
});
