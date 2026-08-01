import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  CERTIFIED_RUNTIME_PROFILE_DIGEST_V1,
  CERTIFIED_RUNTIME_PROFILE_V1,
  RUNTIME_SELECTION_POLICY_DIGEST_V1,
  RUNTIME_SELECTION_POLICY_V1,
  requestCertificationGatedRuntimeSelectionV1,
  verifyCertificationGatedRuntimeSelectionV1,
} from "../../lib/action-661j5p1-certification-gated-runtime-selection.mjs";
import {
  CALLER_SELECTION_TRUST_ATTACKS_V1,
  INVALID_SELECTION_ROOTS_V1,
  RUNTIME_PROFILE_SUBSTITUTIONS_V1,
  RUNTIME_SELECTION_EXPECTATIONS_V1,
} from "./action-661j5p1-certification-gated-runtime-selection-fixtures.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const root = process.cwd();
const modulePath = "lib/action-661j5p1-certification-gated-runtime-selection.mjs";
const fixturePath = "tests/e2e/action-661j5p1-certification-gated-runtime-selection-fixtures.mjs";
const expectedSelectionIdentity =
  "754a7e781f14ae5731ddbac2444b8c7c3182e95c10913ea640e49855610c54ea";

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

test("P1 freezes the only selectable certified runtime family", () => {
  expect(sha256(canonicalJson(CERTIFIED_RUNTIME_PROFILE_V1 as JsonObject))).toBe(
    CERTIFIED_RUNTIME_PROFILE_DIGEST_V1,
  );
  expect(sha256(canonicalJson(RUNTIME_SELECTION_POLICY_V1 as JsonObject))).toBe(
    RUNTIME_SELECTION_POLICY_DIGEST_V1,
  );
  expect(CERTIFIED_RUNTIME_PROFILE_DIGEST_V1).toBe(
    RUNTIME_SELECTION_EXPECTATIONS_V1.profile_digest,
  );
  expect(RUNTIME_SELECTION_POLICY_DIGEST_V1).toBe(
    RUNTIME_SELECTION_EXPECTATIONS_V1.policy_digest,
  );
  expect(CERTIFIED_RUNTIME_PROFILE_V1).toMatchObject({
    family_version: RUNTIME_SELECTION_EXPECTATIONS_V1.family_version,
    policy_version: RUNTIME_SELECTION_EXPECTATIONS_V1.policy_version,
    protocol_version: RUNTIME_SELECTION_EXPECTATIONS_V1.protocol_version,
    runner_identity_digest: RUNTIME_SELECTION_EXPECTATIONS_V1.runner_identity_digest,
    runner_version: RUNTIME_SELECTION_EXPECTATIONS_V1.runner_version,
    runtime_execution_allowed: false,
    selection_capabilities: [],
  });
  expect(isDeepFrozen(CERTIFIED_RUNTIME_PROFILE_V1)).toBe(true);
  expect(isDeepFrozen(RUNTIME_SELECTION_POLICY_V1)).toBe(true);
});

test("P1 default-off performs zero admission, digest and selection work", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("getter_executed"); },
    getPrototypeOf() { hooks += 1; throw new Error("prototype_executed"); },
    ownKeys() { hooks += 1; throw new Error("own_keys_executed"); },
  });
  const result = requestCertificationGatedRuntimeSelectionV1(false, hostile);
  expect(result).toEqual({
    counts: {
      admission_requests: 0,
      admission_verifications: 0,
      selection_digests_computed: 0,
      selection_issuances: 0,
    },
    failure_identity_digest: null,
    reason: "runtime_selection_disabled",
    receipt: null,
    selection_identity_digest: null,
    selection_version: RUNTIME_SELECTION_EXPECTATIONS_V1.selection_version,
    status: "not_selected",
  });
  expect(hooks).toBe(0);
});

