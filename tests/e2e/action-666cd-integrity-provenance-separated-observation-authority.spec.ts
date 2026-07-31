import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import * as separationExports from "@/lib/server/canonical-integrity-provenance-separated-observation-authority";
import {
  CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION,
  CANONICAL_INTEGRITY_ONLY_READBACK_VERSION,
  CANONICAL_INTEGRITY_PROVENANCE_MAX_READBACK_BYTES,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_ARTIFACT_ROLES,
  CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION,
  CANONICAL_RUNTIME_PROVENANCE_EVIDENCE_VERSION,
  runCanonicalIntegrityProvenanceSeparatedObservation,
  type CanonicalIntegrityProvenanceSeparationCounters,
} from "@/lib/server/canonical-integrity-provenance-separated-observation-authority";
import {
  action666cdCanonicalReadbackBytes,
  action666cdGoldenScenarios,
  action666cdIssue,
  action666cdPrimitiveMatrix,
  action666cdReadback,
} from "@/lib/server/canonical-integrity-provenance-separated-observation-authority-fixtures";
import {
  observeCanonicalPrimitiveAtomically,
  verifyCanonicalPrivateAtomicObservationReadback,
} from "@/lib/server/canonical-private-atomic-observation-authority";
import { action666bzEvaluate } from "@/lib/server/canonical-provenance-bound-observation-verification-fixtures";
import { action666bxIssue } from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance-fixtures";
import { action666bvIssue } from "@/lib/server/canonical-non-forgeable-binding-snapshot-issuance-fixtures";
import { canonicalLosslessInvalidScalarIssuanceDigest } from "@/lib/server/canonical-lossless-invalid-scalar-observation-issuance";
import goldenReport from "../../docs/action-666cd-golden-integrity-provenance-separation-report.json";

const expectedExports = [
  "CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION",
  "CANONICAL_INTEGRITY_ONLY_READBACK_VERSION",
  "CANONICAL_INTEGRITY_PROVENANCE_MAX_READBACK_BYTES",
  "CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_ARTIFACT_ROLES",
  "CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION",
  "CANONICAL_RUNTIME_PROVENANCE_EVIDENCE_VERSION",
  "DEFAULT_OFF_INTEGRITY_PROVENANCE_SEPARATION_ENABLED",
  "DEFAULT_OFF_INTEGRITY_PROVENANCE_SEPARATION_KILL_SWITCH",
  "runCanonicalIntegrityProvenanceSeparatedObservation",
].sort();

function counters(): CanonicalIntegrityProvenanceSeparationCounters {
  return {
    request_reads: 0,
    runtime_issuance_calls: 0,
    readback_reads: 0,
    parse_operations: 0,
    digest_operations: 0,
  };
}

