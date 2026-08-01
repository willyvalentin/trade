import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
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
import {
  BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1,
  CALLER_PLANNING_TRUST_ATTACKS_V1,
  INVALID_PRIMITIVE_REQUESTS_V1,
  PLAN_SUBSTITUTIONS_V1,
  VALID_BOUNDED_INVOCATION_REQUEST_V1,
} from "./action-661j5q1-certification-selected-bounded-invocation-plan-fixtures.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type InvalidPrimitiveRequest = {
  attack_id: string;
  request_value: string;
};
type GoldenArtifact = {
  byte_length?: number;
  path: string;
  role: string;
  self_digest_included?: boolean;
  sha256?: string;
};
type GoldenReport = {
  artifact_contract: {
    artifact_count: number;
    artifacts: GoldenArtifact[];
  };
  golden: {
    canonical_request_digest: string;
    plan_identity_digest: string;
    request_identity_digest: string;
    runner_identity_digest: string;
  };
  safety: {
    plan_runtime_authority: boolean;
    production_impact: boolean;
    runtime_execution_performed: boolean;
  };
};

const root = process.cwd();
const modulePath =
  "lib/action-661j5q1-certification-selected-bounded-invocation-plan.mjs";
const fixturePath =
  "tests/e2e/action-661j5q1-certification-selected-bounded-invocation-plan-fixtures.mjs";
const goldenReportPath =
  "docs/action-661j5q1-certification-selected-bounded-invocation-plan-golden-report.json";
const valid = VALID_BOUNDED_INVOCATION_REQUEST_V1;

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
  return (
    Object.isFrozen(value) &&
    Object.values(value).every((nested) => isDeepFrozen(nested, seen))
  );
}

function planValid(
  requestIdentity = valid.request_identity,
  requestValue = valid.request_value,
  createdAt = valid.created_at_epoch_ms,
  expiresAt = valid.expires_at_epoch_ms,
  evaluatedAt = valid.evaluated_at_epoch_ms,
) {
  return requestCertificationSelectedBoundedInvocationPlanV1(
    true,
    root,
    requestIdentity,
    requestValue,
    createdAt,
    expiresAt,
    evaluatedAt,
  );
}

test("Q1 freezes its closed planning policy and independent policy digest", () => {
  expect(
    sha256(canonicalJson(BOUNDED_INVOCATION_PLAN_POLICY_V1 as JsonObject)),
  ).toBe(BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1);
  expect(BOUNDED_INVOCATION_PLAN_POLICY_DIGEST_V1).toBe(
    BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.planning_policy_digest,
  );
  expect(BOUNDED_INVOCATION_PLAN_POLICY_V1).toMatchObject({
    default_planning: "off",
    max_request_bytes: 512,
    max_request_identity_bytes: 128,
    max_ttl_ms: 300000,
    min_ttl_ms: 1000,
    privileged_capabilities: [],
    runtime_authority: false,
    runtime_execution_allowed: false,
  });
  expect(isDeepFrozen(BOUNDED_INVOCATION_PLAN_POLICY_V1)).toBe(true);
});

test("Q1 default-off performs zero reads, digests, selection and planning work", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("getter_executed"); },
    getPrototypeOf() { hooks += 1; throw new Error("prototype_executed"); },
    ownKeys() { hooks += 1; throw new Error("own_keys_executed"); },
  });
  const result = requestCertificationSelectedBoundedInvocationPlanV1(
    false,
    hostile,
    hostile,
    hostile,
    hostile,
    hostile,
    hostile,
  );
  expect(result).toEqual({
    counts: {
      plan_digests_computed: 0,
      plan_issuances: 0,
      request_digests_computed: 0,
      selection_requests: 0,
      selection_verifications: 0,
    },
    failure_identity_digest: null,
    plan: null,
    plan_identity_digest: null,
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    reason: "bounded_invocation_planning_disabled",
    status: "not_planned",
  });
  expect(hooks).toBe(0);
});

