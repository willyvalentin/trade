import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/server/ture-setup-analyst-canonical-evidence-receipt-profile.ts";
const docPath = "docs/ai-02.6-ture-setup-analyst-canonical-evidence-receipt-profile.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/ai-02.6-ture-setup-analyst-canonical-evidence-receipt-profile.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedProfile = {
  profileTureSetupAnalystCanonicalEvidenceReceipt(input: unknown): {
    readonly profile_status: string;
    readonly source_evidence: {
      readonly canonical_identity: string;
      readonly semantic_payload_sha256: string;
      readonly primary_outcome_status: string;
      readonly diagnostic_horizon_count: number;
      readonly inactive_readiness_only: boolean;
    };
    readonly canonical_evidence_disposition: string;
    readonly blocking_reasons: readonly string[];
    readonly next_gate: string;
    readonly authority: {
      readonly may_access_staging: boolean;
      readonly may_persist_source_evidence: boolean;
      readonly may_form_offline_dataset: boolean;
      readonly may_run_offline_evaluation: boolean;
      readonly may_bind_runtime: boolean;
    };
  };
};

function loadProfile(): LoadedProfile {
  const transpiled = ts.transpileModule(source(sourcePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: sourcePath,
  }).outputText;
  const sandbox = {
    Object,
    Reflect,
    TypeError,
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: sourcePath });
  return sandbox.exports as LoadedProfile;
}

function validInput(overrides: Record<string, unknown> = {}) {
  return Object.freeze({
    receipt: Object.freeze({
      environment: "staging",
      relation: "public.canonical_evaluation_decisions",
      canonical_identity: "rec_decision:v1:historical_replay:historical-candidate-001:1780320900000",
      semantic_payload_sha256: "e67b746f2be28d7fdeeefb33284fe607e5361d2b61e02184057d48160db68975",
      sample_type: "historical_synthetic",
      decision_kind: "historical_synthetic",
      reproducible: true,
      quality_metrics_eligible: true,
      inactive_readiness_only: true,
      primary_outcome_status: "absent",
      diagnostic_horizon_count: 0,
      ...overrides,
    }),
  });
}

test("AI-02.6 profiles only the exact inactive staging receipt", () => {
  const profile = loadProfile();
  const result = profile.profileTureSetupAnalystCanonicalEvidenceReceipt(validInput());

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.source_evidence)).toBe(true);
  expect(Object.isFrozen(result.blocking_reasons)).toBe(true);
  expect(result).toMatchObject({
    profile_status: "receipt_profiled_not_admitted",
    source_evidence: {
      canonical_identity: "rec_decision:v1:historical_replay:historical-candidate-001:1780320900000",
      semantic_payload_sha256: "e67b746f2be28d7fdeeefb33284fe607e5361d2b61e02184057d48160db68975",
      primary_outcome_status: "absent",
      diagnostic_horizon_count: 0,
      inactive_readiness_only: true,
    },
    canonical_evidence_disposition: "not_admitted",
    blocking_reasons: [
      "primary_outcome_absent",
      "diagnostic_horizons_absent",
      "inactive_readiness_only",
      "separate_evaluator_admission_required",
    ],
    next_gate: "separately_authorized_completed_outcome_evidence_admission",
    authority: {
      may_access_staging: false,
      may_persist_source_evidence: false,
      may_form_offline_dataset: false,
      may_run_offline_evaluation: false,
      may_bind_runtime: false,
    },
  });
});

test("AI-02.6 fails closed for widened, outcome-bearing or noncanonical receipts", () => {
  const profile = loadProfile();
  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ canonical_identity: "rec_decision:v1:other:other:1" }),
    validInput({ semantic_payload_sha256: "0".repeat(64) }),
    validInput({ sample_type: "visible" }),
    validInput({ decision_kind: "recommendation" }),
    validInput({ reproducible: false }),
    validInput({ quality_metrics_eligible: false }),
    validInput({ inactive_readiness_only: false }),
    validInput({ primary_outcome_status: "present" }),
    validInput({ diagnostic_horizon_count: 1 }),
    validInput({ unexpected: "widened" }),
  ]) {
    expect(() => profile.profileTureSetupAnalystCanonicalEvidenceReceipt(invalid)).toThrow(TypeError);
  }
});

test("AI-02.6 rejects mutable, accessor-backed and faulting proxy receipts", () => {
  const profile = loadProfile();
  const mutable = { ...validInput().receipt };
  const accessorReceipt = Object.freeze(Object.defineProperty({}, "environment", {
    enumerable: true,
    get() { throw new Error("must not read accessor receipt"); },
  }));
  const faultingProxy = new Proxy({}, {
    isExtensible() { throw new Error("must not inspect proxy input"); },
  });

  expect(() => profile.profileTureSetupAnalystCanonicalEvidenceReceipt(Object.freeze({ receipt: mutable }))).toThrow(TypeError);
  expect(() => profile.profileTureSetupAnalystCanonicalEvidenceReceipt(Object.freeze({ receipt: accessorReceipt }))).toThrow(TypeError);
  expect(() => profile.profileTureSetupAnalystCanonicalEvidenceReceipt(faultingProxy)).toThrow(TypeError);
});

test("AI-02.6 remains server-only, I/O-free and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(/from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i);
  expect(doc).toMatch(/not evaluator, dataset or promotion authority/i);
  expect(doc).toMatch(/does not query Supabase/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
