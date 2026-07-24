import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const root = process.cwd();
const candidateRoot = "/private/tmp/ture-action-370-corrected-preview-candidate";
const documentPath = join(root,
  "docs/action-377-authentication-and-non-production-site-binding-approval-gate.md");
const verifierPath = join(root,
  "scripts/action-377-authentication-and-non-production-site-binding-approval-gate-verify.mjs");
const document = readFileSync(documentPath, "utf8");
const result = JSON.parse(execFileSync("node", [verifierPath], { cwd: root, encoding: "utf8" }));

test("documentation contract is complete", () => {
  for (const section of [
    "## Purpose", "## Scope", "## Action 376 Capability Result", "## Exact Candidate Binding",
    "## Exact CLI Identity", "## Authentication Strategy Options",
    "## Selected Future Authentication Strategy", "## Credential Redaction Requirements",
    "## Account Identity Requirements", "## Team Identity Requirements", "## Site Identity Requirements",
    "## Target-Classification Vocabulary", "## Exact Read-Only Network Boundary",
    "## Selected Linkage Policy", "## Stop Conditions", "## Action 378 Evidence Contract",
    "## Approval Vocabulary", "## Approval Decision", "## Next Permitted Action",
  ]) expect(document).toContain(section);
});

test("preserves Action 376 capability and exact CLI identity", () => {
  expect(result.action_376_capability_preserved).toBe(true);
  expect(result.exact_cli_identity_preserved).toBe(true);
  expect(document).toContain("netlify-cli@26.2.0");
  expect(document).toContain("c4debb7fd8121b93021194a5b6f76e62a7278f804e97ebdd8057f97981d78ef2");
});

test("preserves candidate and Action 362 attempt binding", () => {
  expect(result.candidate_exact_and_clean).toBe(true);
  expect(result.action_362_approval_preserved).toBe(true);
  expect(result.preview_attempt_consumed).toBe(false);
  expect(result.deployment_attempt_count).toBe(0);
  expect(document).toContain("b0bb5c4686d9cab3b682b3b06fadee4cf73cab07");
});

test("evaluates all six authentication strategies", () => {
  for (const strategy of [
    "A. User-Provided Process-Scoped Personal Access Token",
    "B. Existing User-Home CLI State",
    "C. Interactive Browser Login",
    "D. OAuth or Device Flow",
    "E. Existing Approved Deployment Connector",
    "F. Repository or Application Environment Discovery",
  ]) expect(document).toContain(strategy);
  expect(result.authentication_strategies_complete).toBe(true);
});

test("selects user-authorized process-scoped authentication only", () => {
  expect(result.selected_authentication_strategy)
    .toBe("operator_supplied_process_scoped_personal_access_token");
  expect(document).toContain("The token must not be assumed to exist");
  expect(document).toContain("No login flow is approved");
});

test("rejects repository environment and ambient credential discovery", () => {
  expect(document).toContain("Assessment: rejected and prohibited");
  expect(document).toContain("Repository files, application environment files, candidate files");
  expect(document).toContain("user-home CLI state, browser state, clipboard scraping, shell history");
});

test("defines provenance validity permission and redaction contracts", () => {
  expect(document).toContain("operator_supplied_existing_personal_access_token");
  expect(document).toContain("Validity may be proven only by the frozen read-only current-user operation");
  expect(document).toContain("must not test mutation permissions");
  expect(document).toContain("synthetic canary secret");
  expect(document).toContain("Token fingerprints are prohibited by default");
  expect(result.credential_redaction_and_nonpersistence_complete).toBe(true);
});

test("requires exact account team site and ownership identity", () => {
  expect(document).toContain("A site-name match is insufficient");
  expect(document).toContain("operator-approved exact site ID");
  expect(document).toContain("ownership_match: true");
  expect(document).toContain("Production domain and Netlify deploy subdomain relationship");
  expect(document).toContain("Production branch from build settings");
  expect(result.account_team_site_ownership_contract_complete).toBe(true);
});

test("freezes a narrow read-only API boundary", () => {
  expect(document).toContain("`getCurrentUser`");
  expect(document).toContain("`listAccountsForUser`");
  expect(document).toContain("`getSite`");
  expect(document).toContain("All must be GET/read-only");
  expect(document).toContain("it may not broaden the boundary dynamically");
  expect(result.read_only_boundary_complete).toBe(true);
});

test("uses the exact target-classification vocabulary", () => {
  for (const value of [
    "verified_non_production_preview",
    "verified_production",
    "ambiguous_target",
    "unavailable_target",
  ]) expect(document).toContain(`\`${value}\``);
  expect(result.target_classification_required).toBe("verified_non_production_preview");
  expect(document).toContain("Only `verified_non_production_preview` may permit");
});

test("excludes production alias branch and domain risk", () => {
  expect(document).toContain("No automatic production promotion, alias update, production branch mutation");
  expect(document).toContain("`--prod`, `--prod-if-unlocked`, aliases");
  expect(document).toContain("Any automatic production alias update");
});

test("selects explicit site targeting without persistent linkage", () => {
  expect(result.selected_linkage_policy).toBe("explicit_verified_site_id_without_persistent_linkage");
  expect(document).toContain("Policy A: no persistent linkage");
  expect(document).toContain("### C. Link the Immutable Candidate");
  expect(document).toContain("### D. Link the Shared Worktree");
  expect(existsSync(join(root, ".netlify"))).toBe(false);
  expect(existsSync(join(candidateRoot, ".netlify"))).toBe(false);
});

test("keeps exact source binding and stop conditions closed", () => {
  expect(document).toContain("route SHA-256 `98c7de74c94364eed9a447469ef367f1f454b42ae17d3911b3ebfad6ed5213bb`");
  expect(document).toContain("Target classification is not `verified_non_production_preview`");
  expect(document).toContain("The preview attempt would be consumed");
  expect(document).toContain("Read-only inspection requires mutation");
});

test("defines a secret-free Action 378 evidence schema", () => {
  expect(document).toContain("Evidence schema version");
  expect(document).toContain("Credential-present, credential-valid");
  expect(document).toContain("Redacted account and team identity");
  expect(document).toContain("Frozen endpoint/helper inventory");
  expect(document).toContain("It must not contain tokens, passwords, cookies, authorization headers");
  expect(result.action_378_evidence_contract_complete).toBe(true);
});

test("performs no credential auth Netlify linkage or deployment action", () => {
  expect(result.credential_access_performed).toBe(false);
  expect(result.authentication_performed).toBe(false);
  expect(result.netlify_call_performed).toBe(false);
  expect(result.account_site_inspection_performed).toBe(false);
  expect(result.site_linkage_created).toBe(false);
  expect(result.netlify_state_created).toBe(false);
  expect(result.deployment_performed).toBe(false);
  expect(result.production_blocked).toBe(true);
  expect(result.main_blocked).toBe(true);
});

test("returns approved_with_conditions and keeps Action 378 separate", () => {
  expect(result.verification_status).toBe("passed");
  expect(result.approval_decision).toBe("approved_with_conditions");
  expect(result.recommended_next_action)
    .toBe("action_378_user_authorized_read_only_authentication_and_exact_site_metadata_capability_verification");
});