test("Q1 internally selects P1 once and issues one private bounded plan", () => {
  const result = planValid();
  expect(result).toMatchObject({
    counts: {
      plan_digests_computed: 1,
      plan_issuances: 1,
      request_digests_computed: 2,
      selection_requests: 1,
      selection_verifications: 1,
    },
    failure_identity_digest: null,
    plan_identity_digest:
      BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.plan_identity_digest,
    reason: "certification_selected_invocation_plan_created",
    status: "planned",
  });
  expect(result.plan).not.toBeNull();
  expect(result.plan?.runtime_authority).toBe(false);
  expect(result.plan?.runtime_execution_allowed).toBe(false);
  expect(result.plan?.privileged_capabilities).toEqual([]);
  expect(result.plan?.binding.inventory).toEqual({
    fixture_count: 28,
    scenario_count: 14,
    shard_count: 28,
  });
  expect(result.plan?.binding.admission.admission_identity_digest).toBe(
    BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.admission_identity_digest,
  );
  expect(result.plan?.binding.selection.selection_identity_digest).toBe(
    BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.selection_identity_digest,
  );
  expect(result.plan?.binding.runtime_profile).toMatchObject({
    family_version: BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.family_version,
    profile_digest: BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.profile_digest,
    profile_id: BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.profile_id,
    runner_identity_digest:
      BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.runner_identity_digest,
    runner_version: BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.runner_version,
  });
  expect(isDeepFrozen(result)).toBe(true);
  expect(verifyCertificationSelectedBoundedInvocationPlanV1(result.plan)).toEqual({
    plan_identity_digest:
      BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.plan_identity_digest,
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    reason: "private_planning_provenance_verified",
    runtime_authority: false,
    runtime_execution_allowed: false,
    status: "planned",
  });
});

test("Q1 independently binds canonical request and plan identities without raw request evidence", () => {
  const result = planValid();
  const requestBinding = result.plan?.binding.invocation_request;
  expect(requestBinding).toEqual({
    canonical_request_digest:
      BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.canonical_request_digest,
    created_at_epoch_ms: valid.created_at_epoch_ms,
    encoding: "utf8_primitive_v1",
    evaluated_at_epoch_ms: valid.evaluated_at_epoch_ms,
    expires_at_epoch_ms: valid.expires_at_epoch_ms,
    request_byte_length: Buffer.byteLength(valid.request_value),
    request_identity_digest:
      BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.request_identity_digest,
    ttl_ms: valid.expires_at_epoch_ms - valid.created_at_epoch_ms,
  });
  expect(
    sha256(canonicalJson({ encoding: "utf8_primitive_v1", value: valid.request_value })),
  ).toBe(BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.canonical_request_digest);
  expect(
    sha256(canonicalJson({
      request_identity: valid.request_identity,
      version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    })),
  ).toBe(BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.request_identity_digest);
  const identityProjection = {
    binding: result.plan?.binding,
    plan_kind: "bounded_invocation_decision",
    planning_version: BOUNDED_INVOCATION_PLAN_VERSION_V1,
    status: "planned",
  } as JsonObject;
  expect(sha256(canonicalJson(identityProjection))).toBe(
    BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.plan_identity_digest,
  );
  expect(JSON.stringify(result)).not.toContain(valid.request_value);
  expect(JSON.stringify(result)).not.toContain(valid.request_identity);
});

test("Q1 plan and binding use exact closed field inventories", () => {
  const plan = planValid().plan;
  expect(Object.keys(plan ?? {}).sort()).toEqual([
    "binding",
    "plan_identity_digest",
    "plan_kind",
    "planning_version",
    "privileged_capabilities",
    "runtime_authority",
    "runtime_execution_allowed",
    "status",
  ]);
  expect(Object.keys(plan?.binding ?? {}).sort()).toEqual([
    "admission",
    "certification",
    "inventory",
    "invocation_request",
    "planning_policy",
    "runtime_profile",
    "selection",
  ]);
  expect(Object.keys(plan?.binding.invocation_request ?? {}).sort()).toEqual([
    "canonical_request_digest",
    "created_at_epoch_ms",
    "encoding",
    "evaluated_at_epoch_ms",
    "expires_at_epoch_ms",
    "request_byte_length",
    "request_identity_digest",
    "ttl_ms",
  ]);
});

