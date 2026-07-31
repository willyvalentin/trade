import { createHash } from "node:crypto";

import { ACTION_661J5R2_LITERAL_FIXTURE } from "./action-661j5r2-runtime-literal-fixture.mjs";

const DOMAIN_IDS = [
  "schema_relations",
  "target_data",
  "migration_history",
  "rls_policies",
  "table_acl",
  "column_acl",
  "rpc_catalog",
  "function_catalog",
  "trigger_catalog",
];
const TARGET_RELATIONS = [
  "public.continuous_intelligence_credit_ledger",
  "public.continuous_intelligence_shadow_canary_daily_claims",
  "public.historical_candle_fetch_runs",
  "public.historical_candle_symbols",
  "public.historical_candles",
  "public.historical_usage_reconciliations",
];
const RESULT_PROTOCOL =
  "action_661j5r2_runtime_result_protocol_rebuild_v1";

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function canonicalValue(value, active = new Set()) {
  if (
    value === undefined ||
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint" ||
    (typeof value === "number" && !Number.isFinite(value))
  ) {
    throw new Error("oracle.canonical_value_invalid");
  }
  if (value === null || typeof value !== "object") return value;
  if (active.has(value)) throw new Error("oracle.canonical_cycle");
  active.add(value);
  let result;
  if (Array.isArray(value)) {
    result = value.map((entry) => canonicalValue(entry, active));
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error("oracle.canonical_non_plain_object");
    }
    result = Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalValue(value[key], active)]),
    );
  }
  active.delete(value);
  return result;
}

export function canonicalJsonOracle(value) {
  return JSON.stringify(canonicalValue(value));
}

