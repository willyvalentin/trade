import { expect, test } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  requestCertificationSelectedBoundedInvocationPlanV1,
} from "../../lib/action-661j5q1-certification-selected-bounded-invocation-plan.mjs";
import {
  BOUNDED_INVOCATION_AUTHORIZATION_POLICY_DIGEST_V1,
  BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1,
  BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
  requestTransportInertBoundedInvocationAuthorizationV1,
  verifyTransportInertBoundedInvocationAuthorizationV1,
} from "../../lib/action-661j5r1-transport-inert-bounded-invocation-authorization.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const root = process.cwd();
const preservationCommit = "70765f6e31f99facd09399ca799e6c156f54f233";
const preservationRef =
  "refs/preservation/action-661j5r1-transport-inert-bounded-invocation-authorization";
const expectedNormativeDigest =
  "565cb1f121391c194c300c4d5e488d05b7e766f6c67def50bff6ff9c15ed825c";
const expectedAuthorizationIdentity =
  "4801eefde4ba1675004723f086cee3e937ac3d1b78201c2708edbc0c29f5f21d";
const expectedAdmissionIdentity =
  "b24080e9d746c3fdaf467a622f18db3b8b4b5d0881c3686cdd3df7d78aea1e15";
const expectedSelectionIdentity =
  "754a7e781f14ae5731ddbac2444b8c7c3182e95c10913ea640e49855610c54ea";
const expectedPlanIdentity =
  "250529f2619eb4e16f764170e96b1dbaa8339bc13c40c8e041f40c7a9a2c67b6";
const expectedRunnerIdentity =
  "76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7";
const expectedRuntimeFamily =
  "action_661j5r2_runtime_certification_rebuild_v1";
const modulePath =
  "lib/action-661j5r1-transport-inert-bounded-invocation-authorization.mjs";

const normativeArtifacts = [
  [
    "docs/action-661j5r1-transport-inert-bounded-invocation-authorization-golden-report.json",
    3876,
    "c0744dc2b82d9c4f51aa7deb4ccb5e87d87477ecdd2aef4e3dc4ecf62ea42a24",
  ],
  [
    "docs/action-661j5r1-transport-inert-bounded-invocation-authorization.md",
    5004,
    "5583e43add82a7cc9b3d6e84b483251fc521eee14bf06a376aaef32addc5ec59",
  ],
  [
    modulePath,
    19500,
    "512c2e1bd1bb798286eb0b5be868a4d6932e6f3fd5d4eb489a1590700ca4ddf3",
  ],
  [
    "tests/e2e/action-661j5r1-transport-inert-bounded-invocation-authorization-fixtures.mjs",
    3351,
    "1ece35a9c5981219e8f84f09ff239a9c34c656a057fcb8ed7c0de7fc30f4b343",
  ],
  [
    "tests/e2e/action-661j5r1-transport-inert-bounded-invocation-authorization.spec.ts",
    18369,
    "ecf51f8d6de39f4e6394238b7d2eca5ad29aec45756b36896ce06033b055b21f",
  ],
] as const;

