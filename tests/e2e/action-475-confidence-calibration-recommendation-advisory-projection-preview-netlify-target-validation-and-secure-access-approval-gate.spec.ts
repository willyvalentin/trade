import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-approval-gate.md";
const recordPath =
  "docs/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-record.json";
const action473InventoryPath =
  "docs/action-473-confidence-calibration-recommendation-advisory-projection-preview-full-deployment-candidate-inventory.json";
const action474RecordPath =
  "docs/action-474-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-and-secure-access-record.json";
const verifierPath =
  "scripts/action-475-confidence-calibration-recommendation-advisory-projection-preview-netlify-target-validation-and-secure-access-approval-gate-verify.mjs";
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
  approved_change_candidate_file_count: number;
  unexpected_changed_file_count: number;
  unrelated_post_trade_changed_file_count: number;
  secret_file_count: number;
  environment_file_count: number;
};

type Action474Record = {
  netlify_target_access_decision: string;
  overall_readiness: string;
  runtime_preview_state: string;
};

type Action475Record = {
  schema_version: string;
  source_action: number;
  clean_base_identifier: string;
  approved_change_candidate_hash: string;
  full_candidate_inventory_hash: string;
  approved_change_candidate_file_count: number;
  unexpected_file_count: number;
  unrelated_post_trade_file_count: number;
  secret_file_count: number;
  environment_file_count: number;
  netlify_site_name: string;
  non_secret_site_reference: string;
  target_identifiers_source: string;
  live_netlify_lookup_performed: boolean;
  intended_ture_project_confirmed: boolean;
  environment_classification: string;
  deploy_previews_supported: boolean;
  production_alias_protected: boolean;
  production_unchanged_required: boolean;
  disabled_first_deployment_supported: boolean;
  preview_flag_name: string;
  initial_preview_flag_state: string;
  preview_flag_set_by_action_475: boolean;
  production_activation_authorized: boolean;
  credential_available: boolean;
  authentication_method_classification: string;
  credential_value_recorded: boolean;
  credential_storage_authorized: boolean;
  deployment_retry_gate_explicitly_approved: boolean;
  target_validation_result: string;
  secure_access_validation_result: string;
  netlify_target_decision: string;
  authentication_completion_decision: string;
  overall_readiness: string;
  unresolved_field_names: string[];
  invalid_field_names: string[];
  future_authentication_completion_boundary: {
    may_confirm_access_to_site_name: string;
    may_invoke_supported_interactive_netlify_authentication_flow: boolean;
    may_confirm_authentication_success_without_exposing_values: boolean;
    may_confirm_non_secret_site_reference_match: boolean;
    may_confirm_preview_deployment_permissions: boolean;
    may_confirm_production_alias_remains_protected: boolean;
    may_record_only_bounded_authentication_metadata: boolean;
    must_not_store_tokens: boolean;
    must_not_copy_credentials_into_artifacts: boolean;
    must_not_deploy: boolean;
    must_not_activate_preview_flag: boolean;
  };
  authentication_performed: boolean;
  oauth_initiated: boolean;
  netlify_api_called: boolean;
  netlify_cli_authentication_run: boolean;
  netlify_deploy_run: boolean;
  site_linked_or_relinked: boolean;
  netlify_configuration_modified: boolean;
  environment_modified: boolean;
  deployment_performed: boolean;
  preview_activated: boolean;
  production_changed: boolean;
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
  runtime_preview_state: string;
  next_action: string;
};

