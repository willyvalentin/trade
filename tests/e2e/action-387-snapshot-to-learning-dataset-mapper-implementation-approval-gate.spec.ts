import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

const docPath = join(
  process.cwd(),
  "docs/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate.md",
);
const verifierPath =
  "scripts/action-387-snapshot-to-learning-dataset-mapper-implementation-approval-gate-verify.mjs";
const doc = readFileSync(docPath, "utf8");

function runVerifier(path: string) {
  return execFileSync("node", [path], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

test.describe.serial("Action 387 mapper implementation approval gate", () => {
  test("documentation and approval decision contracts are complete", () => {
    for (const section of [
      "## Exact Future Mapper Module Boundary",
      "## Exact Input Contract",
      "## Exact Output Contract",
      "## Mapper Result Vocabulary",
      "## Mapper Error Vocabulary",
      "## Validation Issue Contract",
      "## Validation Order",
      "## Deterministic Row-ID Policy",
      "## Timestamp Alias Precedence",
      "## Side Alias Precedence",
      "## Setup Alias Precedence",
      "## Confidence Alias Precedence",
      "## Approval Decision",
      "## Next Permitted Action",
    ]) {
      expect(doc).toContain(section);
    }
    expect(doc).toContain("approval_decision: approved");
    expect(doc).toContain("passed_conditions_count: 17");
    expect(doc).toContain("failed_conditions_count: 0");
    expect(doc).toContain("unresolved_conditions_count: 0");
    expect(doc).toContain("mapper_implemented: false");
  });

  test("Action 386 conditions are explicitly resolved", () => {
    expect(doc).toContain("Action 386 returned `ready_with_conditions`");
    expect(doc).toContain("discriminated mapper result/error vocabulary");
    expect(doc).toContain(
      "explicit timestamp/side/setup/confidence alias precedence",
    );
    expect(doc).toContain("This gate freezes both");
    expect(doc).toContain("No Action 386 condition remains unresolved");
  });

  test("exact future mapper boundary authorizes only Action 388 static surfaces", () => {
    for (const path of [
      "lib/snapshot-to-learning-dataset-mapper.ts",
      "docs/action-388-snapshot-to-learning-dataset-mapper-implementation.md",
      "scripts/action-388-snapshot-to-learning-dataset-mapper-implementation-verify.mjs",
      "tests/e2e/action-388-snapshot-to-learning-dataset-mapper-implementation.spec.ts",
    ]) {
      expect(doc).toContain(path);
    }
    expect(doc).toContain("No other surface is approved");
    expect(doc).toContain("optional colocated pure validator");
    expect(doc).toContain("preferred implementation is one mapper module");
  });

  test("input and output contracts reuse authoritative types", () => {
    expect(doc).toContain(
      "recommendationSnapshot: Readonly<RecommendationSnapshot>",
    );
    expect(doc).toContain(
      "contextSnapshot: Readonly<Action336IntelligenceContextStaticFixture> | null",
    );
    expect(doc).toContain(
      "outcome: Readonly<RecommendationOutcome> | null",
    );
    expect(doc).toContain(
      "Success returns the existing `Action335LearningDatasetRow`",
    );
    expect(doc).toContain("Blocked results return no row");
    expect(doc).toContain("accepts no services, repositories, providers, clocks");
  });

  test("result and error vocabulary are exact discriminated unions", () => {
    for (const status of [
      "mapped",
      "mapped_with_missing_optional_data",
      "blocked_missing_required_identity",
      "blocked_invalid_linkage",
      "blocked_conflicting_aliases",
      "blocked_temporal_violation",
      "blocked_future_leakage",
      "blocked_invalid_provenance",
      "blocked_invalid_outcome",
      "blocked_invalid_input",
    ]) {
      expect(doc).toContain(`"${status}"`);
    }
    expect(doc).toContain("row: Action335LearningDatasetRow");
    expect(doc).toContain("consumable: true");
    expect(doc).toContain("row: null");
    expect(doc).toContain("consumable: false");
    expect(doc).toContain("Expected validation failures never throw");
  });

  test("issue contract freezes codes paths severities ordering and redaction", () => {
    for (const code of [
      "missing_required_identity",
      "invalid_linkage",
      "conflicting_aliases",
      "invalid_timestamp",
      "temporal_violation",
      "future_leakage",
      "invalid_provenance",
      "invalid_outcome",
      "invalid_input",
      "missing_optional_context",
      "missing_optional_outcome",
      "unknown_setup",
      "unavailable_source",
      "partial_provenance",
    ]) {
      expect(doc).toContain(`"${code}"`);
    }
    expect(doc).toContain('severity: "error" | "warning"');
    expect(doc).toContain("RFC 6901-style JSON Pointer");
    expect(doc).toContain("then path lexically, then code lexically");
    expect(doc).toContain("no source values, raw input dumps, secrets");
  });

  test("validation precedence is deterministic", () => {
    const phases = [
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
    let previous = -1;
    for (const phase of phases) {
      const index = doc.indexOf(phase);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(doc).toContain("first phase containing errors determines");
    expect(doc).toContain("Warning-only phases continue");
  });

  test("timestamp side setup and confidence alias precedence is frozen", () => {
    expect(doc).toContain("recommendationSnapshot.recommended_at");
    expect(doc).toContain("`app_timestamp`, then `created_at`");
    expect(doc).toContain("outcome.evaluated_at");
    expect(doc).toContain("UTC ISO 8601 with millisecond precision");

    expect(doc).toContain("recommendationSnapshot.side");
    expect(doc).toContain("payload_json.trade_direction");
    expect(doc).toContain("`long`/`buy` to `long`");
    expect(doc).toContain("`short`/`sell` to `short`");

    expect(doc).toContain("payload_json.setup_family");
    expect(doc).toContain("eight Action 326 literals");
    expect(doc).toContain("maps to existing `unknown`");

    expect(doc).toContain("recommendationSnapshot.confidence");
    expect(doc).toContain("recommendationSnapshot.score");
    expect(doc).toContain("Values in `[0,1]`");
    expect(doc).toContain("Values in `(1,100]`");
    expect(doc).toContain("differences greater than `1e-9`");
  });

  test("conflicts block and deterministic row identity excludes mutable data", () => {
    expect(doc).toContain("Material conflicts return `blocked_conflicting_aliases`");
    expect(doc).toContain("no later validation");
    expect(doc).toContain("learning_dataset_static_fixture_v1");
    expect(doc).toContain("UTF-8 NFC-normalized and percent-encoded");
    expect(doc).toContain("learning_row:v1:");
    expect(doc).toContain("Same inputs yield the same IDs");
    expect(doc).toContain("no random UUID, clock value, mutable metric");
    expect(doc).toContain("Repeated identical input is idempotent");
  });

  test("missing data and provenance distinctions remain explicit", () => {
    expect(doc).toContain("A null context maps to explicit missing optional context");
    expect(doc).toContain("A null outcome maps to the existing pending/no-outcome state");
    expect(doc).toContain("mapped_with_missing_optional_data");
    expect(doc).toContain(
      "`explicit_null`, `unknown`, `unavailable`, absent, stale, partial, and conflicting",
    );
    expect(doc).toContain("Null is never rewritten as unknown");
    expect(doc).toContain("Malformed provenance blocks");
    expect(doc).toContain("no zero/default is invented");
  });

  test("temporal and future-leakage rejection is frozen", () => {
    expect(doc).toContain("Context capture and effective time must be at or before");
    expect(doc).toContain("outcome evaluation must be at or after");
    expect(doc).toContain("blocked_temporal_violation");
    expect(doc).toContain("blocked_future_leakage");
    expect(doc).toContain("future news, future macro facts");
    expect(doc).toContain("included_in_snapshot_context` is false");
    expect(doc).toContain("No local-time interpretation, current-time fallback");
  });

  test("purity immutability and peer-group boundaries are frozen", () => {
    expect(doc).toContain("must neither mutate nor retain mutable references");
    for (const forbidden of [
      "Date.now()",
      "current-time `new Date()`",
      "Math.random()",
      "random UUIDs",
      "log",
      "cache mutable global state",
    ]) {
      expect(doc).toContain(forbidden);
    }
    expect(doc).toContain("No-Repair Guarantee");
    expect(doc).toContain("No-Enrichment Guarantee");
    expect(doc).toContain("No-Inference Guarantee");
    expect(doc).toContain("Peer-group remains `unsupported_optional`");
    expect(doc).toContain("never infer it from sector/industry");
    expect(doc).toContain("never extend schema");
  });

  test("no production mapper runtime provider Supabase or persistence surface exists", () => {
    const libFiles = readdirSync(join(process.cwd(), "lib"));
    expect(
      libFiles.some((name) =>
        /snapshot-to-learning-dataset-mapper|learning-row-mapper/.test(name),
      ),
    ).toBe(false);
    expect(
      existsSync(join(process.cwd(), "app/api/snapshot-to-learning-dataset")),
    ).toBe(false);
    expect(doc).toContain("No-Runtime Guarantee");
    expect(doc).toContain("No-Persistence Guarantee");
    expect(doc).toContain("Forbidden Implementation Surfaces");
  });

  test("Action 387 verifier succeeds without implementing the mapper", () => {
    const output = runVerifier(verifierPath);
    const parsed = JSON.parse(output);

    expect(parsed.verification_status).toBe("passed");
    expect(parsed.approval_decision).toBe("approved");
    expect(parsed.passed_conditions_count).toBe(17);
    expect(parsed.failed_conditions_count).toBe(0);
    expect(parsed.unresolved_conditions_count).toBe(0);
    expect(parsed.mapper_implementation_approved).toBe(true);
    expect(parsed.mapper_implemented).toBe(false);
    expect(parsed.production_mapper_found).toBe(false);
    expect(parsed.no_effect_flags).toEqual({
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
    });
  });

  test("Actions 352 380 381 383 385 and 386 remain healthy", () => {
    for (const verifier of [
      "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
      "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
      "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs",
      "scripts/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests-verify.mjs",
      "scripts/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests-verify.mjs",
      "scripts/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review-verify.mjs",
    ]) {
      expect(JSON.parse(runVerifier(verifier)).verification_status).toBe(
        "passed",
      );
    }
  });

  test("runtime preview fixture and deployment surfaces remain untouched", () => {
    const status = execFileSync(
      "git",
      ["status", "--short", "--untracked-files=all"],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    const action387Lines = status
      .split("\n")
      .filter((line) => line.includes("action-387"));

    expect(action387Lines.some((line) => line.includes("lib/"))).toBe(false);
    expect(action387Lines.some((line) => line.includes("app/"))).toBe(false);
    expect(action387Lines.some((line) => line.includes("supabase/"))).toBe(
      false,
    );
    expect(action387Lines.some((line) => line.includes("proxy.ts"))).toBe(
      false,
    );
    expect(action387Lines.some((line) => line.includes("netlify.toml"))).toBe(
      false,
    );
    expect(action387Lines.some((line) => line.includes("action-370"))).toBe(
      false,
    );
    expect(doc).toContain(
      "runtime_preview_status: runtime_preview_waiting_for_operator_inputs",
    );
  });
});
