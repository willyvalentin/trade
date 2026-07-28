import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import {
  MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS,
  buildMarketContextDiagnosticContextFixtureResultV1,
  loadMarketContextDiagnosticContextFixtureInputsV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-fixtures-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_TAXONOMY_V1,
  createMarketContextDiagnosticContextSnapshotBatchV1,
  createMarketContextDiagnosticContextSnapshotV1,
  deriveMarketContextDiagnosticTrustRootV1,
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
  toMarketContextDiagnosticIntelligenceEnvelopeV1,
  verifyMarketContextDiagnosticContextSnapshotV1,
  type MarketContextDiagnosticContextSnapshotInputV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";

const repositoryRoot = resolve(__dirname, "../..");
let fixtureCache:
  | ReturnType<typeof loadMarketContextDiagnosticContextFixtureInputsV1>
  | undefined;

function fixtures() {
  fixtureCache ??= loadMarketContextDiagnosticContextFixtureInputsV1({
    repo_root: repositoryRoot,
  });
  return fixtureCache;
}

function firstInput() {
  const mapped = fixtures().inputs.find((input) => {
    const classification = sourceRecord(input).evaluation.v2_evaluation
      .classification;
    return !["insufficient_data", "conflicting_context"].includes(
      classification,
    );
  });
  if (!mapped) throw new Error("mapped_fixture_missing");
  return structuredClone(mapped);
}

type MutableSourceDecision = {
  adapter_audit: {
    record_finalization_violation_count: number;
    current_session_gap_count: number;
  };
  schedule: {
    provisional_watermark_ns: string;
  };
  evaluation: {
    v2_evaluation: {
      classification: string;
      provider_timestamps: { source_timestamp: string }[];
      coverage: { missingness: number };
    };
  };
};

function sourceRecord(input: MarketContextDiagnosticContextSnapshotInputV1) {
  return input.source_decision as MutableSourceDecision;
}

function rehashSourceWithoutTrustRoot(
  input: MarketContextDiagnosticContextSnapshotInputV1,
) {
  input.source_decision_sha256 =
    marketContextDiagnosticContextSha256V1(input.source_decision);
}

function rehashSourceAndTrustRoot(
  input: MarketContextDiagnosticContextSnapshotInputV1,
) {
  rehashSourceWithoutTrustRoot(input);
  input.external_trust_root_digest =
    deriveMarketContextDiagnosticTrustRootV1(input);
}

test("N.1 contract exposes only the exact four-state taxonomy and diagnostic boundary", () => {
  expect(MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V1).toBe(
    "market_context_diagnostic_decision_time_context_feature_snapshot_v1",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_TAXONOMY_V1).toEqual([
    "mapped",
    "insufficient_data",
    "conflicting",
    "not_point_in_time_safe",
  ]);
  expect(MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1).toEqual({
    diagnostic_only: true,
    official_ohlcv: false,
    canonical_performance_eligible: false,
    causal_claimed: false,
    outcome_explanation_claimed: false,
    live_ranking_effect: false,
    automatic_model_input_allowed: false,
  });
});

test("all 60 frozen replay decisions become reconciled point-in-time snapshots", () => {
  const result = buildMarketContextDiagnosticContextFixtureResultV1({
    repo_root: repositoryRoot,
  });
  expect(result.decision_count).toBe(60);
  expect(result.taxonomy_counts).toEqual({
    mapped: 31,
    insufficient_data: 7,
    conflicting: 22,
    not_point_in_time_safe: 0,
  });
  expect(new Set(result.snapshots.map((item) => item.feature_snapshot_digest)).size)
    .toBe(60);
  for (const snapshot of result.snapshots) {
    expect(snapshot.boundary).toEqual(
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
    );
    expect(snapshot.point_in_time).toMatchObject({
      provider_timestamp_after_decision_count: 0,
      future_input_points_passed_to_core: 0,
      record_finalization_violation_count: 0,
      current_full_day_aggregation_used: false,
    });
    expect(snapshot.context?.breadth).toMatchObject({
      not_full_market_breadth: true,
      declared_sector_etf_count: 11,
    });
    expect(snapshot.context?.calibrated_probability).toBe(false);
  }
});

test("mapped snapshots bind lossless context, ranks, gaps, timestamps, and source roots", () => {
  const snapshot = createMarketContextDiagnosticContextSnapshotV1(firstInput());
  expect(snapshot.taxonomy).toBe("mapped");
  expect(snapshot.context).not.toBeNull();
  expect(snapshot.context?.sector_contexts).toHaveLength(11);
  expect(snapshot.context?.provider_context_timestamps).toHaveLength(14);
  expect(snapshot.context?.available_candle_window).toMatchObject({
    finalized_minute_count: 60,
    current_full_day_aggregation_used: false,
  });
  expect(snapshot.context?.gaps_and_coverage).toMatchObject({
    forward_fill_used: false,
    pending_buckets_counted_as_missing: false,
  });
  expect(snapshot.identities.replay.output_tree_digest).toBe(
    MARKET_CONTEXT_DIAGNOSTIC_REPLAY_EXTERNAL_ROOTS.replay_output_tree_digest,
  );
  expect(snapshot.feature_snapshot_digest).toMatch(/^[a-f0-9]{64}$/);
});

test("future candles, future provider times, and unfinalized buckets fail closed", () => {
  const futureCandle = firstInput();
  sourceRecord(futureCandle).adapter_audit.record_finalization_violation_count =
    1;
  rehashSourceAndTrustRoot(futureCandle);
  expect(
    createMarketContextDiagnosticContextSnapshotV1(futureCandle).taxonomy,
  ).toBe("not_point_in_time_safe");

  const futureProvider = firstInput();
  sourceRecord(futureProvider).evaluation.v2_evaluation.provider_timestamps[0]
    .source_timestamp = "2026-12-31T23:59:59.999999999Z";
  rehashSourceAndTrustRoot(futureProvider);
  expect(
    createMarketContextDiagnosticContextSnapshotV1(futureProvider),
  ).toMatchObject({
    taxonomy: "not_point_in_time_safe",
    reason_codes: expect.arrayContaining([
      expect.stringContaining("provider_timestamp_after_decision"),
    ]),
  });

  const unfinalized = firstInput();
  sourceRecord(unfinalized).schedule.provisional_watermark_ns = "0";
  rehashSourceAndTrustRoot(unfinalized);
  expect(
    createMarketContextDiagnosticContextSnapshotV1(unfinalized).taxonomy,
  ).toBe("not_point_in_time_safe");
});

test("calendar, dataset, replay, coverage, gap, and trust-root drift are rejected", () => {
  for (const mutate of [
    (input: MarketContextDiagnosticContextSnapshotInputV1) => {
      input.calendar.digest = "a".repeat(64);
    },
    (input: MarketContextDiagnosticContextSnapshotInputV1) => {
      input.normalized_dataset.dataset_digest = "b".repeat(64);
    },
    (input: MarketContextDiagnosticContextSnapshotInputV1) => {
      input.replay.dataset_digest = "c".repeat(64);
    },
    (input: MarketContextDiagnosticContextSnapshotInputV1) => {
      sourceRecord(input).adapter_audit.current_session_gap_count += 1;
      rehashSourceWithoutTrustRoot(input);
    },
    (input: MarketContextDiagnosticContextSnapshotInputV1) => {
      sourceRecord(input).evaluation.v2_evaluation.coverage.missingness = 0.9;
      rehashSourceWithoutTrustRoot(input);
    },
    (input: MarketContextDiagnosticContextSnapshotInputV1) => {
      input.external_trust_root_digest = "d".repeat(64);
    },
  ]) {
    const input = firstInput();
    mutate(input);
    expect(
      createMarketContextDiagnosticContextSnapshotV1(input).taxonomy,
    ).toBe("conflicting");
  }
});

test("caller safety/canonical claims and malformed nanoseconds are rejected", () => {
  for (const forbidden of [
    "point_in_time_safe",
    "complete",
    "sufficient",
    "canonical",
    "performance_eligible",
    "official_ohlcv",
    "outcome_explanatory",
  ]) {
    const input = firstInput() as unknown as Record<string, unknown>;
    input[forbidden] = true;
    const output = createMarketContextDiagnosticContextSnapshotV1(input);
    expect(output.taxonomy).toBe("not_point_in_time_safe");
    expect(output.reason_codes).toContain(
      `caller_declaration_forbidden:${forbidden}`,
    );
  }
  for (const value of ["2026-07-20T14:30:02", "1.2", "-1", "NaN", ""]) {
    const input = firstInput();
    input.decision_unix_ns = value;
    expect(
      createMarketContextDiagnosticContextSnapshotV1(input).taxonomy,
    ).toBe("not_point_in_time_safe");
  }
});

test("duplicate decisions and identity collisions are explicit conflicts", () => {
  const input = firstInput();
  const duplicate = createMarketContextDiagnosticContextSnapshotBatchV1([
    input,
    structuredClone(input),
  ]);
  expect(duplicate.map((item) => item.taxonomy)).toEqual([
    "mapped",
    "conflicting",
  ]);
  expect(duplicate[1]?.reason_codes).toContain("duplicate_decision_identity");

  const collisionInput = structuredClone(input);
  collisionInput.decision_unix_ns = (
    BigInt(collisionInput.decision_unix_ns) + BigInt(1)
  ).toString();
  const collision = createMarketContextDiagnosticContextSnapshotBatchV1([
    input,
    collisionInput,
  ]);
  expect(collision[1]?.reason_codes).toContain("decision_identity_collision");
});

test("self-consistent snapshot tampering still fails trusted-input verification", () => {
  const input = firstInput();
  const snapshot = createMarketContextDiagnosticContextSnapshotV1(input);
  const tampered = structuredClone(snapshot);
  if (!tampered.context) throw new Error("expected_mapped_context");
  tampered.context.regime_classification = "risk_on_trending";
  const material = structuredClone(tampered) as Record<string, unknown>;
  delete material.feature_snapshot_digest;
  tampered.feature_snapshot_digest =
    marketContextDiagnosticContextSha256V1(material);
  expect(verifyMarketContextDiagnosticContextSnapshotV1(tampered, input)).toBe(
    false,
  );
});

test("input bytes are immutable and reverse input order produces the same result", () => {
  const loaded = fixtures();
  const before = stableMarketContextDiagnosticContextJsonV1(loaded.inputs);
  const canonical = createMarketContextDiagnosticContextSnapshotBatchV1(
    loaded.inputs,
  );
  expect(stableMarketContextDiagnosticContextJsonV1(loaded.inputs)).toBe(before);
  const reverse = createMarketContextDiagnosticContextSnapshotBatchV1(
    [...loaded.inputs].reverse(),
  );
  expect(stableMarketContextDiagnosticContextJsonV1(reverse)).toBe(
    stableMarketContextDiagnosticContextJsonV1(canonical),
  );
});

test("neutral intelligence envelope remains diagnostic and verification-gated", () => {
  const snapshot = createMarketContextDiagnosticContextSnapshotV1(firstInput());
  expect(toMarketContextDiagnosticIntelligenceEnvelopeV1(snapshot)).toMatchObject(
    {
      taxonomy: "mapped",
      verification_required_before_consumption: true,
      canonical_binding_ready: false,
      boundary: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
    },
  );
});

test("N.1 machine-readable evidence is canonical and status-complete", () => {
  const evidence = JSON.parse(
    readFileSync(
      "docs/evidence/action-667n1-diagnostic-context-feature-snapshots.json",
      "utf8",
    ),
  );
  expect(
    marketContextDiagnosticContextSha256V1(evidence.decision_material),
  ).toBe(evidence.evidence_digest);
  expect(evidence.decision_material.result.taxonomy_counts).toEqual({
    mapped: 31,
    insufficient_data: 7,
    conflicting: 22,
    not_point_in_time_safe: 0,
  });
  expect(evidence.decision_material.statuses).toMatchObject({
    action_667n1_context_snapshot_contract_implemented: true,
    action_667n1_point_in_time_safety_verified: true,
    action_667n1_sixty_snapshots_reconciled: true,
    action_667n1_cross_timezone_determinism_passed: true,
    action_667n1_intelligence_adapter_boundary_ready: true,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
});

test("fixed N.1 cross-process digest", () => {
  const order =
    process.env.ACTION_667N1_INPUT_ORDER === "reverse"
      ? "reverse"
      : "canonical";
  const result = buildMarketContextDiagnosticContextFixtureResultV1({
    repo_root: repositoryRoot,
    input_order: order,
  });
  console.log(`ACTION_667N1_TZ_DIGEST=${result.canonical_result_digest}`);
  console.log(
    `ACTION_667N1_RECEIPT=${stableMarketContextDiagnosticContextJsonV1({
      calendar: result.calendar,
      canonical_result_digest: result.canonical_result_digest,
      decision_count: result.decision_count,
      external_roots: result.external_roots,
      external_trust_root_digest: result.external_trust_root_digest,
      source_inventory_digest: result.source_inventory_digest,
      taxonomy_counts: result.taxonomy_counts,
    })}`,
  );
  expect(result.decision_count).toBe(60);
});

test("UTC A/B, Stockholm reverse, and New York are byte-identical", () => {
  test.setTimeout(180_000);
  const runs = [
    ["UTC", "canonical"],
    ["UTC", "canonical"],
    ["Europe/Stockholm", "reverse"],
    ["America/New_York", "canonical"],
  ] as const;
  const digests = runs.map(([timezone, order]) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667n1-diagnostic-context-feature-snapshot.spec.ts",
        "--grep",
        "fixed N.1 cross-process digest",
        "--reporter=line",
        "--output",
        `/private/tmp/action-667n1-${timezone.replaceAll("/", "-")}-${order}`,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          ACTION_667N1_INPUT_ORDER: order,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
        timeout: 120_000,
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(/ACTION_667N1_TZ_DIGEST=([a-f0-9]{64})/)?.[1];
  });
  expect(digests.every((digest) => digest?.length === 64)).toBe(true);
  expect(new Set(digests).size).toBe(1);
});

test("implementation has no provider, DB, live, Action 665/666, dependency, or outcome import", () => {
  const paths = [
    "lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1.ts",
    "lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-fixtures-v1.ts",
    "scripts/market_context_diagnostic_context_snapshots_v1.ts",
  ];
  const source = paths.map((path) => readFileSync(path, "utf8")).join("\n");
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:@databento|supabase|database|scanner|recommendation|publication|capture|action-665|action-666)[^"']*["']/i,
  );
  expect(source).not.toContain("DATABENTO_API_KEY");
  expect(source).not.toMatch(/outcome[_-](?:join|bundle|result)/i);
});
