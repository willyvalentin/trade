import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  RUNTIME_ADMISSION_POLICY_DIGEST_V1,
  requestCertificationBackedRuntimeAdmissionV1,
  verifyCertificationBackedRuntimeAdmissionV1,
} from "../../lib/action-661j5o1-certification-runtime-admission-authority.mjs";
import { consumeRuntimeCertificationV2 } from "../../lib/action-661j5n2a-runtime-certification-consumer-v2.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type FailureResult = {
  failure_identity_digest: string;
  reason: string;
  status: string;
};
type ConsumerFailure = {
  failure_provenance?: { failure_identity_digest?: string };
  reason: string;
  status: string;
};

const root = process.cwd();
const preservationCommit = "78f49b7e9e011ac43e23ce3e4731fe87d3686e96";
const expectedAdmissionIdentity = "b24080e9d746c3fdaf467a622f18db3b8b4b5d0881c3686cdd3df7d78aea1e15";
const expectedNormativeDigest = "9c0d03f2584ad4c6821da3bd0c2994a68003e3af48b162acf4e6fdcc4431dc16";
const admissionModulePath = "lib/action-661j5o1-certification-runtime-admission-authority.mjs";
const freezeManifestPath = "docs/action-661j5o2-certification-admission-freeze-manifest.json";
const independentReviewPath = "docs/action-661j5o2-certification-admission-independent-review.json";
const reviewSuitePath = "tests/e2e/action-661j5o2-certification-admission-independent-review.spec.ts";
const normativeArtifacts = [
  ["docs/action-661j5o1-certification-backed-runtime-admission-authority.md", "1d052cb7c538ec9efdf560d4402bbb9d0780ec7686b21b722e24c81aecf87eab"],
  ["docs/action-661j5o1-certification-runtime-admission-golden-report.json", "c43ce36da9f533f3ea77758a8c3879ccd685c3894a12f348336841cd661b8964"],
  [admissionModulePath, "2000e75bd80d3f1f7e58042e1b4f68ca1bac14a80c51aeba259fbd0fe245cfc3"],
  ["tests/e2e/action-661j5o1-certification-runtime-admission-authority.spec.ts", "443228bb0d6ee46624b65830bb1f809b7947c040a048db30d14082624d4b6615"],
  ["tests/e2e/action-661j5o1-certification-runtime-admission-fixtures.mjs", "ded6461cbb9cab6b8de138dfb9f0de003734a0ea408537173c2e928818879d8c"],
] as const;

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

function normativeProjection(): JsonObject {
  const artifacts = normativeArtifacts.map(([path]) => {
    const bytes = readFileSync(join(root, path));
    return { byte_length: bytes.length, path, sha256: sha256(bytes) };
  });
  return { artifact_count: artifacts.length, artifacts };
}

function withoutField(value: JsonObject, field: string): JsonObject {
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== field));
}

function rebuildAdmissionFailure(
  reason: string,
  stage: string,
  consumer: ConsumerFailure | null = null,
): string {
  const projection: JsonObject = {
    admission_version: "action_661j5o1_certification_backed_runtime_admission_v1",
    consumer_failure_identity_digest:
      consumer?.failure_provenance?.failure_identity_digest ?? null,
    consumer_reason: consumer?.reason ?? "consumer_result_unavailable",
    consumer_status: consumer?.status ?? "incomplete",
    policy_digest: RUNTIME_ADMISSION_POLICY_DIGEST_V1,
    reason,
    stage,
  };
  return sha256(canonicalJson(projection));
}

