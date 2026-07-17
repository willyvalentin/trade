import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  getLearningDatasetStaticFixtures,
  getMalformedLearningDatasetStaticFixtureCases,
  serializeLearningDatasetStaticFixtures,
  validateLearningDatasetStaticFixtureSet,
} from "../../lib/learning-dataset-static-fixtures";
import {
  getIntelligenceContextStaticFixtures,
  getMalformedIntelligenceContextStaticFixtureCases,
  serializeIntelligenceContextStaticFixtures,
  validateIntelligenceContextStaticFixtureSet,
} from "../../lib/intelligence-context-static-fixtures";
import {
  getMalformedPatternInsightStaticFixtureCases,
  getPatternInsightStaticFixtures,
  validatePatternInsightStaticFixtureSet,
} from "../../lib/pattern-insight-static-fixtures";

const docPath = join(
  process.cwd(),
  "docs/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review.md",
);
const verifierPath =
  "scripts/action-386-static-intelligence-package-consolidation-and-mapper-readiness-review-verify.mjs";
const doc = readFileSync(docPath, "utf8");

const baseline = {
  learning: serializeLearningDatasetStaticFixtures(),
  learningMalformed: JSON.stringify(
    getMalformedLearningDatasetStaticFixtureCases(),
  ),
  context: serializeIntelligenceContextStaticFixtures(),
  contextMalformed: JSON.stringify(
    getMalformedIntelligenceContextStaticFixtureCases(),
  ),
  pattern: JSON.stringify(getPatternInsightStaticFixtures()),
  patternMalformed: JSON.stringify(
    getMalformedPatternInsightStaticFixtureCases(),
  ),
};

