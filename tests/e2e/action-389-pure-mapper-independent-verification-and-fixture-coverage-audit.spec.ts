import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  getIntelligenceContextStaticFixtures,
  getMalformedIntelligenceContextStaticFixtureCases,
  type Action336IntelligenceContextStaticFixture,
} from "../../lib/intelligence-context-static-fixtures";
import {
  getLearningDatasetStaticFixtures,
  getMalformedLearningDatasetStaticFixtureCases,
} from "../../lib/learning-dataset-static-fixtures";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";
import {
  mapSnapshotToLearningDataset,
  type SnapshotToLearningDatasetMapperInput,
  type SnapshotToLearningDatasetMapperIssueCode,
  type SnapshotToLearningDatasetMapperResult,
} from "../../lib/snapshot-to-learning-dataset-mapper";

const recommendationAt = "2026-07-08T13:45:00.000Z";
const contextAt = "2026-07-08T13:44:30.000Z";
const outcomeAt = "2026-07-08T14:45:00.000Z";
const mapperHash = "05276aebf1e7c6328242949c22e489ba384c9c501574c5d170d789ba47fa00e2";
const remediatedMapperHash = "e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b";
const action394MapperHash = "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d";

function snapshot(overrides: Partial<RecommendationSnapshot> = {}): RecommendationSnapshot {
  return {
    id: "snapshot:audit:001",
    snapshot_fingerprint: "snapshot_fingerprint:audit:001",
    recommendation_id: "recommendation:audit:001",
    scan_run_id: "scan_run:audit:001",
    ticker: "AAPL",
    company_name: "Apple",
    recommended_at: recommendationAt,
    app_timestamp: recommendationAt,
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
    rationale: "static independent mapper audit",
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
      candidate_id: "candidate:audit:001",
      batch_fingerprint: "batch:audit:001",
      trading_day: "2026-07-08",
      setup_family: "momentum_continuation",
      confidence_label: "high",
      tier: "valid",
      invalidation_logic: "close_below_198",
      sanitizer_passed: true,
      risk_geometry_valid: true,
      snapshot_completeness: "complete",
      enrichment_version: "static_audit_v1",
      outcome_horizon: "60m",
      side: "buy",
      confidence: 78,
    },
    was_taken: false,
    linked_position_id: null,
    created_at: recommendationAt,
    updated_at: recommendationAt,
    ...overrides,
  };
}

function adaptContext(
  source: RecommendationSnapshot,
  fixture: Action336IntelligenceContextStaticFixture = getIntelligenceContextStaticFixtures()[0],
): Action336IntelligenceContextStaticFixture {
  return {
    ...fixture,
    recommendation_linkage: {
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      recommendation_created_at: recommendationAt,
    },
    context: {
      ...fixture.context,
      recommendation_snapshot_id: source.id,
      recommendation_id: source.recommendation_id,
      captured_at: contextAt,
    },
  };
}

function outcome(
  source: RecommendationSnapshot,
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  return {
    id: "outcome:audit:001",
    snapshot_id: source.id,
    snapshot_fingerprint: source.snapshot_fingerprint,
    recommendation_id: source.recommendation_id,
    ticker: source.ticker,
    side: "long",
    recommended_at: recommendationAt,
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
    source: "static_audit",
    provider: "static_audit",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: { gross_r_multiple: 2 },
    created_at: outcomeAt,
    updated_at: outcomeAt,
    ...overrides,
  };
}

