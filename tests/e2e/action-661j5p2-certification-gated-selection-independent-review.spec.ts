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
import {
  CERTIFIED_RUNTIME_PROFILE_DIGEST_V1,
  CERTIFIED_RUNTIME_PROFILE_V1,
  RUNTIME_SELECTION_POLICY_DIGEST_V1,
  RUNTIME_SELECTION_POLICY_V1,
  requestCertificationGatedRuntimeSelectionV1,
  verifyCertificationGatedRuntimeSelectionV1,
} from "../../lib/action-661j5p1-certification-gated-runtime-selection.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type FailureResult = {
  failure_identity_digest: string;
  reason: string;
  status: string;
};
type AdmissionFailure = {
  failure_identity_digest: string | null;
  reason: string;
  status: string;
};

const root = process.cwd();
const preservationCommit = "992e61e37c2f6e0095c1993c5a01916c01b0b8ea";
const preservationRef =
  "refs/preservation/action-661j5p1-certification-gated-runtime-selection-authority";
const expectedNormativeDigest =
  "76a330b87160d536bc9dabb390e9ba7c66ed637bd43ead9716be4032acd4602e";
const expectedSelectionIdentity =
  "754a7e781f14ae5731ddbac2444b8c7c3182e95c10913ea640e49855610c54ea";
const selectionModulePath =
  "lib/action-661j5p1-certification-gated-runtime-selection.mjs";
const admissionModulePath =
  "lib/action-661j5o1-certification-runtime-admission-authority.mjs";
const freezeManifestPath =
  "docs/action-661j5p2-certification-gated-selection-freeze-manifest.json";
const independentReviewPath =
  "docs/action-661j5p2-certification-gated-selection-independent-review.json";
const reviewSuitePath =
  "tests/e2e/action-661j5p2-certification-gated-selection-independent-review.spec.ts";

const normativeArtifacts = [
  [
    "docs/action-661j5p1-certification-gated-runtime-selection-golden-report.json",
    2174,
    "5cfd96516bc34ada6f9fd551829cef3742db7b22c47073cb7797efb2f442e5ea",
  ],
  [
    "docs/action-661j5p1-certification-gated-runtime-selection.md",
    2602,
    "9678d2a7830147e5fe2fcbaa7c243110a06fee3540772617c7ae35bc07479d19",
  ],
  [
    selectionModulePath,
    11665,
    "fba8d2f3b6178bef3e270453e4a111704c9bc7dc2a76af749b04632c5d0b1f9e",
  ],
  [
    "tests/e2e/action-661j5p1-certification-gated-runtime-selection-fixtures.mjs",
    2786,
    "654db0b9694e59ae0c1953f88ebfea2ff48eab517442a95abc95ad86fd7579fd",
  ],
  [
    "tests/e2e/action-661j5p1-certification-gated-runtime-selection.spec.ts",
    11521,
    "010cb2de8473758a84ebbe3b874a45ec0f78411d60ee73ef324b5719c689e0c6",
  ],
] as const;

const exactBinding: JsonObject = {
  admission: {
    admission_identity_digest:
      "b24080e9d746c3fdaf467a622f18db3b8b4b5d0881c3686cdd3df7d78aea1e15",
    admission_policy_digest:
      "5adbd3b5e223ceec6acd83831650f9cd93ca64fd878375901e0c29ac70881b21",
    admission_policy_version: "action_661j5o1_runtime_admission_policy_v1",
    admission_version: "action_661j5o1_certification_backed_runtime_admission_v1",
  },
  certification: {
    aggregate_digest:
      "98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d",
    delivery_digest:
      "80024a817857603d508d094e2e53616dfab48ba60ac661211ff3fa2672ad5d0e",
    freeze_file_digest:
      "2fde89c7906057516d820707c726b7f93005e491c56d80799a2568805d1ce5ce",
    freeze_manifest_digest:
      "9e6f8237a5f760c0ef34b2783eca69d7d1496a935d984bc8f07a92493982a4a6",
    full_chain_result_digest:
      "8daf1232f78e520b390823d00ad7ac11b7f44e91bff59ec3adbaaa074d14decf",
    recovery_disclosure_file_digest:
      "06efa3ca53af693e8478a068f4e2202c942300346d208511d921b0eec2993aeb",
  },
  inventory: { fixture_count: 28, scenario_count: 14, shard_count: 28 },
  runtime_profile: {
    aggregate_digest:
      "98064a290926d7b2ade45965eec3a21b41819763cb667a3a0c54f618600fe99d",
    family_version: "action_661j5r2_runtime_certification_rebuild_v1",
    policy_version: "action_661j5r2_atomic_policy_registry_rebuild_v1",
    profile_id: "action_661j5p1_certified_rebuild_v1_runtime_profile",
    protocol_version: "action_661j5r2_runtime_result_protocol_rebuild_v1",
    runner_identity_digest:
      "76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7",
    runner_version: "action_661j5r2_runtime_runner_rebuild_v1",
    runtime_execution_allowed: false,
    selection_capabilities: [],
    snapshot_contract: "action_661j5r2_metadata_first_snapshot_rebuild_v1",
  },
  selection_policy: {
    policy_digest:
      "8ad66894e28abe42b4001f2d04f347b0bfdbff316e7be25071092da7bbab8212",
    policy_version: "action_661j5p1_runtime_selection_policy_v1",
  },
};

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
  return {
    artifact_count: normativeArtifacts.length,
    artifacts: normativeArtifacts.map(([path]) => {
      const bytes = readFileSync(join(root, path));
      return { byte_length: bytes.length, path, sha256: sha256(bytes) };
    }),
  };
}

