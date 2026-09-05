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
const reviewPath =
  "docs/ai-02.4-ture-setup-analyst-local-outcome-cohort-review.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.4-ture-setup-analyst-local-outcome-cohort-review.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedCohort = {
  admitTureSetupAnalystLocalOutcomeCohort(input: unknown): {
    authority: Record<string, boolean>;
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
  TURE_SETUP_ANALYST_LOCAL_OUTCOME_COHORT_ADMISSION_AUTHORITY: Record<
    string,
    boolean
  >;
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
    WeakSet,
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

function issuedProjection(
  cohort: LoadedCohort,
  suffix: string,
  decisionDay: string,
  terminalOutcome:
    | "target_before_stop"
    | "stop_before_target"
    | "no_entry"
    | "neither",
) {
  return cohort.projectTureSetupAnalystCanonicalOutcome(
    Object.freeze({
      canonical_evaluation: deepFreeze({
        read_model_version: "canonical_evaluation_quality_read_model_v1",
        canonical_identity: `canonical:recommendation:shadow:${decisionDay}:${suffix}`,
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
    }),
  );
}

test("AI-02.4 independently proves an order-invariant, redacted outcome partition", () => {
  const cohort = loadCohort();
  const earliest = issuedProjection(cohort, "001", "2026-09-05", "target_before_stop");
  const middle = issuedProjection(cohort, "002", "2026-09-06", "stop_before_target");
  const latest = issuedProjection(cohort, "003", "2026-09-07", "no_entry");
  const sameDay = issuedProjection(cohort, "004", "2026-09-07", "neither");

  const reversed = cohort.admitTureSetupAnalystLocalOutcomeCohort(
    Object.freeze({ projections: Object.freeze([latest, middle, sameDay, earliest]) }),
  );
  const chronological = cohort.admitTureSetupAnalystLocalOutcomeCohort(
    Object.freeze({ projections: Object.freeze([earliest, middle, latest, sameDay]) }),
  );

  expect(reversed.evidence).toEqual({
    sample_type: "shadow",
    cohort: "shadow_recommendation_quality",
    member_count: 4,
    decision_day_range: { first: "2026-09-05", last: "2026-09-07" },
    terminal_outcome_counts: {
      target_before_stop: 1,
      stop_before_target: 1,
      no_entry: 1,
      neither: 1,
    },
  });
  expect(chronological.evidence).toEqual(reversed.evidence);
  expect(chronological).not.toBe(reversed);
  expect(chronological.evidence).not.toBe(reversed.evidence);
  expect(
    Object.values(reversed.evidence.terminal_outcome_counts).reduce(
      (total, count) => total + count,
      0,
    ),
  ).toBe(reversed.evidence.member_count);
  expect(JSON.stringify(reversed)).not.toContain("canonical:recommendation");
  expect(reversed.offline_evaluation_disposition).toBe("not_admitted");
  expect(reversed.authority).toBe(
    cohort.TURE_SETUP_ANALYST_LOCAL_OUTCOME_COHORT_ADMISSION_AUTHORITY,
  );
  expect(Object.values(reversed.authority).every((value) => value !== true)).toBe(
    true,
  );
});

test("AI-02.4 independently rejects duplicate and structurally cloned evidence", () => {
  const cohort = loadCohort();
  const issued = issuedProjection(cohort, "005", "2026-09-08", "target_before_stop");
  const frozenClone = deepFreeze(structuredClone(issued));

  for (const projections of [
    Object.freeze([issued, issued]),
    Object.freeze([frozenClone]),
  ]) {
    expect(() =>
      cohort.admitTureSetupAnalystLocalOutcomeCohort(Object.freeze({ projections })),
    ).toThrow("Invalid Ture Setup Analyst local outcome cohort input.");
  }
});

test("AI-02.4 remains an independent source-only review registered exactly once", () => {
  const contract = source(cohortPath);
  const review = source(reviewPath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env|node:crypto/i,
  );
  expect(review).toMatch(/does not implement or bind runtime/i);
  expect(review).toMatch(/offline evaluation/i);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
