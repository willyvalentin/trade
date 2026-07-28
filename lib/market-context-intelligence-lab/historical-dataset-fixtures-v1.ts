import {
  MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_VERSION,
  MARKET_CONTEXT_HISTORICAL_DATASET_VERSION,
  buildMarketContextHistoricalRawFileDescriptorV1,
  computeMarketContextHistoricalRawDigestV1,
  type MarketContextHistoricalDatasetSourceManifestV1,
} from "./historical-dataset-v1";

export const MARKET_CONTEXT_HISTORICAL_DATASET_FIXTURE_VERSION =
  "market_context_historical_dataset_synthetic_fixtures_v1" as const;

type FixtureFile = {
  file_id: string;
  raw_bytes: string;
};

type MutableFixture = {
  manifest: MarketContextHistoricalDatasetSourceManifestV1;
  rows_by_file: Record<string, Array<Record<string, unknown>>>;
};

export type MarketContextHistoricalDatasetSyntheticFixtureV1 = {
  id: string;
  manifest: MarketContextHistoricalDatasetSourceManifestV1;
  manifest_bytes: string;
  files: FixtureFile[];
  expected_status: "admissible" | "rejected";
  expected_error_codes: string[];
};

const decisionTimestamp = "2026-07-24T20:00:00.000Z";
const earlierTimestamp = "2026-07-24T19:50:00.000Z";
const laterTimestamp = "2026-07-24T19:55:00.000Z";
const earlierReceived = "2026-07-24T19:51:00.000Z";
const laterReceived = "2026-07-24T19:56:00.000Z";

function common(
  observationTimestamp: string,
  receivedTimestamp: string,
) {
  return {
    decision_id: "decision-aapl-2026-07-24-close",
    ticker: "AAPL",
    decision_timestamp: decisionTimestamp,
    provider: "synthetic_fixture_provider",
    observation_timestamp: observationTimestamp,
    provider_source_timestamp: observationTimestamp,
    received_timestamp: receivedTimestamp,
    received_timestamp_absence_reason: null,
  };
}

function candle(
  domain: "benchmark" | "sector",
  contextId: string,
  symbol: string,
  observationTimestamp: string,
  receivedTimestamp: string,
  close: number,
) {
  return {
    ...common(observationTimestamp, receivedTimestamp),
    row_type: "candle",
    domain,
    context_id: contextId,
    symbol,
    interval: "5min",
    open: close - 0.2,
    high: close + 0.4,
    low: close - 0.4,
    close,
    volume: 1000,
    adjustment_state: "split_adjusted",
  };
}

function baseManifest(): MarketContextHistoricalDatasetSourceManifestV1 {
  return {
    contract_version: MARKET_CONTEXT_HISTORICAL_DATASET_VERSION,
    identity: {
      dataset_id: "synthetic-market-context-admission-complete",
      dataset_version:
        MARKET_CONTEXT_HISTORICAL_DATASET_FIXTURE_VERSION,
    },
    source: {
      provider: "synthetic_fixture_provider",
      provenance: {
        status: "documented",
        description:
          "Deterministic repository-generated rows for contract testing only.",
        source_reference:
          "lib/market-context-intelligence-lab/historical-dataset-fixtures-v1.ts",
      },
      usage_rights: {
        status: "documented_permitted",
        basis:
          "Repository-owned synthetic fixture approved only for local tests.",
        internal_research_and_replay_allowed: true,
      },
    },
    acquisition: {
      timestamp: "2026-07-25T12:00:00.000Z",
      method: "repository_synthetic_fixture",
    },
    normalizer_version:
      MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_VERSION,
    date_range: {
      start: "2026-07-24",
      end: "2026-07-24",
      basis: "observation_utc_date",
    },
    universe: {
      tickers: ["AAPL"],
      benchmark_symbols: ["SPY", "QQQ"],
      breadth: {
        required: true,
        source_id: "synthetic-us-equity-breadth",
        expected_constituents: 500,
      },
      contexts: [
        {
          level: "sector",
          context_id: "financials",
          benchmark_symbol: "XLF",
        },
        {
          level: "sector",
          context_id: "technology",
          benchmark_symbol: "XLK",
        },
      ],
    },
    candle: {
      interval: "5min",
      timezone: "America/New_York",
      session_calendar_policy:
        "repository_us_equity_market_calendar_v1_regular_session",
    },
    timestamp_policy: {
      observation_timestamp: "explicit_instant_required",
      provider_source_timestamp: "explicit_instant_required",
      received_timestamp: "required",
      received_timestamp_absence_reason: null,
    },
    corporate_actions: {
      policy_documented: true,
      split_policy:
        "provider_split_adjusted_series_with_adjustment_state_per_row",
      dividend_policy: "price_series_not_dividend_adjusted",
      adjustment_state: "split_adjusted",
    },
    quality: {
      expected_rows_by_domain: {
        benchmark: 4,
        breadth: 1,
        sector: 4,
        industry: 0,
      },
      minimum_coverage_by_domain: {
        benchmark: 1,
        breadth: 1,
        sector: 1,
        industry: 1,
      },
      missingness_policy:
        "no_implicit_fill_forward_and_every_gap_reported",
      duplicate_policy: "reject",
      out_of_order_policy: "sort_and_report",
    },
    point_in_time: {
      attested: true,
      attestation:
        "Every fixture observation and provider timestamp is available no later than its decision instant.",
      future_observation_policy: "reject",
      future_provider_source_policy: "reject",
      received_after_decision_policy: "reject",
    },
    sensitive_identifiers: {
      policy: "reject",
      sanitized: true,
      sanitization_attestation:
        "Synthetic fixture contains no provider run, request, account, user, trace, credential, or production identifiers.",
    },
    raw_files: [],
    immutable_raw_digest: "",
  };
}

