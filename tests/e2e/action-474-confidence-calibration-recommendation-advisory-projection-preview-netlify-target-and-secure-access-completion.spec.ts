import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-completion.md";
const recordPath =
  "docs/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-record.json";
const action473InventoryPath =
  "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json";
const verifierPath =
  "scripts/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-completion-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";

test.setTimeout(300000);

type Action473Inventory = {
  repository_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  overlaid_file_count: number;
  full_candidate_decision: string;
};

type Action474Record = {
  schema_version: string;
  source_action: number;
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  netlify_site_name: string | null;
  non_secret_site_reference: string | null;
  intended_ture_project_confirmed: boolean | null;
  environment_classification: string;
  deploy_previews_supported: boolean | null;
  production_alias_protected: boolean | null;
  production_unchanged_required: boolean;
  initial_preview_flag_state: string;
  disabled_first_deployment_supported: boolean | null;
  credential_available: boolean | null;
  authentication_method_classification: string | null;
  credential_value_recorded: boolean;
  secure_access_verification_result: string;
  deployment_retry_gate_explicitly_approved: boolean | null;
  operator_inputs_supplied: boolean;
  unresolved_field_names: string[];
  invalid_field_names: string[];
  netlify_target_access_decision: string;
  overall_readiness: string;
  next_action: string;
  deployment_performed: boolean;
  authentication_performed: boolean;
  oauth_initiated: boolean;
  netlify_deployment_api_called: boolean;
  netlify_deployment_command_run: boolean;
  site_linked_or_relinked: boolean;
  environment_modified: boolean;
  preview_flag_enabled: boolean;
  preview_activated: boolean;
  production_changed: boolean;
  confidence_applied: boolean;
  persistence_created: boolean;
  replay_executed: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  feedback_created: boolean;
  recommendation_mutated: boolean;
  ranking_changed: boolean;
  scanner_changed: boolean;
  runtime_preview_state: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  unresolved_field_names: string[];
  netlify_target_access_decision: string;
  overall_readiness: string;
  next_action: string;
  no_effect_results: Record<string, boolean>;
};

let verifierReport: VerifierReport;

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

test.beforeAll(() => {
  verifierReport = JSON.parse(
    execFileSync("node", [verifierPath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  ) as VerifierReport;
});

test.describe("Action 474 Netlify target and secure access completion", () => {
  test("adds documentation, record, verifier, and focused test with passing verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Candidate Binding");
    expect(doc).toContain("No explicit operator-supplied Netlify site or secure-access values were provided");
    expect(doc).toContain("Netlify target/access decision: `netlify_target_access_blocked`");
    expect(doc).toContain("action_475_netlify_target_operator_input_completion_gate");
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds to the verified Action 473 full candidate", () => {
    const action473 = readJson<Action473Inventory>(action473InventoryPath);
    const record = readJson<Action474Record>(recordPath);

    expect(action473.repository_base_identifier).toBe(cleanBase);
    expect(action473.approved_change_candidate_hash).toBe(candidateHash);
    expect(action473.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(action473.overlaid_file_count).toBe(30);
    expect(action473.full_candidate_decision).toBe("full_candidate_ready_with_conditions");
    expect(record.source_action).toBe(473);
    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(verifierReport.checks.action473_binding).toBe(true);
  });

  test("records missing operator Netlify inputs as unresolved instead of invented", () => {
    const record = readJson<Action474Record>(recordPath);

    expect(record.operator_inputs_supplied).toBe(false);
    expect(record.netlify_site_name).toBeNull();
    expect(record.non_secret_site_reference).toBeNull();
    expect(record.intended_ture_project_confirmed).toBeNull();
    expect(record.deploy_previews_supported).toBeNull();
    expect(record.production_alias_protected).toBeNull();
    expect(record.disabled_first_deployment_supported).toBeNull();
    expect(record.credential_available).toBeNull();
    expect(record.authentication_method_classification).toBeNull();
    expect(record.deployment_retry_gate_explicitly_approved).toBeNull();
    expect(record.invalid_field_names).toEqual([]);
    expect(verifierReport.checks.unresolved_operator_inputs).toBe(true);
  });

  test("keeps target policy non-production preview and disabled first", () => {
    const record = readJson<Action474Record>(recordPath);

    expect(record.environment_classification).toBe("non_production_preview");
    expect(record.production_unchanged_required).toBe(true);
    expect(record.initial_preview_flag_state).toBe("disabled");
    expect(record.secure_access_verification_result).toBe(
      "blocked_missing_operator_target_and_access_inputs",
    );
    expect(verifierReport.checks.target_policy).toBe(true);
  });

  test("stores no credential value or secret-like access material", () => {
    const record = readJson<Action474Record>(recordPath);
    const recordText = read(recordPath);

    expect(record.credential_value_recorded).toBe(false);
    expect(recordText).not.toMatch(/token\s*[:=]/i);
    expect(recordText).not.toMatch(/password\s*[:=]/i);
    expect(recordText).not.toMatch(/api[_-]?key\s*[:=]/i);
    expect(recordText).not.toMatch(/secret\s*[:=]/i);
    expect(recordText).not.toMatch(/cookie\s*[:=]/i);
    expect(recordText).not.toMatch(/private[_-]?key\s*[:=]/i);
    expect(verifierReport.checks.credential_policy).toBe(true);
  });

  test("blocks target access readiness until target and secure access are confirmed", () => {
    const record = readJson<Action474Record>(recordPath);

    expect(record.netlify_target_access_decision).toBe("netlify_target_access_blocked");
    expect(record.overall_readiness).toBe("blocked");
    expect(record.next_action).toBe("action_475_netlify_target_operator_input_completion_gate");
    expect(verifierReport.netlify_target_access_decision).toBe("netlify_target_access_blocked");
    expect(verifierReport.overall_readiness).toBe("blocked");
    expect(verifierReport.next_action).toBe("action_475_netlify_target_operator_input_completion_gate");
    expect(verifierReport.checks.decisions).toBe(true);
  });

  test("performs no auth, deploy, site link, env mutation, activation, provider, Supabase, replay, or scanner effects", () => {
    const record = readJson<Action474Record>(recordPath);

    expect(record.deployment_performed).toBe(false);
    expect(record.authentication_performed).toBe(false);
    expect(record.oauth_initiated).toBe(false);
    expect(record.netlify_deployment_api_called).toBe(false);
    expect(record.netlify_deployment_command_run).toBe(false);
    expect(record.site_linked_or_relinked).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_executed).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.recommendation_mutated).toBe(false);
    expect(record.ranking_changed).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(Object.values(verifierReport.no_effect_results).every(Boolean)).toBe(true);
    expect(verifierReport.checks.no_side_effects).toBe(true);
  });

  test("leaves runtime preview waiting for operator inputs", () => {
    const record = readJson<Action474Record>(recordPath);

    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.runtime_state).toBe(true);
  });
});
