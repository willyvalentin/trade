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
  "docs/action-666gp-accessibility-announcement-metadata-rejected-result-review.md";
const evidencePath =
  "docs/evidence/action-666gp-accessibility-announcement-metadata-rejected-result-review.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gp-accessibility-announcement-metadata-rejected-result-review.spec.ts";

const resultKeys = [
  "accessibility_announcement_key",
  "authority",
  "contract_version",
  "projection_state",
  "rejection_code",
  "runtime_wired",
  "side_effects_performed",
];

const canonicalRejectedPayload = {
  contract_version:
    "action_666gm_provider_free_accessibility_announcement_metadata_v1",
  projection_state: "rejected",
  authority: "advisory_accessibility_metadata_no_execution_authority",
  accessibility_announcement_key: null,
  runtime_wired: false,
  side_effects_performed: false,
} as const;

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function expectCanonicalRejection(
  result: ReturnType<typeof projectAction666gmAccessibilityAnnouncementMetadata>,
  rejection_code: "invalid_input_shape" | "unsupported_presentation_key",
) {
  expect(result).toEqual({ ...canonicalRejectedPayload, rejection_code });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.keys(result).sort()).toEqual(resultKeys);
  expect(Object.getOwnPropertySymbols(result)).toEqual([]);
  for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(result))) {
    expect("value" in descriptor).toBe(true);
    expect(descriptor.writable).toBe(false);
    expect(descriptor.configurable).toBe(false);
  }
  expect(Reflect.set(result, "rejection_code", null)).toBe(false);
}

test("666GP gives every malformed input a fresh closed invalid-shape result", () => {
  let getterRead = false;
  const malformedInputs = [
    undefined,
    null,
    false,
    0,
    "hold_hold",
    [],
    {},
    { presentation_key: 1 },
    { presentation_key: "hold_hold", extra: true },
    Object.create(null),
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
  const results = malformedInputs.map((input) =>
    projectAction666gmAccessibilityAnnouncementMetadata(input),
  );

  for (const result of results) {
    expectCanonicalRejection(result, "invalid_input_shape");
  }
  expect(getterRead).toBe(false);
  expect(new Set(results).size).toBe(results.length);
});

test("666GP makes unsupported exact shapes differ only by their fixed rejection code", () => {
  const invalidShape = projectAction666gmAccessibilityAnnouncementMetadata({});
  const unsupportedPresentationKey =
    projectAction666gmAccessibilityAnnouncementMetadata({
      presentation_key: "not_in_the_closed_vocabulary",
    });

  expectCanonicalRejection(invalidShape, "invalid_input_shape");
  expectCanonicalRejection(
    unsupportedPresentationKey,
    "unsupported_presentation_key",
  );
  expect(unsupportedPresentationKey).not.toBe(invalidShape);
  expect({
    ...unsupportedPresentationKey,
    rejection_code: "invalid_input_shape",
  }).toEqual(invalidShape);
});

test("666GP records only the source-only rejected-result review boundary", () => {
  const implementation = source(sourcePath);
  const documentation = [source(documentationPath), source(evidencePath)].join("\n");
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).toMatch(/function rejectedResult\(/);
  expect(implementation).toContain(
    'return rejectedResult("invalid_input_shape")',
  );
  expect(implementation).toContain(
    'return rejectedResult("unsupported_presentation_key")',
  );
  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(documentation).toMatch(/canonical rejected-result review/i);
  expect(documentation).toMatch(/only\s+`rejection_code` differs/i);
  expect(documentation).toMatch(/no implementation change is necessary/i);
  expect(documentation).toMatch(/ACTION_666GQ/);
  expect(source(roadmapPath)).toMatch(/Action 666GP/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GP/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
