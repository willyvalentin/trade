import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const sourcePath = "lib/action-666ga-provider-free-exit-decision-explanation.ts";
const documentationPath = "docs/action-666gi-accessibility-contract-selection.md";
const evidencePath = "docs/evidence/action-666gi-accessibility-contract-selection.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest = "tests/e2e/action-666gi-accessibility-contract-selection.spec.ts";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("666GI selects only a finite provider-free advisory presentation-key successor", () => {
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
      closed_tuple_count: number;
      source_only: boolean;
      runtime_wired: boolean;
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

  expect(evidence.action_id).toBe("ACTION_666GI");
  expect(evidence.reviewed_revision.protected_main_commit).toMatch(/^[0-9a-f]{40}$/);
  expect(evidence.reviewed_revision.exact_main_ci_conclusion).toBe("success");
  expect(evidence.reviewed_revision.candidate_main_match).toBe(true);
  expect(evidence.selection).toEqual({
    selected_outcome: "finite_provider_free_advisory_presentation_key_projection",
    closed_tuple_count: 7,
    source_only: true,
    runtime_wired: false,
    evaluator_invocation_authorized: false,
    data_read_authorized: false,
    route_or_ui_authorized: false,
    provider_or_broker_authorized: false,
    writer_or_database_authorized: false,
    execution_authority: false,
    next_action: "ACTION_666GJ",
  });
  expect(evidence.delivery_controls).toMatchObject({
    new_roadmap_action_cap: 10,
    current_action_number: 1,
    prior_static_review_cap_remains_closed: true,
    full_ci_deduplication_authorized: false,
  });
  expect(documentation).toMatch(/presentation-key projection/i);
  expect(documentation).toMatch(/reopens no runtime capability/i);
  expect(documentation).toMatch(/ACTION_666GJ/);
});

test("666GI preserves the closed explanation source and CI controls", () => {
  const implementation = source(sourcePath);
  const registration = JSON.parse(source(registrationPath)) as string[];

  expect(implementation).not.toMatch(/^import\s/m);
  expect(implementation).not.toMatch(/\bfetch\s*\(|process\.env|require\s*\(/);
  expect(implementation).toContain("advisory_projection_no_execution_authority");
  expect(source(roadmapPath)).toMatch(/Current operating dashboard/);
  expect(source(ledgerPath)).toMatch(/ACTION 666GI/);
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
