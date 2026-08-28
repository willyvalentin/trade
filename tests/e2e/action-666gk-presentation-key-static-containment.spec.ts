import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/action-666gj-provider-free-exit-explanation-presentation-key.ts";
const documentationPath =
  "docs/action-666gk-presentation-key-static-containment.md";
const evidencePath =
  "docs/evidence/action-666gk-presentation-key-static-containment.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gk-presentation-key-static-containment.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sourceFiles(relativeDirectory: string): string[] {
  return readdirSync(resolve(root, relativeDirectory), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const relativePath = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(relativePath);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [relativePath] : [];
  });
}

const expectedTable = [
  ["exit_full", "hard_stop", "1", "exit_full_hard_stop"],
  ["exit_full", "invalidation", "2", "exit_full_invalidation"],
  ["exit_full", "session_close", "3", "exit_full_session_close"],
  ["exit_full", "final_target", "4", "exit_full_final_target"],
  ["exit_partial", "first_target_partial", "5", "exit_partial_first_target_partial"],
  ["move_stop", "profit_protection_stop_move", "6", "move_stop_profit_protection_stop_move"],
  ["hold", "hold", "7", "hold_hold"],
];

test("666GK statically freezes the seven fixed presentation-key tuples", () => {
  const implementation = source(sourcePath);
  const table = implementation.match(
    /const presentationKeys:[\s\S]*?Object\.freeze\(\[([\s\S]*?)\]\);/,
  )?.[1];

  expect(table).toBeTruthy();
  const tuples = Array.from(
    table!.matchAll(
      /decision_status: "([^"]+)",\s*decision_reason: "([^"]+)",\s*decision_priority: (\d+),\s*presentation_key: "([^"]+)",/g,
    ),
    (match) => match.slice(1),
  );
  expect(tuples).toEqual(expectedTable);
  expect(new Set(tuples.map((tuple) => tuple[3])).size).toBe(7);
  expect(implementation.match(/presentation_key: "[^"]+"/g)).toHaveLength(7);
});

test("666GK preserves a static source-only boundary with no runtime consumer", () => {
  const implementation = source(sourcePath);
  const projectSources = ["app", "components", "lib"].flatMap(sourceFiles);
  const consumers = projectSources.filter(
    (relativePath) =>
      relativePath !== sourcePath &&
      source(relativePath).includes(
        "action-666gj-provider-free-exit-explanation-presentation-key",
      ),
  );

  expect(implementation).not.toMatch(/^\s*import\s/m);
  expect(implementation).not.toContain("action-655b-canonical-exit-evaluator");
  expect(implementation).not.toMatch(
    /\bfetch\s*\(|process\.env|\brequire\s*\(|\bnode:(?:fs|http|https|net)|\bhttps?:\/\//,
  );
  expect(consumers).toEqual([]);
});

test("666GK records only static containment and preserves delivery controls", () => {
  const documentation = [source(documentationPath), source(evidencePath)].join(
    "\n",
  );
  const evidence = JSON.parse(source(evidencePath)) as {
    action_id: string;
    reviewed_revision: { exact_main_ci_conclusion: string; candidate_main_match: boolean };
    static_containment: {
      tuple_count: number;
      fixed_key_count: number;
      runtime_consumers: number;
      source_imports: number;
    };
    delivery_controls: {
      current_action_number: number;
      full_ci_deduplication_authorized: boolean;
      runtime_activation_authorized: boolean;
    };
  };
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(evidence.action_id).toBe("ACTION_666GK");
  expect(evidence.reviewed_revision.exact_main_ci_conclusion).toBe("success");
  expect(evidence.reviewed_revision.candidate_main_match).toBe(true);
  expect(evidence.static_containment).toMatchObject({
    tuple_count: 7,
    fixed_key_count: 7,
    runtime_consumers: 0,
    source_imports: 0,
  });
  expect(evidence.delivery_controls).toMatchObject({
    current_action_number: 3,
    full_ci_deduplication_authorized: false,
    runtime_activation_authorized: false,
  });
  expect(documentation).toMatch(/no production source change/i);
  expect(documentation).toMatch(/no evaluator, data, provider, secret, network/i);
  expect(documentation).toMatch(/no route, UI or runtime consumer/i);
  expect(source(roadmapPath)).toMatch(/Action 666GK/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GK/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
