import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const documentationPath =
  "docs/action-666gl-advisory-accessibility-presentation-selection.md";
const evidencePath =
  "docs/evidence/action-666gl-advisory-accessibility-presentation-selection.json";
const presentationKeySourcePath =
  "lib/action-666gj-provider-free-exit-explanation-presentation-key.ts";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666gl-advisory-accessibility-presentation-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("666GL selects one finite source-only accessibility metadata successor", () => {
  const documentation = source(documentationPath);
  const evidence = JSON.parse(source(evidencePath)) as {
    action_id: string;
    reviewed_revision: {
      protected_main_commit: string;
      exact_main_ci_conclusion: string;
      candidate_main_match: boolean;
    };
    selection: {
      selected_outcome: string;
      input_vocabulary: string;
      closed_key_count: number;
      source_only: boolean;
      runtime_wired: boolean;
      accessibility_ui_semantics_bound: boolean;
      evaluator_invocation_authorized: boolean;
      data_read_authorized: boolean;
      route_or_ui_authorized: boolean;
      provider_or_broker_authorized: boolean;
      writer_or_database_authorized: boolean;
      execution_authority: boolean;
      next_action: string;
    };
    delivery_controls: {
      new_roadmap_action_cap: number;
      current_action_number: number;
      prior_static_review_cap_remains_closed: boolean;
      full_ci_deduplication_authorized: boolean;
    };
  };

  expect(evidence.action_id).toBe("ACTION_666GL");
  expect(evidence.reviewed_revision.protected_main_commit).toMatch(/^[0-9a-f]{40}$/);
  expect(evidence.reviewed_revision.exact_main_ci_conclusion).toBe("success");
  expect(evidence.reviewed_revision.candidate_main_match).toBe(true);
  expect(evidence.selection).toEqual({
    selected_outcome:
      "finite_provider_free_accessibility_announcement_metadata_projection",
    input_vocabulary: "seven_fixed_action_666gj_presentation_keys",
    closed_key_count: 7,
    source_only: true,
    runtime_wired: false,
    accessibility_ui_semantics_bound: false,
    evaluator_invocation_authorized: false,
    data_read_authorized: false,
    route_or_ui_authorized: false,
    provider_or_broker_authorized: false,
    writer_or_database_authorized: false,
    execution_authority: false,
    next_action: "ACTION_666GM",
  });
  expect(evidence.delivery_controls).toMatchObject({
    new_roadmap_action_cap: 10,
    current_action_number: 4,
    prior_static_review_cap_remains_closed: true,
    full_ci_deduplication_authorized: false,
  });
  expect(documentation).toMatch(/accessibility-announcement metadata projection/i);
  expect(documentation).toMatch(/reopens no runtime capability/i);
  expect(documentation).toMatch(/ACTION_666GM/);
});

test("666GL retains the seven-key source boundary and closed delivery controls", () => {
  const presentationKeySource = source(presentationKeySourcePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(presentationKeySource).not.toMatch(/^import\s/m);
  expect(presentationKeySource).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(presentationKeySource.match(/presentation_key:\s*"/g)).toHaveLength(7);
  expect(source(roadmapPath)).toMatch(/Action 666GL/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GL/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