test("Q1 exact duplicates are idempotent and identity conflicts fail closed", () => {
  const first = planValid();
  const duplicate = planValid();
  expect(duplicate).toBe(first);
  const conflict = planValid(
    valid.request_identity,
    `${valid.request_value}:changed`,
  );
  expect(conflict).toMatchObject({
    plan: null,
    reason: "invocation_identity_conflict",
    status: "rejected",
  });
  expect(conflict.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
});

test("Q1 rejects expired, future, malformed and oversized requests before selection", () => {
  const failures = [
    requestCertificationSelectedBoundedInvocationPlanV1(
      true, root, valid.request_identity, valid.request_value,
      valid.created_at_epoch_ms, valid.expires_at_epoch_ms, valid.expires_at_epoch_ms,
    ),
    requestCertificationSelectedBoundedInvocationPlanV1(
      true, root, valid.request_identity, valid.request_value,
      valid.created_at_epoch_ms, valid.expires_at_epoch_ms,
      valid.created_at_epoch_ms - 1,
    ),
    ...(INVALID_PRIMITIVE_REQUESTS_V1 as InvalidPrimitiveRequest[]).map((attack) =>
      requestCertificationSelectedBoundedInvocationPlanV1(
        true, root, `${attack.attack_id}-identity`, attack.request_value,
        valid.created_at_epoch_ms, valid.expires_at_epoch_ms,
        valid.evaluated_at_epoch_ms,
      )),
  ];
  expect(failures.map((failure) => failure.reason)).toEqual([
    "invocation_request_expired",
    "invocation_request_not_yet_valid",
    "invocation_request_byte_budget_exceeded",
    "invocation_request_not_canonical",
    "invocation_request_not_canonical",
    "invocation_request_byte_budget_exceeded",
  ]);
  for (const failure of failures) {
    expect(failure.counts.selection_requests).toBe(0);
    expect(failure.counts.selection_verifications).toBe(0);
    expect(failure.counts.plan_issuances).toBe(0);
    expect(failure.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
  }
  expect(new Set(failures.map((failure) => failure.failure_identity_digest)).size).toBe(
    failures.length,
  );

  const exact = planValid(
    "exact-request-byte-boundary",
    "x".repeat(512),
  );
  expect(exact.status).toBe("planned");
  expect(exact.plan?.binding.invocation_request.request_byte_length).toBe(512);
});

test("Q1 rejects caller-minted trust, cloned plans and profile substitutions", () => {
  for (const attack of CALLER_PLANNING_TRUST_ATTACKS_V1) {
    const result = requestCertificationSelectedBoundedInvocationPlanV1(
      true,
      root,
      valid.request_identity,
      valid.request_value,
      valid.created_at_epoch_ms,
      valid.expires_at_epoch_ms,
      valid.evaluated_at_epoch_ms,
      attack.claim,
    );
    expect(result).toMatchObject({
      reason: "planning_request_shape_invalid",
      status: "rejected",
    });
    expect(verifyCertificationSelectedBoundedInvocationPlanV1(attack.claim)).toMatchObject({
      reason: "private_planning_provenance_missing",
      status: "rejected",
    });
  }
  const issued = planValid();
  const clone = structuredClone(issued.plan);
  expect(verifyCertificationSelectedBoundedInvocationPlanV1(clone)).toMatchObject({
    reason: "private_planning_provenance_missing",
    status: "rejected",
  });
  for (const attack of PLAN_SUBSTITUTIONS_V1) {
    const changed = structuredClone(issued.plan) as JsonObject;
    const binding = changed.binding as JsonObject;
    const profile = binding.runtime_profile as JsonObject;
    profile[attack.field] = attack.value;
    expect(verifyCertificationSelectedBoundedInvocationPlanV1(changed)).toMatchObject({
      reason: "private_planning_provenance_missing",
      status: "rejected",
    });
  }
});

test("Q1 consumes no caller hooks and primitive capture cannot change after issuance", () => {
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
      true, root, "hook-free-request", candidate,
      valid.created_at_epoch_ms, valid.expires_at_epoch_ms,
      valid.evaluated_at_epoch_ms,
    );
    expect(result).toMatchObject({
      reason: "invocation_request_type_invalid",
      status: "rejected",
    });
  }
  expect(hooks).toBe(0);

  let captured = "immutable-primitive-request";
  const issued = planValid("capture-once-request", captured);
  captured = "changed-after-capture";
  expect(JSON.stringify(issued)).not.toContain(captured);
  expect(issued.plan?.binding.invocation_request.canonical_request_digest).toBe(
    sha256(canonicalJson({ encoding: "utf8_primitive_v1", value: "immutable-primitive-request" })),
  );
});

