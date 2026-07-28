import { createHash } from "node:crypto";

import {
  buildMarketContextIntelligenceV1,
  type MarketContextIntelligenceV1Input,
  type MarketContextIntelligenceV1Output,
  type MarketContextProviderMetadata,
  type MarketContextRegimeClassification,
  type MarketContextMetricPoint,
  type MarketSectorBenchmarkInput,
  type SectorHorizonInput,
} from "./contract-v1";
import {
  buildMarketContextIntelligenceV2,
  type MarketContextIntelligenceV2Input,
  type MarketContextIntelligenceV2Output,
} from "./contract-v2";
import {
  requireMarketContextExplicitInstant,
} from "./explicit-instant-v1";
import {
  buildLosslessMarketContextShadowBridge,
  MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION,
  MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2,
  type MarketContextProducerVersionMetadata,
  type MarketContextShadowBridgeEnvelope,
} from "./shadow-canonical-bridge-v1";
import {
  MARKET_CONTEXT_THRESHOLD_REGISTRY_V2,
} from "./thresholds-v2";

export const MARKET_CONTEXT_SHADOW_REPLAY_VERSION =
  "market_context_shadow_replay_v1" as const;

export const MARKET_CONTEXT_SHADOW_REPLAY_EXPORT_VERSION =
  "market_context_shadow_replay_bridge_export_v1" as const;

export const MARKET_CONTEXT_SHADOW_REPLAY_CANONICALIZATION_VERSION =
  "market_context_shadow_replay_canonical_json_v1" as const;

export type MarketContextShadowReplayDatasetIdentityV1 = {
  dataset_id: string;
  dataset_version: string;
  source_kind:
    | "synthetic_repository_fixture"
    | "offline_point_in_time";
};

export type MarketContextShadowReplayDecisionInputV1 = {
  decision_id: string;
  ticker: string;
  session_label: string;
  context_input: MarketContextIntelligenceV2Input;
};

export type MarketContextShadowReplayDatasetV1 = {
  identity: MarketContextShadowReplayDatasetIdentityV1;
  decisions: MarketContextShadowReplayDecisionInputV1[];
};

export type MarketContextShadowReplayV1Input = {
  replay_id: string;
  dataset: MarketContextShadowReplayDatasetV1;
  dataset_digest: string;
  producer_versions: MarketContextProducerVersionMetadata;
};

export type MarketContextShadowReplayObservationAuditV1 = {
  source_id: string;
  data_domain: "index" | "breadth" | "sector" | "industry";
  horizon: "intraday" | "multi_day" | "point" | "short" | "medium";
  observation_timestamp: string;
  point_in_time_status: "eligible" | "future_excluded";
};

export type MarketContextShadowReplayProviderAuditV1 = {
  source_id: string;
  data_domain: "index" | "breadth" | "sector" | "industry";
  provider: string;
  source_timestamp: string | null;
  received_timestamp: string | null;
  source_point_in_time_status:
    | "eligible"
    | "future_excluded"
    | "missing";
  received_after_decision: boolean | null;
};

type ReadyBridgeEnvelope = Extract<
  MarketContextShadowBridgeEnvelope,
  { binding_status: "shadow_bridge_ready" }
>;

export type MarketContextShadowReplayDecisionOutputV1 = {
  replay_identity: {
    replay_id: string;
    decision_id: string;
    ticker: string;
    session_label: string;
    dataset_id: string;
    dataset_version: string;
    dataset_digest: string;
  };
  decision_instant: string;
  canonical_decision_input_digest: string;
  evidence_digest: string;
  v1_evaluation: {
    context_version: MarketContextIntelligenceV1Output["context_version"];
    threshold_version: MarketContextIntelligenceV1Output["threshold_version"];
    classification: MarketContextRegimeClassification;
    dimensions: MarketContextIntelligenceV1Output["dimensions"];
    evidence_strength: MarketContextIntelligenceV1Output["evidence_strength"];
    reason_codes: string[];
  };
  v2_evaluation: {
    context_version: MarketContextIntelligenceV2Output["context_version"];
    threshold_version: MarketContextIntelligenceV2Output["threshold_version"];
    classification: MarketContextRegimeClassification;
    dimensions: MarketContextIntelligenceV2Output["dimensions"];
    sector_context: MarketContextIntelligenceV2Output["sectors"];
    freshness: MarketContextIntelligenceV2Output["freshness"];
    coverage: MarketContextIntelligenceV2Output["coverage"];
    evidence_strength: MarketContextIntelligenceV2Output["evidence_strength"];
    confidence: MarketContextIntelligenceV2Output["confidence"];
    provider_timestamps:
      MarketContextIntelligenceV2Output["provider_timestamps"];
    reason_codes: string[];
  };
  classification_comparison: {
    agreement: boolean;
    status: "unchanged" | "changed";
    v1_classification: MarketContextRegimeClassification;
    v2_classification: MarketContextRegimeClassification;
  };
  point_in_time_audit: {
    observation_times: MarketContextShadowReplayObservationAuditV1[];
    provider_times: MarketContextShadowReplayProviderAuditV1[];
    duplicate_observations: number;
  };
  leakage_control: {
    replay_boundary: {
      future_observations_excluded: number;
      future_provider_source_timestamps_excluded: number;
      invalid_timestamps_rejected: 0;
    };
    v1: MarketContextIntelligenceV1Output["leakage_control"];
    v2: MarketContextIntelligenceV2Output["leakage_control"];
  };
  threshold_boundary_ids: string[];
  input_immutability: {
    status: "verified";
  };
  shadow_only: true;
  live_ranking_effect: false;
};

