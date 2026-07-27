import { expect, test } from "@playwright/test";

import {
  action666aCutoffDriftPair,
  action666aEvaluatorProviderDriftPair,
  action666aIncompleteNoTradePair,
  action666aMembershipDriftPair,
  action666aReorderedPair,
  action666aScoreAsProbabilityPair,
  action666aValidPair,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation-fixtures";
import {
  deriveCanonicalShadowVersionDifferenceSet,
  evaluateCanonicalShadowRankingConfidencePair,
  type CanonicalShadowEvaluation,
  type CanonicalShadowEvaluationResult,
  type CanonicalShadowPairComparisonInput,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  adaptCompletedPairedShadowObservationBundle,
  completedPairedShadowObservationInputDigest,
  type CompletedPairedShadowObservationBundle,
} from "@/lib/server/completed-paired-shadow-observation-adapter";
import {
  action666bCompleteMappedBundle,
  action666bCompleteNoTradeBundle,
  action666bTrustedFixtureAnchor,
  action666bTrustedFixtureRegistry,
} from "@/lib/server/completed-paired-shadow-observation-adapter-fixtures";
import {
  createDefaultOffPairedShadowReplayHarness,
  type PairedShadowReplayHarnessResult,
} from "@/lib/server/default-off-paired-shadow-replay-harness";
import {
  buildTrustedPairedShadowFixtureRegistry,
  trustedPairedShadowFixtureAnchor,
  type TrustedPairedShadowFixtureAnchor,
  type TrustedPairedShadowFixtureRegistry,
} from "@/lib/server/trusted-paired-shadow-fixture-registry";

function evaluatedResult(
  input: CanonicalShadowPairComparisonInput = action666aValidPair,
) {
  const result = evaluateCanonicalShadowRankingConfidencePair(input);
  if (!result.evaluation) {
    throw new Error(result.reason_codes.join(","));
  }
  return result;
}

function mappedInput(bundle: CompletedPairedShadowObservationBundle) {
  const adapted = adaptCompletedPairedShadowObservationBundle(bundle);
  if (adapted.status !== "mapped" || !adapted.comparison_input) {
    throw new Error(adapted.reason_codes.join(","));
  }
  return adapted.comparison_input;
}

function replayWith(
  bundle: CompletedPairedShadowObservationBundle,
  evaluate: (
    input: CanonicalShadowPairComparisonInput,
  ) => CanonicalShadowEvaluationResult,
  registry: TrustedPairedShadowFixtureRegistry =
    action666bTrustedFixtureRegistry,
  anchor: TrustedPairedShadowFixtureAnchor =
    action666bTrustedFixtureAnchor,
): PairedShadowReplayHarnessResult {
  return createDefaultOffPairedShadowReplayHarness({
    enabled: true,
    trusted_fixture_registry: registry,
    trust_anchor: anchor,
    dependencies: {
      adapt: adaptCompletedPairedShadowObservationBundle,
      evaluate,
    },
  }).run(bundle);
}

function tamperedEvaluation(
  input: CanonicalShadowPairComparisonInput,
  mutate: (evaluation: CanonicalShadowEvaluation) => void,
) {
  const result = structuredClone(evaluatedResult(input));
  if (!result.evaluation) throw new Error("evaluation_missing");
  mutate(result.evaluation);
  return result;
}

test.describe("Action 666D shadow provenance and trust remediation", () => {
  test("full version tuples and exact difference set bind every digest", () => {
    const result = evaluatedResult();
    const evidence = result.evaluation.pairing_evidence;
    const derived = deriveCanonicalShadowVersionDifferenceSet({
      baseline: action666aValidPair.baseline.versions,
      candidate: action666aValidPair.candidate.versions,
    });

    expect(evidence.version_difference_set).toEqual(derived);
    expect(evidence.version_difference_set.differences).toEqual([
      "confidence_contract_version",
      "ranking_version",
      "scoring_version",
      "threshold_policy_version",
    ]);
    expect(evidence.baseline_version_tuple.semantic_digest).toMatch(
      /^[0-9a-f]{64}$/,
    );
    expect(evidence.candidate_version_tuple.semantic_digest).toMatch(
      /^[0-9a-f]{64}$/,
    );
    expect(evidence.version_difference_set.semantic_digest).toMatch(
      /^[0-9a-f]{64}$/,
    );
    expect(evidence.pair_semantic_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(result.evaluation.semantic_digest).toMatch(/^[0-9a-f]{64}$/);
    expect(result.evaluation.evaluation_digest).toMatch(/^[0-9a-f]{64}$/);
  });

  test("a version-only change changes provenance, pair and evaluation digests", () => {
    const baseline = evaluatedResult();
    const changedInput = structuredClone(action666aValidPair);
    changedInput.candidate.versions.ranking_version =
      "ranking-candidate-v2-same-order";
    const changed = evaluatedResult(changedInput);

    expect(
      changed.evaluation.pairing_evidence.candidate_version_tuple
        .semantic_digest,
    ).not.toBe(
      baseline.evaluation.pairing_evidence.candidate_version_tuple
        .semantic_digest,
    );
    expect(
      changed.evaluation.pairing_evidence.pair_semantic_digest,
    ).not.toBe(baseline.evaluation.pairing_evidence.pair_semantic_digest);
    expect(changed.evaluation.semantic_digest).not.toBe(
      baseline.evaluation.semantic_digest,
    );
    expect(changed.evaluation.evaluation_digest).not.toBe(
      baseline.evaluation.evaluation_digest,
    );
  });

  test("missing, undeclared, superfluous and mixed versions fail closed", () => {
    const missing = structuredClone(action666aValidPair);
    missing.candidate.versions.provider_contract_version = "";
    expect(evaluateCanonicalShadowRankingConfidencePair(missing)).toMatchObject(
      {
        status: "conflicting",
        evaluation: null,
        reason_codes: expect.arrayContaining([
          "candidate_algorithm_versions_incomplete",
          "candidate_arm_evaluator_or_provider_version_mixed",
        ]),
      },
    );

    const undeclared = structuredClone(action666aValidPair);
    undeclared.candidate.versions.setup_taxonomy_version =
      "setup-taxonomy-candidate-v2";
    expect(
      evaluateCanonicalShadowRankingConfidencePair(undeclared),
    ).toMatchObject({
      status: "not_comparable",
      evaluation: null,
      reason_codes: expect.arrayContaining([
        "declared_version_difference_set_mismatch",
        "undeclared_setup_taxonomy_version_difference",
      ]),
    });

    const superfluous = structuredClone(action666aValidPair);
    superfluous.declared_version_differences.push(
      "setup_taxonomy_version",
    );
    expect(
      evaluateCanonicalShadowRankingConfidencePair(superfluous),
    ).toMatchObject({
      status: "not_comparable",
      evaluation: null,
      reason_codes: expect.arrayContaining([
        "declared_version_difference_set_mismatch",
        "declared_setup_taxonomy_version_without_difference",
      ]),
    });
  });

  test("probability semantics remain distinct from score, tier and label", () => {
    const result = evaluateCanonicalShadowRankingConfidencePair(
      action666aScoreAsProbabilityPair,
    );
    expect(result.status).toBe("probability_semantics_missing");
    if (!result.evaluation) throw new Error(result.reason_codes.join(","));
    expect(
      result.evaluation.baseline.calibration.metrics.brier_score.value,
    ).toBeNull();
    expect(result.reason_codes).toContain(
      "paired_probability_semantics_incomplete",
    );
  });

  test("trusted fixture registry accepts only the anchored frozen bytes", () => {
    const valid = replayWith(
      action666bCompleteMappedBundle,
      evaluateCanonicalShadowRankingConfidencePair,
    );
    expect(valid).toMatchObject({
      status: "evaluated",
      input_digest_verified: true,
      evaluation_result_verified: true,
    });

    const changed = structuredClone(action666bCompleteMappedBundle);
    changed.candidate.ranking[0].score += 0.01;
    changed.input_digest =
      completedPairedShadowObservationInputDigest(changed);
    const rejected = replayWith(
      changed,
      evaluateCanonicalShadowRankingConfidencePair,
    );
    expect(rejected).toMatchObject({
      status: "rejected",
      adapter_executed: false,
      evaluation_executed: false,
      reason_codes: expect.arrayContaining([
        "trusted_fixture_bundle_digest_mismatch",
      ]),
    });
  });

  test("unknown fixture, changed manifest and wrong trust root fail closed", () => {
    const unknown = structuredClone(action666bCompleteMappedBundle);
    unknown.fixture_identity = "action-666d:unknown-fixture";
    unknown.input_digest =
      completedPairedShadowObservationInputDigest(unknown);
    expect(
      replayWith(unknown, evaluateCanonicalShadowRankingConfidencePair),
    ).toMatchObject({
      status: "rejected",
      reason_codes: expect.arrayContaining([
        "trusted_fixture_unknown_or_ambiguous",
      ]),
    });

    const changedRegistry = structuredClone(
      action666bTrustedFixtureRegistry,
    );
    changedRegistry.entries[0].bundle_digest = "a".repeat(64);
    expect(
      replayWith(
        action666bCompleteMappedBundle,
        evaluateCanonicalShadowRankingConfidencePair,
        changedRegistry,
      ),
    ).toMatchObject({
      status: "rejected",
      reason_codes: expect.arrayContaining([
        "trusted_fixture_registry_entry_invalid",
        "trusted_fixture_registry_root_invalid",
      ]),
    });

    const replacementBundle = structuredClone(
      action666bCompleteMappedBundle,
    );
    replacementBundle.candidate.ranking[0].score += 0.02;
    replacementBundle.input_digest =
      completedPairedShadowObservationInputDigest(replacementBundle);
    const replacementRegistry =
      buildTrustedPairedShadowFixtureRegistry([replacementBundle]);
    const replacementAnchor =
      trustedPairedShadowFixtureAnchor(replacementRegistry);
    expect(replacementAnchor.expected_root_digest).not.toBe(
      action666bTrustedFixtureAnchor.expected_root_digest,
    );
    expect(
      replayWith(
        replacementBundle,
        evaluateCanonicalShadowRankingConfidencePair,
        replacementRegistry,
        action666bTrustedFixtureAnchor,
      ),
    ).toMatchObject({
      status: "rejected",
      reason_codes: expect.arrayContaining([
        "trusted_fixture_anchor_mismatch",
      ]),
    });
  });

  test("dependency-injected pair, semantic and evaluation digest tampering is rejected", () => {
    const mutations: Array<
      [string, (evaluation: CanonicalShadowEvaluation) => void]
    > = [
      [
        "pair",
        (evaluation) => {
          evaluation.pairing_evidence.pair_semantic_digest =
            "a".repeat(64);
        },
      ],
      [
        "semantic",
        (evaluation) => {
          evaluation.semantic_digest = "b".repeat(64);
        },
      ],
      [
        "evaluation",
        (evaluation) => {
          evaluation.evaluation_digest = "c".repeat(64);
        },
      ],
    ];
    for (const [name, mutate] of mutations) {
      const replay = replayWith(
        action666bCompleteMappedBundle,
        (input) => tamperedEvaluation(input, mutate),
      );
      expect(replay.status, name).toBe("rejected");
      expect(replay).toMatchObject({
        evaluation_executed: true,
        evaluation_result_verified: false,
        evaluation_result: null,
        replay_digest: null,
      });
    }
  });

  test("arm identities, version tuple, difference set and metrics tampering is rejected", () => {
    const mutations: Array<
      [string, (evaluation: CanonicalShadowEvaluation) => void]
    > = [
      [
        "baseline identity",
        (evaluation) => {
          evaluation.pairing_evidence.baseline_arm_identity =
            "shadow-arm:tampered";
        },
      ],
      [
        "candidate identity",
        (evaluation) => {
          evaluation.pairing_evidence.candidate_arm_identity =
            "shadow-arm:tampered";
        },
      ],
      [
        "version tuple",
        (evaluation) => {
          evaluation.pairing_evidence.candidate_version_tuple.ranking_version =
            "ranking-spoofed";
        },
      ],
      [
        "difference set",
        (evaluation) => {
          evaluation.pairing_evidence.version_difference_set.differences = [];
        },
      ],
      [
        "metrics",
        (evaluation) => {
          evaluation.candidate.ranking.precision_at_k["1"].value = 0;
        },
      ],
    ];
    for (const [name, mutate] of mutations) {
      expect(
        replayWith(
          action666bCompleteMappedBundle,
          (input) => tamperedEvaluation(input, mutate),
        ).status,
        name,
      ).toBe("rejected");
    }
  });

  test("no-trade and counterfactual evidence tampering is rejected", () => {
    const replay = replayWith(
      action666bCompleteNoTradeBundle,
      (input) =>
        tamperedEvaluation(input, (evaluation) => {
          evaluation.candidate.threshold_sweep[0].projected_no_trade =
            !evaluation.candidate.threshold_sweep[0].projected_no_trade;
          evaluation.candidate.threshold_sweep[0]
            .no_trade_counterfactual_evaluable = false;
        }),
    );
    expect(replay).toMatchObject({
      status: "rejected",
      evaluation_executed: true,
      evaluation_result_verified: false,
      replay_digest: null,
      reason_codes: expect.arrayContaining([
        "evaluation_result_payload_mismatch",
      ]),
    });
  });

  test("self-consistent alternate internal digests cannot replace canonical result", () => {
    const replay = replayWith(
      action666bCompleteMappedBundle,
      (input) => {
        const changed = structuredClone(input);
        changed.candidate.versions.ranking_version =
          "ranking-self-consistent-attack";
        return evaluateCanonicalShadowRankingConfidencePair(changed);
      },
    );
    expect(replay).toMatchObject({
      status: "rejected",
      evaluation_executed: true,
      evaluation_result_verified: false,
      replay_digest: null,
      reason_codes: expect.arrayContaining([
        "evaluation_pair_identity_mismatch",
        "evaluation_pair_digest_mismatch",
        "evaluation_version_provenance_mismatch",
      ]),
    });
  });

  test("baseline/candidate reversal and adjacent pairing drift fail closed", () => {
    const reversed = structuredClone(action666aValidPair);
    const baseline = reversed.baseline;
    reversed.baseline = reversed.candidate;
    reversed.candidate = baseline;
    expect(
      evaluateCanonicalShadowRankingConfidencePair(reversed),
    ).toMatchObject({
      status: "conflicting",
      evaluation: null,
      reason_codes: ["comparison_arm_roles_invalid"],
    });
    expect(
      evaluateCanonicalShadowRankingConfidencePair(
        action666aMembershipDriftPair,
      ).status,
    ).toBe("not_comparable");
    expect(
      evaluateCanonicalShadowRankingConfidencePair(
        action666aCutoffDriftPair,
      ).status,
    ).toBe("not_comparable");
    expect(
      evaluateCanonicalShadowRankingConfidencePair(
        action666aEvaluatorProviderDriftPair,
      ).status,
    ).toBe("not_comparable");
    expect(
      evaluateCanonicalShadowRankingConfidencePair(
        action666aIncompleteNoTradePair,
      ).status,
    ).toBe("insufficient_evidence");
  });

  test("default-off performs no trust, adapter, evaluation or replay work", () => {
    let adapterCalls = 0;
    let evaluationCalls = 0;
    const harness = createDefaultOffPairedShadowReplayHarness({
      dependencies: {
        adapt(bundle) {
          adapterCalls += 1;
          return adaptCompletedPairedShadowObservationBundle(bundle);
        },
        evaluate(input) {
          evaluationCalls += 1;
          return evaluateCanonicalShadowRankingConfidencePair(input);
        },
      },
    });
    const result = harness.run(action666bCompleteMappedBundle);
    expect(result).toEqual({
      harness_version: "default_off_paired_shadow_replay_harness_v1",
      status: "disabled",
      synthetic_fixture_only: true,
      offline_shadow_only: true,
      adapter_executed: false,
      evaluation_executed: false,
      input_digest_verified: false,
      input_digest: null,
      adapter_status: null,
      evaluation_status: null,
      evaluation_result: null,
      evaluation_result_verified: false,
      replay_digest: null,
      reason_codes: ["paired_shadow_replay_disabled"],
    });
    expect(adapterCalls).toBe(0);
    expect(evaluationCalls).toBe(0);
  });

  test("retry and input ordering are byte-identical and deeply immutable", () => {
    const input = mappedInput(action666bCompleteMappedBundle);
    const first = evaluatedResult(input);
    const second = evaluatedResult(action666aReorderedPair);

    expect(JSON.stringify(second)).toBe(
      JSON.stringify(evaluatedResult(action666aValidPair)),
    );
    expect(Object.isFrozen(first.evaluation)).toBe(true);
    expect(Object.isFrozen(first.evaluation.pairing_evidence)).toBe(true);
    expect(
      Object.isFrozen(
        first.evaluation.pairing_evidence.version_difference_set,
      ),
    ).toBe(true);
  });
});
