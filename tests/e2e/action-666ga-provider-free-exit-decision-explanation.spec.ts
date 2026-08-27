import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gaExitDecisionExplanation,
} from "../../lib/action-666ga-provider-free-exit-decision-explanation";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/action-666ga-provider-free-exit-decision-explanation.ts";
const documentationPath = "docs/action-666ga-provider-free-exit-decision-explanation.md";
const evidencePath =
  "docs/evidence/action-666ga-provider-free-exit-decision-explanation.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ga-provider-free-exit-decision-explanation.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

const allowedClassifications = [
  ["exit_full", "hard_stop", 1, "hård stop"],
  ["exit_full", "invalidation", 2, "invalidation"],
  ["exit_full", "session_close", 3, "sessionsstängning"],
  ["exit_full", "final_target", 4, "slutmål"],
  ["exit_partial", "first_target_partial", 5, "första delmål"],
  ["move_stop", "profit_protection_stop_move", 6, "vinstskydd"],
  ["hold", "hold", 7, "avvakta"],
] as const;

test("666GA projects every closed classification into fixed advisory copy", () => {
  for (const [decision_status, decision_reason, decision_priority, fragment] of allowedClassifications) {
    const result = projectAction666gaExitDecisionExplanation({
      decision_status,
      decision_reason,
      decision_priority,
    });
    expect(result).toEqual({
      contract_version: "action_666ga_provider_free_exit_decision_explanation_v1",
      projection_state: "projected",
      authority: "advisory_projection_no_execution_authority",
      classification: { decision_status, decision_reason, decision_priority },
      advisory_copy: expect.stringContaining(fragment),
      rejection_code: null,
      runtime_wired: false,
      side_effects_performed: false,
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.classification)).toBe(true);
  }
});

test("666GA rejects uncertain, expanded and mismatched classifications fail-closed", () => {
  const rejected = [
    null,
    [],
    { decision_status: "exit_full", decision_reason: "hard_stop" },
    {
      decision_status: "exit_full",
      decision_reason: "hard_stop",
      decision_priority: 1,
      price: "100",
    },
    {
      decision_status: "exit_full",
      decision_reason: "hard_stop",
      decision_priority: "1",
    },
  ];
  for (const input of rejected) {
    const result = projectAction666gaExitDecisionExplanation(input);
    expect(result.projection_state).toBe("rejected");
    expect(result.authority).toBe("advisory_projection_no_execution_authority");
    expect(result.classification).toBeNull();
    expect(result.advisory_copy).toBeNull();
    expect(result.runtime_wired).toBe(false);
    expect(result.side_effects_performed).toBe(false);
  }
  expect(
    projectAction666gaExitDecisionExplanation({
      decision_status: "hold",
      decision_reason: "hard_stop",
      decision_priority: 1,
    }).rejection_code,
  ).toBe("unsupported_decision_classification");
});

test("666GA preserves the no-evaluator, no-runtime containment boundary", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toContain("action-655b-canonical-exit-evaluator");
  expect(implementation).not.toMatch(/\bfetch\s*\(/);
  expect(implementation).not.toMatch(/process\.env|require\s*\(/);
  expect(documentation).toMatch(/does not import or invoke the exit evaluator/i);
  expect(documentation).toMatch(/no route,\s*UI,/i);
  expect(documentation).toMatch(/runtime effect/i);
  expect(source(roadmapPath)).toMatch(/Action 666GA/);
  expect(source(ledgerPath)).toMatch(/Action 666GA/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
