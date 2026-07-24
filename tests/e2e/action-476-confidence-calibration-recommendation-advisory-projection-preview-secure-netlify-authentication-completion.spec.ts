import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-completion.md";
const recordPath =
  "docs/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-record.json";
const action475RecordPath =
  "docs/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-record.json";
const verifierPath =
  "scripts/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-completion-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";

test.setTimeout(300000);

type Action475Record = {
  netlify_site_name: string;
  non_secret_site_reference: string;
  netlify_target_decision: string;
  authentication_completion_decision: string;
  overall_readiness: string;
};

type Action476Record = {
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  intended_site_name: string;
  intended_non_secret_site_reference: string;
  authentication_method_classification: string;
  credential_available: boolean;
  credential_value_recorded: boolean;
  credential_storage_modified_by_action: boolean;
  authentication_verification_result: string;
  authenticated_account_name: string;
  authenticated_account_email: string;
  authenticated_team: string;
  live_netlify_command_run_by_action_476: boolean;
  project_link_status: string;
  linked_site_name: string | null;
  linked_non_secret_site_reference: string | null;
  site_name_match: boolean | null;
  site_reference_match: boolean | null;
  deployment_performed: boolean;
  site_linking_performed: boolean;
  environment_modified: boolean;
  preview_activated: boolean;
  production_changed: boolean;
  preview_flag_name: string;
  preview_flag_state: string;
  netlify_link_run: boolean;
  netlify_deploy_run: boolean;
  netlify_deployment_api_called: boolean;
  oauth_initiated_by_action: boolean;
  netlify_config_contents_inspected: boolean;
  netlify_cli_credential_added: boolean;
  persistence_created: boolean;
  replay_executed: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  confidence_applied: boolean;
  feedback_created: boolean;
  recommendation_mutated: boolean;
  ranking_changed: boolean;
  scanner_changed: boolean;
  publication_changed: boolean;
  execution_changed: boolean;
  secure_authentication_decision: string;
  netlify_target_access_decision: string;
  overall_readiness: string;
  unresolved_conditions: string[];
  invalid_conditions: string[];
  runtime_preview_state: string;
  next_action: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  secure_authentication_decision: string;
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

test.describe("Action 476 secure Netlify authentication completion", () => {
  test("adds documentation, record, verifier, and focused test with passing verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Authentication Result");
    expect(doc).toContain("Authentication method classification: `existing_authenticated_cli`");
    expect(doc).toContain("Project link status: `not_linked`");
    expect(doc).toContain("Secure authentication decision: `secure_authentication_complete`");
    expect(doc).toContain("action_477_netlify_site_linking_approval_gate");
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 475 target and verified candidate hashes", () => {
    const action475 = readJson<Action475Record>(action475RecordPath);
    const record = readJson<Action476Record>(recordPath);

    expect(action475.netlify_site_name).toBe("trade-vl");
    expect(action475.non_secret_site_reference).toBe("2b582e03-ac97-4371-8051-558d9980fb94");
    expect(action475.netlify_target_decision).toBe("netlify_target_ready");
    expect(action475.authentication_completion_decision).toBe("secure_authentication_required");
    expect(action475.overall_readiness).toBe("ready_with_conditions");
    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.intended_site_name).toBe("trade-vl");
    expect(record.intended_non_secret_site_reference).toBe(
      "2b582e03-ac97-4371-8051-558d9980fb94",
    );
    expect(verifierReport.checks.action475_binding).toBe(true);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("records secure CLI authentication success without recording a credential value", () => {
    const record = readJson<Action476Record>(recordPath);
    const recordText = read(recordPath);

    expect(record.authentication_method_classification).toBe("existing_authenticated_cli");
    expect(record.credential_available).toBe(true);
    expect(record.credential_value_recorded).toBe(false);
    expect(record.credential_storage_modified_by_action).toBe(false);
    expect(record.authentication_verification_result).toBe("authentication_succeeded");
    expect(record.live_netlify_command_run_by_action_476).toBe(false);
    expect(recordText).not.toMatch(/token\s*[:=]/i);
    expect(recordText).not.toMatch(/password\s*[:=]/i);
    expect(recordText).not.toMatch(/api[_-]?key\s*[:=]/i);
    expect(recordText).not.toMatch(/secret\s*[:=]/i);
    expect(recordText).not.toMatch(/cookie\s*[:=]/i);
    expect(verifierReport.checks.authentication_result).toBe(true);
    expect(verifierReport.checks.credential_policy).toBe(true);
  });

  test("records bounded authenticated account and team metadata", () => {
    const record = readJson<Action476Record>(recordPath);

    expect(record.authenticated_account_name).toBe("Willy Valentin");
    expect(record.authenticated_account_email).toBe("willysimonsson@gmail.com");
    expect(record.authenticated_team).toBe("Valentin Labs AB");
    expect(verifierReport.checks.account_team).toBe(true);
  });

  test("classifies the local project as not linked with no conflicting linked site", () => {
    const record = readJson<Action476Record>(recordPath);

    expect(record.project_link_status).toBe("not_linked");
    expect(record.linked_site_name).toBeNull();
    expect(record.linked_non_secret_site_reference).toBeNull();
    expect(record.site_name_match).toBeNull();
    expect(record.site_reference_match).toBeNull();
    expect(verifierReport.checks.project_link_status).toBe(true);
  });

  test("keeps preview flag disabled and production unchanged", () => {
    const record = readJson<Action476Record>(recordPath);

    expect(record.preview_flag_name).toBe("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(record.preview_flag_state).toBe("disabled");
    expect(record.preview_activated).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(verifierReport.checks.preview_flag).toBe(true);
  });

  test("returns secure authentication complete and target access ready with linking condition", () => {
    const record = readJson<Action476Record>(recordPath);

    expect(record.secure_authentication_decision).toBe("secure_authentication_complete");
    expect(record.netlify_target_access_decision).toBe("netlify_target_access_ready_with_conditions");
    expect(record.overall_readiness).toBe("ready_with_conditions");
    expect(record.unresolved_conditions).toEqual([
      "local_project_requires_approved_site_linking",
    ]);
    expect(record.invalid_conditions).toEqual([]);
    expect(record.next_action).toBe("action_477_netlify_site_linking_approval_gate");
    expect(verifierReport.secure_authentication_decision).toBe("secure_authentication_complete");
    expect(verifierReport.netlify_target_access_decision).toBe(
      "netlify_target_access_ready_with_conditions",
    );
    expect(verifierReport.overall_readiness).toBe("ready_with_conditions");
    expect(verifierReport.next_action).toBe("action_477_netlify_site_linking_approval_gate");
  });

  test("performs no deployment, site linking, environment mutation, activation, or downstream effects", () => {
    const record = readJson<Action476Record>(recordPath);

    expect(record.deployment_performed).toBe(false);
    expect(record.site_linking_performed).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.netlify_link_run).toBe(false);
    expect(record.netlify_deploy_run).toBe(false);
    expect(record.netlify_deployment_api_called).toBe(false);
    expect(record.oauth_initiated_by_action).toBe(false);
    expect(record.netlify_config_contents_inspected).toBe(false);
    expect(record.netlify_cli_credential_added).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_executed).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.recommendation_mutated).toBe(false);
    expect(record.ranking_changed).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(record.publication_changed).toBe(false);
    expect(record.execution_changed).toBe(false);
    expect(Object.values(verifierReport.no_effect_results).every(Boolean)).toBe(true);
    expect(verifierReport.checks.no_side_effects).toBe(true);
  });

  test("keeps runtime preview waiting for operator inputs", () => {
    const record = readJson<Action476Record>(recordPath);

    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.runtime_state).toBe(true);
  });
});
