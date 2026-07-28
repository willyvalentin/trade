import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import {
  MARKET_CONTEXT_SHADOW_REPLAY_CANONICALIZATION_VERSION,
  MARKET_CONTEXT_SHADOW_REPLAY_EXPORT_VERSION,
  MARKET_CONTEXT_SHADOW_REPLAY_VERSION,
  computeMarketContextShadowReplayDatasetDigestV1,
  runMarketContextShadowReplayV1,
  stableMarketContextShadowReplayJsonV1,
  type MarketContextShadowReplayV1Input,
} from "../../lib/market-context-intelligence-lab/shadow-replay-v1";
import {
  MARKET_CONTEXT_SHADOW_REPLAY_FIXTURE_VERSION,
  buildMarketContextHistoricalShadowReplayGoldenDataset,
  marketContextHistoricalShadowReplayGoldenFixtures,
} from "../../lib/market-context-intelligence-lab/shadow-replay-fixtures-v1";
import {
  MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION,
  MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2,
} from "../../lib/market-context-intelligence-lab/shadow-canonical-bridge-v1";

const repositoryRoot = resolve(process.cwd());

test.describe.configure({ timeout: 60_000 });

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function fixture(id: string) {
  const found = marketContextHistoricalShadowReplayGoldenFixtures.find(
    (candidate) => candidate.id === id,
  );
  if (!found) throw new Error(`missing_replay_fixture:${id}`);
  return found;
}

function cloneInput(
  input: MarketContextShadowReplayV1Input,
): MarketContextShadowReplayV1Input {
  return structuredClone(input);
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    Object.freeze(value);
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
  }
  return value;
}

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return sourceFiles(path);
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}

test("all twelve synthetic historical session fixtures replay as declared", () => {
  expect(MARKET_CONTEXT_SHADOW_REPLAY_VERSION).toBe(
    "market_context_shadow_replay_v1",
  );
  expect(MARKET_CONTEXT_SHADOW_REPLAY_FIXTURE_VERSION).toBe(
    "market_context_shadow_replay_synthetic_sessions_v1",
  );
  expect(marketContextHistoricalShadowReplayGoldenFixtures).toHaveLength(12);

  for (const golden of marketContextHistoricalShadowReplayGoldenFixtures) {
    const output = runMarketContextShadowReplayV1(golden.input);
    expect(
      output.decisions.map(
        (decision) => decision.v2_evaluation.classification,
      ),
    ).toEqual(golden.expected_classifications);
    expect(
      output.decisions.every(
        (decision) => decision.classification_comparison.agreement,
      ),
    ).toBe(true);
    expect(output.shadow_only).toBe(true);
    expect(output.live_ranking_effect).toBe(false);
    expect(output.canonical_binding_ready).toBe(false);
  }
});

test("complete replay emits transition, version, regime, sector, and boundary diagnostics", () => {
  const output = runMarketContextShadowReplayV1(
    buildMarketContextHistoricalShadowReplayGoldenDataset(),
  );

  expect(output.decisions).toHaveLength(14);
  expect(output.diagnostics.unique_counts).toEqual({
    decisions: 14,
    days: 14,
    tickers: 5,
  });
  expect(output.diagnostics.regime_coverage.total_decisions).toBe(14);
  expect(output.diagnostics.regime_coverage.measurable_decisions).toBe(13);
  expect(output.diagnostics.insufficient_count).toBe(1);
  expect(output.diagnostics.conflicting_count).toBe(1);
  expect(output.diagnostics.provider_gap_count).toBe(1);
  expect(output.diagnostics.sector_coverage.total_contexts).toBeGreaterThan(0);
  expect(output.diagnostics.sector_coverage.ranked_contexts).toBeGreaterThan(0);
  expect(
    output.diagnostics.sector_coverage.not_rankable_contexts,
  ).toBeGreaterThan(0);
  expect(output.diagnostics.threshold_boundary_frequency).toHaveLength(21);
  expect(
    output.diagnostics.threshold_boundary_frequency.find(
      (threshold) =>
        threshold.threshold_id === "breadth.broad_lower_bound",
    ),
  ).toMatchObject({
    decision_hits: 1,
    decision_frequency: 0.0714,
  });
  expect(
    output.diagnostics.threshold_boundary_frequency.filter(
      (threshold) => threshold.status === "reserved_inactive",
    ),
  ).toEqual([
    expect.objectContaining({
      threshold_id: "freshness_minutes.intraday",
      classification_effect: false,
      decision_hits: 0,
    }),
    expect.objectContaining({
      threshold_id: "freshness_minutes.sector_short",
      classification_effect: false,
      decision_hits: 0,
    }),
  ]);
  expect(output.diagnostics.canonical_outcomes_joined).toBe(false);
  expect(output.diagnostics.performance_claims_allowed).toBe(false);
  expect(output.diagnostics.prohibited_metrics).toEqual([
    "win_rate",
    "expectancy",
    "precision_at_k",
  ]);
  expect(output.performance_claims).toEqual({
    status: "not_computed",
    reason: "joinable_canonical_outcomes_required",
  });
});

