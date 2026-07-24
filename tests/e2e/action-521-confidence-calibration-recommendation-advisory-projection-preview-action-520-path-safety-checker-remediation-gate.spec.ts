import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join, posix, resolve } from "path";
import { test, expect } from "@playwright/test";

const repoRoot = resolve(__dirname, "../..");
const recordPath =
  "docs/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-approval-record.json";
const action520Path =
  "docs/action-520-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-record.json";
const action519Path =
  "docs/action-519-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-build-rehearsal-approval-record.json";
const action518Path =
  "docs/action-518-confidence-calibration-recommendation-advisory-projection-preview-remediated-32-file-candidate-record.json";
const verifierPath =
  "scripts/action-521-confidence-calibration-recommendation-advisory-projection-preview-action-520-path-safety-checker-remediation-gate-verify.mjs";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";

const expected = {
  changeHash: "bc43bd1fe8f61561ddededd2263d64f7d12f37db46d184e3bfd0ea55a8b538de",
  fullHash: "80620318166b0b9e1858cff3f12fc78d9ad77d9116655335e1c7fd7e566930b0",
  routeHash: "26407a8b78625a19a48a02ecf44e03db1642998da5f1d8acc5e8d47227773265",
  blocker: "action_520_path_safety_checker_failed_to_apply_canonical_macos_temp_alias_equivalence",
  action522Subtree:
    "ture/action-522-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
};

