/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

import { expect, test } from "@playwright/test";

import { getLearningDatasetStaticFixtureById } from "@/lib/learning-dataset-static-fixtures";
import { discoverPatterns, type FrozenPatternDiscoveryConfiguration, type PatternDiscoveryRowEnvelope } from "@/lib/pure-pattern-discovery";

const protectedHashes = {
  mapper_sha256: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  learning_fixture_sha256: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  context_fixture_sha256: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  pattern_fixture_sha256: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
} as const;
const fileHashes = {
  "lib/pure-pattern-discovery.ts": "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  "lib/snapshot-to-learning-dataset-mapper.ts": protectedHashes.mapper_sha256,
  "lib/learning-dataset-static-fixtures.ts": protectedHashes.learning_fixture_sha256,
  "lib/intelligence-context-static-fixtures.ts": protectedHashes.context_fixture_sha256,
  "lib/pattern-insight-static-fixtures.ts": protectedHashes.pattern_fixture_sha256,
  "scripts/action-400-expanded-static-mapper-shadow-run.mjs": "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  "docs/action-400-expanded-static-mapper-shadow-input-manifest.json": "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const config: FrozenPatternDiscoveryConfiguration = {
  contract_version: "pure_pattern_discovery_contract_v1",
  configuration_version: "pattern_discovery_setup_family_v1",
  grouping_dimension: "setup_family",
  allowed_setup_families: ["momentum_continuation"],
  horizon: "60m",
  minimum_total_support: 20,
  minimum_completed_outcomes: 20,
  numeric_scale: 1000000,
  output_decimal_places: 4,
  rounding_mode: "half_away_from_zero",
  evidence_unit: "action_400_case_lineage",
  group_key_schema: "pattern_group:v1",
  static_only: true,
  non_authoritative: true,
  no_persistence: true,
  no_replay: true,
  no_runtime: true,
  no_feedback: true,
};
const typeExports = ["PatternDiscoveryRowEnvelope", "FrozenPatternDiscoveryConfiguration", "PatternDiscoveryIssue", "PatternDiscoveryWarning", "PatternDiscoveryEvidenceSummary", "PatternDiscoveryGroupResult", "PatternDiscoveryResult"];
const statuses = ["discovered", "discovered_with_warnings", "insufficient_evidence", "blocked_invalid_input", "blocked_invalid_configuration", "blocked_invalid_lineage", "blocked_future_leakage", "blocked_non_consumable_row", "blocked_nondeterministic_grouping"];

function canonical(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("non-finite");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, child]) => [key, canonical(child)]));
  }
  throw new Error("unsupported");
}
const shaValue = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value)), "utf8").digest("hex");
const shaFile = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
function files(path: string): string[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((name) => files(join(path, name))).sort();
}
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value as Record<string, unknown>).forEach(deepFreeze);
  }
  return value;
}
function envelope(caseId: string, outcome = "target_hit", sharedId?: string, metrics: { gross?: number | null; best?: number | null; worst?: number | null } = {}): PatternDiscoveryRowEnvelope {
  const fixture = getLearningDatasetStaticFixtureById("learning_row:v1:001:complete");
  if (!fixture) throw new Error("fixture missing");
  const row = clone(fixture) as any;
  const mapperRowId = sharedId ?? `learning_row:action405:${caseId}`;
  row.identity.dataset_row_id = mapperRowId;
  row.identity.learning_row_key = `learning_key:action405:${caseId}`;
  row.identity.recommendation_snapshot_id = `snapshot:action405:${caseId}`;
  row.identity.recommendation_id = `recommendation:action405:${caseId}`;
  row.identity.context_snapshot_id = `context:action405:${caseId}`;
  row.identity.evaluated_outcome_id = `outcome:action405:${caseId}`;
  row.context.context_snapshot_id = row.identity.context_snapshot_id;
  row.context.recommendation_snapshot_id = row.identity.recommendation_snapshot_id;
  row.context.recommendation_id = row.identity.recommendation_id;
  row.outcome_fields.recommendation_snapshot_id = row.identity.recommendation_snapshot_id;
  row.outcome_fields.recommendation_id = row.identity.recommendation_id;
  row.outcome_fields.evaluated_outcome_id = row.identity.evaluated_outcome_id;
  row.outcome_fields.availability = "complete";
  row.outcome_fields.outcome_window = "60m";
  row.outcome_fields.outcome_status = outcome;
  row.outcome_fields.gross_r_multiple = metrics.gross === undefined ? 1.5 : metrics.gross;
  row.outcome_fields.max_favorable_excursion_r = metrics.best === undefined ? 1.75 : metrics.best;
  row.outcome_fields.max_adverse_excursion_r = metrics.worst === undefined ? -0.25 : metrics.worst;
  row.anti_leakage_status = "passed";
  row.setup_and_confidence.setup_family = "momentum_continuation";
  return {
    source_case_id: caseId,
    ...protectedHashes,
    canonical_mapper_input_sha256: shaValue({ source_case_id: caseId }),
    mapper_status: "mapped",
    mapper_row_id: mapperRowId,
    canonical_row_sha256: shaValue(row),
    consumable: true,
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    row,
  } as PatternDiscoveryRowEnvelope;
}
function mutateEnvelope(value: PatternDiscoveryRowEnvelope, apply: (next: any) => void): PatternDiscoveryRowEnvelope {
  const next = clone(value) as any;
  apply(next);
  if (next.row && Number.isFinite(next.row.outcome_fields?.gross_r_multiple ?? 0)) next.canonical_row_sha256 = shaValue(next.row);
  return next;
}
function resultCodes(result: ReturnType<typeof discoverPatterns>) {
  return result.issues.map((issue) => issue.code);
}