export type MarketContextShadowReplayDiagnosticsV1 = {
  classification_transition_matrix: Array<{
    from: MarketContextRegimeClassification;
    to: MarketContextRegimeClassification;
    count: number;
  }>;
  version_comparison_matrix: Array<{
    v1: MarketContextRegimeClassification;
    v2: MarketContextRegimeClassification;
    agreement: boolean;
    count: number;
  }>;
  regime_coverage: {
    total_decisions: number;
    measurable_decisions: number;
    measurable_fraction: number;
    by_classification: Array<{
      classification: MarketContextRegimeClassification;
      count: number;
    }>;
  };
  sector_coverage: {
    decisions_with_sector_context: number;
    total_contexts: number;
    ranked_contexts: number;
    not_rankable_contexts: number;
    mean_coverage: number | null;
    by_classification: Array<{
      classification:
        MarketContextIntelligenceV2Output["sectors"][number]["classification"];
      count: number;
    }>;
  };
  insufficient_count: number;
  conflicting_count: number;
  provider_gap_count: number;
  threshold_boundary_frequency: Array<{
    threshold_id: string;
    value: number;
    status: "active" | "reserved_inactive";
    classification_effect: boolean;
    decision_hits: number;
    decision_frequency: number;
  }>;
  unique_counts: {
    decisions: number;
    days: number;
    tickers: number;
  };
  unique_days: string[];
  unique_tickers: string[];
  canonical_outcomes_joined: false;
  performance_claims_allowed: false;
  prohibited_metrics: ["win_rate", "expectancy", "precision_at_k"];
};

export type MarketContextShadowReplayBridgeExportV1 = {
  export_format_version: typeof MARKET_CONTEXT_SHADOW_REPLAY_EXPORT_VERSION;
  replay_contract_version: typeof MARKET_CONTEXT_SHADOW_REPLAY_VERSION;
  bridge_schema_version:
    typeof MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION;
  adapter_version: typeof MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2;
  binding_status: "inactive_unbound";
  intended_future_boundary: "market_context_canonical_bridge_schema_v1";
  actual_canonical_binding: null;
  canonical_binding_ready: false;
  capture_enabled: false;
  persistence_enabled: false;
  database_relation: null;
  records: Array<{
    decision_id: string;
    ticker: string;
    bridge: ReadyBridgeEnvelope;
  }>;
  shadow_only: true;
  live_ranking_effect: false;
};

export type MarketContextShadowReplayV1Output = {
  replay_contract_version: typeof MARKET_CONTEXT_SHADOW_REPLAY_VERSION;
  canonicalization_version:
    typeof MARKET_CONTEXT_SHADOW_REPLAY_CANONICALIZATION_VERSION;
  replay_identity: {
    replay_id: string;
    dataset_id: string;
    dataset_version: string;
    dataset_source_kind:
      MarketContextShadowReplayDatasetIdentityV1["source_kind"];
    dataset_digest: string;
  };
  decisions: MarketContextShadowReplayDecisionOutputV1[];
  diagnostics: MarketContextShadowReplayDiagnosticsV1;
  bridge_export: MarketContextShadowReplayBridgeExportV1;
  reproducibility: {
    canonical_input_digest: string;
    replay_evidence_digest: string;
    byte_serialization:
      typeof MARKET_CONTEXT_SHADOW_REPLAY_CANONICALIZATION_VERSION;
    deterministic: true;
  };
  performance_claims: {
    status: "not_computed";
    reason: "joinable_canonical_outcomes_required";
  };
  canonical_binding_ready: false;
  shadow_only: true;
  live_ranking_effect: false;
};

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalJsonValue(value: unknown): JsonValue {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error(
      "market_context_shadow_replay_v1_non_finite_json_value",
    );
  }
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(canonicalJsonValue);
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, child]) => [key, canonicalJsonValue(child)]),
    );
  }
  throw new Error("market_context_shadow_replay_v1_non_json_value");
}

export function stableMarketContextShadowReplayJsonV1(value: unknown) {
  return JSON.stringify(canonicalJsonValue(value));
}

function canonicalInstant(value: unknown, field: string) {
  return requireMarketContextExplicitInstant(
    value,
    field,
  ).canonical_timestamp;
}

function canonicalNullableInstant(
  value: unknown,
  field: string,
): string | null {
  if (value === null || value === undefined) return null;
  return canonicalInstant(value, field);
}

function normalizeProvider(
  provider: MarketContextProviderMetadata,
  field: string,
): MarketContextProviderMetadata {
  return {
    provider: provider.provider,
    source_timestamp: canonicalNullableInstant(
      provider.source_timestamp,
      `${field}.source_timestamp`,
    ),
    received_timestamp: canonicalNullableInstant(
      provider.received_timestamp,
      `${field}.received_timestamp`,
    ),
    expected_points: provider.expected_points,
    observed_points: provider.observed_points,
    missing_points: provider.missing_points,
    coverage: provider.coverage,
  };
}

