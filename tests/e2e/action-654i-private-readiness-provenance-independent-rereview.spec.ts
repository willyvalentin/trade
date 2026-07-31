import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { hashAction650sCanonicalValue } from "../../lib/action-650s-execution-identity";
import {
  runAction653sNonExportableAuthorityInstruction,
  type Action653sInstructionResult,
} from "../../lib/action-653s-non-exportable-authority-transaction";
import { runAction654aTransportInertDispatchReadiness } from "../../lib/action-654a-transport-inert-dispatch-readiness";
import * as action654hRuntime from "../../lib/action-654h-private-readiness-provenance";
import { runAction654hPrivateReadinessComposition } from "../../lib/action-654h-private-readiness-provenance";
import golden from "../../docs/action-654h-private-readiness-provenance-golden-report.json";
import {
  action654hPlainFixture,
  runAction654hPlainFixture,
} from "../fixtures/action-654h-private-readiness-provenance-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;
const authorityRef =
  "refs/codex-preservation/action-654h-private-non-reconstituting-readiness-provenance";
const authorityObject = "c966f467a1985baace65ec4a4c3d409f9e59844c";
const authorityTree = "30f2b12af76e7aaa0a890a0434a1ac9d09f7389c";
const authorityParent = "4c834e9818308fb79b579d90705dd91e7fc010a7";
const normativePaths = [
  "docs/action-654h-private-readiness-provenance-contract.md",
  "docs/action-654h-private-readiness-provenance-golden-report.json",
  "lib/action-654h-private-readiness-provenance.ts",
  "tests/e2e/action-654h-private-readiness-provenance.spec.ts",
  "tests/fixtures/action-654h-private-readiness-provenance-fixtures.ts",
] as const;

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function exactCombinedDigest(paths: readonly string[]) {
  const hash = createHash("sha256");
  for (const path of [...paths].sort()) {
    hash.update(path, "utf8");
    hash.update(Buffer.from([0]));
    hash.update(readFileSync(resolve(root, path)));
    hash.update(Buffer.from([0]));
  }
  return hash.digest("hex");
}

function runV5(idempotencyKey: string) {
  return runAction653sNonExportableAuthorityInstruction(enabled, {
    request_version: "action_653s_plain_instruction_request_v1",
    operation: "action_653s_prepare_synthetic_instruction",
    idempotency_key: idempotencyKey,
    observed_at: "2026-07-29T10:00:02.000000000Z",
  });
}

function expectReadbackZero(
  result: ReturnType<typeof runAction654hPrivateReadinessComposition>,
) {
  expect(result.effects).toMatchObject({
    digest_operations: 0,
    v5_invocations: 0,
    v5_establishments: 0,
    v5_readbacks: 0,
    v5_reconstitutions: 0,
    capsule_mints: 0,
    capsule_reads: 0,
    readiness_classifications: 0,
    confirmation_consumptions: 0,
  });
}

function copiedV5FromFreshProcess(key: string): Action653sInstructionResult {
  const output = execFileSync(
    resolve(root, "node_modules/.bin/playwright"),
    [
      "test",
      "tests/e2e/action-654i-private-readiness-provenance-independent-rereview.spec.ts",
      "--grep",
      "isolated independent V5 producer",
      "--reporter=line",
      "--workers=1",
      "--output",
      `/private/tmp/action-654i-v5-producer-${key}`,
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        ACTION654I_V5_KEY: key,
        PLAYWRIGHT_SKIP_WEB_SERVER: "true",
      },
      encoding: "utf8",
    },
  );
  const marker = output.split("\n").find((line) => line.includes("ACTION654I_V5:"));
  if (!marker) throw new Error("independent V5 marker missing");
  return JSON.parse(
    Buffer.from(marker.replace(/^.*ACTION654I_V5:/, "").trim(), "base64").toString("utf8"),
  ) as Action653sInstructionResult;
}

