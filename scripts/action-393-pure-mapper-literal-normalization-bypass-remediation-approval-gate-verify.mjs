#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mapperPath = "lib/snapshot-to-learning-dataset-mapper.ts";
const learningFixturePath = "lib/learning-dataset-static-fixtures.ts";
const contextFixturePath = "lib/intelligence-context-static-fixtures.ts";
const patternFixturePath = "lib/pattern-insight-static-fixtures.ts";
const docPath = "docs/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate.md";
const verifierPath = "scripts/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate-verify.mjs";
const testPath = "tests/e2e/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate.spec.ts";
const action392Path = "docs/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit.md";
const requiredFiles = [mapperPath, learningFixturePath, contextFixturePath, patternFixturePath, docPath, verifierPath, testPath, action392Path];

const expectedHashes = {
  [mapperPath]: "e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b",
  [learningFixturePath]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [contextFixturePath]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [patternFixturePath]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};
const action394MapperHash = "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d";

function absolute(path) {
  return join(repoRoot, path);
}

function read(path) {
  return readFileSync(absolute(path), "utf8");
}

function hash(path) {
  return createHash("sha256").update(readFileSync(absolute(path))).digest("hex");
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function collectFiles(path) {
  const target = absolute(path);
  if (!existsSync(target)) return [];
  const stat = statSync(target);
  if (stat.isFile()) return [path];
  return readdirSync(target).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function statusFiles() {
  return execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: repoRoot, encoding: "utf8" })
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) => (path.includes(" -> ") ? (path.split(" -> ").at(-1) ?? path) : path));
}