const valid = {
  attempt: 1,
  budget: 4,
  createdAt: 1785580800000,
  evaluatedAt: 1785580801000,
  expiresAt: 1785580920000,
  requestIdentity: "missing-target-runtime-authorization",
  requestValue: "invoke:missing_target:certified_rebuild_v1",
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

function normativeRows(): JsonObject[] {
  return normativeArtifacts
    .map(([path]) => {
      const bytes = readFileSync(join(root, path));
      return { byte_length: bytes.length, path, sha256: sha256(bytes) };
    })
    .sort((left, right) => String(left.path).localeCompare(String(right.path)));
}

function authorize(
  requestIdentity: string,
  requestValue = valid.requestValue,
  createdAt = valid.createdAt,
  expiresAt = valid.expiresAt,
  evaluatedAt = valid.evaluatedAt,
  budget = valid.budget,
  attempt = valid.attempt,
) {
  return requestTransportInertBoundedInvocationAuthorizationV1(
    true,
    root,
    requestIdentity,
    requestValue,
    createdAt,
    expiresAt,
    evaluatedAt,
    budget,
    attempt,
  );
}

function setPath(target: JsonObject, path: string, value: JsonValue): void {
  const keys = path.split(".");
  let cursor = target;
  for (const key of keys.slice(0, -1)) cursor = cursor[key] as JsonObject;
  cursor[keys.at(-1) as string] = value;
}

function recomputePublicIdentity(candidate: JsonObject): void {
  const projection = {
    authorization_kind: candidate.authorization_kind,
    authorization_version: candidate.authorization_version,
    binding: candidate.binding,
    status: candidate.status,
  } as JsonObject;
  candidate.authorization_identity_digest = sha256(canonicalJson(projection));
}

test("R2 freezes exactly five preservation-identical R1 artifacts", () => {
  expect(execFileSync("git", ["rev-parse", `${preservationRef}^{commit}`], {
    cwd: root,
    encoding: "utf8",
  }).trim()).toBe(preservationCommit);
  for (const [path, byteLength, digest] of normativeArtifacts) {
    const preserved = execFileSync("git", ["show", `${preservationRef}:${path}`], {
      cwd: root,
    });
    const worktree = readFileSync(join(root, path));
    expect(worktree.equals(preserved), path).toBe(true);
    expect(preserved.length, path).toBe(byteLength);
    expect(sha256(preserved), path).toBe(digest);
  }
  expect(sha256(JSON.stringify(normativeRows()))).toBe(expectedNormativeDigest);
});

test("R2 verifies Q private provenance precedes the full O/P/Q/R binding", () => {
  const result = authorize(valid.requestIdentity);
  expect(result.authorization_identity_digest).toBe(expectedAuthorizationIdentity);
  expect(result.counts).toEqual({
    authorization_digests_computed: 2,
    authorization_issuances: 1,
    plan_requests: 1,
    plan_verifications: 1,
  });
  expect(result.receipt?.binding).toMatchObject({
    admission: { admission_identity_digest: expectedAdmissionIdentity },
    planning: { plan_identity_digest: expectedPlanIdentity },
    runtime_profile: {
      family_version: expectedRuntimeFamily,
      runner_identity_digest: expectedRunnerIdentity,
    },
    selection: { selection_identity_digest: expectedSelectionIdentity },
  });
  const source = readFileSync(join(root, modulePath), "utf8");
  expect(source.match(/requestCertificationSelectedBoundedInvocationPlanV1\(/g))
    .toHaveLength(1);
  expect(source.match(/verifyCertificationSelectedBoundedInvocationPlanV1\(/g))
    .toHaveLength(1);
  expect(source.indexOf("capturePrimitiveRequest(")).toBeLessThan(
    source.indexOf("requestCertificationSelectedBoundedInvocationPlanV1("),
  );
  expect(source.indexOf("verifyCertificationSelectedBoundedInvocationPlanV1("))
    .toBeLessThan(source.lastIndexOf("bindVerifiedPlan("));
});

test("R2 rejects caller plans, copied receipts and self-consistent public data", () => {
  const callerPlan = requestCertificationSelectedBoundedInvocationPlanV1(
    true,
    root,
    "r2-caller-q-plan",
    valid.requestValue,
    valid.createdAt,
    valid.expiresAt,
    valid.evaluatedAt,
  );
  const supplied = Reflect.apply(
    requestTransportInertBoundedInvocationAuthorizationV1,
    undefined,
    [
      true, root, "r2-caller-plan-supply", valid.requestValue,
      valid.createdAt, valid.expiresAt, valid.evaluatedAt,
      valid.budget, valid.attempt, callerPlan.plan,
    ],
  );
  expect(supplied).toMatchObject({
    reason: "authorization_request_shape_invalid",
    status: "rejected",
  });

  const issued = authorize("r2-clone-authority");
  const copied = structuredClone(issued.receipt) as JsonObject;
  recomputePublicIdentity(copied);
  for (const candidate of [
    copied,
    JSON.parse(JSON.stringify(copied)) as JsonObject,
    { ...copied },
  ]) {
    expect(verifyTransportInertBoundedInvocationAuthorizationV1(candidate))
      .toMatchObject({
        reason: "private_authorization_provenance_missing",
        status: "rejected",
      });
  }
});

test("R2 rejects every authority and request substitution despite recomputation", () => {
  const issued = authorize("r2-substitution-matrix");
  const substitutions: [string, JsonValue][] = [
    ["binding.admission.admission_identity_digest", "a".repeat(64)],
    ["binding.selection.selection_identity_digest", "b".repeat(64)],
    ["binding.planning.plan_identity_digest", "c".repeat(64)],
    ["binding.invocation_request.canonical_request_digest", "d".repeat(64)],
    ["binding.runtime_profile.runner_identity_digest", "e".repeat(64)],
    ["binding.runtime_profile.family_version", "substituted_runtime_family"],
    ["binding.invocation_budget.max_operations", 8],
    ["binding.freshness.expires_at_epoch_ms", valid.expiresAt + 1],
    ["binding.attempt.attempt_ordinal", 2],
  ];
  for (const [path, value] of substitutions) {
    const changed = structuredClone(issued.receipt) as JsonObject;
    setPath(changed, path, value);
    recomputePublicIdentity(changed);
    expect(verifyTransportInertBoundedInvocationAuthorizationV1(changed), path)
      .toMatchObject({
        reason: "private_authorization_provenance_missing",
        status: "rejected",
      });
  }
});

test("R2 proves receipts are closed frozen evidence and never runtime authority", () => {
  const result = authorize("r2-receipt-non-authority");
  expect(Object.keys(result.receipt ?? {}).sort()).toEqual([
    "authorization_identity_digest",
    "authorization_kind",
    "authorization_version",
    "binding",
    "executable_capabilities",
    "privileged_capabilities",
    "runtime_authority",
    "runtime_execution_allowed",
    "status",
    "transport_access_allowed",
  ]);
  expect(result.receipt).toMatchObject({
    executable_capabilities: [],
    privileged_capabilities: [],
    runtime_authority: false,
    runtime_execution_allowed: false,
    transport_access_allowed: false,
  });
  expect(Object.hasOwn(result.receipt ?? {}, "execute")).toBe(false);
  expect(Object.hasOwn(result.receipt ?? {}, "invoke")).toBe(false);
  expect(Object.hasOwn(result.receipt ?? {}, "runner")).toBe(false);
  expect(Object.isFrozen(result.receipt)).toBe(true);
  expect(Object.isFrozen(result.receipt?.binding)).toBe(true);
});

test("R2 verifies replay idempotency and conflict-safe identity reuse", () => {
  const first = authorize("r2-replay-idempotent");
  expect(authorize("r2-replay-idempotent")).toBe(first);
  const conflicts = [
    authorize("r2-replay-idempotent", `${valid.requestValue}:changed`),
    authorize(
      "r2-replay-idempotent",
      valid.requestValue,
      valid.createdAt,
      valid.expiresAt,
      valid.evaluatedAt,
      valid.budget + 1,
    ),
    authorize(
      "r2-replay-idempotent",
      valid.requestValue,
      valid.createdAt,
      valid.expiresAt + 1,
      valid.evaluatedAt,
    ),
  ];
  expect(conflicts.map((failure) => failure.status)).toEqual([
    "rejected", "rejected", "rejected",
  ]);
  expect(conflicts.map((failure) => failure.reason)).toEqual([
    "bounded_invocation_plan_rejected",
    "authorization_attempt_identity_conflict",
    "bounded_invocation_plan_rejected",
  ]);
  for (const failure of conflicts) {
    expect(failure.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
  }
  expect(new Set(conflicts.map((failure) => failure.failure_identity_digest)).size)
    .toBe(2);
});

test("R2 verifies exact budget, attempt and expiry boundaries", () => {
  const accepted = [
    authorize("r2-budget-min", valid.requestValue, valid.createdAt, valid.expiresAt, valid.evaluatedAt, 1, 1),
    authorize("r2-budget-max", valid.requestValue, valid.createdAt, valid.expiresAt, valid.evaluatedAt, 8, 4),
    authorize("r2-freshness-min", valid.requestValue, valid.createdAt, valid.expiresAt, valid.expiresAt - 1, 4, 1),
    authorize("r2-freshness-max", valid.requestValue, valid.createdAt, valid.createdAt + 121000, valid.createdAt + 1000, 4, 1),
  ];
  expect(accepted.map((result) => result.status)).toEqual([
    "authorized", "authorized", "authorized", "authorized",
  ]);
  const rejected = [
    authorize("r2-budget-under", valid.requestValue, valid.createdAt, valid.expiresAt, valid.evaluatedAt, 0, 1),
    authorize("r2-budget-over", valid.requestValue, valid.createdAt, valid.expiresAt, valid.evaluatedAt, 9, 1),
    authorize("r2-attempt-under", valid.requestValue, valid.createdAt, valid.expiresAt, valid.evaluatedAt, 4, 0),
    authorize("r2-attempt-over", valid.requestValue, valid.createdAt, valid.expiresAt, valid.evaluatedAt, 4, 5),
    authorize("r2-expired", valid.requestValue, valid.createdAt, valid.expiresAt, valid.expiresAt, 4, 1),
    authorize("r2-freshness-over", valid.requestValue, valid.createdAt, valid.createdAt + 121001, valid.createdAt + 1000, 4, 1),
  ];
  for (const failure of rejected) {
    expect(failure.status).toBe("rejected");
    expect(failure.counts.plan_requests).toBe(0);
    expect(failure.counts.plan_verifications).toBe(0);
    expect(failure.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
  }
});

test("R2 executes no caller getter, proxy, accessor or coercion hook", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("private_proxy_exception_text"); },
    getPrototypeOf() { hooks += 1; throw new Error("private_prototype_text"); },
    ownKeys() { hooks += 1; throw new Error("private_keys_text"); },
  });
  const coercible = {
    toString() { hooks += 1; throw new Error("private_to_string_text"); },
    valueOf() { hooks += 1; throw new Error("private_value_of_text"); },
    [Symbol.toPrimitive]() { hooks += 1; throw new Error("private_primitive_text"); },
  };
  const accessor = Object.defineProperty({}, "value", {
    get() { hooks += 1; throw new Error("private_accessor_text"); },
  });
  const candidates = [hostile, coercible, accessor, () => { hooks += 1; }];
  for (const candidate of candidates) {
    const result = requestTransportInertBoundedInvocationAuthorizationV1(
      true, root, "r2-hook-free", candidate,
      valid.createdAt, valid.expiresAt, valid.evaluatedAt,
      valid.budget, valid.attempt,
    );
    expect(result.reason).toBe("authorization_request_type_invalid");
    expect(JSON.stringify(result)).not.toMatch(/private_|r2-hook-free/);
  }
  const numeric = requestTransportInertBoundedInvocationAuthorizationV1(
    true, root, "r2-numeric-hook-free", valid.requestValue,
    coercible, valid.expiresAt, valid.evaluatedAt, valid.budget, valid.attempt,
  );
  expect(numeric.reason).toBe("authorization_time_boundary_invalid");
  expect(hooks).toBe(0);
});

test("R2 default-off and invalid primitives perform zero downstream work", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("off_get"); },
    getPrototypeOf() { hooks += 1; throw new Error("off_prototype"); },
    ownKeys() { hooks += 1; throw new Error("off_keys"); },
  });
  const off = requestTransportInertBoundedInvocationAuthorizationV1(
    false, hostile, hostile, hostile, hostile, hostile, hostile, hostile, hostile,
  );
  expect(off).toMatchObject({
    counts: {
      authorization_digests_computed: 0,
      authorization_issuances: 0,
      plan_requests: 0,
      plan_verifications: 0,
    },
    reason: "bounded_invocation_authorization_disabled",
    status: "not_authorized",
  });
  expect(hooks).toBe(0);

  const invalid = requestTransportInertBoundedInvocationAuthorizationV1(
    true, root, "r2-invalid-preflight", "", valid.createdAt,
    valid.expiresAt, valid.evaluatedAt, valid.budget, valid.attempt,
  );
  expect(invalid).toMatchObject({
    counts: { authorization_issuances: 0, plan_requests: 0, plan_verifications: 0 },
    reason: "authorization_request_byte_budget_exceeded",
    status: "rejected",
  });
});