test("rebuilds the exact frozen authority object, tree, parent, paths, and digest", () => {
  expect(execFileSync("git", ["rev-parse", authorityRef], { cwd: root, encoding: "utf8" }).trim())
    .toBe(authorityObject);
  expect(execFileSync("git", ["rev-parse", `${authorityRef}^{tree}`], { cwd: root, encoding: "utf8" }).trim())
    .toBe(authorityTree);
  expect(execFileSync("git", ["rev-parse", `${authorityRef}^`], { cwd: root, encoding: "utf8" }).trim())
    .toBe(authorityParent);
  expect(execFileSync("git", ["diff-tree", "--no-commit-id", "--name-only", "-r", authorityRef], {
    cwd: root,
    encoding: "utf8",
  }).trim().split("\n").sort()).toEqual([...normativePaths].sort());
  expect(exactCombinedDigest(normativePaths)).toBe(
    "0eb818a2dbb6dd4a2923fa90c256189ba05a5567d9b0db77a807d9769f4d7941",
  );
});

test("reproduces 654G-M1 against 654A in a fresh store", () => {
  test.setTimeout(90_000);
  const key = "action_653s_654i_old_m1";
  const copied = copiedV5FromFreshProcess(key);
  const attacked = runAction654aTransportInertDispatchReadiness(enabled, {
    v5_instruction_result: copied,
    evaluated_at: "2026-07-29T10:05:00.000000000Z",
  });
  expect(attacked.readiness_status).toBe("ready");
  expect(attacked.effects.v5_authority_readbacks).toBe(1);
  expect(runV5(key).idempotent_replay).toBe(true);
});

test("same copied-result attack is closed by 654H without V5 store mutation", () => {
  test.setTimeout(90_000);
  const key = "action_653s_654i_closed_m1";
  const copied = copiedV5FromFreshProcess(key);
  const rejected = runAction654hPrivateReadinessComposition(enabled, copied);
  expect(["not_eligible", "unmappable"]).toContain(rejected.readiness_status);
  expectReadbackZero(rejected);
  const genuine = runV5(key);
  expect(genuine.instruction_status).toBe("prepared");
  expect(genuine.idempotent_replay).toBe(false);
  expect(genuine.effects.private_composition_transactions).toBe(1);
  expect(genuine.effects.private_confirmation_consumptions).toBe(1);
});

test("serialized, recomputed, nested, and contract-substituted V5 results stop before all work", () => {
  const genuine = runV5("action_653s_654i_plain_attacks");
  const serialized = JSON.parse(JSON.stringify(genuine)) as Record<string, unknown>;
  const recomputed = structuredClone(serialized);
  recomputed.terminal_digest = `forged_${hashAction650sCanonicalValue(recomputed)}`;
  for (const input of [
    serialized,
    recomputed,
    { ...action654hPlainFixture("action_654h_nested_v5"), v5_instruction_result: genuine },
    { ...action654hPlainFixture("action_654h_foreign_contract"), contract_version: genuine.contract_version },
  ]) {
    const result = runAction654hPrivateReadinessComposition(enabled, input);
    expect(result.readiness_status).not.toBe("ready");
    expectReadbackZero(result);
  }
});

