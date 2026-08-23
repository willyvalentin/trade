import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_AUTHENTICATED_SERVER_OWNER_CONTEXT_CONTRACT,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_CONTEXT_REQUIREMENTS,
} from "@/lib/transactional-recommendation-position-writer-authenticated-server-owner-context-contract";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666dv-transactional-recommendation-position-writer-authenticated-server-owner-context-contract.md";
const evidencePath = "docs/evidence/action-666dv-transactional-recommendation-position-writer-authenticated-server-owner-context-contract.json";
const modulePath = "lib/transactional-recommendation-position-writer-authenticated-server-owner-context-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666dv-transactional-recommendation-position-writer-authenticated-server-owner-context-contract.spec.ts";
const evidenceSha256 = "1f83676e847029bfce36ef50fc4a287088bbabebacdd2ade5c1e9c4178552163";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DV exposes only immutable default-deny server-owner context metadata", () => {
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_AUTHENTICATED_SERVER_OWNER_CONTEXT_CONTRACT)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_CONTEXT_REQUIREMENTS)).toBe(true);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_CONTEXT_REQUIREMENTS).toEqual([
    "private_server_execution_context", "authenticated_subject_resolution",
    "non_client_owned_subject_binding", "owner_bound_recommendation_and_position_scope",
    "same_context_transaction_handoff",
  ]);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_AUTHENTICATED_SERVER_OWNER_CONTEXT_CONTRACT).toEqual({
    contractVersion: "transactional_recommendation_position_writer_authenticated_server_owner_context_contract_v1",
    requirements: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_CONTEXT_REQUIREMENTS,
    serverResolverSelected: false, serverResolverInvocationPresent: false,
    authenticatedSubjectResolutionAdmitted: false, clientOwnerProjectionAccepted: false,
    ownerBindingResolved: false, recommendationScopeAdmitted: false,
    positionScopeAdmitted: false, transactionHandoffAdmitted: false,
    databaseOperationPresent: false, runtimeWiringPresent: false,
    providerOperationPresent: false, productionAuthorityGranted: false,
  });
});

test("666DV binds frozen evidence and protected CI without actual authentication", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "8437c25fe7904810e61cc9f2ca2efbbaf554040a",
    protected_main_tree: "9e7746551a9e99410f962497f572a2fffa834007",
    exact_main_ci_run: 32626894943,
    exact_main_ci_conclusion: "success",
  });
  expect(evidence.authenticated_server_owner_context_contract).toEqual({
    requirement_count: 5, server_resolver_selected: false,
    server_resolver_invocation_present: false, authenticated_subject_resolution_admitted: false,
    client_owner_projection_accepted: false, owner_binding_resolved: false,
    recommendation_scope_admitted: false, position_scope_admitted: false,
    transaction_handoff_admitted: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_authenticated_server_owner_context_contract", database_operations: false,
    migration_file_added: false, runtime_wiring: false, provider_calls: false,
    broker_operations: false, deployment: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const contractSource = source(modulePath);
  expect(contractSource).not.toMatch(/\b(?:fetch|createClient|getUser|getSession|execute_sql|insert|update|delete)\s*\(/);
  expect(contractSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  expect(source(roadmapPath)).toMatch(/action 666dv/i);
  expect(source(ledgerPath)).toMatch(/action 666dv/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666DV documentation and evidence are privacy-safe and deny live authority", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toContain("neither authenticates nor authorizes any principal");
  expect(action).toContain("not an authentication event");
});
