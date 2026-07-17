import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const docPath =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze.md";
const recordPath =
  "docs/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-record.json";
const verifierPath =
  "scripts/action-492-confidence-calibration-recommendation-advisory-projection-preview-runtime-complete-candidate-reconstruction-and-hash-freeze-verify.mjs";
const action491VerifierPath =
  "scripts/action-491-confidence-calibration-recommendation-advisory-projection-preview-candidate-runtime-dependency-completeness-remediation-gate-verify.mjs";

const expected = {
  cleanBase: "15f9923c24ed1f3cf82d34656eeacbfd98a0d347",
  oldChangeHash: "7a11d9c6697a9d89ffb3e762dd15185fda225bc8e39c80a212cd3729d05857f6",
  oldFullHash: "cc6a97c5797a1fa76a6bebe9be1497fe88819f1b73992b271c142ff61d3bc2f0",
  addedPath: "lib/pure-confidence-calibration.ts",
  addedHash: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  newChangeHash: "c005946d3a21df32730306687d125ef1ba4439500da7ec22288ec92d802d667c",
  newFullHash: "d96af34b0c488ef16f614b2be731052c2099e0b6efde57f76115eb8d5c779a0f",
  nextAction: "action_493_runtime_complete_candidate_build_rehearsal_approval_gate",
};

test.setTimeout(300000);

type CandidateInventoryEntry = {
  path: string;
  sha256: string | null;
  classification: string;
  provenance: string;
  source_classification: string;
};

type Action492Record = {
  source_action: number;
  clean_base_identifier: string;
  historical_change_candidate_hash: string;
  historical_full_candidate_inventory_hash: string;
  historical_candidate_file_count: number;
  historical_candidate_status: string;
  historical_overlay_count: number;
  historical_overlay_missing_paths: string[];
  historical_overlay_unexpected_paths: string[];
  historical_overlay_hashes_exact: boolean;
  safe_reconstruction_boundary: Record<string, boolean>;
  added_runtime_path: string;
  added_runtime_path_hash: string;
  added_runtime_path_provenance: number[];
  added_runtime_path_source_classification: string;
  approved_by_action: number;
  approved_missing_runtime_paths: string[];
  approved_runtime_dependency_binding: {
    exact_path: string;
    exact_sha256: string;
    action_491_approval: string;
    action_491_blocker_classification: string;
    action_492_candidate_completion_purpose: string;
  };
  new_candidate_file_count: number;
  new_change_candidate_hash: string;
  new_full_candidate_inventory_hash: string;
  new_changed_file_inventory: CandidateInventoryEntry[];
  actual_delta_count: number;
  expected_delta_count: number;
  unexpected_delta_paths: string[];
  missing_delta_paths: string[];
  runtime_dependency_paths_missing: number;
  runtime_dependency_missing_paths: string[];
  runtime_dependency_closure_complete: boolean;
  runtime_preview_consumer_imports_resolvable: boolean;
  advisory_adapter_imports_resolvable: boolean;
  projection_imports_resolvable: boolean;
  type_only_build_imports_resolvable: boolean;
  control_only_artifacts_excluded: boolean;
  unrelated_dirty_files_included: boolean;
  control_only_artifacts_added: boolean;
  environment_or_credentials_included: boolean;
  node_modules_included: boolean;
  build_output_included: boolean;
  unclassified_files_included: boolean;
  candidate_reconstruction_result: string;
  old_deployment_approval_executable: boolean;
  new_candidate_authoritative_for_future_actions: boolean;
  rehearsal_performed: boolean;
  deployment_performed: boolean;
  preview_activated: boolean;
  environment_modified: boolean;
  network_used: boolean;
  install_performed: boolean;
  netlify_operation_performed: boolean;
  provider_call_executed: boolean;
  supabase_read_executed: boolean;
  supabase_write_executed: boolean;
  persistence_created: boolean;
  replay_created: boolean;
  confidence_applied: boolean;
  feedback_created: boolean;
  scanner_changed: boolean;
  ranking_changed: boolean;
  publication_changed: boolean;
  execution_changed: boolean;
  add_trade_changed: boolean;
  risk_sizing_changed: boolean;
  cleanup_result: string;
  temporary_candidate_absent_after_cleanup: boolean;
  runtime_preview_state: string;
  preview_flag_state: string;
  preview_flag_enabled: boolean;
  next_action: string;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function runVerifier(relativePath: string): Record<string, unknown> {
  return JSON.parse(
    execFileSync("node", [relativePath], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 160 * 1024 * 1024,
    }),
  );
}