function recomputePublicDigest(record: Record<string, unknown>) {
  const projection = {
    ...record,
    integrity_digest: undefined,
  };
  record.integrity_digest =
    canonicalLosslessInvalidScalarIssuanceDigest(projection);
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
  Object.defineProperty(target, "integrity_digest", {
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

test.describe("Action 666CD integrity and provenance separation", () => {
  test("defines exactly five additive artifacts and V2 contracts", () => {
    expect(
      Object.keys(
        CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_ARTIFACT_ROLES,
      ),
    ).toHaveLength(5);
    expect(CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION).toBe(
      "canonical_integrity_provenance_separation_v2",
    );
    expect(CANONICAL_RUNTIME_PROVENANCE_EVIDENCE_VERSION).toBe(
      "canonical_runtime_provenance_evidence_v2",
    );
    expect(CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION).toBe(
      "canonical_integrity_only_observation_envelope_v2",
    );
    expect(CANONICAL_INTEGRITY_ONLY_READBACK_VERSION).toBe(
      "canonical_integrity_only_observation_readback_v2",
    );
  });

  test("reproduces 666CC-M1 against CB", () => {
    const legitimate = observeCanonicalPrimitiveAtomically(BigInt(1));
    const forged = JSON.parse(legitimate.canonical_evidence_string!);
    forged.primitive_type = "string";
    forged.capsule_identity = "1".repeat(64);
    forged.capsule_digest = "2".repeat(64);
    forged.primitive_value_digest = "3".repeat(64);
    forged.primitive_observation_digest = "4".repeat(64);
    forged.bounded_observation_digest = "5".repeat(64);
    const projection = {
      ...forged,
      evidence_digest: undefined,
    };
    forged.evidence_digest =
      canonicalLosslessInvalidScalarIssuanceDigest(projection);
    expect(
      verifyCanonicalPrivateAtomicObservationReadback(
        JSON.stringify(forged),
      ),
    ).toMatchObject({
      status: "verified",
      evidence: {
        provenance_verified: true,
        primitive_type: "string",
      },
    });
  });

  test("serialized readback always loses private runtime provenance", () => {
    const issued = action666cdIssue(BigInt(1));
    expect(issued).toMatchObject({
      status: "runtime_provenance_verified",
      integrity_verified: true,
      provenance_verified: true,
      authority_status: "private_runtime_provenance",
      trusted: true,
      admitted: false,
      capsule_exposed: false,
    });
    const readback = action666cdReadback(
      issued.canonical_integrity_envelope,
    );
    expect(readback).toMatchObject({
      status: "integrity_only",
      integrity_verified: true,
      provenance_verified: false,
      authority_status: "integrity_only",
      trusted: false,
      admitted: false,
      failure_identity: null,
    });
    expect(readback.envelope).toMatchObject({
      integrity_verified: true,
      provenance_verified: false,
      authority_status: "integrity_only",
      trusted: false,
      admitted: false,
    });
  });

  test("fully recomputed semantic replacement remains integrity-only and untrusted", () => {
    const issued = action666cdIssue(BigInt(1));
    const forged = JSON.parse(issued.canonical_integrity_envelope!);
    forged.primitive_type = "string";
    forged.primitive_value_digest = "1".repeat(64);
    forged.primitive_observation_digest = "2".repeat(64);
    forged.bounded_observation_digest = "3".repeat(64);
    recomputePublicDigest(forged);
    const result = action666cdReadback(JSON.stringify(forged));
    expect(result).toMatchObject({
      status: "integrity_only",
      integrity_verified: true,
      provenance_verified: false,
      authority_status: "integrity_only",
      trusted: false,
      admitted: false,
      envelope: {
        primitive_type: "string",
        provenance_verified: false,
        trusted: false,
        admitted: false,
      },
    });
    expect(result.readback_digest).not.toBe(
      action666cdReadback(
        issued.canonical_integrity_envelope,
      ).readback_digest,
    );
  });

  test("no public digest, schema or equality path upgrades trust", () => {
    expect(Object.keys(separationExports).sort()).toEqual(expectedExports);
    expect(
      Object.keys(separationExports).some((name) =>
        /mint|factory|upgrade|trust.*callback|callback.*trust/i.test(name),
      ),
    ).toBe(false);
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "lib/server/canonical-integrity-provenance-separated-observation-authority.ts",
      ),
      "utf8",
    );
    expect(source).not.toMatch(
      /export\s+(?:async\s+)?function\s+\w*(?:mint|factory|upgrade)/i,
    );
    expect(source).not.toMatch(
      /export\s+(?:const|let|var)\s+\w*(?:mint|factory|upgrade)/i,
    );
    expect(source).not.toContain("trust_callback");
  });

  test("distinguishes malformed, noncanonical, digest mismatch and integrity-only", () => {
    const canonical =
      action666cdIssue("classification").canonical_integrity_envelope!;
    const parsed = JSON.parse(canonical);
    const digestMismatch = JSON.stringify({
      ...parsed,
      integrity_digest: "0".repeat(64),
    });
    const nonCanonical = JSON.stringify(
      Object.fromEntries(Object.entries(parsed).reverse()),
    );
    expect(action666cdReadback("{").status).toBe("malformed");
    expect(action666cdReadback(nonCanonical).status).toBe(
      "non_canonical",
    );
    expect(action666cdReadback(digestMismatch).status).toBe(
      "digest_mismatch",
    );
    expect(action666cdReadback(canonical).status).toBe("integrity_only");
  });

  test("binds exact canonical bytes into deterministic failure identities", () => {
    const left = action666cdReadback("{");
    const right = action666cdReadback("[");
    expect(left.observed_input_digest).not.toBe(
      right.observed_input_digest,
    );
    expect(left.terminal_identity).not.toBe(right.terminal_identity);
    expect(left.failure_identity).not.toBe(right.failure_identity);
    expect(action666cdReadback("{")).toEqual(left);
  });

  test("canonical JSON and genuine Uint8Array have identical integrity-only result", () => {
    const issued = action666cdIssue(BigInt(-17));
    const fromString = action666cdReadback(
      issued.canonical_integrity_envelope,
    );
    const fromBytes = action666cdReadback(
      action666cdCanonicalReadbackBytes(BigInt(-17)),
    );
    expect(fromString).toEqual(fromBytes);
    expect(fromString.status).toBe("integrity_only");
    expect(fromString.provenance_verified).toBe(false);
  });

  test("clones, substitutions, Proxies and accessors execute zero hooks", () => {
    const issued = action666cdIssue(BigInt(1));
    const clone = structuredClone(issued.runtime_evidence);
    const substitute = {
      ...issued.runtime_evidence,
      provenance_verified: true,
    };
    for (const candidate of [clone, substitute]) {
      expect(action666cdReadback(candidate)).toMatchObject({
        status: "input_rejected",
        provenance_verified: false,
        trusted: false,
        admitted: false,
        observed_input_digest: null,
      });
    }
    const { observed, proxy } = hookProbe();
    const result = action666cdReadback(proxy);
    expect(observed).toEqual({
      ownKeys: 0,
      descriptor: 0,
      prototype: 0,
      get: 0,
      iterator: 0,
      accessor: 0,
    });
    expect(result.status).toBe("input_rejected");
    expect(JSON.stringify(result)).not.toContain("caller_");
  });

  test("enforces readback byte bound without provenance elevation", () => {
    const oversized = new Uint8Array(
      CANONICAL_INTEGRITY_PROVENANCE_MAX_READBACK_BYTES + 1,
    );
    expect(action666cdReadback(oversized)).toMatchObject({
      status: "input_rejected",
      provenance_verified: false,
      trusted: false,
      admitted: false,
      reason_codes: ["readback_too_large"],
    });
    expect(action666cdReadback(new Uint8Array([0xff]))).toMatchObject({
      status: "input_rejected",
      reason_codes: ["readback_bytes_invalid"],
    });
  });

  test("preserves lossless primitive binding and CB/BV/BX/BZ interoperability", () => {
    const results = action666cdPrimitiveMatrix.map(({ value }) =>
      action666cdIssue(value),
    );
    expect(
      new Set(
        results.map(
          (result) =>
            result.runtime_evidence?.primitive_observation_digest,
        ),
      ).size,
    ).toBe(action666cdPrimitiveMatrix.length);
    expect(action666bvIssue(BigInt(1)).status).toBe("incomplete");
    expect(action666bxIssue(BigInt(1)).status).toBe("incomplete");
    expect(action666bzEvaluate(BigInt(1)).verification.status).toBe(
      "verified",
    );
    expect(
      observeCanonicalPrimitiveAtomically(BigInt(1)).status,
    ).toBe("verified");
  });

  test("default-off and kill switch perform literal zero work", () => {
    for (const options of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const observed = counters();
      let requestReads = 0;
      const result =
        runCanonicalIntegrityProvenanceSeparatedObservation({
          ...options,
          operation: "issue_runtime",
          read_request: () => {
            requestReads += 1;
            return BigInt(1);
          },
          counters: observed,
        });
      expect(result.enabled).toBe(false);
      expect(result.terminal_result).toBeNull();
      expect(requestReads).toBe(0);
      expect(observed).toEqual(counters());
    }
  });

  test("retry and input order remain deterministic", () => {
    for (const { value } of action666cdPrimitiveMatrix) {
      expect(action666cdIssue(value)).toEqual(action666cdIssue(value));
    }
    const canonical =
      action666cdIssue("order").canonical_integrity_envelope!;
    const reversed = JSON.stringify(
      Object.fromEntries(
        Object.entries(JSON.parse(canonical)).reverse(),
      ),
    );
    expect(action666cdReadback(reversed).status).toBe("non_canonical");
    expect(action666cdReadback(reversed)).toEqual(
      action666cdReadback(reversed),
    );
  });

  test("matches deterministic synthetic golden evidence", () => {
    const scenarios = action666cdGoldenScenarios();
    const generated = {
      report_version:
        "action_666cd_golden_integrity_provenance_separation_report_v1",
      separation_contract_version:
        CANONICAL_INTEGRITY_PROVENANCE_SEPARATION_VERSION,
      runtime_evidence_version:
        CANONICAL_RUNTIME_PROVENANCE_EVIDENCE_VERSION,
      integrity_envelope_version:
        CANONICAL_INTEGRITY_ONLY_ENVELOPE_VERSION,
      readback_version: CANONICAL_INTEGRITY_ONLY_READBACK_VERSION,
      scenario_count: scenarios.length,
      scenario_digest:
        canonicalLosslessInvalidScalarIssuanceDigest(scenarios),
      serialized_status_inventory: [
        ...new Set(scenarios.map(({ serialized_status }) =>
          serialized_status)),
      ].sort(),
      all_serialized_integrity_verified: scenarios.every(
        ({ serialized_integrity_verified }) =>
          serialized_integrity_verified,
      ),
      all_serialized_provenance_false: scenarios.every(
        ({ serialized_provenance_verified }) =>
          serialized_provenance_verified === false,
      ),
      all_serialized_untrusted: scenarios.every(
        ({ serialized_trusted, serialized_admitted }) =>
          serialized_trusted === false && serialized_admitted === false,
      ),
      safety: goldenReport.safety,
      performance_claims: [],
    };
    if (process.env.ACTION_666CD_PRINT_GOLDEN === "1") {
      console.log(`ACTION_666CD_GOLDEN=${JSON.stringify(generated)}`);
    }
    expect(generated).toEqual(goldenReport);
  });

  test("remains server-only and outside live/write/provider/DB surfaces", () => {
    const root = process.cwd();
    const moduleName =
      "canonical-integrity-provenance-separated-observation-authority";
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
