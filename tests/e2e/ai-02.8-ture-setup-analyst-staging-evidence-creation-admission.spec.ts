import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-staging-evidence-creation-admission.ts";
const docPath = "docs/ai-02.8-staging-evidence-creation-admission.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.8-ture-setup-analyst-staging-evidence-creation-admission.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedAdmission = {
  admitTureSetupAnalystStagingEvidenceCreation(input: unknown): {
    readonly admission_status: string;
    readonly permitted_scope: {
      readonly environment: string;
      readonly relation: string;
      readonly operation: string;
      readonly source_kind: string;
    };
    readonly required_evidence: readonly string[];
    readonly excluded_authority: readonly string[];
    readonly next_gate: string;
    readonly authority: {
      readonly may_access_staging: boolean;
      readonly may_persist_source_evidence: boolean;
      readonly may_form_offline_dataset: boolean;
      readonly may_run_offline_evaluation: boolean;
      readonly may_bind_runtime: boolean;
      readonly may_submit_broker_instructions: boolean;
    };
  };
};

function loadAdmission(): LoadedAdmission {
  const transpiled = ts.transpileModule(source(sourcePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
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
  return sandbox.exports as LoadedAdmission;
}

function validInput(overrides: Record<string, unknown> = {}) {
  return Object.freeze({
    scope: Object.freeze({
      environment: "staging",
      relation: "public.canonical_evaluation_decisions",
      operation: "one_append_only_insert",
      source_kind: "server_owned_completed_recommendation_outcome_bundle",
      canonical_identity: "required",
      semantic_payload_sha256: "required",
      complete_primary_outcome: "required",
      diagnostic_horizons: "required",
      inactive_readiness_only: "must_be_false",
      idempotency_preflight: "identity_and_digest",
      containment: "rollback_or_remove_proof_row",
      independent_readback:
        "minimal_identity_digest_and_completion_only",
      evaluator_binding: "not_admitted",
      promotion_binding: "not_admitted",
      runtime_binding: "not_admitted",
      provider_model_binding: "not_admitted",
      deployment_binding: "not_admitted",
      broker_binding: "not_admitted",
      production_binding: "not_admitted",
      ...overrides,
    }),
  });
}

test("AI-02.8 validates one complete staging evidence scope without authorizing it", () => {
  const admission = loadAdmission();
  const result = admission.admitTureSetupAnalystStagingEvidenceCreation(
    validInput(),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.permitted_scope)).toBe(true);
  expect(Object.isFrozen(result.required_evidence)).toBe(true);
  expect(Object.isFrozen(result.excluded_authority)).toBe(true);
  expect(result).toMatchObject({
    admission_status: "staging_scope_validated_not_authorized_not_executed",
    permitted_scope: {
      environment: "staging",
      relation: "public.canonical_evaluation_decisions",
      operation: "one_append_only_insert",
      source_kind: "server_owned_completed_recommendation_outcome_bundle",
    },
    required_evidence: [
      "canonical_identity",
      "semantic_payload_sha256",
      "complete_primary_outcome",
      "diagnostic_horizons",
      "inactive_readiness_only_false",
      "idempotency_preflight",
      "rollback_or_remove_proof_row",
      "independent_minimal_readback",
    ],
    excluded_authority: [
      "evaluator",
      "promotion",
      "runtime",
      "provider_model",
      "deployment",
      "broker",
      "production",
    ],
    next_gate:
      "separately_authorized_staging_execution_with_independent_readback",
    authority: {
      may_access_staging: false,
      may_persist_source_evidence: false,
      may_form_offline_dataset: false,
      may_run_offline_evaluation: false,
      may_bind_runtime: false,
      may_submit_broker_instructions: false,
    },
  });
});

test("AI-02.8 fails closed for missing completion, scope expansion or authority widening", () => {
  const admission = loadAdmission();
  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ relation: "private.ai_02_legacy_outcome_evidence" }),
    validInput({ operation: "batch_insert" }),
    validInput({ source_kind: "historical_synthetic_fixture" }),
    validInput({ complete_primary_outcome: "optional" }),
    validInput({ diagnostic_horizons: "optional" }),
    validInput({ inactive_readiness_only: "allowed" }),
    validInput({ idempotency_preflight: "identity_only" }),
    validInput({ containment: "none" }),
    validInput({ evaluator_binding: "admitted" }),
    validInput({ production_binding: "admitted" }),
    validInput({ unexpected: "widened" }),
  ]) {
    expect(() =>
      admission.admitTureSetupAnalystStagingEvidenceCreation(invalid),
    ).toThrow(TypeError);
  }
});

test("AI-02.8 rejects mutable, accessor-backed and faulting proxy scope input", () => {
  const admission = loadAdmission();
  const mutable = { ...validInput().scope };
  const accessorScope = Object.freeze(
    Object.defineProperty({}, "environment", {
      enumerable: true,
      get() {
        throw new Error("must not read accessor scope");
      },
    }),
  );
  const faultingProxy = new Proxy(
    {},
    { isExtensible() { throw new Error("must not inspect proxy input"); } },
  );

  expect(() =>
    admission.admitTureSetupAnalystStagingEvidenceCreation(
      Object.freeze({ scope: mutable }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingEvidenceCreation(
      Object.freeze({ scope: accessorScope }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingEvidenceCreation(faultingProxy),
  ).toThrow(TypeError);
});

test("AI-02.8 remains server-only, I/O-free and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/does not authorize or\s+execute/i);
  expect(doc).toMatch(/does not access staging/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