type JsonObject = Record<string, unknown>;

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalTempPath(path: string): string {
  return posix.normalize(path).replace(/^\/var\//, "/private/var/");
}

function contained(root: string, candidate: string, exactSubtree = expected.action522Subtree): boolean {
  const canonicalRoot = canonicalTempPath(root);
  const canonicalCandidate = canonicalTempPath(candidate);
  const relative = posix.relative(canonicalRoot, canonicalCandidate);

  return (
    canonicalCandidate !== canonicalRoot &&
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith("../") &&
    !posix.isAbsolute(relative) &&
    relative === exactSubtree
  );
}

test.describe("Action 521 Action 520 path-safety remediation approval gate", () => {
  test("binds Action 520 abort, zero build invocations, and exact blocker", () => {
    const record = readJson<JsonObject>(recordPath);
    const action520 = readJson<JsonObject>(action520Path);

    expect(action520.candidate_rehearsal_result).toBe("full_candidate_rehearsal_aborted");
    expect(action520.external_evidence_result).toBe("rehearsal_evidence_verified");
    expect(action520.overall_readiness).toBe("blocked");
    expect(action520.rehearsal_attempt_count).toBe(1);
    expect(action520.total_build_process_invocations).toBe(0);
    expect(action520.source_materialized_before_path_safety_passed).toBe(false);
    expect(action520.authoritative_build_attempt_count).toBe(0);
    expect(action520.webpack_diagnostic_attempt_count).toBe(0);
    expect(record.blocker_classification).toBe(expected.blocker);
  });

  test("preserves exact candidate hashes, count, route hash and route export surface", () => {
    const record = readJson<JsonObject>(recordPath);
    const action518 = readJson<JsonObject>(action518Path);
    const routeSource = read(routePath);

    expect(record.change_candidate_hash).toBe(expected.changeHash);
    expect(record.full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(record.candidate_file_count).toBe(32);
    expect(action518.new_change_candidate_hash).toBe(expected.changeHash);
    expect(action518.new_full_candidate_inventory_hash).toBe(expected.fullHash);
    expect(action518.new_candidate_file_count).toBe(32);
    expect(record.remediated_route_hash).toBe(expected.routeHash);
    expect(sha256(routeSource)).toBe(expected.routeHash);
    expect(record.route_export_surface).toEqual(["POST"]);
    expect(routeSource).not.toContain("export function buildOutcomeEligibility");
  });

  test("requires shared canonical path-safety implementation", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.shared_path_safety_implementation_required).toBe(true);
    expect(String(record.shared_path_safety_source_requirement)).toContain(
      "actions_486_487_489_494_496_498_500_503_505_508_511_514",
    );
    expect((record.canonical_root_policy as JsonObject).compare_only_canonical_roots).toBe(true);
    expect(
      (record.canonical_root_policy as JsonObject).compare_canonical_to_noncanonical_strings_allowed,
    ).toBe(false);
  });

  test("accepts trusted macOS temp alias equivalence and rejects string-prefix confusion", () => {
    expect(
      contained(
        "/var/folders/example/T",
        "/private/var/folders/example/T/" + expected.action522Subtree,
      ),
    ).toBe(true);
    expect(
      contained(
        "/private/var/folders/example/T",
        "/private/var/folders/example/TureSibling/" + expected.action522Subtree,
      ),
    ).toBe(false);
    expect(
      contained(
        "/private/var/folders/example/T",
        "/private/var/folders/example/T/" + expected.action522Subtree + "-sibling",
      ),
    ).toBe(false);
  });

  test("rejects traversal, root equality, wrong Action number, and absolute escape", () => {
    expect(contained("/private/var/folders/example/T", "/private/var/folders/example/T")).toBe(
      false,
    );
    expect(contained("/private/var/folders/example/T", "/private/var/folders/example/T/../escape")).toBe(
      false,
    );
    expect(
      contained(
        "/private/var/folders/example/T",
        "/private/var/folders/example/T/ture/action-520-confidence-calibration-projection-preview-remediated-32-file-candidate-rehearsal",
      ),
    ).toBe(false);
    expect(contained("/private/var/folders/example/T", "/Users/willysimonsson/Dev/trade")).toBe(
      false,
    );
  });

  test("freezes forbidden-root, symlink, target-state, and cleanup policies", () => {
    const record = readJson<JsonObject>(recordPath);
    const forbidden = record.forbidden_root_policy as JsonObject;
    const symlink = record.symlink_policy as JsonObject;
    const pathPolicy = record.future_action_522_path_policy as JsonObject;

    expect(forbidden.reject_repository_path).toBe(true);
    expect(forbidden.reject_home_config_path).toBe(true);
    expect(forbidden.reject_application_data_path).toBe(true);
    expect(forbidden.reject_source_node_modules).toBe(true);
    expect(forbidden.reject_netlify_path).toBe(true);
    expect(forbidden.reject_non_empty_target).toBe(true);
    expect(symlink.reject_target_symlink).toBe(true);
    expect(symlink.reject_dangling_target_symlink).toBe(true);
    expect(symlink.reject_user_created_parent_chain_symlink_below_trusted_temp_root).toBe(true);
    expect(pathPolicy.exact_action_number).toBe(522);
    expect(pathPolicy.caller_override_allowed).toBe(false);
    expect(pathPolicy.reuse_action_520_subtree_allowed).toBe(false);
    expect(pathPolicy.target_absent_or_empty_before_use_required).toBe(true);
  });

  test("freezes creation and cleanup order", () => {
    const record = readJson<JsonObject>(recordPath);

    expect(record.creation_sequence).toEqual([
      "derive_trusted_runtime_temp_root",
      "canonicalize_trusted_root",
      "derive_fixed_action_522_target",
      "validate_parent_containment",
      "validate_forbidden_root_separation",
      "validate_parent_chain_symlinks",
      "require_target_absent_or_empty",
      "create_target",
      "canonicalize_created_target",
      "rerun_containment",
      "rerun_forbidden_root_checks",
      "materialize_source_only_after_all_prior_steps_pass",
    ]);
    expect(record.cleanup_sequence).toEqual([
      "canonicalize_cleanup_target",
      "require_exact_action_522_identity",
      "require_containment_inside_canonical_trusted_temp_root",
      "require_forbidden_root_separation",
      "reject_symlink_target",
      "remove_only_exact_action_522_subtree",
      "verify_target_absent_or_empty",
    ]);
  });

  test("preserves rehearsal policies while authorizing no rehearsal, deployment, or activation", () => {
    const record = readJson<JsonObject>(recordPath);
    const preserved = record.preserved_rehearsal_policy as JsonObject;

    expect(preserved.action_518_candidate_hashes_preserved).toBe(true);
    expect(preserved.candidate_file_count_preserved).toBe(32);
    expect(preserved.route_hash_export_state_preserved).toBe(true);
    expect(preserved.authoritative_npm_run_build_policy_preserved).toBe(true);
    expect(preserved.optional_one_shot_webpack_diagnostic_preserved).toBe(true);
    expect(record.candidate_change_required).toBe(false);
    expect(record.candidate_hash_change_required).toBe(false);
    expect(record.rehearsal_authorized).toBe(false);
    expect(record.deployment_authorized).toBe(false);
    expect(record.activation_authorized).toBe(false);
  });

  test("approves Action 522 remediation gate and keeps runtime preview waiting", () => {
    const record = readJson<JsonObject>(recordPath);
    const action519 = readJson<JsonObject>(action519Path);

    expect(action519.approval_decision).toBe("approved");
    expect(record.path_safety_readiness).toBe("path_safety_remediation_ready");
    expect(record.approval_decision).toBe("approved");
    expect(record.unresolved_conditions).toEqual([]);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
    expect(record.next_action).toBe(
      "action_522_remediated_32_file_candidate_build_rehearsal_retry_after_path_safety_remediation",
    );
  });

  test("runs the Action 521 verifier", () => {
    const output = execFileSync("node", [verifierPath], { cwd: repoRoot, encoding: "utf8" });
    const result = JSON.parse(output) as JsonObject;

    expect(result.verification_status).toBe("passed");
    expect(result.path_safety_readiness).toBe("path_safety_remediation_ready");
    expect(result.approval_decision).toBe("approved");
    expect(result.failures).toEqual([]);
  });
});
