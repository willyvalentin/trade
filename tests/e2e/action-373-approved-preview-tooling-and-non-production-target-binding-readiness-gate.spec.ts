import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const candidate = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root,
  "docs/action-373-approved-preview-tooling-and-non-production-target-binding-readiness-gate.md");
const verifierPath = join(root,
  "scripts/action-373-approved-preview-tooling-and-non-production-target-binding-readiness-gate-verify.mjs");
const evidencePath = join(root, "docs/action-372-exact-revision-preview-deployment-evidence.json");
const document = readFileSync(documentPath, "utf8");

const candidateSha = "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07";
const routeSha = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const manifestSha = "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892";
const abortReason =
  "non_production_target_could_not_be_independently_proven_or_safely_initiated_without_prohibited_tool_installation_or_auth_site_configuration";

function evidence() {
  return JSON.parse(readFileSync(evidencePath, "utf8"));
}

function verifier() {
  return JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8" }));
}

function hash(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("documentation contract and blocked readiness vocabulary are exact", () => {
  expect(document).toContain("readiness_vocabulary: ready | ready_with_conditions | blocked");
  expect(document).toContain("readiness_decision: blocked");
  for (const section of [
    "## Purpose", "## Scope", "## Recovery Context", "## Tooling Strategy Evaluation",
    "## Authentication Requirements", "## Site-Binding Requirements",
    "## Target-Classification Vocabulary", "## Stop Conditions", "## Readiness Decision",
  ]) expect(document).toContain(section);
});

test("Action 372 abort reason and zero-attempt state are preserved", () => {
  const value = evidence();
  expect(value.final_decision).toBe("preview_aborted");
  expect(value.decision_reason).toBe(abortReason);
  expect(value.attempt.preview_attempt_consumed).toBe(false);
  expect(value.attempt.deployment_attempt_count).toBe(0);
  expect(value.attempt.external_deployment_operation_started).toBe(false);
  expect(document).toContain(abortReason);
});

test("candidate route and manifest binding remain exact", () => {
  expect(execFileSync("git", ["rev-parse", "HEAD"], { cwd: candidate, encoding: "utf8" }).trim())
    .toBe(candidateSha);
  expect(execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
    cwd: candidate,
    encoding: "utf8",
  }).trim()).toBe("");
  expect(hash(join(candidate, "app/api/runtime-health/ping/route.ts"))).toBe(routeSha);
  expect(hash(join(candidate, "docs/action-370-preview-deployment-input-manifest.json")))
    .toBe(manifestSha);
});

test("all six tooling strategies are compared without claiming availability", () => {
  for (const strategy of [
    "A. Preinstalled version-pinned Netlify CLI",
    "B. Repository-pinned CLI in trusted dependencies",
    "C. Independently installed CLI in controlled tooling context",
    "D. Existing approved API integration or deployment connector",
    "E. On-demand `npx` fetch",
    "F. Unverified manual browser upload",
  ]) expect(document).toContain(strategy);
  expect(document).toContain("No strategy is claimed as currently available");
});

test("npx fetching and unverified browser deployment are rejected", () => {
  expect(document).toContain("On-demand `npx` execution is rejected");
  expect(document).toContain("A package runner must not fetch");
  expect(document).toContain("rejected unless a separate browser protocol");
});

test("tooling provenance version integrity and no-registry contract are complete", () => {
  for (const value of [
    "tool name, exact version, executable path or connector identity",
    "installation provenance",
    "binary or package hash",
    "no registry fallback or self-update",
    "Floating `latest`",
    "exact-site targeting",
  ]) expect(document).toContain(value);
});

test("authentication provenance and redaction contract excludes secrets", () => {
  for (const value of [
    "mechanism classification",
    "validity state",
    "expiration state",
    "stable non-reversible redacted account/team identifiers",
    "Never store or print token values",
    "authorization headers",
    "secret absence",
  ]) expect(document).toContain(value);
});

test("exact site identity and ownership evidence are mandatory", () => {
  for (const value of [
    "exact site ID or stable redacted equivalent",
    "owning account/team",
    "production-domain association",
    "production branch",
    "deploy-preview capability",
    "Name similarity is insufficient",
    "same approved Ture deployment boundary",
  ]) expect(document).toContain(value);
});

