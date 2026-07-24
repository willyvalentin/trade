import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate.md";
const recordPath =
  "docs/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-approval-record.json";
const verifierPath =
  "scripts/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate-verify.mjs";
const action490VerifierPath =
  "scripts/action-490-confidence-calibration-recommendation-advisory-projection-preview-command-inventory-binding-remediation-approval-gate-verify.mjs";
const action489VerifierPath =
  "scripts/action-489-confidence-calibration-recommendation-advisory-projection-preview-full-candidate-build-rehearsal-retry-after-source-safety-remediation-verify.mjs";

test.setTimeout(300000);

type RuntimeDependencyInventoryEntry = {
  path: string;
  classification: "runtime_required" | "build_required";
  dependency_kind: string;
  importing_path: string;
  clean_base_presence: boolean;
  approved_overlay_presence: boolean;
  frozen_candidate_presence: boolean;
  expected_sha256: string;
};

type Action491Record = {
  source_action_result: {
    approval_decision: string;
    root_cause_classification: string;
    class_a_missing_paths: string[];
    rehearsal_performed: boolean;
    deployment_performed: boolean;
    preview_activated: boolean;
  };
  blocker_classification: string;
  first_missing_runtime_path: string;
  old_clean_base_identifier: string;
  old_change_candidate_hash: string;
  old_full_candidate_inventory_hash: string;
  old_candidate_file_count: number;
  old_candidate_status: string;
  old_deployment_approval_executable: boolean;
  action_479_deployment_approval_superseded_for_execution: boolean;
  runtime_dependency_paths_total: number;
  runtime_dependency_paths_present: number;
  runtime_dependency_paths_missing: number;
  build_only_paths_total: number;
  unresolved_source_paths: number;
  missing_runtime_paths: string[];
  authoritative_source_classifications: Array<{
    path: string;
    source_classification: string;
    current_bounded_sha256: string;
    clean_base_exists: boolean;
    approved_30_file_overlay_member: boolean;
    first_known_action_provenance: string;
    latest_verified_action_provenance: string;
    hash_freeze_provenance: string;
    imported_by_paths: string[];
    runtime_relevance: string;
    authoritative_version_known: boolean;
    approved_for_future_exact_candidate_inclusion: boolean;
  }>;
  runtime_dependency_inventory: RuntimeDependencyInventoryEntry[];
  runtime_closure_rule_freeze: Record<string, boolean>;
  candidate_expansion_required: boolean;
  new_candidate_hash_required: boolean;
  new_candidate_inventory_required: boolean;
  candidate_reconstruction_required: boolean;
  candidate_expansion_policy: {
    approved_missing_paths_for_future_inclusion: string[];
    directory_wide_inclusion_approved: boolean;
    copy_all_lib_approved: boolean;
    copy_dirty_worktree_approved: boolean;
    requires_new_changed_file_count: boolean;
    requires_new_change_candidate_hash: boolean;
    requires_new_full_candidate_inventory_hash: boolean;
  };
  forbidden_expansion: string[];
  unrelated_dirty_files_included: boolean;
  control_artifacts_included: boolean;
  environment_or_credentials_included: boolean;
  dependency_completeness_decision: string;
  overall_candidate_status: string;
  approval_decision: string;
  unresolved_conditions: string[];
  reconstruction_performed: boolean;
  rehearsal_performed: boolean;
  deployment_performed: boolean;
  preview_activated: boolean;
  provider_call_executed: boolean;
  supabase_write_executed: boolean;
  replay_created: boolean;
  confidence_applied: boolean;
  feedback_created: boolean;
  scanner_changed: boolean;
  ranking_changed: boolean;
  preview_flag_state: string;
  preview_flag_enabled: boolean;
  runtime_preview_state: string;
  next_action: string;
};

type VerifierReport = {
  verification_status: string;
  approval_decision: string;
  blocker_classification: string;
  first_missing_runtime_path: string;
  missing_runtime_paths: string[];
  dependency_completeness_decision: string;
  next_action: string;
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

function runVerifier(relativePath: string): { verification_status: string; failed_conditions: string[] } {
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  ) as { verification_status: string; failed_conditions: string[] };
}

function getEntry(record: Action491Record, path: string): RuntimeDependencyInventoryEntry {
  const entry = record.runtime_dependency_inventory.find((candidate) => candidate.path === path);
  expect(entry, `expected inventory entry for ${path}`).toBeTruthy();
  return entry as RuntimeDependencyInventoryEntry;
}

test.beforeAll(() => {
  verifierReport = runVerifier(verifierPath) as VerifierReport;
});

