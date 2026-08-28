import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  projectAction666gmAccessibilityAnnouncementMetadata,
} from "../../lib/action-666gm-provider-free-accessibility-announcement-metadata";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/action-666gm-provider-free-accessibility-announcement-metadata.ts";
const documentationPath =
  "docs/action-666go-accessibility-announcement-metadata-partition-review.md";
const evidencePath =
  "docs/evidence/action-666go-accessibility-announcement-metadata-partition-review.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666go-accessibility-announcement-metadata-partition-review.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

const admittedKeys = [
  ["exit_full_hard_stop", "exit_full_hard_stop_announcement"],
  ["exit_full_invalidation", "exit_full_invalidation_announcement"],
  ["exit_full_session_close", "exit_full_session_close_announcement"],
  ["exit_full_final_target", "exit_full_final_target_announcement"],
  [
    "exit_partial_first_target_partial",
    "exit_partial_first_target_partial_announcement",
  ],
  [
    "move_stop_profit_protection_stop_move",
    "move_stop_profit_protection_stop_move_announcement",
  ],
  ["hold_hold", "hold_hold_announcement"],
] as const;

test("666GO preserves the finite seven-key accepted partition", () => {
  const announcementKeys = new Set<string>();

  for (const [presentation_key, accessibility_announcement_key] of admittedKeys) {
    const result = projectAction666gmAccessibilityAnnouncementMetadata({
      presentation_key,
    });
    expect(result).toMatchObject({
      projection_state: "projected",
      accessibility_announcement_key,
      rejection_code: null,
      runtime_wired: false,
      side_effects_performed: false,
    });
    announcementKeys.add(result.accessibility_announcement_key ?? "");
  }

  expect(announcementKeys).toEqual(
    new Set(admittedKeys.map(([, announcementKey]) => announcementKey)),
  );
});

test("666GO preserves the disjoint fail-closed rejected partition", () => {
  const unsupported = admittedKeys.map(([presentation_key]) =>
    `${presentation_key}_not_admitted`,
  );
  const malformed = [
    null,
    [],
    {},
    { presentation_key: 1 },
    { presentation_key: "hold_hold", extra: true },
  ];

  for (const presentation_key of unsupported) {
    expect(
      projectAction666gmAccessibilityAnnouncementMetadata({ presentation_key }),
    ).toMatchObject({
      projection_state: "rejected",
      accessibility_announcement_key: null,
      rejection_code: "unsupported_presentation_key",
    });
  }
  for (const input of malformed) {
    expect(projectAction666gmAccessibilityAnnouncementMetadata(input)).toMatchObject({
      projection_state: "rejected",
      accessibility_announcement_key: null,
      rejection_code: "invalid_input_shape",
    });
  }
});

test("666GO remains a source-only partition review under closed delivery controls", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(implementation).not.toContain("action-655b-canonical-exit-evaluator");
  expect(documentation).toMatch(/accepted-versus-rejected partition/i);
  expect(documentation).toMatch(/no runtime capability/i);
  expect(documentation).toMatch(/ACTION_666GP/);
  expect(source(roadmapPath)).toMatch(/Action 666GO/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GO/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
