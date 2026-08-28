import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const sourcePath =
  "lib/action-666gm-provider-free-accessibility-announcement-metadata.ts";
const documentationPath =
  "docs/action-666gn-accessibility-announcement-metadata-static-containment.md";
const evidencePath =
  "docs/evidence/action-666gn-accessibility-announcement-metadata-static-containment.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gn-accessibility-announcement-metadata-static-containment.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function filesBelow(relativeDirectory: string): string[] {
  const absoluteDirectory = resolve(root, relativeDirectory);
  return readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = `${relativeDirectory}/${entry.name}`;
    return entry.isDirectory() ? filesBelow(relativePath) : [relativePath];
  });
}

const closedMetadataTable = [
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

test("666GN statically preserves the exact seven-key accessibility metadata table", () => {
  const implementation = source(sourcePath);

  for (const [presentationKey, announcementKey] of closedMetadataTable) {
    expect(implementation).toMatch(
      new RegExp(`${presentationKey}:\\s*\"${announcementKey}\"`),
    );
  }
  expect(implementation.match(/_announcement\"/g)).toHaveLength(7);
  expect(implementation).toContain("Object.freeze({");
  expect(implementation).toContain("unsupported_presentation_key");
  expect(implementation).toContain("invalid_input_shape");
});

test("666GN retains source-only metadata containment with no runtime consumer", () => {
  const implementation = source(sourcePath);
  const runtimeFiles = ["app", "components", "lib"]
    .flatMap(filesBelow)
    .filter((relativePath) => relativePath !== sourcePath)
    .filter((relativePath) => /\.(?:ts|tsx|js|jsx)$/.test(relativePath));
  const runtimeConsumers = runtimeFiles.filter((relativePath) =>
    source(relativePath).includes(
      "projectAction666gmAccessibilityAnnouncementMetadata",
    ),
  );

  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(implementation).not.toContain("action-655b-canonical-exit-evaluator");
  expect(implementation).not.toMatch(
    /aria-live|<(?:div|span|section|p|button)\b|recommendation|price|quantity/i,
  );
  expect(runtimeConsumers).toEqual([]);
});

test("666GN records only static containment and preserves delivery controls", () => {
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(documentation).toMatch(/static containment review/i);
  expect(documentation).toMatch(/no runtime consumer/i);
  expect(documentation).toMatch(/ACTION_666GO/);
  expect(source(roadmapPath)).toMatch(/Action 666GN/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GN/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