function normalizeMetricPoint(
  point: MarketContextMetricPoint,
  field: string,
): MarketContextMetricPoint {
  return {
    timestamp: canonicalInstant(point.timestamp, field),
    close: point.close,
    return_pct: point.return_pct,
    moving_average_short: point.moving_average_short,
    moving_average_long: point.moving_average_long,
    momentum_pct: point.momentum_pct,
    trend_slope_pct: point.trend_slope_pct,
    realized_volatility_pct: point.realized_volatility_pct,
    range_pct: point.range_pct,
  };
}

function normalizeSectorPoint(
  point: SectorHorizonInput,
  field: string,
): SectorHorizonInput {
  return {
    timestamp: canonicalInstant(point.timestamp, field),
    return_pct: point.return_pct,
    spy_return_pct: point.spy_return_pct,
    relative_return_vs_spy_pct: point.relative_return_vs_spy_pct,
    trend_slope_pct: point.trend_slope_pct,
    realized_volatility_pct: point.realized_volatility_pct,
  };
}

function byStableJson(first: unknown, second: unknown) {
  return stableMarketContextShadowReplayJsonV1(first).localeCompare(
    stableMarketContextShadowReplayJsonV1(second),
  );
}

function normalizeSector(
  sector: MarketSectorBenchmarkInput,
): MarketSectorBenchmarkInput {
  const contextLevel = sector.context_level ?? "sector";
  const contextId = sector.industry_id ?? sector.sector_id;
  return {
    context_level: contextLevel,
    sector_id: sector.sector_id,
    industry_id: sector.industry_id ?? null,
    benchmark_symbol: sector.benchmark_symbol,
    short_horizon: sector.short_horizon
      .map((point) =>
        normalizeSectorPoint(
          point,
          `sector.${contextId}.short_horizon.point_timestamp`,
        ),
      )
      .sort(byStableJson),
    medium_horizon: sector.medium_horizon
      .map((point) =>
        normalizeSectorPoint(
          point,
          `sector.${contextId}.medium_horizon.point_timestamp`,
        ),
      )
      .sort(byStableJson),
    provider: normalizeProvider(
      sector.provider,
      `sector.${contextId}.provider`,
    ),
  };
}

function normalizeContextInput(
  input: MarketContextIntelligenceV2Input,
): MarketContextIntelligenceV2Input {
  const benchmarks = input.benchmarks
    .map((benchmark) => ({
      symbol: benchmark.symbol,
      intraday: benchmark.intraday
        .map((point) =>
          normalizeMetricPoint(
            point,
            `benchmark.${benchmark.symbol}.intraday.point_timestamp`,
          ),
        )
        .sort(byStableJson),
      multi_day: benchmark.multi_day
        .map((point) =>
          normalizeMetricPoint(
            point,
            `benchmark.${benchmark.symbol}.multi_day.point_timestamp`,
          ),
        )
        .sort(byStableJson),
      provider: normalizeProvider(
        benchmark.provider,
        `benchmark.${benchmark.symbol}.provider`,
      ),
    }))
    .sort((first, second) => {
      const bySymbol = first.symbol.localeCompare(second.symbol);
      return bySymbol !== 0 ? bySymbol : byStableJson(first, second);
    });
  const sectors = (input.sectors ?? [])
    .map(normalizeSector)
    .sort((first, second) => {
      const firstLevel = first.context_level ?? "sector";
      const secondLevel = second.context_level ?? "sector";
      const byLevel = firstLevel.localeCompare(secondLevel);
      if (byLevel !== 0) return byLevel;
      const firstId = first.industry_id ?? first.sector_id;
      const secondId = second.industry_id ?? second.sector_id;
      const byId = firstId.localeCompare(secondId);
      return byId !== 0 ? byId : byStableJson(first, second);
    });

  return {
    decision_timestamp: canonicalInstant(
      input.decision_timestamp,
      "decision_timestamp",
    ),
    benchmarks,
    breadth: input.breadth
      ? {
          timestamp: canonicalInstant(
            input.breadth.timestamp,
            "breadth.point_timestamp",
          ),
          advancing_fraction: input.breadth.advancing_fraction,
          above_short_average_fraction:
            input.breadth.above_short_average_fraction,
          expected_constituents: input.breadth.expected_constituents,
          observed_constituents: input.breadth.observed_constituents,
          coverage: input.breadth.coverage,
          provider: normalizeProvider(
            input.breadth.provider,
            "breadth.provider",
          ),
        }
      : null,
    sectors,
    sector_universe: input.sector_universe
      ? {
          expected_sector_ids: Array.from(
            new Set(
              input.sector_universe.expected_sector_ids
                .map((sectorId) => sectorId.trim())
                .filter(Boolean),
            ),
          ).sort((first, second) => first.localeCompare(second)),
        }
      : null,
  };
}

function assertIdentifier(value: unknown, field: string) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value !== value.trim()
  ) {
    throw new Error(
      `market_context_shadow_replay_v1_invalid_identifier:${field}`,
    );
  }
}

