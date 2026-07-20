import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import { getLearningDatasetStaticFixtureById, type Action335LearningDatasetRow } from "@/lib/learning-dataset-static-fixtures";
import { discoverPatterns, type FrozenPatternDiscoveryConfiguration, type PatternDiscoveryRowEnvelope } from "@/lib/pure-pattern-discovery";

type Mutable<T> = T extends readonly (infer Item)[]
  ? Mutable<Item>[]
  : T extends object
    ? { -readonly [Key in keyof T]: Mutable<T[Key]> }
    : T;
type MutableLearningDatasetRow = Mutable<Action335LearningDatasetRow>;
type MutablePatternDiscoveryRowEnvelope = Omit<Mutable<PatternDiscoveryRowEnvelope>, "row"> & {
  row: MutableLearningDatasetRow;
};

const hashes = {
  mapper_sha256: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  learning_fixture_sha256: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  context_fixture_sha256: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  pattern_fixture_sha256: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
} as const;
const config: FrozenPatternDiscoveryConfiguration = {
  contract_version: "pure_pattern_discovery_contract_v1", configuration_version: "pattern_discovery_setup_family_v1",
  grouping_dimension: "setup_family", allowed_setup_families: ["momentum_continuation"], horizon: "60m",
  minimum_total_support: 20, minimum_completed_outcomes: 20, numeric_scale: 1000000, output_decimal_places: 4,
  rounding_mode: "half_away_from_zero", evidence_unit: "action_400_case_lineage", group_key_schema: "pattern_group:v1",
  static_only: true, non_authoritative: true, no_persistence: true, no_replay: true, no_runtime: true, no_feedback: true,
};
function canonical(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") { if (!Number.isFinite(value)) throw new Error("non-finite"); return Object.is(value, -0) ? 0 : value; }
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, child]) => [key, canonical(child)]));
  throw new Error("unsupported");
}
const sha = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
function deepFreeze<T>(value: T): T { if (value && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value as Record<string, unknown>).forEach(deepFreeze); } return value; }
function envelope(caseId: string, outcome: Action335LearningDatasetRow["outcome_fields"]["outcome_status"] = "target_hit", sharedId?: string, metrics: { gross?: number | null; best?: number | null; worst?: number | null } = {}): PatternDiscoveryRowEnvelope {
  const fixture = getLearningDatasetStaticFixtureById("learning_row:v1:001:complete");
  if (!fixture) throw new Error("fixture missing");
  const row = clone(fixture) as MutableLearningDatasetRow;
  const mapperRowId = sharedId ?? `learning_row:test:${caseId}`;
  row.identity.dataset_row_id = mapperRowId;
  row.identity.learning_row_key = `learning_key:test:${caseId}`;
  row.identity.recommendation_snapshot_id = `snapshot:test:${caseId}`;
  row.identity.recommendation_id = `recommendation:test:${caseId}`;
  row.identity.context_snapshot_id = `context:test:${caseId}`;
  row.identity.evaluated_outcome_id = `outcome:test:${caseId}`;
  row.context.context_snapshot_id = row.identity.context_snapshot_id;
  row.context.recommendation_snapshot_id = row.identity.recommendation_snapshot_id;
  row.context.recommendation_id = row.identity.recommendation_id;
  row.outcome_fields.recommendation_snapshot_id = row.identity.recommendation_snapshot_id;
  row.outcome_fields.recommendation_id = row.identity.recommendation_id;
  row.outcome_fields.evaluated_outcome_id = row.identity.evaluated_outcome_id;
  row.outcome_fields.outcome_status = outcome;
  row.outcome_fields.gross_r_multiple = metrics.gross === undefined ? 2 : metrics.gross;
  row.outcome_fields.max_favorable_excursion_r = metrics.best === undefined ? 2.25 : metrics.best;
  row.outcome_fields.max_adverse_excursion_r = metrics.worst === undefined ? -0.25 : metrics.worst;
  return { source_case_id: caseId, ...hashes, canonical_mapper_input_sha256: sha({ caseId }), mapper_status: "mapped", mapper_row_id: mapperRowId, canonical_row_sha256: sha(row), consumable: true, static_only: true, non_authoritative: true, no_persistence: true, no_replay: true, no_runtime: true, no_feedback: true, row } as PatternDiscoveryRowEnvelope;
}
function mutate(value: PatternDiscoveryRowEnvelope, apply: (row: MutableLearningDatasetRow) => void): PatternDiscoveryRowEnvelope { const next = clone(value) as MutablePatternDiscoveryRowEnvelope; apply(next.row); next.canonical_row_sha256 = sha(next.row); return next; }
function files(path: string): string[] { if (!existsSync(path)) return []; if (statSync(path).isFile()) return [path]; return readdirSync(path).flatMap((name) => files(join(path, name))).sort(); }

