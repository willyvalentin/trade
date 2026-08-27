import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gaExitDecisionExplanation,
} from "../../lib/action-666ga-provider-free-exit-decision-explanation";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/action-666ga-provider-free-exit-decision-explanation.ts";
const documentationPath =
  "docs/action-666gg-static-explanation-table-integrity.md";
const evidencePath =
  "docs/evidence/action-666gg-static-explanation-table-integrity.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gg-static-explanation-table-integrity.spec.ts";

const frozenRows = [
  {
    decision_status: "exit_full",
    decision_reason: "hard_stop",
    decision_priority: 1,
    advisory_copy:
      "Beslutet är klassificerat som hård stop. Texten återger endast en redan deklarerad klassificering.",
  },
  {
    decision_status: "exit_full",
    decision_reason: "invalidation",
    decision_priority: 2,
    advisory_copy:
      "Beslutet är klassificerat som invalidation. Texten återger endast en redan deklarerad klassificering.",
  },
  {
    decision_status: "exit_full",
    decision_reason: "session_close",
    decision_priority: 3,
    advisory_copy:
      "Beslutet är klassificerat som sessionsstängning. Texten återger endast en redan deklarerad klassificering.",
  },
  {
    decision_status: "exit_full",
    decision_reason: "final_target",
    decision_priority: 4,
    advisory_copy:
      "Beslutet är klassificerat som slutmål. Texten återger endast en redan deklarerad klassificering.",
  },
  {
    decision_status: "exit_partial",
    decision_reason: "first_target_partial",
    decision_priority: 5,
    advisory_copy:
      "Beslutet är klassificerat som första delmål. Texten återger endast en redan deklarerad klassificering.",
  },
  {
    decision_status: "move_stop",
    decision_reason: "profit_protection_stop_move",
    decision_priority: 6,
    advisory_copy:
      "Beslutet är klassificerat som vinstskydd. Texten återger endast en redan deklarerad klassificering.",
  },
  {
    decision_status: "hold",
    decision_reason: "hold",
    decision_priority: 7,
    advisory_copy:
      "Beslutet är klassificerat som avvakta. Texten återger endast en redan deklarerad klassificering.",
  },
] as const;

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function frozenTable(implementation: string) {
  const start = implementation.indexOf(
    "const explanations: readonly ClassifiedExplanation[] = Object.freeze([",
  );
  const end = implementation.indexOf("\n]);", start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return implementation.slice(start, end + "\n]);".length);
}

test("666GG retains the exact seven ordered, frozen static explanation rows", () => {
  const table = frozenTable(source(sourcePath));

  expect(table.match(/Object\.freeze\(\{/g)).toHaveLength(frozenRows.length);
  expect(table).not.toMatch(/\$\{|\.replace\(|\.concat\(|\bfetch\s*\(|process\.env|require\s*\(/);

  for (const [index, row] of frozenRows.entries()) {
    const result = projectAction666gaExitDecisionExplanation({
      decision_status: row.decision_status,
      decision_reason: row.decision_reason,
      decision_priority: row.decision_priority,
    });

    expect(result).toMatchObject({
      projection_state: "projected",
      authority: "advisory_projection_no_execution_authority",
      classification: {
        decision_status: row.decision_status,
        decision_reason: row.decision_reason,
        decision_priority: row.decision_priority,
      },
      advisory_copy: row.advisory_copy,
      rejection_code: null,
      runtime_wired: false,
      side_effects_performed: false,
    });

    const next = frozenRows[index + 1];
    const rowStart = table.indexOf(`decision_reason: \"${row.decision_reason}\"`);
    expect(rowStart).toBeGreaterThanOrEqual(0);
    if (next) {
      expect(rowStart).toBeLessThan(
        table.indexOf(`decision_reason: \"${next.decision_reason}\"`),
      );
    }
  }

  expect(
    new Set(
      frozenRows.map(
        (row) =>
          `${row.decision_status}:${row.decision_reason}:${row.decision_priority}`,
      ),
    ).size,
  ).toBe(frozenRows.length);
  expect(frozenRows.map((row) => row.decision_priority)).toEqual([1, 2, 3, 4, 5, 6, 7]);
});

test("666GG records only the source-only frozen-table integrity review", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(documentation).toMatch(/seven ordered frozen rows/i);
  expect(documentation).toMatch(/no\s+implementation change is\s+necessary/i);
  expect(documentation).toMatch(/ACTION_666GH/);
  expect(source(roadmapPath)).toMatch(/Action 666GG/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GG/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
