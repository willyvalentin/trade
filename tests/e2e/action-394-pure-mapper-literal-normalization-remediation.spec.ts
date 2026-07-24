import { execFileSync } from "child_process";
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

function snapshot(overrides: Partial<RecommendationSnapshot> = {}): RecommendationSnapshot {
  return {
    id: "snapshot:literal:001",
    snapshot_fingerprint: "snapshot_fingerprint:literal:001",
    recommendation_id: "recommendation:literal:001",
    scan_run_id: "scan_run:literal:001",
    ticker: "AAPL",
    company_name: "Apple",
    recommended_at: at,
    app_timestamp: at,
    window: "morning",
    status: "visible",
    source_mode: "static_literal_test",
    data_mode: "static_literal_test",
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
    rationale: "Action 394 static input",
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
      candidate_id: "candidate:literal:001",
      batch_fingerprint: "batch:literal:001",
      trading_day: "2026-07-08",
      setup_family: "momentum_continuation",
      confidence_label: "high",
      tier: "valid",
      invalidation_logic: "close_below_198",
      sanitizer_passed: true,
      risk_geometry_valid: true,
      snapshot_completeness: "complete",
      enrichment_version: "static_literal_v1",
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
    id: "outcome:literal:001",
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
    source: "static_literal_test",
    provider: "static_literal_test",
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

function payload(source: RecommendationSnapshot) {
  return source.payload_json as Record<string, unknown>;
}

function unsafe(value: unknown): SnapshotToLearningDatasetMapperInput {
  return value as SnapshotToLearningDatasetMapperInput;
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

function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? files(child) : [child];
  });
}

