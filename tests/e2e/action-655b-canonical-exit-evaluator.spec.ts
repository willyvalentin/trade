import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, test } from "@playwright/test";

import { evaluateAction655bCanonicalExitDecision } from "../../lib/action-655b-canonical-exit-evaluator";
import {
  action655bBoundaryInputs,
  action655bExpectedSerializedResults,
  action655bFrozenDigestVectors,
  action655bFrozenVectorFrames,
  action655bRuleInputs,
  action655bShortInputs,
  action655bTargetMatrixInputs,
  action655gFixtureTraversalMatrix,
  action655gReviewOracleCases,
  buildAction655bCanonicalInput,
  buildAction655bExactUtf8BudgetInput,
  canonicalizeAction655bFixture,
  digestAction655bFixture,
  mutateAction655bCanonicalInput,
  replaceAction655bRawToken,
} from "../fixtures/action-655b-canonical-exit-evaluator-fixtures";

const root = resolve(__dirname, "../..");
const productionPath = resolve(root, "lib/action-655b-canonical-exit-evaluator.ts");
const action655eCommit = "9e3120b47e06d0dec0dd4ae286a05c72da633b71";

function evaluateWithPreservedAction655e(inputs: readonly string[]) {
  const directory = mkdtempSync(join(tmpdir(), "action-655g-preserved-655e-"));
  const evaluatorPath = resolve(directory, "preserved-action-655e-evaluator.ts");
  try {
    writeFileSync(evaluatorPath, execFileSync("git", ["show", `${action655eCommit}:lib/action-655b-canonical-exit-evaluator.ts`], { cwd: root }));
    const probe = [
      `const evaluator=await import(${JSON.stringify(pathToFileURL(evaluatorPath).href)});`,
      `const inputs=JSON.parse(Buffer.from(${JSON.stringify(Buffer.from(JSON.stringify(inputs)).toString("base64"))},"base64").toString("utf8"));`,
      "console.log(JSON.stringify(inputs.map((input)=>evaluator.evaluateAction655bCanonicalExitDecision(input,true).invalid)));",
    ].join("");
    return JSON.parse(execFileSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", probe], {
      cwd: root,
      encoding: "utf8",
    })) as Array<{ error_code: string; error_path: string | null }>;
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

function decisionFrame(projection: Record<string, unknown>) {
  return {
    contract_version: "action_655a6_exit_decision_digest_v4",
    domain: "trade_management_exit_decision_digest_v3",
    projection,
  };
}

function baseDecisionProjection() {
  return {
    decision_authority: null,
    decision_identity: null,
    decision_priority: null,
    decision_reason: null,
    decision_status: null,
    invalid_error_code: null,
    invalid_error_path: null,
    noneligible_position_status: null,
    noneligible_reason: null,
    provenance_digest: null,
    recommended_quantity_units: null,
    recommended_stop_price_units: null,
    refusal_error_path: null,
    refusal_reason: null,
    result_kind: null,
    side_effects_performed: false,
  };
}

test("production runtime exports exactly the evaluator value", async () => {
  const runtime = await import("../../lib/action-655b-canonical-exit-evaluator");
  const callableRuntimeExports = Object.entries(runtime)
    .filter(([name, value]) => name !== "default" && name !== "module.exports" && typeof value === "function")
    .map(([name]) => name);
  expect(callableRuntimeExports).toEqual(["evaluateAction655bCanonicalExitDecision"]);
  const source = readFileSync(productionPath, "utf8");
  expect([...source.matchAll(/^export function\s+([A-Za-z0-9_]+)/gm)].map((match) => match[1])).toEqual([
    "evaluateAction655bCanonicalExitDecision",
  ]);
  expect(source).not.toMatch(/^export (?:const|class|let|var)\s+/m);
});

test("default-off returns deterministic verified-context refusal", () => {
  const result = evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.default_off);
  expect(result).toMatchObject({
    result_kind: "refused",
    provenance_digest: expect.stringMatching(/^[0-9a-f]{64}$/),
    refused: { refusal_reason: "disabled", error_path: null },
    side_effects_performed: false,
  });
  expect(Object.isFrozen(result)).toBe(true);
});

test("all seven frozen rules map to exact status reason priority and outputs", () => {
  const expected = {
    hard_stop: ["exit_full", "hard_stop", 1, "10", null],
    invalidation: ["exit_full", "invalidation", 2, "10", null],
    session_close: ["exit_full", "session_close", 3, "10", null],
    final_target: ["exit_full", "final_target", 4, "10", null],
    first_target_partial: ["exit_partial", "first_target_partial", 5, "4", null],
    profit_protection_stop_move: ["move_stop", "profit_protection_stop_move", 6, null, "100"],
    hold: ["hold", "hold", 7, null, null],
  } as const;
  for (const [name, input] of Object.entries(action655bRuleInputs)) {
    const result = evaluateAction655bCanonicalExitDecision(input, true);
    const [status, reason, priority, quantity, stop] = expected[name as keyof typeof expected];
    expect(result.result_kind, name).toBe("decision");
    expect(result.decision).toMatchObject({
      decision_status: status,
      decision_reason: reason,
      decision_priority: priority,
      recommended_quantity_units: quantity,
      recommended_stop_price_units: stop,
      side_effects_performed: false,
    });
  }
});

test("short favorable movement moves stop and short unfavorable movement holds", () => {
  expect(evaluateAction655bCanonicalExitDecision(action655bShortInputs.profit_protection, true).decision).toMatchObject({
    decision_reason: "profit_protection_stop_move",
    recommended_stop_price_units: "100",
  });
  expect(evaluateAction655bCanonicalExitDecision(action655bShortInputs.unfavorable_hold, true).decision).toMatchObject({
    decision_reason: "hold",
    decision_priority: 7,
  });
});

test("price equality has zero favorable movement and holds", () => {
  const input = buildAction655bCanonicalInput({ observation: { current_price_units: "100" } });
  expect(evaluateAction655bCanonicalExitDecision(input, true).decision).toMatchObject({ decision_reason: "hold" });
});

