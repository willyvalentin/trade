import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  getIntelligenceContextStaticFixtures,
  type Action336IntelligenceContextStaticFixture,
} from "../../lib/intelligence-context-static-fixtures";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";
import {
  mapSnapshotToLearningDataset,
  type SnapshotToLearningDatasetMapperInput,
  type SnapshotToLearningDatasetMapperResult,
} from "../../lib/snapshot-to-learning-dataset-mapper";

const at = "2026-07-08T13:45:00.000Z";
const mapperHash = "e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b";
const action394MapperHash = "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d";
const fixtureHashes = {
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};

function snapshot(overrides: Partial<RecommendationSnapshot> = {}): RecommendationSnapshot {
  return {
    id: "snapshot:audit392:001",
    snapshot_fingerprint: "snapshot_fingerprint:audit392:001",
    recommendation_id: "recommendation:audit392:001",
    scan_run_id: "scan_run:audit392:001",
    ticker: "AAPL",
    company_name: "Apple",
    recommended_at: at,
    app_timestamp: at,
    window: "morning",
    status: "visible",
    source_mode: "static_audit",
    data_mode: "static_audit",
    market_session_phase: "morning",
    market_session_risk: null,
    market_session_source: null,
    is_visible: true,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 200,
    entry_low: 200,
    entry_high: 200,
    stop: 198,
    target: 204,
    side: "long",
    risk_per_share: 2,
    reward_per_share: 4,
    planned_risk_reward: 2,
    confidence: 0.78,
    score: 78,
    rating: "high",
    label: null,
    type: "momentum_continuation",
    rationale: "Action 392 static audit",
    reason: null,
    catalyst: null,
    primary_risk: null,
    market_data_snapshot: null,
    quote_price: 200,
    volume: 1000,
    liquidity: "high",
    spread: 0.02,
    freshness: "fresh",
    data_age_minutes: 1,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      candidate_id: "candidate:audit392:001",
      batch_fingerprint: "batch:audit392:001",
      trading_day: "2026-07-08",
      setup_family: "momentum_continuation",
      confidence_label: "high",
      tier: "valid",
      invalidation_logic: "close_below_198",
      sanitizer_passed: true,
      risk_geometry_valid: true,
      snapshot_completeness: "complete",
      enrichment_version: "static_audit392_v1",
      outcome_horizon: "60m",
      side: "buy",
      confidence: 78,
    },
    was_taken: false,
    linked_position_id: null,
    created_at: at,
    updated_at: at,
    ...overrides,
  };
}

function contextFor(
  source: RecommendationSnapshot,
  fixture: Action336IntelligenceContextStaticFixture = getIntelligenceContextStaticFixtures()[0],
): Action336IntelligenceContextStaticFixture {
  return {
    ...fixture,
    recommendation_linkage: {
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      recommendation_created_at: at,
    },
    context: {
      ...fixture.context,
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      captured_at: "2026-07-08T13:44:30.000Z",
    },
  };
}

function outcomeFor(source: RecommendationSnapshot, overrides: Partial<RecommendationOutcome> = {}): RecommendationOutcome {
  return {
    id: "outcome:audit392:001",
    snapshot_id: source.id,
    snapshot_fingerprint: source.snapshot_fingerprint,
    recommendation_id: source.recommendation_id,
    ticker: source.ticker,
    side: "long",
    recommended_at: at,
    evaluated_at: "2026-07-08T14:45:00.000Z",
    horizon: "60m",
    status: "target_hit",
    entry: source.entry,
    stop: source.stop,
    target: source.target,
    entry_triggered: true,
    entry_triggered_at: "2026-07-08T13:50:00.000Z",
    target_hit: true,
    target_hit_at: "2026-07-08T14:20:00.000Z",
    stop_hit: false,
    stop_hit_at: null,
    first_terminal_event: "target_hit",
    best_price_after_recommendation: 204.2,
    worst_price_after_recommendation: 199.5,
    best_r: 2.1,
    worst_r: -0.25,
    eod_price: 204,
    eod_r: 2,
    current_price: 204,
    current_r: 2,
    max_favorable_excursion: 4.2,
    max_adverse_excursion: -0.5,
    time_to_entry_minutes: 5,
    time_to_target_minutes: 35,
    time_to_stop_minutes: null,
    source: "static_audit",
    provider: "static_audit",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: { gross_r_multiple: 2 },
    created_at: "2026-07-08T14:45:00.000Z",
    updated_at: "2026-07-08T14:45:00.000Z",
    ...overrides,
  };
}

