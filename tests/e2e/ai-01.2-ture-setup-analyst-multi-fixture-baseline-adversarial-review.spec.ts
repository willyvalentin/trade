import { expect, test } from "@playwright/test";

import {
  TURE_SETUP_ANALYST_EVALUATION_FIXTURE_VERSION,
  createTureSetupAnalystFrozenEvaluationFixture,
  evaluateTureSetupAnalystFrozenFixture,
} from "../../lib/ture-setup-analyst-fixture-evaluation-harness";
import { runTureSetupAnalystInProcessShadow } from "../../lib/ture-setup-analyst-in-process-shadow-runner";
import {
  compareTureSetupAnalystMultiFixtureBaseline,
  TURE_SETUP_ANALYST_BASELINE_DESCRIPTOR_VERSION,
  type CompareTureSetupAnalystMultiFixtureBaselineInput,
} from "../../lib/ture-setup-analyst-multi-fixture-baseline-comparison";
import { TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION } from "../../lib/ture-setup-analyst-read-only-context-tools";
import { TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY } from "../../lib/ture-setup-analyst-shadow-trace-contract";
import {
  TURE_SETUP_ANALYST_AUTHORITY,
  TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION,
  TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
  validateTureSetupAnalystShadowAssessment,
} from "../../lib/ture-setup-analyst-shadow-contract";

function fixtureEvaluation(
  id: string,
  canonicalDecision: "trade" | "no_trade",
  analystAssessment: "trade" | "no_trade",
  realizedR: number,
) {
  const assessmentResult = validateTureSetupAnalystShadowAssessment({
    assessment_version: TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION,
    contract_version: TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
    mode: "shadow_only",
    agent_version: "setup-analyst-v1",
    model_version: "unbound-model",
    prompt_version: "prompt-v1",
    candidate_id: `candidate-${id}`,
    recommendation_id: `recommendation-${id}`,
    thesis_quality: "adequate",
    contradiction_flags: ["volume_mixed"],
    strongest_evidence: ["canonical_plan_present"],
    weakest_evidence: ["regime_uncertain"],
    data_quality_concerns: [],
    regime_alignment: "mixed",
    setup_alignment: "aligned",
    risk_concerns: ["stop_distance_wide"],
    trade_or_no_trade_assessment: analystAssessment,
    confidence_in_assessment: 0.42,
    escalation_reason: "regime_conflict",
    trace_id: `trace:setup-analyst:${id}`,
    authority: { ...TURE_SETUP_ANALYST_AUTHORITY },
  });
  if (!assessmentResult.valid || !assessmentResult.assessment) {
    throw new Error("Fixture invalid");
  }

  const shadowRun = runTureSetupAnalystInProcessShadow({
    accepted_assessment: assessmentResult.assessment,
    trace_metadata: {
      trace_id: `trace:setup-analyst:${id}`,
      agent_version: "setup-analyst-v1",
      model_version: "unbound-model",
      prompt_version: "prompt-v1",
      toolset_version: TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION,
      tool_ids: ["getCandidateContext", "getMarketRegime"],
      latency_ms: 812,
      input_tokens: 1_240,
      output_tokens: 315,
      estimated_cost_usd: 0.0184,
      privacy: { ...TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY },
    },
  });
  const fixture = createTureSetupAnalystFrozenEvaluationFixture({
    fixture_version: TURE_SETUP_ANALYST_EVALUATION_FIXTURE_VERSION,
    fixture_id: `fixture:setup-analyst:${id}`,
    frozen_at: "2026-09-04T20:00:00.000Z",
    subject: {
      candidate_id: `candidate-${id}`,
      recommendation_id: `recommendation-${id}`,
    },
    canonical_decision: canonicalDecision,
    realized_outcome: {
      terminal_label: realizedR > 0 ? "target" : realizedR < 0 ? "stop" : "expired",
      realized_r: realizedR,
      mfe_r: 0.3,
      mae_r: 1.2,
    },
  });

  return evaluateTureSetupAnalystFrozenFixture({
    accepted_assessment: assessmentResult.assessment,
    shadow_run: shadowRun,
    fixture,
  });
}

