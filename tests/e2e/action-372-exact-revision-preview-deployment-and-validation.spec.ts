import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const candidate = "/private/tmp/ture-action-370-corrected-preview-candidate";
const evidencePath = join(root, "docs/action-372-exact-revision-preview-deployment-evidence.json");
const documentPath = join(root, "docs/action-372-exact-revision-preview-deployment-and-validation.md");
const verifierPath = join(root,
  "scripts/action-372-exact-revision-preview-deployment-and-validation-verify.mjs");
const routePath = join(candidate, "app/api/runtime-health/ping/route.ts");
const manifestPath = join(candidate, "docs/action-370-preview-deployment-input-manifest.json");

const candidateSha = "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07";
const baselineSha = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const routeSha = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const manifestSha = "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892";
const frozenBody = {
  ok: true,
  route_ping: true,
  route_build_marker: "action_344_future_runtime_ping_only_route",
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  replay_executed: false,
  synthetic_outcomes_persisted: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  recommendation_rows_mutated: false,
  runtime_route_scope: "ping_only",
  deploy_readiness_required: true,
};

function evidence() {
  return JSON.parse(readFileSync(evidencePath, "utf8"));
}

function verifier() {
  return JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8" }));
}

function hash(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("evidence schema and decision vocabulary are exact", () => {
  const value = evidence();
  expect(value.evidence_schema_version).toBe("1.0.0");
  expect(value.decision_vocabulary).toEqual([
    "preview_validated",
    "preview_validated_with_conditions",
    "preview_failed",
    "preview_aborted",
  ]);
  expect(value.final_decision).toBe("preview_aborted");
});

test("candidate baseline route manifest and binding remain exact", () => {
  const value = evidence();
  expect(value.candidate_sha).toBe(candidateSha);
  expect(value.baseline_sha).toBe(baselineSha);
  expect(value.route_sha256).toBe(routeSha);
  expect(value.manifest_sha256).toBe(manifestSha);
  expect(execFileSync("git", ["rev-parse", "HEAD"], { cwd: candidate, encoding: "utf8" }).trim())
    .toBe(candidateSha);
  expect(execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
    cwd: candidate,
    encoding: "utf8",
  }).trim()).toBe("");
  expect(hash(routePath)).toBe(routeSha);
  expect(hash(manifestPath)).toBe(manifestSha);
  expect(value.pre_deploy_verification.binding_evidence_exact).toBe(true);
});

test("preview target was not ambiguously treated as non-production", () => {
  const target = evidence().deployment_target;
  expect(target.classification).toBe("unverified_no_approved_local_target_binding");
  expect(target.non_production_proven).toBe(false);
  expect(target.classification_result).toBe("blocked_before_external_initiation");
  expect(target.preinstalled_netlify_cli_present).toBe(false);
  expect(target.local_site_linkage_present).toBe(false);
  expect(target.approved_auth_and_site_configuration_present).toBe(false);
});

test("blocked preflight does not consume the one preview attempt", () => {
  const attempt = evidence().attempt;
  expect(attempt.preview_attempt_consumed).toBe(false);
  expect(attempt.attempt_consumption_timestamp_utc).toBeNull();
  expect(attempt.external_deployment_operation_started).toBe(false);
  expect(attempt.deployment_attempt_count).toBe(0);
  expect(attempt.second_attempt_occurred).toBe(false);
});

test("no deployment identifier URL build or function execution exists", () => {
  const deployment = evidence().deployment;
  expect(deployment.deployment_identifier).toBeNull();
  expect(deployment.preview_url_reference).toBeNull();
  expect(deployment.preview_url_classification).toBe("not_allocated_deployment_never_started");
  expect(deployment.deployment_start_timestamp_utc).toBeNull();
  expect(deployment.deployment_completion_timestamp_utc).toBeNull();
  expect(deployment.build_status).toBe("not_started");
  expect(deployment.function_initialization_status).toBe("not_started");
});

test("validation scope remains exactly the frozen route and bounded methods", () => {
  const scope = evidence().validation_scope;
  expect(scope.endpoint).toBe("/api/runtime-health/ping");
  expect(scope.permitted_methods).toEqual(["GET", "GET", "POST", "PUT"]);
  expect(scope.additional_endpoints_requested).toBe(false);
});

test("frozen GET response contract remains documented exactly", () => {
  const document = readFileSync(documentPath, "utf8");
  expect(document).toContain(JSON.stringify(frozenBody));
  expect(document).toContain("Content-Type: application/json; charset=utf-8");
  expect(document).toContain("Cache-Control: no-store, max-age=0");
  expect(document).toContain("with no additional keys");
});

