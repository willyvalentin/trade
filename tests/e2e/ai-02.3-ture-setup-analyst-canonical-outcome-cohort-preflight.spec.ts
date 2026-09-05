import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const projectionSourcePath =
  "lib/server/ture-setup-analyst-canonical-outcome-projection.ts";
const preflightSourcePath =
  "lib/server/ture-setup-analyst-canonical-outcome-cohort-preflight.ts";
const docPath =
  "docs/ai-02.3-ture-setup-analyst-canonical-outcome-cohort-preflight.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.3-ture-setup-analyst-canonical-outcome-cohort-preflight.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedProjection = {
  projectTureSetupAnalystCanonicalOutcome(input: unknown): object;
};

type LoadedPreflight = {
  preflightTureSetupAnalystCanonicalOutcomeCohort(input: unknown): {
    readonly evidence: {
      readonly cohort: string;
      readonly primary_horizon: string;
      readonly projection_count: number;
      readonly decision_day_range: {
        readonly first: string;
        readonly last: string;
      };
    };
    readonly offline_evaluation_disposition: string;
  };
};

function transpile(path: string) {
  return ts.transpileModule(source(path), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: path,
  }).outputText;
}

function loadCohortModules(): {
  projection: LoadedProjection;
  preflight: LoadedPreflight;
} {
  const projectionSandbox = {
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
  vm.runInNewContext(transpile(projectionSourcePath), projectionSandbox, {
    filename: projectionSourcePath,
  });

  const preflightSandbox = {
    Array,
    Boolean,
    Number,
    Object,
    Reflect,
    Set,
    TypeError,
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      if (specifier === "./ture-setup-analyst-canonical-outcome-projection") {
        return projectionSandbox.exports;
      }
      throw new Error(`unexpected import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpile(preflightSourcePath), preflightSandbox, {
    filename: preflightSourcePath,
  });

  return {
    projection: projectionSandbox.exports as LoadedProjection,
    preflight: preflightSandbox.exports as LoadedPreflight,
  };
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object") return value;

  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function validInput(
  canonicalIdentity: string,
  decisionDay: string,
  sampleType: "shadow" | "visible" = "shadow",
) {
  const cohort =
    sampleType === "shadow"
      ? "shadow_recommendation_quality"
      : "visible_recommendation_quality";
  return Object.freeze({
    canonical_evaluation: deepFreeze({
      read_model_version: "canonical_evaluation_quality_read_model_v1",
      canonical_identity: canonicalIdentity,
      sample_type: sampleType,
      cohort,
      primary_horizon: "60m",
      terminal_outcome: "target_before_stop",
      r_result: 1.75,
      numeric_confidence: 0.73,
      confidence_probability_semantics: "probability_0_1",
      decision_day: decisionDay,
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

function frozenBatch(...projections: object[]) {
  return Object.freeze({ projections: Object.freeze(projections) });
}

test("AI-02.3 preflights only issued, coherent, bounded cohort metadata", () => {
  const { projection, preflight } = loadCohortModules();
  const later = projection.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:later", "2026-09-05"),
  );
  const earlier = projection.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:earlier", "2026-09-03"),
  );

  const result = preflight.preflightTureSetupAnalystCanonicalOutcomeCohort(
    frozenBatch(later, earlier),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.evidence)).toBe(true);
  expect(Object.isFrozen(result.evidence.decision_day_range)).toBe(true);
  expect(result).toMatchObject({
    evidence: {
      cohort: "shadow_recommendation_quality",
      primary_horizon: "60m",
      projection_count: 2,
      decision_day_range: { first: "2026-09-03", last: "2026-09-05" },
    },
    offline_evaluation_disposition: "not_admitted",
  });
  expect(JSON.stringify(result)).not.toContain("canonical:recommendation");
  expect(JSON.stringify(result)).not.toContain("realized_r");
  expect(JSON.stringify(result)).not.toContain("confidence_probability");
  expect(result).not.toHaveProperty("projections");
});

test("AI-02.3 fails closed for lookalikes, foreign issuers and incoherent batches", () => {
  const { projection, preflight } = loadCohortModules();
  const issued = projection.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:issued", "2026-09-05"),
  );
  const lookalike = deepFreeze(structuredClone(issued));
  const foreignIssuer = loadCohortModules().projection;
  const foreignIssued = foreignIssuer.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:foreign", "2026-09-05"),
  );
  const visible = projection.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:visible", "2026-09-05", "visible"),
  );

  expect(() =>
    preflight.preflightTureSetupAnalystCanonicalOutcomeCohort(frozenBatch(lookalike)),
  ).toThrow(TypeError);
  expect(() =>
    preflight.preflightTureSetupAnalystCanonicalOutcomeCohort(
      frozenBatch(foreignIssued),
    ),
  ).toThrow(TypeError);
  expect(() =>
    preflight.preflightTureSetupAnalystCanonicalOutcomeCohort(frozenBatch(issued, issued)),
  ).toThrow(TypeError);
  expect(() =>
    preflight.preflightTureSetupAnalystCanonicalOutcomeCohort(
      frozenBatch(issued, visible),
    ),
  ).toThrow(TypeError);
});

test("AI-02.3 rejects mutable, sparse and accessor-backed containers without reading them", () => {
  const { projection, preflight } = loadCohortModules();
  const issued = projection.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:hostile", "2026-09-05"),
  );
  const mutableBatch = Object.freeze({ projections: [issued] });
  const sparseBatch = Object.freeze({ projections: Object.freeze(new Array(1)) });
  const accessorBacked = Object.freeze(
    Object.defineProperty({}, "projections", {
      enumerable: true,
      get() {
        throw new Error("must not read accessor input");
      },
    }),
  );

  expect(() =>
    preflight.preflightTureSetupAnalystCanonicalOutcomeCohort(mutableBatch),
  ).toThrow(TypeError);
  expect(() =>
    preflight.preflightTureSetupAnalystCanonicalOutcomeCohort(sparseBatch),
  ).toThrow(TypeError);
  expect(() =>
    preflight.preflightTureSetupAnalystCanonicalOutcomeCohort(accessorBacked),
  ).toThrow(TypeError);
});

test("AI-02.3 remains server-only, source-only and registered once in existing CI", () => {
  const contract = source(preflightSourcePath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).toContain(
    "isTureSetupAnalystIssuedCanonicalOutcomeProjection",
  );
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/not a dataset/i);
  expect(doc).toMatch(/not_admitted/);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