test.describe("Action 491 candidate runtime dependency completeness remediation gate", () => {
  test("documents the static approval gate and passes verifier", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 491 is a static audit and approval gate");
    expect(doc).toContain("Runtime Dependency Inventory");
    expect(doc).toContain("Candidate Expansion Policy");
    expect(verifierReport.verification_status).toBe("passed");
    expect(verifierReport.failed_conditions).toEqual([]);
  });

  test("preserves Action 490 blocked result and exact blocker classification", () => {
    const record = readJson<Action491Record>(recordPath);

    expect(record.source_action_result.approval_decision).toBe("blocked");
    expect(record.source_action_result.root_cause_classification).toBe(
      "rehearsal_control_tests_incorrectly_required_inside_frozen_deployment_candidate",
    );
    expect(record.source_action_result.class_a_missing_paths).toEqual([
      "lib/pure-confidence-calibration.ts",
    ]);
    expect(record.blocker_classification).toBe("frozen_candidate_missing_runtime_dependency");
    expect(record.first_missing_runtime_path).toBe("lib/pure-confidence-calibration.ts");
    expect(verifierReport.checks.action490_blocked_result).toBe(true);
    expect(verifierReport.checks.blocker_and_old_candidate).toBe(true);
  });

  test("keeps old candidate hashes as historical and marks old deployment approval non-executable", () => {
    const record = readJson<Action491Record>(recordPath);

    expect(record.old_clean_base_identifier).toBe("15f9923c24ed1f3cf82d34656eeacbfd98a0d347");
    expect(record.old_change_candidate_hash).toBe(
      "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
    );
    expect(record.old_full_candidate_inventory_hash).toBe(
      "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
    );
    expect(record.old_candidate_file_count).toBe(30);
    expect(record.old_candidate_status).toBe("historical_candidate_runtime_incomplete");
    expect(record.old_deployment_approval_executable).toBe(false);
    expect(record.action_479_deployment_approval_superseded_for_execution).toBe(true);
  });

  test("records authoritative source classification for the missing runtime/build dependency", () => {
    const record = readJson<Action491Record>(recordPath);
    const source = record.authoritative_source_classifications[0];

    expect(source.path).toBe("lib/pure-confidence-calibration.ts");
    expect(source.source_classification).toBe("present_only_in_current_dirty_worktree");
    expect(source.current_bounded_sha256).toBe(
      "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
    );
    expect(source.clean_base_exists).toBe(false);
    expect(source.approved_30_file_overlay_member).toBe(false);
    expect(source.first_known_action_provenance).toBe(
      "action_420_pure_confidence_calibration_implementation",
    );
    expect(source.latest_verified_action_provenance).toBe(
      "action_423_pure_confidence_calibration_contract_remediation",
    );
    expect(source.hash_freeze_provenance).toBe("action_426_static_confidence_calibration_hash_freeze");
    expect(source.imported_by_paths).toEqual(["lib/confidence-calibration-advisory-adapter.ts"]);
    expect(source.authoritative_version_known).toBe(true);
    expect(verifierReport.checks.source_classification).toBe(true);
  });

  test("classifies direct and transitive runtime imports", () => {
    const record = readJson<Action491Record>(recordPath);

    expect(getEntry(record, "components/recommendations/RecommendationDetailsModal.tsx")).toMatchObject({
      classification: "runtime_required",
      dependency_kind: "direct_runtime_preview_call_site",
      frozen_candidate_presence: true,
    });
    expect(getEntry(record, "components/recommendations/ConfidenceCalibrationProjectionPreview.tsx")).toMatchObject({
      classification: "runtime_required",
      dependency_kind: "direct_runtime_preview_component",
      frozen_candidate_presence: true,
    });
    expect(getEntry(record, "lib/confidence-calibration-recommendation-advisory-projection-preview.ts")).toMatchObject({
      classification: "runtime_required",
      dependency_kind: "preview_adapter",
      frozen_candidate_presence: true,
    });
    expect(getEntry(record, "lib/confidence-calibration-recommendation-advisory-projection.ts")).toMatchObject({
      classification: "runtime_required",
      dependency_kind: "advisory_projection_execution",
      frozen_candidate_presence: true,
    });
    expect(verifierReport.checks.runtime_import_relationships).toBe(true);
  });

  test("classifies type-only dependencies as build-required and detects all missing paths", () => {
    const record = readJson<Action491Record>(recordPath);

    expect(getEntry(record, "lib/confidence-calibration-advisory-adapter.ts")).toMatchObject({
      classification: "build_required",
      dependency_kind: "type_only_projection_dependency_and_advisory_chain_contract",
      frozen_candidate_presence: true,
    });
    expect(getEntry(record, "lib/pure-confidence-calibration.ts")).toMatchObject({
      classification: "build_required",
      dependency_kind: "type_only_confidence_calibration_advisory_dependency",
      frozen_candidate_presence: false,
    });
    expect(record.runtime_dependency_paths_total).toBe(20);
    expect(record.runtime_dependency_paths_present).toBe(19);
    expect(record.runtime_dependency_paths_missing).toBe(1);
    expect(record.build_only_paths_total).toBe(8);
    expect(record.missing_runtime_paths).toEqual(["lib/pure-confidence-calibration.ts"]);
    expect(verifierReport.checks.runtime_inventory_counts).toBe(true);
    expect(verifierReport.checks.runtime_inventory_integrity).toBe(true);
  });

  test("excludes test, documentation, verifier, release, and unrelated dirty artifacts from candidate expansion", () => {
    const record = readJson<Action491Record>(recordPath);
    const pathSet = new Set(record.runtime_dependency_inventory.map((entry) => entry.path));

    expect(pathSet.has("tests/e2e/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate.spec.ts")).toBe(false);
    expect(pathSet.has(docPath)).toBe(false);
    expect(pathSet.has(verifierPath)).toBe(false);
    expect(record.runtime_closure_rule_freeze.tests_are_not_candidate_expansion_sources).toBe(true);
    expect(record.runtime_closure_rule_freeze.docs_are_not_candidate_expansion_sources).toBe(true);
    expect(record.runtime_closure_rule_freeze.verifiers_are_not_candidate_expansion_sources).toBe(true);
    expect(record.unrelated_dirty_files_included).toBe(false);
    expect(record.control_artifacts_included).toBe(false);
    expect(record.environment_or_credentials_included).toBe(false);
    expect(verifierReport.checks.forbidden_expansion).toBe(true);
  });

  test("approves only exact future candidate expansion and rejects broad inclusion", () => {
    const record = readJson<Action491Record>(recordPath);

    expect(record.candidate_expansion_required).toBe(true);
    expect(record.new_candidate_hash_required).toBe(true);
    expect(record.new_candidate_inventory_required).toBe(true);
    expect(record.candidate_reconstruction_required).toBe(true);
    expect(record.candidate_expansion_policy.approved_missing_paths_for_future_inclusion).toEqual([
      "lib/pure-confidence-calibration.ts",
    ]);
    expect(record.candidate_expansion_policy.directory_wide_inclusion_approved).toBe(false);
    expect(record.candidate_expansion_policy.copy_all_lib_approved).toBe(false);
    expect(record.candidate_expansion_policy.copy_dirty_worktree_approved).toBe(false);
    expect(record.candidate_expansion_policy.requires_new_changed_file_count).toBe(true);
    expect(record.candidate_expansion_policy.requires_new_change_candidate_hash).toBe(true);
    expect(record.candidate_expansion_policy.requires_new_full_candidate_inventory_hash).toBe(true);
    expect(verifierReport.checks.expansion_policy).toBe(true);
  });

  test("freezes approval, readiness, and Action 492 boundary", () => {
    const record = readJson<Action491Record>(recordPath);

    expect(record.dependency_completeness_decision).toBe("runtime_dependency_completeness_ready");
    expect(record.overall_candidate_status).toBe("candidate_reconstruction_required");
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.next_action).toBe("action_492_runtime_complete_candidate_reconstruction_and_hash_freeze");
    expect(verifierReport.checks.decision_and_next_action).toBe(true);
  });

  test("keeps construction, rehearsal, deployment, activation, and side effects disabled", () => {
    const record = readJson<Action491Record>(recordPath);

    expect(record.reconstruction_performed).toBe(false);
    expect(record.rehearsal_performed).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(record.ranking_changed).toBe(false);
    expect(record.preview_flag_state).toBe("absent_or_disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(verifierReport.checks.no_effects).toBe(true);
    expect(verifierReport.checks.preview_state).toBe(true);
  });

  test("keeps Actions 489-491 verifiers healthy", () => {
    const action489 = runVerifier(action489VerifierPath);
    const action490 = runVerifier(action490VerifierPath);

    expect(action489.verification_status).toBe("passed");
    expect(action489.failed_conditions).toEqual([]);
    expect(action490.verification_status).toBe("passed");
    expect(action490.failed_conditions).toEqual([]);
    expect(verifierReport.verification_status).toBe("passed");
  });
});