function digest(value) {
  return createHash("sha256").update(canonicalJsonOracle(value)).digest("hex");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const policyRegistry = {
  registry_version: "action_661j5r2_atomic_policy_registry_rebuild_v1",
  scenarios: {
    forbidden_history: {
      scenario_id: "forbidden_history",
      precondition_type: "forbidden_migration_history",
      forbidden_versions: [
        "20260708000000",
        "20260708001000",
        "20260710000000",
      ],
      selected_forbidden_version: "20260708000000",
      target_relation: null,
      relation_state: null,
      terminal_sqlstate: null,
      terminal_reason: "Action 661J refuses forbidden migration history",
      classification: "controlled_forbidden_history_rejection",
    },
    missing_target: {
      scenario_id: "missing_target",
      precondition_type: "missing_target_relation",
      forbidden_versions: [],
      selected_forbidden_version: null,
      target_relation: "public.historical_candles",
      relation_state: "missing",
      terminal_sqlstate: "42P01",
      terminal_reason: 'relation "public.historical_candles" does not exist',
      classification: "native_regclass_missing_relation_preempts_policy",
    },
  },
};
const policyRegistryDigest = digest(policyRegistry);
const runtimeRegistry = {
  registry_version: "action_661j5r2_runtime_scenario_registry_rebuild_v1",
  predecessor: {
    base_commit: "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33",
    recovery_manifest_version: "action_661j5r1_loss_reconstruction_manifest_v1",
    lost_bytes_claimed_recovered: false,
  },
  scenarios: {
    forbidden_history: {
      status: "implemented",
      scenario_id: "forbidden_history",
      protocol_version: RESULT_PROTOCOL,
      runner_version: "action_661j5r2_runtime_runner_rebuild_v1",
      policy_registry_version:
        "action_661j5r2_atomic_policy_registry_rebuild_v1",
    },
    missing_target: {
      status: "implemented",
      scenario_id: "missing_target",
      protocol_version: RESULT_PROTOCOL,
      runner_version: "action_661j5r2_runtime_runner_rebuild_v1",
      policy_registry_version:
        "action_661j5r2_atomic_policy_registry_rebuild_v1",
    },
  },
};
const runtimeRegistryDigest = digest(runtimeRegistry);
const capabilityMatrix = {
  forbidden_history: RESULT_PROTOCOL,
  missing_target: RESULT_PROTOCOL,
};
const runnerProjection = {
  authority_module_path:
    "lib/action-661j5r2-runtime-runner-authority-rebuild-v1.mjs",
  authority_module_sha256:
    "85df7655b08ef0e7a4ca38ac1daa0cb646e4b6b25763c66c2405ef5bc53e87e1",
  authority_version: "action_661j5r2_runtime_runner_authority_rebuild_v1",
  capability_matrix: capabilityMatrix,
  capability_matrix_digest: digest(capabilityMatrix),
  dependency_versions: {
    result_protocol: RESULT_PROTOCOL,
    runtime_registry: "action_661j5r2_runtime_scenario_registry_rebuild_v1",
    snapshot_contract:
      "action_661j5r2_metadata_first_snapshot_rebuild_v1",
  },
  no_external_access: true,
  no_production_access: true,
  runner_module_path: "lib/action-661j5r2-runtime-runner-rebuild-v1.mjs",
  runner_module_sha256:
    "86a9d80db6ae5999e3ba04fee3b8aed9b245f9ede9b391c3144eb51443b1a472",
  runner_version: "action_661j5r2_runtime_runner_rebuild_v1",
};
const runnerIdentity = {
  ...runnerProjection,
  runner_identity_digest: digest(runnerProjection),
};

function relationReason(state) {
  return {
    missing: "relation_missing",
    non_table: "relation_not_table",
    wrong_owner: "relation_wrong_owner",
  }[state];
}

export function buildOracleSnapshot(input) {
  const reads = new Map(
    input.guarded_data_reads.map((read) => [read.relation, read]),
  );
  const targets = input.metadata_discovery
    .map((metadata) => {
      const read = reads.get(metadata.relation);
      if (metadata.relation_state === "present_table") {
        const rows = clone(read.rows).sort((left, right) =>
          canonicalJsonOracle(left).localeCompare(canonicalJsonOracle(right)),
        );
        return {
          relation: metadata.relation,
          relation_state: "present_table",
          observed_relation: clone(metadata.observed),
          data_status: "captured",
          rows,
          data_digest: digest(rows),
          reason: null,
        };
      }
      return {
        relation: metadata.relation,
        relation_state: metadata.relation_state,
        observed_relation:
          metadata.observed === null ? null : clone(metadata.observed),
        data_status: "not_read_due_to_relation_state",
        rows: null,
        data_digest: null,
        reason: relationReason(metadata.relation_state),
      };
    })
    .sort((left, right) => left.relation.localeCompare(right.relation));
  const domains = DOMAIN_IDS.map((domainId) => {
    const value =
      domainId === "target_data" ? targets : clone(input.domains[domainId]);
    const projection = {
      domain_id: domainId,
      domain_version: "v2",
      value,
    };
    return { ...projection, domain_digest: digest(projection) };
  });
  const projection = {
    snapshot_contract: "action_661j5r2_metadata_first_snapshot_rebuild_v1",
    snapshot_schema_version: "action_661j5r2_nine_domain_v2",
    target_inventory: TARGET_RELATIONS,
    domains,
  };
  return deepFreeze({ ...projection, combined_digest: digest(projection) });
}

function buildDiagnostic(input) {
  const projection = clone(input);
  return { ...projection, diagnostic_digest: digest(projection) };
}

function buildReference(scenarioId) {
  const policy = policyRegistry.scenarios[scenarioId];
  const projection = {
    precondition_reference_version:
      "action_661j5r2_atomic_precondition_reference_rebuild_v1",
    scenario_id: scenarioId,
    policy_registry_digest: policyRegistryDigest,
    relation_state: policy.relation_state,
    selected_forbidden_version: policy.selected_forbidden_version,
    target_relation: policy.target_relation,
  };
  return { ...projection, precondition_reference_digest: digest(projection) };
}

function sortedReads(reads) {
  return clone(reads).sort((left, right) =>
    left.relation.localeCompare(right.relation),
  );
}

function buildScenarioChain(scenarioId, run) {
  const scenario = ACTION_661J5R2_LITERAL_FIXTURE.scenarios[scenarioId];
  const snapshotInput =
    ACTION_661J5R2_LITERAL_FIXTURE.snapshot_cases[scenario.snapshot_case];
  const snapshot = buildOracleSnapshot(snapshotInput);
  const diagnostic = buildDiagnostic(scenario.diagnostic);
  const guardedReads = sortedReads(snapshotInput.guarded_data_reads);
  const runtimeIdentity = ACTION_661J5R2_LITERAL_FIXTURE.runtime_identity;
  const runtimeCaptureDigest = digest({
    diagnostic_digest: diagnostic.diagnostic_digest,
    guarded_reads: guardedReads,
    poststate_combined_digest: snapshot.combined_digest,
    prestate_combined_digest: snapshot.combined_digest,
    runtime_identity_digest: runtimeIdentity.identity_digest,
  });
  const evidenceProjection = {
    atomic_evidence_version: "action_661j5r2_atomic_evidence_rebuild_v1",
    atomicity_decision: "no_transition_verified",
    diagnostic,
    guarded_reads: guardedReads,
    migration_applied: false,
    policy_registry: policyRegistry,
    policy_registry_digest: policyRegistryDigest,
    poststate: snapshot,
    precondition_reference: buildReference(scenarioId),
    prestate: snapshot,
    protocol_version: RESULT_PROTOCOL,
    runner_identity: runnerIdentity,
    runtime_capture_digest: runtimeCaptureDigest,
    runtime_identity: runtimeIdentity,
    runtime_registry: runtimeRegistry,
    runtime_registry_digest: runtimeRegistryDigest,
    scenario_id: scenarioId,
    snapshot_schema_version: "action_661j5r2_nine_domain_v2",
    terminal_state: "controlled_error",
  };
  const evidence = {
    ...evidenceProjection,
    evidence_digest: digest(evidenceProjection),
  };
  const recordProjection = {
    evidence,
    evidence_digest: evidence.evidence_digest,
    protocol_version: RESULT_PROTOCOL,
    record_version: "action_661j5r2_result_record_rebuild_v1",
    run_id: run.run_id,
    scenario_id: scenarioId,
    shard_id: run.shard_id,
    terminal_status: "passed",
  };
  const record = { ...recordProjection, record_digest: digest(recordProjection) };
  const shardProjection = {
    declared_inventory: [scenarioId],
    protocol_version: RESULT_PROTOCOL,
    record_digest: record.record_digest,
    result_inventory: [
      {
        record_digest: record.record_digest,
        scenario_id: scenarioId,
        terminal_status: "passed",
      },
    ],
    run_id: run.run_id,
    scenario_id: scenarioId,
    shard_id: run.shard_id,
    shard_version: "action_661j5r2_shard_result_set_rebuild_v1",
    terminal_count: 1,
  };
  const shard = { ...shardProjection, shard_digest: digest(shardProjection) };
  const fileProjection = {
    file_identity: `${run.run_id}.${run.shard_id}.${scenarioId}.rebuild-v1.json`,
    file_version: "action_661j5r2_persisted_result_file_rebuild_v1",
    protocol_version: RESULT_PROTOCOL,
    record,
    record_digest: record.record_digest,
    shard,
    shard_digest: shard.shard_digest,
  };
  const file = {
    ...fileProjection,
    canonical_file_digest: digest(fileProjection),
  };
  return deepFreeze({ evidence, record, shard, file });
}

function semanticProjection(file) {
  const evidence = file.record.evidence;
  return {
    atomicity_decision: evidence.atomicity_decision,
    diagnostic: evidence.diagnostic,
    guarded_reads: evidence.guarded_reads,
    migration_applied: evidence.migration_applied,
    policy_registry_digest: evidence.policy_registry_digest,
    poststate: evidence.poststate,
    precondition_reference: evidence.precondition_reference,
    prestate: evidence.prestate,
    protocol_version: evidence.protocol_version,
    runner_identity: evidence.runner_identity,
    runtime_capture_digest: evidence.runtime_capture_digest,
    runtime_identity: evidence.runtime_identity,
    runtime_registry_digest: evidence.runtime_registry_digest,
    scenario_id: evidence.scenario_id,
    snapshot_schema_version: evidence.snapshot_schema_version,
    terminal_state: evidence.terminal_state,
  };
}

export function buildIndependentGoldenFoundation() {
  const chains = [];
  for (const scenarioId of ["forbidden_history", "missing_target"]) {
    for (const run of ACTION_661J5R2_LITERAL_FIXTURE.scenarios[scenarioId].runs) {
      chains.push(buildScenarioChain(scenarioId, run));
    }
  }
  chains.sort((left, right) =>
    `${left.record.scenario_id}:${left.record.run_id}`.localeCompare(
      `${right.record.scenario_id}:${right.record.run_id}`,
    ),
  );
  const scenarioComparisons = [
    "forbidden_history",
    "missing_target",
  ].map((scenarioId) => {
    const pair = chains.filter(
      (chain) => chain.record.scenario_id === scenarioId,
    );
    const semanticDigest = digest(semanticProjection(pair[0].file));
    if (semanticDigest !== digest(semanticProjection(pair[1].file))) {
      throw new Error("oracle.semantic_determinism_mismatch");
    }
    return {
      atomicity_decision: "no_transition_verified",
      deterministic: true,
      scenario_id: scenarioId,
      semantic_digest: semanticDigest,
    };
  });
  const aggregateProjection = {
    aggregate_version: "action_661j5r2_mixed_ab_aggregate_rebuild_v1",
    decision: "certified",
    input_files: chains.map((chain) => ({
      canonical_file_digest: chain.file.canonical_file_digest,
      protocol_version: chain.file.protocol_version,
      record_digest: chain.file.record_digest,
      run_id: chain.record.run_id,
      scenario_id: chain.record.scenario_id,
      shard_digest: chain.file.shard_digest,
      shard_id: chain.record.shard_id,
    })),
    scenario_comparisons: scenarioComparisons,
    shard_count: 4,
  };
  const aggregate = {
    ...aggregateProjection,
    aggregate_digest: digest(aggregateProjection),
  };
  return deepFreeze({ chains, aggregate });
}

export const EXPECTED_REBUILD_V1_GOLDENS = deepFreeze({
  forbidden_history: {
    evidence: "601a562a925c9154c8e6d00c1c25adeb76af36ecaf776d95bc09e5bf64f7b2cf",
    run_a_file: "b4305646e6e11d4a700117f4f37d61c11a31c72fd3d0cae2c90021fc94a9b311",
    run_a_record: "8a7e40e23ba8462748ac9dde201addc54d92775c4447fefffd639cc2e23d89a5",
    run_a_shard: "3ac2963ca02c707964942b694dda3ab72efa1d49551c7c73d522e0757cb375dd",
    run_b_file: "1bc3bc8911245af053cb8dac2d591e66987aa0d89366e073afb6d49de5d824e9",
    run_b_record: "33543c5e82674ce3634f13904e7ad5e298d9ff9b1c5f48f5e1f7d3c4490b5398",
    run_b_shard: "a429f843868b0579a58a237d3bc6a39c2f2dfba959c57f73af11191bcb409e08",
  },
  missing_target: {
    evidence: "bbb311f6f0591524739b2a0ee860a99f9d983d0fa778737645432e5fad6a9398",
    run_a_file: "4721d648ecbdf82a619d514ab766c4cd94d41d9cf57f633778bd79a511873659",
    run_a_record: "ac988607c5cbd8eadf2bb5aea71eae5f302e0cac0ee7bc85fb45a485d658bc98",
    run_a_shard: "4d5c34d71b75b28e12342f2857897a815b66cb453f7f3d6798cb3e841f6597b6",
    run_b_file: "a362b98192f71b2a14d9b533553c2b0a1142a616342569900954f8aaf2500472",
    run_b_record: "3ce999bd073fafca98cb3b7298fcee464ce0691b5aedca364e5eacda6ebaa97d",
    run_b_shard: "03938fb59e43b3c48844aeef2db68323dbd173d98d5ce8ca20b0e4b906e4244d",
  },
  aggregate: "ccfc73e5da7fb221cfbce880678f1501686f6f9a7919aa6aa292edd5145eb26a",
});