function validInput() {
  return Object.freeze({
    baseline: Object.freeze({
      descriptor_version: TURE_SETUP_ANALYST_BASELINE_DESCRIPTOR_VERSION,
      baseline_id: "current_ture",
      baseline_version: "ture-decision-baseline-v1",
    }),
    fixture_evaluations: Object.freeze([
      fixtureEvaluation("001", "trade", "trade", 1),
      fixtureEvaluation("002", "no_trade", "trade", -1),
    ]),
  });
}

function replaceFixtureSet(
  input: ReturnType<typeof validInput>,
  fixtureEvaluations: unknown,
) {
  return Object.freeze({ ...input, fixture_evaluations: fixtureEvaluations });
}

test("AI-01.2 returns fresh detached default-deny aggregates across repeated valid calls", () => {
  const input = validInput();
  const first = compareTureSetupAnalystMultiFixtureBaseline(input);
  const second = compareTureSetupAnalystMultiFixtureBaseline(input);

  expect(first).toEqual(second);
  expect(first).not.toBe(second);
  expect(first.baseline).not.toBe(second.baseline);
  expect(first.summary).not.toBe(second.summary);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.baseline)).toBe(true);
  expect(Object.isFrozen(first.summary)).toBe(true);
  expect(first.comparison_status).toBe("evidence_incomplete");
  expect(first.promotion_disposition).toBe("not_admitted");
  expect(first.authority.may_perform_io).toBe(false);
  expect(first.authority.may_promote_model_or_policy).toBe(false);
  expect(JSON.stringify(first)).not.toContain("fixture:setup-analyst");
});

test("AI-01.2 fails closed on widened, symbol-bearing, sparse or nonstandard fixture arrays", () => {
  const input = validInput();
  const widened = [...input.fixture_evaluations] as unknown[] & {
    unexpected?: string;
  };
  Object.defineProperty(widened, "unexpected", {
    value: "must-not-pass",
    enumerable: false,
  });
  Object.freeze(widened);

  const symbolBearing = [...input.fixture_evaluations];
  Object.defineProperty(symbolBearing, Symbol("fixture-metadata"), {
    value: "must-not-pass",
    enumerable: false,
  });
  Object.freeze(symbolBearing);

  const sparse = [input.fixture_evaluations[0], , input.fixture_evaluations[1]];
  Object.freeze(sparse);

  const nonstandardPrototype = [...input.fixture_evaluations];
  Object.setPrototypeOf(nonstandardPrototype, {});
  Object.freeze(nonstandardPrototype);

  for (const fixtureEvaluations of [
    widened,
    symbolBearing,
    sparse,
    nonstandardPrototype,
  ]) {
    expect(() =>
      compareTureSetupAnalystMultiFixtureBaseline(
        replaceFixtureSet(input, fixtureEvaluations) as CompareTureSetupAnalystMultiFixtureBaselineInput,
      ),
    ).toThrow("Invalid Ture Setup Analyst multi-fixture baseline input.");
  }
});

test("AI-01.2 rejects accessor-backed fixture entries without evaluating the getter", () => {
  const input = validInput();
  const accessorBacked: unknown[] = [];
  Object.defineProperty(accessorBacked, "0", {
    enumerable: true,
    get() {
      throw new Error("untrusted fixture getter must not run");
    },
  });
  Object.defineProperty(accessorBacked, "1", {
    enumerable: true,
    value: input.fixture_evaluations[1],
  });
  Object.freeze(accessorBacked);

  expect(() =>
    compareTureSetupAnalystMultiFixtureBaseline(
      replaceFixtureSet(input, accessorBacked) as CompareTureSetupAnalystMultiFixtureBaselineInput,
    ),
  ).toThrow("Invalid Ture Setup Analyst multi-fixture baseline input.");
});
