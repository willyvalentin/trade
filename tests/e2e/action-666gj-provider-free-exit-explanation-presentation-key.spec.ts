import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gjExitExplanationPresentationKey,
} from "../../lib/action-666gj-provider-free-exit-explanation-presentation-key";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/action-666gj-provider-free-exit-explanation-presentation-key.ts";
const documentationPath =
  "docs/action-666gj-provider-free-exit-explanation-presentation-key.md";
const evidencePath =
  "docs/evidence/action-666gj-provider-free-exit-explanation-presentation-key.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gj-provider-free-exit-explanation-presentation-key.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

const allowedClassifications = [
  ["exit_full", "hard_stop", 1, "exit_full_hard_stop"],
  ["exit_full", "invalidation", 2, "exit_full_invalidation"],
  ["exit_full", "session_close", 3, "exit_full_session_close"],
  ["exit_full", "final_target", 4, "exit_full_final_target"],
  ["exit_partial", "first_target_partial", 5, "exit_partial_first_target_partial"],
  ["move_stop", "profit_protection_stop_move", 6, "move_stop_profit_protection_stop_move"],
  ["hold", "hold", 7, "hold_hold"],
] as const;

test("666GJ projects every closed exit classification into its fixed presentation key", () => {
  for (const [decision_status, decision_reason, decision_priority, presentation_key] of allowedClassifications) {
    const result = projectAction666gjExitExplanationPresentationKey({
      decision_status,
      decision_reason,
      decision_priority,
    });
    expect(result).toEqual({
      contract_version:
        "action_666gj_provider_free_exit_explanation_presentation_key_v1",
      projection_state: "projected",
      authority: "advisory_projection_no_execution_authority",
      classification: { decision_status, decision_reason, decision_priority },
      presentation_key,
      rejection_code: null,
      runtime_wired: false,
      side_effects_performed: false,
    });
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.classification)).toBe(true);
  }
});

test("666GJ rejects uncertain, expanded and mismatched inputs fail-closed", () => {
  const rejected = [
    null,
    [],
    { decision_status: "exit_full", decision_reason: "hard_stop" },
    {
      decision_status: "exit_full",
      decision_reason: "hard_stop",
      decision_priority: 1,
      position_id: "must-not-enter-key",
    },
    {
      decision_status: "exit_full",
      decision_reason: "hard_stop",
      decision_priority: "1",
    },
  ];
  for (const input of rejected) {
    const result = projectAction666gjExitExplanationPresentationKey(input);
    expect(result).toMatchObject({
      projection_state: "rejected",
      authority: "advisory_projection_no_execution_authority",
      classification: null,
      presentation_key: null,
      runtime_wired: false,
      side_effects_performed: false,
    });
    expect(Object.isFrozen(result)).toBe(true);
  }
  expect(
    projectAction666gjExitExplanationPresentationKey({
      decision_status: "hold",
      decision_reason: "hard_stop",
      decision_priority: 1,
    }).rejection_code,
  ).toBe("unsupported_decision_classification");
});

test("666GJ preserves the source-only presentation-key boundary and delivery controls", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toContain("action-655b-canonical-exit-evaluator");
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(implementation).toContain("advisory_projection_no_execution_authority");
  expect(documentation).toMatch(/does not import or invoke the exit evaluator/i);
  expect(documentation).toMatch(/no data\/provider\/secret\/network read/i);
  expect(documentation).toMatch(/no caller or\s+runtime integration/i);
  expect(source(roadmapPath)).toMatch(/Action 666GJ/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GJ/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
