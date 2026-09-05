import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-canonical-outcome-projection.ts";
const docPath = "docs/ai-02.2-ture-setup-analyst-canonical-outcome-issuer.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.2-ture-setup-analyst-canonical-outcome-issuer.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedProjection = {
  projectTureSetupAnalystCanonicalOutcome(input: unknown): object;
  isTureSetupAnalystIssuedCanonicalOutcomeProjection(value: unknown): boolean;
};

function loadProjection(): LoadedProjection {
  const transpiled = ts.transpileModule(source(sourcePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: sourcePath,
  }).outputText;
  const sandbox = {
    Array,
    Boolean,
    Date,
    Number,
    Object,
    Reflect,
    TypeError,
    WeakSet,
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpiled, sandbox, { filename: sourcePath });
  return sandbox.exports as LoadedProjection;
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object") return value;

  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function validInput() {
  return Object.freeze({
    canonical_evaluation: deepFreeze({
      read_model_version: "canonical_evaluation_quality_read_model_v1",
      canonical_identity: "canonical:recommendation:shadow:2026-09-05:issuer",
      sample_type: "shadow",
      cohort: "shadow_recommendation_quality",
      primary_horizon: "60m",
      terminal_outcome: "target_before_stop",
      r_result: 1.75,
      numeric_confidence: 0.73,
      confidence_probability_semantics: "probability_0_1",
      decision_day: "2026-09-05",
      parity_verified: true,
      reproducible: true,
      cohort_quality_eligible: true,
      eligibility_status: "eligible",
      reason_codes: [],
      versions: {
        engine: "engine-v1",
        scoring: "scoring-v1",
        ranking: "ranking-v1",
        evaluator: "evaluator-v1",
        provider: "provider-contract-v1",
      },
    }),
  });
}

test("AI-02.2 recognizes only this module instance's issued frozen projection", () => {
  const issuer = loadProjection();
  const issued = issuer.projectTureSetupAnalystCanonicalOutcome(validInput());
  const structuralLookalike = deepFreeze(structuredClone(issued));
  const cloned = structuredClone(issued);
  const otherIssuer = loadProjection();
  const otherIssued = otherIssuer.projectTureSetupAnalystCanonicalOutcome(
    validInput(),
  );

  expect(Object.isFrozen(issued)).toBe(true);
  expect(issuer.isTureSetupAnalystIssuedCanonicalOutcomeProjection(issued)).toBe(
    true,
  );
  expect(
    issuer.isTureSetupAnalystIssuedCanonicalOutcomeProjection(structuralLookalike),
  ).toBe(false);
  expect(issuer.isTureSetupAnalystIssuedCanonicalOutcomeProjection(cloned)).toBe(
    false,
  );
  expect(
    issuer.isTureSetupAnalystIssuedCanonicalOutcomeProjection(otherIssued),
  ).toBe(false);
  expect(
    otherIssuer.isTureSetupAnalystIssuedCanonicalOutcomeProjection(otherIssued),
  ).toBe(true);
});

test("AI-02.2 remains server-only, source-only and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).toContain("new WeakSet<object>()");
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/not a\s+durable receipt/i);
  expect(doc).toMatch(/not_admitted/);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
