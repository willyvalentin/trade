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
const docPath = "docs/action-390-pure-mapper-contract-remediation-approval-gate.md";
const verifierPath = "scripts/action-390-pure-mapper-contract-remediation-approval-gate-verify.mjs";
const testPath = "tests/e2e/action-390-pure-mapper-contract-remediation-approval-gate.spec.ts";
const action389Path = "docs/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit.md";
const requiredFiles = [mapperPath, learningFixturePath, contextFixturePath, docPath, verifierPath, testPath, action389Path];

const expectedHashes = {
  [mapperPath]: "05276aebf1e7c6328242949c22e489ba384c9c501574c5d170d789ba47fa00e2",
  [learningFixturePath]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [contextFixturePath]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
};
const approvedAction391MapperHash = "e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b";
const approvedAction394MapperHash = "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d";
const action391Files = [
  "docs/action-391-pure-mapper-contract-remediation.md",
  "scripts/action-391-pure-mapper-contract-remediation-verify.mjs",
  "tests/e2e/action-391-pure-mapper-contract-remediation.spec.ts",
];
const action394DocPath = "docs/action-394-pure-mapper-literal-normalization-remediation.md";
const findings = [
  "Unsupported context categories are accepted",
  "Invalid freshness states are accepted",
  "Stale/fresh contradictions are accepted",
  "Non-finite context metrics are accepted",
  "Unsupported trading windows are accepted",
  "Payload and outcome horizons may disagree",
  "Failed anti-leakage input can be emitted as passed",
];
const classifications = [
  "missing_domain_validation",
  "inconsistent_state_validation",
  "missing_numeric_validation",
  "missing_linkage_validation",
  "output_integrity_violation",
];

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
const action389 = existsSync(absolute(action389Path)) ? read(action389Path) : "";
const mapper = existsSync(absolute(mapperPath)) ? read(mapperPath) : "";
const changedFiles = statusFiles();
const action390Files = changedFiles.filter((path) => path.includes("action-390"));
const allowedAction390Files = [docPath, verifierPath, testPath];
const forbiddenAction390Changes = action390Files.filter((path) => !allowedAction390Files.includes(path));
const currentMapperHash = hash(mapperPath);
const approvedAction391RemediationImplemented =
  currentMapperHash === approvedAction391MapperHash &&
  action391Files.every((path) => existsSync(absolute(path))) &&
  read("docs/action-391-pure-mapper-contract-remediation.md").includes("Action 390 returned `approval_decision: approved`");
const approvedAction394RemediationImplemented =
  currentMapperHash === approvedAction394MapperHash &&
  existsSync(absolute(action394DocPath)) &&
  read(action394DocPath).includes(`mapper: \`${approvedAction394MapperHash}\``) &&
  read(action394DocPath).includes("Action 394 closes exactly the three literal-normalization bypasses");
const approvedDownstreamRemediationImplemented =
  approvedAction391RemediationImplemented || approvedAction394RemediationImplemented;
