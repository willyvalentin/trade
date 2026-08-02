import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MARKET_CONTEXT_HISTORICAL_DATASET_CANONICAL_JSON_VERSION,
  MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_VERSION,
  MARKET_CONTEXT_HISTORICAL_DATASET_VERSION,
  normalizeMarketContextHistoricalDatasetFilesV1,
  stableMarketContextHistoricalDatasetJsonV1,
} from "../../lib/market-context-intelligence-lab/historical-dataset-v1";
import {
  MARKET_CONTEXT_HISTORICAL_DATASET_FIXTURE_VERSION,
  marketContextHistoricalDatasetSyntheticFixtureV1,
  marketContextHistoricalDatasetSyntheticFixturesV1,
} from "../../lib/market-context-intelligence-lab/historical-dataset-fixtures-v1";

const repositoryRoot = resolve(process.cwd());
const temporaryDirectories: string[] = [];

test.describe.configure({ timeout: 60_000 });

test.afterEach(() => {
  while (temporaryDirectories.length > 0) {
    const directory = temporaryDirectories.pop();
    if (directory) rmSync(directory, { recursive: true, force: true });
  }
});

function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function materializeFixture(id: string) {
  const fixture =
    marketContextHistoricalDatasetSyntheticFixtureV1(id);
  const directory = mkdtempSync(
    join(tmpdir(), "action-667m1-historical-dataset-"),
  );
  temporaryDirectories.push(directory);
  const manifestPath = join(directory, "manifest.json");
  writeFileSync(manifestPath, fixture.manifest_bytes);
  const dataFiles = fixture.files.map((file) => {
    const path = join(directory, `${file.file_id}.jsonl`);
    writeFileSync(path, file.raw_bytes);
    return {
      file_id: file.file_id,
      path,
      before_sha256: sha256(readFileSync(path)),
    };
  });
  return {
    fixture,
    directory,
    manifestPath,
    dataFiles,
  };
}

function normalizeFixture(id: string, reverseFiles = false) {
  const materialized = materializeFixture(id);
  const mappings = materialized.dataFiles.map(({ file_id, path }) => ({
    file_id,
    path,
  }));
  if (reverseFiles) mappings.reverse();
  const result = normalizeMarketContextHistoricalDatasetFilesV1({
    manifest_path: materialized.manifestPath,
    data_files: mappings,
  });
  return { ...materialized, result };
}

test("all synthetic admission fixtures return their declared fail-closed status", () => {
  expect(MARKET_CONTEXT_HISTORICAL_DATASET_VERSION).toBe(
    "market_context_historical_dataset_v1",
  );
  expect(MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_VERSION).toBe(
    "market_context_historical_dataset_normalizer_v1",
  );
  expect(MARKET_CONTEXT_HISTORICAL_DATASET_FIXTURE_VERSION).toBe(
    "market_context_historical_dataset_synthetic_fixtures_v1",
  );
  expect(marketContextHistoricalDatasetSyntheticFixturesV1).toHaveLength(
    14,
  );

  for (const fixture of marketContextHistoricalDatasetSyntheticFixturesV1) {
    const { result } = normalizeFixture(fixture.id);
    expect(result.status).toBe(fixture.expected_status);
    if (result.status === "rejected") {
      expect(result.error_codes).toEqual(
        expect.arrayContaining(fixture.expected_error_codes),
      );
    }
    expect(result.replay_output_created).toBe(false);
    expect(result.external_activity).toEqual({
      provider_traffic: false,
      internet_download: false,
      database_access: false,
      persistence: false,
    });
  }
});

