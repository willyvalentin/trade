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

const recommendedAt = "2026-07-08T13:45:00.000Z";
const evaluatedAt = "2026-07-08T14:45:00.000Z";

function snapshot(overrides: Partial<RecommendationSnapshot> = {}): RecommendationSnapshot {
  return {
    id: "snapshot:remediation:001",
    snapshot_fingerprint: "snapshot_fingerprint:remediation:001",
    recommendation_id: "recommendation:remediation:001",
    scan_run_id: "scan_run:remediation:001",
    ticker: "AAPL",
    company_name: "Apple",
    recommended_at: recommendedAt,
    app_timestamp: recommendedAt,
    window: "morning",
    status: "visible",
    source_mode: "static_remediation",
    data_mode: "static_remediation",
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
    rationale: "static Action 391 input",
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
      candidate_id: "candidate:remediation:001",
      batch_fingerprint: "batch:remediation:001",
      trading_day: "2026-07-08",
      setup_family: "momentum_continuation",
      confidence_label: "high",
      tier: "valid",
      invalidation_logic: "close_below_198",
      sanitizer_passed: true,
      risk_geometry_valid: true,
      snapshot_completeness: "complete",
      enrichment_version: "static_remediation_v1",
      outcome_horizon: "60m",
      side: "buy",
      confidence: 78,
    },
    was_taken: false,
    linked_position_id: null,
    created_at: recommendedAt,
    updated_at: recommendedAt,
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
      recommendation_created_at: recommendedAt,
    },
    context: {
      ...fixture.context,
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      captured_at: "2026-07-08T13:44:30.000Z",
    },
  };
}

function outcomeFor(
  source: RecommendationSnapshot,
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  return {
    id: "outcome:remediation:001",
    snapshot_id: source.id,
    snapshot_fingerprint: source.snapshot_fingerprint,
    recommendation_id: source.recommendation_id,
    ticker: source.ticker,
    side: "long",
    recommended_at: recommendedAt,
    evaluated_at: evaluatedAt,
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
    source: "static_remediation",
    provider: "static_remediation",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: { gross_r_multiple: 2 },
    created_at: evaluatedAt,
    updated_at: evaluatedAt,
    ...overrides,
  };
}

