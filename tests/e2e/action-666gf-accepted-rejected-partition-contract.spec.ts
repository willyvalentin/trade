import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gaExitDecisionExplanation,
} from "../../lib/action-666ga-provider-free-exit-decision-explanation";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/action-666ga-provider-free-exit-decision-explanation.ts";
const documentationPath =
  "docs/action-666gf-accepted-rejected-partition-contract.md";
const evidencePath =
  "docs/evidence/action-666gf-accepted-rejected-partition-contract.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gf-accepted-rejected-partition-contract.spec.ts";

const fixedClassifications = [
  {
    decision_status: "exit_full",
    decision_reason: "hard_stop",
    decision_priority: 1,
  },
  {
    decision_status: "exit_full",
    decision_reason: "invalidation",
    decision_priority: 2,
  },
  {
    decision_status: "exit_full",
    decision_reason: "session_close",
    decision_priority: 3,
  },
  {
    decision_status: "exit_full",
    decision_reason: "final_target",
    decision_priority: 4,
  },
  {
    decision_status: "exit_partial",
    decision_reason: "first_target_partial",
    decision_priority: 5,
  },
  {
    decision_status: "move_stop",
    decision_reason: "profit_protection_stop_move",
    decision_priority: 6,
  },
  {
    decision_status: "hold",
    decision_reason: "hold",
    decision_priority: 7,
  },
] as const;

const statusVocabulary = [
  ...new Set(fixedClassifications.map(({ decision_status }) => decision_status)),
];
const reasonVocabulary = [
  ...new Set(fixedClassifications.map(({ decision_reason }) => decision_reason)),
];
const priorityVocabulary = fixedClassifications.map(
  ({ decision_priority }) => decision_priority,
);

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function isAcceptedClassification(input: {
  decision_status: string;
  decision_reason: string;
  decision_priority: number;
}) {
  return fixedClassifications.some(
    (classification) =>
      classification.decision_status === input.decision_status &&
      classification.decision_reason === input.decision_reason &&
      classification.decision_priority === input.decision_priority,
  );
}

function expectCanonicalRejection(
  result: ReturnType<typeof projectAction666gaExitDecisionExplanation>,
  rejection_code: "invalid_input_shape" | "unsupported_decision_classification",
) {
  expect(result).toEqual({
    contract_version: "action_666ga_provider_free_exit_decision_explanation_v1",
    projection_state: "rejected",
    authority: "advisory_projection_no_execution_authority",
    classification: null,
    advisory_copy: null,
    rejection_code,
    runtime_wired: false,
    side_effects_performed: false,
  });
}

test("666GF projects each of the seven accepted tuples without adding authority", () => {
  for (const classification of fixedClassifications) {
    const result = projectAction666gaExitDecisionExplanation({ ...classification });

    expect(result).toMatchObject({
      projection_state: "projected",
      authority: "advisory_projection_no_execution_authority",
      classification,
      rejection_code: null,
      runtime_wired: false,
      side_effects_performed: false,
    });
    expect(result.advisory_copy).toEqual(expect.any(String));
    expect(result.advisory_copy).not.toHaveLength(0);
  }
});

test("666GF partitions the complete known vocabulary cross-product into exactly seven projections", () => {
  let projectedCount = 0;

  for (const decision_status of statusVocabulary) {
    for (const decision_reason of reasonVocabulary) {
      for (const decision_priority of priorityVocabulary) {
        const input = { decision_status, decision_reason, decision_priority };
        const result = projectAction666gaExitDecisionExplanation(input);

        if (isAcceptedClassification(input)) {
          projectedCount += 1;
          expect(result).toMatchObject({
            projection_state: "projected",
            classification: input,
          });
          continue;
        }

        expectCanonicalRejection(result, "unsupported_decision_classification");
      }
    }
  }

  expect(statusVocabulary).toHaveLength(4);
  expect(reasonVocabulary).toHaveLength(7);
  expect(priorityVocabulary).toHaveLength(7);
  expect(projectedCount).toBe(fixedClassifications.length);
});

test("666GF keeps nearby tuples rejected and malformed shapes outside the accepted partition", () => {
  for (const classification of fixedClassifications) {
    for (const input of [
      {
        ...classification,
        decision_status: `${classification.decision_status}_other`,
      },
      {
        ...classification,
        decision_reason: `${classification.decision_reason}_other`,
      },
      {
        ...classification,
        decision_priority: classification.decision_priority + 100,
      },
    ]) {
      expectCanonicalRejection(
        projectAction666gaExitDecisionExplanation(input),
        "unsupported_decision_classification",
      );
    }
  }

  for (const input of [
    { ...fixedClassifications[0], extra: "not-admitted" },
    {
      decision_status: "hold",
      decision_reason: "hold",
      get decision_priority() {
        return 7;
      },
    },
    { decision_status: "hold", decision_reason: "hold", decision_priority: 7.5 },
  ]) {
    expectCanonicalRejection(
      projectAction666gaExitDecisionExplanation(input),
      "invalid_input_shape",
    );
  }
});

test("666GF records only the source-only accepted-versus-rejected partition", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).toContain(
    "const explanations: readonly ClassifiedExplanation[] = Object.freeze([",
  );
  expect(implementation).toContain('return invalidResult("invalid_input_shape")');
  expect(implementation).toContain(
    'return invalidResult("unsupported_decision_classification")',
  );
  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(documentation).toMatch(/196-tuple known vocabulary cross-product/i);
  expect(documentation).toMatch(/no\s+implementation change is\s+necessary/i);
  expect(documentation).toMatch(/ACTION_666GG/);
  expect(source(roadmapPath)).toMatch(/Action 666GF/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GF/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