test.describe("Action 492 runtime-complete candidate reconstruction and hash freeze", () => {
  test("documents the Action 491 approval, supersession, and local-only boundary", () => {
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);

    const doc = read(docPath);
    expect(doc).toContain("Action 491 approved");
    expect(doc).toContain("runtime-incomplete");
    expect(doc).toContain(expected.addedPath);
    expect(doc).toContain(expected.addedHash);
    expect(doc).toContain("31 files");
    expect(doc).toContain(expected.newChangeHash);
    expect(doc).toContain(expected.newFullHash);
    expect(doc).toContain("No rehearsal");
    expect(doc).toContain(expected.nextAction);
  });

  test("freezes the exact clean base, historical hashes, and one-file runtime addition", () => {
    const record = readJson<Action492Record>(recordPath);
    const addedEntry = record.new_changed_file_inventory.find(
      (entry) => entry.path === expected.addedPath,
    );

    expect(record.source_action).toBe(491);
    expect(record.clean_base_identifier).toBe(expected.cleanBase);
    expect(record.historical_change_candidate_hash).toBe(expected.oldChangeHash);
    expect(record.historical_full_candidate_inventory_hash).toBe(expected.oldFullHash);
    expect(record.historical_candidate_file_count).toBe(30);
    expect(record.historical_candidate_status).toBe("historical_candidate_runtime_incomplete");
    expect(record.historical_overlay_count).toBe(30);
    expect(record.historical_overlay_missing_paths).toEqual([]);
    expect(record.historical_overlay_unexpected_paths).toEqual([]);
    expect(record.historical_overlay_hashes_exact).toBe(true);

    expect(record.added_runtime_path).toBe(expected.addedPath);
    expect(record.added_runtime_path_hash).toBe(expected.addedHash);
    expect(record.added_runtime_path_provenance).toEqual([420, 423, 426]);
    expect(record.added_runtime_path_source_classification).toBe(
      "present_only_in_current_dirty_worktree",
    );
    expect(record.approved_by_action).toBe(491);
    expect(record.approved_missing_runtime_paths).toEqual([expected.addedPath]);
    expect(record.approved_runtime_dependency_binding).toMatchObject({
      exact_path: expected.addedPath,
      exact_sha256: expected.addedHash,
      action_491_approval: "approved",
      action_491_blocker_classification: "frozen_candidate_missing_runtime_dependency",
    });

    expect(addedEntry).toMatchObject({
      path: expected.addedPath,
      sha256: expected.addedHash,
      classification: "runtime_required_build_dependency",
      provenance: "action_420_action_423_action_426_action_491_approved_runtime_completion",
      source_classification: "present_only_in_current_dirty_worktree",
    });
  });

  test("contains exactly the 31-file delta and excludes unrelated or control-only files", () => {
    const record = readJson<Action492Record>(recordPath);
    const paths = record.new_changed_file_inventory.map((entry) => entry.path);

    expect(record.new_candidate_file_count).toBe(31);
    expect(record.actual_delta_count).toBe(31);
    expect(record.expected_delta_count).toBe(31);
    expect(record.new_changed_file_inventory).toHaveLength(31);
    expect(new Set(paths).size).toBe(31);
    expect(record.unexpected_delta_paths).toEqual([]);
    expect(record.missing_delta_paths).toEqual([]);
    expect(paths.filter((path) => path === expected.addedPath)).toHaveLength(1);
    expect(paths.some((path) => path.startsWith(".env"))).toBe(false);
    expect(paths.some((path) => path.startsWith("node_modules/"))).toBe(false);
    expect(paths.some((path) => path.startsWith(".netlify/"))).toBe(false);
    expect(paths.some((path) => path.includes("post-trade"))).toBe(false);
    expect(paths.some((path) => path.includes("action-492"))).toBe(false);
    expect(paths.filter((path) => path.startsWith("lib/"))).toEqual([
      "lib/confidence-calibration-advisory-adapter.ts",
      "lib/confidence-calibration-recommendation-advisory-projection-preview-flag.ts",
      "lib/confidence-calibration-recommendation-advisory-projection-preview.ts",
      "lib/confidence-calibration-recommendation-advisory-projection.ts",
      expected.addedPath,
    ]);
  });

  test("records complete dependency closure and deterministic new hashes", () => {
    const record = readJson<Action492Record>(recordPath);

    expect(record.runtime_dependency_paths_missing).toBe(0);
    expect(record.runtime_dependency_missing_paths).toEqual([]);
    expect(record.runtime_dependency_closure_complete).toBe(true);
    expect(record.runtime_preview_consumer_imports_resolvable).toBe(true);
    expect(record.advisory_adapter_imports_resolvable).toBe(true);
    expect(record.projection_imports_resolvable).toBe(true);
    expect(record.type_only_build_imports_resolvable).toBe(true);
    expect(record.control_only_artifacts_excluded).toBe(true);

    expect(record.new_change_candidate_hash).toBe(expected.newChangeHash);
    expect(record.new_full_candidate_inventory_hash).toBe(expected.newFullHash);
    expect(record.new_change_candidate_hash).not.toBe(expected.oldChangeHash);
    expect(record.new_full_candidate_inventory_hash).not.toBe(expected.oldFullHash);
  });

  test("preserves all no-effect guarantees and runtime preview state", () => {
    const record = readJson<Action492Record>(recordPath);

    expect(record.candidate_reconstruction_result).toBe(
      "runtime_complete_candidate_reconstructed_and_frozen",
    );
    expect(record.old_deployment_approval_executable).toBe(false);
    expect(record.new_candidate_authoritative_for_future_actions).toBe(true);
    expect(record.rehearsal_performed).toBe(false);
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.environment_modified).toBe(false);
    expect(record.network_used).toBe(false);
    expect(record.install_performed).toBe(false);
    expect(record.netlify_operation_performed).toBe(false);
    expect(record.provider_call_executed).toBe(false);
    expect(record.supabase_read_executed).toBe(false);
    expect(record.supabase_write_executed).toBe(false);
    expect(record.persistence_created).toBe(false);
    expect(record.replay_created).toBe(false);
    expect(record.confidence_applied).toBe(false);
    expect(record.feedback_created).toBe(false);
    expect(record.scanner_changed).toBe(false);
    expect(record.ranking_changed).toBe(false);
    expect(record.publication_changed).toBe(false);
    expect(record.execution_changed).toBe(false);
    expect(record.add_trade_changed).toBe(false);
    expect(record.risk_sizing_changed).toBe(false);
    expect(record.cleanup_result).toBe("temporary_candidate_removed");
    expect(record.temporary_candidate_absent_after_cleanup).toBe(true);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.preview_flag_state).toBe("absent_or_disabled");
    expect(record.preview_flag_enabled).toBe(false);
    expect(record.next_action).toBe(expected.nextAction);
  });

  test("passes Action 492 verifier and keeps Action 491 verifier healthy", () => {
    const action492Report = runVerifier(verifierPath);
    const action491Report = runVerifier(action491VerifierPath);

    expect(action492Report.status).toBe("passed");
    expect(action492Report.failures).toEqual([]);
    expect(action492Report.reconstruction_free).toBe(true);
    expect(action492Report.build_free).toBe(true);
    expect(action492Report.deployment_free).toBe(true);
    expect(action492Report.network_free).toBe(true);
    expect(action492Report.credential_value_free).toBe(true);
    expect(action491Report.verification_status).toBe("passed");
    expect(action491Report.failed_conditions).toEqual([]);
  });
});
