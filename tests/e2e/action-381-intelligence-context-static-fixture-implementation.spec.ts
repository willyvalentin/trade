import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  ACTION_336_INTELLIGENCE_CONTEXT_CONTRACT_REFERENCE,
  ACTION_342_INTELLIGENCE_CONTEXT_FIXTURE_SPEC_REFERENCE,
  ACTION_380_LEARNING_DATASET_CONTEXT_TYPE_REFERENCE,
  INTELLIGENCE_CONTEXT_STATIC_FIXTURE_VERSION,
  getIntelligenceContextStaticFixtureById,
  getIntelligenceContextStaticFixtures,
  getIntelligenceContextStaticFixturesByFamily,
  getMalformedIntelligenceContextStaticFixtureCases,
  serializeIntelligenceContextStaticFixtures,
  validateIntelligenceContextStaticFixtureSet,
} from "../../lib/intelligence-context-static-fixtures";

const modulePath = join(process.cwd(), "lib/intelligence-context-static-fixtures.ts");
const docPath = join(process.cwd(), "docs/action-381-intelligence-context-static-fixture-implementation.md");
const verifierPath = join(process.cwd(), "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs");

function runVerifier(path: string) {
  return execFileSync("node", [path], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "provider-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      NEWS_API_KEY: "news-secret-that-must-not-appear",
    },
  });
}

test("Action 381 module documentation and verifier exist", () => {
  expect(existsSync(modulePath)).toBe(true);
  expect(existsSync(docPath)).toBe(true);
  expect(existsSync(verifierPath)).toBe(true);

  const doc = readFileSync(docPath, "utf8");
  expect(doc).toContain("implementation_status: intelligence_context_static_fixtures_implemented");
  expect(doc).toContain("live_collection_status: blocked");
  expect(doc).toContain("mapper_implementation_status: blocked");
  expect(doc).toContain("runtime_preview_status: runtime_preview_waiting_for_operator_inputs");
});

test("authoritative Action 336 and Action 380 context types are reused", () => {
  expect(ACTION_336_INTELLIGENCE_CONTEXT_CONTRACT_REFERENCE).toBe(
    "docs/action-336-intelligence-context-schema-draft.md",
  );
  expect(ACTION_342_INTELLIGENCE_CONTEXT_FIXTURE_SPEC_REFERENCE).toBe(
    "docs/action-342-intelligence-context-static-fixture-spec.md",
  );
  expect(ACTION_380_LEARNING_DATASET_CONTEXT_TYPE_REFERENCE).toBe(
    "lib/learning-dataset-static-fixtures.ts",
  );
  expect(INTELLIGENCE_CONTEXT_STATIC_FIXTURE_VERSION).toBe(
    "intelligence_context_static_fixture_v1",
  );

  const source = readFileSync(modulePath, "utf8");
  expect(source).toContain("LearningDatasetContext");
  expect(source).toContain("LearningDatasetContextValue");
  expect(source).toContain("LearningDatasetProvenance");
  expect(source).not.toMatch(/type\s+MarketRegimeContext\b/);
  expect(source).not.toMatch(/type\s+SectorIndustryContext\b/);
  expect(source).not.toMatch(/interface\s+IntelligenceContext/);
});

test("fixture identities timestamps order and serialization are deterministic", () => {
  const first = getIntelligenceContextStaticFixtures();
  const second = getIntelligenceContextStaticFixtures();
  const ids = first.map((fixture) => fixture.fixture_id);

  expect(first).toHaveLength(15);
  expect(new Set(ids).size).toBe(ids.length);
  expect([...ids].sort()).toEqual(ids);
  expect(first).toEqual(second);
  expect(first).not.toBe(second);
  expect(first[0]).not.toBe(second[0]);
  expect(serializeIntelligenceContextStaticFixtures()).toBe(
    serializeIntelligenceContextStaticFixtures(),
  );

  for (const fixture of first) {
    expect(fixture.recommendation_linkage.recommendation_created_at).toBe(
      "2026-07-08T13:45:00.000Z",
    );
    expect(fixture.context.captured_at).toBe("2026-07-08T13:44:30.000Z");
    expect(Date.parse(fixture.effective_at)).toBeLessThanOrEqual(
      Date.parse(fixture.recommendation_linkage.recommendation_created_at),
    );
  }
});