function normalizeDataset(
  dataset: MarketContextShadowReplayDatasetV1,
): MarketContextShadowReplayDatasetV1 {
  assertIdentifier(dataset.identity.dataset_id, "dataset.identity.dataset_id");
  assertIdentifier(
    dataset.identity.dataset_version,
    "dataset.identity.dataset_version",
  );
  if (
    dataset.identity.source_kind !== "synthetic_repository_fixture" &&
    dataset.identity.source_kind !== "offline_point_in_time"
  ) {
    throw new Error(
      "market_context_shadow_replay_v1_invalid_dataset_source_kind",
    );
  }

  const decisions = dataset.decisions
    .map((decision) => {
      assertIdentifier(decision.decision_id, "decision.decision_id");
      assertIdentifier(decision.ticker, "decision.ticker");
      assertIdentifier(decision.session_label, "decision.session_label");
      return {
        decision_id: decision.decision_id,
        ticker: decision.ticker,
        session_label: decision.session_label,
        context_input: normalizeContextInput(decision.context_input),
      };
    })
    .sort((first, second) => {
      const byTimestamp =
        first.context_input.decision_timestamp.localeCompare(
          second.context_input.decision_timestamp,
        );
      if (byTimestamp !== 0) return byTimestamp;
      const byTicker = first.ticker.localeCompare(second.ticker);
      if (byTicker !== 0) return byTicker;
      return first.decision_id.localeCompare(second.decision_id);
    });
  if (decisions.length === 0) {
    throw new Error(
      "market_context_shadow_replay_v1_empty_dataset",
    );
  }

  const seen = new Set<string>();
  for (const decision of decisions) {
    if (seen.has(decision.decision_id)) {
      throw new Error(
        `market_context_shadow_replay_v1_duplicate_decision_id:${decision.decision_id}`,
      );
    }
    seen.add(decision.decision_id);
  }

  return {
    identity: { ...dataset.identity },
    decisions,
  };
}

export function computeMarketContextShadowReplayDatasetDigestV1(
  dataset: MarketContextShadowReplayDatasetV1,
) {
  return sha256(
    stableMarketContextShadowReplayJsonV1(normalizeDataset(dataset)),
  );
}

export function sealMarketContextShadowReplayV1Input(
  input: Omit<MarketContextShadowReplayV1Input, "dataset_digest">,
): MarketContextShadowReplayV1Input {
  return {
    ...input,
    dataset_digest:
      computeMarketContextShadowReplayDatasetDigestV1(input.dataset),
  };
}

function cloneContext(
  input: MarketContextIntelligenceV2Input,
): MarketContextIntelligenceV1Input {
  return structuredClone(input);
}

type TimelineAudit = {
  observation_times: MarketContextShadowReplayObservationAuditV1[];
  provider_times: MarketContextShadowReplayProviderAuditV1[];
  duplicate_observations: number;
};

function timelineAudit(
  input: MarketContextIntelligenceV2Input,
): TimelineAudit {
  const decisionMs = Date.parse(input.decision_timestamp);
  const observations: MarketContextShadowReplayObservationAuditV1[] = [];
  const providers: MarketContextShadowReplayProviderAuditV1[] = [];

  function observation(
    sourceId: string,
    dataDomain: MarketContextShadowReplayObservationAuditV1["data_domain"],
    horizon: MarketContextShadowReplayObservationAuditV1["horizon"],
    timestamp: string,
  ) {
    observations.push({
      source_id: sourceId,
      data_domain: dataDomain,
      horizon,
      observation_timestamp: timestamp,
      point_in_time_status:
        Date.parse(timestamp) <= decisionMs ? "eligible" : "future_excluded",
    });
  }

  function provider(
    sourceId: string,
    dataDomain: MarketContextShadowReplayProviderAuditV1["data_domain"],
    metadata: MarketContextProviderMetadata,
  ) {
    const sourceMs =
      metadata.source_timestamp === null
        ? null
        : Date.parse(metadata.source_timestamp);
    const received = metadata.received_timestamp ?? null;
    providers.push({
      source_id: sourceId,
      data_domain: dataDomain,
      provider: metadata.provider,
      source_timestamp: metadata.source_timestamp,
      received_timestamp: received,
      source_point_in_time_status:
        sourceMs === null
          ? "missing"
          : sourceMs <= decisionMs
            ? "eligible"
            : "future_excluded",
      received_after_decision:
        received === null ? null : Date.parse(received) > decisionMs,
    });
  }

  for (const benchmark of input.benchmarks) {
    for (const point of benchmark.intraday) {
      observation(`index:${benchmark.symbol}`, "index", "intraday", point.timestamp);
    }
    for (const point of benchmark.multi_day) {
      observation(`index:${benchmark.symbol}`, "index", "multi_day", point.timestamp);
    }
    provider(`index:${benchmark.symbol}`, "index", benchmark.provider);
  }

  if (input.breadth) {
    observation("breadth:market", "breadth", "point", input.breadth.timestamp);
    provider("breadth:market", "breadth", input.breadth.provider);
  }

  for (const sector of input.sectors ?? []) {
    const contextLevel = sector.context_level ?? "sector";
    const contextId =
      contextLevel === "industry"
        ? (sector.industry_id ?? sector.sector_id)
        : sector.sector_id;
    const sourceId = `${contextLevel}:${contextId}`;
    for (const point of sector.short_horizon) {
      observation(sourceId, contextLevel, "short", point.timestamp);
    }
    for (const point of sector.medium_horizon) {
      observation(sourceId, contextLevel, "medium", point.timestamp);
    }
    provider(sourceId, contextLevel, sector.provider);
  }

  observations.sort(byStableJson);
  providers.sort(byStableJson);
  const observationKeys = new Map<string, number>();
  for (const item of observations) {
    const key = [
      item.source_id,
      item.horizon,
      item.observation_timestamp,
    ].join("|");
    observationKeys.set(key, (observationKeys.get(key) ?? 0) + 1);
  }

  return {
    observation_times: observations,
    provider_times: providers,
    duplicate_observations: Array.from(observationKeys.values()).reduce(
      (sum, count) => sum + Math.max(0, count - 1),
      0,
    ),
  };
}

