import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gaExitDecisionExplanation,
} from "../../lib/action-666ga-provider-free-exit-decision-explanation";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/action-666ga-provider-free-exit-decision-explanation.ts";
const documentationPath =
  "docs/action-666ge-canonical-rejected-result-contract.md";
const evidencePath =
  "docs/evidence/action-666ge-canonical-rejected-result-contract.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ge-canonical-rejected-result-contract.spec.ts";

const resultKeys = [
  "advisory_copy",
  "authority",
  "classification",
  "contract_version",
  "projection_state",
  "rejection_code",
  "runtime_wired",
  "side_effects_performed",
];

const canonicalRejectedPayload = {
  contract_version: "action_666ga_provider_free_exit_decision_explanation_v1",
  projection_state: "rejected",
  authority: "advisory_projection_no_execution_authority",
  classification: null,
  advisory_copy: null,
  runtime_wired: false,
  side_effects_performed: false,
} as const;

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function expectCanonicalRejection(
  result: ReturnType<typeof projectAction666gaExitDecisionExplanation>,
  rejection_code: "invalid_input_shape" | "unsupported_decision_classification",
) {
  expect(result).toEqual({ ...canonicalRejectedPayload, rejection_code });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.keys(result).sort()).toEqual(resultKeys);
  expect(Object.getOwnPropertySymbols(result)).toEqual([]);
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(result))) {
    expect("value" in descriptor).toBe(true);
    expect(descriptor.writable).toBe(false);
    expect(descriptor.configurable).toBe(false);
  }
  expect(Reflect.set(result, "rejection_code", null)).toBe(false);
}

test("666GE canonicalizes every malformed input as one fresh invalid-shape result", () => {
  const malformedInputs = [undefined, null, false, 0, "hold", [], {}, Object.create(null)];
  const results = malformedInputs.map((input) =>
    projectAction666gaExitDecisionExplanation(input),
  );

  for (const result of results) {
    expectCanonicalRejection(result, "invalid_input_shape");
  }
  expect(new Set(results).size).toBe(results.length);
});

test("666GE makes unsupported exact shapes differ only by the closed rejection code", () => {
  const invalidShape = projectAction666gaExitDecisionExplanation({});
  const unsupportedClassification = projectAction666gaExitDecisionExplanation({
    decision_status: "hold",
    decision_reason: "hard_stop",
    decision_priority: 7,
  });

  expectCanonicalRejection(invalidShape, "invalid_input_shape");
  expectCanonicalRejection(
    unsupportedClassification,
    "unsupported_decision_classification",
  );
  expect(unsupportedClassification).not.toBe(invalidShape);
  expect({ ...unsupportedClassification, rejection_code: "invalid_input_shape" }).toEqual(
    invalidShape,
  );
});

test("666GE records only the source-only canonical rejection boundary", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).toContain('return invalidResult("invalid_input_shape")');
  expect(implementation).toContain(
    'return invalidResult("unsupported_decision_classification")',
  );
  expect(implementation).toMatch(/function invalidResult\(/);
  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(documentation).toMatch(/only\s+`rejection_code` differs/i);
  expect(documentation).toMatch(/no implementation change is\s+necessary/i);
  expect(documentation).toMatch(/ACTION_666GF/);
  expect(source(roadmapPath)).toMatch(/Action 666GE/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GE/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
