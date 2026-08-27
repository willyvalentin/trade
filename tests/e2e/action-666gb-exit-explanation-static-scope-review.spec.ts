import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gaExitDecisionExplanation,
} from "../../lib/action-666ga-provider-free-exit-decision-explanation";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/action-666ga-provider-free-exit-decision-explanation.ts";
const documentationPath =
  "docs/action-666gb-exit-explanation-static-scope-review.md";
const evidencePath =
  "docs/evidence/action-666gb-exit-explanation-static-scope-review.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gb-exit-explanation-static-scope-review.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function productionRuntimeFiles() {
  const output = execFileSync(
    "git",
    ["ls-files", "app", "components", "lib/server", "pages"],
    { cwd: root, encoding: "utf8" },
  );
  return output.split("\n").filter(Boolean);
}

test("666GB independently confirms the projection has no import or runtime consumer", () => {
  const implementation = source(sourcePath);
  const runtimeReferences = productionRuntimeFiles().filter((relativePath) => {
    const candidate = source(relativePath);
    return (
      candidate.includes(sourcePath) ||
      candidate.includes("projectAction666gaExitDecisionExplanation")
    );
  });

  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).toContain("Object.getOwnPropertyDescriptors");
  expect(implementation).not.toContain("action-655b-canonical-exit-evaluator");
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(runtimeReferences).toEqual([]);
});

test("666GB confirms accessor, symbol and non-enumerable expansion reject without getter execution", () => {
  let getterInvoked = false;
  const accessorInput = {};
  Object.defineProperties(accessorInput, {
    decision_status: {
      enumerable: true,
      get() {
        getterInvoked = true;
        return "hold";
      },
    },
    decision_reason: { enumerable: true, value: "hold" },
    decision_priority: { enumerable: true, value: 7 },
  });

  const hiddenExpansion = {
    decision_status: "hold",
    decision_reason: "hold",
    decision_priority: 7,
  };
  Object.defineProperty(hiddenExpansion, "price", { value: "100" });

  const symbolExpansion = {
    decision_status: "hold",
    decision_reason: "hold",
    decision_priority: 7,
    [Symbol("position")]: "forbidden",
  };

  for (const input of [accessorInput, hiddenExpansion, symbolExpansion]) {
    expect(projectAction666gaExitDecisionExplanation(input)).toMatchObject({
      projection_state: "rejected",
      authority: "advisory_projection_no_execution_authority",
      rejection_code: "invalid_input_shape",
      runtime_wired: false,
      side_effects_performed: false,
    });
  }
  expect(getterInvoked).toBe(false);
});

test("666GB binds the independent scope review into unchanged provider-free verification", () => {
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/no runtime\s+consumer/i);
  expect(documentation).toMatch(/no implementation change is necessary/i);
  expect(documentation).toMatch(/ACTION_666GC/);
  expect(source(roadmapPath)).toMatch(/Current bounded workstream/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GB/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
