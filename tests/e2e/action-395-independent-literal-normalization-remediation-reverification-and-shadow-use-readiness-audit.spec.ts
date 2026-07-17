import { createHash } from "crypto";
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
const hashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};

function snapshot(overrides: Partial<RecommendationSnapshot> = {}): RecommendationSnapshot {
  return {
    id: "snapshot:audit395:001", snapshot_fingerprint: "snapshot_fingerprint:audit395:001",
    recommendation_id: "recommendation:audit395:001", scan_run_id: "scan_run:audit395:001",
    ticker: "AAPL", company_name: "Apple", recommended_at: at, app_timestamp: at,
    window: "morning", status: "visible", source_mode: "static_audit", data_mode: "static_audit",
    market_session_phase: "morning", market_session_risk: null, market_session_source: null,
    is_visible: true, is_demo: false, is_mock: false, is_real: true,
    entry: 200, entry_low: 200, entry_high: 200, stop: 198, target: 204,
    side: "long", risk_per_share: 2, reward_per_share: 4, planned_risk_reward: 2,
    confidence: 0.78, score: 78, rating: "high", label: null, type: "momentum_continuation",
    rationale: "Action 395 static audit", reason: null, catalyst: null, primary_risk: null,
    market_data_snapshot: null, quote_price: 200, volume: 1000, liquidity: "high", spread: 0.02,
    freshness: "fresh", data_age_minutes: 1, intake_quality_json: null, scan_observability_json: null,
    empty_state_json: null, quality_json: null,
    payload_json: {
      candidate_id: "candidate:audit395:001", batch_fingerprint: "batch:audit395:001",
      trading_day: "2026-07-08", setup_family: "momentum_continuation", confidence_label: "high",
      tier: "valid", invalidation_logic: "close_below_198", sanitizer_passed: true,
      risk_geometry_valid: true, snapshot_completeness: "complete", enrichment_version: "audit395_v1",
      outcome_horizon: "60m", side: "buy", confidence: 78,
    },
    was_taken: false, linked_position_id: null, created_at: at, updated_at: at, ...overrides,
  };
}

function contextFor(source: RecommendationSnapshot, fixture = getIntelligenceContextStaticFixtures()[0]) {
  return {
    ...fixture,
    recommendation_linkage: { recommendation_snapshot_id: source.id, recommendation_id: source.recommendation_id, recommendation_created_at: at },
    context: { ...fixture.context, recommendation_snapshot_id: source.id, recommendation_id: source.recommendation_id, captured_at: "2026-07-08T13:44:30.000Z" },
  } as Action336IntelligenceContextStaticFixture;
}

function outcomeFor(source: RecommendationSnapshot, overrides: Partial<RecommendationOutcome> = {}): RecommendationOutcome {
  return {
    id: "outcome:audit395:001", snapshot_id: source.id, snapshot_fingerprint: source.snapshot_fingerprint,
    recommendation_id: source.recommendation_id, ticker: source.ticker, side: "long",
    recommended_at: at, evaluated_at: "2026-07-08T14:45:00.000Z", horizon: "60m", status: "target_hit",
    entry: 200, stop: 198, target: 204, entry_triggered: true, entry_triggered_at: "2026-07-08T13:50:00.000Z",
    target_hit: true, target_hit_at: "2026-07-08T14:20:00.000Z", stop_hit: false, stop_hit_at: null,
    first_terminal_event: "target_hit", best_price_after_recommendation: 204.2, worst_price_after_recommendation: 199.5,
    best_r: 2.1, worst_r: -0.25, eod_price: 204, eod_r: 2, current_price: 204, current_r: 2,
    max_favorable_excursion: 4.2, max_adverse_excursion: -0.5, time_to_entry_minutes: 5,
    time_to_target_minutes: 35, time_to_stop_minutes: null, source: "static_audit", provider: "static_audit",
    data_completeness: "complete", warnings: [], blockers: [], payload_json: { gross_r_multiple: 2 },
    created_at: "2026-07-08T14:45:00.000Z", updated_at: "2026-07-08T14:45:00.000Z", ...overrides,
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

function unsafe(value: unknown) { return value as SnapshotToLearningDatasetMapperInput; }
function payload(source: RecommendationSnapshot) { return source.payload_json as Record<string, unknown>; }
function sha(path: string) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}
function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? files(child) : [child];
  });
}
function expectBlocked(result: SnapshotToLearningDatasetMapperResult, status: SnapshotToLearningDatasetMapperResult["status"], code: string, path: string) {
  expect(result.status).toBe(status);
  expect(result.row).toBeNull();
  expect(result.consumable).toBe(false);
  expect(result.issues.some((item) => item.code === code && item.path === path)).toBe(true);
}

