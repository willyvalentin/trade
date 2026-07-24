import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-399-expanded-static-mapper-shadow-batch-approval-gate.md";
const hashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  "scripts/action-397-static-mapper-shadow-run.mjs": "eaab84c16302a8e2f27ae4043e810af9b405dd5a6e818db9d4784eb4d8ca291b",
  "docs/action-397-static-mapper-shadow-input-manifest.json": "e9afd2d63a8f0d0041e14b60ae282cabe1afc742aeb707d65bf2ae2d67ccd741",
};
const newCases = [
  ["expanded_valid_bearish_risk_context", "mapped", "bearish/index-risk"],
  ["expanded_valid_fda_event_context", "mapped", "FDA/news-event"],
  ["expanded_valid_sec_event_context", "mapped", "SEC/news-event"],
  ["expanded_valid_future_event_excluded", "mapped", "excluded future facts"],
  ["expanded_valid_news_unavailable_context", "mapped_with_missing_optional_data", "unavailable freshness/provenance"],
  ["expanded_valid_missing_semantics_context", "mapped_with_missing_optional_data", "unknown/explicit missing semantics"],
  ["expanded_valid_identity_nfc_equivalent", "mapped", "NFC-equivalent identity"],
  ["expanded_valid_identity_percent_encoding", "mapped", "percent-sensitive identity"],
  ["expanded_blocked_context_category_uppercase", "blocked_invalid_provenance", "unsupported categorical case"],
  ["expanded_blocked_freshness_unicode_padding", "blocked_invalid_provenance", "Unicode-padding rejection"],
  ["expanded_blocked_numeric_context_string", "blocked_invalid_provenance", "numeric-string context rejection"],
  ["expanded_blocked_payload_horizon_numeric", "blocked_invalid_input", "non-string payload horizon"],
  ["expanded_blocked_outcome_horizon_uppercase", "blocked_invalid_outcome", "outcome literal/case rejection"],
  ["expanded_blocked_linkage_fingerprint", "blocked_invalid_linkage", "second linkage-field path"],
  ["expanded_blocked_stale_complete_contradiction", "blocked_invalid_provenance", "stale-versus-complete contradiction"],
  ["expanded_blocked_anti_leakage_unknown", "blocked_future_leakage", "non-passed anti-leakage state"],
  ["expanded_blocked_invalid_trading_window", "blocked_invalid_input", "unsupported trading window"],
  ["expanded_precedence_identity_over_provenance", "blocked_missing_required_identity", "identity outranks provenance"],
  ["expanded_precedence_linkage_over_freshness", "blocked_invalid_linkage", "linkage outranks freshness"],
  ["expanded_precedence_leakage_over_outcome", "blocked_future_leakage", "leakage outranks invalid outcome"],
] as const;
const distribution = {
  mapped: [4, 6, 10], mapped_with_missing_optional_data: [6, 2, 8],
  blocked_missing_required_identity: [1, 1, 2], blocked_invalid_linkage: [2, 2, 4],
  blocked_conflicting_aliases: [1, 0, 1], blocked_temporal_violation: [1, 0, 1],
  blocked_future_leakage: [1, 2, 3], blocked_invalid_provenance: [1, 4, 5],
  blocked_invalid_outcome: [1, 1, 2], blocked_invalid_input: [2, 2, 4],
};
const action400Package = [
  "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  "docs/action-400-expanded-static-mapper-shadow-use.md",
  "scripts/action-400-expanded-static-mapper-shadow-use-verify.mjs",
  "tests/e2e/action-400-expanded-static-mapper-shadow-use.spec.ts",
];

function read(path = docPath) { return readFileSync(path, "utf8"); }
function sha(path: string) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? files(child) : [child];
  });
}

