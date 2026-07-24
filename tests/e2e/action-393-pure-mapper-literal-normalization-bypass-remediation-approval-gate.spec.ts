import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = "docs/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate.md";
const hashes = {
  "lib/snapshot-to-learning-dataset-mapper.ts": "e6c0053b9030b342b6090816b77cd57ee878e5a703bbd5ac7b32e42b93fea47b",
  "lib/learning-dataset-static-fixtures.ts": "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  "lib/intelligence-context-static-fixtures.ts": "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  "lib/pattern-insight-static-fixtures.ts": "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
};
const action394MapperHash = "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d";

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

test.describe.serial("Action 393 literal-normalization remediation approval gate", () => {
  test("documentation contract and approved decision are complete", () => {
    const doc = read(docPath);
    for (const section of [
      "Purpose and scope",
      "Three bypass findings and classifications",
      "Permitted mapper surface",
      "Exact-literal policy",
      "Whitespace policy",
      "Case-sensitivity policy",
      "Unicode normalization policy",
      "Representation-safe versus semantic normalization",
      "Context-state policy",
      "Freshness-literal policy",
      "Horizon-literal policy",
      "Alias-equivalence and canonicalization boundary",
      "Validation-stage placement",
      "Result-status and issue-code compatibility",
      "Backwards compatibility and regression requirements",
      "Acceptance and rejection criteria",
      "Approval vocabulary and deterministic gate conditions",
      "Next permitted Action",
    ]) expect(doc).toContain(`## ${section}`);
    expect(doc).toContain("`approval_decision: approved`");
    expect(doc).toContain("`passed_conditions_count: 17`");
    expect(doc).toContain("`failed_conditions_count: 0`");
    expect(doc).toContain("`unresolved_conditions_count: 0`");
  });

  test("documents all bypasses and classifications", () => {
    const doc = read(docPath);
    expect(doc).toContain("Context state ` present ` is trimmed and accepted");
    expect(doc).toContain("Freshness state ` fresh ` is trimmed and accepted");
    expect(doc).toContain("Payload horizon `60M` is lowercased and accepted");
    expect(doc).toContain("Payload horizon ` 60m ` is trimmed and accepted");
    expect(doc).toContain("`unauthorized_whitespace_normalization`");
    expect(doc).toContain("`unauthorized_case_normalization`");
  });

  test("freezes exact literal whitespace case and Unicode policies", () => {
    const doc = read(docPath);
    for (const marker of [
      "no leading or trailing whitespace",
      "no internal whitespace normalization",
      "no case folding",
      "no fallback to `unknown`",
      "ASCII spaces, tabs, newlines",
      "non-breaking spaces",
      "No trim may occur before validation",
      "are case-sensitive",
      "NFC, NFD, NFKC, NFKD",
      "Unicode whitespace folding",
    ]) expect(doc).toContain(marker);
  });

  test("distinguishes representation-safe from forbidden semantic normalization", () => {
    const doc = read(docPath);
    expect(doc).toContain("Representation-safe normalization preserves already validated meaning");
    expect(doc).toContain("NFC normalization of deterministic row-identity components");
    expect(doc).toContain("percent encoding of row-identity serialization");
    expect(doc).toContain("Semantic normalization changes how an input is interpreted");
    expect(doc).toContain("Semantic normalization is forbidden for context state, freshness, and horizons");
  });

  test("freezes context freshness and horizon rules", () => {
    const doc = read(docPath);
    for (const state of ["present", "explicit_null", "unavailable", "unknown"]) expect(doc).toContain(`\`${state}\``);
    for (const freshness of ["fresh", "stale", "unknown", "unavailable"]) expect(doc).toContain(`\`${freshness}\``);
    for (const horizon of ["15m", "30m", "60m"]) expect(doc).toContain(`\`${horizon}\``);
    expect(doc).toContain("Unsupported context-state literals return `blocked_invalid_provenance`");
    expect(doc).toContain("Unsupported freshness returns `blocked_invalid_provenance`");
    expect(doc).toContain("Unsupported payload horizon: `blocked_invalid_input`");
    expect(doc).toContain("Unsupported outcome horizon: `blocked_invalid_outcome`");
    expect(doc).toContain("Two individually valid but different horizons: `blocked_invalid_linkage`");
  });

  test("freezes bypass variant coverage without inventing schemas", () => {
    const doc = read(docPath);
    for (const marker of [
      "ASCII and Unicode padding",
      "tabs/newlines",
      "empty strings",
      "mixed case",
      "numeric horizons",
      "unit aliases",
      "ISO durations",
      "invalid payload with valid outcome",
      "valid payload with invalid outcome",
      "valid-but-conflicting horizons",
      "Test-local malformed wrappers are permitted",
    ]) expect(doc).toContain(marker);
  });

  test("preserves only previously approved equivalences and row identity representation", () => {
    const doc = read(docPath);
    expect(doc).toContain("`long` equals `buy`; `short` equals `sell`");
    expect(doc).toContain("`[0,1]` normalized units and `(1,100]` percentage conversion");
    expect(doc).toContain("NFC and percent-encoded row identity");
    expect(doc).toContain("They do not authorize trimming/case normalization for context state, freshness, or horizons");
  });

  test("preserves validation order and unsupported versus conflicting horizon ownership", () => {
    const doc = read(docPath);
    const positions = [
      "1. input shape",
      "2. required identity",
      "3. linkage",
      "4. alias conflicts",
      "5. timestamp/temporal ordering",
      "6. future leakage",
      "7. provenance",
      "8. outcome",
      "9. optional completeness",
      "10. construction",
    ].map((marker) => doc.indexOf(marker));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(doc).toContain("unsupported payload literal returns `blocked_invalid_input`");
    expect(doc).toContain("unsupported outcome literal returns `blocked_invalid_outcome`");
    expect(doc).toContain("two valid differing literals return `blocked_invalid_linkage`");
  });

  test("retains exact issue contract and deterministic paths", () => {
    const doc = read(docPath);
    expect(doc).toContain("No result status or issue code is added");
    expect(doc).toContain("`{ code, path, severity, messageKey }`");
    expect(doc).toContain("RFC 6901 paths");
    expect(doc).toContain("deterministic ordering and deduplication");
    expect(doc).toContain("Rejected raw values never appear in issues or messages");
    for (const path of [
      "/contextSnapshot/context/market/market_regime/state",
      "/contextSnapshot/freshness/state",
      "/recommendationSnapshot/payload_json/outcome_horizon",
      "/outcome/horizon",
    ]) expect(doc).toContain(path);
  });

  test("freezes the exact Action 394 boundary and keeps shadow use blocked", () => {
    const doc = read(docPath);
    for (const path of [
      "lib/snapshot-to-learning-dataset-mapper.ts",
      "docs/action-394-pure-mapper-literal-normalization-remediation.md",
      "scripts/action-394-pure-mapper-literal-normalization-remediation-verify.mjs",
      "tests/e2e/action-394-pure-mapper-literal-normalization-remediation.spec.ts",
    ]) expect(doc).toContain(`\`${path}\``);
    expect(doc).toContain("Forbidden surfaces: fixtures, new production modules, adapters, consumers");
    expect(doc).toContain("Shadow-use approval remains blocked until Action 394 is independently verified");
  });

  test("does not modify mapper fixtures or add consumers", () => {
    for (const [path, hash] of Object.entries(hashes)) {
      const accepted = path === "lib/snapshot-to-learning-dataset-mapper.ts" ? [hash, action394MapperHash] : [hash];
      expect(accepted, path).toContain(sha256(path));
    }
    const consumers = files("app")
      .filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path))
      .filter((path) => read(path).includes("snapshot-to-learning-dataset-mapper"));
    expect(consumers).toEqual([]);
  });

  test("contains no runtime provider Supabase persistence replay or shadow authorization", () => {
    const doc = read(docPath);
    expect(doc).toContain("It does not modify the mapper, fixtures, consumers, runtime, persistence, replay");
    expect(doc).toContain("No result status or issue code is added");
    expect(doc).toContain("No clock, randomness, global cache, mutation");
    expect(doc).toContain("Shadow-use approval remains blocked");
  });

  test("verifier succeeds with approved decision", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-393-pure-mapper-literal-normalization-bypass-remediation-approval-gate-verify.mjs"], { encoding: "utf8" }));
    expect(report.verification_status).toBe("passed");
    expect(report.approval_decision).toBe("approved");
    expect(report.passed_conditions_count).toBe(17);
    expect(report.failed_conditions_count).toBe(0);
    expect(report.unresolved_conditions_count).toBe(0);
    expect(report.mapper_consumer_files).toEqual([]);
  });

  test("Actions 390 through 392 remain healthy", () => {
    for (const path of [
      "scripts/action-390-pure-mapper-contract-remediation-approval-gate-verify.mjs",
      "scripts/action-391-pure-mapper-contract-remediation-verify.mjs",
      "scripts/action-392-independent-mapper-remediation-verification-and-shadow-use-readiness-audit-verify.mjs",
    ]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
  });

  test("runtime preview remains paused", () => {
    const doc = read(docPath);
    expect(doc).toContain("runtime_preview_waiting_for_operator_inputs");
    expect(doc).toContain("The next permitted Action is Action 394");
  });
});