function runVerifier(path: string) {
  return execFileSync("node", [path], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

test.describe.serial("Action 386 static intelligence package consolidation", () => {
  test.afterAll(() => {
    expect(serializeLearningDatasetStaticFixtures()).toBe(baseline.learning);
    expect(JSON.stringify(getMalformedLearningDatasetStaticFixtureCases())).toBe(
      baseline.learningMalformed,
    );
    expect(serializeIntelligenceContextStaticFixtures()).toBe(baseline.context);
    expect(
      JSON.stringify(getMalformedIntelligenceContextStaticFixtureCases()),
    ).toBe(baseline.contextMalformed);
    expect(JSON.stringify(getPatternInsightStaticFixtures())).toBe(
      baseline.pattern,
    );
    expect(JSON.stringify(getMalformedPatternInsightStaticFixtureCases())).toBe(
      baseline.patternMalformed,
    );
  });

  test("documentation and readiness decision contracts are complete", () => {
    for (const section of [
      "## Intelligence-Layer Ownership Matrix",
      "## Type Ownership Matrix",
      "## Mapper Input Contract Readiness",
      "## Mapper Output Contract Readiness",
      "## Mapper Purity Requirements",
      "## Unsupported Gaps",
      "## Readiness Vocabulary",
      "## Readiness Decision",
      "## Passed Conditions",
      "## Failed Conditions",
      "## Unresolved Conditions",
      "## Next Permitted Action",
    ]) {
      expect(doc).toContain(section);
    }
    expect(doc).toContain("readiness_decision: ready_with_conditions");
    expect(doc).toContain("mapper_implementation_approved: false");
    expect(doc).toContain("failed_conditions_count: 0");
    expect(doc).toContain("unresolved_conditions_count: 2");
  });

  test("upstream implementation fixture verifier and compatibility inventories are present", () => {
    for (const action of [
      331, 332, 334, 335, 336, 337, 340, 342, 343, 346, 347, 348,
      349, 352, 353, 354, 355, 356, 357, 380, 381, 382, 383, 384,
      385,
    ]) {
      expect(doc).toContain(`Action ${action}`);
    }
    expect(doc).toContain("21 valid Pattern Insight fixtures");
    expect(doc).toContain("13 valid Learning Dataset fixtures");
    expect(doc).toContain("18 malformed cases");
    expect(doc).toContain("Action 383 proves direct");
    expect(doc).toContain("Action 385 proves Learning Dataset evidence");
  });

  test("authoritative ownership matrix resolves required concepts once", () => {
    const matrix = doc.slice(
      doc.indexOf("## Intelligence-Layer Ownership Matrix"),
      doc.indexOf("## Type Ownership Matrix"),
    );
    for (const concept of [
      "recommendation identity",
      "recommendation timestamp",
      "snapshot identity",
      "context identity",
      "context values",
      "provenance",
      "completeness",
      "outcome identity",
      "outcome status",
      "outcome metrics",
      "Learning Dataset row identity",
      "Pattern Insight identity",
      "source references",
      "observation windows",
      "readiness states",
    ]) {
      expect(matrix.match(new RegExp(`\\| ${concept} \\|`, "g"))).toHaveLength(
        1,
      );
    }
    expect(matrix).toContain(
      "No concept has two competing authoritative definitions",
    );
  });

  test("shared type reuse is direct and no parallel fixture schema exists", () => {
    const contextSource = readFileSync(
      join(process.cwd(), "lib/intelligence-context-static-fixtures.ts"),
      "utf8",
    );

    expect(contextSource).toContain("LearningDatasetContext");
    expect(contextSource).toContain("LearningDatasetContextValue");
    expect(contextSource).toContain("LearningDatasetProvenance");
    expect(contextSource).toContain(
      'from "@/lib/learning-dataset-static-fixtures"',
    );
    expect(contextSource).not.toMatch(/type\s+MarketRegimeContext\b/);
    expect(contextSource).not.toMatch(/type\s+SectorIndustryContext\b/);
    expect(doc).toContain("no compatibility-only production schema exists");
  });

  test("mapper inputs and output are ready with bounded gate conditions", () => {
    expect(doc).toContain(
      "Conceptual input is `{ recommendationSnapshot, contextSnapshot, outcome }`",
    );
    expect(doc).toContain("deterministic identity/linkage");
    expect(doc).toContain("timestamp semantics");
    expect(doc).toContain("required/optional distinctions");
    expect(doc).toContain("Action335LearningDatasetRow");
    expect(doc).toContain("stable ordering/serialization expectations");
    expect(doc).toContain("Construction error vocabulary is not yet authoritative");
    expect(doc).toContain("freeze explicit precedence");
  });

  test("identity linkage temporal and anti-leakage boundaries are ready", () => {
    expect(doc).toContain("Result: ready");
    expect(doc).toContain("Random IDs, wall-clock IDs");
    expect(doc).toContain("Context capture/effective time must be at or before");
    expect(doc).toContain("Outcome evaluation must be at or after");
    expect(doc).toContain("included_in_snapshot_context: false");

    for (const fixture of getIntelligenceContextStaticFixtures()) {
      const recommendationAt = Date.parse(
        fixture.recommendation_linkage.recommendation_created_at,
      );
      expect(Date.parse(fixture.context.captured_at)).toBeLessThanOrEqual(
        recommendationAt,
      );
      expect(Date.parse(fixture.effective_at)).toBeLessThanOrEqual(
        recommendationAt,
      );
      expect(fixture.anti_leakage_status).toBe("passed");
      for (const excluded of fixture.excluded_future_context) {
        expect(excluded.included_in_snapshot_context).toBe(false);
        expect(Date.parse(excluded.effective_at)).toBeGreaterThan(
          recommendationAt,
        );
      }
    }
  });

  test("missing-data provenance completeness and malformed boundaries remain explicit", () => {
    expect(doc).toContain(
      "`present`, `explicit_null`, `unknown`, and `unavailable`",
    );
    expect(doc).toContain(
      "complete, partial, low-quality, conflicting, stale, and unavailable",
    );
    expect(doc).toContain("Row completeness and provenance completeness");
    expect(validateLearningDatasetStaticFixtureSet()).toEqual({
      ok: true,
      errors: [],
    });
    expect(validateIntelligenceContextStaticFixtureSet()).toEqual({
      ok: true,
      errors: [],
    });
    expect(validatePatternInsightStaticFixtureSet()).toEqual({
      ok: true,
      errors: [],
    });
    expect(
      getMalformedLearningDatasetStaticFixtureCases().every(
        (item) => item.expected_validation_status === "invalid",
      ),
    ).toBe(true);
    expect(
      getMalformedIntelligenceContextStaticFixtureCases().every(
        (item) => item.expected_validation_status === "invalid",
      ),
    ).toBe(true);
    expect(
      getMalformedPatternInsightStaticFixtureCases().every(
        (item) => item.expected_validation_status === "invalid",
      ),
    ).toBe(true);
  });

  test("fixture determinism compatibility evidence and Pattern Insight distinction remain intact", () => {
    const learningFirst = getLearningDatasetStaticFixtures();
    const learningSecond = getLearningDatasetStaticFixtures();
    const contextFirst = getIntelligenceContextStaticFixtures();
    const contextSecond = getIntelligenceContextStaticFixtures();
    const patternFirst = getPatternInsightStaticFixtures();
    const patternSecond = getPatternInsightStaticFixtures();

    expect(learningFirst).toEqual(learningSecond);
    expect(contextFirst).toEqual(contextSecond);
    expect(patternFirst).toEqual(patternSecond);
    expect(learningFirst).not.toBe(learningSecond);
    expect(contextFirst).not.toBe(contextSecond);
    expect(patternFirst).not.toBe(patternSecond);
    expect(doc).toContain("Action 383 is green");
    expect(doc).toContain("Action 385 is green");
    expect(doc).toContain("synthetic output-contract examples");
    expect(doc).toContain("not discovered, inferred, calculated");
  });

  test("peer-group is an unsupported optional fixture-only gap", () => {
    expect(doc).toContain("Peer-group: `unsupported_optional`");
    expect(doc).toContain("fixture-only expected peer labels");
    expect(doc).toContain("must not be inferred from sector/industry");
    expect(doc).toContain("requires a separate extension gate");

    const learningSource = readFileSync(
      join(process.cwd(), "lib/learning-dataset-static-fixtures.ts"),
      "utf8",
    );
    const patternSource = readFileSync(
      join(process.cwd(), "lib/pattern-insight-static-fixtures.ts"),
      "utf8",
    );
    expect(learningSource).not.toContain("peer_group:");
    expect(patternSource).not.toContain("peer_group:");
  });

  test("mapper purity boundary and illustrative error states stay review-only", () => {
    for (const quality of [
      "side-effect-free",
      "environment-independent",
      "filesystem-independent",
      "network-independent",
      "provider-independent",
      "Supabase-independent",
      "persistence-independent",
      "clock-independent",
      "random-independent",
    ]) {
      expect(doc).toContain(quality);
    }
    for (const state of [
      "mapped_with_missing_optional_data",
      "blocked_missing_required_identity",
      "blocked_invalid_linkage",
      "blocked_temporal_violation",
      "blocked_future_leakage",
      "blocked_invalid_provenance",
      "blocked_invalid_outcome",
    ]) {
      expect(doc).toContain(state);
    }
    expect(doc).toContain("These names are not production vocabulary");
  });

  test("no production mapper compatibility schema runtime or persistence surface was introduced", () => {
    const libFiles = readdirSync(join(process.cwd(), "lib"));
    expect(
      libFiles.some((name) =>
        /snapshot-to-learning-dataset-mapper|learning-row-mapper/.test(name),
      ),
    ).toBe(false);
    expect(
      libFiles.some((name) =>
        /context-to-learning-dataset-compatibility|learning-dataset-to-pattern-insight/.test(
          name,
        ),
      ),
    ).toBe(false);
    expect(existsSync(join(process.cwd(), "app/api/action-386"))).toBe(false);
    expect(doc).toContain("No-Runtime Review");
    expect(doc).toContain("No-Persistence Review");
  });

  test("Action 386 verifier succeeds with no effects", () => {
    const output = runVerifier(verifierPath);
    const parsed = JSON.parse(output);

    expect(parsed.verification_status).toBe("passed");
    expect(parsed.readiness_decision).toBe("ready_with_conditions");
    expect(parsed.passed_conditions_count).toBe(16);
    expect(parsed.failed_conditions_count).toBe(0);
    expect(parsed.unresolved_conditions_count).toBe(2);
    expect(parsed.production_mapper_found).toBe(false);
    expect(parsed.production_compatibility_schema_found).toBe(false);
    expect(parsed.mapper_implementation_approved).toBe(false);
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
    expect(output).not.toContain("AUTOMATION_SECRET");
    expect(output).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  test("Actions 352 357 380 381 383 and 385 remain healthy", () => {
    for (const verifier of [
      "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
      "scripts/action-357-pattern-insight-static-fixture-implementation-verify.mjs",
      "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
      "scripts/action-381-intelligence-context-static-fixture-implementation-verify.mjs",
      "scripts/action-383-intelligence-context-to-learning-dataset-static-compatibility-tests-verify.mjs",
      "scripts/action-385-learning-dataset-to-pattern-insight-static-evidence-compatibility-tests-verify.mjs",
    ]) {
      expect(JSON.parse(runVerifier(verifier)).verification_status).toBe(
        "passed",
      );
    }
  });

  test("runtime preview candidate fixtures and deployment surfaces remain untouched", () => {
    const status = execFileSync(
      "git",
      ["status", "--short", "--untracked-files=all"],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    const action386Lines = status
      .split("\n")
      .filter((line) => line.includes("action-386"));

    expect(action386Lines.some((line) => line.includes("lib/"))).toBe(false);
    expect(action386Lines.some((line) => line.includes("app/"))).toBe(false);
    expect(action386Lines.some((line) => line.includes("supabase/"))).toBe(
      false,
    );
    expect(action386Lines.some((line) => line.includes("proxy.ts"))).toBe(
      false,
    );
    expect(action386Lines.some((line) => line.includes("netlify.toml"))).toBe(
      false,
    );
    expect(action386Lines.some((line) => line.includes("action-370"))).toBe(
      false,
    );
    expect(doc).toContain(
      "runtime_preview_status: runtime_preview_waiting_for_operator_inputs",
    );
  });
});