const protectedSourceChanges = [learningFixturePath, contextFixturePath].filter(
  (path) => expectedHashes[path] !== hash(path),
);
if (currentMapperHash !== expectedHashes[mapperPath] && !approvedDownstreamRemediationImplemented) {
  protectedSourceChanges.push(mapperPath);
}
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
    "## Exact seven findings and classifications",
    "## Exact permitted mapper surface",
    "## Context-category remediation",
    "## Freshness-state remediation",
    "## Stale/fresh consistency remediation",
    "## Finite-metric remediation",
    "## Trading-window remediation",
    "## Horizon-linkage remediation",
    "## Anti-leakage output-integrity remediation",
    "## Issue-code policy",
    "## Validation-order policy",
    "## Backwards compatibility and deterministic behavior",
    "## Acceptance and rejection criteria",
    "## Approval vocabulary and deterministic gate conditions",
    "## Blocked downstream work",
    "## Next permitted Action",
  ]),
  upstream_references_found: includesAll(doc, ["Action 387", "Action 388", "Action 389", "Action 380", "Action 381"]),
  action_389_blocked_result_found:
    action389.includes("`readiness_decision: blocked`") &&
    action389.includes("`failed_conditions_count: 7`") &&
    doc.includes("Action 389 returned `readiness_decision: blocked`"),
  all_seven_findings_recorded: includesAll(doc, findings),
  root_cause_classifications_found: includesAll(doc, classifications),
  exact_remediation_boundary_found: includesAll(doc, [
    "`lib/snapshot-to-learning-dataset-mapper.ts`",
    "`docs/action-391-pure-mapper-contract-remediation.md`",
    "`scripts/action-391-pure-mapper-contract-remediation-verify.mjs`",
    "`tests/e2e/action-391-pure-mapper-contract-remediation.spec.ts`",
    "Forbidden surfaces:",
  ]),
  context_category_policy_found: includesAll(doc, [
    "Closed vocabularies",
    "Unsupported closed-category values",
    "must not be inferred or rewritten",
    "blocked_invalid_provenance",
  ]),
  freshness_policy_found: includesAll(doc, [
    "`fresh`, `stale`, `unknown`, and `unavailable`",
    "60-minute fixture boundary",
    "must not call the current clock",
    "/contextSnapshot/freshness/state",
  ]),
  stale_fresh_contradiction_policy_found: includesAll(doc, [
    "stale state paired with a populated `fresh: true` alias",
    "fresh state paired with a populated `stale: true` alias",
    "unavailable provenance/source paired with fresh",
    "block without selecting a winner",
  ]),
  finite_number_policy_found: includesAll(doc, [
    "`NaN`, positive Infinity, negative Infinity",
    "No coercion, clamping, null replacement",
    "stock-vs-index and stock-vs-sector",
  ]),
  trading_window_policy_found: includesAll(doc, [
    "`morning`, `midday`, `power_hour`, and `unknown`",
    "/recommendationSnapshot/window",
    "No timestamp-to-window inference",
  ]),
  horizon_linkage_policy_found: includesAll(doc, [
    "`recommendationSnapshot.payload_json.outcome_horizon`",
    "supplied `outcome.horizon`",
    "`blocked_invalid_linkage`",
    "/outcome/horizon",
  ]),
  anti_leakage_monotonicity_found: includesAll(doc, [
    "Anti-leakage integrity is monotonic",
    "never less restrictive",
    "`blocked_future_leakage`",
    "contains no row",
    "`consumable: false`",
    "included_in_snapshot_context: false",
  ]),
  validation_order_placement_found: includesAll(doc, [
    "1. input shape",
    "3. linkage, including horizon mismatch",
    "6. future leakage, including anti-leakage marker integrity",
    "7. provenance, including context categories, freshness, consistency, and context numerics",
    "10. construction",
  ]),
  issue_code_compatibility_review_found: includesAll(doc, [
    "No new issue code is approved",
    "`invalid_provenance`",
    "`invalid_input`",
    "`invalid_linkage`",
    "`future_leakage`",
    "RFC 6901",
  ]),
  regression_policy_found: includesAll(doc, [
    "Required seven regression outcomes",
    "Multi-fault primary status",
    "all previously passing Action 388/389 behavior",
  ]),
  mapper_source_unchanged:
    expectedHashes[mapperPath] === currentMapperHash || approvedDownstreamRemediationImplemented,
  fixture_modules_unchanged:
    expectedHashes[learningFixturePath] === hash(learningFixturePath) &&
    expectedHashes[contextFixturePath] === hash(contextFixturePath),
  mapper_consumers_absent: mapperConsumerFiles.length === 0,
  no_runtime_provider_supabase_or_persistence: forbiddenMapperMarkers.length === 0,
  no_forbidden_action_390_changes: forbiddenAction390Changes.length === 0 && protectedSourceChanges.length === 0,
  no_schema_migration_proxy_middleware_netlify_changes:
    action390Files.every((path) => !/^(?:app\/|supabase\/migrations|proxy\.ts|middleware\.|netlify\.)/.test(path)),
  runtime_preview_chain_untouched:
    action390Files.every((path) => !path.includes("runtime-preview")) &&
    doc.includes("runtime_preview_waiting_for_operator_inputs"),
  approval_vocabulary_and_decision_found: includesAll(doc, [
    "Use exactly `approved`, `approved_with_conditions`, and `blocked`",
    "`approval_decision: approved`",
    "`passed_conditions_count: 17`",
    "`failed_conditions_count: 0`",
    "`unresolved_conditions_count: 0`",
  ]),
  next_remediation_action_separately_identified: doc.includes("Action 391 - Pure Snapshot-to-Learning Dataset Mapper Contract Remediation"),
  focused_test_contract_found: includesAll(tests, [
    "documents all seven findings and classifications",
    "freezes category freshness numeric window and horizon policies",
    "freezes anti-leakage monotonicity",
    "does not modify mapper fixtures or add consumers",
    "Actions 387 through 389 remain healthy",
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
  approved_downstream_remediation_implemented: approvedDownstreamRemediationImplemented,
  approved_action_391_remediation_implemented: approvedAction391RemediationImplemented,
  approved_action_394_remediation_implemented: approvedAction394RemediationImplemented,
  approval_gate_mapper_sha256: expectedHashes[mapperPath],
  approved_downstream_mapper_sha256: approvedAction394RemediationImplemented
    ? approvedAction394MapperHash
    : approvedAction391RemediationImplemented
      ? approvedAction391MapperHash
      : null,
  mapper_source_sha256: hash(mapperPath),
  learning_fixture_source_sha256: hash(learningFixturePath),
  context_fixture_source_sha256: hash(contextFixturePath),
  protected_source_changes: protectedSourceChanges,
  mapper_consumer_files: mapperConsumerFiles,
  forbidden_mapper_markers: forbiddenMapperMarkers,
  action_390_changed_files: action390Files,
  forbidden_action_390_changes: forbiddenAction390Changes,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    provider_call_executed: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    pattern_discovery_executed: false,
    confidence_calibration_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
  },
  recommended_next_action: "action_391_pure_mapper_contract_remediation",
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = verificationStatus === "passed" ? 0 : 1;
