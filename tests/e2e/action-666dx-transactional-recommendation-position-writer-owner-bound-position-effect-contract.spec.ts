import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_POSITION_EFFECT_CONTRACT,
  TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_POSITION_EFFECT_REQUIREMENTS,
} from "@/lib/transactional-recommendation-position-writer-owner-bound-position-effect-contract";

const root = resolve(__dirname, "../..");
const actionPath = "docs/action-666dx-transactional-recommendation-position-writer-owner-bound-position-effect-contract.md";
const evidencePath = "docs/evidence/action-666dx-transactional-recommendation-position-writer-owner-bound-position-effect-contract.json";
const modulePath = "lib/transactional-recommendation-position-writer-owner-bound-position-effect-contract.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666dx-transactional-recommendation-position-writer-owner-bound-position-effect-contract.spec.ts";
const evidenceSha256 = "ffbf6147ddb0da7ddb775bcba39547dfcec7b2227c06773059f7b82aae7b70fa";

function source(relativePath: string) { return readFileSync(resolve(root, relativePath), "utf8"); }
function sha256(value: string) { return createHash("sha256").update(value, "utf8").digest("hex"); }

test("666DX exposes immutable default-deny owner-bound paired-effect metadata", () => {
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_POSITION_EFFECT_CONTRACT)).toBe(true);
  expect(Object.isFrozen(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_POSITION_EFFECT_REQUIREMENTS)).toBe(true);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_POSITION_EFFECT_REQUIREMENTS).toEqual([
    "verified_server_owner_context", "recommendation_owner_equals_position_owner",
    "owner_scoped_current_position_match", "owner_scoped_position_effect",
    "append_only_owner_scoped_history_effect", "single_transaction_all_or_nothing_pair",
  ]);
  expect(TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_POSITION_EFFECT_CONTRACT).toEqual({
    contractVersion: "transactional_recommendation_position_writer_owner_bound_position_effect_contract_v1",
    requirements: TRANSACTIONAL_RECOMMENDATION_POSITION_WRITER_OWNER_BOUND_POSITION_EFFECT_REQUIREMENTS,
    serverOwnerContextResolved: false, recommendationPositionOwnerEqualityVerified: false,
    currentPositionMatchVerified: false, ownerScopedPositionEffectAdmitted: false,
    appendOnlyHistoryEffectAdmitted: false, sameTransactionPairAdmitted: false,
    durableIdempotencyReservationBound: false, commitVisibleResultAdmitted: false,
    databaseOperationPresent: false, runtimeWiringPresent: false, productionAuthorityGranted: false,
  });
});

test("666DX binds frozen evidence and protected CI without position-effect authority", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);
  expect(evidence.predecessor).toEqual({
    protected_main_commit: "6b18d6d2fbddec88992eeb1af45b73731082b27f",
    protected_main_tree: "2817c464f0afacdc9bc61f044de255e41224651e",
    exact_main_ci_run: 32634834264, exact_main_ci_conclusion: "success",
  });
  expect(evidence.owner_bound_position_effect_contract).toEqual({
    requirement_count: 6, server_owner_context_resolved: false,
    recommendation_position_owner_equality_verified: false,
    current_position_match_verified: false, owner_scoped_position_effect_admitted: false,
    append_only_history_effect_admitted: false, same_transaction_pair_admitted: false,
    durable_idempotency_reservation_bound: false, commit_visible_result_admitted: false,
  });
  expect(evidence.delivery).toEqual({
    kind: "source_only_owner_bound_position_effect_contract", database_operations: false,
    migration_file_added: false, runtime_wiring: false, provider_calls: false,
    broker_operations: false, deployment: false,
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(source(relativePath))).toBe(expectedHash);
  }
  const contractSource = source(modulePath);
  expect(contractSource).not.toMatch(/\b(?:fetch|createClient|execute_sql|insert|update|delete|select)\s*\(/);
  expect(contractSource).not.toMatch(/from\s+['"](?:@\/lib\/supabase|@supabase|next\/server|node:net|node:https|node:http)/);
  expect(source(roadmapPath)).toMatch(/action 666dx/i);
  expect(source(ledgerPath)).toMatch(/action 666dx/i);
  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});

test("666DX documentation and evidence are privacy-safe and deny paired effects", () => {
  const action = source(actionPath);
  const evidence = source(evidencePath);
  expect(`${action}\n${evidence}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(action).toMatch(/no database\s+client/);
  expect(action).toMatch(/does\s+not\s+itself\s+inspect\s+or\s+alter\s+a\s+recommendation,\s+position\s+or\s+history\s+record/);
});
