import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gaExitDecisionExplanation,
} from "../../lib/action-666ga-provider-free-exit-decision-explanation";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/action-666ga-provider-free-exit-decision-explanation.ts";
const documentationPath = "docs/action-666gh-result-detachment-contract.md";
const evidencePath = "docs/evidence/action-666gh-result-detachment-contract.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666gh-result-detachment-contract.spec.ts";

const classifications = [
  ["exit_full", "hard_stop", 1],
  ["exit_full", "invalidation", 2],
  ["exit_full", "session_close", 3],
  ["exit_full", "final_target", 4],
  ["exit_partial", "first_target_partial", 5],
  ["move_stop", "profit_protection_stop_move", 6],
  ["hold", "hold", 7],
] as const;

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("666GH detaches each projected classification from its mutable caller input", () => {
  const projectedClassifications = [] as NonNullable<
    ReturnType<typeof projectAction666gaExitDecisionExplanation>["classification"]
  >[];

  for (const [decision_status, decision_reason, decision_priority] of classifications) {
    const input: {
      decision_status: string;
      decision_reason: string;
      decision_priority: number;
    } = { decision_status, decision_reason, decision_priority };
    const result = projectAction666gaExitDecisionExplanation(input);

    expect(result).toMatchObject({
      projection_state: "projected",
      classification: { decision_status, decision_reason, decision_priority },
      authority: "advisory_projection_no_execution_authority",
      runtime_wired: false,
      side_effects_performed: false,
    });
    expect(result.classification).not.toBe(input);
    expect(result.classification).not.toBeNull();
    expect(Object.isFrozen(result.classification)).toBe(true);

    input.decision_status = "caller_mutated_after_projection";
    input.decision_reason = "caller_mutated_after_projection";
    input.decision_priority = 999;

    expect(result.classification).toEqual({
      decision_status,
      decision_reason,
      decision_priority,
    });
    projectedClassifications.push(result.classification!);
  }

  expect(new Set(projectedClassifications).size).toBe(classifications.length);
});

test("666GH binds detachment to the closed local copy rather than input identity", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).toMatch(
    /return Object\.freeze\(\{[\s\S]*?decision_status: status\.value,[\s\S]*?decision_reason: reason\.value,[\s\S]*?decision_priority: priority\.value,/,
  );
  expect(implementation).toContain("classification,");
  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(documentation).toMatch(/detaches every accepted result from caller-owned input/i);
  expect(documentation).toMatch(/no\s+implementation change is\s+necessary/i);
  expect(documentation).toMatch(/completes the authorized 15-action cap/i);
  expect(source(roadmapPath)).toMatch(/Action 666GH/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GH/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
