import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import * as authorityExports from "@/lib/server/canonical-private-atomic-observation-authority";
import {
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_ARTIFACT_ROLES,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION,
  CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION,
  createCanonicalPrivateAtomicObservationHarness,
  observeCanonicalPrimitiveAtomically,
  verifyCanonicalPrivateAtomicObservationReadback,
  type CanonicalPrivateAtomicObservationCounters,
} from "@/lib/server/canonical-private-atomic-observation-authority";
import {
  action666cbCanonicalReadbackBytes,
  action666cbEvaluate,
  action666cbGoldenScenarios,
  action666cbPrimitiveMatrix,
} from "@/lib/server/canonical-private-atomic-observation-authority-fixtures";
import {
  mintCanonicalProvenanceBoundObservationCapsule,
  verifyCanonicalProvenanceBoundObservationCapsule,
} from "@/lib/server/canonical-provenance-bound-observation-verification";
import { action666bzEvaluate } from "@/lib/server/canonical-provenance-bound-observation-verification-fixtures";
import { action666bxIssue } from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures";
import { action666bvIssue } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import goldenReport from "../../docs/action-666cb-golden-private-atomic-observation-report.json";

const expectedExports = [
  "CANONICAL_PRIVATE_ATOMIC_OBSERVATION_ARTIFACT_ROLES",
  "CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION",
  "CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION",
  "CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES",
  "CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION",
  "CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION",
  "DEFAULT_OFF_PRIVATE_ATOMIC_OBSERVATION_ENABLED",
  "DEFAULT_OFF_PRIVATE_ATOMIC_OBSERVATION_KILL_SWITCH",
  "createCanonicalPrivateAtomicObservationHarness",
  "observeCanonicalPrimitiveAtomically",
  "verifyCanonicalPrivateAtomicObservationReadback",
].sort();

function counters(): CanonicalPrivateAtomicObservationCounters {
  return {
    request_reads: 0,
    capsule_mints: 0,
    provenance_checks: 0,
    capsule_property_reads: 0,
    readback_reads: 0,
    parse_operations: 0,
    digest_operations: 0,
  };
}

function hookProbe() {
  const observed = {
    ownKeys: 0,
    descriptor: 0,
    prototype: 0,
    get: 0,
    iterator: 0,
    accessor: 0,
  };
  const target = Object.create(null);
  Object.defineProperty(target, "evidence_digest", {
    enumerable: true,
    get() {
      observed.accessor += 1;
      throw new Error("caller_accessor_message");
    },
  });
  const proxy = new Proxy(target, {
    ownKeys() {
      observed.ownKeys += 1;
      throw new Error("caller_own_keys_message");
    },
    getOwnPropertyDescriptor() {
      observed.descriptor += 1;
      throw new Error("caller_descriptor_message");
    },
    getPrototypeOf() {
      observed.prototype += 1;
      throw new Error("caller_prototype_message");
    },
    get(_target, property) {
      if (property === Symbol.iterator) observed.iterator += 1;
      else observed.get += 1;
      throw new Error("caller_get_message");
    },
  });
  return { observed, proxy };
}

