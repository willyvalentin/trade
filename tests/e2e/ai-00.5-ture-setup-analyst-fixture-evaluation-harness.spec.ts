import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TURE_SETUP_ANALYST_FIXTURE_EVALUATION_AUTHORITY,
  TURE_SETUP_ANALYST_FIXTURE_EVALUATION_HARNESS_VERSION,
  TURE_SETUP_ANALYST_EVALUATION_FIXTURE_VERSION,
  createTureSetupAnalystFrozenEvaluationFixture,
  evaluateTureSetupAnalystFrozenFixture,
  type EvaluateTureSetupAnalystFrozenFixtureInput,
} from "../../lib/ture-setup-analyst-fixture-evaluation-harness";
import { runTureSetupAnalystInProcessShadow } from "../../lib/ture-setup-analyst-in-process-shadow-runner";
import { TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION } from "../../lib/ture-setup-analyst-read-only-context-tools";
import { TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY } from "../../lib/ture-setup-analyst-shadow-trace-contract";
import {
  TURE_SETUP_ANALYST_AUTHORITY,
  TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION,
  TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
  validateTureSetupAnalystShadowAssessment,
  type TureSetupAnalystShadowAssessment,
} from "../../lib/ture-setup-analyst-shadow-contract";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/ture-setup-analyst-fixture-evaluation-harness.ts";
const docPath = "docs/ai-00.5-ture-setup-analyst-fixture-evaluation-harness.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-00.5-ture-setup-analyst-fixture-evaluation-harness.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function acceptedAssessment(): Readonly<TureSetupAnalystShadowAssessment> {
  const result = validateTureSetupAnalystShadowAssessment({
    assessment_version: TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION,
    contract_version: TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
    mode: "shadow_only",
    agent_version: "setup-analyst-v1",
    model_version: "unbound-model",
    prompt_version: "prompt-v1",
    candidate_id: "candidate-1",
    recommendation_id: "recommendation-1",
    thesis_quality: "adequate",
    contradiction_flags: ["volume_mixed"],
    strongest_evidence: ["canonical_plan_present"],
    weakest_evidence: ["regime_uncertain"],
    data_quality_concerns: [],
    regime_alignment: "mixed",
    setup_alignment: "aligned",
    risk_concerns: ["stop_distance_wide"],
    trade_or_no_trade_assessment: "insufficient_evidence",
    confidence_in_assessment: 0.42,
    escalation_reason: "regime_conflict",
    trace_id: "trace:setup-analyst:001",
    authority: { ...TURE_SETUP_ANALYST_AUTHORITY },
  });
  if (!result.valid || !result.assessment) throw new Error("Fixture invalid");
  return result.assessment;
}

function shadowRun() {
  return runTureSetupAnalystInProcessShadow({
    accepted_assessment: acceptedAssessment(),
    trace_metadata: {
      trace_id: "trace:setup-analyst:001",
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
}

function frozenFixture() {
  return createTureSetupAnalystFrozenEvaluationFixture({
    fixture_version: TURE_SETUP_ANALYST_EVALUATION_FIXTURE_VERSION,
    fixture_id: "fixture:setup-analyst:001",
    frozen_at: "2026-09-04T09:30:00.000Z",
    subject: {
      candidate_id: "candidate-1",
      recommendation_id: "recommendation-1",
    },
    canonical_decision: "no_trade",
    realized_outcome: {
      terminal_label: "stop",
      realized_r: -1,
      mfe_r: 0.3,
      mae_r: 1.2,
    },
  });
}

function validInput(): EvaluateTureSetupAnalystFrozenFixtureInput {
  return {
    accepted_assessment: acceptedAssessment(),
    shadow_run: shadowRun(),
    fixture: frozenFixture(),
  };
}

test("AI-00.5 evaluates only a frozen fixture against an admitted shadow run", () => {
  const first = evaluateTureSetupAnalystFrozenFixture(validInput());
  const second = evaluateTureSetupAnalystFrozenFixture(validInput());

  expect(first).toMatchObject({
    harness_version: TURE_SETUP_ANALYST_FIXTURE_EVALUATION_HARNESS_VERSION,
    mode: "fixture_only_shadow_evaluation",
    evaluation_status: "fixture_evaluated",
    fixture_id: "fixture:setup-analyst:001",
    subject: { candidate_id: "candidate-1", recommendation_id: "recommendation-1" },
    comparison: {
      canonical_decision: "no_trade",
      agent_assessment: "insufficient_evidence",
      decision_agreement: "different",
      agent_confidence: 0.42,
    },
    realized_outcome: {
      terminal_label: "stop",
      outcome_direction: "unfavorable",
      realized_r: -1,
      mfe_r: 0.3,
      mae_r: 1.2,
    },
    trace_metrics: {
      trace_id: "trace:setup-analyst:001",
      latency_ms: 812,
      input_tokens: 1_240,
      output_tokens: 315,
      estimated_cost_usd: 0.0184,
    },
  });
  expect(first.authority).toBe(TURE_SETUP_ANALYST_FIXTURE_EVALUATION_AUTHORITY);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.subject)).toBe(true);
  expect(Object.isFrozen(first.comparison)).toBe(true);
  expect(Object.isFrozen(first.realized_outcome)).toBe(true);
  expect(Object.isFrozen(first.trace_metrics)).toBe(true);
  expect(first).not.toBe(second);
  expect(first).toEqual(second);
  expect(JSON.stringify(first)).not.toContain("strongest_evidence");
  expect(first).not.toHaveProperty("assessment");
  expect(first).not.toHaveProperty("shadow_run");
});

test("AI-00.5 fails closed on mutable, widened or cross-subject evaluation material", () => {
  const mutableFixture = { ...frozenFixture() };
  expect(() =>
    evaluateTureSetupAnalystFrozenFixture({
      ...validInput(),
      fixture: mutableFixture,
    }),
  ).toThrow("Invalid Ture Setup Analyst fixture evaluation input.");

  const crossSubject = createTureSetupAnalystFrozenEvaluationFixture({
    ...frozenFixture(),
    fixture_id: "fixture:other",
    subject: { candidate_id: "candidate-other", recommendation_id: "recommendation-1" },
  });
  expect(() =>
    evaluateTureSetupAnalystFrozenFixture({ ...validInput(), fixture: crossSubject }),
  ).toThrow("Invalid Ture Setup Analyst fixture evaluation input.");

  const widened = { ...validInput(), promotion_decision: "promote" };
  expect(() => evaluateTureSetupAnalystFrozenFixture(widened)).toThrow(
    "Invalid Ture Setup Analyst fixture evaluation input.",
  );

  const accessorBacked = validInput() as Record<string, unknown>;
  Object.defineProperty(accessorBacked, "shadow_run", {
    enumerable: true,
    get() {
      throw new Error("must not run");
    },
  });
  expect(() =>
    evaluateTureSetupAnalystFrozenFixture(
      accessorBacked as unknown as EvaluateTureSetupAnalystFrozenFixtureInput,
    ),
  ).toThrow("Invalid Ture Setup Analyst fixture evaluation input.");

  const mutableRun = { ...shadowRun() };
  expect(() =>
    evaluateTureSetupAnalystFrozenFixture({
      ...validInput(),
      shadow_run: mutableRun,
    }),
  ).toThrow("Invalid Ture Setup Analyst fixture evaluation input.");
});

test("AI-00.5 remains fixture-only, provider-free and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toContain("no model, provider, context-tool, database");
  expect(doc).toContain("no evaluation sink, route, queue, UI");
  expect(doc).toContain("no model or policy promotion");
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
