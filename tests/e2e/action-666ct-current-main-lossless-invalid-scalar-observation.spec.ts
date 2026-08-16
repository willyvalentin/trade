import { expect, test } from "@playwright/test";

import goldenReport from "@/docs/action-666ct-golden-lossless-invalid-scalar-observation-report.json";
import {
  action666ctGoldenBigInt,
  action666ctGoldenPrimitive,
  action666ctHarness,
  action666ctIssue,
  action666ctValidRequest,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures";
import {
  CANONICAL_LOSSLESS_FAILURE_IDENTITY_VERSION,
  CANONICAL_LOSSLESS_INVALID_SCALAR_ARTIFACT_ROLES,
  CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION,
  CANONICAL_LOSSLESS_INVALID_SCALAR_STATUSES,
  CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES,
  CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
  CANONICAL_LOSSLESS_PRIMITIVE_TYPE_TAGS,
  CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION,
  DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_ENABLED,
  DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_KILL_SWITCH,
  canonicalLosslessInvalidScalarObservationDigest,
  createCanonicalLosslessInvalidScalarObservationHarness,
  verifyCanonicalLosslessInvalidScalarObservationResult,
  type CanonicalLosslessInvalidScalarIssuanceResult,
} from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";
import { action666csDependencies } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";

test.describe.configure({ timeout: 180_000 });

function activeHarness() {
  return createCanonicalLosslessInvalidScalarObservationHarness({
    enabled: true,
    kill_switch_engaged: false,
    dependencies: action666csDependencies(),
  });
}

function observation(value: unknown) {
  return action666ctIssue(value).primitive_observation!;
}

function numberFromBinary64Hex(value: string) {
  const view = new DataView(new ArrayBuffer(8));
  view.setBigUint64(0, BigInt(`0x${value}`), false);
  return view.getFloat64(0, false);
}

function recompute(value: CanonicalLosslessInvalidScalarIssuanceResult) {
  const changed = structuredClone(value);
  const projection = structuredClone(changed);
  delete (
    projection as Partial<CanonicalLosslessInvalidScalarIssuanceResult>
  ).issuance_digest;
  changed.issuance_digest =
    canonicalLosslessInvalidScalarObservationDigest(projection);
  return changed;
}

test.describe("Action 666CT current-main lossless invalid-scalar observation", () => {
  test("freezes exact versions, taxonomies, cap and five-file foundation", () => {
    expect(CANONICAL_LOSSLESS_INVALID_SCALAR_STATUSES).toEqual([
      "issued",
      "incomplete",
      "conflicting",
      "not_point_in_time_safe",
      "rollback_rejected",
    ]);
    expect(CANONICAL_LOSSLESS_PRIMITIVE_TYPE_TAGS).toEqual([
      "bigint",
      "number",
      "string",
      "boolean",
      "null",
      "undefined",
      "symbol",
      "function",
    ]);
    expect(Object.isFrozen(CANONICAL_LOSSLESS_INVALID_SCALAR_STATUSES)).toBe(
      true,
    );
    expect(Object.isFrozen(CANONICAL_LOSSLESS_PRIMITIVE_TYPE_TAGS)).toBe(true);
    expect(
      Object.keys(CANONICAL_LOSSLESS_INVALID_SCALAR_ARTIFACT_ROLES),
    ).toHaveLength(5);
    expect(CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_MAX_BYTES).toBe(65_536);
    expect(DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_ENABLED).toBe(false);
    expect(DEFAULT_OFF_LOSSLESS_INVALID_SCALAR_ISSUANCE_KILL_SWITCH).toBe(
      true,
    );
    expect(goldenReport).toMatchObject({
      contract_version: CANONICAL_LOSSLESS_INVALID_SCALAR_ISSUANCE_VERSION,
      observation_version: CANONICAL_LOSSLESS_PRIMITIVE_OBSERVATION_VERSION,
      value_digest_version:
        CANONICAL_LOSSLESS_PRIMITIVE_VALUE_DIGEST_VERSION,
      failure_identity_version: CANONICAL_LOSSLESS_FAILURE_IDENTITY_VERSION,
      maximum_canonical_value_bytes: 65_536,
      performance_claimed: false,
    });
  });

  test("is literal-default-off and kill-switch fail-closed with zero work", () => {
    let dependencyReads = 0;
    const dependencies = new Proxy(action666csDependencies(), {
      get() {
        dependencyReads += 1;
        throw new Error("dependency_must_not_be_read");
      },
      ownKeys() {
        dependencyReads += 1;
        throw new Error("dependency_must_not_be_enumerated");
      },
    });
    const cases = [
      createCanonicalLosslessInvalidScalarObservationHarness(),
      createCanonicalLosslessInvalidScalarObservationHarness({
        enabled: false,
        kill_switch_engaged: false,
        dependencies,
      }),
      createCanonicalLosslessInvalidScalarObservationHarness({
        enabled: true,
        kill_switch_engaged: true,
        dependencies,
      }),
      createCanonicalLosslessInvalidScalarObservationHarness({
        enabled: 1 as never,
        kill_switch_engaged: false,
        dependencies,
      }),
    ];
    expect(cases.map((entry) => entry.issue)).toEqual([
      null,
      null,
      null,
      null,
    ]);
    expect(dependencyReads).toBe(0);
    for (const harness of cases) {
      expect(harness.counters).toEqual({
        request_reads: 0,
        primitive_observations: 0,
        primitive_value_digests: 0,
        predecessor_executions: 0,
        predecessor_rebuilds: 0,
        terminal_digests: 0,
      });
    }
  });

  test("binds signed hexadecimal BigInt magnitude without decimal coercion", () => {
    const cases = [
      [BigInt(0), "+0"],
      [BigInt(1), "+1"],
      [BigInt(-1), "-1"],
      [action666ctGoldenBigInt, goldenReport.golden_values.bigint.canonical_value],
    ] as const;
    const digests = new Set<string>();
    for (const [value, canonical] of cases) {
      const result = action666ctIssue(value);
      expect(result).toMatchObject({
        status: "incomplete",
        predecessor_result_verified: false,
        verifier_authority_granted: true,
        primitive_observation: {
          observation_status: "represented",
          primitive_type: "bigint",
          representation: "signed_hexadecimal_magnitude_v2",
          canonical_value: canonical,
          full_value_identity_claimed: true,
        },
      });
      expect(result.failure_identity_digest).toMatch(/^[a-f0-9]{64}$/);
      digests.add(result.primitive_observation!.value_digest!);
    }
    expect(digests.size).toBe(cases.length);
  });

  test("preserves binary64 values and canonicalizes every NaN payload", () => {
    const cases = [
      [0, goldenReport.golden_values.positive_zero],
      [-0, goldenReport.golden_values.negative_zero],
      [1, "3ff0000000000000"],
      [1.5, "3ff8000000000000"],
      [Number.POSITIVE_INFINITY, goldenReport.golden_values.positive_infinity],
      [Number.NEGATIVE_INFINITY, goldenReport.golden_values.negative_infinity],
    ] as const;
    for (const [value, expected] of cases) {
      expect(observation(value)).toMatchObject({
        observation_status: "represented",
        primitive_type: "number",
        representation: "ieee754_binary64_big_endian_hex_v2",
        canonical_value: expected,
        canonical_value_bytes: 16,
      });
    }
    const nanVariants = [
      Number.NaN,
      numberFromBinary64Hex("7ff8000000000001"),
      numberFromBinary64Hex("7ff8000000000002"),
      numberFromBinary64Hex("7ff0000000000001"),
      numberFromBinary64Hex("fff8000000000001"),
    ];
    const nanResults = nanVariants.map((value) => action666ctIssue(value));
    for (const result of nanResults) {
      expect(result.primitive_observation).toMatchObject({
        canonical_value: goldenReport.golden_values.canonical_nan,
        canonical_value_bytes: 16,
      });
    }
    expect(
      new Set(
        nanResults.map(
          (result) => result.primitive_observation!.value_digest,
        ),
      ).size,
    ).toBe(1);
    expect(
      new Set(nanResults.map((result) => result.failure_identity_digest)).size,
    ).toBe(1);
    expect(observation(0).value_digest).not.toBe(observation(-0).value_digest);
  });

  test("preserves exact UTF-16 code units including unpaired surrogates", () => {
    expect(observation(action666ctGoldenPrimitive)).toMatchObject({
      observation_status: "represented",
      primitive_type: "string",
      representation: "utf16_code_units_big_endian_hex_v2",
      canonical_value: goldenReport.golden_values.utf16.canonical_value,
      canonical_value_bytes: 24,
    });
    expect(observation("\ud800").value_digest).not.toBe(
      observation("\udfff").value_digest,
    );
    expect(observation("é").value_digest).not.toBe(
      observation("e\u0301").value_digest,
    );
  });

  test("type-binds boolean, null and undefined ASCII literals", () => {
    const cases = [
      [true, "boolean", "true"],
      [false, "boolean", "false"],
      [null, "null", "null"],
      [undefined, "undefined", "undefined"],
      ["true", "string", "0074007200750065"],
    ] as const;
    const digests = new Set<string>();
    for (const [value, type, canonical] of cases) {
      const item = observation(value);
      expect(item).toMatchObject({
        observation_status: "represented",
        primitive_type: type,
        canonical_value: canonical,
      });
      digests.add(item.value_digest!);
    }
    expect(digests.size).toBe(cases.length);
  });

  test("fails boundedly at exact string and BigInt limits", () => {
    const atStringLimit = "x".repeat(16_384);
    const overStringLimit = `${atStringLimit}x`;
    expect(observation(atStringLimit)).toMatchObject({
      observation_status: "represented",
      canonical_value_bytes: 65_536,
      full_value_identity_claimed: true,
    });
    expect(observation(overStringLimit)).toMatchObject({
      observation_status: "budget_exceeded",
      canonical_value: null,
      canonical_value_bytes: null,
      full_value_identity_claimed: false,
      value_digest: null,
    });
    const atBigIntLimit =
      (BigInt(1) << BigInt(262_140)) - BigInt(1);
    const overBigIntLimit = BigInt(1) << BigInt(262_140);
    for (const value of [atBigIntLimit, -atBigIntLimit]) {
      expect(observation(value)).toMatchObject({
        observation_status: "represented",
        canonical_value_bytes: 65_536,
        full_value_identity_claimed: true,
      });
    }
    for (const value of [overBigIntLimit, -overBigIntLimit]) {
      expect(observation(value)).toMatchObject({
        observation_status: "budget_exceeded",
        canonical_value: null,
        full_value_identity_claimed: false,
        value_digest: null,
      });
    }
  });

  test("classifies symbol and function without granting full identity", () => {
    for (const value of [Symbol("secret"), function secret() {}, () => 1]) {
      const result = action666ctIssue(value);
      expect(result).toMatchObject({
        verifier_authority_granted: false,
        failure_identity_digest: null,
        primitive_observation: {
          observation_status: "non_representable",
          canonical_value: null,
          canonical_value_bytes: null,
          full_value_identity_claimed: false,
          value_digest: null,
          reason_codes: ["lossless_primitive_type_not_representable"],
        },
      });
      expect(
        verifyCanonicalLosslessInvalidScalarObservationResult({
          request: value,
          result,
          harness: action666ctHarness(),
        }),
      ).toMatchObject({ valid: false });
    }
  });

  test("grants authority only through the private originating harness", () => {
    const harness = activeHarness();
    const result = harness.issue!(BigInt(42));
    expect(
      verifyCanonicalLosslessInvalidScalarObservationResult({
        request: BigInt(42),
        result,
        harness,
      }),
    ).toMatchObject({ valid: true, reason_codes: [] });
    const copiedHarness = { ...harness };
    expect(
      verifyCanonicalLosslessInvalidScalarObservationResult({
        request: BigInt(42),
        result,
        harness: copiedHarness,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["lossless_harness_unrecognized"],
    });
    const tampered = structuredClone(result);
    tampered.reason_codes = ["attacker_recomputed_public_digest"];
    const rehashed = recompute(tampered);
    expect(
      verifyCanonicalLosslessInvalidScalarObservationResult({
        request: BigInt(42),
        result: rehashed,
        harness,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["lossless_result_rebuild_mismatch"],
    });
  });

  test("rejects verifier proxies and accessors without caller hooks", () => {
    const harness = activeHarness();
    const result = harness.issue!(BigInt(42));
    let hooks = 0;
    const proxy = new Proxy(result, {
      get() {
        hooks += 1;
        throw new Error("caller_proxy_get_executed");
      },
      ownKeys() {
        hooks += 1;
        throw new Error("caller_proxy_own_keys_executed");
      },
      getOwnPropertyDescriptor() {
        hooks += 1;
        throw new Error("caller_proxy_descriptor_executed");
      },
    });
    expect(
      verifyCanonicalLosslessInvalidScalarObservationResult({
        request: BigInt(42),
        result: proxy,
        harness,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["lossless_result_not_bounded"],
    });
    const accessor = structuredClone(result);
    Object.defineProperty(accessor, "reason_codes", {
      enumerable: true,
      get() {
        hooks += 1;
        throw new Error("caller_getter_executed");
      },
    });
    expect(
      verifyCanonicalLosslessInvalidScalarObservationResult({
        request: BigInt(42),
        result: accessor,
        harness,
      }),
    ).toMatchObject({
      valid: false,
      reason_codes: ["lossless_result_not_bounded"],
    });
    expect(hooks).toBe(0);
  });

  test("does not introspect object proxies or accessors in the scalar layer", () => {
    let trapReads = 0;
    const proxy = new Proxy(
      {},
      {
        get() {
          trapReads += 1;
          throw new Error("proxy_get_executed");
        },
        ownKeys() {
          trapReads += 1;
          throw new Error("proxy_own_keys_executed");
        },
        getOwnPropertyDescriptor() {
          trapReads += 1;
          throw new Error("proxy_descriptor_executed");
        },
      },
    );
    const result = action666ctIssue(proxy);
    expect(trapReads).toBe(0);
    expect(result).toMatchObject({
      primitive_observation: null,
      predecessor_result_verified: false,
      verifier_authority_granted: false,
    });
    const functionProxy = new Proxy(function candidate() {}, {
      get() {
        trapReads += 1;
        throw new Error("function_proxy_get_executed");
      },
      ownKeys() {
        trapReads += 1;
        throw new Error("function_proxy_own_keys_executed");
      },
      getOwnPropertyDescriptor() {
        trapReads += 1;
        throw new Error("function_proxy_descriptor_executed");
      },
      getPrototypeOf() {
        trapReads += 1;
        throw new Error("function_proxy_prototype_executed");
      },
    });
    expect(action666ctIssue(functionProxy)).toMatchObject({
      verifier_authority_granted: false,
      primitive_observation: {
        observation_status: "non_representable",
        primitive_type: "function",
      },
    });
    expect(trapReads).toBe(0);
    const accessor = {};
    Object.defineProperty(accessor, "secret", {
      enumerable: true,
      get() {
        trapReads += 1;
        throw new Error("accessor_executed");
      },
    });
    action666ctIssue(accessor);
    expect(trapReads).toBe(0);
  });

  test("preserves the verified CS object path and snapshots dependencies", () => {
    const dependencies = action666csDependencies();
    const harness =
      createCanonicalLosslessInvalidScalarObservationHarness({
        enabled: true,
        kill_switch_engaged: false,
        dependencies,
      });
    expect(harness.status).toBe("ready");
    dependencies.authority_dependency.read_signed_authority_envelope_json =
      () => {
        throw new Error("post_construction_substitution");
      };
    const result = harness.issue!(action666ctValidRequest);
    expect(result).toMatchObject({
      status: "issued",
      primitive_observation: null,
      predecessor_result_verified: true,
      verifier_authority_granted: true,
    });
    expect(
      verifyCanonicalLosslessInvalidScalarObservationResult({
        request: action666ctValidRequest,
        result,
        harness,
      }),
    ).toMatchObject({ valid: true });
  });

  test("uses captured scalar primordials after import", () => {
    const originalBigIntToString = BigInt.prototype.toString;
    const originalStringCharCodeAt = String.prototype.charCodeAt;
    const originalSetFloat64 = DataView.prototype.setFloat64;
    try {
      BigInt.prototype.toString = () => {
        throw new Error("poisoned_bigint_to_string");
      };
      String.prototype.charCodeAt = () => {
        throw new Error("poisoned_char_code_at");
      };
      DataView.prototype.setFloat64 = () => {
        throw new Error("poisoned_set_float64");
      };
      expect(observation(BigInt(255)).canonical_value).toBe("+ff");
      expect(observation("A").canonical_value).toBe("0041");
      expect(observation(1).canonical_value).toBe("3ff0000000000000");
    } finally {
      BigInt.prototype.toString = originalBigIntToString;
      String.prototype.charCodeAt = originalStringCharCodeAt;
      DataView.prototype.setFloat64 = originalSetFloat64;
    }
  });

  test("keeps outputs recursively frozen and public digest inputs bounded", () => {
    const result = action666ctIssue(action666ctGoldenPrimitive);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.primitive_observation)).toBe(true);
    expect(Object.isFrozen(result.reason_codes)).toBe(true);
    expect(Object.isFrozen(result.predecessor_result)).toBe(true);
    expect(() =>
      canonicalLosslessInvalidScalarObservationDigest("x".repeat(65_537)),
    ).toThrow("lossless_digest_input_not_bounded");
  });
});