function validInput(
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

function malformed(value: unknown): SnapshotToLearningDatasetMapperInput {
  return value as SnapshotToLearningDatasetMapperInput;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function payload(source: RecommendationSnapshot) {
  return source.payload_json as Record<string, unknown>;
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

test.describe.serial("Action 391 pure mapper contract remediation", () => {
  test("all authoritative Action 381 category fixtures remain accepted", () => {
    for (const fixture of getIntelligenceContextStaticFixtures()) {
      const result = mapSnapshotToLearningDataset(validInput({}, fixture));
      expect(["mapped", "mapped_with_missing_optional_data"], fixture.fixture_id).toContain(result.status);
      expect(result.row, fixture.fixture_id).not.toBeNull();
    }
  });

  test("unsupported context categories block without unknown fallback", () => {
    const base = validInput();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const result = mapSnapshotToLearningDataset(malformed({
      ...base,
      contextSnapshot: {
        ...context,
        context: {
          ...context.context,
          market: {
            ...context.context.market,
            market_regime: { state: "present", value: "magical" },
          },
        },
      },
    }));
    expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/context/market/market_regime/value");
  });

  test("fresh stale unknown and unavailable states remain valid", () => {
    const fixtures = getIntelligenceContextStaticFixtures();
    for (const fixture of [fixtures[0], fixtures[12], fixtures[3], fixtures[8]]) {
      const result = mapSnapshotToLearningDataset(validInput({}, fixture));
      expect(["mapped", "mapped_with_missing_optional_data"], fixture.freshness.state).toContain(result.status);
    }
  });

  test("invalid freshness and stale fresh contradictions block", () => {
    const base = validInput();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const invalidState = mapSnapshotToLearningDataset(malformed({
      ...base,
      contextSnapshot: { ...context, freshness: { state: "instantaneous", age_minutes_at_recommendation: 1, rationale: "invalid" } },
    }));
    expectBlocked(invalidState, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/freshness/state");

    const staleFixture = contextFor(base.recommendationSnapshot, getIntelligenceContextStaticFixtures()[12]);
    const contradiction = mapSnapshotToLearningDataset(malformed({
      ...base,
      contextSnapshot: { ...staleFixture, freshness: { ...staleFixture.freshness, fresh: true } },
    }));
    expectBlocked(contradiction, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/freshness/fresh");
  });

  test("consistent fresh and stale declarations remain representable", () => {
    const fixtures = getIntelligenceContextStaticFixtures();
    expect(mapSnapshotToLearningDataset(validInput({}, fixtures[0])).status).toBe("mapped");
    const stale = mapSnapshotToLearningDataset(validInput({}, fixtures[12]));
    expect(stale.status).toBe("mapped_with_missing_optional_data");
    expect(stale.row?.data_provenance.state).toBe("partial");
  });

  test("finite context metrics pass and non-finite or numeric strings block", () => {
    expect(mapSnapshotToLearningDataset(validInput()).status).toBe("mapped");
    const base = validInput();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, "0.5"]) {
      const result = mapSnapshotToLearningDataset(malformed({
        ...base,
        contextSnapshot: {
          ...context,
          context: {
            ...context.context,
            relative_strength: {
              ...context.context.relative_strength,
              stock_vs_spy: { state: "present", value },
            },
          },
        },
      }));
      expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/context/relative_strength/stock_vs_spy/value");
    }
  });

  test("all supported windows pass and unsupported windows block without inference", () => {
    for (const window of ["morning", "midday", "power_hour", "unknown"] as const) {
      expect(mapSnapshotToLearningDataset(validInput({ window })).status).toBe("mapped");
    }
    const base = validInput();
    const result = mapSnapshotToLearningDataset(malformed({
      ...base,
      recommendationSnapshot: { ...base.recommendationSnapshot, window: "overnight_magic" },
    }));
    expectBlocked(result, "blocked_invalid_input", "invalid_input", "/recommendationSnapshot/window");
  });

  test("equivalent horizons pass and populated disagreements block linkage", () => {
    expect(mapSnapshotToLearningDataset(validInput()).status).toBe("mapped");
    const base = validInput();
    const mismatch = mapSnapshotToLearningDataset(malformed({
      ...base,
      outcome: { ...base.outcome, horizon: "30m" },
    }));
    expectBlocked(mismatch, "blocked_invalid_linkage", "invalid_linkage", "/outcome/horizon");
    expect(mismatch.issues.some((item) => item.path === "/recommendationSnapshot/payload_json/outcome_horizon")).toBe(true);
  });

  test("pending outcome retains existing payload horizon requirement", () => {
    const pending = mapSnapshotToLearningDataset(validInput({}, getIntelligenceContextStaticFixtures()[0], null));
    expect(pending.status).toBe("mapped_with_missing_optional_data");
    expect(pending.row?.outcome_fields.outcome_window).toBe("60m");

    const source = snapshot();
    const { outcome_horizon: _removed, ...withoutHorizon } = payload(source);
    const missing = mapSnapshotToLearningDataset(validInput({ payload_json: withoutHorizon }, getIntelligenceContextStaticFixtures()[0], null));
    expectBlocked(missing, "blocked_invalid_input", "invalid_input", "/recommendationSnapshot/payload_json/outcome_horizon");
  });

  test("passed anti-leakage evidence and excluded future facts remain accepted", () => {
    const passed = mapSnapshotToLearningDataset(validInput());
    expect(passed.status).toBe("mapped");
    expect(passed.row?.anti_leakage_status).toBe("passed");
    const excluded = mapSnapshotToLearningDataset(validInput({}, getIntelligenceContextStaticFixtures()[11]));
    expect(excluded.status).toBe("mapped");
    expect(excluded.row?.anti_leakage_status).toBe("passed");
  });

  test("failed unknown and missing anti-leakage evidence never upgrade", () => {
    const base = validInput();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const { anti_leakage_status: _removed, ...missingMarker } = context;
    for (const contextSnapshot of [
      { ...context, anti_leakage_status: "failed" },
      { ...context, anti_leakage_status: "unknown" },
      missingMarker,
    ]) {
      const result = mapSnapshotToLearningDataset(malformed({ ...base, contextSnapshot }));
      expectBlocked(result, "blocked_future_leakage", "future_leakage", "/contextSnapshot/anti_leakage_status");
    }
  });

  test("multi-fault precedence remains frozen", () => {
    const base = validInput();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const invalidContext = {
      ...context,
      freshness: { state: "instantaneous", age_minutes_at_recommendation: 1, rationale: "invalid" },
    };
    const linkage = mapSnapshotToLearningDataset(malformed({ ...base, contextSnapshot: invalidContext, outcome: { ...base.outcome, snapshot_id: "other" } }));
    expect(linkage.status).toBe("blocked_invalid_linkage");

    const alias = mapSnapshotToLearningDataset(malformed({
      ...base,
      recommendationSnapshot: { ...base.recommendationSnapshot, payload_json: { ...payload(base.recommendationSnapshot), side: "sell" } },
      contextSnapshot: invalidContext,
    }));
    expect(alias.status).toBe("blocked_conflicting_aliases");

    const temporal = mapSnapshotToLearningDataset(malformed({
      ...base,
      contextSnapshot: { ...invalidContext, effective_at: "2026-07-08T13:46:00.000Z" },
    }));
    expect(temporal.status).toBe("blocked_temporal_violation");

    const leakage = mapSnapshotToLearningDataset(malformed({
      ...base,
      contextSnapshot: { ...invalidContext, anti_leakage_status: "failed" },
      outcome: { ...base.outcome, status: "magic" },
    }));
    expect(leakage.status).toBe("blocked_future_leakage");

    const provenance = mapSnapshotToLearningDataset(malformed({
      ...base,
      contextSnapshot: invalidContext,
      outcome: { ...base.outcome, status: "magic" },
    }));
    expect(provenance.status).toBe("blocked_invalid_provenance");
  });

  test("issue shape ordering and deduplication remain deterministic", () => {
    const base = validInput();
    const result = mapSnapshotToLearningDataset(malformed({
      ...base,
      outcome: { ...base.outcome, horizon: "30m" },
    }));
    expect(result.issues).toEqual([...result.issues].sort((a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code)));
    expect(new Set(result.issues.map((item) => `${item.code}:${item.path}`)).size).toBe(result.issues.length);
    for (const item of result.issues) {
      expect(Object.keys(item).sort()).toEqual(["code", "messageKey", "path", "severity"]);
      expect(item.path).toMatch(/^\//);
      expect(item.messageKey).toBe(`mapper.issue.${item.code}`);
    }
  });

  test("deep immutability keeps inputs byte-identical and repeated calls preserve stable serialization", () => {
    const valid = deepFreeze(validInput({}, getIntelligenceContextStaticFixtures()[2]));
    const invalid = deepFreeze(malformed({
      ...validInput(),
      contextSnapshot: { ...validInput().contextSnapshot, anti_leakage_status: "failed" },
    }));
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
    expect(JSON.stringify(validResults[0])).toBe(JSON.stringify(mapSnapshotToLearningDataset(clone(valid))));
  });

  test("status vocabulary and public mapper API remain unchanged", () => {
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    for (const status of [
      "mapped", "mapped_with_missing_optional_data", "blocked_missing_required_identity",
      "blocked_invalid_linkage", "blocked_conflicting_aliases", "blocked_temporal_violation",
      "blocked_future_leakage", "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input",
    ]) expect(source).toContain(status);
    expect(source.match(/export function mapSnapshotToLearningDataset\s*\(/g)).toHaveLength(1);
    expect(source.match(/export function /g)).toHaveLength(1);
  });

  test("fixtures consumers runtime providers Supabase and persistence remain untouched", () => {
    const consumers = files("app")
      .filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path))
      .filter((path) => readFileSync(path, "utf8").includes("snapshot-to-learning-dataset-mapper"));
    expect(consumers).toEqual([]);
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    for (const marker of ["process.env", "fetch(", "@supabase", "next/server", "writeFile", "Date.now(", "Math.random(", "console."]) {
      expect(source).not.toContain(marker);
    }
  });

  test("Action 391 verifier remains healthy and historical gates retain their decisions", () => {
    for (const path of [
      "scripts/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate-verify.mjs",
      "scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs",
      "scripts/action-391-pure-mapper-contract-remediation-verify.mjs",
    ]) {
      expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    }
    const audit389 = JSON.parse(spawnSync("node", ["scripts/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit-verify.mjs"], { encoding: "utf8" }).stdout);
    expect(audit389.readiness_decision).toBe("blocked");
    const gate390 = JSON.parse(spawnSync("node", ["scripts/action-390-pure-mapper-contract-remediation-approval-gate-verify.mjs"], { encoding: "utf8" }).stdout);
    expect(gate390.approval_decision).toBe("approved");
  });
});
