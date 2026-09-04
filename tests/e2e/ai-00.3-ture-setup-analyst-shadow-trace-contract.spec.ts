import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TURE_SETUP_ANALYST_SHADOW_TRACE_AUTHORITY,
  TURE_SETUP_ANALYST_SHADOW_TRACE_CONTRACT_VERSION,
  TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY,
  createTureSetupAnalystShadowTrace,
  type CreateTureSetupAnalystShadowTraceInput,
} from "../../lib/ture-setup-analyst-shadow-trace-contract";
import { TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION } from "../../lib/ture-setup-analyst-read-only-context-tools";
import {
  TURE_SETUP_ANALYST_AUTHORITY,
  TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION,
  TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
  type TureSetupAnalystShadowAssessment,
} from "../../lib/ture-setup-analyst-shadow-contract";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/ture-setup-analyst-shadow-trace-contract.ts";
const docPath = "docs/ai-00.3-ture-setup-analyst-shadow-trace-contract.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/ai-00.3-ture-setup-analyst-shadow-trace-contract.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function validAssessment(): TureSetupAnalystShadowAssessment {
  return {
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
  };
}

function validInput(): CreateTureSetupAnalystShadowTraceInput {
  return {
    assessment: validAssessment(),
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
  };
}

test("AI-00.3 creates a frozen metadata-only trace with bounded cost telemetry", () => {
  const trace = createTureSetupAnalystShadowTrace(validInput());

  expect(trace).toMatchObject({
    trace_contract_version: TURE_SETUP_ANALYST_SHADOW_TRACE_CONTRACT_VERSION,
    contract_version: TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
    mode: "metadata_only_shadow",
    trace_id: "trace:setup-analyst:001",
    assessment_identity: {
      candidate_id: "candidate-1",
      recommendation_id: "recommendation-1",
    },
    versions: {
      agent_version: "setup-analyst-v1",
      model_version: "unbound-model",
      prompt_version: "prompt-v1",
      toolset_version: TURE_SETUP_ANALYST_READ_ONLY_CONTEXT_BOUNDARY_VERSION,
    },
    tool_ids: ["getCandidateContext", "getMarketRegime"],
    timing: { latency_ms: 812 },
    usage: { input_tokens: 1_240, output_tokens: 315, estimated_cost_usd: 0.0184 },
  });
  expect(trace.privacy).toBe(TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY);
  expect(trace.authority).toBe(TURE_SETUP_ANALYST_SHADOW_TRACE_AUTHORITY);
  expect(Object.isFrozen(trace)).toBe(true);
  expect(Object.isFrozen(trace.assessment_identity)).toBe(true);
  expect(Object.isFrozen(trace.versions)).toBe(true);
  expect(Object.isFrozen(trace.tool_ids)).toBe(true);
  expect(Object.isFrozen(trace.timing)).toBe(true);
  expect(Object.isFrozen(trace.usage)).toBe(true);
  expect(JSON.stringify(trace)).not.toContain("strongest_evidence");
  expect(JSON.stringify(trace)).not.toContain("plan_snapshot");
  expect(trace).not.toHaveProperty("raw_prompt");
  expect(trace).not.toHaveProperty("raw_model_output");
});

test("AI-00.3 fails closed on trace/version/authority/privacy widening", () => {
  const traceMismatch = validInput();
  const mismatchedTrace = { ...traceMismatch, trace_id: "trace:other" };
  expect(() =>
    createTureSetupAnalystShadowTrace(
      mismatchedTrace as unknown as CreateTureSetupAnalystShadowTraceInput,
    ),
  ).toThrow(
    "Invalid Ture Setup Analyst shadow trace input.",
  );

  const duplicateTool = validInput();
  const duplicatedTools = {
    ...duplicateTool,
    tool_ids: ["getCandidateContext", "getCandidateContext"],
  };
  expect(() =>
    createTureSetupAnalystShadowTrace(
      duplicatedTools as unknown as CreateTureSetupAnalystShadowTraceInput,
    ),
  ).toThrow(
    "Invalid Ture Setup Analyst shadow trace input.",
  );

  const sensitive = validInput();
  const sensitivePrivacy = {
    ...sensitive,
    privacy: {
      ...TURE_SETUP_ANALYST_SHADOW_TRACE_PRIVACY,
      raw_prompt_retained: true,
    },
  };
  expect(() =>
    createTureSetupAnalystShadowTrace(
      sensitivePrivacy as unknown as CreateTureSetupAnalystShadowTraceInput,
    ),
  ).toThrow(
    "Invalid Ture Setup Analyst shadow trace input.",
  );

  const widened = { ...validInput(), raw_prompt: "must never be accepted" };
  expect(() => createTureSetupAnalystShadowTrace(widened)).toThrow(
    "Invalid Ture Setup Analyst shadow trace input.",
  );

  const accessorBacked = validInput() as Record<string, unknown>;
  Object.defineProperty(accessorBacked, "privacy", {
    enumerable: true,
    get() {
      throw new Error("must not run");
    },
  });
  expect(() =>
    createTureSetupAnalystShadowTrace(
      accessorBacked as unknown as ReturnType<typeof validInput>,
    ),
  ).toThrow("Invalid Ture Setup Analyst shadow trace input.");
});

test("AI-00.3 remains provider-free, non-persistent and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toContain("no Agents SDK/OpenAI call");
  expect(doc).toContain("logging sink, trace export, route, queue, UI");
  expect(doc).toContain("no raw prompt and no raw model output");
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
