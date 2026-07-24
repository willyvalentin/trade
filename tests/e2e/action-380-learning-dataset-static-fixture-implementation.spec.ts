import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import {
  ACTION_335_LEARNING_DATASET_CONTRACT_REFERENCE,
  ACTION_336_INTELLIGENCE_CONTEXT_CONTRACT_REFERENCE,
  ACTION_352_LEARNING_DATASET_LINKAGE_REFERENCE,
  LEARNING_DATASET_STATIC_FIXTURE_SCHEMA_VERSION,
  getLearningDatasetStaticFixtureById,
  getLearningDatasetStaticFixtures,
  getMalformedLearningDatasetStaticFixtureCases,
  serializeLearningDatasetStaticFixtures,
  validateLearningDatasetStaticFixtureSet,
} from "../../lib/learning-dataset-static-fixtures";

const fixturePath = join(process.cwd(), "lib/learning-dataset-static-fixtures.ts");
const docPath = join(process.cwd(), "docs/action-380-learning-dataset-static-fixture-implementation.md");
const verifierPath = join(process.cwd(), "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs");

function runVerifier(path: string) {
  return execFileSync("node", [path], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      AUTOMATION_SECRET: "automation-secret-that-must-not-appear",
      TWELVE_DATA_API_KEY: "provider-secret-that-must-not-appear",
      SUPABASE_SERVICE_ROLE_KEY: "supabase-secret-that-must-not-appear",
      NEWS_API_KEY: "news-secret-that-must-not-appear",
    },
  });
}

test("Action 380 static fixture package exists and documents its approved boundary", () => {
  expect(existsSync(fixturePath)).toBe(true);
  expect(existsSync(docPath)).toBe(true);
  expect(existsSync(verifierPath)).toBe(true);

  const doc = readFileSync(docPath, "utf8");
  expect(doc).toContain("implementation_status: learning_dataset_static_fixtures_implemented");
  expect(doc).toContain("mapper_implementation_status: blocked");
  expect(doc).toContain("runtime_preview_status: runtime_preview_waiting_for_operator_inputs");
  expect(doc).toContain("no inference");
  expect(doc).toContain("no runtime");
});

test("authoritative dataset context linkage and replay types are reused", () => {
  expect(ACTION_335_LEARNING_DATASET_CONTRACT_REFERENCE).toBe(
    "docs/action-335-learning-outcome-dataset-design.md",
  );
  expect(ACTION_336_INTELLIGENCE_CONTEXT_CONTRACT_REFERENCE).toBe(
    "docs/action-336-intelligence-context-schema-draft.md",
  );
  expect(ACTION_352_LEARNING_DATASET_LINKAGE_REFERENCE).toBe(
    "docs/action-352-snapshot-to-learning-dataset-mapper-plan.md",
  );
  expect(LEARNING_DATASET_STATIC_FIXTURE_SCHEMA_VERSION).toBe(
    "learning_dataset_static_fixture_v1",
  );

  const source = readFileSync(fixturePath, "utf8");
  expect(source).toContain("ReplayWithSignalPackageDirection");
  expect(source).toContain("ReplayWithSignalPackageOutcomeStatus");
  expect(source).not.toMatch(/interface\s+LearningDataset/);
  expect(source).not.toContain("FixtureOnlyLearningDatasetRow");
});

test("valid fixtures cover all required families", () => {
  const fixtures = getLearningDatasetStaticFixtures();
  const families = fixtures.flatMap((fixture) => fixture.fixture_family_tags);

  expect(fixtures).toHaveLength(13);
  for (const family of [
    "complete_valid_learning_row",
    "complete_rich_intelligence_context",
    "missing_optional_context",
    "partial_market_context",
    "absent_news_context",
    "absent_event_context",
    "incomplete_outcome",
    "no_outcome_yet_state",
    "unknown_categorical_value",
    "unavailable_source",
    "partial_provenance",
    "low_provenance_completeness",
    "explicit_null_semantics",
    "valid_identity_linkage",
  ]) {
    expect(families).toContain(family);
  }
});

