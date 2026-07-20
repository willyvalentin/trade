import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate.md";
const recordPath =
  "docs/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-record.json";
const action476RecordPath =
  "docs/action-476-confidence-calibration-recommendation-advisory-projection-preview-secure-netlify-authentication-record.json";
const verifierPath =
  "scripts/action-477-confidence-calibration-recommendation-advisory-projection-preview-netlify-site-linking-approval-gate-verify.mjs";
const cleanBase = "15f9923c24ed1f3cf82d34656eeacbfd98a0d347";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";
const fullCandidateHash =
  "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0";
const siteReference = "2b582e03-ac97-4371-8051-558d9980fb94";

test.setTimeout(300000);

type Action476Record = {
  authentication_verification_result: string;
  authentication_method_classification: string;
  credential_available: boolean;
  credential_value_recorded: boolean;
  authenticated_team: string;
  project_link_status: string;
  secure_authentication_decision: string;
};

type Action477Record = {
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  approved_change_candidate_file_count: number;
  authentication_verification_result: string;
  authentication_method_classification: string;
  credential_available: boolean;
  credential_value_recorded: boolean;
  authenticated_account_name: string;
  authenticated_account_email: string;
  authenticated_team: string;
  intended_site_name: string;
  intended_non_secret_site_reference: string;
  intended_ture_project_confirmed: boolean;
  current_project_link_status: string;
  conflicting_link_detected: boolean;
  linked_site_name: string | null;
  linked_non_secret_site_reference: string | null;
  existing_site_required: boolean;
  site_creation_authorized: boolean;
  site_clone_authorized: boolean;
  site_rename_authorized: boolean;
  future_linking_operation_classification: string;
  future_linking_command_boundary: {
    approved_cli_family: string;
    approved_site_id_argument: string;
    approved_equivalent_command: string;
    execution_syntax_requires_cli_confirmation_in_action_478: boolean;
    interactive_site_selection_authorized: boolean;
    site_name_only_linking_authorized: boolean;
    new_site_creation_authorized: boolean;
    relink_from_existing_site_authorized: boolean;
    deployment_as_part_of_linking_authorized: boolean;
    environment_modification_authorized: boolean;
    production_change_authorized: boolean;
  };
  required_post_link_checks: {
    authenticated: boolean;
    linked: boolean;
    linked_site_name: string;
    linked_non_secret_site_reference: string;
    site_name_match: boolean;
    site_reference_match: boolean;
    production_unchanged: boolean;
    deployment_performed: boolean;
    preview_activated: boolean;
    environment_modified: boolean;
    credential_values_exposed: boolean;
  };
  local_metadata_boundary: Record<string, boolean>;
  failure_behavior: Record<string, string | boolean>;
  deployment_authorized: boolean;
  preview_activation_authorized: boolean;
  environment_modification_authorized: boolean;
  production_change_authorized: boolean;
  linking_decision: string;
  linking_performed: boolean;
  unlinking_performed: boolean;
  deployment_performed: boolean;
  preview_activated: boolean;
  environment_modified: boolean;
  production_changed: boolean;
  credential_value_recorded_by_action_477: boolean;
  netlify_api_called: boolean;
  netlify_link_run: boolean;
  netlify_unlink_run: boolean;
  netlify_deploy_run: boolean;
  netlify_configuration_modified: boolean;
  preview_flag_name: string;
  preview_flag_state: string;
  preview_flag_enabled: boolean;
  runtime_preview_state: string;
  next_action: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  linking_decision: string;
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

function linkingDecisionFor(candidate: Partial<Action477Record>): string {
  if (candidate.authentication_verification_result !== "authentication_succeeded") {
    return "site_linking_not_approved";
  }
  if (candidate.current_project_link_status !== "not_linked") return "site_linking_not_approved";
  if (candidate.conflicting_link_detected !== false) return "site_linking_not_approved";
  if (candidate.intended_site_name !== "trade-vl") return "site_linking_not_approved";
  if (candidate.intended_non_secret_site_reference !== siteReference) {
    return "site_linking_not_approved";
  }
  if (candidate.future_linking_command_boundary?.site_name_only_linking_authorized !== false) {
    return "site_linking_not_approved";
  }
  if (candidate.future_linking_command_boundary?.new_site_creation_authorized !== false) {
    return "site_linking_not_approved";
  }
  return "site_linking_approved_for_future_action";
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

test.describe("Action 477 Netlify site linking approval gate", () => {
  test("adds documentation, record, verifier, and focused test with passing verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Future Command Boundary");
    expect(doc).toContain("Linking decision: `site_linking_approved_for_future_action`");
    expect(doc).toContain("Project link status: `not_linked`");
    expect(doc).toContain("action_478_netlify_site_linking_execution");
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 476 authentication success and candidate hashes", () => {
    const action476 = readJson<Action476Record>(action476RecordPath);
    const record = readJson<Action477Record>(recordPath);

    expect(action476.authentication_verification_result).toBe("authentication_succeeded");
    expect(action476.authentication_method_classification).toBe("existing_authenticated_cli");
    expect(action476.credential_available).toBe(true);
    expect(action476.credential_value_recorded).toBe(false);
    expect(action476.authenticated_team).toBe("Valentin Labs AB");
    expect(action476.project_link_status).toBe("not_linked");
    expect(action476.secure_authentication_decision).toBe("secure_authentication_complete");
    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.approved_change_candidate_file_count).toBe(30);
    expect(verifierReport.checks.action476_binding).toBe(true);
    expect(verifierReport.checks.candidate_binding).toBe(true);
  });

  test("freezes intended site name, site reference, and authenticated team", () => {
    const record = readJson<Action477Record>(recordPath);

    expect(record.intended_site_name).toBe("trade-vl");
    expect(record.intended_non_secret_site_reference).toBe(siteReference);
    expect(record.intended_ture_project_confirmed).toBe(true);
    expect(record.authenticated_account_name).toBe("Willy Valentin");
    expect(record.authenticated_account_email).toBe("willysimonsson@gmail.com");
    expect(record.authenticated_team).toBe("Valentin Labs AB");
    expect(verifierReport.checks.intended_site).toBe(true);
    expect(verifierReport.checks.authentication_and_team).toBe(true);
  });

  test("records current not-linked state and blocks conflicting links", () => {
    const record = readJson<Action477Record>(recordPath);

    expect(record.current_project_link_status).toBe("not_linked");
    expect(record.conflicting_link_detected).toBe(false);
    expect(record.linked_site_name).toBeNull();
    expect(record.linked_non_secret_site_reference).toBeNull();
    expect(linkingDecisionFor({ ...record, current_project_link_status: "linked" })).toBe(
      "site_linking_not_approved",
    );
    expect(linkingDecisionFor({ ...record, conflicting_link_detected: true })).toBe(
      "site_linking_not_approved",
    );
    expect(verifierReport.checks.current_link_state).toBe(true);
  });

  test("enforces no-new-site and exact site-ID linking policy", () => {
    const record = readJson<Action477Record>(recordPath);

    expect(record.existing_site_required).toBe(true);
    expect(record.site_creation_authorized).toBe(false);
    expect(record.site_clone_authorized).toBe(false);
    expect(record.site_rename_authorized).toBe(false);
    expect(record.future_linking_operation_classification).toBe("exact_existing_site_id_link_only");
    expect(record.future_linking_command_boundary.approved_cli_family).toBe("netlify link");
    expect(record.future_linking_command_boundary.approved_site_id_argument).toBe(siteReference);
    expect(record.future_linking_command_boundary.approved_equivalent_command).toBe(
      `netlify link --id ${siteReference}`,
    );
    expect(record.future_linking_command_boundary.interactive_site_selection_authorized).toBe(false);
    expect(record.future_linking_command_boundary.site_name_only_linking_authorized).toBe(false);
    expect(record.future_linking_command_boundary.new_site_creation_authorized).toBe(false);
    expect(linkingDecisionFor({ ...record, intended_non_secret_site_reference: "ambiguous" })).toBe(
      "site_linking_not_approved",
    );
    expect(
      linkingDecisionFor({
        ...record,
        future_linking_command_boundary: {
          ...record.future_linking_command_boundary,
          site_name_only_linking_authorized: true,
        },
      }),
    ).toBe("site_linking_not_approved");
    expect(verifierReport.checks.no_new_site_policy).toBe(true);
    expect(verifierReport.checks.future_command_boundary).toBe(true);
  });

  test("requires post-link verification and bounded local metadata only", () => {
    const record = readJson<Action477Record>(recordPath);

    expect(record.required_post_link_checks.authenticated).toBe(true);
    expect(record.required_post_link_checks.linked).toBe(true);
    expect(record.required_post_link_checks.linked_site_name).toBe("trade-vl");
    expect(record.required_post_link_checks.linked_non_secret_site_reference).toBe(siteReference);
    expect(record.required_post_link_checks.production_unchanged).toBe(true);
    expect(record.required_post_link_checks.deployment_performed).toBe(false);
    expect(record.required_post_link_checks.preview_activated).toBe(false);
    expect(record.required_post_link_checks.environment_modified).toBe(false);
    expect(record.local_metadata_boundary.normal_netlify_link_metadata_permitted).toBe(true);
    expect(record.local_metadata_boundary.commit_local_netlify_state_authorized).toBe(false);
    expect(record.local_metadata_boundary.record_config_file_contents_authorized).toBe(false);
    expect(record.local_metadata_boundary.record_auth_tokens_authorized).toBe(false);
    expect(verifierReport.checks.post_link_checks).toBe(true);
    expect(verifierReport.checks.local_metadata_policy).toBe(true);
  });

  test("prohibits credential values, deployment, activation, environment modification, and production change", () => {
    const record = readJson<Action477Record>(recordPath);
    const recordText = read(recordPath);

    expect(record.credential_value_recorded).toBe(false);
    expect(record.credential_value_recorded_by_action_477).toBe(false);
    expect(record.deployment_authorized).toBe(false);
    expect(record.preview_activation_authorized).toBe(false);
    expect(record.environment_modification_authorized).toBe(false);
    expect(record.production_change_authorized).toBe(false);
    expect(record.preview_flag_name).toBe("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(record.preview_flag_state).toBe("disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(recordText).not.toMatch(/token\s*[:=]/i);
    expect(recordText).not.toMatch(/password\s*[:=]/i);
    expect(recordText).not.toMatch(/api[_-]?key\s*[:=]/i);
    expect(recordText).not.toMatch(/secret\s*[:=]/i);
    expect(verifierReport.checks.credential_policy).toBe(true);
    expect(verifierReport.checks.deployment_activation_production_policy).toBe(true);
  });

  test("freezes failure behavior with no same-action repair", () => {
    const record = readJson<Action477Record>(recordPath);

    expect(record.failure_behavior.authentication_unavailable).toBe("linking_aborted");
    expect(record.failure_behavior.already_linked_to_another_site).toBe("linking_aborted");
    expect(record.failure_behavior.linking_requires_site_creation).toBe("linking_aborted");
    expect(record.failure_behavior.credential_exposure_requested).toBe("linking_aborted");
    expect(record.failure_behavior.post_link_status_mismatch).toBe("linking_failed");
    expect(record.failure_behavior.same_action_relink_or_repair_attempt_authorized).toBe(false);
    expect(verifierReport.checks.failure_behavior).toBe(true);
  });

  test("approves only future site linking and sets mandatory Action 478", () => {
    const record = readJson<Action477Record>(recordPath);

    expect(record.linking_decision).toBe("site_linking_approved_for_future_action");
    expect(record.linking_performed).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(record.next_action).toBe("action_478_netlify_site_linking_execution");
    expect(verifierReport.linking_decision).toBe("site_linking_approved_for_future_action");
    expect(verifierReport.next_action).toBe("action_478_netlify_site_linking_execution");
    expect(verifierReport.checks.decision).toBe(true);
  });

  test("performs no linking, deployment, activation, environment mutation, or downstream effects", () => {
    const record = readJson<Action477Record>(recordPath);

    expect(record.linking_performed).toBe(false);
    expect(record.unlinking_performed).toBe(false);
    expect(record.netlify_link_run).toBe(false);
    expect(record.netlify_unlink_run).toBe(false);
    expect(record.netlify_deploy_run).toBe(false);
    expect(record.netlify_api_called).toBe(false);
    expect(record.netlify_configuration_modified).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.production_changed).toBe(false);
    expect(Object.values(verifierReport.no_effect_results).every(Boolean)).toBe(true);
    expect(verifierReport.checks.no_side_effects).toBe(true);
  });

  test("keeps runtime preview waiting", () => {
    const record = readJson<Action477Record>(recordPath);

    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.runtime_state).toBe(true);
  });
});