test("complete dataset emits a versioned lossless manifest and canonical rows", () => {
  const { result } = normalizeFixture("complete_admissible_dataset");
  expect(result.status).toBe("admissible");
  if (result.status !== "admissible") return;

  expect(result.contract_version).toBe(
    MARKET_CONTEXT_HISTORICAL_DATASET_VERSION,
  );
  expect(result.canonicalization_version).toBe(
    MARKET_CONTEXT_HISTORICAL_DATASET_CANONICAL_JSON_VERSION,
  );
  expect(result.manifest).toMatchObject({
    contract_version: MARKET_CONTEXT_HISTORICAL_DATASET_VERSION,
    normalizer_version:
      MARKET_CONTEXT_HISTORICAL_DATASET_NORMALIZER_VERSION,
    identity: {
      dataset_id: "synthetic-market-context-admission-complete",
    },
    source: {
      usage_rights: {
        status: "documented_permitted",
        internal_research_and_replay_allowed: true,
      },
    },
    candle: {
      interval: "5min",
      timezone: "America/New_York",
    },
    point_in_time: {
      attested: true,
    },
    sensitive_identifiers: {
      policy: "reject",
      sanitized: true,
    },
  });
  expect(result.manifest.immutable_raw_digest).toMatch(
    /^[0-9a-f]{64}$/,
  );
  expect(result.manifest.immutable_normalized_digest).toMatch(
    /^[0-9a-f]{64}$/,
  );
  expect(result.manifest.lineage.raw_to_normalized).toHaveLength(2);
  expect(result.normalized_rows).toHaveLength(9);
  expect(
    result.normalized_rows.every(
      (row) =>
        row.lineage.file_id.length > 0 &&
        row.lineage.source_line > 0 &&
        /^[0-9a-f]{64}$/.test(row.lineage.raw_row_sha256),
    ),
  ).toBe(true);
  expect(result.diagnostics).toMatchObject({
    rows_read: 9,
    rows_normalized: 9,
    duplicate_rows: 0,
    out_of_order_rows: 0,
    gap_count: 0,
    missing_intervals: 0,
    future_observations: 0,
    future_provider_source_timestamps: 0,
    received_after_decision: 0,
    sensitive_identifier_rows: 0,
    coverage_by_domain: {
      benchmark: 1,
      breadth: 1,
      sector: 1,
      industry: 1,
    },
    unique_decisions: 1,
    unique_tickers: 1,
  });
  expect(
    result.normalized_rows.map((row) => row.domain),
  ).toEqual([
    "benchmark",
    "benchmark",
    "benchmark",
    "benchmark",
    "breadth",
    "sector",
    "sector",
    "sector",
    "sector",
  ]);
});

test("raw bytes remain byte-identical and are never rewritten", () => {
  const { result, dataFiles } = normalizeFixture(
    "complete_admissible_dataset",
  );
  expect(result.status).toBe("admissible");
  expect(result.raw_integrity).toEqual({
    verified: true,
    raw_bytes_unchanged: true,
  });
  for (const file of dataFiles) {
    expect(sha256(readFileSync(file.path))).toBe(file.before_sha256);
  }
});

test("explicit file list is exact and rejects omitted or undeclared inputs", () => {
  const omitted = materializeFixture("complete_admissible_dataset");
  const omittedResult =
    normalizeMarketContextHistoricalDatasetFilesV1({
      manifest_path: omitted.manifestPath,
      data_files: omitted.dataFiles.slice(0, 1).map(
        ({ file_id, path }) => ({ file_id, path }),
      ),
    });
  expect(omittedResult.status).toBe("rejected");
  if (omittedResult.status === "rejected") {
    expect(omittedResult.error_codes).toContain(
      "explicit_file_set_mismatch",
    );
  }

  const extra = materializeFixture("complete_admissible_dataset");
  const extraPath = join(extra.directory, "undeclared.jsonl");
  writeFileSync(extraPath, "{}\n");
  const extraResult = normalizeMarketContextHistoricalDatasetFilesV1({
    manifest_path: extra.manifestPath,
    data_files: [
      ...extra.dataFiles.map(({ file_id, path }) => ({
        file_id,
        path,
      })),
      { file_id: "undeclared", path: extraPath },
    ],
  });
  expect(extraResult.status).toBe("rejected");
  if (extraResult.status === "rejected") {
    expect(extraResult.error_codes).toContain(
      "explicit_file_set_mismatch",
    );
  }
});

test("SPY, QQQ, breadth, and every declared context are mandatory", () => {
  const expectedByFixture: Record<string, string> = {
    missing_spy_qqq:
      "decision_required_benchmark_missing:decision-aapl-2026-07-24-close:QQQ",
    missing_breadth:
      "decision_breadth_missing:decision-aapl-2026-07-24-close",
    incomplete_sector_universe:
      "decision_context_missing:decision-aapl-2026-07-24-close:sector:financials",
  };
  for (const [id, error] of Object.entries(expectedByFixture)) {
    const { result } = normalizeFixture(id);
    expect(result.status).toBe("rejected");
    if (result.status === "rejected") {
      expect(result.error_codes).toContain(error);
    }
  }
});

