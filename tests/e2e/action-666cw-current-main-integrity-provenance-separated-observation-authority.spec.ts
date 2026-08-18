import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { types as nodeTypes } from "node:util";

import goldenReport from "@/docs/action-666cw-golden-integrity-provenance-separated-observation-report.json";
import {
  action666cwCanonicalReadbackBytes,
  action666cwEvaluate,
  action666cwGoldenScenarios,
  action666cwHarness,
  action666cwPrimitiveMatrix,
} from "@/lib/server/canonical-integrity-provenance-separated-observation-authority-fixtures";
import * as authorityExports from "@/lib/server/canonical-integrity-provenance-separated-observation-authority";
import {
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ARTIFACT_ROLES,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_AUTHORITY_VERSION,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ENVELOPE_VERSION,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_MAX_READBACK_BYTES,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_READBACK_TERMINALS,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_READBACK_VERSION,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RESULT_VERSION,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RUNTIME_EVIDENCE_VERSION,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_STATUSES,
  createCanonicalIntegrityProvenanceSeparatedObservationAuthorityHarness,
  verifyCanonicalIntegrityProvenanceSeparatedObservationReadback,
  verifyCanonicalIntegrityProvenanceSeparatedObservationResult,
} from "@/lib/server/canonical-integrity-provenance-separated-observation-authority";

const expectedSafety = {
  shadow_only: true,
  live_ranking_effect: false,
  live_impact: false,
  persistence_performed: false,
  automatic_training_allowed: false,
  automatic_parameter_change_allowed: false,
  automatic_threshold_change_allowed: false,
  automatic_model_change_allowed: false,
  automatic_promotion_allowed: false,
  external_ai_canonical_truth_authority: false,
  causal_improvement_claimed: false,
  synthetic_evidence: true,
  not_publishable: true,
} as const;

const zeroCounters = {
  request_reads: 0,
  predecessor_observations: 0,
  predecessor_verifications: 0,
  runtime_provenance_checks: 0,
  integrity_envelopes_built: 0,
  readback_reads: 0,
  readback_parse_operations: 0,
  digest_operations: 0,
} as const;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hostileProxy() {
  const counts = {
    ownKeys: 0,
    getOwnPropertyDescriptor: 0,
    getPrototypeOf: 0,
    get: 0,
    has: 0,
  };
  const proxy = new Proxy(
    {},
    {
      ownKeys() {
        counts.ownKeys += 1;
        throw new Error("caller_own_keys_message");
      },
      getOwnPropertyDescriptor() {
        counts.getOwnPropertyDescriptor += 1;
        throw new Error("caller_descriptor_message");
      },
      getPrototypeOf() {
        counts.getPrototypeOf += 1;
        throw new Error("caller_prototype_message");
      },
      get() {
        counts.get += 1;
        throw new Error("caller_get_message");
      },
      has() {
        counts.has += 1;
        throw new Error("caller_has_message");
      },
    },
  );
  return { proxy, counts };
}

function expectRecursivelyFrozen(value: unknown) {
  const pending: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === null || typeof current !== "object") continue;
    if (seen.has(current)) continue;
    seen.add(current);
    expect(Object.isFrozen(current)).toBe(true);
    for (const descriptor of Object.values(
      Object.getOwnPropertyDescriptors(current),
    )) {
      if ("value" in descriptor) pending.push(descriptor.value);
    }
  }
}

function canonicalForgery(canonical: string) {
  const envelope = JSON.parse(canonical) as Record<string, unknown>;
  envelope.source_result_digest = "f".repeat(64);
  delete envelope.envelope_digest;
  envelope.envelope_digest = sha256(JSON.stringify(envelope));
  return JSON.stringify(envelope);
}

