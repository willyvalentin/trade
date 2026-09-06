import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-active-evidence-contract.ts";
const migrationPath =
  "supabase/migrations/20260906180346_create_canonical_active_evaluation_evidence.sql";
const localMatrixPath = "scripts/ai-02.10-local-postgres-matrix.mjs";
const docPath = "docs/ai-02.10-active-evidence-contract-and-migration.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.10-ture-setup-analyst-active-evidence-contract.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedContract = {
  admitTureSetupAnalystActiveEvidence(input: unknown): {
    readonly contract_version: string;
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
    readonly authority: Record<string, boolean | string>;
  };
};

function loadContract(): LoadedContract {
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
  return sandbox.exports as LoadedContract;
}

function validInput(overrides: Record<string, unknown> = {}) {
  return Object.freeze({
    scope: Object.freeze({
      environment: "staging",
      relation: "public.canonical_active_evaluation_evidence",
      operation: "one_append_only_insert",
      evidence_contract_version: "canonical_active_evaluation_evidence_v2",
      preserves_v1_inactive_evidence: "required",
      source_kind: "server_owned_completed_recommendation_outcome_bundle",
      source_binding:
        "separately_authorized_real_server_owned_bundle_required",
      canonical_identity: "required",
      active_evidence_identity: "required",
      semantic_payload_sha256: "required",
      complete_primary_outcome: "60m_required",
      diagnostic_horizons: "15m_30m_60m_complete",
      inactive_readiness_only: "must_be_false",
      idempotency_preflight: "active_evidence_identity_and_digest",
      containment: "rollback_or_remove_proof_row",
      independent_readback:
        "minimal_identity_digest_and_completion_only",
      migration_application: "not_authorized",
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

test("AI-02.10 accepts only the exact local active-evidence v2 contract", () => {
  const contract = loadContract();
  const result = contract.admitTureSetupAnalystActiveEvidence(validInput());

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.permitted_scope)).toBe(true);
  expect(Object.isFrozen(result.required_evidence)).toBe(true);
  expect(Object.isFrozen(result.excluded_authority)).toBe(true);
  expect(result).toMatchObject({
    contract_version: "ture_setup_analyst_active_evidence_contract_v2",
    admission_status:
      "active_evidence_contract_validated_not_authorized_not_executed",
    permitted_scope: {
      environment: "staging",
      relation: "public.canonical_active_evaluation_evidence",
      operation: "one_append_only_insert",
      source_kind: "server_owned_completed_recommendation_outcome_bundle",
    },
    next_gate:
      "locally_verified_additive_migration_and_separately_authorized_real_source_binding",
    authority: {
      may_access_staging: false,
      may_apply_migration: false,
      may_bind_server_owned_source: false,
      may_persist_evidence: false,
      may_form_offline_dataset: false,
      may_run_offline_evaluation: false,
      may_bind_runtime: false,
      may_submit_broker_instructions: false,
    },
  });
  expect(result.required_evidence).toContain(
    "v1_inactive_evidence_preserved",
  );
  expect(result.required_evidence).toContain(
    "real_server_owned_completed_bundle",
  );
  expect(result.excluded_authority).toContain("migration_application");
  expect(result.excluded_authority).toContain("source_binding");
});

test("AI-02.10 fails closed for v1 relabeling, fabricated source, authority widening, or scope expansion", () => {
  const contract = loadContract();
  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ relation: "public.canonical_evaluation_decisions" }),
    validInput({ evidence_contract_version: "canonical_evaluation_persistence_v1" }),
    validInput({ preserves_v1_inactive_evidence: "optional" }),
    validInput({ source_kind: "historical_synthetic_fixture" }),
    validInput({
      source_binding: "fixture_or_legacy_relation_allowed",
    }),
    validInput({ complete_primary_outcome: "optional" }),
    validInput({ diagnostic_horizons: "optional" }),
    validInput({ inactive_readiness_only: "allowed" }),
    validInput({ migration_application: "admitted" }),
    validInput({ evaluator_binding: "admitted" }),
    validInput({ runtime_binding: "admitted" }),
    validInput({ unexpected: "widened" }),
  ]) {
    expect(() =>
      contract.admitTureSetupAnalystActiveEvidence(invalid),
    ).toThrow(TypeError);
  }
});

test("AI-02.10 rejects mutable, accessor-backed and faulting proxy input", () => {
  const contract = loadContract();
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
    {
      isExtensible() {
        throw new Error("must not inspect proxy input");
      },
    },
  );

  expect(() =>
    contract.admitTureSetupAnalystActiveEvidence(
      Object.freeze({ scope: mutable }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    contract.admitTureSetupAnalystActiveEvidence(
      Object.freeze({ scope: accessorScope }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    contract.admitTureSetupAnalystActiveEvidence(faultingProxy),
  ).toThrow(TypeError);
});

test("AI-02.10 migration is additive, v1-preserving, append-only and default-deny", () => {
  const migration = source(migrationPath);

  expect(migration).toContain(
    "create table public.canonical_active_evaluation_evidence",
  );
  expect(migration).not.toMatch(
    /alter\s+table\s+public\.canonical_evaluation_decisions|drop\s+table|truncate\s+table/i,
  );
  expect(migration).toContain(
    "active_evidence_contract_version = 'canonical_active_evaluation_evidence_v2'",
  );
  expect(migration).toContain("inactive_readiness_only' = 'false'");
  expect(migration).toContain("'server_owned_completed_recommendation_outcome_bundle'");
  expect(migration).toContain("primary_horizon = '60m'");
  for (const horizon of ["15m", "30m", "60m"]) {
    expect(migration).toContain(`\"horizon\":\"${horizon}\"`);
  }
  expect(migration).toContain(
    "canonical_active_evaluation_evidence_append_only",
  );
  expect(migration).toContain(
    "before update or delete on public.canonical_active_evaluation_evidence",
  );
  expect(migration).toContain(
    "alter table public.canonical_active_evaluation_evidence enable row level security",
  );
  expect(migration).toContain(
    "alter table public.canonical_active_evaluation_evidence force row level security",
  );
  expect(migration).toContain(
    "revoke all privileges on table public.canonical_active_evaluation_evidence",
  );
  expect(migration).toContain("from public, anon, authenticated, service_role");
  expect(migration).not.toMatch(/\bcreate policy\b|\bgrant\s+.+\s+on\s+/i);
  const localMatrix = source(localMatrixPath);
  expect(localMatrix).toContain("migration_applied_locally");
  expect(localMatrix).toContain("v1_relation_preserved");
  expect(localMatrix).toContain("rls_and_privileges_default_deny");
  expect(localMatrix).toContain("rollback_leaves_no_active_evidence");
  expect(localMatrix).not.toMatch(/supabase\s+(?:link|db|migration)|fetch\s*\(/i);
});

test("AI-02.10 remains server-only, I/O-free and registered exactly once", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env|createClient|\.from\(/i,
  );
  expect(doc).toMatch(/does not authorize or execute/i);
  expect(doc).toMatch(/does not apply the\s+migration/i);
  expect(doc).toMatch(/does not bind a source/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
