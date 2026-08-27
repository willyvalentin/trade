import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gaExitDecisionExplanation,
} from "../../lib/action-666ga-provider-free-exit-decision-explanation";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/action-666ga-provider-free-exit-decision-explanation.ts";
const documentationPath =
  "docs/action-666gc-exit-explanation-adversarial-input-contract.md";
const evidencePath =
  "docs/evidence/action-666gc-exit-explanation-adversarial-input-contract.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gc-exit-explanation-adversarial-input-contract.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function defineHoldOwnData(target: object) {
  Object.defineProperties(target, {
    decision_status: { enumerable: true, value: "hold" },
    decision_reason: { enumerable: true, value: "hold" },
    decision_priority: { enumerable: true, value: 7 },
  });
  return target;
}

test("666GC derives valid projections only from exact own data descriptors", () => {
  let inheritedGetterReads = 0;
  const hostilePrototype = {};
  Object.defineProperty(hostilePrototype, "decision_status", {
    get() {
      inheritedGetterReads += 1;
      throw new Error("inherited getter must not run");
    },
  });

  const nullPrototypeInput = defineHoldOwnData(Object.create(null));
  const customPrototypeInput = Object.freeze(
    defineHoldOwnData(Object.create(hostilePrototype)),
  );
  const missingOwnStatus = Object.create(hostilePrototype);
  Object.defineProperties(missingOwnStatus, {
    decision_reason: { enumerable: true, value: "hold" },
    decision_priority: { enumerable: true, value: 7 },
  });
  const before = Object.getOwnPropertyDescriptors(customPrototypeInput);

  for (const input of [nullPrototypeInput, customPrototypeInput]) {
    expect(projectAction666gaExitDecisionExplanation(input)).toMatchObject({
      projection_state: "projected",
      classification: {
        decision_status: "hold",
        decision_reason: "hold",
        decision_priority: 7,
      },
      runtime_wired: false,
      side_effects_performed: false,
    });
  }
  expect(projectAction666gaExitDecisionExplanation(missingOwnStatus)).toMatchObject({
    projection_state: "rejected",
    rejection_code: "invalid_input_shape",
  });
  expect(Object.getOwnPropertyDescriptors(customPrototypeInput)).toEqual(before);
  expect(inheritedGetterReads).toBe(0);
});

test("666GC contains failed exotic descriptor observation as a fail-closed result", () => {
  const throwingProxy = new Proxy({}, {
    ownKeys() {
      throw new Error("descriptor observation denied");
    },
  });

  expect(() => projectAction666gaExitDecisionExplanation(throwingProxy)).not.toThrow();
  expect(projectAction666gaExitDecisionExplanation(throwingProxy)).toMatchObject({
    projection_state: "rejected",
    authority: "advisory_projection_no_execution_authority",
    rejection_code: "invalid_input_shape",
    runtime_wired: false,
    side_effects_performed: false,
  });
});

test("666GC records only the source-only adversarial input boundary", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).toContain("function readOwnDescriptors");
  expect(implementation).toMatch(/catch\s*\{\s*return null;/);
  expect(implementation).not.toContain("Object.getPrototypeOf");
  expect(documentation).toMatch(/throwing Proxy/i);
  expect(documentation).toMatch(/not inspected, read or mutated/i);
  expect(documentation).toMatch(/ACTION_666GD/);
  expect(source(roadmapPath)).toMatch(/Action 666GC/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GC/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