function approximatelyEqual(first: number, second: number) {
  return Math.abs(first - second) <= 1e-9;
}

function thresholdBoundaryIds(
  input: MarketContextIntelligenceV2Input,
): string[] {
  const hitIds = new Set<string>();
  const decisionMs = Date.parse(input.decision_timestamp);
  const hit = (thresholdId: string, value: number | null | undefined) => {
    const threshold = MARKET_CONTEXT_THRESHOLD_REGISTRY_V2.find(
      (candidate) => candidate.threshold_id === thresholdId,
    );
    if (
      threshold?.status === "active" &&
      typeof value === "number" &&
      Number.isFinite(value) &&
      approximatelyEqual(Math.abs(value), Math.abs(threshold.value))
    ) {
      hitIds.add(thresholdId);
    }
  };
  const providerAge = (
    thresholdId: string,
    provider: MarketContextProviderMetadata,
  ) => {
    if (provider.source_timestamp === null) return;
    const sourceMs = Date.parse(provider.source_timestamp);
    if (sourceMs <= decisionMs) {
      hit(thresholdId, (decisionMs - sourceMs) / 60_000);
    }
  };
  const metricPoint = (point: MarketContextMetricPoint) => {
    if (Date.parse(point.timestamp) > decisionMs) return;
    hit("trend.strong_return_pct", point.return_pct);
    hit("trend.directional_return_pct", point.return_pct);
    hit("trend.strong_momentum_pct", point.momentum_pct);
    hit("trend.directional_momentum_pct", point.momentum_pct);
    hit("trend.directional_slope_pct", point.trend_slope_pct);
    hit("volatility_pct.low_upper_bound", point.realized_volatility_pct);
    hit("volatility_pct.normal_upper_bound", point.realized_volatility_pct);
    hit("volatility_pct.elevated_upper_bound", point.realized_volatility_pct);
  };

  for (const benchmark of input.benchmarks) {
    hit("minimum_coverage.essential_index", benchmark.provider.coverage);
    providerAge("freshness_minutes.multi_day", benchmark.provider);
    for (const point of [...benchmark.intraday, ...benchmark.multi_day]) {
      metricPoint(point);
    }
  }
  if (input.breadth) {
    hit("minimum_coverage.breadth", input.breadth.coverage);
    hit("breadth.broad_lower_bound", input.breadth.advancing_fraction);
    hit("breadth.broad_lower_bound", input.breadth.above_short_average_fraction);
    hit("breadth.weak_upper_bound", input.breadth.advancing_fraction);
    hit("breadth.weak_upper_bound", input.breadth.above_short_average_fraction);
    providerAge("freshness_minutes.breadth", input.breadth.provider);
  }
  for (const sector of input.sectors ?? []) {
    hit("minimum_coverage.sector", sector.provider.coverage);
    providerAge("freshness_minutes.sector_medium", sector.provider);
    const eligibleShort = sector.short_horizon
      .filter((point) => Date.parse(point.timestamp) <= decisionMs)
      .sort((first, second) => second.timestamp.localeCompare(first.timestamp));
    const eligibleMedium = sector.medium_horizon
      .filter((point) => Date.parse(point.timestamp) <= decisionMs)
      .sort((first, second) => second.timestamp.localeCompare(first.timestamp));
    for (const point of eligibleShort) {
      hit(
        "sector_relative_return_pct.short_directional",
        point.relative_return_vs_spy_pct,
      );
    }
    for (const point of eligibleMedium) {
      hit(
        "sector_relative_return_pct.medium_directional",
        point.relative_return_vs_spy_pct,
      );
    }
    const short = eligibleShort[0]?.relative_return_vs_spy_pct;
    const medium = eligibleMedium[0]?.relative_return_vs_spy_pct;
    if (typeof short === "number" && typeof medium === "number") {
      hit(
        "sector_relative_return_pct.acceleration_delta",
        short - medium,
      );
    }
  }

  return Array.from(hitIds).sort((first, second) =>
    first.localeCompare(second),
  );
}

