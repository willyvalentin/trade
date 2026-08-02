import { expect, test } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1,
  BOUNDED_INVOCATION_PLAN_POLICY_V1,
  BOUNDED_INVOCATION_PLAN_VERSION_V1,
  requestCertificationSelectedBoundedInvocationPlanV1,
  verifyCertificationSelectedBoundedInvocationPlanV1,
} from "../../lib/action-661j5q1-certification-selected-bounded-invocation-plan.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const root = process.cwd();
const preservationCommit = "323a38381863bce21a6c21185278379ab13036f2";
const preservationRef =
  "refs/preservation/action-661j5q1-certification-selected-bounded-invocation-plan";
const expectedNormativeDigest =
  "78ebea7f94290b5163df4f1cc7fbf7ec112494c56eb7e5e3d9c20ea87bbd32ee";
const expectedPlanIdentity =
  "80503eb2c83764ee02520ac9e62c1533a7252bd2ecb260b690191428d7090db2";
const expectedSelectionIdentity =
  "754a7e781f14ae5731ddbac2444b8c7c3182e95c10913ea640e49855610c54ea";
const expectedAdmissionIdentity =
  "b24080e9d746c3fdaf467a622f18db3b8b4b5d0881c3686cdd3df7d78aea1e15";
const expectedRunnerIdentity =
  "76e4804def6411adaba50f4588248e8beaac88c63e1d6029850410b6c84bd2f7";
const modulePath =
  "lib/action-661j5q1-certification-selected-bounded-invocation-plan.mjs";

const normativeArtifacts = [
  [
    "docs/action-661j5q1-certification-selected-bounded-invocation-plan-golden-report.json",
    3282,
    "8c95927d9825d1a7c3755de8e046d168cb30d8ba2897d50a925607ffcbea6eb0",
  ],
  [
    "docs/action-661j5q1-certification-selected-bounded-invocation-plan.md",
    3498,
    "74051331135bacb0114c5699d51316d5193eea84c61a11e752c46b87eb95aebc",
  ],
  [
    modulePath,
    16200,
    "f547f17087a314fd8795b3de97750f04c1e21345cc2bc07a6cf9fe7cbccfe64e",
  ],
  [
    "tests/e2e/action-661j5q1-certification-selected-bounded-invocation-plan-fixtures.mjs",
    3375,
    "dd472e4d3c97f2a9a1ce7dd23487153ed5a501ce400c254af37478d50ca37486",
  ],
  [
    "tests/e2e/action-661j5q1-certification-selected-bounded-invocation-plan.spec.ts",
    18731,
    "5abc557e7621ba37da0e159c7299773898da0e9f675e9f90fef4309c899fab39",
  ],
] as const;

