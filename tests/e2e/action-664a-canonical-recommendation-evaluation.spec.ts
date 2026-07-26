import { expect, test } from "@playwright/test";

import {
  applyCanonicalCandleCutoff,
  buildCanonicalRecommendationDecision,
  buildCanonicalRecommendationIdentity,
  canonicalSampleTypes,
  classifyCanonicalCoverage,
  classifyCanonicalOutcome,
  selectCanonicalPrimaryOutcome,
  validateCanonicalConfidence,
  validateCanonicalEvaluationVersions,
  validateCanonicalSampleType,
} from "../../lib/canonical-recommendation-evaluation";
import {
  action664aGoldenConfidence,
  action664aGoldenIdentity,
  action664aGoldenSampleTypes,
  action664aGoldenVersions,
  action664aHorizonFallbackFixture,
  action664aHorizonPriorityFixture,
  action664aLeakageCutoffFixture,
  action664aNoEntryFixture,
  action664aProviderGapFixture,
  action664aSameCandleFixture,
  action664aStaleFixture,
} from "../../lib/canonical-recommendation-evaluation-fixtures";

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

test.describe("Action 664A canonical recommendation evaluation contract", () => {
  test("canonical identity is stable and identifies one producer decision", () => {
    const first = buildCanonicalRecommendationIdentity(action664aGoldenIdentity);
    const second = buildCanonicalRecommendationIdentity(
      clone(action664aGoldenIdentity),
    );

    expect(first).toEqual(second);
    expect(first).toEqual({
      ok: true,
      value: {
        contract_version: "canonical_recommendation_identity_v1",
        value:
          "rec_decision:v1:recommendation_snapshot:golden%3Adecision%3A001:1783517520000",
        source_namespace: "recommendation_snapshot",
        decision_id: "golden:decision:001",
        decided_at: "2026-07-08T13:32:00.000Z",
      },
    });
  });

  test("identity rejects implicit timezone and noncanonical namespace", () => {
    expect(
      buildCanonicalRecommendationIdentity({
        ...action664aGoldenIdentity,
        decided_at: "2026-07-08T13:32:00",
      }),
    ).toEqual({ ok: false, errors: ["invalid_decided_at"] });
    expect(
      buildCanonicalRecommendationIdentity({
        ...action664aGoldenIdentity,
        source_namespace: "Recommendation Snapshot",
      }),
    ).toEqual({ ok: false, errors: ["invalid_source_namespace"] });
  });

  test("sample types are exclusive canonical scalar values without aliases", () => {
    expect(action664aGoldenSampleTypes).toEqual(canonicalSampleTypes);

    for (const sampleType of action664aGoldenSampleTypes) {
      expect(validateCanonicalSampleType(sampleType)).toEqual({
        ok: true,
        value: sampleType,
      });
    }

    for (const invalid of [
      "research",
      "learning_only",
      "official",
      ["visible", "shadow"],
      null,
    ]) {
      expect(validateCanonicalSampleType(invalid)).toEqual({
        ok: false,
        errors: ["invalid_or_nonexclusive_sample_type"],
      });
    }
  });

  test("numeric confidence is a probability and remains separate from label", () => {
    expect(validateCanonicalConfidence(action664aGoldenConfidence)).toEqual({
      ok: true,
      value: action664aGoldenConfidence,
    });
    expect(
      validateCanonicalConfidence({
        numeric_confidence: 72,
        numeric_confidence_scale: "probability_0_1",
        confidence_label: "medium",
      }),
    ).toEqual({
      ok: false,
      errors: ["numeric_confidence_must_be_probability_0_1_or_null"],
    });
  });

  test("full decision contract requires identity, sample, versions, and confidence", () => {
    const result = buildCanonicalRecommendationDecision({
      identity: action664aGoldenIdentity,
      sample_type: "visible",
      versions: action664aGoldenVersions,
      confidence: action664aGoldenConfidence,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sample_type).toBe("visible");
    expect(result.value.versions.evaluator_version).toBe(
      "canonical_outcome_evaluator_v1",
    );
    expect(result.value.confidence.numeric_confidence).toBe(0.72);
    expect(result.value.confidence.confidence_label).toBe("medium");
  });

  test("version metadata rejects missing identities and abbreviated commits", () => {
    expect(
      validateCanonicalEvaluationVersions({
        ...action664aGoldenVersions,
        ranking_version: "",
        git_commit: "f578dd5",
      }),
    ).toEqual({
      ok: false,
      errors: ["invalid_ranking_version", "invalid_git_commit"],
    });
  });

  test("coverage classification is deterministic with explicit precedence", () => {
    expect(
      classifyCanonicalCoverage({
        provider_status: "available",
        freshness: "fresh",
        expected_candle_count: 2,
        observed_candle_count: 2,
        plan_complete: true,
      }),
    ).toEqual({
      status: "complete",
      expected_candle_count: 2,
      observed_candle_count: 2,
      reason_codes: [],
    });
    expect(
      classifyCanonicalCoverage({
        provider_status: "gap",
        freshness: "stale",
        expected_candle_count: 2,
        observed_candle_count: 0,
        plan_complete: true,
      }).status,
    ).toBe("provider_gap");
  });

  test("primary horizon is deterministically 60m then 30m then 15m", () => {
    const allComplete = selectCanonicalPrimaryOutcome(
      action664aHorizonPriorityFixture,
    );
    const fallback = selectCanonicalPrimaryOutcome(
      action664aHorizonFallbackFixture,
    );

    expect(allComplete.primary_horizon).toBe("60m");
    expect(allComplete.primary_outcome?.outcome).toBe("60m-result");
    expect(fallback.primary_horizon).toBe("30m");
    expect(fallback.primary_outcome?.outcome).toBe("30m-result");
  });

  test("one recommendation produces exactly one canonical outcome without horizon inflation", () => {
    const selected = selectCanonicalPrimaryOutcome(
      action664aHorizonPriorityFixture,
    );

    expect(selected.canonical_outcome_count).toBe(1);
    expect(selected.diagnostic_outcomes).toHaveLength(2);
    expect(
      selected.diagnostic_outcomes.map((item) => item.horizon),
    ).toEqual(["30m", "15m"]);
  });

  test("duplicate horizon rows fail closed instead of selecting arbitrarily", () => {
    const selected = selectCanonicalPrimaryOutcome([
      ...action664aHorizonPriorityFixture,
      action664aHorizonPriorityFixture[0],
    ]);

    expect(selected.status).toBe("incomplete");
    expect(selected.canonical_outcome_count).toBe(0);
    expect(selected.reason_codes).toContain("duplicate_15m_outcome");
  });

  test("no complete supported horizon is explicitly incomplete", () => {
    const selected = selectCanonicalPrimaryOutcome(
      action664aHorizonPriorityFixture.map((item) => ({
        ...item,
        coverage: {
          ...item.coverage,
          status: "incomplete" as const,
          reason_codes: ["fixture_incomplete"],
        },
      })),
    );

    expect(selected).toMatchObject({
      status: "incomplete",
      primary_horizon: null,
      primary_outcome: null,
      canonical_outcome_count: 0,
      reason_codes: ["no_complete_supported_horizon"],
    });
  });

  test("overlapping first candle is excluded without pre-recommendation leakage", () => {
    const result = classifyCanonicalOutcome(action664aLeakageCutoffFixture);

    expect(result.candle_cutoff.pre_recommendation_or_overlapping_count).toBe(1);
    expect(result.candle_cutoff.eligible_candles).toHaveLength(1);
    expect(result.classification).toBe("neither");
    expect(result.reason_codes).not.toContain("target_touched_first");
  });

  test("candle exactly starting at recommendation time remains eligible", () => {
    const fixture = action664aSameCandleFixture;
    const cutoff = applyCanonicalCandleCutoff(
      fixture.candles,
      fixture.recommended_at,
    );

    expect(cutoff.excluded_candles).toHaveLength(0);
    expect(cutoff.eligible_candles).toHaveLength(1);
  });

  test("target and stop in the same candle are explicitly ambiguous", () => {
    const result = classifyCanonicalOutcome(action664aSameCandleFixture);

    expect(result.classification).toBe("ambiguous_same_candle");
    expect(result.reason_codes).toEqual([
      "target_and_stop_same_candle",
      "intrabar_sequence_unknown",
    ]);
  });

  test("separate terminal candles classify target-first and stop-first", () => {
    const targetFirst = classifyCanonicalOutcome({
      ...action664aSameCandleFixture,
      candles: [
        {
          start_at: "2026-07-08T13:30:00.000Z",
          end_at: "2026-07-08T13:35:00.000Z",
          open: 100,
          high: 104,
          low: 99,
          close: 103,
        },
      ],
    });
    const stopFirst = classifyCanonicalOutcome({
      ...action664aSameCandleFixture,
      candles: [
        {
          start_at: "2026-07-08T13:30:00.000Z",
          end_at: "2026-07-08T13:35:00.000Z",
          open: 100,
          high: 101,
          low: 98,
          close: 99,
        },
      ],
    });

    expect(targetFirst.classification).toBe("target_before_stop");
    expect(stopFirst.classification).toBe("stop_before_target");
  });

  test("complete coverage without an entry touch is canonical no-entry", () => {
    const result = classifyCanonicalOutcome(action664aNoEntryFixture);

    expect(result.coverage.status).toBe("complete");
    expect(result.classification).toBe("no_entry");
    expect(result.entry_triggered).toBe(false);
  });

  test("provider gap and stale inputs cannot become canonical terminal outcomes", () => {
    const providerGap = classifyCanonicalOutcome(
      action664aProviderGapFixture,
    );
    const stale = classifyCanonicalOutcome(action664aStaleFixture);

    expect(providerGap.coverage.status).toBe("provider_gap");
    expect(providerGap.classification).toBe("incomplete");
    expect(providerGap.coverage.reason_codes).toContain("provider_gap");
    expect(stale.coverage.status).toBe("stale");
    expect(stale.classification).toBe("incomplete");
    expect(stale.coverage.reason_codes).toContain("stale_data");
  });

  test("replay is deterministic and does not mutate frozen fixture inputs", () => {
    const frozen = deepFreeze(clone(action664aSameCandleFixture));
    const first = classifyCanonicalOutcome(frozen);
    const second = classifyCanonicalOutcome(frozen);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(frozen).toEqual(action664aSameCandleFixture);
  });
});
