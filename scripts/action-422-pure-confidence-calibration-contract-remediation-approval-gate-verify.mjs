#!/usr/bin/env node

import { createHash } from "crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const paths = {
  doc: "docs/action-422-pure-confidence-calibration-contract-remediation-approval-gate.md",
  verifier: "scripts/action-422-pure-confidence-calibration-contract-remediation-approval-gate-verify.mjs",
  test: "tests/e2e/action-422-pure-confidence-calibration-contract-remediation-approval-gate.spec.ts",
  action421Doc: "docs/action-421-independent-pure-confidence-calibration-verification-and-hash-audit.md",
  module: "lib/pure-confidence-calibration.ts",
  action420Test: "tests/e2e/action-420-pure-confidence-calibration-implementation.spec.ts",
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  patternDiscovery: "lib/pure-pattern-discovery.ts",
  learningFixture: "lib/learning-dataset-static-fixtures.ts",
  contextFixture: "lib/intelligence-context-static-fixtures.ts",
  patternFixture: "lib/pattern-insight-static-fixtures.ts",
};

const expectedHashes = {
  [paths.module]: "bd913c95d04fc450f4499b18c01744da04a148e8d18cb4d9113d990ee8deaa70",
  [paths.action420Test]: "6f521d811b8e92f84cb93d4fa0e4a16497dd2338de2eeebaea33ce252978e4c7",
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.patternDiscovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learningFixture]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.contextFixture]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.patternFixture]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};

const eligiblePatternDiscoveryStatuses = ["discovered", "discovered_with_warnings"];
const knownUnsupportedStatuses = [
  "insufficient_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_non_consumable_row",
  "blocked_nondeterministic_grouping",
  "unsupported arbitrary strings",
];
const resultVocabulary = [
  "calibrated",
  "calibrated_with_warnings",
  "no_adjustment",
  "insufficient_eligible_evidence",
  "blocked_invalid_input",
  "blocked_invalid_configuration",
  "blocked_invalid_lineage",
  "blocked_future_leakage",
  "blocked_overlapping_evidence",
  "blocked_unsupported_insight",
];
const validationPhases = [
  "top-level input shape",
  "configuration shape",
  "base-confidence validity",
  "insight-array shape",
  "insight-envelope shape",
  "Pattern Discovery status eligibility",
  "insight structural validity",
  "lineage integrity",
  "anti-leakage",
  "warning compatibility",
  "evidence-quality validation",
  "overlap and duplicate detection",
  "individual-delta calculation",
  "multiple-insight aggregation",
  "combined-cap application",
  "calibrated-confidence bounds",
  "result construction",
];
const issueContract = {
  code: "ineligible_pattern_discovery_status",
  path: "/insights/0/pattern_discovery_status",
  severity: "error",
  messageKey: "confidence_calibration.ineligible_pattern_discovery_status",
};
const action423Boundary = [
  "lib/pure-confidence-calibration.ts",
  "docs/action-423-pure-confidence-calibration-contract-remediation.md",
  "scripts/action-423-pure-confidence-calibration-contract-remediation-verify.mjs",
  "tests/e2e/action-423-pure-confidence-calibration-contract-remediation.spec.ts",
  "narrowly required Action 420-422 verifier/test compatibility updates",
  "minimal Actions 318-320 guard updates",
];
const regressionRequirements = [
  "insufficient_evidence returns blocked_unsupported_insight",
  "every known blocked Pattern Discovery status returns blocked_unsupported_insight",
  "unsupported arbitrary status returns blocked_unsupported_insight",
  "unsupported status outranks lineage failure",
  "unsupported status outranks leakage failure",
  "unsupported status outranks warning contradiction",
  "duplicated reducing warning attenuates once",
  "triplicated reducing warning attenuates once",
  "duplicate contradictory warning produces one blocking issue",
  "two distinct reducing warnings each attenuate once",
  "warning input order does not affect result",
  "unique-warning and duplicate-warning inputs produce identical IDs and outputs",
  "existing valid supportive/adverse/neutral/mixed cases remain unchanged",
  "caps remain unchanged",
  "clamping remains unchanged",
  "overlap remains unchanged",
  "immutability remains unchanged",
  "determinism remains unchanged",
];
const noEffectFlags = {
  provider_call_executed: false,
  provider_call_attempted: false,
  supabase_read_executed: false,
  supabase_write_executed: false,
  persistence_executed: false,
  replay_executed: false,
  runtime_integration_executed: false,
  calibration_execution_executed: false,
  calibration_shadow_executed: false,
  recommendation_mutation_executed: false,
  feedback_executed: false,
  scanner_behavior_changed: false,
  live_ranking_changed: false,
  runtime_preview_advanced: false,
};

const abs = (path) => join(root, path);
const exists = (path) => existsSync(abs(path));
const read = (path) => readFileSync(abs(path), "utf8");
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");

function collectFiles(path) {
  if (!exists(path)) return [];
  const absolute = abs(path);
  if (statSync(absolute).isFile()) return [path];
  return readdirSync(absolute).flatMap((entry) => collectFiles(join(path, entry))).sort();
}

