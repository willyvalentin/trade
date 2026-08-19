import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

import goldenReport from "@/docs/action-666cy-golden-lossless-immutable-byte-snapshot-report.json";
import {
  action666cyCanonicalBytes,
  action666cyCanonicalEnvelope,
  action666cyGoldenScenarios,
  action666cyReadback,
  action666cyTerminal,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot-fixtures";
import * as snapshotExports from "@/lib/server/canonical-lossless-immutable-byte-snapshot";
import {
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_MAX_INPUT_BYTES,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ARTIFACT_ROLES,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_TERMINALS,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
  CANONICAL_RAW_BYTE_OBSERVATION_VERSION,
  DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ENABLED,
  DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_KILL_SWITCH,
  runCanonicalLosslessImmutableByteSnapshot,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot";

const repositoryRoot = path.resolve(__dirname, "../..");
const zeroCounters = {
  input_boundary_checks: 0,
  input_snapshot_attempts: 0,
  input_snapshots: 0,
  input_copy_operations: 0,
  input_byte_reads: 0,
  raw_byte_hash_operations: 0,
  decode_operations: 0,
  parse_operations: 0,
  digest_operations: 0,
} as const;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
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

function hostileProxy() {
  const calls = {
    ownKeys: 0,
    descriptor: 0,
    prototype: 0,
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
        calls.descriptor += 1;
        throw new Error("caller_descriptor_message");
      },
      getPrototypeOf() {
        calls.prototype += 1;
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

test.describe("Action 666CY current-main lossless immutable byte snapshot", () => {
  test("freezes the direct surface, versions, taxonomy and five-file scope", () => {
    expect(Object.keys(snapshotExports).sort()).toEqual([
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_MAX_INPUT_BYTES",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ARTIFACT_ROLES",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_TERMINALS",
      "CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION",
      "CANONICAL_RAW_BYTE_OBSERVATION_VERSION",
      "DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ENABLED",
      "DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_KILL_SWITCH",
      "runCanonicalLosslessImmutableByteSnapshot",
    ]);
    expect(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION).toBe(
      "canonical_lossless_immutable_byte_snapshot_v2",
    );
    expect(CANONICAL_RAW_BYTE_OBSERVATION_VERSION).toBe(
      "canonical_raw_byte_observation_v2",
    );
    expect(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION).toBe(
      "canonical_lossless_immutable_byte_readback_v2",
    );
    expect(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_MAX_INPUT_BYTES).toBe(65_536);
    expect(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_TERMINALS).toEqual([
      "integrity_only",
      "malformed",
      "non_canonical",
      "digest_mismatch",
      "input_rejected",
    ]);
    expect(
      Object.keys(
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ARTIFACT_ROLES,
      ),
    ).toHaveLength(5);
  });

  test("is literal default-off and killed before inspecting hostile input", () => {
    expect(DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ENABLED).toBe(false);
    expect(DEFAULT_OFF_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_KILL_SWITCH).toBe(true);
    for (const [enabled, killed, status] of [
      [false, false, "disabled"],
      [true, true, "kill_switch_engaged"],
      ["true", false, "disabled"],
      [true, null, "kill_switch_engaged"],
    ] as const) {
      const hostile = hostileProxy();
      const result = runCanonicalLosslessImmutableByteSnapshot(
        hostile.proxy,
        enabled as never,
        killed as never,
      );
      expect(result).toMatchObject({
        status,
        terminal_result: null,
        counters: zeroCounters,
      });
      expect(hostile.calls).toEqual({
        ownKeys: 0,
        descriptor: 0,
        prototype: 0,
        get: 0,
      });
    }
  });

  test("reads canonical strings, exact bytes and offset views as integrity-only", () => {
    const canonical = action666cyCanonicalEnvelope(BigInt(1));
    const canonicalBytes = action666cyCanonicalBytes(BigInt(1));
    const stringResult = action666cyTerminal(canonical);
    const byteResult = action666cyTerminal(canonicalBytes);
    const framed = new Uint8Array(canonicalBytes.length + 4);
    framed.set([1, 2], 0);
    framed.set(canonicalBytes, 2);
    framed.set([3, 4], canonicalBytes.length + 2);
    const offsetResult = action666cyTerminal(
      framed.subarray(2, canonicalBytes.length + 2),
    );
    for (const result of [stringResult, byteResult, offsetResult]) {
      expect(result).toMatchObject({
        terminal_status: "integrity_only",
        integrity_verified: true,
        provenance_verified: false,
        authority_status: "integrity_only",
        trusted: false,
        admitted: false,
        reason_codes: [],
      });
      expect(result.raw_byte_observation?.exact_byte_length).toBe(
        canonicalBytes.length,
      );
      expectRecursivelyFrozen(result);
    }
    expect(byteResult).toEqual(offsetResult);
    expect(stringResult.raw_byte_observation?.raw_byte_sha256).toBe(
      byteResult.raw_byte_observation?.raw_byte_sha256,
    );
  });

  test("binds distinct invalid UTF-8 bytes before decoding", () => {
    const first = action666cyTerminal(new Uint8Array([0xff]));
    const second = action666cyTerminal(new Uint8Array([0xfe]));
    for (const result of [first, second]) {
      expect(result).toMatchObject({
        terminal_status: "malformed",
        integrity_verified: false,
        provenance_verified: false,
        authority_status: "none",
        trusted: false,
        admitted: false,
        reason_codes: ["raw_bytes_invalid_utf8"],
      });
      expect(result.raw_byte_observation).not.toBeNull();
    }
    expect(first.raw_byte_observation?.raw_byte_sha256).not.toBe(
      second.raw_byte_observation?.raw_byte_sha256,
    );
    expect(first.raw_byte_observation?.observation_digest).not.toBe(
      second.raw_byte_observation?.observation_digest,
    );
    expect(first.terminal_identity).not.toBe(second.terminal_identity);
    expect(first.failure_identity).not.toBe(second.failure_identity);
    expect(first.readback_digest).not.toBe(second.readback_digest);
  });

  test("takes one private snapshot and is immutable after caller mutation", () => {
    const bytes = action666cyCanonicalBytes(BigInt(1));
    const result = action666cyReadback(bytes);
    const beforeMutation = structuredClone(result);
    bytes.fill(0);
    expect(result).toEqual(beforeMutation);
    expect(result.counters).toMatchObject({
      input_boundary_checks: 1,
      input_snapshot_attempts: 1,
      input_snapshots: 1,
      input_copy_operations: 1,
      input_byte_reads: action666cyCanonicalBytes(BigInt(1)).length,
      raw_byte_hash_operations: 1,
      decode_operations: 1,
      parse_operations: 1,
    });
  });

  test("rejects shared, resizable, detached and oversized storage before copying", () => {
    const shared = new Uint8Array(new SharedArrayBuffer(8));
    const sharedResult = action666cyReadback(shared);
    expect(sharedResult.terminal_result).toMatchObject({
      reason_codes: ["shared_array_buffer_backing_rejected"],
      raw_byte_observation: null,
    });
    expect(sharedResult.counters).toMatchObject({
      input_snapshot_attempts: 0,
      input_snapshots: 0,
      input_copy_operations: 0,
      input_byte_reads: 0,
    });

    const detached = action666cyCanonicalBytes(BigInt(1));
    structuredClone(detached.buffer, { transfer: [detached.buffer] });
    expect(action666cyTerminal(detached)).toMatchObject({
      terminal_status: "input_rejected",
      reason_codes: ["detached_array_buffer_rejected"],
      raw_byte_observation: null,
    });

    const oversized = action666cyReadback(
      new Uint8Array(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_MAX_INPUT_BYTES + 1),
    );
    expect(oversized.terminal_result).toMatchObject({
      reason_codes: ["readback_too_large"],
      raw_byte_observation: null,
    });
    expect(oversized.counters).toMatchObject({
      input_snapshot_attempts: 0,
      input_snapshots: 0,
      input_copy_operations: 0,
      input_byte_reads: 0,
    });

    let resizable: ArrayBuffer | null = null;
    try {
      const ResizableArrayBuffer = ArrayBuffer as unknown as new (
        length: number,
        options: { maxByteLength: number },
      ) => ArrayBuffer;
      resizable = new ResizableArrayBuffer(8, { maxByteLength: 16 });
    } catch {
      // Runtime does not expose resizable ArrayBuffer construction.
    }
    if (
      resizable !== null &&
      Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "resizable")
        ?.get?.call(resizable) === true
    ) {
      expect(action666cyTerminal(new Uint8Array(resizable))).toMatchObject({
        reason_codes: ["resizable_array_buffer_rejected"],
        raw_byte_observation: null,
      });
    }
  });

  test("rejects proxies, subclasses, cross-realm views and objects without hooks", () => {
    const hostile = hostileProxy();
    class HostileBytes extends Uint8Array {
      override [Symbol.iterator](): ArrayIterator<number> {
        throw new Error("caller_iterator_message");
      }
    }
    const crossRealm = vm.runInNewContext(
      "new Uint8Array([123])",
    ) as Uint8Array;
    const outcomes = [
      action666cyTerminal(hostile.proxy),
      action666cyTerminal(new HostileBytes([1])),
      action666cyTerminal(crossRealm),
      action666cyTerminal(new DataView(new ArrayBuffer(1))),
      action666cyTerminal({ bytes: [1] }),
    ];
    expect(outcomes.map(({ reason_codes }) => reason_codes)).toEqual([
      ["arbitrary_object_input_rejected"],
      ["typed_array_subclass_rejected"],
      ["typed_array_subclass_rejected"],
      ["arbitrary_object_input_rejected"],
      ["arbitrary_object_input_rejected"],
    ]);
    expect(hostile.calls).toEqual({
      ownKeys: 0,
      descriptor: 0,
      prototype: 0,
      get: 0,
    });
    expect(JSON.stringify(outcomes)).not.toContain("caller_");
  });

  test("ignores caller iterator, toJSON and valueOf on exact bytes", () => {
    const bytes = action666cyCanonicalBytes(BigInt(1));
    const calls = { iterator: 0, toJSON: 0, valueOf: 0 };
    Object.defineProperties(bytes, {
      [Symbol.iterator]: {
        value() {
          calls.iterator += 1;
          throw new Error("caller_iterator_message");
        },
      },
      toJSON: {
        value() {
          calls.toJSON += 1;
          throw new Error("caller_tojson_message");
        },
      },
      valueOf: {
        value() {
          calls.valueOf += 1;
          throw new Error("caller_valueof_message");
        },
      },
    });
    expect(action666cyTerminal(bytes).terminal_status).toBe("integrity_only");
    expect(calls).toEqual({ iterator: 0, toJSON: 0, valueOf: 0 });
  });

  test("captures critical primordials before post-import drift", () => {
    const weakSetHas = Object.getOwnPropertyDescriptor(
      WeakSet.prototype,
      "has",
    )!;
    const weakSetAdd = Object.getOwnPropertyDescriptor(
      WeakSet.prototype,
      "add",
    )!;
    const arrayIterator = Object.getOwnPropertyDescriptor(
      Array.prototype,
      Symbol.iterator,
    )!;
    const typedSet = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(Uint8Array.prototype),
      "set",
    )!;
    let hookCalls = 0;
    let result: ReturnType<typeof action666cyTerminal> | undefined;
    try {
      Object.defineProperty(WeakSet.prototype, "has", {
        ...weakSetHas,
        value() {
          hookCalls += 1;
          throw new Error("weakset_has_sentinel");
        },
      });
      Object.defineProperty(WeakSet.prototype, "add", {
        ...weakSetAdd,
        value() {
          hookCalls += 1;
          throw new Error("weakset_add_sentinel");
        },
      });
      Object.defineProperty(Array.prototype, Symbol.iterator, {
        ...arrayIterator,
        value() {
          hookCalls += 1;
          throw new Error("array_iterator_sentinel");
        },
      });
      Object.defineProperty(
        Object.getPrototypeOf(Uint8Array.prototype),
        "set",
        {
          ...typedSet,
          value() {
            hookCalls += 1;
            throw new Error("typed_set_sentinel");
          },
        },
      );
      result = action666cyTerminal(action666cyCanonicalBytes(BigInt(1)));
    } finally {
      Object.defineProperty(WeakSet.prototype, "has", weakSetHas);
      Object.defineProperty(WeakSet.prototype, "add", weakSetAdd);
      Object.defineProperty(Array.prototype, Symbol.iterator, arrayIterator);
      Object.defineProperty(
        Object.getPrototypeOf(Uint8Array.prototype),
        "set",
        typedSet,
      );
    }
    expect(hookCalls).toBe(0);
    expect(result?.terminal_status).toBe("integrity_only");
  });

  test("preflights oversized strings before encoding", () => {
    const result = runCanonicalLosslessImmutableByteSnapshot(
      "x".repeat(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_MAX_INPUT_BYTES + 1),
      true,
      false,
    );
    expect(result.terminal_result).toMatchObject({
      terminal_status: "input_rejected",
      reason_codes: ["readback_too_large"],
      raw_byte_observation: null,
    });
    expect(result.counters).toMatchObject({
      input_boundary_checks: 1,
      input_snapshot_attempts: 1,
      input_snapshots: 0,
      input_copy_operations: 0,
      input_byte_reads: 0,
      raw_byte_hash_operations: 0,
      decode_operations: 0,
      parse_operations: 0,
    });
  });

  test("distinguishes malformed, non-canonical and digest-mismatch evidence", () => {
    const canonical = action666cyCanonicalEnvelope("classify");
    const reversed = JSON.stringify(
      Object.fromEntries(Object.entries(JSON.parse(canonical)).reverse()),
    );
    const mismatch = JSON.stringify({
      ...JSON.parse(canonical),
      envelope_digest: "0".repeat(64),
    });
    const results = [
      action666cyTerminal("{"),
      action666cyTerminal(reversed),
      action666cyTerminal(mismatch),
    ];
    expect(results.map(({ terminal_status }) => terminal_status)).toEqual([
      "malformed",
      "non_canonical",
      "digest_mismatch",
    ]);
    expect(new Set(results.map(({ terminal_identity }) => terminal_identity)).size)
      .toBe(results.length);
  });

  test("keeps self-consistent public replacement at integrity-only", () => {
    const envelope = JSON.parse(
      action666cyCanonicalEnvelope(BigInt(1)),
    ) as Record<string, unknown>;
    envelope.source_result_digest = "f".repeat(64);
    delete envelope.envelope_digest;
    envelope.envelope_digest = sha256(JSON.stringify(envelope));
    expect(action666cyTerminal(JSON.stringify(envelope))).toMatchObject({
      terminal_status: "integrity_only",
      integrity_verified: true,
      provenance_verified: false,
      authority_status: "integrity_only",
      trusted: false,
      admitted: false,
    });
  });

  test("matches deterministic synthetic golden evidence", () => {
    const scenarios = action666cyGoldenScenarios();
    const invalid = scenarios.filter(({ name }) =>
      name.startsWith("invalid_utf8_"),
    );
    const generated = {
      report_version:
        "action_666cy_current_main_lossless_immutable_byte_snapshot_golden_report_v1",
      candidate_base_commit:
        "377b87d344ddb48d73c725b348d1dcb4c0943fd1",
      candidate_base_tree: "7b8c529ecabfe367ccba3ec27629f02b8c5d4c44",
      candidate_base_exact_main_ci_run: 32261552249,
      snapshot_contract_version:
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
      raw_byte_observation_version: CANONICAL_RAW_BYTE_OBSERVATION_VERSION,
      readback_version:
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_READBACK_VERSION,
      scenario_count: scenarios.length,
      scenario_digest: sha256(JSON.stringify(scenarios)),
      scenarios,
      invalid_utf8_observations_distinct:
        new Set(
          invalid.map(({ raw_byte_observation_digest }) =>
            raw_byte_observation_digest),
        ).size === invalid.length,
      all_provenance_false: scenarios.every(
        ({ provenance_verified }) => provenance_verified === false,
      ),
      all_untrusted: scenarios.every(
        ({ trusted, admitted }) => !trusted && !admitted,
      ),
      performance_claims: [],
    };
    if (process.env.ACTION_666CY_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666CY_GOLDEN=${JSON.stringify(generated)}`);
    }
    expect(generated).toEqual(goldenReport);
  });

  test("remains server-only, provider-free and runtime-unwired", async () => {
    const source = await readFile(
      path.join(
        repositoryRoot,
        "lib/server/canonical-lossless-immutable-byte-snapshot.ts",
      ),
      "utf8",
    );
    expect(source.startsWith('import "server-only";')).toBe(true);
    expect(source).not.toMatch(
      /read_request|trust_callback|dependencies|harness|@supabase|createClient|fetch\(|process\.env|child_process|app\/api|\.insert\(|\.upsert\(/,
    );
    const stringCapture = source.slice(
      source.indexOf('if (typeof input === "string")'),
      source.indexOf('if (input === null || typeof input !== "object")'),
    );
    expect(stringCapture.indexOf("input.length >")).toBeGreaterThanOrEqual(0);
    expect(stringCapture.indexOf("input.length >")).toBeLessThan(
      stringCapture.indexOf("intrinsicTextEncoderEncode"),
    );
    const plan = await readFile(
      path.join(
        repositoryRoot,
        "docs/action-666cy-current-main-lossless-immutable-byte-snapshot-plan.md",
      ),
      "utf8",
    );
    expect(plan).toContain("Historical PR #72");
    expect(plan).toContain("design context only");
  });
});
