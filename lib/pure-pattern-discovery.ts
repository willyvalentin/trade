import { createHash } from "crypto";

import type { Action335LearningDatasetRow } from "@/lib/learning-dataset-static-fixtures";

export type PatternDiscoveryRowEnvelope = Readonly<{
  source_case_id: string;
  mapper_sha256: string;
  learning_fixture_sha256: string;
  context_fixture_sha256: string;
  pattern_fixture_sha256: string;
  canonical_mapper_input_sha256: string;
  mapper_status: "mapped";
  mapper_row_id: string;
  canonical_row_sha256: string;
  consumable: true;
  static_only: true;
  non_authoritative: true;
  no_persistence: true;
  no_replay: true;
  no_runtime: true;
  no_feedback: true;
  row: Action335LearningDatasetRow;
}>;

export type FrozenPatternDiscoveryConfiguration = Readonly<{
  contract_version: "pure_pattern_discovery_contract_v1";
  configuration_version: "pattern_discovery_setup_family_v1";
  grouping_dimension: "setup_family";
  allowed_setup_families: readonly ["momentum_continuation"];
  horizon: "60m";
  minimum_total_support: 20;
  minimum_completed_outcomes: 20;
  numeric_scale: 1000000;
  output_decimal_places: 4;
  rounding_mode: "half_away_from_zero";
  evidence_unit: "action_400_case_lineage";
  group_key_schema: "pattern_group:v1";
  static_only: true;
  non_authoritative: true;
  no_persistence: true;
  no_replay: true;
  no_runtime: true;
  no_feedback: true;
}>;

export type PatternDiscoveryIssue = Readonly<{
  code:
    | "invalid_input_shape"
    | "invalid_configuration_shape"
    | "invalid_batch_declaration"
    | "invalid_row_envelope"
    | "ineligible_mapper_status"
    | "missing_row"
    | "non_consumable_row"
    | "invalid_lineage"
    | "future_leakage"
    | "missing_grouping_field"
    | "invalid_grouping_literal"
    | "invalid_outcome"
    | "non_finite_numeric"
    | "nondeterministic_grouping"
    | "duplicate_source_case_id";
  path: string;
  severity: "error";
  messageKey: `pattern_discovery.${PatternDiscoveryIssue["code"]}`;
}>;

export type PatternDiscoveryWarning = Readonly<{
  code:
    | "minimum_total_support_not_met"
    | "minimum_completed_outcomes_not_met"
    | "duplicate_mapper_row_identity"
    | "metric_value_unavailable";
  path: string;
  severity: "warning";
  messageKey: `pattern_discovery.${PatternDiscoveryWarning["code"]}`;
}>;

export type PatternDiscoveryEvidenceSummary = Readonly<{
  case_support_count: number;
  unique_mapper_row_count: number;
  completed_outcome_count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  effect_direction: "positive" | "negative" | "neutral" | "mixed" | "unknown";
  positive_rate: string | null;
  negative_rate: string | null;
  neutral_rate: string | null;
  average_gross_r_multiple: string | null;
  median_gross_r_multiple: string | null;
  average_best_r: string | null;
  average_worst_r: string | null;
}>;

export type PatternDiscoveryGroupResult = Readonly<{
  status: "discovered" | "discovered_with_warnings" | "insufficient_evidence";
  group_key: string;
  setup_family: "momentum_continuation";
  horizon: "60m";
  source_case_ids: readonly string[];
  mapper_row_ids: readonly string[];
  canonical_row_hashes: readonly string[];
  evidence_set_sha256: string;
  group_sha256: string;
  insight_id: `pattern_insight:v1:${string}` | null;
  evidence: PatternDiscoveryEvidenceSummary;
  warnings: readonly PatternDiscoveryWarning[];
  static_only: true;
  non_authoritative: true;
}>;

