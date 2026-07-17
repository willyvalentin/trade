import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution.md";
const recordPath =
  "docs/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-record.json";
const action477RecordPath =
  "docs/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-record.json";
const verifierPath =
  "scripts/action-478-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-execution-verify.mjs";
const action476VerifierPath =
  "scripts/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-completion-verify.mjs";
const action477VerifierPath =
  "scripts/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const siteReference = "2b582e03-ac97-4371-8051-558d9980fb94";
const nextAction =
  "action_479_confidence_calibration_recommendation_advisory_projection_preview_deployment_retry_approval_gate";

test.setTimeout(300000);

type Action477Record = {
  linking_decision: string;
  future_linking_operation_classification: string;
  intended_site_name: string;
  intended_non_secret_site_reference: string;
  authenticated_team: string;
  deployment_performed: boolean;
  preview_activated: boolean;
  production_changed: boolean;
};

type Action478Record = {
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  approved_change_candidate_file_count: number;
  original_candidate_hash_preserved: boolean;
  candidate_boundary_treatment: string;
  authentication_method_classification: string;
  credential_available: boolean;
  credential_value_recorded: boolean;
  credential_files_inspected: boolean;
  authenticated_account_name: string;
  authenticated_account_email: string;
  authenticated_team: string;
  authentication_team_compatible_with_approval: boolean;
  linking_command_classification: string;
  linking_attempt_count: number;
  linking_result: string;
  linked_site_name: string;
  linked_non_secret_site_reference: string;
  site_name_match: boolean;
  site_reference_match: boolean;
  conflicting_link_detected: boolean;
  netlify_toml_detected: boolean;
  project_url_classification: string;
  admin_url_recorded: boolean;
  local_netlify_metadata_created: boolean;
  local_netlify_metadata_contents_inspected: boolean;
  netlify_directory_tracked: boolean;
  netlify_directory_ignored: boolean;
  netlify_directory_added_to_candidate: boolean;
  gitignore_modified_by_linking: boolean;
  gitignore_change_result: string;
  gitignore_candidate_classification: string;
  gitignore_unrelated_change_detected: boolean;
  gitignore_secret_bearing_path_exposed: boolean;
  gitignore_prevents_local_netlify_metadata_tracking: boolean;
  deployment_performed: boolean;
  netlify_deploy_run: boolean;
  netlify_deploy_prod_run: boolean;
  deployment_api_called: boolean;
  preview_url_created_by_action: boolean;
  build_deployed: boolean;
  environment_modified: boolean;
  netlify_env_set_run: boolean;
  environment_file_modified: boolean;
  preview_activated: boolean;
  production_changed: boolean;
  production_alias_changed: boolean;
  preview_flag_name: string;
  preview_flag_state: string;
  preview_flag_enabled: boolean;
  site_linking_decision: string;
  netlify_target_access_decision: string;
  overall_readiness: string;
  runtime_preview_state: string;
  next_action: string;
  next_action_constraints: Record<string, boolean>;
  no_effect_flags: Record<string, boolean>;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  gitignore_diff_classification: string;
  tracked_netlify_file_count: number;
  site_linking_decision: string;
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

function classifyGitignoreDiff(diff: string): string {
  if (!diff.trim()) return "safe_existing_ignore_rule_unchanged";

  const bodyLines = diff
    .split("\n")
    .filter((line) => !line.startsWith("diff --git "))
    .filter((line) => !line.startsWith("index "))
    .filter((line) => !line.startsWith("--- "))
    .filter((line) => !line.startsWith("+++ "))
    .filter((line) => !line.startsWith("@@"));

  const removedLines = bodyLines
    .filter((line) => line.startsWith("-"))
    .map((line) => line.slice(1));
  const addedLines = bodyLines
    .filter((line) => line.startsWith("+"))
    .map((line) => line.slice(1));
  const allowedAddedLines = ["", "# Local Netlify folder", ".netlify", ".netlify/"];

  if (removedLines.length > 0) return "blocked_unexpected_gitignore_change";
  if (addedLines.length === 0) return "blocked_unexpected_gitignore_change";
  if (!addedLines.every((line) => allowedAddedLines.includes(line))) {
    return "blocked_unexpected_gitignore_change";
  }
  if (!addedLines.includes(".netlify") && !addedLines.includes(".netlify/")) {
    return "blocked_unexpected_gitignore_change";
  }
  return "safe_linking_metadata_ignore_update";
}

function linkingDecisionFor(candidate: Partial<Action478Record>): string {
  if (candidate.linking_result !== "linking_succeeded") return "linking_failed_or_mismatched";
  if (candidate.linked_site_name !== "trade-vl") return "linking_failed_or_mismatched";
  if (candidate.linked_non_secret_site_reference !== siteReference) {
    return "linking_failed_or_mismatched";
  }
  if (candidate.authenticated_team !== "Valentin Labs AB") return "linking_failed_or_mismatched";
  if (candidate.conflicting_link_detected !== false) return "linking_failed_or_mismatched";
  if (candidate.netlify_directory_tracked !== false) return "linking_failed_or_mismatched";
  if (candidate.gitignore_change_result === "blocked_unexpected_gitignore_change") {
    return "linking_failed_or_mismatched";
  }
  if (candidate.deployment_performed !== false) return "linking_failed_or_mismatched";
  if (candidate.environment_modified !== false) return "linking_failed_or_mismatched";
  if (candidate.preview_activated !== false) return "linking_failed_or_mismatched";
  if (candidate.production_changed !== false) return "linking_failed_or_mismatched";
  if (candidate.credential_value_recorded !== false) return "linking_failed_or_mismatched";
  if (candidate.gitignore_unrelated_change_detected) return "linking_succeeded_with_conditions";
  return "linking_succeeded_verified";
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

test.describe("Action 478 Netlify site linking execution verification", () => {
  test("adds documentation, record, verifier, and focused test with passing verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 478 records and independently verifies");
    expect(doc).toContain("Action 477 Approval Binding");
    expect(doc).toContain("Classification: `safe_linking_metadata_ignore_update`");
    expect(doc).toContain("Site-linking decision: `linking_succeeded_verified`");
    expect(doc).toContain(nextAction);
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 477 approval and preserves candidate hashes", () => {
    const action477 = readJson<Action477Record>(action477RecordPath);
    const record = readJson<Action478Record>(recordPath);

    expect(action477.linking_decision).toBe("site_linking_approved_for_future_action");
    expect(action477.future_linking_operation_classification).toBe("exact_existing_site_id_link_only");
    expect(action477.intended_site_name).toBe("trade-vl");
    expect(action477.intended_non_secret_site_reference).toBe(siteReference);
    expect(action477.authenticated_team).toBe("Valentin Labs AB");
    expect(action477.deployment_performed).toBe(false);
    expect(action477.preview_activated).toBe(false);
    expect(action477.production_changed).toBe(false);
    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.approved_change_candidate_file_count).toBe(30);
    expect(record.original_candidate_hash_preserved).toBe(true);
    expect(verifierReport.checks.action477_approval).toBe(true);
    expect(verifierReport.checks.candidate_hashes).toBe(true);
  });

  test("records authentication success, account, and team compatibility without credential values", () => {
    const record = readJson<Action478Record>(recordPath);

    expect(record.authentication_method_classification).toBe("existing_authenticated_cli");
    expect(record.credential_available).toBe(true);
    expect(record.credential_value_recorded).toBe(false);
    expect(record.credential_files_inspected).toBe(false);
    expect(record.authenticated_account_name).toBe("Willy Valentin");
    expect(record.authenticated_account_email).toBe("willysimonsson@gmail.com");
    expect(record.authenticated_team).toBe("Valentin Labs AB");
    expect(record.authentication_team_compatible_with_approval).toBe(true);
    expect(verifierReport.checks.authentication_success).toBe(true);
    expect(verifierReport.checks.no_secret_values).toBe(true);
  });

  test("verifies exact site name and ID for successful linking", () => {
    const record = readJson<Action478Record>(recordPath);

    expect(record.linking_command_classification).toBe("exact_existing_site_id_link");
    expect(record.linking_attempt_count).toBe(1);
    expect(record.linking_result).toBe("linking_succeeded");
    expect(record.linked_site_name).toBe("trade-vl");
    expect(record.linked_non_secret_site_reference).toBe(siteReference);
    expect(record.site_name_match).toBe(true);
    expect(record.site_reference_match).toBe(true);
    expect(verifierReport.checks.exact_site_identity).toBe(true);
  });

  test("rejects conflicting or mismatched link identity", () => {
    const record = readJson<Action478Record>(recordPath);

    expect(record.conflicting_link_detected).toBe(false);
    expect(linkingDecisionFor({ ...record, conflicting_link_detected: true })).toBe(
      "linking_failed_or_mismatched",
    );
    expect(linkingDecisionFor({ ...record, linked_site_name: "other-site" })).toBe(
      "linking_failed_or_mismatched",
    );
    expect(linkingDecisionFor({ ...record, linked_non_secret_site_reference: "other-id" })).toBe(
      "linking_failed_or_mismatched",
    );
  });

  test("classifies local .netlify metadata as ignored, untracked, and excluded", () => {
    const record = readJson<Action478Record>(recordPath);

    expect(record.local_netlify_metadata_created).toBe(true);
    expect(record.local_netlify_metadata_contents_inspected).toBe(false);
    expect(record.netlify_directory_tracked).toBe(false);
    expect(record.netlify_directory_ignored).toBe(true);
    expect(record.netlify_directory_added_to_candidate).toBe(false);
    expect(verifierReport.tracked_netlify_file_count).toBe(0);
    expect(verifierReport.checks.local_netlify_metadata).toBe(true);
  });

  test("classifies the bounded .gitignore addition and blocks unexpected mutations", () => {
    const record = readJson<Action478Record>(recordPath);
    const diff = execFileSync("git", ["diff", "--", ".gitignore"], {
      cwd: root,
      encoding: "utf8",
    });

    expect(record.gitignore_modified_by_linking).toBe(true);
    expect(record.gitignore_change_result).toBe("safe_linking_metadata_ignore_update");
    expect(record.gitignore_candidate_classification).toBe(
      "local_operational_metadata_only_excluded_from_deployed_application_candidate",
    );
    expect(record.gitignore_unrelated_change_detected).toBe(false);
    expect(record.gitignore_secret_bearing_path_exposed).toBe(false);
    expect(record.gitignore_prevents_local_netlify_metadata_tracking).toBe(true);
    expect(classifyGitignoreDiff(diff)).toBe("safe_linking_metadata_ignore_update");
    expect(classifyGitignoreDiff(`${diff}\n+secrets.txt\n`)).toBe(
      "blocked_unexpected_gitignore_change",
    );
    expect(verifierReport.gitignore_diff_classification).toBe(
      "safe_linking_metadata_ignore_update",
    );
    expect(verifierReport.checks.gitignore_change).toBe(true);
  });

  test("preserves the original candidate boundary separately from local metadata", () => {
    const record = readJson<Action478Record>(recordPath);

    expect(record.original_candidate_hash_preserved).toBe(true);
    expect(record.candidate_boundary_treatment).toBe(
      "original_30_file_candidate_preserved_gitignore_link_metadata_separate_local_operational_boundary",
    );
    expect(record.netlify_directory_added_to_candidate).toBe(false);
  });

  test("confirms no deployment, activation, environment modification, or production change", () => {
    const record = readJson<Action478Record>(recordPath);

    expect(record.deployment_performed).toBe(false);
    expect(record.netlify_deploy_run).toBe(false);
    expect(record.netlify_deploy_prod_run).toBe(false);
    expect(record.deployment_api_called).toBe(false);
    expect(record.preview_url_created_by_action).toBe(false);
    expect(record.build_deployed).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.netlify_env_set_run).toBe(false);
    expect(record.environment_file_modified).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(record.production_alias_changed).toBe(false);
    expect(verifierReport.checks.no_deployment).toBe(true);
    expect(verifierReport.checks.no_environment_or_activation).toBe(true);
  });

  test("keeps preview flag disabled and runtime preview waiting", () => {
    const record = readJson<Action478Record>(recordPath);

    expect(record.preview_flag_name).toBe("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(record.preview_flag_state).toBe("disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.runtime_state).toBe(true);
  });

  test("uses required result vocabulary and mandates Action 479 approval-only handoff", () => {
    const record = readJson<Action478Record>(recordPath);

    expect(record.site_linking_decision).toBe("linking_succeeded_verified");
    expect(record.netlify_target_access_decision).toBe("netlify_target_access_ready");
    expect(record.overall_readiness).toBe("ready");
    expect(linkingDecisionFor(record)).toBe("linking_succeeded_verified");
    expect(linkingDecisionFor({ ...record, gitignore_unrelated_change_detected: true })).toBe(
      "linking_succeeded_with_conditions",
    );
    expect(record.next_action).toBe(nextAction);
    expect(record.next_action_constraints.approval_only).toBe(true);
    expect(record.next_action_constraints.preview_activation_during_deployment_authorized).toBe(
      false,
    );
    expect(verifierReport.checks.decisions).toBe(true);
    expect(verifierReport.checks.next_action_constraints).toBe(true);
  });

  test("performs no downstream effects and keeps Actions 476-477 healthy", () => {
    const action476 = JSON.parse(
      execFileSync("node", [action476VerifierPath], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 160 * 1024 * 1024,
      }),
    ) as { verification_status: string; failed_conditions: string[] };
    const action477 = JSON.parse(
      execFileSync("node", [action477VerifierPath], {
        cwd: root,
        encoding: "utf8",
        maxBuffer: 160 * 1024 * 1024,
      }),
    ) as { verification_status: string; failed_conditions: string[] };

    expect(action476.verification_status).toBe("passed");
    expect(action476.failed_conditions).toEqual([]);
    expect(action477.verification_status).toBe("passed");
    expect(action477.failed_conditions).toEqual([]);
    expect(Object.values(verifierReport.no_effect_results).every(Boolean)).toBe(true);
    expect(verifierReport.checks.no_side_effects).toBe(true);
  });
});