function withoutField(value: JsonObject, field: string): JsonObject {
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== field));
}

function sanitizedAdmissionFailure(admission: AdmissionFailure | null): JsonObject {
  if (!admission) {
    return {
      failure_identity_digest: null,
      reason: "admission_result_unavailable",
      status: "rejected",
    };
  }
  return {
    failure_identity_digest: /^[0-9a-f]{64}$/.test(admission.failure_identity_digest ?? "")
      ? admission.failure_identity_digest
      : null,
    reason: /^[a-z0-9_]{1,96}$/.test(admission.reason)
      ? admission.reason
      : "admission_reason_unavailable",
    status: /^(?:not_admitted|rejected)$/.test(admission.status)
      ? admission.status
      : "rejected",
  };
}

function rebuildSelectionFailure(
  reason: string,
  stage: string,
  admissionVerificationReason: string | null = null,
  admission: AdmissionFailure | null = null,
  repositoryRootDigest: string | null = null,
): string {
  return sha256(canonicalJson({
    admission_failure: sanitizedAdmissionFailure(admission),
    admission_verification_reason: admissionVerificationReason,
    policy_digest: RUNTIME_SELECTION_POLICY_DIGEST_V1,
    reason,
    repository_root_digest: repositoryRootDigest,
    runtime_profile_digest: CERTIFIED_RUNTIME_PROFILE_DIGEST_V1,
    selection_version: "action_661j5p1_certification_gated_runtime_selection_v1",
    stage,
  }));
}