export type PatternDiscoveryResult = Readonly<{
  status:
    | "discovered"
    | "discovered_with_warnings"
    | "insufficient_evidence"
    | "blocked_invalid_input"
    | "blocked_invalid_configuration"
    | "blocked_invalid_lineage"
    | "blocked_future_leakage"
    | "blocked_non_consumable_row"
    | "blocked_nondeterministic_grouping";
  configuration_sha256: string | null;
  input_sha256: string | null;
  canonical_result_sha256: string;
  groups: readonly PatternDiscoveryGroupResult[];
  insights: readonly Readonly<{
    insight_id: `pattern_insight:v1:${string}`;
    group_key: string;
    group_sha256: string;
    evidence_set_sha256: string;
    effect_direction: PatternDiscoveryEvidenceSummary["effect_direction"];
  }>[];
  issues: readonly PatternDiscoveryIssue[];
  warnings: readonly PatternDiscoveryWarning[];
  static_only: true;
  non_authoritative: true;
  no_persistence: true;
  no_replay: true;
  no_runtime: true;
  no_feedback: true;
  mutation_allowed: false;
}>;

type UnknownRecord = Record<string, unknown>;
type ResultStatus = PatternDiscoveryResult["status"];
type IssueCode = PatternDiscoveryIssue["code"];
type WarningCode = PatternDiscoveryWarning["code"];

const MAPPER_SHA256 = "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d";
const LEARNING_FIXTURE_SHA256 = "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b";
const CONTEXT_FIXTURE_SHA256 = "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406";
const PATTERN_FIXTURE_SHA256 = "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57";
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const GROUP_KEY = "pattern_group:v1|setup_family=momentum_continuation";
const NUMERIC_FIELDS = [
  "gross_r_multiple",
  "max_favorable_excursion_r",
  "max_adverse_excursion_r",
] as const;
const INPUT_KEYS = ["configuration", "rows"] as const;
const CONFIGURATION_KEYS = [
  "allowed_setup_families",
  "configuration_version",
  "contract_version",
  "evidence_unit",
  "group_key_schema",
  "grouping_dimension",
  "horizon",
  "minimum_completed_outcomes",
  "minimum_total_support",
  "no_feedback",
  "no_persistence",
  "no_replay",
  "no_runtime",
  "non_authoritative",
  "numeric_scale",
  "output_decimal_places",
  "rounding_mode",
  "static_only",
] as const;
const ENVELOPE_KEYS = [
  "canonical_mapper_input_sha256",
  "canonical_row_sha256",
  "consumable",
  "context_fixture_sha256",
  "learning_fixture_sha256",
  "mapper_row_id",
  "mapper_sha256",
  "mapper_status",
  "no_feedback",
  "no_persistence",
  "no_replay",
  "no_runtime",
  "non_authoritative",
  "pattern_fixture_sha256",
  "row",
  "source_case_id",
  "static_only",
] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function keysEqual(value: UnknownRecord, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort(compareText);
  const wanted = [...expected].sort(compareText);
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function escapePointer(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function issue(code: IssueCode, path: string): PatternDiscoveryIssue {
  return { code, path, severity: "error", messageKey: `pattern_discovery.${code}` };
}

function warning(code: WarningCode, path: string): PatternDiscoveryWarning {
  return { code, path, severity: "warning", messageKey: `pattern_discovery.${code}` };
}

function orderedIssues(values: readonly PatternDiscoveryIssue[]): PatternDiscoveryIssue[] {
  const unique = new Map<string, PatternDiscoveryIssue>();
  for (const value of values) {
    unique.set(`${value.code}\u0000${value.path}\u0000${value.severity}\u0000${value.messageKey}`, value);
  }
  return [...unique.values()].sort(
    (left, right) =>
      compareText(left.path, right.path) ||
      compareText(left.code, right.code) ||
      compareText(left.messageKey, right.messageKey),
  );
}

function orderedWarnings(values: readonly PatternDiscoveryWarning[]): PatternDiscoveryWarning[] {
  const unique = new Map<string, PatternDiscoveryWarning>();
  for (const value of values) {
    unique.set(`${value.code}\u0000${value.path}\u0000${value.messageKey}`, value);
  }
  return [...unique.values()].sort(
    (left, right) =>
      compareText(left.path, right.path) ||
      compareText(left.code, right.code) ||
      compareText(left.messageKey, right.messageKey),
  );
}

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite_canonical_number");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (isRecord(value)) {
    const output: UnknownRecord = {};
    for (const key of Object.keys(value).sort(compareText)) {
      if (value[key] === undefined) throw new TypeError("undefined_canonical_value");
      output[key] = canonicalize(value[key]);
    }
    return output;
  }
  throw new TypeError("unsupported_canonical_value");
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function sha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value), "utf8").digest("hex");
}