test("market regime volatility and index alignment families are represented", () => {
  for (const family of [
    "bullish_market_regime",
    "bearish_market_regime",
    "neutral_or_mixed_regime",
    "trend_day",
    "chop_day",
    "elevated_volatility",
    "low_volatility",
    "incomplete_market_regime",
    "spy_aligned",
    "spy_diverging",
    "qqq_aligned",
    "qqq_diverging",
    "iwm_aligned",
    "iwm_diverging",
    "missing_index_context",
  ]) {
    expect(getIntelligenceContextStaticFixturesByFamily(family).length).toBeGreaterThan(0);
  }
});

test("sector industry peer and relative-strength families are represented", () => {
  for (const family of [
    "strong_sector",
    "weak_sector",
    "strong_industry",
    "weak_industry",
    "strong_peer_group",
    "weak_peer_group",
    "positive_relative_strength",
    "negative_relative_strength",
    "conflicting_relative_signals",
    "supportive_bull_regime_sector_strength",
    "weak_market_strong_stock_relative_strength",
    "isolated_stock_spike_no_sector_support",
  ]) {
    expect(getIntelligenceContextStaticFixturesByFamily(family).length).toBeGreaterThan(0);
  }
});

test("news company event macro and calendar families are represented", () => {
  for (const family of [
    "positive_material_news",
    "negative_material_news",
    "neutral_news",
    "no_material_news",
    "news_unavailable",
    "earnings_event",
    "guidance_event",
    "fda_event",
    "sec_event",
    "conflicting_company_event_signals",
    "cpi_event",
    "fomc_event",
    "jobs_report_event",
    "options_expiration_event",
    "other_high_impact_event",
    "no_relevant_macro_event",
    "event_before_recommendation",
    "event_after_recommendation_excluded",
  ]) {
    expect(getIntelligenceContextStaticFixturesByFamily(family).length).toBeGreaterThan(0);
  }
});

test("provenance freshness and missing semantics remain explicit", () => {
  for (const family of [
    "complete_provenance",
    "partial_provenance",
    "low_quality_provenance",
    "stale_source",
    "conflicting_sources",
    "unavailable_source",
    "unknown_category",
    "explicit_null",
    "absent_optional_domain",
  ]) {
    expect(getIntelligenceContextStaticFixturesByFamily(family).length).toBeGreaterThan(0);
  }

  const unavailable = getIntelligenceContextStaticFixturesByFamily("news_unavailable")[0];
  const stale = getIntelligenceContextStaticFixturesByFamily("stale_source")[0];
  const conflicting = getIntelligenceContextStaticFixturesByFamily("conflicting_sources")[0];
  const missing = getIntelligenceContextStaticFixturesByFamily("explicit_null")[0];

  expect(unavailable.context.news_catalyst.availability).toBe("unavailable");
  expect(unavailable.freshness.state).toBe("unavailable");
  expect(stale.freshness).toMatchObject({ state: "stale", age_minutes_at_recommendation: 120 });
  expect(conflicting.conflict_metadata.state).toBe("conflicting");
  expect(conflicting.conflict_metadata.source_ids).toHaveLength(2);
  expect(missing.context.sector_industry.industry).toEqual({ state: "explicit_null", value: null });
  expect(missing.context.market.market_regime).toEqual({ state: "unknown", value: "unknown" });
  expect(missing.context.calendar_event.availability).toBe("unavailable");
});

test("future facts are excluded and context contains no outcome leakage", () => {
  const fixture = getIntelligenceContextStaticFixturesByFamily(
    "event_after_recommendation_excluded",
  )[0];
  const recommendationAt = Date.parse(
    fixture.recommendation_linkage.recommendation_created_at,
  );

  expect(fixture.excluded_future_context).toHaveLength(2);
  for (const excluded of fixture.excluded_future_context) {
    expect(excluded.included_in_snapshot_context).toBe(false);
    expect(Date.parse(excluded.effective_at)).toBeGreaterThan(recommendationAt);
  }
  expect(JSON.stringify(fixture.context)).not.toMatch(
    /target_hit|stop_hit|gross_r_multiple|outcome_status/,
  );
  expect(fixture.anti_leakage_status).toBe("passed");
});

