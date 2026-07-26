import type {
  MarketContextIntelligenceV2Output,
} from "./contract-v2";
import { parseMarketContextExplicitInstant } from "./explicit-instant-v1";

export const MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION =
  "market_context_canonical_bridge_schema_v1" as const;
export const MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2 =
  "market_context_shadow_evaluation_adapter_v2" as const;

export type MarketContextProducerVersionMetadata = {
  engine_version: string;
  scoring_version: string;
  ranking_version: string;
  setup_taxonomy_version: string;
  confidence_contract_version: string;
  evaluator_version: string;
  provider_contract_version: string;
  git_commit: string;
  build_identity: string;
};

export type MarketContextShadowBridgeBuildInput = {
  context: MarketContextIntelligenceV2Output;
  producer_versions?: Partial<MarketContextProducerVersionMetadata> | null;
};

type ProviderDomain =
  | "index"
  | "breadth"
  | "sector"
  | "industry"
  | "unknown";

type ProviderDomainFreshness =
  MarketContextIntelligenceV2Output["provider_timestamps"][number] & {
    data_domain: ProviderDomain;
  };

export type LosslessMarketContextBridgePayload = {
  decision_instant: string;
  versions: {
    context_contract_version:
      MarketContextIntelligenceV2Output["context_version"];
    threshold_version: MarketContextIntelligenceV2Output["threshold_version"];
    producer: MarketContextProducerVersionMetadata;
  };
  regime_classification:
    MarketContextIntelligenceV2Output["regime_classification"];
  dimensions: MarketContextIntelligenceV2Output["dimensions"];
  sector_contexts: MarketContextIntelligenceV2Output["sectors"];
  evidence: {
    strength: MarketContextIntelligenceV2Output["evidence_strength"];
    confidence: MarketContextIntelligenceV2Output["confidence"];
  };
  provider_domains: ProviderDomainFreshness[];
  aggregate_freshness: MarketContextIntelligenceV2Output["freshness"];
  coverage_and_missingness: MarketContextIntelligenceV2Output["coverage"];
  reason_codes: string[];
  leakage_control: MarketContextIntelligenceV2Output["leakage_control"];
  shadow_only: true;
  live_ranking_effect: false;
};

type MarketContextShadowBridgeBase = {
  bridge_schema_version:
    typeof MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION;
  adapter_version: typeof MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2;
  actual_canonical_binding: null;
  canonical_binding_ready: false;
  canonical_format_compatible: false;
  capture_enabled: false;
  persistence_enabled: false;
  database_relation: null;
  shadow_only: true;
  live_ranking_effect: false;
};

export type MarketContextShadowBridgeEnvelope =
  | (MarketContextShadowBridgeBase & {
      binding_status: "shadow_bridge_ready";
      validation_errors: [];
      payload: LosslessMarketContextBridgePayload;
    })
  | (MarketContextShadowBridgeBase & {
      binding_status: "not_bindable";
      validation_errors: string[];
      payload: null;
    });

const producerVersionFields = [
  "engine_version",
  "scoring_version",
  "ranking_version",
  "setup_taxonomy_version",
  "confidence_contract_version",
  "evaluator_version",
  "provider_contract_version",
  "git_commit",
  "build_identity",
] as const;

function providerDomain(sourceId: string): ProviderDomain {
  const prefix = sourceId.split(":", 1)[0];
  if (
    prefix === "index" ||
    prefix === "breadth" ||
    prefix === "sector" ||
    prefix === "industry"
  ) {
    return prefix;
  }
  return "unknown";
}

function validateProducerVersions(
  versions: Partial<MarketContextProducerVersionMetadata> | null | undefined,
) {
  const errors: string[] = [];
  for (const field of producerVersionFields) {
    const value = versions?.[field];
    if (
      typeof value !== "string" ||
      value.length === 0 ||
      value !== value.trim()
    ) {
      errors.push(`missing_required_producer_version:${field}`);
    }
  }
  if (
    typeof versions?.git_commit === "string" &&
    !/^[0-9a-f]{40}$/.test(versions.git_commit)
  ) {
    errors.push("invalid_producer_version:git_commit");
  }
  return Array.from(new Set(errors)).sort();
}

