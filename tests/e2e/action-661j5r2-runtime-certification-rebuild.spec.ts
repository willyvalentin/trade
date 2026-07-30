import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import {
  ATOMIC_POLICY_REGISTRY,
  DOMAIN_IDS,
  REASON_CODES,
  RUNTIME_SCENARIO_REGISTRY,
  buildDiagnosticSidecar,
  buildSnapshotV2Rebuild,
  canonicalJson,
  sha256,
  verifySnapshotV2Rebuild,
} from "../../lib/action-661j5r2-runtime-contracts-rebuild-v1.mjs";
import {
  buildMixedAbAggregateRebuildV1,
  persistMixedAbAggregateRebuildV1,
  verifyMixedAbAggregateRebuildV1,
} from "../../lib/action-661j5r2-mixed-ab-aggregate-rebuild-v1.mjs";
import {
  buildAtomicEvidenceRebuildV1,
  buildRuntimeResultChainRebuildV1,
  parsePersistedFileRebuildV1,
  persistRuntimeResultFileRebuildV1,
  verifyAtomicEvidenceRebuildV1,
  verifyPersistedFileRebuildV1,
  verifyResultRecordRebuildV1,
  verifyShardEnvelopeRebuildV1,
} from "../../lib/action-661j5r2-runtime-result-protocol-rebuild-v1.mjs";
import {
  buildRunnerIdentityReceiptRebuildV1,
  verifyRunnerIdentityReceiptRebuildV1,
} from "../../lib/action-661j5r2-runtime-runner-authority-rebuild-v1.mjs";
import { runRuntimeScenarioRebuildV1 } from "../../lib/action-661j5r2-runtime-runner-rebuild-v1.mjs";
import {
  EXPECTED_REBUILD_V1_GOLDENS,
  buildIndependentGoldenFoundation,
  canonicalJsonOracle,
} from "./action-661j5r2-runtime-golden-oracle.mjs";
import { ACTION_661J5R2_LITERAL_FIXTURE } from "./action-661j5r2-runtime-literal-fixture.mjs";

type RelationState =
  | "present_table"
  | "missing"
  | "non_table"
  | "wrong_owner";

interface GuardedRead {
  oid: number;
  relation: string;
  rows: object[];
}

interface MetadataEntry {
  observed: { oid: number; owner: string; relkind: string } | null;
  relation: string;
  relation_state: RelationState;
}

interface RunIdentity {
  run_id: string;
  shard_id: string;
}

interface TargetSnapshot {
  data_status: string;
  relation: string;
  rows: object[] | null;
}

interface SnapshotDomain {
  domain_digest: string;
  domain_id: string;
  domain_version: string;
  value: TargetSnapshot[] | unknown;
}

interface OracleChain {
  evidence: { evidence_digest: string };
  file: { canonical_file_digest: string };
  record: { record_digest: string; run_id: string; scenario_id: string };
  shard: { shard_digest: string };
}

