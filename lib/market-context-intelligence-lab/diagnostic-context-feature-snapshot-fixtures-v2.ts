import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FIXTURE_ADAPTER_V1,
  MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS,
  loadMarketContextDiagnosticContextFixtureInputsV1,
} from "./diagnostic-context-feature-snapshot-fixtures-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
  createMarketContextDiagnosticContextSnapshotBatchV2,
  type MarketContextDiagnosticContextSnapshotRequestV2,
} from "./diagnostic-context-feature-snapshot-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1,
  createMarketContextDiagnosticTrustedSourceRegistryV1,
  type MarketContextDiagnosticTrustedSourceAuthorityV1,
  type MarketContextDiagnosticTrustedSourceRegistryV1,
} from "./diagnostic-context-trusted-source-registry-v1";
import {
  marketContextDiagnosticContextSha256V1,
} from "./diagnostic-context-feature-snapshot-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FIXTURE_ADAPTER_V2 =
  "market_context_diagnostic_context_fixture_adapter_v2" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_REGISTRY_ID_2026_20_SESSIONS_V1 =
  "market_context_diagnostic_2026_20_sessions_trusted_source_registry_v1" as const;

export type MarketContextDiagnosticContextFixtureAuthorityV2 = {
  registry: MarketContextDiagnosticTrustedSourceRegistryV1;
  authority: MarketContextDiagnosticTrustedSourceAuthorityV1;
  trusted_decisions: Map<
    string,
    {
      source_decision_sha256: string;
      source_decision: unknown;
    }
  >;
};

export function loadMarketContextDiagnosticContextFixtureInputsV2(options: {
  repo_root: string;
  replay_root?: string;
  input_order?: "canonical" | "reverse";
}) {
  const predecessor = loadMarketContextDiagnosticContextFixtureInputsV1(options);
  if (predecessor.inputs.length !== 60) {
    throw new Error("diagnostic_context_v2_predecessor_fixture_count_drift");
  }
  const first = predecessor.inputs[0];
  if (!first) throw new Error("diagnostic_context_v2_fixture_missing");
  const trustedDecisions = new Map(
    predecessor.inputs.map((input) => [
      input.decision_identity.external_decision_id,
      {
        source_decision_sha256: input.source_decision_sha256,
        source_decision: structuredClone(input.source_decision),
      },
    ]),
  );
  const decisionDigests = Object.fromEntries(
    [...trustedDecisions.entries()].map(([identity, decision]) => [
      identity,
      decision.source_decision_sha256,
    ]),
  );
  const registry = createMarketContextDiagnosticTrustedSourceRegistryV1({
    registry_identity:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_REGISTRY_ID_2026_20_SESSIONS_V1,
    decision_source: first.decision_source,
    source_bundle: {
      normalized_dataset: first.normalized_dataset,
      replay: first.replay,
      calendar: first.calendar,
      policy_bundle: {
        ...first.policy_bundle,
        provisional_watermark_ns: "2000000000",
      },
    },
    decision_digests: decisionDigests,
  });
  const authority: MarketContextDiagnosticTrustedSourceAuthorityV1 = {
    authority_version: MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1,
    expected_registry_anchor: {
      registry_identity: registry.registry_identity,
      registry_version: registry.registry_version,
      registry_digest: registry.registry_digest,
    },
    read_registry: () => structuredClone(registry),
    read_decision: (externalDecisionId) => {
      const decision = trustedDecisions.get(externalDecisionId);
      return decision
        ? {
            status: "resolved" as const,
            source_decision_sha256: decision.source_decision_sha256,
            source_decision: structuredClone(decision.source_decision),
          }
        : { status: "not_found" as const };
    },
  };
  const requests: MarketContextDiagnosticContextSnapshotRequestV2[] =
    predecessor.inputs.map((input) => ({
      contract_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
      decision_identity: structuredClone(input.decision_identity),
      decision_unix_ns: input.decision_unix_ns,
      decision_source: structuredClone(input.decision_source),
      normalized_dataset: structuredClone(input.normalized_dataset),
      replay: structuredClone(input.replay),
      calendar: structuredClone(input.calendar),
      policy_bundle: {
        ...structuredClone(input.policy_bundle),
        provisional_watermark_ns: "2000000000",
      },
      source_decision_sha256: input.source_decision_sha256,
    }));
  return {
    adapter_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FIXTURE_ADAPTER_V2,
    predecessor_adapter_version:
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FIXTURE_ADAPTER_V1,
    requests,
    registry,
    authority,
    trusted_decisions: trustedDecisions,
    external_roots: MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS,
    source_inventory_digest: predecessor.source_inventory_digest,
  };
}

export function buildMarketContextDiagnosticContextFixtureResultV2(options: {
  repo_root: string;
  replay_root?: string;
  input_order?: "canonical" | "reverse";
}) {
  const fixtures = loadMarketContextDiagnosticContextFixtureInputsV2(options);
  const snapshots = createMarketContextDiagnosticContextSnapshotBatchV2(
    fixtures.requests,
    { enabled: true, authority: fixtures.authority },
  );
  const taxonomyCounts = Object.fromEntries(
    ["mapped", "insufficient_data", "conflicting", "not_point_in_time_safe"].map(
      (taxonomy) => [
        taxonomy,
        snapshots.filter((snapshot) => snapshot.taxonomy === taxonomy).length,
      ],
    ),
  );
  const material = {
    result_version:
      "market_context_diagnostic_context_fixture_result_v2" as const,
    contract_version: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
    adapter_version: fixtures.adapter_version,
    predecessor_adapter_version: fixtures.predecessor_adapter_version,
    decision_count: snapshots.length,
    taxonomy_counts: taxonomyCounts,
    trusted_source_registry: {
      registry_identity: fixtures.registry.registry_identity,
      registry_version: fixtures.registry.registry_version,
      registry_digest: fixtures.registry.registry_digest,
      decision_inventory_digest: fixtures.registry.decision_inventory_digest,
    },
    external_roots: fixtures.external_roots,
    source_inventory_digest: fixtures.source_inventory_digest,
    snapshots,
  };
  return {
    ...material,
    canonical_result_digest:
      marketContextDiagnosticContextSha256V1(material),
  };
}
