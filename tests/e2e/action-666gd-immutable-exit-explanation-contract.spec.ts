import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gaExitDecisionExplanation,
} from "../../lib/action-666ga-provider-free-exit-decision-explanation";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/action-666ga-provider-free-exit-decision-explanation.ts";
const documentationPath =
  "docs/action-666gd-immutable-exit-explanation-contract.md";
const evidencePath =
  "docs/evidence/action-666gd-immutable-exit-explanation-contract.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gd-immutable-exit-explanation-contract.spec.ts";

const fixedClassifications = [
  ["exit_full", "hard_stop", 1, "Beslutet är klassificerat som hård stop. Texten återger endast en redan deklarerad klassificering."],
  ["exit_full", "invalidation", 2, "Beslutet är klassificerat som invalidation. Texten återger endast en redan deklarerad klassificering."],
  ["exit_full", "session_close", 3, "Beslutet är klassificerat som sessionsstängning. Texten återger endast en redan deklarerad klassificering."],
  ["exit_full", "final_target", 4, "Beslutet är klassificerat som slutmål. Texten återger endast en redan deklarerad klassificering."],
  ["exit_partial", "first_target_partial", 5, "Beslutet är klassificerat som första delmål. Texten återger endast en redan deklarerad klassificering."],
  ["move_stop", "profit_protection_stop_move", 6, "Beslutet är klassificerat som vinstskydd. Texten återger endast en redan deklarerad klassificering."],
  ["hold", "hold", 7, "Beslutet är klassificerat som avvakta. Texten återger endast en redan deklarerad klassificering."],
] as const;

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

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("666GD keeps projected and rejected results immutable with a closed shape", () => {
  const input = {
    decision_status: "hold",
    decision_reason: "hold",
    decision_priority: 7,
  };
  const first = projectAction666gaExitDecisionExplanation(input);
  const second = projectAction666gaExitDecisionExplanation(input);
  const rejected = projectAction666gaExitDecisionExplanation({});

  expect(first).not.toBe(second);
  expect(first.classification).not.toBeNull();
  expect(second.classification).not.toBeNull();
  expect(first.classification).not.toBe(second.classification);

  for (const result of [first, second, rejected]) {
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.keys(result).sort()).toEqual(resultKeys);
  }
  expect(Object.isFrozen(first.classification)).toBe(true);
  expect(Reflect.set(first, "advisory_copy", "mutated copy")).toBe(false);
  expect(Reflect.set(first.classification!, "decision_status", "exit_full")).toBe(false);
  expect(first.advisory_copy).toBe(
    "Beslutet är klassificerat som avvakta. Texten återger endast en redan deklarerad klassificering.",
  );

  expect(rejected).toEqual({
    contract_version: "action_666ga_provider_free_exit_decision_explanation_v1",
    projection_state: "rejected",
    authority: "advisory_projection_no_execution_authority",
    classification: null,
    advisory_copy: null,
    rejection_code: "invalid_input_shape",
    runtime_wired: false,
    side_effects_performed: false,
  });
});

test("666GD restricts advisory copy to the seven fixed classifications", () => {
  for (const [decision_status, decision_reason, decision_priority, advisory_copy] of fixedClassifications) {
    const result = projectAction666gaExitDecisionExplanation({
      decision_status,
      decision_reason,
      decision_priority,
    });

    expect(result).toMatchObject({
      projection_state: "projected",
      classification: { decision_status, decision_reason, decision_priority },
      advisory_copy,
      rejection_code: null,
      runtime_wired: false,
      side_effects_performed: false,
    });
  }
});

test("666GD records only the immutable source-only result boundary", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).toContain("const explanations: readonly ClassifiedExplanation[] = Object.freeze([");
  expect(implementation).toMatch(/return Object\.freeze\(\{/);
  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(documentation).toMatch(/fresh frozen classification projection/i);
  expect(documentation).toMatch(/no implementation change is necessary/i);
  expect(documentation).toMatch(/ACTION_666GE/);
  expect(source(roadmapPath)).toMatch(/Current bounded workstream/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GD/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