test("unknown rights and incomplete provenance fail closed", () => {
  const { result } = normalizeFixture("unknown_license");
  expect(result.status).toBe("rejected");
  if (result.status === "rejected") {
    expect(result.error_codes).toEqual(
      expect.arrayContaining([
        "provenance_incomplete",
        "usage_rights_not_documented_permitted",
      ]),
    );
  }
});

test("provider and received timestamps require explicit documented semantics", () => {
  const { result } = normalizeFixture(
    "missing_provider_and_received_time",
  );
  expect(result.status).toBe("rejected");
  if (result.status === "rejected") {
    expect(result.error_codes).toEqual(
      expect.arrayContaining([
        "provider_source_timestamp_missing",
        "received_timestamp_missing_without_documented_absence",
      ]),
    );
  }
});

test("documented received-time absence is preserved without guessed fallback", () => {
  const { result } = normalizeFixture(
    "documented_received_timestamp_absence",
  );
  expect(result.status).toBe("admissible");
  if (result.status !== "admissible") return;
  expect(
    result.normalized_rows.every(
      (row) =>
        row.received_timestamp === null &&
        row.received_timestamp_absence_reason ===
          "source_export_does_not_expose_provider_receive_time",
    ),
  ).toBe(true);
});

test("naive timestamps and every form of future leakage are rejected", () => {
  const naive = normalizeFixture("naive_timestamp").result;
  expect(naive.status).toBe("rejected");
  if (naive.status === "rejected") {
    expect(naive.error_codes).toContain(
      "invalid_explicit_instant:row.observation_timestamp",
    );
  }

  const future = normalizeFixture("future_provider_leakage").result;
  expect(future.status).toBe("rejected");
  if (future.status === "rejected") {
    expect(future.error_codes).toEqual(
      expect.arrayContaining([
        "future_observation_leakage",
        "future_provider_source_leakage",
        "received_after_decision_leakage",
      ]),
    );
    expect(future.diagnostics).toMatchObject({
      future_observations: 1,
      future_provider_source_timestamps: 1,
      received_after_decision: 1,
    });
  }
});

test("duplicates reject while out-of-order rows and gaps stay explicit", () => {
  const { result } = normalizeFixture("duplicate_and_out_of_order");
  expect(result.status).toBe("rejected");
  expect(result.diagnostics.duplicate_rows).toBe(1);
  expect(result.diagnostics.out_of_order_rows).toBeGreaterThan(0);
  if (result.status === "rejected") {
    expect(result.error_codes).toContain("duplicate_rows_rejected");
  }
});

test("gaps are counted without fill-forward or synthetic rows", () => {
  const { result } = normalizeFixture(
    "gap_reported_without_fill_forward",
  );
  expect(result.status).toBe("admissible");
  if (result.status !== "admissible") return;
  expect(result.diagnostics.gap_count).toBe(1);
  expect(result.diagnostics.missing_intervals).toBe(1);
  expect(result.normalized_rows).toHaveLength(9);
});

test("corporate-action policy and operational identifier sanitation are mandatory", () => {
  const corporate = normalizeFixture(
    "corporate_action_policy_missing",
  ).result;
  expect(corporate.status).toBe("rejected");
  if (corporate.status === "rejected") {
    expect(corporate.error_codes).toContain(
      "corporate_action_policy_missing",
    );
  }

  const identifier = normalizeFixture("production_identifier").result;
  expect(identifier.status).toBe("rejected");
  expect(identifier.diagnostics.sensitive_identifier_rows).toBe(1);
  if (identifier.status === "rejected") {
    expect(identifier.error_codes).toEqual(
      expect.arrayContaining([
        "production_or_operational_identifier_detected",
        "row_contains_unknown_or_forbidden_field",
      ]),
    );
  }
});

test("raw digest tampering is rejected before admission", () => {
  const { result } = normalizeFixture("tampered_raw_digest");
  expect(result.status).toBe("rejected");
  if (result.status === "rejected") {
    expect(result.error_codes).toContain(
      "immutable_raw_digest_mismatch",
    );
    expect(result.raw_integrity.verified).toBe(false);
  }
});

