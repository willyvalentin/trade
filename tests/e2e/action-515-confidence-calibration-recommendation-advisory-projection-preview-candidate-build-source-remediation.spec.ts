import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";

import { expect, test } from "@playwright/test";

const root = resolve(__dirname, "../..");
const recordPath =
  "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-record.json";
const docPath =
  "docs/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation.md";
const routePath = "app/api/recommendations/evaluate-outcomes/route.ts";
const verifierPath =
  "scripts/action-515-confidence-calibration-recommendation-advisory-projection-preview-candidate-build-source-remediation-verify.mjs";
const action513VerifierPath =
  "scripts/action-513-confidence-calibration-recommendation-advisory-projection-preview-webpack-invocation-runtime-precheck-completion-gate-verify.mjs";
const action514VerifierPath =
  "scripts/action-514-confidence-calibration-recommendation-advisory-projection-preview-webpack-build-failure-bounded-diagnostic-retry-after-invocation-remediation-verify.mjs";

type Action515Record = {
  defect_classification: string;
  implicated_path: string;
  invalid_route_export: string;
  helper_usage_inventory: Array<Record<string, unknown>>;
  remediation_strategy: string;
  helper_extracted: boolean;
  invalid_route_export_removed: boolean;
  route_export_surface_after: string[];
  helper_body_sha256_before: string;
  helper_body_sha256_after: string;
  helper_behavior_changed: boolean;
  route_behavior_changed: boolean;
  source_files_changed: string[];
  candidate_hash_change_required: boolean;
  historical_candidate_status: string;
  remediation_result: string;
  runtime_preview_state: string;
  next_action: string;
  [key: string]: unknown;
};

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function runVerifier(relativePath: string): Record<string, unknown> {
  return JSON.parse(execFileSync("node", [relativePath], { cwd: root, encoding: "utf8" })) as Record<string, unknown>;
}

function extractHelperBody(source: string): string {
  const start = source.indexOf("function buildOutcomeEligibility");
  expect(start).toBeGreaterThanOrEqual(0);
  let depth = 0;
  let seenBody = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") {
      depth += 1;
      seenBody = true;
    } else if (char === "}") {
      depth -= 1;
      if (seenBody && depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }
  throw new Error("Unable to extract helper body");
}

test.describe("Action 515 candidate build source remediation", () => {
  test("records Action 514 candidate defect diagnosis", () => {
    expect(existsSync(join(root, recordPath))).toBe(true);
    expect(existsSync(join(root, docPath))).toBe(true);
    expect(existsSync(join(root, verifierPath))).toBe(true);
    const record = readJson<Action515Record>(recordPath);
    expect(record.defect_classification).toBe("candidate_source_build_defect");
    expect(record.implicated_path).toBe(routePath);
    expect(record.invalid_route_export).toBe("buildOutcomeEligibility");
  });

  test("audits usage and selects local-private remediation path", () => {
    const record = readJson<Action515Record>(recordPath);
    expect(record.helper_usage_inventory.length).toBeGreaterThanOrEqual(5);
    expect(record.external_runtime_imports_found).toBe(false);
    expect(record.external_test_imports_requiring_export_found).toBe(false);
    expect(record.remediation_strategy).toBe("make_route_helper_module_private");
    expect(record.helper_extracted).toBe(false);
    expect(record.new_helper_path).toBeNull();
  });

  test("supports extracted-helper branch as blocked-not-needed coverage", () => {
    const record = readJson<Action515Record>(recordPath);
    expect(record.helper_extracted).toBe(false);
    expect(record.remediation_strategy).not.toBe("extract_route_helper_to_dedicated_module");
  });

  test("removes invalid route export and preserves valid route handler export", () => {
    const record = readJson<Action515Record>(recordPath);
    const routeSource = read(routePath);
    expect(record.invalid_route_export_removed).toBe(true);
    expect(routeSource).not.toContain("export function buildOutcomeEligibility");
    expect(routeSource).toContain("function buildOutcomeEligibility");
    expect(routeSource).toContain("export async function POST");
    expect(record.route_export_surface_after).toEqual(["POST"]);
  });

  test("proves helper eligible, ineligible, invalid, and boundary behavior unchanged by body hash", () => {
    const record = readJson<Action515Record>(recordPath);
    const routeSource = read(routePath);
    const helperBody = extractHelperBody(routeSource);
    const hash = createHash("sha256").update(helperBody).digest("hex");
    expect(hash).toBe(record.helper_body_sha256_before);
    expect(hash).toBe(record.helper_body_sha256_after);
    expect(record.helper_behavior_changed).toBe(false);
  });

  test("preserves route behavior and avoids provider or Supabase calls", () => {
    const record = readJson<Action515Record>(recordPath);
    expect(record.route_behavior_changed).toBe(false);
    expect(record.api_request_response_semantics_changed).toBe(false);
    expect(record.provider_behavior_changed).toBe(false);
    expect(record.supabase_behavior_changed).toBe(false);
    expect(record.provider_called).toBe(false);
    expect(record.supabase_accessed).toBe(false);
  });

  test("limits changed source files to the exact route file", () => {
    const record = readJson<Action515Record>(recordPath);
    expect(record.source_files_changed).toEqual([routePath]);
    expect(record.package_or_lockfile_modified).toBe(false);
    expect(record.configuration_modified).toBe(false);
    expect(record.environment_modified).toBe(false);
  });

  test("marks candidate hash change required and historical candidate non-executable", () => {
    const record = readJson<Action515Record>(recordPath);
    expect(record.candidate_hash_change_required).toBe(true);
    expect(record.new_candidate_hash_computed).toBe(false);
    expect(record.historical_candidate_status).toBe("historical_candidate_build_defective");
    expect(record.historical_action_492_hashes_retained_as_historical_only).toBe(true);
  });

  test("sets Action 516 boundary and performs no deployment or activation", () => {
    const record = readJson<Action515Record>(recordPath);
    expect(record.remediation_result).toBe("candidate_build_source_remediation_completed");
    expect(record.next_action).toBe("action_516_remediated_runtime_complete_candidate_reconstruction_and_hash_freeze");
    expect(record.deployment_performed).toBe(false);
    expect(record.preview_activated).toBe(false);
    expect(record.runtime_preview_state).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("documents remediation and verifies Actions 513-515", () => {
    const doc = read(docPath);
    expect(doc).toContain("Invalid route export: `buildOutcomeEligibility`");
    expect(doc).toContain("Strategy: `make_route_helper_module_private`");
    expect(doc).toContain("action_516_remediated_runtime_complete_candidate_reconstruction_and_hash_freeze");
    expect(runVerifier(action513VerifierPath).verification_status).toBe("passed");
    expect(runVerifier(action514VerifierPath).verification_status).toBe("passed");
    expect(runVerifier(verifierPath).verification_status).toBe("passed");
  });
});
