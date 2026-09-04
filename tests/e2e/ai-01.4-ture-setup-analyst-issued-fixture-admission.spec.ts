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
      fixtureEvaluation("003", "no_trade", "no_trade", 0),
    ]),
  });
}

test("AI-01.4 admits exact evaluator results but rejects a frozen structural lookalike", () => {
  const input = validInput();
  const accepted = compareTureSetupAnalystMultiFixtureBaseline(input);
  const lookalike = Object.freeze({ ...input.fixture_evaluations[0] });
  const forgedInput = Object.freeze({
    ...input,
    fixture_evaluations: Object.freeze([lookalike, input.fixture_evaluations[1]]),
  });

  expect(accepted.evaluated_fixture_count).toBe(3);
  expect(accepted.promotion_disposition).toBe("not_admitted");
  expect(Object.isFrozen(accepted)).toBe(true);
  expect(() =>
    compareTureSetupAnalystMultiFixtureBaseline(
      forgedInput as CompareTureSetupAnalystMultiFixtureBaselineInput,
    ),
  ).toThrow("Invalid Ture Setup Analyst multi-fixture baseline input.");
});