function assertRejected(result: FailureResult, reason: string): void {
  expect(result.status).toBe("rejected");
  expect(result.reason).toBe(reason);
  expect(result.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
}

test("O2 independently freezes all five O1 artifacts from preservation bytes", () => {
  expect(normativeArtifacts).toHaveLength(5);
  for (const [path, expected] of normativeArtifacts) {
    const bytes = readFileSync(join(root, path));
    expect(sha256(bytes)).toBe(expected);
    const preserved = spawnSync("git", ["show", `${preservationCommit}:${path}`], {
      cwd: root,
      encoding: "buffer",
      env: {
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
        HOME: "/tmp",
        NODE_ENV: "test",
        PATH: process.env.PATH ?? "",
        TMPDIR: "/tmp",
      },
    });
    expect(preserved.status).toBe(0);
    expect(preserved.stderr).toEqual(Buffer.alloc(0));
    expect(preserved.stdout).toEqual(bytes);
  }
  expect(sha256(canonicalJson(normativeProjection()))).toBe(expectedNormativeDigest);

  const freezeBytes = readFileSync(join(root, freezeManifestPath));
  const freeze = JSON.parse(freezeBytes.toString("utf8")) as JsonObject;
  expect(sha256(canonicalJson(withoutField(freeze, "freeze_manifest_digest")))).toBe(
    freeze.freeze_manifest_digest,
  );
  const suite = freeze.review_suite as JsonObject;
  expect(suite.sha256).toBe(sha256(readFileSync(join(root, reviewSuitePath))));

  const review = JSON.parse(readFileSync(join(root, independentReviewPath), "utf8")) as JsonObject;
  expect(sha256(canonicalJson(withoutField(review, "review_digest")))).toBe(review.review_digest);
  const reviewFreeze = review.freeze_manifest as JsonObject;
  expect(reviewFreeze.file_sha256).toBe(sha256(freezeBytes));
});

test("O2 verifies the single internal N2A snapshot and no post-verification path read", () => {
  const source = readFileSync(join(root, admissionModulePath), "utf8");
  expect(source.match(/\bconsumeRuntimeCertificationV2\s*\(/g) ?? []).toHaveLength(1);
  const invocation = source.indexOf("const consumerResult = consumeRuntimeCertificationV2(");
  const statusGate = source.indexOf('consumerResult.status !== "certified"', invocation);
  const bindingGate = source.indexOf("verifiedBinding(consumerResult, state)", statusGate);
  const privateIssue = source.indexOf("issueAdmission(deepFreeze(outcome.binding), state)", bindingGate);
  expect([invocation, statusGate, bindingGate, privateIssue]).not.toContain(-1);
  expect(invocation).toBeLessThan(statusGate);
  expect(statusGate).toBeLessThan(bindingGate);
  expect(bindingGate).toBeLessThan(privateIssue);
  expect(source).not.toMatch(/node:fs|readFile|createReadStream|openSync|node:path/iu);
  expect(source.match(/from\s+"([^"]+)"/g)).toEqual([
    'from "node:crypto"',
    'from "./action-661j5n1-runtime-certification-consumer.mjs"',
    'from "./action-661j5n2a-runtime-certification-consumer-v2.mjs"',
  ]);
});

test("O2 proves default-off is hook-free and performs zero admission work", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("getter-must-not-run"); },
    getPrototypeOf() { hooks += 1; throw new Error("prototype-must-not-run"); },
    ownKeys() { hooks += 1; throw new Error("keys-must-not-run"); },
  });
  const result = requestCertificationBackedRuntimeAdmissionV1(false, hostile);
  expect(result.status).toBe("not_admitted");
  expect(result.reason).toBe("runtime_admission_disabled");
  expect(result.counts).toEqual({
    admission_digests_computed: 0,
    admission_issuances: 0,
    consumer_invocations: 0,
  });
  expect(hooks).toBe(0);
});

test("O2 verifies exact certification, freeze, inventory and recovery bindings", () => {
  const admission = requestCertificationBackedRuntimeAdmissionV1(true, root);
  expect(admission.status).toBe("admitted");
  expect(admission.admission_identity_digest).toBe(expectedAdmissionIdentity);
  expect(admission.binding.inventory).toEqual({ fixture_count: 28, scenario_count: 14, shard_count: 28 });
  expect(admission.binding.certification_manifest).toEqual({
    delivery_digest: "80024a817857603d508d094e2e53616dfab48ba60ac661211ff3fa2672ad5d0e",
    final_aggregate_digest: "98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d",
    final_aggregate_file_sha256: "0a13a54dd85b60af61eeca991e0b4878323d8ea40fd2264acbd80b87dbeaea8f",
  });
  expect(admission.binding.freeze_manifest).toEqual({
    file_digest: "2fde89c7906057516d820707c726b7f93005e491c56d80799a2568805d1ce5ce",
    manifest_digest: "9e6f8237a5f760c0ef34b2783eca69d7d1496a935d984bc8f07a92493982a4a6",
    path: "docs/recovery/action-661j5r10/final-freeze-manifest.json",
  });
  expect(admission.binding.recovery_disclosure).toEqual({
    file_digest: "06efa3ca53af693e8478a068f4e2202c942300346d208511d921b0eec2993aeb",
    partial_recovery_promoted: false,
    path: "docs/recovery/action-661j5r1/loss-reconstruction-manifest.json",
  });
});