test("v1 and v2 remain equal while temporal classification transitions stay explicit", () => {
  const output = runMarketContextShadowReplayV1(
    fixture(
      "v1_v2_agreement_and_intentional_regime_transition",
    ).input,
  );

  expect(output.decisions.map((decision) => ({
    v1: decision.v1_evaluation.classification,
    v2: decision.v2_evaluation.classification,
    status: decision.classification_comparison.status,
  }))).toEqual([
    {
      v1: "risk_on_trending",
      v2: "risk_on_trending",
      status: "unchanged",
    },
    {
      v1: "risk_off_orderly",
      v2: "risk_off_orderly",
      status: "unchanged",
    },
  ]);
  expect(output.diagnostics.classification_transition_matrix).toEqual([
    {
      from: "risk_on_trending",
      to: "risk_off_orderly",
      count: 1,
    },
  ]);
  expect(
    output.diagnostics.version_comparison_matrix.every(
      (entry) => entry.agreement,
    ),
  ).toBe(true);
});

test("sector rotation is measurable while incomplete universes remain not rankable", () => {
  const rotation = runMarketContextShadowReplayV1(
    fixture("sector_rotation").input,
  );
  const firstTechnology =
    rotation.decisions[0]?.v2_evaluation.sector_context.find(
      (sector) => sector.sector_id === "technology",
    );
  const lastTechnology =
    rotation.decisions[1]?.v2_evaluation.sector_context.find(
      (sector) => sector.sector_id === "technology",
    );
  const firstFinancials =
    rotation.decisions[0]?.v2_evaluation.sector_context.find(
      (sector) => sector.sector_id === "financials",
    );
  const lastFinancials =
    rotation.decisions[1]?.v2_evaluation.sector_context.find(
      (sector) => sector.sector_id === "financials",
    );

  expect(firstTechnology).toMatchObject({
    classification: "strong",
    rank_status: "ranked",
    rank: 1,
  });
  expect(lastTechnology).toMatchObject({
    classification: "weak",
    rank_status: "ranked",
    rank: 2,
  });
  expect(firstFinancials).toMatchObject({
    classification: "weak",
    rank_status: "ranked",
    rank: 2,
  });
  expect(lastFinancials).toMatchObject({
    classification: "strong",
    rank_status: "ranked",
    rank: 1,
  });

  const incomplete = runMarketContextShadowReplayV1(
    fixture("incomplete_sector_universe").input,
  );
  expect(
    incomplete.decisions[0]?.v2_evaluation.sector_context[0],
  ).toMatchObject({
    rank_status: "not_rankable",
    rank: null,
  });
});

