import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-staging-completed-outcome-source-creation-admission.ts";
const docPath = "docs/ai-02.12-staging-completed-outcome-source-creation-admission.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const schedulePath = "netlify/functions/scheduled-outcome-evaluation.ts";
const thisTest =
  "tests/e2e/ai-02.12-staging-completed-outcome-source-creation-admission.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedAdmission = {
  admitTureSetupAnalystStagingCompletedOutcomeSourceCreation(input: unknown): {
    readonly admission_status: string;
    readonly permitted_scope: Record<string, string>;
    readonly required_preconditions: readonly string[];
    readonly excluded_authority: readonly string[];
    readonly next_gate: string;
    readonly authority: Record<string, boolean | string>;
  };
};

function loadAdmission(): LoadedAdmission {
  const transpiled = ts.transpileModule(source(sourcePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
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
      operation: "one_staging_only_one_shot_outcome_evaluation_adapter",
      source_input: "one_server_owned_official_snapshot_only",
      producer: "official_scheduled_outcome_evaluation",
      scheduled_default_bounds: "five_batches_ten_snapshots_not_admitted",
      one_shot_transport: "separately_authorized_staging_branch_deploy_only",
      producer_authentication: "automation_secret_and_application_owner_principal",
      outcome_persistence: "server_supabase_service_role_upsert",
      owner_binding: "one_application_owner_bound_snapshot_fingerprint",
      primary_horizon: "60m",
      diagnostic_horizons: "15m_30m_60m_exact",
      outcome_completion: "intraday_candles_complete",
      maximum_completed_bundles: "one",
      provider_credentials: "existing_server_managed_only",
      provider_cost_control: "separately_authorized_bounded",
      active_evidence_relation: "public.canonical_active_evaluation_evidence",
      active_evidence_migration: "separately_authorized_after_source_exists",
      active_evidence_write: "not_admitted",
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

test("AI-02.12 fixes one source-creation scope without executing it", () => {
  const result = loadAdmission().admitTureSetupAnalystStagingCompletedOutcomeSourceCreation(
    validInput(),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.permitted_scope)).toBe(true);
  expect(Object.isFrozen(result.required_preconditions)).toBe(true);
  expect(Object.isFrozen(result.excluded_authority)).toBe(true);
  expect(result).toMatchObject({
    admission_status: "source_creation_scope_validated_not_authorized_not_executed",
    permitted_scope: {
      environment: "staging",
      source_relation: "public.recommendation_outcomes",
      operation: "one_staging_only_one_shot_outcome_evaluation_adapter",
      source_input: "one_server_owned_official_snapshot_only",
      maximum_completed_bundles: "one",
    },
    required_preconditions: [
      "no_completed_bundle_available_preflight",
      "scheduled_default_five_batch_ten_snapshot_shape_not_admitted",
      "isolated_staging_one_shot_adapter",
      "one_server_owned_official_snapshot",
      "strict_one_batch_one_snapshot_request_limits",
      "application_owner_bound_snapshot_fingerprint",
      "complete_intraday_candle_evidence",
      "primary_60m_outcome",
      "diagnostic_15m_30m_60m_horizons",
      "separately_authorized_bounded_provider_cost",
      "server_managed_credential_identity_preflight",
    ],
    excluded_authority: [
      "source_row_read",
      "secret_read",
      "provider_invocation",
      "recommendation_outcome_persistence",
      "active_evidence_migration",
      "active_evidence_write",
      "offline_dataset",
      "offline_evaluation",
      "promotion",
      "runtime",
      "deployment",
      "broker",
      "production",
    ],
    next_gate:
      "separately_authorized_staging_cost_identity_and_one_shot_transport_preflight",
    authority: {
      may_access_staging: false,
      may_access_secrets: false,
      may_invoke_scheduled_outcome_evaluation: false,
      may_invoke_provider: false,
      may_persist_recommendation_outcome: false,
      may_apply_active_evidence_migration: false,
      may_write_active_evidence: false,
      may_bind_runtime: false,
      may_submit_broker_instructions: false,
    },
  });
});

test("AI-02.12 rejects broad, synthetic, unbounded and downstream authority", () => {
  const admission = loadAdmission();
  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ source_relation: "private.ai_02_legacy_outcome_evidence" }),
    validInput({ existing_source_availability: "rows_exist_completion_unobserved" }),
    validInput({ operation: "batch_outcome_evaluation_run" }),
    validInput({ scheduled_default_bounds: "one_batch_one_snapshot" }),
    validInput({ one_shot_transport: "production_schedule" }),
    validInput({ source_input: "caller_supplied_snapshot" }),
    validInput({ maximum_completed_bundles: "many" }),
    validInput({ provider_credentials: "caller_supplied" }),
    validInput({ provider_cost_control: "unbounded" }),
    validInput({ active_evidence_relation: "public.canonical_evaluation_decisions" }),
    validInput({ active_evidence_write: "admitted" }),
    validInput({ evaluator_binding: "admitted" }),
    validInput({ production_binding: "admitted" }),
    validInput({ unexpected: "widened" }),
  ]) {
    expect(() =>
      admission.admitTureSetupAnalystStagingCompletedOutcomeSourceCreation(invalid),
    ).toThrow(TypeError);
  }
});

test("AI-02.12 rejects mutable, accessor-backed and faulting proxy input", () => {
  const admission = loadAdmission();
  const mutable = { ...validInput().scope };
  const accessorScope = Object.freeze(
    Object.defineProperty({}, "environment", {
      enumerable: true,
      get() { throw new Error("must not read accessor scope"); },
    }),
  );
  const faultingProxy = new Proxy(
    {},
    { isExtensible() { throw new Error("must not inspect proxy input"); } },
  );

  expect(() =>
    admission.admitTureSetupAnalystStagingCompletedOutcomeSourceCreation(
      Object.freeze({ scope: mutable }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingCompletedOutcomeSourceCreation(
      Object.freeze({ scope: accessorScope }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingCompletedOutcomeSourceCreation(faultingProxy),
  ).toThrow(TypeError);
});

test("AI-02.12 remains server-only, I/O-free and registered once in existing CI", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/does not authorize or\s+execute/i);
  expect(doc).toMatch(/does not access staging/i);
  expect(doc).toMatch(
    /five-batch,[\s\S]*ten-snapshot default is not admitted/i,
  );
  const schedule = source(schedulePath);
  expect(schedule).toContain("max_batches: 5");
  expect(schedule).toContain("max_snapshots: 10");
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
