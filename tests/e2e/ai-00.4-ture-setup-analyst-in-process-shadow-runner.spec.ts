import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_AUTHORITY,
  TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_VERSION,
  runTureSetupAnalystInProcessShadow,
  type RunTureSetupAnalystInProcessShadowInput,
} from "../../lib/ture-setup-analyst-in-process-shadow-runner";
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
const sourcePath = "lib/ture-setup-analyst-in-process-shadow-runner.ts";
const docPath = "docs/ai-00.4-ture-setup-analyst-in-process-shadow-runner.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-00.4-ture-setup-analyst-in-process-shadow-runner.spec.ts";

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

function validInput(): RunTureSetupAnalystInProcessShadowInput {
  return {
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
  };
}

test("AI-00.4 returns only a fresh frozen metadata trace from accepted context", () => {
  const first = runTureSetupAnalystInProcessShadow(validInput());
  const second = runTureSetupAnalystInProcessShadow(validInput());

  expect(first).toMatchObject({
    runner_version: TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_VERSION,
    mode: "in_process_shadow_only",
    run_status: "shadow_trace_emitted",
    trace: {
      trace_id: "trace:setup-analyst:001",
      assessment_identity: {
        candidate_id: "candidate-1",
        recommendation_id: "recommendation-1",
      },
      tool_ids: ["getCandidateContext", "getMarketRegime"],
      usage: { input_tokens: 1_240, output_tokens: 315, estimated_cost_usd: 0.0184 },
    },
  });
  expect(first.authority).toBe(TURE_SETUP_ANALYST_IN_PROCESS_SHADOW_RUNNER_AUTHORITY);
  expect(first.trace.privacy).toBe(TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.trace)).toBe(true);
  expect(first).not.toBe(second);
  expect(first.trace).not.toBe(second.trace);
  expect(first).toEqual(second);
  expect(JSON.stringify(first)).not.toContain("strongest_evidence");
  expect(first).not.toHaveProperty("raw_prompt");
  expect(first).not.toHaveProperty("raw_model_output");
  expect(first).not.toHaveProperty("assessment");
  expect(first).not.toHaveProperty("context_tools");
});

test("AI-00.4 fails closed without an accepted closed assessment and trace metadata", () => {
  const mutableAssessment = { ...acceptedAssessment() };
  expect(() =>
    runTureSetupAnalystInProcessShadow({
      ...validInput(),
      accepted_assessment: mutableAssessment,
    }),
  ).toThrow("Invalid Ture Setup Analyst in-process shadow run input.");

  const widened = {
    ...validInput(),
    raw_prompt: "must never be accepted",
  };
  expect(() => runTureSetupAnalystInProcessShadow(widened)).toThrow(
    "Invalid Ture Setup Analyst in-process shadow run input.",
  );

  const widenedMetadata = {
    ...validInput(),
    trace_metadata: {
      ...validInput().trace_metadata,
      context_tool_response: "must never be accepted",
    },
  };
  expect(() => runTureSetupAnalystInProcessShadow(widenedMetadata)).toThrow(
    "Invalid Ture Setup Analyst in-process shadow run input.",
  );

  const accessorBacked = validInput() as Record<string, unknown>;
  Object.defineProperty(accessorBacked, "trace_metadata", {
    enumerable: true,
    get() {
      throw new Error("must not run");
    },
  });
  expect(() =>
    runTureSetupAnalystInProcessShadow(
      accessorBacked as unknown as RunTureSetupAnalystInProcessShadowInput,
    ),
  ).toThrow("Invalid Ture Setup Analyst in-process shadow run input.");

  const mismatchedPrivacy = validInput();
  const nonPrivate = {
    ...mismatchedPrivacy,
    trace_metadata: {
      ...mismatchedPrivacy.trace_metadata,
      privacy: {
        ...TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY,
        raw_model_output_retained: true,
      },
    },
  };
  expect(() =>
    runTureSetupAnalystInProcessShadow(
      nonPrivate as unknown as RunTureSetupAnalystInProcessShadowInput,
    ),
  ).toThrow("Invalid Ture Setup Analyst shadow trace input.");
});

test("AI-00.4 remains provider-free, in-process-only and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/returned in memory to the direct\s+caller only/);
  expect(doc).toContain("no Agents SDK/OpenAI call");
  expect(doc).toContain("context-tool adapter, database access");
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