function input(
  snapshotOverrides: Partial<RecommendationSnapshot> = {},
  contextFixture: Action336IntelligenceContextStaticFixture | null = getIntelligenceContextStaticFixtures()[0],
  outcomeOverrides: Partial<RecommendationOutcome> | null = {},
): SnapshotToLearningDatasetMapperInput {
  const recommendationSnapshot = snapshot(snapshotOverrides);
  return {
    recommendationSnapshot,
    contextSnapshot: contextFixture ? adaptContext(recommendationSnapshot, contextFixture) : null,
    outcome: outcomeOverrides === null ? null : outcome(recommendationSnapshot, outcomeOverrides),
  };
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

function payloadOf(source: RecommendationSnapshot): Record<string, unknown> {
  return source.payload_json as Record<string, unknown>;
}

function withPayload(
  source: RecommendationSnapshot,
  patch: Record<string, unknown>,
): RecommendationSnapshot {
  return { ...source, payload_json: { ...payloadOf(source), ...patch } };
}

function primary(result: SnapshotToLearningDatasetMapperResult) {
  return result.issues[0] ?? null;
}

function malformedInput(value: unknown): SnapshotToLearningDatasetMapperInput {
  return value as SnapshotToLearningDatasetMapperInput;
}

function withFingerprint(
  value: SnapshotToLearningDatasetMapperInput,
  fingerprint: string,
): SnapshotToLearningDatasetMapperInput {
  return {
    ...value,
    recommendationSnapshot: { ...value.recommendationSnapshot, snapshot_fingerprint: fingerprint },
    outcome: value.outcome ? { ...value.outcome, snapshot_fingerprint: fingerprint } : null,
  };
}

function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? files(child) : [child];
  });
}