test("P1 internally admits certification and issues a private decision receipt", () => {
  const result = requestCertificationGatedRuntimeSelectionV1(true, root);
  expect(result.status).toBe("selected");
  expect(result.reason).toBe("certified_runtime_profile_selected");
  expect(result.selection_identity_digest).toBe(expectedSelectionIdentity);
  expect(result.receipt).not.toBeNull();
  expect(result.receipt?.runtime_authority).toBe(false);
  expect(result.receipt?.runtime_execution_allowed).toBe(false);
  expect(result.receipt?.binding.admission.admission_identity_digest).toBe(
    RUNTIME_SELECTION_EXPECTATIONS_V1.admission_identity_digest,
  );
  expect(result.receipt?.binding.inventory).toEqual({
    fixture_count: 28,
    scenario_count: 14,
    shard_count: 28,
  });
  expect(result.receipt?.binding.runtime_profile).toEqual(CERTIFIED_RUNTIME_PROFILE_V1);
  expect(isDeepFrozen(result)).toBe(true);
  expect(verifyCertificationGatedRuntimeSelectionV1(result.receipt)).toEqual({
    reason: "private_selection_provenance_verified",
    selection_identity_digest: expectedSelectionIdentity,
    selection_version: RUNTIME_SELECTION_EXPECTATIONS_V1.selection_version,
    status: "selected",
  });
});

test("P1 exact duplicates are idempotent and identity reuse cannot upgrade trust", () => {
  const first = requestCertificationGatedRuntimeSelectionV1(true, root);
  const second = requestCertificationGatedRuntimeSelectionV1(true, root);
  expect(second).toBe(first);
  expect(first.receipt).not.toBeNull();
  const clone = structuredClone(first.receipt);
  expect(verifyCertificationGatedRuntimeSelectionV1(clone)).toMatchObject({
    reason: "private_selection_provenance_missing",
    status: "rejected",
  });
  const changed = structuredClone(first.receipt) as JsonObject;
  const binding = changed.binding as JsonObject;
  const profile = binding.runtime_profile as JsonObject;
  profile.runner_identity_digest =
    "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
  changed.selection_identity_digest = first.selection_identity_digest;
  expect(verifyCertificationGatedRuntimeSelectionV1(changed)).toMatchObject({
    reason: "private_selection_provenance_missing",
    status: "rejected",
  });
});

test("P1 rejects caller-minted trust and runtime profile substitutions", () => {
  for (const attack of CALLER_SELECTION_TRUST_ATTACKS_V1) {
    const result = requestCertificationGatedRuntimeSelectionV1(true, root, attack.claim);
    expect(result).toMatchObject({
      reason: "selection_request_shape_invalid",
      status: "rejected",
    });
    expect(verifyCertificationGatedRuntimeSelectionV1(attack.claim)).toMatchObject({
      reason: "private_selection_provenance_missing",
      status: "rejected",
    });
  }
  const selected = requestCertificationGatedRuntimeSelectionV1(true, root);
  for (const attack of RUNTIME_PROFILE_SUBSTITUTIONS_V1) {
    const clone = structuredClone(selected.receipt) as JsonObject;
    const binding = clone.binding as JsonObject;
    const profile = binding.runtime_profile as JsonObject;
    profile[attack.field] = attack.value;
    expect(verifyCertificationGatedRuntimeSelectionV1(clone)).toMatchObject({
      reason: "private_selection_provenance_missing",
      status: "rejected",
    });
  }
});

