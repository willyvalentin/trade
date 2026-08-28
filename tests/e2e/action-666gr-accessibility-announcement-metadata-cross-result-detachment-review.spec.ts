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
  "docs/action-666gr-accessibility-announcement-metadata-cross-result-detachment-review.md";
const evidencePath =
  "docs/evidence/action-666gr-accessibility-announcement-metadata-cross-result-detachment-review.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gr-accessibility-announcement-metadata-cross-result-detachment-review.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function expectFrozenScalarResult(
  result: ReturnType<typeof projectAction666gmAccessibilityAnnouncementMetadata>,
) {
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.getOwnPropertySymbols(result)).toEqual([]);
  expect(
    Object.values(result).every(
      (value) => value === null || typeof value !== "object",
    ),
  ).toBe(true);
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(result))) {
    expect("value" in descriptor).toBe(true);
    expect(descriptor.writable).toBe(false);
    expect(descriptor.configurable).toBe(false);
  }
}

test("666GR detaches each accepted and rejected result from every other result", () => {
  const acceptedHardStop = projectAction666gmAccessibilityAnnouncementMetadata({
    presentation_key: "exit_full_hard_stop",
  });
  const acceptedHold = projectAction666gmAccessibilityAnnouncementMetadata({
    presentation_key: "hold_hold",
  });
  const rejectedInvalid = projectAction666gmAccessibilityAnnouncementMetadata({});
  const rejectedUnsupported =
    projectAction666gmAccessibilityAnnouncementMetadata({
      presentation_key: "not_in_the_closed_vocabulary",
    });
  const results = [
    acceptedHardStop,
    acceptedHold,
    rejectedInvalid,
    rejectedUnsupported,
  ];

  for (const result of results) expectFrozenScalarResult(result);
  expect(new Set(results).size).toBe(results.length);
  expect(acceptedHardStop.accessibility_announcement_key).toBe(
    "exit_full_hard_stop_announcement",
  );
  expect(acceptedHold.accessibility_announcement_key).toBe("hold_hold_announcement");
  expect(rejectedInvalid.accessibility_announcement_key).toBeNull();
  expect(rejectedUnsupported.accessibility_announcement_key).toBeNull();
  expect(rejectedInvalid.rejection_code).toBe("invalid_input_shape");
  expect(rejectedUnsupported.rejection_code).toBe("unsupported_presentation_key");
});

test("666GR prevents a rejected result from mutating or aliasing an accepted result", () => {
  const accepted = projectAction666gmAccessibilityAnnouncementMetadata({
    presentation_key: "hold_hold",
  });
  const rejected = projectAction666gmAccessibilityAnnouncementMetadata(null);

  expect(Reflect.set(rejected, "accessibility_announcement_key", "caller_value")).toBe(
    false,
  );
  expect(Reflect.set(accepted, "rejection_code", "invalid_input_shape")).toBe(false);
  expect(accepted).toMatchObject({
    projection_state: "projected",
    accessibility_announcement_key: "hold_hold_announcement",
    rejection_code: null,
  });
  expect(rejected).toMatchObject({
    projection_state: "rejected",
    accessibility_announcement_key: null,
    rejection_code: "invalid_input_shape",
  });
});

test("666GR records the final source-only detachment review without a successor", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).toMatch(/function rejectedResult\(/);
  expect(implementation).toMatch(/return Object\.freeze\(\{/);
  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(documentation).toMatch(/cross-result detachment review/i);
  expect(documentation).toMatch(/no implementation change is necessary/i);
  expect(documentation).toMatch(/no successor\s+action is\s+authorized/i);
  expect(source(roadmapPath)).toMatch(/Action 666GR/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GR/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
