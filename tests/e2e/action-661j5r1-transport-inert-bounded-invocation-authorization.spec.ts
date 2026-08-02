import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  BOUNDED_INVOCATION_AUTHORIZATION_POLICY_DIGEST_V1,
  BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1,
  BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
  requestTransportInertBoundedInvocationAuthorizationV1,
  verifyTransportInertBoundedInvocationAuthorizationV1,
} from "../../lib/action-661j5r1-transport-inert-bounded-invocation-authorization.mjs";
import {
  AUTHORIZATION_SUBSTITUTIONS_V1,
  BOUNDED_INVOCATION_AUTHORIZATION_EXPECTATIONS_V1,
  CALLER_AUTHORIZATION_TRUST_ATTACKS_V1,
  INVALID_AUTHORIZATION_BOUNDARIES_V1,
  VALID_BOUNDED_INVOCATION_AUTHORIZATION_REQUEST_V1,
} from "./action-661j5r1-transport-inert-bounded-invocation-authorization-fixtures.mjs";

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonObject | JsonPrimitive | JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type GoldenArtifact = {
  byte_length?: number;
  path: string;
  role: string;
  self_digest_included?: boolean;
  sha256?: string;
};
type GoldenReport = {
  artifact_contract: { artifact_count: number; artifacts: GoldenArtifact[] };
  golden: Record<string, string>;
  safety: Record<string, boolean>;
};
type InvalidAuthorizationBoundary = {
  attack_id: string;
  attempt: number;
  budget: number;
  evaluated: number;
  expires: number;
};

const root = process.cwd();
const modulePath =
  "lib/action-661j5r1-transport-inert-bounded-invocation-authorization.mjs";
const fixturePath =
  "tests/e2e/action-661j5r1-transport-inert-bounded-invocation-authorization-fixtures.mjs";
const goldenReportPath =
  "docs/action-661j5r1-transport-inert-bounded-invocation-authorization-golden-report.json";
const valid = VALID_BOUNDED_INVOCATION_AUTHORIZATION_REQUEST_V1;
const expected = BOUNDED_INVOCATION_AUTHORIZATION_EXPECTATIONS_V1;

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
  return Object.isFrozen(value) &&
    Object.values(value).every((nested) => isDeepFrozen(nested, seen));
}

function authorize(
  requestIdentity = valid.request_identity,
  requestValue = valid.request_value,
  createdAt = valid.created_at_epoch_ms,
  expiresAt = valid.expires_at_epoch_ms,
  evaluatedAt = valid.evaluated_at_epoch_ms,
  budget = valid.invocation_budget,
  attempt = valid.attempt_ordinal,
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

test("R1 freezes an exact transport-inert authorization policy", () => {
  expect(
    sha256(canonicalJson(BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1 as JsonObject)),
  ).toBe(BOUNDED_INVOCATION_AUTHORIZATION_POLICY_DIGEST_V1);
  expect(BOUNDED_INVOCATION_AUTHORIZATION_POLICY_DIGEST_V1).toBe(
    expected.authorization_policy_digest,
  );
  expect(BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1).toMatchObject({
    default_authorization: "off",
    max_attempt_ordinal: 4,
    max_freshness_ms: 120000,
    max_invocation_budget: 8,
    min_attempt_ordinal: 1,
    min_freshness_ms: 1,
    min_invocation_budget: 1,
    receipt_runtime_authority: false,
    runtime_execution_allowed: false,
    transport_access_allowed: false,
  });
  expect(isDeepFrozen(BOUNDED_INVOCATION_AUTHORIZATION_POLICY_V1)).toBe(true);
});

test("R1 default-off performs zero planning, digest and authorization work", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("get_executed"); },
    getPrototypeOf() { hooks += 1; throw new Error("prototype_executed"); },
    ownKeys() { hooks += 1; throw new Error("own_keys_executed"); },
  });
  const result = requestTransportInertBoundedInvocationAuthorizationV1(
    false, hostile, hostile, hostile, hostile, hostile, hostile, hostile, hostile,
  );
  expect(result).toEqual({
    authorization_identity_digest: null,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    counts: {
      authorization_digests_computed: 0,
      authorization_issuances: 0,
      plan_requests: 0,
      plan_verifications: 0,
    },
    failure_identity_digest: null,
    reason: "bounded_invocation_authorization_disabled",
    receipt: null,
    status: "not_authorized",
  });
  expect(hooks).toBe(0);
});

