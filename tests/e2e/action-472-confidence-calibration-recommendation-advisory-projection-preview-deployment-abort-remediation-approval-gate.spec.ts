import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-gate.md";
const recordPath =
  "docs/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-record.json";
const verifierPath =
  "scripts/action-472-confidence-calibration-recommendation-advisory-projection-preview-deployment-abort-remediation-approval-gate-verify.mjs";
const action471RecordPath =
  "docs/action-471-confidence-calibration-recommendation-advisory-projection-preview-deployment-execution-record.json";
const candidateHash =
  "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6";

test.setTimeout(300000);

type Action472Record = {
  schema_version: string;
  approval_decision: string;
  approved_change_candidate: {
    candidate_hash: string;
    candidate_file_count: number;
    complete_deployment_source: boolean;
  };
  repository_base: {
    exact_base_identifier_required: boolean;
    exact_base_identifier: string | null;
    clean_base_verified: boolean;
  };
  full_isolated_deployment_candidate: Record<string, boolean | string>;
  approved_construction_method: string[];
  candidate_application_policy: Record<string, boolean>;
  full_candidate_inventory_contract: Record<string, boolean | string>;
  full_candidate_hash_policy: Record<string, boolean>;
  buildability_requirements: string[];
  serial_check_policy: Record<string, boolean>;
  netlify_target_policy: Record<string, boolean>;
  credential_availability_policy: {
    credential_available: boolean;
    verification_result: string;
    credential_values_allowed_in_artifacts: boolean;
  };
  preview_flag_policy: {
    flag_name: string;
    current_state: string;
    action_472_changes_flag: boolean;
    activation_requires_later_separate_action: boolean;
  };
  deployment_activation_separation: Record<string, boolean>;
  stop_conditions: string[];
  failed_conditions: string[];
  unresolved_conditions: string[];
  next_permitted_action: string;
  runtime_preview_state: string;
  deployment_status: string;
  deployment_performed: boolean;
  preview_activated: boolean;
  environment_modified: boolean;
  confidence_applied: boolean;
};