const valid = {
  createdAt: 1785580800000,
  evaluatedAt: 1785580801000,
  expiresAt: 1785580920000,
  requestIdentity: "missing-target-runtime-certification",
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

function normativeProjection(): JsonObject {
  return {
    artifact_count: normativeArtifacts.length,
    artifacts: normativeArtifacts.map(([path]) => {
      const bytes = readFileSync(join(root, path));
      return { byte_length: bytes.length, path, sha256: sha256(bytes) };
    }),
  };
}

function plan(
  requestIdentity: string,
  requestValue = valid.requestValue,
  evaluatedAt = valid.evaluatedAt,
) {
  return requestCertificationSelectedBoundedInvocationPlanV1(
    true,
    root,
    requestIdentity,
    requestValue,
    valid.createdAt,
    valid.expiresAt,
    evaluatedAt,
  );
}

test("Q2 independently freezes all five Q1 preservation bytes", () => {
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
  expect(sha256(canonicalJson(normativeProjection()))).toBe(
    expectedNormativeDigest,
  );
});

test("Q2 verifies private P selection and exact certification bindings", () => {
  const result = plan(valid.requestIdentity);
  expect(result.plan_identity_digest).toBe(expectedPlanIdentity);
  expect(result.counts).toEqual({
    plan_digests_computed: 1,
    plan_issuances: 1,
    request_digests_computed: 2,
    selection_requests: 1,
    selection_verifications: 1,
  });
  expect(result.plan?.binding.admission.admission_identity_digest).toBe(
    expectedAdmissionIdentity,
  );
  expect(result.plan?.binding.selection.selection_identity_digest).toBe(
    expectedSelectionIdentity,
  );
  expect(result.plan?.binding.runtime_profile.runner_identity_digest).toBe(
    expectedRunnerIdentity,
  );
  expect(result.plan?.binding.inventory).toEqual({
    fixture_count: 28,
    scenario_count: 14,
    shard_count: 28,
  });

  const source = readFileSync(join(root, modulePath), "utf8");
  expect(source.match(/requestCertificationGatedRuntimeSelectionV1\(/g)).toHaveLength(1);
  expect(source.match(/verifyCertificationGatedRuntimeSelectionV1\(/g)).toHaveLength(1);
  expect(source.indexOf("validatePrimitiveRequest(")).toBeLessThan(
    source.indexOf("requestCertificationGatedRuntimeSelectionV1("),
  );
  expect(source.indexOf("verifyCertificationGatedRuntimeSelectionV1(")).toBeLessThan(
    source.lastIndexOf("bindVerifiedSelection("),
  );
});

test("Q2 rejects caller-minted authorities and all cloned plan substitutions", () => {
  const claims: JsonObject[] = [
    { certified: true },
    { admission: { status: "admitted" } },
    { selection: { status: "selected" } },
    { runner: { status: "trusted" } },
    { capsule: { status: "trusted" } },
    { receipt: { status: "planned" } },
  ];
  for (const claim of claims) {
    const result = Reflect.apply(
      requestCertificationSelectedBoundedInvocationPlanV1,
      undefined,
      [
        true,
        root,
        `review-caller-${Object.keys(claim)[0]}`,
        valid.requestValue,
        valid.createdAt,
        valid.expiresAt,
        valid.evaluatedAt,
        claim,
      ],
    );
    expect(result).toMatchObject({
      reason: "planning_request_shape_invalid",
      status: "rejected",
    });
    expect(verifyCertificationSelectedBoundedInvocationPlanV1(claim)).toMatchObject({
      reason: "private_planning_provenance_missing",
      status: "rejected",
    });
  }

  const issued = plan("review-clone-substitution");
  const clone = structuredClone(issued.plan) as JsonObject;
  const substitutions = [
    ["plan_identity_digest", "a".repeat(64)],
    ["runtime_authority", true],
    ["runtime_execution_allowed", true],
  ] as const;
  expect(verifyCertificationSelectedBoundedInvocationPlanV1(clone).status).toBe(
    "rejected",
  );
  for (const [field, value] of substitutions) {
    const changed = structuredClone(clone);
    changed[field] = value;
    expect(verifyCertificationSelectedBoundedInvocationPlanV1(changed)).toMatchObject({
      reason: "private_planning_provenance_missing",
      status: "rejected",
    });
  }
  const binding = clone.binding as JsonObject;
  for (const field of ["admission", "certification", "selection", "runtime_profile"]) {
    const changed = structuredClone(clone);
    const changedBinding = changed.binding as JsonObject;
    changedBinding[field] = structuredClone(binding[field]);
    const nested = changedBinding[field] as JsonObject;
    nested.substituted = true;
    expect(verifyCertificationSelectedBoundedInvocationPlanV1(changed).status).toBe(
      "rejected",
    );
  }
});

test("Q2 proves plan and result are closed non-authority evidence", () => {
  const result = plan("review-plan-non-authority");
  expect(Object.keys(result).sort()).toEqual([
    "counts",
    "failure_identity_digest",
    "plan",
    "plan_identity_digest",
    "planning_version",
    "reason",
    "status",
  ]);
  expect(Object.keys(result.plan ?? {}).sort()).toEqual([
    "binding",
    "plan_identity_digest",
    "plan_kind",
    "planning_version",
    "privileged_capabilities",
    "runtime_authority",
    "runtime_execution_allowed",
    "status",
  ]);
  expect(result.plan).toMatchObject({
    privileged_capabilities: [],
    runtime_authority: false,
    runtime_execution_allowed: false,
  });
  expect(Object.hasOwn(result, "receipt")).toBe(false);
  expect(Object.hasOwn(result.plan ?? {}, "execute")).toBe(false);
  expect(Object.hasOwn(result.plan ?? {}, "invoke")).toBe(false);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.plan)).toBe(true);

  const source = readFileSync(join(root, modulePath), "utf8");
  const exports = [...source.matchAll(/export (?:const|function) ([A-Za-z0-9_]+)/g)]
    .map((match) => match[1])
    .sort();
  expect(exports).toEqual([
    "BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1",
    "BOUNDED_INVOCATION_PLAN_POLICY_V1",
    "BOUNDED_INVOCATION_PLAN_VERSION_V1",
    "requestCertificationSelectedBoundedInvocationPlanV1",
    "verifyCertificationSelectedBoundedInvocationPlanV1",
  ]);
  expect(source).not.toMatch(/export .*?(mint|factory|register|upgrade|execute|invoke)/i);
});

test("Q2 independently rebuilds the single captured request and plan identities", () => {
  let requestValue = "review-single-capture-value";
  const result = plan("review-single-capture", requestValue);
  const capturedValue = requestValue;
  requestValue = "changed-after-return";

  const request = result.plan?.binding.invocation_request;
  expect(request?.canonical_request_digest).toBe(
    sha256(canonicalJson({ encoding: "utf8_primitive_v1", value: capturedValue })),
  );
  expect(request?.request_identity_digest).toBe(
    sha256(canonicalJson({
      request_identity: "review-single-capture",
      version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    })),
  );
  expect(JSON.stringify(result)).not.toContain(capturedValue);
  expect(JSON.stringify(result)).not.toContain(requestValue);

  const identityProjection = {
    binding: result.plan?.binding,
    plan_kind: "bounded_invocation_decision",
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    status: "planned",
  } as JsonObject;
  expect(sha256(canonicalJson(identityProjection))).toBe(
    result.plan_identity_digest,
  );
});

test("Q2 keeps raw request content out of deterministic sanitized failures", () => {
  const requestIdentity = "review-sensitive-conflict";
  const firstSecret = "private-request-alpha";
  const secondSecret = "private-request-beta";
  expect(plan(requestIdentity, firstSecret).status).toBe("planned");
  const conflict = plan(requestIdentity, secondSecret);
  const expired = plan("review-expired", "private-expired-value", valid.expiresAt);
  const oversized = plan("review-oversized", "s".repeat(513));
  for (const [failure, secret] of [
    [conflict, secondSecret],
    [expired, "private-expired-value"],
    [oversized, "s".repeat(513)],
  ] as const) {
    const serialized = JSON.stringify(failure);
    expect(serialized).not.toContain(secret);
    expect(failure.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
  }
  expect(new Set([
    conflict.failure_identity_digest,
    expired.failure_identity_digest,
    oversized.failure_identity_digest,
  ]).size).toBe(3);
});

test("Q2 verifies idempotency, conflict, expiry and cross-session provenance", () => {
  const first = plan("review-idempotent");
  const duplicate = plan("review-idempotent");
  expect(duplicate).toBe(first);
  expect(plan("review-idempotent", `${valid.requestValue}:conflict`)).toMatchObject({
    reason: "invocation_identity_conflict",
    status: "rejected",
  });
  expect(plan("review-expiry-boundary", valid.requestValue, valid.expiresAt)).toMatchObject({
    reason: "invocation_request_expired",
    status: "rejected",
  });

  const script = [
    `import {verifyCertificationSelectedBoundedInvocationPlanV1 as verify} from ${JSON.stringify(pathToFileURL(join(root, modulePath)).href)};`,
    `const candidate=JSON.parse(${JSON.stringify(JSON.stringify(first.plan))});`,
    "process.stdout.write(JSON.stringify(verify(candidate)));",
  ].join("");
  const child = spawnSync(process.execPath, ["--input-type=module", "--eval", script], {
    encoding: "utf8",
    env: { NODE_ENV: "test", PATH: process.env.PATH, TZ: "UTC" },
  });
  expect(child.status).toBe(0);
  expect(child.stderr).toBe("");
  expect(JSON.parse(child.stdout)).toMatchObject({
    reason: "private_planning_provenance_missing",
    status: "rejected",
  });
});

test("Q2 executes no caller hooks and enforces primitive request bounds", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("get_executed"); },
    getPrototypeOf() { hooks += 1; throw new Error("prototype_executed"); },
    ownKeys() { hooks += 1; throw new Error("own_keys_executed"); },
  });
  const accessor = Object.defineProperty({}, "value", {
    get() { hooks += 1; throw new Error("accessor_executed"); },
  });
  const callback = () => { hooks += 1; throw new Error("callback_executed"); };
  for (const candidate of [hostile, accessor, callback]) {
    const result = requestCertificationSelectedBoundedInvocationPlanV1(
      true,
      root,
      "review-hook-free",
      candidate,
      valid.createdAt,
      valid.expiresAt,
      valid.evaluatedAt,
    );
    expect(result).toMatchObject({
      reason: "invocation_request_type_invalid",
      status: "rejected",
    });
    expect(result.counts.selection_requests).toBe(0);
  }
  expect(hooks).toBe(0);
  expect(plan("review-exact-byte-budget", "x".repeat(512)).status).toBe("planned");
  expect(plan("review-over-byte-budget", "x".repeat(513))).toMatchObject({
    reason: "invocation_request_byte_budget_exceeded",
    status: "rejected",
  });
});