test("classifier body has no V5 import, call, readback, restore, or reconstitution path", () => {
  const implementation = source("lib/action-654h-private-readiness-provenance.ts");
  const classifierStart = implementation.indexOf("function classifyPrivateSnapshot");
  const classifierEnd = implementation.indexOf("/**", classifierStart);
  expect(classifierStart).toBeGreaterThan(0);
  expect(classifierEnd).toBeGreaterThan(classifierStart);
  const classifier = implementation.slice(classifierStart, classifierEnd);
  expect(classifier).not.toMatch(/Action653s|runAction653s|v5Operation|readback|restore|reconstitut/i);
  expect(implementation).not.toContain("rebuildAndVerifyV5");
  expect(implementation.match(/runAction653sNonExportableAuthorityInstruction\s*\(/g)).toHaveLength(1);
});

test("private composition callsite is after public validation and before private capsule mint", () => {
  const implementation = source("lib/action-654h-private-readiness-provenance.ts");
  const validation = implementation.indexOf("const validated = validateInput");
  const existing = implementation.indexOf("const existing = storedCompositions.get");
  const establishment = implementation.indexOf(
    "const established = runAction653sNonExportableAuthorityInstruction",
  );
  const snapshot = implementation.indexOf("const privateSnapshot = privateSnapshotFromEstablishedV5");
  const capsule = implementation.indexOf("const capsule = mintPrivateCapsule");
  const classifier = implementation.indexOf("const envelope = classifyPrivateSnapshot");
  expect(validation).toBeLessThan(existing);
  expect(existing).toBeLessThan(establishment);
  expect(establishment).toBeLessThan(snapshot);
  expect(snapshot).toBeLessThan(capsule);
  expect(capsule).toBeLessThan(classifier);
});

test("runtime and source exports contain no privileged authority or capsule surface", () => {
  expect(Object.keys(action654hRuntime)).toEqual([
    "runAction654hPrivateReadinessComposition",
  ]);
  const implementation = source("lib/action-654h-private-readiness-provenance.ts");
  expect(implementation).not.toMatch(
    /export\s+(?:function|const|class)\s+[^\n]*(?:capsule|mint|factory|registrar|issuer|ticket|grant|handle)/i,
  );
  const fixture = source("tests/fixtures/action-654h-private-readiness-provenance-fixtures.ts");
  expect(fixture).not.toMatch(/action-653s|capsule|mint|registrar|issuer|ticket|grant|handle/i);
});

test("capsule and private composition state cannot escape through public output", () => {
  const result = runAction654hPlainFixture("action_654h_review_escape");
  const stack: unknown[] = [result];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const value = stack.pop();
    if (!value || typeof value !== "object" || seen.has(value)) continue;
    seen.add(value);
    expect(Object.getOwnPropertySymbols(value)).toEqual([]);
    expect([Object.prototype, Array.prototype]).toContain(Object.getPrototypeOf(value));
    for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(value))) {
      expect(descriptor.get).toBeUndefined();
      expect(descriptor.set).toBeUndefined();
      expect(typeof descriptor.value).not.toBe("function");
      stack.push(descriptor.value);
    }
  }
});