test("identity family retrieval and static validator are stable", () => {
  const fixture = getIntelligenceContextStaticFixtures()[0];
  const first = getIntelligenceContextStaticFixtureById(fixture.fixture_id);
  const second = getIntelligenceContextStaticFixtureById(fixture.fixture_id);

  expect(first).toEqual(fixture);
  expect(first).toEqual(second);
  expect(first).not.toBe(second);
  expect(getIntelligenceContextStaticFixtureById("missing")).toBeNull();
  expect(validateIntelligenceContextStaticFixtureSet()).toEqual({ ok: true, errors: [] });
});

test("malformed context cases remain raw and isolated", () => {
  const malformed = getMalformedIntelligenceContextStaticFixtureCases();
  const reasons = malformed.map((fixture) => fixture.reason);

  expect(malformed).toHaveLength(18);
  expect(getIntelligenceContextStaticFixtures().some((fixture) => fixture.fixture_id.startsWith("malformed_context:"))).toBe(false);
  for (const reason of [
    "missing_context_identity",
    "duplicate_fixture_identity",
    "invalid_recommendation_linkage",
    "capture_after_recommendation_boundary",
    "effective_after_recommendation_without_exclusion",
    "future_news_leakage",
    "future_macro_event_leakage",
    "outcome_data_embedded_in_context",
    "malformed_provenance",
    "unsupported_categorical_value",
    "invalid_freshness_state",
    "stale_timestamp_marked_fresh",
    "conflicting_without_metadata",
    "partial_context_marked_complete",
    "non_finite_relative_strength_metric",
    "invalid_confidence_or_source_quality_bounds",
    "random_id_attempt",
    "wall_clock_timestamp_attempt",
  ]) {
    expect(reasons).toContain(reason);
  }
});

test("source contains no live collection mapper inference external access or persistence", () => {
  const source = readFileSync(modulePath, "utf8");
  for (const forbidden of [
    "process.env",
    "fetch(",
    "Date.now",
    "new Date",
    "performance.now",
    "Math.random",
    "randomUUID",
    "@supabase",
    "supabase-js",
    "next/server",
    "writeFile",
    "readFile",
    "collectMarketContext",
    "fetchNews",
    "calculateMarketRegime",
    "calculateRelativeStrength",
    "inferSentiment",
    "resolveConflicts",
    "mapSnapshotToContext",
    "mapSnapshotToLearningDataset",
  ]) {
    expect(source).not.toContain(forbidden);
  }
});

test("Action 381 verifier passes without secrets or runtime effects", () => {
  const output = runVerifier(
    "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs",
  );
  const parsed = JSON.parse(output);

  expect(parsed.verification_status).toBe("passed");
  expect(parsed.valid_fixture_count).toBe(15);
  expect(parsed.malformed_case_count).toBe(18);
  expect(parsed.authoritative_intelligence_context_contract_reused).toBe(true);
  expect(parsed.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  expect(parsed.live_collection_allowed).toBe(false);
  expect(parsed.mapper_implementation_allowed).toBe(false);
  expect(parsed.no_effect_flags).toEqual({
    provider_call_executed: false,
    news_call_executed: false,
    macro_calendar_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    context_persisted: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  });
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("provider-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("upstream Intelligence Context and Learning Dataset verifiers remain healthy", () => {
  for (const verifier of [
    "scripts/action-336-intelligence-context-schema-draft-verify.mjs",
    "scripts/action-342-intelligence-context-static-fixture-spec-verify.mjs",
    "scripts/action-348-intelligence-context-static-fixture-implementation-plan-verify.mjs",
    "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
    "scripts/action-354-intelligence-context-static-fixture-implementation-approval-gate-verify.mjs",
    "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
  ]) {
    expect(JSON.parse(runVerifier(verifier)).verification_status).toBe("passed");
  }
});

test("Action 381 does not change runtime preview or deployment artifacts", () => {
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const action381Lines = status
    .split("\n")
    .filter((line) => line.includes("action-381") || line.includes("intelligence-context-static-fixtures"));

  expect(action381Lines.some((line) => line.includes("app/"))).toBe(false);
  expect(action381Lines.some((line) => line.includes("netlify.toml"))).toBe(false);
  expect(action381Lines.some((line) => line.includes("proxy.ts"))).toBe(false);
  expect(action381Lines.some((line) => line.includes("action-370-preview-deployment-input-manifest"))).toBe(false);
});