interface RebuildManifest {
  artifacts: Array<{ path: string; sha256: string }>;
  base_commit: string;
  fixture_progress: string;
  historical_recovery: {
    lost_bytes_claimed_recovered: boolean;
    recovered_authority_classification: string;
  };
  manifest_version: string;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function captureFor(scenarioId: "forbidden_history" | "missing_target") {
  const scenario = ACTION_661J5R2_LITERAL_FIXTURE.scenarios[scenarioId];
  const input =
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases[scenario.snapshot_case];
  const snapshot = buildSnapshotV2Rebuild(input);
  const diagnostic = buildDiagnosticSidecar(scenario.diagnostic);
  const guardedReads = clone(input.guarded_data_reads).sort((left: GuardedRead, right: GuardedRead) =>
    left.relation.localeCompare(right.relation),
  );
  return Object.freeze({
    diagnostic,
    guarded_reads: guardedReads,
    poststate: snapshot,
    prestate: snapshot,
    runtime_capture_digest: sha256({
      diagnostic_digest: diagnostic.diagnostic_digest,
      guarded_reads: guardedReads,
      poststate_combined_digest: snapshot.combined_digest,
      prestate_combined_digest: snapshot.combined_digest,
      runtime_identity_digest:
        ACTION_661J5R2_LITERAL_FIXTURE.runtime_identity.identity_digest,
    }),
    runtime_identity: ACTION_661J5R2_LITERAL_FIXTURE.runtime_identity,
  });
}

function productionChains() {
  return (
    ["forbidden_history", "missing_target"] as const
  ).flatMap((scenarioId) =>
    ACTION_661J5R2_LITERAL_FIXTURE.scenarios[scenarioId].runs.map((run: RunIdentity) =>
      buildRuntimeResultChainRebuildV1({
        capture: captureFor(scenarioId),
        run_id: run.run_id,
        scenario_id: scenarioId,
        shard_id: run.shard_id,
      }),
    ),
  );
}

function expectReason(action: () => unknown, reason: string) {
  expect(action).toThrow(new RegExp(`^${reason.replaceAll(".", "\\.")}`));
}

test("literal fixture is zero-import, immutable, and covers every relation state", () => {
  const source = readFileSync(
    join(
      process.cwd(),
      "tests/e2e/action-661j5r2-runtime-literal-fixture.mjs",
    ),
    "utf8",
  );
  expect(source).not.toMatch(/\b(?:import|require)\s*(?:\(|\{|\w|["'])/);
  expect(Object.isFrozen(ACTION_661J5R2_LITERAL_FIXTURE)).toBe(true);
  expect(Object.isFrozen(ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases)).toBe(
    true,
  );
  const states =
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.mixed_relation_states
      .metadata_discovery;
  expect(new Set(states.map((entry: MetadataEntry) => entry.relation_state))).toEqual(
    new Set(["present_table", "missing", "non_table", "wrong_owner"]),
  );
  const snapshot = buildSnapshotV2Rebuild(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  const targetDomain = snapshot.domains.find(
    (domain: SnapshotDomain) => domain.domain_id === "target_data",
  );
  const captured = targetDomain?.value.filter(
    (target: TargetSnapshot) => target.data_status === "captured",
  );
  expect(captured?.some((target: TargetSnapshot) => target.rows?.length === 0)).toBe(true);
  expect(captured?.some((target: TargetSnapshot) => target.rows?.length === 2)).toBe(true);
});

test("independent oracle and production match at evidence, record, shard, file, and aggregate", () => {
  const oracle = buildIndependentGoldenFoundation();
  const production = productionChains();
  expect(canonicalJson(production)).toBe(canonicalJsonOracle(oracle.chains));
  const aggregate = buildMixedAbAggregateRebuildV1(
    production.map((chain) => chain.file),
  );
  expect(canonicalJson(aggregate)).toBe(canonicalJsonOracle(oracle.aggregate));

  const forbidden = oracle.chains.filter(
    (chain: OracleChain) => chain.record.scenario_id === "forbidden_history",
  );
  const missing = oracle.chains.filter(
    (chain: OracleChain) => chain.record.scenario_id === "missing_target",
  );
  expect(forbidden[0].evidence.evidence_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.forbidden_history.evidence,
  );
  expect(forbidden[0].record.record_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.forbidden_history.run_a_record,
  );
  expect(forbidden[0].shard.shard_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.forbidden_history.run_a_shard,
  );
  expect(forbidden[0].file.canonical_file_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.forbidden_history.run_a_file,
  );
  expect(forbidden[1].record.record_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.forbidden_history.run_b_record,
  );
  expect(forbidden[1].shard.shard_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.forbidden_history.run_b_shard,
  );
  expect(forbidden[1].file.canonical_file_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.forbidden_history.run_b_file,
  );
  expect(missing[0].evidence.evidence_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.missing_target.evidence,
  );
  expect(missing[0].record.record_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.missing_target.run_a_record,
  );
  expect(missing[0].shard.shard_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.missing_target.run_a_shard,
  );
  expect(missing[0].file.canonical_file_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.missing_target.run_a_file,
  );
  expect(missing[1].record.record_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.missing_target.run_b_record,
  );
  expect(missing[1].shard.shard_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.missing_target.run_b_shard,
  );
  expect(missing[1].file.canonical_file_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.missing_target.run_b_file,
  );
  expect(aggregate.aggregate_digest).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.aggregate,
  );
});

test("snapshot execution is metadata-first, deterministic, and fail-closed", () => {
  const mixed =
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.mixed_relation_states;
  const first = buildSnapshotV2Rebuild(mixed);
  const reordered = buildSnapshotV2Rebuild({
    domains: Object.fromEntries(Object.entries(mixed.domains).reverse()),
    guarded_data_reads: [...mixed.guarded_data_reads].reverse(),
    metadata_discovery: [...mixed.metadata_discovery].reverse(),
  });
  expect(canonicalJson(first)).toBe(canonicalJson(reordered));
  expect(first.domains).toHaveLength(9);
  expect(first.domains.map((domain: SnapshotDomain) => domain.domain_id)).toEqual(DOMAIN_IDS);

  const invalidRead = clone(mixed);
  invalidRead.guarded_data_reads.push({
    oid: 41002,
    relation: "public.historical_candle_fetch_runs",
    rows: [],
  });
  expectReason(
    () => buildSnapshotV2Rebuild(invalidRead),
    REASON_CODES.guarded_read,
  );
  const missingRead = clone(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  missingRead.guarded_data_reads.pop();
  expectReason(
    () => buildSnapshotV2Rebuild(missingRead),
    REASON_CODES.guarded_read,
  );
  const badDomains = clone(mixed);
  delete badDomains.domains.trigger_catalog;
  expectReason(
    () => buildSnapshotV2Rebuild(badDomains),
    REASON_CODES.snapshot_inventory,
  );
  const tampered = clone(first);
  tampered.domains[0].domain_digest = "0".repeat(64);
  expectReason(
    () => verifySnapshotV2Rebuild(tampered),
    REASON_CODES.domain_digest,
  );
});

test("reason-bound tampering rejects authority, evidence, record, shard, file, and aggregate drift", () => {
  const chains = productionChains();
  const base = chains[0];

  const policyDrift = clone(base.evidence);
  policyDrift.policy_registry.scenarios.forbidden_history.terminal_reason =
    "substituted";
  policyDrift.policy_registry_digest = sha256(policyDrift.policy_registry);
  policyDrift.evidence_digest = sha256(
    Object.fromEntries(
      Object.entries(policyDrift).filter(([key]) => key !== "evidence_digest"),
    ),
  );
  expectReason(
    () => verifyAtomicEvidenceRebuildV1(policyDrift),
    REASON_CODES.policy,
  );

  const evidenceDigest = clone(base.evidence);
  evidenceDigest.evidence_digest = "0".repeat(64);
  expectReason(
    () => verifyAtomicEvidenceRebuildV1(evidenceDigest),
    REASON_CODES.evidence_digest,
  );

  const runtimeDrift = clone(base.evidence);
  runtimeDrift.runtime_identity.image_tag = "latest";
  expectReason(
    () => verifyAtomicEvidenceRebuildV1(runtimeDrift),
    REASON_CODES.runtime_identity,
  );

  const runnerDrift = clone(base.evidence);
  runnerDrift.runner_identity.runner_module_sha256 = "0".repeat(64);
  expectReason(
    () => verifyAtomicEvidenceRebuildV1(runnerDrift),
    REASON_CODES.runner_identity,
  );

  const recordDrift = clone(base.record);
  recordDrift.run_id = "run-z";
  expectReason(
    () => verifyResultRecordRebuildV1(recordDrift),
    REASON_CODES.record_digest,
  );

  const shardDrift = clone(base.shard);
  shardDrift.declared_inventory = ["missing_target"];
  expectReason(
    () => verifyShardEnvelopeRebuildV1(shardDrift, base.record),
    REASON_CODES.shard_inventory,
  );

  const fileDrift = clone(base.file);
  fileDrift.file_identity = "other.json";
  expectReason(
    () => verifyPersistedFileRebuildV1(fileDrift),
    REASON_CODES.file_identity,
  );

  const aggregate = buildMixedAbAggregateRebuildV1(
    chains.map((chain) => chain.file),
  );
  expectReason(
    () =>
      verifyMixedAbAggregateRebuildV1(aggregate, [
        ...chains.slice(0, 3).map((chain) => chain.file),
      ]),
    REASON_CODES.aggregate_inventory,
  );
  const aggregateDrift = clone(aggregate);
  aggregateDrift.aggregate_digest = "0".repeat(64);
  expectReason(
    () =>
      verifyMixedAbAggregateRebuildV1(
        aggregateDrift,
        chains.map((chain) => chain.file),
      ),
    REASON_CODES.aggregate_digest,
  );

  expectReason(
    () => canonicalJson({ unsupported: Number.NaN }),
    REASON_CODES.canonical_value,
  );
  expectReason(
    () => canonicalJson({ unsupported: new Date(0) }),
    REASON_CODES.canonical_value,
  );
  expect(ATOMIC_POLICY_REGISTRY.registry_version).toBe(
    "action_661j5r2_atomic_policy_registry_rebuild_v1",
  );
  expect(RUNTIME_SCENARIO_REGISTRY.predecessor.lost_bytes_claimed_recovered).toBe(
    false,
  );
});

test("closed reason taxonomy covers snapshot, terminal, authority, and cross-layer substitutions", () => {
  const chains = productionChains();
  const forbidden = chains[0];
  const missing = chains[2];

  const unknownTarget = clone(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  unknownTarget.metadata_discovery[0].relation = "public.unknown_target";
  expectReason(
    () => buildSnapshotV2Rebuild(unknownTarget),
    REASON_CODES.snapshot_inventory,
  );

  const duplicateTarget = clone(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  duplicateTarget.metadata_discovery[1].relation =
    duplicateTarget.metadata_discovery[0].relation;
  expectReason(
    () => buildSnapshotV2Rebuild(duplicateTarget),
    REASON_CODES.snapshot_inventory,
  );

  const oidDrift = clone(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  oidDrift.guarded_data_reads[0].oid += 1;
  expectReason(
    () => buildSnapshotV2Rebuild(oidDrift),
    REASON_CODES.guarded_read,
  );

  const ownerDrift = clone(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  ownerDrift.metadata_discovery[0].observed.owner = "other_owner";
  expectReason(
    () => buildSnapshotV2Rebuild(ownerDrift),
    REASON_CODES.relation_state,
  );

  const missingAsEmpty = clone(missing.evidence.prestate);
  const targetDomain = missingAsEmpty.domains.find(
    (domain: SnapshotDomain) => domain.domain_id === "target_data",
  );
  const missingTarget = targetDomain.value.find(
    (target: TargetSnapshot) => target.relation === "public.historical_candles",
  );
  missingTarget.rows = [];
  missingTarget.data_status = "captured";
  missingTarget.reason = null;
  missingTarget.data_digest = sha256([]);
  targetDomain.domain_digest = sha256({
    domain_id: targetDomain.domain_id,
    domain_version: targetDomain.domain_version,
    value: targetDomain.value,
  });
  expectReason(
    () => verifySnapshotV2Rebuild(missingAsEmpty),
    REASON_CODES.relation_state,
  );

  const diagnosticReason = clone(missing.evidence);
  diagnosticReason.diagnostic.reason = "relation substituted";
  expectReason(
    () => verifyAtomicEvidenceRebuildV1(diagnosticReason),
    REASON_CODES.diagnostic,
  );

  const protocolDrift = clone(missing.evidence);
  protocolDrift.protocol_version = "legacy";
  expectReason(
    () => verifyAtomicEvidenceRebuildV1(protocolDrift),
    REASON_CODES.protocol,
  );

  const referenceDrift = clone(missing.evidence);
  referenceDrift.precondition_reference.target_relation = "public.other";
  expectReason(
    () => verifyAtomicEvidenceRebuildV1(referenceDrift),
    REASON_CODES.precondition_reference,
  );

  const registryDrift = clone(missing.evidence);
  registryDrift.runtime_registry.scenarios.missing_target.status = "pending";
  registryDrift.runtime_registry_digest = sha256(registryDrift.runtime_registry);
  expectReason(
    () => verifyAtomicEvidenceRebuildV1(registryDrift),
    REASON_CODES.runtime_registry,
  );

  const postInput = clone(
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases.present_rows_and_empty,
  );
  postInput.domains.migration_history.push({
    name: "unexpected",
    version: "20260726000000",
  });
  const poststate = buildSnapshotV2Rebuild(postInput);
  const transitionCapture = {
    ...captureFor("forbidden_history"),
    poststate,
  };
  transitionCapture.runtime_capture_digest = sha256({
    diagnostic_digest: transitionCapture.diagnostic.diagnostic_digest,
    guarded_reads: transitionCapture.guarded_reads,
    poststate_combined_digest: poststate.combined_digest,
    prestate_combined_digest: transitionCapture.prestate.combined_digest,
    runtime_identity_digest:
      transitionCapture.runtime_identity.identity_digest,
  });
  expectReason(
    () =>
      buildAtomicEvidenceRebuildV1({
        capture: transitionCapture,
        scenario_id: "forbidden_history",
      }),
    REASON_CODES.atomicity,
  );

  const crossScenarioRecord = clone(forbidden.record);
  crossScenarioRecord.scenario_id = "missing_target";
  expectReason(
    () => verifyResultRecordRebuildV1(crossScenarioRecord),
    REASON_CODES.record_digest,
  );

  const duplicateShard = clone(forbidden.shard);
  duplicateShard.result_inventory.push(
    clone(duplicateShard.result_inventory[0]),
  );
  duplicateShard.shard_digest = sha256(
    Object.fromEntries(
      Object.entries(duplicateShard).filter(([key]) => key !== "shard_digest"),
    ),
  );
  expectReason(
    () => verifyShardEnvelopeRebuildV1(duplicateShard, forbidden.record),
    REASON_CODES.shard_inventory,
  );

  const unknownEvidenceField = clone(forbidden.evidence);
  unknownEvidenceField.runtime_only_path = "/tmp/not-signed";
  expectReason(
    () => verifyAtomicEvidenceRebuildV1(unknownEvidenceField),
    REASON_CODES.closed_shape,
  );
});

test("persistence is canonical, idempotent, collision-safe, and independently read back", () => {
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r2-"));
  try {
    const chains = productionChains();
    for (const chain of chains) {
      const path = join(directory, chain.file.file_identity);
      expect(
        persistRuntimeResultFileRebuildV1({
          file: chain.file,
          output_path: path,
        }).disposition,
      ).toBe("written");
      expect(
        persistRuntimeResultFileRebuildV1({
          file: chain.file,
          output_path: path,
        }).disposition,
      ).toBe("existing_identical");
      const bytes = readFileSync(path, "utf8");
      expect(parsePersistedFileRebuildV1(bytes)).toEqual(chain.file);
      writeFileSync(path, `${bytes.trim()} `);
      expectReason(
        () =>
          persistRuntimeResultFileRebuildV1({
            file: chain.file,
            output_path: path,
          }),
        REASON_CODES.persistence_collision,
      );
      writeFileSync(path, bytes);
    }
    const files = chains.map((chain) => chain.file);
    const aggregate = buildMixedAbAggregateRebuildV1(files);
    const aggregatePath = join(
      directory,
      "action-661j5r2-mixed-ab-aggregate.rebuild-v1.json",
    );
    expect(
      persistMixedAbAggregateRebuildV1({
        aggregate,
        files,
        output_path: aggregatePath,
      }).disposition,
    ).toBe("written");
    expect(
      persistMixedAbAggregateRebuildV1({
        aggregate,
        files,
        output_path: aggregatePath,
      }).disposition,
    ).toBe("existing_identical");
    expectReason(
      () => parsePersistedFileRebuildV1("{}\n"),
      REASON_CODES.closed_shape,
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("runner is registry-driven and persists diagnostics before policy verification", async () => {
  const directory = mkdtempSync(join(tmpdir(), "action-661j5r2-runner-"));
  try {
    const events: string[] = [];
    const run = ACTION_661J5R2_LITERAL_FIXTURE.scenarios.missing_target.runs[0];
    const fileIdentity = `${run.run_id}.${run.shard_id}.missing_target.rebuild-v1.json`;
    const result = await runRuntimeScenarioRebuildV1({
      output_path: join(directory, fileIdentity),
      persist_diagnostic: async () => {
        events.push("diagnostic");
      },
      run_id: run.run_id,
      runtime_attempt: async () => {
        events.push("attempt");
        return captureFor("missing_target");
      },
      scenario_id: "missing_target",
      shard_id: run.shard_id,
    });
    expect(events).toEqual(["attempt", "diagnostic"]);
    expect(result.file.file_identity).toBe(fileIdentity);

    await expect(
      runRuntimeScenarioRebuildV1({
        output_path: join(directory, fileIdentity),
        persist_diagnostic: async () => undefined,
        protocol_version: "caller-selected",
        run_id: run.run_id,
        runtime_attempt: async () => captureFor("missing_target"),
        scenario_id: "missing_target",
        shard_id: run.shard_id,
      }),
    ).rejects.toThrow("rebuild_v1.runner_input_invalid");
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("oracle is stable across UTC and non-UTC subprocesses", () => {
  const oracleUrl = pathToFileURL(
    join(
      process.cwd(),
      "tests/e2e/action-661j5r2-runtime-golden-oracle.mjs",
    ),
  ).href;
  const program = [
    `import { buildIndependentGoldenFoundation } from ${JSON.stringify(oracleUrl)};`,
    "const value=buildIndependentGoldenFoundation();",
    "process.stdout.write(JSON.stringify({",
    "aggregate:value.aggregate.aggregate_digest,",
    "files:value.chains.map((chain)=>chain.file.canonical_file_digest)",
    "}));",
  ].join("");
  const outputs = ["UTC", "UTC", "Europe/Stockholm", "America/New_York"].map(
    (timezone) =>
      execFileSync(process.execPath, ["--input-type=module", "-e", program], {
        encoding: "utf8",
        env: {
          HOME: process.cwd(),
          LANG: "C",
          NODE_ENV: "test",
          PATH: process.env.PATH ?? "/usr/bin:/bin",
          TZ: timezone,
        },
      }),
  );
  expect(new Set(outputs).size).toBe(1);
  expect(JSON.parse(outputs[0]).aggregate).toBe(
    EXPECTED_REBUILD_V1_GOLDENS.aggregate,
  );
});

test("runner identity receipt independently pins exact runner bytes", () => {
  const receipt = buildRunnerIdentityReceiptRebuildV1();
  expect(verifyRunnerIdentityReceiptRebuildV1(receipt)).toBe(receipt);
  expect(receipt.runner_module_sha256).toBe(
    "86a9d80db6ae5999e3ba04fee3b8aed9b245f9ede9b391c3144eb51443b1a472",
  );
  const tampered = clone(receipt);
  tampered.capability_matrix.missing_target = "substituted";
  expectReason(
    () => verifyRunnerIdentityReceiptRebuildV1(tampered),
    REASON_CODES.runner_identity,
  );
});

test("durable rebuild manifest pins every new artifact and the recovery boundary", () => {
  const manifestPath = join(
    process.cwd(),
    "docs/recovery/action-661j5r2/rebuild-manifest.json",
  );
  const manifest = JSON.parse(
    readFileSync(manifestPath, "utf8"),
  ) as RebuildManifest;
  expect(manifest.manifest_version).toBe(
    "action_661j5r2_runtime_certification_rebuild_manifest_v1",
  );
  expect(manifest.base_commit).toBe(
    "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33",
  );
  expect(manifest.fixture_progress).toBe("14/28");
  expect(manifest.historical_recovery.lost_bytes_claimed_recovered).toBe(false);
  expect(
    manifest.historical_recovery.recovered_authority_classification,
  ).toBe("historical_recovered_reference");
  for (const artifact of manifest.artifacts) {
    const actual = createHash("sha256")
      .update(readFileSync(join(process.cwd(), artifact.path)))
      .digest("hex");
    expect(actual, artifact.path).toBe(artifact.sha256);
  }
});