test("R2 independently rebuilds policy, attempt and authorization identities", () => {
  expect(sha256(canonicalJson(
    BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1 as JsonObject,
  ))).toBe(BOUNDED_INVOCATION_AUTHORIZATION_POLICY_DIGEST_V1);
  const result = authorize("r2-independent-identity");
  const receipt = result.receipt as unknown as JsonObject;
  const binding = receipt.binding as JsonObject;
  const attempt = binding.attempt as JsonObject;
  const request = binding.invocation_request as JsonObject;
  expect(attempt.attempt_identity_digest).toBe(sha256(canonicalJson({
    attempt_ordinal: attempt.attempt_ordinal,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    request_identity_digest: request.request_identity_digest,
  })));
  expect(result.authorization_identity_digest).toBe(sha256(canonicalJson({
    authorization_kind: receipt.authorization_kind,
    authorization_version: receipt.authorization_version,
    binding,
    status: receipt.status,
  })));
});

test("R2 inventories a closed export and capability surface", () => {
  const source = readFileSync(join(root, modulePath), "utf8");
  const exports = [...source.matchAll(/export (?:const|function) ([A-Za-z0-9_]+)/g)]
    .map((match) => match[1]).sort();
  expect(exports).toEqual([
    "BOUNDED_INVOCATION_AUTHORIZATION_POLICY_DIGEST_V1",
    "BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1",
    "BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1",
    "requestTransportInertBoundedInvocationAuthorizationV1",
    "verifyTransportInertBoundedInvocationAuthorizationV1",
  ]);
  expect([...source.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]))
    .toEqual([
      "node:crypto",
      "./action-661j5q1-certification-selected-bounded-invocation-plan.mjs",
    ]);
  expect(source).not.toMatch(/export .*?(mint|factory|register|upgrade|execute)/i);
  expect(source).not.toMatch(
    /node:child_process|spawn|execFile|docker|container|postgres|migration|fetch\(|https?:|netlify|writeFile|appendFile|createWriteStream|process\.env|credential|password|secret|broker|transport client|\bimport\s*\(/i,
  );
  expect(source).not.toMatch(/callback|\.then\(|\.call\(|\.apply\(/i);
});

test("R2 identities are deterministic in UTC, Stockholm and New York", () => {
  const script = [
    `import {requestTransportInertBoundedInvocationAuthorizationV1 as authorize} from ${JSON.stringify(pathToFileURL(join(root, modulePath)).href)};`,
    `const result=authorize(true,${JSON.stringify(root)},"r2-process-determinism",${JSON.stringify(valid.requestValue)},${valid.createdAt},${valid.expiresAt},${valid.evaluatedAt},${valid.budget},${valid.attempt});`,
    "process.stdout.write(JSON.stringify({attempt:result.receipt.binding.attempt.attempt_identity_digest,authorization:result.authorization_identity_digest,binding:result.receipt.binding,status:result.status}));",
  ].join("");
  const outputs = ["UTC", "UTC", "Europe/Stockholm", "America/New_York"]
    .map((timezone) => {
      const child = spawnSync(process.execPath, ["--input-type=module", "--eval", script], {
        encoding: "utf8",
        env: { NODE_ENV: "test", PATH: process.env.PATH, TZ: timezone },
      });
      expect(child.status).toBe(0);
      expect(child.stderr).toBe("");
      return child.stdout;
    });
  expect(new Set(outputs).size).toBe(1);
});