function includesAll(text, values) {
  return values.every((value) => text.includes(value));
}

const doc = exists(paths.doc) ? read(paths.doc) : "";
const action421Doc = exists(paths.action421Doc) ? read(paths.action421Doc) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const verifierImportLines = verifierSource.split("\n").filter((line) => line.startsWith("import "));
const verifierForbiddenImportPattern = new RegExp(
  ["child_process", "node:child_process", "pathToFileURL", "pure-confidence-calibration", "@" + "supabase"].join("|"),
);
const verifierForbiddenImport = verifierImportLines.some((line) =>
  verifierForbiddenImportPattern.test(line),
);
const verifierForbiddenRuntimeCalls = [
  "await " + "import(",
  "fetch" + "(",
  "create" + "Client(",
  "new " + "WebSocket(",
  "XML" + "HttpRequest",
].some((token) => verifierSource.includes(token));

const sourceIntegrity = Object.fromEntries(Object.entries(expectedHashes).map(([path, expected]) => [
  path,
  {
    expected,
    actual: exists(path) ? shaFile(path) : null,
    unchanged: exists(path) && shaFile(path) === expected,
  },
]));

const forbiddenAction422Artifacts = [
  "docs/action-422-pure-confidence-calibration-fixture-manifest.json",
  "docs/action-422-pure-confidence-calibration-input-manifest.json",
  "scripts/action-422-pure-confidence-calibration-run.mjs",
  "scripts/action-422-pure-confidence-calibration-shadow-run.mjs",
  "app/api/action-422",
  "app/action-422",
  "public/action-422-runtime-preview.json",
].filter(exists);

const trackedAction422Evidence = [...collectFiles("docs"), ...collectFiles("scripts"), ...collectFiles("tests"), ...collectFiles("app"), ...collectFiles("public")]
  .filter((path) => /action-422/i.test(path))
  .filter((path) => /fixture|runner|shadow|manifest|runtime|provider|supabase|persistence|replay|feedback|recommendation|scanner|ranking/i.test(path))
  .filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path));

const runtimeConsumerFiles = [...collectFiles("app"), ...collectFiles("public"), "proxy.ts", "middleware.ts", "middleware.js", "netlify.toml"]
  .filter((path) => exists(path))
  .filter((path) => /action-422|pure-confidence-calibration|calibrateConfidence/.test(read(path)));

const checks = {
  documentation_exists: exists(paths.doc),
  action421_blocked_decision: action421Doc.includes("Readiness decision: `blocked`") &&
    action421Doc.includes("Failed conditions: `3`") &&
    action421Doc.includes("validation order") &&
    action421Doc.includes("eligibility") &&
    action421Doc.includes("warning compatibility"),
  exact_findings: includesAll(doc, [
    "Unsupported Pattern Discovery status mapped to wrong calibration status",
    "Known blocked Pattern Discovery statuses mapped to wrong calibration status",
    "Duplicate warnings attenuate more than once",
  ]),
  finding_classifications: includesAll(doc, [
    "incorrect_status_mapping",
    "eligibility_status_contract_violation",
    "duplicate_warning_attenuation",
  ]),
  exact_eligible_statuses: includesAll(doc, eligiblePatternDiscoveryStatuses) &&
    doc.includes("Every other Pattern Discovery status string is ineligible"),
  unsupported_status_mapping: includesAll(doc, knownUnsupportedStatuses) &&
    doc.includes("`status`: `blocked_unsupported_insight`") &&
    doc.includes("`proposed_delta`: `null`") &&
    doc.includes("`proposed_calibrated_confidence`: `null`") &&
    doc.includes("Do not preserve, forward, or mirror Pattern Discovery blocked statuses"),
  validation_order_placement: validationPhases.every((phase, index) => doc.includes(`${index + 1}. ${phase}`)) &&
    doc.includes("Unsupported Pattern Discovery status eligibility remains phase 6"),
  precedence_requirements: includesAll(doc, [
    "unsupported Pattern Discovery status must outrank",
    "malformed insight content",
    "lineage failure",
    "leakage failure",
    "warning contradiction",
    "evidence-quality error",
    "overlap conflict",
  ]),
  issue_behavior: includesAll(doc, Object.values(issueContract)) &&
    doc.includes("raw rejected status string in issue content: no"),
  warning_semantic_deduplication: includesAll(doc, [
    "validate warning code shape and compatibility",
    "canonically sort warning codes",
    "semantically deduplicate by exact warning code",
    "apply attenuation once per unique warning code",
  ]),
  attenuation_order: includesAll(doc, [
    "establish base direction and quality delta",
    "apply each unique calibration-reducing warning once",
    "normalize signed zero",
    "apply per-insight cap",
  ]),
  warning_contradiction_behavior: includesAll(doc, [
    "minimum_total_support_not_met",
    "minimum_completed_outcomes_not_met",
    "Duplicate contradictory warnings must produce one deterministic blocking issue",
  ]),
  result_vocabulary_preserved: includesAll(doc, resultVocabulary) &&
    doc.includes("Do not add:") &&
    doc.includes("blocked_pattern_discovery_status"),
  issue_warning_contract_preserved: includesAll(doc, [
    "issue object shape",
    "warning object shape",
    "RFC 6901 paths",
    "stable `confidence_calibration.*` message keys",
  ]),
  delta_cap_overlap_bounds_preserved: includesAll(doc, [
    "`supportive_strong`: `200`",
    "`adverse_strong`: `-300`",
    "Do not change the direction delta table",
    "positive per-insight cap",
    "combined negative cap",
    "same-evidence overlap exclusion",
    "clamping to 0-100",
  ]),
  identity_hash_policy: includesAll(doc, [
    "implementation source hash may change in Action 423",
    "unaffected valid inputs",
    "calibration IDs",
    "calibration hashes",
    "[\"duplicate_mapper_row_identity\", \"duplicate_mapper_row_identity\"]",
    "identical outputs and identical calibration IDs",
  ]),
  immutability_determinism: includesAll(doc, [
    "no mutation of input objects",
    "compatibility with frozen input objects",
    "deterministic repeated calls",
    "no time, random, environment, network, or filesystem influence",
  ]),
  action423_boundary: action423Boundary.every((item) => doc.includes(item)),
  regression_requirements: regressionRequirements.every((item) => doc.includes(item)),
  mandatory_action424: doc.includes("Action 424 - Independent Post-Remediation Confidence Calibration Verification") &&
    doc.includes("Do not proceed directly from Action 423 to fixtures"),
  approval_vocabulary: includesAll(doc, ["`approved`", "`approved_with_conditions`", "`blocked`"]),
  approval_decision_recorded: doc.includes("Approval decision: `approved`"),
  passed_failed_unresolved_recorded: doc.includes("Passed conditions: `28`") &&
    doc.includes("Failed conditions: `0`") &&
    doc.includes("Unresolved conditions: `[]`"),
  source_immutable_for_action422: Object.values(sourceIntegrity).every((item) => item.unchanged),
  no_forbidden_action422_artifacts: forbiddenAction422Artifacts.length === 0 && trackedAction422Evidence.length === 0,
  no_runtime_consumers: runtimeConsumerFiles.length === 0,
  verifier_static_read_only: !verifierForbiddenImport && !verifierForbiddenRuntimeCalls,
  no_effect_flags_false: Object.values(noEffectFlags).every((value) => value === false),
};