test.describe.serial("Action 404 pure Pattern Discovery implementation", () => {
  test("exports exactly seven types and one synchronous runtime function", async () => {
    const source = readFileSync("lib/pure-pattern-discovery.ts", "utf8");
    expect([...source.matchAll(/^export type (\w+)/gm)].map((match) => match[1])).toEqual(["PatternDiscoveryRowEnvelope", "FrozenPatternDiscoveryConfiguration", "PatternDiscoveryIssue", "PatternDiscoveryWarning", "PatternDiscoveryEvidenceSummary", "PatternDiscoveryGroupResult", "PatternDiscoveryResult"]);
    expect([...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1])).toEqual(["discoverPatterns"]);
    expect(typeof (await import("@/lib/pure-pattern-discovery")).discoverPatterns).toBe("function");
    expect(discoverPatterns({ rows: [envelope("sync")], configuration: config })).not.toBeInstanceOf(Promise);
  });

  test("valid minimal input is grouped exactly and stays insufficient", () => {
    const result = discoverPatterns({ rows: [envelope("valid")], configuration: config });
    expect(result.status).toBe("insufficient_evidence");
    expect(result.groups[0]).toMatchObject({ group_key: "pattern_group:v1|setup_family=momentum_continuation", setup_family: "momentum_continuation", horizon: "60m" });
    expect(result.groups[0].evidence).toMatchObject({ case_support_count: 1, unique_mapper_row_count: 1, completed_outcome_count: 1, positive_count: 1, negative_count: 0, neutral_count: 0 });
    expect(result.insights).toEqual([]);
  });

  test("invalid input configuration grouping dimension and hidden defaults fail closed", () => {
    expect(discoverPatterns(null as never).status).toBe("blocked_invalid_input");
    expect(discoverPatterns({ rows: [envelope("bad-config")], configuration: { ...config, minimum_total_support: 19 } as never }).status).toBe("blocked_invalid_configuration");
    expect(discoverPatterns({ rows: [envelope("bad-group")], configuration: { ...config, grouping_dimension: "ticker" } as never }).status).toBe("blocked_invalid_configuration");
    const missing: Record<string, unknown> = { ...clone(config) }; delete missing.numeric_scale;
    expect(discoverPatterns({ rows: [envelope("missing-default")], configuration: missing as never }).status).toBe("blocked_invalid_configuration");
  });

  test("mapper status missing row and non-consumable rows block in phase five", () => {
    const status = { ...envelope("bad-status"), mapper_status: "mapped_with_missing_optional_data" };
    expect(discoverPatterns({ rows: [status as never], configuration: config }).issues[0].code).toBe("ineligible_mapper_status");
    const noRow = { ...envelope("no-row"), row: null };
    expect(discoverPatterns({ rows: [noRow as never], configuration: config }).issues[0].code).toBe("missing_row");
    const noConsume = { ...envelope("no-consume"), consumable: false };
    expect(discoverPatterns({ rows: [noConsume as never], configuration: config }).issues[0].code).toBe("non_consumable_row");
  });

  test("lineage validation rejects malformed hashes changed rows and duplicate sources", () => {
    expect(discoverPatterns({ rows: [{ ...envelope("bad-hash"), mapper_sha256: "bad" } as never], configuration: config }).status).toBe("blocked_invalid_lineage");
    const changed = clone(envelope("changed")) as MutablePatternDiscoveryRowEnvelope; changed.row.identity.ticker = "CHANGED";
    expect(discoverPatterns({ rows: [changed], configuration: config }).status).toBe("blocked_invalid_lineage");
    const duplicated = envelope("same-source");
    expect(discoverPatterns({ rows: [duplicated, duplicated], configuration: config }).issues.every((item) => item.code === "duplicate_source_case_id")).toBe(true);
  });

  test("failed or unknown leakage and invalid setup or outcome are blocked", () => {
    for (const value of ["failed", "unknown"]) expect(discoverPatterns({ rows: [mutate(envelope(`leak-${value}`), (row) => { Object.assign(row, { anti_leakage_status: value }); })], configuration: config }).status).toBe("blocked_future_leakage");
    expect(discoverPatterns({ rows: [mutate(envelope("setup"), (row) => { Object.assign(row.setup_and_confidence, { setup_family: "Momentum_Continuation" }); })], configuration: config }).issues[0].code).toBe("invalid_grouping_literal");
    expect(discoverPatterns({ rows: [mutate(envelope("outcome"), (row) => { Object.assign(row.outcome_fields, { availability: "incomplete" }); })], configuration: config }).issues[0].code).toBe("invalid_outcome");
  });

  test("non-finite unscalable and out-of-range numeric values block at numeric validation", () => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, 0.0000001, 1000001]) { const next = clone(envelope(`numeric-${String(value)}`)) as MutablePatternDiscoveryRowEnvelope; next.row.outcome_fields.gross_r_multiple = value; next.canonical_row_sha256 = Number.isFinite(value) ? sha(next.row) : "0".repeat(64); expect(discoverPatterns({ rows: [next], configuration: config }).issues[0].code).toBe("non_finite_numeric"); }
  });

  test("duplicates preserve case support while unique mapper row count stays distinct", () => {
    const result = discoverPatterns({ rows: [envelope("a", "target_hit", "learning_row:test:shared"), envelope("b", "target_hit", "learning_row:test:shared")], configuration: config });
    expect(result.groups[0].evidence).toMatchObject({ case_support_count: 2, unique_mapper_row_count: 1, completed_outcome_count: 2 });
    expect(result.warnings.filter((item) => item.code === "duplicate_mapper_row_identity")).toHaveLength(1);
  });

  test("positive negative neutral mixed and support status are exact", () => {
    const mixed = discoverPatterns({ rows: [envelope("positive"), envelope("negative", "stop_hit"), envelope("neutral-open", "open_at_window_end"), envelope("neutral-no-entry", "no_entry_triggered")], configuration: config });
    expect(mixed.groups[0].evidence).toMatchObject({ positive_count: 1, negative_count: 1, neutral_count: 2, effect_direction: "mixed" });
    const nineteen = Array.from({ length: 19 }, (_, index) => envelope(`support-${String(index).padStart(2, "0")}`));
    expect(discoverPatterns({ rows: nineteen, configuration: config }).status).toBe("insufficient_evidence");
    const twenty = discoverPatterns({ rows: [...nineteen, envelope("support-19")], configuration: config });
    expect(twenty.status).toBe("discovered"); expect(twenty.insights).toHaveLength(1);
  });

  test("sufficient evidence with a duplicate warning is discovered_with_warnings", () => {
    const rows = Array.from({ length: 20 }, (_, index) => envelope(`warning-${String(index).padStart(2, "0")}`, "target_hit", index < 2 ? "learning_row:test:shared" : undefined));
    expect(discoverPatterns({ rows, configuration: config }).status).toBe("discovered_with_warnings");
  });

  test("scaled integer averages medians rounding signed zero and null metrics are deterministic", () => {
    const rounded = discoverPatterns({ rows: [envelope("round-a", "target_hit", undefined, { gross: 1.23445 }), envelope("round-b", "target_hit", undefined, { gross: -1.23445 })], configuration: config });
    expect(rounded.groups[0].evidence.average_gross_r_multiple).toBe("0.0000");
    expect(rounded.groups[0].evidence.median_gross_r_multiple).toBe("0.0000");
    const unavailable = discoverPatterns({ rows: [envelope("null", "target_hit", undefined, { gross: null, best: null, worst: null })], configuration: config });
    expect(unavailable.groups[0].evidence.average_gross_r_multiple).toBeNull();
    expect(unavailable.warnings.filter((item) => item.code === "metric_value_unavailable")).toHaveLength(3);
  });

  test("deterministic evidence group insight result hashes and reordered input match", () => {
    const rows = Array.from({ length: 20 }, (_, index) => envelope(`hash-${String(index).padStart(2, "0")}`));
    const first = discoverPatterns({ rows, configuration: config });
    const second = discoverPatterns({ rows: [...rows].reverse(), configuration: config });
    expect(second).toEqual(first);
    expect(first.groups[0].evidence_set_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(first.groups[0].group_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(first.groups[0].insight_id).toMatch(/^pattern_insight:v1:[a-f0-9]{64}$/);
  });

  test("input and nested values remain immutable across repeated and interleaved calls", () => {
    const input = deepFreeze({ rows: [envelope("immutable")], configuration: clone(config) });
    const before = JSON.stringify(input); const first = discoverPatterns(input);
    discoverPatterns({ rows: [envelope("interleaved", "stop_hit")], configuration: config });
    expect(discoverPatterns(input)).toEqual(first); expect(JSON.stringify(input)).toBe(before);
  });

  test("no runner manifest runtime consumer or forbidden source access exists", () => {
    const source = readFileSync("lib/pure-pattern-discovery.ts", "utf8");
    expect(source).not.toMatch(/process\.env|Date\.now|Math\.random|fetch\(|console\.|from ["'](?:node:)?fs|@supabase/i);
    expect([...files("scripts"), ...files("docs")].filter((path) => !path.includes("implementation") && /action-404.*(?:run|manifest|shadow)/i.test(path))).toEqual([]);
    expect(files("app").some((path) => path.includes("pure-pattern-discovery") || path.includes("action-404"))).toBe(false);
  });

  test("verifier and Action 402/403 historical gates pass with runtime preview paused", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-404-pure-pattern-discovery-implementation-verify.mjs"], { encoding: "utf8" }));
    expect(report.verification_status).toBe("passed"); expect(report.implementation_status).toBe("implemented_static_pure_not_shadowed");
    for (const path of ["scripts/action-402-pure-pattern-discovery-contract-and-mapped-only-downstream-static-shadow-approval-gate-verify.mjs", "scripts/action-403-pure-pattern-discovery-implementation-approval-gate-verify.mjs"]) expect(JSON.parse(execFileSync("node", [path], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(readFileSync("docs/action-404-pure-pattern-discovery-implementation.md", "utf8")).toContain("runtime_preview_waiting_for_operator_inputs");
  });
});
