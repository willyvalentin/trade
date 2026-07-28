import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MARKET_CONTEXT_ACTION_667M3A_SYNTHETIC_FIXTURES_V1,
  marketContextFiveSessionPilotAdmissionFixtureV1,
  marketContextNanosecondReceiverFixtureV1,
} from "../../lib/market-context-intelligence-lab/action-667m3a-fixtures-v1";
import {
  MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_BILLABLE_CAP_BYTES,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_COST_CAP_USD,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_LOCAL_CAP_BYTES,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_TRANSFER_CAP_BYTES,
  evaluateMarketContextFiveSessionPilotAdmissionV1,
} from "../../lib/market-context-intelligence-lab/five-session-pilot-admission-v1";
import {
  MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1,
  receiveMarketContextHistoricalNanosecondsV1,
} from "../../lib/market-context-intelligence-lab/historical-dataset-nanosecond-receiver-v1";
import {
  bindMarketContextTradePreparationToM1V2,
} from "../../lib/market-context-intelligence-lab/trade-to-candle-m1-binding-v2";
import {
  fixtureUnixNsV2,
  marketContextTradeM1BindingMetadataFixtureV2,
  marketContextTradePreparationFixtureV2,
  rehashMarketContextTradeInputV2,
} from "../../lib/market-context-intelligence-lab/trade-to-candle-preparation-fixtures-v2";
import {
  prepareMarketContextTradesToCandlesV2,
  stableMarketContextTradePreparationJsonV2,
} from "../../lib/market-context-intelligence-lab/trade-to-candle-preparation-v2";

const repositoryRoot = resolve(process.cwd());

test.describe.configure({ timeout: 60_000 });

test("M.3A versions, fixed pilot caps, and fail-closed status are explicit", () => {
  expect(MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1).toBe(
    "market_context_historical_dataset_nanosecond_receiver_v1",
  );
  expect(MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1).toBe(
    "market_context_five_session_pilot_admission_v1",
  );
  expect(MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1).toBe(
    "market_context_five_session_pilot_policy_2026_07_27_v1",
  );
  expect(MARKET_CONTEXT_ACTION_667M3A_SYNTHETIC_FIXTURES_V1).toBe(
    "market_context_action_667m3a_synthetic_fixtures_v1",
  );
  expect(MARKET_CONTEXT_FIVE_SESSION_PILOT_COST_CAP_USD).toBe(0.25);
  expect(MARKET_CONTEXT_FIVE_SESSION_PILOT_BILLABLE_CAP_BYTES).toBe(
    32 * 1024 * 1024,
  );
  expect(MARKET_CONTEXT_FIVE_SESSION_PILOT_TRANSFER_CAP_BYTES).toBe(
    32 * 1024 * 1024,
  );
  expect(MARKET_CONTEXT_FIVE_SESSION_PILOT_LOCAL_CAP_BYTES).toBe(
    1024 * 1024 * 1024,
  );
});

test("raw to M.2C to M.1 receiver round-trip preserves nanoseconds losslessly", () => {
  const fixture = marketContextNanosecondReceiverFixtureV1();
  const before = stableMarketContextTradePreparationJsonV2(fixture);
  const result = receiveMarketContextHistoricalNanosecondsV1(fixture);
  expect(result.status).toBe("received");
  if (result.status !== "received") return;

  const source = fixture.bound.candle_rows[0]!;
  const row = result.normalized_rows.find(
    (candidate) => candidate.row_type === "candle",
  );
  expect(row?.row_type).toBe("candle");
  if (!row || row.row_type !== "candle") return;
  expect(row.observation_timestamp_unix_ns).toBe(
    source.observation_timestamp_unix_ns,
  );
  expect(row.provider_source_timestamp_unix_ns).toBe(
    source.provider_source_timestamp_unix_ns,
  );
  expect(row.received_timestamp_unix_ns).toBe(
    source.received_timestamp_unix_ns,
  );
  expect(row.provider_source_timestamp_unix_ns.endsWith("003")).toBe(
    true,
  );
  expect(row.received_timestamp_unix_ns.endsWith("003")).toBe(true);
  expect(row.source_lineage).toHaveLength(3);
  expect(row.source_lineage[0]).toMatchObject({
    ts_event_unix_ns: fixtureUnixNsV2(
      "2026-03-09T13:30:00.100Z",
      BigInt(1),
    ),
    ts_recv_unix_ns: fixtureUnixNsV2(
      "2026-03-09T13:30:00.200Z",
      BigInt(1),
    ),
  });
  expect(result.coverage.benchmark).toMatchObject({
    observed_rows: 1,
    coverage: 1,
    first_provider_source_unix_ns:
      row.source_lineage[0]!.ts_event_unix_ns,
    last_provider_source_unix_ns:
      source.provider_source_timestamp_unix_ns,
    first_received_unix_ns: row.source_lineage[0]!.ts_recv_unix_ns,
    last_received_unix_ns: source.received_timestamp_unix_ns,
  });
  expect(result.manifest.watermark).toEqual({
    policy_version:
      "market_context_historical_trade_watermark_2s_nanosecond_v2",
    evidence_status: "empirically_unvalidated",
    calibrated: false,
  });
  expect(result.metadata_inferred).toBe(false);
  expect(result.canonical_binding_performed).toBe(false);
  expect(result.replay_performed).toBe(false);
  expect(result.live_ranking_effect).toBe(false);
  expect(
    stableMarketContextTradePreparationJsonV2(fixture),
  ).toBe(before);
  for (const digest of Object.values(result.digests)) {
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
  }
});

