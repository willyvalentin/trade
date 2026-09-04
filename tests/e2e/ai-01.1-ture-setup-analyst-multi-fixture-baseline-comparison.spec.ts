import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
  TURE_SETUP_ANALYST_MULTI_FIXTURE_BASELINE_COMPARISON_AUTHORITY,
  TURE_SETUP_ANALYST_MULTI_FIXTURE_BASELINE_COMPARISON_VERSION,
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

const root = resolve(__dirname, "../..");
const sourcePath = "lib/ture-setup-analyst-multi-fixture-baseline-comparison.ts";
const docPath = "docs/ai-01.1-ture-setup-analyst-multi-fixture-baseline-comparison.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-01.1-ture-setup-analyst-multi-fixture-baseline-comparison.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function acceptedAssessment(id: string, assessment: "trade" | "no_trade") {
  const result = validateTureSetupAnalystShadowAssessment({
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
    trade_or_no_trade_assessment: assessment,
    confidence_in_assessment: 0.42,
    escalation_reason: "regime_conflict",
    trace_id: `trace:setup-analyst:${id}`,
    authority: { ...TURE_SETUP_ANALYST_AUTHORITY },
  });
  if (!result.valid || !result.assessment) throw new Error("Fixture invalid");
  return result.assessment;
}

function fixtureEvaluation(
  id: string,
  canonicalDecision: "trade" | "no_trade",
  analystAssessment: "trade" | "no_trade",
  realizedR: number,
) {
  const assessment = acceptedAssessment(id, analystAssessment);
  const shadowRun = runTureSetupAnalystInProcessShadow({
    accepted_assessment: assessment,
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
    accepted_assessment: assessment,
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

test("AI-01.1 returns only a detached default-deny aggregate for multiple frozen fixtures", () => {
  const first = compareTureSetupAnalystMultiFixtureBaseline(validInput());
  const second = compareTureSetupAnalystMultiFixtureBaseline(validInput());

  expect(first).toEqual({
    comparison_version: TURE_SETUP_ANALYST_MULTI_FIXTURE_BASELINE_COMPARISON_VERSION,
    mode: "in_memory_multi_fixture_baseline_comparison",
    comparison_status: "evidence_incomplete",
    baseline: {
      descriptor_version: TURE_SETUP_ANALYST_BASELINE_DESCRIPTOR_VERSION,
      baseline_id: "current_ture",
      baseline_version: "ture-decision-baseline-v1",
      decision_source: "fixture_canonical_decision",
    },
    evaluated_fixture_count: 3,
    summary: {
      baseline_trade_count: 1,
      analyst_trade_count: 2,
      decision_agreement_count: 2,
      decision_difference_count: 1,
      favorable_outcome_count: 1,
      flat_outcome_count: 1,
      unfavorable_outcome_count: 1,
    },
    promotion_disposition: "not_admitted",
    authority: TURE_SETUP_ANALYST_MULTI_FIXTURE_BASELINE_COMPARISON_AUTHORITY,
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.baseline)).toBe(true);
  expect(Object.isFrozen(first.summary)).toBe(true);
  expect(first).not.toBe(second);
  expect(first).toEqual(second);
  expect(first.authority.may_promote_model_or_policy).toBe(false);
  expect(first).not.toHaveProperty("fixture_evaluations");
  expect(JSON.stringify(first)).not.toContain("fixture:setup-analyst");
  expect(JSON.stringify(first)).not.toContain("trace:");
});

test("AI-01.1 fails closed on incomplete, mutable, duplicate, widened or forged fixture material", () => {
  const input = validInput();
  const onlyOneFixture = Object.freeze({
    ...input,
    fixture_evaluations: Object.freeze([input.fixture_evaluations[0]]),
  });
  const mutableSet = Object.freeze({
    ...input,
    fixture_evaluations: [...input.fixture_evaluations],
  });
  const duplicateFixture = Object.freeze({
    ...input,
    fixture_evaluations: Object.freeze([
      input.fixture_evaluations[0],
      input.fixture_evaluations[0],
    ]),
  });
  const forgedBaseline = Object.freeze({
    ...input,
    baseline: Object.freeze({
      ...input.baseline,
      baseline_id: "another_system",
    }),
  });
  const widened = Object.freeze({ ...input, promotion_decision: "promote" });

  for (const invalid of [
    onlyOneFixture,
    mutableSet,
    duplicateFixture,
    forgedBaseline,
    widened,
  ]) {
    expect(() => compareTureSetupAnalystMultiFixtureBaseline(invalid)).toThrow(
      "Invalid Ture Setup Analyst multi-fixture baseline input.",
    );
  }

  const accessorBacked = {} as Record<string, unknown>;
  Object.defineProperty(accessorBacked, "baseline", {
    enumerable: true,
    get() {
      throw new Error("must not run");
    },
  });
  Object.defineProperty(accessorBacked, "fixture_evaluations", {
    enumerable: true,
    value: input.fixture_evaluations,
  });
  expect(() =>
    compareTureSetupAnalystMultiFixtureBaseline(
      accessorBacked as CompareTureSetupAnalystMultiFixtureBaselineInput,
    ),
  ).toThrow("Invalid Ture Setup Analyst multi-fixture baseline input.");
});

test("AI-01.1 remains provider-free, source-only and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toContain("does not assert that any fixture set is statistically");
  expect(doc).toContain("no model/provider or context-tool invocation");
  expect(doc).toContain("or model/policy promotion authority");
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
