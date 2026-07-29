import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  rebuildAction651cAuditEvidenceDigest,
  rebuildAction651cFailureEvidenceDigest,
  rebuildAction651cFailureLineageDigest,
  rebuildAction651cSnapshotDigest,
  runAction651cExecutionQualityAuditV2,
  verifyAction651cDiagnosticAuditResult,
  type Action651cDiagnosticAuditInput,
  type Action651cDiagnosticAuditResult,
} from "../../lib/action-651c-execution-quality-audit-v2";
import {
  action651cGoldenMatrixCases,
  buildAction651cFixtureScenario,
} from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";

const root = resolve(__dirname, "../..");
const normativePaths = [
  "docs/action-651c-execution-quality-audit-v2-golden-report.json",
  "docs/action-651c-execution-quality-audit-v2.md",
  "lib/action-651c-execution-quality-audit-v2.ts",
  "tests/e2e/action-651c-execution-quality-audit-v2.spec.ts",
  "tests/fixtures/action-651c-execution-quality-audit-v2-fixtures.ts",
] as const;

function rawSha256(path: string) {
  return createHash("sha256")
    .update(readFileSync(resolve(root, path)))
    .digest("hex");
}

function combinedDigest() {
  const lines = normativePaths
    .map((path) => `${rawSha256(path)}  ${path}`)
    .sort();
  return createHash("sha256")
    .update(`${lines.join("\n")}\n`)
    .digest("hex");
}

test("Action 651C independent re-review rebuilds exact V2 refreeze", () => {
  const manifest = JSON.parse(
    readFileSync(
      resolve(
        root,
        "docs/action-651c-execution-quality-audit-v2-refreeze-manifest.json",
      ),
      "utf8",
    ),
  );
  expect(combinedDigest()).toBe(
    "0849c5426999496bab2e4689f946f97d074928626b09f2a1dc6cdcbf4641c5dd",
  );
  expect(manifest.combined_normative_digest).toBe(combinedDigest());
  for (const entry of manifest.normative_paths) {
    expect(rawSha256(entry.path)).toBe(entry.sha256);
  }
});

test("Action 651C independent re-review preserves every 651A and 651B byte", () => {
  const expected = {
    "docs/action-651a-diagnostic-execution-quality-audit.md":
      "900f5c6abe59d2bec2e928ec5288d6ff38b14e849432440cf31f5d1d0352781e",
    "docs/action-651a-diagnostic-execution-quality-golden-report.json":
      "9458f3037e90485fa17a57780f99502d62018703742fc4e52f734d29fdf308ee",
    "docs/action-651b-diagnostic-execution-quality-freeze-manifest.json":
      "f6b55b894f6bda9ddc495b6006d8872c2cf82439d886c36eca5d6d4f6efef630",
    "docs/action-651b-diagnostic-execution-quality-independent-review.md":
      "7dd57ad06558443025e615f2b15e03134535f5b954b0a988d451b11bae65e4ec",
    "lib/action-651a-diagnostic-execution-quality-audit.ts":
      "b47e8da49505780ebfe7c175618ffbcde46b72c63cd4187dcb4dd52cd9f20a22",
    "tests/e2e/action-651a-diagnostic-execution-quality-audit.spec.ts":
      "4533dcf66543f9f656826cfbceaa0e459aeb079b373f7040d444151c3006a7aa",
    "tests/e2e/action-651b-diagnostic-execution-quality-independent-review.spec.ts":
      "5b265d9fedf35127b2a5a3e8cab4d21095dd3ab111ba02e6d6a757c8f730c43d",
    "tests/fixtures/action-651a-diagnostic-execution-quality-fixtures.ts":
      "b013ff5912fb22ad22f8ffbbf2c6e3fdcf0c39643d3dd768335f7d1a857a69f2",
  };
  for (const [path, digest] of Object.entries(expected)) {
    expect(rawSha256(path)).toBe(digest);
  }
});

