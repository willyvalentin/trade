import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  buildMarketContextIntelligenceV2,
  MARKET_CONTEXT_INTELLIGENCE_VERSION_V2,
  type MarketContextIntelligenceV2Input,
} from "../../lib/market-context-intelligence-lab/contract-v2";
import {
  MARKET_CONTEXT_EXPLICIT_INSTANT_PARSER_VERSION,
  parseMarketContextExplicitInstant,
} from "../../lib/market-context-intelligence-lab/explicit-instant-v1";
import { marketContextIntelligenceV1GoldenFixtures } from "../../lib/market-context-intelligence-lab/golden-fixtures-v1";
import {
  buildLosslessMarketContextShadowBridge,
  MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION,
  MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2,
  restoreMarketContextFromLosslessBridge,
  type MarketContextProducerVersionMetadata,
} from "../../lib/market-context-intelligence-lab/shadow-canonical-bridge-v1";
import {
  MARKET_CONTEXT_THRESHOLD_REGISTRY_V2,
  MARKET_CONTEXT_THRESHOLD_VERSION_V2,
} from "../../lib/market-context-intelligence-lab/thresholds-v2";
import remediationEvidence from "../../docs/evidence/action-667d-explicit-instant-adapter-evidence.json";

const repositoryRoot = resolve(process.cwd());

const completeProducerVersions: MarketContextProducerVersionMetadata = {
  engine_version: "market_context_shadow_engine_v2",
  scoring_version: "no_live_scoring_shadow_only",
  ranking_version: "no_live_ranking_shadow_only",
  setup_taxonomy_version: "not_applicable_shadow_context",
  confidence_contract_version: "ordinal_evidence_not_probability_v1",
  evaluator_version: "market_context_shadow_evaluator_v2",
  provider_contract_version: "caller_supplied_market_series_v1",
  git_commit: "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33",
  build_identity: "action-667d-local-shadow-build",
};

function cloneInput(input: MarketContextIntelligenceV2Input) {
  return JSON.parse(JSON.stringify(input)) as MarketContextIntelligenceV2Input;
}

function fixtureInput(id = "clear_risk_on_trend") {
  const fixture = marketContextIntelligenceV1GoldenFixtures.find(
    (candidate) => candidate.id === id,
  );
  if (!fixture) throw new Error(`Missing fixture: ${id}`);
  return cloneInput(fixture.input);
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) return sourceFiles(path);
    return path.endsWith(".ts") || path.endsWith(".tsx") ? [path] : [];
  });
}

test("shared parser accepts only valid explicit instants and canonicalizes offsets", () => {
  expect(MARKET_CONTEXT_EXPLICIT_INSTANT_PARSER_VERSION).toBe(
    "market_context_explicit_instant_parser_v1",
  );
  expect(
    parseMarketContextExplicitInstant(
      "2026-07-24T22:00:00+02:00",
      "timestamp",
    ),
  ).toEqual({
    ok: true,
    canonical_timestamp: "2026-07-24T20:00:00.000Z",
    epoch_milliseconds: Date.parse("2026-07-24T20:00:00.000Z"),
  });

  for (const invalid of [
    "2026-07-24T20:00:00",
    "2026-07-24",
    "2026-07-24T20:00:00z",
    "2026-02-30T20:00:00Z",
    "2026-07-24T20:00:60Z",
    "2026-07-24T20:00:00+14:01",
    "2026-07-24T20:00:00+24:00",
    "2026-07-24T20:00:00+01:60",
    " 2026-07-24T20:00:00Z",
  ]) {
    expect(
      parseMarketContextExplicitInstant(invalid, "timestamp"),
    ).toEqual({
      ok: false,
      error_code: "market_context_invalid_explicit_instant",
      field: "timestamp",
    });
  }
});

test("naive timestamps fail closed at every required v2 input boundary", () => {
  const mutations: Array<{
    field: string;
    mutate: (input: MarketContextIntelligenceV2Input) => void;
  }> = [
    {
      field: "decision_timestamp",
      mutate: (input) => {
        input.decision_timestamp = "2026-07-24T20:00:00";
      },
    },
    {
      field: "benchmark.QQQ.intraday.point_timestamp",
      mutate: (input) => {
        input.benchmarks.find((item) => item.symbol === "QQQ")!
          .intraday[0].timestamp = "2026-07-24T19:55:00";
      },
    },
    {
      field: "breadth.point_timestamp",
      mutate: (input) => {
        input.breadth!.timestamp = "2026-07-24T19:55:00";
      },
    },
    {
      field: "sector.technology.short_horizon.point_timestamp",
      mutate: (input) => {
        input.sectors!.find(
          (sector) => sector.sector_id === "technology",
        )!.short_horizon[0].timestamp = "2026-07-24T19:55:00";
      },
    },
    {
      field: "benchmark.SPY.provider.source_timestamp",
      mutate: (input) => {
        input.benchmarks.find((item) => item.symbol === "SPY")!
          .provider.source_timestamp = "2026-07-24T19:55:00";
      },
    },
  ];

  for (const mutation of mutations) {
    const input = fixtureInput();
    mutation.mutate(input);
    expect(() => buildMarketContextIntelligenceV2(input)).toThrow(
      `market_context_invalid_explicit_instant:${mutation.field}`,
    );
  }
});

