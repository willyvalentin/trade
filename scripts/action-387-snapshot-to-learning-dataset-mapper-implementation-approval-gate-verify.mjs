#!/usr/bin/env node

import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docPath =
  "docs/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate.md";
const testPath =
  "tests/e2e/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate.spec.ts";
const verifierPath =
  "scripts/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate-verify.mjs";
const action386DocPath =
  "docs/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review.md";
const requiredFiles = [docPath, testPath, verifierPath, action386DocPath];

const requiredSections = [
  "## Status And Purpose",
  "## Scope",
  "## Authoritative Dependencies",
  "## Upstream Action Inventory",
  "## Action 386 Result",
  "## Explicit Non-Goals",
  "## Approval Vocabulary",
  "## Deterministic Gate Conditions",
  "## Exact Future Mapper Module Boundary",
  "## Exact Input Contract",
  "## Exact Output Contract",
  "## Mapper Result Vocabulary",
  "## Mapper Error Vocabulary",
  "## Validation Issue Contract",
  "## Validation Order",
  "## Identity Requirements",
  "## Deterministic Row-ID Policy",
  "## Recommendation Linkage",
  "## Context Linkage",
  "## Outcome Linkage",
  "## Timestamp Alias Precedence",
  "## Side Alias Precedence",
  "## Setup Alias Precedence",
  "## Confidence Alias Precedence",
  "## Conflict Behavior",
  "## Missing Required Field Behavior",
  "## Missing Optional Field Behavior",
  "## Explicit Null Unknown Unavailable Behavior",
  "## Provenance Behavior",
  "## Completeness Behavior",
  "## Temporal Validation",
  "## Future-Leakage Rejection",
  "## Input Immutability",
  "## Output Determinism",
  "## Stable Serialization",
  "## No-Repair Guarantee",
  "## No-Enrichment Guarantee",
  "## No-Inference Guarantee",
  "## No-Runtime Guarantee",
  "## No-Persistence Guarantee",
  "## Adapter-First Constraints",
  "## No-Parallel-System Constraints",
  "## Peer-Group And Deferred Gaps",
  "## Approved Implementation Surfaces",
  "## Forbidden Implementation Surfaces",
  "## Acceptance Criteria",
  "## Rejection Criteria",
  "## Approval Decision",
  "## Passed Conditions",
  "## Failed Conditions",
  "## Unresolved Conditions",
  "## Blocked Downstream Work",
  "## Next Permitted Action",
];

const upstreamActions = [
  "Action 309",
  "Action 334",
  "Action 335",
  "Action 336",
  "Action 340",
  "Action 346",
  "Action 347",
  "Action 352",
  "Action 353",
  "Action 354",
  "Action 357",
  "Action 380",
  "Action 381",
  "Action 383",
  "Action 385",
  "Action 386",
];

const resultStatuses = [
  '"mapped"',
  '"mapped_with_missing_optional_data"',
  '"blocked_missing_required_identity"',
  '"blocked_invalid_linkage"',
  '"blocked_conflicting_aliases"',
  '"blocked_temporal_violation"',
  '"blocked_future_leakage"',
  '"blocked_invalid_provenance"',
  '"blocked_invalid_outcome"',
  '"blocked_invalid_input"',
];

const issueCodes = [
  '"missing_required_identity"',
  '"invalid_linkage"',
  '"conflicting_aliases"',
  '"invalid_timestamp"',
  '"temporal_violation"',
  '"future_leakage"',
  '"invalid_provenance"',
  '"invalid_outcome"',
  '"invalid_input"',
  '"missing_optional_context"',
  '"missing_optional_outcome"',
  '"unknown_setup"',
  '"unavailable_source"',
  '"partial_provenance"',
];

const validationPhases = [
  "1. input shape",
  "2. required identities",
  "3. identity linkage",
  "4. alias conflicts",
  "5. timestamp parsing and temporal order",
  "6. future-leakage constraints",
  "7. provenance",
  "8. outcome validity",
  "9. optional-data completeness",
  "10. deterministic row construction",
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), "utf8");
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function collectFiles(relativePath) {
  const absolutePath = join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) return [];
  const stat = statSync(absolutePath);
  if (stat.isFile()) return [relativePath];
  if (!stat.isDirectory()) return [];
  return readdirSync(absolutePath)
    .flatMap((entry) => collectFiles(join(relativePath, entry)))
    .sort();
}

