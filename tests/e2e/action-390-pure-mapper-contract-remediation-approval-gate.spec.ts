import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-390-pure-mapper-contract-remediation-approval-gate.md";
const mapperPath = "lib/snapshot-to-learning-dataset-mapper.ts";
const learningFixturePath = "lib/learning-dataset-static-fixtures.ts";
const contextFixturePath = "lib/intelligence-context-static-fixtures.ts";
const expectedHashes = {
  [mapperPath]: "05276aebf1e7c6328242949c22e489ba384c9c501574c5d170d789ba47fa00e2",
  [learningFixturePath]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [contextFixturePath]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
};
const remediatedMapperHash = "e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? files(child) : [child];
  });
}

test.describe.serial("Action 390 pure mapper remediation approval gate", () => {
  test("documentation contract and approval decision are frozen", () => {
    const doc = read(docPath);
    for (const section of [
      "Purpose and scope",
      "Exact seven findings and classifications",
      "Exact permitted mapper surface",
      "Context-category remediation",
      "Freshness-state remediation",
      "Stale/fresh consistency remediation",
      "Finite-metric remediation",
      "Trading-window remediation",
      "Horizon-linkage remediation",
      "Anti-leakage output-integrity remediation",
      "Validation-order policy",
      "Issue-code policy",
      "Acceptance and rejection criteria",
      "Blocked downstream work",
      "Next permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("`approval_decision: approved`");
    expect(doc).toContain("`passed_conditions_count: 17`");
    expect(doc).toContain("`failed_conditions_count: 0`");
    expect(doc).toContain("`unresolved_conditions_count: 0`");
  });

  test("documents all seven findings and classifications", () => {
    const doc = read(docPath);
    const rows = [
      ["Unsupported context categories are accepted", "missing_domain_validation"],
      ["Invalid freshness states are accepted", "missing_domain_validation"],
      ["Stale/fresh contradictions are accepted", "inconsistent_state_validation"],
      ["Non-finite context metrics are accepted", "missing_numeric_validation"],
      ["Unsupported trading windows are accepted", "missing_domain_validation"],
      ["Payload and outcome horizons may disagree", "missing_linkage_validation"],
      ["Failed anti-leakage input can be emitted as passed", "output_integrity_violation"],
    ];
    for (const [finding, classification] of rows) {
      expect(doc).toContain(`| ${finding} | \`${classification}\` |`);
    }
  });

  test("freezes the exact Action 391 remediation boundary", () => {
    const doc = read(docPath);
    for (const path of [
      "lib/snapshot-to-learning-dataset-mapper.ts",
      "docs/action-391-pure-mapper-contract-remediation.md",
      "scripts/action-391-pure-mapper-contract-remediation-verify.mjs",
      "tests/e2e/action-391-pure-mapper-contract-remediation.spec.ts",
    ]) expect(doc).toContain(`\`${path}\``);
    for (const forbidden of [
      "fixture modules",
      "new production modules",
      "adapters",
      "consumers",
      "runtime routes",
      "persistence",
      "schema/migrations",
      "Pattern Discovery",
    ]) expect(doc).toContain(forbidden);
  });

  test("freezes category freshness numeric window and horizon policies", () => {
    const doc = read(docPath);
    expect(doc).toContain("`present`, `explicit_null`, `unavailable`, `unknown`");
    expect(doc).toContain("Unsupported closed-category values must return `blocked_invalid_provenance`");
    expect(doc).toContain("`fresh`, `stale`, `unknown`, and `unavailable`");
    expect(doc).toContain("60-minute fixture boundary");
    expect(doc).toContain("`NaN`, positive Infinity, negative Infinity");
    expect(doc).toContain("No coercion, clamping, null replacement");
    expect(doc).toContain("`morning`, `midday`, `power_hour`, and `unknown`");
    expect(doc).toContain("No timestamp-to-window inference");
    expect(doc).toContain("`recommendationSnapshot.payload_json.outcome_horizon`");
    expect(doc).toContain("A disagreement returns `blocked_invalid_linkage`");
  });

  test("freezes stale/fresh contradiction rejection without clock or repair", () => {
    const doc = read(docPath);
    expect(doc).toContain("stale state paired with a populated `fresh: true` alias");
    expect(doc).toContain("fresh state paired with a populated `stale: true` alias");
    expect(doc).toContain("unavailable provenance/source paired with fresh");
    expect(doc).toContain("block without selecting a winner");
    expect(doc).toContain("must not call the current clock");
    expect(doc).toContain("must not derive stale/fresh state");
  });

  test("freezes anti-leakage monotonicity and blocked result integrity", () => {
    const doc = read(docPath);
    expect(doc).toContain("Anti-leakage integrity is monotonic");
    expect(doc).toContain("never less restrictive");
    expect(doc).toContain("A failed marker returns `blocked_future_leakage`");
    expect(doc).toContain("The blocked result contains no row and has `consumable: false`");
    expect(doc).toContain("`included_in_snapshot_context: false`");
    expect(doc).toContain("Row construction cannot overwrite or repair");
  });

  test("preserves validation order and existing issue contract", () => {
    const doc = read(docPath);
    const positions = [
      "1. input shape",
      "2. required identity",
      "3. linkage, including horizon mismatch",
      "4. alias conflicts",
      "5. timestamp and temporal ordering",
      "6. future leakage, including anti-leakage marker integrity",
      "7. provenance, including context categories, freshness, consistency, and context numerics",
      "8. outcome",
      "9. optional completeness",
      "10. construction",
    ].map((marker) => doc.indexOf(marker));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(doc).toContain("No new issue code is approved");
    expect(doc).toContain("RFC 6901 paths");
    expect(doc).toContain("deterministic ordering and deduplication");
  });

  test("does not modify mapper fixtures or add consumers", () => {
    for (const [path, expected] of Object.entries(expectedHashes)) {
      if (path === mapperPath) {
        expect([expected, remediatedMapperHash], path).toContain(sha256(path));
      } else {
        expect(sha256(path), path).toBe(expected);
      }
    }
    if (sha256(mapperPath) === remediatedMapperHash) {
      expect(read("docs/action-391-pure-mapper-contract-remediation.md")).toContain("Action 390 returned `approval_decision: approved`");
    }
    const consumers = files("app")
      .filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path))
      .filter((path) => read(path).includes("snapshot-to-learning-dataset-mapper"));
    expect(consumers).toEqual([]);
  });

  test("contains no runtime provider Supabase persistence or hidden inference authorization", () => {
    const doc = read(docPath);
    expect(doc).toContain("It does not modify the mapper, fixtures, runtime, persistence");
    expect(doc).toContain("No new issue code is approved");
    expect(doc).toContain("must not infer it");
    expect(doc).toContain("No coercion, clamping, null replacement");
    expect(doc).toContain("Mapper consumers, batch mapping, static shadow use, runtime integration, persistence, replay");
  });

  test("verifier succeeds with approved decision and zero failed conditions", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-390-pure-mapper-contract-remediation-approval-gate-verify.mjs"], { encoding: "utf8" }));
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.passed_conditions_count).toBe(17);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.mapper_consumer_files).toEqual([]);
    expect(report.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  });

  test("Actions 387 through 389 remain healthy", () => {
    for (const path of [
      "scripts/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate-verify.mjs",
      "scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs",
      "scripts/action-389-pure-mapper-independent-verification-and-fixture-coverage-audit-verify.mjs",
    ]) {
      expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    }
  });

  test("runtime preview remains paused and Action 391 is separately identified", () => {
    const doc = read(docPath);
    expect(doc).toContain("runtime_preview_waiting_for_operator_inputs");
    expect(doc).toContain("The next permitted Action is Action 391");
    expect(doc).toContain("static shadow use");
    expect(doc).toContain("remain blocked");
  });
});