test("nanosecond receiver is deterministic under input permutation", () => {
  const firstFixture = marketContextNanosecondReceiverFixtureV1();
  const permutedInput = structuredClone(firstFixture.tradeInput);
  permutedInput.records.reverse();
  rehashMarketContextTradeInputV2(permutedInput);
  const prepared = prepareMarketContextTradesToCandlesV2(permutedInput);
  expect(prepared.status).toBe("prepared");
  if (prepared.status !== "prepared") return;
  const bound = bindMarketContextTradePreparationToM1V2({
    prepared,
    metadata: marketContextTradeM1BindingMetadataFixtureV2(prepared),
  });
  expect(bound.status).toBe("bindable");
  if (bound.status !== "bindable") return;
  const secondFixture = marketContextNanosecondReceiverFixtureV1();
  secondFixture.bound = bound;

  const first = receiveMarketContextHistoricalNanosecondsV1(
    firstFixture,
  );
  const second = receiveMarketContextHistoricalNanosecondsV1(
    secondFixture,
  );
  expect(
    stableMarketContextTradePreparationJsonV2(first),
  ).toBe(stableMarketContextTradePreparationJsonV2(second));
});

test("missing builds, revisions, tie-break evidence, or license are not bindable", () => {
  const mutations: Array<(value: ReturnType<
    typeof marketContextNanosecondReceiverFixtureV1
  >) => void> = [
    (value) => {
      value.metadata.provider_revision.provider_build = "";
    },
    (value) => {
      value.metadata.provider_revision.encoder_build = "";
    },
    (value) => {
      value.metadata.provider_revision.dataset_revision = "";
    },
    (value) => {
      value.metadata.stable_tiebreak_evidence.policy_reference = "";
    },
    (value) => {
      value.metadata.license_reference.reference_id = "";
    },
  ];
  for (const mutate of mutations) {
    const fixture = marketContextNanosecondReceiverFixtureV1();
    mutate(fixture);
    expect(
      receiveMarketContextHistoricalNanosecondsV1(fixture).status,
    ).toBe("not_bindable");
  }
});

test("revision and extraction-lineage tampering fail closed", () => {
  const revision = marketContextNanosecondReceiverFixtureV1();
  revision.metadata.provider_revision.provider_build =
    "tampered-provider-build";
  const revisionResult =
    receiveMarketContextHistoricalNanosecondsV1(revision);
  expect(revisionResult.status).toBe("not_bindable");
  if (revisionResult.status === "not_bindable") {
    expect(revisionResult.error_codes).toContain(
      "receiver_provider_encoder_or_dataset_revision_invalid",
    );
  }

  const lineage = marketContextNanosecondReceiverFixtureV1();
  lineage.metadata.extraction_lineage[0]!.decoder_build =
    "tampered-decoder-build";
  const lineageResult =
    receiveMarketContextHistoricalNanosecondsV1(lineage);
  expect(lineageResult.status).toBe("not_bindable");
  if (lineageResult.status === "not_bindable") {
    expect(lineageResult.error_codes).toContain(
      "receiver_extraction_lineage_invalid",
    );
  }

  const prepared = marketContextNanosecondReceiverFixtureV1();
  prepared.prepared.candles[0]!.lineage[0]!.ts_event_unix_ns = (
    BigInt(
      prepared.prepared.candles[0]!.lineage[0]!.ts_event_unix_ns,
    ) + BigInt(1)
  ).toString();
  const preparedResult =
    receiveMarketContextHistoricalNanosecondsV1(prepared);
  expect(preparedResult.status).toBe("not_bindable");
  if (preparedResult.status === "not_bindable") {
    expect(preparedResult.error_codes).toContain(
      "receiver_prepared_m2c_integrity_invalid",
    );
  }
});