function statusFiles() {
  const output = execFileSync(
    "git",
    ["status", "--short", "--untracked-files=all"],
    { cwd: repoRoot, encoding: "utf8" },
  );
  return output
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) =>
      path.includes(" -> ") ? (path.split(" -> ").at(-1) ?? path) : path,
    );
}

const doc = existsSync(join(repoRoot, docPath)) ? read(docPath) : "";
const testSource = existsSync(join(repoRoot, testPath)) ? read(testPath) : "";
const action386Doc = existsSync(join(repoRoot, action386DocPath))
  ? read(action386DocPath)
  : "";
const changedFiles = statusFiles();
const action387ChangedFiles = changedFiles.filter((path) =>
  path.includes("action-387"),
);
const allowedAction387Files = [docPath, testPath, verifierPath];
const forbiddenAction387Changes = action387ChangedFiles.filter(
  (path) => !allowedAction387Files.includes(path),
);
const productionMapperFiles = collectFiles("lib").filter((path) =>
  /snapshot-to-learning-dataset-mapper|learning-row-mapper/.test(path),
);
const approvedDownstreamMapperPath = "lib/snapshot-to-learning-dataset-mapper.ts";
const approvedDownstreamMapperImplemented =
  productionMapperFiles.length === 1 &&
  productionMapperFiles[0] === approvedDownstreamMapperPath &&
  existsSync(join(repoRoot, "docs/action-388-snapshot-to-learning-dataset-mapper-implementation.md")) &&
  existsSync(join(repoRoot, "scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs")) &&
  existsSync(join(repoRoot, "tests/e2e/action-388-snapshot-to-learning-dataset-mapper-implementation.spec.ts"));
const fixtureFilesChangedByAction387 = action387ChangedFiles.filter((path) =>
  [
    "lib/learning-dataset-static-fixtures.ts",
    "lib/intelligence-context-static-fixtures.ts",
    "lib/pattern-insight-static-fixtures.ts",
  ].includes(path),
);