test("R1 internalizes Q once and binds the full O/P/Q authority chain", () => {
  const result = authorize();
  expect(result).toMatchObject({
    authorization_identity_digest: expected.authorization_identity_digest,
    counts: {
      authorization_digests_computed: 2,
      authorization_issuances: 1,
      plan_requests: 1,
      plan_verifications: 1,
    },
    failure_identity_digest: null,
    reason: "bounded_invocation_privately_authorized",
    status: "authorized",
  });
  expect(result.receipt?.binding.admission.admission_identity_digest).toBe(
    expected.admission_identity_digest,
  );
  expect(result.receipt?.binding.selection.selection_identity_digest).toBe(
    expected.selection_identity_digest,
  );
  expect(result.receipt?.binding.planning.plan_identity_digest).toBe(
    expected.plan_identity_digest,
  );
  expect(result.receipt?.binding.runtime_profile).toMatchObject({
    family_version: expected.runtime_family,
    runner_identity_digest: expected.runner_identity_digest,
  });
  expect(result.receipt?.binding.inventory).toEqual({
    fixture_count: 28,
    scenario_count: 14,
    shard_count: 28,
  });
  expect(isDeepFrozen(result)).toBe(true);
});

test("R1 independently reproduces request, attempt and authorization identities", () => {
  const result = authorize();
  const receipt = result.receipt as unknown as JsonObject;
  const binding = receipt.binding as JsonObject;
  expect(sha256(canonicalJson({
    encoding: "utf8_primitive_v1",
    value: valid.request_value,
  }))).toBe(expected.canonical_request_digest);
  expect(sha256(canonicalJson({
    request_identity: valid.request_identity,
    version: "action_661j5q1_certification_selected_bounded_invocation_plan_v1",
  }))).toBe(expected.request_identity_digest);
  expect(sha256(canonicalJson({
    attempt_ordinal: valid.attempt_ordinal,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    request_identity_digest: expected.request_identity_digest,
  }))).toBe(expected.attempt_identity_digest);
  expect(sha256(canonicalJson({
    authorization_kind: "transport_inert_bounded_invocation_decision",
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    binding,
    status: "authorized",
  }))).toBe(expected.authorization_identity_digest);
  expect(JSON.stringify(result)).not.toContain(valid.request_identity);
  expect(JSON.stringify(result)).not.toContain(valid.request_value);
});