type Action471Record = {
  deployment_result: string;
  deployment_attempt_count: number;
  candidate_inventory_hash: string;
  candidate_file_count: number;
  preview_activated: boolean;
  confidence_applied: boolean;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
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

test.describe("Action 472 deployment abort remediation approval gate", () => {
  test("adds documentation, record, verifier, and focused test with passing verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Repository-Base Problem");
    expect(doc).toContain("## Approved Full-Candidate Construction Policy");
    expect(doc).toContain("## Netlify Site-Association Policy");
    expect(doc).toContain("Decision: `approved_with_conditions`");
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds Action 471 deployment_aborted result and exact candidate", () => {
    const action471 = readJson<Action471Record>(action471RecordPath);
    const record = readJson<Action472Record>(recordPath);

    expect(action471.deployment_result).toBe("deployment_aborted");
    expect(action471.deployment_attempt_count).toBe(0);
    expect(action471.candidate_inventory_hash).toBe(candidateHash);
    expect(action471.candidate_file_count).toBe(30);
    expect(action471.preview_activated).toBe(false);
    expect(action471.confidence_applied).toBe(false);
    expect(record.approved_change_candidate.candidate_hash).toBe(candidateHash);
    expect(record.approved_change_candidate.candidate_file_count).toBe(30);
    expect(verifierReport.checks.action471_abort_result).toBe(true);
  });

  test("distinguishes approved change candidate from full deployment candidate", () => {
    const record = readJson<Action472Record>(recordPath);

    expect(record.approved_change_candidate.complete_deployment_source).toBe(false);
    expect(record.repository_base.exact_base_identifier_required).toBe(true);
    expect(record.repository_base.exact_base_identifier).toBeNull();
    expect(record.repository_base.clean_base_verified).toBe(false);
    expect(record.full_isolated_deployment_candidate.constructed).toBe(false);
    expect(verifierReport.checks.terminology).toBe(true);
  });

  test("approves deterministic temporary construction without touching the dirty worktree", () => {
    const record = readJson<Action472Record>(recordPath);

    expect(record.approved_construction_method).toContain(
      "create_temporary_full_repository_candidate_outside_active_worktree_from_verified_clean_base",
    );
    expect(record.approved_construction_method).toContain(
      "apply_exactly_approved_30_candidate_file_contents",
    );
    expect(record.full_isolated_deployment_candidate.temporary_workspace_required).toBe(
      true,
    );
    expect(record.full_isolated_deployment_candidate.dirty_worktree_deployment_allowed).toBe(
      false,
    );
    expect(record.full_isolated_deployment_candidate.unrelated_dirty_worktree_changes_allowed).toBe(
      false,
    );
  });

  test("freezes exact 30-file application and secret/environment exclusion", () => {
    const policy = readJson<Action472Record>(recordPath).candidate_application_policy;

    expect(policy.path_set_must_match_action_466).toBe(true);
    expect(policy.candidate_content_hashes_must_match).toBe(true);
    expect(policy.deletions_outside_approved_scope_allowed).toBe(false);
    expect(policy.unrelated_post_trade_files_allowed).toBe(false);
    expect(policy.environment_files_allowed).toBe(false);
    expect(policy.secret_files_allowed).toBe(false);
    expect(policy.mismatch_blocks_readiness).toBe(true);
  });

  test("defines full-candidate inventory and deterministic hash policy", () => {
    const record = readJson<Action472Record>(recordPath);

    expect(record.full_candidate_inventory_contract.future_artifact).toBe(
      "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json",
    );
    expect(record.full_candidate_inventory_contract.full_candidate_inventory_hash_required).toBe(
      true,
    );
    expect(record.full_candidate_hash_policy.deterministic).toBe(true);
    expect(record.full_candidate_hash_policy.exclude_credentials).toBe(true);
    expect(record.full_candidate_hash_policy.exclude_environment_values).toBe(true);
  });

  test("requires serial buildability checks and preview consumer coverage", () => {
    const record = readJson<Action472Record>(recordPath);

    expect(record.buildability_requirements).toContain("npx next typegen");
    expect(record.buildability_requirements).toContain("npx tsc --noEmit");
    expect(record.buildability_requirements).toContain("npm run build");
    expect(record.buildability_requirements).toContain("npm run lint");
    expect(record.buildability_requirements).toContain("Action 461 preview consumer suite");
    expect(record.buildability_requirements).toContain(
      "Action 462 independent preview consumer suite",
    );
    expect(record.buildability_requirements).toContain(
      "exact runtime projection call-site count equals 1",
    );
    expect(record.serial_check_policy.temp_path_sensitive_checks_must_run_serially).toBe(
      true,
    );
  });

  test("requires non-production Netlify target verification and metadata-only credentials", () => {
    const record = readJson<Action472Record>(recordPath);

    expect(record.netlify_target_policy.site_association_required).toBe(true);
    expect(record.netlify_target_policy.site_association_verified).toBe(false);
    expect(record.netlify_target_policy.target_must_be_non_production).toBe(true);
    expect(record.netlify_target_policy.production_alias_replacement_allowed).toBe(
      false,
    );
    expect(record.credential_availability_policy.credential_available).toBe(false);
    expect(record.credential_availability_policy.verification_result).toBe("conditional");
    expect(record.credential_availability_policy.credential_values_allowed_in_artifacts).toBe(
      false,
    );
  });

  test("keeps flag disabled and deployment/activation separated", () => {
    const record = readJson<Action472Record>(recordPath);

    expect(record.preview_flag_policy.flag_name).toBe(
      "CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED",
    );
    expect(record.preview_flag_policy.current_state).toBe("disabled");
    expect(record.preview_flag_policy.action_472_changes_flag).toBe(false);
    expect(record.preview_flag_policy.activation_requires_later_separate_action).toBe(
      true,
    );
    expect(record.deployment_activation_separation.deployment_allowed_in_action_472).toBe(
      false,
    );
    expect(record.deployment_activation_separation.activation_allowed_in_action_472).toBe(
      false,
    );
  });

  test("freezes stop conditions, conditional approval, and mandatory Action 473", () => {
    const record = readJson<Action472Record>(recordPath);

    expect(record.stop_conditions).toContain("clean_repository_base_cannot_be_identified");
    expect(record.stop_conditions).toContain("credential_access_unavailable");
    expect(record.stop_conditions).toContain("preview_would_deploy_enabled");
    expect(record.approval_decision).toBe("approved_with_conditions");
    expect(record.failed_conditions).toEqual([]);
    expect(record.unresolved_conditions).toContain("exact_clean_base_identifier_missing");
    expect(record.unresolved_conditions).toContain("netlify_site_association_unverified");
    expect(record.next_permitted_action).toBe(
      "action_473_preview_full_candidate_construction_and_netlify_target_access_completion",
    );
  });

  test("performs no deployment, activation, environment modification, or confidence application", () => {
    const record = readJson<Action472Record>(recordPath);

    expect(record.deployment_performed).toBe(false);
    expect(record.deployment_status).toBe("not_performed");
    expect(record.preview_activated).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.no_side_effects).toBe(true);
  });
});