test("P1 rejects invalid and incomplete certification roots with distinct identities", () => {
  const identities = new Set<string>();
  for (const invalid of INVALID_SELECTION_ROOTS_V1) {
    const result = requestCertificationGatedRuntimeSelectionV1(true, invalid);
    expect(result).toMatchObject({
      reason: "selection_repository_root_invalid",
      status: "rejected",
    });
    expect(result.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
    identities.add(result.failure_identity_digest as string);
  }
  expect(identities.size).toBe(1);

  const missingA = requestCertificationGatedRuntimeSelectionV1(true, join(root, "missing-certification-root-a"));
  const missingB = requestCertificationGatedRuntimeSelectionV1(true, join(root, "missing-certification-root-b"));
  expect(missingA).toMatchObject({
    reason: "certification_admission_rejected",
    status: "rejected",
  });
  expect(missingB).toMatchObject({
    reason: "certification_admission_rejected",
    status: "rejected",
  });
  expect(missingA.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
  expect(missingB.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
  expect(missingA.failure_identity_digest).not.toBe([...identities][0]);
  expect(missingB.failure_identity_digest).not.toBe(missingA.failure_identity_digest);
});

test("P1 public surface contains no trust mint, registration or runtime capability", () => {
  const source = readFileSync(join(root, modulePath), "utf8");
  const exports = [...source.matchAll(/export (?:const|function) ([A-Za-z0-9_]+)/g)]
    .map((match) => match[1])
    .sort();
  expect(exports).toEqual([
    "CERTIFIED_RUNTIME_PROFILE_DIGEST_V1",
    "CERTIFIED_RUNTIME_PROFILE_V1",
    "RUNTIME_SELECTION_POLICY_DIGEST_V1",
    "RUNTIME_SELECTION_POLICY_V1",
    "RUNTIME_SELECTION_VERSION_V1",
    "requestCertificationGatedRuntimeSelectionV1",
    "verifyCertificationGatedRuntimeSelectionV1",
  ]);
  expect(source.match(/requestCertificationBackedRuntimeAdmissionV1\(/g)).toHaveLength(1);
  expect(source).not.toMatch(/export .*?(mint|factory|register|upgrade)/i);
  expect(source).not.toMatch(/docker|postgres|migration|child_process|writeFile|fetch\(/i);
  expect(source).not.toMatch(/callback|\.then\(|\.call\(|\.apply\(/i);
});

test("P1 fixture is zero-import and predecessor authority bytes remain unchanged", () => {
  const fixtureSource = readFileSync(join(root, fixturePath), "utf8");
  expect(fixtureSource).not.toMatch(/\b(?:import|require)\b/);
  const expectedHashes = new Map([
    ["lib/action-661j5n2a-runtime-certification-consumer-v2.mjs", "110a919401aee396508ba6d393132ed41e400343ea209559cdc1003eba4f69c5"],
    ["lib/action-661j5o1-certification-runtime-admission-authority.mjs", "2000e75bd80d3f1f7e58042e1b4f68ca1bac14a80c51aeba259fbd0fe245cfc3"],
    ["docs/recovery/action-661j5r2/rebuild-manifest.json", "3ba48a968ab56d71b5d5bfb2fc0938bc9031897d79eabfccc3432cd72b1ab9bd"],
    ["docs/recovery/action-661j5r10/final-freeze-manifest.json", "2fde89c7906057516d820707c726b7f93005e491c56d80799a2568805d1ce5ce"],
  ]);
  for (const [path, expected] of expectedHashes) {
    expect(sha256(readFileSync(join(root, path)))).toBe(expected);
  }
});

test("P1 is deterministic across processes and time zones", () => {
  const script = [
    `import {requestCertificationGatedRuntimeSelectionV1 as select} from ${JSON.stringify(pathToFileURL(join(root, modulePath)).href)};`,
    `const result=select(true,${JSON.stringify(root)});`,
    "process.stdout.write(JSON.stringify({identity:result.selection_identity_digest,status:result.status}));",
  ].join("");
  const outputs = ["UTC", "UTC", "Europe/Stockholm", "America/New_York"].map((timezone) => {
    const child = spawnSync(process.execPath, ["--input-type=module", "--eval", script], {
      encoding: "utf8",
      env: { NODE_ENV: "test", PATH: process.env.PATH, TZ: timezone },
    });
    expect(child.status).toBe(0);
    expect(child.stderr).toBe("");
    return child.stdout;
  });
  expect(new Set(outputs).size).toBe(1);
  expect(JSON.parse(outputs[0])).toEqual({ identity: expectedSelectionIdentity, status: "selected" });
});
