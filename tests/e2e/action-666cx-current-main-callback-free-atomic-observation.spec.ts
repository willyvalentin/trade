import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import goldenReport from "@/docs/action-666cx-golden-callback-free-atomic-observation-report.json";
import {
  action666cxCanonicalEnvelope,
  action666cxCanonicalReadbackBytes,
  action666cxGoldenScenarios,
  action666cxReadback,
} from "@/lib/server/canonical-callback-free-atomic-observation-fixtures";
import * as callbackFreeExports from "@/lib/server/canonical-callback-free-atomic-observation";
import {
  CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_ARTIFACT_ROLES,
  CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_MAX_INPUT_BYTES,
  CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_READBACK_VERSION,
  CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_TERMINALS,
  CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION,
  DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_ENABLED,
  DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_KILL_SWITCH,
  runCanonicalCallbackFreeAtomicObservation,
} from "@/lib/server/canonical-callback-free-atomic-observation";

const repositoryRoot = path.resolve(__dirname, "../..");
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
  input_snapshot_attempts: 0,
  input_snapshots: 0,
  input_byte_reads: 0,
  parse_operations: 0,
  digest_operations: 0,
} as const;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function terminal(input: unknown) {
  const result = action666cxReadback(input).terminal_result;
  if (result === null) throw new Error("action_666cx_terminal_missing");
  return result;
}