test("R1 receipt has a closed deep-frozen non-authority schema", () => {
  const receipt = authorize().receipt;
  expect(Object.keys(receipt ?? {}).sort()).toEqual([
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
  expect(Object.keys(receipt?.binding ?? {}).sort()).toEqual([
    "admission", "attempt", "authorization_policy", "certification",
    "freshness", "inventory", "invocation_budget", "invocation_request",
    "planning", "runtime_profile", "selection",
  ]);
  expect(receipt).toMatchObject({
    executable_capabilities: [],
    privileged_capabilities: [],
    runtime_authority: false,
    runtime_execution_allowed: false,
    status: "authorized",
    transport_access_allowed: false,
  });
  expect(isDeepFrozen(receipt)).toBe(true);
  expect(verifyTransportInertBoundedInvocationAuthorizationV1(receipt)).toEqual({
    authorization_identity_digest: expected.authorization_identity_digest,
    authorization_version: BOUNDED_INVOCATION_AUTHORIZATION_VERSION_V1,
    reason: "private_authorization_provenance_verified",
    runtime_authority: false,
    runtime_execution_allowed: false,
    status: "authorized",
    transport_access_allowed: false,
  });
});

test("R1 exact replay is idempotent and budget expansion conflicts fail closed", () => {
  const first = authorize();
  expect(authorize()).toBe(first);
  const conflict = authorize(
    valid.request_identity,
    valid.request_value,
    valid.created_at_epoch_ms,
    valid.expires_at_epoch_ms,
    valid.evaluated_at_epoch_ms,
    valid.invocation_budget + 1,
  );
  expect(conflict).toMatchObject({
    authorization_identity_digest: null,
    reason: "authorization_attempt_identity_conflict",
    receipt: null,
    status: "rejected",
  });
  expect(conflict.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
});

test("R1 rejects budget, attempt and freshness violations before Q", () => {
  const failures: ReturnType<
    typeof requestTransportInertBoundedInvocationAuthorizationV1
  >[] = (INVALID_AUTHORIZATION_BOUNDARIES_V1 as InvalidAuthorizationBoundary[])
    .map((attack) => requestTransportInertBoundedInvocationAuthorizationV1(
      true, root, `${attack.attack_id}-authorization`, valid.request_value,
      valid.created_at_epoch_ms, attack.expires, attack.evaluated,
      attack.budget, attack.attempt,
    ));
  expect(failures.map((failure) => failure.reason)).toEqual([
    "authorization_budget_boundary_invalid",
    "authorization_budget_boundary_invalid",
    "authorization_attempt_ordinal_invalid",
    "authorization_attempt_ordinal_invalid",
    "authorization_freshness_boundary_invalid",
    "authorization_freshness_boundary_invalid",
  ]);
  for (const failure of failures) {
    expect(failure.counts.plan_requests).toBe(0);
    expect(failure.counts.plan_verifications).toBe(0);
    expect(failure.counts.authorization_issuances).toBe(0);
    expect(failure.failure_identity_digest).toMatch(/^[0-9a-f]{64}$/);
  }
  expect(new Set(failures.map((failure) => failure.failure_identity_digest)).size)
    .toBe(failures.length);
});

test("R1 rejects caller-minted plans and all reconstructed receipts", () => {
  for (const attack of CALLER_AUTHORIZATION_TRUST_ATTACKS_V1) {
    const result = requestTransportInertBoundedInvocationAuthorizationV1(
      true, root, valid.request_identity, valid.request_value,
      valid.created_at_epoch_ms, valid.expires_at_epoch_ms,
      valid.evaluated_at_epoch_ms, valid.invocation_budget,
      valid.attempt_ordinal, attack.claim,
    );
    expect(result).toMatchObject({
      reason: "authorization_request_shape_invalid",
      status: "rejected",
    });
    expect(verifyTransportInertBoundedInvocationAuthorizationV1(attack.claim))
      .toMatchObject({
        reason: "private_authorization_provenance_missing",
        status: "rejected",
      });
  }
  const issued = authorize();
  expect(verifyTransportInertBoundedInvocationAuthorizationV1(
    structuredClone(issued.receipt),
  )).toMatchObject({
    reason: "private_authorization_provenance_missing",
    status: "rejected",
  });
  for (const [path, value] of AUTHORIZATION_SUBSTITUTIONS_V1) {
    const changed = structuredClone(issued.receipt) as JsonObject;
    setPath(changed, path as string, value as JsonValue);
    expect(verifyTransportInertBoundedInvocationAuthorizationV1(changed))
      .toMatchObject({
        reason: "private_authorization_provenance_missing",
        status: "rejected",
      });
  }
});

test("R1 primitive capture executes no caller hooks and leaks no caller failures", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("secret_getter_message"); },
    getPrototypeOf() { hooks += 1; throw new Error("secret_prototype_message"); },
    ownKeys() { hooks += 1; throw new Error("secret_keys_message"); },
  });
  const accessor = Object.defineProperty({}, "value", {
    get() { hooks += 1; throw new Error("secret_accessor_message"); },
  });
  const callback = () => { hooks += 1; throw new Error("secret_callback_message"); };
  for (const candidate of [hostile, accessor, callback]) {
    const result = requestTransportInertBoundedInvocationAuthorizationV1(
      true, root, "hook-free-authorization", candidate,
      valid.created_at_epoch_ms, valid.expires_at_epoch_ms,
      valid.evaluated_at_epoch_ms, valid.invocation_budget,
      valid.attempt_ordinal,
    );
    expect(result.reason).toBe("authorization_request_type_invalid");
    expect(JSON.stringify(result)).not.toMatch(/secret_|hook-free-authorization/);
  }
  expect(hooks).toBe(0);
});