function baseRows() {
  return {
    "benchmarks-and-breadth": [
      candle(
        "benchmark",
        "SPY",
        "SPY",
        earlierTimestamp,
        earlierReceived,
        600,
      ),
      candle(
        "benchmark",
        "SPY",
        "SPY",
        laterTimestamp,
        laterReceived,
        601,
      ),
      candle(
        "benchmark",
        "QQQ",
        "QQQ",
        earlierTimestamp,
        earlierReceived,
        520,
      ),
      candle(
        "benchmark",
        "QQQ",
        "QQQ",
        laterTimestamp,
        laterReceived,
        521,
      ),
      {
        ...common(laterTimestamp, laterReceived),
        row_type: "breadth",
        domain: "breadth",
        context_id: "synthetic-us-equity-breadth",
        expected_constituents: 500,
        observed_constituents: 500,
        advancing_fraction: 0.62,
        above_short_average_fraction: 0.58,
      },
    ],
    "sector-benchmarks": [
      candle(
        "sector",
        "technology",
        "XLK",
        earlierTimestamp,
        earlierReceived,
        240,
      ),
      candle(
        "sector",
        "technology",
        "XLK",
        laterTimestamp,
        laterReceived,
        241,
      ),
      candle(
        "sector",
        "financials",
        "XLF",
        earlierTimestamp,
        earlierReceived,
        55,
      ),
      candle(
        "sector",
        "financials",
        "XLF",
        laterTimestamp,
        laterReceived,
        55.2,
      ),
    ],
  };
}

function sealFixture(
  id: string,
  expectedStatus: "admissible" | "rejected",
  expectedErrorCodes: string[],
  mutate?: (fixture: MutableFixture) => void,
  tamperRawDigest = false,
): MarketContextHistoricalDatasetSyntheticFixtureV1 {
  const mutable: MutableFixture = {
    manifest: baseManifest(),
    rows_by_file: structuredClone(baseRows()),
  };
  mutate?.(mutable);
  const files = Object.entries(mutable.rows_by_file)
    .map(([fileId, rows]) => ({
      file_id: fileId,
      raw_bytes: `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`,
    }))
    .sort((first, second) => first.file_id.localeCompare(second.file_id));
  mutable.manifest.raw_files = files.map((file) =>
    buildMarketContextHistoricalRawFileDescriptorV1(
      file.file_id,
      file.raw_bytes,
    ),
  );
  mutable.manifest.immutable_raw_digest =
    computeMarketContextHistoricalRawDigestV1(
      mutable.manifest.raw_files,
    );
  if (tamperRawDigest) {
    mutable.manifest.immutable_raw_digest = "0".repeat(64);
  }
  return {
    id,
    manifest: mutable.manifest,
    manifest_bytes: `${JSON.stringify(mutable.manifest, null, 2)}\n`,
    files,
    expected_status: expectedStatus,
    expected_error_codes: expectedErrorCodes,
  };
}

function removeRows(
  fixture: MutableFixture,
  predicate: (row: Record<string, unknown>) => boolean,
) {
  for (const [fileId, rows] of Object.entries(fixture.rows_by_file)) {
    fixture.rows_by_file[fileId] = rows.filter(
      (row) => !predicate(row),
    );
  }
}

