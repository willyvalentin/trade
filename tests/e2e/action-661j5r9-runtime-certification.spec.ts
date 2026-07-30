import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parsePersistedFileRebuildV1 } from "../../lib/action-661j5r2-runtime-result-protocol-rebuild-v1.mjs";
import { parseRelationStateFileRebuildV1 } from "../../lib/action-661j5r4-relation-state-result-protocol-rebuild-v1.mjs";
import { parseHistoryFileRebuildV1 } from "../../lib/action-661j5r5-history-boundary-result-protocol-rebuild-v1.mjs";
import { parseTerminalFileRebuildV1 } from "../../lib/action-661j5r6-terminal-boundary-result-protocol-rebuild-v1.mjs";
import { parseColumnAclPolicyFileRebuildV1 } from "../../lib/action-661j5r7-column-acl-policy-result-protocol-rebuild-v1.mjs";
import { parseRpcAppendOnlyFileRebuildV1 } from "../../lib/action-661j5r8-rpc-append-only-result-protocol-rebuild-v1.mjs";
import {
  CONTAINMENT_TRIGGER,
  SUCCESS_HISTORY_ENTRY,
  SUCCESS_POST_RPC_INVENTORY,
  SUCCESS_TARGET_ACL,
} from "../../lib/action-661j5r9-trigger-success-contracts-rebuild-v1.mjs";
import {
  parseTriggerSuccessFileRebuildV1,
  persistTriggerSuccessResultFileRebuildV1,
} from "../../lib/action-661j5r9-trigger-success-result-protocol-rebuild-v1.mjs";
import {
  buildTwentyEightShardAggregateRebuildV1,
  verifyTwentyEightShardAggregateRebuildV1,
} from "../../lib/action-661j5r9-twenty-eight-shard-aggregate-rebuild-v1.mjs";

interface Domain {
  domain_id: string;
  value: unknown[];
}

interface CatalogEntry {
  identity?: string;
  relation?: string;
}

const root = process.cwd();
const roots = {
  r3a: join(root, "docs/recovery/action-661j5r3a/runtime-evidence"),
  r4: join(root, "docs/recovery/action-661j5r4/runtime-evidence"),
  r5: join(root, "docs/recovery/action-661j5r5/runtime-evidence"),
  r7: join(root, "docs/recovery/action-661j5r7/runtime-evidence"),
  r8: join(root, "docs/recovery/action-661j5r8/runtime-evidence"),
  r9: join(root, "docs/recovery/action-661j5r9/runtime-evidence"),
};

const r9Paths = [
  "preexisting_proof_audit_trigger-run-a/run-a.preexisting-proof-audit-trigger-a.preexisting_proof_audit_trigger.trigger-success-rebuild-v1.json",
  "preexisting_proof_audit_trigger-run-b/run-b.preexisting-proof-audit-trigger-b.preexisting_proof_audit_trigger.trigger-success-rebuild-v1.json",
  "successful_containment-run-a/run-a.successful-containment-a.successful_containment.trigger-success-rebuild-v1.json",
  "successful_containment-run-b/run-b.successful-containment-b.successful_containment.trigger-success-rebuild-v1.json",
] as const;