function optionalSha256(value: unknown): string | null {
  try {
    return sha256(value);
  } catch {
    return null;
  }
}

function withResultHash(value: Omit<PatternDiscoveryResult, "canonical_result_sha256">): PatternDiscoveryResult {
  return { ...value, canonical_result_sha256: sha256(value) };
}

function blocked(
  status: ResultStatus,
  issues: readonly PatternDiscoveryIssue[],
  configurationSha256: string | null = null,
  inputSha256: string | null = null,
): PatternDiscoveryResult {
  return withResultHash({
    status,
    configuration_sha256: configurationSha256,
    input_sha256: inputSha256,
    groups: [],
    insights: [],
    issues: orderedIssues(issues),
    warnings: [],
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    mutation_allowed: false,
  });
}

function configurationValid(value: unknown): value is FrozenPatternDiscoveryConfiguration {
  if (!isRecord(value) || !keysEqual(value, CONFIGURATION_KEYS)) return false;
  return (
    value.contract_version === "pure_pattern_discovery_contract_v1" &&
    value.configuration_version === "pattern_discovery_setup_family_v1" &&
    value.grouping_dimension === "setup_family" &&
    Array.isArray(value.allowed_setup_families) &&
    value.allowed_setup_families.length === 1 &&
    value.allowed_setup_families[0] === "momentum_continuation" &&
    value.horizon === "60m" &&
    value.minimum_total_support === 20 &&
    value.minimum_completed_outcomes === 20 &&
    value.numeric_scale === 1000000 &&
    value.output_decimal_places === 4 &&
    value.rounding_mode === "half_away_from_zero" &&
    value.evidence_unit === "action_400_case_lineage" &&
    value.group_key_schema === "pattern_group:v1" &&
    value.static_only === true &&
    value.non_authoritative === true &&
    value.no_persistence === true &&
    value.no_replay === true &&
    value.no_runtime === true &&
    value.no_feedback === true
  );
}

function envelopeShapeIssues(rows: readonly unknown[]): PatternDiscoveryIssue[] {
  const issues: PatternDiscoveryIssue[] = [];
  rows.forEach((value, index) => {
    const path = `/rows/${index}`;
    if (!isRecord(value) || !keysEqual(value, ENVELOPE_KEYS)) {
      issues.push(issue("invalid_row_envelope", path));
      return;
    }
    for (const key of [
      "source_case_id", "mapper_sha256", "learning_fixture_sha256", "context_fixture_sha256",
      "pattern_fixture_sha256", "canonical_mapper_input_sha256", "mapper_status", "mapper_row_id",
      "canonical_row_sha256",
    ]) {
      if (typeof value[key] !== "string" || value[key].length === 0) {
        issues.push(issue("invalid_row_envelope", `${path}/${key}`));
      }
    }
    for (const key of [
      "consumable", "static_only", "non_authoritative", "no_persistence", "no_replay", "no_runtime", "no_feedback",
    ]) {
      if (typeof value[key] !== "boolean") issues.push(issue("invalid_row_envelope", `${path}/${key}`));
    }
  });
  return issues;
}

function consumabilityIssues(rows: readonly UnknownRecord[]): PatternDiscoveryIssue[] {
  const issues: PatternDiscoveryIssue[] = [];
  rows.forEach((row, index) => {
    const path = `/rows/${index}`;
    if (row.mapper_status !== "mapped") issues.push(issue("ineligible_mapper_status", `${path}/mapper_status`));
    if (!("row" in row) || !isRecord(row.row)) issues.push(issue("missing_row", `${path}/row`));
    if (
      row.consumable !== true || row.static_only !== true || row.non_authoritative !== true ||
      row.no_persistence !== true || row.no_replay !== true || row.no_runtime !== true || row.no_feedback !== true
    ) {
      issues.push(issue("non_consumable_row", path));
    }
  });
  return issues;
}