function decisionOutput(
  replayId: string,
  dataset: MarketContextShadowReplayDatasetV1,
  datasetDigest: string,
  producerVersions: MarketContextProducerVersionMetadata,
  decision: MarketContextShadowReplayDecisionInputV1,
): {
  output: MarketContextShadowReplayDecisionOutputV1;
  bridge: ReadyBridgeEnvelope;
} {
  const inputFingerprint = JSON.stringify(decision.context_input);
  const v1 = buildMarketContextIntelligenceV1(
    cloneContext(decision.context_input),
  );
  const v2 = buildMarketContextIntelligenceV2(
    structuredClone(decision.context_input),
  );
  const audit = timelineAudit(decision.context_input);
  const replayBoundary = {
    future_observations_excluded: audit.observation_times.filter(
      (item) => item.point_in_time_status === "future_excluded",
    ).length,
    future_provider_source_timestamps_excluded: audit.provider_times.filter(
      (item) => item.source_point_in_time_status === "future_excluded",
    ).length,
    invalid_timestamps_rejected: 0 as const,
  };

  if (
    v1.leakage_control.future_points_excluded !==
      replayBoundary.future_observations_excluded ||
    v2.leakage_control.future_points_excluded !==
      replayBoundary.future_observations_excluded ||
    v1.leakage_control.future_provider_timestamps_excluded !==
      replayBoundary.future_provider_source_timestamps_excluded ||
    v2.leakage_control.future_provider_timestamps_excluded !==
      replayBoundary.future_provider_source_timestamps_excluded
  ) {
    throw new Error(
      `market_context_shadow_replay_v1_leakage_counter_mismatch:${decision.decision_id}`,
    );
  }

  const bridge = buildLosslessMarketContextShadowBridge({
    context: v2,
    producer_versions: { ...producerVersions },
  });
  if (bridge.binding_status !== "shadow_bridge_ready") {
    throw new Error(
      `market_context_shadow_replay_v1_not_exportable:${bridge.validation_errors.join(",")}`,
    );
  }

  const canonicalDecisionInputDigest = sha256(
    stableMarketContextShadowReplayJsonV1(decision),
  );
  const core = {
    replay_identity: {
      replay_id: replayId,
      decision_id: decision.decision_id,
      ticker: decision.ticker,
      session_label: decision.session_label,
      dataset_id: dataset.identity.dataset_id,
      dataset_version: dataset.identity.dataset_version,
      dataset_digest: datasetDigest,
    },
    decision_instant: decision.context_input.decision_timestamp,
    canonical_decision_input_digest: canonicalDecisionInputDigest,
    v1_evaluation: {
      context_version: v1.context_version,
      threshold_version: v1.threshold_version,
      classification: v1.regime_classification,
      dimensions: { ...v1.dimensions },
      evidence_strength: v1.evidence_strength,
      reason_codes: [...v1.reason_codes],
    },
    v2_evaluation: {
      context_version: v2.context_version,
      threshold_version: v2.threshold_version,
      classification: v2.regime_classification,
      dimensions: { ...v2.dimensions },
      sector_context: v2.sectors.map((sector) => ({
        ...sector,
        reason_codes: [...sector.reason_codes],
      })),
      freshness: {
        ...v2.freshness,
        stale_source_ids: [...v2.freshness.stale_source_ids],
      },
      coverage: { ...v2.coverage },
      evidence_strength: v2.evidence_strength,
      confidence: { ...v2.confidence },
      provider_timestamps: v2.provider_timestamps.map((provider) => ({
        ...provider,
      })),
      reason_codes: [...v2.reason_codes],
    },
    classification_comparison: {
      agreement: v1.regime_classification === v2.regime_classification,
      status:
        v1.regime_classification === v2.regime_classification
          ? ("unchanged" as const)
          : ("changed" as const),
      v1_classification: v1.regime_classification,
      v2_classification: v2.regime_classification,
    },
    point_in_time_audit: audit,
    leakage_control: {
      replay_boundary: replayBoundary,
      v1: { ...v1.leakage_control },
      v2: { ...v2.leakage_control },
    },
    threshold_boundary_ids: thresholdBoundaryIds(decision.context_input),
    input_immutability: {
      status: "verified" as const,
    },
    shadow_only: true as const,
    live_ranking_effect: false as const,
  };

  if (JSON.stringify(decision.context_input) !== inputFingerprint) {
    throw new Error(
      `market_context_shadow_replay_v1_input_mutated:${decision.decision_id}`,
    );
  }

  return {
    output: {
      ...core,
      evidence_digest: sha256(
        stableMarketContextShadowReplayJsonV1(core),
      ),
    },
    bridge,
  };
}

function countedMatrix<T extends string>(
  values: Array<{ key: string; value: T }>,
) {
  const counts = new Map<string, { value: T; count: number }>();
  for (const entry of values) {
    const current = counts.get(entry.key);
    counts.set(entry.key, {
      value: entry.value,
      count: (current?.count ?? 0) + 1,
    });
  }
  return Array.from(counts.values()).sort((first, second) =>
    String(first.value).localeCompare(String(second.value)),
  );
}