test("Action 651C independent re-review proves failure collision closure", () => {
  const first = runAction651cExecutionQualityAuditV2({
    ...buildAction651cFixtureScenario("utc_a", {
      execution_identity: "action-651c-collision-one",
    }).input,
    capability: null,
  });
  const second = runAction651cExecutionQualityAuditV2({
    ...buildAction651cFixtureScenario("utc_a", {
      execution_identity: "action-651c-collision-two",
    }).input,
    capability: null,
  });
  expect(first.failure_provenance?.failure_lineage.execution_identity).not.toBe(
    second.failure_provenance?.failure_lineage.execution_identity,
  );
  expect(first.failure_provenance?.evidence_digest).not.toBe(
    second.failure_provenance?.evidence_digest,
  );
  expect(first.failure_provenance?.evidence_digest).toBe(
    rebuildAction651cFailureEvidenceDigest(first.failure_provenance!),
  );
  expect(second.failure_provenance?.evidence_digest).toBe(
    rebuildAction651cFailureEvidenceDigest(second.failure_provenance!),
  );
});

test("Action 651C independent re-review proves accessor rejection has zero reads", () => {
  const scenario = buildAction651cFixtureScenario();
  let reads = 0;
  const result = runAction651cExecutionQualityAuditV2({
    ...scenario.input,
    confirmed_price: {
      source: "synthetic_manual_confirmation_fixture",
      get price_micros() {
        reads += 1;
        return reads === 1 ? "179250000" : "999999999";
      },
      observed_at: scenario.predecessor.capability.confirmed_at,
    },
  });
  expect(reads).toBe(0);
  expect(result).toMatchObject({
    audit_status: "unmappable",
    snapshot_evidence: {
      status: "rejected",
      failure_reason: "accessor_rejected",
    },
  });
  expect(
    result.failure_provenance?.failure_lineage.execution_identity,
  ).toBe(
    scenario.predecessor.prepared.runtime_identity_context.execution_identity,
  );
});

test("Action 651C independent re-review rebuilds every V2 identity", () => {
  const result = runAction651cExecutionQualityAuditV2(
    buildAction651cFixtureScenario().input,
  );
  if (!result.snapshot_evidence || !result.failure_provenance) {
    throw new Error("Expected complete V2 evidence.");
  }
  expect(rebuildAction651cSnapshotDigest(result.snapshot_evidence)).toBe(
    result.snapshot_evidence.snapshot_digest,
  );
  expect(
    rebuildAction651cFailureLineageDigest(
      result.failure_provenance.failure_lineage,
    ),
  ).toBe(result.failure_provenance.failure_lineage.lineage_digest);
  expect(rebuildAction651cFailureEvidenceDigest(result.failure_provenance)).toBe(
    result.failure_provenance.evidence_digest,
  );
  expect(rebuildAction651cAuditEvidenceDigest(result)).toBe(
    result.audit_evidence_digest,
  );
  expect(verifyAction651cDiagnosticAuditResult(result)).toBe(true);
});

test("Action 651C independent re-review rejects self-consistent cloned evidence", () => {
  const original = runAction651cExecutionQualityAuditV2({
    ...buildAction651cFixtureScenario().input,
    capability: null,
  });
  const failure = original.failure_provenance!;
  const changedLineage = {
    ...failure.failure_lineage,
    session_identity: "action-651c-substituted-session",
  };
  const lineage = {
    ...changedLineage,
    lineage_digest: rebuildAction651cFailureLineageDigest(changedLineage),
  };
  const changedFailure = { ...failure, failure_lineage: lineage };
  const recomputedFailure = {
    ...changedFailure,
    evidence_digest: rebuildAction651cFailureEvidenceDigest(changedFailure),
  };
  const changedResult = {
    ...original,
    failure_provenance: recomputedFailure,
  };
  const recomputed = {
    ...changedResult,
    audit_evidence_digest: rebuildAction651cAuditEvidenceDigest(changedResult),
  } as Action651cDiagnosticAuditResult;
  expect(verifyAction651cDiagnosticAuditResult(recomputed)).toBe(false);
});