test("DST-boundary and offset-equivalent complete inputs are byte-identical", () => {
  const pairs = [
    ["2026-03-29T01:30:00Z", "2026-03-29T03:30:00+02:00"],
    ["2026-10-25T01:30:00Z", "2026-10-25T02:30:00+01:00"],
    ["2026-11-01T06:30:00Z", "2026-11-01T01:30:00-05:00"],
  ] as const;

  for (const [utcTimestamp, offsetTimestamp] of pairs) {
    const utcInput = rebaseInput(fixtureInput(), utcTimestamp);
    const offsetInput = rebaseInput(fixtureInput(), offsetTimestamp);
    expect(JSON.stringify(buildMarketContextIntelligenceV2(offsetInput))).toBe(
      JSON.stringify(buildMarketContextIntelligenceV2(utcInput)),
    );
  }
});

test("full v2 output has a fixed cross-process timezone digest", () => {
  const output = buildMarketContextIntelligenceV2(fixtureInput());
  const digest = sha256(JSON.stringify(output));

  expect(output.context_version).toBe(
    MARKET_CONTEXT_INTELLIGENCE_VERSION_V2,
  );
  expect(output.threshold_version).toBe(
    MARKET_CONTEXT_THRESHOLD_VERSION_V2,
  );
  expect(digest).toBe(
    remediationEvidence.evidence_payload.verification
      .cross_timezone_output_sha256,
  );
  console.log(`ACTION_667D_TZ_DIGEST=${digest}`);
});

test("v2 keeps all fourteen frozen v1 classifications unchanged", () => {
  expect(
    marketContextIntelligenceV1GoldenFixtures.map((fixture) => ({
      id: fixture.id,
      regime: buildMarketContextIntelligenceV2(
        cloneInput(fixture.input),
      ).regime_classification,
    })),
  ).toEqual(
    marketContextIntelligenceV1GoldenFixtures.map((fixture) => ({
      id: fixture.id,
      regime: fixture.expected.regime_classification,
    })),
  );
});

test("threshold v2 marks exactly two unchanged values reserved-inactive", () => {
  const reserved = MARKET_CONTEXT_THRESHOLD_REGISTRY_V2.filter(
    (threshold) => threshold.status === "reserved_inactive",
  );

  expect(MARKET_CONTEXT_THRESHOLD_REGISTRY_V2).toHaveLength(21);
  expect(reserved).toEqual([
    expect.objectContaining({
      threshold_id: "freshness_minutes.intraday",
      value: 30,
      classification_effect: false,
    }),
    expect.objectContaining({
      threshold_id: "freshness_minutes.sector_short",
      value: 30,
      classification_effect: false,
    }),
  ]);
  expect(
    MARKET_CONTEXT_THRESHOLD_REGISTRY_V2.filter(
      (threshold) => threshold.status === "active",
    ),
  ).toHaveLength(19);
});

test("lossless bridge carries every context field and round-trips byte-identically", () => {
  const context = buildMarketContextIntelligenceV2(fixtureInput());
  const envelope = buildLosslessMarketContextShadowBridge({
    context,
    producer_versions: completeProducerVersions,
  });

  expect(envelope.binding_status).toBe("shadow_bridge_ready");
  if (envelope.binding_status !== "shadow_bridge_ready") {
    throw new Error("Expected ready bridge");
  }
  expect(envelope.bridge_schema_version).toBe(
    MARKET_CONTEXT_CANONICAL_BRIDGE_SCHEMA_VERSION,
  );
  expect(envelope.adapter_version).toBe(
    MARKET_CONTEXT_SHADOW_ADAPTER_VERSION_V2,
  );
  expect(envelope.payload.versions.producer).toEqual(
    completeProducerVersions,
  );
  expect(envelope.payload.provider_domains).toHaveLength(
    context.provider_timestamps.length,
  );
  expect(envelope.payload.sector_contexts).toEqual(context.sectors);
  expect(envelope.payload.dimensions).toEqual(context.dimensions);
  expect(envelope.payload.coverage_and_missingness).toEqual(context.coverage);
  expect(envelope.payload.evidence).toEqual({
    strength: context.evidence_strength,
    confidence: context.confidence,
  });
  expect(envelope.payload.evidence.confidence.calibrated_probability).toBe(
    false,
  );
  expect(JSON.stringify(restoreMarketContextFromLosslessBridge(envelope))).toBe(
    JSON.stringify(context),
  );
  expect(envelope.canonical_binding_ready).toBe(false);
  expect(envelope.canonical_format_compatible).toBe(false);
  expect(envelope.capture_enabled).toBe(false);
  expect(envelope.persistence_enabled).toBe(false);
});