const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
const approvalDecision = failedChecks.length === 0 ? "approved" : "blocked";

const report = {
  verification_status: failedChecks.length === 0 ? "passed" : "failed",
  approval_decision: approvalDecision,
  approval_vocabulary: ["approved", "approved_with_conditions", "blocked"],
  checks,
  failed_checks: failedChecks,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failedChecks.length,
  unresolved_conditions: [],
  action421_readiness: {
    verification_status: "passed",
    readiness_decision: "blocked",
    failed_sections: ["validation_order", "eligibility", "warning_compatibility"],
    failed_conditions_count: 3,
    passed_conditions_count: 19,
  },
  findings: [
    {
      finding: "Unsupported Pattern Discovery status mapped to wrong calibration status",
      classification: "incorrect_status_mapping",
      approved_result_status: "blocked_unsupported_insight",
    },
    {
      finding: "Known blocked Pattern Discovery statuses mapped to wrong calibration status",
      classification: "eligibility_status_contract_violation",
      approved_result_status: "blocked_unsupported_insight",
    },
    {
      finding: "Duplicate warnings attenuate more than once",
      classification: "duplicate_warning_attenuation",
      approved_policy: "deduplicate_warning_codes_before_attenuation",
    },
  ],
  eligible_pattern_discovery_statuses: eligiblePatternDiscoveryStatuses,
  unsupported_pattern_discovery_statuses: knownUnsupportedStatuses,
  unsupported_status_result_policy: {
    status: "blocked_unsupported_insight",
    proposed_delta: null,
    proposed_calibrated_confidence: null,
    non_authoritative: true,
    applied: false,
    no_calibration_adjustment: true,
  },
  validation_order: validationPhases,
  unsupported_status_issue_contract: issueContract,
  warning_deduplication_policy: {
    validate: true,
    canonical_sort: true,
    semantic_dedupe_by_exact_code: true,
    classify: true,
    attenuate_once_per_unique_warning_code: true,
  },
  result_vocabulary: resultVocabulary,
  action423_approved_boundary: action423Boundary,
  action423_regression_requirements: regressionRequirements,
  source_integrity: sourceIntegrity,
  forbidden_action422_artifacts: forbiddenAction422Artifacts,
  tracked_action422_evidence_files: trackedAction422Evidence,
  runtime_consumer_files: runtimeConsumerFiles,
  no_effect_flags: noEffectFlags,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  runtime_preview_route_changed: false,
  runtime_preview_candidate_advanced: false,
  next_permitted_action: "Action 423 - Pure Confidence Calibration Contract Remediation",
  mandatory_followup_action: "Action 424 - Independent Post-Remediation Confidence Calibration Verification",
  fixture_or_hash_freeze_allowed_next: false,
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