test("partial quantity rounds down to the exact lot without implicit precision", () => {
  const result = evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.tick_lot_rounding, true);
  expect(result.decision).toMatchObject({
    decision_reason: "first_target_partial",
    recommended_quantity_units: "4",
  });
});

test("non-representable partial quantity refuses without lower-priority fallback", () => {
  const result = evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.partial_not_representable, true);
  expect(result).toMatchObject({
    result_kind: "refused",
    refused: {
      refusal_reason: "quantity_rule_not_representable",
      error_path: "/position_snapshot/remaining_quantity_units",
    },
    side_effects_performed: false,
  });
});

test("overflow-sized integer and unsafe JSON integer are invalid", () => {
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.overflow_integer, true)).toMatchObject({
    result_kind: "invalid",
    invalid: { error_code: "numeric_domain_invalid", error_path: "/position_snapshot/total_quantity_units" },
  });
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.unsafe_version, true)).toMatchObject({
    result_kind: "invalid",
    invalid: { error_code: "numeric_domain_invalid", error_path: "/position_snapshot/position_version" },
  });
});

test("target nullability matrix is complete", () => {
  expect(evaluateAction655bCanonicalExitDecision(action655bTargetMatrixInputs.neither, true).result_kind).toBe("decision");
  expect(evaluateAction655bCanonicalExitDecision(action655bTargetMatrixInputs.target_1_only, true).result_kind).toBe("decision");
  expect(evaluateAction655bCanonicalExitDecision(action655bTargetMatrixInputs.both, true).result_kind).toBe("decision");
  expect(evaluateAction655bCanonicalExitDecision(action655bTargetMatrixInputs.target_2_only, true)).toMatchObject({
    result_kind: "invalid",
    invalid: { error_path: "/position_snapshot/target_2_price_units" },
  });
});

test("both declared noneligible statuses return closed non-authoritative evidence", () => {
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.noneligible_exit_pending, true)).toMatchObject({
    result_kind: "noneligible",
    noneligible: { position_status: "exit_pending", noneligible_reason: "position_exit_pending" },
  });
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.noneligible_closed, true)).toMatchObject({
    result_kind: "noneligible",
    noneligible: { position_status: "closed", noneligible_reason: "position_closed" },
  });
});

test("missing, malformed, noncanonical, and unknown input are total invalid results", () => {
  const missing = canonicalizeAction655bFixture({ contract_version: "action_655a6_exit_evaluation_input_v4" });
  expect(evaluateAction655bCanonicalExitDecision(missing, true)).toMatchObject({
    result_kind: "invalid",
    invalid: { error_code: "missing_required_input", error_path: "/position_snapshot" },
  });
  expect(evaluateAction655bCanonicalExitDecision("{", true)).toMatchObject({ result_kind: "invalid", invalid: { error_code: "canonical_form_invalid" } });
  expect(evaluateAction655bCanonicalExitDecision("{\"contract_version\": \"action_655a6_exit_evaluation_input_v4\"}", true)).toMatchObject({ result_kind: "invalid", invalid: { error_code: "canonical_form_invalid" } });
  const parsedCanonical = JSON.parse(action655bRuleInputs.hold) as Record<string, unknown>;
  const reordered = JSON.stringify({
    position_snapshot: parsedCanonical.position_snapshot,
    contract_version: parsedCanonical.contract_version,
    decision_requested_at: parsedCanonical.decision_requested_at,
    evaluation_request_identity: parsedCanonical.evaluation_request_identity,
    input_digest: parsedCanonical.input_digest,
    monitor_observation: parsedCanonical.monitor_observation,
  });
  expect(evaluateAction655bCanonicalExitDecision(reordered, true)).toMatchObject({ result_kind: "invalid", invalid: { error_code: "canonical_form_invalid" } });
  for (const field of ["policy", "policy_factory", "policy_id", "policy_selector", "registry"]) {
    const unknown = mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => { input[field] = {}; });
    expect(evaluateAction655bCanonicalExitDecision(unknown, true)).toMatchObject({
      result_kind: "invalid",
      invalid: { error_code: "schema_invalid", error_path: `/${field}` },
    });
  }
  expect(evaluateAction655bCanonicalExitDecision(action655bRuleInputs.hold, "true")).toMatchObject({
    result_kind: "invalid",
    invalid: { error_code: "schema_invalid", error_path: "/local_evaluation_enabled" },
  });
});

test("primitive capture rejects objects, accessors, functions, boxed strings, and proxies without property hooks", () => {
  let getterHooks = 0;
  let proxyHooks = 0;
  const accessor = Object.defineProperty({}, "input", { get() { getterHooks += 1; return action655bRuleInputs.hold; } });
  const proxy = new Proxy({}, { get() { proxyHooks += 1; return action655bRuleInputs.hold; }, ownKeys() { proxyHooks += 1; return []; } });
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  for (const value of [accessor, proxy, cycle, Symbol("input"), new String(action655bRuleInputs.hold), () => action655bRuleInputs.hold]) {
    expect(evaluateAction655bCanonicalExitDecision(value, true).result_kind).toBe("invalid");
  }
  expect(getterHooks).toBe(0);
  expect(proxyHooks).toBe(0);
});

test("D.4 stage 1 rejects the complete non-string matrix without coercion or hooks", () => {
  let hooks = 0;
  const proxyObject = new Proxy({}, { get() { hooks += 1; return ""; }, ownKeys() { hooks += 1; return []; }, getPrototypeOf() { hooks += 1; return null; } });
  const proxyFunction = new Proxy(() => "", { apply() { hooks += 1; return ""; }, get() { hooks += 1; return ""; } });
  const values: unknown[] = [
    null, undefined, true, false, 0, BigInt(1), Symbol("x"), {}, [], new String("{}"),
    new Uint8Array([123, 125]), new ArrayBuffer(2), new DataView(new ArrayBuffer(2)), Buffer.from("{}"),
    () => "{}", proxyObject, proxyFunction,
  ];
  for (const value of values) {
    expect(evaluateAction655bCanonicalExitDecision(value, true)).toMatchObject({
      result_kind: "invalid",
      provenance_digest: null,
      invalid: { error_code: "schema_invalid", error_path: "/" },
      decision_digest: "1267a5ba3b03eb9d804c388e2532f369308e667b735468f5eecbaa525d31bbd6",
      result_digest: "e7b89abfc29b88e52690d9e2b2b325237658ff85bceb73312e2e5ed1b230fe2c",
    });
  }
  expect(hooks).toBe(0);
});