test.describe("Action 666CB private atomic observation authority", () => {
  test("freezes exact additive scope and contract versions", () => {
    expect(Object.keys(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_ARTIFACT_ROLES))
      .toHaveLength(5);
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION).toBe(
      "canonical_private_atomic_observation_authority_v1",
    );
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION).toBe(
      "canonical_private_atomic_observation_evidence_v1",
    );
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_RESULT_VERSION).toBe(
      "canonical_private_atomic_observation_result_v1",
    );
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_READBACK_VERSION).toBe(
      "canonical_private_atomic_observation_readback_v1",
    );
    expect(CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES).toBe(
      65_536,
    );
  });

  test("reproduces CA-M1 and removes the public mint surface", () => {
    const predecessorCapsule =
      mintCanonicalProvenanceBoundObservationCapsule(BigInt(73))!;
    expect(
      verifyCanonicalProvenanceBoundObservationCapsule(
        predecessorCapsule,
      ),
    ).toMatchObject({
      status: "verified",
      provenance_verified: true,
    });

    expect(Object.keys(authorityExports).sort()).toEqual(expectedExports);
    expect(
      Object.keys(authorityExports).some((name) =>
        /mint|capsule.*factory|factory.*capsule/i.test(name),
      ),
    ).toBe(false);
  });

  test("source inventory has no exported mint or generic capsule factory", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "lib/server/canonical-private-atomic-observation-authority.ts",
      ),
      "utf8",
    );
    expect(source).toContain("function mintPrivateCapsule(");
    expect(source).not.toMatch(
      /export\s+(?:async\s+)?function\s+\w*(?:mint|capsuleFactory|factoryCapsule)/i,
    );
    expect(source).not.toMatch(
      /export\s+(?:const|let|var)\s+\w*(?:mint|capsuleFactory|factoryCapsule)/i,
    );
  });

  test("atomic operation never exposes capsule or provenance objects", () => {
    const result = observeCanonicalPrimitiveAtomically(BigInt(1));
    expect(result).toMatchObject({
      status: "verified",
      capsule_exposed: false,
      evidence: {
        provenance_verified: true,
        capsule_exposed: false,
        primitive_type: "bigint",
      },
    });
    expect(Object.keys(result)).not.toContain("capsule");
    expect(Object.keys(result.evidence!)).not.toContain("observation");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.evidence!)).toBe(true);
  });

  test("self-minted, cloned, substituted and predecessor capsules are rejected as readback", () => {
    const predecessor =
      mintCanonicalProvenanceBoundObservationCapsule(BigInt(1))!;
    const clone = structuredClone(predecessor);
    const substitute = {
      ...predecessor,
      capsule_identity: "0".repeat(64),
    };
    for (const candidate of [predecessor, clone, substitute]) {
      expect(
        verifyCanonicalPrivateAtomicObservationReadback(candidate),
      ).toMatchObject({
        status: "rejected",
        evidence: null,
        observed_input_digest: null,
        content_identity_claimed: false,
        reason_codes: ["arbitrary_object_readback_rejected"],
      });
    }
  });

  test("canonical strings and genuine bytes rebuild exact evidence", () => {
    const result = action666cbEvaluate(BigInt(-17));
    const fromString = verifyCanonicalPrivateAtomicObservationReadback(
      result.canonical_evidence_string,
    );
    const fromBytes = verifyCanonicalPrivateAtomicObservationReadback(
      action666cbCanonicalReadbackBytes(BigInt(-17)),
    );
    expect(fromString.status).toBe("verified");
    expect(fromBytes.status).toBe("verified");
    expect(fromString.evidence).toEqual(result.evidence);
    expect(fromBytes.evidence).toEqual(result.evidence);
    expect(fromString.readback_digest).toBe(fromBytes.readback_digest);
    expect(Object.isFrozen(fromString)).toBe(true);
    expect(Object.isFrozen(fromString.evidence!)).toBe(true);
  });

  test("closed schema and digest reject tampering, extras and noncanonical bytes", () => {
    const result = action666cbEvaluate("canonical");
    const parsed = JSON.parse(result.canonical_evidence_string!);
    const variants = [
      JSON.stringify({ ...parsed, evidence_digest: "0".repeat(64) }),
      JSON.stringify({ ...parsed, caller_approved: true }),
      JSON.stringify(
        Object.fromEntries(Object.entries(parsed).reverse()),
      ),
      ` ${result.canonical_evidence_string}`,
      "{",
    ];
    for (const variant of variants) {
      expect(
        verifyCanonicalPrivateAtomicObservationReadback(variant).status,
      ).toBe("rejected");
    }
  });

  test("arbitrary Proxy and accessor readback executes zero hooks and sanitizes messages", () => {
    const { observed, proxy } = hookProbe();
    const result = verifyCanonicalPrivateAtomicObservationReadback(proxy);
    expect(observed).toEqual({
      ownKeys: 0,
      descriptor: 0,
      prototype: 0,
      get: 0,
      iterator: 0,
      accessor: 0,
    });
    expect(result).toMatchObject({
      status: "rejected",
      observed_input_digest: null,
      content_identity_claimed: false,
      reason_codes: ["arbitrary_object_readback_rejected"],
    });
    expect(JSON.stringify(result)).not.toContain("caller_");
  });

  test("oversized and invalid canonical bytes fail closed", () => {
    const oversized = new Uint8Array(
      CANONICAL_PRIVATE_ATOMIC_OBSERVATION_MAX_READBACK_BYTES + 1,
    );
    expect(
      verifyCanonicalPrivateAtomicObservationReadback(oversized),
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

  test("lossless BigInt and number edges remain distinct", () => {
    const values = [
      BigInt(1),
      BigInt(2),
      BigInt(-1),
      0,
      -0,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];
    const results = values.map((value) =>
      observeCanonicalPrimitiveAtomically(value),
    );
    expect(
      new Set(
        results.map(
          (result) => result.evidence?.primitive_observation_digest,
        ),
      ).size,
    ).toBe(values.length);
    expect(
      new Set(results.map((result) => result.result_digest)).size,
    ).toBe(values.length);
  });

  test("invalid canonical strings bind distinct failure identities", () => {
    const left = verifyCanonicalPrivateAtomicObservationReadback("{");
    const right = verifyCanonicalPrivateAtomicObservationReadback("[");
    expect(left.observed_input_digest).not.toBe(
      right.observed_input_digest,
    );
    expect(left.readback_digest).not.toBe(right.readback_digest);
    expect(
      verifyCanonicalPrivateAtomicObservationReadback("{"),
    ).toEqual(left);
  });

  test("atomic primitive boundary stays hook-free for unknown objects", () => {
    const { observed, proxy } = hookProbe();
    const result = observeCanonicalPrimitiveAtomically(proxy);
    expect(result).toMatchObject({
      status: "rejected",
      content_identity_claimed: false,
      reason_codes: ["primitive_input_required"],
    });
    expect(observed).toEqual({
      ownKeys: 0,
      descriptor: 0,
      prototype: 0,
      get: 0,
      iterator: 0,
      accessor: 0,
    });
  });

  test("default-off and kill switch perform literal zero work", () => {
    for (const options of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const observed = counters();
      const harness = createCanonicalPrivateAtomicObservationHarness({
        ...options,
        counters: observed,
      });
      expect(harness.observe).toBeNull();
      expect(harness.readback).toBeNull();
      expect(observed).toEqual(counters());
    }
  });

  test("retry, order and BV/BX/BZ interoperability remain deterministic", () => {
    for (const { value } of action666cbPrimitiveMatrix) {
      expect(action666cbEvaluate(value)).toEqual(action666cbEvaluate(value));
    }
    expect(
      action666cbGoldenScenarios().map(({ name, result_digest }) => ({
        name,
        result_digest,
      })),
    ).toEqual(
      [...action666cbPrimitiveMatrix]
        .map(({ name, value }) => ({
          name,
          result_digest: action666cbEvaluate(value).result_digest,
        })),
    );
    expect(action666bvIssue(BigInt(1)).status).toBe("incomplete");
    expect(action666bxIssue(BigInt(1)).status).toBe("incomplete");
    expect(action666bzEvaluate(BigInt(1)).verification.status).toBe(
      "verified",
    );
    expect(action666cbEvaluate(BigInt(1)).status).toBe("verified");
  });

  test("matches deterministic synthetic golden evidence", () => {
    const generated = {
      report_version:
        "action_666cb_golden_private_atomic_observation_report_v1",
      authority_version:
        CANONICAL_PRIVATE_ATOMIC_OBSERVATION_AUTHORITY_VERSION,
      evidence_version:
        CANONICAL_PRIVATE_ATOMIC_OBSERVATION_EVIDENCE_VERSION,
      scenarios: action666cbGoldenScenarios(),
      safety: goldenReport.safety,
      performance_claims: [],
    };
    if (process.env.ACTION_666CB_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666CB_GOLDEN=${JSON.stringify(generated)}`);
    }
    expect(generated).toEqual(goldenReport);
  });

  test("remains server-only and absent from live consumers and mutation surfaces", () => {
    const root = process.cwd();
    const moduleName = "canonical-private-atomic-observation-authority";
    const source = fs.readFileSync(
      path.join(root, `lib/server/${moduleName}.ts`),
      "utf8",
    );
    expect(source.startsWith('import "server-only";')).toBe(true);
    expect(source).not.toMatch(
      /\.(insert|update|upsert)\s*\(|\b(writeFile|appendFile|fetch)\s*\(/,
    );
    expect(source).not.toMatch(
      /\b(supabase|postgres|database_url|provider_request)\b/i,
    );
    const imports: string[] = [];
    for (const liveRoot of ["app", "components", "pages"]) {
      const absolute = path.join(root, liveRoot);
      if (!fs.existsSync(absolute)) continue;
      const pending = [absolute];
      while (pending.length > 0) {
        const current = pending.pop()!;
        for (const entry of fs.readdirSync(current, {
          withFileTypes: true,
        })) {
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
