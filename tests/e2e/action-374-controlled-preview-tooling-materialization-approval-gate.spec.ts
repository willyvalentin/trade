import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const candidate = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root, "docs/action-374-controlled-preview-tooling-materialization-approval-gate.md");
const verifierPath = join(root,
  "scripts/action-374-controlled-preview-tooling-materialization-approval-gate-verify.mjs");
const document = readFileSync(documentPath, "utf8");

const candidateSha = "b0bb5c4686d9cab3b682b3b06fadee4cf73cab07";
const routeSha = "98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb";
const manifestSha = "b7ac9ddaf40cc516bcdbdc7208dc6669f6b34a18a1810c0bde72209b25710892";

function verifier() {
  return JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8" }));
}

function hash(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("documentation contract and approval vocabulary are exact", () => {
  expect(document).toContain("approval_vocabulary: approved | approved_with_conditions | blocked");
  expect(document).toContain("approval_decision: approved_with_conditions");
  for (const section of [
    "## Purpose", "## Scope", "## Tooling Materialization Strategy Evaluation",
    "## Selected Materialization Strategy", "## Approval Vocabulary", "## Approval Decision",
    "## Passed Conditions", "## Failed Conditions", "## Unresolved Conditions",
  ]) expect(document).toContain(section);
});

test("Action 372 abort and Action 373 blocked state remain preserved", () => {
  const result = verifier();
  expect(result.action_372_result).toBe("preview_aborted");
  expect(result.action_373_readiness).toBe("blocked");
  expect(document).toContain("Action 372 remains `preview_aborted`");
  expect(document).toContain("Action 373 remains `blocked`");
});

test("candidate route and manifest remain exact and clean", () => {
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

test("preview attempt and deployment attempt count remain untouched", () => {
  const result = verifier();
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.deployment_attempt_count).toBe(0);
});

test("all six materialization strategies are evaluated", () => {
  for (const strategy of [
    "A. Exact version-pinned package in a disposable isolated tooling directory",
    "B. Official standalone CLI artifact",
    "C. Trusted package cache already present locally",
    "D. Add CLI to Ture repository dependencies",
    "E. On-demand `npx`",
    "F. Globally installed unversioned CLI",
  ]) expect(document).toContain(strategy);
});

test("repository dependency npx and unversioned global strategies are rejected", () => {
  expect(document).toContain("Strategy D is rejected because tooling must not enter application dependencies");
  expect(document).toContain("E. On-demand `npx`");
  expect(document).toContain("permits implicit resolution/fetch and floating provenance");
  expect(document).toContain("F. Globally installed unversioned CLI");
  expect(document).toContain("version, provenance, integrity, and self-update state are uncontrolled");
});

test("exact version must be resolved and frozen without memory assumptions", () => {
  expect(document).toContain("Do not assume a version from memory");
  expect(document).toContain("select exactly one version before installation approval");
  expect(document).toContain("`latest`, `next`, wildcards, ranges, tags, unpinned major versions, and unpinned minor versions");
  expect(verifier().exact_cli_version_resolved).toBe(false);
});

test("provenance and package integrity contract is complete", () => {
  for (const value of [
    "package name, exact version",
    "official registry or artifact host classification",
    "dist URL classification without credentials",
    "published integrity value",
    "package tarball SHA-256",
    "package manifest SHA-256",
    "tooling lock SHA-256",
    "installed inventory digest",
    "executable SHA-256",
  ]) expect(document).toContain(value);
});

test("transitive tooling lock package manager and platform contracts are complete", () => {
  expect(document).toContain("exact transitive lock");
  expect(document).toContain("Every resolved package, version, source, integrity");
  expect(document).toContain("pin and record the existing package-manager executable path");
  expect(document).toContain("exact local Node and npm versions");
  expect(document).toContain("current macOS arm64 environment");
});

test("lifecycle postinstall update and telemetry policies default closed", () => {
  expect(document).toContain("Lifecycle scripts are disabled by default");
  expect(document).toContain("No postinstall may run unless");
  expect(document).toContain("Self-update and update checks must be disabled");
  expect(document).toContain("Telemetry must be disabled");
  expect(document).toContain("No unknown script may run");
});

test("network and registry policies require a separate bounded window", () => {
  expect(document).toContain("Action 374 opens no network window");
  expect(document).toContain("separately approved, time-bounded package-download window");
  expect(document).toContain("single-source, version-exact, credential-free");
  expect(document).toContain("No audit fix, funding call");
  expect(verifier().registry_access_performed).toBe(false);
});

test("tooling context remains disposable sibling local untracked and secret-free", () => {
  for (const value of [
    "disposable sibling directory outside the immutable candidate and shared mutable worktree",
    "local-only, non-production, untracked, project-secret-free, application-env-free",
    "Candidate source is read-only evidence",
    "outside both Git worktrees",
  ]) expect(document).toContain(value);
});

test("Git and deployment inputs exclude every tooling artifact", () => {
  expect(document).toContain("No tooling package, lock, executable, cache, log, or generated state may appear in Git status");
  expect(document).toContain("must not be traversed, archived, uploaded, or included in build/deploy input");
  expect(document).toContain("Action 370 manifest and candidate tree must remain unchanged");
});

test("future offline command boundary is narrow", () => {
  for (const value of [
    "version output",
    "general help",
    "command-specific help",
    "offline configuration inspection proven network-free and mutation-free",
  ]) expect(document).toContain(value);
});

test("network auth linkage deploy and mutation commands are denied", () => {
  expect(document).toContain("login, logout, networked status, link, unlink, init, deploy");
  expect(document).toContain("completion installation, update/self-update");
  expect(document).toContain("No site may be linked or unlinked");
  expect(document).toContain("No preview or production deploy");
});

test("materialization and capability evidence contracts are complete", () => {
  for (const value of [
    "tooling-context classification",
    "package/artifact identity and exact version",
    "installed package/file inventories",
    "executable path classification/hash",
    "network and registry results",
    "Git/deploy exclusion",
    "final materialization decision",
    "exact allowlisted commands",
    "filesystem-write inventory",
    "denied command non-execution",
  ]) expect(document).toContain(value);
});

test("no installation registry credential authentication linkage or deployment occurred", () => {
  const result = verifier();
  expect(result.materialization_performed).toBe(false);
  expect(result.tooling_installed).toBe(false);
  expect(result.registry_access_performed).toBe(false);
  expect(result.lifecycle_scripts_executed).toBe(false);
  expect(result.credential_access_performed).toBe(false);
  expect(result.authentication_performed).toBe(false);
  expect(result.site_linkage_created).toBe(false);
  expect(result.netlify_call_performed).toBe(false);
  expect(result.deployment_performed).toBe(false);
  expect(result.external_endpoint_contacted).toBe(false);
});

test("production and main remain blocked", () => {
  const result = verifier();
  expect(result.production_blocked).toBe(true);
  expect(result.main_push_blocked).toBe(true);
  expect(document).toContain("production_blocked: true");
  expect(document).toContain("main_push_blocked: true");
});

test("verifier succeeds with approved_with_conditions and selected Strategy A", () => {
  const result = verifier();
  expect(result.verification_status).toBe("passed");
  expect(result.approval_decision).toBe("approved_with_conditions");
  expect(result.selected_materialization_strategy)
    .toBe("exact_version_pinned_official_package_in_disposable_sibling_tooling_context");
  expect(result.version_provenance_integrity_contract_complete).toBe(true);
  expect(result.lifecycle_network_contract_complete).toBe(true);
  expect(result.isolation_contract_complete).toBe(true);
  expect(result.command_boundary_complete).toBe(true);
});

test("relevant upstream Action 373 remains healthy", () => {
  const result = JSON.parse(execFileSync("node", [join(root,
    "scripts/action-373-approved-preview-tooling-and-non-production-target-binding-readiness-gate-verify.mjs")], {
    cwd: root,
    encoding: "utf8",
  }));
  expect(result.verification_status).toBe("passed");
  expect(result.readiness_decision).toBe("blocked");
  expect(result.preview_attempt_consumed).toBe(false);
});

test("verifier is static read-only installation registry credential and network free", () => {
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