test("future observations are excluded and provider gaps never fall back to neutral", () => {
  const future = runMarketContextShadowReplayV1(
    fixture("future_candle_in_dataset").input,
  );
  const futureDecision = future.decisions[0];
  expect(futureDecision?.v2_evaluation.classification).toBe(
    "risk_on_trending",
  );
  expect(
    futureDecision?.leakage_control.replay_boundary
      .future_observations_excluded,
  ).toBe(2);
  expect(futureDecision?.leakage_control.v1.future_points_excluded).toBe(2);
  expect(futureDecision?.leakage_control.v2.future_points_excluded).toBe(2);
  expect(
    futureDecision?.leakage_control.replay_boundary
      .future_provider_source_timestamps_excluded,
  ).toBe(1);
  expect(
    futureDecision?.leakage_control.v1
      .future_provider_timestamps_excluded,
  ).toBe(1);
  expect(
    futureDecision?.leakage_control.v2
      .future_provider_timestamps_excluded,
  ).toBe(1);
  expect(
    futureDecision?.point_in_time_audit.observation_times.filter(
      (observation) =>
        observation.point_in_time_status === "future_excluded",
    ),
  ).toHaveLength(2);
  expect(
    futureDecision?.point_in_time_audit.provider_times.filter(
      (provider) =>
        provider.source_point_in_time_status === "future_excluded",
    ),
  ).toHaveLength(1);

  const providerGap = runMarketContextShadowReplayV1(
    fixture("stale_provider_gap").input,
  );
  expect(providerGap.decisions[0]?.v2_evaluation.classification).toBe(
    "insufficient_data",
  );
  expect(
    providerGap.decisions[0]?.v2_evaluation.dimensions.data_quality_state,
  ).toBe("provider_gap");
  expect(providerGap.decisions[0]?.v2_evaluation.classification).not.toBe(
    "neutral_balanced",
  );
});

test("provider source and received times remain separate from observation times", () => {
  const output = runMarketContextShadowReplayV1(
    fixture("clear_risk_on_day").input,
  );
  const audit = output.decisions[0]?.point_in_time_audit;

  expect(audit?.observation_times.length).toBeGreaterThan(0);
  expect(audit?.provider_times.length).toBeGreaterThan(0);
  expect(
    audit?.observation_times.every(
      (observation) => "observation_timestamp" in observation,
    ),
  ).toBe(true);
  expect(
    audit?.provider_times.every(
      (provider) =>
        "source_timestamp" in provider &&
        "received_timestamp" in provider,
    ),
  ).toBe(true);
});

test("out-of-order duplicates and all reorderable arrays are deterministic", () => {
  const duplicate = runMarketContextShadowReplayV1(
    fixture("out_of_order_duplicate_observations").input,
  );
  expect(
    duplicate.decisions[0]?.point_in_time_audit.duplicate_observations,
  ).toBe(4);

  const canonical = buildMarketContextHistoricalShadowReplayGoldenDataset();
  const reordered = cloneInput(canonical);
  reordered.dataset.decisions.reverse();
  for (const replayDecision of reordered.dataset.decisions) {
    replayDecision.context_input.benchmarks.reverse();
    for (const benchmark of replayDecision.context_input.benchmarks) {
      benchmark.intraday.reverse();
      benchmark.multi_day.reverse();
    }
    replayDecision.context_input.sectors?.reverse();
    for (const sector of replayDecision.context_input.sectors ?? []) {
      sector.short_horizon.reverse();
      sector.medium_horizon.reverse();
    }
    replayDecision.context_input.sector_universe?.expected_sector_ids.reverse();
  }

  expect(
    computeMarketContextShadowReplayDatasetDigestV1(reordered.dataset),
  ).toBe(canonical.dataset_digest);
  expect(
    JSON.stringify(runMarketContextShadowReplayV1(reordered)),
  ).toBe(
    JSON.stringify(runMarketContextShadowReplayV1(canonical)),
  );
});

test("DST offset-equivalent sessions produce byte-identical replay output", () => {
  const offset = cloneInput(fixture("dst_offset_session").input);
  const utc = cloneInput(offset);
  const decision = utc.dataset.decisions[0];
  if (!decision) throw new Error("missing_dst_fixture_decision");
  decision.context_input.decision_timestamp = "2026-10-25T01:30:00Z";

  expect(
    computeMarketContextShadowReplayDatasetDigestV1(utc.dataset),
  ).toBe(offset.dataset_digest);
  expect(
    JSON.stringify(runMarketContextShadowReplayV1(utc)),
  ).toBe(
    JSON.stringify(runMarketContextShadowReplayV1(offset)),
  );
});

