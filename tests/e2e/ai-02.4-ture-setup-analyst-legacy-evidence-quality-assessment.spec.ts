import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-legacy-evidence-quality-assessment.ts";
const docPath =
  "docs/ai-02.4-ture-setup-analyst-legacy-evidence-quality-assessment.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.4-ture-setup-analyst-legacy-evidence-quality-assessment.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedAssessment = {
  assessTureSetupAnalystLegacyEvidenceQuality(input: unknown): {
    readonly assessment_status: string;
    readonly evidence: {
      readonly record_count: number;
      readonly distinct_opaque_source_hash_count: number;
    };
    readonly canonical_evaluation_disposition: string;
    readonly missing_evidence_reason_codes: readonly string[];
    readonly authority: {
      readonly may_read_repository: boolean;
      readonly may_access_staging: boolean;
      readonly may_run_offline_evaluation: boolean;
      readonly may_promote_model_or_policy: boolean;
    };
  };
};

function loadAssessment(): LoadedAssessment {
  const transpiled = ts.transpileModule(source(sourcePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: sourcePath,
  }).outputText;
  const sandbox = {
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
  return sandbox.exports as LoadedAssessment;
}

function validInput(overrides: Record<string, unknown> = {}) {
  return Object.freeze({
    profile: Object.freeze({
      source_kind: "staging_private_legacy_outcome_preservation",
      record_count: 500,
      distinct_opaque_source_hash_count: 500,
      evidence_completeness: "legacy_incomplete",
      evaluation_disposition: "not_admitted",
      canonical_decision_identity_present: false,
      immutable_lineage_present: false,
      versioned_reproducibility_present: false,
      complete_outcome_evidence_present: false,
      ...overrides,
    }),
  });
}

test("AI-02.4 confirms only noncanonical preservation from a bounded profile", () => {
  const assessment = loadAssessment();

  const result = assessment.assessTureSetupAnalystLegacyEvidenceQuality(
    validInput(),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.evidence)).toBe(true);
  expect(Object.isFrozen(result.missing_evidence_reason_codes)).toBe(true);
  expect(result).toMatchObject({
    assessment_status: "noncanonical_preservation_confirmed",
    evidence: {
      record_count: 500,
      distinct_opaque_source_hash_count: 500,
    },
    canonical_evaluation_disposition: "not_admitted",
    missing_evidence_reason_codes: [
      "canonical_decision_identity_missing",
      "complete_outcome_evidence_missing",
      "immutable_lineage_missing",
      "versioned_reproducibility_missing",
    ],
    authority: {
      may_read_repository: false,
      may_access_staging: false,
      may_run_offline_evaluation: false,
      may_promote_model_or_policy: false,
    },
  });
  expect(JSON.stringify(result)).not.toContain("source_dedupe_sha256");
  expect(JSON.stringify(result)).not.toContain("canonical_identity");
});

test("AI-02.4 fails closed for mismatched, widened and asserted-canonical profiles", () => {
  const assessment = loadAssessment();

  expect(() =>
    assessment.assessTureSetupAnalystLegacyEvidenceQuality(
      validInput({ distinct_opaque_source_hash_count: 499 }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    assessment.assessTureSetupAnalystLegacyEvidenceQuality(
      validInput({ canonical_decision_identity_present: true }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    assessment.assessTureSetupAnalystLegacyEvidenceQuality(
      validInput({ record_count: 0, distinct_opaque_source_hash_count: 0 }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    assessment.assessTureSetupAnalystLegacyEvidenceQuality(
      validInput({ evaluation_disposition: "eligible" }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    assessment.assessTureSetupAnalystLegacyEvidenceQuality(
      validInput({ extra: "widened" }),
    ),
  ).toThrow(TypeError);
});

test("AI-02.4 rejects mutable, accessor-backed and faulting proxy inputs without reading them", () => {
  const assessment = loadAssessment();
  const mutableProfile = { ...validInput().profile };
  const mutableInput = Object.freeze({ profile: mutableProfile });
  const accessorInput = Object.freeze(
    Object.defineProperty({}, "profile", {
      enumerable: true,
      get() {
        throw new Error("must not read accessor input");
      },
    }),
  );
  const accessorProfile = Object.freeze(
    Object.defineProperty({}, "record_count", {
      enumerable: true,
      get() {
        throw new Error("must not read accessor profile");
      },
    }),
  );
  const faultingProxy = new Proxy(
    {},
    {
      isExtensible() {
        throw new Error("must not inspect proxy input");
      },
    },
  );

  expect(() =>
    assessment.assessTureSetupAnalystLegacyEvidenceQuality(mutableInput),
  ).toThrow(TypeError);
  expect(() =>
    assessment.assessTureSetupAnalystLegacyEvidenceQuality(accessorInput),
  ).toThrow(TypeError);
  expect(() =>
    assessment.assessTureSetupAnalystLegacyEvidenceQuality(
      Object.freeze({ profile: accessorProfile }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    assessment.assessTureSetupAnalystLegacyEvidenceQuality(faultingProxy),
  ).toThrow(TypeError);
});

test("AI-02.4 remains server-only, source-only and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/neither a durable receipt nor a trusted source profile/i);
  expect(doc).toMatch(/not_admitted/);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