export const marketContextHistoricalDatasetSyntheticFixturesV1 = [
  sealFixture("complete_admissible_dataset", "admissible", []),
  sealFixture(
    "documented_received_timestamp_absence",
    "admissible",
    [],
    (fixture) => {
      fixture.manifest.timestamp_policy.received_timestamp =
        "documented_absence_allowed";
      fixture.manifest.timestamp_policy.received_timestamp_absence_reason =
        "source_export_does_not_expose_provider_receive_time";
      for (const rows of Object.values(fixture.rows_by_file)) {
        for (const row of rows) {
          row.received_timestamp = null;
          row.received_timestamp_absence_reason =
            "source_export_does_not_expose_provider_receive_time";
        }
      }
    },
  ),
  sealFixture(
    "gap_reported_without_fill_forward",
    "admissible",
    [],
    (fixture) => {
      const row = fixture.rows_by_file["benchmarks-and-breadth"]?.[0];
      if (!row) return;
      row.observation_timestamp = "2026-07-24T19:45:00.000Z";
      row.provider_source_timestamp = "2026-07-24T19:45:00.000Z";
      row.received_timestamp = "2026-07-24T19:46:00.000Z";
    },
  ),
  sealFixture(
    "missing_spy_qqq",
    "rejected",
    [
      "coverage_below_minimum:benchmark",
      "decision_required_benchmark_missing:decision-aapl-2026-07-24-close:QQQ",
    ],
    (fixture) =>
      removeRows(
        fixture,
        (row) => row.domain === "benchmark" && row.symbol === "QQQ",
      ),
  ),
  sealFixture(
    "missing_breadth",
    "rejected",
    [
      "coverage_below_minimum:breadth",
      "decision_breadth_missing:decision-aapl-2026-07-24-close",
    ],
    (fixture) =>
      removeRows(fixture, (row) => row.domain === "breadth"),
  ),
  sealFixture(
    "incomplete_sector_universe",
    "rejected",
    [
      "coverage_below_minimum:sector",
      "decision_context_missing:decision-aapl-2026-07-24-close:sector:financials",
    ],
    (fixture) =>
      removeRows(
        fixture,
        (row) =>
          row.domain === "sector" &&
          row.context_id === "financials",
      ),
  ),
  sealFixture(
    "unknown_license",
    "rejected",
    [
      "provenance_incomplete",
      "usage_rights_not_documented_permitted",
    ],
    (fixture) => {
      fixture.manifest.source.provenance = {
        status: "unknown",
        description: "",
        source_reference: "",
      };
      fixture.manifest.source.usage_rights = {
        status: "unknown",
        basis: "",
        internal_research_and_replay_allowed: false,
      };
    },
  ),
  sealFixture(
    "missing_provider_and_received_time",
    "rejected",
    [
      "provider_source_timestamp_missing",
      "received_timestamp_missing_without_documented_absence",
    ],
    (fixture) => {
      const row = fixture.rows_by_file["benchmarks-and-breadth"]?.[0];
      if (!row) return;
      row.provider_source_timestamp = null;
      row.received_timestamp = null;
    },
  ),
  sealFixture(
    "naive_timestamp",
    "rejected",
    ["invalid_explicit_instant:row.observation_timestamp"],
    (fixture) => {
      const row = fixture.rows_by_file["benchmarks-and-breadth"]?.[0];
      if (row) row.observation_timestamp = "2026-07-24T19:50:00";
    },
  ),
  sealFixture(
    "future_provider_leakage",
    "rejected",
    [
      "future_observation_leakage",
      "future_provider_source_leakage",
      "received_after_decision_leakage",
    ],
    (fixture) => {
      const row = fixture.rows_by_file["benchmarks-and-breadth"]?.[0];
      if (!row) return;
      row.observation_timestamp = "2026-07-24T20:05:00.000Z";
      row.provider_source_timestamp = "2026-07-24T20:06:00.000Z";
      row.received_timestamp = "2026-07-24T20:07:00.000Z";
    },
  ),
  sealFixture(
    "duplicate_and_out_of_order",
    "rejected",
    ["duplicate_rows_rejected"],
    (fixture) => {
      const rows = fixture.rows_by_file["sector-benchmarks"];
      if (!rows) return;
      const first = rows[0];
      const second = rows[1];
      if (!first || !second) return;
      rows[0] = second;
      rows[1] = first;
      rows.push(structuredClone(first));
    },
  ),
  sealFixture(
    "corporate_action_policy_missing",
    "rejected",
    ["corporate_action_policy_missing"],
    (fixture) => {
      fixture.manifest.corporate_actions.policy_documented = false;
      fixture.manifest.corporate_actions.split_policy = "";
      fixture.manifest.corporate_actions.dividend_policy = "";
    },
  ),
  sealFixture(
    "production_identifier",
    "rejected",
    [
      "production_or_operational_identifier_detected",
      "row_contains_unknown_or_forbidden_field",
    ],
    (fixture) => {
      const row = fixture.rows_by_file["benchmarks-and-breadth"]?.[0];
      if (row) row.fetch_run_id = "production-run-id-must-be-rejected";
    },
  ),
  sealFixture(
    "tampered_raw_digest",
    "rejected",
    ["immutable_raw_digest_mismatch"],
    undefined,
    true,
  ),
] satisfies MarketContextHistoricalDatasetSyntheticFixtureV1[];

export function marketContextHistoricalDatasetSyntheticFixtureV1(
  id: string,
) {
  const found =
    marketContextHistoricalDatasetSyntheticFixturesV1.find(
      (fixture) => fixture.id === id,
    );
  if (!found) {
    throw new Error(
      `missing_market_context_historical_dataset_fixture:${id}`,
    );
  }
  return structuredClone(found);
}