test("R1 public surface has no mint, transport, execution or dynamic runner capability", () => {
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
  expect(source.match(/requestCertificationSelectedBoundedInvocationPlanV1\(/g))
    .toHaveLength(1);
  expect(source.match(/verifyCertificationSelectedBoundedInvocationPlanV1\(/g))
    .toHaveLength(1);
  expect(source).not.toMatch(/export .*?(mint|factory|register|upgrade|execute)/i);
  expect(source).not.toMatch(
    /node:child_process|docker|postgres|writeFile|fetch\(|process\.env|\bimport\s*\(/i,
  );
  expect(source).not.toMatch(/callback|\.then\(|\.call\(|\.apply\(/i);
  expect([...source.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]))
    .toEqual([
      "node:crypto",
      "./action-661j5q1-certification-selected-bounded-invocation-plan.mjs",
    ]);
});

test("R1 fixture is zero-import and N/O/P/Q authority bytes remain unchanged", () => {
  expect(readFileSync(join(root, fixturePath), "utf8")).not.toMatch(
    /\b(?:import|require)\b/,
  );
  const expectedHashes = new Map([
    ["lib/action-661j5n2a-runtime-certification-consumer-v2.mjs", "110a919401aee396508ba6d393132ed41e400343ea209559cdc1003eba4f69c5"],
    ["lib/action-661j5o1-certification-runtime-admission-authority.mjs", "2000e75bd80d3f1f7e58042e1b4f68ca1bac14a80c51aeba259fbd0fe245cfc3"],
    ["lib/action-661j5p1-certification-gated-runtime-selection.mjs", "fba8d2f3b6178bef3e270453e4a111704c9bc7dc2a76af749b04632c5d0b1f9e"],
    ["lib/action-661j5q1-certification-selected-bounded-invocation-plan.mjs", "f547f17087a314fd8795b3de97750f04c1e21345cc2bc07a6cf9fe7cbccfe64e"],
  ]);
  for (const [path, expectedHash] of expectedHashes) {
    expect(sha256(readFileSync(join(root, path)))).toBe(expectedHash);
  }
});

test("R1 golden report binds all non-self artifacts and safety assertions", () => {
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
  expect(report.golden).toMatchObject({
    attempt_identity_digest: expected.attempt_identity_digest,
    authorization_identity_digest: expected.authorization_identity_digest,
    canonical_request_digest: expected.canonical_request_digest,
    plan_identity_digest: expected.plan_identity_digest,
    request_identity_digest: expected.request_identity_digest,
  });
  expect(report.safety).toMatchObject({
    authorization_receipt_runtime_authority: false,
    production_impact: false,
    runtime_execution_performed: false,
    transport_capability: false,
  });
});

test("R1 authorization is deterministic across processes and three time zones", () => {
  const script = [
    `import {requestTransportInertBoundedInvocationAuthorizationV1 as authorize} from ${JSON.stringify(pathToFileURL(join(root, modulePath)).href)};`,
    `const result=authorize(true,${JSON.stringify(root)},${JSON.stringify(valid.request_identity)},${JSON.stringify(valid.request_value)},${valid.created_at_epoch_ms},${valid.expires_at_epoch_ms},${valid.evaluated_at_epoch_ms},${valid.invocation_budget},${valid.attempt_ordinal});`,
    "process.stdout.write(JSON.stringify({attempt:result.receipt?.binding.attempt.attempt_identity_digest,identity:result.authorization_identity_digest,status:result.status}));",
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
  expect(JSON.parse(outputs[0])).toEqual({
    attempt: expected.attempt_identity_digest,
    identity: expected.authorization_identity_digest,
    status: "authorized",
  });
});
