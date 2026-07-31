import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  sha256,
} from "../../lib/action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  APPEND_ONLY_BASELINE,
  BASELINE_HISTORY_INVENTORY,
  CONTAINMENT_TRIGGER,
  FROZEN_EIGHT_RPC_INVENTORY,
  PREEXISTING_TRIGGER,
  SUCCESS_HISTORY_ENTRY,
  SUCCESS_POST_RPC_INVENTORY,
  SUCCESS_TARGET_ACL,
  TRIGGER_SUCCESS_POLICY_REGISTRY,
  TRIGGER_SUCCESS_POLICY_REGISTRY_DIGEST,
  buildTriggerSuccessPreconditionReference,
} from "../../lib/action-661j5r9-trigger-success-contracts-rebuild-v1.mjs";
import {
  buildTriggerSuccessResultChainRebuildV1,
  verifyTriggerSuccessFileRebuildV1,
} from "../../lib/action-661j5r9-trigger-success-result-protocol-rebuild-v1.mjs";
import {
  TRIGGER_SUCCESS_RUNNER_MODULE_SHA256,
  buildTriggerSuccessRunnerIdentityReceiptRebuildV1,
} from "../../lib/action-661j5r9-trigger-success-runner-authority-rebuild-v1.mjs";
import { ACTION_661J5R9_TRIGGER_SUCCESS_LITERAL_FIXTURES } from "./action-661j5r9-trigger-success-literal-fixtures.mjs";

type ScenarioId =
  | "preexisting_proof_audit_trigger"
  | "successful_containment";

interface Domain {
  domain_digest: string;
  domain_id: string;
  domain_version: string;
  value: unknown[];
}

interface Snapshot {
  combined_digest: string;
  domains: Domain[];
  snapshot_contract: string;
  snapshot_schema_version: string;
  target_inventory: string[];
}

interface Diagnostic {
  classification: string;
  diagnostic_digest: string;
  diagnostic_sanitized: boolean;
  migration_applied: boolean;
  reason: string | null;
  safety: Record<string, boolean>;
  scenario_id: string;
  sidecar_version: string;
  sqlstate: string | null;
  terminal_state: string;
}