test("naive timestamps fail closed at every replay time domain", () => {
  const mutations: Array<{
    expectedField: string;
    mutate: (input: MarketContextShadowReplayV1Input) => void;
  }> = [
    {
      expectedField: "decision_timestamp",
      mutate: (input) => {
        input.dataset.decisions[0]!.context_input.decision_timestamp =
          "2026-01-05T20:00:00";
      },
    },
    {
      expectedField: "benchmark.QQQ.intraday.point_timestamp",
      mutate: (input) => {
        input.dataset.decisions[0]!.context_input.benchmarks.find(
          (benchmark) => benchmark.symbol === "QQQ",
        )!.intraday[0]!.timestamp = "2026-01-05T19:55:00";
      },
    },
    {
      expectedField: "breadth.point_timestamp",
      mutate: (input) => {
        input.dataset.decisions[0]!.context_input.breadth!.timestamp =
          "2026-01-05T19:55:00";
      },
    },
    {
      expectedField: "sector.technology.short_horizon.point_timestamp",
      mutate: (input) => {
        input.dataset.decisions[0]!.context_input.sectors!.find(
          (sector) => sector.sector_id === "technology",
        )!.short_horizon[0]!.timestamp = "2026-01-05T19:55:00";
      },
    },
    {
      expectedField: "benchmark.SPY.provider.source_timestamp",
      mutate: (input) => {
        input.dataset.decisions[0]!.context_input.benchmarks.find(
          (benchmark) => benchmark.symbol === "SPY",
        )!.provider.source_timestamp = "2026-01-05T19:55:00";
      },
    },
    {
      expectedField: "breadth.provider.received_timestamp",
      mutate: (input) => {
        input.dataset.decisions[0]!.context_input.breadth!.provider
          .received_timestamp = "2026-01-05T19:56:00";
      },
    },
  ];

  for (const mutation of mutations) {
    const input = cloneInput(fixture("clear_risk_on_day").input);
    mutation.mutate(input);
    expect(() => runMarketContextShadowReplayV1(input)).toThrow(
      `market_context_invalid_explicit_instant:${mutation.expectedField}`,
    );
  }
});

test("replay never mutates deeply frozen historical inputs", () => {
  const input = deepFreeze(
    cloneInput(buildMarketContextHistoricalShadowReplayGoldenDataset()),
  );
  const before = stableMarketContextShadowReplayJsonV1(input);
  const output = runMarketContextShadowReplayV1(input);

  expect(stableMarketContextShadowReplayJsonV1(input)).toBe(before);
  expect(
    output.decisions.every(
      (decision) => decision.input_immutability.status === "verified",
    ),
  ).toBe(true);
});

test("dataset digest mismatch and malformed required metadata fail closed", () => {
  const tampered = cloneInput(fixture("clear_risk_on_day").input);
  tampered.dataset.decisions[0]!.context_input.benchmarks[0]!
    .multi_day[0]!.close = 999;
  expect(() => runMarketContextShadowReplayV1(tampered)).toThrow(
    "market_context_shadow_replay_v1_dataset_digest_mismatch",
  );

  const badDigest = cloneInput(fixture("clear_risk_on_day").input);
  badDigest.dataset_digest = "not-a-digest";
  expect(() => runMarketContextShadowReplayV1(badDigest)).toThrow(
    "market_context_shadow_replay_v1_invalid_dataset_digest_format",
  );

  const badProducer = cloneInput(fixture("clear_risk_on_day").input);
  badProducer.producer_versions.build_identity = "";
  expect(() => runMarketContextShadowReplayV1(badProducer)).toThrow(
    "market_context_shadow_replay_v1_not_exportable:missing_required_producer_version:build_identity",
  );
});