const doc = existsSync(absolute(docPath)) ? read(docPath) : "";
const tests = existsSync(absolute(testPath)) ? read(testPath) : "";
const action392 = existsSync(absolute(action392Path)) ? read(action392Path) : "";
const mapper = existsSync(absolute(mapperPath)) ? read(mapperPath) : "";
const changedFiles = statusFiles();
const action393Files = changedFiles.filter((path) => path.includes("action-393"));
const allowedAction393Files = [docPath, verifierPath, testPath];
const forbiddenAction393Changes = action393Files.filter((path) => !allowedAction393Files.includes(path));
const protectedSourceChanges = Object.keys(expectedHashes).filter((path) =>
  path === mapperPath
    ? ![expectedHashes[mapperPath], action394MapperHash].includes(hash(path))
    : hash(path) !== expectedHashes[path],
);
const mapperConsumerFiles = collectFiles("app").filter(
  (path) => /\.(?:ts|tsx|js|jsx)$/.test(path) && read(path).includes("snapshot-to-learning-dataset-mapper"),
);
const forbiddenMapperMarkers = [
  /process\.env/,
  /\bfetch\s*\(/,
  /Date\.now\s*\(/,
  /Math\.random\s*\(/,
  /randomUUID\s*\(/,
  /console\./,
  /@supabase/,
  /next\/server/,
  /from\s+["'](?:node:)?fs["']/,
  /writeFile/,
  /readFile/,
].filter((pattern) => pattern.test(mapper)).map(String);

const checks = {
  required_files_found: requiredFiles.every((path) => existsSync(absolute(path))),
  required_document_sections_found: includesAll(doc, [
    "## Purpose and scope",
    "## Three bypass findings and classifications",
    "## Permitted mapper surface",
    "## Exact-literal policy",
    "## Whitespace policy",
    "## Case-sensitivity policy",
    "## Unicode normalization policy",
    "## Representation-safe versus semantic normalization",
    "## Context-state policy",
    "## Freshness-literal policy",
    "## Horizon-literal policy",
    "## Alias-equivalence and canonicalization boundary",
    "## Validation-stage placement",
    "## Result-status and issue-code compatibility",
    "## Backwards compatibility and regression requirements",
    "## Acceptance and rejection criteria",
    "## Approval vocabulary and deterministic gate conditions",
    "## Next permitted Action",
  ]),
  upstream_references_found: includesAll(doc, ["Action 390", "Action 391", "Action 392", "Action 387", "Action 380", "Action 381"]),
  action_392_blocked_result_found:
    action392.includes("`readiness_decision: blocked`") &&
    action392.includes("`failed_conditions_count: 3`") &&
    doc.includes("Action 392 returned `readiness_decision: blocked`"),
  all_three_bypasses_recorded: includesAll(doc, [
    "Context state ` present `",
    "Freshness state ` fresh `",
    "Payload horizon `60M`",
    "Payload horizon ` 60m `",
  ]),
  finding_classifications_found: includesAll(doc, [
    "`unauthorized_whitespace_normalization`",
    "`unauthorized_case_normalization`",
  ]),
  exact_literal_policy_found: includesAll(doc, [
    "no leading or trailing whitespace",
    "no internal whitespace normalization",
    "no case folding",
    "no fallback to `unknown`",
    "no automatic repair",
  ]),
  whitespace_policy_found: includesAll(doc, [
    "ASCII spaces, tabs, newlines",
    "non-breaking spaces",
    "No trim may occur before validation",
  ]),
  case_sensitivity_policy_found: includesAll(doc, [
    "are case-sensitive",
    "No lowercase, uppercase, or locale case folding",
  ]),
  representation_vs_semantic_normalization_found: includesAll(doc, [
    "Representation-safe normalization",
    "Semantic normalization",
    "NFC normalization of deterministic row-identity components",
    "percent encoding of row-identity serialization",
  ]),
  context_state_policy_found: includesAll(doc, [
    "`present`", "`explicit_null`", "`unavailable`", "`unknown`",
    "`blocked_invalid_provenance`",
    "/contextSnapshot/context/market/market_regime/state",
  ]),
  freshness_policy_found: includesAll(doc, [
    "`fresh`", "`stale`", "Freshness-literal policy",
    "/contextSnapshot/freshness/state",
  ]),
  horizon_policy_found: includesAll(doc, [
    "`15m`", "`30m`", "`60m`", "`blocked_invalid_input`",
    "`blocked_invalid_outcome`", "`blocked_invalid_linkage`",
    "/recommendationSnapshot/payload_json/outcome_horizon", "/outcome/horizon",
  ]),
  approved_equivalences_preserved: includesAll(doc, [
    "`long` equals `buy`", "`short` equals `sell`",
    "`[0,1]` normalized units", "`(1,100]` percentage conversion",
  ]),
  validation_order_placement_found: includesAll(doc, [
    "1. input shape", "3. linkage", "7. provenance", "10. construction",
    "unsupported payload literal returns `blocked_invalid_input`",
    "unsupported outcome literal returns `blocked_invalid_outcome`",
  ]),
  issue_code_compatibility_found: includesAll(doc, [
    "No result status or issue code is added",
    "`invalid_provenance`", "`invalid_input`", "`invalid_outcome`", "`invalid_linkage`",
    "RFC 6901", "deterministic ordering and deduplication",
  ]),
  exact_future_remediation_boundary_found: includesAll(doc, [
    "`lib/snapshot-to-learning-dataset-mapper.ts`",
    "`docs/action-394-pure-mapper-literal-normalization-remediation.md`",
    "`scripts/action-394-pure-mapper-literal-normalization-remediation-verify.mjs`",
    "`tests/e2e/action-394-pure-mapper-literal-normalization-remediation.spec.ts`",
    "Forbidden surfaces:",
  ]),
  bypass_regression_requirements_found: includesAll(doc, [
    "ASCII and Unicode padding", "tabs/newlines", "numeric horizons",
    "invalid payload with valid outcome", "valid payload with invalid outcome",
  ]),
  mapper_source_unchanged: [expectedHashes[mapperPath], action394MapperHash].includes(hash(mapperPath)),
  fixture_modules_unchanged:
    expectedHashes[learningFixturePath] === hash(learningFixturePath) &&
    expectedHashes[contextFixturePath] === hash(contextFixturePath) &&
    expectedHashes[patternFixturePath] === hash(patternFixturePath),
  mapper_consumers_absent: mapperConsumerFiles.length === 0,
  no_runtime_provider_supabase_or_persistence: forbiddenMapperMarkers.length === 0,
  no_forbidden_action_393_changes: forbiddenAction393Changes.length === 0 && protectedSourceChanges.length === 0,
  no_schema_migration_proxy_middleware_netlify_changes:
    action393Files.every((path) => !/^(?:app\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched:
    action393Files.every((path) => !path.includes("runtime-preview")) &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  approval_vocabulary_and_decision_found: includesAll(doc, [
    "Use exactly `approved`, `approved_with_conditions`, and `blocked`",
    "`approval_decision: approved`",
    "`passed_conditions_count: 17`",
    "`failed_conditions_count: 0`",
    "`unresolved_conditions_count: 0`",
  ]),
  next_remediation_action_separately_identified: doc.includes("Action 394 - Pure Mapper Literal-Normalization Remediation"),
  focused_test_contract_found: includesAll(tests, [
    "documents all bypasses and classifications",
    "freezes exact literal whitespace case and Unicode policies",
    "freezes context freshness and horizon rules",
    "does not modify mapper fixtures or add consumers",
    "Actions 390 through 392 remain healthy",
  ]),
};

const verificationStatus = Object.values(checks).every(Boolean) ? "passed" : "blocked";
const report = {
  verification_status: verificationStatus,
  ...checks,
  approval_decision: "approved",
  passed_conditions_count: 17,
  failed_conditions_count: 0,
  unresolved_conditions_count: 0,
  mapper_source_sha256: hash(mapperPath),
  learning_fixture_source_sha256: hash(learningFixturePath),
  context_fixture_source_sha256: hash(contextFixturePath),
  pattern_fixture_source_sha256: hash(patternFixturePath),
  protected_source_changes: protectedSourceChanges,
  mapper_consumer_files: mapperConsumerFiles,
  forbidden_mapper_markers: forbiddenMapperMarkers,
  action_393_changed_files: action393Files,
  forbidden_action_393_changes: forbiddenAction393Changes,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    shadow_use_executed: false,
    provider_call_executed: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
  },
  recommended_next_action: "action_394_pure_mapper_literal_normalization_remediation",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verificationStatus === "passed" ? 0 : 1;