test.describe.serial("Action 405 independent pure Pattern Discovery verification and hash audit", () => {
  test("export inventory and source integrity are frozen", async () => {
    const source = readFileSync("lib/pure-pattern-discovery.ts", "utf8");
    expect([...source.matchAll(/^export function (\w+)/gm)].map((match) => match[1])).toEqual(["discoverPatterns"]);
    expect([...source.matchAll(/^export type (\w+)/gm)].map((match) => match[1])).toEqual(typeExports);
    expect(typeof (await import("@/lib/pure-pattern-discovery")).discoverPatterns).toBe("function");
    expect(discoverPatterns({ rows: [envelope("sync")], configuration: config })).not.toBeInstanceOf(Promise);
    for (const [path, expected] of Object.entries(fileHashes)) expect(shaFile(path), path).toBe(expected);
  });

  test("validation precedence uses the frozen 14-phase first-failure order", () => {
    expect(discoverPatterns(null as never).status).toBe("blocked_invalid_input");
    expect(discoverPatterns({ rows: [mutateEnvelope(envelope("bad-config-row"), (next) => { next.mapper_status = "blocked_lineage"; })], configuration: { ...config, numeric_scale: 1 } as never }).status).toBe("blocked_invalid_configuration");
    expect(resultCodes(discoverPatterns({ rows: [{ ...envelope("bad-envelope"), extra: true } as never], configuration: config }))).toEqual(["invalid_row_envelope"]);
    expect(resultCodes(discoverPatterns({ rows: [mutateEnvelope(envelope("status-before-lineage"), (next) => { next.mapper_status = "mapped_with_missing_optional_data"; next.mapper_sha256 = "bad"; }) as never], configuration: config }))).toEqual(["ineligible_mapper_status"]);
    expect(discoverPatterns({ rows: [mutateEnvelope(envelope("lineage-before-leak"), (next) => { next.mapper_sha256 = "bad"; next.row.anti_leakage_status = "failed"; }) as never], configuration: config }).status).toBe("blocked_invalid_lineage");
    expect(discoverPatterns({ rows: [mutateEnvelope(envelope("leak-before-group"), (next) => { next.row.anti_leakage_status = "failed"; next.row.setup_and_confidence.setup_family = ""; })], configuration: config }).status).toBe("blocked_future_leakage");
    expect(resultCodes(discoverPatterns({ rows: [mutateEnvelope(envelope("group-before-outcome"), (next) => { next.row.setup_and_confidence.setup_family = ""; next.row.outcome_fields.availability = "pending"; })], configuration: config }))).toEqual(["missing_grouping_field"]);
    expect(resultCodes(discoverPatterns({ rows: [mutateEnvelope(envelope("outcome-before-numeric"), (next) => { next.row.outcome_fields.availability = "pending"; next.row.outcome_fields.gross_r_multiple = 1000001; })], configuration: config }))).toEqual(["invalid_outcome"]);
    const numeric = mutateEnvelope(envelope("numeric-before-support"), (next) => { next.row.outcome_fields.gross_r_multiple = 0.0000001; });
    expect(resultCodes(discoverPatterns({ rows: [numeric], configuration: config }))).toEqual(["non_finite_numeric"]);
  });

  test("eligibility bypasses are blocked and no invalid row is silently skipped", () => {
    const variants: Array<[string, (next: any) => void, string]> = [
      ["mapped_with_missing_optional_data", (next) => { next.mapper_status = "mapped_with_missing_optional_data"; }, "ineligible_mapper_status"],
      ["blocked_mapper", (next) => { next.mapper_status = "blocked_invalid_lineage"; }, "ineligible_mapper_status"],
      ["missing_row", (next) => { delete next.row; }, "invalid_row_envelope"],
      ["null_row", (next) => { next.row = null; }, "missing_row"],
      ["consumable_false", (next) => { next.consumable = false; }, "non_consumable_row"],
      ["static_false", (next) => { next.static_only = false; }, "non_consumable_row"],
      ["authoritative_false", (next) => { next.non_authoritative = false; }, "non_consumable_row"],
      ["persistence_false", (next) => { next.no_persistence = false; }, "non_consumable_row"],
      ["replay_false", (next) => { next.no_replay = false; }, "non_consumable_row"],
      ["runtime_false", (next) => { next.no_runtime = false; }, "non_consumable_row"],
      ["feedback_false", (next) => { next.no_feedback = false; }, "non_consumable_row"],
    ];
    for (const [name, apply, code] of variants) {
      const result = discoverPatterns({ rows: [mutateEnvelope(envelope(`elig-${name}`), apply) as never], configuration: config });
      expect(result.issues.some((issue) => issue.code === code), name).toBe(true);
      expect(result.groups).toEqual([]);
    }
    for (const availability of ["pending", "incomplete", "missing"]) {
      const result = discoverPatterns({ rows: [mutateEnvelope(envelope(`out-${String(availability)}`), (next) => { next.row.outcome_fields.availability = availability; })], configuration: config });
      expect(result.issues[0].code).toBe("invalid_outcome");
    }
  });

  test("lineage attacks are blocked while reordered envelope keys stay valid", () => {
    const base = envelope("lineage-base");
    const attacks: Array<[string, (next: any) => void]> = [
      ["wrong_mapper_hash", (next) => { next.mapper_sha256 = "0".repeat(64); }],
      ["malformed_mapper_hash", (next) => { next.mapper_sha256 = "abc"; }],
      ["wrong_fixture_hash", (next) => { next.learning_fixture_sha256 = "0".repeat(64); }],
      ["malformed_fixture_hash", (next) => { next.pattern_fixture_sha256 = "bad"; }],
      ["malformed_input_hash", (next) => { next.canonical_mapper_input_sha256 = "bad"; }],
      ["wrong_row_id", (next) => { next.mapper_row_id = "learning_row:wrong"; }],
      ["mapper_row_id_mismatch", (next) => { next.mapper_row_id = "learning_row:wrong"; }],
    ];
    expect(discoverPatterns({ rows: [mutateEnvelope(envelope("missing-mapper-hash"), (next) => { delete next.mapper_sha256; }) as never], configuration: config }).issues[0].code).toBe("invalid_row_envelope");
    for (const [name, apply] of attacks) {
      expect(discoverPatterns({ rows: [mutateEnvelope(envelope(`lineage-${name}`), apply) as never], configuration: config }).status, name).toBe("blocked_invalid_lineage");
    }
    const wrongHash = { ...envelope("wrong-row-hash"), canonical_row_sha256: "0".repeat(64) };
    const changedContent = clone(envelope("changed-row-content")) as any;
    changedContent.row.identity.ticker = "MSFT";
    expect(discoverPatterns({ rows: [wrongHash], configuration: config }).status).toBe("blocked_invalid_lineage");
    expect(discoverPatterns({ rows: [changedContent], configuration: config }).status).toBe("blocked_invalid_lineage");
    const left = envelope("swap-a");
    const right = envelope("swap-b");
    expect(discoverPatterns({ rows: [{ ...left, canonical_row_sha256: right.canonical_row_sha256 }, { ...right, canonical_row_sha256: left.canonical_row_sha256 }], configuration: config }).status).toBe("blocked_invalid_lineage");
    expect(discoverPatterns({ rows: [base, { ...base, source_case_id: "lineage-base" }], configuration: config }).issues.every((issue) => issue.code === "duplicate_source_case_id")).toBe(true);
    const reordered = { row: base.row, no_runtime: true, no_replay: true, no_persistence: true, no_feedback: true, static_only: true, source_case_id: base.source_case_id, pattern_fixture_sha256: base.pattern_fixture_sha256, non_authoritative: true, mapper_status: "mapped", mapper_sha256: base.mapper_sha256, mapper_row_id: base.mapper_row_id, learning_fixture_sha256: base.learning_fixture_sha256, context_fixture_sha256: base.context_fixture_sha256, consumable: true, canonical_row_sha256: base.canonical_row_sha256, canonical_mapper_input_sha256: base.canonical_mapper_input_sha256 } as PatternDiscoveryRowEnvelope;
    expect(discoverPatterns({ rows: [reordered], configuration: config }).status).toBe("insufficient_evidence");
  });

  test("leakage attacks block before grouping and outcome validation", () => {
    for (const value of ["failed", "unknown", "missing", "contradictory"]) {
      const result = discoverPatterns({ rows: [mutateEnvelope(envelope(`leak-${String(value)}`), (next) => { next.row.anti_leakage_status = value; })], configuration: config });
      expect(result.status).toBe("blocked_future_leakage");
      expect(result.issues).toEqual([{ code: "future_leakage", path: "/rows/0/row/anti_leakage_status", severity: "error", messageKey: "pattern_discovery.future_leakage" }]);
    }
    const leakPlusOutcome = mutateEnvelope(envelope("leak-outcome"), (next) => { next.row.anti_leakage_status = "failed"; next.row.outcome_fields.availability = "pending"; });
    const leakPlusGroup = mutateEnvelope(envelope("leak-group"), (next) => { next.row.anti_leakage_status = "failed"; next.row.setup_and_confidence.setup_family = " Momentum_Continuation "; });
    expect(discoverPatterns({ rows: [leakPlusOutcome], configuration: config }).issues[0].code).toBe("future_leakage");
    expect(discoverPatterns({ rows: [leakPlusGroup], configuration: config }).issues[0].code).toBe("future_leakage");
  });

  test("grouping literal bypasses require exact setup_family only", () => {
    const blockedValues = ["", " momentum_continuation", "momentum_continuation ", "Momentum_Continuation", "momentum continuation", "breakout", "\u00a0momentum_continuation"];
    for (const value of blockedValues) {
      const result = discoverPatterns({ rows: [mutateEnvelope(envelope(`group-${value.length}`), (next) => { next.row.setup_and_confidence.setup_family = value; })], configuration: config });
      expect(["missing_grouping_field", "invalid_grouping_literal"]).toContain(result.issues[0].code);
    }
    expect(discoverPatterns({ rows: [envelope("group-ok")], configuration: config }).groups[0].group_key).toBe("pattern_group:v1|setup_family=momentum_continuation");
    expect(discoverPatterns({ rows: [envelope("group-config")], configuration: { ...config, grouping_dimension: "ticker" } as never }).status).toBe("blocked_invalid_configuration");
  });

  test("duplicate support behavior does not inflate unique mapper IDs", () => {
    const oneUnique = Array.from({ length: 20 }, (_, index) => envelope(`dup-one-${String(index).padStart(2, "0")}`, "target_hit", "learning_row:action405:shared"));
    const twentyUnique = Array.from({ length: 20 }, (_, index) => envelope(`dup-many-${String(index).padStart(2, "0")}`));
    const oneUniqueResult = discoverPatterns({ rows: oneUnique, configuration: config });
    expect(oneUniqueResult.status).toBe("discovered_with_warnings");
    expect(oneUniqueResult.groups[0].evidence.case_support_count).toBe(20);
    expect(oneUniqueResult.groups[0].evidence.unique_mapper_row_count).toBe(1);
    expect(oneUniqueResult.warnings.filter((warning) => warning.code === "duplicate_mapper_row_identity")).toHaveLength(1);
    const twentyUniqueResult = discoverPatterns({ rows: twentyUnique, configuration: config });
    expect(twentyUniqueResult.status).toBe("discovered");
    expect(twentyUniqueResult.groups[0].evidence).toMatchObject({ case_support_count: 20, unique_mapper_row_count: 20, completed_outcome_count: 20 });
    expect(discoverPatterns({ rows: twentyUnique.slice(0, 19), configuration: config }).status).toBe("insufficient_evidence");
  });

  test("outcome classification preserves positive negative neutral and invalid states", () => {
    const mixed = discoverPatterns({ rows: [envelope("out-pos", "target_hit"), envelope("out-neg", "stop_hit"), envelope("out-neutral-a", "open_at_window_end"), envelope("out-neutral-b", "no_entry_triggered")], configuration: config });
    expect(mixed.groups[0].evidence).toMatchObject({ positive_count: 1, negative_count: 1, neutral_count: 2, effect_direction: "mixed" });
    for (const outcome of ["pending", "incomplete", "invalid", "missing"]) {
      const result = discoverPatterns({ rows: [mutateEnvelope(envelope(`bad-out-${String(outcome)}`), (next) => { next.row.outcome_fields.outcome_status = outcome; })], configuration: config });
      expect(result.issues[0].code).toBe("invalid_outcome");
    }
  });

  test("aggregation rounding signed-zero and finite-number boundaries are deterministic", () => {
    const rounded = discoverPatterns({ rows: [envelope("round-a", "target_hit", undefined, { gross: 1.23445, best: 0.00005, worst: -0 }), envelope("round-b", "target_hit", undefined, { gross: -1.23445, best: -0.00005, worst: 0 })], configuration: config });
    expect(rounded.groups[0].evidence.average_gross_r_multiple).toBe("0.0000");
    expect(rounded.groups[0].evidence.median_gross_r_multiple).toBe("0.0000");
    expect(rounded.groups[0].evidence.average_worst_r).toBe("0.0000");
    const unavailable = discoverPatterns({ rows: [envelope("null-metrics", "target_hit", undefined, { gross: null, best: null, worst: null })], configuration: config });
    expect(unavailable.groups[0].evidence.average_gross_r_multiple).toBeNull();
    expect(unavailable.warnings.filter((warning) => warning.code === "metric_value_unavailable")).toHaveLength(3);
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, "1.2", 1000001, 0.0000001]) {
      const row = clone(envelope(`numeric-${String(value).replace(/\W/g, "")}`)) as any;
      row.row.outcome_fields.gross_r_multiple = value;
      row.canonical_row_sha256 = typeof value === "number" && !Number.isFinite(value) ? "0".repeat(64) : shaValue(row.row);
      expect(discoverPatterns({ rows: [row], configuration: config }).issues[0].code, String(value)).toBe("non_finite_numeric");
    }
  });

  test("support thresholds separate case support and completed outcomes", () => {
    const nineteen = Array.from({ length: 19 }, (_, index) => envelope(`support-19-${String(index).padStart(2, "0")}`));
    const twenty = Array.from({ length: 20 }, (_, index) => envelope(`support-20-${String(index).padStart(2, "0")}`));
    expect(discoverPatterns({ rows: nineteen, configuration: config }).status).toBe("insufficient_evidence");
    const sufficient = discoverPatterns({ rows: twenty, configuration: config });
    expect(sufficient.status).toBe("discovered");
    expect(sufficient.insights).toHaveLength(1);
    const withWarning = discoverPatterns({ rows: twenty.map((row, index) => index < 2 ? { ...row, mapper_row_id: "learning_row:action405:duplicate", row: { ...row.row, identity: { ...row.row.identity, dataset_row_id: "learning_row:action405:duplicate" } }, canonical_row_sha256: shaValue({ ...row.row, identity: { ...row.row.identity, dataset_row_id: "learning_row:action405:duplicate" } }) } as PatternDiscoveryRowEnvelope : row), configuration: config });
    expect(withWarning.status).toBe("discovered_with_warnings");
  });

  test("result vocabulary issue and warning contracts are bounded and stable", () => {
    const source = readFileSync("lib/pure-pattern-discovery.ts", "utf8");
    for (const status of statuses) expect(source).toContain(`"${status}"`);
    const invalid = discoverPatterns({ rows: [mutateEnvelope(envelope("contract"), (next) => { next.row.setup_and_confidence.setup_family = "bad"; })], configuration: config });
    expect(invalid.issues[0]).toEqual({ code: "invalid_grouping_literal", path: "/rows/0/row/setup_and_confidence/setup_family", severity: "error", messageKey: "pattern_discovery.invalid_grouping_literal" });
    expect(invalid.issues[0].path).toMatch(/^\/(?:[^/~]|~0|~1|\/)*/);
    expect(JSON.stringify(invalid)).not.toMatch(/bad|Date|secret|token|api/i);
    const duplicate = discoverPatterns({ rows: [envelope("warn-a", "target_hit", "learning_row:action405:warning"), envelope("warn-b", "target_hit", "learning_row:action405:warning")], configuration: config });
    expect(duplicate.warnings.every((warning) => Object.keys(warning).sort().join(",") === "code,messageKey,path,severity")).toBe(true);
  });

  test("independent canonical hashes are stable and material evidence changes alter identity", () => {
    const row = envelope("hash-row");
    const reorderedRow = JSON.parse(JSON.stringify(row.row, Object.keys(row.row as any).sort())) as unknown;
    expect(shaValue(row.row)).toBe(row.canonical_row_sha256);
    expect(shaValue({ ...row.row })).toBe(row.canonical_row_sha256);
    expect(shaValue({ ...(row.row as any), anti_leakage_status: "failed" })).not.toBe(row.canonical_row_sha256);
    expect(reorderedRow).toBeDefined();
    const rows = Array.from({ length: 20 }, (_, index) => envelope(`hash-set-${String(index).padStart(2, "0")}`));
    const result = discoverPatterns({ rows, configuration: config });
    const reversed = discoverPatterns({ rows: [...rows].reverse(), configuration: config });
    expect(reversed).toEqual(result);
    expect(result.groups[0].evidence_set_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.groups[0].group_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.groups[0].insight_id).toMatch(/^pattern_insight:v1:[a-f0-9]{64}$/);
    const changedMapper = rows.map((item, index) => index === 0 ? envelope("hash-set-00-changed") : item);
    expect(discoverPatterns({ rows: changedMapper, configuration: config }).groups[0].evidence_set_sha256).not.toBe(result.groups[0].evidence_set_sha256);
    expect(result.canonical_result_sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test("immutability and repeated interleaved input-order determinism hold", () => {
    const rows = Array.from({ length: 20 }, (_, index) => envelope(`det-${String(index).padStart(2, "0")}`));
    const input = deepFreeze({ rows: clone(rows), configuration: clone(config) });
    const before = JSON.stringify(input);
    const first = discoverPatterns(input);
    const blocked = discoverPatterns({ rows: [mutateEnvelope(envelope("blocked-det"), (next) => { next.row.anti_leakage_status = "failed"; })], configuration: config });
    expect(blocked.status).toBe("blocked_future_leakage");
    expect(discoverPatterns(input)).toEqual(first);
    expect(discoverPatterns({ rows: [...rows].reverse(), configuration: config })).toEqual(first);
    expect(JSON.stringify(input)).toBe(before);
  });

  test("no forbidden imports effects consumers runner manifest shadow or runtime preview changes exist", () => {
    const source = readFileSync("lib/pure-pattern-discovery.ts", "utf8");
    expect(source).not.toMatch(/from ["'](?:node:)?fs|from ["'](?:node:)?http|from ["'](?:node:)?https|fetch\(|process\.env|Date\.now|new Date\(|Math\.random|randomUUID|randomBytes|console\.|@supabase|createClient\(/i);
    const consumers = [...files("app"), ...files("lib")].filter((path) => path !== "lib/pure-pattern-discovery.ts" && /\.(?:ts|tsx|js|mjs)$/.test(path) && (readFileSync(path, "utf8").includes("pure-pattern-discovery") || readFileSync(path, "utf8").includes("discoverPatterns")));
    expect(consumers).toEqual([]);
    const downstream = [...files("scripts"), ...files("docs")].filter((path) => !path.includes("action-405") && /action-40[45].*(?:pattern-discovery.*(?:run|runner|manifest)|downstream.*(?:run|runner|manifest)|shadow.*(?:run|runner|manifest))/i.test(path));
    expect(downstream).toEqual([]);
    expect(readFileSync("docs/action-405-independent-pure-pattern-discovery-verification-and-hash-audit.md", "utf8")).toContain("runtime_preview_waiting_for_operator_inputs");
  });

  test("verifier succeeds and Actions 403-404 remain healthy", () => {
    const report = JSON.parse(execFileSync("node", ["scripts/action-405-independent-pure-pattern-discovery-verification-and-hash-audit-verify.mjs"], { encoding: "utf8" })) as Record<string, any>;
    expect(report.verification_status).toBe("passed");
    expect(report.readiness_decision).toBe("ready_with_conditions");
    expect(report.failed_conditions_count).toBe(0);
    expect(report.production_consumer_files).toEqual([]);
    expect(report.downstream_runner_or_manifest_files).toEqual([]);
    expect(report.no_effect_flags.provider_call_executed).toBe(false);
    expect(JSON.parse(execFileSync("node", ["scripts/action-403-pure-pattern-discovery-implementation-approval-gate-verify.mjs"], { encoding: "utf8" })).verification_status).toBe("passed");
    expect(JSON.parse(execFileSync("node", ["scripts/action-404-pure-pattern-discovery-implementation-verify.mjs"], { encoding: "utf8" })).verification_status).toBe("passed");
  });
});