function input(
  snapshotOverrides: Partial<RecommendationSnapshot> = {},
  fixture: Action336IntelligenceContextStaticFixture | null = getIntelligenceContextStaticFixtures()[0],
  outcomeOverrides: Partial<RecommendationOutcome> | null = {},
): SnapshotToLearningDatasetMapperInput {
  const recommendationSnapshot = snapshot(snapshotOverrides);
  return {
    recommendationSnapshot,
    contextSnapshot: fixture ? contextFor(recommendationSnapshot, fixture) : null,
    outcome: outcomeOverrides === null ? null : outcomeFor(recommendationSnapshot, outcomeOverrides),
  };
}

function unsafe(value: unknown): SnapshotToLearningDatasetMapperInput {
  return value as SnapshotToLearningDatasetMapperInput;
}

function payload(source: RecommendationSnapshot) {
  return source.payload_json as Record<string, unknown>;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function expectBlocked(
  result: SnapshotToLearningDatasetMapperResult,
  status: SnapshotToLearningDatasetMapperResult["status"],
  code: string,
  path: string,
) {
  expect(result.status).toBe(status);
  expect(result.row).toBeNull();
  expect(result.consumable).toBe(false);
  expect(result.issues.some((item) => item.code === code && item.path === path)).toBe(true);
}

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? files(child) : [child];
  });
}