test("every missing required producer version fails not-bindable without fallback", () => {
  const context = buildMarketContextIntelligenceV2(fixtureInput());

  for (const field of Object.keys(
    completeProducerVersions,
  ) as Array<keyof MarketContextProducerVersionMetadata>) {
    const incomplete = { ...completeProducerVersions };
    delete incomplete[field];
    const envelope = buildLosslessMarketContextShadowBridge({
      context,
      producer_versions: incomplete,
    });

    expect(envelope.binding_status).toBe("not_bindable");
    expect(envelope.payload).toBeNull();
    expect(envelope.validation_errors).toContain(
      `missing_required_producer_version:${field}`,
    );
  }

  const absent = buildLosslessMarketContextShadowBridge({ context });
  expect(absent.binding_status).toBe("not_bindable");
  expect(absent.payload).toBeNull();
  expect(absent.validation_errors).toHaveLength(9);
});

test("evidence report digest, decisions, and threshold metadata are deterministic", () => {
  const evidencePayload = remediationEvidence.evidence_payload;
  expect(sha256(JSON.stringify(evidencePayload))).toBe(
    remediationEvidence.evidence_digest.value,
  );
  for (const artifact of evidencePayload.artifact_sha256) {
    expect(
      sha256(readFileSync(resolve(repositoryRoot, artifact.path))),
    ).toBe(artifact.sha256);
  }
  expect(evidencePayload.threshold_decisions).toEqual([
    expect.objectContaining({
      threshold_id: "freshness_minutes.intraday",
      status: "reserved_inactive",
      classification_effect: false,
    }),
    expect.objectContaining({
      threshold_id: "freshness_minutes.sector_short",
      status: "reserved_inactive",
      classification_effect: false,
    }),
  ]);
  expect(evidencePayload.decisions).toMatchObject({
    action_667d_explicit_instant_remediated: true,
    action_667d_lossless_adapter_ready: true,
    canonical_binding_ready: false,
    canonical_format_compatible: false,
    shadow_only: true,
    live_ranking_effect: false,
  });
});

test("v2 remediation has no Spår 2, provider, persistence, or live consumer import", () => {
  const labFiles = sourceFiles(
    resolve(repositoryRoot, "lib/market-context-intelligence-lab"),
  ).filter(
    (path) =>
      path.endsWith("contract-v2.ts") ||
      path.endsWith("explicit-instant-v1.ts") ||
      path.endsWith("thresholds-v2.ts") ||
      path.endsWith("shadow-canonical-bridge-v1.ts"),
  );
  const forbiddenTokens = [
    "canonical-recommendation-evaluation",
    "canonical-evaluation-projection-adapters",
    "@/lib/scanner",
    "@/lib/recommendation-generator",
    "supabase",
    "fetch(",
  ];
  const forbiddenImports = labFiles.flatMap((path) =>
    forbiddenTokens
      .filter((token) => readFileSync(path, "utf8").includes(token))
      .map((token) => ({ path, token })),
  );
  expect(forbiddenImports).toEqual([]);

  const liveOffenders = ["app", "lib"]
    .flatMap((root) => sourceFiles(resolve(repositoryRoot, root)))
    .filter(
      (path) =>
        !path.includes("/lib/market-context-intelligence-lab/") &&
        [
          "contract-v2",
          "shadow-canonical-bridge-v1",
          "market_context_intelligence_v2",
        ].some((token) => readFileSync(path, "utf8").includes(token)),
    );
  expect(liveOffenders).toEqual([]);
});

function rebaseInput(
  input: MarketContextIntelligenceV2Input,
  decisionTimestamp: string,
) {
  const rebased = cloneInput(input);
  const decisionMs = Date.parse(decisionTimestamp);
  const pointTimestamp = new Date(decisionMs - 5 * 60_000).toISOString();
  const receivedTimestamp = new Date(decisionMs - 4 * 60_000).toISOString();
  rebased.decision_timestamp = decisionTimestamp;

  for (const benchmark of rebased.benchmarks) {
    benchmark.provider.source_timestamp = pointTimestamp;
    benchmark.provider.received_timestamp = receivedTimestamp;
    for (const point of [...benchmark.intraday, ...benchmark.multi_day]) {
      point.timestamp = pointTimestamp;
    }
  }
  if (rebased.breadth) {
    rebased.breadth.timestamp = pointTimestamp;
    rebased.breadth.provider.source_timestamp = pointTimestamp;
    rebased.breadth.provider.received_timestamp = receivedTimestamp;
  }
  for (const sector of rebased.sectors ?? []) {
    sector.provider.source_timestamp = pointTimestamp;
    sector.provider.received_timestamp = receivedTimestamp;
    for (const point of [
      ...sector.short_horizon,
      ...sector.medium_horizon,
    ]) {
      point.timestamp = pointTimestamp;
    }
  }
  return rebased;
}
