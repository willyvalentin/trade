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
  "docs/action-666gm-provider-free-accessibility-announcement-metadata.md";
const evidencePath =
  "docs/evidence/action-666gm-provider-free-accessibility-announcement-metadata.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gm-provider-free-accessibility-announcement-metadata.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

const allowedKeys = [
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

test("666GM projects every closed presentation key into fixed accessibility metadata", () => {
  for (const [presentation_key, accessibility_announcement_key] of allowedKeys) {
    const result = projectAction666gmAccessibilityAnnouncementMetadata({
      presentation_key,
    });
    expect(result).toEqual({
      contract_version:
        "action_666gm_provider_free_accessibility_announcement_metadata_v1",
      projection_state: "projected",
      authority: "advisory_accessibility_metadata_no_execution_authority",
      accessibility_announcement_key,
      rejection_code: null,
      runtime_wired: false,
      side_effects_performed: false,
    });
    expect(Object.isFrozen(result)).toBe(true);
  }
});

test("666GM rejects malformed, expanded and unknown presentation keys fail-closed", () => {
  let getterRead = false;
  const rejected = [
    null,
    [],
    {},
    { presentation_key: 1 },
    { presentation_key: "hold_hold", caller: "not-admitted" },
    Object.create({ presentation_key: "hold_hold" }),
    Object.defineProperty({}, "presentation_key", {
      enumerable: true,
      get() {
        getterRead = true;
        return "hold_hold";
      },
    }),
    new Proxy({}, {
      ownKeys() {
        throw new Error("descriptor observation must fail closed");
      },
    }),
  ];

  for (const input of rejected) {
    const result = projectAction666gmAccessibilityAnnouncementMetadata(input);
    expect(result).toMatchObject({
      projection_state: "rejected",
      authority: "advisory_accessibility_metadata_no_execution_authority",
      accessibility_announcement_key: null,
      runtime_wired: false,
      side_effects_performed: false,
    });
    expect(Object.isFrozen(result)).toBe(true);
  }
  expect(getterRead).toBe(false);
  expect(
    projectAction666gmAccessibilityAnnouncementMetadata({
      presentation_key: "not_in_the_closed_vocabulary",
    }).rejection_code,
  ).toBe("unsupported_presentation_key");
});

test("666GM preserves the selected source-only metadata boundary and delivery controls", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(implementation).not.toContain("action-655b-canonical-exit-evaluator");
  expect(implementation).not.toMatch(
    /aria-live|<(?:div|span|section|p|button)\b|recommendation|price|quantity/i,
  );
  expect(implementation).toContain(
    "advisory_accessibility_metadata_no_execution_authority",
  );
  expect(documentation).toMatch(/seven fixed Action 666GJ presentation keys/i);
  expect(documentation).toMatch(/no rendered message, ARIA attribute or runtime wiring/i);
  expect(documentation).toMatch(/ACTION_666GN/);
  expect(source(roadmapPath)).toMatch(/Action 666GM/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GM/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
