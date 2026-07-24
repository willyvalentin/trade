import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate.md";
const verifierPath = "scripts/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate-verify.mjs";
const protectedHashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "scripts/action-400-expanded-static-mapper-shadow-run.mjs": "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  "docs/action-400-expanded-static-mapper-shadow-input-manifest.json": "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const eligibleCaseIds = [
  "valid_complete_mapping", "valid_rich_context", "valid_equivalent_aliases", "valid_normalized_confidence",
  "expanded_valid_bearish_risk_context", "expanded_valid_fda_event_context", "expanded_valid_sec_event_context",
  "expanded_valid_future_event_excluded", "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding",
];
const resultVocabulary = [
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

test.describe.serial("Action 402 pure Pattern Discovery contract gate", () => {
  test("documentation contract and approval-only boundary are complete", () => {
    const doc = read();
    for (const section of [
      "Purpose", "Scope", "Authoritative Dependencies", "Upstream Action Inventory", "Action 401 Readiness Result",
      "Two Downstream Conditions", "Explicit Non-Goals", "Protected Upstream Hashes", "Pattern Discovery Definition",
      "Pure-Function Boundary", "Input Contract", "Eligible-Row Policy", "Excluded-Row Policy", "Row-Lineage Requirements",
      "Input Batch Contract", "Grouping Dimensions", "Grouping-Key Contract", "Taxonomy Contract", "Evidence-Unit Contract",
      "Outcome-Evidence Contract", "Support-Count Contract", "Minimum-Support Policy", "Contradiction Policy",
      "Insufficient-Evidence Policy", "Pattern-Strength Policy", "Directional-Effect Policy", "Risk/Reward Evidence Policy",
      "Horizon Policy", "Confidence-Treatment Policy", "Context-Treatment Policy", "Provenance Policy", "Anti-Leakage Policy",
      "Missing-Data Policy", "Stale-Data Policy", "Partial-Data Policy", "Conflicting-Data Policy", "Unknown/Unavailable Policy",
      "Deterministic-Aggregation Policy", "Deterministic-Ordering Policy", "Deterministic-Deduplication Policy",
      "Insight-Identity Policy", "Issue/Warning Contract", "Success/Result Vocabulary", "Output Contract",
      "Pattern Insight Compatibility", "Prohibited Inference", "Prohibited Repair", "Prohibited Calibration",
      "Prohibited Recommendation Mutation", "Mapped-Only Shadow Boundary", "Exact Eligible Action 400 Case Inventory",
      "Expected Downstream Group Inventory", "Downstream Manifest Requirements", "Downstream Runner Boundary",
      "Output Evidence Boundary", "Metadata-Only Policy", "Full-Insight Retention Policy", "Repeat-Run Determinism",
      "Temporary Filesystem Policy", "Cleanup Policy", "No-Persistence Requirement", "No-Replay Requirement",
      "No-Runtime Requirement", "No-External-Access Requirement", "No-Feedback Requirement", "Stop Conditions",
      "Approval Vocabulary", "Deterministic Gate Conditions", "Approval Decision", "Next Permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("does not implement Pattern Discovery");
  });

  test("Action 401 conditions and protected hashes remain exact", () => {
    const doc = read();
    expect(doc).toContain("`readiness_decision: ready_with_conditions`");
    expect(doc).toContain("24 passed, 0 failed, 0 unresolved, and 2 downstream conditions");
    for (const [path, expected] of Object.entries(protectedHashes)) {
      expect(sha(path), path).toBe(expected);
      expect(doc).toContain(expected);
    }
  });

  test("pure function input configuration and hidden-default boundary are frozen", () => {
    const doc = read();
    expect(doc).toContain("discoverPatterns(input)");
    expect(doc).toContain("rows: readonly PatternDiscoveryRowEnvelope[]");
    expect(doc).toContain("configuration: FrozenPatternDiscoveryConfiguration");
    expect(doc).toContain("Omitted configuration is `blocked_invalid_configuration`");
    expect(doc).toContain("no clock, randomness, environment, filesystem, network");
  });

  test("exact 10 mapped cases and all exclusions are frozen", () => {
    const manifest = JSON.parse(read("docs/action-400-expanded-static-mapper-shadow-input-manifest.json")) as { ordered_cases: Array<Record<string, unknown>> };
    const mapped = manifest.ordered_cases.filter((item) => item.expected_status === "mapped" && item.expected_row_present === true && item.expected_consumable === true).map((item) => item.case_id);
    expect(mapped).toEqual(eligibleCaseIds);
    for (const id of eligibleCaseIds) expect(read()).toContain(`\`${id}\``);
    expect(read()).toContain("Exclude `mapped_with_missing_optional_data`, every `blocked_*` result");
    expect(read()).toContain("Pending/incomplete outcomes are excluded");
  });

  test("row reconstruction lineage and batch contracts fail closed", () => {
    const doc = read();
    for (const marker of ["Stored Action 400 output may not be reused", "canonical mapper input hash", "mapper row ID", "canonical row hash", "`static_only: true`", "`non_authoritative: true`", "`no_persistence: true`", "`no_replay: true`", "`no_runtime: true`", "`no_feedback: true`", "exactly 10 immutable envelopes"]) expect(doc).toContain(marker);
  });

  test("single setup-family group and insufficient-evidence inventory are exact", () => {
    const doc = read();
    expect(doc).toContain("exactly one dimension: `setup_family`");
    expect(doc).toContain("pattern_group:v1|setup_family=momentum_continuation");
    expect(doc).toContain("group count: 1");
    expect(doc).toContain("source case count/support: 10");
    expect(doc).toContain("unique mapper row IDs: 3");
    expect(doc).toContain("completed outcomes: 10");
    expect(doc).toContain("positive/negative/neutral: 10 / 0 / 0");
    expect(doc).toContain("group status: `insufficient_evidence`");
    expect(doc).toContain("full Pattern Insights produced: 0");
  });

  test("minimum support evidence units and duplicate identities are explicit", () => {
    const doc = read();
    expect(doc).toContain("evidence unit is one unique Action 400 case lineage");
    expect(doc).toContain("`minimum_total_support: 20`");
    expect(doc).toContain("`minimum_completed_outcomes: 20`");
    expect(doc).toContain("1-19 row group returns `insufficient_evidence`");
    expect(doc).toContain("duplicate_mapper_row_identity");
    expect(doc).toContain("not a claim of 10 unique market recommendations");
  });

  test("aggregation contradiction missing data and anti-leakage are deterministic", () => {
    const doc = read();
    for (const marker of ["scaled integers before summation", "round half-away-from-zero to 4 decimals", "Contradictory evidence is preserved", "both positive and negative: `mixed`", "No imputation", "Stale context is ineligible", "Partial context/provenance", "Conflicting context/provenance is ineligible", "Only snapshot-time fields may affect grouping", "Post-recommendation outcomes may affect aggregation only", "`blocked_future_leakage`"]) expect(doc).toContain(marker);
  });

  test("pure result vocabulary and Pattern Insight compatibility are frozen", () => {
    const doc = read();
    for (const status of resultVocabulary) expect(doc).toContain(`- \`${status}\``);
    expect(doc).toContain("Group evaluation vocabulary is exactly `insight_ready`, `insufficient_evidence`, and `excluded`");
    expect(doc).toContain("may project to Action 343/357 fields");
    expect(doc).toContain("`mutation_allowed: false`");
    expect(doc).toContain("`review_status: unreviewed`");
  });

  test("insight identity ordering deduplication and issue contracts are stable", () => {
    const doc = read();
    expect(doc).toContain("pure_pattern_discovery_contract_v1");
    expect(doc).toContain("pattern_insight:v1:<hex-sha256>");
    expect(doc).toContain("Groups sort lexically by canonical group key");
    expect(doc).toContain("Duplicate Action 400 case lineage is `blocked_invalid_lineage`");
    expect(doc).toContain("Every issue is `{code,path,severity}`");
    expect(doc).toContain("Current/execution time, randomness, machine path");
  });

  test("implementation shadow evidence determinism and stop boundaries are separated", () => {
    const doc = read();
    for (const stage of ["pure implementation plus static unit tests", "independent implementation audit and row-hash freeze", "mapped-only shadow approval gate and frozen manifest", "shadow execution"]) expect(doc).toContain(stage);
    expect(doc).toContain("Full synthetic Pattern Insights may not be retained");
    expect(doc).toContain("run the exact batch twice");
    expect(doc).toContain("No third repair run");
    expect(doc).toContain("stops if any protected or manifest hash differs");
    expect(doc).toContain("No same-Action repair follows a shadow failure");
  });

  test("only the approved implementation exists with no runner or downstream manifest", () => {
    const implementations = files("lib").filter((path) => path !== "lib/pattern-insight-static-fixtures.ts" && /(?:pattern.*discovery|pattern-discovery|cohort-builder|segmenter|statistics-helper|metric-calculator|insight-builder|insight-generator)/i.test(path));
    expect(implementations).toEqual(["lib/pure-pattern-discovery.ts"]);
    const downstream = [...files("scripts"), ...files("docs")].filter((path) => /action-40[23].*(?:downstream.*(?:run|manifest)|pattern-discovery.*(?:run|manifest))/i.test(path));
    expect(downstream).toEqual([]);
    expect(files("app").some((path) => /action-402|discoverPatterns|pattern-discovery/.test(read(path)))).toBe(false);
  });

  test("no persistence replay runtime provider Supabase feedback or mutation is authorized", () => {
    const doc = read();
    for (const marker of ["No database/Supabase write", "No replay input", "No API/page route", "No network, fetch, socket", "No output may reach Pattern Discovery production services", "No ranking, scanner, recommendation"]) expect(doc).toContain(marker);
  });

  test("verifier returns approved_with_conditions", () => {
    const report = JSON.parse(execFileSync("node", [verifierPath], { encoding: "utf8" })) as Record<string, unknown>;
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved_with_conditions");
    expect(report.passed_conditions_count).toBe(26);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.future_conditions_count).toBe(2);
    expect(report.eligible_mapper_statuses).toEqual(["mapped"]);
    expect(report.expected_group_count).toBe(1);
    expect(report.expected_group_status).toBe("insufficient_evidence");
    expect(report.pattern_discovery_implementation_files).toEqual(["lib/pure-pattern-discovery.ts"]);
    expect(report.downstream_runner_or_manifest_files).toEqual([]);
  });

  test("Action 400 remains healthy and runtime preview stays paused", () => {
    expect(JSON.parse(execFileSync("node", ["scripts/action-400-expanded-static-mapper-shadow-use-verify.mjs"], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(read()).toContain("runtime_preview_waiting_for_operator_inputs");
    expect(files("app").some((path) => path.includes("action-402"))).toBe(false);
  });
});