test.describe.serial("Action 392 independent remediation audit", () => {
  test("mapper and all fixture hashes remain immutable", () => {
    expect([mapperHash, action394MapperHash]).toContain(sha256("lib/snapshot-to-learning-dataset-mapper.ts"));
    for (const [path, hash] of Object.entries(fixtureHashes)) expect(sha256(path), path).toBe(hash);
  });

  test("all seven original Action 389 findings are closed", () => {
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const cases = [
      {
        result: mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, context: { ...context.context, market: { ...context.context.market, market_regime: { state: "present", value: "magical" } } } } })),
        status: "blocked_invalid_provenance", code: "invalid_provenance", path: "/contextSnapshot/context/market/market_regime/value",
      },
      {
        result: mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, freshness: { state: "instantaneous", age_minutes_at_recommendation: 1, rationale: "invalid" } } })),
        status: "blocked_invalid_provenance", code: "invalid_provenance", path: "/contextSnapshot/freshness/state",
      },
      {
        result: mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, freshness: { state: "stale", age_minutes_at_recommendation: 120, rationale: "invalid", fresh: true }, data_provenance: { ...context.data_provenance, state: "partial", audit_readback_status: "partial", missing_data_flags: ["stale_source"] } } })),
        status: "blocked_invalid_provenance", code: "invalid_provenance", path: "/contextSnapshot/freshness/fresh",
      },
      {
        result: mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, context: { ...context.context, relative_strength: { ...context.context.relative_strength, stock_vs_spy: { state: "present", value: Number.NaN } } } } })),
        status: "blocked_invalid_provenance", code: "invalid_provenance", path: "/contextSnapshot/context/relative_strength/stock_vs_spy/value",
      },
      {
        result: mapSnapshotToLearningDataset(unsafe({ ...base, recommendationSnapshot: { ...base.recommendationSnapshot, window: "overnight_magic" } })),
        status: "blocked_invalid_input", code: "invalid_input", path: "/recommendationSnapshot/window",
      },
      {
        result: mapSnapshotToLearningDataset(unsafe({ ...base, outcome: { ...base.outcome, horizon: "30m" } })),
        status: "blocked_invalid_linkage", code: "invalid_linkage", path: "/outcome/horizon",
      },
      {
        result: mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, anti_leakage_status: "failed" } })),
        status: "blocked_future_leakage", code: "future_leakage", path: "/contextSnapshot/anti_leakage_status",
      },
    ];
    for (const item of cases) expectBlocked(item.result, item.status as SnapshotToLearningDatasetMapperResult["status"], item.code, item.path);
  });

  test("alternate category paths and unsupported case variants block", () => {
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const variants = [
      { context: { ...context.context, market: { ...context.context.market, qqq_direction: { state: "present", value: "sideways" } } }, path: "/contextSnapshot/context/market/qqq_direction/value" },
      { context: { ...context.context, news_catalyst: { ...context.context.news_catalyst, catalyst_type: { state: "present", value: "EARNINGS" } } }, path: "/contextSnapshot/context/news_catalyst/catalyst_type/value" },
      { context: { ...context.context, calendar_event: { ...context.context.calendar_event, event_risk_label: { state: "present", value: " high " } } }, path: "/contextSnapshot/context/calendar_event/event_risk_label/value" },
    ];
    for (const variant of variants) {
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, context: variant.context } }));
      expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", variant.path);
    }
  });

  test("whitespace context-state audit remains historical and recognizes exact Action 394 closure", () => {
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const result = mapSnapshotToLearningDataset(unsafe({
      ...base,
      contextSnapshot: {
        ...context,
        context: {
          ...context.context,
          market: { ...context.context.market, market_regime: { state: " present ", value: "bullish" } },
        },
      },
    }));
    if (sha256("lib/snapshot-to-learning-dataset-mapper.ts") === action394MapperHash) {
      expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/context/market/market_regime/state");
    } else {
      expect(result.status).toBe("mapped");
      expect(result.row?.context.market.market_regime.state).toBe(" present ");
    }
  });

  test("freshness bypass audit preserves discovery and recognizes exact Action 394 closure", () => {
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const cased = mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, freshness: { state: "Fresh", age_minutes_at_recommendation: 1, rationale: "invalid" } } }));
    expectBlocked(cased, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/freshness/state");

    const spaced = mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, freshness: { state: " fresh ", age_minutes_at_recommendation: 1, rationale: "invalid" } } }));
    if (sha256("lib/snapshot-to-learning-dataset-mapper.ts") === action394MapperHash) {
      expectBlocked(spaced, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/freshness/state");
    } else {
      expect(spaced.status).toBe("mapped");
    }
  });

  test("all stale fresh contradiction combinations block without repair", () => {
    const fixtures = getIntelligenceContextStaticFixtures();
    const staleInput = input({}, fixtures[12]);
    const staleContext = staleInput.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expectBlocked(
      mapSnapshotToLearningDataset(unsafe({ ...staleInput, contextSnapshot: { ...staleContext, freshness: { ...staleContext.freshness, fresh: true } } })),
      "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/freshness/fresh",
    );

    const freshInput = input();
    const freshContext = freshInput.contextSnapshot as Action336IntelligenceContextStaticFixture;
    for (const patch of [
      { freshness: { ...freshContext.freshness, stale: true } },
      { data_provenance: { ...freshContext.data_provenance, state: "unavailable", provider: null, source_timestamp: null, source_confidence: null, audit_readback_status: "unavailable", completeness_score: 0 } },
      { data_provenance: { ...freshContext.data_provenance, state: "partial", audit_readback_status: "partial", missing_data_flags: ["stale_source"] } },
    ]) {
      const result = mapSnapshotToLearningDataset(unsafe({ ...freshInput, contextSnapshot: { ...freshContext, ...patch } }));
      expect(result.status).toBe("blocked_invalid_provenance");
      expect(result.row).toBeNull();
    }
  });

  test("every supported numeric context path rejects non-finite strings and wrong types", () => {
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const invalidValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, "0.5", "NaN", "Infinity", true];
    for (const field of ["stock_vs_spy", "stock_vs_sector"] as const) {
      for (const value of invalidValues) {
        const result = mapSnapshotToLearningDataset(unsafe({
          ...base,
          contextSnapshot: { ...context, context: { ...context.context, relative_strength: { ...context.context.relative_strength, [field]: { state: "present", value } } } },
        }));
        expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", `/contextSnapshot/context/relative_strength/${field}/value`);
      }
    }
    for (const [patch, path] of [
      [{ freshness: { ...context.freshness, age_minutes_at_recommendation: "1" } }, "/contextSnapshot/freshness/age_minutes_at_recommendation"],
      [{ data_provenance: { ...context.data_provenance, source_confidence: "0.5" } }, "/contextSnapshot/data_provenance/source_confidence"],
      [{ data_provenance: { ...context.data_provenance, completeness_score: Number.POSITIVE_INFINITY } }, "/contextSnapshot/data_provenance/completeness_score"],
    ] as const) {
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, ...patch } }));
      expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", path);
    }
  });

  test("window casing spacing and unsupported synonyms all block", () => {
    const base = input();
    for (const window of ["Morning", " morning", "morning ", "power hour", "lunch", "close"]) {
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, recommendationSnapshot: { ...base.recommendationSnapshot, window } }));
      expectBlocked(result, "blocked_invalid_input", "invalid_input", "/recommendationSnapshot/window");
    }
  });

  test("payload horizon audit preserves discovery and recognizes exact Action 394 closure", () => {
    for (const outcome_horizon of ["60M", " 60m "]) {
      const source = snapshot({ payload_json: { ...payload(snapshot()), outcome_horizon } });
      const result = mapSnapshotToLearningDataset({
        recommendationSnapshot: source,
        contextSnapshot: contextFor(source),
        outcome: outcomeFor(source),
      });
      if (sha256("lib/snapshot-to-learning-dataset-mapper.ts") === action394MapperHash) {
        expectBlocked(result, "blocked_invalid_input", "invalid_input", "/recommendationSnapshot/payload_json/outcome_horizon");
      } else {
        expect(result.status).toBe("mapped");
        expect(result.row?.outcome_fields.outcome_window).toBe("60m");
      }
    }
  });

  test("anti-leakage passed failed unknown missing and nested availability are monotonic", () => {
    expect(mapSnapshotToLearningDataset(input()).row?.anti_leakage_status).toBe("passed");
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const { anti_leakage_status: _removed, ...missing } = context;
    for (const contextSnapshot of [
      { ...context, anti_leakage_status: "failed" },
      { ...context, anti_leakage_status: "unknown" },
      missing,
      { ...context, context: { ...context.context, available_at_snapshot_time: false } },
    ]) {
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot }));
      expect(result.status).toBe("blocked_future_leakage");
      expect(result.row).toBeNull();
      expect(result.consumable).toBe(false);
      expect(JSON.stringify(result)).not.toContain('"anti_leakage_status":"passed"');
    }
    expect(mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[11])).status).toBe("mapped");
  });

  test("failed leakage outranks invalid provenance and outcome", () => {
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const result = mapSnapshotToLearningDataset(unsafe({
      ...base,
      contextSnapshot: { ...context, anti_leakage_status: "failed", freshness: { state: "invalid" } },
      outcome: { ...base.outcome, status: "magic" },
    }));
    expect(result.status).toBe("blocked_future_leakage");
  });

  test("all 15 valid contexts nullable context windows finite metrics and equivalent horizons regress cleanly", () => {
    for (const fixture of getIntelligenceContextStaticFixtures()) {
      expect(["mapped", "mapped_with_missing_optional_data"]).toContain(mapSnapshotToLearningDataset(input({}, fixture)).status);
    }
    expect(mapSnapshotToLearningDataset(input({}, null, null)).status).toBe("mapped_with_missing_optional_data");
    for (const window of ["morning", "midday", "power_hour", "unknown"] as const) {
      expect(mapSnapshotToLearningDataset(input({ window })).status).toBe("mapped");
    }
    expect(mapSnapshotToLearningDataset(input()).status).toBe("mapped");
    expect(mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[12])).status).toBe("mapped_with_missing_optional_data");
  });

  test("validation precedence status and issue contracts remain deterministic", () => {
    const base = input({ id: "" });
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expect(mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, freshness: { state: "invalid" } } })).status).toBe("blocked_missing_required_identity");

    const valid = input();
    const validContext = valid.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expect(mapSnapshotToLearningDataset(unsafe({ ...valid, outcome: { ...valid.outcome, snapshot_id: "other" }, contextSnapshot: { ...validContext, freshness: { state: "invalid" } } })).status).toBe("blocked_invalid_linkage");
    expect(mapSnapshotToLearningDataset(unsafe({ ...valid, recommendationSnapshot: { ...valid.recommendationSnapshot, payload_json: { ...payload(valid.recommendationSnapshot), side: "sell" } }, contextSnapshot: { ...validContext, freshness: { state: "invalid" } } })).status).toBe("blocked_conflicting_aliases");
    expect(mapSnapshotToLearningDataset(unsafe({ ...valid, contextSnapshot: { ...validContext, effective_at: "2026-07-08T13:46:00.000Z", freshness: { state: "invalid" } } })).status).toBe("blocked_temporal_violation");
    expect(mapSnapshotToLearningDataset(unsafe({ ...valid, contextSnapshot: { ...validContext, freshness: { state: "invalid" } }, outcome: { ...valid.outcome, status: "magic" } })).status).toBe("blocked_invalid_provenance");

    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    for (const status of ["mapped", "mapped_with_missing_optional_data", "blocked_missing_required_identity", "blocked_invalid_linkage", "blocked_conflicting_aliases", "blocked_temporal_violation", "blocked_future_leakage", "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input"]) expect(source).toContain(status);
    for (const code of ["missing_required_identity", "invalid_linkage", "conflicting_aliases", "invalid_timestamp", "temporal_violation", "future_leakage", "invalid_provenance", "invalid_outcome", "invalid_input", "missing_optional_context", "missing_optional_outcome", "unknown_setup", "unavailable_source", "partial_provenance"]) expect(source).toContain(code);
  });

  test("aliases and deterministic identity remain unchanged", () => {
    const equivalent = input({ side: "BUY", confidence: "78", score: 0.78, payload_json: { ...payload(snapshot()), direction: "long", confidence: 78, score: 0.78 } });
    const mapped = mapSnapshotToLearningDataset(equivalent);
    expect(mapped.status).toBe("mapped");
    const id = mapped.row?.identity.dataset_row_id;
    expect(mapSnapshotToLearningDataset(input({ confidence: 0.61, score: 61, payload_json: { ...payload(snapshot()), confidence: 61 } })).row?.identity.dataset_row_id).toBe(id);
    expect(mapSnapshotToLearningDataset(input({ type: "vwap_reclaim", payload_json: { ...payload(snapshot()), setup_family: "vwap_reclaim" } })).row?.identity.dataset_row_id).toBe(id);
    expect(mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[1])).row?.identity.dataset_row_id).toBe(id);
    expect(mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[0], { id: "outcome:changed" })).row?.identity.dataset_row_id).not.toBe(id);
    const thirtyMinute = input(
      { payload_json: { ...payload(snapshot()), outcome_horizon: "30m" } },
      getIntelligenceContextStaticFixtures()[0],
      { horizon: "30m" },
    );
    expect(mapSnapshotToLearningDataset(thirtyMinute).row?.identity.dataset_row_id).not.toBe(id);
  });

  test("deep immutability and repeated interleaved determinism remain intact", () => {
    const valid = deepFreeze(input({}, getIntelligenceContextStaticFixtures()[2]));
    const blocked = deepFreeze(unsafe({ ...input(), contextSnapshot: { ...input().contextSnapshot, anti_leakage_status: "failed" } }));
    const validBefore = JSON.stringify(valid);
    const blockedBefore = JSON.stringify(blocked);
    const sequence = [valid, blocked, valid, blocked].map((value) => mapSnapshotToLearningDataset(value));
    expect(JSON.stringify(valid)).toBe(validBefore);
    expect(JSON.stringify(blocked)).toBe(blockedBefore);
    expect(sequence[0]).toEqual(sequence[2]);
    expect(sequence[1]).toEqual(sequence[3]);
    expect(JSON.stringify(sequence[0])).toBe(JSON.stringify(mapSnapshotToLearningDataset(structuredClone(valid))));
  });

  test("issues remain RFC 6901 ordered deduplicated and redacted", () => {
    const base = input();
    const result = mapSnapshotToLearningDataset(unsafe({ ...base, outcome: { ...base.outcome, horizon: "30m" } }));
    expect(result.issues).toEqual([...result.issues].sort((a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code)));
    expect(new Set(result.issues.map((item) => `${item.code}:${item.path}`)).size).toBe(result.issues.length);
    for (const item of result.issues) {
      expect(item.path).toMatch(/^\/(?:[^~/]|~[01])*(?:\/(?:[^~/]|~[01])*)*$/);
      expect(Object.keys(item).sort()).toEqual(["code", "messageKey", "path", "severity"]);
      expect(JSON.stringify(item)).not.toContain("Action 392 static audit");
    }
  });

  test("no consumers inference repair runtime providers Supabase or persistence exist", () => {
    const consumers = files("app").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && readFileSync(path, "utf8").includes("snapshot-to-learning-dataset-mapper"));
    expect(consumers).toEqual([]);
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    for (const marker of ["process.env", "fetch(", "Date.now(", "Math.random(", "randomUUID(", "console.", "@supabase", "next/server", "writeFile", "localStorage"]) expect(source).not.toContain(marker);
  });

  test("Action 392 verifier passes while readiness remains blocked", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit-verify.mjs"], { encoding: "utf8" }));
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("blocked");
    expect(report.failed_conditions_count).toBe(3);
    expect(report.mapper_consumer_files).toEqual([]);
  });

  test("historical audit decisions and Action 391 health remain intact while runtime preview stays paused", () => {
    expect(JSON.parse(spawnSync("node", ["scripts/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit-verify.mjs"], { encoding: "utf8" }).stdout).readiness_decision).toBe("blocked");
    expect(JSON.parse(spawnSync("node", ["scripts/action-390-pure-mapper-contract-remediation-approval-gate-verify.mjs"], { encoding: "utf8" }).stdout).approval_decision).toBe("approved");
    expect(JSON.parse(execFileSync("node", ["scripts/action-391-pure-mapper-contract-remediation-verify.mjs"], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(readFileSync("docs/action-391-pure-mapper-contract-remediation.md", "utf8")).toContain("runtime_preview_waiting_for_operator_inputs");
  });
});