test("O2 rejects caller mint, clone, serialization and cross-instance provenance", () => {
  const genuine = requestCertificationBackedRuntimeAdmissionV1(true, root);
  const forgeries = [
    { ...genuine },
    structuredClone(genuine),
    JSON.parse(JSON.stringify(genuine)),
    Object.freeze({
      admission_identity_digest: genuine.admission_identity_digest,
      binding: genuine.binding,
      certified: true,
      status: "admitted",
      verified: true,
    }),
  ];
  for (const forgery of forgeries) {
    expect(verifyCertificationBackedRuntimeAdmissionV1(forgery)).toMatchObject({
      reason: "private_admission_provenance_missing",
      status: "rejected",
    });
  }

  const moduleUrl = pathToFileURL(join(root, admissionModulePath)).href;
  const script = `const a=await import(${JSON.stringify(`${moduleUrl}?instance=a`)});const b=await import(${JSON.stringify(`${moduleUrl}?instance=b`)});const aa=a.requestCertificationBackedRuntimeAdmissionV1(true,${JSON.stringify(root)});const ba=b.requestCertificationBackedRuntimeAdmissionV1(true,${JSON.stringify(root)});process.stdout.write(JSON.stringify({aIdentity:aa.admission_identity_digest,bIdentity:ba.admission_identity_digest,aVerifiesB:a.verifyCertificationBackedRuntimeAdmissionV1(ba),bVerifiesA:b.verifyCertificationBackedRuntimeAdmissionV1(aa)}));`;
  const child = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf8",
    env: {
      HOME: "/tmp",
      LANG: "C",
      NODE_ENV: "test",
      PATH: process.env.PATH ?? "",
      TMPDIR: "/tmp",
      TZ: "UTC",
    },
  });
  expect(child.status).toBe(0);
  expect(child.stderr).toBe("");
  const isolated = JSON.parse(child.stdout);
  expect(isolated.aIdentity).toBe(expectedAdmissionIdentity);
  expect(isolated.bIdentity).toBe(expectedAdmissionIdentity);
  expect(isolated.aVerifiesB).toMatchObject({ reason: "private_admission_provenance_missing", status: "rejected" });
  expect(isolated.bVerifiesA).toMatchObject({ reason: "private_admission_provenance_missing", status: "rejected" });
});

test("O2 rejects caller path, manifest, role and authority substitutions before hooks", () => {
  const attacks = [
    { missing_paths: true },
    { extra_path: "unexpected.json" },
    { duplicate_path: true },
    { reordered_paths: true },
    { renamed_path: true },
    { role_swap: "freeze_as_recovery" },
    { freeze_digest: "a".repeat(64) },
    { inventory: { fixtures: 28, shards: 28 } },
    { recovery_digest: "b".repeat(64) },
    { authority: { certified: true } },
  ];
  for (const attack of attacks) {
    const result = Reflect.apply(requestCertificationBackedRuntimeAdmissionV1, null, [true, root, attack]);
    assertRejected(result, "admission_request_shape_invalid");
  }

  let hooks = 0;
  const hostileClaim = new Proxy({}, {
    get() { hooks += 1; throw new Error("claim-getter-must-not-run"); },
    ownKeys() { hooks += 1; throw new Error("claim-keys-must-not-run"); },
  });
  const result = Reflect.apply(requestCertificationBackedRuntimeAdmissionV1, null, [true, root, hostileClaim]);
  assertRejected(result, "admission_request_shape_invalid");
  expect(hooks).toBe(0);

  let callbacks = 0;
  const callback = () => { callbacks += 1; };
  assertRejected(requestCertificationBackedRuntimeAdmissionV1(true, callback), "admission_repository_root_invalid");
  expect(callbacks).toBe(0);
});

