import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-staging-nonsecret-preflight-receipt-admission.ts";
const docPath =
  "docs/ai-02.15-staging-nonsecret-preflight-receipt-admission.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const shardRunnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.15-staging-nonsecret-preflight-receipt-admission.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedAdmission = {
  admitTureSetupAnalystStagingNonsecretPreflightReceipt(input: unknown): {
    readonly admission_status: string;
    readonly minimized_observation: Record<string, string>;
    readonly required_redactions: readonly string[];
    readonly excluded_authority: readonly string[];
    readonly next_gate: string;
    readonly authority: Record<string, boolean | string>;
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
    receipt: Object.freeze({
      environment: "staging",
      source_relation: "public.recommendation_outcomes",
      existing_source_availability: "no_completed_bundle_available",
      credential_presence: "present",
      application_owner_preflight: "confirmed",
      deploy_preview_transport: "available",
      credential_values: "not_returned",
      credential_names: "not_returned",
      application_owner_identifier: "not_returned",
      deploy_identifier_or_url: "not_returned",
      source_rows: "not_returned",
      staging_connection: "not_opened",
      provider_evaluator: "not_invoked",
      branch_adapter: "not_deployed",
      outcome_persistence: "not_admitted",
      active_evidence_migration: "not_admitted",
      active_evidence_write: "not_admitted",
      offline_dataset: "not_admitted",
      offline_evaluation: "not_admitted",
      runtime_binding: "not_admitted",
      broker_binding: "not_admitted",
      production_binding: "not_admitted",
      ...overrides,
    }),
  });
}

test("AI-02.15 validates a favorable minimized receipt without granting authority", () => {
  const result = loadAdmission().admitTureSetupAnalystStagingNonsecretPreflightReceipt(
    validInput(),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.minimized_observation)).toBe(true);
  expect(Object.isFrozen(result.required_redactions)).toBe(true);
  expect(Object.isFrozen(result.excluded_authority)).toBe(true);
  expect(Object.isFrozen(result.authority)).toBe(true);
  expect(result).toMatchObject({
    admission_status:
      "nonsecret_preflight_receipt_validated_not_authorized_not_executed",
    minimized_observation: {
      environment: "staging",
      credential_presence: "present",
      application_owner_preflight: "confirmed",
      deploy_preview_transport: "available",
    },
    required_redactions: [
      "credential_values_not_returned",
      "credential_names_not_returned",
      "application_owner_identifier_not_returned",
      "deploy_identifier_or_url_not_returned",
      "source_rows_not_returned",
    ],
    next_gate:
      "separately_authorized_staging_one_shot_adapter_preparation_after_minimized_preflight_review",
  });
  expect(
    Object.values(result.authority).filter((value) => typeof value === "boolean"),
  ).toEqual(Array(20).fill(false));
});

test("AI-02.15 preserves unfavorable observations without treating them as errors", () => {
  const result = loadAdmission().admitTureSetupAnalystStagingNonsecretPreflightReceipt(
    validInput({
      credential_presence: "absent",
      application_owner_preflight: "not_confirmed",
      deploy_preview_transport: "unavailable",
    }),
  );

  expect(result.minimized_observation).toEqual({
    environment: "staging",
    credential_presence: "absent",
    application_owner_preflight: "not_confirmed",
    deploy_preview_transport: "unavailable",
  });
  expect(result.admission_status).toBe(
    "nonsecret_preflight_receipt_validated_not_authorized_not_executed",
  );
});

test("AI-02.15 rejects secret material, identifiers, source access and downstream scope", () => {
  const admission = loadAdmission();
  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ credential_presence: "credential_value_read" }),
    validInput({ credential_values: "a-secret" }),
    validInput({ credential_names: "TWELVE_DATA_API_KEY" }),
    validInput({ application_owner_identifier: "owner@example.test" }),
    validInput({ deploy_identifier_or_url: "https://preview.example.test" }),
    validInput({ source_rows: "read" }),
    validInput({ staging_connection: "opened" }),
    validInput({ provider_evaluator: "invoked" }),
    validInput({ branch_adapter: "deployed" }),
    validInput({ outcome_persistence: "admitted" }),
    validInput({ active_evidence_write: "admitted" }),
    validInput({ runtime_binding: "admitted" }),
    validInput({ broker_binding: "admitted" }),
    validInput({ production_binding: "admitted" }),
    validInput({ unexpected: "widened" }),
  ]) {
    expect(() =>
      admission.admitTureSetupAnalystStagingNonsecretPreflightReceipt(invalid),
    ).toThrow(TypeError);
  }
});

test("AI-02.15 rejects mutable, accessor-backed and faulting proxy input", () => {
  const admission = loadAdmission();
  const mutableReceipt = { ...validInput().receipt };
  const accessorReceipt = Object.freeze(
    Object.defineProperty({}, "environment", {
      enumerable: true,
      get() {
        throw new Error("must not read accessor receipt");
      },
    }),
  );
  const faultingProxy = new Proxy(
    {},
    { isExtensible() { throw new Error("must not inspect proxy input"); } },
  );

  expect(() =>
    admission.admitTureSetupAnalystStagingNonsecretPreflightReceipt(
      Object.freeze({ receipt: mutableReceipt }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingNonsecretPreflightReceipt(
      Object.freeze({ receipt: accessorReceipt }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingNonsecretPreflightReceipt(
      faultingProxy,
    ),
  ).toThrow(TypeError);
});

test("AI-02.15 is I/O-free and registered once in the existing CI plan", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);

  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/does not run the preflight/i);
  expect(doc).toMatch(/returns no credential\s+value or name/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(shardRunnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