const root = process.cwd();
const sourceFile = join(
  root,
  "docs/recovery/action-661j5r8/runtime-evidence/rpc_catalog_body_drift-run-a/run-a.rpc-catalog-body-drift-a.rpc_catalog_body_drift.rpc-append-only-rebuild-v1.json",
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function domain(snapshot: Snapshot, domainId: string) {
  const found = snapshot.domains.find((entry) => entry.domain_id === domainId);
  if (!found) throw new Error(`test.domain_missing:${domainId}`);
  return found;
}

function resign(snapshot: Snapshot) {
  snapshot.domains = snapshot.domains.map((entry) => {
    const projection = {
      domain_id: entry.domain_id,
      domain_version: entry.domain_version,
      value: entry.value,
    };
    return { ...projection, domain_digest: sha256(projection) };
  });
  const projection = {
    snapshot_contract: snapshot.snapshot_contract,
    snapshot_schema_version: snapshot.snapshot_schema_version,
    target_inventory: snapshot.target_inventory,
    domains: snapshot.domains,
  };
  snapshot.combined_digest = sha256(projection);
  return snapshot;
}

function cleanPrestate() {
  const parsed = JSON.parse(readFileSync(sourceFile, "utf8"));
  const snapshot = structuredClone(
    parsed.record.evidence.prestate,
  ) as Snapshot;
  const rpc = domain(snapshot, "rpc_catalog");
  const selected = new Set(
    FROZEN_EIGHT_RPC_INVENTORY.map(
      (entry: { identity: string }) => entry.identity,
    ),
  );
  rpc.value = [
    ...rpc.value.filter(
      (entry) =>
        !isRecord(entry) ||
        typeof entry.identity !== "string" ||
        !selected.has(entry.identity),
    ),
    ...structuredClone(FROZEN_EIGHT_RPC_INVENTORY),
  ].sort((left, right) => {
    const leftIdentity = isRecord(left) ? String(left.identity) : "";
    const rightIdentity = isRecord(right) ? String(right.identity) : "";
    return leftIdentity.localeCompare(rightIdentity);
  });
  return {
    guarded_reads: structuredClone(parsed.record.evidence.guarded_reads),
    runtime_identity: structuredClone(parsed.record.evidence.runtime_identity),
    snapshot: resign(snapshot),
  };
}

function diagnostic(scenarioId: ScenarioId): Diagnostic {
  const policy = TRIGGER_SUCCESS_POLICY_REGISTRY.scenarios[scenarioId];
  const projection = {
    classification: policy.classification,
    diagnostic_sanitized: true,
    migration_applied: policy.migration_applied,
    reason: policy.terminal_reason,
    safety: {
      connection_string_present: false,
      credential_material_present: false,
      query_text_present: false,
      raw_error_object_present: false,
      stack_trace_present: false,
    },
    scenario_id: scenarioId,
    sidecar_version:
      "action_661j5r9_trigger_success_diagnostic_sidecar_rebuild_v1",
    sqlstate: policy.terminal_sqlstate,
    terminal_state: policy.terminal_state,
  };
  return { ...projection, diagnostic_digest: sha256(projection) };
}

function successPoststate(prestate: Snapshot) {
  const poststate = structuredClone(prestate);
  domain(poststate, "migration_history").value = [
    ...structuredClone(BASELINE_HISTORY_INVENTORY),
    structuredClone(SUCCESS_HISTORY_ENTRY),
  ];
  const rpc = domain(poststate, "rpc_catalog");
  const selected = new Set(
    SUCCESS_POST_RPC_INVENTORY.map(
      (entry: { identity: string }) => entry.identity,
    ),
  );
  rpc.value = [
    ...rpc.value.filter(
      (entry) =>
        !isRecord(entry) ||
        typeof entry.identity !== "string" ||
        !selected.has(entry.identity),
    ),
    ...structuredClone(SUCCESS_POST_RPC_INVENTORY),
  ].sort((left, right) => {
    const leftIdentity = isRecord(left) ? String(left.identity) : "";
    const rightIdentity = isRecord(right) ? String(right.identity) : "";
    return leftIdentity.localeCompare(rightIdentity);
  });
  domain(poststate, "table_acl").value = [
    ...domain(poststate, "table_acl").value,
    ...structuredClone(SUCCESS_TARGET_ACL),
  ].sort((left, right) => {
    if (!isRecord(left) || !isRecord(right)) return 0;
    const leftKey = [
      left.relation,
      left.grantee,
      left.grantor,
      left.privilege,
      left.grantable,
    ].join(":");
    const rightKey = [
      right.relation,
      right.grantee,
      right.grantor,
      right.privilege,
      right.grantable,
    ].join(":");
    return leftKey.localeCompare(rightKey);
  });
  domain(poststate, "trigger_catalog").value = [
    ...domain(poststate, "trigger_catalog").value,
    structuredClone(CONTAINMENT_TRIGGER),
  ].sort((left, right) => {
    if (!isRecord(left) || !isRecord(right)) return 0;
    return `${left.relation}:${left.name}`.localeCompare(
      `${right.relation}:${right.name}`,
    );
  });
  return resign(poststate);
}

function captureFor(scenarioId: ScenarioId) {
  const clean = cleanPrestate();
  const prestate = structuredClone(clean.snapshot);
  let poststate = structuredClone(prestate);
  if (scenarioId === "preexisting_proof_audit_trigger") {
    domain(prestate, "trigger_catalog").value.push(
      structuredClone(PREEXISTING_TRIGGER),
    );
    resign(prestate);
    poststate = structuredClone(prestate);
  } else {
    poststate = successPoststate(prestate);
  }
  const sidecar = diagnostic(scenarioId);
  const projection = {
    diagnostic_digest: sidecar.diagnostic_digest,
    guarded_reads: clean.guarded_reads,
    poststate_combined_digest: poststate.combined_digest,
    prestate_combined_digest: prestate.combined_digest,
    runtime_identity_digest: clean.runtime_identity.identity_digest,
  };
  return {
    diagnostic: sidecar,
    guarded_reads: clean.guarded_reads,
    poststate,
    prestate,
    runtime_capture_digest: sha256(projection),
    runtime_identity: clean.runtime_identity,
  };
}

function expectReason(operation: () => unknown, reason: string) {
  expect(operation).toThrow(new RegExp(`^${reason.replaceAll(".", "\\.")}`));
}

function refreshCapture(capture: ReturnType<typeof captureFor>) {
  resign(capture.poststate);
  capture.runtime_capture_digest = sha256({
    diagnostic_digest: capture.diagnostic.diagnostic_digest,
    guarded_reads: capture.guarded_reads,
    poststate_combined_digest: capture.poststate.combined_digest,
    prestate_combined_digest: capture.prestate.combined_digest,
    runtime_identity_digest: capture.runtime_identity.identity_digest,
  });
  return capture;
}

test("R9 literal policies are zero-import, closed and production-parity bound", () => {
  const source = readFileSync(
    join(root, "tests/e2e/action-661j5r9-trigger-success-literal-fixtures.mjs"),
    "utf8",
  );
  expect(source).not.toMatch(/\b(?:import|require)\b/);
  expect(Object.isFrozen(ACTION_661J5R9_TRIGGER_SUCCESS_LITERAL_FIXTURES)).toBe(
    true,
  );
  const literals = ACTION_661J5R9_TRIGGER_SUCCESS_LITERAL_FIXTURES.scenarios;
  for (const scenarioId of Object.keys(literals) as ScenarioId[]) {
    const policy = TRIGGER_SUCCESS_POLICY_REGISTRY.scenarios[scenarioId];
    expect(literals[scenarioId].classification).toBe(policy.classification);
    expect(literals[scenarioId].terminal_reason).toBe(policy.terminal_reason);
    expect(literals[scenarioId].terminal_sqlstate).toBe(
      policy.terminal_sqlstate,
    );
    expect(literals[scenarioId].atomicity_decision).toBe(
      policy.atomicity_decision,
    );
  }
  expect(TRIGGER_SUCCESS_POLICY_REGISTRY_DIGEST).toMatch(/^[0-9a-f]{64}$/);
  expect(buildTriggerSuccessPreconditionReference("successful_containment"))
    .toMatchObject({
      expected_post_history_entry: SUCCESS_HISTORY_ENTRY,
      terminal_reason: null,
    });
});

test("R9 failure and success carriers remain semantically distinct", () => {
  const failure = buildTriggerSuccessResultChainRebuildV1({
    capture: captureFor("preexisting_proof_audit_trigger"),
    run_id: "run-a",
    scenario_id: "preexisting_proof_audit_trigger",
    shard_id: "preexisting-proof-audit-trigger-a",
  });
  const success = buildTriggerSuccessResultChainRebuildV1({
    capture: captureFor("successful_containment"),
    run_id: "run-a",
    scenario_id: "successful_containment",
    shard_id: "successful-containment-a",
  });
  verifyTriggerSuccessFileRebuildV1(failure.file);
  verifyTriggerSuccessFileRebuildV1(success.file);
  expect(failure.evidence.atomicity_decision).toBe("no_transition_verified");
  expect(failure.evidence.migration_applied).toBe(false);
  expect(success.evidence.atomicity_decision).toBe(
    "closed_transition_verified",
  );
  expect(success.evidence.migration_applied).toBe(true);
  expect(success.evidence.terminal_state).toBe("completed");
  expect(success.evidence.evidence_digest).not.toBe(
    failure.evidence.evidence_digest,
  );
});

test("R9 reason-bound tampering rejects trigger, transition and carrier swaps", () => {
  const failureCapture = captureFor("preexisting_proof_audit_trigger");
  domain(failureCapture.prestate, "trigger_catalog").value = [];
  resign(failureCapture.prestate);
  failureCapture.poststate = structuredClone(failureCapture.prestate);
  const failureProjection = {
    diagnostic_digest: failureCapture.diagnostic.diagnostic_digest,
    guarded_reads: failureCapture.guarded_reads,
    poststate_combined_digest: failureCapture.poststate.combined_digest,
    prestate_combined_digest: failureCapture.prestate.combined_digest,
    runtime_identity_digest: failureCapture.runtime_identity.identity_digest,
  };
  failureCapture.runtime_capture_digest = sha256(failureProjection);
  expectReason(
    () =>
      buildTriggerSuccessResultChainRebuildV1({
        capture: failureCapture,
        run_id: "run-a",
        scenario_id: "preexisting_proof_audit_trigger",
        shard_id: "preexisting-proof-audit-trigger-a",
      }),
    "rebuild_v1.precondition_reference_mismatch",
  );

  const successCapture = captureFor("successful_containment");
  domain(successCapture.poststate, "target_data").value = [];
  resign(successCapture.poststate);
  successCapture.runtime_capture_digest = sha256({
    diagnostic_digest: successCapture.diagnostic.diagnostic_digest,
    guarded_reads: successCapture.guarded_reads,
    poststate_combined_digest: successCapture.poststate.combined_digest,
    prestate_combined_digest: successCapture.prestate.combined_digest,
    runtime_identity_digest: successCapture.runtime_identity.identity_digest,
  });
  expectReason(
    () =>
      buildTriggerSuccessResultChainRebuildV1({
        capture: successCapture,
        run_id: "run-a",
        scenario_id: "successful_containment",
        shard_id: "successful-containment-a",
      }),
    "rebuild_v1.snapshot_inventory_mismatch",
  );

  const valid = buildTriggerSuccessResultChainRebuildV1({
    capture: captureFor("successful_containment"),
    run_id: "run-a",
    scenario_id: "successful_containment",
    shard_id: "successful-containment-a",
  });
  const relabelled = structuredClone(valid.file);
  relabelled.record.evidence.atomicity_decision = "no_transition_verified";
  relabelled.record.evidence.evidence_digest = sha256(
    Object.fromEntries(
      Object.entries(relabelled.record.evidence).filter(
        ([field]) => field !== "evidence_digest",
      ),
    ),
  );
  expectReason(
    () => verifyTriggerSuccessFileRebuildV1(relabelled),
    "rebuild_v1.protocol_version_mismatch",
  );
});

test("R9 closed success transition rejects every undeclared drift class", () => {
  const cases: Array<{
    mutate: (capture: ReturnType<typeof captureFor>) => void;
    name: string;
  }> = [
    {
      name: "migration history",
      mutate: (capture) => {
        domain(capture.poststate, "migration_history").value.pop();
      },
    },
    {
      name: "RPC privilege",
      mutate: (capture) => {
        const entry = domain(capture.poststate, "rpc_catalog").value.find(
          (value) =>
            isRecord(value) &&
            value.identity === SUCCESS_POST_RPC_INVENTORY[0].identity,
        );
        if (!isRecord(entry) || !isRecord(entry.role_privileges)) {
          throw new Error("test.rpc_entry_missing");
        }
        entry.role_privileges.service_role_execute = false;
      },
    },
    {
      name: "table privilege",
      mutate: (capture) => {
        const acl = domain(capture.poststate, "table_acl").value;
        const index = acl.findIndex(
          (value) =>
            isRecord(value) &&
            value.relation === "public.historical_candles" &&
            value.grantee === "service_role" &&
            value.privilege === "UPDATE",
        );
        if (index === -1) throw new Error("test.target_acl_missing");
        acl.splice(index, 1);
      },
    },
    {
      name: "RLS policy",
      mutate: (capture) => {
        domain(capture.poststate, "rls_policies").value.push({
          command: "SELECT",
          name: "undeclared",
          permissive: true,
          relation: "public.historical_candles",
          roles: ["service_role"],
          using: "true",
          with_check: null,
        });
      },
    },
    {
      name: "application row",
      mutate: (capture) => {
        const target = domain(capture.poststate, "target_data").value.find(
          (value) =>
            isRecord(value) &&
            value.relation === "public.historical_candles",
        );
        if (!isRecord(target) || !Array.isArray(target.rows)) {
          throw new Error("test.target_rows_missing");
        }
        target.rows.push({ fixture_mutation: "detected" });
        target.data_digest = sha256(target.rows);
      },
    },
    {
      name: "schema relation",
      mutate: (capture) => {
        domain(capture.poststate, "schema_relations").value.push({
          namespace: "public",
          owner: "postgres",
          relation: "undeclared_relation",
          relkind: "r",
          rls_enabled: false,
        });
      },
    },
    {
      name: "trigger identity",
      mutate: (capture) => {
        const trigger = domain(capture.poststate, "trigger_catalog").value.find(
          (value) =>
            isRecord(value) &&
            value.name === CONTAINMENT_TRIGGER.name,
        );
        if (!isRecord(trigger)) throw new Error("test.trigger_missing");
        trigger.enabled = "D";
      },
    },
  ];
  for (const entry of cases) {
    const capture = captureFor("successful_containment");
    entry.mutate(capture);
    refreshCapture(capture);
    expectReason(
      () =>
        buildTriggerSuccessResultChainRebuildV1({
          capture,
          run_id: "run-a",
          scenario_id: "successful_containment",
          shard_id: "successful-containment-a",
        }),
      "rebuild_v1.atomic_transition_detected",
    );
  }
});

test("R9 runner identity binds exact module bytes", () => {
  const digest = createHash("sha256")
    .update(
      readFileSync(
        join(root, "lib/action-661j5r9-trigger-success-runtime-runner-rebuild-v1.mjs"),
      ),
    )
    .digest("hex");
  expect(digest).toBe(TRIGGER_SUCCESS_RUNNER_MODULE_SHA256);
  expect(buildTriggerSuccessRunnerIdentityReceiptRebuildV1())
    .toMatchObject({
      runner_module_sha256: digest,
      no_external_access: true,
      no_production_access: true,
    });
  expect(APPEND_ONLY_BASELINE.identity).toBe(
    "action_650_reject_execution_audit_mutation()",
  );
});
