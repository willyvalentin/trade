import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_REQUIREMENTS,
} from "@/lib/transactional-recommendation-position-writer-implementation-authority-decision";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666eb-transactional-recommendation-position-writer-implementation-authority-decision.md";
const evidencePath = "docs/evidence/action-666eb-transactional-recommendation-position-writer-implementation-authority-decision.json";
const modulePath = "lib/transactional-recommendation-position-writer-implementation-authority-decision.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666eb-transactional-recommendation-position-writer-implementation-authority-decision.spec.ts";
const evidenceSha256 = "b7b6b357c8801e549e8dc13ce3c9a244a2f956627f684eab962e3355d99cb140";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666EB records narrow implementation authority without exposing a writer", () => {
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_REQUIREMENTS)).toBe(true);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_REQUIREMENTS).toEqual([
    "explicit_operator_authorization_is_recorded",
    "exact_main_admission_bundle_delivery_precedes_implementation",
    "private_server_adapter_is_the_only_writer_surface",
    "owner_bound_transactional_command_remains_the_only_durable_effect_path",
    "idempotent_created_or_replayed_result_is_required",
    "no_client_side_or_broker_execution_surface_is_introduced",
  ]);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_DECISION).toEqual({
    decisionVersion: "transactional_recommendation_position_writer_implementation_authority_decision_v1",
    admissionBundleContractVersion: "transactional_recommendation_position_writer_admission_bundle_contract_v1",
    requirements: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_IMPLEMENTATION_AUTHORITY_REQUIREMENTS,
    explicitOperatorAuthorizationRecorded: true,
    privateServerAdapterImplementationAuthorized: true,
    ownerBoundTransactionalCommandIntegrationAuthorized: true,
    runtimeActivationMayBeDeliveredThroughNormalProtectedReview: true,
    clientSideWriterAuthorized: false,
    brokerOperationAuthorizedByThisDecision: false,
    externalEffectExecutedByThisDecision: false,
  });
});

test("666EB binds the exact successful predecessor and remains source-only", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "bcf2aec4ed395ed8960da742bfcef8d178cc696e",
    exact_main_ci_run: 32659617285,
    exact_main_ci_conclusion: "success",
  });
  expect(evidence.authority).toEqual({
    explicit_operator_authorization_recorded: true,
    private_server_adapter_implementation_authorized: true,
    owner_bound_transactional_command_integration_authorized: true,
    runtime_activation_may_follow_normal_protected_review: true,
    client_side_writer_authorized: false,
    broker_operation_authorized_by_this_decision: false,
    external_effect_executed_by_this_decision: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_implementation_authority_decision",
    database_operations: false,
    migration_file_added: false,
    runtime_wiring: false,
    provider_calls: false,
    broker_operations: false,
    deployment: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const decisionSource = source(modulePath);
  expect(decisionSource).not.toMatch(/\b(?:fetch|createClient|execute_sql|insert|update|delete|select|rpc)\s*\(/);
  expect(decisionSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  expect(source(roadmapPath)).toMatch(/action 666eb/i);
  expect(source(ledgerPath)).toMatch(/action 666eb/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666EB documentation records authorization without secrets or operations", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toMatch(/explicitly authorized/i);
  expect(action).toMatch(/no\s+database\s+client/i);
  expect(action).toMatch(/performs\s+no\s+external\s+effect/i);
});
