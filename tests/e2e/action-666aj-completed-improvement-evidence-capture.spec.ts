import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666aj-golden-completed-improvement-capture-report.json";
import {
  action666ajCapturedRequest,
  action666ajCaptureIdentityCollisionLookup,
  action666ajEmptyCaptureBindingLookup,
  action666ajEmptyPreviousBindingLookup,
  action666ajGoldenScenarios,
  action666ajNoChangeAuthority,
  action666ajNoChangeRequest,
  action666ajReorderedRequest,
  action666ajStableAuthority,
} from "@/lib/server/canonical-completed-improvement-evidence-capture-fixtures";
import {
  CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_STATUSES,
  CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_VERSION,
  CANONICAL_COMPLETED_IMPROVEMENT_LOOKUP_OBSERVATION_VERSION,
  CANONICAL_COMPLETED_IMPROVEMENT_TERMINAL_RESULT_VERSION,
  DEFAULT_OFF_COMPLETED_IMPROVEMENT_CAPTURE_ENABLED,
  DEFAULT_OFF_COMPLETED_IMPROVEMENT_CAPTURE_KILL_SWITCH_ENGAGED,
  canonicalCompletedImprovementCaptureRequestDigest,
  createCanonicalCompletedImprovementCaptureAuthority,
  createCanonicalCompletedImprovementCaptureHarness,
  verifyCanonicalCompletedImprovementCaptureResult,
  type CanonicalCompletedImprovementCaptureAuthority,
  type CanonicalCompletedImprovementCaptureBindingLookup,
  type CanonicalCompletedImprovementCaptureCounters,
  type CanonicalCompletedImprovementCaptureRequest,
  type CanonicalCompletedImprovementCaptureResult,
  type CanonicalCompletedImprovementLookupObservation,
} from "@/lib/server/canonical-completed-improvement-evidence-capture";
import {
  action666acEmptyPreviousBindingLookup,
} from "@/lib/server/canonical-model-improvement-input-adapter-fixtures";
import {
  canonicalCompletedImprovementEvidenceBundleDigest,
  projectCanonicalCompletedImprovementEvidence,
} from "@/lib/server/canonical-model-improvement-input-adapter";
import {
  canonicalModelImprovementDigest,
  type CanonicalModelImprovementPreviousBindingLookup,
  type CanonicalModelImprovementTrustBoundary,
} from "@/lib/server/canonical-model-improvement-proposal";
import {
  action666vStableImprovementFixture,
} from "@/lib/server/canonical-model-improvement-proposal-fixtures";

function zeroCounters(): CanonicalCompletedImprovementCaptureCounters {
  return {
    request_reads: 0,
    clones: 0,
    authority_checks: 0,
    registry_lookups: 0,
    upstream_verifications: 0,
    previous_binding_reads: 0,
    capture_binding_reads: 0,
    lookup_observations_built: 0,
    bundle_constructions: 0,
    input_digests: 0,
  };
}

function captureHarness(
  authority: CanonicalCompletedImprovementCaptureAuthority =
    action666ajStableAuthority,
  previousBindingLookup: CanonicalModelImprovementPreviousBindingLookup =
    action666ajEmptyPreviousBindingLookup,
  captureBindingLookup: CanonicalCompletedImprovementCaptureBindingLookup =
    action666ajEmptyCaptureBindingLookup,
) {
  const harness = createCanonicalCompletedImprovementCaptureHarness({
    enabled: true,
    kill_switch_engaged: false,
    authority,
    previous_binding_lookup: previousBindingLookup,
    capture_binding_lookup: captureBindingLookup,
  });
  if (!harness.capture) throw new Error("action_666aj_harness_not_ready");
  return harness;
}