test("unknown provider flags and sale conditions reject before receipt", () => {
  const mutations = [
    (input: ReturnType<typeof marketContextTradePreparationFixtureV2>) => {
      input.records[0]!.flags_uint8 = 2;
    },
    (input: ReturnType<typeof marketContextTradePreparationFixtureV2>) => {
      input.records[0]!.conditions = ["unknown"];
    },
    (input: ReturnType<typeof marketContextTradePreparationFixtureV2>) => {
      input.records[0]!.action = "X";
    },
  ];
  for (const mutate of mutations) {
    const input = marketContextTradePreparationFixtureV2();
    mutate(input);
    rehashMarketContextTradeInputV2(input);
    const prepared = prepareMarketContextTradesToCandlesV2(input);
    expect(prepared.status).toBe("rejected");
  }
});

test("synthetic complete pilot satisfies the contract but never authorizes acquisition", () => {
  const input = marketContextFiveSessionPilotAdmissionFixtureV1();
  const before = stableMarketContextTradePreparationJsonV2(input);
  const result =
    evaluateMarketContextFiveSessionPilotAdmissionV1(input);
  expect(result).toMatchObject({
    status: "admission_contract_satisfied",
    all_sessions_available: true,
    calendar_immutable: true,
    post_download_lineage_verified: true,
    metadata_inferred: false,
    download_authorized: false,
    dataset_acquisition_ready: false,
    normalization_authorized: false,
    replay_authorized: false,
    shadow_only: true,
    live_ranking_effect: false,
  });
  expect(stableMarketContextTradePreparationJsonV2(input)).toBe(
    before,
  );

  const preDownload =
    marketContextFiveSessionPilotAdmissionFixtureV1();
  preDownload.admission_stage = "pre_download";
  preDownload.post_download_lineage = {
    status: "pending_not_yet_downloaded",
    source_files: [],
    combined_local_bytes: null,
    lineage_manifest_sha256: null,
  };
  expect(
    evaluateMarketContextFiveSessionPilotAdmissionV1(preDownload),
  ).toMatchObject({
    status: "pre_download_requirements_satisfied",
    post_download_lineage_verified: false,
    download_authorized: false,
    dataset_acquisition_ready: false,
  });
});

test("missing written license or degraded day is rejected", () => {
  const noLicense = marketContextFiveSessionPilotAdmissionFixtureV1();
  noLicense.license.reference_id = "";
  const licenseResult =
    evaluateMarketContextFiveSessionPilotAdmissionV1(noLicense);
  expect(licenseResult.status).toBe("not_admitted");
  if (licenseResult.status === "not_admitted") {
    expect(licenseResult.error_codes).toContain(
      "pilot_written_license_reference_missing_or_incomplete",
    );
  }

  const degraded = marketContextFiveSessionPilotAdmissionFixtureV1();
  degraded.quote.conditions[2]!.condition = "degraded";
  const degradedResult =
    evaluateMarketContextFiveSessionPilotAdmissionV1(degraded);
  expect(degradedResult.status).toBe("not_admitted");
  if (degradedResult.status === "not_admitted") {
    expect(degradedResult.error_codes).toContain(
      "pilot_session_condition_not_all_available",
    );
  }
});

test("naive entitlement instants fail closed", () => {
  const input = marketContextFiveSessionPilotAdmissionFixtureV1();
  input.quote.entitlement_range.start = "2018-05-01T00:00:00";
  const result =
    evaluateMarketContextFiveSessionPilotAdmissionV1(input);
  expect(result.status).toBe("not_admitted");
  if (result.status === "not_admitted") {
    expect(result.error_codes).toContain(
      "pilot_entitlement_range_does_not_cover_interval",
    );
  }
});

test("stale quote and every hard-cap breach are rejected", () => {
  const mutations: Array<(value: ReturnType<
    typeof marketContextFiveSessionPilotAdmissionFixtureV1
  >) => void> = [
    (value) => {
      value.quote.quoted_at_unix_ns = (
        BigInt(value.evaluated_at_unix_ns) -
        BigInt(901) * BigInt(1_000_000_000)
      ).toString();
    },
    (value) => {
      value.quote.estimated_cost_usd =
        MARKET_CONTEXT_FIVE_SESSION_PILOT_COST_CAP_USD + 0.01;
    },
    (value) => {
      value.quote.billable_uncompressed_bytes =
        MARKET_CONTEXT_FIVE_SESSION_PILOT_BILLABLE_CAP_BYTES + 1;
    },
    (value) => {
      value.quote.estimated_transfer_bytes =
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TRANSFER_CAP_BYTES + 1;
    },
    (value) => {
      if (value.post_download_lineage.status === "complete") {
        value.post_download_lineage.combined_local_bytes =
          MARKET_CONTEXT_FIVE_SESSION_PILOT_LOCAL_CAP_BYTES + 1;
      }
    },
  ];
  for (const mutate of mutations) {
    const input = marketContextFiveSessionPilotAdmissionFixtureV1();
    mutate(input);
    expect(
      evaluateMarketContextFiveSessionPilotAdmissionV1(input).status,
    ).toBe("not_admitted");
  }
});