test("GET and repeated GET correctly record pre-deployment abort", () => {
  const value = evidence();
  expect(value.get_evidence.performed).toBe(false);
  expect(value.get_evidence.status).toBeNull();
  expect(value.get_evidence.additional_keys).toBeNull();
  expect(value.get_evidence.contract_result).toBe("not_performed_pre_deploy_abort");
  expect(value.repeated_get_evidence.performed).toBe(false);
  expect(value.repeated_get_evidence.body_identical).toBeNull();
  expect(value.repeated_get_evidence.contract_result).toBe("not_performed_pre_deploy_abort");
});

test("POST and PUT correctly record pre-deployment abort rather than invented 405 evidence", () => {
  const value = evidence();
  for (const method of [value.post_evidence, value.put_evidence]) {
    expect(method.performed).toBe(false);
    expect(method.status).toBeNull();
    expect(method.framework_managed_405).toBeNull();
    expect(method.contract_result).toBe("not_performed_pre_deploy_abort");
  }
});

test("no redirect HTTP 400 empty HTML or cache result is falsely claimed", () => {
  const value = evidence();
  expect(value.redirect_evidence.inspection_performed).toBe(false);
  expect(value.redirect_evidence.redirect_chain).toEqual([]);
  expect(value.redirect_evidence.unexpected_redirect_observed).toBe(false);
  expect(value.recovery_regression_evidence.http_400_check).toBe("not_performed_pre_deploy_abort");
  expect(value.recovery_regression_evidence.http_400_observed).toBe(false);
  expect(value.recovery_regression_evidence.empty_body_observed).toBe(false);
  expect(value.recovery_regression_evidence.html_response_observed).toBe(false);
  expect(value.recovery_regression_evidence.caching_mismatch_observed).toBe(false);
});

test("provider Supabase persistence and external side effects remain absent", () => {
  const runtime = evidence().runtime_safety;
  expect(runtime.provider_initialization_observed).toBe(false);
  expect(runtime.supabase_initialization_observed).toBe(false);
  expect(runtime.persistence_observed).toBe(false);
  expect(runtime.external_side_effect_observed).toBe(false);
  expect(runtime.unexpected_log_classification).toBe("no_external_deployment_or_runtime_logs_created");
});

test("source configuration environment production and main remain untouched", () => {
  const value = evidence();
  expect(Object.values(value.repository_changes_during_action).every((item) => item === false)).toBe(true);
  expect(value.safety.netlify_call_performed).toBe(false);
  expect(value.safety.external_endpoint_request_performed).toBe(false);
  expect(value.safety.production_deployment_performed).toBe(false);
  expect(value.safety.production_alias_modified).toBe(false);
  expect(value.safety.production_traffic_modified).toBe(false);
  expect(value.safety.main_modified).toBe(false);
});

test("stop condition is pre-deployment and has no remediation or retry", () => {
  const stop = evidence().stop_condition;
  expect(stop.triggered).toBe(true);
  expect(stop.phase).toBe("pre_deployment_target_verification");
  expect(stop.remediation_attempted).toBe(false);
  expect(stop.retry_attempted).toBe(false);
});

test("deterministic verifier succeeds with preview_aborted", () => {
  const result = verifier();
  expect(result.verification_status).toBe("passed");
  expect(result.final_decision).toBe("preview_aborted");
  expect(result.candidate_exact_and_clean).toBe(true);
  expect(result.action_371_approval_valid).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.external_deployment_operation_started).toBe(false);
  expect(result.deployment_attempt_count).toBe(0);
  expect(result.no_second_attempt).toBe(true);
  expect(result.production_untouched).toBe(true);
  expect(result.main_untouched).toBe(true);
});

test("relevant upstream Action 370 and 371 gates remain healthy", () => {
  for (const script of [
    "scripts/action-370-corrected-immutable-preview-candidate-preparation-verify.mjs",
    "scripts/action-371-exact-revision-preview-deployment-execution-approval-gate-verify.mjs",
  ]) {
    const result = JSON.parse(execFileSync("node", [join(root, script)], {
      cwd: root,
      encoding: "utf8",
    }));
    expect(result.verification_status).toBe("passed");
  }
});

test("verifier and tests cannot trigger a deployment or external request", () => {
  const verifierSource = readFileSync(verifierPath, "utf8");
  const testSource = readFileSync(join(root,
    "tests/e2e/action-372-exact-revision-preview-deployment-and-validation.spec.ts"), "utf8");
  const forbiddenMarkers = [
    ["fet", "ch("].join(""),
    ["https", "://"].join(""),
    ["netlify", " deploy"].join(""),
    ["git", " push"].join(""),
    ["write", "File"].join(""),
  ];
  for (const source of [verifierSource, testSource]) {
    for (const marker of forbiddenMarkers) expect(source).not.toContain(marker);
  }
});
