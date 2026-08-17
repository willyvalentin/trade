import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { types as nodeTypes } from "node:util";

import goldenReport from "@/docs/action-666cv-golden-private-atomic-observation-report.json";
import {
  action666cvCanonicalReadbackBytes,
  action666cvEvaluate,
  action666cvGoldenScenarios,
  action666cvHarness,
  action666cvPrimitiveMatrix,
} from "@/lib/server/canonical-private-atomic-observation-authority-fixtures";
import * as authorityExports from "@/lib/server/canonical-private-atomic-observation-authority";
import {
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_ARTIFACT_ROLES,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_STATUSES,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_STATUSES,
  createCanonicalPrivateAtomicObservationAuthorityHarness,
  verifyCanonicalPrivateAtomicObservationReadback,
  verifyCanonicalPrivateAtomicObservationResult,
} from "@/lib/server/canonical-private-atomic-observation-authority";
import { action666csDependencies } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import { action666cuHarness } from "@/lib/server/canonical-provenance-bound-observation-verification-fixtures";

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
  private_capsules_minted: 0,
  private_provenance_checks: 0,
  private_capsule_property_reads: 0,
  private_capsule_digest_rebuilds: 0,
  readback_reads: 0,
  readback_parse_operations: 0,
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

test.describe("Action 666CV current-main private atomic observation authority", () => {
  test("freezes exact versions, taxonomies and five-file scope", () => {
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION).toBe(
      "canonical_private_atomic_observation_authority_v2",
    );
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION).toBe(
      "canonical_private_atomic_observation_evidence_v2",
    );
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION).toBe(
      "canonical_private_atomic_observation_result_v2",
    );
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION).toBe(
      "canonical_private_atomic_observation_readback_v2",
    );
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES).toBe(
      65_536,
    );
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_STATUSES).toEqual([
      "verified",
      "rejected",
    ]);
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_STATUSES).toEqual([
      "integrity_verified",
      "rejected",
    ]);
    expect(Object.isFrozen(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_STATUSES)).toBe(
      true,
    );
    expect(
      Object.keys(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_ARTIFACT_ROLES),
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
      const harness = createCanonicalPrivateAtomicObservationAuthorityHarness(
        options as never,
      );
      expect(harness.enabled).toBe(false);
      expect(harness.observe).toBeNull();
      expect(harness.readback).toBeNull();
      expect(harness.counters).toEqual(zeroCounters);
    }
  });

  test("mints, verifies and discards one private capsule atomically", () => {
    const harness = action666cvHarness();
    const result = harness.observe!(BigInt(1));
    expect(result).toMatchObject({
      status: "verified",
      source_result_verified: true,
      capsule_exposed: false,
      evidence: {
        status: "verified",
        provenance_verified: true,
        capsule_exposed: false,
        primitive_type: "bigint",
        reason_codes: [],
      },
      reason_codes: [],
    });
    expect(Object.keys(result)).not.toContain("capsule");
    expect(Object.keys(result.evidence!)).not.toContain("capsule");
    expect(
      Object.values(result).some(
        (value) =>
          value !== null &&
          typeof value === "object" &&
          "capsule_version" in value,
      ),
    ).toBe(false);
    expect(harness.counters).toMatchObject({
      request_reads: 1,
      predecessor_executions: 1,
      predecessor_rebuilds: 1,
      private_capsules_minted: 1,
      private_provenance_checks: 1,
      private_capsule_property_reads: 1,
      private_capsule_digest_rebuilds: 1,
    });
    expect(
      verifyCanonicalPrivateAtomicObservationResult({
        request: BigInt(1),
        result,
        harness,
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });
    expectRecursivelyFrozen(result);
  });

  test("requires the exact private result shell and originating harness", () => {
    const first = action666cvHarness();
    const second = action666cvHarness();
    const result = first.observe!(BigInt(2));
    const repeated = first.observe!(BigInt(2));
    for (const candidate of [structuredClone(result), { ...result }]) {
      expect(
        verifyCanonicalPrivateAtomicObservationResult({
          request: BigInt(2),
          result: candidate,
          harness: first,
        }),
      ).toMatchObject({
        valid: false,
        reason_codes: ["private_atomic_untrusted_result_container"],
      });
    }
    expect(
      verifyCanonicalPrivateAtomicObservationResult({
        request: BigInt(2),
        result: { ...repeated, evidence: result.evidence },
        harness: first,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["private_atomic_untrusted_result_container"],
    });
    expect(
      verifyCanonicalPrivateAtomicObservationResult({
        request: BigInt(2),
        result,
        harness: second,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["private_atomic_originating_harness_mismatch"],
    });
    expect(
      verifyCanonicalPrivateAtomicObservationResult({
        request: BigInt(3),
        result,
        harness: first,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["private_atomic_result_rebuild_mismatch"],
    });
  });

  test("rejects unrecognized verifier proxies before every caller trap", () => {
    const { proxy, counts } = hostileProxy();
    expect(
      verifyCanonicalPrivateAtomicObservationResult({
        request: BigInt(1),
        result: proxy as never,
        harness: action666cvHarness(),
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["private_atomic_untrusted_result_container"],
    });
    expect(counts).toEqual({
      ownKeys: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      get: 0,
      has: 0,
    });
  });

  test("canonical strings and genuine Uint8Array bytes verify integrity only", () => {
    const result = action666cvEvaluate(BigInt(-17));
    const fromString = verifyCanonicalPrivateAtomicObservationReadback(
      result.canonical_evidence_string,
    );
    const fromBytes = verifyCanonicalPrivateAtomicObservationReadback(
      action666cvCanonicalReadbackBytes(BigInt(-17)),
    );
    for (const readback of [fromString, fromBytes]) {
      expect(readback).toMatchObject({
        status: "integrity_verified",
        provenance_verified: false,
        verifier_authority_granted: false,
        content_identity_claimed: true,
        reason_codes: [],
      });
      expect(readback.evidence).toEqual(result.evidence);
      expectRecursivelyFrozen(readback);
    }
    expect(fromString.readback_digest).toBe(fromBytes.readback_digest);
  });

  test("readback rejects arbitrary objects and proxies without hooks", () => {
    const { proxy, counts } = hostileProxy();
    for (const candidate of [{}, [], proxy]) {
      expect(
        verifyCanonicalPrivateAtomicObservationReadback(candidate),
      ).toMatchObject({
        status: "rejected",
        evidence: null,
        provenance_verified: false,
        verifier_authority_granted: false,
        observed_input_digest: null,
        content_identity_claimed: false,
        reason_codes: ["arbitrary_object_readback_rejected"],
      });
    }
    expect(counts).toEqual({
      ownKeys: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      get: 0,
      has: 0,
    });
  });

  test("readback rejects tampering, extras, duplicate keys and noncanonical order", () => {
    const result = action666cvEvaluate("canonical");
    const canonical = result.canonical_evidence_string!;
    const parsed = JSON.parse(canonical);
    const variants = [
      JSON.stringify({ ...parsed, evidence_digest: "0".repeat(64) }),
      JSON.stringify({ ...parsed, caller_approved: true }),
      JSON.stringify(Object.fromEntries(Object.entries(parsed).reverse())),
      canonical.replace(
        "{",
        '{"evidence_version":"attacker_duplicate",',
      ),
      ` ${canonical}`,
      "{",
    ];
    for (const variant of variants) {
      const readback = verifyCanonicalPrivateAtomicObservationReadback(variant);
      expect(readback.status).toBe("rejected");
      expect(readback.provenance_verified).toBe(false);
      expect(readback.verifier_authority_granted).toBe(false);
    }
  });

  test("rejects oversized and invalid UTF-8 bytes with bounded evidence", () => {
    expect(
      verifyCanonicalPrivateAtomicObservationReadback(
        "x".repeat(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES + 1),
      ),
    ).toMatchObject({
      status: "rejected",
      reason_codes: ["readback_too_large"],
    });
    expect(
      verifyCanonicalPrivateAtomicObservationReadback(
        new Uint8Array(
          CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES + 1,
        ),
      ),
    ).toMatchObject({
      status: "rejected",
      reason_codes: ["readback_too_large"],
    });
    expect(
      verifyCanonicalPrivateAtomicObservationReadback(
        new Uint8Array([0xff]),
      ),
    ).toMatchObject({
      status: "rejected",
      reason_codes: ["readback_bytes_invalid"],
    });
  });

  test("keeps primitive types and signed numeric edges distinct", () => {
    const values = [BigInt(1), BigInt(2), BigInt(-1), 1, "1", true, 0, -0];
    const results = values.map(action666cvEvaluate);
    for (const field of [
      "primitive_value_digest",
      "primitive_observation_digest",
      "atomic_capsule_identity",
      "atomic_capsule_digest",
      "evidence_digest",
    ] as const) {
      expect(new Set(results.map((result) => result.evidence?.[field])).size).toBe(
        values.length,
      );
    }
  });

  test("maps every NaN sign, payload and signaling form to one identity", () => {
    const values = [
      Number.NaN,
      nanWithBits(0x7ff80000, 0x00000001),
      nanWithBits(0x7ff80000, 0x00000002),
      nanWithBits(0x7ff00000, 0x00000001),
      nanWithBits(0xfff80000, 0x00000001),
    ];
    const results = values.map(action666cvEvaluate);
    for (const field of [
      "primitive_value_digest",
      "primitive_observation_digest",
      "atomic_capsule_identity",
      "atomic_capsule_digest",
      "evidence_digest",
    ] as const) {
      expect(new Set(results.map((result) => result.evidence?.[field])).size).toBe(
        1,
      );
    }
  });

  test("grants no atomic authority to nonrepresented or nonprimitive inputs", () => {
    for (const value of [
      Symbol("unrepresented"),
      () => undefined,
      "x".repeat(16_385),
      {},
      [],
    ]) {
      const harness = action666cvHarness();
      const result = harness.observe!(value);
      expect(result).toMatchObject({
        status: "rejected",
        source_result_verified: false,
        evidence: null,
        capsule_exposed: false,
        content_identity_claimed: false,
        reason_codes: ["private_atomic_authoritative_source_required"],
      });
      expect(
        verifyCanonicalPrivateAtomicObservationResult({
          request: value,
          result,
          harness,
        }),
      ).toMatchObject({
        valid: false,
        reason_codes: ["private_atomic_result_not_authoritative"],
      });
    }
  });

  test("captures local primordials before post-import mutation", () => {
    const harness = action666cvHarness();
    const originalWeakMapGet = WeakMap.prototype.get;
    const originalWeakMapSet = WeakMap.prototype.set;
    const originalFreeze = Object.freeze;
    const originalIsFrozen = Object.isFrozen;
    const originalSort = Array.prototype.sort;
    const originalIsProxy = nodeTypes.isProxy;
    const originalParse = JSON.parse;
    const originalStringify = JSON.stringify;
    const originalEncode = TextEncoder.prototype.encode;
    const originalDecode = TextDecoder.prototype.decode;
    let observed: ReturnType<NonNullable<typeof harness.observe>> | null = null;
    let readback: ReturnType<NonNullable<typeof harness.readback>> | null = null;
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
      JSON.parse = (() => {
        throw new Error("post_import_json_parse");
      }) as typeof JSON.parse;
      JSON.stringify = (() => {
        throw new Error("post_import_json_stringify");
      }) as typeof JSON.stringify;
      TextEncoder.prototype.encode = function () {
        throw new Error("post_import_text_encode");
      };
      TextDecoder.prototype.decode = function () {
        throw new Error("post_import_text_decode");
      };
      observed = harness.observe!(BigInt(9));
      readback = harness.readback!(observed.canonical_evidence_string);
    } catch (error) {
      thrown = error;
    } finally {
      WeakMap.prototype.get = originalWeakMapGet;
      WeakMap.prototype.set = originalWeakMapSet;
      Object.freeze = originalFreeze;
      Object.isFrozen = originalIsFrozen;
      Array.prototype.sort = originalSort;
      nodeTypes.isProxy = originalIsProxy;
      JSON.parse = originalParse;
      JSON.stringify = originalStringify;
      TextEncoder.prototype.encode = originalEncode;
      TextDecoder.prototype.decode = originalDecode;
    }
    expect(thrown).toBeNull();
    expect(observed).toMatchObject({ status: "verified", reason_codes: [] });
    expect(readback).toMatchObject({
      status: "integrity_verified",
      provenance_verified: false,
      verifier_authority_granted: false,
    });
    expectRecursivelyFrozen(observed);
    expectRecursivelyFrozen(readback);
  });

  test("contains downstream Array prototype drift without granting authority", () => {
    const harness = action666cvHarness();
    const original = Object.getOwnPropertyDescriptor(Array.prototype, "0");
    let result: ReturnType<NonNullable<typeof harness.observe>> | null = null;
    let thrown: unknown = null;
    try {
      Object.defineProperty(Array.prototype, "0", {
        configurable: true,
        set() {
          throw new Error("post_import_array_index_setter");
        },
      });
      result = harness.observe!(BigInt(9));
    } catch (error) {
      thrown = error;
    } finally {
      if (original) Object.defineProperty(Array.prototype, "0", original);
      else delete (Array.prototype as unknown as Record<string, unknown>)["0"];
    }
    expect(thrown).toBeNull();
    expect(result).not.toBeNull();
    expect(result!.status).toBe("rejected");
    expect(result!.evidence).toBeNull();
    expect(result!.capsule_exposed).toBe(false);
    expectRecursivelyFrozen(result);
  });

  test("ignores inherited JSON hook drift without changing authority", () => {
    const harness = action666cvHarness();
    const baseline = harness.observe!(BigInt(9));
    const original = Object.getOwnPropertyDescriptor(Object.prototype, "toJSON");
    let result: ReturnType<NonNullable<typeof harness.observe>> | null = null;
    let thrown: unknown = null;
    try {
      Object.defineProperty(Object.prototype, "toJSON", {
        configurable: true,
        value() {
          return { poisoned: true };
        },
        writable: true,
      });
      result = harness.observe!(BigInt(9));
    } catch (error) {
      thrown = error;
    } finally {
      if (original) Object.defineProperty(Object.prototype, "toJSON", original);
      else delete (Object.prototype as Record<string, unknown>).toJSON;
    }
    expect(thrown).toBeNull();
    expect(result).not.toBeNull();
    expect(result).toEqual(baseline);
    expect(result!.status).toBe("verified");
    expect(result!.evidence).not.toBeNull();
    expect(result!.capsule_exposed).toBe(false);
    expectRecursivelyFrozen(result);
  });

  test("is deterministic across retry, primitive order and predecessor use", () => {
    for (const { value } of action666cvPrimitiveMatrix) {
      expect(action666cvEvaluate(value)).toEqual(action666cvEvaluate(value));
    }
    const forward = action666cvGoldenScenarios();
    const reverse = [...action666cvPrimitiveMatrix]
      .reverse()
      .map(({ name, value }) => ({
        name,
        result_digest: action666cvEvaluate(value).result_digest,
      }))
      .sort((left, right) => (left.name < right.name ? -1 : 1));
    expect(
      forward
        .map(({ name, result_digest }) => ({ name, result_digest }))
        .sort((left, right) => (left.name < right.name ? -1 : 1)),
    ).toEqual(reverse);
    expect(action666cuHarness().evaluate!(BigInt(1)).status).toBe("verified");
    expect(action666cvEvaluate(BigInt(1)).status).toBe("verified");
  });

  test("matches deterministic synthetic golden evidence", () => {
    const generated = {
      report_version:
        "action_666cv_golden_private_atomic_observation_report_v1",
      authority_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION,
      evidence_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
      result_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION,
      readback_version: CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION,
      scenarios: action666cvGoldenScenarios(),
      safety: expectedSafety,
      performance_claims: [],
    };
    if (process.env.ACTION_666CV_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666CV_GOLDEN=${JSON.stringify(generated)}`);
    }
    expect(generated).toEqual(goldenReport);
  });

  test("remains server-only, private-mint, provider-free and runtime-unwired", () => {
    const root = process.cwd();
    const moduleName = "canonical-private-atomic-observation-authority";
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
    expect(implementation).toContain("function mintPrivateCapsule(");
    expect(implementation).not.toMatch(
      /export (?:async )?function \w*(?:mint|capsuleFactory|factoryCapsule)/i,
    );
    expect(
      Object.keys(authorityExports).some((name) =>
        /mint|capsule.*factory|factory.*capsule/i.test(name),
      ),
    ).toBe(false);
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
    expect(action666csDependencies()).toBeDefined();
  });
});