test("O2 independently rebuilds sanitized and domain-separated failure identities", () => {
  const requestShape = Reflect.apply(requestCertificationBackedRuntimeAdmissionV1, null, [true, root, {}]);
  expect(requestShape.failure_identity_digest).toBe(
    rebuildAdmissionFailure("admission_request_shape_invalid", "request_validation"),
  );
  const invalidRoot = requestCertificationBackedRuntimeAdmissionV1(true, null);
  expect(invalidRoot.failure_identity_digest).toBe(
    rebuildAdmissionFailure("admission_repository_root_invalid", "request_validation"),
  );
  expect(requestShape.failure_identity_digest).not.toBe(invalidRoot.failure_identity_digest);

  const roots = [
    "/tmp/action-661j5o2-missing-root",
    join(root, "package.json"),
  ];
  const identities = roots.map((repositoryRoot) => {
    const consumer = consumeRuntimeCertificationV2({ enabled: true, repository_root: repositoryRoot }) as ConsumerFailure;
    const admission = requestCertificationBackedRuntimeAdmissionV1(true, repositoryRoot);
    assertRejected(admission, "descriptor_certification_consumer_rejected");
    expect(admission.failure_identity_digest).toBe(
      rebuildAdmissionFailure(
        "descriptor_certification_consumer_rejected",
        "consumer_verification",
        consumer,
      ),
    );
    expect(JSON.stringify(admission)).not.toContain(repositoryRoot);
    return admission.failure_identity_digest;
  });
  expect(new Set(identities).size).toBe(2);
});

test("O2 verifies private provenance precedes access and collision handling precedes reuse", () => {
  const source = readFileSync(join(root, admissionModulePath), "utf8");
  const verifier = source.indexOf("export function verifyCertificationBackedRuntimeAdmissionV1");
  const lookup = source.indexOf("trustedAdmissions.get(candidate)", verifier);
  const firstCandidateProperty = source.indexOf("candidate.", verifier);
  expect(lookup).toBeGreaterThan(verifier);
  expect(firstCandidateProperty).toBe(-1);

  const identityLookup = source.indexOf("admissionsByIdentity.get(admissionIdentityDigest)");
  const collision = source.indexOf("existing.canonical_identity !== canonicalIdentity", identityLookup);
  const duplicateReturn = source.indexOf("return existing.admission", collision);
  expect(identityLookup).toBeLessThan(collision);
  expect(collision).toBeLessThan(duplicateReturn);

  const first = requestCertificationBackedRuntimeAdmissionV1(true, root);
  const duplicate = requestCertificationBackedRuntimeAdmissionV1(true, root);
  expect(duplicate).toBe(first);
  expect(duplicate.admission_identity_digest).toBe(expectedAdmissionIdentity);
});

test("O2 excludes public trust upgrades and all runtime-capable dependencies", () => {
  const source = readFileSync(join(root, admissionModulePath), "utf8");
  expect(source.match(/^export function\s+([A-Za-z0-9_]+)/gm)).toEqual([
    "export function requestCertificationBackedRuntimeAdmissionV1",
    "export function verifyCertificationBackedRuntimeAdmissionV1",
  ]);
  expect(source).not.toMatch(/export\s+(?:const|function|class)\s+.*(?:mint|factory|register|upgrade|capsule|receipt)/iu);
  expect(source).not.toMatch(/node:(?:child_process|fs|http|https|net|tls|worker_threads)|process\.env|fetch\s*\(|docker|postgres|netlify|writeFile|appendFile/iu);
  expect(source).toContain("privileged_capabilities: []");
});

test("O2 admission identity is stable in UTC A/B, Stockholm and New York", () => {
  const moduleUrl = pathToFileURL(join(root, admissionModulePath)).href;
  const script = `import{requestCertificationBackedRuntimeAdmissionV1 as request}from${JSON.stringify(moduleUrl)};const r=request(true,${JSON.stringify(root)});process.stdout.write(JSON.stringify({binding:r.binding,identity:r.admission_identity_digest,status:r.status}));`;
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
  expect(JSON.parse(outputs[0])).toMatchObject({ identity: expectedAdmissionIdentity, status: "admitted" });
});
