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
} from "@/lib/server/canonical-model-improvement-proposal";

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
  const harness = createCanonicalCompletedImprovementCaptureHarness({
    enabled: true,
    kill_switch_engaged: false,
    authority,
    previous_binding_lookup: previousBindingLookup,
    capture_binding_lookup: captureBindingLookup,
  });
  if (!harness.capture) throw new Error("action_666aj_harness_not_ready");
  return harness.capture(request);
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
      const result = capture(
        scenario.request,
        scenario.authority,
        scenario.previous_binding_lookup,
        scenario.capture_binding_lookup,
      );
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
      expect(
        verifyCanonicalCompletedImprovementCaptureResult({
          request: scenario.request,
          result,
          authority: scenario.authority,
          previous_binding_lookup: scenario.previous_binding_lookup,
          capture_binding_lookup: scenario.capture_binding_lookup,
        }),
      ).toMatchObject({ valid: true, reason_codes: [] });
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
        authority: action666ajStableAuthority,
        previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
        capture_binding_lookup: identicalLookup,
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
          authority: action666ajStableAuthority,
          previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
          capture_binding_lookup: lookup,
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
        authority: action666ajStableAuthority,
        previous_binding_lookup: previousLookup,
        capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
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
        authority: action666ajStableAuthority,
        previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
        capture_binding_lookup: captureLookup,
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
        authority: action666ajStableAuthority,
        previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
        capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
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
          authority: action666ajStableAuthority,
          previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
          capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
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
      authority: action666ajStableAuthority,
      previous_binding_lookup: action666ajEmptyPreviousBindingLookup,
      capture_binding_lookup: action666ajEmptyCaptureBindingLookup,
    });
    expect(verification).toMatchObject({
      valid: false,
      canonical_result: null,
      reason_codes: [
        "canonical_completed_improvement_capture_result_tampered",
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
