import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import * as callbackFreeExports from "@/lib/server/canonical-callback-free-atomic-observation";
import {
  CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_ARTIFACT_ROLES,
  CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
  CANONICAL_CALLBACK_FREE_MAX_INPUT_BYTES,
  CANONICAL_CALLBACK_FREE_READBACK_VERSION,
  runCanonicalCallbackFreeAtomicObservation,
} from "@/lib/server/canonical-callback-free-atomic-observation";
import {
  action666cfCanonicalBytes,
  action666cfCanonicalEnvelope,
  action666cfGoldenScenarios,
  action666cfReadback,
  action666cfRecomputedSemanticReplacement,
} from "@/lib/server/canonical-callback-free-atomic-observation-fixtures";
import { runCanonicalIntegrityProvenanceSeparatedObservation } from "@/lib/server/canonical-integrity-provenance-separated-observation-authority";
import { action666bzEvaluate } from "@/lib/server/canonical-provenance-bound-observation-verification-fixtures";
import { action666bxIssue } from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures";
import { canonicalLosslessInvalidScalarIssuanceDigest } from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";
import { action666bvIssue } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import goldenReport from "../../docs/action-666cf-golden-callback-free-atomic-observation-report.json";

const expectedExports = [
  "CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_ARTIFACT_ROLES",
  "CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION",
  "CANONICAL_CALLBACK_FREE_MAX_INPUT_BYTES",
  "CANONICAL_CALLBACK_FREE_READBACK_VERSION",
  "DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_ENABLED",
  "DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_KILL_SWITCH",
  "runCanonicalCallbackFreeAtomicObservation",
].sort();

function readbackUnsafe(input: unknown) {
  return runCanonicalCallbackFreeAtomicObservation(
    input as string,
    true,
    false,
  );
}

function hookProbe() {
  const observed = {
    ownKeys: 0,
    descriptor: 0,
    prototype: 0,
    get: 0,
    iterator: 0,
    accessor: 0,
    toJSON: 0,
    valueOf: 0,
  };
  const target = Object.create(null);
  Object.defineProperty(target, "payload", {
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
      else if (property === "toJSON") observed.toJSON += 1;
      else if (property === "valueOf") observed.valueOf += 1;
      else observed.get += 1;
      throw new Error("caller_get_message");
    },
  });
  return { observed, proxy };
}

