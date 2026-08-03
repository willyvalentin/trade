import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  adaptCompletedPairedShadowObservationBundle,
  completedPairedShadowObservationInputDigest,
} from "@/lib/server/completed-paired-shadow-observation-adapter";
import {
  action666bAdapterFixtureCases,
  action666bCompleteMappedBundle,
  action666bCompleteNoTradeBundle,
  action666bDuplicateTieBreakBundle,
  action666bDuplicatedOutcomeBundle,
  action666bMissingRejectedOutcomeBundle,
  action666bNoTradeWithoutCoverageBundle,
  action666bRankGapBundle,
  action666bReorderedBundle,
  action666bScoreAsProbabilityBundle,
  action666bTamperedInputDigestBundle,
  action666bTrustedFixtureAnchor,
  action666bTrustedFixtureRegistry,
  action666bTruncatedMembershipBundle,
} from "@/lib/server/completed-paired-shadow-observation-adapter-fixtures";
import {
  createDefaultOffPairedShadowReplayHarness,
  DEFAULT_OFF_PAIRED_SHADOW_REPLAY_ENABLED,
} from "@/lib/server/default-off-paired-shadow-replay-harness";

test.describe("Action 666B completed paired shadow adapter and replay", () => {
  test("fixture matrix returns only mapped, conflicting or unmappable", () => {
    for (const fixture of action666bAdapterFixtureCases) {
      const result = adaptCompletedPairedShadowObservationBundle(
        fixture.bundle,
      );
      expect(result.status, fixture.name).toBe(fixture.expected_status);
      expect(["mapped", "conflicting", "unmappable"]).toContain(
        result.status,
      );
      expect(result.offline_shadow_only).toBe(true);
    }
  });

  test("mapped output is exact in-memory Action 666A input", () => {
    const result = adaptCompletedPairedShadowObservationBundle(
      action666bCompleteMappedBundle,
    );
    expect(result.status).toBe("mapped");
    if (result.status !== "mapped") {
      throw new Error(result.reason_codes.join(","));
    }

    expect(result.input_digest).toBe(
      action666bCompleteMappedBundle.input_digest,
    );
    expect(result.comparison_input.baseline.candidates).toHaveLength(10);
    expect(result.comparison_input.candidate.candidates).toHaveLength(10);
    expect(
      result.comparison_input.baseline.opportunity_set
        .full_candidate_set_digest,
    ).toBe(
      result.comparison_input.candidate.opportunity_set
        .full_candidate_set_digest,
    );
    expect(Object.isFrozen(result.comparison_input)).toBe(true);
    expect(Object.isFrozen(result.comparison_input.candidate.candidates)).toBe(
      true,
    );
  });

  test("truncation, rank gaps and duplicate tie-breaks fail closed", () => {
    expect(
      adaptCompletedPairedShadowObservationBundle(
        action666bTruncatedMembershipBundle,
      ),
    ).toMatchObject({
      status: "unmappable",
      reason_codes: expect.arrayContaining([
        "full_candidate_membership_missing",
        "pre_truncation_membership_not_complete",
      ]),
    });
    expect(
      adaptCompletedPairedShadowObservationBundle(action666bRankGapBundle),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining(["ranking_rank_gap"]),
    });
    expect(
      adaptCompletedPairedShadowObservationBundle(
        action666bDuplicateTieBreakBundle,
      ),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "ranking_tie_break_duplicate",
      ]),
    });
  });

  test("outcome inventory is joinable, unique and complete", () => {
    expect(
      adaptCompletedPairedShadowObservationBundle(
        action666bMissingRejectedOutcomeBundle,
      ),
    ).toMatchObject({
      status: "unmappable",
      reason_codes: expect.arrayContaining([
        "candidate_outcome_missing",
        "outcome_inventory_membership_incomplete",
      ]),
    });
    expect(
      adaptCompletedPairedShadowObservationBundle(
        action666bDuplicatedOutcomeBundle,
      ),
    ).toMatchObject({
      status: "conflicting",
      reason_codes: expect.arrayContaining([
        "outcome_inventory_duplicate",
      ]),
    });
  });

  test("explicit no-trade requires complete counterfactual coverage", () => {
    const complete = adaptCompletedPairedShadowObservationBundle(
      action666bCompleteNoTradeBundle,
    );
    expect(complete.status).toBe("mapped");
    if (complete.status !== "mapped") {
      throw new Error(complete.reason_codes.join(","));
    }
    expect(
      complete.comparison_input.baseline.pairing_binding.sample_type,
    ).toBe("no_trade");
    expect(
      complete.comparison_input.baseline.opportunity_set
        .decision_semantic_binding.no_trade_semantics
        ?.producer_decision_id,
    ).toBe(action666bCompleteNoTradeBundle.producer_decision_identity);

    expect(
      adaptCompletedPairedShadowObservationBundle(
        action666bNoTradeWithoutCoverageBundle,
      ),
    ).toMatchObject({
      status: "unmappable",
      reason_codes: expect.arrayContaining(["coverage_evidence_missing"]),
    });
  });

  test("score is never promoted to a calibrated probability", () => {
    const adapter = adaptCompletedPairedShadowObservationBundle(
      action666bScoreAsProbabilityBundle,
    );
    expect(adapter.status).toBe("mapped");

    const replay = createDefaultOffPairedShadowReplayHarness({
      enabled: true,
      trusted_fixture_registry: action666bTrustedFixtureRegistry,
      trust_anchor: action666bTrustedFixtureAnchor,
    }).run(action666bScoreAsProbabilityBundle);
    expect(replay).toMatchObject({
      status: "evaluated",
      evaluation_status: "probability_semantics_missing",
      synthetic_fixture_only: true,
      offline_shadow_only: true,
    });
    if (replay.status !== "evaluated" || !replay.evaluation_result.evaluation) {
      throw new Error(replay.reason_codes.join(","));
    }
    expect(
      replay.evaluation_result.evaluation.baseline.calibration.metrics
        .brier_score.value,
    ).toBeNull();
  });

  test("default-off returns before adapter or evaluation execution", () => {
    let adapterCalls = 0;
    let evaluationCalls = 0;
    const harness = createDefaultOffPairedShadowReplayHarness({
      dependencies: {
        adapt(bundle) {
          adapterCalls += 1;
          return adaptCompletedPairedShadowObservationBundle(bundle);
        },
        evaluate() {
          evaluationCalls += 1;
          throw new Error("evaluation must remain unreachable");
        },
      },
    });

    expect(DEFAULT_OFF_PAIRED_SHADOW_REPLAY_ENABLED).toBe(false);
    expect(harness.enabled).toBe(false);
    expect(harness.run(action666bCompleteMappedBundle)).toMatchObject({
      status: "disabled",
      adapter_executed: false,
      evaluation_executed: false,
      input_digest_verified: false,
      synthetic_fixture_only: true,
      offline_shadow_only: true,
      reason_codes: ["paired_shadow_replay_disabled"],
    });
    expect(adapterCalls).toBe(0);
    expect(evaluationCalls).toBe(0);
  });

  test("enabled fixture replay verifies digest before adapter execution", () => {
    let adapterCalls = 0;
    const harness = createDefaultOffPairedShadowReplayHarness({
      enabled: true,
      trusted_fixture_registry: action666bTrustedFixtureRegistry,
      trust_anchor: action666bTrustedFixtureAnchor,
      dependencies: {
        adapt(bundle) {
          adapterCalls += 1;
          return adaptCompletedPairedShadowObservationBundle(bundle);
        },
        evaluate() {
          throw new Error("evaluation must remain unreachable");
        },
      },
    });

    expect(harness.run(action666bTamperedInputDigestBundle)).toMatchObject({
      status: "rejected",
      adapter_executed: false,
      evaluation_executed: false,
      input_digest_verified: false,
      reason_codes: expect.arrayContaining([
        "trusted_fixture_bundle_digest_mismatch",
      ]),
    });
    expect(adapterCalls).toBe(0);
  });

  test("enabled replay is byte-identical, immutable and explicitly offline", () => {
    const inputBefore = JSON.stringify(action666bCompleteMappedBundle);
    const harness = createDefaultOffPairedShadowReplayHarness({
      enabled: true,
      trusted_fixture_registry: action666bTrustedFixtureRegistry,
      trust_anchor: action666bTrustedFixtureAnchor,
    });
    const first = harness.run(action666bCompleteMappedBundle);
    const second = harness.run(
      structuredClone(action666bCompleteMappedBundle),
    );

    expect(first.status).toBe("evaluated");
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(JSON.stringify(action666bCompleteMappedBundle)).toBe(inputBefore);
    expect(first).toMatchObject({
      synthetic_fixture_only: true,
      offline_shadow_only: true,
      adapter_executed: true,
      evaluation_executed: true,
      input_digest_verified: true,
      adapter_status: "mapped",
    });
    expect(first.replay_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(Object.isFrozen(first)).toBe(true);
    if (first.status !== "evaluated") {
      throw new Error(first.reason_codes.join(","));
    }
    expect(Object.isFrozen(first.evaluation_result)).toBe(true);
    expect(first.evaluation_result).toMatchObject({
      shadow_only: true,
      live_ranking_effect: false,
      causal_improvement_claimed: false,
    });
  });

  test("input order does not affect input or replay digest", () => {
    expect(
      completedPairedShadowObservationInputDigest(
        action666bReorderedBundle,
      ),
    ).toBe(action666bCompleteMappedBundle.input_digest);

    const harness = createDefaultOffPairedShadowReplayHarness({
      enabled: true,
      trusted_fixture_registry: action666bTrustedFixtureRegistry,
      trust_anchor: action666bTrustedFixtureAnchor,
    });
    const ordered = harness.run(action666bCompleteMappedBundle);
    const reordered = harness.run(action666bReorderedBundle);
    expect(JSON.stringify(reordered)).toBe(JSON.stringify(ordered));
  });

  test("machine-readable coverage report matches all fixtures", () => {
    const report = JSON.parse(
      readFileSync(
        path.join(
          process.cwd(),
          "docs",
          "action-666b-fixture-coverage-report.json",
        ),
        "utf8",
      ),
    ) as {
      fixture_count: number;
      adapter_status_counts: Record<string, number>;
      adapter_status_by_scenario_class: Record<
        string,
        Record<string, number>
      >;
      reference_digests: {
        complete_mapped_bundle_input: string;
        same_bundle_reordered_input: string;
        complete_explicit_no_trade_input: string;
        complete_mapped_replay_result: string;
      };
      scenarios: Array<{
        name: string;
        scenario_class: string;
        expected_status: string;
      }>;
      synthetic_fixture_only: boolean;
      performance_claimed: boolean;
    };
    const counts = Object.fromEntries(
      ["mapped", "conflicting", "unmappable"].map((status) => [
        status,
        action666bAdapterFixtureCases.filter(
          (fixture) => fixture.expected_status === status,
        ).length,
      ]),
    );

    expect(report.fixture_count).toBe(action666bAdapterFixtureCases.length);
    expect(report.adapter_status_counts).toEqual(counts);
    const classes = Array.from(
      new Set(
        action666bAdapterFixtureCases.map(
          (fixture) => fixture.scenario_class,
        ),
      ),
    );
    expect(report.adapter_status_by_scenario_class).toEqual(
      Object.fromEntries(
        classes.map((scenarioClass) => [
          scenarioClass,
          Object.fromEntries(
            ["mapped", "conflicting", "unmappable"].map((status) => [
              status,
              action666bAdapterFixtureCases.filter(
                (fixture) =>
                  fixture.scenario_class === scenarioClass &&
                  fixture.expected_status === status,
              ).length,
            ]),
          ),
        ]),
      ),
    );
    expect(report.scenarios).toEqual(
      action666bAdapterFixtureCases.map(
        ({ name, scenario_class, expected_status }) => ({
          name,
          scenario_class,
          expected_status,
        }),
      ),
    );
    const replay = createDefaultOffPairedShadowReplayHarness({
      enabled: true,
      trusted_fixture_registry: action666bTrustedFixtureRegistry,
      trust_anchor: action666bTrustedFixtureAnchor,
    }).run(action666bCompleteMappedBundle);
    expect(report.reference_digests).toEqual({
      complete_mapped_bundle_input:
        action666bCompleteMappedBundle.input_digest,
      same_bundle_reordered_input: action666bReorderedBundle.input_digest,
      complete_explicit_no_trade_input:
        action666bCompleteNoTradeBundle.input_digest,
      complete_mapped_replay_result: replay.replay_digest,
    });
    expect(report.synthetic_fixture_only).toBe(true);
    expect(report.performance_claimed).toBe(false);
  });
});
