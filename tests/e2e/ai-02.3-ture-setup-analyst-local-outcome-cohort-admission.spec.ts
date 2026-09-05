import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const projectionPath =
  "lib/server/ture-setup-analyst-canonical-outcome-projection.ts";
const cohortPath =
  "lib/server/ture-setup-analyst-local-outcome-cohort-admission.ts";
const docPath =
  "docs/ai-02.3-ture-setup-analyst-local-outcome-cohort-admission.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.3-ture-setup-analyst-local-outcome-cohort-admission.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedCohort = {
  admitTureSetupAnalystLocalOutcomeCohort(input: unknown): {
    authority: { may_admit_offline_evaluation: boolean; may_read_repository: boolean };
    evidence: {
      cohort: string;
      decision_day_range: { first: string; last: string };
      member_count: number;
      sample_type: string;
      terminal_outcome_counts: Record<string, number>;
    };
    offline_evaluation_disposition: string;
  };
  projectTureSetupAnalystCanonicalOutcome(input: unknown): object;
};

function transpile(path: string) {
  return ts.transpileModule(source(path), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: path,
  }).outputText;
}

function loadCohort(): LoadedCohort {
  const projectionSandbox = {
    Array,
    Boolean,
    Date,
    Number,
    Object,
    Reflect,
    Set,
    TypeError,
    WeakSet,
    exports: {} as Record<string, unknown>,
    require: (specifier: string) => {
      if (specifier === "server-only") return {};
      throw new Error(`unexpected projection import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpile(projectionPath), projectionSandbox, {
    filename: projectionPath,
  });

  const cohortSandbox = {
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
      throw new Error(`unexpected cohort import: ${specifier}`);
    },
  };
  vm.runInNewContext(transpile(cohortPath), cohortSandbox, {
    filename: cohortPath,
  });

  return {
    ...(projectionSandbox.exports as Record<string, unknown>),
    ...(cohortSandbox.exports as Record<string, unknown>),
  } as LoadedCohort;
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object") return value;

  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function validInput(
  canonicalIdentity: string,
  decisionDay: string,
  terminalOutcome:
    | "target_before_stop"
    | "stop_before_target"
    | "no_entry"
    | "neither" = "target_before_stop",
) {
  return Object.freeze({
    canonical_evaluation: deepFreeze({
      read_model_version: "canonical_evaluation_quality_read_model_v1",
      canonical_identity: canonicalIdentity,
      sample_type: "shadow",
      cohort: "shadow_recommendation_quality",
      primary_horizon: "60m",
      terminal_outcome: terminalOutcome,
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

test("AI-02.3 admits only a homogeneous issued cohort into a detached summary", () => {
  const cohort = loadCohort();
  const first = cohort.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:2026-09-05:001", "2026-09-05"),
  );
  const second = cohort.projectTureSetupAnalystCanonicalOutcome(
    validInput(
      "canonical:recommendation:shadow:2026-09-06:002",
      "2026-09-06",
      "stop_before_target",
    ),
  );
  const input = Object.freeze({ projections: Object.freeze([first, second]) });

  const admitted = cohort.admitTureSetupAnalystLocalOutcomeCohort(input);
  const repeated = cohort.admitTureSetupAnalystLocalOutcomeCohort(input);

  expect(admitted).toMatchObject({
    mode: "server_only_local_outcome_cohort_admission",
    cohort_status: "source_only_admitted",
    evidence: {
      sample_type: "shadow",
      cohort: "shadow_recommendation_quality",
      member_count: 2,
      decision_day_range: { first: "2026-09-05", last: "2026-09-06" },
      terminal_outcome_counts: {
        target_before_stop: 1,
        stop_before_target: 1,
        no_entry: 0,
        neither: 0,
      },
    },
    offline_evaluation_disposition: "not_admitted",
  });
  expect(Object.isFrozen(admitted)).toBe(true);
  expect(Object.isFrozen(admitted.evidence)).toBe(true);
  expect(Object.isFrozen(admitted.evidence.decision_day_range)).toBe(true);
  expect(Object.isFrozen(admitted.evidence.terminal_outcome_counts)).toBe(true);
  expect(repeated).toEqual(admitted);
  expect(repeated).not.toBe(admitted);
  expect(JSON.stringify(admitted)).not.toContain("canonical:recommendation");
  expect(admitted.authority.may_read_repository).toBe(false);
  expect(admitted.authority.may_admit_offline_evaluation).toBe(false);
});

test("AI-02.3 rejects clones, foreign issuers, duplicates and mixed cohorts", () => {
  const cohort = loadCohort();
  const issued = cohort.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:2026-09-05:003", "2026-09-05"),
  );
  const duplicate = cohort.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:2026-09-05:003", "2026-09-05"),
  );
  const clone = deepFreeze(structuredClone(issued));
  const otherModule = loadCohort();
  const foreignIssued = otherModule.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:2026-09-06:004", "2026-09-06"),
  );
  const mixed = cohort.projectTureSetupAnalystCanonicalOutcome(
    Object.freeze({
      canonical_evaluation: deepFreeze({
        ...validInput("canonical:recommendation:shadow:2026-09-06:005", "2026-09-06")
          .canonical_evaluation,
        sample_type: "visible",
        cohort: "visible_recommendation_quality",
      }),
    }),
  );

  for (const projections of [
    [clone],
    [foreignIssued],
    [issued, duplicate],
    [issued, mixed],
  ]) {
    expect(() =>
      cohort.admitTureSetupAnalystLocalOutcomeCohort(
        Object.freeze({ projections: Object.freeze(projections) }),
      ),
    ).toThrow("Invalid Ture Setup Analyst local outcome cohort input.");
  }
});

test("AI-02.3 rejects mutable and accessor-backed lists without evaluating getters", () => {
  const cohort = loadCohort();
  const issued = cohort.projectTureSetupAnalystCanonicalOutcome(
    validInput("canonical:recommendation:shadow:2026-09-05:006", "2026-09-05"),
  );
  const mutable = Object.freeze({ projections: [issued] });
  const accessorBacked: unknown[] = [];
  Object.defineProperty(accessorBacked, "0", {
    enumerable: true,
    get() {
      throw new Error("must not run");
    },
  });
  accessorBacked.length = 1;

  for (const projections of [mutable.projections, Object.freeze(accessorBacked)]) {
    expect(() =>
      cohort.admitTureSetupAnalystLocalOutcomeCohort(
        Object.freeze({ projections }),
      ),
    ).toThrow("Invalid Ture Setup Analyst local outcome cohort input.");
  }
});

test("AI-02.3 remains server-only, source-only and registered once in existing CI", () => {
  const contract = source(cohortPath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env|node:crypto/i,
  );
  expect(doc).toMatch(/not a reader, dataset builder, evaluator or promotion/i);
  expect(doc).toMatch(/offline evaluation/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
