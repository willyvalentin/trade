import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TURE_SETUP_ANALYST_AUTHORITY,
  TURE_SETUP_ANALYST_SHADOW_ASSESSMENT_VERSION,
  TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
  createTureSetupAnalystShadowRequest,
  tureSetupAnalystReadOnlyToolIds,
  validateTureSetupAnalystShadowAssessment,
} from "../../lib/ture-setup-analyst-shadow-contract";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/ture-setup-analyst-shadow-contract.ts";
const docPath = "docs/ai-00.1-ture-setup-analyst-contract-freeze.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/ai-00.1-ture-setup-analyst-contract-freeze.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function validAssessment() {
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
    trace_id: null,
    authority: { ...TURE_SETUP_ANALYST_AUTHORITY },
  };
}

test("AI-00.1 creates only a frozen, canonical-plan shadow request", () => {
  const request = createTureSetupAnalystShadowRequest({
    candidate_id: "candidate-1",
    recommendation_id: "recommendation-1",
    canonical_snapshot_id: "snapshot-1",
    captured_at: "2026-09-04T09:00:00.000Z",
    plan_snapshot: { entry_price: 100, stop_price: 98, target_price: 104 },
  });

  expect(request).toMatchObject({
    contract_version: TURE_SETUP_ANALYST_SHADOW_CONTRACT_VERSION,
    mode: "shadow_only",
    plan_snapshot: { entry_price: 100, stop_price: 98, target_price: 104 },
    authority: TURE_SETUP_ANALYST_AUTHORITY,
  });
  expect(request.allowed_tools).toEqual(tureSetupAnalystReadOnlyToolIds);
  expect(Object.isFrozen(request)).toBe(true);
  expect(Object.isFrozen(request.plan_snapshot)).toBe(true);
  expect(Object.isFrozen(request.allowed_tools)).toBe(true);
  expect(() =>
    createTureSetupAnalystShadowRequest({
      candidate_id: "candidate-1",
      recommendation_id: "recommendation-1",
      canonical_snapshot_id: "snapshot-1",
      captured_at: "not-a-date",
      plan_snapshot: { entry_price: 100, stop_price: 98, target_price: 104 },
    }),
  ).toThrow("Invalid Ture Setup Analyst shadow request input.");
});

test("AI-00.1 accepts a closed assessment and rebuilds immutable shadow authority", () => {
  const parsed = validateTureSetupAnalystShadowAssessment(validAssessment());
  expect(parsed.valid).toBe(true);
  if (!parsed.valid) return;
  expect(parsed.errors).toEqual([]);
  expect(parsed.assessment.authority).toBe(TURE_SETUP_ANALYST_AUTHORITY);
  expect(Object.isFrozen(parsed.assessment)).toBe(true);
  expect(Object.isFrozen(parsed.assessment.contradiction_flags)).toBe(true);
  expect(parsed.assessment.trade_or_no_trade_assessment).toBe("insufficient_evidence");
});

test("AI-00.1 fails closed on widened or authority-escalating assessment material", () => {
  const widened = { ...validAssessment(), additional_instruction: "change risk" };
  expect(validateTureSetupAnalystShadowAssessment(widened)).toEqual({
    valid: false,
    assessment: null,
    errors: ["assessment_shape_invalid"],
  });

  const escalated = validAssessment();
  (
    escalated.authority as unknown as { may_place_or_cancel_orders: boolean }
  ).may_place_or_cancel_orders = true;
  expect(validateTureSetupAnalystShadowAssessment(escalated)).toEqual({
    valid: false,
    assessment: null,
    errors: ["authority_must_remain_shadow_only"],
  });

  const accessorBacked = validAssessment();
  Object.defineProperty(accessorBacked, "trace_id", {
    enumerable: true,
    get() {
      throw new Error("must not run");
    },
  });
  expect(validateTureSetupAnalystShadowAssessment(accessorBacked)).toEqual({
    valid: false,
    assessment: null,
    errors: ["assessment_shape_invalid"],
  });
});

test("AI-00.1 is provider-free, runtime-unwired and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).not.toMatch(/from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i);
  expect(doc).toContain("no OpenAI or Agents SDK invocation");
  expect(doc).toContain("route, queue, database write, Netlify binding");
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
