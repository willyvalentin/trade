import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { Worker } from "node:worker_threads";

import { expect, test } from "@playwright/test";

import {
  CANONICAL_IMMUTABLE_BYTE_MAX_INPUT_BYTES,
  CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ARTIFACT_ROLES,
  CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
  CANONICAL_RAW_BYTE_OBSERVATION_VERSION,
  runCanonicalLosslessImmutableByteSnapshot,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot";
import {
  action666chCanonicalBytes,
  action666chCanonicalEnvelope,
  action666chGoldenScenarios,
  action666chOffsetView,
  action666chReadback,
} from "@/lib/server/canonical-lossless-immutable-byte-snapshot-fixtures";
import { runCanonicalCallbackFreeAtomicObservation } from "@/lib/server/canonical-callback-free-atomic-observation";
import { action666bzEvaluate } from "@/lib/server/canonical-provenance-bound-observation-verification-fixtures";
import { action666bxIssue } from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures";
import { canonicalLosslessInvalidScalarIssuanceDigest } from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";
import { action666bvIssue } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import goldenReport from "../../docs/action-666ch-golden-lossless-immutable-byte-snapshot-report.json";

function unsafeRead(input: unknown) {
  return runCanonicalLosslessImmutableByteSnapshot(
    input as string,
    true,
    false,
  ).terminal_result!;
}

function predecessorRead(input: unknown) {
  return runCanonicalCallbackFreeAtomicObservation(
    input as string,
    true,
    false,
  ).terminal_result!;
}

function emptyCounterExpectation() {
  return {
    input_boundary_checks: 0,
    input_snapshot_attempts: 0,
    input_snapshots: 0,
    input_copy_operations: 0,
    input_byte_reads: 0,
    raw_byte_hash_operations: 0,
    decode_operations: 0,
    parse_operations: 0,
    digest_operations: 0,
  };
}

test.describe("Action 666CH lossless immutable byte snapshot", () => {
  test("defines exactly five additive artifacts and closed versions", () => {
    expect(
      Object.keys(
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_ARTIFACT_ROLES,
      ),
    ).toHaveLength(5);
    expect(CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION).toBe(
      "canonical_lossless_immutable_byte_snapshot_v1",
    );
    expect(CANONICAL_RAW_BYTE_OBSERVATION_VERSION).toBe(
      "canonical_raw_byte_observation_v1",
    );
    expect(CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION).toBe(
      "canonical_immutable_byte_readback_v1",
    );
  });

  test("reproduces CG-M1 against CF and closes it with raw bytes", () => {
    const predecessorFf = predecessorRead(new Uint8Array([0xff]));
    const predecessorFe = predecessorRead(new Uint8Array([0xfe]));
    expect(predecessorFf.failure_identity).toBe(
      predecessorFe.failure_identity,
    );

    const ff = action666chReadback(new Uint8Array([0xff]));
    const fe = action666chReadback(new Uint8Array([0xfe]));
    expect(ff.reason_codes).toEqual(["raw_bytes_invalid_utf8"]);
    expect(fe.reason_codes).toEqual(["raw_bytes_invalid_utf8"]);
    expect(ff.raw_byte_observation?.raw_byte_sha256).toBe(
      createHash("sha256").update(new Uint8Array([0xff])).digest("hex"),
    );
    expect(fe.raw_byte_observation?.raw_byte_sha256).toBe(
      createHash("sha256").update(new Uint8Array([0xfe])).digest("hex"),
    );
    expect(ff.raw_byte_observation?.observation_digest).not.toBe(
      fe.raw_byte_observation?.observation_digest,
    );
    expect(ff.terminal_identity).not.toBe(fe.terminal_identity);
    expect(ff.failure_identity).not.toBe(fe.failure_identity);
    expect(ff.readback_digest).not.toBe(fe.readback_digest);
  });

  test("independently rebuilds raw-byte and invalid-UTF8 identities", () => {
    const input = new Uint8Array([0xff]);
    const result = action666chReadback(input);
    const observation = result.raw_byte_observation!;
    const observationProjection = {
      observation_version: observation.observation_version,
      snapshot_contract_version: observation.snapshot_contract_version,
      input_domain: observation.input_domain,
      exact_byte_length: observation.exact_byte_length,
      raw_byte_sha256_algorithm: observation.raw_byte_sha256_algorithm,
      raw_byte_sha256: observation.raw_byte_sha256,
      observation_digest_algorithm: observation.observation_digest_algorithm,
    };
    expect(observation.raw_byte_sha256).toBe(
      createHash("sha256").update(input).digest("hex"),
    );
    expect(observation.observation_digest).toBe(
      canonicalLosslessInvalidScalarIssuanceDigest(
        observationProjection,
      ),
    );
    const terminalProjection = {
      readback_version: CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
      snapshot_contract_version:
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
      status: "malformed",
      raw_byte_observation_digest: observation.observation_digest,
      observed_integrity_digest: null,
      rebuilt_integrity_digest: null,
      reason_codes: ["raw_bytes_invalid_utf8"],
      integrity_verified: false,
      provenance_verified: false,
      authority_status: "untrusted",
      trusted: false,
      admitted: false,
    };
    expect(result.terminal_identity).toBe(
      canonicalLosslessInvalidScalarIssuanceDigest(terminalProjection),
    );
    expect(result.failure_identity).toBe(
      canonicalLosslessInvalidScalarIssuanceDigest({
        readback_version: CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
        terminal_identity: result.terminal_identity,
        raw_byte_observation_digest: observation.observation_digest,
        reason_codes: ["raw_bytes_invalid_utf8"],
      }),
    );
  });

  test("reproduces CG-M2 against CF and rejects shared memory in CH", async () => {
    const canonical = action666chCanonicalBytes(BigInt(1));
    const shared = new SharedArrayBuffer(canonical.byteLength);
    const bytes = new Uint8Array(shared);
    bytes.set(canonical);
    const controlBuffer = new SharedArrayBuffer(
      3 * Int32Array.BYTES_PER_ELEMENT,
    );
    const control = new Int32Array(controlBuffer);
    const worker = new Worker(
      `
        const { workerData } = require("node:worker_threads");
        const bytes = new Uint8Array(workerData.shared);
        const control = new Int32Array(workerData.control);
        const original = bytes[0];
        Atomics.store(control, 0, 1);
        Atomics.notify(control, 0);
        Atomics.wait(control, 1, 0);
        while (Atomics.load(control, 2) === 0) {
          Atomics.store(bytes, 0, original);
          Atomics.store(bytes, 0, 0x5b);
        }
        Atomics.store(bytes, 0, original);
      `,
      { eval: true, workerData: { shared, control: controlBuffer } },
    );
    if (Atomics.load(control, 0) === 0) {
      Atomics.wait(control, 0, 0, 5_000);
    }
    Atomics.store(control, 1, 1);
    Atomics.notify(control, 1);

    const predecessorResults = new Set<string>();
    for (let index = 0; index < 500; index += 1) {
      const result = predecessorRead(bytes);
      predecessorResults.add(
        `${result.status}:${result.captured_input_digest}`,
      );
    }
    const chResults = new Set<string>();
    for (let index = 0; index < 50; index += 1) {
      const execution = runCanonicalLosslessImmutableByteSnapshot(
        bytes,
        true,
        false,
      );
      expect(execution.counters).toEqual({
        ...emptyCounterExpectation(),
        input_boundary_checks: 1,
      });
      expect(execution.terminal_result).toMatchObject({
        status: "input_rejected",
        reason_codes: ["shared_array_buffer_backing_rejected"],
        raw_byte_observation: null,
      });
      chResults.add(execution.terminal_result!.readback_digest);
    }
    Atomics.store(control, 2, 1);
    await worker.terminate();
    expect(predecessorResults.size).toBeGreaterThan(1);
    expect(chResults.size).toBe(1);
  });

  test("supports offset views and copies only exact visible bytes", () => {
    const canonical = action666chCanonicalBytes(BigInt(-17));
    const view = action666chOffsetView(BigInt(-17));
    const execution = runCanonicalLosslessImmutableByteSnapshot(
      view,
      true,
      false,
    );
    expect(execution.counters).toMatchObject({
      input_snapshot_attempts: 1,
      input_snapshots: 1,
      input_copy_operations: 1,
      input_byte_reads: canonical.byteLength,
      raw_byte_hash_operations: 1,
    });
    expect(execution.terminal_result).toMatchObject({
      status: "integrity_only",
      raw_byte_observation: {
        exact_byte_length: canonical.byteLength,
        raw_byte_sha256: createHash("sha256")
          .update(canonical)
          .digest("hex"),
      },
    });
  });

  test("caller mutation before entry is observed and after entry is isolated", () => {
    const original = action666chCanonicalBytes(BigInt(1));
    const before = original.slice();
    before[0] = 0x5b;
    const changed = action666chReadback(before);
    const execution = runCanonicalLosslessImmutableByteSnapshot(
      original,
      true,
      false,
    );
    const completed = structuredClone(execution);
    original.fill(0);
    expect(execution).toEqual(completed);
    expect(changed.raw_byte_observation?.raw_byte_sha256).not.toBe(
      execution.terminal_result?.raw_byte_observation?.raw_byte_sha256,
    );
  });

  test("rejects detached, resizable and growable backing stores", () => {
    const detached = action666chCanonicalBytes(BigInt(1));
    structuredClone(detached.buffer, { transfer: [detached.buffer] });
    expect(unsafeRead(detached)).toMatchObject({
      reason_codes: ["detached_array_buffer_rejected"],
      raw_byte_observation: null,
    });

    const ResizableArrayBuffer = ArrayBuffer as unknown as new (
      length: number,
      options: { maxByteLength: number },
    ) => ArrayBuffer;
    try {
      const resizable = new ResizableArrayBuffer(8, {
        maxByteLength: 16,
      });
      const descriptor = Object.getOwnPropertyDescriptor(
        ArrayBuffer.prototype,
        "resizable",
      );
      if (descriptor?.get?.call(resizable) === true) {
        expect(unsafeRead(new Uint8Array(resizable))).toMatchObject({
          reason_codes: ["resizable_array_buffer_rejected"],
          raw_byte_observation: null,
        });
      }
    } catch {
      // Runtime does not support resizable ArrayBuffer construction.
    }

    const GrowableSharedArrayBuffer = SharedArrayBuffer as unknown as new (
      length: number,
      options: { maxByteLength: number },
    ) => SharedArrayBuffer;
    try {
      const growable = new GrowableSharedArrayBuffer(8, {
        maxByteLength: 16,
      });
      expect(unsafeRead(new Uint8Array(growable))).toMatchObject({
        reason_codes: ["shared_array_buffer_backing_rejected"],
        raw_byte_observation: null,
      });
    } catch {
      // Runtime does not support growable SharedArrayBuffer construction.
    }
  });

  test("rejects subclass, cross-realm and Proxy substitutions hook-free", () => {
    const hooks = {
      ownKeys: 0,
      descriptor: 0,
      prototype: 0,
      get: 0,
      iterator: 0,
      toJSON: 0,
      valueOf: 0,
    };
    const proxy = new Proxy(Object.create(null), {
      ownKeys() {
        hooks.ownKeys += 1;
        throw new Error("cg_ownkeys_message");
      },
      getOwnPropertyDescriptor() {
        hooks.descriptor += 1;
        throw new Error("cg_descriptor_message");
      },
      getPrototypeOf() {
        hooks.prototype += 1;
        throw new Error("cg_prototype_message");
      },
      get() {
        hooks.get += 1;
        throw new Error("cg_get_message");
      },
    });
    expect(unsafeRead(proxy)).toMatchObject({
      reason_codes: ["arbitrary_object_input_rejected"],
    });

    class HostileBytes extends Uint8Array {
      override [Symbol.iterator](): ArrayIterator<number> {
        hooks.iterator += 1;
        throw new Error("cg_iterator_message");
      }

      toJSON() {
        hooks.toJSON += 1;
        throw new Error("cg_tojson_message");
      }

      override valueOf(): this {
        hooks.valueOf += 1;
        throw new Error("cg_valueof_message");
      }
    }
    expect(unsafeRead(new HostileBytes([1]))).toMatchObject({
      reason_codes: ["typed_array_subclass_rejected"],
    });
    const crossRealm = vm.runInNewContext(
      "new Uint8Array([123])",
    ) as Uint8Array;
    expect(unsafeRead(crossRealm)).toMatchObject({
      reason_codes: ["typed_array_subclass_rejected"],
    });
    expect(hooks).toEqual({
      ownKeys: 0,
      descriptor: 0,
      prototype: 0,
      get: 0,
      iterator: 0,
      toJSON: 0,
      valueOf: 0,
    });
  });

  test("ignores own iterator, toJSON and valueOf on exact bytes", () => {
    const bytes = action666chCanonicalBytes(BigInt(1));
    const hooks = { iterator: 0, toJSON: 0, valueOf: 0 };
    Object.defineProperties(bytes, {
      [Symbol.iterator]: {
        value() {
          hooks.iterator += 1;
          throw new Error("iterator_message");
        },
      },
      toJSON: {
        value() {
          hooks.toJSON += 1;
          throw new Error("tojson_message");
        },
      },
      valueOf: {
        value() {
          hooks.valueOf += 1;
          throw new Error("valueof_message");
        },
      },
    });
    expect(action666chReadback(bytes).status).toBe("integrity_only");
    expect(hooks).toEqual({ iterator: 0, toJSON: 0, valueOf: 0 });
  });

  test("function-valued nested inputs execute zero hooks", () => {
    let executions = 0;
    const fn = () => {
      executions += 1;
      throw new Error("caller_function_message");
    };
    for (const input of [
      fn,
      { fn },
      { nested: { fn } },
      [fn],
      { array: [{ fn }] },
    ]) {
      const result = unsafeRead(input);
      expect(result.status).toBe("input_rejected");
    }
    expect(executions).toBe(0);
  });

  test("sanitizes malformed bytes and parser failures", () => {
    const malformed = action666chReadback("{");
    const invalid = action666chReadback(new Uint8Array([0xff]));
    expect(malformed.reason_codes).toEqual(["canonical_json_malformed"]);
    expect(invalid.reason_codes).toEqual(["raw_bytes_invalid_utf8"]);
    expect(JSON.stringify([malformed, invalid])).not.toMatch(
      /TypeError|SyntaxError|stack|decoder|caller_/,
    );
  });

  test("preserves exact integrity/provenance separation", () => {
    for (const input of [
      action666chCanonicalEnvelope(BigInt(1)),
      action666chCanonicalBytes(BigInt(1)),
    ]) {
      expect(action666chReadback(input)).toMatchObject({
        status: "integrity_only",
        integrity_verified: true,
        provenance_verified: false,
        authority_status: "integrity_only",
        trusted: false,
        admitted: false,
      });
    }
  });

  test("default-off and kill switch perform literal zero work", () => {
    const proxy = new Proxy(Object.create(null), {
      get() {
        throw new Error("default_off_get_message");
      },
    });
    for (const [enabled, killSwitch] of [
      [false, false],
      [true, true],
    ] as const) {
      const result = runCanonicalLosslessImmutableByteSnapshot(
        proxy as unknown as string,
        enabled,
        killSwitch,
      );
      expect(result.terminal_result).toBeNull();
      expect(result.counters).toEqual(emptyCounterExpectation());
    }
  });

  test("preserves BV/BX/BZ/CD/CF interoperability", () => {
    expect(action666bvIssue(BigInt(1)).status).toBe("incomplete");
    expect(action666bxIssue(BigInt(1)).status).toBe("incomplete");
    expect(action666bzEvaluate(BigInt(1)).verification.status).toBe(
      "verified",
    );
    expect(predecessorRead(action666chCanonicalBytes(BigInt(1))).status).toBe(
      "integrity_only",
    );
    expect(action666chReadback(action666chCanonicalBytes(BigInt(1))).status)
      .toBe("integrity_only");
  });

  test("matches deterministic synthetic golden evidence", () => {
    const scenarios = action666chGoldenScenarios();
    const invalid = scenarios.filter(({ name }) =>
      name.startsWith("invalid_utf8_"),
    );
    const generated = {
      report_version:
        "action_666ch_golden_lossless_immutable_byte_snapshot_report_v1",
      snapshot_contract_version:
        CANONICAL_LOSSLESS_IMMUTABLE_BYTE_SNAPSHOT_VERSION,
      raw_byte_observation_version: CANONICAL_RAW_BYTE_OBSERVATION_VERSION,
      readback_version: CANONICAL_IMMUTABLE_BYTE_READBACK_VERSION,
      scenario_count: scenarios.length,
      scenario_digest:
        canonicalLosslessInvalidScalarIssuanceDigest(scenarios),
      status_inventory: [
        ...new Set(scenarios.map(({ status }) => status)),
      ].sort(),
      invalid_utf8_observations_distinct:
        new Set(invalid.map(({ raw_byte_observation_digest }) =>
          raw_byte_observation_digest)).size === invalid.length,
      all_provenance_false: scenarios.every(
        ({ provenance_verified }) => provenance_verified === false,
      ),
      all_untrusted: scenarios.every(
        ({ trusted, admitted }) => !trusted && !admitted,
      ),
      safety: goldenReport.safety,
      performance_claims: [],
    };
    if (process.env.ACTION_666CH_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666CH_GOLDEN=${JSON.stringify(generated)}`);
    }
    expect(generated).toEqual(goldenReport);
  });

  test("remains server-only and outside live/write/provider/DB surfaces", () => {
    const root = process.cwd();
    const moduleName = "canonical-lossless-immutable-byte-snapshot";
    const source = fs.readFileSync(
      path.join(root, `lib/server/${moduleName}.ts`),
      "utf8",
    );
    expect(source.startsWith('import "server-only";')).toBe(true);
    expect(source).not.toContain("read_request");
    expect(source).not.toMatch(
      /\.(insert|upsert)\s*\(|\b(writeFile|appendFile|fetch)\s*\(/,
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
    expect(CANONICAL_IMMUTABLE_BYTE_MAX_INPUT_BYTES).toBe(65_536);
  });
});