function capture(
  request: CanonicalCompletedImprovementCaptureRequest =
    action666ajCapturedRequest,
  authority: CanonicalCompletedImprovementCaptureAuthority =
    action666ajStableAuthority,
  previousBindingLookup: CanonicalModelImprovementPreviousBindingLookup =
    action666ajEmptyPreviousBindingLookup,
  captureBindingLookup: CanonicalCompletedImprovementCaptureBindingLookup =
    action666ajEmptyCaptureBindingLookup,
) {
  return captureHarness(
    authority,
    previousBindingLookup,
    captureBindingLookup,
  ).capture(request);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

function recomputeObservation(
  value: CanonicalCompletedImprovementLookupObservation,
) {
  const payload = structuredClone(value) as Record<string, unknown>;
  delete payload.lookup_observation_digest;
  return {
    ...payload,
    lookup_observation_digest: canonicalModelImprovementDigest(payload),
  } as CanonicalCompletedImprovementLookupObservation;
}

function recomputeTerminalResult(
  value: CanonicalCompletedImprovementCaptureResult,
) {
  const result = structuredClone(value) as unknown as Record<string, unknown>;
  const observations = (
    result.lookup_observations as CanonicalCompletedImprovementLookupObservation[]
  ).map(recomputeObservation);
  result.lookup_observations = observations;
  result.lookup_observation_inventory_digest =
    canonicalModelImprovementDigest({
      lookup_observation_version:
        CANONICAL_COMPLETED_IMPROVEMENT_LOOKUP_OBSERVATION_VERSION,
      observations,
    });
  delete result.terminal_result_digest;
  result.terminal_result_digest = canonicalModelImprovementDigest(result);
  return result as unknown as CanonicalCompletedImprovementCaptureResult;
}

function observationFor(
  result: CanonicalCompletedImprovementCaptureResult,
  namespace: CanonicalCompletedImprovementLookupObservation["lookup_namespace"],
) {
  const observation = result.lookup_observations.find(
    (candidate) => candidate.lookup_namespace === namespace,
  );
  if (!observation) throw new Error(`lookup_observation_missing:${namespace}`);
  return observation;
}

test.describe("Action 666AJ completed improvement evidence capture", () => {
  test("uses an exact, exclusive terminal capture taxonomy", () => {
    expect(CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_STATUSES).toEqual([
      "captured",
      "conflicting",
      "incomplete",
    ]);
    expect(new Set(CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_STATUSES).size).toBe(
      3,
    );
    expect(CANONICAL_COMPLETED_IMPROVEMENT_TERMINAL_RESULT_VERSION).toBe(
      "canonical_completed_improvement_terminal_result_v1",
    );
  });

  test("golden matrix classifies completed, incomplete, and conflicting inputs", () => {
    for (const scenario of action666ajGoldenScenarios) {
      const harness = captureHarness(
        scenario.authority,
        scenario.previous_binding_lookup,
        scenario.capture_binding_lookup,
      );
      const result = harness.capture(scenario.request);
      expect(
        result.status,
        `${scenario.name}:${result.reason_codes.join(",")}`,
      ).toBe(scenario.expected_status);
      expect(result).toMatchObject({
        shadow_only: true,
        live_ranking_effect: false,
        persistence_performed: false,
        automatic_training_allowed: false,
        automatic_change_allowed: false,
        automatic_promotion_allowed: false,
      });
      const verification = verifyCanonicalCompletedImprovementCaptureResult({
        request: scenario.request,
        result,
        harness,
      });
      expect(verification).toMatchObject(
        ["caller_authority_fields", "missing_producer_output"].includes(
          scenario.name,
        )
          ? {
              valid: false,
              reason_codes: [
                "canonical_completed_improvement_capture_request_unverifiable",
              ],
            }
          : { valid: true, reason_codes: [] },
      );
    }
  });

  test("captured output maps directly through Action 666AC without special flags", () => {
    const result = capture();
    expect(result.status).toBe("captured");
    if (result.status !== "captured") throw new Error("capture_not_completed");
    expect(result.capture.capture_version).toBe(
      CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_VERSION,
    );
    expect(result.capture.bundle_digest).toBe(
      canonicalCompletedImprovementEvidenceBundleDigest(result.capture.bundle),
    );
    expect(
      Object.keys(result.capture.bundle).some((key) =>
        [
          "verified",
          "complete",
          "comparable",
          "out_of_sample",
          "point_in_time_safe",
          "reproducible",
        ].includes(key),
      ),
    ).toBe(false);

    const first = projectCanonicalCompletedImprovementEvidence(
      result.capture.bundle,
      { previous_binding_lookup: action666acEmptyPreviousBindingLookup },
    );
    const second = projectCanonicalCompletedImprovementEvidence(
      result.capture.bundle,
      { previous_binding_lookup: action666acEmptyPreviousBindingLookup },
    );
    expect(first.status).toBe("mapped");
    expect(first.mapping?.proposal_result.status).toBe("proposal_ready");
    expect(second).toEqual(first);
  });

  test("explicit no-change remains mapped and non-executable", () => {
    const result = capture(
      action666ajNoChangeRequest,
      action666ajNoChangeAuthority,
    );
    expect(result.status).toBe("captured");
    if (result.status !== "captured") throw new Error("no_change_not_captured");
    const mapped = projectCanonicalCompletedImprovementEvidence(
      result.capture.bundle,
      { previous_binding_lookup: action666acEmptyPreviousBindingLookup },
    );
    expect(mapped).toMatchObject({
      status: "mapped",
      mapping: {
        proposal_result: {
          status: "no_change",
          proposal: {
            proposal_type: "no_change",
            automatic_promotion_allowed: false,
          },
        },
      },
    });
  });

  test("input ordering cannot change canonical capture bytes", () => {
    const ordered = capture();
    const reordered = capture(action666ajReorderedRequest());
    expect(reordered).toEqual(ordered);
    expect(canonicalModelImprovementDigest(reordered)).toBe(
      canonicalModelImprovementDigest(ordered),
    );
  });

  test("byte-identical retry with the same observed bindings is deterministic", () => {
    const first = capture();
    expect(first.status).toBe("captured");
    if (first.status !== "captured") throw new Error("capture_not_completed");
    const identicalLookup = {
      lookup_capture_binding: () => ({
        semantic_digest: first.capture.semantic_binding_digest,
      }),
    } satisfies CanonicalCompletedImprovementCaptureBindingLookup;
    const matchingFirst = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      action666ajEmptyPreviousBindingLookup,
      identicalLookup,
    );
    const retry = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      action666ajEmptyPreviousBindingLookup,
      identicalLookup,
    );
    expect(retry).toEqual(matchingFirst);
    expect(retry.terminal_result_digest).not.toBe(
      first.terminal_result_digest,
    );
    expect(
      verifyCanonicalCompletedImprovementCaptureResult({
        request: action666ajCapturedRequest,
        result: retry,
        harness: captureHarness(
          action666ajStableAuthority,
          action666ajEmptyPreviousBindingLookup,
          identicalLookup,
        ),
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });
  });

  test("identical bundle binds absent and matching capture observations differently", () => {
    const absent = capture();
    expect(absent.status).toBe("captured");
    if (absent.status !== "captured") throw new Error("capture_not_completed");
    const matching = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      action666ajEmptyPreviousBindingLookup,
      {
        lookup_capture_binding: () => ({
          semantic_digest: absent.capture.semantic_binding_digest,
        }),
      },
    );
    expect(matching.status).toBe("captured");
    if (matching.status !== "captured") {
      throw new Error("matching_capture_not_completed");
    }
    expect(matching.capture.bundle).toEqual(absent.capture.bundle);
    expect(matching.capture.capture_digest).toBe(
      absent.capture.capture_digest,
    );
    expect(
      observationFor(matching, "capture_identity_binding").observed_status,
    ).toBe("matching");
    expect(
      observationFor(absent, "capture_identity_binding").observed_status,
    ).toBe("absent");
    expect(matching.lookup_observation_inventory_digest).not.toBe(
      absent.lookup_observation_inventory_digest,
    );
    expect(matching.terminal_result_digest).not.toBe(
      absent.terminal_result_digest,
    );
  });

  test("different capture collision digests produce distinct rebuildable failure evidence", () => {
    const firstLookup = {
      lookup_capture_binding: () => ({ semantic_digest: "c".repeat(64) }),
    } satisfies CanonicalCompletedImprovementCaptureBindingLookup;
    const secondLookup = {
      lookup_capture_binding: () => ({ semantic_digest: "d".repeat(64) }),
    } satisfies CanonicalCompletedImprovementCaptureBindingLookup;
    const first = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      action666ajEmptyPreviousBindingLookup,
      firstLookup,
    );
    const second = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      action666ajEmptyPreviousBindingLookup,
      secondLookup,
    );
    expect(first.status).toBe("conflicting");
    expect(second.status).toBe("conflicting");
    expect(second.reason_codes).toEqual(first.reason_codes);
    const firstCollision = observationFor(
      first,
      "capture_identity_binding",
    );
    const secondCollision = observationFor(
      second,
      "capture_identity_binding",
    );
    expect(firstCollision).toMatchObject({
      lookup_namespace: "capture_identity_binding",
      observed_status: "conflicting",
      observed_binding_digest: "c".repeat(64),
      sanitized_failure_classification: "semantic_collision",
    });
    expect(secondCollision.observed_binding_digest).toBe("d".repeat(64));
    expect(secondCollision.collision_digest).not.toBe(
      firstCollision.collision_digest,
    );
    expect(firstCollision.collision_digest).toBe(
      canonicalModelImprovementDigest({
        collision_version:
          "canonical_completed_improvement_lookup_collision_v1",
        lookup_namespace: firstCollision.lookup_namespace,
        capture_request_identity: firstCollision.capture_request_identity,
        queried_binding_identity: firstCollision.queried_binding_identity,
        expected_binding_digest: firstCollision.expected_binding_digest,
        observed_binding_digest: firstCollision.observed_binding_digest,
      }),
    );
    expect(firstCollision.collision_identity).toBe(
      `canonical-completed-improvement-lookup-collision:${firstCollision.collision_digest}`,
    );
    expect(second.terminal_result_digest).not.toBe(
      first.terminal_result_digest,
    );
    for (const [result, lookup] of [
      [first, firstLookup],
      [second, secondLookup],
    ] as const) {
      expect(
        verifyCanonicalCompletedImprovementCaptureResult({
          request: action666ajCapturedRequest,
          result,
          harness: captureHarness(
            action666ajStableAuthority,
            action666ajEmptyPreviousBindingLookup,
            lookup,
          ),
        }),
      ).toMatchObject({ valid: true, reason_codes: [] });
    }
  });

  test("different previous-binding collisions remain separate from capture lookup evidence", () => {
    const previousLookup = (digest: string) =>
      ({
        lookup_proposal_binding: () => ({ semantic_digest: digest }),
        lookup_experiment_binding: () => null,
      }) satisfies CanonicalModelImprovementPreviousBindingLookup;
    const firstLookup = previousLookup("a".repeat(64));
    const secondLookup = previousLookup("b".repeat(64));
    const first = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      firstLookup,
    );
    const second = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      secondLookup,
    );
    expect(first.status).toBe("conflicting");
    expect(second.status).toBe("conflicting");
    expect(
      first.lookup_observations.some(
        (observation) =>
          observation.lookup_namespace === "capture_identity_binding",
      ),
    ).toBe(false);
    expect(
      observationFor(first, "previous_proposal_binding"),
    ).toMatchObject({
      lookup_namespace: "previous_proposal_binding",
      observed_status: "conflicting",
      observed_binding_digest: "a".repeat(64),
    });
    expect(
      observationFor(second, "previous_proposal_binding")
        .observed_binding_digest,
    ).toBe("b".repeat(64));
    expect(second.terminal_result_digest).not.toBe(
      first.terminal_result_digest,
    );
  });

  test("lookup exceptions are structured, sanitized, and independently rebuildable", () => {
    const previousLookup = {
      lookup_proposal_binding: () => {
        throw new Error("backend-secret previous stack");
      },
      lookup_experiment_binding: () => null,
    } satisfies CanonicalModelImprovementPreviousBindingLookup;
    const result = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      previousLookup,
    );
    expect(result).toMatchObject({
      status: "incomplete",
      reason_codes: ["capture_previous_binding_lookup_failed"],
    });
    expect(
      result.lookup_observations.some(
        (observation) =>
          observation.observed_status === "lookup_failed" &&
          observation.sanitized_failure_classification ===
            "previous_binding_lookup_failed",
      ),
    ).toBe(true);
    expect(JSON.stringify(result)).not.toContain("backend-secret");
    expect(JSON.stringify(result)).not.toContain("stack");
    expect(
      verifyCanonicalCompletedImprovementCaptureResult({
        request: action666ajCapturedRequest,
        result,
        harness: captureHarness(
          action666ajStableAuthority,
          previousLookup,
          action666ajEmptyCaptureBindingLookup,
        ),
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });

    const invalidDigestLookup = {
      lookup_proposal_binding: () => ({
        semantic_digest: "backend-secret-not-a-digest",
      }),
      lookup_experiment_binding: () => null,
    } satisfies CanonicalModelImprovementPreviousBindingLookup;
    const invalidDigestFailure = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      invalidDigestLookup,
    );
    expect(invalidDigestFailure).toMatchObject({
      status: "incomplete",
      reason_codes: ["capture_previous_binding_lookup_failed"],
    });
    expect(JSON.stringify(invalidDigestFailure)).not.toContain(
      "backend-secret",
    );

    const captureLookup = {
      lookup_capture_binding: () => {
        throw new Error("backend-secret capture stack");
      },
    } satisfies CanonicalCompletedImprovementCaptureBindingLookup;
    const captureFailure = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      action666ajEmptyPreviousBindingLookup,
      captureLookup,
    );
    expect(captureFailure).toMatchObject({
      status: "incomplete",
      reason_codes: ["capture_identity_lookup_failed"],
    });
    expect(
      observationFor(captureFailure, "capture_identity_binding"),
    ).toMatchObject({
      lookup_namespace: "capture_identity_binding",
      observed_status: "lookup_failed",
      sanitized_failure_classification: "capture_identity_lookup_failed",
    });
    expect(JSON.stringify(captureFailure)).not.toContain("backend-secret");
    expect(
      verifyCanonicalCompletedImprovementCaptureResult({
        request: action666ajCapturedRequest,
        result: captureFailure,
        harness: captureHarness(
          action666ajStableAuthority,
          action666ajEmptyPreviousBindingLookup,
          captureLookup,
        ),
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });

    const invalidCaptureDigestFailure = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      action666ajEmptyPreviousBindingLookup,
      {
        lookup_capture_binding: () => ({
          semantic_digest: "backend-secret-not-a-digest",
        }),
      },
    );
    expect(invalidCaptureDigestFailure).toMatchObject({
      status: "incomplete",
      reason_codes: ["capture_identity_lookup_failed"],
    });
    expect(JSON.stringify(invalidCaptureDigestFailure)).not.toContain(
      "backend-secret",
    );
  });

  test("self-consistent observation and terminal tampering fails full rebuild", () => {
    const canonical = capture();
    const tampered = structuredClone(canonical);
    tampered.lookup_observations[0].capture_request_identity =
      "canonical-completed-improvement-capture:drift";
    const recomputed = recomputeTerminalResult(tampered);
    expect(recomputed.terminal_result_digest).not.toBe(
      canonical.terminal_result_digest,
    );
    expect(
      verifyCanonicalCompletedImprovementCaptureResult({
        request: action666ajCapturedRequest,
        result: recomputed,
        harness: captureHarness(),
      }),
    ).toMatchObject({
      valid: false,
      canonical_result: null,
      reason_codes: [
        "canonical_completed_improvement_capture_result_tampered",
      ],
    });
  });

  test("lookup namespace substitution, reordering, and duplicates fail rebuild", () => {
    const canonical = capture();
    for (const mutation of [
      (result: CanonicalCompletedImprovementCaptureResult) => {
        const index = result.lookup_observations.findIndex(
          (observation) =>
            observation.lookup_namespace === "previous_proposal_binding",
        );
        result.lookup_observations[index].lookup_namespace =
          "capture_identity_binding";
        result.lookup_observations[index].lookup_contract_version =
          "canonical_completed_improvement_capture_binding_lookup_v1";
      },
      (result: CanonicalCompletedImprovementCaptureResult) => {
        result.lookup_observations.reverse();
      },
      (result: CanonicalCompletedImprovementCaptureResult) => {
        result.lookup_observations.push(
          structuredClone(result.lookup_observations[0]),
        );
      },
      (result: CanonicalCompletedImprovementCaptureResult) => {
        observationFor(
          result,
          "capture_identity_binding",
        ).expected_binding_digest = "e".repeat(64);
      },
      (result: CanonicalCompletedImprovementCaptureResult) => {
        const observation = observationFor(
          result,
          "capture_identity_binding",
        );
        observation.observed_status = "matching";
        observation.observed_binding_digest = "f".repeat(64);
      },
    ]) {
      const tampered = structuredClone(canonical);
      mutation(tampered);
      const recomputed = recomputeTerminalResult(tampered);
      expect(
        verifyCanonicalCompletedImprovementCaptureResult({
          request: action666ajCapturedRequest,
          result: recomputed,
          harness: captureHarness(),
        }).valid,
      ).toBe(false);
    }
  });

  test("caller-supplied lookup observations are rejected before lookup work", () => {
    const request = {
      ...action666ajCapturedRequest,
      lookup_observations: [],
      terminal_result_digest: "f".repeat(64),
    } as CanonicalCompletedImprovementCaptureRequest & {
      lookup_observations: [];
      terminal_result_digest: string;
    };
    const result = capture(request);
    expect(result.status).toBe("conflicting");
    expect(result.reason_codes).toEqual([
      "capture_caller_generated_evidence_forbidden:lookup_observations",
      "capture_caller_generated_evidence_forbidden:terminal_result_digest",
    ]);
    expect(result.lookup_observations).toEqual([]);
  });

  test("the same capture identity with changed semantics conflicts", () => {
    const result = capture(
      action666ajCapturedRequest,
      action666ajStableAuthority,
      action666ajEmptyPreviousBindingLookup,
      action666ajCaptureIdentityCollisionLookup,
    );
    expect(result).toMatchObject({
      status: "conflicting",
      reason_codes: ["capture_identity_semantic_collision"],
    });
  });

  test("self-consistent result tampering fails independent rebuild", () => {
    const result = capture();
    expect(result.status).toBe("captured");
    if (result.status !== "captured") throw new Error("capture_not_completed");
    const tampered = structuredClone(result);
    tampered.capture.bundle.bundle_identity =
      "completed-improvement-bundle:tampered";
    tampered.capture.bundle_digest =
      canonicalCompletedImprovementEvidenceBundleDigest(
        tampered.capture.bundle,
      );
    const capturePayload = structuredClone(tampered.capture) as Record<
      string,
      unknown
    >;
    delete capturePayload.capture_digest;
    tampered.capture.capture_digest =
      canonicalModelImprovementDigest(capturePayload);

    const verification = verifyCanonicalCompletedImprovementCaptureResult({
      request: action666ajCapturedRequest,
      result: tampered,
      harness: captureHarness(),
    });
    expect(verification).toMatchObject({
      valid: false,
      canonical_result: null,
      reason_codes: [
        "canonical_completed_improvement_capture_result_tampered",
      ],
    });
  });

  test("runtime gates require literal true and literal false before dependency reads", () => {
    const invalidEnabled = [undefined, null, false, 0, 1, "true", {}, []];
    const invalidKillSwitch = [undefined, null, true, 0, 1, "false", {}, []];
    const configurations = [
      ...invalidEnabled.map((enabled) => ({
        enabled,
        kill_switch_engaged: false,
      })),
      ...invalidKillSwitch.map((kill_switch_engaged) => ({
        enabled: true,
        kill_switch_engaged,
      })),
    ];
    for (const configuration of configurations) {
      let dependencyReads = 0;
      const options = { ...configuration } as Record<string, unknown>;
      for (const key of [
        "authority",
        "previous_binding_lookup",
        "capture_binding_lookup",
        "counters",
      ]) {
        Object.defineProperty(options, key, {
          enumerable: true,
          get: () => {
            dependencyReads += 1;
            throw new Error("closed_gate_dependency_read");
          },
        });
      }
      const harness = createCanonicalCompletedImprovementCaptureHarness(
        options as Parameters<
          typeof createCanonicalCompletedImprovementCaptureHarness
        >[0],
      );
      expect(harness.capture).toBeNull();
      expect(harness.counters).toEqual(zeroCounters());
      expect(dependencyReads).toBe(0);
    }
  });

  test("active options are exact and caller counters stay private", () => {
    const malformedOptions: Record<string | symbol, unknown>[] = [
      {
        enabled: true,
        kill_switch_engaged: false,
        authority: action666ajStableAuthority,
        previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
        capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
        unexpected: true,
      },
      Object.assign(
        {
          enabled: true,
          kill_switch_engaged: false,
          authority: action666ajStableAuthority,
          previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
          capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
        },
        { [Symbol("unexpected")]: true },
      ),
    ];
    const hidden = {
      enabled: true,
      kill_switch_engaged: false,
      authority: action666ajStableAuthority,
      previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
      capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    } as Record<string, unknown>;
    Object.defineProperty(hidden, "unexpected", { value: true });
    malformedOptions.push(hidden);
    for (const options of malformedOptions) {
      const harness = createCanonicalCompletedImprovementCaptureHarness(
        options as Parameters<
          typeof createCanonicalCompletedImprovementCaptureHarness
        >[0],
      );
      expect(harness).toMatchObject({
        enabled: true,
        status: "unavailable",
        capture: null,
      });
    }

    const callerCounters = zeroCounters();
    const harness = createCanonicalCompletedImprovementCaptureHarness({
      enabled: true,
      kill_switch_engaged: false,
      authority: action666ajStableAuthority,
      previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
      capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
      counters: callerCounters,
    });
    expect(harness.capture).not.toBeNull();
    if (!harness.capture) throw new Error("capture_harness_not_ready");
    const initialSnapshot = harness.counters;
    harness.capture(action666ajCapturedRequest);
    expect(callerCounters).toEqual(zeroCounters());
    expect(initialSnapshot).toEqual({ ...zeroCounters(), authority_checks: 1 });
    expect(harness.counters.request_reads).toBe(1);
    expect(Object.isFrozen(harness.counters)).toBe(true);
  });

  test("authority and lookup dependencies are construction-time snapshots", () => {
    const mutableBoundary = structuredClone(
      action666vStableImprovementFixture.trustBoundary,
    );
    mutableBoundary.registry_authority =
      action666vStableImprovementFixture.trustBoundary.registry_authority;
    const authority = createCanonicalCompletedImprovementCaptureAuthority(
      mutableBoundary,
    );
    const previousLookup: CanonicalModelImprovementPreviousBindingLookup = {
      lookup_proposal_binding: () => null,
      lookup_experiment_binding: () => null,
    };
    const bindingLookup: CanonicalCompletedImprovementCaptureBindingLookup = {
      lookup_capture_binding: () => null,
    };
    const harness = captureHarness(authority, previousLookup, bindingLookup);

    mutableBoundary.registry.posts[0].semantic_digest = "f".repeat(64);
    previousLookup.lookup_proposal_binding = () => ({
      semantic_digest: "c".repeat(64),
    });
    bindingLookup.lookup_capture_binding = () => ({
      semantic_digest: "d".repeat(64),
    });

    const result = harness.capture(action666ajCapturedRequest);
    expect(result.status).toBe("captured");
    expect(authority.trust_boundary.registry.posts[0].semantic_digest).not.toBe(
      mutableBoundary.registry.posts[0].semantic_digest,
    );
  });

  test("authority creation rejects extra shells, nested extras, and proxies", () => {
    const boundary = () => {
      const value = structuredClone(
        action666vStableImprovementFixture.trustBoundary,
      );
      value.registry_authority =
        action666vStableImprovementFixture.trustBoundary.registry_authority;
      return value;
    };
    const variants: unknown[] = [];
    const topExtra = boundary() as unknown as Record<string, unknown>;
    topExtra.unexpected = true;
    variants.push(topExtra);
    const topDelete = boundary() as unknown as Record<string, unknown>;
    delete topDelete.trust_source;
    variants.push(topDelete);
    const topSymbol = boundary() as unknown as Record<PropertyKey, unknown>;
    topSymbol[Symbol("unexpected")] = true;
    variants.push(topSymbol);
    const registryExtra = boundary();
    (
      registryExtra.registry as unknown as Record<string, unknown>
    ).unexpected = true;
    variants.push(registryExtra);
    const registryDelete = boundary();
    delete (
      registryDelete.registry as unknown as Record<string, unknown>
    ).root_digest;
    variants.push(registryDelete);
    const registryAccessor = boundary();
    Object.defineProperty(registryAccessor.registry, "posts", {
      enumerable: true,
      get: () => registryAccessor.registry.posts,
    });
    variants.push(registryAccessor);
    const registrySymbol = boundary();
    (
      registrySymbol.registry as unknown as Record<PropertyKey, unknown>
    )[Symbol("unexpected")] = true;
    variants.push(registrySymbol);
    const postExtra = boundary();
    (
      postExtra.registry.posts[0] as unknown as Record<string, unknown>
    ).unexpected = true;
    variants.push(postExtra);
    const payloadExtra = boundary();
    (
      payloadExtra.registry.posts[0].payload as unknown as Record<
        string,
        unknown
      >
    ).unexpected = true;
    variants.push(payloadExtra);
    variants.push(new Proxy(boundary(), {}));

    for (const variant of variants) {
      expect(() =>
        createCanonicalCompletedImprovementCaptureAuthority(
          variant as CanonicalModelImprovementTrustBoundary,
        ),
      ).toThrow(
        "completed_improvement_capture_authority_runtime_shape_conflicting",
      );
    }
  });

  test("lookup return shapes reject extras and accessors without leaking", () => {
    let accessorReads = 0;
    const invalidReturns: Array<() => unknown> = [
      () => ({ semantic_digest: "a".repeat(64), unexpected: true }),
      () => {
        const result = {} as Record<string, unknown>;
        Object.defineProperty(result, "semantic_digest", {
          enumerable: true,
          get: () => {
            accessorReads += 1;
            return "a".repeat(64);
          },
        });
        return result;
      },
    ];
    for (const invalidReturn of invalidReturns) {
      const previousHarness = captureHarness(
        action666ajStableAuthority,
        {
          lookup_proposal_binding: invalidReturn as () => {
            semantic_digest: string;
          } | null,
          lookup_experiment_binding: () => null,
        },
      );
      expect(previousHarness.capture(action666ajCapturedRequest)).toMatchObject({
        status: "incomplete",
        reason_codes: ["capture_previous_binding_lookup_failed"],
      });

      const captureHarnessWithInvalidReturn = captureHarness(
        action666ajStableAuthority,
        action666ajEmptyPreviousBindingLookup,
        {
          lookup_capture_binding: invalidReturn as () => {
            semantic_digest: string;
          } | null,
        },
      );
      expect(
        captureHarnessWithInvalidReturn.capture(action666ajCapturedRequest),
      ).toMatchObject({
        status: "incomplete",
        reason_codes: ["capture_identity_lookup_failed"],
      });
    }
    expect(accessorReads).toBe(0);
  });

  test("malformed recursive requests never throw and cannot verify", () => {
    const variants: unknown[] = [];
    let accessorReads = 0;
    type MutableCaptureRequest =
      CanonicalCompletedImprovementCaptureRequest & Record<PropertyKey, unknown>;
    const mutate = (mutation: (value: MutableCaptureRequest) => void) => {
      const value = structuredClone(
        action666ajCapturedRequest,
      ) as MutableCaptureRequest;
      mutation(value);
      variants.push(value);
    };
    mutate((value) => {
      value.unexpected = true;
    });
    mutate((value) => {
      Object.defineProperty(value, "hidden", { value: true });
    });
    mutate((value) => {
      value[Symbol("unexpected") as unknown as string] = true;
    });
    mutate((value) => {
      Object.defineProperty(value, "completed_at", {
        enumerable: true,
        get: () => {
          accessorReads += 1;
          return "2026-07-28T12:00:00.000000000Z";
        },
      });
    });
    mutate((value) => {
      value.self = value;
    });
    mutate((value) => {
      (value.declared_bindings as unknown as Record<string, unknown>).unexpected =
        true;
    });
    mutate((value) => {
      delete (
        value.declared_bindings.period as unknown as Record<string, unknown>
      ).start;
    });
    mutate((value) => {
      (
        value.source_artifact_digests as unknown as Record<string, unknown>
      ).unexpected = "a".repeat(64);
    });
    mutate((value) => {
      (value.upstream_sources as unknown as Record<string, unknown>).unexpected =
        true;
    });
    mutate((value) => {
      (
        value.upstream_sources.opportunity_sets as unknown as Record<
          string,
          unknown
        >
      ).unexpected = true;
    });
    mutate((value) => {
      delete value.upstream_sources.opportunity_sets[0];
    });
    mutate((value) => {
      (
        value.upstream_sources.explanations as unknown as Record<
          string,
          unknown
        >
      ).unexpected = true;
    });
    mutate((value) => {
      value.completed_at = Number.NaN as unknown as string;
    });
    mutate((value) => {
      value.declared_bindings =
        null as unknown as CanonicalCompletedImprovementCaptureRequest["declared_bindings"];
    });
    mutate((value) => {
      value.upstream_sources.learning =
        null as unknown as CanonicalCompletedImprovementCaptureRequest["upstream_sources"]["learning"];
    });

    const harness = captureHarness();
    const results = variants.map((request) => {
      let result: CanonicalCompletedImprovementCaptureResult | null = null;
      expect(() => {
        result = harness.capture(
          request as CanonicalCompletedImprovementCaptureRequest,
        );
      }).not.toThrow();
      expect(result).toMatchObject({
        status: "incomplete",
        capture: null,
        reason_codes: ["capture_request_runtime_shape_conflicting"],
      });
      return result!;
    });
    for (const request of variants) {
      for (const result of results) {
        expect(
          verifyCanonicalCompletedImprovementCaptureResult({
            request: request as CanonicalCompletedImprovementCaptureRequest,
            result,
            harness,
          }).valid,
        ).toBe(false);
      }
    }
    expect(accessorReads).toBe(0);
  });

  test("proxy requests cannot create or cross-verify canonical diagnostics", () => {
    const statefulRequestProxy = () => {
      let ownKeyReads = 0;
      return new Proxy(structuredClone(action666ajCapturedRequest), {
        ownKeys: (target) => {
          ownKeyReads += 1;
          if (ownKeyReads > 1) throw new Error("stateful_proxy_drift");
          return Reflect.ownKeys(target);
        },
      });
    };
    const requests = [
      new Proxy(structuredClone(action666ajCapturedRequest), {}),
      statefulRequestProxy(),
      new Proxy(structuredClone(action666ajCapturedRequest), {
        ownKeys: () => {
          throw new Error("throwing_proxy");
        },
      }),
    ];
    const harness = captureHarness();
    const results = requests.map((request) =>
      harness.capture(request),
    );
    for (const result of results) {
      expect(result).toMatchObject({
        status: "incomplete",
        capture: null,
        reason_codes: ["capture_request_runtime_shape_conflicting"],
      });
    }
    for (const request of requests) {
      for (const result of results) {
        expect(
          verifyCanonicalCompletedImprovementCaptureResult({
            request,
            result,
            harness,
          }),
        ).toMatchObject({
          valid: false,
          canonical_result: null,
          reason_codes: [
            "canonical_completed_improvement_capture_request_unverifiable",
          ],
        });
      }
    }

    const canonicalResult = capture();
    const proxiedResults = [
      new Proxy(canonicalResult, {}),
      new Proxy(canonicalResult, {
        ownKeys: (() => {
          let ownKeyReads = 0;
          return (target: CanonicalCompletedImprovementCaptureResult) => {
            ownKeyReads += 1;
            if (ownKeyReads > 1) throw new Error("stateful_proxy_drift");
            return Reflect.ownKeys(target);
          };
        })(),
      }),
      new Proxy(canonicalResult, {
        ownKeys: () => {
          throw new Error("throwing_proxy");
        },
      }),
    ];
    for (const result of proxiedResults) {
      expect(
        verifyCanonicalCompletedImprovementCaptureResult({
          request: action666ajCapturedRequest,
          result,
          harness,
        }).valid,
      ).toBe(false);
    }
  });

  test("every authority-empty upstream array rejects inserted object elements", () => {
    const emptyArrayPaths: Array<Array<string | number>> = [];
    const collect = (
      value: unknown,
      currentPath: Array<string | number> = [],
    ) => {
      if (Array.isArray(value)) {
        if (value.length === 0) emptyArrayPaths.push(currentPath);
        value.forEach((item, index) => collect(item, [...currentPath, index]));
        return;
      }
      if (value !== null && typeof value === "object") {
        for (const [key, nested] of Object.entries(value)) {
          collect(nested, [...currentPath, key]);
        }
      }
    };
    collect(action666ajCapturedRequest.upstream_sources);
    expect(emptyArrayPaths.length).toBeGreaterThan(5);

    const harness = captureHarness();
    for (const emptyPath of emptyArrayPaths) {
      for (const inserted of [{ unexpected: true }, null, 42]) {
        const request = structuredClone(action666ajCapturedRequest);
        let current: unknown = request.upstream_sources;
        for (const part of emptyPath) {
          current = Array.isArray(current)
            ? current[part as number]
            : (current as Record<string, unknown>)[part as string];
        }
        (current as unknown[]).push(inserted);
        const result = harness.capture(request);
        expect(result, emptyPath.join(".")).toMatchObject({
          status: "incomplete",
          reason_codes: ["capture_request_runtime_shape_conflicting"],
        });
        expect(
          verifyCanonicalCompletedImprovementCaptureResult({
            request,
            result,
            harness,
          }).valid,
          emptyPath.join("."),
        ).toBe(false);
      }
    }
  });

  test("copied harnesses and malformed result surfaces have no verifier authority", () => {
    const harness = captureHarness();
    const result = harness.capture(action666ajCapturedRequest);
    for (const unrecognized of [
      { ...harness },
      Object.create(harness) as object,
      Object.freeze({ capture: harness.capture }),
    ]) {
      expect(
        verifyCanonicalCompletedImprovementCaptureResult({
          request: action666ajCapturedRequest,
          result,
          harness: unrecognized,
        }),
      ).toMatchObject({
        valid: false,
        canonical_result: null,
        reason_codes: [
          "canonical_completed_improvement_capture_harness_unrecognized",
        ],
      });
    }
    const malformed = structuredClone(result) as Record<string, unknown>;
    Object.defineProperty(malformed, "hidden", { value: true });
    expect(
      verifyCanonicalCompletedImprovementCaptureResult({
        request: action666ajCapturedRequest,
        result: malformed as CanonicalCompletedImprovementCaptureResult,
        harness,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: [
        "canonical_completed_improvement_capture_verification_failed",
      ],
    });

    expect(
      verifyCanonicalCompletedImprovementCaptureResult({
        request: action666ajCapturedRequest,
        result: new Proxy(result, {}),
        harness,
      }),
    ).toMatchObject({
      valid: false,
      canonical_result: null,
      reason_codes: [
        "canonical_completed_improvement_capture_verification_failed",
      ],
    });
  });

  test("default-off and kill switch perform zero producer work", () => {
    expect(DEFAULT_OFF_COMPLETED_IMPROVEMENT_CAPTURE_ENABLED).toBe(false);
    expect(
      DEFAULT_OFF_COMPLETED_IMPROVEMENT_CAPTURE_KILL_SWITCH_ENGAGED,
    ).toBe(true);
    for (const config of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const counters = zeroCounters();
      const harness = createCanonicalCompletedImprovementCaptureHarness({
        ...config,
        counters,
        get authority(): CanonicalCompletedImprovementCaptureAuthority {
          throw new Error("authority_must_not_be_read");
        },
        get previous_binding_lookup(): CanonicalModelImprovementPreviousBindingLookup {
          throw new Error("previous_binding_must_not_be_read");
        },
        get capture_binding_lookup(): CanonicalCompletedImprovementCaptureBindingLookup {
          throw new Error("capture_binding_must_not_be_read");
        },
      });
      expect(harness.capture).toBeNull();
      expect(harness.counters).toEqual(zeroCounters());
    }
  });

  test("deep-frozen inputs remain immutable", () => {
    const input = deepFreeze(structuredClone(action666ajCapturedRequest));
    const before = canonicalCompletedImprovementCaptureRequestDigest(input);
    const result = capture(input);
    expect(result.status).toBe("captured");
    expect(canonicalCompletedImprovementCaptureRequestDigest(input)).toBe(
      before,
    );
    expect(Object.isFrozen(input)).toBe(true);
    expect(Object.isFrozen(input.upstream_sources)).toBe(true);
  });

  test("golden report is synthetic, non-publishable, and byte-aligned", () => {
    expect(goldenReport).toMatchObject({
      report_version:
        "canonical_completed_improvement_evidence_capture_golden_report_v1",
      capture_contract_version:
        CANONICAL_COMPLETED_IMPROVEMENT_CAPTURE_VERSION,
      lookup_observation_version:
        CANONICAL_COMPLETED_IMPROVEMENT_LOOKUP_OBSERVATION_VERSION,
      terminal_result_version:
        CANONICAL_COMPLETED_IMPROVEMENT_TERMINAL_RESULT_VERSION,
      evidence_classification: "synthetic_fixture_only",
      production_performance_claimed: false,
      not_publishable: true,
      scenario_count: action666ajGoldenScenarios.length,
      expected_status_counts: {
        captured: 2,
        conflicting: 9,
        incomplete: 2,
      },
    });
    expect(goldenReport.scenarios).toEqual(
      action666ajGoldenScenarios.map((scenario) => ({
        name: scenario.name,
        expected_status: scenario.expected_status,
      })),
    );
  });

  test("foundation remains server-only and has no live call-site", () => {
    const root = process.cwd();
    const implementation = fs.readFileSync(
      path.join(
        root,
        "lib/server/canonical-completed-improvement-evidence-capture.ts",
      ),
      "utf8",
    );
    expect(implementation.startsWith('import "server-only";')).toBe(true);
    expect(implementation).not.toMatch(
      /createClient|supabase|fetch\s*\(|INSERT|UPDATE|DELETE/,
    );
    const liveRoots = ["app", "components", "hooks"];
    for (const liveRoot of liveRoots) {
      const absolute = path.join(root, liveRoot);
      if (!fs.existsSync(absolute)) continue;
      const stack = [absolute];
      while (stack.length > 0) {
        const current = stack.pop()!;
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) stack.push(full);
          else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
            expect(fs.readFileSync(full, "utf8")).not.toContain(
              "canonical-completed-improvement-evidence-capture",
            );
          }
        }
      }
    }
  });
});
