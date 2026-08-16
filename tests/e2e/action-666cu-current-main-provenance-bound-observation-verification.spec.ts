import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { types as nodeTypes } from "node:util";

import goldenReport from "@/docs/action-666cu-golden-provenance-bound-observation-report.json";
import {
  action666cuEvaluate,
  action666cuGoldenScenarios,
  action666cuHarness,
  action666cuPrimitiveMatrix,
} from "@/lib/server/canonical-provenance-bound-observation-verification-fixtures";
import {
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_ARTIFACT_ROLES,
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION,
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION,
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_STATUSES,
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION,
  canonicalProvenanceBoundObservationDigest,
  createCanonicalProvenanceBoundObservationVerificationHarness,
  verifyCanonicalProvenanceBoundObservationCapsule,
  verifyCanonicalProvenanceBoundObservationResult,
} from "@/lib/server/canonical-provenance-bound-observation-verification";

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
  predecessor_executions: 0,
  predecessor_rebuilds: 0,
  capsules_minted: 0,
  provenance_checks: 0,
  capsule_property_reads: 0,
  capsule_digest_rebuilds: 0,
  digest_operations: 0,
} as const;

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

function nanWithBits(high: number, low: number) {
  const view = new DataView(new ArrayBuffer(8));
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);
  return view.getFloat64(0, false);
}