function fileSha(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function domain(file: ReturnType<typeof parseTriggerSuccessFileRebuildV1>, id: string) {
  return file.record.evidence.poststate.domains.find(
    (entry: Domain) => entry.domain_id === id,
  )?.value ?? [];
}

function loadR9() {
  return r9Paths.map((path) =>
    parseTriggerSuccessFileRebuildV1(
      readFileSync(join(roots.r9, path), "utf8"),
    ),
  );
}

function aggregateInputs() {
  const historical = [
    "forbidden_history-run-a/run-a.forbidden-history-a.forbidden_history.rebuild-v1.json",
    "forbidden_history-run-b/run-b.forbidden-history-b.forbidden_history.rebuild-v1.json",
    "missing_target-run-a/run-a.missing-target-a.missing_target.rebuild-v1.json",
    "missing_target-run-b/run-b.missing-target-b.missing_target.rebuild-v1.json",
  ].map((path) =>
    parsePersistedFileRebuildV1(readFileSync(join(roots.r3a, path), "utf8")),
  );
  const relation = [
    "non_table-run-a/run-a.non-table-a.non_table.relation-state-rebuild-v1.json",
    "non_table-run-b/run-b.non-table-b.non_table.relation-state-rebuild-v1.json",
    "wrong_owner-run-a/run-a.wrong-owner-a.wrong_owner.relation-state-rebuild-v1.json",
    "wrong_owner-run-b/run-b.wrong-owner-b.wrong_owner.relation-state-rebuild-v1.json",
  ].map((path) =>
    parseRelationStateFileRebuildV1(
      readFileSync(join(roots.r4, path), "utf8"),
    ),
  );
  const history = [
    "missing_action_650_history-run-a/run-a.missing-action-650-history-a.missing_action_650_history.history-boundary-rebuild-v1.json",
    "missing_action_650_history-run-b/run-b.missing-action-650-history-b.missing_action_650_history.history-boundary-rebuild-v1.json",
    "incident_history_present-run-a/run-a.incident-history-present-a.incident_history_present.history-boundary-rebuild-v1.json",
    "incident_history_present-run-b/run-b.incident-history-present-b.incident_history_present.history-boundary-rebuild-v1.json",
  ].map((path) =>
    parseHistoryFileRebuildV1(readFileSync(join(roots.r5, path), "utf8")),
  );
  const terminal = [
    ["docs/recovery/action-661j5r6/runtime-evidence", "duplicate_containment_history-run-a/run-a.duplicate-containment-history-a.duplicate_containment_history.terminal-boundary-rebuild-v1.json"],
    ["docs/recovery/action-661j5r6/runtime-evidence", "duplicate_containment_history-run-b/run-b.duplicate-containment-history-b.duplicate_containment_history.terminal-boundary-rebuild-v1.json"],
    ["docs/recovery/action-661j5r6a/runtime-evidence", "unknown_acl_state-run-a/run-a.unknown-acl-state-a.unknown_acl_state.terminal-boundary-rebuild-v1.json"],
    ["docs/recovery/action-661j5r6a/runtime-evidence", "unknown_acl_state-run-b/run-b.unknown-acl-state-b.unknown_acl_state.terminal-boundary-rebuild-v1.json"],
  ].map(([directory, path]) =>
    parseTerminalFileRebuildV1(
      readFileSync(join(root, directory, path), "utf8"),
    ),
  );
  const aclPolicy = [
    "column_acl_state-run-a/run-a.column-acl-state-a.column_acl_state.column-acl-policy-rebuild-v1.json",
    "column_acl_state-run-b/run-b.column-acl-state-b.column_acl_state.column-acl-policy-rebuild-v1.json",
    "policy_state-run-a/run-a.policy-state-a.policy_state.column-acl-policy-rebuild-v1.json",
    "policy_state-run-b/run-b.policy-state-b.policy_state.column-acl-policy-rebuild-v1.json",
  ].map((path) =>
    parseColumnAclPolicyFileRebuildV1(
      readFileSync(join(roots.r7, path), "utf8"),
    ),
  );
  const rpc = [
    "rpc_catalog_body_drift-run-a/run-a.rpc-catalog-body-drift-a.rpc_catalog_body_drift.rpc-append-only-rebuild-v1.json",
    "rpc_catalog_body_drift-run-b/run-b.rpc-catalog-body-drift-b.rpc_catalog_body_drift.rpc-append-only-rebuild-v1.json",
    "incompatible_append_only_function-run-a/run-a.incompatible-append-only-function-a.incompatible_append_only_function.rpc-append-only-rebuild-v1.json",
    "incompatible_append_only_function-run-b/run-b.incompatible-append-only-function-b.incompatible_append_only_function.rpc-append-only-rebuild-v1.json",
  ].map((path) =>
    parseRpcAppendOnlyFileRebuildV1(
      readFileSync(join(roots.r8, path), "utf8"),
    ),
  );
  return {
    column_acl_policy_files: aclPolicy,
    historical_files: historical,
    history_files: history,
    relation_state_files: relation,
    rpc_append_only_files: rpc,
    terminal_files: terminal,
    trigger_success_files: loadR9(),
  };
}

test("fresh R9 files read back and prove rejection plus closed success", () => {
  const files = loadR9();
  expect(files.map((file) => file.canonical_file_digest)).toEqual([
    "729bfe4aa1ad542c3996adcfabeca1d9ea1ae4a36ef84326541bb7395aa8f01c",
    "78fd61790e0195aa67a98b5d9cd68a59e62b4e9f7be0f8f63836cfc87830ad95",
    "1402c14cd5b766ad184e38a33e4b9a5e0e8edcbc9dde90e32ac5dd0c25145629",
    "147d66897daf38974656935d32f978a097cf87f295e42fd4e98b8af23a61bb98",
  ]);
  for (const file of files.slice(0, 2)) {
    const evidence = file.record.evidence;
    expect(evidence.diagnostic).toMatchObject({
      migration_applied: false,
      reason: "Action 661J refuses pre-existing proof-audit trigger state",
      sqlstate: "P0001",
      terminal_state: "controlled_error",
    });
    expect(evidence.prestate.combined_digest).toBe(
      evidence.poststate.combined_digest,
    );
    expect(evidence.atomicity_decision).toBe("no_transition_verified");
  }
  for (const file of files.slice(2)) {
    const evidence = file.record.evidence;
    expect(evidence.diagnostic).toMatchObject({
      migration_applied: true,
      reason: null,
      sqlstate: null,
      terminal_state: "completed",
    });
    expect(evidence.atomicity_decision).toBe("closed_transition_verified");
    expect(evidence.prestate.combined_digest).not.toBe(
      evidence.poststate.combined_digest,
    );
    expect(domain(file, "migration_history").at(-1)).toEqual(
      SUCCESS_HISTORY_ENTRY,
    );
    const rpcIdentities = new Set(
      SUCCESS_POST_RPC_INVENTORY.map(
        (entry: { identity: string }) => entry.identity,
      ),
    );
    expect(
      domain(file, "rpc_catalog").filter(
        (entry: unknown) =>
          typeof (entry as CatalogEntry).identity === "string" &&
          rpcIdentities.has((entry as CatalogEntry).identity as string),
      ),
    ).toEqual(SUCCESS_POST_RPC_INVENTORY);
    const targetRelations = new Set(
      SUCCESS_TARGET_ACL.map(
        (entry: { relation: string }) => entry.relation,
      ),
    );
    expect(
      domain(file, "table_acl").filter((entry: unknown) =>
        targetRelations.has((entry as CatalogEntry).relation ?? "")
      ),
    ).toEqual(SUCCESS_TARGET_ACL);
    expect(
      domain(file, "trigger_catalog").filter(
        (entry: unknown) =>
          (entry as CatalogEntry).relation ===
          "public.bounded_shadow_collector_proof_audits",
      ),
    ).toEqual([CONTAINMENT_TRIGGER]);
    const preTargetData = file.record.evidence.prestate.domains.find(
      (entry: Domain) => entry.domain_id === "target_data",
    )?.value;
    expect(domain(file, "target_data")).toEqual(preTargetData);
  }
});

test("R9 exact 28-shard aggregate independently rebuilds", () => {
  const inputs = aggregateInputs();
  const rebuilt = buildTwentyEightShardAggregateRebuildV1(inputs);
  const persisted = JSON.parse(
    readFileSync(
      join(
        roots.r9,
        "action-661j5r9-twenty-eight-shard-aggregate.rebuild-v1.json",
      ),
      "utf8",
    ),
  );
  verifyTwentyEightShardAggregateRebuildV1(persisted, inputs);
  expect(persisted).toEqual(rebuilt);
  expect(rebuilt).toMatchObject({
    aggregate_digest:
      "98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d",
    decision: "certified",
    shard_count: 28,
  });
  expect(rebuilt.scenario_comparisons).toHaveLength(14);
  expect(
    rebuilt.scenario_comparisons.find(
      (entry: { scenario_id: string }) =>
        entry.scenario_id === "successful_containment",
    ),
  ).toMatchObject({
    atomicity_decision: "closed_transition_verified",
    deterministic: true,
    semantic_digest:
      "5875cf90327839e7c3903004ae669e68b3db3b9dc76ac0f80e2556a7e90dbfcc",
  });
});

test("R9 persistence is idempotent and collision closed", () => {
  const file = loadR9()[0];
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r9-"));
  const path = join(directory, file.file_identity);
  try {
    const first = persistTriggerSuccessResultFileRebuildV1({
      file,
      output_path: path,
    });
    const second = persistTriggerSuccessResultFileRebuildV1({
      file,
      output_path: path,
    });
    expect(first.disposition).toBe("written");
    expect(second.disposition).toBe("existing_identical");
    writeFileSync(path, `${readFileSync(path, "utf8")} `);
    expect(() =>
      persistTriggerSuccessResultFileRebuildV1({
        file,
        output_path: path,
      })
    ).toThrow(/^rebuild_v1\.persistence_collision/);
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("R9 preserves every predecessor aggregate and frozen artifact", () => {
  const expected = [
    ["docs/recovery/action-661j5r3a/runtime-evidence/action-661j5r2-mixed-ab-aggregate.rebuild-v1.json", "3b1713b42936193860f54f097226c73cd254f003c9b1e307f92b8a22f286a556"],
    ["docs/recovery/action-661j5r4/runtime-evidence/action-661j5r4-eight-shard-aggregate.rebuild-v1.json", "0a354893760f4cedb42d99080dcbf2e831937494291f04068e406be12e1a4838"],
    ["docs/recovery/action-661j5r5/runtime-evidence/action-661j5r5-twelve-shard-aggregate.rebuild-v1.json", "87da33bdb0fe2c3c683895efa4cfc492ddff53f6ecbfd34569f98bf82e450655"],
    ["docs/recovery/action-661j5r6a/runtime-evidence/action-661j5r6-sixteen-shard-aggregate.rebuild-v1.json", "852c690b8162414b68bf5e51deb98b7e542bb548e59af935de8b009e95d6895a"],
    ["docs/recovery/action-661j5r7/runtime-evidence/action-661j5r7-twenty-shard-aggregate.rebuild-v1.json", "d78fffa6eed1899c0d50e3b7e1a0fecfbbb197d4d2d3eea97a41f35cb10ec176"],
    ["docs/recovery/action-661j5r8/runtime-evidence/action-661j5r8-twenty-four-shard-aggregate.rebuild-v1.json", "59aadefa50a344cdbcca88bf4a26579c38fdfa0409a70b213cdfa5b8d6ab2ad3"],
    ["scripts/action-661j5r3-runtime-migration-rebuild-v1.sql", "7f95f157af31ac5757faff4d84d9f26923ea1394426747584e15f5f3a2da2517"],
    ["lib/action-661j5r8-postgres-runtime-collector-rebuild-v3.mjs", "370dc8dd0579996389983eb9b5b5cc3d7116db80941261e1f835570b973260fb"],
  ] as const;
  for (const [path, digest] of expected) {
    expect(fileSha(join(root, path)), path).toBe(digest);
  }
});
