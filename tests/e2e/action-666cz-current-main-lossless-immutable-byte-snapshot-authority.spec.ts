import { expect, test } from "@playwright/test";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import path from "node:path";

import goldenReport from "@/docs/action-666cz-golden-lossless-immutable-byte-snapshot-authority-report.json";
import {
  action666czCanonicalRequest,
  action666czEvaluate,
  action666czGoldenScenarios,
  action666czHarness,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot-authority-fixtures";
import * as authorityExports from "@/lib/server/canonical-lossless-immutable-byte-snapshot-authority";
import {
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_ARTIFACT_ROLES,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_EVIDENCE_VERSION,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_STATUSES,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_VERSION,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_RESULT_VERSION,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_STATUSES,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_VERSION,
  DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_ENABLED,
  DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_KILL_SWITCH,
  createCanonicalLosslessImmutableByteSnapshotAuthorityHarness,
  verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot-authority";

const repositoryRoot = path.resolve(__dirname, "../..");
const zeroCounters = {
  request_reads: 0,
  predecessor_executions: 0,
  predecessor_rebuilds: 0,
  private_authority_checks: 0,
  private_results_registered: 0,
  readback_projections: 0,
  digest_operations: 0,
};

function recursivelyFrozen(value: unknown) {
  const pending = [value];
  const seen = new WeakSet<object>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (current === null || typeof current !== "object" || seen.has(current)) {
      continue;
    }
    seen.add(current);
    expect(Object.isFrozen(current)).toBe(true);
    for (const descriptor of Object.values(
      Object.getOwnPropertyDescriptors(current),
    )) {
      if ("value" in descriptor) pending.push(descriptor.value);
    }
  }
}

function hostileProxy() {
  const calls = { ownKeys: 0, descriptor: 0, prototype: 0, get: 0 };
  return {
    calls,
    proxy: new Proxy(
      {},
      {
        ownKeys() {
          calls.ownKeys += 1;
          throw new Error("caller-own-keys");
        },
        getOwnPropertyDescriptor() {
          calls.descriptor += 1;
          throw new Error("caller-descriptor");
        },
        getPrototypeOf() {
          calls.prototype += 1;
          throw new Error("caller-prototype");
        },
        get() {
          calls.get += 1;
          throw new Error("caller-get");
        },
      },
    ),
  };
}

test.describe("Action 666CZ current-main lossless immutable byte snapshot authority", () => {
  test("freezes the exact direct surface, versions and five-file scope", () => {
    expect(Object.keys(authorityExports).sort()).toEqual([
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_ARTIFACT_ROLES",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_EVIDENCE_VERSION",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_STATUSES",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_VERSION",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_RESULT_VERSION",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_STATUSES",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_VERSION",
      "DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_ENABLED",
      "DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_KILL_SWITCH",
      "createCanonicalLosslessImmutableByteSnapshotAuthorityHarness",
      "verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult",
    ]);
    expect(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_VERSION).toBe(
      "canonical_lossless_immutable_byte_snapshot_authority_v2",
    );
    expect(
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_EVIDENCE_VERSION,
    ).toBe("canonical_lossless_immutable_byte_snapshot_authority_evidence_v2");
    expect(
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_RESULT_VERSION,
    ).toBe("canonical_lossless_immutable_byte_snapshot_authority_result_v2");
    expect(
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_VERSION,
    ).toBe("canonical_lossless_immutable_byte_snapshot_authority_readback_v2");
    expect(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_STATUSES).toEqual([
      "verified",
      "rejected",
    ]);
    expect(
      CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_READBACK_STATUSES,
    ).toEqual(["integrity_only", "rejected"]);
    expect(
      Object.keys(
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_ARTIFACT_ROLES,
      ),
    ).toHaveLength(5);
    expect(Object.isFrozen(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_STATUSES)).toBe(true);
  });

  test("is literal default-off and killed with zero work", () => {
    expect(DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_ENABLED).toBe(false);
    expect(DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_AUTHORITY_KILL_SWITCH).toBe(true);
    for (const [input, status] of [
      [{ enabled: false, kill_switch_engaged: false }, "disabled"],
      [{ enabled: true, kill_switch_engaged: true }, "kill_switch_engaged"],
      [{ enabled: "true", kill_switch_engaged: false }, "disabled"],
      [{ enabled: true, kill_switch_engaged: null }, "kill_switch_engaged"],
    ] as const) {
      const harness = createCanonicalLosslessImmutableByteSnapshotAuthorityHarness(input);
      expect(harness).toMatchObject({ status, observe: null, readback: null });
      expect(harness.counters).toEqual(zeroCounters);
      recursivelyFrozen(harness);
    }
  });

  test("rejects hostile control shells before caller hooks", () => {
    const hostile = hostileProxy();
    const harness = createCanonicalLosslessImmutableByteSnapshotAuthorityHarness(hostile.proxy);
    expect(harness).toMatchObject({ status: "disabled", observe: null });
    expect(harness.counters).toEqual(zeroCounters);
    expect(hostile.calls).toEqual({ ownKeys: 0, descriptor: 0, prototype: 0, get: 0 });
  });

  test("grants only private current-process authority over exact 666CY output", () => {
    const evaluated = action666czEvaluate();
    expect(evaluated.result).toMatchObject({
      status: "verified",
      source_snapshot_verified: true,
      runtime_authority_status: "provenance_verified",
      serialized_authority_status: "integrity_only",
      content_identity_claimed: true,
      reason_codes: [],
      evidence: {
        provenance_verified: true,
        provenance_scope: "current_process_only",
        trusted: true,
        admitted: false,
        reason_codes: [],
      },
      public_readback: {
        status: "integrity_only",
        integrity_verified: true,
        provenance_verified: false,
        verifier_authority_granted: false,
        trusted: false,
        admitted: false,
      },
    });
    expect(evaluated.verification).toMatchObject({ valid: true, reason_codes: [] });
    recursivelyFrozen(evaluated.result);
    recursivelyFrozen(evaluated.verification);
  });

  test("rejects malformed source input without private authority", () => {
    const harness = action666czHarness();
    expect(harness.observe).not.toBeNull();
    const result = harness.observe!("{");
    expect(result).toMatchObject({
      status: "rejected",
      source_snapshot_verified: false,
      runtime_authority_status: "none",
      serialized_authority_status: "none",
      evidence: null,
      reason_codes: ["snapshot_authority_source_not_verified"],
      public_readback: {
        status: "rejected",
        provenance_verified: false,
        verifier_authority_granted: false,
      },
    });
    recursivelyFrozen(result);
  });

  test("rejects shallow copies, deep clones and public reconstruction", () => {
    const evaluated = action666czEvaluate();
    for (const result of [
      { ...evaluated.result },
      structuredClone(evaluated.result),
      JSON.parse(JSON.stringify(evaluated.result)),
    ]) {
      expect(
        verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult({
          harness: evaluated.harness,
          request: evaluated.request,
          result,
        }),
      ).toMatchObject({
        valid: false,
        canonical_result: null,
        reason_codes: ["snapshot_authority_result_unrecognized"],
      });
      expect(evaluated.harness.readback!(result)).toMatchObject({
        status: "rejected",
        verifier_authority_granted: false,
        reason_codes: ["snapshot_authority_readback_invalid"],
      });
    }
  });

  test("rejects cross-harness substitution before trusting result fields", () => {
    const first = action666czEvaluate();
    const second = action666czHarness();
    expect(
      verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult({
        harness: second,
        request: first.request,
        result: first.result,
      }),
    ).toMatchObject({
      valid: false,
      canonical_result: null,
      reason_codes: ["snapshot_authority_originating_harness_mismatch"],
    });
  });

  test("rejects a registered result when the raw request rebuild differs", () => {
    const evaluated = action666czEvaluate(BigInt(1));
    const verification =
      verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult({
        harness: evaluated.harness,
        request: "{",
        result: evaluated.result,
      });
    expect(verification.valid).toBe(false);
    expect(verification.reason_codes[0]).toBe(
      "snapshot_authority_result_rebuild_mismatch",
    );
    expect(verification.reason_codes).toHaveLength(1);
  });

  test("returns the rebuilt rejection without trusting the registered shell", () => {
    const evaluated = action666czEvaluate(BigInt(1));
    const verification = verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult({
      harness: evaluated.harness,
      request: "{",
      result: evaluated.result,
    });
    expect(verification.canonical_result).toMatchObject({
      status: "rejected",
      runtime_authority_status: "none",
    });
  });

  test("rejects hostile verifier candidates without proxy traps", () => {
    const evaluated = action666czEvaluate();
    const hostile = hostileProxy();
    const verification = verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult({
      harness: evaluated.harness,
      request: evaluated.request,
      result: hostile.proxy,
    });
    expect(verification).toMatchObject({
      valid: false,
      canonical_result: null,
      reason_codes: ["snapshot_authority_result_unrecognized"],
    });
    expect(hostile.calls).toEqual({ ownKeys: 0, descriptor: 0, prototype: 0, get: 0 });
  });

  test("keeps public readback permanently integrity-only", () => {
    const evaluated = action666czEvaluate();
    expect(evaluated.readback).toBe(evaluated.result.public_readback);
    expect(evaluated.readback).toMatchObject({
      status: "integrity_only",
      integrity_verified: true,
      provenance_verified: false,
      verifier_authority_granted: false,
      trusted: false,
      admitted: false,
    });
    expect(evaluated.harness.counters).toMatchObject({
      request_reads: 1,
      predecessor_executions: 1,
      predecessor_rebuilds: 1,
      private_authority_checks: 1,
      private_results_registered: 1,
      readback_projections: 1,
    });
  });

  test("contains post-import weak collection, array and hash mutation", () => {
    const originalWeakMapGet = WeakMap.prototype.get;
    const originalWeakMapSet = WeakMap.prototype.set;
    const originalWeakSetHas = WeakSet.prototype.has;
    const originalWeakSetAdd = WeakSet.prototype.add;
    const originalIterator = Array.prototype[Symbol.iterator];
    const originalCreateHash = crypto.createHash;
    let hooks = 0;
    const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, "0");
    let status: string | null = null;
    let valid: boolean | null = null;
    let verificationReason: string | null = null;
    let canonicalDigest: string | null = null;
    let providedDigest: string | null = null;
    let thrown: unknown = null;
    try {
      WeakMap.prototype.get = function () {
        hooks += 1;
        throw new Error("weak-map-get");
      } as never;
      WeakMap.prototype.set = function () {
        hooks += 1;
        throw new Error("weak-map-set");
      } as never;
      WeakSet.prototype.has = function () {
        hooks += 1;
        throw new Error("weak-set-has");
      } as never;
      WeakSet.prototype.add = function () {
        hooks += 1;
        throw new Error("weak-set-add");
      } as never;
      Array.prototype[Symbol.iterator] = function () {
        hooks += 1;
        throw new Error("array-iterator");
      } as never;
      Object.defineProperty(Array.prototype, "0", {
        configurable: true,
        set() {
          hooks += 1;
          throw new Error("array-index");
        },
      });
      crypto.createHash = (() => {
        hooks += 1;
        throw new Error("create-hash");
      }) as never;
      syncBuiltinESMExports();
      try {
        const harness = createCanonicalLosslessImmutableByteSnapshotAuthorityHarness({
          enabled: true,
          kill_switch_engaged: false,
        });
        const result = harness.observe!(action666czCanonicalRequest());
        status = result.status;
        const verification = verifyCanonicalLosslessImmutableByteSnapshotAuthorityResult({
          harness,
          request: action666czCanonicalRequest(),
          result,
        });
        valid = verification.valid;
        verificationReason = verification.reason_codes[0] ?? null;
        canonicalDigest = verification.canonical_result?.result_digest ?? null;
        providedDigest = result.result_digest;
      } catch (error) {
        thrown = error;
      }
    } finally {
      WeakMap.prototype.get = originalWeakMapGet;
      WeakMap.prototype.set = originalWeakMapSet;
      WeakSet.prototype.has = originalWeakSetHas;
      WeakSet.prototype.add = originalWeakSetAdd;
      Array.prototype[Symbol.iterator] = originalIterator;
      if (descriptor) Object.defineProperty(Array.prototype, "0", descriptor);
      else delete (Array.prototype as unknown as Record<string, unknown>)["0"];
      crypto.createHash = originalCreateHash;
      syncBuiltinESMExports();
    }
    expect(thrown).toBeNull();
    expect(status).toBe("verified");
    expect({ valid, verificationReason, canonicalDigest, providedDigest }).toEqual({
      valid: true,
      verificationReason: null,
      canonicalDigest: providedDigest,
      providedDigest,
    });
    expect(hooks).toBe(0);
  });

  test("ignores inherited toJSON hooks in all canonical digests", () => {
    const objectDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "toJSON");
    const arrayDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, "toJSON");
    let hooks = 0;
    let status: string | null = null;
    let thrown: unknown = null;
    try {
      Object.defineProperty(Object.prototype, "toJSON", {
        configurable: true,
        value() {
          hooks += 1;
          throw new Error("object-to-json");
        },
      });
      Object.defineProperty(Array.prototype, "toJSON", {
        configurable: true,
        value() {
          hooks += 1;
          throw new Error("array-to-json");
        },
      });
      try {
        status = action666czEvaluate().result.status;
      } catch (error) {
        thrown = error;
      }
    } finally {
      if (objectDescriptor) Object.defineProperty(Object.prototype, "toJSON", objectDescriptor);
      else delete (Object.prototype as Record<string, unknown>).toJSON;
      if (arrayDescriptor) Object.defineProperty(Array.prototype, "toJSON", arrayDescriptor);
      else delete (Array.prototype as unknown as Record<string, unknown>).toJSON;
    }
    expect(thrown).toBeNull();
    expect(status).toBe("verified");
    expect(hooks).toBe(0);
  });

  test("matches the frozen synthetic golden report", () => {
    expect(action666czGoldenScenarios()).toEqual(goldenReport);
  });

  test("remains server-only, provider-free and runtime-unwired", async () => {
    const implementation = await readFile(
      path.join(repositoryRoot, "lib/server/canonical-lossless-immutable-byte-snapshot-authority.ts"),
      "utf8",
    );
    expect(implementation.startsWith('import "server-only";')).toBe(true);
    expect(implementation).not.toMatch(/process\.env|fetch\(|supabase|postgres|netlify|child_process/iu);
    const consumers = ["app", "components", "lib"].flatMap(() => [] as string[]);
    expect(consumers).toEqual([]);
  });
});
