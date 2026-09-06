import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-staging-nonsecret-preflight-admission.ts";
const docPath = "docs/ai-02.14-staging-nonsecret-preflight-admission.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const shardRunnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.14-staging-nonsecret-preflight-admission.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedAdmission = {
  admitTureSetupAnalystStagingNonsecretPreflight(input: unknown): {
    readonly admission_status: string;
    readonly permitted_metadata: Record<string, string>;
    readonly required_preconditions: readonly string[];
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
    scope: Object.freeze({
      environment: "staging",
      source_relation: "public.recommendation_outcomes",
      existing_source_availability: "no_completed_bundle_available",
      source_rows: "not_read",
      credential_presence: "nonsecret_presence_only",
      credential_identity: "application_owner_preflight_required",
      credential_values: "not_read",
      transport: "temporary_branch_deploy_adapter",
      deploy_context: "deploy_preview_only",
      staging_connection: "not_opened",
      branch_adapter: "not_deployed",
      provider_evaluator: "not_invoked",
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

test("AI-02.14 validates only the future nonsecret staging preflight boundary", () => {
  const result = loadAdmission().admitTureSetupAnalystStagingNonsecretPreflight(
    validInput(),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.permitted_metadata)).toBe(true);
  expect(Object.isFrozen(result.required_preconditions)).toBe(true);
  expect(Object.isFrozen(result.excluded_authority)).toBe(true);
  expect(Object.isFrozen(result.authority)).toBe(true);
  expect(result).toMatchObject({
    admission_status:
      "staging_nonsecret_preflight_scope_validated_not_authorized_not_executed",
    permitted_metadata: {
      environment: "staging",
      credential_presence: "nonsecret_presence_only",
      deploy_context: "deploy_preview_only",
    },
    required_preconditions: [
      "no_completed_bundle_available_preflight",
      "no_source_row_or_credential_value_read",
      "application_owner_identity_preflight_required",
      "temporary_deploy_preview_only_transport",
    ],
    excluded_authority: [
      "staging_connection",
      "credential_value_read",
      "source_row_read",
      "provider_invocation",
      "evaluator_invocation",
      "branch_adapter_deploy",
      "recommendation_outcome_persistence",
      "active_evidence_migration",
      "active_evidence_write",
      "offline_dataset",
      "offline_evaluation",
      "runtime",
      "broker",
      "production",
    ],
    next_gate:
      "separately_authorized_staging_nonsecret_credential_presence_and_branch_transport_preflight_execution",
  });
  expect(
    Object.values(result.authority).filter((value) => typeof value === "boolean"),
  ).toEqual(Array(17).fill(false));
});

test("AI-02.14 rejects secret reads, connections, deployment and all wider authority", () => {
  const admission = loadAdmission();
  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ source_rows: "read" }),
    validInput({ credential_presence: "credential_value_read" }),
    validInput({ credential_values: "read" }),
    validInput({ transport: "persistent_runtime_transport" }),
    validInput({ deploy_context: "production" }),
    validInput({ staging_connection: "opened" }),
    validInput({ branch_adapter: "deployed" }),
    validInput({ provider_evaluator: "invoked" }),
    validInput({ outcome_persistence: "admitted" }),
    validInput({ active_evidence_migration: "admitted" }),
    validInput({ runtime_binding: "admitted" }),
    validInput({ broker_binding: "admitted" }),
    validInput({ production_binding: "admitted" }),
    validInput({ unexpected: "widened" }),
  ]) {
    expect(() =>
      admission.admitTureSetupAnalystStagingNonsecretPreflight(invalid),
    ).toThrow(TypeError);
  }
});

test("AI-02.14 rejects mutable, accessor-backed and faulting proxy input", () => {
  const admission = loadAdmission();
  const mutableScope = { ...validInput().scope };
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
    admission.admitTureSetupAnalystStagingNonsecretPreflight(
      Object.freeze({ scope: mutableScope }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingNonsecretPreflight(
      Object.freeze({ scope: accessorScope }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingNonsecretPreflight(faultingProxy),
  ).toThrow(TypeError);
});

test("AI-02.14 is I/O-free and enrolled in the existing unchanged CI plan", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);

  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/does not inspect a credential value, a source row/i);
  expect(doc).toMatch(/does not open a staging connection/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(shardRunnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