test("fixture IDs timestamps ordering and serialization are deterministic", () => {
  const first = getLearningDatasetStaticFixtures();
  const second = getLearningDatasetStaticFixtures();
  const ids = first.map((fixture) => fixture.identity.dataset_row_id);

  expect(new Set(ids).size).toBe(ids.length);
  expect([...ids].sort()).toEqual(ids);
  expect(first).toEqual(second);
  expect(first).not.toBe(second);
  expect(first[0]).not.toBe(second[0]);
  expect(serializeLearningDatasetStaticFixtures()).toBe(
    serializeLearningDatasetStaticFixtures(),
  );

  for (const fixture of first) {
    expect(fixture.snapshot_time_inputs.recommendation_created_at).toBe(
      "2026-07-08T13:45:00.000Z",
    );
    expect(fixture.context.captured_at).toBe("2026-07-08T13:44:30.000Z");
  }
});

test("deterministic retrieval returns defensive clones", () => {
  const fixture = getLearningDatasetStaticFixtures()[0];
  const first = getLearningDatasetStaticFixtureById(fixture.identity.dataset_row_id);
  const second = getLearningDatasetStaticFixtureById(fixture.identity.dataset_row_id);

  expect(first).toEqual(fixture);
  expect(first).toEqual(second);
  expect(first).not.toBe(second);
  expect(getLearningDatasetStaticFixtureById("missing")).toBeNull();
});

test("missing context outcome and provenance semantics remain explicit", () => {
  const fixtures = getLearningDatasetStaticFixtures();
  const byFamily = (family: string) =>
    fixtures.find((fixture) => fixture.fixture_family_tags.includes(family));

  expect(byFamily("missing_optional_context")?.context.sector_industry.industry).toEqual({
    state: "unavailable",
    value: null,
  });
  expect(byFamily("partial_market_context")?.context.market.market_regime.value).toBe(
    "bullish",
  );
  expect(byFamily("no_outcome_yet_state")?.outcome_fields).toMatchObject({
    availability: "not_yet_available",
    evaluated_outcome_id: null,
    evaluated_at: null,
    outcome_status: "not_yet_available",
  });
  expect(byFamily("incomplete_outcome")?.outcome_fields.availability).toBe("incomplete");
  expect(byFamily("unknown_categorical_value")?.setup_and_confidence.tier).toBe("unknown");
  expect(byFamily("unavailable_source")?.data_provenance.state).toBe("unavailable");
  expect(byFamily("partial_provenance")?.data_provenance.state).toBe("partial");
  expect(byFamily("low_provenance_completeness")?.data_provenance.completeness_score).toBe(0.2);
  expect(byFamily("explicit_null_semantics")?.context.sector_industry.industry).toEqual({
    state: "explicit_null",
    value: null,
  });
});

test("identity linkage temporal ordering and anti-leakage validation pass", () => {
  expect(validateLearningDatasetStaticFixtureSet()).toEqual({ ok: true, errors: [] });

  for (const fixture of getLearningDatasetStaticFixtures()) {
    expect(fixture.context.context_snapshot_id).toBe(fixture.identity.context_snapshot_id);
    expect(fixture.context.recommendation_snapshot_id).toBe(
      fixture.identity.recommendation_snapshot_id,
    );
    expect(fixture.outcome_fields.recommendation_snapshot_id).toBe(
      fixture.identity.recommendation_snapshot_id,
    );
    expect(Date.parse(fixture.context.captured_at)).toBeLessThanOrEqual(
      Date.parse(fixture.snapshot_time_inputs.recommendation_created_at),
    );
    if (fixture.outcome_fields.evaluated_at) {
      expect(Date.parse(fixture.outcome_fields.evaluated_at)).toBeGreaterThanOrEqual(
        Date.parse(fixture.snapshot_time_inputs.recommendation_created_at),
      );
    }
    expect(fixture.anti_leakage_status).toBe("passed");
    expect(JSON.stringify(fixture.snapshot_time_inputs)).not.toMatch(
      /target_hit|stop_hit|gross_r_multiple|outcome_status/,
    );
  }
});