test.describe.serial("Action 394 exact literal remediation", () => {
  test("all exact valid context states remain accepted", () => {
    const states = [
      { state: "present", value: "bullish", completeness: "complete" },
      { state: "explicit_null", value: null, completeness: "complete" },
      { state: "unavailable", value: null, completeness: "partial" },
      { state: "unknown", value: "unknown", completeness: "complete" },
    ];
    for (const item of states) {
      const base = input();
      const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
      const result = mapSnapshotToLearningDataset(unsafe({
        ...base,
        contextSnapshot: {
          ...context,
          context: { ...context.context, market: { ...context.context.market, completeness: item.completeness, market_regime: { state: item.state, value: item.value } } },
        },
      }));
      expect(["mapped", "mapped_with_missing_optional_data"]).toContain(result.status);
    }
  });

  test("context whitespace Unicode case empty and synonym variants block exactly", () => {
    const variants = [
      " present ", "Present", "PRESENT", "PrEsEnT", "present ", " present", "\tpresent",
      "present\n", "present\r", "\u00a0present", "present\u00a0", "pre  sent", "", "   ", "available",
    ];
    for (const state of variants) {
      const base = input();
      const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
      const result = mapSnapshotToLearningDataset(unsafe({
        ...base,
        contextSnapshot: { ...context, context: { ...context.context, market: { ...context.context.market, market_regime: { state, value: "bullish" } } } },
      }));
      expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/context/market/market_regime/state");
    }
  });

  test("all exact freshness literals retain authoritative behavior", () => {
    const fixtures = getIntelligenceContextStaticFixtures();
    for (const fixture of [fixtures[0], fixtures[12], fixtures[3], fixtures[8]]) {
      expect(["mapped", "mapped_with_missing_optional_data"]).toContain(mapSnapshotToLearningDataset(input({}, fixture)).status);
    }
  });

  test("freshness whitespace case synonym empty and Unicode variants block exactly", () => {
    const variants = [
      " fresh ", "Fresh", "FRESH", "FrEsH", "stale ", " unknown", "\tfresh", "fresh\n",
      "\u00a0fresh", "fresh\u00a0", "", "   ", "current", "old", "missing",
    ];
    for (const state of variants) {
      const base = input();
      const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
      const result = mapSnapshotToLearningDataset(unsafe({
        ...base,
        contextSnapshot: { ...context, freshness: { state, age_minutes_at_recommendation: 1, rationale: "invalid literal" } },
      }));
      expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/freshness/state");
    }
  });

  test("15m 30m and 60m exact equivalent horizons pass", () => {
    for (const horizon of ["15m", "30m", "60m"] as const) {
      const result = mapSnapshotToLearningDataset(input(
        { payload_json: { ...payload(snapshot()), outcome_horizon: horizon } },
        getIntelligenceContextStaticFixtures()[0],
        { horizon },
      ));
      expect(result.status).toBe("mapped");
      expect(result.row?.outcome_fields.outcome_window).toBe(horizon);
    }
  });

  test("invalid payload horizon variants return blocked_invalid_input", () => {
    const variants: unknown[] = [
      "60M", "60m ", " 60m", " 60m ", "\t60m", "60m\n", "\u00a060m", "060m",
      "60 min", "1h", "PT1H", "", "   ", 60,
    ];
    for (const outcome_horizon of variants) {
      const result = mapSnapshotToLearningDataset(input({ payload_json: { ...payload(snapshot()), outcome_horizon } }));
      expectBlocked(result, "blocked_invalid_input", "invalid_input", "/recommendationSnapshot/payload_json/outcome_horizon");
    }
  });

  test("invalid outcome horizon variants return blocked_invalid_outcome", () => {
    const variants: unknown[] = [
      "60M", "60m ", " 60m", "\t60m", "60m\n", "060m", "60 min", "1h", "PT1H", "", 60,
    ];
    for (const horizon of variants) {
      const base = input({ payload_json: { ...payload(snapshot()), outcome_horizon: null } });
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, outcome: { ...base.outcome, horizon } }));
      expectBlocked(result, "blocked_invalid_outcome", "invalid_outcome", "/outcome/horizon");
    }
  });

  test("two valid conflicting horizons remain blocked_invalid_linkage", () => {
    const result = mapSnapshotToLearningDataset(input(
      { payload_json: { ...payload(snapshot()), outcome_horizon: "60m" } },
      getIntelligenceContextStaticFixtures()[0],
      { horizon: "30m" },
    ));
    expectBlocked(result, "blocked_invalid_linkage", "invalid_linkage", "/outcome/horizon");
    expect(result.issues.some((item) => item.path === "/recommendationSnapshot/payload_json/outcome_horizon")).toBe(true);
  });

  test("pending outcome keeps exact payload horizon behavior", () => {
    const pending = mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[0], null));
    expect(pending.status).toBe("mapped_with_missing_optional_data");
    expect(pending.row?.outcome_fields.outcome_window).toBe("60m");
  });

  test("approved side confidence timestamp and setup behavior remains intact", () => {
    const result = mapSnapshotToLearningDataset(input({
      side: "BUY",
      confidence: "78",
      score: 0.78,
      recommended_at: "2026-07-08T15:45:00+02:00",
      type: "MOMENTUM_CONTINUATION",
      payload_json: {
        ...payload(snapshot()),
        direction: "long",
        setup_family: "momentum_continuation",
        confidence: 78,
      },
    }));
    expect(result.status).toBe("mapped");
    expect(result.row?.trade_plan.direction).toBe("long");
    expect(result.row?.setup_and_confidence.numeric_confidence).toBe(0.78);
    expect(result.row?.setup_and_confidence.setup_family).toBe("momentum_continuation");
    expect(result.row?.snapshot_time_inputs.recommendation_created_at).toBe(at);
  });

  test("row identity retains NFC and percent encoding", () => {
    const composed = "cafe\u0301|% /";
    const canonical = "caf\u00e9|% /";
    function mappedId(fingerprint: string) {
      const source = snapshot({ snapshot_fingerprint: fingerprint });
      return mapSnapshotToLearningDataset({
        recommendationSnapshot: source,
        contextSnapshot: contextFor(source),
        outcome: outcomeFor(source, { snapshot_fingerprint: fingerprint }),
      }).row?.identity.dataset_row_id;
    }
    expect(mappedId(composed)).toBe(mappedId(canonical));
    expect(mappedId(composed)).toContain("caf%C3%A9%7C%25%20%2F");
  });

  test("multi-fault precedence remains deterministic", () => {
    const identityFirst = input({ id: "", payload_json: { ...payload(snapshot()), outcome_horizon: "60M" } });
    expect(mapSnapshotToLearningDataset(identityFirst).status).toBe("blocked_missing_required_identity");

    const invalidPayload = input({ payload_json: { ...payload(snapshot()), outcome_horizon: "60M", side: "sell" } });
    expect(mapSnapshotToLearningDataset(invalidPayload).status).toBe("blocked_invalid_input");

    const aliasBase = input({ payload_json: { ...payload(snapshot()), side: "sell" } });
    const aliasContext = aliasBase.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expect(mapSnapshotToLearningDataset(unsafe({ ...aliasBase, contextSnapshot: { ...aliasContext, freshness: { state: " fresh ", age_minutes_at_recommendation: 1 } } })).status).toBe("blocked_conflicting_aliases");

    const temporalBase = input();
    const temporalContext = temporalBase.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expect(mapSnapshotToLearningDataset(unsafe({ ...temporalBase, contextSnapshot: { ...temporalContext, effective_at: "2026-07-08T13:46:00.000Z", freshness: { state: " fresh ", age_minutes_at_recommendation: 1 } } })).status).toBe("blocked_temporal_violation");

    const leakageBase = input();
    const leakageContext = leakageBase.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expect(mapSnapshotToLearningDataset(unsafe({ ...leakageBase, contextSnapshot: { ...leakageContext, anti_leakage_status: "failed", freshness: { state: " fresh ", age_minutes_at_recommendation: 1 } } })).status).toBe("blocked_future_leakage");
  });

  test("issue vocabulary shape ordering deduplication and redaction remain unchanged", () => {
    const result = mapSnapshotToLearningDataset(input({ payload_json: { ...payload(snapshot()), outcome_horizon: "60M" } }));
    expect(result.issues).toEqual([...result.issues].sort((a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code)));
    expect(new Set(result.issues.map((item) => `${item.code}:${item.path}`)).size).toBe(result.issues.length);
    for (const item of result.issues) {
      expect(Object.keys(item).sort()).toEqual(["code", "messageKey", "path", "severity"]);
      expect(item.path).toMatch(/^\//);
      expect(JSON.stringify(item)).not.toContain("60M");
    }
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    for (const status of ["mapped", "mapped_with_missing_optional_data", "blocked_missing_required_identity", "blocked_invalid_linkage", "blocked_conflicting_aliases", "blocked_temporal_violation", "blocked_future_leakage", "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input"]) expect(source).toContain(status);
  });

  test("deep-frozen inputs remain byte-identical and outputs deterministic", () => {
    const valid = deepFreeze(input());
    const invalid = deepFreeze(input({ payload_json: { ...payload(snapshot()), outcome_horizon: " 60m " } }));
    const validBefore = JSON.stringify(valid);
    const invalidBefore = JSON.stringify(invalid);
    const validResults = [0, 1, 2].map(() => mapSnapshotToLearningDataset(valid));
    const invalidResults = [0, 1, 2].map(() => mapSnapshotToLearningDataset(invalid));
    expect(JSON.stringify(valid)).toBe(validBefore);
    expect(JSON.stringify(invalid)).toBe(invalidBefore);
    expect(validResults[0]).toEqual(validResults[1]);
    expect(validResults[1]).toEqual(validResults[2]);
    expect(invalidResults[0]).toEqual(invalidResults[1]);
    expect(invalidResults[1]).toEqual(invalidResults[2]);
  });

  test("all 15 Action 381 contexts and null context remain accepted", () => {
    for (const fixture of getIntelligenceContextStaticFixtures()) {
      expect(["mapped", "mapped_with_missing_optional_data"]).toContain(mapSnapshotToLearningDataset(input({}, fixture)).status);
    }
    expect(mapSnapshotToLearningDataset(input({}, null, null)).status).toBe("mapped_with_missing_optional_data");
  });

  test("fixtures consumers runtime providers Supabase and persistence remain untouched", () => {
    const consumers = files("app").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && readFileSync(path, "utf8").includes("snapshot-to-learning-dataset-mapper"));
    expect(consumers).toEqual([]);
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    for (const marker of ["process.env", "fetch(", "Date.now(", "Math.random(", "console.", "@supabase", "next/server", "writeFile"]) expect(source).not.toContain(marker);
  });

  test("Action 394 verifier and Actions 391 through 393 remain healthy", () => {
    for (const path of [
      "scripts/action-391-pure-mapper-contract-remediation-verify.mjs",
      "scripts/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit-verify.mjs",
      "scripts/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate-verify.mjs",
      "scripts/action-394-pure-mapper-literal-normalization-remediation-verify.mjs",
    ]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
  });
});