test("Q2 preserves default-off zero work and bounded enabled work", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("default_off_get"); },
    getPrototypeOf() { hooks += 1; throw new Error("default_off_prototype"); },
    ownKeys() { hooks += 1; throw new Error("default_off_keys"); },
  });
  const off = requestCertificationSelectedBoundedInvocationPlanV1(
    false,
    hostile,
    hostile,
    hostile,
    hostile,
    hostile,
    hostile,
  );
  expect(off).toMatchObject({
    counts: {
      plan_digests_computed: 0,
      plan_issuances: 0,
      request_digests_computed: 0,
      selection_requests: 0,
      selection_verifications: 0,
    },
    reason: "bounded_invocation_planning_disabled",
    status: "not_planned",
  });
  expect(hooks).toBe(0);

  const enabled = plan("review-bounded-enabled");
  expect(enabled.counts).toEqual({
    plan_digests_computed: 1,
    plan_issuances: 1,
    request_digests_computed: 2,
    selection_requests: 1,
    selection_verifications: 1,
  });
  expect(BOUNDED_INVOCATION_PLAN_POLICY_V1).toMatchObject({
    max_request_bytes: 512,
    max_request_identity_bytes: 128,
    max_ttl_ms: 300000,
    min_ttl_ms: 1000,
    privileged_capabilities: [],
    runtime_authority: false,
    runtime_execution_allowed: false,
  });
});