function lineageIssues(rows: readonly PatternDiscoveryRowEnvelope[]): PatternDiscoveryIssue[] {
  const issues: PatternDiscoveryIssue[] = [];
  const sourceCounts = new Map<string, number>();
  rows.forEach((envelope, index) => {
    const path = `/rows/${index}`;
    sourceCounts.set(envelope.source_case_id, (sourceCounts.get(envelope.source_case_id) ?? 0) + 1);
    const expected = [
      ["mapper_sha256", MAPPER_SHA256],
      ["learning_fixture_sha256", LEARNING_FIXTURE_SHA256],
      ["context_fixture_sha256", CONTEXT_FIXTURE_SHA256],
      ["pattern_fixture_sha256", PATTERN_FIXTURE_SHA256],
    ] as const;
    for (const [key, hash] of expected) {
      if (envelope[key] !== hash) issues.push(issue("invalid_lineage", `${path}/${key}`));
    }
    for (const key of ["canonical_mapper_input_sha256", "canonical_row_sha256"] as const) {
      if (!HASH_PATTERN.test(envelope[key])) issues.push(issue("invalid_lineage", `${path}/${key}`));
    }
    if (envelope.mapper_row_id !== envelope.row.identity?.dataset_row_id) {
      issues.push(issue("invalid_lineage", `${path}/mapper_row_id`));
    }
    try {
      if (sha256(envelope.row) !== envelope.canonical_row_sha256) {
        issues.push(issue("invalid_lineage", `${path}/canonical_row_sha256`));
      }
    } catch {
      const outcome = envelope.row.outcome_fields;
      const hasInvalidNumeric = NUMERIC_FIELDS.some((field) => {
        const value = outcome?.[field];
        return value !== null && (typeof value !== "number" || !Number.isFinite(value));
      });
      if (!hasInvalidNumeric) issues.push(issue("invalid_lineage", `${path}/row`));
    }
  });
  rows.forEach((envelope, index) => {
    if ((sourceCounts.get(envelope.source_case_id) ?? 0) > 1) {
      issues.push(issue("duplicate_source_case_id", `/rows/${index}/source_case_id`));
    }
  });
  return issues;
}

function leakageIssues(rows: readonly PatternDiscoveryRowEnvelope[]): PatternDiscoveryIssue[] {
  return rows.flatMap((envelope, index) =>
    envelope.row.anti_leakage_status === "passed"
      ? []
      : [issue("future_leakage", `/rows/${index}/row/anti_leakage_status`)],
  );
}

function groupingIssues(rows: readonly PatternDiscoveryRowEnvelope[]): PatternDiscoveryIssue[] {
  const issues: PatternDiscoveryIssue[] = [];
  rows.forEach((envelope, index) => {
    const value = envelope.row.setup_and_confidence?.setup_family;
    const path = `/rows/${index}/row/setup_and_confidence/setup_family`;
    if (typeof value !== "string" || value.length === 0) issues.push(issue("missing_grouping_field", path));
    else if (value !== "momentum_continuation") issues.push(issue("invalid_grouping_literal", path));
  });
  return issues;
}

function outcomeIssues(rows: readonly PatternDiscoveryRowEnvelope[]): PatternDiscoveryIssue[] {
  const supported = new Set(["target_hit", "stop_hit", "open_at_window_end", "no_entry_triggered"]);
  const issues: PatternDiscoveryIssue[] = [];
  rows.forEach((envelope, index) => {
    const outcome = envelope.row.outcome_fields;
    const path = `/rows/${index}/row/outcome_fields`;
    if (!isRecord(outcome) || outcome.availability !== "complete" || outcome.outcome_window !== "60m" || !supported.has(String(outcome.outcome_status))) {
      issues.push(issue("invalid_outcome", path));
    }
  });
  return issues;
}