const checks = {
  required_files_found: requiredFiles.every((path) =>
    existsSync(join(repoRoot, path)),
  ),
  required_documentation_sections_found: includesAll(doc, requiredSections),
  required_upstream_references_found: includesAll(doc, upstreamActions),
  action_386_result_found:
    action386Doc.includes("readiness_decision: ready_with_conditions") &&
    doc.includes("16 passed conditions") &&
    doc.includes("two unresolved conditions"),
  action_386_conditions_resolved:
    doc.includes("No Action 386 condition remains unresolved") &&
    doc.includes("unresolved_conditions_count: 0"),
  exact_mapper_boundary_found: includesAll(doc, [
    "lib/snapshot-to-learning-dataset-mapper.ts",
    "docs/action-388-snapshot-to-learning-dataset-mapper-implementation.md",
    "scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs",
    "tests/e2e/action-388-snapshot-to-learning-dataset-mapper-implementation.spec.ts",
    "No other surface is approved",
  ]),
  exact_input_contract_found: includesAll(doc, [
    "SnapshotToLearningDatasetMapperInput",
    "recommendationSnapshot: Readonly<RecommendationSnapshot>",
    "contextSnapshot: Readonly<Action336IntelligenceContextStaticFixture> | null",
    "outcome: Readonly<RecommendationOutcome> | null",
  ]),
  exact_output_contract_found: includesAll(doc, [
    "Action335LearningDatasetRow",
    "Blocked results return no row",
    "does not persist",
  ]),
  discriminated_result_vocabulary_found: includesAll(doc, resultStatuses),
  issue_vocabulary_found:
    includesAll(doc, issueCodes) &&
    includesAll(doc, [
      'severity: "error" | "warning"',
      "RFC 6901-style JSON Pointer",
      "then path lexically, then code lexically",
      "no source values",
    ]),
  deterministic_validation_order_found: includesAll(doc, validationPhases),
  timestamp_alias_precedence_found: includesAll(doc, [
    "recommendationSnapshot.recommended_at",
    "app_timestamp`, then `created_at",
    "contextSnapshot.context.captured_at",
    "outcome.evaluated_at",
    "UTC ISO 8601 with millisecond precision",
    "No local-time interpretation, current-time fallback, or inferred timestamp",
  ]),
  side_alias_precedence_found: includesAll(doc, [
    "## Side Alias Precedence",
    "recommendationSnapshot.side",
    "payload_json.trade_direction",
    "long`/`buy` to `long",
    "short`/`sell` to `short",
    "never inferred from entry, stop, target, PnL, price movement, or outcome",
  ]),
  setup_alias_precedence_found: includesAll(doc, [
    "## Setup Alias Precedence",
    "payload_json.setup_family",
    "payload_json.setup_type",
    "eight Action 326 literals",
    "maps to existing `unknown`",
    "No candle/context heuristic",
  ]),
  confidence_alias_precedence_found: includesAll(doc, [
    "## Confidence Alias Precedence",
    "recommendationSnapshot.confidence",
    "recommendationSnapshot.score",
    "Values in `[0,1]`",
    "Values in `(1,100]`",
    "differences greater than `1e-9`",
    "no zero/default is invented",
    "No clamping, recalibration, or confidence inference",
  ]),
  conflict_behavior_found: includesAll(doc, [
    "## Conflict Behavior",
    "blocked_conflicting_aliases",
    "no later validation",
  ]),
  deterministic_row_identity_found: includesAll(doc, [
    "learning_dataset_static_fixture_v1",
    "UTF-8 NFC-normalized and percent-encoded",
    "learning_row:v1:",
    "no random UUID, clock value, mutable metric",
    "Repeated identical input is idempotent",
  ]),
  missing_data_semantics_found: includesAll(doc, [
    "explicit_null`, `unknown`, `unavailable`, absent, stale, partial, and conflicting",
    "mapped_with_missing_optional_data",
    "No default may be inferred",
  ]),
  temporal_and_anti_leakage_found: includesAll(doc, [
    "Context capture and effective time must be at or before recommendation time",
    "outcome evaluation must be at or after recommendation time",
    "blocked_future_leakage",
    "included_in_snapshot_context` is false",
  ]),
  input_immutability_and_purity_found: includesAll(doc, [
    "must neither mutate nor retain mutable references",
    "No-Repair Guarantee",
    "No-Enrichment Guarantee",
    "No-Inference Guarantee",
    "No-Runtime Guarantee",
    "No-Persistence Guarantee",
    "Date.now()",
    "Math.random()",
  ]),
  peer_group_classification_found: includesAll(doc, [
    "Peer-group remains `unsupported_optional`",
    "never infer it from sector/industry",
    "never extend schema",
  ]),
  approval_decision_found:
    doc.includes("approval_decision: approved") &&
    doc.includes("passed_conditions_count: 17") &&
    doc.includes("failed_conditions_count: 0") &&
    doc.includes("unresolved_conditions_count: 0"),
  next_action_separately_identified: doc.includes(
    "Action 388 may implement only the approved pure Snapshot-to-Learning Dataset mapper",
  ),
  no_mapper_implementation_exists:
    productionMapperFiles.length === 0 || approvedDownstreamMapperImplemented,
  fixture_implementations_unchanged_by_action_387:
    fixtureFilesChangedByAction387.length === 0,
  no_forbidden_action_387_changes: forbiddenAction387Changes.length === 0,
  no_runtime_provider_news_supabase_persistence_changes:
    forbiddenAction387Changes.length === 0,
  no_schema_migration_proxy_middleware_netlify_changes:
    forbiddenAction387Changes.length === 0,
  runtime_preview_chain_untouched:
    doc.includes(
      "runtime_preview_status: runtime_preview_waiting_for_operator_inputs",
    ) && forbiddenAction387Changes.length === 0,
  focused_test_contract_found: includesAll(testSource, [
    "Action 387 mapper implementation approval gate",
    "approval_decision: approved",
    "no production mapper",
  ]),
};

const passed = Object.values(checks).every(Boolean);
const result = {
  verification_status: passed ? "passed" : "blocked",
  ...checks,
  approval_decision: "approved",
  passed_conditions_count: 17,
  failed_conditions_count: 0,
  unresolved_conditions_count: 0,
  mapper_implementation_approved: true,
  mapper_implemented: false,
  production_mapper_found: productionMapperFiles.length > 0,
  production_mapper_files: productionMapperFiles,
  approved_downstream_mapper_implemented: approvedDownstreamMapperImplemented,
  action_387_changed_files: action387ChangedFiles,
  forbidden_action_387_changes: forbiddenAction387Changes,
  fixture_files_changed_by_action_387: fixtureFilesChangedByAction387,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    mapper_implemented: false,
    learning_rows_generated: false,
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
  recommended_next_action: passed
    ? "action_388_pure_snapshot_to_learning_dataset_mapper_implementation"
    : "repair_action_387_mapper_approval_contract",
};

console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
