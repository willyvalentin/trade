import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-git-preview-receipt-diagnostic-admission.ts";
const docPath = "docs/ai-02.16-git-preview-receipt-diagnostic-admission.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const shardRunnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.16-git-preview-receipt-diagnostic-admission.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedAdmission = {
  admitTureSetupAnalystGitPreviewReceiptDiagnostic(input: unknown): {
    readonly admission_status: string;
    readonly minimized_plan: Record<string, string | number>;
    readonly permitted_future_observations: readonly string[];
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
    plan: Object.freeze({
      environment: "staging",
      transport: "git_deploy_preview",
      diagnostic_operation: "token_protected_response_status_only",
      request_method: "GET",
      maximum_request_count: 1,
      response_status_observation: "not_observed",
      receipt_shape_observation: "not_observed",
      credential_values: "not_returned",
      credential_names: "not_returned",
      application_owner_identifier: "not_returned",
      deploy_identifier_or_url: "not_returned",
      response_body: "not_returned",
      response_headers: "not_returned",
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

test("AI-02.16 admits only the minimized read-only diagnostic plan", () => {
  const result = loadAdmission().admitTureSetupAnalystGitPreviewReceiptDiagnostic(
    validInput(),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.minimized_plan)).toBe(true);
  expect(Object.isFrozen(result.permitted_future_observations)).toBe(true);
  expect(Object.isFrozen(result.required_redactions)).toBe(true);
  expect(Object.isFrozen(result.excluded_authority)).toBe(true);
  expect(Object.isFrozen(result.authority)).toBe(true);
  expect(result).toMatchObject({
    admission_status:
      "git_preview_receipt_diagnostic_plan_validated_not_authorized_not_executed",
    minimized_plan: {
      environment: "staging",
      transport: "git_deploy_preview",
      diagnostic_operation: "token_protected_response_status_only",
      request_method: "GET",
      maximum_request_count: 1,
    },
    permitted_future_observations: [
      "response_status_class_only",
      "receipt_shape_only",
    ],
    next_gate: "separately_authorized_read_only_git_preview_receipt_diagnostic",
  });
  expect(
    Object.values(result.authority).filter((value) => typeof value === "boolean"),
  ).toEqual(Array(22).fill(false));
});

test("AI-02.16 rejects response data, identifiers and all wider authority", () => {
  const admission = loadAdmission();
  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ transport: "branch_deploy" }),
    validInput({ request_method: "POST" }),
    validInput({ maximum_request_count: 2 }),
    validInput({ response_status_observation: "http_401" }),
    validInput({ receipt_shape_observation: "not_admissible" }),
    validInput({ credential_values: "a-secret" }),
    validInput({ credential_names: "TWELVE_DATA_API_KEY" }),
    validInput({ application_owner_identifier: "owner@example.test" }),
    validInput({ deploy_identifier_or_url: "https://preview.example.test" }),
    validInput({ response_body: "raw-error" }),
    validInput({ response_headers: "x-request-id" }),
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
      admission.admitTureSetupAnalystGitPreviewReceiptDiagnostic(invalid),
    ).toThrow(TypeError);
  }
});

test("AI-02.16 rejects mutable, accessor-backed and faulting proxy input", () => {
  const admission = loadAdmission();
  const mutablePlan = { ...validInput().plan };
  const accessorPlan = Object.freeze(
    Object.defineProperty({}, "environment", {
      enumerable: true,
      get() {
        throw new Error("must not read accessor plan");
      },
    }),
  );
  const faultingProxy = new Proxy(
    {},
    { isExtensible() { throw new Error("must not inspect proxy input"); } },
  );

  expect(() =>
    admission.admitTureSetupAnalystGitPreviewReceiptDiagnostic(
      Object.freeze({ plan: mutablePlan }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystGitPreviewReceiptDiagnostic(
      Object.freeze({ plan: accessorPlan }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystGitPreviewReceiptDiagnostic(faultingProxy),
  ).toThrow(TypeError);
});

test("AI-02.16 is I/O-free and registered once in the existing CI plan", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);

  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/does not run a request/i);
  expect(doc).toMatch(/credential value or name/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(shardRunnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
