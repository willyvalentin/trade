import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-403-pure-pattern-discovery-implementation-approval-gate.md";
const verifierPath = "scripts/action-403-pure-pattern-discovery-implementation-approval-gate-verify.mjs";
const hashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "scripts/action-400-expanded-static-mapper-shadow-run.mjs": "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  "docs/action-400-expanded-static-mapper-shadow-input-manifest.json": "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const exportedTypes = [
  "PatternDiscoveryRowEnvelope", "FrozenPatternDiscoveryConfiguration", "PatternDiscoveryResult",
  "PatternDiscoveryIssue", "PatternDiscoveryWarning", "PatternDiscoveryGroupResult",
  "PatternDiscoveryEvidenceSummary",
];
const statuses = [
  "discovered", "discovered_with_warnings", "insufficient_evidence", "blocked_invalid_input",
  "blocked_invalid_configuration", "blocked_invalid_lineage", "blocked_future_leakage",
  "blocked_non_consumable_row", "blocked_nondeterministic_grouping",
];
const read = (path = docPath) => readFileSync(path, "utf8");
const sha = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
function files(path: string): string[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => files(join(path, name))).sort();
}

test.describe.serial("Action 403 pure Pattern Discovery implementation approval gate", () => {
  test("documentation contract and implementation-free boundary are complete", () => {
    const doc = read();
    for (const section of [
      "Purpose", "Scope", "Authoritative Dependencies", "Action 402 Decision", "Action 402 Future Conditions",
      "Explicit Non-Goals", "Protected Upstream Hashes", "Exact Approved Implementation Module",
      "Exact Exported Type Inventory", "Exact Function Signature", "Input-Envelope Contract", "Configuration Contract",
      "Result Union", "Issue And Warning Contract", "Validation-Order Contract", "Grouping Algorithm",
      "Grouping-Key Serialization", "Stable Sorting", "Row Eligibility Validation", "Lineage Validation",
      "Leakage Validation", "Duplicate-Row Identity Handling", "Case-Level Versus Unique-Row Support",
      "Completed-Outcome Calculation", "Positive/Negative/Neutral Classification", "Minimum-Support Evaluation",
      "Insufficient-Evidence Construction", "Discovered-Result Construction", "Contradiction Handling",
      "Mixed-State Semantics", "Deterministic Integer Aggregation", "Fixed Rounding", "Zero-Denominator Behavior",
      "Finite-Number Behavior", "Null And Missing Behavior", "Identity Construction", "Evidence-Set Hashing",
      "Group Hashing", "Insight Identity", "Canonical Serialization", "Output Ordering", "Issue Ordering",
      "Warning Deduplication", "Input Immutability", "Output Determinism", "Prohibited Inference",
      "Prohibited Repair", "Prohibited Calibration", "No-Persistence Guarantee", "No-Runtime Guarantee",
      "No-Feedback Guarantee", "Implementation File Boundary", "Test Boundary", "Verifier Boundary",
      "Acceptance Criteria", "Rejection Criteria", "Independent-Audit Requirement", "Approval Vocabulary",
      "Deterministic Gate Conditions", "Approval Decision", "Next Permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("does not implement or invoke `discoverPatterns`");
  });

  test("Action 402 decision conditions and protected hashes remain exact", () => {
    const doc = read();
    expect(doc).toContain("`approval_decision: approved_with_conditions`");
    expect(doc).toContain("26 passed, 0 failed, 0 unresolved, and 2 future conditions");
    for (const [path, expected] of Object.entries(hashes)) {
      expect(sha(path), path).toBe(expected);
      expect(doc).toContain(expected);
    }
  });

  test("exact module exports and synchronous signature are frozen", () => {
    const doc = read();
    expect(doc).toContain("only approved implementation module is `lib/pure-pattern-discovery.ts`");
    for (const type of exportedTypes) expect(doc).toContain(`\`${type}\``);
    expect(doc).toContain("exactly one runtime symbol: `discoverPatterns`");
    expect(doc).toContain("export function discoverPatterns(input: Readonly<");
    expect(doc).toContain(">): PatternDiscoveryResult;");
    expect(doc).toContain("function is synchronous");
  });

  test("input envelope and configuration contracts are exact", () => {
    const doc = read();
    for (const marker of ["`source_case_id: string`", "`canonical_mapper_input_sha256: string`", "`mapper_status: \"mapped\"`", "`canonical_row_sha256: string`", "`consumable: true`", "`row: Action335LearningDatasetRow`", "Unknown fields are invalid"]) expect(doc).toContain(marker);
    for (const marker of ["`contract_version: \"pure_pattern_discovery_contract_v1\"`", "`configuration_version: \"pattern_discovery_setup_family_v1\"`", "`grouping_dimension: \"setup_family\"`", "`minimum_total_support: 20`", "`minimum_completed_outcomes: 20`", "`numeric_scale: 1000000`", "`rounding_mode: \"half_away_from_zero\"`"]) expect(doc).toContain(marker);
  });

  test("validation order result vocabulary and issues are exact", () => {
    const doc = read();
    for (const marker of ["1. input shape", "2. configuration shape/literals", "3. batch declarations/count/order", "4. row-envelope shape", "5. mapper status", "6. lineage identity", "7. anti-leakage", "8. required grouping field", "9. outcome availability", "10. finite numeric", "11. deterministic grouping", "12. aggregation", "13. support evaluation", "14. result construction"]) expect(doc).toContain(marker);
    for (const status of statuses) expect(doc).toContain(`- \`${status}\``);
    expect(doc).toContain("exactly `{code,path,severity,messageKey}`");
    expect(doc).toContain("`duplicate_mapper_row_identity`");
    expect(doc).toContain("first failing phase");
  });

  test("grouping key sorting eligibility lineage and leakage are frozen", () => {
    const doc = read();
    for (const marker of ["exact raw `/row/setup_and_confidence/setup_family` literal", "must equal `momentum_continuation`", "pattern_group:v1|setup_family=<encoded-value>", "Normalize the validated literal to NFC", "Evidence units sort by Action 400 order index", "One invalid row blocks the whole batch", "Recompute canonical row SHA-256", "Require row `anti_leakage_status === \"passed\"`"]) expect(doc).toContain(marker);
  });

  test("duplicate row and support semantics remain distinct", () => {
    const doc = read();
    expect(doc).toContain("Repeated mapper row IDs across distinct approved case lineages remain present");
    expect(doc).toContain("`case_support_count`: eligible unique source case lineages; expected 10");
    expect(doc).toContain("`unique_mapper_row_count`: distinct mapper row IDs; expected 3");
    expect(doc).toContain("`completed_outcome_count`: eligible complete outcomes; expected 10");
    expect(doc).toContain("Minimum total support uses `case_support_count`");
  });

  test("outcome classification contradiction and minimum support are exact", () => {
    const doc = read();
    expect(doc).toContain("`target_hit` -> positive");
    expect(doc).toContain("`stop_hit` -> negative");
    expect(doc).toContain("Expected initial counts are completed 10, positive 10, negative 0, neutral 0");
    expect(doc).toContain("Compare `case_support_count` with 20");
    expect(doc).toContain("cannot return `discovered`");
    expect(doc).toContain("produces Action 343 effect direction `mixed`");
  });

  test("expected initial result is insufficient evidence", () => {
    const doc = read();
    expect(doc).toContain("top-level status is `insufficient_evidence`");
    expect(doc).toContain("exactly one bounded group summary");
    expect(doc).toContain("`insights: []`");
    expect(doc).toContain("three expected warnings");
    expect(doc).toContain("`non_authoritative: true`");
  });

  test("aggregation rounding null and finite behavior are deterministic", () => {
    const doc = read();
    for (const marker of ["`numeric_scale: 1000000`", "Number.isSafeInteger(value * 1000000)", "Convert to `BigInt`", "round half-up to 4 decimal places", "round half-away-from-zero to 4 decimal places", "denominator zero is `null`", "No coercion from strings"]) expect(doc).toContain(marker);
  });

  test("identity hashing canonicalization ordering and immutability are exact", () => {
    const doc = read();
    for (const marker of ["Canonical row hash is SHA-256", "pattern_evidence_set:v1", "pattern_group_hash:v1", "pattern_insight:v1:<lowercase-hex-sha256>", "recursively sorts object keys lexically", "must not mutate input", "interleaved calls must serialize identically"]) expect(doc).toContain(marker);
  });

  test("implementation boundary required Action 404 tests and Action 405 audit are frozen", () => {
    const doc = read();
    for (const path of ["lib/pure-pattern-discovery.ts", "docs/action-404-pure-pattern-discovery-implementation.md", "scripts/action-404-pure-pattern-discovery-implementation-verify.mjs", "tests/e2e/action-404-pure-pattern-discovery-implementation.spec.ts"]) expect(doc).toContain(`\`${path}\``);
    for (const marker of ["invalid configuration/status/row/consumability/lineage/leakage/group/outcome/numeric values", "insufficient and sufficient support", "repeated/interleaved calls", "absence of filesystem/network/environment/persistence/feedback"]) expect(doc).toContain(marker);
    expect(doc).toContain("Action 405 must independently verify");
    expect(doc).toContain("No shadow approval may occur before Action 405");
  });

  test("only the approved implementation exists with no runner or manifest", () => {
    expect(existsSync("lib/pure-pattern-discovery.ts")).toBe(true);
    const suspicious = files("lib").filter((path) => path !== "lib/pattern-insight-static-fixtures.ts" && /(?:pure-pattern-discovery|pattern.*discovery|cohort-builder|segmenter|statistics-helper|metric-calculator|insight-builder|insight-generator)/i.test(path));
    expect(suspicious).toEqual(["lib/pure-pattern-discovery.ts"]);
    const downstream = [...files("scripts"), ...files("docs")].filter((path) => /action-40[34].*(?:downstream.*(?:run|manifest)|pattern-discovery.*(?:run|manifest))/i.test(path));
    expect(downstream).toEqual([]);
  });

  test("no persistence replay runtime provider Supabase calibration or feedback is authorized", () => {
    const doc = read();
    for (const marker of ["imports no database/Supabase", "imports no Next/runtime route", "Output cannot call or mutate calibration", "No runner, manifest, service", "No Pattern Discovery implementation, invocation"] ) expect(doc).toContain(marker);
  });

  test("verifier returns approved_with_conditions", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, unknown>;
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved_with_conditions");
    expect(report.passed_conditions_count).toBe(28);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.future_conditions_count).toBe(1);
    expect(report.approved_module_path).toBe("lib/pure-pattern-discovery.ts");
    expect(report.approved_type_exports).toEqual(exportedTypes);
    expect(report.pattern_discovery_implementation_files).toEqual(["lib/pure-pattern-discovery.ts"]);
    expect(report.downstream_runner_or_manifest_files).toEqual([]);
  });

  test("Action 402 remains healthy and runtime preview stays paused", () => {
    expect(JSON.parse(execFileSync("node", ["scripts/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate-verify.mjs"], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(read()).toContain("runtime_preview_waiting_for_operator_inputs");
    expect(files("app").some((path) => path.includes("action-403"))).toBe(false);
  });
});
