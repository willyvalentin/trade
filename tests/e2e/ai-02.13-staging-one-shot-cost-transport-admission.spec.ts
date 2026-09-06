import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-staging-one-shot-cost-transport-admission.ts";
const docPath = "docs/ai-02.13-staging-one-shot-cost-transport-admission.md";
const schedulePath = "netlify/functions/scheduled-outcome-evaluation.ts";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";
const runnerPath = "lib/recommendation-outcome-evaluation-runner.ts";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const shardRunnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.13-staging-one-shot-cost-transport-admission.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedAdmission = {
  admitTureSetupAnalystStagingOneShotCostTransport(input: unknown): {
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
      producer: "official_scheduled_outcome_evaluation",
      scheduled_default_bounds: "five_batches_ten_snapshots_not_admitted",
      transport: "temporary_branch_deploy_adapter",
      deploy_context: "deploy_preview_only",
      source_input: "one_server_owned_official_snapshot_only",
      maximum_batches: "one",
      maximum_snapshots: "one",
      horizons: "15m_30m_60m_exact",
      reused_candle_requests_per_snapshot: "one",
      maximum_provider_candle_requests: "one",
      provider_cost: "separately_authorized_one_request_max",
      credential_identity:
        "nonsecret_presence_only_and_owner_preflight_required",
      credential_values: "not_read",
      source_rows: "not_read",
      outcome_persistence: "not_admitted",
      active_evidence_migration: "not_admitted",
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

test("AI-02.13 validates exactly one bounded staging one-shot design", () => {
  const result = loadAdmission().admitTureSetupAnalystStagingOneShotCostTransport(
    validInput(),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.permitted_scope)).toBe(true);
  expect(Object.isFrozen(result.required_preconditions)).toBe(true);
  expect(Object.isFrozen(result.excluded_authority)).toBe(true);
  expect(result).toMatchObject({
    admission_status:
      "one_shot_cost_transport_scope_validated_not_authorized_not_executed",
    permitted_scope: {
      environment: "staging",
      transport: "temporary_branch_deploy_adapter",
      deploy_context: "deploy_preview_only",
      maximum_batches: "one",
      maximum_snapshots: "one",
      maximum_provider_candle_requests: "one",
    },
    required_preconditions: [
      "no_completed_bundle_available_preflight",
      "scheduled_default_five_batch_ten_snapshot_shape_not_admitted",
      "one_server_owned_official_snapshot",
      "one_batch_one_snapshot_request_limits",
      "one_reused_candle_request_for_15m_30m_60m_bundle",
      "separately_authorized_one_provider_request_max",
      "nonsecret_credential_presence_and_application_owner_preflight",
      "temporary_deploy_preview_only_transport",
    ],
    excluded_authority: [
      "source_row_read",
      "credential_value_read",
      "provider_invocation",
      "evaluator_invocation",
      "branch_adapter_deploy",
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
      "separately_authorized_staging_nonsecret_credential_presence_and_branch_transport_preflight",
    authority: {
      may_access_staging: false,
      may_access_secrets: false,
      may_invoke_provider: false,
      may_invoke_evaluator: false,
      may_deploy_branch_adapter: false,
      may_persist_recommendation_outcome: false,
      may_write_active_evidence: false,
      may_submit_broker_instructions: false,
    },
  });
});

test("AI-02.13 rejects any wider cost, transport, identity or downstream scope", () => {
  const admission = loadAdmission();
  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ scheduled_default_bounds: "one_batch_one_snapshot" }),
    validInput({ transport: "scheduled_function" }),
    validInput({ deploy_context: "production" }),
    validInput({ maximum_batches: "five" }),
    validInput({ maximum_snapshots: "ten" }),
    validInput({ maximum_provider_candle_requests: "four" }),
    validInput({ provider_cost: "unbounded" }),
    validInput({ credential_identity: "credential_values_read" }),
    validInput({ credential_values: "read" }),
    validInput({ source_rows: "read" }),
    validInput({ outcome_persistence: "admitted" }),
    validInput({ active_evidence_write: "admitted" }),
    validInput({ deployment_binding: "admitted" }),
    validInput({ production_binding: "admitted" }),
    validInput({ unexpected: "widened" }),
  ]) {
    expect(() =>
      admission.admitTureSetupAnalystStagingOneShotCostTransport(invalid),
    ).toThrow(TypeError);
  }
});

test("AI-02.13 rejects mutable, accessor-backed and faulting proxy input", () => {
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
    admission.admitTureSetupAnalystStagingOneShotCostTransport(
      Object.freeze({ scope: mutable }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingOneShotCostTransport(
      Object.freeze({ scope: accessorScope }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    admission.admitTureSetupAnalystStagingOneShotCostTransport(faultingProxy),
  ).toThrow(TypeError);
});

test("AI-02.13 is I/O-free and pins the existing one-shot cost evidence", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  const schedule = source(schedulePath);
  const route = source(routePath);
  const runner = source(runnerPath);

  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env/i,
  );
  expect(doc).toMatch(/does\s+not authorize or execute/i);
  expect(doc).toMatch(/not authorize or execute a branch deployment, staging access/i);
  expect(schedule).toContain("max_batches: 5");
  expect(schedule).toContain("max_snapshots: 10");
  expect(route).toContain("maxCandleRequests: providerBudgetLimit");
  expect(runner).toContain("candleRequestsPlanned += 1");
  expect(runner).toContain("candleRequestsBeforeReuse += reusableHorizonWork.length");
  expect(runner).toContain("buildReusableCandleRequest");
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(shardRunnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