function numericIssues(rows: readonly PatternDiscoveryRowEnvelope[], scale: number): PatternDiscoveryIssue[] {
  const issues: PatternDiscoveryIssue[] = [];
  rows.forEach((envelope, index) => {
    for (const field of NUMERIC_FIELDS) {
      const value = envelope.row.outcome_fields[field];
      if (value === null) continue;
      if (
        typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > 1000000 ||
        !Number.isSafeInteger(value * scale)
      ) {
        issues.push(issue("non_finite_numeric", `/rows/${index}/row/outcome_fields/${field}`));
      }
    }
  });
  return issues;
}

function roundRatio(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= BigInt(0)) throw new RangeError("invalid_denominator");
  const negative = numerator < BigInt(0);
  const absolute = negative ? -numerator : numerator;
  const quotient = absolute / denominator;
  const remainder = absolute % denominator;
  const rounded = remainder * BigInt(2) >= denominator ? quotient + BigInt(1) : quotient;
  return negative ? -rounded : rounded;
}

function fixedFour(units: bigint): string {
  const negative = units < BigInt(0);
  const absolute = negative ? -units : units;
  const base = BigInt(10000);
  const whole = absolute / base;
  const fraction = (absolute % base).toString().padStart(4, "0");
  return `${negative ? "-" : ""}${whole.toString()}.${fraction}`;
}

function rate(count: number, denominator: number): string | null {
  return denominator === 0
    ? null
    : fixedFour(roundRatio(BigInt(count) * BigInt(10000), BigInt(denominator)));
}

function aggregate(values: readonly (number | null)[], scale: number): Readonly<{ average: string | null; median: string | null }> {
  const scaled = values
    .filter((value): value is number => value !== null)
    .map((value) => BigInt(Math.trunc(Object.is(value, -0) ? 0 : value * scale)))
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  if (scaled.length === 0) return { average: null, median: null };
  const sum = scaled.reduce((total, value) => total + value, BigInt(0));
  const averageUnits = roundRatio(sum * BigInt(10000), BigInt(scaled.length) * BigInt(scale));
  const middle = Math.floor(scaled.length / 2);
  const medianNumerator = scaled.length % 2 === 1 ? scaled[middle] : scaled[middle - 1] + scaled[middle];
  const medianDenominator = scaled.length % 2 === 1 ? BigInt(scale) : BigInt(2) * BigInt(scale);
  return { average: fixedFour(averageUnits), median: fixedFour(roundRatio(medianNumerator * BigInt(10000), medianDenominator)) };
}

function effectDirection(positive: number, negative: number, neutral: number): PatternDiscoveryEvidenceSummary["effect_direction"] {
  if (positive > 0 && negative > 0) return "mixed";
  if (positive > 0) return "positive";
  if (negative > 0) return "negative";
  if (neutral > 0) return "neutral";
  return "unknown";
}