test("calendar boundary or digest tampering rejects", () => {
  const boundary = marketContextFiveSessionPilotAdmissionFixtureV1();
  boundary.calendar.sessions[0]!.open_unix_ns = fixtureUnixNsV2(
    "2026-07-20T13:31:00Z",
  );
  const boundaryResult =
    evaluateMarketContextFiveSessionPilotAdmissionV1(boundary);
  expect(boundaryResult.status).toBe("not_admitted");
  if (boundaryResult.status === "not_admitted") {
    expect(boundaryResult.error_codes).toContain(
      "pilot_calendar_session_boundary_mismatch",
    );
  }

  const digest = marketContextFiveSessionPilotAdmissionFixtureV1();
  digest.calendar.artifact_sha256 = "0".repeat(64);
  const digestResult =
    evaluateMarketContextFiveSessionPilotAdmissionV1(digest);
  expect(digestResult.status).toBe("not_admitted");
  if (digestResult.status === "not_admitted") {
    expect(digestResult.error_codes).toContain(
      "pilot_calendar_artifact_digest_invalid",
    );
  }
});

test("malformed receiver and admission inputs fail closed without throwing", () => {
  for (const value of [null, {}, [], { bound: null }]) {
    expect(() =>
      receiveMarketContextHistoricalNanosecondsV1(value),
    ).not.toThrow();
    expect(
      receiveMarketContextHistoricalNanosecondsV1(value).status,
    ).toBe("not_bindable");
  }
  for (const value of [null, {}, [], { quote: null }]) {
    expect(() =>
      evaluateMarketContextFiveSessionPilotAdmissionV1(value),
    ).not.toThrow();
    expect(
      evaluateMarketContextFiveSessionPilotAdmissionV1(value).status,
    ).toBe("not_admitted");
  }
});

test("fixed M.3A cross-process digest", () => {
  const receiver = receiveMarketContextHistoricalNanosecondsV1(
    marketContextNanosecondReceiverFixtureV1(),
  );
  const admission = evaluateMarketContextFiveSessionPilotAdmissionV1(
    marketContextFiveSessionPilotAdmissionFixtureV1(),
  );
  const digest = receiver.status === "received" &&
      admission.status === "admission_contract_satisfied"
    ? `${receiver.digests.receiver_digest}:${admission.admission_digest}`
    : "invalid";
  expect(digest).toMatch(/^[a-f0-9]{64}:[a-f0-9]{64}$/);
  console.log(`ACTION_667M3A_TZ_DIGEST=${digest}`);
});

test("UTC, Stockholm, and New York processes are byte-identical", () => {
  const digests = [
    "UTC",
    "Europe/Stockholm",
    "America/New_York",
  ].map((timezone) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667m3a-nanosecond-receiver-pilot-admission.spec.ts",
        "--grep",
        "fixed M.3A cross-process digest",
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
    return child.stdout.match(
      /ACTION_667M3A_TZ_DIGEST=([a-f0-9]{64}:[a-f0-9]{64})/,
    )?.[1];
  });
  expect(new Set(digests).size).toBe(1);
});

test("M.3A modules contain no provider, database, replay, or live imports", () => {
  const files = [
    "lib/market-context-intelligence-lab/historical-dataset-nanosecond-receiver-v1.ts",
    "lib/market-context-intelligence-lab/five-session-pilot-admission-v1.ts",
    "lib/market-context-intelligence-lab/action-667m3a-fixtures-v1.ts",
  ];
  const imports = files.flatMap((path) =>
    Array.from(
      readFileSync(resolve(repositoryRoot, path), "utf8").matchAll(
        /from\s+["']([^"']+)["']/g,
      ),
    ).map((match) => match[1] ?? ""),
  );
  expect(
    imports.some((source) =>
      /databento|supabase|provider-client|collector|scanner|recommendation|shadow-replay|app\/api/.test(
        source,
      ),
    ),
  ).toBe(false);
});