test.describe.serial("Action 399 expanded static shadow approval gate", () => {
  test("documentation contract Action 398 readiness and approval decision are complete", () => {
    const doc = read();
    for (const section of [
      "Purpose And Scope", "Authoritative Dependencies", "Action 397 Execution Result", "Action 398 Readiness Result",
      "Protected Hashes", "Explicit Non-Goals", "Expansion Rationale And Current Coverage",
      "Expanded Count And Additive Policy", "Allowed And Forbidden Sources", "Exact New Case Inventory",
      "Coverage Policies", "Expanded Manifest Contract", "Separate Runner Boundary", "Expected Status Distribution",
      "Metadata-Only Output Boundary", "Determinism And Hash Requirements", "Temporary Path And Cleanup",
      "Hard No-Effect Requirements", "Stop Conditions", "Approval Vocabulary And Decision", "Next Permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("`readiness_decision: ready`");
    expect(doc).toContain("`passed_conditions_count: 16`");
    expect(doc).toContain("`approval_decision: approved`");
    expect(doc).toContain("`passed_conditions_count: 18`");
    expect(doc).toContain("`failed_conditions_count: 0`");
  });

  test("protected hashes and original Action 397 remain unchanged", () => {
    const doc = read();
    for (const [path, hash] of Object.entries(hashes)) {
      expect(sha(path), path).toBe(hash);
      expect(doc, path).toContain(hash);
    }
    expect(doc).toContain("original 20 retained cases");
    expect(doc).toContain("case IDs, order indexes 1-20");
    expect(doc).toContain("runner, and manifest remain unchanged");
  });

  test("exact total original and additional counts are frozen additively", () => {
    const doc = read();
    expect(doc).toContain("exact total is **40 cases**");
    expect(doc).toContain("original 20 retained cases followed by exactly 20 new cases");
    expect(doc).toContain("new cases occupy indexes 21-40");
    expect(doc).toContain("The expansion is additive");
    expect(doc).toContain("Replacement, mutation, reordering, configurable counts");
  });

  test("every new case is individually declared with gap mapping", () => {
    const doc = read();
    expect(newCases).toHaveLength(20);
    expect(new Set(newCases.map(([id]) => id)).size).toBe(20);
    for (const [id, status, reason] of newCases) {
      const row = doc.split("\n").find((line) => line.includes(`\`${id}\``));
      expect(row, id).toBeDefined();
      expect(row, id).toContain(`\`${status}\``);
      expect(row, id).toContain(reason);
      expect(row?.split("|").length, id).toBeGreaterThanOrEqual(9);
    }
  });

  test("new inventory covers selected context malformed precedence and identity gaps", () => {
    const ids = newCases.map(([id]) => id);
    for (const fragment of ["bearish_risk", "fda_event", "sec_event", "future_event_excluded", "news_unavailable", "missing_semantics", "nfc_equivalent", "percent_encoding", "category_uppercase", "freshness_unicode", "numeric_context", "payload_horizon", "outcome_horizon", "linkage_fingerprint", "stale_complete", "anti_leakage_unknown", "invalid_trading_window", "precedence_identity", "precedence_linkage", "precedence_leakage"]) {
      expect(ids.some((id) => id.includes(fragment)), fragment).toBe(true);
    }
  });

  test("allowed and forbidden source policies prohibit discovery and runtime inputs", () => {
    const doc = read();
    for (const allowed of ["Action 380/381 static fixtures", "Action 397 test-local wrapper conventions", "manually declared static invalid variants", "fixed source-controlled constants"]) expect(doc).toContain(allowed);
    for (const forbidden of ["production/live recommendations", "Supabase/database rows", "provider/news data", "historical downloads", "replay captures", "browser/localStorage", "environment-derived cases", "arbitrary files/JSON", "stdin", "arbitrary CLI paths", "directory/glob discovery", "network responses"]) expect(doc).toContain(forbidden);
  });

  test("expanded manifest contract is separate finite and metadata-only", () => {
    const doc = read();
    expect(doc).toContain("`docs/action-400-expanded-static-mapper-shadow-input-manifest.json`");
    for (const requirement of ["exactly 40 ordered cases", "immutable original 20 definitions/hashes", "exact new 20 definitions", "Action 397 runner/raw/canonical manifest hashes", "canonical input hashes", "identity assertions where applicable"]) expect(doc).toContain(requirement);
    expect(doc).toContain("No full row, input, payload, context, outcome");
    expect(doc).toContain("original Action 397 manifest must not be modified");
  });

  test("separate runner contract forbids expansion of Action 397 and retries", () => {
    const doc = read();
    expect(doc).toContain("`scripts/action-400-expanded-static-mapper-shadow-run.mjs`");
    expect(doc).toContain("must be separate from and must not modify or turn Action 397 into an extensible input engine");
    expect(doc).toContain("validate exactly 40 cases");
    expect(doc).toContain("execute exactly twice");
    expect(doc).toContain("No retry, third run, discovery, arbitrary input");
  });

  test("expanded status distribution is exact and totals 40", () => {
    const doc = read();
    let original = 0;
    let added = 0;
    let expanded = 0;
    for (const [status, counts] of Object.entries(distribution)) {
      expect(doc).toContain(`| \`${status}\` | ${counts[0]} | ${counts[1]} | ${counts[2]} |`);
      original += counts[0]; added += counts[1]; expanded += counts[2];
    }
    expect([original, added, expanded]).toEqual([20, 20, 40]);
    expect(doc).toContain("may not derive or rewrite expected counts from actual outputs");
  });

  test("metadata output determinism and cleanup boundaries remain strict", () => {
    const doc = read();
    for (const item of ["case ID", "status", "row ID where present", "row-present", "consumable", "ordered issue codes/paths/severities", "canonical result hash"]) expect(doc).toContain(item);
    expect(doc).toContain("Full rows and inputs are forbidden");
    expect(doc).toContain("Exactly two runs are required");
    expect(doc).toContain("third repair run is forbidden");
    expect(doc).toContain("<system-temp>/ture/action-400-expanded-static-mapper-shadow/");
    expect(doc).toContain("dangling/resolved/parent-chain symlinks");
    expect(doc).toContain("No tracked result evidence");
  });

  test("stop conditions and no-effect requirements fail closed", () => {
    const doc = read();
    expect(doc).toContain("return `shadow_aborted` before mapping");
    expect(doc).toContain("return `shadow_failed` after mapping");
    expect(doc).toContain("No same-Action repair or retry");
    for (const lock of ["persistence/Supabase/database writes: none", "replay: none", "runtime/routes/jobs: none", "provider/news/network access: none", "feedback: none", "authoritative data created: false"]) expect(doc).toContain(lock);
  });

  test("exact approved Action 400 package exists without tracked evidence", () => {
    for (const path of action400Package) expect(existsSync(path), path).toBe(true);
    expect(existsSync("docs/action-400-expanded-static-mapper-shadow-evidence.json")).toBe(false);
    const consumers = [...files("app"), ...files("lib")].filter((path) => path !== "lib/snapshot-to-learning-dataset-mapper.ts" && /\.(?:ts|tsx|js|jsx)$/.test(path) && /from\s+["'][^"']*snapshot-to-learning-dataset-mapper["']/.test(read(path)));
    expect(consumers).toEqual([]);
  });

  test("verifier succeeds with approved decision and exact implementation", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-399-expanded-static-mapper-shadow-batch-approval-gate-verify.mjs"], { encoding: "utf8" })) as Record<string, unknown>;
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.passed_conditions_count).toBe(18);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.expanded_case_count).toBe(40);
    expect(report.retained_original_case_count).toBe(20);
    expect(report.added_case_count).toBe(20);
    expect(report.action_400_artifacts_found).toEqual(action400Package);
  });

  test("Actions 397 and 398 remain healthy and runtime preview stays paused", () => {
    for (const path of [
      "scripts/action-397-static-mapper-shadow-use-verify.mjs",
      "scripts/action-398-independent-static-post-shadow-verification-and-batch-expansion-readiness-audit-verify.mjs",
    ]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(read()).toContain("runtime_preview_waiting_for_operator_inputs");
  });
});
