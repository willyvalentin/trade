import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-canonical-outcome-projection.ts";
const docPath = "docs/ai-02.1-ture-setup-analyst-canonical-outcome-projection.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.1-ture-setup-analyst-canonical-outcome-projection.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedProjection = {
  TURE_SETUP_ANALYST_CANONICAL_OUTCOME_PROJECTION_AUTHORITY: {
    may_promote_model_or_policy: boolean;
    may_read_repository: boolean;
  };
  TURE_SETUP_ANALYST_CANONICAL_OUTCOME_PROJECTION_VERSION: string;
  projectTureSetupAnalystCanonicalOutcome(input: unknown): {
    authority: {
      may_promote_model_or_policy: boolean;
      may_read_repository: boolean;
    };
    evidence: { versions: Record<string, string> };
  };
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

function validCanonicalEvaluation() {
  return deepFreeze({
    read_model_version: "canonical_evaluation_quality_read_model_v1",
    canonical_identity: "canonical:recommendation:shadow:2026-09-05:001",
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
    ticker: "NVDA",
    sector: "Technology",
    diagnostic_horizons: ["private-to-canonical-read-model"],
  });
}

function validInput() {
  return Object.freeze({ canonical_evaluation: validCanonicalEvaluation() });
}

test("AI-02.1 projects only redacted eligible canonical-outcome scalars", () => {
  const projection = loadProjection();
  const first = projection.projectTureSetupAnalystCanonicalOutcome(validInput());
  const second = projection.projectTureSetupAnalystCanonicalOutcome(validInput());

  expect(first).toEqual({
    projection_version:
      projection.TURE_SETUP_ANALYST_CANONICAL_OUTCOME_PROJECTION_VERSION,
    mode: "server_only_canonical_outcome_projection",
    projection_status: "source_only_projected",
    evidence: {
      canonical_identity: "canonical:recommendation:shadow:2026-09-05:001",
      sample_type: "shadow",
      cohort: "shadow_recommendation_quality",
      decision_day: "2026-09-05",
      primary_horizon: "60m",
      terminal_outcome: "target_before_stop",
      realized_r: 1.75,
      confidence_probability: 0.73,
      versions: {
        engine: "engine-v1",
        scoring: "scoring-v1",
        ranking: "ranking-v1",
        evaluator: "evaluator-v1",
        provider: "provider-contract-v1",
      },
    },
    offline_evaluation_disposition: "not_admitted",
    authority:
      projection.TURE_SETUP_ANALYST_CANONICAL_OUTCOME_PROJECTION_AUTHORITY,
  });
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.evidence)).toBe(true);
  expect(Object.isFrozen(first.evidence.versions)).toBe(true);
  expect(first).not.toBe(second);
  expect(first).toEqual(second);
  expect(JSON.stringify(first)).not.toContain("NVDA");
  expect(JSON.stringify(first)).not.toContain("Technology");
  expect(JSON.stringify(first)).not.toContain("diagnostic_horizons");
  expect(first.authority.may_read_repository).toBe(false);
  expect(first.authority.may_promote_model_or_policy).toBe(false);
});

test("AI-02.1 fails closed on mutable, incomplete or semantically mismatched canonical material", () => {
  const projection = loadProjection();
  const input = validInput();
  const mutable = Object.freeze({
    canonical_evaluation: structuredClone(input.canonical_evaluation),
  });
  const mismatchedCohort = Object.freeze({
    canonical_evaluation: deepFreeze({
      ...input.canonical_evaluation,
      cohort: "visible_recommendation_quality",
    }),
  });
  const incomplete = Object.freeze({
    canonical_evaluation: deepFreeze({
      ...input.canonical_evaluation,
      primary_horizon: null,
    }),
  });
  const nonProbability = Object.freeze({
    canonical_evaluation: deepFreeze({
      ...input.canonical_evaluation,
      confidence_probability_semantics: null,
    }),
  });

  for (const invalid of [mutable, mismatchedCohort, incomplete, nonProbability]) {
    expect(() => projection.projectTureSetupAnalystCanonicalOutcome(invalid)).toThrow(
      "Invalid Ture Setup Analyst canonical outcome projection input.",
    );
  }

  const accessorBacked = {} as Record<string, unknown>;
  Object.defineProperty(accessorBacked, "canonical_evaluation", {
    enumerable: true,
    get() {
      throw new Error("must not run");
    },
  });
  expect(() =>
    projection.projectTureSetupAnalystCanonicalOutcome(accessorBacked),
  ).toThrow("Invalid Ture Setup Analyst canonical outcome projection input.");
});

test("AI-02.1 remains server-only, source-only and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/does not claim that\s+real outcome data was read/);
  expect(doc).toMatch(/offline evaluation and for\s+every form of promotion/);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
