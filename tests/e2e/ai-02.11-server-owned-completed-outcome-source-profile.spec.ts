import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

import { expect, test } from "@playwright/test";
import ts from "typescript";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/server/ture-setup-analyst-server-owned-outcome-source-profile.ts";
const docPath = "docs/ai-02.11-server-owned-completed-outcome-source-profile.md";
const schedulePath = "netlify/functions/scheduled-outcome-evaluation.ts";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";
const persistencePath = "lib/server/recommendation-outcome-persistence.ts";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/ai-02.11-server-owned-completed-outcome-source-profile.spec.ts";

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

type LoadedProfile = {
  selectTureSetupAnalystServerOwnedOutcomeSourceProfile(input: unknown): {
    readonly profile_status: string;
    readonly selected_source: {
      readonly environment: string;
      readonly relation: string;
      readonly producer: string;
      readonly bundle_identity: string;
    };
    readonly completed_bundle_requirements: readonly string[];
    readonly excluded_inputs: readonly string[];
    readonly source_availability: string;
    readonly next_gate: string;
    readonly authority: {
      readonly may_access_staging: boolean;
      readonly may_read_recommendation_outcomes: boolean;
      readonly may_apply_migration: boolean;
      readonly may_write_active_evidence: boolean;
      readonly may_run_offline_evaluation: boolean;
      readonly may_bind_runtime: boolean;
    };
  };
};

function loadProfile(): LoadedProfile {
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
  return sandbox.exports as LoadedProfile;
}

function validInput(overrides: Record<string, unknown> = {}) {
  return Object.freeze({
    proposal: Object.freeze({
      environment: "staging",
      source_relation: "public.recommendation_outcomes",
      active_evidence_relation: "public.canonical_active_evaluation_evidence",
      producer: "official_scheduled_outcome_evaluation",
      producer_authentication: "automation_secret_and_application_owner_principal",
      outcome_persistence: "server_supabase_service_role_upsert",
      bundle_identity: "owner_bound_snapshot_fingerprint",
      primary_horizon: "60m",
      diagnostic_horizons: "15m_30m_60m_exact",
      outcome_completion: "intraday_candles_complete",
      source_availability: "requires_separate_authorized_staging_preflight",
      migration_application: "not_admitted",
      source_read: "not_admitted",
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

test("AI-02.11 selects exactly the server-owned completed-outcome source profile", () => {
  const profile = loadProfile();
  const result = profile.selectTureSetupAnalystServerOwnedOutcomeSourceProfile(
    validInput(),
  );

  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.selected_source)).toBe(true);
  expect(Object.isFrozen(result.completed_bundle_requirements)).toBe(true);
  expect(Object.isFrozen(result.excluded_inputs)).toBe(true);
  expect(result).toMatchObject({
    profile_status: "source_profile_selected_not_available_not_admitted",
    selected_source: {
      environment: "staging",
      relation: "public.recommendation_outcomes",
      producer: "official_scheduled_outcome_evaluation",
      bundle_identity: "owner_bound_snapshot_fingerprint",
    },
    completed_bundle_requirements: [
      "authenticated_server_owned_producer",
      "server_persisted_outcome_rows",
      "one_owner_bound_snapshot_fingerprint",
      "complete_intraday_candle_evidence",
      "primary_60m_outcome",
      "diagnostic_15m_30m_60m_horizons",
    ],
    excluded_inputs: [
      "caller_supplied_snapshots",
      "local_storage",
      "fixture",
      "historical_synthetic",
      "legacy_preservation_relation",
    ],
    source_availability: "not_observed_by_this_contract",
    next_gate: "separately_authorized_staging_source_availability_preflight",
    authority: {
      may_access_staging: false,
      may_read_recommendation_outcomes: false,
      may_apply_migration: false,
      may_write_active_evidence: false,
      may_run_offline_evaluation: false,
      may_bind_runtime: false,
    },
  });
});

test("AI-02.11 fails closed for legacy, fixture, incomplete or widened proposals", () => {
  const profile = loadProfile();

  for (const invalid of [
    validInput({ environment: "production" }),
    validInput({ source_relation: "private.ai_02_legacy_outcome_evidence" }),
    validInput({ producer: "caller_supplied_snapshots" }),
    validInput({ producer_authentication: "none" }),
    validInput({ outcome_persistence: "browser_local_storage" }),
    validInput({ primary_horizon: "15m" }),
    validInput({ diagnostic_horizons: "15m_30m_only" }),
    validInput({ outcome_completion: "partial" }),
    validInput({ migration_application: "admitted" }),
    validInput({ source_read: "admitted" }),
    validInput({ active_evidence_write: "admitted" }),
    validInput({ runtime_binding: "admitted" }),
    validInput({ unexpected: "widened" }),
  ]) {
    expect(() =>
      profile.selectTureSetupAnalystServerOwnedOutcomeSourceProfile(invalid),
    ).toThrow(TypeError);
  }
});

test("AI-02.11 rejects mutable, accessor-backed and faulting proxy proposals", () => {
  const profile = loadProfile();
  const mutable = { ...validInput().proposal };
  const accessorProposal = Object.freeze(
    Object.defineProperty({}, "environment", {
      enumerable: true,
      get() {
        throw new Error("must not read accessor proposal");
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
    profile.selectTureSetupAnalystServerOwnedOutcomeSourceProfile(
      Object.freeze({ proposal: mutable }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    profile.selectTureSetupAnalystServerOwnedOutcomeSourceProfile(
      Object.freeze({ proposal: accessorProposal }),
    ),
  ).toThrow(TypeError);
  expect(() =>
    profile.selectTureSetupAnalystServerOwnedOutcomeSourceProfile(faultingProxy),
  ).toThrow(TypeError);
});

test("AI-02.11 keeps its source profile I/O-free while pinning the existing producer boundaries", () => {
  const contract = source(sourcePath);
  const doc = source(docPath);
  const schedule = source(schedulePath);
  const route = source(routePath);
  const persistence = source(persistencePath);

  expect(contract).toContain('import "server-only"');
  expect(contract).not.toMatch(
    /from\s+["'](?:openai|pg|@supabase\/supabase-js)|\bfetch\s*\(|process\.env|child_process/i,
  );
  expect(doc).toMatch(/does \*\*not\*\* read `recommendation_outcomes`/i);
  expect(doc).toMatch(/not_available_not_admitted/);
  expect(schedule).toContain('mode: "official_live_today"');
  expect(schedule).toContain('const officialIntradayHorizons = ["15m", "30m", "60m"] as const');
  expect(route).toContain("verifyConfiguredApplicationOwnerPrincipal");
  expect(route).toContain("persistRecommendationOutcome(outcome");
  expect(persistence).toContain("getConfiguredApplicationOwnerUserId");
  expect(persistence).toContain('.from("recommendation_outcomes")');
});

test("AI-02.11 is registered once in the unchanged six-shard suite", () => {
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