test("malformed cases are raw isolated payloads outside valid fixtures", () => {
  const malformed = getMalformedLearningDatasetStaticFixtureCases();
  const reasons = malformed.map((item) => item.reason);

  expect(malformed).toHaveLength(14);
  expect(getLearningDatasetStaticFixtures().some((row) => row.identity.dataset_row_id.startsWith("malformed:"))).toBe(false);
  for (const reason of [
    "missing_required_identity",
    "conflicting_identity_linkage",
    "invalid_recommendation_context_relationship",
    "invalid_temporal_ordering",
    "context_after_prohibited_boundary",
    "outcome_leaked_into_snapshot_fields",
    "outcome_before_recommendation",
    "unsupported_categorical_value",
    "malformed_provenance",
    "non_finite_numeric_metric",
    "invalid_completeness_bounds",
    "duplicate_row_identity",
    "unstable_timestamp_attempt",
    "random_identity_attempt",
  ]) {
    expect(reasons).toContain(reason);
  }
});

test("fixture source has no mapper inference aggregation runtime or external access", () => {
  const source = readFileSync(fixturePath, "utf8");
  for (const forbidden of [
    "process.env",
    "fetch(",
    "Date.now",
    "new Date",
    "Math.random",
    "randomUUID",
    "@supabase",
    "supabase-js",
    "next/server",
    "writeFile",
    "readFile",
    "mapSnapshotToLearningDataset",
    "aggregateLearning",
    "rankLearning",
    "inferMissing",
  ]) {
    expect(source).not.toContain(forbidden);
  }
});

test("Action 380 verifier passes without exposing secrets or runtime effects", () => {
  const output = runVerifier(
    "scripts/action-380-learning-dataset-static-fixture-implementation-verify.mjs",
  );
  const parsed = JSON.parse(output);

  expect(parsed.verification_status).toBe("passed");
  expect(parsed.valid_fixture_count).toBe(13);
  expect(parsed.malformed_case_count).toBe(14);
  expect(parsed.authoritative_contracts_reused).toBe(true);
  expect(parsed.runtime_preview_status).toBe("runtime_preview_waiting_for_operator_inputs");
  expect(parsed.mapper_implementation_allowed).toBe(false);
  expect(parsed.no_effect_flags).toEqual({
    provider_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    confidence_behavior_changed: false,
  });
  expect(output).not.toContain("automation-secret-that-must-not-appear");
  expect(output).not.toContain("provider-secret-that-must-not-appear");
  expect(output).not.toContain("supabase-secret-that-must-not-appear");
  expect(output).not.toContain("news-secret-that-must-not-appear");
});

test("upstream learning contract verifiers remain healthy", () => {
  for (const verifier of [
    "scripts/action-334-recommendation-snapshot-completeness-audit-verify.mjs",
    "scripts/action-335-learning-outcome-dataset-design-verify.mjs",
    "scripts/action-340-snapshot-field-inventory-against-existing-schema-verify.mjs",
    "scripts/action-346-existing-schema-compatibility-matrix-verify.mjs",
    "scripts/action-347-learning-dataset-static-fixture-implementation-plan-verify.mjs",
    "scripts/action-352-snapshot-to-learning-dataset-mapper-plan-verify.mjs",
    "scripts/action-353-learning-dataset-static-fixture-implementation-approval-gate-verify.mjs",
  ]) {
    expect(JSON.parse(runVerifier(verifier)).verification_status).toBe("passed");
  }
});

test("Action 380 changes do not include runtime preview routes or immutable candidate artifacts", () => {
  const status = execFileSync("git", ["status", "--short", "--untracked-files=all"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  const action380Lines = status
    .split("\n")
    .filter((line) => line.includes("action-380") || line.includes("learning-dataset-static-fixtures"));

  expect(action380Lines.some((line) => line.includes("app/"))).toBe(false);
  expect(action380Lines.some((line) => line.includes("netlify.toml"))).toBe(false);
  expect(action380Lines.some((line) => line.includes("proxy.ts"))).toBe(false);
  expect(action380Lines.some((line) => line.includes("action-370-preview-deployment-input-manifest"))).toBe(false);
});