test.describe("Action 666CW current-main integrity/provenance separation", () => {
  test("freezes exact versions, taxonomies and five-file scope", () => {
    expect(
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_AUTHORITY_VERSION,
    ).toBe(
      "canonical_integrity_provenance_separated_observation_authority_v2",
    );
    expect(
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RUNTIME_EVIDENCE_VERSION,
    ).toBe(
      "canonical_integrity_provenance_separated_observation_runtime_evidence_v2",
    );
    expect(
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ENVELOPE_VERSION,
    ).toBe("canonical_integrity_provenance_separated_observation_envelope_v2");
    expect(
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_RESULT_VERSION,
    ).toBe("canonical_integrity_provenance_separated_observation_result_v2");
    expect(
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_READBACK_VERSION,
    ).toBe("canonical_integrity_provenance_separated_observation_readback_v2");
    expect(
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_MAX_READBACK_BYTES,
    ).toBe(65_536);
    expect(CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_STATUSES).toEqual(
      ["verified", "rejected"],
    );
    expect(
      CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_READBACK_TERMINALS,
    ).toEqual([
      "integrity_only",
      "malformed",
      "non_canonical",
      "digest_mismatch",
      "input_rejected",
    ]);
    expect(
      Object.isFrozen(
        CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_READBACK_TERMINALS,
      ),
    ).toBe(true);
    expect(
      Object.keys(
        CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_ARTIFACT_ROLES,
      ),
    ).toHaveLength(5);
  });

  test("is literal default-off and kill-switch fail-closed with zero work", () => {
    for (const options of [
      {
        enabled: false,
        kill_switch_engaged: false,
        dependencies: hostileProxy().proxy,
      },
      {
        enabled: true,
        kill_switch_engaged: true,
        dependencies: hostileProxy().proxy,
      },
      {
        enabled: undefined,
        kill_switch_engaged: false,
        dependencies: hostileProxy().proxy,
      },
      {
        enabled: true,
        kill_switch_engaged: null,
        dependencies: hostileProxy().proxy,
      },
      {
        enabled: "true",
        kill_switch_engaged: false,
        dependencies: hostileProxy().proxy,
      },
    ]) {
      const harness =
        createCanonicalIntegrityProvenanceSeparatedObservationAuthorityHarness(
          options as never,
        );
      expect(harness.enabled).toBe(false);
      expect(harness.observe).toBeNull();
      expect(harness.readback).toBeNull();
      expect(harness.counters).toEqual(zeroCounters);
    }
  });

  test("fails closed before hooks for enabled invalid dependencies", () => {
    const hostile = hostileProxy();
    let harness: ReturnType<
      typeof createCanonicalIntegrityProvenanceSeparatedObservationAuthorityHarness
    > | null = null;
    let thrown: unknown = null;
    try {
      harness =
        createCanonicalIntegrityProvenanceSeparatedObservationAuthorityHarness({
          enabled: true,
          kill_switch_engaged: false,
          dependencies: hostile.proxy as never,
        });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeNull();
    expect(harness).toMatchObject({
      enabled: true,
      status: "unavailable",
      observe: null,
      readback: null,
      reason_codes: ["integrity_provenance_dependencies_invalid"],
    });
    expect(harness?.counters).toEqual(zeroCounters);
    expect(hostile.counts).toEqual({
      ownKeys: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      get: 0,
      has: 0,
    });
  });

  test("separates private runtime provenance from public byte integrity", () => {
    const harness = action666cwHarness();
    const result = harness.observe!(BigInt(1));
    expect(result).toMatchObject({
      status: "verified",
      source_result_verified: true,
      runtime_authority_status: "provenance_verified",
      serialized_authority_status: "integrity_only",
      capsule_exposed: false,
      runtime_evidence: {
        integrity_verified: true,
        provenance_verified: true,
        provenance_scope: "current_process_only",
        trusted: true,
        admitted: false,
        capsule_exposed: false,
      },
      integrity_envelope: {
        integrity_verified: true,
        provenance_verified: false,
        authority_status: "integrity_only",
        trusted: false,
        admitted: false,
        capsule_exposed: false,
      },
      reason_codes: [],
    });
    expect(result.canonical_integrity_envelope_string).not.toContain(
      '"provenance_verified":true',
    );
    expect(result.canonical_integrity_envelope_string).toContain(
      '"provenance_verified":false',
    );
    expect(harness.counters).toMatchObject({
      request_reads: 1,
      predecessor_observations: 1,
      predecessor_verifications: 1,
      runtime_provenance_checks: 1,
      integrity_envelopes_built: 1,
    });
    expectRecursivelyFrozen(result);
  });

  test("requires the exact private result shell and originating harness", () => {
    const first = action666cwHarness();
    const second = action666cwHarness();
    const result = first.observe!(BigInt(2));
    for (const candidate of [structuredClone(result), { ...result }]) {
      expect(
        verifyCanonicalIntegrityProvenanceSeparatedObservationResult({
          request: BigInt(2),
          result: candidate,
          harness: first,
        }),
      ).toMatchObject({
        valid: false,
        reason_codes: ["integrity_provenance_untrusted_result_container"],
      });
    }
    expect(
      verifyCanonicalIntegrityProvenanceSeparatedObservationResult({
        request: BigInt(2),
        result,
        harness: second,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["integrity_provenance_originating_harness_mismatch"],
    });
    expect(
      verifyCanonicalIntegrityProvenanceSeparatedObservationResult({
        request: BigInt(2),
        result,
        harness: first,
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });
  });

  test("rejects result and harness proxies before caller traps", () => {
    const harness = action666cwHarness();
    const result = harness.observe!("1");
    const resultProxy = hostileProxy();
    const harnessProxy = hostileProxy();
    expect(
      verifyCanonicalIntegrityProvenanceSeparatedObservationResult({
        request: "1",
        result: resultProxy.proxy as never,
        harness,
      }),
    ).toMatchObject({ valid: false });
    expect(
      verifyCanonicalIntegrityProvenanceSeparatedObservationResult({
        request: "1",
        result,
        harness: harnessProxy.proxy,
      }),
    ).toMatchObject({ valid: false });
    expect(resultProxy.counts).toEqual({
      ownKeys: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      get: 0,
      has: 0,
    });
    expect(harnessProxy.counts).toEqual(resultProxy.counts);
  });

  test("canonical string and genuine Uint8Array read back as integrity only", () => {
    const result = action666cwEvaluate(BigInt(-1));
    const canonical = result.canonical_integrity_envelope_string!;
    for (const input of [canonical, action666cwCanonicalReadbackBytes(BigInt(-1))]) {
      expect(
        verifyCanonicalIntegrityProvenanceSeparatedObservationReadback(input),
      ).toMatchObject({
        terminal_status: "integrity_only",
        integrity_verified: true,
        provenance_verified: false,
        authority_status: "integrity_only",
        trusted: false,
        admitted: false,
        content_identity_claimed: true,
        reason_codes: [],
      });
    }
  });

  test("a self-consistent public forgery remains integrity-only and untrusted", () => {
    const canonical =
      action666cwEvaluate(true).canonical_integrity_envelope_string!;
    const forged = canonicalForgery(canonical);
    const readback =
      verifyCanonicalIntegrityProvenanceSeparatedObservationReadback(forged);
    expect(readback).toMatchObject({
      terminal_status: "integrity_only",
      integrity_verified: true,
      provenance_verified: false,
      authority_status: "integrity_only",
      trusted: false,
      admitted: false,
    });
    expect(readback.envelope?.source_result_digest).toBe("f".repeat(64));
  });

  test("distinguishes malformed, non-canonical and digest-mismatch bytes", () => {
    const canonical =
      action666cwEvaluate(null).canonical_integrity_envelope_string!;
    const wrongDigest = JSON.parse(canonical) as Record<string, unknown>;
    wrongDigest.envelope_digest = "0".repeat(64);
    const cases = [
      { input: "{", terminal: "malformed" },
      { input: new Uint8Array([0xff]), terminal: "malformed" },
      { input: ` ${canonical}`, terminal: "non_canonical" },
      {
        input: canonical.replace(
          '"envelope_version":',
          '"unexpected":true,"envelope_version":',
        ),
        terminal: "non_canonical",
      },
      {
        input: canonical.replace(
          '"envelope_version":',
          '"envelope_version":"duplicate","envelope_version":',
        ),
        terminal: "non_canonical",
      },
      { input: JSON.stringify(wrongDigest), terminal: "digest_mismatch" },
    ] as const;
    for (const entry of cases) {
      expect(
        verifyCanonicalIntegrityProvenanceSeparatedObservationReadback(
          entry.input,
        ),
      ).toMatchObject({
        terminal_status: entry.terminal,
        integrity_verified: false,
        provenance_verified: false,
        authority_status: "none",
        trusted: false,
        admitted: false,
        envelope: null,
      });
    }
  });

  test("rejects non-Uint8 inputs, proxies and oversized values without hooks", () => {
    const hostile = hostileProxy();
    for (const input of [
      {},
      [],
      new Uint16Array([1, 2]),
      new Uint8ClampedArray([1, 2]),
      new Float32Array([1]),
      new DataView(new ArrayBuffer(4)),
      new (class extends Uint8Array {})([1, 2]),
      new Proxy(new Uint8Array([1, 2]), {}),
      hostile.proxy,
      new Uint8Array(
        CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_MAX_READBACK_BYTES +
          1,
      ),
      "x".repeat(
        CANONICAL_INTEGRITY_PROVENANCE_SEPARATED_OBSERVATION_MAX_READBACK_BYTES +
          1,
      ),
    ]) {
      expect(
        verifyCanonicalIntegrityProvenanceSeparatedObservationReadback(input),
      ).toMatchObject({
        terminal_status: "input_rejected",
        integrity_verified: false,
        provenance_verified: false,
        trusted: false,
        admitted: false,
      });
    }
    expect(hostile.counts).toEqual({
      ownKeys: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      get: 0,
      has: 0,
    });
  });

  test("grants no authority to unsupported observation requests", () => {
    for (const input of [{}, [], Symbol("x"), () => true]) {
      expect(action666cwEvaluate(input)).toMatchObject({
        status: "rejected",
        runtime_evidence: null,
        integrity_envelope: null,
        runtime_authority_status: "none",
        serialized_authority_status: "none",
        content_identity_claimed: false,
      });
    }
  });

  test("captures JSON and private-map primordials before mutation", () => {
    const harness = action666cwHarness();
    const baseline = harness.observe!(0);
    const canonical = baseline.canonical_integrity_envelope_string!;
    const originalParse = JSON.parse;
    const originalStringify = JSON.stringify;
    const originalWeakMapGet = WeakMap.prototype.get;
    const originalWeakMapSet = WeakMap.prototype.set;
    let observed: ReturnType<NonNullable<typeof harness.observe>> = baseline;
    let readback: unknown;
    let verification: unknown;
    let thrown: unknown = null;
    try {
      JSON.parse = (() => {
        throw new Error("post_import_parse_poison");
      }) as never;
      JSON.stringify = (() => {
        throw new Error("post_import_stringify_poison");
      }) as never;
      WeakMap.prototype.get = (() => {
        throw new Error("post_import_weakmap_get_poison");
      }) as never;
      WeakMap.prototype.set = (() => {
        throw new Error("post_import_weakmap_set_poison");
      }) as never;
      observed = harness.observe!(0);
      readback = harness.readback!(canonical);
      verification =
        verifyCanonicalIntegrityProvenanceSeparatedObservationResult({
          request: 0,
          result: observed,
          harness,
        });
    } catch (error) {
      thrown = error;
    } finally {
      JSON.parse = originalParse;
      JSON.stringify = originalStringify;
      WeakMap.prototype.get = originalWeakMapGet;
      WeakMap.prototype.set = originalWeakMapSet;
    }
    expect(thrown).toBeNull();
    expect(observed).toEqual(baseline);
    expect(readback).toMatchObject({ terminal_status: "integrity_only" });
    expect(verification).toMatchObject({ valid: true });
  });

  test("contains downstream iterator drift without granting provenance", () => {
    const harness = action666cwHarness();
    const originalIterator = Array.prototype[Symbol.iterator];
    let result: ReturnType<NonNullable<typeof harness.observe>> | null = null;
    let thrown: unknown = null;
    try {
      Array.prototype[Symbol.iterator] = (() => {
        throw new Error("post_import_iterator_poison");
      }) as never;
      result = harness.observe!(0);
    } catch (error) {
      thrown = error;
    } finally {
      Array.prototype[Symbol.iterator] = originalIterator;
    }
    expect(thrown).toBeNull();
    expect(result).toMatchObject({
      status: "rejected",
      source_result_verified: false,
      runtime_evidence: null,
      integrity_envelope: null,
      runtime_authority_status: "none",
      serialized_authority_status: "none",
      content_identity_claimed: false,
    });
  });

  test("preserves deterministic primitive identities and golden evidence", () => {
    const scenarios = action666cwGoldenScenarios();
    expect(scenarios).toEqual(goldenReport.scenarios);
    expect(scenarios).toHaveLength(action666cwPrimitiveMatrix.length);
    expect(new Set(scenarios.map((entry) => entry.result_digest)).size).toBe(
      action666cwPrimitiveMatrix.length,
    );
    expect(goldenReport.safety).toEqual(expectedSafety);
    expect(goldenReport.performance_claims).toEqual([]);
  });

  test("remains server-only, private-runtime, provider-free and runtime-unwired", () => {
    expect(expectedSafety).toEqual(
      expect.objectContaining({
        live_impact: false,
        persistence_performed: false,
        automatic_training_allowed: false,
        automatic_model_change_allowed: false,
        automatic_promotion_allowed: false,
        external_ai_canonical_truth_authority: false,
        synthetic_evidence: true,
        not_publishable: true,
      }),
    );
    expect(
      Object.keys(authorityExports).some((name) =>
        /capsule|session|weakmap/i.test(name),
      ),
    ).toBe(false);
    expect(nodeTypes.isProxy(action666cwHarness())).toBe(false);
  });
});