function hostileProxy() {
  const calls = {
    ownKeys: 0,
    getOwnPropertyDescriptor: 0,
    getPrototypeOf: 0,
    get: 0,
  };
  const proxy = new Proxy(
    {},
    {
      ownKeys() {
        calls.ownKeys += 1;
        throw new Error("caller_own_keys_message");
      },
      getOwnPropertyDescriptor() {
        calls.getOwnPropertyDescriptor += 1;
        throw new Error("caller_descriptor_message");
      },
      getPrototypeOf() {
        calls.getPrototypeOf += 1;
        throw new Error("caller_prototype_message");
      },
      get() {
        calls.get += 1;
        throw new Error("caller_get_message");
      },
    },
  );
  return { proxy, calls };
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

function recomputedSemanticReplacement(canonical: string) {
  const envelope = JSON.parse(canonical) as Record<string, unknown>;
  envelope.source_result_digest = "f".repeat(64);
  delete envelope.envelope_digest;
  envelope.envelope_digest = sha256(JSON.stringify(envelope));
  return JSON.stringify(envelope);
}

test.describe("Action 666CX current-main callback-free atomic observation", () => {
  test("freezes the direct public surface, versions, taxonomy and five-file scope", () => {
    expect(Object.keys(callbackFreeExports).sort()).toEqual([
      "CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_ARTIFACT_ROLES",
      "CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_MAX_INPUT_BYTES",
      "CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_READBACK_VERSION",
      "CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_TERMINALS",
      "CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION",
      "DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_ENABLED",
      "DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_KILL_SWITCH",
      "runCanonicalCallbackFreeAtomicObservation",
    ]);
    expect(CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_VERSION).toBe(
      "canonical_callback_free_atomic_observation_v2",
    );
    expect(CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_READBACK_VERSION).toBe(
      "canonical_callback_free_atomic_observation_readback_v2",
    );
    expect(CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_MAX_INPUT_BYTES).toBe(
      65_536,
    );
    expect(CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_TERMINALS).toEqual([
      "integrity_only",
      "malformed",
      "non_canonical",
      "digest_mismatch",
      "input_rejected",
    ]);
    expect(Object.keys(CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_ARTIFACT_ROLES)).toHaveLength(
      5,
    );
  });

  test("is literal default-off and killed before inspecting hostile input", () => {
    expect(DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_ENABLED).toBe(false);
    expect(DEFAULT_OFF_CALLBACK_FREE_ATOMIC_OBSERVATION_KILL_SWITCH).toBe(true);
    for (const [enabled, killSwitchEngaged, status] of [
      [false, false, "disabled"],
      [true, true, "kill_switch_engaged"],
      ["true", false, "disabled"],
      [true, null, "kill_switch_engaged"],
    ] as const) {
      const hostile = hostileProxy();
      const result = runCanonicalCallbackFreeAtomicObservation(
        hostile.proxy,
        enabled as never,
        killSwitchEngaged as never,
      );
      expect(result).toMatchObject({
        enabled: status !== "disabled",
        status,
        terminal_result: null,
        counters: zeroCounters,
        ...expectedSafety,
      });
      expect(hostile.calls).toEqual({
        ownKeys: 0,
        getOwnPropertyDescriptor: 0,
        getPrototypeOf: 0,
        get: 0,
      });
    }
  });

  test("reads canonical 666CW strings and direct bytes as integrity-only only", () => {
    const canonical = action666cxCanonicalEnvelope(BigInt(1));
    const fromString = terminal(canonical);
    const fromBytes = terminal(action666cxCanonicalReadbackBytes(BigInt(1)));
    expect(fromString).toEqual(fromBytes);
    expect(fromString).toMatchObject({
      terminal_status: "integrity_only",
      integrity_verified: true,
      provenance_verified: false,
      authority_status: "integrity_only",
      trusted: false,
      admitted: false,
      reason_codes: [],
      ...expectedSafety,
    });
    expect(fromString.captured_input_digest).toMatch(/^[a-f0-9]{64}$/);
    expect(fromString.observed_envelope_digest).toBe(
      fromString.rebuilt_envelope_digest,
    );
    expectRecursivelyFrozen(fromString);
  });

  test("keeps fully recomputed public semantic replacement at integrity-only", () => {
    const original = terminal(action666cxCanonicalEnvelope(BigInt(1)));
    const replacement = terminal(
      recomputedSemanticReplacement(action666cxCanonicalEnvelope(BigInt(1))),
    );
    expect(replacement).toMatchObject({
      terminal_status: "integrity_only",
      integrity_verified: true,
      provenance_verified: false,
      authority_status: "integrity_only",
      trusted: false,
      admitted: false,
    });
    expect(replacement.captured_input_digest).not.toBe(
      original.captured_input_digest,
    );
    expect(replacement.terminal_identity).not.toBe(original.terminal_identity);
  });

  test("keeps terminal and failure identities distinct across invalid categories", () => {
    const canonical = action666cxCanonicalEnvelope("classification");
    const reversed = JSON.stringify(
      Object.fromEntries(Object.entries(JSON.parse(canonical)).reverse()),
    );
    const mismatch = JSON.stringify({
      ...JSON.parse(canonical),
      envelope_digest: "0".repeat(64),
    });
    const duplicate = `{"envelope_version":"canonical_integrity_provenance_separated_observation_envelope_v2",${canonical.slice(1)}`;
    const extra = JSON.stringify({
      ...JSON.parse(canonical),
      unexpected: true,
    });
    const results = [
      terminal("{"),
      terminal(reversed),
      terminal(mismatch),
      terminal(duplicate),
      terminal(extra),
      terminal(canonical),
    ];
    expect(results.map(({ terminal_status }) => terminal_status)).toEqual([
      "malformed",
      "non_canonical",
      "digest_mismatch",
      "non_canonical",
      "non_canonical",
      "integrity_only",
    ]);
    expect(new Set(results.map(({ terminal_identity }) => terminal_identity)).size).toBe(
      results.length,
    );
    expect(results.slice(0, -1).every(({ failure_identity }) => failure_identity)).toBe(
      true,
    );
    expect(results.at(-1)?.failure_identity).toBeNull();
  });

  test("rejects callback-shaped, object and typed-array attacks without caller hooks", () => {
    let functionCalls = 0;
    const functionValue = () => {
      functionCalls += 1;
      throw new Error("caller_function_message");
    };
    const hostile = hostileProxy();
    let accessorCalls = 0;
    const accessor = {};
    Object.defineProperty(accessor, "payload", {
      enumerable: true,
      get() {
        accessorCalls += 1;
        throw new Error("caller_accessor_message");
      },
    });
    const bytes = action666cxCanonicalReadbackBytes(BigInt(1));
    const byteCalls = { iterator: 0, toJSON: 0, valueOf: 0 };
    Object.defineProperties(bytes, {
      [Symbol.iterator]: {
        value() {
          byteCalls.iterator += 1;
          throw new Error("caller_iterator_message");
        },
      },
      toJSON: {
        value() {
          byteCalls.toJSON += 1;
          throw new Error("caller_tojson_message");
        },
      },
      valueOf: {
        value() {
          byteCalls.valueOf += 1;
          throw new Error("caller_valueof_message");
        },
      },
    });
    class HostileBytes extends Uint8Array {
      toJSON() {
        throw new Error("subclass_tojson_message");
      }
    }
    const outcomes = [
      terminal(functionValue),
      terminal(hostile.proxy),
      terminal(accessor),
      terminal(bytes),
      terminal(new HostileBytes(action666cxCanonicalReadbackBytes(BigInt(1)))),
    ];
    expect(outcomes.map(({ terminal_status }) => terminal_status)).toEqual([
      "input_rejected",
      "input_rejected",
      "input_rejected",
      "integrity_only",
      "input_rejected",
    ]);
    expect(outcomes[0].reason_codes).toEqual(["function_valued_input_rejected"]);
    expect(outcomes[1].reason_codes).toEqual(["arbitrary_object_input_rejected"]);
    expect(outcomes[2].reason_codes).toEqual(["arbitrary_object_input_rejected"]);
    expect(outcomes[4].reason_codes).toEqual(["uint8array_subclass_rejected"]);
    expect(functionCalls).toBe(0);
    expect(accessorCalls).toBe(0);
    expect(hostile.calls).toEqual({
      ownKeys: 0,
      getOwnPropertyDescriptor: 0,
      getPrototypeOf: 0,
      get: 0,
    });
    expect(byteCalls).toEqual({ iterator: 0, toJSON: 0, valueOf: 0 });
    expect(JSON.stringify(outcomes)).not.toContain("caller_");
  });

  test("takes one snapshot and safely rejects detached, invalid and oversized bytes", () => {
    const canonical = action666cxCanonicalEnvelope(BigInt(-17));
    const bytes = new TextEncoder().encode(canonical);
    const result = action666cxReadback(bytes);
    const beforeMutation = structuredClone(result);
    bytes.fill(0);
    expect(result).toEqual(beforeMutation);
    expect(result.counters).toMatchObject({
      input_snapshot_attempts: 1,
      input_snapshots: 1,
      input_byte_reads: new TextEncoder().encode(canonical).byteLength,
    });
    const detached = action666cxCanonicalReadbackBytes(BigInt(1));
    structuredClone(detached.buffer, { transfer: [detached.buffer] });
    expect(terminal(detached)).toMatchObject({
      terminal_status: "input_rejected",
      reason_codes: ["readback_bytes_invalid"],
    });
    expect(
      terminal(
        new Uint8Array(
          CANONICAL_CALLBACK_FREE_ATOMIC_OBSERVATION_MAX_INPUT_BYTES + 1,
        ),
      ),
    ).toMatchObject({
      terminal_status: "input_rejected",
      reason_codes: ["readback_too_large"],
    });
    expect(terminal(new Uint8Array([0xff]))).toMatchObject({
      terminal_status: "input_rejected",
      reason_codes: ["readback_bytes_invalid"],
    });
  });

  test("matches the synthetic golden report and remains server-only without predecessor authority", async () => {
    expect(action666cxGoldenScenarios()).toEqual(goldenReport.scenarios);
    const source = await readFile(
      path.join(
        repositoryRoot,
        "lib/server/canonical-callback-free-atomic-observation.ts",
      ),
      "utf8",
    );
    expect(source.startsWith('import "server-only";')).toBe(true);
    expect(source).not.toMatch(
      /canonical-integrity-provenance-separated-observation|createCanonical|read_request|trust_callback|dependencies|harness|@supabase|createClient|fetch\(|process\.env|child_process|app\/api/,
    );
    const contract = await readFile(
      path.join(
        repositoryRoot,
        "docs/action-666cx-current-main-callback-free-atomic-observation.md",
      ),
      "utf8",
    );
    expect(contract).toContain("`960b88f85f3ad7be10c4b848c40127d63a21390b`");
    expect(contract).toMatch(/GitHub deployments were\s+empty/);
  });
});