test.describe("Action 666CF callback-free atomic observation", () => {
  test("defines exactly five additive artifacts and closed versions", () => {
    expect(
      Object.keys(CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_ARTIFACT_ROLES),
    ).toHaveLength(5);
    expect(CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION).toBe(
      "canonical_callback_free_atomic_observation_v1",
    );
    expect(CANONICAL_CALLBACK_FREE_READBACK_VERSION).toBe(
      "canonical_callback_free_integrity_readback_v1",
    );
  });

  test("reproduces CE-M1 against CD and removes read_request", () => {
    let predecessorCalls = 0;
    expect(() =>
      runCanonicalIntegrityProvenanceSeparatedObservation({
        enabled: true,
        kill_switch_engaged: false,
        operation: "issue_runtime",
        read_request: () => {
          predecessorCalls += 1;
          throw new Error("caller_review_message");
        },
      }),
    ).toThrow("caller_review_message");
    expect(predecessorCalls).toBe(1);

    expect(Object.keys(callbackFreeExports).sort()).toEqual(expectedExports);
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "lib/server/canonical-callback-free-atomic-observation.ts",
      ),
      "utf8",
    );
    expect(source).not.toContain("read_request");
    expect(source).not.toContain("trust_callback");
    expect(source).not.toMatch(/\w+\??:\s*\([^)]*\)\s*=>/);
    expect(source).not.toMatch(
      /export\s+(?:async\s+)?function\s+\w*(?:mint|factory|upgrade)/i,
    );
  });

  test("function-valued and nested object inputs execute no caller code", () => {
    let executions = 0;
    const throwing = () => {
      executions += 1;
      throw new Error("caller_function_message");
    };
    const direct = readbackUnsafe(throwing);
    const nested = readbackUnsafe({ nested: { reader: throwing } });
    expect(executions).toBe(0);
    expect(direct.terminal_result).toMatchObject({
      status: "input_rejected",
      reason_codes: ["function_valued_input_rejected"],
    });
    expect(nested.terminal_result).toMatchObject({
      status: "input_rejected",
      reason_codes: ["arbitrary_object_input_rejected"],
    });
  });

  test("canonical strings and genuine bytes remain integrity-only", () => {
    const fromString = action666cfReadback(
      action666cfCanonicalEnvelope(BigInt(1)),
    );
    const fromBytes = action666cfReadback(
      action666cfCanonicalBytes(BigInt(1)),
    );
    expect(fromString).toEqual(fromBytes);
    expect(fromString).toMatchObject({
      status: "integrity_only",
      integrity_verified: true,
      provenance_verified: false,
      authority_status: "integrity_only",
      trusted: false,
      admitted: false,
    });
  });

  test("fully recomputed semantic tampering never upgrades authority", () => {
    const original = action666cfReadback(
      action666cfCanonicalEnvelope(BigInt(1)),
    );
    const tampered = action666cfReadback(
      action666cfRecomputedSemanticReplacement(BigInt(1)),
    );
    expect(tampered).toMatchObject({
      status: "integrity_only",
      integrity_verified: true,
      provenance_verified: false,
      authority_status: "integrity_only",
      trusted: false,
      admitted: false,
    });
    expect(tampered.captured_input_digest).not.toBe(
      original.captured_input_digest,
    );
    expect(tampered.terminal_identity).not.toBe(
      original.terminal_identity,
    );
  });

  test("malformed, noncanonical, mismatch and integrity-only identities differ", () => {
    const canonical = action666cfCanonicalEnvelope("classification");
    const parsed = JSON.parse(canonical);
    const nonCanonical = JSON.stringify(
      Object.fromEntries(Object.entries(parsed).reverse()),
    );
    const mismatch = JSON.stringify({
      ...parsed,
      integrity_digest: "0".repeat(64),
    });
    const results = [
      action666cfReadback("{"),
      action666cfReadback(nonCanonical),
      action666cfReadback(mismatch),
      action666cfReadback(canonical),
    ];
    expect(results.map(({ status }) => status)).toEqual([
      "malformed",
      "non_canonical",
      "digest_mismatch",
      "integrity_only",
    ]);
    expect(new Set(results.map(({ terminal_identity }) =>
      terminal_identity)).size).toBe(4);
    expect(action666cfReadback("{")).toEqual(results[0]);
  });

  test("Proxy and accessor containers execute zero hooks", () => {
    const { observed, proxy } = hookProbe();
    const result = readbackUnsafe(proxy);
    expect(observed).toEqual({
      ownKeys: 0,
      descriptor: 0,
      prototype: 0,
      get: 0,
      iterator: 0,
      accessor: 0,
      toJSON: 0,
      valueOf: 0,
    });
    expect(result.terminal_result).toMatchObject({
      status: "input_rejected",
      reason_codes: ["arbitrary_object_input_rejected"],
    });
    expect(JSON.stringify(result)).not.toContain("caller_");
  });

  test("own coercion and iterator hooks on genuine bytes remain zero", () => {
    const bytes = action666cfCanonicalBytes(BigInt(1));
    const observed = { iterator: 0, toJSON: 0, valueOf: 0 };
    Object.defineProperties(bytes, {
      [Symbol.iterator]: {
        value() {
          observed.iterator += 1;
          throw new Error("caller_iterator_message");
        },
      },
      toJSON: {
        value() {
          observed.toJSON += 1;
          throw new Error("caller_tojson_message");
        },
      },
      valueOf: {
        value() {
          observed.valueOf += 1;
          throw new Error("caller_valueof_message");
        },
      },
    });
    const result = action666cfReadback(bytes);
    expect(result.status).toBe("integrity_only");
    expect(observed).toEqual({ iterator: 0, toJSON: 0, valueOf: 0 });
  });

  test("Uint8Array subclasses are rejected before subclass hooks", () => {
    const observed = { iterator: 0, toJSON: 0, valueOf: 0 };
    class HostileBytes extends Uint8Array {
      override [Symbol.iterator](): ArrayIterator<number> {
        observed.iterator += 1;
        throw new Error("subclass_iterator_message");
      }

      toJSON() {
        observed.toJSON += 1;
        throw new Error("subclass_tojson_message");
      }

      override valueOf(): this {
        observed.valueOf += 1;
        throw new Error("subclass_valueof_message");
      }
    }
    const input = new HostileBytes(action666cfCanonicalBytes(BigInt(1)));
    const result = readbackUnsafe(input);
    expect(observed).toEqual({ iterator: 0, toJSON: 0, valueOf: 0 });
    expect(result.terminal_result).toMatchObject({
      status: "input_rejected",
      reason_codes: ["uint8array_subclass_rejected"],
    });
  });

  test("snapshots bytes once and ignores mutation after entry", () => {
    const canonical = action666cfCanonicalEnvelope(BigInt(-17));
    const bytes = new TextEncoder().encode(canonical);
    const execution = runCanonicalCallbackFreeAtomicObservation(
      bytes,
      true,
      false,
    );
    const beforeMutation = structuredClone(execution);
    bytes.fill(0);
    expect(execution).toEqual(beforeMutation);
    expect(execution.counters).toMatchObject({
      input_snapshot_attempts: 1,
      input_snapshots: 1,
      input_byte_reads: new TextEncoder().encode(canonical).byteLength,
    });
    expect(execution.terminal_result).toEqual(
      action666cfReadback(canonical),
    );
  });

  test("detached, oversized and invalid bytes fail sanitized", () => {
    const detached = action666cfCanonicalBytes(BigInt(1));
    structuredClone(detached.buffer, { transfer: [detached.buffer] });
    const detachedResult = readbackUnsafe(detached);
    expect(detachedResult.terminal_result).toMatchObject({
      status: "input_rejected",
      reason_codes: ["arbitrary_object_input_rejected"],
    });
    const oversized = new Uint8Array(
      CANONICAL_CALLBACK_FREE_MAX_INPUT_BYTES + 1,
    );
    expect(readbackUnsafe(oversized).terminal_result).toMatchObject({
      status: "input_rejected",
      reason_codes: ["readback_too_large"],
    });
    expect(
      readbackUnsafe(new Uint8Array([0xff])).terminal_result,
    ).toMatchObject({
      status: "input_rejected",
      reason_codes: ["readback_bytes_invalid"],
    });
    expect(JSON.stringify(detachedResult)).not.toMatch(
      /TypeError|detached|stack|caller_/i,
    );
  });

  test("default-off and kill switch perform literal zero work", () => {
    for (const [enabled, killSwitch] of [
      [false, false],
      [true, true],
    ] as const) {
      const { proxy, observed } = hookProbe();
      const result = runCanonicalCallbackFreeAtomicObservation(
        proxy as unknown as string,
        enabled,
        killSwitch,
      );
      expect(result.terminal_result).toBeNull();
      expect(result.counters).toEqual({
        input_snapshot_attempts: 0,
        input_snapshots: 0,
        input_byte_reads: 0,
        parse_operations: 0,
        digest_operations: 0,
      });
      expect(observed).toEqual({
        ownKeys: 0,
        descriptor: 0,
        prototype: 0,
        get: 0,
        iterator: 0,
        accessor: 0,
        toJSON: 0,
        valueOf: 0,
      });
    }
  });

  test("preserves private authority and BV/BX/BZ interoperability", () => {
    expect(action666bvIssue(BigInt(1)).status).toBe("incomplete");
    expect(action666bxIssue(BigInt(1)).status).toBe("incomplete");
    expect(action666bzEvaluate(BigInt(1)).verification.status).toBe(
      "verified",
    );
    expect(
      action666cfReadback(action666cfCanonicalEnvelope(BigInt(1))).status,
    ).toBe("integrity_only");
  });

  test("matches deterministic synthetic golden evidence", () => {
    const scenarios = action666cfGoldenScenarios();
    const generated = {
      report_version:
        "action_666cf_golden_callback_free_atomic_observation_report_v1",
      boundary_version: CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
      readback_version: CANONICAL_CALLBACK_FREE_READBACK_VERSION,
      scenario_count: scenarios.length,
      scenario_digest:
        canonicalLosslessInvalidScalarIssuanceDigest(scenarios),
      status_inventory: [
        ...new Set(scenarios.map(({ status }) => status)),
      ].sort(),
      all_provenance_false: scenarios.every(
        ({ provenance_verified }) => provenance_verified === false,
      ),
      all_untrusted: scenarios.every(
        ({ trusted, admitted }) => !trusted && !admitted,
      ),
      safety: goldenReport.safety,
      performance_claims: [],
    };
    if (process.env.ACTION_666CF_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666CF_GOLDEN=${JSON.stringify(generated)}`);
    }
    expect(generated).toEqual(goldenReport);
  });

  test("remains server-only and outside live/write/provider/DB surfaces", () => {
    const root = process.cwd();
    const moduleName = "canonical-callback-free-atomic-observation";
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