test.describe("Action 666CU current-main provenance-bound observation verification", () => {
  test("freezes exact versions, taxonomy and five-file scope", () => {
    expect(CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION).toBe(
      "canonical_provenance_bound_observation_capsule_v2",
    );
    expect(CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION).toBe(
      "canonical_provenance_bound_observation_verification_v2",
    );
    expect(CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION).toBe(
      "canonical_provenance_bound_observation_result_v2",
    );
    expect(CANONICAL_PROVENANCE_BOUND_OBSERVATION_STATUSES).toEqual([
      "verified",
      "rejected",
    ]);
    expect(Object.isFrozen(CANONICAL_PROVENANCE_BOUND_OBSERVATION_STATUSES)).toBe(
      true,
    );
    expect(
      Object.keys(CANONICAL_PROVENANCE_BOUND_OBSERVATION_ARTIFACT_ROLES),
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
      const harness = createCanonicalProvenanceBoundObservationVerificationHarness(
        options as never,
      );
      expect(harness.enabled).toBe(false);
      expect(harness.evaluate).toBeNull();
      expect(harness.counters).toEqual(zeroCounters);
    }
  });

  test("mints only through the private harness and verifies the originating result", () => {
    const harness = action666cuHarness();
    const result = harness.evaluate!(BigInt(1));
    expect(result).toMatchObject({
      status: "verified",
      source_result_verified: true,
      verification: {
        status: "verified",
        provenance_verified: true,
        recognized_capsule: true,
        content_identity_claimed: true,
        reason_codes: [],
      },
      reason_codes: [],
    });
    expect(result.capsule).not.toBeNull();
    expect(
      verifyCanonicalProvenanceBoundObservationCapsule(result.capsule),
    ).toMatchObject({
      status: "verified",
      provenance_verified: true,
      recognized_capsule: true,
    });
    expect(
      verifyCanonicalProvenanceBoundObservationResult({
        request: BigInt(1),
        result,
        harness,
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });
    expectRecursivelyFrozen(result);
  });

  test("rejects unknown proxies before every caller trap", () => {
    const { proxy, counts } = hostileProxy();
    const result = verifyCanonicalProvenanceBoundObservationCapsule(proxy);
    expect(result).toMatchObject({
      status: "rejected",
      provenance_verified: false,
      recognized_capsule: false,
      content_identity_claimed: false,
      capsule_identity: null,
      capsule_digest: null,
      reason_codes: ["provenance_bound_untrusted_observation_container"],
    });
    expect(counts).toEqual({
      ownKeys: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      get: 0,
      has: 0,
    });
    expect(JSON.stringify(result)).not.toContain("caller_");
  });

  test("rejects unknown accessors, iterators and toJSON without reads", () => {
    let calls = 0;
    const candidate = {};
    for (const key of [
      "capsule_version",
      "capsule_identity",
      "observation",
      "capsule_digest",
      "toJSON",
      Symbol.iterator,
    ]) {
      Object.defineProperty(candidate, key, {
        enumerable: true,
        get() {
          calls += 1;
          throw new Error("caller_accessor_message");
        },
      });
    }
    expect(verifyCanonicalProvenanceBoundObservationCapsule(candidate)).toMatchObject(
      {
        status: "rejected",
        recognized_capsule: false,
        content_identity_claimed: false,
      },
    );
    expect(calls).toBe(0);
  });

  test("rejects exact clones and copied result shells despite matching public digests", () => {
    const harness = action666cuHarness();
    const result = harness.evaluate!(BigInt(2));
    const clonedCapsule = structuredClone(result.capsule);
    expect(
      verifyCanonicalProvenanceBoundObservationCapsule(clonedCapsule),
    ).toMatchObject({
      status: "rejected",
      recognized_capsule: false,
      content_identity_claimed: false,
    });
    expect(
      verifyCanonicalProvenanceBoundObservationResult({
        request: BigInt(2),
        result: structuredClone(result),
        harness,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["provenance_bound_untrusted_observation_container"],
    });
    expect(() => canonicalProvenanceBoundObservationDigest(result)).not.toThrow();
  });

  test("binds capsule provenance to one private harness session", () => {
    const first = action666cuHarness();
    const second = action666cuHarness();
    const result = first.evaluate!(BigInt(7));
    expect(
      verifyCanonicalProvenanceBoundObservationResult({
        request: BigInt(7),
        result,
        harness: second,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["provenance_bound_originating_harness_mismatch"],
    });
    expect(
      verifyCanonicalProvenanceBoundObservationResult({
        request: BigInt(8),
        result,
        harness: first,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["provenance_bound_result_rebuild_mismatch"],
    });
  });

  test("keeps BigInt signs and same-text primitive types distinct", () => {
    const values = [BigInt(1), BigInt(2), BigInt(-1), 1, "1", true];
    const results = values.map(action666cuEvaluate);
    for (const field of [
      "primitive_value_digest",
      "primitive_observation_digest",
      "capsule_identity",
      "capsule_digest",
    ] as const) {
      expect(new Set(results.map((result) => result.capsule?.[field])).size).toBe(
        values.length,
      );
    }
  });

  test("maps all NaN payloads to one provenance identity", () => {
    const values = [
      Number.NaN,
      nanWithBits(0x7ff80000, 0x00000001),
      nanWithBits(0x7ff80000, 0x00000002),
      nanWithBits(0x7ff00000, 0x00000001),
      nanWithBits(0xfff80000, 0x00000001),
    ];
    const results = values.map(action666cuEvaluate);
    for (const field of [
      "primitive_value_digest",
      "primitive_observation_digest",
      "capsule_identity",
      "capsule_digest",
    ] as const) {
      expect(new Set(results.map((result) => result.capsule?.[field])).size).toBe(
        1,
      );
    }
  });

  test("grants no capsule authority to non-represented or non-primitive inputs", () => {
    for (const value of [
      Symbol("unrepresented"),
      () => undefined,
      "x".repeat(16_385),
      {},
      [],
    ]) {
      const harness = action666cuHarness();
      const result = harness.evaluate!(value);
      expect(result).toMatchObject({
        status: "rejected",
        capsule: null,
        verification: {
          provenance_verified: false,
          content_identity_claimed: false,
          reason_codes: [
            "provenance_bound_lossless_primitive_authority_required",
          ],
        },
      });
      expect(
        verifyCanonicalProvenanceBoundObservationResult({
          request: value,
          result,
          harness,
        }),
      ).toMatchObject({
        valid: false,
        reason_codes: ["provenance_bound_result_not_authoritative"],
      });
    }
  });

  test("uses captured local primordials after import", () => {
    const harness = action666cuHarness();
    const originalWeakMapGet = WeakMap.prototype.get;
    const originalWeakMapSet = WeakMap.prototype.set;
    const originalFreeze = Object.freeze;
    const originalIsFrozen = Object.isFrozen;
    const originalSort = Array.prototype.sort;
    const originalIsProxy = nodeTypes.isProxy;
    let result: ReturnType<NonNullable<typeof harness.evaluate>> | null = null;
    let thrown: unknown = null;
    try {
      WeakMap.prototype.get = function () {
        throw new Error("post_import_weakmap_get");
      };
      WeakMap.prototype.set = function () {
        throw new Error("post_import_weakmap_set");
      };
      Object.freeze = ((value: unknown) => value) as typeof Object.freeze;
      Object.isFrozen = (() => false) as typeof Object.isFrozen;
      Array.prototype.sort = function () {
        throw new Error("post_import_array_sort");
      };
      nodeTypes.isProxy = (() => false) as typeof nodeTypes.isProxy;
      result = harness.evaluate!(BigInt(9));
    } catch (error) {
      thrown = error;
    } finally {
      WeakMap.prototype.get = originalWeakMapGet;
      WeakMap.prototype.set = originalWeakMapSet;
      Object.freeze = originalFreeze;
      Object.isFrozen = originalIsFrozen;
      Array.prototype.sort = originalSort;
      nodeTypes.isProxy = originalIsProxy;
    }
    expect(thrown).toBeNull();
    expect(result).toMatchObject({ status: "verified", reason_codes: [] });
    expectRecursivelyFrozen(result);
  });

  test("is deterministic across retry and primitive order", () => {
    for (const { value } of action666cuPrimitiveMatrix) {
      expect(action666cuEvaluate(value)).toEqual(action666cuEvaluate(value));
    }
    const forward = action666cuGoldenScenarios();
    const reverse = [...action666cuPrimitiveMatrix]
      .reverse()
      .map(({ name, value }) => {
        const result = action666cuEvaluate(value);
        return { name, result_digest: result.result_digest };
      })
      .sort((left, right) => (left.name < right.name ? -1 : 1));
    expect(
      forward
        .map(({ name, result_digest }) => ({ name, result_digest }))
        .sort((left, right) => (left.name < right.name ? -1 : 1)),
    ).toEqual(reverse);
  });

  test("matches deterministic synthetic golden evidence", () => {
    const generated = {
      report_version:
        "action_666cu_golden_provenance_bound_observation_report_v1",
      capsule_version:
        CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION,
      verification_version:
        CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION,
      result_version: CANONICAL_PROVENANCE_BOUND_OBSERVATION_RESULT_VERSION,
      scenarios: action666cuGoldenScenarios(),
      safety: expectedSafety,
      performance_claims: [],
    };
    if (process.env.ACTION_666CU_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666CU_GOLDEN=${JSON.stringify(generated)}`);
    }
    expect(generated).toEqual(goldenReport);
  });

  test("remains server-only, private-mint, provider-free and runtime-unwired", () => {
    const root = process.cwd();
    const moduleName =
      "canonical-provenance-bound-observation-verification";
    const implementation = fs.readFileSync(
      path.join(root, `lib/server/${moduleName}.ts`),
      "utf8",
    );
    const fixture = fs.readFileSync(
      path.join(root, `lib/server/${moduleName}-fixtures.ts`),
      "utf8",
    );
    for (const [file, source] of [
      [moduleName, implementation],
      [`${moduleName}-fixtures`, fixture],
    ]) {
      expect(source.startsWith('import "server-only";'), file).toBe(true);
      expect(source, file).not.toMatch(
        /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|generateKeyPair|privateKey|@supabase|createClient|fetch\(|process\.env|child_process|app\/api/,
      );
    }
    expect(implementation).not.toMatch(
      /export function mintCanonicalProvenanceBoundObservation/,
    );
    const imports: string[] = [];
    for (const liveRoot of ["app", "components", "pages"]) {
      const absolute = path.join(root, liveRoot);
      if (!fs.existsSync(absolute)) continue;
      const pending = [absolute];
      while (pending.length > 0) {
        const current = pending.pop()!;
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
          const nested = path.join(current, entry.name);
          if (entry.isDirectory()) pending.push(nested);
          else if (
            /\.[cm]?[jt]sx?$/.test(entry.name) &&
            fs.readFileSync(nested, "utf8").includes(moduleName)
          ) {
            imports.push(path.relative(root, nested));
          }
        }
      }
    }
    expect(imports).toEqual([]);
  });
});