test("invalid compositions consume nothing and exact expiry boundaries remain strict", () => {
  for (const input of [
    null,
    {},
    { ...action654hPlainFixture("action_654h_review_expiry"), evaluated_at: "2026-07-29T10:10:00.000000000Z" },
    { ...action654hPlainFixture("action_654h_review_expiry_plus"), evaluated_at: "2026-07-29T10:10:00.000000001Z" },
    { ...action654hPlainFixture("action_654h_review_session"), session_identity: "caller-session" },
  ]) {
    const result = runAction654hPrivateReadinessComposition(enabled, input);
    expect(result.readiness_status).not.toBe("ready");
    expectReadbackZero(result);
  }
  const minusOne = runAction654hPlainFixture("action_654h_review_expiry_minus", {
    evaluated_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(minusOne.readiness_status).toBe("ready");
  expect(minusOne.effects.confirmation_consumptions).toBe(1);
});

test("valid composition establishes V5 and readiness once from canonical original input", () => {
  const result = runAction654hPlainFixture("action_654h_review_single");
  expect(result.readiness_status).toBe("ready");
  expect(result.effects).toMatchObject({
    v5_invocations: 1,
    v5_establishments: 1,
    v5_readbacks: 0,
    v5_reconstitutions: 0,
    capsule_mints: 1,
    capsule_reads: 1,
    readiness_classifications: 1,
    confirmation_consumptions: 1,
  });
  expect(result.v5_instruction_result?.idempotent_replay).toBe(false);
});

test("duplicate is idempotent while conflict and cross-session input fail before V5", () => {
  const input = action654hPlainFixture("action_654h_review_duplicate");
  const first = runAction654hPrivateReadinessComposition(enabled, input);
  const duplicate = runAction654hPrivateReadinessComposition(enabled, structuredClone(input));
  expect(first.readiness_status).toBe("ready");
  expect(duplicate).toMatchObject({
    readiness_status: "ready",
    terminal_reason: "exact_duplicate_idempotent",
    idempotent_replay: true,
  });
  expect(duplicate.effects).toMatchObject({
    v5_invocations: 0,
    capsule_mints: 0,
    readiness_classifications: 0,
    confirmation_consumptions: 0,
  });
  const conflict = runAction654hPrivateReadinessComposition(enabled, {
    ...input,
    evaluated_at: "2026-07-29T10:05:00.000000001Z",
  });
  expect(conflict.readiness_status).toBe("conflicting");
  expect(conflict.effects.v5_invocations).toBe(0);
  expect(conflict.effects.confirmation_consumptions).toBe(0);
  expectReadbackZero(runAction654hPrivateReadinessComposition(enabled, {
    ...input,
    session_identity: "cross-session",
  }));
});

test("proxy, getter, callback, cycle, mutation, and budget attacks execute zero hooks", () => {
  let hooks = 0;
  const getter = action654hPlainFixture("action_654h_review_getter") as unknown as Record<string, unknown>;
  Object.defineProperty(getter, "observed_at", {
    enumerable: true,
    get() { hooks += 1; return "2026-07-29T10:00:02Z"; },
  });
  expectReadbackZero(runAction654hPrivateReadinessComposition(enabled, getter));

  const proxy = new Proxy(action654hPlainFixture("action_654h_review_proxy"), {
    get() { hooks += 1; throw new Error("must not run"); },
    ownKeys() { hooks += 1; throw new Error("must not run"); },
    getOwnPropertyDescriptor() { hooks += 1; throw new Error("must not run"); },
  });
  expectReadbackZero(runAction654hPrivateReadinessComposition(enabled, proxy));

  const callback = { ...action654hPlainFixture("action_654h_review_callback"), callback: () => { hooks += 1; } };
  expectReadbackZero(runAction654hPrivateReadinessComposition(enabled, callback));

  const cycle = action654hPlainFixture("action_654h_review_cycle") as unknown as Record<string, unknown>;
  cycle.self = cycle;
  expectReadbackZero(runAction654hPrivateReadinessComposition(enabled, cycle));

  const budget = action654hPlainFixture("action_654h_review_budget") as unknown as Record<string, unknown>;
  for (let index = 0; index < 300; index += 1) budget[`extra_${index}`] = index;
  expectReadbackZero(runAction654hPrivateReadinessComposition(enabled, budget));
  expect(hooks).toBe(0);

  const mutable = action654hPlainFixture("action_654h_review_mutation") as unknown as Record<string, unknown>;
  const result = runAction654hPrivateReadinessComposition(enabled, mutable);
  mutable.evaluated_at = "2026-07-29T10:09:59.999999999Z";
  expect(result.readiness_envelope?.evaluated_at).toBe("2026-07-29T10:05:00.000000000Z");
});

test("readiness identity, envelope digest, and terminal digest rebuild independently", () => {
  const result = runAction654hPlainFixture("action_654h_review_rebuild");
  const envelope = result.readiness_envelope!;
  expect(envelope.readiness_identity).toBe(
    `action_654h_private_readiness_identity_${hashAction650sCanonicalValue({
      execution_identity: envelope.execution_identity,
      instruction_identity: envelope.instruction_identity,
      session_identity: envelope.session_identity,
      idempotency_identity: envelope.idempotency_identity,
      evaluated_at: envelope.evaluated_at,
    })}`,
  );
  const { readiness_digest: readinessDigest, ...unsignedEnvelope } = envelope;
  expect(readinessDigest).toBe(
    `action_654h_private_readiness_envelope_${hashAction650sCanonicalValue(unsignedEnvelope)}`,
  );
  const { terminal_digest: terminalDigest, ...unsignedResult } = result;
  expect(terminalDigest).toBe(
    `action_654h_private_readiness_terminal_${hashAction650sCanonicalValue(unsignedResult)}`,
  );
});

test("transport flags are immutable false and transport/submission/fill capabilities are absent", () => {
  const result = runAction654hPlainFixture("action_654h_review_transport");
  expect(result.safety).toEqual(golden.safety);
  expect(result.readiness_envelope).toMatchObject({
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
  });
  const implementation = source("lib/action-654h-private-readiness-provenance.ts");
  expect(implementation).not.toMatch(
    /\bfetch\s*\(|WebSocket|XMLHttpRequest|node:(?:child_process|net|tls|http|https|dgram)|createClient|supabase|puppeteer|playwright|bankid|broker_url|account_id|session_cookie/i,
  );
  expect(result.effects).toMatchObject({
    transport_adapters: 0,
    transport_requests: 0,
    broker_submissions: 0,
    provider_calls: 0,
    credential_reads: 0,
    browser_or_cdp_operations: 0,
    database_reads: 0,
    database_writes: 0,
    process_spawns: 0,
    trade_mutations: 0,
  });
});

test("synthetic replay and diagnostic audit interoperability remain synthetic-only", () => {
  const result = runAction654hPlainFixture("action_654h_review_interop");
  const established = result.v5_instruction_result!;
  expect(established.synthetic_replay).toMatchObject({ accepted: true, synthetic_only: true });
  expect(established.diagnostic_audit_handoff).toMatchObject({
    diagnostic_only: true,
    real_broker_evidence: false,
    performance_eligible: false,
    automatic_execution_allowed: false,
  });
  expect(result.readiness_envelope?.synthetic_replay_identity)
    .toBe(established.synthetic_replay?.evidence_digest);
  expect(result.readiness_envelope?.diagnostic_audit_identity)
    .toBe(established.diagnostic_audit_handoff?.handoff_digest);
});

test("isolated independent V5 producer", () => {
  const key = process.env.ACTION654I_V5_KEY;
  test.skip(!key, "probe-only test");
  const result = runV5(key!);
  console.log(`ACTION654I_V5:${Buffer.from(JSON.stringify(result)).toString("base64")}`);
});

test("isolated independent timezone probe", () => {
  const clock = process.env.ACTION654I_CLOCK as
    | "utc_a"
    | "stockholm"
    | "new_york"
    | undefined;
  test.skip(!clock, "probe-only test");
  const result = runAction654hPlainFixture("action_654h_review_timezone", { clock });
  console.log(`ACTION654I_TZ:${JSON.stringify({
    status: result.readiness_status,
    input: result.observed_input_digest,
    identity: result.readiness_envelope?.readiness_identity,
    digest: result.readiness_envelope?.readiness_digest,
    instruction: result.readiness_envelope?.instruction_identity,
  })}`);
});

test("UTC, Stockholm, and New York fresh processes produce identical canonical evidence", () => {
  test.setTimeout(120_000);
  const rows = ([
    ["utc_a", "UTC"],
    ["stockholm", "Europe/Stockholm"],
    ["new_york", "America/New_York"],
  ] as const).map(([clock, tz]) => {
    const output = execFileSync(
      resolve(root, "node_modules/.bin/playwright"),
      [
        "test",
        "tests/e2e/action-654i-private-readiness-provenance-independent-rereview.spec.ts",
        "--grep",
        "isolated independent timezone probe",
        "--reporter=line",
        "--workers=1",
        "--output",
        `/private/tmp/action-654i-timezone-${clock}`,
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          TZ: tz,
          ACTION654I_CLOCK: clock,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
        },
        encoding: "utf8",
      },
    );
    const marker = output.split("\n").find((line) => line.includes("ACTION654I_TZ:"));
    if (!marker) throw new Error("timezone marker missing");
    return marker.replace(/^.*ACTION654I_TZ:/, "").trim();
  });
  expect(new Set(rows).size).toBe(1);
});
