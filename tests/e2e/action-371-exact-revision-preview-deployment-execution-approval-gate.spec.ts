import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const candidate = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root,
  "docs/action-371-exact-revision-preview-deployment-execution-approval-gate.md");
const verifierPath = join(root,
  "scripts/action-371-exact-revision-preview-deployment-execution-approval-gate-verify.mjs");
const routePath = join(candidate, "app/api/runtime-health/ping/route.ts");
const manifestPath = join(candidate, "docs/action-370-preview-deployment-input-manifest.json");

const candidateSha = "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07";
const baselineSha = "51aced66782ec9a37cd358238f02b6f5c0ae97bd";
const routeSha = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const manifestSha = "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892";

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function git(args: string[]) {
  return execFileSync("git", args, { cwd: candidate, encoding: "utf8" }).trim();
}

function runVerifier() {
  return JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8" }));
}

const document = readFileSync(documentPath, "utf8");

test("documentation contains the complete approval vocabulary and deterministic decision", () => {
  expect(document).toContain("approval_vocabulary: approved | approved_with_conditions | blocked");
  expect(document).toContain("approval_decision: approved");
  expect(document).toContain("## Deterministic Gate Conditions");
  expect(document).toContain("## Passed Conditions");
  expect(document).toContain("## Failed Conditions");
  expect(document).toContain("## Unresolved Conditions");
});

test("candidate and baseline are bound to the exact unamended clean revision", () => {
  expect(git(["rev-parse", "HEAD"])).toBe(candidateSha);
  expect(git(["rev-parse", "HEAD^"])).toBe(baselineSha);
  expect(git(["rev-list", "--count", `${baselineSha}..HEAD`])).toBe("1");
  expect(git(["status", "--porcelain=v1", "--untracked-files=all"])).toBe("");
  expect(document).toContain("## No-Amendment Requirement");
  expect(document).toContain("## No-Substitution Requirement");
});

test("route and manifest hashes remain exact", () => {
  expect(sha256(routePath)).toBe(routeSha);
  expect(sha256(manifestPath)).toBe(manifestSha);
  const result = runVerifier();
  expect(result.route_hash_exact).toBe(true);
  expect(result.manifest_hash_exact).toBe(true);
});

test("revision binding and ownership inventories remain exact", () => {
  const result = runVerifier();
  expect(result.revision_binding_valid).toBe(true);
  expect(result.binding_copies_byte_identical).toBe(true);
  expect(result.introduced_runtime_routes).toEqual(["app/api/runtime-health/ping/route.ts"]);
  expect(result.approved_preview_input_count).toBe(53);
  expect(result.approved_baseline_dependency_count).toBe(2343);
  expect(result.excluded_concurrent_file_count).toBe(13);
  expect(result.unresolved_blocker_count).toBe(0);
  expect(result.inventories_exact).toBe(true);
});

test("Action 362 approval is preserved and the single attempt remains unconsumed", () => {
  const result = runVerifier();
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(document).toContain("consumed only when a preview deployment operation is actually initiated");
  expect(document).toContain("It is not consumed by Action 371");
  expect(document).toContain("No automatic second attempt is approved");
});

test("future execution is exact revision non-production route-only and code-free", () => {
  expect(document).toContain("The only approved deployment source is");
  expect(document).toContain("## Non-Production Target Requirement");
  expect(document).toContain("## Code-Free Execution Requirement");
  expect(document).toContain("## Configuration-Free Execution Requirement");
  expect(document).toContain("## Environment-Free Execution Requirement");
  expect(runVerifier().exact_execution_boundary).toBe(true);
});

test("endpoint validation freezes status headers body repeat and unsupported methods", () => {
  expect(document).toContain("GET /api/runtime-health/ping");
  expect(document).toContain("HTTP 200");
  expect(document).toContain("Content-Type: application/json; charset=utf-8");
  expect(document).toContain("Cache-Control: no-store, max-age=0");
  expect(document).toContain("identical repeated response");
  expect(document).toContain("framework-managed HTTP 405");
  expect(document).toContain("No additional key");
  expect(runVerifier().exact_endpoint_validation_contract).toBe(true);
});

test("recovery regression empty HTML and redirect responses are explicit stop conditions", () => {
  expect(document).toContain("HTTP 400 recovery regression");
  expect(document).toContain("non-empty, non-HTML body");
  expect(document).toContain("automatic redirect following disabled");
  expect(document).toContain("GET is non-200, HTTP 400, empty, HTML, unexpectedly redirected");
  expect(document).toContain("No remediation or retry is allowed");
});

test("deployment evidence contract is complete and does not alter route output", () => {
  for (const value of [
    "one deployment ID and one preview URL",
    "external deployment start and end timestamps",
    "build and function initialization status",
    "POST and PUT results",
    "attempt-consumed status",
    "final preview validation decision",
  ]) {
    expect(document).toContain(value);
  }
  expect(document).toContain("without adding metadata to the route response");
});

test("no deployment push external request or attempt consumption occurred", () => {
  const result = runVerifier();
  expect(result.deployment_performed).toBe(false);
  expect(result.netlify_call_performed).toBe(false);
  expect(result.external_request_performed).toBe(false);
  expect(result.push_performed).toBe(false);
  expect(result.preview_attempt_consumed).toBe(false);
});

test("production and main remain blocked", () => {
  const result = runVerifier();
  expect(result.production_blocked).toBe(true);
  expect(result.main_push_blocked).toBe(true);
  expect(document).toContain("## Production Prohibition");
  expect(document).toContain("## Main-Push Prohibition");
});

test("verifier succeeds locally and relevant upstream Action 370 remains healthy", () => {
  const result = runVerifier();
  expect(result.verification_status).toBe("passed");
  expect(result.approval_decision).toBe("approved");
  expect(result.action_370_prepared).toBe(true);

  const upstream = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-370-corrected-immutable-preview-candidate-preparation-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
  }));
  expect(upstream.verification_status).toBe("passed");
  expect(upstream.preparation_decision).toBe("prepared");
});

test("verifier source is read-only network-free and deployment-free", () => {
  const source = readFileSync(verifierPath, "utf8");
  expect(source).not.toContain("fetch(");
  expect(source).not.toContain("https://");
  expect(source).not.toContain("netlify deploy");
  expect(source).not.toContain("git push");
  expect(source).not.toContain("git commit");
  expect(source).not.toContain("writeFile");
  expect(source).not.toContain("SUPABASE");
  expect(source).not.toContain("TWELVE_DATA");
});