test.describe.serial("Action 395 independent literal remediation reverification", () => {
  test("mapper and fixture source hashes remain exact", () => {
    for (const [path, hash] of Object.entries(hashes)) expect(sha(path), path).toBe(hash);
  });

  test("original Action 392 context and freshness bypasses are closed without repair", () => {
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const contextResult = mapSnapshotToLearningDataset(unsafe({
      ...base, contextSnapshot: { ...context, context: { ...context.context, market: { ...context.context.market, market_regime: { state: " present ", value: "bullish" } } } },
    }));
    expectBlocked(contextResult, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/context/market/market_regime/state");
    const freshnessResult = mapSnapshotToLearningDataset(unsafe({
      ...base, contextSnapshot: { ...context, freshness: { state: " fresh ", age_minutes_at_recommendation: 1 } },
    }));
    expectBlocked(freshnessResult, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/freshness/state");
    expect(JSON.stringify([contextResult, freshnessResult])).not.toContain(" present ");
    expect(JSON.stringify([contextResult, freshnessResult])).not.toContain(" fresh ");
  });

  test("context whitespace case Unicode empty and synonym variants all block", () => {
    const variants = [
      " present", "present ", " present ", "\tpresent", "present\t", "\npresent", "present\n", "present\r",
      "\u00a0present", "present\u00a0", "\u202fpresent", "present\u202f", "\u2003present", "present\u2003",
      "PRESENT", "Present", "PrEsEnT", "pre  sent", "", "   ", "available", "known",
    ];
    for (const state of variants) {
      const base = input();
      const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, context: { ...context.context, market: { ...context.context.market, market_regime: { state, value: "bullish" } } } } }));
      expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/context/market/market_regime/state");
    }
  });

  test("all exact context states remain accepted", () => {
    const variants = [
      { state: "present", value: "bullish", completeness: "complete" },
      { state: "explicit_null", value: null, completeness: "complete" },
      { state: "unavailable", value: null, completeness: "partial" },
      { state: "unknown", value: "unknown", completeness: "complete" },
    ];
    for (const item of variants) {
      const base = input();
      const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, context: { ...context.context, market: { ...context.context.market, completeness: item.completeness, market_regime: item } } } }));
      expect(["mapped", "mapped_with_missing_optional_data"]).toContain(result.status);
    }
  });

  test("freshness whitespace case Unicode synonym and empty variants all block", () => {
    const variants = [
      " fresh", "fresh ", "\tfresh", "fresh\t", "\nfresh", "fresh\n", "fresh\r", "\u00a0fresh", "fresh\u202f", "\u2003fresh",
      "FRESH", "Fresh", "FrEsH", "", "   ", "current", "old", "missing", "available", "recent",
    ];
    for (const state of variants) {
      const base = input();
      const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, freshness: { state, age_minutes_at_recommendation: 1 } } }));
      expectBlocked(result, "blocked_invalid_provenance", "invalid_provenance", "/contextSnapshot/freshness/state");
    }
  });

  test("all exact freshness states retain contract behavior", () => {
    const byState = new Map(getIntelligenceContextStaticFixtures().map((fixture) => [fixture.freshness.state, fixture]));
    for (const state of ["fresh", "stale", "unknown", "unavailable"] as const) {
      const fixture = byState.get(state);
      expect(fixture, state).toBeDefined();
      expect(["mapped", "mapped_with_missing_optional_data"]).toContain(mapSnapshotToLearningDataset(input({}, fixture)).status);
    }
  });

  test("payload horizon case whitespace Unicode unit and type variants block_invalid_input", () => {
    const variants: unknown[] = [
      "15M", "30M", "60M", "15m ", " 30m", "\t60m", "60m\n", "\u00a015m", "30m\u202f", "\u200360m",
      "015m", "030m", "060m", "15 min", "30 min", "60 min", "1h", "PT15M", "PT30M", "PT60M",
      "15.0m", "0.25h", "", "   ", 15, 30, 60, ["60m"], { value: "60m" },
    ];
    for (const outcome_horizon of variants) {
      const result = mapSnapshotToLearningDataset(input({ payload_json: { ...payload(snapshot()), outcome_horizon } }));
      expectBlocked(result, "blocked_invalid_input", "invalid_input", "/recommendationSnapshot/payload_json/outcome_horizon");
    }
  });

  test("outcome horizon case whitespace Unicode unit and type variants block_invalid_outcome", () => {
    const variants: unknown[] = [
      "15M", "30M", "60M", "15m ", " 30m", "\t60m", "60m\n", "\u00a015m", "30m\u202f", "\u200360m",
      "015m", "030m", "060m", "15 min", "30 min", "60 min", "1h", "PT15M", "PT30M", "PT60M",
      "15.0m", "", "   ", 15, 30, 60, ["60m"], { value: "60m" },
    ];
    for (const horizon of variants) {
      const base = input({ payload_json: { ...payload(snapshot()), outcome_horizon: null } });
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, outcome: { ...base.outcome, horizon } }));
      expectBlocked(result, "blocked_invalid_outcome", "invalid_outcome", "/outcome/horizon");
    }
  });

  test("exact equivalent horizons pass valid conflicts block and pending remains supported", () => {
    for (const horizon of ["15m", "30m", "60m"] as const) {
      const result = mapSnapshotToLearningDataset(input({ payload_json: { ...payload(snapshot()), outcome_horizon: horizon } }, getIntelligenceContextStaticFixtures()[0], { horizon }));
      expect(result.status).toBe("mapped");
      expect(result.row?.outcome_fields.outcome_window).toBe(horizon);
    }
    const conflict = mapSnapshotToLearningDataset(input({ payload_json: { ...payload(snapshot()), outcome_horizon: "60m" } }, getIntelligenceContextStaticFixtures()[0], { horizon: "30m" }));
    expectBlocked(conflict, "blocked_invalid_linkage", "invalid_linkage", "/outcome/horizon");
    const pending = mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[0], null));
    expect(pending.status).toBe("mapped_with_missing_optional_data");
    expect(pending.row?.outcome_fields.outcome_window).toBe("60m");
  });

  test("hidden normalization is absent from contract fields while approved aliases remain", () => {
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    expect(source).toContain("const state = value.state");
    expect(source).toContain("const state = freshness.state");
    expect(source).toContain("supportedHorizons.has(payloadHorizon)");
    expect(source).not.toContain("text(value.state)");
    expect(source).not.toContain("text(freshness.state)");
    expect(source).not.toMatch(/outcome_horizon[^\n]*(?:trim|toLowerCase|toUpperCase|replace)/);
    expect(source).not.toMatch(/(?:toLocaleLowerCase|toLocaleUpperCase|canonicalizeHorizon|normalizeHorizon)/);
    const aliases = mapSnapshotToLearningDataset(input({ side: "BUY", confidence: "78", score: 0.78, payload_json: { ...payload(snapshot()), direction: "long", confidence: 78 } }));
    expect(aliases.status).toBe("mapped");
    expect(aliases.row?.trade_plan.direction).toBe("long");
    expect(aliases.row?.setup_and_confidence.numeric_confidence).toBe(0.78);
  });

  test("row identity retains identity-only NFC and percent encoding", () => {
    function id(fingerprint: string) {
      const source = snapshot({ snapshot_fingerprint: fingerprint });
      return mapSnapshotToLearningDataset({ recommendationSnapshot: source, contextSnapshot: contextFor(source), outcome: outcomeFor(source, { snapshot_fingerprint: fingerprint }) }).row?.identity.dataset_row_id;
    }
    expect(id("cafe\u0301|% /")).toBe(id("caf\u00e9|% /"));
    expect(id("cafe\u0301|% /")).toContain("caf%C3%A9%7C%25%20%2F");
  });

  test("status issue shape vocabulary paths ordering deduplication and redaction remain exact", () => {
    const result = mapSnapshotToLearningDataset(input({ payload_json: { ...payload(snapshot()), outcome_horizon: "60M" } }));
    expect(result.issues).toEqual([...result.issues].sort((a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code)));
    expect(new Set(result.issues.map((item) => `${item.code}:${item.path}`)).size).toBe(result.issues.length);
    for (const item of result.issues) {
      expect(Object.keys(item).sort()).toEqual(["code", "messageKey", "path", "severity"]);
      expect(item.path).toMatch(/^\/(?:[^~/]|~[01])*(?:\/(?:[^~/]|~[01])*)*$/);
      expect(JSON.stringify(item)).not.toContain("60M");
    }
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    for (const status of ["mapped", "mapped_with_missing_optional_data", "blocked_missing_required_identity", "blocked_invalid_linkage", "blocked_conflicting_aliases", "blocked_temporal_violation", "blocked_future_leakage", "blocked_invalid_provenance", "blocked_invalid_outcome", "blocked_invalid_input"]) expect(source).toContain(status);
    for (const code of ["missing_required_identity", "invalid_linkage", "conflicting_aliases", "invalid_timestamp", "temporal_violation", "future_leakage", "invalid_provenance", "invalid_outcome", "invalid_input", "missing_optional_context", "missing_optional_outcome", "unknown_setup", "unavailable_source", "partial_provenance"]) expect(source).toContain(code);
  });

  test("validation precedence remains deterministic across multi-fault inputs", () => {
    expect(mapSnapshotToLearningDataset(unsafe(null)).status).toBe("blocked_invalid_input");
    expect(mapSnapshotToLearningDataset(input({ id: "", payload_json: { ...payload(snapshot()), outcome_horizon: "60M" } })).status).toBe("blocked_missing_required_identity");
    const linkage = input();
    const linkageContext = linkage.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expect(mapSnapshotToLearningDataset(unsafe({ ...linkage, outcome: { ...linkage.outcome, snapshot_id: "other" }, contextSnapshot: { ...linkageContext, freshness: { state: " fresh ", age_minutes_at_recommendation: 1 } } })).status).toBe("blocked_invalid_linkage");
    const alias = input({ payload_json: { ...payload(snapshot()), side: "sell" } });
    const aliasContext = alias.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expect(mapSnapshotToLearningDataset(unsafe({ ...alias, contextSnapshot: { ...aliasContext, freshness: { state: " fresh ", age_minutes_at_recommendation: 1 } } })).status).toBe("blocked_conflicting_aliases");
    const temporal = input();
    const temporalContext = temporal.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expect(mapSnapshotToLearningDataset(unsafe({ ...temporal, contextSnapshot: { ...temporalContext, effective_at: "2026-07-08T13:46:00.000Z", freshness: { state: " fresh ", age_minutes_at_recommendation: 1 } } })).status).toBe("blocked_temporal_violation");
    const leakage = input();
    const leakageContext = leakage.contextSnapshot as Action336IntelligenceContextStaticFixture;
    expect(mapSnapshotToLearningDataset(unsafe({ ...leakage, contextSnapshot: { ...leakageContext, anti_leakage_status: "failed", freshness: { state: " fresh ", age_minutes_at_recommendation: 1 } }, outcome: { ...leakage.outcome, status: "magic" } })).status).toBe("blocked_future_leakage");
  });

  test("all valid contexts missing-data incomplete outcome and anti-leakage regress cleanly", () => {
    for (const fixture of getIntelligenceContextStaticFixtures()) expect(["mapped", "mapped_with_missing_optional_data"]).toContain(mapSnapshotToLearningDataset(input({}, fixture)).status);
    expect(mapSnapshotToLearningDataset(input({}, null, null)).status).toBe("mapped_with_missing_optional_data");
    expect(mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[0], { status: "incomplete", data_completeness: "partial", target_hit: false, target_hit_at: null })).status).toBe("mapped_with_missing_optional_data");
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    for (const anti_leakage_status of ["failed", "unknown"]) {
      const result = mapSnapshotToLearningDataset(unsafe({ ...base, contextSnapshot: { ...context, anti_leakage_status } }));
      expect(result.status).toBe("blocked_future_leakage");
    }
  });

  test("deep immutability and repeated interleaved determinism remain exact", () => {
    const valid = deepFreeze(input());
    const invalid = deepFreeze(input({ payload_json: { ...payload(snapshot()), outcome_horizon: " 60m " } }));
    const before = [JSON.stringify(valid), JSON.stringify(invalid)];
    const sequence = [valid, invalid, valid, invalid].map((item) => mapSnapshotToLearningDataset(item));
    expect(JSON.stringify(valid)).toBe(before[0]);
    expect(JSON.stringify(invalid)).toBe(before[1]);
    expect(sequence[0]).toEqual(sequence[2]);
    expect(sequence[1]).toEqual(sequence[3]);
    expect(JSON.stringify(sequence[0])).toBe(JSON.stringify(mapSnapshotToLearningDataset(structuredClone(valid))));
    expect(JSON.stringify(sequence[1])).toBe(JSON.stringify(mapSnapshotToLearningDataset(structuredClone(invalid))));
  });

  test("mapper remains consumer runtime provider Supabase persistence and repair free", () => {
    const consumers = files("app").filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && readFileSync(path, "utf8").includes("snapshot-to-learning-dataset-mapper"));
    expect(consumers).toEqual([]);
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    for (const marker of ["process.env", "fetch(", "Date.now(", "Math.random(", "console.", "@supabase", "next/server", "writeFile", "localStorage"]) expect(source).not.toContain(marker);
  });

  test("Actions 392 through 395 verifiers remain healthy and runtime preview remains paused", () => {
    for (const path of [
      "scripts/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit-verify.mjs",
      "scripts/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate-verify.mjs",
      "scripts/action-394-pure-mapper-literal-normalization-remediation-verify.mjs",
      "scripts/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit-verify.mjs",
    ]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(readFileSync("docs/action-395-independent-literal-normalization-remediation-reverification-and-shadow-use-readiness-audit.md", "utf8")).toContain("runtime_preview_waiting_for_operator_inputs");
  });
});