function groupRows(
  rows: readonly PatternDiscoveryRowEnvelope[],
  configurationSha256: string,
  configuration: FrozenPatternDiscoveryConfiguration,
): PatternDiscoveryGroupResult {
  const ordered = [...rows].sort(
    (left, right) => compareText(left.source_case_id, right.source_case_id) || compareText(left.mapper_row_id, right.mapper_row_id),
  );
  const duplicateIds = [...new Set(ordered.map((row) => row.mapper_row_id))]
    .filter((id) => ordered.filter((row) => row.mapper_row_id === id).length > 1)
    .sort(compareText);
  const sourceCaseIds = ordered.map((row) => row.source_case_id);
  const mapperRowIds = ordered.map((row) => row.mapper_row_id);
  const rowHashes = ordered.map((row) => row.canonical_row_sha256);
  const evidenceSetSha256 = sha256({
    schema: "pattern_evidence_set:v1",
    configuration_version: configuration.configuration_version,
    group_key: GROUP_KEY,
    horizon: configuration.horizon,
    evidence: ordered.map((row) => ({
      source_case_id: row.source_case_id,
      mapper_row_id: row.mapper_row_id,
      canonical_row_sha256: row.canonical_row_sha256,
    })),
  });
  const groupSha256 = sha256({
    schema: "pattern_group_hash:v1",
    configuration_sha256: configurationSha256,
    group_key: GROUP_KEY,
    evidence_set_sha256: evidenceSetSha256,
  });
  const outcomes = ordered.map((row) => row.row.outcome_fields);
  const positive = outcomes.filter((outcome) => outcome.outcome_status === "target_hit").length;
  const negative = outcomes.filter((outcome) => outcome.outcome_status === "stop_hit").length;
  const neutral = outcomes.length - positive - negative;
  const gross = aggregate(outcomes.map((outcome) => outcome.gross_r_multiple), configuration.numeric_scale);
  const best = aggregate(outcomes.map((outcome) => outcome.max_favorable_excursion_r), configuration.numeric_scale);
  const worst = aggregate(outcomes.map((outcome) => outcome.max_adverse_excursion_r), configuration.numeric_scale);
  const evidence: PatternDiscoveryEvidenceSummary = {
    case_support_count: ordered.length,
    unique_mapper_row_count: new Set(mapperRowIds).size,
    completed_outcome_count: outcomes.length,
    positive_count: positive,
    negative_count: negative,
    neutral_count: neutral,
    effect_direction: effectDirection(positive, negative, neutral),
    positive_rate: rate(positive, outcomes.length),
    negative_rate: rate(negative, outcomes.length),
    neutral_rate: rate(neutral, outcomes.length),
    average_gross_r_multiple: gross.average,
    median_gross_r_multiple: gross.median,
    average_best_r: best.average,
    average_worst_r: worst.average,
  };
  const groupPath = `/groups/${escapePointer(GROUP_KEY)}`;
  const warnings: PatternDiscoveryWarning[] = duplicateIds.map((id) =>
    warning("duplicate_mapper_row_identity", `${groupPath}/mapper_row_ids/${escapePointer(id)}`),
  );
  if (ordered.length < configuration.minimum_total_support) warnings.push(warning("minimum_total_support_not_met", `${groupPath}/case_support_count`));
  if (outcomes.length < configuration.minimum_completed_outcomes) warnings.push(warning("minimum_completed_outcomes_not_met", `${groupPath}/completed_outcome_count`));
  if (gross.average === null) warnings.push(warning("metric_value_unavailable", `${groupPath}/evidence/average_gross_r_multiple`));
  if (best.average === null) warnings.push(warning("metric_value_unavailable", `${groupPath}/evidence/average_best_r`));
  if (worst.average === null) warnings.push(warning("metric_value_unavailable", `${groupPath}/evidence/average_worst_r`));
  const orderedGroupWarnings = orderedWarnings(warnings);
  const sufficient = ordered.length >= configuration.minimum_total_support && outcomes.length >= configuration.minimum_completed_outcomes;
  const status = !sufficient ? "insufficient_evidence" : orderedGroupWarnings.length > 0 ? "discovered_with_warnings" : "discovered";
  const insightHash = sufficient
    ? sha256({
        schema: configuration.contract_version,
        configuration_version: configuration.configuration_version,
        pattern_dimension: "setup_family",
        group_key: GROUP_KEY,
        horizon: configuration.horizon,
        evidence_set_sha256: evidenceSetSha256,
      })
    : null;
  return {
    status,
    group_key: GROUP_KEY,
    setup_family: "momentum_continuation",
    horizon: "60m",
    source_case_ids: sourceCaseIds,
    mapper_row_ids: mapperRowIds,
    canonical_row_hashes: rowHashes,
    evidence_set_sha256: evidenceSetSha256,
    group_sha256: groupSha256,
    insight_id: insightHash ? `pattern_insight:v1:${insightHash}` : null,
    evidence,
    warnings: orderedGroupWarnings,
    static_only: true,
    non_authoritative: true,
  };
}