test("Q2 excludes runtime, live, write and sensitive-data capabilities", () => {
  const source = readFileSync(join(root, modulePath), "utf8");
  expect(source).not.toMatch(
    /child_process|spawn|execFile|docker|container|postgres|migration|fetch\(|https?:|netlify|writeFile|appendFile|createWriteStream|process\.env|credential|password|secret|token/i,
  );
  expect(source).not.toMatch(/callback|\.then\(|\.call\(|\.apply\(/i);
  expect(source).toMatch(/^import \{ createHash \} from "node:crypto";/);
  expect(source).toMatch(
    /from "\.\/action-661j5p1-certification-gated-runtime-selection\.mjs";/,
  );
  expect(sha256(canonicalJson(BOUNDED_INVOCATION_PLAN_POLICY_V1 as JsonObject))).toBe(
    BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1,
  );
});

test("Q2 independently verifies UTC and Stockholm process determinism", () => {
  const script = [
    `import {requestCertificationSelectedBoundedInvocationPlanV1 as plan} from ${JSON.stringify(pathToFileURL(join(root, modulePath)).href)};`,
    `const result=plan(true,${JSON.stringify(root)},"review-process-determinism",${JSON.stringify(valid.requestValue)},${valid.createdAt},${valid.expiresAt},${valid.evaluatedAt});`,
    "process.stdout.write(JSON.stringify({binding:result.plan.binding,identity:result.plan_identity_digest,status:result.status}));",
  ].join("");
  const outputs = ["UTC", "UTC", "Europe/Stockholm"].map((timezone) => {
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
