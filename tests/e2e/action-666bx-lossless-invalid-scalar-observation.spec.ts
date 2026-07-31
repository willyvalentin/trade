import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666bx-golden-lossless-invalid-scalar-observation-report.json";
import {
  action666bxGoldenScenarios,
  action666bxIssue,
  action666bxPrimitiveMatrix,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures";
import {
  CANONICAL_LOSSLESS_INVALID_SCALAR_ARTIFACT_ROLES,
  CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION,
  CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES,
  canonicalLosslessInvalidScalarIssuanceDigest,
  canonicalLosslessPrimitiveObservation,
  createCanonicalLosslessInvalidScalarIssuanceHarness,
  verifyCanonicalLosslessInvalidScalarIssuanceResult,
  verifyCanonicalLosslessPrimitiveObservation,
  type CanonicalLosslessInvalidScalarCounters,
  type CanonicalLosslessInvalidScalarIssuanceResult,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";
import {
  action666bvDependencies,
  action666bvIssue,
} from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import { action666bqRequest } from "@/lib/server/canonical-governed-binding-snapshot-issuance-successor-fixtures";

function counters(): CanonicalLosslessInvalidScalarCounters {
  return {
    request_reads: 0,
    primitive_observations: 0,
    primitive_value_digests: 0,
    predecessor_executions: 0,
    predecessor_rebuilds: 0,
    terminal_digests: 0,
  };
}

function recompute(result: CanonicalLosslessInvalidScalarIssuanceResult) {
  const changed = structuredClone(result);
  const projection = structuredClone(changed);
  delete (
    projection as Partial<CanonicalLosslessInvalidScalarIssuanceResult>
  ).issuance_digest;
  changed.issuance_digest =
    canonicalLosslessInvalidScalarIssuanceDigest(projection);
  return changed;
}

test.describe("Action 666BX lossless invalid-scalar observation", () => {
  test("freezes exact scope, version and bounded observation policy", () => {
    expect(CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION)
      .toBe("canonical_lossless_invalid_scalar_observation_issuance_v3");
    expect(
      Object.keys(CANONICAL_LOSSLESS_INVALID_SCALAR_ARTIFACT_ROLES),
    ).toHaveLength(5);
    expect(CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES)
      .toBe(65_536);
  });

  test("reproduces BV 1n/2n collision and closes it at every BX digest", () => {
    const bvOne = action666bvIssue(BigInt(1));
    const bvTwo = action666bvIssue(BigInt(2));
    expect(bvOne.invalid_request_observation?.observation_digest)
      .toBe(bvTwo.invalid_request_observation?.observation_digest);
    expect(bvOne.issuance_digest).toBe(bvTwo.issuance_digest);

    const one = action666bxIssue(BigInt(1));
    const two = action666bxIssue(BigInt(2));
    expect(one.primitive_observation?.value_digest)
      .not.toBe(two.primitive_observation?.value_digest);
    expect(one.primitive_observation?.observation_digest)
      .not.toBe(two.primitive_observation?.observation_digest);
    expect(one.primitive_observation?.bounded_observation_digest)
      .not.toBe(two.primitive_observation?.bounded_observation_digest);
    expect(one.primitive_observation_digest)
      .not.toBe(two.primitive_observation_digest);
    expect(one.failure_identity_digest)
      .not.toBe(two.failure_identity_digest);
    expect(one.issuance_digest).not.toBe(two.issuance_digest);
  });

  test("binds positive and negative BigInt values losslessly", () => {
    const values = [
      BigInt(1),
      BigInt(2),
      BigInt(-1),
      BigInt(-2),
      BigInt(0),
    ];
    const observations = values.map((value) =>
      canonicalLosslessPrimitiveObservation(value)
    );
    expect(new Set(observations.map((entry) => entry?.value_digest)).size)
      .toBe(values.length);
    expect(observations.map((entry) => entry?.canonical_value)).toEqual([
      "+1",
      "+2",
      "-1",
      "-2",
      "+0",
    ]);
  });

  test("distinguishes every numeric edge by IEEE-754 bytes", () => {
    const values = [
      0,
      -0,
      1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ];
    const observations = values.map((value) =>
      canonicalLosslessPrimitiveObservation(value)
    );
    expect(new Set(observations.map((entry) => entry?.value_digest)).size)
      .toBe(values.length);
    expect(observations.every(
      (entry) =>
        entry?.representation ===
        "ieee754_binary64_big_endian_hex_v1",
    )).toBe(true);
  });

  test("type tags prevent same-text substitution", () => {
    const values = [BigInt(1), 1, "1", true, null, undefined];
    const observations = values.map((value) =>
      canonicalLosslessPrimitiveObservation(value)
    );
    expect(new Set(observations.map((entry) => entry?.primitive_type)).size)
      .toBe(values.length);
    expect(new Set(observations.map((entry) => entry?.value_digest)).size)
      .toBe(values.length);
  });

  test("different strings including unpaired surrogates stay distinct", () => {
    const values = ["", "a", "b", "\ud800", "\ud801", "😀"];
    const observations = values.map((value) =>
      canonicalLosslessPrimitiveObservation(value)
    );
    expect(new Set(observations.map((entry) => entry?.value_digest)).size)
      .toBe(values.length);
  });

  test("does not invoke toJSON, getters, coercion or caller hooks", () => {
    let hookCalls = 0;
    const originalToJson = Object.getOwnPropertyDescriptor(
      BigInt.prototype,
      "toJSON",
    );
    const originalToString = Object.getOwnPropertyDescriptor(
      BigInt.prototype,
      "toString",
    )!;
    Object.defineProperty(BigInt.prototype, "toJSON", {
      configurable: true,
      get() {
        hookCalls += 1;
        throw new Error("caller_getter_must_not_run");
      },
    });
    Object.defineProperty(BigInt.prototype, "toString", {
      configurable: true,
      value() {
        hookCalls += 1;
        throw new Error("caller_coercion_must_not_run");
      },
    });
    try {
      expect(() => action666bxIssue(BigInt(1))).not.toThrow();
      expect(hookCalls).toBe(0);
    } finally {
      Object.defineProperty(
        BigInt.prototype,
        "toString",
        originalToString,
      );
      if (originalToJson) {
        Object.defineProperty(
          BigInt.prototype,
          "toJSON",
          originalToJson,
        );
      } else {
        delete (BigInt.prototype as { toJSON?: unknown }).toJSON;
      }
    }
  });

  test("bounds canonical scalar bytes without claiming full oversized identity", () => {
    const oversized = "x".repeat(
      CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES,
    );
    const observation =
      canonicalLosslessPrimitiveObservation(oversized);
    expect(observation).toMatchObject({
      observation_status: "budget_exceeded",
      canonical_value: null,
      canonical_value_bytes: null,
      full_value_identity_claimed: false,
      value_digest: null,
      reason_codes: ["primitive_observation_max_bytes_exceeded"],
    });
  });

  test("non-representable identity has a closed reason and no content claim", () => {
    const first = canonicalLosslessPrimitiveObservation(
      Symbol("first"),
    );
    const second = canonicalLosslessPrimitiveObservation(
      Symbol("second"),
    );
    for (const observation of [first, second]) {
      expect(observation).toMatchObject({
        observation_status: "non_representable",
        primitive_type: "symbol",
        canonical_value: null,
        full_value_identity_claimed: false,
        value_digest: null,
        reason_codes: [
          "primitive_content_identity_not_representable",
        ],
      });
    }
  });

  test("closed observation verifier rejects omission, type drift and recomputation", () => {
    const observation =
      canonicalLosslessPrimitiveObservation(BigInt(1))!;
    expect(
      verifyCanonicalLosslessPrimitiveObservation(
        BigInt(1),
        observation,
      ),
    ).toMatchObject({ valid: true });

    const omitted = structuredClone(observation) as Record<
      string,
      unknown
    >;
    delete omitted.primitive_type;
    expect(
      verifyCanonicalLosslessPrimitiveObservation(BigInt(1), omitted),
    ).toMatchObject({ valid: false });

    const changed = structuredClone(observation);
    changed.canonical_value = "+2";
    const projection = structuredClone(changed);
    delete (
      projection as Partial<typeof changed>
    ).observation_digest;
    changed.observation_digest =
      canonicalLosslessInvalidScalarIssuanceDigest(projection);
    expect(
      verifyCanonicalLosslessPrimitiveObservation(BigInt(1), changed),
    ).toMatchObject({ valid: false });
  });

  test("terminal result independently rebuilds and rejects self-consistent tampering", () => {
    const result = action666bxIssue(BigInt(1));
    expect(
      verifyCanonicalLosslessInvalidScalarIssuanceResult({
        request: BigInt(1),
        result,
        rebuild_dependencies: action666bvDependencies(),
      }),
    ).toMatchObject({ valid: true });
    const changed = structuredClone(result);
    changed.primitive_observation!.canonical_value = "+2";
    changed.primitive_observation!.observation_digest =
      canonicalLosslessInvalidScalarIssuanceDigest(
        changed.primitive_observation,
      );
    const tampered = recompute(changed);
    expect(
      verifyCanonicalLosslessInvalidScalarIssuanceResult({
        request: BigInt(1),
        result: tampered,
        rebuild_dependencies: action666bvDependencies(),
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["lossless_scalar_result_tampered"],
    });
  });

  test("preserves full BV issued interoperability", () => {
    const result = action666bxIssue(action666bqRequest);
    expect(result).toMatchObject({
      status: "issued",
      primitive_observation: null,
      primitive_observation_digest: null,
      predecessor_result_verified: true,
      failure_identity_digest: null,
      predecessor_result: {
        status: "issued",
        predecessor_result_verified: true,
        predecessor_result: {
          status: "issued",
          binding_backed_replay_verified: true,
        },
      },
      live_impact: false,
      persistence_performed: false,
    });
  });

  test("default-off and kill switch perform zero reads and digest work", () => {
    for (const options of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const observed = counters();
      let dependencyReads = 0;
      const harness =
        createCanonicalLosslessInvalidScalarIssuanceHarness({
          ...options,
          counters: observed,
          get dependencies(): never {
            dependencyReads += 1;
            throw new Error("disabled_dependency_read");
          },
        });
      expect(harness.issue).toBeNull();
      expect(dependencyReads).toBe(0);
      expect(observed).toEqual(counters());
    }
  });

  test("is byte-identical across retry and matrix input order", () => {
    for (const { value } of action666bxPrimitiveMatrix) {
      expect(action666bxIssue(value)).toEqual(action666bxIssue(value));
    }
    const forward = action666bxGoldenScenarios();
    const reversed = [...action666bxPrimitiveMatrix]
      .reverse()
      .map(({ name, value }) => {
        const result = action666bxIssue(value);
        return {
          name,
          issuance_digest: result.issuance_digest,
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name));
    expect(
      forward
        .map(({ name, issuance_digest }) => ({
          name,
          issuance_digest,
        }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    ).toEqual(reversed);
  });

  test("matches deterministic synthetic golden evidence", () => {
    const generated = {
      report_version:
        "action_666bx_golden_lossless_invalid_scalar_report_v1",
      contract_version:
        CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION,
      scenarios: action666bxGoldenScenarios(),
      safety: goldenReport.safety,
      performance_claims: [],
    };
    if (process.env.ACTION_666BX_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666BX_GOLDEN=${JSON.stringify(generated)}`);
    }
    expect(generated).toEqual(goldenReport);
  });

  test("remains server-only and outside live consumers", () => {
    const root = process.cwd();
    const moduleName =
      "canonical-lossless-invalid-scalar-observation-issuance";
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
