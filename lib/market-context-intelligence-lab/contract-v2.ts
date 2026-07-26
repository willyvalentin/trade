import {
  buildMarketContextIntelligenceV1,
  type MarketContextIntelligenceV1Input,
  type MarketContextIntelligenceV1Output,
} from "./contract-v1";
import {
  requireMarketContextExplicitInstant,
  type ExplicitInstantResult,
} from "./explicit-instant-v1";
import { MARKET_CONTEXT_THRESHOLD_VERSION_V2 } from "./thresholds-v2";

export const MARKET_CONTEXT_INTELLIGENCE_VERSION_V2 =
  "market_context_intelligence_v2" as const;

export type MarketContextIntelligenceV2Input =
  MarketContextIntelligenceV1Input;

export type MarketContextIntelligenceV2Output = Omit<
  MarketContextIntelligenceV1Output,
  "context_version" | "threshold_version"
> & {
  context_version: typeof MARKET_CONTEXT_INTELLIGENCE_VERSION_V2;
  threshold_version: typeof MARKET_CONTEXT_THRESHOLD_VERSION_V2;
};

type TimestampCandidate = {
  field: string;
  value: unknown;
  nullable?: boolean;
};

function providerTimestampCandidates(
  sourceId: string,
  provider: {
    source_timestamp: string | null;
    received_timestamp?: string | null;
  },
): TimestampCandidate[] {
  return [
    {
      field: `${sourceId}.provider.source_timestamp`,
      value: provider.source_timestamp,
      nullable: true,
    },
    {
      field: `${sourceId}.provider.received_timestamp`,
      value: provider.received_timestamp ?? null,
      nullable: true,
    },
  ];
}

function timestampCandidates(
  input: MarketContextIntelligenceV2Input,
): TimestampCandidate[] {
  const candidates: TimestampCandidate[] = [];

  for (const benchmark of input.benchmarks) {
    for (const point of benchmark.intraday) {
      candidates.push({
        field: `benchmark.${benchmark.symbol}.intraday.point_timestamp`,
        value: point.timestamp,
      });
    }
    for (const point of benchmark.multi_day) {
      candidates.push({
        field: `benchmark.${benchmark.symbol}.multi_day.point_timestamp`,
        value: point.timestamp,
      });
    }
    candidates.push(
      ...providerTimestampCandidates(
        `benchmark.${benchmark.symbol}`,
        benchmark.provider,
      ),
    );
  }

  if (input.breadth) {
    candidates.push({
      field: "breadth.point_timestamp",
      value: input.breadth.timestamp,
    });
    candidates.push(
      ...providerTimestampCandidates("breadth", input.breadth.provider),
    );
  }

  for (const sector of input.sectors ?? []) {
    const contextId =
      sector.context_level === "industry"
        ? (sector.industry_id ?? sector.sector_id)
        : sector.sector_id;
    for (const point of sector.short_horizon) {
      candidates.push({
        field: `sector.${contextId}.short_horizon.point_timestamp`,
        value: point.timestamp,
      });
    }
    for (const point of sector.medium_horizon) {
      candidates.push({
        field: `sector.${contextId}.medium_horizon.point_timestamp`,
        value: point.timestamp,
      });
    }
    candidates.push(
      ...providerTimestampCandidates(
        `sector.${contextId}`,
        sector.provider,
      ),
    );
  }

  return candidates.sort((first, second) => {
    const byField = first.field.localeCompare(second.field);
    if (byField !== 0) return byField;
    return String(first.value).localeCompare(String(second.value));
  });
}

function validateCandidate(candidate: TimestampCandidate) {
  if (candidate.value === null && candidate.nullable) return;
  requireMarketContextExplicitInstant(candidate.value, candidate.field);
}

export function validateMarketContextV2ExplicitInstants(
  input: MarketContextIntelligenceV2Input,
): ExplicitInstantResult {
  const decision = requireMarketContextExplicitInstant(
    input.decision_timestamp,
    "decision_timestamp",
  );
  for (const candidate of timestampCandidates(input)) {
    validateCandidate(candidate);
  }
  return decision;
}

export function buildMarketContextIntelligenceV2(
  input: MarketContextIntelligenceV2Input,
): MarketContextIntelligenceV2Output {
  validateMarketContextV2ExplicitInstants(input);
  const v1Output = buildMarketContextIntelligenceV1(input);

  return {
    ...v1Output,
    context_version: MARKET_CONTEXT_INTELLIGENCE_VERSION_V2,
    threshold_version: MARKET_CONTEXT_THRESHOLD_VERSION_V2,
  };
}