test("Action 651C independent re-review closes proxy, cycle and budget failures", () => {
  const proxyScenario = buildAction651cFixtureScenario();
  const proxy = runAction651cExecutionQualityAuditV2({
    ...proxyScenario.input,
    confirmed_price: new Proxy(proxyScenario.input.confirmed_price, {}),
  });
  expect(proxy.snapshot_evidence?.failure_reason).toBe("proxy_rejected");

  const cycleScenario = buildAction651cFixtureScenario();
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  const cyclic = runAction651cExecutionQualityAuditV2({
    ...cycleScenario.input,
    synthetic_fill: cycle as never,
  });
  expect(cyclic.snapshot_evidence?.failure_reason).toBe("cycle_rejected");

  const budgetScenario = buildAction651cFixtureScenario();
  const oversized: Record<string, unknown> = {
    source: "synthetic_replay_fixture",
    price_micros: "179100000",
  };
  for (let index = 0; index < 2_100; index += 1) {
    oversized[`entry_${index}`] = index;
  }
  const budget = runAction651cExecutionQualityAuditV2({
    ...budgetScenario.input,
    synthetic_fill: oversized as never,
  });
  expect(budget.snapshot_evidence?.failure_reason).toBe(
    "snapshot_budget_exceeded",
  );

  for (const result of [proxy, cyclic, budget]) {
    expect(result.snapshot_evidence?.status).toBe("rejected");
    expect(
      result.snapshot_evidence?.observed_input_digests
        .rejection_witness_digest,
    ).toMatch(/^action_651c_snapshot_rejection_/);
    expect(verifyAction651cDiagnosticAuditResult(result)).toBe(true);
  }
});

test("Action 651C independent re-review proves snapshot mutation isolation", () => {
  const scenario = buildAction651cFixtureScenario();
  const observation = {
    source: "synthetic_manual_confirmation_fixture" as const,
    price_micros: "179250000",
    observed_at: scenario.predecessor.capability.confirmed_at,
  };
  const result = runAction651cExecutionQualityAuditV2({
    ...scenario.input,
    confirmed_price: observation,
  });
  observation.price_micros = "1";
  expect(result.confirmed_price_projection?.price_micros).toBe("179250000");
  expect(Object.isFrozen(result.snapshot_evidence)).toBe(true);
  expect(Object.isFrozen(result.failure_provenance?.failure_lineage)).toBe(true);
  expect(verifyAction651cDiagnosticAuditResult(result)).toBe(true);
});

test("Action 651C independent re-review preserves deterministic golden matrix", () => {
  const results = action651cGoldenMatrixCases.map((entry) =>
    runAction651cExecutionQualityAuditV2(
      buildAction651cFixtureScenario(entry.clock, {
        reverse_input_order: entry.reverse_input_order,
      }).input,
    ),
  );
  expect(new Set(results.map((result) => result.audit_evidence_digest))).toEqual(
    new Set([
      "action_651c_audit_a04bb12e1055df7650e3ff2f505d491d3b22d2e6bd19ed195ee199971a16a929",
    ]),
  );
});

test("Action 651C independent re-review preserves zero-work and closed effects", () => {
  const reads: PropertyKey[] = [];
  const disabled = runAction651cExecutionQualityAuditV2(
    new Proxy(
      { enabled: false },
      {
        get(target, property, receiver) {
          reads.push(property);
          if (property !== "enabled") throw new Error("unexpected read");
          return Reflect.get(target, property, receiver);
        },
      },
    ) as unknown as Action651cDiagnosticAuditInput,
  );
  expect(reads).toEqual(["enabled"]);
  expect(disabled.audit_evidence_digest).toBeNull();
  expect(disabled.effects).toEqual({
    audit_records_persisted: 0,
    provider_calls: 0,
    database_writes: 0,
    order_mutations: 0,
    trade_mutations: 0,
    position_mutations: 0,
    process_spawns: 0,
  });
});