test("D.4 raw scalar scan rejects every lone surrogate and lets invalid encoding beat budget", () => {
  for (const raw of ["\ud800", "\ud801", "\udfff", `"${"a".repeat(65_537)}\ud800"`]) {
    expect(evaluateAction655bCanonicalExitDecision(raw, true)).toMatchObject({
      result_kind: "invalid",
      invalid: { error_code: "canonical_form_invalid", error_path: "/" },
      decision_digest: "f6fc201f287e1584970cf87b8a9adff50a55acf229aea8380e789b2e62851155",
      result_digest: "edecfcddcb593a00c72007fd3ba121490f116a461d13e55b93d39d40b0b51056",
    });
  }
  expect(evaluateAction655bCanonicalExitDecision('"\\ud800"', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/" });
  expect(evaluateAction655bCanonicalExitDecision('"\\udfff"', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/" });
  expect(evaluateAction655bCanonicalExitDecision('"\\udc00\\ud800"', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/" });
  expect(evaluateAction655bCanonicalExitDecision('"\\ud83d\\ude00"', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/" });
  expect(evaluateAction655bCanonicalExitDecision('"😀"', true).invalid).toEqual({ error_code: "schema_invalid", error_path: "/" });
  expect(evaluateAction655bCanonicalExitDecision('"�"', true).invalid).toEqual({ error_code: "schema_invalid", error_path: "/" });
});

test("D.4 lossless UTF-8 budget is exact and precedes BOM parsing and NFC work", () => {
  for (const size of [65_535, 65_536, 65_537] as const) {
    const input = buildAction655bExactUtf8BudgetInput(size);
    expect(Buffer.byteLength(input, "utf8")).toBe(size);
    const result = evaluateAction655bCanonicalExitDecision(input, true);
    if (size <= 65_536) {
      expect(result.invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/monitor_observation/market_data_contract_version" });
    } else {
      expect(result).toMatchObject({
        result_kind: "invalid",
        provenance_digest: null,
        invalid: { error_code: "input_budget_exceeded", error_path: "/" },
        decision_digest: "9215e974a247735bd623db224f08b04791822adedc549baa91f1e714020062e9",
        result_digest: "1fd98c51aed5a917650244ad64e3f9949fa5f474bdc1a3d847ba4ce6dfb2ee62",
      });
    }
  }
  expect(evaluateAction655bCanonicalExitDecision(`\ufeff${"a".repeat(65_534)}`, true).invalid).toEqual({ error_code: "input_budget_exceeded", error_path: "/" });
  expect(evaluateAction655bCanonicalExitDecision("\ufeff{}", true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/" });
});

test("D.4 strict raw JSON order rejects syntax trailing NFC and duplicate inputs deterministically", () => {
  for (const raw of ["", "{", "[", '"\\x"', "01", "?", "{}{}", "{}x", "{}/*x*/", "{}\0", "{} "]) {
    expect(evaluateAction655bCanonicalExitDecision(raw, true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/" });
  }
  expect(evaluateAction655bCanonicalExitDecision('{"a":1,"a":2}', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/a" });
  expect(evaluateAction655bCanonicalExitDecision('{"a":1,"\\u0061":2}', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/a" });
  expect(evaluateAction655bCanonicalExitDecision('{"position_snapshot":{"a":1,"a":2}}', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/position_snapshot/a" });
  expect(evaluateAction655bCanonicalExitDecision('{"é":1,"é":2}', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/é" });
  expect(evaluateAction655bCanonicalExitDecision('{"n":0,"n":-0}', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/n" });
  expect(evaluateAction655bCanonicalExitDecision('{"n":-0}x', true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/" });
});

test("D.4 number lexemes preserve exact negative-zero and noncanonical pointers through stage 9", () => {
  for (const raw of ["-0", "-0.0", "-0e0", "-0E+0"]) {
    expect(evaluateAction655bCanonicalExitDecision(raw, true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/" });
  }
  for (const raw of ['{"n":-0}', '{"n":-0.0}', '{"n":-0e0}', '{"n":-0E+0}']) {
    expect(evaluateAction655bCanonicalExitDecision(raw, true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/n" });
  }
  expect(evaluateAction655bCanonicalExitDecision("[-0]", true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/0" });
  const base = action655bRuleInputs.hold;
  for (const token of ["-0", "-0.0", "-0e0", "-0E+0", "1.0", "1e0"]) {
    const raw = replaceAction655bRawToken(base, '"position_version":3', `"position_version":${token}`);
    expect(evaluateAction655bCanonicalExitDecision(raw, true).invalid).toEqual({ error_code: "canonical_form_invalid", error_path: "/position_snapshot/position_version" });
  }
  const unsafe = replaceAction655bRawToken(base, '"position_version":3', '"position_version":9007199254740992');
  expect(evaluateAction655bCanonicalExitDecision(unsafe, true).invalid).toEqual({ error_code: "numeric_domain_invalid", error_path: "/position_snapshot/position_version" });
});

test("D.4 schema uses exact JSON types without String or numeric coercion", () => {
  const cases: Array<[string, unknown, string]> = [
    ["position_identity", [], "/position_snapshot/position_identity"],
    ["durable_recommendation_uuid", {}, "/position_snapshot/durable_recommendation_uuid"],
    ["status", ["open"], "/position_snapshot/status"],
    ["side", { value: "long" }, "/position_snapshot/side"],
  ];
  for (const [field, value, path] of cases) {
    const input = buildAction655bCanonicalInput({ position: { [field]: value } });
    expect(evaluateAction655bCanonicalExitDecision(input, true).invalid).toEqual({ error_code: "schema_invalid", error_path: path });
  }
  const observation = buildAction655bCanonicalInput({ observation: { session_state: ["open"] } });
  expect(evaluateAction655bCanonicalExitDecision(observation, true).invalid).toEqual({ error_code: "schema_invalid", error_path: "/monitor_observation/session_state" });
});

test("655G fixture oracle freezes an independent literal stage 10 and 11 traversal manifest", () => {
  expect(Object.isFrozen(action655gFixtureTraversalMatrix)).toBe(true);
  expect(Object.isFrozen(action655gFixtureTraversalMatrix.stage10)).toBe(true);
  expect(Object.isFrozen(action655gFixtureTraversalMatrix.stage11)).toBe(true);
  expect(action655gFixtureTraversalMatrix.stage10).toHaveLength(44);
  expect(action655gFixtureTraversalMatrix.stage11).toHaveLength(41);
  expect(action655gFixtureTraversalMatrix.stage10.slice(0, 4)).toEqual([
    "/contract_version",
    "/position_snapshot/contract_version",
    "/position_snapshot/position_identity",
    "/position_snapshot/position_version",
  ]);
  expect(action655gFixtureTraversalMatrix.stage11.indexOf("/position_snapshot/price_scale")).toBeLessThan(
    action655gFixtureTraversalMatrix.stage11.indexOf("/monitor_observation/position_version"),
  );
  const normative = JSON.parse(execFileSync("git", ["show", "1ea4c7f2d179b17238eab73d3d8b08e0a2c63698:docs/action-655a-server-owned-trade-management-contract-manifest.json"], {
    cwd: root,
    encoding: "utf8",
  })) as { contracts: Record<string, { fields: string[] }> };
  const positionPointers = normative.contracts.position_snapshot.fields.map((field) => `/position_snapshot/${field}`);
  const observationPointers = normative.contracts.monitor_observation.fields.map((field) => `/monitor_observation/${field}`);
  expect(action655gFixtureTraversalMatrix.stage10).toEqual([
    "/contract_version",
    ...positionPointers,
    ...observationPointers,
    "/decision_requested_at",
    "/evaluation_request_identity",
    "/input_digest",
  ]);
  expect(action655gFixtureTraversalMatrix.stage11).toEqual([
    ...positionPointers.slice(1),
    ...observationPointers.slice(1),
    "/decision_requested_at",
    "/evaluation_request_identity",
    "/input_digest",
  ]);
  const source = readFileSync(productionPath, "utf8");
  expect(source).toContain("const stage10ManifestOrder = Object.freeze");
  expect(source).not.toContain("function rawNumericDomainFailure");
  expect(source).not.toContain("function exactFields");
});

test("655F four-case independent oracle fails on preserved 655E and passes on 655G", () => {
  const inputs = action655gReviewOracleCases.map((entry) => entry.input);
  const preservedResults = evaluateWithPreservedAction655e(inputs);
  const successorDecisionDigests = new Set<string>();
  for (const [index, entry] of action655gReviewOracleCases.entries()) {
    expect(preservedResults[index], `${entry.name}: preserved 655E must reproduce the finding`).not.toEqual(entry.expected);
    const first = evaluateAction655bCanonicalExitDecision(entry.input, true);
    const second = evaluateAction655bCanonicalExitDecision(entry.input, true);
    expect(first.invalid, entry.name).toEqual(entry.expected);
    expect(first).toEqual(second);
    expect(first).toMatchObject({ result_kind: "invalid", provenance_digest: null, decision: null, noneligible: null, refused: null });
    const rebuiltDecisionDigest = digestAction655bFixture(decisionFrame({
      ...baseDecisionProjection(),
      invalid_error_code: entry.expected.error_code,
      invalid_error_path: entry.expected.error_path,
      result_kind: "invalid",
    }));
    expect(first.decision_digest).toBe(rebuiltDecisionDigest);
    const { result_digest: resultDigest, ...unsignedResult } = first;
    expect(digestAction655bFixture({
      contract_version: "action_655a6_exit_evaluation_result_digest_v4",
      domain: "trade_management_exit_evaluation_result_digest_v3",
      projection: unsignedResult,
    })).toBe(resultDigest);
    successorDecisionDigests.add(first.decision_digest);
  }
  expect(successorDecisionDigests.size).toBe(action655gReviewOracleCases.length);
});

test("stage 10 pairwise and triple-invalid inputs select the manifest-first failure depth-first", () => {
  const cases = [
    {
      expected: { error_code: "unsupported_contract_version", error_path: "/contract_version" },
      input: canonicalizeAction655bFixture({ contract_version: "wrong", monitor_observation: null }),
    },
    {
      expected: { error_code: "unsupported_contract_version", error_path: "/position_snapshot/contract_version" },
      input: mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => {
        const position = input.position_snapshot as Record<string, unknown>;
        position.contract_version = "wrong";
        delete position.position_identity;
        delete input.monitor_observation;
      }),
    },
    {
      expected: { error_code: "missing_required_input", error_path: "/position_snapshot/position_identity" },
      input: mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => {
        delete (input.position_snapshot as Record<string, unknown>).position_identity;
        delete input.monitor_observation;
        delete input.decision_requested_at;
      }),
    },
    {
      expected: { error_code: "schema_invalid", error_path: "/position_snapshot/position_identity" },
      input: mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => {
        (input.position_snapshot as Record<string, unknown>).position_identity = [];
        delete input.monitor_observation;
      }),
    },
    {
      expected: { error_code: "schema_invalid", error_path: "/position_snapshot/aaa_unknown" },
      input: mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => {
        const position = input.position_snapshot as Record<string, unknown>;
        position.zzz_unknown = null;
        position.aaa_unknown = null;
        delete input.monitor_observation;
      }),
    },
    {
      expected: { error_code: "schema_invalid", error_path: "/position_snapshot/price_scale" },
      input: buildAction655bCanonicalInput({ position: { price_scale: "9" }, observation: { position_version: 0 } }),
    },
  ] as const;
  for (const [index, entry] of cases.entries()) {
    expect(evaluateAction655bCanonicalExitDecision(entry.input, true).invalid, `stage10 compound ${index}`).toEqual(entry.expected);
  }
});

test("stage 11 pairwise and triple-invalid inputs select the manifest-first value-domain failure", () => {
  const cases = [
    [
      buildAction655bCanonicalInput({ position: { position_identity: "bad", price_scale: 9 }, observation: { position_version: 0 } }),
      "/position_snapshot/position_identity",
    ],
    [
      buildAction655bCanonicalInput({ position: { position_version: 0, price_scale: 9 }, observation: { position_version: 0 } }),
      "/position_snapshot/position_version",
    ],
    [
      buildAction655bCanonicalInput({ position: { price_scale: 9, quantity_scale: 9 }, observation: { position_version: 0 } }),
      "/position_snapshot/price_scale",
    ],
    [
      buildAction655bCanonicalInput({ position: { tick_size_price_units: "0", quantity_scale: 9 }, observation: { position_version: 0 } }),
      "/position_snapshot/tick_size_price_units",
    ],
    [
      buildAction655bCanonicalInput({ position: { quantity_scale: 9, lot_size_quantity_units: "0" }, observation: { position_version: 0 } }),
      "/position_snapshot/quantity_scale",
    ],
    [
      buildAction655bCanonicalInput({ position: { lot_size_quantity_units: "0", total_quantity_units: "3" }, observation: { position_version: 0 } }),
      "/position_snapshot/lot_size_quantity_units",
    ],
    [
      buildAction655bCanonicalInput({ position: { total_quantity_units: "3", remaining_quantity_units: "3" }, observation: { position_version: 0 } }),
      "/position_snapshot/total_quantity_units",
    ],
    [
      buildAction655bCanonicalInput({ position: { target_1_price_units: "0", target_2_price_units: "0" }, observation: { position_version: 0 } }),
      "/position_snapshot/target_1_price_units",
    ],
  ] as const;
  for (const [index, [input, errorPath]] of cases.entries()) {
    expect(evaluateAction655bCanonicalExitDecision(input, true).invalid, `stage11 compound ${index}`).toEqual({
      error_code: index === 0 ? "schema_invalid" : "numeric_domain_invalid",
      error_path: errorPath,
    });
  }
});

test("D.4 canonical object ordering is unsigned UTF-8 at root nested and repeated prefixes", () => {
  for (const [scope, expectedPath] of [
    ["root", "/"],
    ["nested", "/position_snapshot/"],
    ["prefixed", "/position_snapshot/prefix"],
  ] as const) {
    const input = mutateAction655bCanonicalInput(action655bRuleInputs.hold, (record) => {
      const target = scope === "root" ? record : record.position_snapshot as Record<string, unknown>;
      const prefix = scope === "prefixed" ? "prefix" : "";
      target[`${prefix}`] = null;
      target[`${prefix}𐀀`] = null;
    });
    expect(evaluateAction655bCanonicalExitDecision(input, true).invalid).toEqual({ error_code: "schema_invalid", error_path: expectedPath });
  }
});

test("D.4 profit protection emits priority 6 even when stop is already at entry", () => {
  for (const current of ["110", "111"]) {
    const input = buildAction655bCanonicalInput({ position: { current_stop_price_units: "100" }, observation: { current_price_units: current } });
    expect(evaluateAction655bCanonicalExitDecision(input, true).decision).toMatchObject({
      decision_reason: "profit_protection_stop_move",
      decision_priority: 6,
      recommended_stop_price_units: "100",
    });
  }
});

test("D.4 malformed external bytes are rejected by a strict test-only boundary before evaluator invocation", () => {
  let invocations = 0;
  const strictBoundary = (bytes: Uint8Array) => {
    try {
      const input = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      invocations += 1;
      return evaluateAction655bCanonicalExitDecision(input, true);
    } catch {
      return Object.freeze({
        boundary_contract_version: "action_655d4_strict_UTF8_boundary_rejection_v1",
        outcome: "rejected_before_evaluator",
        reason: "malformed_utf8",
        error_path: null,
        decision_priority: null,
        decision_digest: null,
        result_digest: null,
        provenance_digest: null,
        evaluator_invoked: false,
        replacement_performed: false,
        side_effects_performed: false,
        input_binding_claimed: false,
      });
    }
  };
  for (const bytes of [
    [0xc0, 0xaf], [0xe2, 0x28, 0xa1], [0xed, 0xa0, 0x80], [0xf4, 0x90, 0x80, 0x80], [0xe2, 0x82],
  ]) expect(strictBoundary(Uint8Array.from(bytes))).toMatchObject({ outcome: "rejected_before_evaluator", evaluator_invoked: false, result_digest: null });
  expect(invocations).toBe(0);
});

test("the rejected 655B source still reproduces all four predecessor defects", () => {
  const rejected = execFileSync("git", ["show", "08e593a58fc18473d6a6212c10f72cae8b7587ce:lib/action-655b-canonical-exit-evaluator.ts"], { cwd: root, encoding: "utf8" });
  expect(rejected).toContain("canonicalInputJson.length > maximumInputCodeUnits");
  expect(rejected).toContain(".sort()");
  expect(rejected).toContain("canonicalUuid.test(String(position.position_identity))");
  expect(rejected).toContain("favorableProduct >= riskProduct && stop !== entry");
  expect(rejected).toContain("JSON.parse(canonicalInputJson)");
});

test("all 48 delivered Action 654 paths retain exact byte parity", () => {
  const paths = execFileSync("git", ["diff", "--name-only", "1e2f0b8e699df41c426cfff69240a93cd3098e4c", "ce36c5369177c6872886797c68facd17c4ce1964"], { cwd: root, encoding: "utf8" }).trim().split("\n");
  expect(paths).toHaveLength(48);
  for (const path of paths) {
    const preserved = execFileSync("git", ["show", `ce36c5369177c6872886797c68facd17c4ce1964:${path}`], { cwd: root });
    expect(readFileSync(resolve(root, path)), path).toEqual(preserved);
  }
});

test("stale boundary and future observation refuse against exact request time", () => {
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.observation_age_maximum_minus_one, true).result_kind).toBe("decision");
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.stale_observation, true)).toMatchObject({
    result_kind: "refused",
    refused: { refusal_reason: "stale_observation", error_path: "/monitor_observation/observed_at" },
  });
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.observation_age_maximum_plus_one, true)).toMatchObject({
    result_kind: "refused",
    refused: { refusal_reason: "stale_observation", error_path: "/monitor_observation/observed_at" },
  });
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.market_data_age_maximum_minus_one, true).result_kind).toBe("decision");
  for (const input of [action655bBoundaryInputs.market_data_age_maximum, action655bBoundaryInputs.market_data_age_maximum_plus_one]) {
    expect(evaluateAction655bCanonicalExitDecision(input, true)).toMatchObject({
      result_kind: "refused",
      refused: { refusal_reason: "stale_observation", error_path: "/monitor_observation/market_data_observed_at" },
    });
  }
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.future_observation, true)).toMatchObject({
    result_kind: "refused",
    refused: { refusal_reason: "future_observation", error_path: "/monitor_observation/observed_at" },
  });
  expect(evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.future_market_data, true)).toMatchObject({
    result_kind: "refused",
    refused: { refusal_reason: "future_market_data", error_path: "/monitor_observation/market_data_observed_at" },
  });
});

test("request replay with changed request time is rejected before evaluation", () => {
  const replay = mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => {
    input.decision_requested_at = "2026-08-04T12:00:00.000000001Z";
  });
  expect(evaluateAction655bCanonicalExitDecision(replay, true)).toMatchObject({
    result_kind: "refused",
    provenance_digest: null,
    refused: { refusal_reason: "identity_conflict", error_path: "/evaluation_request_identity" },
  });
});

test("cross-position observation substitution is rejected", () => {
  const substituted = mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => {
    const observation = input.monitor_observation as Record<string, unknown>;
    observation.position_identity = "33333333-3333-4333-8333-333333333333";
  });
  expect(evaluateAction655bCanonicalExitDecision(substituted, true)).toMatchObject({
    result_kind: "refused",
    refused: { refusal_reason: "identity_conflict" },
  });
});

test("durable recommendation UUID and version substitutions are rejected", () => {
  for (const [field, value] of [
    ["durable_recommendation_uuid", "22222222-2222-4222-8222-222222222223"],
    ["durable_recommendation_version", 8],
  ] as const) {
    const changed = mutateAction655bCanonicalInput(action655bRuleInputs.hold, (input) => {
      const position = input.position_snapshot as Record<string, unknown>;
      position[field] = value;
    });
    expect(evaluateAction655bCanonicalExitDecision(changed, true)).toMatchObject({
      result_kind: "refused",
      provenance_digest: null,
      refused: { refusal_reason: "identity_conflict", error_path: "/position_snapshot/position_snapshot_digest" },
    });
  }
});

test("policy frame rebuilds the sole private allowlist digest", () => {
  expect(digestAction655bFixture(action655bFrozenVectorFrames.policy)).toBe(action655bFrozenDigestVectors.policy.positive);
  const alternate = { ...action655bFrozenVectorFrames.policy, canonical_unsigned_projection: action655bFrozenVectorFrames.policy.projection } as Record<string, unknown>;
  delete alternate.projection;
  expect(digestAction655bFixture(alternate)).toBe(action655bFrozenDigestVectors.policy.alternate_field_name);
  const altered = { ...action655bFrozenVectorFrames.policy, projection: { ...action655bFrozenVectorFrames.policy.projection, enabled: false } };
  expect(digestAction655bFixture(altered)).toBe(action655bFrozenDigestVectors.policy.altered_projection);
  const reorderedRaw = `{"domain":${JSON.stringify(action655bFrozenVectorFrames.policy.domain)},"contract_version":${JSON.stringify(action655bFrozenVectorFrames.policy.contract_version)},"policy_id":${JSON.stringify(action655bFrozenVectorFrames.policy.policy_id)},"policy_identity":${JSON.stringify(action655bFrozenVectorFrames.policy.policy_identity)},"projection":${canonicalizeAction655bFixture(action655bFrozenVectorFrames.policy.projection)}}`;
  expect(createHash("sha256").update(reorderedRaw, "utf8").digest("hex")).toBe(action655bFrozenDigestVectors.policy.reordered_raw);
  expect(reorderedRaw).not.toBe(canonicalizeAction655bFixture(action655bFrozenVectorFrames.policy));
});

test("frozen provenance positive and every authoritative mutation reproduce exactly", () => {
  const frame = action655bFrozenVectorFrames.provenance;
  expect(digestAction655bFixture(frame)).toBe(action655bFrozenDigestVectors.provenance.positive);
  const changes = {
    altered_decision_requested_at: { decision_requested_at: "2026-08-04T12:00:00.000000001Z" },
    altered_observation_identity: { observation_identity: `tm_observation:v2:${"7".repeat(64)}` },
    altered_policy_digest: { policy_digest: `${action655bFrozenDigestVectors.policy.positive.slice(0, -1)}b` },
    altered_recommendation_uuid: { durable_recommendation_uuid: "22222222-2222-4222-8222-222222222223" },
    altered_recommendation_version: { durable_recommendation_version: 8 },
  };
  for (const [name, change] of Object.entries(changes)) {
    const mutated = { ...frame, projection: { ...frame.projection, ...change } };
    expect(digestAction655bFixture(mutated), name).toBe(action655bFrozenDigestVectors.provenance[name as keyof typeof changes]);
    expect(digestAction655bFixture(mutated)).not.toBe(action655bFrozenDigestVectors.provenance.positive);
  }
});

test("four frozen positive decision digests preserve every explicit null", () => {
  const provenance = action655bFrozenDigestVectors.provenance.positive;
  const identity = action655bFrozenDigestVectors.decision.identity;
  const projections = {
    decision: { ...baseDecisionProjection(), decision_authority: "server_owned_policy", decision_identity: identity, decision_priority: 1, decision_reason: "hard_stop", decision_status: "exit_full", provenance_digest: provenance, recommended_quantity_units: "10", result_kind: "decision" },
    invalid: { ...baseDecisionProjection(), invalid_error_code: "missing_required_input", invalid_error_path: "/position_snapshot", result_kind: "invalid" },
    noneligible: { ...baseDecisionProjection(), noneligible_position_status: "exit_pending", noneligible_reason: "position_exit_pending", provenance_digest: provenance, result_kind: "noneligible" },
    refused: { ...baseDecisionProjection(), provenance_digest: provenance, refusal_error_path: "/monitor_observation/observed_at", refusal_reason: "stale_observation", result_kind: "refused" },
  };
  for (const [kind, projection] of Object.entries(projections)) {
    expect(Object.keys(projection)).toHaveLength(16);
    expect(Object.values(projection)).toContain(null);
    expect(digestAction655bFixture(decisionFrame(projection)), kind).toBe(
      action655bFrozenDigestVectors.decision.positive[kind as keyof typeof projections],
    );
  }
});

test("all frozen decision mutations rebuild to distinct rejected evidence", () => {
  const provenanceFrame = action655bFrozenVectorFrames.provenance;
  const base = {
    ...baseDecisionProjection(),
    decision_authority: "server_owned_policy",
    decision_identity: action655bFrozenDigestVectors.decision.identity,
    decision_priority: 1,
    decision_reason: "hard_stop",
    decision_status: "exit_full",
    provenance_digest: action655bFrozenDigestVectors.provenance.positive,
    recommended_quantity_units: "10",
    result_kind: "decision",
  };
  const provenanceChanges = {
    altered_decision_requested_at: { decision_requested_at: "2026-08-04T12:00:00.000000001Z" },
    altered_observation_identity: { observation_identity: `tm_observation:v2:${"7".repeat(64)}` },
    altered_policy_digest: { policy_digest: `${action655bFrozenDigestVectors.policy.positive.slice(0, -1)}b` },
    altered_recommendation_uuid: { durable_recommendation_uuid: "22222222-2222-4222-8222-222222222223" },
    altered_recommendation_version: { durable_recommendation_version: 8 },
  };
  for (const [name, change] of Object.entries(provenanceChanges)) {
    const changedProvenance = digestAction655bFixture({ ...provenanceFrame, projection: { ...provenanceFrame.projection, ...change } });
    const identityProjection = {
      decision_priority: 1,
      decision_reason: "hard_stop",
      decision_status: "exit_full",
      provenance_digest: changedProvenance,
      recommended_quantity_units: "10",
      recommended_stop_price_units: null,
      result_kind: "decision",
    };
    const changedIdentity = `tm_exit_decision:v4:${digestAction655bFixture({ contract_version: "action_655a6_exit_decision_identity_v4", domain: "trade_management_exit_decision_identity_v3", projection: identityProjection })}`;
    const changedDigest = digestAction655bFixture(decisionFrame({ ...base, decision_identity: changedIdentity, provenance_digest: changedProvenance }));
    expect(changedDigest, name).toBe(action655bFrozenDigestVectors.decision.mutation[name as keyof typeof provenanceChanges]);
    expect(changedDigest).not.toBe(action655bFrozenDigestVectors.decision.positive.decision);
  }
  expect(digestAction655bFixture(decisionFrame({ ...base, result_kind: "refused" }))).toBe(
    action655bFrozenDigestVectors.decision.mutation.altered_result_discriminator,
  );
  const reorderedRaw = `{"domain":"trade_management_exit_decision_digest_v3","contract_version":"action_655a6_exit_decision_digest_v4","projection":${canonicalizeAction655bFixture(base)}}`;
  expect(createHash("sha256").update(reorderedRaw, "utf8").digest("hex")).toBe(
    action655bFrozenDigestVectors.decision.mutation.reordered_raw,
  );
  expect(reorderedRaw).not.toBe(canonicalizeAction655bFixture(decisionFrame(base)));
  const omittedNull = Object.fromEntries(Object.entries(base).filter(([field]) => field !== "invalid_error_path"));
  expect(Object.keys(omittedNull)).toHaveLength(15);
  expect(digestAction655bFixture(decisionFrame(omittedNull))).not.toBe(action655bFrozenDigestVectors.decision.positive.decision);
});

test("all four runtime result variants use exact one-hot explicit-null unions", () => {
  const results = [
    evaluateAction655bCanonicalExitDecision(action655bRuleInputs.hold, true),
    evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.noneligible_closed, true),
    evaluateAction655bCanonicalExitDecision(canonicalizeAction655bFixture({ contract_version: "action_655a6_exit_evaluation_input_v4" }), true),
    evaluateAction655bCanonicalExitDecision(action655bBoundaryInputs.default_off),
  ];
  expect(results.map((result) => result.result_kind)).toEqual(["decision", "noneligible", "invalid", "refused"]);
  for (const result of results) {
    const payloads = [result.decision, result.noneligible, result.invalid, result.refused];
    expect(payloads.filter((payload) => payload !== null)).toHaveLength(1);
    expect(Object.keys(result)).toEqual([
      "contract_version", "result_kind", "provenance_digest", "decision_digest",
      "decision", "noneligible", "invalid", "refused", "side_effects_performed", "result_digest",
    ]);
  }
});

test("identical input returns byteidentical deeply frozen result without input mutation", () => {
  const input = action655bRuleInputs.hold;
  const before = input.slice();
  const first = evaluateAction655bCanonicalExitDecision(input, true);
  const second = evaluateAction655bCanonicalExitDecision(input, true);
  expect(canonicalizeAction655bFixture(first)).toBe(canonicalizeAction655bFixture(second));
  expect(first.result_digest).toBe(second.result_digest);
  expect(input).toBe(before);
  expect(Object.isFrozen(first)).toBe(true);
  expect(Object.isFrozen(first.decision)).toBe(true);
});

test("frozen canonical result bytes and digests reproduce exactly", () => {
  const result = evaluateAction655bCanonicalExitDecision(action655bRuleInputs.hold, true);
  const canonicalBytes = canonicalizeAction655bFixture(result);
  const expected = action655bExpectedSerializedResults.hold;
  expect(Buffer.byteLength(canonicalBytes, "utf8")).toBe(expected.canonical_byte_length);
  expect(createHash("sha256").update(canonicalBytes, "utf8").digest("hex")).toBe(expected.canonical_sha256);
  expect(result.decision_digest).toBe(expected.decision_digest);
  expect(result.result_digest).toBe(expected.result_digest);
});

test("fresh processes and UTC Stockholm and New York produce identical bytes", () => {
  const evaluatorUrl = pathToFileURL(productionPath).href;
  const fixturesUrl = pathToFileURL(resolve(root, "tests/fixtures/action-655b-canonical-exit-evaluator-fixtures.ts")).href;
  const probe = [
    "import {createHash} from 'node:crypto';",
    `const evaluator=await import(${JSON.stringify(evaluatorUrl)});`,
    `const fixtures=await import(${JSON.stringify(fixturesUrl)});`,
    "const result=evaluator.evaluateAction655bCanonicalExitDecision(fixtures.action655bRuleInputs.hold,true);",
    "const bytes=fixtures.canonicalizeAction655bFixture(result);",
    "console.log(createHash('sha256').update(bytes,'utf8').digest('hex'));",
  ].join("");
  for (const timezone of ["UTC", "Europe/Stockholm", "America/New_York"]) {
    const observed = execFileSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", probe], {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, TZ: timezone },
    }).trim();
    expect(observed).toBe(action655bExpectedSerializedResults.hold.canonical_sha256);
  }
});

test("result digest independently rebuilds from exact unsigned result bytes", () => {
  const result = evaluateAction655bCanonicalExitDecision(action655bRuleInputs.hold, true);
  const { result_digest: resultDigest, ...unsigned } = result;
  const rebuilt = digestAction655bFixture({
    contract_version: "action_655a6_exit_evaluation_result_digest_v4",
    domain: "trade_management_exit_evaluation_result_digest_v3",
    projection: unsigned,
  });
  expect(rebuilt).toBe(resultDigest);
});

test("no timers, fetches, callbacks, or asynchronous work execute", () => {
  let timerHooks = 0;
  let fetchHooks = 0;
  const originalTimer = globalThis.setTimeout;
  const originalFetch = globalThis.fetch;
  globalThis.setTimeout = (() => {
    timerHooks += 1;
    throw new Error("timer forbidden");
  }) as unknown as typeof setTimeout;
  globalThis.fetch = (() => {
    fetchHooks += 1;
    throw new Error("fetch forbidden");
  }) as typeof fetch;
  try {
    const result = evaluateAction655bCanonicalExitDecision(action655bRuleInputs.hold, true);
    expect(result.result_kind).toBe("decision");
  } finally {
    globalThis.setTimeout = originalTimer;
    globalThis.fetch = originalFetch;
  }
  expect(timerHooks).toBe(0);
  expect(fetchHooks).toBe(0);
});

test("production source has no runtime, persistence, transport, credential, or provider capability", () => {
  const source = readFileSync(productionPath, "utf8");
  for (const forbidden of [
    /process\./, /process\[/, /Deno\./, /Bun\./, /fetch\s*\(/,
    /setTimeout\s*\(/, /setInterval\s*\(/, /node:fs/, /node:child_process/,
    /supabase/i, /avanza/i, /credential/i, /broker/i, /WebSocket/,
    /XMLHttpRequest/, /indexedDB/, /localStorage/, /sessionStorage/,
  ]) expect(source).not.toMatch(forbidden);
  expect(source).toContain('from "node:crypto"');
});

test("golden report JSON and implementation digest are exact", () => {
  const golden = JSON.parse(readFileSync(resolve(root, "docs/action-655b-canonical-exit-evaluator-golden-report.json"), "utf8")) as {
    artifact_scope: { count: number; paths: string[] };
    digests: { implementation_sha256: string; policy: string; provenance: string };
    validation: { focused: { passed: number; negative_case_vectors: number } };
  };
  expect(golden.artifact_scope).toEqual({
    count: 5,
    paths: [
      "docs/action-655b-canonical-exit-evaluator-contract.md",
      "docs/action-655b-canonical-exit-evaluator-golden-report.json",
      "lib/action-655b-canonical-exit-evaluator.ts",
      "tests/e2e/action-655b-canonical-exit-evaluator.spec.ts",
      "tests/fixtures/action-655b-canonical-exit-evaluator-fixtures.ts",
    ],
  });
  expect(golden.digests.implementation_sha256).toBe(createHash("sha256").update(readFileSync(productionPath)).digest("hex"));
  expect(golden.digests.policy).toBe(action655bFrozenDigestVectors.policy.positive);
  expect(golden.digests.provenance).toBe(action655bFrozenDigestVectors.provenance.positive);
  expect(golden.validation.focused).toEqual({ passed: 44, negative_case_vectors: 98 });
});

test("Action 655D.4 contract bytes remain unchanged", () => {
  const contractPaths = [
    "docs/action-655a-server-owned-trade-management-design.md",
    "docs/action-655a-server-owned-trade-management-contract-manifest.json",
    "docs/action-655a-server-owned-trade-management-threat-model.md",
    "docs/action-655a-server-owned-trade-management-dependency-gate.json",
    "docs/action-655a-server-owned-trade-management-next-slice.md",
  ];
  for (const path of contractPaths) {
    const preserved = execFileSync("git", ["show", `1ea4c7f2d179b17238eab73d3d8b08e0a2c63698:${path}`], { cwd: root });
    expect(readFileSync(resolve(root, path))).toEqual(preserved);
  }
});
