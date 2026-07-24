import { execFileSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  mapSnapshotToLearningDataset,
  type SnapshotToLearningDatasetMapperInput,
  type SnapshotToLearningDatasetMapperResult,
} from "../../lib/snapshot-to-learning-dataset-mapper";
import { getIntelligenceContextStaticFixtures } from "../../lib/intelligence-context-static-fixtures";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

const at = "2026-07-08T13:45:00.000Z";
const contextAt = "2026-07-08T13:44:30.000Z";
const outcomeAt = "2026-07-08T14:45:00.000Z";

function snapshot(overrides: Partial<RecommendationSnapshot> = {}): RecommendationSnapshot {
  return {
    id: "snapshot:mapper:001",
    snapshot_fingerprint: "snapshot_fingerprint:mapper:001",
    recommendation_id: "recommendation:mapper:001",
    scan_run_id: "scan_run:mapper:001",
    ticker: "AAPL",
    company_name: "Apple",
    recommended_at: at,
    app_timestamp: at,
    window: "morning",
    status: "visible",
    source_mode: "static_test",
    data_mode: "static_test",
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
    rationale: "static mapper fixture",
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
      candidate_id: "candidate:mapper:001",
      batch_fingerprint: "batch:mapper:001",
      trading_day: "2026-07-08",
      setup_family: "momentum_continuation",
      confidence_label: "high",
      tier: "valid",
      invalidation_logic: "close_below_198",
      sanitizer_passed: true,
      risk_geometry_valid: true,
      snapshot_completeness: "complete",
      enrichment_version: "static_test_v1",
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

function contextFor(source: RecommendationSnapshot) {
  const fixture = getIntelligenceContextStaticFixtures()[0];
  return {
    ...fixture,
    fixture_id: "context:mapper:001",
    recommendation_linkage: {
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      recommendation_created_at: at,
    },
    effective_at: "2026-07-08T13:44:00.000Z",
    context: {
      ...fixture.context,
      context_snapshot_id: "context:mapper:001",
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      captured_at: contextAt,
    },
    excluded_future_context: [],
    missing_context_reasons: [],
  };
}

function outcomeFor(
  source: RecommendationSnapshot,
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  return {
    id: "outcome:mapper:001",
    snapshot_id: source.id,
    snapshot_fingerprint: source.snapshot_fingerprint,
    recommendation_id: source.recommendation_id,
    ticker: source.ticker,
    side: "long",
    recommended_at: at,
    evaluated_at: outcomeAt,
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
    source: "static_test",
    provider: "static_test",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: { gross_r_multiple: 2 },
    created_at: outcomeAt,
    updated_at: outcomeAt,
    ...overrides,
  };
}

function completeInput(): SnapshotToLearningDatasetMapperInput {
  const recommendationSnapshot = snapshot();
  return {
    recommendationSnapshot,
    contextSnapshot: contextFor(recommendationSnapshot),
    outcome: outcomeFor(recommendationSnapshot),
  };
}

function map(input: SnapshotToLearningDatasetMapperInput) {
  return mapSnapshotToLearningDataset(input);
}

function expectBlocked(
  result: SnapshotToLearningDatasetMapperResult,
  status: Exclude<SnapshotToLearningDatasetMapperResult["status"], "mapped" | "mapped_with_missing_optional_data">,
) {
  expect(result.status).toBe(status);
  expect(result.row).toBeNull();
  expect(result.consumable).toBe(false);
  expect(result.issues.length).toBeGreaterThan(0);
  for (const item of result.issues) {
    expect(item.path).toMatch(/^\//);
    expect(item.messageKey).toBe(`mapper.issue.${item.code}`);
    expect(item).not.toHaveProperty("value");
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

test.describe.serial("Action 388 pure Snapshot-to-Learning Dataset mapper", () => {
  test("public contract reuses authoritative types and maps complete input", () => {
    const result = map(completeInput());

    expect(result.status).toBe("mapped");
    expect(result.consumable).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.row?.schema_version).toBe("learning_dataset_static_fixture_v1");
    expect(result.row?.identity.recommendation_snapshot_id).toBe("snapshot:mapper:001");
    expect(result.row?.identity.evaluated_outcome_id).toBe("outcome:mapper:001");
    expect(result.row?.setup_and_confidence.numeric_confidence).toBe(0.78);
    expect(result.row?.outcome_fields.outcome_status).toBe("target_hit");
  });

  test("rich Action 381 context is preserved through a defensive copy", () => {
    const input = completeInput();
    const result = map(input);
    expect(result.row?.context).toEqual(input.contextSnapshot?.context);
    expect(result.row?.context).not.toBe(input.contextSnapshot?.context);
    expect(result.row?.data_provenance).toEqual(input.contextSnapshot?.data_provenance);
    expect(result.row?.data_provenance).not.toBe(input.contextSnapshot?.data_provenance);
  });

  test("missing optional context and pending outcome map with explicit warnings", () => {
    const source = snapshot();
    const result = map({ recommendationSnapshot: source, contextSnapshot: null, outcome: null });

    expect(result.status).toBe("mapped_with_missing_optional_data");
    expect(result.consumable).toBe(true);
    expect(result.issues.map((item) => item.code)).toEqual([
      "missing_optional_context",
      "missing_optional_outcome",
    ]);
    expect(result.row?.context.market.completeness).toBe("unavailable");
    expect(result.row?.data_provenance.state).toBe("unavailable");
    expect(result.row?.outcome_fields.availability).toBe("not_yet_available");
    expect(result.row?.learning_eligibility_status).toBe("pending");
  });

  test("explicit null unknown unavailable stale partial and conflicting states survive mapping", () => {
    const source = snapshot();
    const fixtures = getIntelligenceContextStaticFixtures();
    const selected = fixtures.find((item) =>
      item.fixture_family_tags.includes("unknown_category"),
    ) ?? fixtures[0];
    const adapted = {
      ...selected,
      recommendation_linkage: {
        ...selected.recommendation_linkage,
        recommendation_snapshot_id: source.id,
        recommendation_id: source.recommendation_id,
        recommendation_created_at: at,
      },
      effective_at: "2026-07-08T13:44:00.000Z",
      context: {
        ...selected.context,
        context_snapshot_id: "context:mapper:missing-states",
        recommendation_snapshot_id: source.id,
        recommendation_id: source.recommendation_id,
        captured_at: contextAt,
      },
      excluded_future_context: [],
    };
    const result = map({ recommendationSnapshot: source, contextSnapshot: adapted, outcome: outcomeFor(source) });
    expect(result.status).toBe("mapped_with_missing_optional_data");
    expect(result.row?.context).toEqual(adapted.context);
    expect(result.row?.data_provenance.state).toBe(selected.data_provenance.state);
  });

  test("incomplete outcomes remain incomplete and consumable", () => {
    const source = snapshot();
    const result = map({
      recommendationSnapshot: source,
      contextSnapshot: contextFor(source),
      outcome: outcomeFor(source, {
        status: "incomplete",
        target_hit: null,
        first_terminal_event: "unknown",
      }),
    });
    expect(result.status).toBe("mapped_with_missing_optional_data");
    expect(result.row?.outcome_fields.availability).toBe("incomplete");
    expect(result.row?.derived_learning_fields.setup_success_label).toBe("incomplete");
    expect(result.row?.learning_eligibility_status).toBe("limited");
  });

  test("equivalent side and confidence aliases normalize deterministically", () => {
    const source = snapshot({
      side: "BUY",
      confidence: "78",
      score: 0.78,
      payload_json: {
        ...snapshot().payload_json,
        direction: "long",
        confidence: 78,
        score: 0.78,
      },
    });
    const result = map({ recommendationSnapshot: source, contextSnapshot: contextFor(source), outcome: outcomeFor(source) });
    expect(result.status).toBe("mapped");
    expect(result.row?.trade_plan.direction).toBe("long");
    expect(result.row?.setup_and_confidence.numeric_confidence).toBe(0.78);
  });

  test("invalid input shape returns blocked_invalid_input", () => {
    const result = mapSnapshotToLearningDataset(null as never);
    expectBlocked(result, "blocked_invalid_input");
    expect(result.issues[0].path).toBe("/");
  });

  test("missing identities return blocked_missing_required_identity before later problems", () => {
    const source = snapshot({ id: "", snapshot_fingerprint: "", side: "bad" });
    const result = map({ recommendationSnapshot: source, contextSnapshot: null, outcome: null });
    expectBlocked(result, "blocked_missing_required_identity");
    expect(result.issues.map((item) => item.path)).toEqual([
      "/recommendationSnapshot/id",
      "/recommendationSnapshot/snapshot_fingerprint",
    ]);
  });

  test("context and outcome linkage mismatches return blocked_invalid_linkage", () => {
    const source = snapshot();
    const context = contextFor(source);
    const outcome = outcomeFor(source, { snapshot_fingerprint: "other" });
    const result = map({
      recommendationSnapshot: source,
      contextSnapshot: {
        ...context,
        context: { ...context.context, recommendation_snapshot_id: "other" },
      },
      outcome,
    });
    expectBlocked(result, "blocked_invalid_linkage");
    expect(result.issues.map((item) => item.path)).toEqual([
      "/contextSnapshot/context/recommendation_snapshot_id",
      "/outcome/snapshot_fingerprint",
    ]);
  });

  test("material timestamp side setup and confidence conflicts block", () => {
    const cases: RecommendationSnapshot[] = [
      snapshot({ created_at: "2026-07-08T13:46:00.000Z" }),
      snapshot({ payload_json: { ...snapshot().payload_json, direction: "short" } }),
      snapshot({ payload_json: { ...snapshot().payload_json, setup_type: "range_break" } }),
      snapshot({ score: 60 }),
    ];
    for (const source of cases) {
      const result = map({ recommendationSnapshot: source, contextSnapshot: contextFor(source), outcome: outcomeFor(source) });
      expectBlocked(result, "blocked_conflicting_aliases");
    }
  });

  test("invalid timestamps and temporal violations block deterministically", () => {
    const invalid = snapshot({ recommended_at: "not-a-time", app_timestamp: "", created_at: "" });
    expectBlocked(
      map({ recommendationSnapshot: invalid, contextSnapshot: null, outcome: null }),
      "blocked_temporal_violation",
    );

    const source = snapshot();
    const context = contextFor(source);
    expectBlocked(
      map({
        recommendationSnapshot: source,
        contextSnapshot: { ...context, context: { ...context.context, captured_at: "2026-07-08T13:46:00.000Z" } },
        outcome: outcomeFor(source),
      }),
      "blocked_temporal_violation",
    );
    expectBlocked(
      map({ recommendationSnapshot: source, contextSnapshot: contextFor(source), outcome: outcomeFor(source, { evaluated_at: contextAt, updated_at: contextAt, created_at: contextAt }) }),
      "blocked_temporal_violation",
    );
  });

  test("future news macro and outcome-in-context leakage block", () => {
    const source = snapshot();
    const base = contextFor(source);
    const futureNews = {
      ...base,
      context: {
        ...base.context,
        news_catalyst: {
          ...base.context.news_catalyst,
          catalyst_timestamp: "2026-07-08T14:00:00.000Z",
        },
      },
    };
    expectBlocked(map({ recommendationSnapshot: source, contextSnapshot: futureNews, outcome: outcomeFor(source) }), "blocked_future_leakage");

    const futureMacro = {
      ...base,
      excluded_future_context: [{
        domain: "macro_event" as const,
        effective_at: "2026-07-08T14:30:00.000Z",
        included_in_snapshot_context: true as false,
        exclusion_reason: "after_recommendation_boundary" as const,
      }],
    };
    expectBlocked(map({ recommendationSnapshot: source, contextSnapshot: futureMacro, outcome: outcomeFor(source) }), "blocked_future_leakage");

    const leaked = {
      ...base,
      context: { ...base.context, target_hit: true },
    } as typeof base;
    expectBlocked(map({ recommendationSnapshot: source, contextSnapshot: leaked, outcome: outcomeFor(source) }), "blocked_future_leakage");
  });

  test("invalid provenance and completeness return blocked_invalid_provenance", () => {
    const source = snapshot();
    const base = contextFor(source);
    for (const contextSnapshot of [
      { ...base, data_provenance: { ...base.data_provenance, state: "complete" as const, provider: null } },
      { ...base, data_provenance: { ...base.data_provenance, completeness_score: 1.2 } },
      { ...base, data_provenance: { ...base.data_provenance, source_confidence: Number.NaN } },
    ]) {
      expectBlocked(map({ recommendationSnapshot: source, contextSnapshot, outcome: outcomeFor(source) }), "blocked_invalid_provenance");
    }
  });

  test("invalid outcomes and non-finite metrics return blocked_invalid_outcome", () => {
    const source = snapshot();
    for (const outcome of [
      outcomeFor(source, { status: "unknown" }),
      outcomeFor(source, { side: "short" }),
      outcomeFor(source, { best_r: Number.POSITIVE_INFINITY }),
    ]) {
      expectBlocked(map({ recommendationSnapshot: source, contextSnapshot: contextFor(source), outcome }), "blocked_invalid_outcome");
    }
    expectBlocked(
      map({ recommendationSnapshot: source, contextSnapshot: contextFor(source), outcome: outcomeFor(source, { horizon: "eod" }) }),
      "blocked_invalid_outcome",
    );
  });

  test("missing required plan and confidence values return blocked_invalid_input", () => {
    const source = snapshot({ entry: null, confidence: null, score: null, payload_json: { ...snapshot().payload_json, confidence: null } });
    const result = map({ recommendationSnapshot: source, contextSnapshot: contextFor(source), outcome: outcomeFor(source) });
    expectBlocked(result, "blocked_invalid_input");
    expect(result.issues.map((item) => item.path)).toEqual([
      "/recommendationSnapshot/confidence",
      "/recommendationSnapshot/entry",
    ]);
  });

  test("malformed populated secondary side and confidence aliases are not ignored", () => {
    for (const source of [
      snapshot({ payload_json: { ...snapshot().payload_json, direction: "sideways" } }),
      snapshot({ payload_json: { ...snapshot().payload_json, confidence: "not_numeric" } }),
    ]) {
      expectBlocked(
        map({
          recommendationSnapshot: source,
          contextSnapshot: contextFor(source),
          outcome: outcomeFor(source),
        }),
        "blocked_invalid_input",
      );
    }
  });

  test("issue deduplication ordering paths and redaction are stable", () => {
    const source = snapshot({ id: "", snapshot_fingerprint: "", ticker: null });
    const first = map({ recommendationSnapshot: source, contextSnapshot: null, outcome: null });
    const second = map({ recommendationSnapshot: source, contextSnapshot: null, outcome: null });
    expect(first).toEqual(second);
    expect(first.issues.map((item) => item.path)).toEqual([
      "/recommendationSnapshot/id",
      "/recommendationSnapshot/snapshot_fingerprint",
      "/recommendationSnapshot/ticker",
    ]);
    expect(new Set(first.issues.map((item) => `${item.code}:${item.path}`)).size).toBe(first.issues.length);
    expect(JSON.stringify(first.issues)).not.toContain("AAPL");
    expect(JSON.stringify(first.issues)).not.toContain("static_test");
  });

  test("row identity is stable and changes only with frozen identity inputs", () => {
    const input = completeInput();
    const first = map(input);
    const second = map(clone(input));
    expect(first.row?.identity.dataset_row_id).toBe(second.row?.identity.dataset_row_id);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));

    const source = snapshot({ snapshot_fingerprint: "snapshot_fingerprint:mapper:002" });
    const changed = map({ recommendationSnapshot: source, contextSnapshot: contextFor(source), outcome: outcomeFor(source) });
    expect(changed.row?.identity.dataset_row_id).not.toBe(first.row?.identity.dataset_row_id);
    expect(first.row?.identity.dataset_row_id).toContain("learning_row:v1:");
  });

  test("deeply frozen inputs remain byte-identical", () => {
    const input = deepFreeze(completeInput());
    const before = JSON.stringify(input);
    const result = map(input);
    expect(result.status).toBe("mapped");
    expect(JSON.stringify(input)).toBe(before);
  });

  test("peer-group remains unsupported optional and no mapper consumer exists", () => {
    const source = readFileSync(join(process.cwd(), "lib/snapshot-to-learning-dataset-mapper.ts"), "utf8");
    expect(source).not.toContain("peer_group:");
    expect(source).not.toContain("peerGroup:");
    const consumers = readdirSync(join(process.cwd(), "app"), { recursive: true })
      .map(String)
      .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"))
      .filter((path) => readFileSync(join(process.cwd(), "app", path), "utf8").includes("snapshot-to-learning-dataset-mapper"));
    expect(consumers).toEqual([]);
  });

  test("source has no runtime provider Supabase persistence clock random logging or global cache", () => {
    const source = readFileSync(join(process.cwd(), "lib/snapshot-to-learning-dataset-mapper.ts"), "utf8");
    for (const forbidden of [
      "process.env",
      "fetch(",
      "Date.now(",
      "Math.random(",
      "randomUUID(",
      "console.",
      "@supabase",
      "supabase-js",
      "next/server",
      "localStorage",
      "writeFile",
      "readFile",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  test("Action 388 verifier and upstream chain pass", () => {
    const verifier = JSON.parse(
      execFileSync("node", ["scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs"], {
        cwd: process.cwd(),
        encoding: "utf8",
      }),
    );
    expect(verifier.verification_status).toBe("passed");
    expect(verifier.mapper_implemented).toBe(true);
    expect(verifier.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");

    for (const path of [
      "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
      "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
      "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs",
      "scripts/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests-verify.mjs",
      "scripts/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests-verify.mjs",
      "scripts/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review-verify.mjs",
      "scripts/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate-verify.mjs",
    ]) {
      expect(JSON.parse(execFileSync("node", [path], { cwd: process.cwd(), encoding: "utf8" })).verification_status).toBe("passed");
    }
  });
});