type VerifierReport = {
  verification_status: string;
  failed_conditions: string[];
  checks: Record<string, boolean>;
  netlify_target_decision: string;
  authentication_completion_decision: string;
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

function targetDecisionFor(record: Partial<Action475Record>): string {
  if (record.environment_classification !== "non_production_preview") return "netlify_target_blocked";
  if (record.intended_ture_project_confirmed !== true) return "netlify_target_blocked";
  if (record.deploy_previews_supported !== true) return "netlify_target_blocked";
  if (record.production_alias_protected !== true) return "netlify_target_blocked";
  if (record.disabled_first_deployment_supported !== true) return "netlify_target_blocked";
  if (record.credential_value_recorded !== false) return "netlify_target_blocked";
  return "netlify_target_ready";
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

test.describe("Action 475 Netlify target validation and secure access approval gate", () => {
  test("adds documentation, record, verifier, and focused test with passing verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("## Candidate Binding");
    expect(doc).toContain("Netlify site name: `trade-vl`");
    expect(doc).toContain("Netlify target decision: `netlify_target_ready`");
    expect(doc).toContain("Authentication completion decision: `secure_authentication_required`");
    expect(doc).toContain("action_476_secure_netlify_authentication_completion");
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("binds the verified Action 473 candidate hashes and counts", () => {
    const action473 = readJson<Action473Inventory>(action473InventoryPath);
    const record = readJson<Action475Record>(recordPath);

    expect(action473.repository_base_identifier).toBe(cleanBase);
    expect(action473.approved_change_candidate_hash).toBe(candidateHash);
    expect(action473.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(action473.approved_change_candidate_file_count).toBe(30);
    expect(action473.unexpected_changed_file_count).toBe(0);
    expect(action473.unrelated_post_trade_changed_file_count).toBe(0);
    expect(action473.secret_file_count).toBe(0);
    expect(action473.environment_file_count).toBe(0);
    expect(record.clean_base_identifier).toBe(cleanBase);
    expect(record.approved_change_candidate_hash).toBe(candidateHash);
    expect(record.full_candidate_inventory_hash).toBe(fullCandidateHash);
    expect(record.approved_change_candidate_file_count).toBe(30);
    expect(verifierReport.checks.action473_binding).toBe(true);
  });

  test("keeps Action 474 healthy while replacing missing inputs with supplied bounded target facts", () => {
    const action474 = readJson<Action474Record>(action474RecordPath);
    const record = readJson<Action475Record>(recordPath);

    expect(action474.netlify_target_access_decision).toBe("netlify_target_access_blocked");
    expect(action474.overall_readiness).toBe("blocked");
    expect(action474.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.source_action).toBe(474);
    expect(verifierReport.checks.action474_binding).toBe(true);
  });

  test("records exact site name, non-secret site reference, and intended project confirmation", () => {
    const record = readJson<Action475Record>(recordPath);

    expect(record.netlify_site_name).toBe("trade-vl");
    expect(record.non_secret_site_reference).toBe("2b582e03-ac97-4371-8051-558d9980fb94");
    expect(record.target_identifiers_source).toBe("operator_supplied_bounded_non_secret_inputs");
    expect(record.live_netlify_lookup_performed).toBe(false);
    expect(record.intended_ture_project_confirmed).toBe(true);
    expect(verifierReport.checks.target_identity).toBe(true);
  });

  test("validates deploy preview support, production alias protection, and disabled-first policy", () => {
    const record = readJson<Action475Record>(recordPath);

    expect(record.environment_classification).toBe("non_production_preview");
    expect(record.deploy_previews_supported).toBe(true);
    expect(record.production_alias_protected).toBe(true);
    expect(record.production_unchanged_required).toBe(true);
    expect(record.disabled_first_deployment_supported).toBe(true);
    expect(record.preview_flag_name).toBe("CONFIDENCE_CALIBRATION_PROJECTION_PREVIEW_ENABLED");
    expect(record.initial_preview_flag_state).toBe("disabled");
    expect(record.preview_flag_set_by_action_475).toBe(false);
    expect(record.production_activation_authorized).toBe(false);
    expect(verifierReport.checks.deploy_preview_policy).toBe(true);
    expect(verifierReport.checks.preview_flag_policy).toBe(true);
  });

  test("would reject production or unsafe target policy mutations", () => {
    const record = readJson<Action475Record>(recordPath);

    expect(targetDecisionFor({ ...record, environment_classification: "production" })).toBe(
      "netlify_target_blocked",
    );
    expect(targetDecisionFor({ ...record, production_alias_protected: false })).toBe(
      "netlify_target_blocked",
    );
    expect(targetDecisionFor({ ...record, disabled_first_deployment_supported: false })).toBe(
      "netlify_target_blocked",
    );
    expect(targetDecisionFor({ ...record, credential_value_recorded: true })).toBe(
      "netlify_target_blocked",
    );
  });

  test("classifies unavailable credentials as secure interactive authentication required", () => {
    const record = readJson<Action475Record>(recordPath);

    expect(record.credential_available).toBe(false);
    expect(record.authentication_method_classification).toBe("secure_interactive_auth_required");
    expect(record.credential_value_recorded).toBe(false);
    expect(record.credential_storage_authorized).toBe(false);
    expect(record.secure_access_validation_result).toBe(
      "secure_interactive_authentication_required_before_deployment_retry",
    );
    expect(verifierReport.checks.credential_policy).toBe(true);
  });

  test("freezes a bounded authentication completion boundary without credential values", () => {
    const record = readJson<Action475Record>(recordPath);
    const recordText = read(recordPath);

    expect(record.future_authentication_completion_boundary.may_confirm_access_to_site_name).toBe(
      "trade-vl",
    );
    expect(record.future_authentication_completion_boundary.may_invoke_supported_interactive_netlify_authentication_flow).toBe(
      true,
    );
    expect(record.future_authentication_completion_boundary.may_confirm_authentication_success_without_exposing_values).toBe(
      true,
    );
    expect(record.future_authentication_completion_boundary.must_not_store_tokens).toBe(true);
    expect(record.future_authentication_completion_boundary.must_not_deploy).toBe(true);
    expect(record.future_authentication_completion_boundary.must_not_activate_preview_flag).toBe(true);
    expect(recordText).not.toMatch(/token\s*[:=]/i);
    expect(recordText).not.toMatch(/password\s*[:=]/i);
    expect(recordText).not.toMatch(/api[_-]?key\s*[:=]/i);
    expect(recordText).not.toMatch(/secret\s*[:=]/i);
    expect(verifierReport.checks.authentication_boundary).toBe(true);
  });

  test("returns target ready, secure authentication required, and ready with conditions", () => {
    const record = readJson<Action475Record>(recordPath);

    expect(record.target_validation_result).toBe(
      "operator_target_policy_validated_without_live_lookup",
    );
    expect(record.netlify_target_decision).toBe("netlify_target_ready");
    expect(record.authentication_completion_decision).toBe("secure_authentication_required");
    expect(record.overall_readiness).toBe("ready_with_conditions");
    expect(record.unresolved_field_names).toEqual([
      "secure_interactive_authentication_completion",
    ]);
    expect(record.invalid_field_names).toEqual([]);
    expect(verifierReport.netlify_target_decision).toBe("netlify_target_ready");
    expect(verifierReport.authentication_completion_decision).toBe(
      "secure_authentication_required",
    );
    expect(verifierReport.overall_readiness).toBe("ready_with_conditions");
    expect(verifierReport.checks.decisions).toBe(true);
  });

  test("sets the mandatory Action 476 secure authentication completion next action", () => {
    const record = readJson<Action475Record>(recordPath);

    expect(record.next_action).toBe("action_476_secure_netlify_authentication_completion");
    expect(verifierReport.next_action).toBe("action_476_secure_netlify_authentication_completion");
  });

  test("performs no authentication, deployment, activation, environment modification, or downstream effects", () => {
    const record = readJson<Action475Record>(recordPath);

    expect(record.authentication_performed).toBe(false);
    expect(record.oauth_initiated).toBe(false);
    expect(record.netlify_api_called).toBe(false);
    expect(record.netlify_cli_authentication_run).toBe(false);
    expect(record.netlify_deploy_run).toBe(false);
    expect(record.site_linked_or_relinked).toBe(false);
    expect(record.netlify_configuration_modified).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.production_changed).toBe(false);
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
    const record = readJson<Action475Record>(recordPath);

    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.runtime_state).toBe(true);
  });
});
