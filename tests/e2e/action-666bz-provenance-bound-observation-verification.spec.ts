import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666bz-golden-provenance-bound-observation-report.json";
import {
  action666bzEvaluate,
  action666bzGoldenScenarios,
  action666bzPrimitiveMatrix,
} from "@/lib/server/canonical-provenance-bound-observation-verification-fixtures";
import {
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_ARTIFACT_ROLES,
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION,
  CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION,
  createCanonicalProvenanceBoundObservationHarness,
  mintCanonicalProvenanceBoundObservationCapsule,
  verifyCanonicalProvenanceBoundObservationCapsule,
  type CanonicalProvenanceBoundObservationCounters,
} from "@/lib/server/canonical-provenance-bound-observation-verification";
import {
  action666bvIssue,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import {
  action666bxIssue,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures";
import {
  verifyCanonicalLosslessPrimitiveObservation,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";
import { action666bqRequest } from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures";

function counters(): CanonicalProvenanceBoundObservationCounters {
  return {
    request_reads: 0,
    capsule_mints: 0,
    provenance_checks: 0,
    capsule_property_reads: 0,
    canonical_byte_rebuilds: 0,
    digest_operations: 0,
  };
}

function hostileProxy() {
  const counts = {
    ownKeys: 0,
    getOwnPropertyDescriptor: 0,
    getPrototypeOf: 0,
    get: 0,
    has: 0,
  };
  const proxy = new Proxy({}, {
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
  });
  return { proxy, counts };
}

test.describe("Action 666BZ provenance-bound hook-free observation verification", () => {
  test("freezes exact additive scope and contract versions", () => {
    expect(CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION)
      .toBe("canonical_provenance_bound_observation_capsule_v1");
    expect(CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION)
      .toBe(
        "canonical_provenance_bound_observation_verification_v1",
      );
    expect(
      Object.keys(CANONICAL_PROVENANCE_BOUND_OBSERVATION_ARTIFACT_ROLES),
    ).toHaveLength(5);
  });

  test("reproduces BY-M1 against predecessor and closes it before property access", () => {
    const predecessorProbe = hostileProxy();
    expect(() =>
      verifyCanonicalLosslessPrimitiveObservation(
        BigInt(1),
        predecessorProbe.proxy,
      )
    ).toThrow("caller_own_keys_message");
    expect(predecessorProbe.counts.ownKeys).toBe(1);

    const successorProbe = hostileProxy();
    const result = verifyCanonicalProvenanceBoundObservationCapsule(
      successorProbe.proxy,
    );
    expect(result).toMatchObject({
      status: "rejected",
      provenance_verified: false,
      recognized_capsule: false,
      content_identity_claimed: false,
      capsule_identity: null,
      capsule_digest: null,
      reason_codes: ["untrusted_observation_container"],
    });
    expect(successorProbe.counts).toEqual({
      ownKeys: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      get: 0,
      has: 0,
    });
    expect(JSON.stringify(result)).not.toContain("caller_");
  });

  test("unknown proxy traps and iterator access remain zero", () => {
    const { proxy, counts } = hostileProxy();
    expect(() =>
      verifyCanonicalProvenanceBoundObservationCapsule(proxy)
    ).not.toThrow();
    expect(counts).toEqual({
      ownKeys: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      get: 0,
      has: 0,
    });
  });

  test("unknown accessors and toJSON remain unread", () => {
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
    const result =
      verifyCanonicalProvenanceBoundObservationCapsule(candidate);
    expect(calls).toBe(0);
    expect(result.reason_codes).toEqual([
      "untrusted_observation_container",
    ]);
    expect(JSON.stringify(result)).not.toContain(
      "caller_accessor_message",
    );
  });

  test("only internally minted frozen capsules are recognized", () => {
    const capsule =
      mintCanonicalProvenanceBoundObservationCapsule(BigInt(1))!;
    expect(Object.isFrozen(capsule)).toBe(true);
    expect(Object.isFrozen(capsule.observation)).toBe(true);
    expect(
      verifyCanonicalProvenanceBoundObservationCapsule(capsule),
    ).toMatchObject({
      status: "verified",
      provenance_verified: true,
      recognized_capsule: true,
      capsule_frozen: true,
      observation_frozen: true,
      content_identity_claimed: true,
      capsule_identity: capsule.capsule_identity,
      capsule_digest: capsule.capsule_digest,
      primitive_observation_digest:
        capsule.primitive_observation_digest,
      bounded_observation_digest:
        capsule.bounded_observation_digest,
      reason_codes: [],
    });
  });

  test("clones and proxy wrappers cannot inherit private provenance", () => {
    const capsule =
      mintCanonicalProvenanceBoundObservationCapsule(BigInt(1))!;
    const clone = structuredClone(capsule);
    expect(
      verifyCanonicalProvenanceBoundObservationCapsule(clone),
    ).toMatchObject({
      status: "rejected",
      content_identity_claimed: false,
      capsule_identity: null,
      reason_codes: ["untrusted_observation_container"],
    });

    let hooks = 0;
    const wrapped = new Proxy(capsule, {
      get() {
        hooks += 1;
        throw new Error("wrapped_capsule_get");
      },
      ownKeys() {
        hooks += 1;
        throw new Error("wrapped_capsule_own_keys");
      },
    });
    expect(
      verifyCanonicalProvenanceBoundObservationCapsule(wrapped),
    ).toMatchObject({
      status: "rejected",
      recognized_capsule: false,
    });
    expect(hooks).toBe(0);
  });

  test("BigInt values retain distinct private capsule and verification digests", () => {
    const values = [BigInt(1), BigInt(2), BigInt(-1), BigInt(-2)];
    const results = values.map((value) => action666bzEvaluate(value));
    for (const field of [
      "primitive_value_digest",
      "primitive_observation_digest",
      "bounded_observation_digest",
      "capsule_identity",
      "capsule_digest",
    ] as const) {
      expect(
        new Set(results.map((result) => result.capsule?.[field])).size,
      ).toBe(values.length);
    }
    expect(
      new Set(
        results.map(
          (result) => result.verification.verification_digest,
        ),
      ).size,
    ).toBe(values.length);
    expect(new Set(results.map((result) => result.result_digest)).size)
      .toBe(values.length);
  });

  test("IEEE-754 edge values remain losslessly distinct", () => {
    const values = [
      0,
      -0,
      1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];
    const results = values.map((value) => action666bzEvaluate(value));
    expect(
      new Set(
        results.map(
          (result) => result.capsule?.primitive_value_digest,
        ),
      ).size,
    ).toBe(values.length);
  });

  test("same-text type substitution changes capsule identity", () => {
    const values = [BigInt(1), 1, "1", true];
    const results = values.map((value) => action666bzEvaluate(value));
    expect(
      new Set(results.map((result) => result.capsule?.primitive_type))
        .size,
    ).toBe(values.length);
    expect(
      new Set(results.map((result) => result.capsule?.capsule_identity))
        .size,
    ).toBe(values.length);
  });

  test("unknown containers make no content-identity claim", () => {
    for (const candidate of [
      {},
      [],
      () => undefined,
      Symbol("unknown"),
      null,
      undefined,
    ]) {
      expect(
        verifyCanonicalProvenanceBoundObservationCapsule(candidate),
      ).toMatchObject({
        status: "rejected",
        content_identity_claimed: false,
        capsule_identity: null,
        capsule_digest: null,
        primitive_observation_digest: null,
        bounded_observation_digest: null,
        reason_codes: ["untrusted_observation_container"],
      });
    }

    const internallyClassifiedSymbol =
      mintCanonicalProvenanceBoundObservationCapsule(
        Symbol("non_representable"),
      )!;
    expect(
      verifyCanonicalProvenanceBoundObservationCapsule(
        internallyClassifiedSymbol,
      ),
    ).toMatchObject({
      status: "verified",
      recognized_capsule: true,
      content_identity_claimed: false,
      primitive_observation_digest:
        internallyClassifiedSymbol.primitive_observation_digest,
    });
  });

  test("default-off and kill switch perform literal zero work", () => {
    for (const options of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const observed = counters();
      const harness =
        createCanonicalProvenanceBoundObservationHarness({
          ...options,
          counters: observed,
        });
      expect(harness.evaluate).toBeNull();
      expect(observed).toEqual(counters());
    }
  });

  test("retry and primitive matrix order are deterministic", () => {
    for (const { value } of action666bzPrimitiveMatrix) {
      expect(action666bzEvaluate(value)).toEqual(
        action666bzEvaluate(value),
      );
    }
    const forward = action666bzGoldenScenarios();
    const reverse = [...action666bzPrimitiveMatrix]
      .reverse()
      .map(({ name, value }) => {
        const result = action666bzEvaluate(value);
        return { name, result_digest: result.result_digest };
      })
      .sort((left, right) => left.name.localeCompare(right.name));
    expect(
      forward
        .map(({ name, result_digest }) => ({ name, result_digest }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    ).toEqual(reverse);
  });

  test("preserves frozen BV and BX interoperability", () => {
    const bvOne = action666bvIssue(BigInt(1));
    const bxOne = action666bxIssue(BigInt(1));
    const bzOne = action666bzEvaluate(BigInt(1));
    expect(bvOne.status).toBe("incomplete");
    expect(bxOne.status).toBe("incomplete");
    expect(bzOne.verification.status).toBe("verified");
    expect(
      bzOne.capsule?.primitive_observation_digest,
    ).toBe(bxOne.primitive_observation_digest);

    expect(action666bxIssue(action666bqRequest)).toMatchObject({
      status: "issued",
      predecessor_result_verified: true,
      predecessor_result: {
        status: "issued",
        predecessor_result_verified: true,
      },
    });
  });

  test("matches deterministic synthetic golden evidence", () => {
    const generated = {
      report_version:
        "action_666bz_golden_provenance_bound_observation_report_v1",
      capsule_version:
        CANONICAL_PROVENANCE_BOUND_OBSERVATION_CAPSULE_VERSION,
      verification_version:
        CANONICAL_PROVENANCE_BOUND_OBSERVATION_VERIFICATION_VERSION,
      scenarios: action666bzGoldenScenarios(),
      safety: goldenReport.safety,
      performance_claims: [],
    };
    if (process.env.ACTION_666BZ_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666BZ_GOLDEN=${JSON.stringify(generated)}`);
    }
    expect(generated).toEqual(goldenReport);
  });

  test("remains server-only and absent from live consumers", () => {
    const root = process.cwd();
    const moduleName =
      "canonical-provenance-bound-observation-verification";
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
