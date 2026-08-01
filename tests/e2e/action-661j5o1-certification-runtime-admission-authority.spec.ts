import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  N2A_CONSUMER_AUTHORITY_V1,
  RUNTIME_ADMISSION_POLICY_DIGEST_V1,
  RUNTIME_ADMISSION_POLICY_V1,
  requestCertificationBackedRuntimeAdmissionV1,
  verifyCertificationBackedRuntimeAdmissionV1,
} from "../../lib/action-661j5o1-certification-runtime-admission-authority.mjs";
import {
  ADMISSION_AUTHORITY_EXPECTATIONS_V1,
  CALLER_TRUST_ATTACKS_V1,
  CERTIFICATION_SCOPE_ATTACKS_V1,
  INVALID_ENABLED_ROOTS_V1,
} from "./action-661j5o1-certification-runtime-admission-fixtures.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const root = process.cwd();
const modulePath = "lib/action-661j5o1-certification-runtime-admission-authority.mjs";
const fixturePath = "tests/e2e/action-661j5o1-certification-runtime-admission-fixtures.mjs";

const predecessorHashes = new Map([
  ["lib/action-661j5n1-runtime-certification-consumer.mjs", "1c727c973d04f094bec3527e278eec00746be636f3c28f800725529bc0706a21"],
  ["docs/action-661j5n2-certification-consumer-freeze-manifest.json", "d2abfba1a118978187ff36b615dac04771343b209fd240947ee2ec5ddf2ba1d8"],
  ["lib/action-661j5n2a-runtime-certification-consumer-v2.mjs", "110a919401aee396508ba6d393132ed41e400343ea209559cdc1003eba4f69c5"],
  ["docs/action-661j5n2b-descriptor-consumer-refreeze-manifest.json", "dacef8f3a4d0b6e2e32c1d669de1284ed35b83ec3515230e79e3f28d68e1767c"],
]);

function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isDeepFrozen(value: unknown, seen = new Set<object>()): boolean {
  if (value === null || typeof value !== "object" || seen.has(value)) return true;
  seen.add(value);
  return Object.isFrozen(value) && Object.values(value).every((nested) => isDeepFrozen(nested, seen));
}

test("O1 freezes its policy and preserves N1, N2 and N2A authority bytes", () => {
  expect(sha256(canonicalJson(RUNTIME_ADMISSION_POLICY_V1 as JsonObject))).toBe(
    RUNTIME_ADMISSION_POLICY_DIGEST_V1,
  );
  expect(RUNTIME_ADMISSION_POLICY_DIGEST_V1).toBe(
    ADMISSION_AUTHORITY_EXPECTATIONS_V1.policy_digest,
  );
  expect(N2A_CONSUMER_AUTHORITY_V1.consumer_module_sha256).toBe(
    ADMISSION_AUTHORITY_EXPECTATIONS_V1.consumer_module_sha256,
  );
  for (const [path, expected] of predecessorHashes) {
    expect(sha256(readFileSync(join(root, path)))).toBe(expected);
  }
});

test("O1 default-off performs zero consumer, digest and admission work", () => {
  let hooks = 0;
  const hostileRoot = new Proxy({}, {
    get() { hooks += 1; throw new Error("must not execute"); },
    ownKeys() { hooks += 1; throw new Error("must not execute"); },
  });
  const result = requestCertificationBackedRuntimeAdmissionV1(false, hostileRoot);
  expect(result).toEqual({
    admission_identity_digest: null,
    admission_version: ADMISSION_AUTHORITY_EXPECTATIONS_V1.admission_version,
    binding: null,
    counts: {
      admission_digests_computed: 0,
      admission_issuances: 0,
      consumer_invocations: 0,
    },
    failure_identity_digest: null,
    reason: "runtime_admission_disabled",
    status: "not_admitted",
  });
  expect(requestCertificationBackedRuntimeAdmissionV1()).toBe(result);
  expect(hooks).toBe(0);
});

test("O1 internally verifies the exact 28-fixture chain and issues private provenance", () => {
  const admission = requestCertificationBackedRuntimeAdmissionV1(true, root);
  expect(admission.status).toBe("admitted");
  expect(admission.reason).toBe("runtime_certification_admitted");
  expect(admission.binding.inventory).toEqual({
    fixture_count: 28,
    scenario_count: 14,
    shard_count: 28,
  });
  expect(admission.binding.certification_manifest).toMatchObject({
    delivery_digest: ADMISSION_AUTHORITY_EXPECTATIONS_V1.delivery_digest,
    final_aggregate_digest: ADMISSION_AUTHORITY_EXPECTATIONS_V1.final_aggregate_digest,
  });
  expect(admission.binding.freeze_manifest).toEqual({
    file_digest: ADMISSION_AUTHORITY_EXPECTATIONS_V1.final_freeze_manifest_file_sha256,
    manifest_digest: ADMISSION_AUTHORITY_EXPECTATIONS_V1.final_freeze_manifest_digest,
    path: "docs/recovery/action-661j5r10/final-freeze-manifest.json",
  });
  expect(admission.binding.recovery_disclosure.file_digest).toBe(
    ADMISSION_AUTHORITY_EXPECTATIONS_V1.recovery_disclosure_file_sha256,
  );
  expect(admission.counts.consumer_invocations).toBe(1);
  expect(admission.counts.admission_issuances).toBe(1);
  expect(isDeepFrozen(admission)).toBe(true);

  const verification = verifyCertificationBackedRuntimeAdmissionV1(admission);
  expect(verification).toEqual({
    admission_identity_digest: admission.admission_identity_digest,
    admission_version: admission.admission_version,
    reason: "private_admission_provenance_verified",
    status: "admitted",
  });
  expect(isDeepFrozen(verification)).toBe(true);

  const duplicate = requestCertificationBackedRuntimeAdmissionV1(true, root);
  expect(duplicate).toBe(admission);
  expect(duplicate.admission_identity_digest).toBe(admission.admission_identity_digest);
});