test("target classification vocabulary is deterministic", () => {
  for (const value of [
    "verified_non_production_preview",
    "verified_production",
    "ambiguous_target",
    "unavailable_target",
  ]) expect(document).toContain(value);
  expect(document).toContain("Deployment may proceed only with `verified_non_production_preview`");
});

test("production aliases promotion and traffic are explicitly excluded", () => {
  expect(document).toContain("production aliases and the production custom domain are excluded");
  expect(document).toContain("Production traffic must remain routed to the known production deployment");
  expect(document).toContain("incapable of promotion or alias mutation");
});

test("local linkage is candidate-only temporary ignored and not created", () => {
  expect(document).toContain("Action 373 creates no linkage");
  expect(document).toContain("only inside the isolated candidate");
  expect(document).toContain("No `.netlify` directory or state file may be created");
  expect(document).toContain("excluded from deployment input");
  expect(verifier().local_linkage_created).toBe(false);
});

test("source binding excludes shared worktree push merge and substitution", () => {
  expect(document).toContain("deploy the exact isolated candidate directory");
  expect(document).toContain("without rebuilding source from the shared mutable worktree");
  expect(document).toContain(candidateSha);
  expect(document).toContain(routeSha);
  expect(document).toContain(manifestSha);
});

test("stop conditions reject unsafe tooling authentication site and target states", () => {
  for (const value of [
    "unapproved install", "package fetch", "registry access", "floating version",
    "authentication exposes secrets", "account/team/site ownership is ambiguous",
    "production/preview cannot be distinguished", "deployment needs push/merge",
    "production alias or traffic isolation is uncertain",
    "exact candidate/source binding cannot be enforced",
  ]) expect(document).toContain(value);
});

test("future evidence schema contract contains every bounded identity field", () => {
  for (const value of [
    "schema version", "candidate, baseline, route, and manifest hashes", "tooling strategy",
    "registry status", "authentication classification", "redacted account/team identities",
    "exact site identity and ownership", "target classification", "linkage state",
    "production-alias risk", "deployment-attempt count", "final readiness result",
  ]) expect(document).toContain(value);
  expect(document).toContain("No secret may be stored");
});

test("no installation authentication linkage Netlify call or deployment occurred", () => {
  const result = verifier();
  expect(result.tooling_installed).toBe(false);
  expect(result.authentication_performed).toBe(false);
  expect(result.local_linkage_created).toBe(false);
  expect(result.netlify_call_performed).toBe(false);
  expect(result.deployment_performed).toBe(false);
  expect(result.external_endpoint_contacted).toBe(false);
});

test("Action 362 attempt remains preserved and production and main remain blocked", () => {
  const result = verifier();
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.deployment_attempt_count).toBe(0);
  expect(result.production_blocked).toBe(true);
  expect(result.main_push_blocked).toBe(true);
});

test("verifier succeeds with blocked and the selected future strategy", () => {
  const result = verifier();
  expect(result.verification_status).toBe("passed");
  expect(result.readiness_decision).toBe("blocked");
  expect(result.action_372_result).toBe("preview_aborted");
  expect(result.tooling_strategies_evaluated).toBe(true);
  expect(result.selected_future_tooling_strategy).toContain("controlled_version_pinned_isolated_cli");
  expect(result.target_classification).toBe("unavailable_target");
});

test("relevant upstream Action 372 remains healthy", () => {
  const result = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-372-exact-revision-preview-deployment-and-validation-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
  }));
  expect(result.verification_status).toBe("passed");
  expect(result.final_decision).toBe("preview_aborted");
  expect(result.preview_attempt_consumed).toBe(false);
});

test("verifier is local read-only installation-free and network-free", () => {
  const source = readFileSync(verifierPath, "utf8");
  const forbidden = [
    ["fet", "ch("].join(""),
    ["https", "://"].join(""),
    ["npm", " install"].join(""),
    ["npm", " ci"].join(""),
    ["npx", " netlify"].join(""),
    ["netlify", " deploy"].join(""),
    ["git", " push"].join(""),
    ["write", "File"].join(""),
  ];
  for (const marker of forbidden) expect(source).not.toContain(marker);
});