test("standalone bridge export is lossless but inactive and unbound", () => {
  const output = runMarketContextShadowReplayV1(
    fixture("clear_risk_on_day").input,
  );
  const exported = output.bridge_export;

  expect(exported).toMatchObject({
    export_format_version: MARKET_CONTEXT_SHADOW_REPLAY_EXPORT_VERSION,
    replay_contract_version: MARKET_CONTEXT_SHADOW_REPLAY_VERSION,
    bridge_schema_version: MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION,
    adapter_version: MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2,
    binding_status: "inactive_unbound",
    actual_canonical_binding: null,
    canonical_binding_ready: false,
    capture_enabled: false,
    persistence_enabled: false,
    database_relation: null,
    shadow_only: true,
    live_ranking_effect: false,
  });
  expect(exported.records).toHaveLength(1);
  expect(exported.records[0]?.bridge.binding_status).toBe(
    "shadow_bridge_ready",
  );
  expect(exported.records[0]?.bridge.canonical_binding_ready).toBe(false);
  expect(exported.records[0]?.bridge.actual_canonical_binding).toBeNull();
});

test("fixed cross-process replay digest", () => {
  const output = runMarketContextShadowReplayV1(
    buildMarketContextHistoricalShadowReplayGoldenDataset(),
  );
  const digest = sha256(JSON.stringify(output));

  expect(output.canonicalization_version).toBe(
    MARKET_CONTEXT_SHADOW_REPLAY_CANONICALIZATION_VERSION,
  );
  expect(digest).toMatch(/^[0-9a-f]{64}$/);
  console.log(`ACTION_667K_TZ_DIGEST=${digest}`);
  console.log(
    `ACTION_667K_DIAGNOSTICS=${JSON.stringify({
      dataset_digest: output.replay_identity.dataset_digest,
      replay_evidence_digest:
        output.reproducibility.replay_evidence_digest,
      unique_counts: output.diagnostics.unique_counts,
      regime_coverage: output.diagnostics.regime_coverage,
      sector_coverage: output.diagnostics.sector_coverage,
      insufficient_count: output.diagnostics.insufficient_count,
      conflicting_count: output.diagnostics.conflicting_count,
      provider_gap_count: output.diagnostics.provider_gap_count,
    })}`,
  );
});

test("cross-TZ child processes produce one byte-identical replay digest", () => {
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
        "tests/e2e/action-667k-market-context-shadow-replay.spec.ts",
        "--grep",
        "fixed cross-process replay digest",
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
      /ACTION_667K_TZ_DIGEST=([a-f0-9]{64})/,
    );
    expect(match?.[1]).toMatch(/^[0-9a-f]{64}$/);
    return match?.[1];
  });

  expect(new Set(digests).size).toBe(1);
});

test("replay implementation has no provider, database, capture, or live import", () => {
  const replayFiles = [
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab/shadow-replay-v1.ts",
    ),
    resolve(
      repositoryRoot,
      "lib/market-context-intelligence-lab/shadow-replay-fixtures-v1.ts",
    ),
  ];
  const sources = replayFiles
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  const forbiddenTokens = [
    "@/lib/scanner",
    "@/lib/recommendation-generator",
    "@/lib/supabase",
    "getServerSupabaseClient",
    ".from(\"",
    ".from('",
    "fetch(",
    "axios",
  ];

  expect(
    forbiddenTokens.filter((token) => sources.includes(token)),
  ).toEqual([]);

  const labRoot = resolve(
    repositoryRoot,
    "lib/market-context-intelligence-lab",
  );
  const liveOffenders = ["app", "lib"]
    .flatMap((root) => sourceFiles(resolve(repositoryRoot, root)))
    .filter((path) => !path.startsWith(labRoot))
    .filter((path) =>
      [
        "shadow-replay-v1",
        "market_context_shadow_replay_v1",
      ].some((token) => readFileSync(path, "utf8").includes(token)),
    );

  expect(
    liveOffenders.map((path) => relative(repositoryRoot, path)),
  ).toEqual([]);
});