function baseEnvelope(): MarketContextShadowBridgeBase {
  return {
    bridge_schema_version: MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION,
    adapter_version: MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2,
    actual_canonical_binding: null,
    canonical_binding_ready: false,
    canonical_format_compatible: false,
    capture_enabled: false,
    persistence_enabled: false,
    database_relation: null,
    shadow_only: true,
    live_ranking_effect: false,
  };
}

export function buildLosslessMarketContextShadowBridge(
  input: MarketContextShadowBridgeBuildInput,
): MarketContextShadowBridgeEnvelope {
  const errors = validateProducerVersions(input.producer_versions);
  const decisionInstant = parseMarketContextExplicitInstant(
    input.context.decision_timestamp,
    "decision_timestamp",
  );
  if (!decisionInstant.ok) {
    errors.push(
      `${decisionInstant.error_code}:${decisionInstant.field}`,
    );
  }
  if (
    input.context.shadow_only !== true ||
    input.context.live_ranking_effect !== false
  ) {
    errors.push("invalid_shadow_only_boundary");
  }

  if (!decisionInstant.ok || errors.length > 0) {
    return {
      ...baseEnvelope(),
      binding_status: "not_bindable",
      validation_errors: Array.from(new Set(errors)).sort(),
      payload: null,
    };
  }

  const producer =
    input.producer_versions as MarketContextProducerVersionMetadata;
  return {
    ...baseEnvelope(),
    binding_status: "shadow_bridge_ready",
    validation_errors: [],
    payload: {
      decision_instant: decisionInstant.canonical_timestamp,
      versions: {
        context_contract_version: input.context.context_version,
        threshold_version: input.context.threshold_version,
        producer: { ...producer },
      },
      regime_classification: input.context.regime_classification,
      dimensions: { ...input.context.dimensions },
      sector_contexts: input.context.sectors.map((sector) => ({
        ...sector,
        reason_codes: [...sector.reason_codes],
      })),
      evidence: {
        strength: input.context.evidence_strength,
        confidence: { ...input.context.confidence },
      },
      provider_domains: input.context.provider_timestamps.map((provider) => ({
        ...provider,
        data_domain: providerDomain(provider.source_id),
      })),
      aggregate_freshness: {
        ...input.context.freshness,
        stale_source_ids: [...input.context.freshness.stale_source_ids],
      },
      coverage_and_missingness: { ...input.context.coverage },
      reason_codes: [...input.context.reason_codes],
      leakage_control: { ...input.context.leakage_control },
      shadow_only: true,
      live_ranking_effect: false,
    },
  };
}

export function restoreMarketContextFromLosslessBridge(
  envelope: Extract<
    MarketContextShadowBridgeEnvelope,
    { binding_status: "shadow_bridge_ready" }
  >,
): MarketContextIntelligenceV2Output {
  const payload = envelope.payload;
  return {
    context_version: payload.versions.context_contract_version,
    threshold_version: payload.versions.threshold_version,
    decision_timestamp: payload.decision_instant,
    regime_classification: payload.regime_classification,
    dimensions: { ...payload.dimensions },
    sectors: payload.sector_contexts.map((sector) => ({
      ...sector,
      reason_codes: [...sector.reason_codes],
    })),
    confidence: { ...payload.evidence.confidence },
    evidence_strength: payload.evidence.strength,
    provider_timestamps: payload.provider_domains.map((provider) => {
      const restored = { ...provider };
      delete (restored as Partial<ProviderDomainFreshness>).data_domain;
      return restored;
    }),
    freshness: {
      ...payload.aggregate_freshness,
      stale_source_ids: [...payload.aggregate_freshness.stale_source_ids],
    },
    coverage: { ...payload.coverage_and_missingness },
    leakage_control: { ...payload.leakage_control },
    reason_codes: [...payload.reason_codes],
    shadow_only: true,
    live_ranking_effect: false,
  };
}
