import { expect, test } from "@playwright/test";

import { buildRecommendationDecisionEvidenceReadback } from "@/lib/recommendation-decision-evidence-readback";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";

const FEATURE_VECTOR = {
  contract_version: "recommendation_decision_feature_vector_v1",
  feature_values: {
    latest_price: 100,
    daily_volume_ratio: 1.8,
    daily_distance_to_20d_high: -2.5,
    daily_change_5d_percent: 4.2,
    intraday_recent_change_percent: 1.1,
    intraday_recent_range_position: 0.7,
    intraday_recent_volume_ratio: 1.4,
    intraday_average_range_percent: 2.8,
    intraday_latest_range_percent: 3.1,
    intraday_range_expansion_ratio: 1.2,
    intraday_vwap: 99,
    intraday_price_vs_vwap_percent: 1,
    intraday_recent_range_percent: 3,
    intraday_momentum_percent: 2,
    intraday_latest_volume: 1800,
    intraday_average_volume: 1000,
    planned_risk_reward: 2.5,
    scanner_local_score: 96,
  },
  explicit_unavailable_feature_names: [],
} as const;

function snapshotFor({
  ticker,
  decidedAt,
  sourceMode = "supabase",
  isDemo = false,
  isMock = false,
  payload = {},
}: {
  ticker: string;
  decidedAt: string;
  sourceMode?: string;
  isDemo?: boolean;
  isMock?: boolean;
  payload?: Record<string, unknown>;
}) {
  return buildRecommendationSnapshot({
    recommendation_id: `rec_${ticker.toLowerCase()}`,
    ticker,
    recommended_at: decidedAt,
    app_timestamp: decidedAt,
    created_at: decidedAt,
    source_mode: sourceMode,
    is_demo: isDemo,
    is_mock: isMock,
    is_real: !isDemo && !isMock,
    entry: 100,
    stop: 96,
    target: 108,
    side: "long",
    payload: {
      data_timestamp: "2026-09-17T14:29:00.000Z",
      intraday_indicator_response_identity: {
        contract_version: "twelve_data_response_identity_v1",
        digest_algorithm: "sha256",
        payload_sha256: `sha256:${"a".repeat(64)}`,
        payload_byte_length: 214,
      },
      decision_feature_vector: FEATURE_VECTOR,
      provider_source: "twelve_data",
      provider_version: "twelve_data_test_contract_v1",
      market_data_adapter_version: "automation_scan_market_data_adapter_v1",
      build_marker: "test-build-marker-v1",
      ...payload,
    },
  });
}

test("reads the newest bounded server-owned decision-time evidence without raw provider material", () => {
  const oldest = snapshotFor({
    ticker: "OLD",
    decidedAt: "2026-09-17T14:30:00.000Z",
  });
  const middle = snapshotFor({
    ticker: "MID",
    decidedAt: "2026-09-17T14:45:00.000Z",
  });
  const newest = snapshotFor({
    ticker: "NEW",
    decidedAt: "2026-09-17T15:00:00.000Z",
  });

  const readback = buildRecommendationDecisionEvidenceReadback({
    snapshots: [oldest, newest, middle],
    limit: 2,
  });

  expect(readback).toMatchObject({
    contract_version: "recommendation_decision_evidence_readback_v1",
    status: "available",
    considered_snapshot_count: 3,
    server_owned_snapshot_count: 3,
    excluded_non_server_owned_snapshot_count: 0,
    entries: [
      {
        ticker: "NEW",
        decision_timestamp: "2026-09-17T15:00:00.000Z",
        source_timestamp: "2026-09-17T14:29:00.000Z",
        status: "admissible",
        intraday_indicator_response_identity: {
          payload_byte_length: 214,
          payload_sha256: `sha256:${"a".repeat(64)}`,
        },
        decision_feature_vector: FEATURE_VECTOR,
      },
      { ticker: "MID", status: "admissible" },
    ],
  });
  expect(readback.entries).toHaveLength(2);
  expect(JSON.stringify(readback)).not.toContain("raw_provider_response");
  expect(JSON.stringify(readback.entries[0])).not.toHaveProperty(
    "payload_json",
  );
});

test("preserves malformed decision inputs as explicit incomplete evidence instead of rendering them", () => {
  const incomplete = snapshotFor({
    ticker: "GAP",
    decidedAt: "2026-09-17T15:00:00.000Z",
    payload: {
      decision_feature_vector: {
        ...FEATURE_VECTOR,
        raw_provider_response: "must never be retained in decision evidence",
      },
    },
  });

  const readback = buildRecommendationDecisionEvidenceReadback({
    snapshots: [incomplete],
  });

  expect(readback).toMatchObject({
    status: "partial",
    entries: [
      {
        ticker: "GAP",
        status: "incomplete",
        decision_feature_vector: null,
        blockers: ["decision_feature_vector_missing_or_invalid"],
      },
    ],
  });
  expect(JSON.stringify(readback)).not.toContain(
    "must never be retained in decision evidence",
  );
});

test("excludes diagnostic, demo, mock and non-server-owned snapshots from decision evidence", () => {
  const readback = buildRecommendationDecisionEvidenceReadback({
    snapshots: [
      snapshotFor({
        ticker: "DEMO",
        decidedAt: "2026-09-17T15:00:00.000Z",
        sourceMode: "demo",
        isDemo: true,
      }),
      snapshotFor({
        ticker: "MOCK",
        decidedAt: "2026-09-17T15:00:00.000Z",
        isMock: true,
      }),
      snapshotFor({
        ticker: "LOCAL",
        decidedAt: "2026-09-17T15:00:00.000Z",
        sourceMode: "local_storage",
      }),
      snapshotFor({
        ticker: "DIAG",
        decidedAt: "2026-09-17T15:00:00.000Z",
        payload: { diagnostic_mode: true },
      }),
    ],
  });

  expect(readback).toEqual({
    contract_version: "recommendation_decision_evidence_readback_v1",
    status: "unavailable",
    considered_snapshot_count: 4,
    server_owned_snapshot_count: 0,
    excluded_non_server_owned_snapshot_count: 4,
    entries: [],
  });
});