function assertRejected(result: FailureResult, reason: string): void {
  expect(result).toMatchObject({ reason, status: "rejected" });
  expect(result.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
}

test("P2 freezes exactly one five-artifact P1 preservation authority", () => {
  const refs = spawnSync("git", [
    "for-each-ref",
    "--format=%(refname) %(objectname)",
    "refs/preservation",
  ], { cwd: root, encoding: "utf8" });
  expect(refs.status).toBe(0);
  expect(refs.stderr).toBe("");
  const matching = refs.stdout.trim().split("\n").filter((line) => line.endsWith(` ${preservationCommit}`));
  expect(matching).toEqual([`${preservationRef} ${preservationCommit}`]);
  expect(normativeArtifacts).toHaveLength(5);
  for (const [path, expectedLength, expectedSha] of normativeArtifacts) {
    const bytes = readFileSync(join(root, path));
    expect(bytes).toHaveLength(expectedLength);
    expect(sha256(bytes)).toBe(expectedSha);
    const preserved = spawnSync("git", ["show", `${preservationCommit}:${path}`], {
      cwd: root,
      encoding: "buffer",
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
  expect(sha256(canonicalJson(withoutField(review, "review_digest")))).toBe(
    review.review_digest,
  );
  const reviewFreeze = review.freeze_manifest as JsonObject;
  expect(reviewFreeze.file_sha256).toBe(sha256(freezeBytes));
});

test("P2 verifies O1 internal admission and private provenance before selection", () => {
  const source = readFileSync(join(root, selectionModulePath), "utf8");
  expect(source.match(/requestCertificationBackedRuntimeAdmissionV1\s*\(/g)).toHaveLength(1);
  expect(source.match(/verifyCertificationBackedRuntimeAdmissionV1\s*\(/g)).toHaveLength(1);
  const request = source.indexOf("const admission = requestCertificationBackedRuntimeAdmissionV1(");
  const verify = source.indexOf("verifyCertificationBackedRuntimeAdmissionV1(admission)", request);
  const gate = source.indexOf('admissionVerification.status !== "admitted"', verify);
  const binding = source.indexOf("bindVerifiedAdmission(admission)", gate);
  const issuance = source.indexOf("issueSelection(deepFreeze(outcome.binding), state)", binding);
  expect([request, verify, gate, binding, issuance]).not.toContain(-1);
  expect(request).toBeLessThan(verify);
  expect(verify).toBeLessThan(gate);
  expect(gate).toBeLessThan(binding);
  expect(binding).toBeLessThan(issuance);

  const admissionSource = readFileSync(join(root, admissionModulePath), "utf8");
  expect(admissionSource.match(/consumeRuntimeCertificationV2\s*\(/g)).toHaveLength(1);
  expect(source).not.toMatch(/node:fs|readFile|openSync|createReadStream/iu);
});

test("P2 independently binds the only certified runtime profile and selection identity", () => {
  expect(sha256(canonicalJson(CERTIFIED_RUNTIME_PROFILE_V1 as JsonObject))).toBe(
    CERTIFIED_RUNTIME_PROFILE_DIGEST_V1,
  );
  expect(sha256(canonicalJson(RUNTIME_SELECTION_POLICY_V1 as JsonObject))).toBe(
    RUNTIME_SELECTION_POLICY_DIGEST_V1,
  );
  const selected = requestCertificationGatedRuntimeSelectionV1(true, root);
  expect(selected.receipt?.binding).toEqual(exactBinding);
  const identityProjection: JsonObject = {
    binding: exactBinding,
    receipt_kind: "runtime_profile_selection_decision",
    selection_version: "action_661j5p1_certification_gated_runtime_selection_v1",
    status: "selected",
  };
  expect(sha256(canonicalJson(identityProjection))).toBe(expectedSelectionIdentity);
  expect(selected.selection_identity_digest).toBe(expectedSelectionIdentity);
  expect(selected.receipt).toMatchObject({
    runtime_authority: false,
    runtime_execution_allowed: false,
  });
});

test("P2 rejects caller minting, clones and runtime or policy substitution", () => {
  const selected = requestCertificationGatedRuntimeSelectionV1(true, root);
  const callerClaims = [
    { admission: { status: "admitted" } },
    { authority: { status: "trusted" } },
    { capsule: { status: "selected" } },
    { certificate: { status: "certified" } },
    { verified: true },
  ];
  for (const claim of callerClaims) {
    assertRejected(
      Reflect.apply(requestCertificationGatedRuntimeSelectionV1, null, [true, root, claim]),
      "selection_request_shape_invalid",
    );
    expect(verifyCertificationGatedRuntimeSelectionV1(claim)).toMatchObject({
      reason: "private_selection_provenance_missing",
      status: "rejected",
    });
  }

  const substitutions: Array<[string, JsonValue]> = [
    ["family_version", "action_661j5r2_runtime_certification_rebuild_v2"],
    ["protocol_version", "action_661j5r2_runtime_result_protocol_rebuild_v2"],
    ["runner_identity_digest", "a".repeat(64)],
    ["runner_version", "action_661j5r2_runtime_runner_rebuild_v2"],
    ["policy_version", "action_661j5r2_atomic_policy_registry_rebuild_v2"],
  ];
  for (const [field, value] of substitutions) {
    const clone = structuredClone(selected.receipt) as JsonObject;
    const binding = clone.binding as JsonObject;
    const profile = binding.runtime_profile as JsonObject;
    profile[field] = value;
    clone.selection_identity_digest = expectedSelectionIdentity;
    expect(verifyCertificationGatedRuntimeSelectionV1(clone)).toMatchObject({
      reason: "private_selection_provenance_missing",
      status: "rejected",
    });
  }
  expect(verifyCertificationGatedRuntimeSelectionV1(structuredClone(selected.receipt))).toMatchObject({
    reason: "private_selection_provenance_missing",
    status: "rejected",
  });
});

test("P2 proves default-off and public verification are hook-free", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("private-message-must-not-escape"); },
    getPrototypeOf() { hooks += 1; throw new Error("prototype-must-not-run"); },
    ownKeys() { hooks += 1; throw new Error("keys-must-not-run"); },
  });
  const off = requestCertificationGatedRuntimeSelectionV1(false, hostile);
  expect(off.counts).toEqual({
    admission_requests: 0,
    admission_verifications: 0,
    selection_digests_computed: 0,
    selection_issuances: 0,
  });
  expect(verifyCertificationGatedRuntimeSelectionV1(hostile)).toMatchObject({
    reason: "private_selection_provenance_missing",
    status: "rejected",
  });
  assertRejected(
    Reflect.apply(requestCertificationGatedRuntimeSelectionV1, null, [true, root, hostile]),
    "selection_request_shape_invalid",
  );
  let callbacks = 0;
  const callback = () => { callbacks += 1; };
  assertRejected(
    requestCertificationGatedRuntimeSelectionV1(true, callback),
    "selection_repository_root_invalid",
  );
  expect(hooks).toBe(0);
  expect(callbacks).toBe(0);
});

test("P2 independently rebuilds distinct sanitized selection failures", () => {
  const requestShape = Reflect.apply(requestCertificationGatedRuntimeSelectionV1, null, [true, root, {}]);
  expect(requestShape.failure_identity_digest).toBe(
    rebuildSelectionFailure("selection_request_shape_invalid", "request_validation"),
  );
  const invalidRoot = requestCertificationGatedRuntimeSelectionV1(true, null);
  expect(invalidRoot.failure_identity_digest).toBe(
    rebuildSelectionFailure("selection_repository_root_invalid", "request_validation"),
  );
  expect(requestShape.failure_identity_digest).not.toBe(invalidRoot.failure_identity_digest);

  const identities = ["missing-p2-a", "missing-p2-b"].map((suffix) => {
    const repositoryRoot = join(root, suffix);
    const admission = requestCertificationBackedRuntimeAdmissionV1(true, repositoryRoot) as AdmissionFailure;
    const admissionVerification = verifyCertificationBackedRuntimeAdmissionV1(admission);
    const selection = requestCertificationGatedRuntimeSelectionV1(true, repositoryRoot);
    expect(selection.failure_identity_digest).toBe(rebuildSelectionFailure(
      "certification_admission_rejected",
      "admission_verification",
      admissionVerification.reason,
      admission,
      sha256(repositoryRoot),
    ));
    expect(JSON.stringify(selection)).not.toContain(repositoryRoot);
    expect(JSON.stringify(selection)).not.toContain("private-message-must-not-escape");
    return selection.failure_identity_digest;
  });
  expect(new Set(identities).size).toBe(2);
  expect(RUNTIME_ADMISSION_POLICY_DIGEST_V1).toMatch(/^[0-9a-f]{64}$/);
});

test("P2 verifies exact duplicate idempotency and fail-closed conflict ordering", () => {
  const first = requestCertificationGatedRuntimeSelectionV1(true, root);
  const duplicate = requestCertificationGatedRuntimeSelectionV1(true, root);
  expect(duplicate).toBe(first);
  expect(duplicate.receipt).toBe(first.receipt);

  const source = readFileSync(join(root, selectionModulePath), "utf8");
  const lookup = source.indexOf("selectionsByIdentity.get(selectionIdentityDigest)");
  const conflict = source.indexOf("existing.canonical_identity !== canonicalIdentity", lookup);
  const duplicateReturn = source.indexOf("return existing.result", conflict);
  expect(lookup).toBeGreaterThan(-1);
  expect(lookup).toBeLessThan(conflict);
  expect(conflict).toBeLessThan(duplicateReturn);
  expect(source).toContain('return rejection(state, "selection_identity_conflict", "private_issuance")');
});

test("P2 excludes public trust upgrades and runtime-capable dependencies", () => {
  const source = readFileSync(join(root, selectionModulePath), "utf8");
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
  expect(source.match(/from\s+"([^"]+)"/g)).toEqual([
    'from "node:crypto"',
    'from "./action-661j5o1-certification-runtime-admission-authority.mjs"',
  ]);
  expect(source).not.toMatch(/export\s+(?:const|function|class)\s+.*(?:mint|factory|register|upgrade|capsule|receipt)/iu);
  expect(source).not.toMatch(/node:(?:child_process|fs|http|https|net|tls|worker_threads)|process\.env|fetch\s*\(|docker|postgres|migration|netlify|writeFile|appendFile|createWriteStream/iu);
  expect(source).toContain("privileged_capabilities: []");
  expect(source).toContain("selection_capabilities: []");
  expect(source).toContain("runtime_execution_allowed: false");
});

test("P2 selection is deterministic across UTC A/B, Stockholm and New York", () => {
  const moduleUrl = pathToFileURL(join(root, selectionModulePath)).href;
  const script = `import{requestCertificationGatedRuntimeSelectionV1 as select}from${JSON.stringify(moduleUrl)};const r=select(true,${JSON.stringify(root)});process.stdout.write(JSON.stringify({binding:r.receipt.binding,identity:r.selection_identity_digest,status:r.status}));`;
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
  expect(JSON.parse(outputs[0])).toMatchObject({
    identity: expectedSelectionIdentity,
    status: "selected",
  });
});
