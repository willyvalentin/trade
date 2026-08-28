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
  "docs/action-666gq-accessibility-announcement-metadata-accepted-result-review.md";
const evidencePath =
  "docs/evidence/action-666gq-accessibility-announcement-metadata-accepted-result-review.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gq-accessibility-announcement-metadata-accepted-result-review.spec.ts";

const resultKeys = [
  "accessibility_announcement_key",
  "authority",
  "contract_version",
  "projection_state",
  "rejection_code",
  "runtime_wired",
  "side_effects_performed",
];

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

const canonicalProjectedPayload = {
  contract_version:
    "action_666gm_provider_free_accessibility_announcement_metadata_v1",
  projection_state: "projected",
  authority: "advisory_accessibility_metadata_no_execution_authority",
  rejection_code: null,
  runtime_wired: false,
  side_effects_performed: false,
} as const;

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function expectCanonicalProjection(
  result: ReturnType<typeof projectAction666gmAccessibilityAnnouncementMetadata>,
  accessibility_announcement_key: string,
) {
  expect(result).toEqual({
    ...canonicalProjectedPayload,
    accessibility_announcement_key,
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.keys(result).sort()).toEqual(resultKeys);
  expect(Object.getOwnPropertySymbols(result)).toEqual([]);
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(result))) {
    expect("value" in descriptor).toBe(true);
    expect(descriptor.writable).toBe(false);
    expect(descriptor.configurable).toBe(false);
  }
  expect(Reflect.set(result, "accessibility_announcement_key", null)).toBe(false);
}

test("666GQ gives each admitted key a fresh canonical projected result", () => {
  const results = admittedKeys.map(
    ([presentation_key, accessibility_announcement_key]) => {
      const result = projectAction666gmAccessibilityAnnouncementMetadata({
        presentation_key,
      });
      expectCanonicalProjection(result, accessibility_announcement_key);
      return result;
    },
  );

  expect(new Set(results).size).toBe(results.length);
  expect(
    new Set(results.map((result) => result.accessibility_announcement_key)),
  ).toEqual(new Set(admittedKeys.map(([, announcementKey]) => announcementKey)));
});

test("666GQ detaches the frozen projected result from subsequent caller mutation", () => {
  const input: { presentation_key: string } = { presentation_key: "hold_hold" };
  const first = projectAction666gmAccessibilityAnnouncementMetadata(input);
  input.presentation_key = "exit_full_hard_stop";
  const second = projectAction666gmAccessibilityAnnouncementMetadata(input);

  expectCanonicalProjection(first, "hold_hold_announcement");
  expectCanonicalProjection(second, "exit_full_hard_stop_announcement");
  expect(first).not.toBe(second);
});

test("666GQ records only the source-only accepted-result review boundary", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).toContain("const announcementKeys");
  expect(implementation).toMatch(/return Object\.freeze\(\{/);
  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(documentation).toMatch(/canonical accepted-result review/i);
  expect(documentation).toMatch(/fresh frozen\s+projected result/i);
  expect(documentation).toMatch(/no implementation change is necessary/i);
  expect(documentation).toMatch(/ACTION_666GR/);
  expect(source(roadmapPath)).toMatch(/Action 666GQ/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GQ/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