test("O1 rejects caller minting, cloning, substitution and recomputed public digests", () => {
  const genuine = requestCertificationBackedRuntimeAdmissionV1(true, root);
  const clone = structuredClone(genuine);
  expect(verifyCertificationBackedRuntimeAdmissionV1(clone)).toMatchObject({
    reason: "private_admission_provenance_missing",
    status: "rejected",
  });

  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("must not execute"); },
    getPrototypeOf() { hooks += 1; throw new Error("must not execute"); },
  });
  expect(verifyCertificationBackedRuntimeAdmissionV1(hostile)).toMatchObject({
    reason: "private_admission_provenance_missing",
    status: "rejected",
  });
  expect(hooks).toBe(0);

  for (const attack of [...CALLER_TRUST_ATTACKS_V1, ...CERTIFICATION_SCOPE_ATTACKS_V1]) {
    const before = JSON.stringify(attack);
    const result = Reflect.apply(requestCertificationBackedRuntimeAdmissionV1, null, [
      true,
      root,
      attack,
    ]);
    expect(result.status).toBe("rejected");
    expect(result.reason).toBe("admission_request_shape_invalid");
    expect(JSON.stringify(attack)).toBe(before);
  }
});

test("O1 has closed sanitized and domain-separated request failures", () => {
  const identities = new Set<string>();
  for (const invalidRoot of INVALID_ENABLED_ROOTS_V1) {
    const result = requestCertificationBackedRuntimeAdmissionV1(true, invalidRoot);
    expect(result.status).toBe("rejected");
    expect(result.reason).toBe("admission_repository_root_invalid");
    expect(result.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
    identities.add(result.failure_identity_digest);
  }
  expect(identities.size).toBe(1);
  const missing = requestCertificationBackedRuntimeAdmissionV1(
    true,
    "/tmp/action-661j5o1-nonexistent-certification-root",
  );
  expect(missing.status).toBe("rejected");
  expect(missing.reason).toBe("descriptor_certification_consumer_rejected");
  expect(missing.failure_identity_digest).not.toBe([...identities][0]);
  expect(JSON.stringify(missing)).not.toContain("nonexistent-certification-root");
});

test("O1 import and capability boundaries exclude runtime and public mint surfaces", () => {
  const source = readFileSync(join(root, modulePath), "utf8");
  const fixtureSource = readFileSync(join(root, fixturePath), "utf8");
  expect(source.match(/^import .*from /gm) ?? []).toHaveLength(1);
  expect(source).toContain('from "node:crypto"');
  expect(source).toContain('from "./action-661j5n1-runtime-certification-consumer.mjs"');
  expect(source).toContain('from "./action-661j5n2a-runtime-certification-consumer-v2.mjs"');
  expect(source).not.toMatch(/node:fs|node:child_process|docker|postgres|netlify|fetch\s*\(|writeFile|createRuntimeCertificationConsumerV2/iu);
  expect(source.match(/^export function /gm) ?? []).toHaveLength(2);
  expect(source).not.toMatch(/export function .*?(mint|factory|capsule|receipt|authority)/iu);
  expect(source).toContain('"admission_identity_conflict"');
  expect(source).toContain("existing.canonical_identity !== canonicalIdentity");
  expect(fixtureSource).not.toMatch(/^\s*(?:import|export\s+.*\s+from\s+|.*require\s*\()/mu);
  expect(RUNTIME_ADMISSION_POLICY_V1.privileged_capabilities).toEqual([]);
});

test("O1 identity is stable across UTC A/B and two other timezones", () => {
  const script = `import {requestCertificationBackedRuntimeAdmissionV1 as request} from ${JSON.stringify(
    pathToFileURL(join(root, modulePath)).href,
  )};const result=request(true,${JSON.stringify(root)});process.stdout.write(JSON.stringify({binding:result.binding,identity:result.admission_identity_digest,status:result.status}));`;
  const outputs = ["UTC", "UTC", "Europe/Stockholm", "America/New_York"].map((timezone) => {
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
      encoding: "utf8",
      env: {
        HOME: "/tmp",
        LANG: "C",
        NODE_ENV: "test",
        PATH: process.env.PATH ?? "",
        TMPDIR: "/tmp",
        TZ: timezone,
      },
    });
    expect(child.status).toBe(0);
    expect(child.stderr).toBe("");
    return child.stdout;
  });
  expect(new Set(outputs).size).toBe(1);
  expect(JSON.parse(outputs[0])).toMatchObject({ status: "admitted" });
});
