import {
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "./diagnostic-context-feature-snapshot-v1";
import {
  DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1,
} from "./databento-explicit-nanosecond-instant-v1";

export const MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1 =
  "market_context_diagnostic_trusted_source_registry_v1" as const;
export const MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1 =
  "market_context_diagnostic_trusted_source_authority_v1" as const;

export type MarketContextDiagnosticSourceBundleV1 = {
  normalized_dataset: {
    identity: string;
    dataset_digest: string;
    output_tree_digest: string;
    lineage_digest: string;
    manifest_digest: string;
  };
  replay: {
    identity: string;
    dataset_digest: string;
    output_tree_digest: string;
    manifest_digest: string;
    core_evidence_digest: string;
  };
  calendar: {
    identity: string;
    digest: string;
  };
  policy_bundle: {
    diagnostic_candle_policy: string;
    replay_contract: string;
    replay_schedule: string;
    market_context_contract: string;
    market_context_thresholds: string;
    watermark_policy: string;
    provisional_watermark_ns: string;
    watermark_status: "empirically_unvalidated";
    instant_parser: typeof DATABENTO_EXPLICIT_NANOSECOND_INSTANT_PARSER_V1;
  };
};

export type MarketContextDiagnosticTrustedSourceRegistryV1 = {
  registry_version: typeof MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1;
  registry_identity: string;
  decision_source: {
    contract: string;
    version: string;
  };
  source_bundle: MarketContextDiagnosticSourceBundleV1;
  decision_inventory_digest: string;
  decision_digests: Record<string, string>;
  registry_digest: string;
};

export type MarketContextDiagnosticTrustedSourceRegistryAnchorV1 = {
  registry_identity: string;
  registry_version: typeof MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1;
  registry_digest: string;
};

export type MarketContextDiagnosticTrustedDecisionResolutionV1 =
  | {
      status: "resolved";
      source_decision_sha256: string;
      source_decision: unknown;
    }
  | {
      status: "not_found";
    };

export type MarketContextDiagnosticTrustedSourceAuthorityV1 = {
  authority_version: typeof MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1;
  expected_registry_anchor: MarketContextDiagnosticTrustedSourceRegistryAnchorV1;
  read_registry: () => unknown;
  read_decision: (
    externalDecisionId: string,
  ) => MarketContextDiagnosticTrustedDecisionResolutionV1;
};

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isUnixNs(value: unknown): value is string {
  return typeof value === "string" && /^(0|[1-9]\d*)$/.test(value);
}

function exactKeys(
  value: unknown,
  expected: readonly string[],
): value is JsonRecord {
  const candidate = record(value);
  if (!candidate) return false;
  const actual = Object.keys(candidate).sort();
  const wanted = [...expected].sort();
  return (
    actual.length === wanted.length &&
    actual.every((key, index) => key === wanted[index])
  );
}

function registryMaterial(
  registry: Omit<MarketContextDiagnosticTrustedSourceRegistryV1, "registry_digest">,
) {
  return {
    registry_version: registry.registry_version,
    registry_identity: registry.registry_identity,
    decision_source: registry.decision_source,
    source_bundle: registry.source_bundle,
    decision_inventory_digest: registry.decision_inventory_digest,
    decision_digests: registry.decision_digests,
  };
}

export function createMarketContextDiagnosticTrustedSourceRegistryV1(input: {
  registry_identity: string;
  decision_source: MarketContextDiagnosticTrustedSourceRegistryV1["decision_source"];
  source_bundle: MarketContextDiagnosticSourceBundleV1;
  decision_digests: Record<string, string>;
}): MarketContextDiagnosticTrustedSourceRegistryV1 {
  const decisionDigests = Object.fromEntries(
    Object.entries(input.decision_digests).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
  const material = {
    registry_version: MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1,
    registry_identity: input.registry_identity,
    decision_source: structuredClone(input.decision_source),
    source_bundle: structuredClone(input.source_bundle),
    decision_inventory_digest:
      marketContextDiagnosticContextSha256V1(decisionDigests),
    decision_digests: decisionDigests,
  };
  return {
    ...material,
    registry_digest: marketContextDiagnosticContextSha256V1(material),
  };
}

export function validateMarketContextDiagnosticTrustedSourceRegistryV1(
  value: unknown,
): value is MarketContextDiagnosticTrustedSourceRegistryV1 {
  if (
    !exactKeys(value, [
      "registry_version",
      "registry_identity",
      "decision_source",
      "source_bundle",
      "decision_inventory_digest",
      "decision_digests",
      "registry_digest",
    ])
  ) {
    return false;
  }
  const registry = value as MarketContextDiagnosticTrustedSourceRegistryV1;
  if (
    registry.registry_version !==
      MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_REGISTRY_V1 ||
    typeof registry.registry_identity !== "string" ||
    registry.registry_identity.length === 0 ||
    !isSha256(registry.decision_inventory_digest) ||
    !isSha256(registry.registry_digest) ||
    !exactKeys(registry.decision_source, ["contract", "version"]) ||
    typeof registry.decision_source.contract !== "string" ||
    typeof registry.decision_source.version !== "string" ||
    !exactKeys(registry.source_bundle, [
      "normalized_dataset",
      "replay",
      "calendar",
      "policy_bundle",
    ])
  ) {
    return false;
  }
  const normalized = registry.source_bundle.normalized_dataset;
  const replay = registry.source_bundle.replay;
  const calendar = registry.source_bundle.calendar;
  const policy = registry.source_bundle.policy_bundle;
  if (
    !exactKeys(normalized, [
      "identity",
      "dataset_digest",
      "output_tree_digest",
      "lineage_digest",
      "manifest_digest",
    ]) ||
    !exactKeys(replay, [
      "identity",
      "dataset_digest",
      "output_tree_digest",
      "manifest_digest",
      "core_evidence_digest",
    ]) ||
    !exactKeys(calendar, ["identity", "digest"]) ||
    !exactKeys(policy, [
      "diagnostic_candle_policy",
      "replay_contract",
      "replay_schedule",
      "market_context_contract",
      "market_context_thresholds",
      "watermark_policy",
      "provisional_watermark_ns",
      "watermark_status",
      "instant_parser",
    ])
  ) {
    return false;
  }
  const requiredStrings = [
    normalized.identity,
    replay.identity,
    calendar.identity,
    ...Object.values(policy),
  ];
  const requiredDigests = [
    normalized.dataset_digest,
    normalized.output_tree_digest,
    normalized.lineage_digest,
    normalized.manifest_digest,
    replay.dataset_digest,
    replay.output_tree_digest,
    replay.manifest_digest,
    replay.core_evidence_digest,
    calendar.digest,
  ];
  if (
    requiredStrings.some(
      (item) => typeof item !== "string" || item.length === 0,
    ) ||
    requiredDigests.some((item) => !isSha256(item)) ||
    policy.watermark_status !== "empirically_unvalidated" ||
    !isUnixNs(policy.provisional_watermark_ns) ||
    BigInt(policy.provisional_watermark_ns) <= BigInt(0)
  ) {
    return false;
  }
  const decisionDigests = record(registry.decision_digests);
  if (
    !decisionDigests ||
    Object.keys(decisionDigests).length === 0 ||
    Object.entries(decisionDigests).some(
      ([identity, digest]) => identity.length === 0 || !isSha256(digest),
    )
  ) {
    return false;
  }
  if (
    marketContextDiagnosticContextSha256V1(decisionDigests) !==
    registry.decision_inventory_digest
  ) {
    return false;
  }
  const material = registryMaterial({
    ...registry,
    decision_digests: Object.fromEntries(
      Object.entries(registry.decision_digests).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  });
  return (
    marketContextDiagnosticContextSha256V1(material) === registry.registry_digest
  );
}

export function marketContextDiagnosticTrustedSourceRegistryEqualV1(
  left: unknown,
  right: unknown,
) {
  return (
    stableMarketContextDiagnosticContextJsonV1(left) ===
    stableMarketContextDiagnosticContextJsonV1(right)
  );
}