export function discoverPatterns(input: Readonly<{
  rows: readonly PatternDiscoveryRowEnvelope[];
  configuration: FrozenPatternDiscoveryConfiguration;
}>): PatternDiscoveryResult {
  // Phase 1: input shape.
  if (!isRecord(input) || !keysEqual(input, INPUT_KEYS) || !Array.isArray(input.rows)) {
    return blocked("blocked_invalid_input", [issue("invalid_input_shape", "/")]);
  }

  // Phase 2: configuration shape and literals.
  if (!configurationValid(input.configuration)) {
    return blocked("blocked_invalid_configuration", [issue("invalid_configuration_shape", "/configuration")]);
  }
  const configurationSha256 = sha256(input.configuration);

  // Phase 3: batch declarations, count, and order contract.
  if (input.rows.length === 0) {
    return blocked("blocked_invalid_input", [issue("invalid_batch_declaration", "/rows")], configurationSha256);
  }

  // Phase 4: row-envelope shape.
  const shapeIssues = envelopeShapeIssues(input.rows);
  if (shapeIssues.length > 0) return blocked("blocked_invalid_input", shapeIssues, configurationSha256);
  const rows = input.rows as readonly PatternDiscoveryRowEnvelope[];

  // Phase 5: mapper status and consumability.
  const rowConsumabilityIssues = consumabilityIssues(rows as unknown as readonly UnknownRecord[]);
  if (rowConsumabilityIssues.length > 0) {
    return blocked("blocked_non_consumable_row", rowConsumabilityIssues, configurationSha256);
  }

  // Phase 6: lineage integrity.
  const rowLineageIssues = lineageIssues(rows);
  if (rowLineageIssues.length > 0) return blocked("blocked_invalid_lineage", rowLineageIssues, configurationSha256);

  const orderedRows = [...rows].sort(
    (left, right) => compareText(left.source_case_id, right.source_case_id) || compareText(left.mapper_row_id, right.mapper_row_id),
  );
  const inputSha256 = optionalSha256({ configuration: input.configuration, rows: orderedRows });

  // Phase 7: anti-leakage.
  const rowLeakageIssues = leakageIssues(rows);
  if (rowLeakageIssues.length > 0) {
    return blocked("blocked_future_leakage", rowLeakageIssues, configurationSha256, inputSha256);
  }

  // Phase 8: required grouping fields and literals.
  const rowGroupingIssues = groupingIssues(rows);
  if (rowGroupingIssues.length > 0) return blocked("blocked_invalid_input", rowGroupingIssues, configurationSha256, inputSha256);

  // Phase 9: completed outcome validity.
  const rowOutcomeIssues = outcomeIssues(rows);
  if (rowOutcomeIssues.length > 0) return blocked("blocked_invalid_input", rowOutcomeIssues, configurationSha256, inputSha256);

  // Phase 10: finite and exactly scalable numeric values.
  const rowNumericIssues = numericIssues(rows, input.configuration.numeric_scale);
  if (rowNumericIssues.length > 0) return blocked("blocked_invalid_input", rowNumericIssues, configurationSha256, inputSha256);

  // Phase 11: deterministic grouping and canonical key construction.
  let canonicalGroupKey: string;
  try {
    canonicalGroupKey = `pattern_group:v1|setup_family=${encodeURIComponent("momentum_continuation".normalize("NFC"))}`;
  } catch {
    return blocked("blocked_nondeterministic_grouping", [issue("nondeterministic_grouping", "/rows")], configurationSha256, inputSha256);
  }
  if (canonicalGroupKey !== GROUP_KEY) {
    return blocked("blocked_nondeterministic_grouping", [issue("nondeterministic_grouping", "/rows")], configurationSha256, inputSha256);
  }

  // Phases 12-14: aggregation, support evaluation, and result construction.
  const group = groupRows(rows, configurationSha256, input.configuration);
  const warnings = orderedWarnings(group.warnings);
  const insights = group.insight_id
    ? [{
        insight_id: group.insight_id,
        group_key: group.group_key,
        group_sha256: group.group_sha256,
        evidence_set_sha256: group.evidence_set_sha256,
        effect_direction: group.evidence.effect_direction,
      }]
    : [];
  const status: ResultStatus = group.status;
  return withResultHash({
    status,
    configuration_sha256: configurationSha256,
    input_sha256: inputSha256,
    groups: [group],
    insights,
    issues: [],
    warnings,
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    mutation_allowed: false,
  });
}