test("Q1 public surface exposes no mint, execution or live capability", () => {
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
  expect(source.match(/requestCertificationGatedRuntimeSelectionV1\(/g)).toHaveLength(1);
  expect(source.match(/verifyCertificationGatedRuntimeSelectionV1\(/g)).toHaveLength(1);
  expect(source).not.toMatch(/export .*?(mint|factory|register|upgrade|execute|invoke)/i);
  expect(source).not.toMatch(/child_process|docker|postgres|migration|writeFile|fetch\(|process\.env/i);
  expect(source).not.toMatch(/callback|\.then\(|\.call\(|\.apply\(/i);
});

test("Q1 fixture is zero-import and N2A/O1/P1 authority bytes remain unchanged", () => {
  expect(readFileSync(join(root, fixturePath), "utf8")).not.toMatch(
    /\b(?:import|require)\b/,
  );
  const expectedHashes = new Map([
    ["lib/action-661j5n2a-runtime-certification-consumer-v2.mjs", "110a919401aee396508ba6d393132ed41e400343ea209559cdc1003eba4f69c5"],
    ["lib/action-661j5o1-certification-runtime-admission-authority.mjs", "2000e75bd80d3f1f7e58042e1b4f68ca1bac14a80c51aeba259fbd0fe245cfc3"],
    ["lib/action-661j5p1-certification-gated-runtime-selection.mjs", "fba8d2f3b6178bef3e270453e4a111704c9bc7dc2a76af749b04632c5d0b1f9e"],
  ]);
  for (const [path, expected] of expectedHashes) {
    expect(sha256(readFileSync(join(root, path)))).toBe(expected);
  }
});

test("Q1 golden report binds every non-self artifact and frozen identity", () => {
  const report = JSON.parse(
    readFileSync(join(root, goldenReportPath), "utf8"),
  ) as GoldenReport;
  expect(report.artifact_contract.artifact_count).toBe(5);
  expect(report.artifact_contract.artifacts).toHaveLength(5);
  for (const artifact of report.artifact_contract.artifacts) {
    if (artifact.self_digest_included === false) continue;
    const bytes = readFileSync(join(root, artifact.path));
    expect(bytes.byteLength, artifact.path).toBe(artifact.byte_length);
    expect(sha256(bytes), artifact.path).toBe(artifact.sha256);
  }
  expect(report.golden).toEqual({
    canonical_request_digest:
      BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.canonical_request_digest,
    plan_identity_digest:
      BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.plan_identity_digest,
    request_identity_digest:
      BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.request_identity_digest,
    runner_identity_digest:
      BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.runner_identity_digest,
  });
  expect(report.safety).toMatchObject({
    plan_runtime_authority: false,
    production_impact: false,
    runtime_execution_performed: false,
  });
});

test("Q1 is deterministic across processes and time zones", () => {
  const script = [
    `import {requestCertificationSelectedBoundedInvocationPlanV1 as plan} from ${JSON.stringify(pathToFileURL(join(root, modulePath)).href)};`,
    `const result=plan(true,${JSON.stringify(root)},${JSON.stringify(valid.request_identity)},${JSON.stringify(valid.request_value)},${valid.created_at_epoch_ms},${valid.expires_at_epoch_ms},${valid.evaluated_at_epoch_ms});`,
    "process.stdout.write(JSON.stringify({identity:result.plan_identity_digest,status:result.status}));",
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
  expect(JSON.parse(outputs[0])).toEqual({
    identity: BOUNDED_INVOCATION_PLAN_EXPECTATIONS_V1.plan_identity_digest,
    status: "planned",
  });
});