test.describe.serial("Action 389 independent pure mapper verification", () => {
  test("source integrity hash and public API remain unchanged", () => {
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    const currentHash = createHash("sha256").update(source).digest("hex");
    expect([mapperHash, remediatedMapperHash, action394MapperHash]).toContain(currentHash);
    if (currentHash === remediatedMapperHash) {
      expect(readFileSync("docs/action-391-pure-mapper-contract-remediation.md", "utf8")).toContain("Action 390 returned `approval_decision: approved`");
    }
    if (currentHash === action394MapperHash) {
      expect(readFileSync("docs/action-394-pure-mapper-literal-normalization-remediation.md", "utf8")).toContain(`mapper: \`${action394MapperHash}\``);
    }
    expect(source.match(/export function mapSnapshotToLearningDataset\s*\(/g)).toHaveLength(1);
    expect(source.match(/export function /g)).toHaveLength(1);
    for (const marker of [
      "process.env",
      "fetch(",
      "Date.now(",
      "Math.random(",
      "randomUUID(",
      "console.",
      "@supabase",
      "next/server",
      "node:fs",
      "writeFile",
      "localStorage",
    ]) expect(source).not.toContain(marker);
  });

  test("all 15 Action 381 valid context fixture families map deterministically", () => {
    const rows = getIntelligenceContextStaticFixtures().map((fixture) => {
      const source = input({}, fixture);
      const first = mapSnapshotToLearningDataset(source);
      const second = mapSnapshotToLearningDataset(clone(source));
      const expectedWarnings = fixture.data_provenance.state === "partial"
        ? ["partial_provenance"]
        : fixture.data_provenance.state === "unavailable"
          ? ["unavailable_source"]
          : [];
      return {
        sourceFixtureId: fixture.fixture_id,
        expectedStatus: expectedWarnings.length ? "mapped_with_missing_optional_data" : "mapped",
        expectedRow: true,
        expectedWarnings,
        actualStatus: first.status,
        actualWarnings: first.issues.map((item) => item.code),
        deterministic: JSON.stringify(first) === JSON.stringify(second),
      };
    });
    expect(rows).toHaveLength(15);
    for (const row of rows) {
      expect(row.actualStatus, row.sourceFixtureId).toBe(row.expectedStatus);
      expect(row.actualWarnings, row.sourceFixtureId).toEqual(row.expectedWarnings);
      expect(row.deterministic, row.sourceFixtureId).toBe(true);
    }
  });

  test("all 13 Action 380 valid semantic families have direct test-local mapper representatives", () => {
    const learningFixtures = getLearningDatasetStaticFixtures();
    const contexts = getIntelligenceContextStaticFixtures();
    const representative = new Map<string, SnapshotToLearningDatasetMapperInput>([
      ["complete_valid_learning_row", input()],
      ["complete_rich_intelligence_context", input({}, contexts[1])],
      ["missing_optional_context", input({}, null)],
      ["partial_market_context", input({}, contexts[3])],
      ["absent_news_context", input({}, contexts[0])],
      ["absent_event_context", input({}, contexts[0])],
      ["incomplete_outcome", input({}, contexts[0], { status: "incomplete", target_hit: null, first_terminal_event: "unknown" })],
      ["no_outcome_yet_state", input({}, contexts[0], null)],
      ["unknown_categorical_value", input({ type: null, payload_json: { ...payloadOf(snapshot()), setup_family: "unknown" } }, contexts[13])],
      ["unavailable_source", input({}, contexts[8])],
      ["partial_provenance", input({}, contexts[3])],
      ["low_provenance_completeness", input({}, contexts[13])],
      ["explicit_null_semantics", input({}, contexts[13])],
    ]);
    const matrix = learningFixtures.map((fixture) => {
      const family = fixture.fixture_family_tags[0];
      const mapperInput = representative.get(family);
      const result = mapperInput ? mapSnapshotToLearningDataset(mapperInput) : null;
      return {
        sourceFixtureId: fixture.identity.dataset_row_id,
        family,
        represented: Boolean(mapperInput),
        actualStatus: result?.status ?? "missing_representative",
        rowPresent: result?.row !== null,
      };
    });
    expect(matrix).toHaveLength(13);
    expect(matrix.filter((item) => !item.represented)).toEqual([]);
    expect(matrix.every((item) => item.rowPresent)).toBe(true);
    expect(matrix.map((item) => item.actualStatus)).toEqual(expect.arrayContaining([
      "mapped",
      "mapped_with_missing_optional_data",
    ]));
  });

  test("success and blocked result vocabulary has deterministic direct coverage", () => {
    const source = input();
    const cases: Array<[string, unknown]> = [
      ["mapped", source],
      ["mapped_with_missing_optional_data", input({}, null, null)],
      ["blocked_missing_required_identity", input({ id: "" })],
      ["blocked_invalid_linkage", { ...source, outcome: { ...source.outcome, snapshot_id: "snapshot:other" } }],
      ["blocked_conflicting_aliases", input({ side: "long", payload_json: { ...payloadOf(snapshot()), side: "sell" } })],
      ["blocked_temporal_violation", input({ recommended_at: "invalid", app_timestamp: "invalid", created_at: "invalid" })],
      ["blocked_future_leakage", { ...source, contextSnapshot: { ...source.contextSnapshot, context: { ...source.contextSnapshot?.context, outcome_status: "target_hit" } } }],
      ["blocked_invalid_provenance", { ...source, contextSnapshot: { ...source.contextSnapshot, data_provenance: { ...source.contextSnapshot?.data_provenance, completeness_score: 2 } } }],
      ["blocked_invalid_outcome", { ...source, outcome: { ...source.outcome, status: "magic" } }],
      ["blocked_invalid_input", null],
    ];
    expect(cases.map(([expected, value]) => mapSnapshotToLearningDataset(value as SnapshotToLearningDatasetMapperInput).status)).toEqual(cases.map(([expected]) => expected));
  });

  test("issue contract and every frozen issue code have direct coverage", () => {
    const partial = input({}, getIntelligenceContextStaticFixtures()[3], null);
    const unavailable = input({}, getIntelligenceContextStaticFixtures()[8]);
    const unknown = input({ type: null, payload_json: { ...payloadOf(snapshot()), setup_family: "unknown" } });
    const sources = [
      mapSnapshotToLearningDataset(input({ id: "" })),
      mapSnapshotToLearningDataset(malformedInput({ ...input(), outcome: { ...input().outcome, snapshot_id: "other" } })),
      mapSnapshotToLearningDataset(input({ side: "long", payload_json: { ...payloadOf(snapshot()), side: "sell" } })),
      mapSnapshotToLearningDataset(input({ recommended_at: "invalid", app_timestamp: "invalid", created_at: "invalid" })),
      mapSnapshotToLearningDataset(malformedInput({ ...input(), contextSnapshot: { ...input().contextSnapshot, context: { ...input().contextSnapshot?.context, target_hit: true } } })),
      mapSnapshotToLearningDataset(malformedInput({ ...input(), contextSnapshot: { ...input().contextSnapshot, data_provenance: { ...input().contextSnapshot?.data_provenance, completeness_score: 2 } } })),
      mapSnapshotToLearningDataset(malformedInput({ ...input(), outcome: { ...input().outcome, status: "magic" } })),
      mapSnapshotToLearningDataset(null as never),
      mapSnapshotToLearningDataset(input({}, null, null)),
      mapSnapshotToLearningDataset(unknown),
      mapSnapshotToLearningDataset(unavailable),
      mapSnapshotToLearningDataset(partial),
    ];
    const covered = new Set(sources.flatMap((result) => result.issues.map((item) => item.code)));
    const expected: SnapshotToLearningDatasetMapperIssueCode[] = [
      "missing_required_identity", "invalid_linkage", "conflicting_aliases", "invalid_timestamp",
      "future_leakage", "invalid_provenance", "invalid_outcome", "invalid_input",
      "missing_optional_context", "missing_optional_outcome", "unknown_setup", "unavailable_source", "partial_provenance",
    ];
    const temporal = mapSnapshotToLearningDataset(input({}, {
      ...getIntelligenceContextStaticFixtures()[0],
      effective_at: "2026-07-08T13:46:00.000Z",
    }));
    temporal.issues.forEach((item) => covered.add(item.code));
    expect([...covered].sort()).toEqual([...expected, "temporal_violation"].sort());
    for (const result of [...sources, temporal]) {
      for (const item of result.issues) {
        expect(item.path).toMatch(/^\/(?:[^~/]|~[01])*(?:\/(?:[^~/]|~[01])*)*$/);
        expect(["error", "warning"]).toContain(item.severity);
        expect(item.messageKey).toBe(`mapper.issue.${item.code}`);
        expect(Object.keys(item).sort()).toEqual(["code", "messageKey", "path", "severity"]);
        expect(JSON.stringify(item)).not.toContain("static independent mapper audit");
        expect(JSON.stringify(item)).not.toContain(recommendationAt);
      }
      expect(new Set(result.issues.map((item) => `${item.code}:${item.path}`)).size).toBe(result.issues.length);
      expect(result.issues).toEqual([...result.issues].sort((a, b) => a.path.localeCompare(b.path) || a.code.localeCompare(b.code)));
    }
  });

  test("multi-fault validation precedence is stable and contract ordered", () => {
    const base = input({ id: "", side: "long", recommended_at: "invalid", payload_json: { ...payloadOf(snapshot()), side: "sell" } });
    const linkedWrong = { ...base, outcome: { ...base.outcome, snapshot_id: "other", status: "magic" } };
    for (let index = 0; index < 5; index += 1) {
      const result = mapSnapshotToLearningDataset(malformedInput(clone(linkedWrong)));
      expect(result.status).toBe("blocked_missing_required_identity");
      expect(primary(result)).toEqual({
        code: "missing_required_identity",
        path: "/recommendationSnapshot/id",
        severity: "error",
        messageKey: "mapper.issue.missing_required_identity",
      });
    }
    const linkageFirst = { ...input({ side: "long", payload_json: { ...payloadOf(snapshot()), side: "sell" } }), outcome: { ...input().outcome, snapshot_id: "other" } };
    expect(mapSnapshotToLearningDataset(malformedInput(linkageFirst)).status).toBe("blocked_invalid_linkage");
  });

  test("timestamp side setup and confidence aliases obey precedence without inference", () => {
    const equivalent = input({
      recommended_at: "2026-07-08T15:45:00+02:00",
      app_timestamp: recommendationAt,
      created_at: recommendationAt,
      side: "BUY",
      confidence: "78",
      score: 0.78,
      type: "momentum_continuation",
      payload_json: {
        ...payloadOf(snapshot()),
        direction: "long",
        setup_type: "momentum_continuation",
        confidence: 78,
        score: 0.78,
      },
    });
    const mapped = mapSnapshotToLearningDataset(equivalent);
    expect(mapped.status).toBe("mapped");
    expect(mapped.row?.snapshot_time_inputs.recommendation_created_at).toBe(recommendationAt);
    expect(mapped.row?.trade_plan.direction).toBe("long");
    expect(mapped.row?.setup_and_confidence.setup_family).toBe("momentum_continuation");
    expect(mapped.row?.setup_and_confidence.numeric_confidence).toBe(0.78);

    const conflicts = [
      input({ recommended_at: recommendationAt, app_timestamp: "2026-07-08T13:46:00.000Z" }),
      input({ side: "long", payload_json: { ...payloadOf(snapshot()), side: "sell" } }),
      input({ type: "momentum_continuation", payload_json: { ...payloadOf(snapshot()), setup_family: "vwap_reclaim" } }),
      input({ confidence: 0.78, score: 55 }),
    ];
    expect(conflicts.map((value) => mapSnapshotToLearningDataset(value).status)).toEqual([
      "blocked_conflicting_aliases", "blocked_conflicting_aliases", "blocked_conflicting_aliases", "blocked_conflicting_aliases",
    ]);
    expect(mapSnapshotToLearningDataset(input({ side: null, payload_json: { ...payloadOf(snapshot()), side: null } } as unknown as Partial<RecommendationSnapshot>)).status).toBe("blocked_invalid_input");
    expect(mapSnapshotToLearningDataset(input({ confidence: 101, score: null, payload_json: { ...payloadOf(snapshot()), confidence: null } })).status).toBe("blocked_invalid_input");
  });

  test("row identity includes only frozen canonical identity components", () => {
    const base = input();
    const id = mapSnapshotToLearningDataset(base).row?.identity.dataset_row_id;
    expect(mapSnapshotToLearningDataset(clone(base)).row?.identity.dataset_row_id).toBe(id);

    const changedFingerprint = withFingerprint(input(), "fingerprint:changed");
    expect(mapSnapshotToLearningDataset(changedFingerprint).row?.identity.dataset_row_id).not.toBe(id);
    expect(mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[0], { horizon: "30m" })).row?.identity.dataset_row_id).not.toBe(id);
    expect(mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[0], { id: "outcome:changed" })).row?.identity.dataset_row_id).not.toBe(id);
    expect(mapSnapshotToLearningDataset(input({ confidence: 0.61, score: 61, payload_json: { ...payloadOf(snapshot()), confidence: 61 } })).row?.identity.dataset_row_id).toBe(id);
    expect(mapSnapshotToLearningDataset(input({ type: "vwap_reclaim", payload_json: { ...payloadOf(snapshot()), setup_family: "vwap_reclaim" } })).row?.identity.dataset_row_id).toBe(id);
    expect(mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[1])).row?.identity.dataset_row_id).toBe(id);
    expect(mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[0], { best_r: 9.5 })).row?.identity.dataset_row_id).toBe(id);

    const pendingId = mapSnapshotToLearningDataset(input({}, getIntelligenceContextStaticFixtures()[0], null)).row?.identity.dataset_row_id;
    expect(pendingId).toContain("pending|pending");
    const composed = "cafe\u0301|% /";
    const canonical = "caf\u00e9|% /";
    const decomposedInput = withFingerprint(input(), composed);
    const canonicalInput = withFingerprint(input(), canonical);
    const decomposedId = mapSnapshotToLearningDataset(decomposedInput).row?.identity.dataset_row_id;
    expect(decomposedId).toBe(mapSnapshotToLearningDataset(canonicalInput).row?.identity.dataset_row_id);
    expect(decomposedId).toContain("caf%C3%A9%7C%25%20%2F");
  });

  test("deep-freeze repeated and interleaved calls prove immutability and determinism", () => {
    const left = deepFreeze(input({}, getIntelligenceContextStaticFixtures()[2]));
    const right = deepFreeze(input({}, null, null));
    const leftBefore = JSON.stringify(left);
    const rightBefore = JSON.stringify(right);
    const sequence = [left, right, left, right, left].map((value) => mapSnapshotToLearningDataset(value));
    expect(JSON.stringify(left)).toBe(leftBefore);
    expect(JSON.stringify(right)).toBe(rightBefore);
    expect(sequence[0]).toEqual(sequence[2]);
    expect(sequence[0]).toEqual(sequence[4]);
    expect(sequence[1]).toEqual(sequence[3]);
    expect(JSON.stringify(sequence[0])).toBe(JSON.stringify(mapSnapshotToLearningDataset(clone(left))));
  });

  test("malformed fixture audit records contract gaps without repair", () => {
    const contexts = getIntelligenceContextStaticFixtures();
    const unsupported = adaptContext(snapshot(), contexts[0]);
    const staleContradiction = adaptContext(snapshot(), contexts[0]);
    const base = input();
    const malformedCases = [
      ...getMalformedLearningDatasetStaticFixtureCases(),
      ...getMalformedIntelligenceContextStaticFixtureCases(),
    ];
    const auditRows = [
      {
        sourceMalformedCaseId: "malformed_context:010",
        expectedStatus: "blocked_invalid_provenance",
        expectedPrimaryCode: "invalid_provenance",
        expectedPath: "/contextSnapshot/context/market/market_regime/value",
        result: mapSnapshotToLearningDataset({ ...input(), contextSnapshot: { ...unsupported, context: { ...unsupported.context, market: { ...unsupported.context.market, market_regime: { state: "present", value: "magical" } } } } }),
      },
      {
        sourceMalformedCaseId: "malformed_context:012",
        expectedStatus: "blocked_invalid_provenance",
        expectedPrimaryCode: "invalid_provenance",
        expectedPath: "/contextSnapshot/freshness/age_minutes_at_recommendation",
        result: mapSnapshotToLearningDataset({ ...input(), contextSnapshot: { ...staleContradiction, freshness: { state: "fresh", age_minutes_at_recommendation: 180, rationale: "contradiction" } } }),
      },
      {
        sourceMalformedCaseId: "malformed_context:011",
        expectedStatus: "blocked_invalid_provenance",
        expectedPrimaryCode: "invalid_provenance",
        expectedPath: "/contextSnapshot/freshness/state",
        result: mapSnapshotToLearningDataset(malformedInput({ ...input(), contextSnapshot: { ...staleContradiction, freshness: { state: "instantaneous", age_minutes_at_recommendation: 1, rationale: "unsupported" } } })),
      },
      {
        sourceMalformedCaseId: "malformed_context:015",
        expectedStatus: "blocked_invalid_provenance",
        expectedPrimaryCode: "invalid_provenance",
        expectedPath: "/contextSnapshot/context/relative_strength/stock_vs_spy/value",
        result: mapSnapshotToLearningDataset(malformedInput({ ...input(), contextSnapshot: { ...unsupported, context: { ...unsupported.context, relative_strength: { ...unsupported.context.relative_strength, stock_vs_spy: { state: "present", value: Number.NaN } } } } })),
      },
      {
        sourceMalformedCaseId: "malformed:008",
        expectedStatus: "blocked_invalid_input",
        expectedPrimaryCode: "invalid_input",
        expectedPath: "/recommendationSnapshot/window",
        result: mapSnapshotToLearningDataset(malformedInput({ ...base, recommendationSnapshot: { ...base.recommendationSnapshot, window: "overnight_magic" } })),
      },
      {
        sourceMalformedCaseId: "mapper:horizon_conflict",
        expectedStatus: "blocked_invalid_linkage",
        expectedPrimaryCode: "invalid_linkage",
        expectedPath: "/outcome/horizon",
        result: mapSnapshotToLearningDataset(malformedInput({ ...base, outcome: { ...base.outcome, horizon: "30m" } })),
      },
      {
        sourceMalformedCaseId: "mapper:failed_anti_leakage_status",
        expectedStatus: "blocked_future_leakage",
        expectedPrimaryCode: "future_leakage",
        expectedPath: "/contextSnapshot/anti_leakage_status",
        result: mapSnapshotToLearningDataset(malformedInput({ ...base, contextSnapshot: { ...base.contextSnapshot, anti_leakage_status: "failed" } })),
      },
    ].map((row) => ({
      ...row,
      actualStatus: row.result.status,
      actualPrimaryCode: primary(row.result)?.code ?? null,
      actualPrimaryPath: primary(row.result)?.path ?? null,
      actualIssues: row.result.issues,
      repairPerformed: false,
    }));
    expect(malformedCases).toHaveLength(32);
    const currentHash = createHash("sha256")
      .update(readFileSync("lib/snapshot-to-learning-dataset-mapper.ts"))
      .digest("hex");
    if ([remediatedMapperHash, action394MapperHash].includes(currentHash)) {
      for (const row of auditRows) {
        expect(row.actualStatus, row.sourceMalformedCaseId).toBe(row.expectedStatus);
        expect(row.actualIssues.some((item) => item.code === row.expectedPrimaryCode && item.path === row.expectedPath), row.sourceMalformedCaseId).toBe(true);
        expect(row.repairPerformed).toBe(false);
      }
    } else {
      expect(auditRows.map((row) => row.actualStatus)).toEqual(Array(7).fill("mapped"));
      expect(auditRows.every((row) => row.actualStatus !== row.expectedStatus && row.repairPerformed === false)).toBe(true);
    }
  });

  test("remaining required malformed mapper cases block with stable status code and path", () => {
    const base = input();
    const context = base.contextSnapshot as Action336IntelligenceContextStaticFixture;
    const cases: Array<{ id: string; value: unknown; status: string; code: string; path: string }> = [
      { id: "mapper:invalid_shape", value: null, status: "blocked_invalid_input", code: "invalid_input", path: "/" },
      { id: "malformed:001", value: input({ id: "" }), status: "blocked_missing_required_identity", code: "missing_required_identity", path: "/recommendationSnapshot/id" },
      { id: "mapper:missing_fingerprint", value: input({ snapshot_fingerprint: "" }), status: "blocked_missing_required_identity", code: "missing_required_identity", path: "/recommendationSnapshot/snapshot_fingerprint" },
      { id: "malformed:002", value: { ...base, outcome: { ...base.outcome, snapshot_id: "other" } }, status: "blocked_invalid_linkage", code: "invalid_linkage", path: "/outcome/snapshot_id" },
      { id: "malformed_context:003", value: { ...base, contextSnapshot: { ...context, recommendation_linkage: { ...context.recommendation_linkage, recommendation_snapshot_id: "other" } } }, status: "blocked_invalid_linkage", code: "invalid_linkage", path: "/contextSnapshot/recommendation_linkage/recommendation_snapshot_id" },
      { id: "mapper:timestamp_conflict", value: input({ app_timestamp: "2026-07-08T13:46:00.000Z" }), status: "blocked_conflicting_aliases", code: "conflicting_aliases", path: "/recommendationSnapshot/app_timestamp" },
      { id: "mapper:side_conflict", value: input({ payload_json: { ...payloadOf(snapshot()), side: "sell" } }), status: "blocked_conflicting_aliases", code: "conflicting_aliases", path: "/recommendationSnapshot/payload_json/side" },
      { id: "mapper:setup_conflict", value: input({ payload_json: { ...payloadOf(snapshot()), setup_family: "vwap_reclaim" } }), status: "blocked_conflicting_aliases", code: "conflicting_aliases", path: "/recommendationSnapshot/payload_json/setup_family" },
      { id: "mapper:confidence_conflict", value: input({ score: 55 }), status: "blocked_conflicting_aliases", code: "conflicting_aliases", path: "/recommendationSnapshot/confidence" },
      { id: "malformed:013", value: input({ recommended_at: "wall_clock_now", app_timestamp: "wall_clock_now", created_at: "wall_clock_now" }), status: "blocked_temporal_violation", code: "invalid_timestamp", path: "/recommendationSnapshot/app_timestamp" },
      { id: "malformed_context:004", value: { ...base, contextSnapshot: { ...context, context: { ...context.context, captured_at: "2026-07-08T13:46:00.000Z" } } }, status: "blocked_temporal_violation", code: "temporal_violation", path: "/contextSnapshot/context/captured_at" },
      { id: "malformed_context:006", value: { ...base, contextSnapshot: { ...context, context: { ...context.context, news_catalyst: { ...context.context.news_catalyst, catalyst_timestamp: "2026-07-08T14:00:00.000Z" } } } }, status: "blocked_future_leakage", code: "future_leakage", path: "/contextSnapshot/context/news_catalyst/catalyst_timestamp" },
      { id: "malformed_context:007", value: { ...base, contextSnapshot: { ...context, excluded_future_context: [{ domain: "macro_event", effective_at: "2026-07-08T15:00:00.000Z", included_in_snapshot_context: true, exclusion_reason: "invalid" }] } }, status: "blocked_future_leakage", code: "future_leakage", path: "/contextSnapshot/excluded_future_context/0" },
      { id: "malformed_context:008", value: { ...base, contextSnapshot: { ...context, context: { ...context.context, target_hit: true } } }, status: "blocked_future_leakage", code: "future_leakage", path: "/contextSnapshot/context" },
      { id: "malformed_context:009", value: { ...base, contextSnapshot: { ...context, data_provenance: { ...context.data_provenance, provider: null } } }, status: "blocked_invalid_provenance", code: "invalid_provenance", path: "/contextSnapshot/data_provenance/provider" },
      { id: "malformed:011", value: { ...base, contextSnapshot: { ...context, data_provenance: { ...context.data_provenance, completeness_score: 1.1 } } }, status: "blocked_invalid_provenance", code: "invalid_provenance", path: "/contextSnapshot/data_provenance/completeness_score" },
      { id: "malformed_context:013", value: { ...base, contextSnapshot: { ...context, conflict_metadata: { state: "conflicting", source_ids: [], details: null } } }, status: "blocked_invalid_provenance", code: "invalid_provenance", path: "/contextSnapshot/conflict_metadata" },
      { id: "malformed_context:014", value: { ...base, contextSnapshot: { ...context, context: { ...context.context, market: { ...context.context.market, completeness: "complete", qqq_direction: { state: "unavailable", value: null } } } } }, status: "blocked_invalid_provenance", code: "invalid_provenance", path: "/contextSnapshot/context/market/completeness" },
      { id: "mapper:invalid_outcome", value: { ...base, outcome: { ...base.outcome, status: "magic" } }, status: "blocked_invalid_outcome", code: "invalid_outcome", path: "/outcome/status" },
      { id: "malformed:010", value: { ...base, outcome: { ...base.outcome, best_r: Number.NaN } }, status: "blocked_invalid_outcome", code: "invalid_outcome", path: "/outcome/best_r" },
      { id: "malformed:007", value: { ...base, outcome: { ...base.outcome, evaluated_at: "2026-07-08T13:44:00.000Z" } }, status: "blocked_temporal_violation", code: "temporal_violation", path: "/outcome/evaluated_at" },
      { id: "malformed:014", value: input({ id: "", payload_json: { ...payloadOf(snapshot()), dataset_row_id_expression: "generated_random_uuid" } }), status: "blocked_missing_required_identity", code: "missing_required_identity", path: "/recommendationSnapshot/id" },
    ];
    for (const row of cases) {
      const first = mapSnapshotToLearningDataset(row.value as SnapshotToLearningDatasetMapperInput);
      const second = mapSnapshotToLearningDataset(row.value as SnapshotToLearningDatasetMapperInput);
      expect(first.status, row.id).toBe(row.status);
      expect(primary(first)?.code, row.id).toBe(row.code);
      expect(primary(first)?.path, row.id).toBe(row.path);
      expect(first, row.id).toEqual(second);
      expect(first.row, row.id).toBeNull();
    }
  });

  test("peer group and deferred capabilities remain absent", () => {
    const result = mapSnapshotToLearningDataset(input());
    expect(JSON.stringify(result)).not.toContain("peer_group");
    expect(result.row).not.toHaveProperty("peer_group");
    const source = readFileSync("lib/snapshot-to-learning-dataset-mapper.ts", "utf8");
    for (const marker of ["patternDiscovery", "confidenceCalibration", "providerLineage", "persist", "upsert", "insert("]) {
      expect(source).not.toContain(marker);
    }
  });

  test("there are no mapper consumers or runtime integrations", () => {
    const consumers = files("app")
      .filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path))
      .filter((path) => readFileSync(path, "utf8").includes("snapshot-to-learning-dataset-mapper"));
    expect(consumers).toEqual([]);
  });

  test("Action 389 verifier reports the independently discovered blocked decision", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit-verify.mjs"], { encoding: "utf8" }));
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("blocked");
    expect(report.passed_conditions_count).toBeGreaterThan(0);
    expect(report.failed_conditions_count).toBe(7);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("Actions 380 381 387 and 388 remain healthy", () => {
    for (const path of [
      "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
      "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs",
      "scripts/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate-verify.mjs",
      "scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs",
    ]) {
      expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    }
  });
});