test("normalization is byte-deterministic across calls and file-map order", () => {
  const first = normalizeFixture(
    "complete_admissible_dataset",
  ).result;
  const second = normalizeFixture(
    "complete_admissible_dataset",
    true,
  ).result;
  expect(first.status).toBe("admissible");
  expect(second.status).toBe("admissible");
  expect(stableMarketContextHistoricalDatasetJsonV1(first)).toBe(
    stableMarketContextHistoricalDatasetJsonV1(second),
  );
  if (first.status === "admissible" && second.status === "admissible") {
    expect(first.manifest.immutable_normalized_digest).toBe(
      second.manifest.immutable_normalized_digest,
    );
  }
});

test("fixed cross-process normalization digest", () => {
  const { result } = normalizeFixture("complete_admissible_dataset");
  expect(result.status).toBe("admissible");
  const digest = sha256(
    stableMarketContextHistoricalDatasetJsonV1(result),
  );
  expect(digest).toMatch(/^[0-9a-f]{64}$/);
  console.log(`ACTION_667M1_TZ_DIGEST=${digest}`);
  if (result.status === "admissible") {
    console.log(
      `ACTION_667M1_DATASET_DIGESTS=${JSON.stringify({
        raw: result.manifest.immutable_raw_digest,
        normalized: result.manifest.immutable_normalized_digest,
      })}`,
    );
  }
});

test("cross-TZ child processes produce byte-identical normalization", () => {
  const timezones = [
    "UTC",
    "Europe/Stockholm",
    "America/New_York",
  ];
  const digests = timezones.map((timezone) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667m1-market-context-historical-dataset.spec.ts",
        "--grep",
        "fixed cross-process normalization digest",
        "--reporter=line",
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
      },
    );
    expect(child.status, child.stderr).toBe(0);
    const match = child.stdout.match(
      /ACTION_667M1_TZ_DIGEST=([a-f0-9]{64})/,
    );
    expect(match?.[1]).toMatch(/^[0-9a-f]{64}$/);
    return match?.[1];
  });
  expect(new Set(digests).size).toBe(1);
});

test("harness has no provider, database, replay, capture, or live imports", () => {
  const paths = [
    "lib/market-context-intelligence-lab/historical-dataset-v1.ts",
    "lib/market-context-intelligence-lab/historical-dataset-fixtures-v1.ts",
  ];
  const imports = paths
    .flatMap((path) =>
      Array.from(
        readFileSync(resolve(repositoryRoot, path), "utf8").matchAll(
          /from\s+["']([^"']+)["']/g,
        ),
      ).map((match) => match[1] ?? ""),
    );
  expect(
    imports.some((source) =>
      /supabase|provider|collector|scanner|recommendation|shadow-replay|app\/api/.test(
        source,
      ),
    ),
  ).toBe(false);
  expect(imports).toEqual(
    expect.arrayContaining([
      "node:crypto",
      "node:fs",
      "./explicit-instant-v1",
      "./historical-dataset-v1",
    ]),
  );
});

test("existing AAPL capture remains byte-identical and outside the harness", () => {
  const capturePath = resolve(
    repositoryRoot,
    "docs/first-tiny-historical-candle-corrected-filtered-ohlcv-payload.json",
  );
  expect(sha256(readFileSync(capturePath))).toBe(
    "7ea7d9d0b5ef3032ad81a69459902dd8c02aafda7017275622e364dcc35bc713",
  );
  const harnessSource = readFileSync(
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab/historical-dataset-v1.ts",
    ),
    "utf8",
  );
  expect(harnessSource).not.toContain(
    "first-tiny-historical-candle-corrected-filtered-ohlcv-payload",
  );
});

test("acquisition specification is parameterized and forbids cost claims or acquisition", () => {
  const specification = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/action-667m1-market-context-historical-dataset-acquisition-spec.json",
      ),
      "utf8",
    ),
  );
  expect(specification).toMatchObject({
    specification_version:
      "market_context_historical_dataset_acquisition_spec_v1",
    dataset_contract_version: MARKET_CONTEXT_HISTORICAL_DATASET_VERSION,
    status: "specification_only_not_authorized",
    required_benchmarks: ["SPY", "QQQ"],
    external_activity_authorized: false,
    replay_authorized: false,
    cost_claim: null,
  });
  expect(specification.date_range).toMatchObject({
    mode: "operator_supplied_parameter",
    hardcoded_purchase_range: null,
  });
});