function diagnostics(
  decisions: MarketContextShadowReplayDecisionOutputV1[],
): MarketContextShadowReplayDiagnosticsV1 {
  const transitionCounts = new Map<
    string,
    {
      from: MarketContextRegimeClassification;
      to: MarketContextRegimeClassification;
      count: number;
    }
  >();
  const byTicker = new Map<string, MarketContextShadowReplayDecisionOutputV1[]>();
  for (const decision of decisions) {
    const existing = byTicker.get(decision.replay_identity.ticker) ?? [];
    existing.push(decision);
    byTicker.set(decision.replay_identity.ticker, existing);
  }
  for (const tickerDecisions of byTicker.values()) {
    tickerDecisions.sort((first, second) => {
      const byInstant = first.decision_instant.localeCompare(
        second.decision_instant,
      );
      return byInstant !== 0
        ? byInstant
        : first.replay_identity.decision_id.localeCompare(
            second.replay_identity.decision_id,
          );
    });
    for (let index = 1; index < tickerDecisions.length; index += 1) {
      const previous = tickerDecisions[index - 1];
      const current = tickerDecisions[index];
      if (!previous || !current) continue;
      const from = previous.v2_evaluation.classification;
      const to = current.v2_evaluation.classification;
      const key = `${from}|${to}`;
      const existing = transitionCounts.get(key);
      transitionCounts.set(key, {
        from,
        to,
        count: (existing?.count ?? 0) + 1,
      });
    }
  }

  const versionCounts = new Map<
    string,
    {
      v1: MarketContextRegimeClassification;
      v2: MarketContextRegimeClassification;
      agreement: boolean;
      count: number;
    }
  >();
  for (const decision of decisions) {
    const comparison = decision.classification_comparison;
    const key = `${comparison.v1_classification}|${comparison.v2_classification}`;
    const existing = versionCounts.get(key);
    versionCounts.set(key, {
      v1: comparison.v1_classification,
      v2: comparison.v2_classification,
      agreement: comparison.agreement,
      count: (existing?.count ?? 0) + 1,
    });
  }

  const regimeCounts = countedMatrix(
    decisions.map((decision) => ({
      key: decision.v2_evaluation.classification,
      value: decision.v2_evaluation.classification,
    })),
  ).map(({ value, count }) => ({ classification: value, count }));
  const allSectors = decisions.flatMap(
    (decision) => decision.v2_evaluation.sector_context,
  );
  const sectorCounts = countedMatrix(
    allSectors.map((sector) => ({
      key: sector.classification,
      value: sector.classification,
    })),
  ).map(({ value, count }) => ({ classification: value, count }));
  const measurableDecisions = decisions.filter(
    (decision) =>
      decision.v2_evaluation.classification !== "insufficient_data",
  ).length;
  const sectorCoverageValues = allSectors.map((sector) => sector.coverage);
  const boundaryCounts = new Map<string, number>();
  for (const decision of decisions) {
    for (const thresholdId of decision.threshold_boundary_ids) {
      boundaryCounts.set(
        thresholdId,
        (boundaryCounts.get(thresholdId) ?? 0) + 1,
      );
    }
  }
  const uniqueDays = Array.from(
    new Set(decisions.map((decision) => decision.decision_instant.slice(0, 10))),
  ).sort();
  const uniqueTickers = Array.from(
    new Set(decisions.map((decision) => decision.replay_identity.ticker)),
  ).sort();

  return {
    classification_transition_matrix: Array.from(
      transitionCounts.values(),
    ).sort((first, second) => {
      const byFrom = first.from.localeCompare(second.from);
      return byFrom !== 0 ? byFrom : first.to.localeCompare(second.to);
    }),
    version_comparison_matrix: Array.from(versionCounts.values()).sort(
      (first, second) => {
        const byV1 = first.v1.localeCompare(second.v1);
        return byV1 !== 0 ? byV1 : first.v2.localeCompare(second.v2);
      },
    ),
    regime_coverage: {
      total_decisions: decisions.length,
      measurable_decisions: measurableDecisions,
      measurable_fraction:
        decisions.length === 0
          ? 0
          : Number((measurableDecisions / decisions.length).toFixed(4)),
      by_classification: regimeCounts,
    },
    sector_coverage: {
      decisions_with_sector_context: decisions.filter(
        (decision) => decision.v2_evaluation.sector_context.length > 0,
      ).length,
      total_contexts: allSectors.length,
      ranked_contexts: allSectors.filter(
        (sector) => sector.rank_status === "ranked",
      ).length,
      not_rankable_contexts: allSectors.filter(
        (sector) => sector.rank_status === "not_rankable",
      ).length,
      mean_coverage:
        sectorCoverageValues.length === 0
          ? null
          : Number(
              (
                sectorCoverageValues.reduce(
                  (sum, coverage) => sum + coverage,
                  0,
                ) / sectorCoverageValues.length
              ).toFixed(4),
            ),
      by_classification: sectorCounts,
    },
    insufficient_count: decisions.filter(
      (decision) =>
        decision.v2_evaluation.classification === "insufficient_data",
    ).length,
    conflicting_count: decisions.filter(
      (decision) =>
        decision.v2_evaluation.classification === "conflicting_context",
    ).length,
    provider_gap_count: decisions.filter(
      (decision) =>
        decision.v2_evaluation.dimensions.data_quality_state ===
        "provider_gap",
    ).length,
    threshold_boundary_frequency: MARKET_CONTEXT_THRESHOLD_REGISTRY_V2.map(
      (threshold) => {
        const decisionHits = boundaryCounts.get(threshold.threshold_id) ?? 0;
        return {
          threshold_id: threshold.threshold_id,
          value: threshold.value,
          status: threshold.status,
          classification_effect: threshold.classification_effect,
          decision_hits: decisionHits,
          decision_frequency:
            decisions.length === 0
              ? 0
              : Number((decisionHits / decisions.length).toFixed(4)),
        };
      },
    ),
    unique_counts: {
      decisions: decisions.length,
      days: uniqueDays.length,
      tickers: uniqueTickers.length,
    },
    unique_days: uniqueDays,
    unique_tickers: uniqueTickers,
    canonical_outcomes_joined: false,
    performance_claims_allowed: false,
    prohibited_metrics: ["win_rate", "expectancy", "precision_at_k"],
  };
}

function producerVersions(
  value: MarketContextProducerVersionMetadata,
): MarketContextProducerVersionMetadata {
  return {
    engine_version: value.engine_version,
    scoring_version: value.scoring_version,
    ranking_version: value.ranking_version,
    setup_taxonomy_version: value.setup_taxonomy_version,
    confidence_contract_version: value.confidence_contract_version,
    evaluator_version: value.evaluator_version,
    provider_contract_version: value.provider_contract_version,
    git_commit: value.git_commit,
    build_identity: value.build_identity,
  };
}

export function runMarketContextShadowReplayV1(
  input: MarketContextShadowReplayV1Input,
): MarketContextShadowReplayV1Output {
  const inputFingerprint = JSON.stringify(input);
  assertIdentifier(input.replay_id, "replay_id");
  if (!/^[0-9a-f]{64}$/.test(input.dataset_digest)) {
    throw new Error(
      "market_context_shadow_replay_v1_invalid_dataset_digest_format",
    );
  }
  const dataset = normalizeDataset(input.dataset);
  const expectedDatasetDigest =
    computeMarketContextShadowReplayDatasetDigestV1(dataset);
  if (input.dataset_digest !== expectedDatasetDigest) {
    throw new Error(
      "market_context_shadow_replay_v1_dataset_digest_mismatch",
    );
  }
  const versions = producerVersions(input.producer_versions);
  const evaluated = dataset.decisions.map((decision) =>
    decisionOutput(
      input.replay_id,
      dataset,
      expectedDatasetDigest,
      versions,
      decision,
    ),
  );
  const decisions = evaluated.map((result) => result.output);
  const replayDiagnostics = diagnostics(decisions);
  const bridgeExport: MarketContextShadowReplayBridgeExportV1 = {
    export_format_version: MARKET_CONTEXT_SHADOW_REPLAY_EXPORT_VERSION,
    replay_contract_version: MARKET_CONTEXT_SHADOW_REPLAY_VERSION,
    bridge_schema_version: MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION,
    adapter_version: MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2,
    binding_status: "inactive_unbound",
    intended_future_boundary: "market_context_canonical_bridge_schema_v1",
    actual_canonical_binding: null,
    canonical_binding_ready: false,
    capture_enabled: false,
    persistence_enabled: false,
    database_relation: null,
    records: evaluated.map((result, index) => ({
      decision_id: decisions[index]?.replay_identity.decision_id ?? "",
      ticker: decisions[index]?.replay_identity.ticker ?? "",
      bridge: result.bridge,
    })),
    shadow_only: true,
    live_ranking_effect: false,
  };
  const canonicalInputDigest = sha256(
    stableMarketContextShadowReplayJsonV1({
      replay_id: input.replay_id,
      dataset,
      dataset_digest: expectedDatasetDigest,
      producer_versions: versions,
    }),
  );
  const evidenceCore = {
    replay_contract_version: MARKET_CONTEXT_SHADOW_REPLAY_VERSION,
    replay_id: input.replay_id,
    dataset_digest: expectedDatasetDigest,
    decision_evidence_digests: decisions.map(
      (decision) => decision.evidence_digest,
    ),
    diagnostics: replayDiagnostics,
    bridge_export: bridgeExport,
  };
  const replayEvidenceDigest = sha256(
    stableMarketContextShadowReplayJsonV1(evidenceCore),
  );

  if (JSON.stringify(input) !== inputFingerprint) {
    throw new Error("market_context_shadow_replay_v1_input_mutated");
  }

  return {
    replay_contract_version: MARKET_CONTEXT_SHADOW_REPLAY_VERSION,
    canonicalization_version:
      MARKET_CONTEXT_SHADOW_REPLAY_CANONICALIZATION_VERSION,
    replay_identity: {
      replay_id: input.replay_id,
      dataset_id: dataset.identity.dataset_id,
      dataset_version: dataset.identity.dataset_version,
      dataset_source_kind: dataset.identity.source_kind,
      dataset_digest: expectedDatasetDigest,
    },
    decisions,
    diagnostics: replayDiagnostics,
    bridge_export: bridgeExport,
    reproducibility: {
      canonical_input_digest: canonicalInputDigest,
      replay_evidence_digest: replayEvidenceDigest,
      byte_serialization:
        MARKET_CONTEXT_SHADOW_REPLAY_CANONICALIZATION_VERSION,
      deterministic: true,
    },
    performance_claims: {
      status: "not_computed",
      reason: "joinable_canonical_outcomes_required",
    },
    canonical_binding_ready: false,
    shadow_only: true,
    live_ranking_effect: false,
  };
}
