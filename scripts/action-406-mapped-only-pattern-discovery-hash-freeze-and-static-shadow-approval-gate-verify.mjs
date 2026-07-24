#!/usr/bin/env node

import { createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { registerHooks } from "node:module";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(pathToFileURL(resolve(root, `${specifier.slice(2)}.ts`)).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const paths = {
  mapper: "lib/snapshot-to-learning-dataset-mapper.ts",
  discovery: "lib/pure-pattern-discovery.ts",
  learning: "lib/learning-dataset-static-fixtures.ts",
  context: "lib/intelligence-context-static-fixtures.ts",
  pattern: "lib/pattern-insight-static-fixtures.ts",
  action400Runner: "scripts/action-400-expanded-static-mapper-shadow-run.mjs",
  action400Manifest: "docs/action-400-expanded-static-mapper-shadow-input-manifest.json",
  action405Verifier: "scripts/action-405-independent-pure-pattern-discovery-verification-and-hash-audit-verify.mjs",
  doc: "docs/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate.md",
  verifier: "scripts/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate-verify.mjs",
  test: "tests/e2e/action-406-mapped-only-pattern-discovery-hash-freeze-and-static-shadow-approval-gate.spec.ts",
};
const expectedHashes = {
  [paths.mapper]: "7294a851ede33aadc0dbfcb68c13337cd244002b84be7cbbe40abbe91673741d",
  [paths.discovery]: "48b7667c8690a1d8d56b819a3727e37ea73af7710a45131eb3debab48627191c",
  [paths.learning]: "706bd57150914862604af70e0bba7614151f53c32abc5dbde9595c53bf4b332b",
  [paths.context]: "46358cb997b4f7a431a3fee72562659da48b13219404224f4e80e08dbf8ed406",
  [paths.pattern]: "db8dae9f101f710123a0a3ac6493356bd761c15f231023ab9742caefaacf8f57",
  [paths.action400Runner]: "a1123e1416df78a51645321cb9a273095c2a338febd8021265c4e3ee972d5b05",
  [paths.action400Manifest]: "e0a2646492da2038bf156c0060c48eb8144e78ff0d57cda92a60d3ca36c95319",
};
const mapperLineage = {
  mapper_sha256: expectedHashes[paths.mapper],
  learning_fixture_sha256: expectedHashes[paths.learning],
  context_fixture_sha256: expectedHashes[paths.context],
  pattern_fixture_sha256: expectedHashes[paths.pattern],
};
const allowedCaseIds = [
  "valid_complete_mapping",
  "valid_rich_context",
  "valid_equivalent_aliases",
  "valid_normalized_confidence",
  "expanded_valid_bearish_risk_context",
  "expanded_valid_fda_event_context",
  "expanded_valid_sec_event_context",
  "expanded_valid_future_event_excluded",
  "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding",
];
const orderedCaseIds = [
  "expanded_valid_bearish_risk_context",
  "expanded_valid_fda_event_context",
  "expanded_valid_future_event_excluded",
  "expanded_valid_identity_nfc_equivalent",
  "expanded_valid_identity_percent_encoding",
  "expanded_valid_sec_event_context",
  "valid_complete_mapping",
  "valid_equivalent_aliases",
  "valid_normalized_confidence",
  "valid_rich_context",
];
const expectedRows = {
  expanded_valid_bearish_risk_context: {
    canonical_mapper_input_sha256: "fec17679ec57889b72bdb6e60851f2791ec04901a84127c3aa2a37dc8f620ec9",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "c541b7c12b4c93d30238d328907320f415a6593646c04b7ad9a9f117b879bf10",
  },
  expanded_valid_fda_event_context: {
    canonical_mapper_input_sha256: "416817eb4359264bae6bcd70b2b8aca225954ebc7c9a2df7378004b1b1692ad3",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "308f97519a4779f4372adc62e6901ac385bb831c01423a7b32373c4619611412",
  },
  expanded_valid_future_event_excluded: {
    canonical_mapper_input_sha256: "f7f4298adedab046a69cb5e7cdb506ee59acc87008733d51a44cbcc41002aaf2",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "6f6aa09ac28e35b5342fc305fcaa5f97a97cdf6d6dc4af5477edee97c94b150c",
  },
  expanded_valid_identity_nfc_equivalent: {
    canonical_mapper_input_sha256: "b3966931a62cd588feec62dbea7012e810a95f0a59b6fe7707ebef14c8cfd95e",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|caf%C3%A9|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "a73bd0365bbf8358e5746744d4774604007540160af27c67696d1474dc358854",
  },
  expanded_valid_identity_percent_encoding: {
    canonical_mapper_input_sha256: "eddbdf862ddeba42df34e8185552b7718a3b348b535b6e9a5c0c8dcddbdccf88",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|shadow%7Cpercent%25%20%2F397|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "53ec6e76d02dcf552cadeb260176a0659192c5b82dca5958feff4ac36091be4f",
  },
  expanded_valid_sec_event_context: {
    canonical_mapper_input_sha256: "cd94475fe9243e681042e9adbe20e23086020c85127b29673c380ecd680dde6a",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "589db67304606f5e2acc7c42373cb1e49a12687cb0dafc2c25c407c815af1f77",
  },
  valid_complete_mapping: {
    canonical_mapper_input_sha256: "3b88963b293bb6212cc37c474d4fd21560cb99cb7edb9ee581ab24659aa79eda",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0",
  },
  valid_equivalent_aliases: {
    canonical_mapper_input_sha256: "96ab5d0b9f5c71b2f6bc6f057d32fc3aaa4507cd627347a307b7722b81072ff4",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0",
  },
  valid_normalized_confidence: {
    canonical_mapper_input_sha256: "40a0414237ce721261ba56bcb193cd6d5aa35f545d16b901f6bed03b4e7a032a",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "27cd78418b77f2af7d7bb6cc93334f52d862791c530a2878fa13a76c305f7da0",
  },
  valid_rich_context: {
    canonical_mapper_input_sha256: "e5b4967d79f406272fdea2a45b5cc47a3ed5d23bc09ce0cca9d1eaabe8240601",
    mapper_row_id: "learning_row:v1:learning_dataset_static_fixture_v1|snapshot_fingerprint%3Ashadow397%3A001|60m|outcome%3Ashadow397%3A001",
    canonical_row_sha256: "4bd75cdac30b2f609088a4990f29bcc15558495e68691b41602a0b91334e7e41",
  },
};
const configuration = {
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
const expected = {
  group_key: "pattern_group:v1|setup_family=momentum_continuation",
  configuration_sha256: "501271173e3e14dcb46f30a6c2df9e1d12637fd4ee8b526e29ae4394181a8bd1",
  input_sha256: "ff39876e60275557f7d19ba79a3433910cccbf118e1666b4b6f6e70c009c953c",
  evidence_set_sha256: "f1f0053264c85d640d46b61da0ce7120e491309e3070132fe74a69a68438cbd8",
  group_sha256: "aa2ae3f39146ce1c6fc1f6ed73e19e96b02b7866b34e75b61c471a8277a1122e",
  result_sha256: "e911709a784159c684a350de490fd56446ee23c23b3bf5ea2fbb70378ebf253c",
};
const sections = [
  "Purpose", "Scope", "Authoritative Dependencies", "Action 405 Readiness Result",
  "Remaining Action 405 Condition", "Known Action 404 Lint Debt", "Explicit Non-Goals",
  "Protected-Source Inventory", "Exact Eligible-Case Inventory", "Exact Excluded-Case Policy",
  "Mapper Reconstruction Boundary", "Deterministic Wrapper Policy", "Canonical Mapper-Input Policy",
  "Reconstructed-Row Contract", "Row-Lineage Contract", "Row-ID Inventory", "Canonical Row-Hash Inventory",
  "Duplicate-Row Identity Inventory", "Case-Level Versus Unique-Row Inventory", "Group-Membership Inventory",
  "Canonical Group-Key Contract", "Evidence-Set Canonicalization", "Evidence-Set Hash", "Group Canonicalization",
  "Group Hash", "Expected Pattern Discovery Result Contract", "Expected Result Hash Policy",
  "Minimum-Support Result", "Issue/Warning Expectations", "Duplicate Warning Expectation",
  "Non-Authoritative Classification", "Future Shadow Manifest Requirements", "Future Shadow Runner Boundary",
  "Evidence Boundary", "Repeat-Run Determinism", "Temporary-Path Policy", "Cleanup Policy",
  "No-Persistence Requirement", "No-Replay Requirement", "No-Runtime Requirement", "No-External-Access Requirement",
  "No-Feedback Requirement", "Lint-Readiness Policy", "Stop Conditions", "Approval Vocabulary",
  "Deterministic Gate Conditions", "Approval Decision", "Passed Conditions", "Failed Conditions",
  "Unresolved Conditions", "Next Permitted Action",
];
const abs = (path) => join(root, path);
const read = (path) => readFileSync(abs(path), "utf8");
const exists = (path) => existsSync(abs(path));
const shaFile = (path) => createHash("sha256").update(readFileSync(abs(path))).digest("hex");
function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}
function escapePointer(value) {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}
function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non_finite");
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort(compareText).map((key) => {
      if (value[key] === undefined) throw new TypeError("undefined");
      return [key, canonicalize(value[key])];
    }));
  }
  throw new TypeError("unsupported");
}
const shaValue = (value) => createHash("sha256").update(JSON.stringify(canonicalize(value)), "utf8").digest("hex");
function roundRatio(numerator, denominator) {
  const negative = numerator < 0n;
  const absolute = negative ? -numerator : numerator;
  const quotient = absolute / denominator;
  const remainder = absolute % denominator;
  const rounded = remainder * 2n >= denominator ? quotient + 1n : quotient;
  return negative ? -rounded : rounded;
}
function fixedFour(units) {
  const negative = units < 0n;
  const absolute = negative ? -units : units;
  return `${negative ? "-" : ""}${absolute / 10000n}.${(absolute % 10000n).toString().padStart(4, "0")}`;
}
function rate(count, denominator) {
  return denominator === 0 ? null : fixedFour(roundRatio(BigInt(count) * 10000n, BigInt(denominator)));
}
function aggregate(values, scale) {
  const scaled = values
    .filter((value) => value !== null)
    .map((value) => BigInt(Math.trunc(Object.is(value, -0) ? 0 : value * scale)))
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  if (scaled.length === 0) return { average: null, median: null };
  const sum = scaled.reduce((total, value) => total + value, 0n);
  const middle = Math.floor(scaled.length / 2);
  const medianNumerator = scaled.length % 2 === 1 ? scaled[middle] : scaled[middle - 1] + scaled[middle];
  const medianDenominator = scaled.length % 2 === 1 ? BigInt(scale) : 2n * BigInt(scale);
  return {
    average: fixedFour(roundRatio(sum * 10000n, BigInt(scaled.length) * BigInt(scale))),
    median: fixedFour(roundRatio(medianNumerator * 10000n, medianDenominator)),
  };
}
function files(path) {
  if (!exists(path)) return [];
  if (statSync(abs(path)).isFile()) return [path];
  return readdirSync(abs(path)).flatMap((entry) => files(join(path, entry))).sort();
}
function statusFiles() {
  return execFileSync("git", ["status", "--short", "--untracked-files=all"], { cwd: root, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim());
}
async function reconstruct() {
  const [{ buildExpandedStaticShadowCases }, { mapSnapshotToLearningDataset }] = await Promise.all([
    import("./action-400-expanded-static-mapper-shadow-run.mjs"),
    import("../lib/snapshot-to-learning-dataset-mapper.ts"),
  ]);
  const cases = (await buildExpandedStaticShadowCases()).filter((item) => allowedCaseIds.includes(item.case_id));
  const rows = cases.map((caseDefinition) => {
    const before = JSON.stringify(caseDefinition.input);
    const result = mapSnapshotToLearningDataset(caseDefinition.input);
    if (JSON.stringify(caseDefinition.input) !== before) throw new Error(`input_mutation:${caseDefinition.case_id}`);
    const rowHash = result.row ? shaValue(result.row) : null;
    return {
      case_id: caseDefinition.case_id,
      origin: caseDefinition.origin,
      source_fixture_ids: caseDefinition.source_fixture_ids,
      canonical_mapper_input_sha256: caseDefinition.canonical_input_sha256,
      status: result.status,
      consumable: result.consumable,
      issues: result.issues,
      row: result.row,
      mapper_row_id: result.row?.identity?.dataset_row_id ?? null,
      canonical_row_sha256: rowHash,
      setup_family: result.row?.setup_and_confidence?.setup_family ?? null,
      horizon: result.row?.outcome_fields?.outcome_window ?? null,
      outcome_status: result.row?.outcome_fields?.outcome_status ?? null,
      anti_leakage_status: result.row?.anti_leakage_status ?? null,
    };
  }).sort((left, right) => compareText(left.case_id, right.case_id) || compareText(String(left.mapper_row_id), String(right.mapper_row_id)));
  return rows;
}
function deriveHashes(rows) {
  const envelopes = rows.map((row) => ({
    source_case_id: row.case_id,
    ...mapperLineage,
    canonical_mapper_input_sha256: row.canonical_mapper_input_sha256,
    mapper_status: "mapped",
    mapper_row_id: row.mapper_row_id,
    canonical_row_sha256: row.canonical_row_sha256,
    consumable: true,
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    row: row.row,
  }));
  const configurationSha256 = shaValue(configuration);
  const inputSha256 = shaValue({ configuration, rows: envelopes });
  const evidenceSetSha256 = shaValue({
    schema: "pattern_evidence_set:v1",
    configuration_version: configuration.configuration_version,
    group_key: expected.group_key,
    horizon: configuration.horizon,
    evidence: rows.map((row) => ({
      source_case_id: row.case_id,
      mapper_row_id: row.mapper_row_id,
      canonical_row_sha256: row.canonical_row_sha256,
    })),
  });
  const groupSha256 = shaValue({
    schema: "pattern_group_hash:v1",
    configuration_sha256: configurationSha256,
    group_key: expected.group_key,
    evidence_set_sha256: evidenceSetSha256,
  });
  const outcomes = rows.map((row) => row.row.outcome_fields);
  const positive = outcomes.filter((outcome) => outcome.outcome_status === "target_hit").length;
  const negative = outcomes.filter((outcome) => outcome.outcome_status === "stop_hit").length;
  const neutral = outcomes.length - positive - negative;
  const mapperRowIds = rows.map((row) => row.mapper_row_id);
  const duplicateIds = [...new Set(mapperRowIds)].filter((id) => mapperRowIds.filter((value) => value === id).length > 1).sort(compareText);
  const groupPath = `/groups/${escapePointer(expected.group_key)}`;
  const warnings = [
    ...duplicateIds.map((id) => ({
      code: "duplicate_mapper_row_identity",
      path: `${groupPath}/mapper_row_ids/${escapePointer(id)}`,
      severity: "warning",
      messageKey: "pattern_discovery.duplicate_mapper_row_identity",
    })),
    {
      code: "minimum_total_support_not_met",
      path: `${groupPath}/case_support_count`,
      severity: "warning",
      messageKey: "pattern_discovery.minimum_total_support_not_met",
    },
    {
      code: "minimum_completed_outcomes_not_met",
      path: `${groupPath}/completed_outcome_count`,
      severity: "warning",
      messageKey: "pattern_discovery.minimum_completed_outcomes_not_met",
    },
  ].sort((left, right) => compareText(left.path, right.path) || compareText(left.code, right.code) || compareText(left.messageKey, right.messageKey));
  const gross = aggregate(outcomes.map((outcome) => outcome.gross_r_multiple), configuration.numeric_scale);
  const best = aggregate(outcomes.map((outcome) => outcome.max_favorable_excursion_r), configuration.numeric_scale);
  const worst = aggregate(outcomes.map((outcome) => outcome.max_adverse_excursion_r), configuration.numeric_scale);
  const evidence = {
    case_support_count: rows.length,
    unique_mapper_row_count: new Set(mapperRowIds).size,
    completed_outcome_count: rows.length,
    positive_count: positive,
    negative_count: negative,
    neutral_count: neutral,
    effect_direction: "positive",
    positive_rate: rate(positive, rows.length),
    negative_rate: rate(negative, rows.length),
    neutral_rate: rate(neutral, rows.length),
    average_gross_r_multiple: gross.average,
    median_gross_r_multiple: gross.median,
    average_best_r: best.average,
    average_worst_r: worst.average,
  };
  const group = {
    status: "insufficient_evidence",
    group_key: expected.group_key,
    setup_family: "momentum_continuation",
    horizon: "60m",
    source_case_ids: rows.map((row) => row.case_id),
    mapper_row_ids: mapperRowIds,
    canonical_row_hashes: rows.map((row) => row.canonical_row_sha256),
    evidence_set_sha256: evidenceSetSha256,
    group_sha256: groupSha256,
    insight_id: null,
    evidence,
    warnings,
    static_only: true,
    non_authoritative: true,
  };
  const result = {
    status: "insufficient_evidence",
    configuration_sha256: configurationSha256,
    input_sha256: inputSha256,
    groups: [group],
    insights: [],
    issues: [],
    warnings,
    static_only: true,
    non_authoritative: true,
    no_persistence: true,
    no_replay: true,
    no_runtime: true,
    no_feedback: true,
    mutation_allowed: false,
  };
  return {
    configuration_sha256: configurationSha256,
    input_sha256: inputSha256,
    evidence_set_sha256: evidenceSetSha256,
    group_sha256: groupSha256,
    result_sha256: shaValue(result),
    evidence,
    warnings,
    changed_case_hash_differs: evidenceSetSha256 !== shaValue({ schema: "pattern_evidence_set:v1", configuration_version: configuration.configuration_version, group_key: expected.group_key, horizon: configuration.horizon, evidence: rows.map((row, index) => ({ source_case_id: index === 0 ? `${row.case_id}_changed` : row.case_id, mapper_row_id: row.mapper_row_id, canonical_row_sha256: row.canonical_row_sha256 })) }),
    changed_row_id_hash_differs: evidenceSetSha256 !== shaValue({ schema: "pattern_evidence_set:v1", configuration_version: configuration.configuration_version, group_key: expected.group_key, horizon: configuration.horizon, evidence: rows.map((row, index) => ({ source_case_id: row.case_id, mapper_row_id: index === 0 ? `${row.mapper_row_id}:changed` : row.mapper_row_id, canonical_row_sha256: row.canonical_row_sha256 })) }),
    changed_row_hash_differs: evidenceSetSha256 !== shaValue({ schema: "pattern_evidence_set:v1", configuration_version: configuration.configuration_version, group_key: expected.group_key, horizon: configuration.horizon, evidence: rows.map((row, index) => ({ source_case_id: row.case_id, mapper_row_id: row.mapper_row_id, canonical_row_sha256: index === 0 ? "0".repeat(64) : row.canonical_row_sha256 })) }),
    changed_group_key_hash_differs: groupSha256 !== shaValue({ schema: "pattern_group_hash:v1", configuration_sha256: configurationSha256, group_key: `${expected.group_key}:changed`, evidence_set_sha256: evidenceSetSha256 }),
  };
}

const requiredFiles = [paths.doc, paths.verifier, paths.test];
const doc = exists(paths.doc) ? read(paths.doc) : "";
const verifierSource = exists(paths.verifier) ? read(paths.verifier) : "";
const testSource = exists(paths.test) ? read(paths.test) : "";
const discoverySource = exists(paths.discovery) ? read(paths.discovery) : "";
const manifest = exists(paths.action400Manifest) ? JSON.parse(read(paths.action400Manifest)) : null;
const action405 = exists(paths.action405Verifier) ? JSON.parse(execFileSync("node", [abs(paths.action405Verifier)], { cwd: root, encoding: "utf8" })) : null;
const rows = await reconstruct();
const derived = deriveHashes(rows);
const productionConsumers = spawnSync("rg", ["-l", "pure-pattern-discovery|discoverPatterns", "app", "--glob", "*.{ts,tsx,js,jsx}"], { cwd: root, encoding: "utf8" });
const consumerFiles = [0, 1].includes(productionConsumers.status ?? -1) ? productionConsumers.stdout.trim().split("\n").filter(Boolean) : ["inventory_failed"];
const runnerManifestFiles = [...files("scripts"), ...files("docs")].filter((path) => ![paths.doc, paths.verifier, paths.test].includes(path) && /action-406.*(?:runner|run|manifest|shadow)/i.test(path));
const action406Files = statusFiles().filter((path) => path.includes("action-406"));
const allowedAction406Files = [paths.doc, paths.verifier, paths.test];
const discoverCallMarker = ["discover", "Patterns("].join("");
const discoveryImportMarker = ["from \"@/lib/pure-pattern", "-discovery\""].join("");
const forbiddenVerifierMarkers = [
  ["process", ".stdin"].join(""),
  ["JSON", ".parse(process.argv"].join(""),
  ["process", ".env"].join(""),
  ["fetch", "("].join(""),
  ["@supa", "base"].join(""),
  ["next", "/server"].join(""),
  ["write", "File"].join(""),
  ["rm", "Sync"].join(""),
  ["mkdir", "Sync"].join(""),
  ["Date", ".now"].join(""),
  ["Math", ".random"].join(""),
];
const checks = {
  required_files_found: requiredFiles.every(exists),
  documentation_sections_complete: sections.every((section) => doc.includes(`## ${section}`)),
  protected_hashes_unchanged: Object.entries(expectedHashes).every(([path, hash]) => exists(path) && shaFile(path) === hash && doc.includes(hash)),
  action405_ready_with_conditions: action405?.verification_status === "passed" && action405?.readiness_decision === "ready_with_conditions",
  known_lint_debt_recorded: doc.includes("Action 404 lint debt") && doc.includes("approved_with_conditions"),
  eligible_case_inventory_exact: rows.length === 10 && JSON.stringify(rows.map((row) => row.case_id)) === JSON.stringify(orderedCaseIds) && allowedCaseIds.every((id) => manifest.ordered_cases.some((item) => item.case_id === id && item.expected_status === "mapped")),
  excluded_case_policy_exact: manifest.ordered_cases.length === 40 && manifest.ordered_cases.filter((item) => !allowedCaseIds.includes(item.case_id)).length === 30,
  mapper_reconstruction_exact: rows.every((row) => row.status === "mapped" && row.row && row.consumable === true && row.issues.length === 0 && row.setup_family === "momentum_continuation" && row.horizon === "60m" && row.outcome_status === "target_hit" && row.anti_leakage_status === "passed"),
  row_hash_inventory_exact: rows.every((row) => expectedRows[row.case_id]?.canonical_mapper_input_sha256 === row.canonical_mapper_input_sha256 && expectedRows[row.case_id]?.mapper_row_id === row.mapper_row_id && expectedRows[row.case_id]?.canonical_row_sha256 === row.canonical_row_sha256 && doc.includes(row.canonical_row_sha256)),
  duplicate_inventory_exact: new Set(rows.map((row) => row.mapper_row_id)).size === 3 && rows.filter((row) => row.mapper_row_id === expectedRows.valid_complete_mapping.mapper_row_id).length === 8,
  evidence_group_and_result_hashes_exact: derived.configuration_sha256 === expected.configuration_sha256 && derived.input_sha256 === expected.input_sha256 && derived.evidence_set_sha256 === expected.evidence_set_sha256 && derived.group_sha256 === expected.group_sha256 && derived.result_sha256 === expected.result_sha256,
  hash_change_sensitivity: derived.changed_case_hash_differs && derived.changed_row_id_hash_differs && derived.changed_row_hash_differs && derived.changed_group_key_hash_differs,
  expected_result_contract_exact: derived.evidence.case_support_count === 10 && derived.evidence.unique_mapper_row_count === 3 && derived.evidence.completed_outcome_count === 10 && derived.evidence.positive_count === 10 && derived.evidence.negative_count === 0 && derived.evidence.neutral_count === 0 && derived.warnings.map((item) => item.code).join(",") === "minimum_total_support_not_met,minimum_completed_outcomes_not_met,duplicate_mapper_row_identity",
  discover_patterns_not_executed: !verifierSource.includes(discoverCallMarker) && !verifierSource.includes(discoveryImportMarker) && discoverySource.includes(["export function discover", "Patterns"].join("")),
  no_dynamic_or_external_access: forbiddenVerifierMarkers.every((marker) => !verifierSource.includes(marker)),
  no_runtime_consumer_runner_or_manifest: consumerFiles.length === 0 && runnerManifestFiles.length === 0,
  approval_decision_exact: doc.includes("`approved_with_conditions`") && doc.includes("action_407_mapped_only_pattern_discovery_static_shadow_execution_approval_gate"),
  runtime_preview_paused: doc.includes("runtime_preview_waiting_for_operator_inputs"),
  action406_boundary_exact: action406Files.every((path) => allowedAction406Files.includes(path)),
  focused_tests_cover_gate: [
    "ten allowed cases",
    "thirty excluded cases",
    "row hash inventory",
    "evidence-set group and result hashes",
    "does not execute discoverPatterns",
    "approved_with_conditions",
  ].every((marker) => testSource.includes(marker)),
};
const failed = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
const report = {
  verification_status: failed.length === 0 ? "passed" : "blocked",
  approval_decision: failed.length === 0 ? "approved_with_conditions" : "blocked",
  checks,
  failed_checks: failed,
  passed_conditions_count: Object.values(checks).filter(Boolean).length,
  failed_conditions_count: failed.length,
  unresolved_conditions_count: failed.length === 0 ? 2 : 0,
  protected_hashes: Object.fromEntries(Object.entries(expectedHashes).map(([path, expectedHash]) => [path, { expected: expectedHash, actual: exists(path) ? shaFile(path) : null }])),
  eligible_case_ids: rows.map((row) => row.case_id),
  excluded_case_count: manifest.ordered_cases.filter((item) => !allowedCaseIds.includes(item.case_id)).length,
  row_hash_inventory: rows.map((row) => ({
    case_id: row.case_id,
    mapper_row_id: row.mapper_row_id,
    canonical_mapper_input_sha256: row.canonical_mapper_input_sha256,
    canonical_row_sha256: row.canonical_row_sha256,
    setup_family: row.setup_family,
    horizon: row.horizon,
    outcome_status: row.outcome_status,
  })),
  duplicate_inventory: {
    case_support_count: rows.length,
    unique_mapper_row_count: new Set(rows.map((row) => row.mapper_row_id)).size,
    shared_mapper_row_id_count: rows.filter((row) => row.mapper_row_id === expectedRows.valid_complete_mapping.mapper_row_id).length,
  },
  group_key: expected.group_key,
  configuration_sha256: derived.configuration_sha256,
  input_sha256: derived.input_sha256,
  evidence_set_sha256: derived.evidence_set_sha256,
  group_sha256: derived.group_sha256,
  expected_result_sha256: derived.result_sha256,
  expected_result_contract: {
    status: "insufficient_evidence",
    group_count: 1,
    group_status: "insufficient_evidence",
    insight_count: 0,
    evidence: derived.evidence,
    warning_codes: derived.warnings.map((item) => item.code),
  },
  production_consumer_files: consumerFiles,
  downstream_runner_or_manifest_files: runnerManifestFiles,
  runtime_preview_status: "runtime_preview_waiting_for_operator_inputs",
  no_effect_flags: {
    discover_patterns_executed: false,
    pattern_discovery_shadow_executed: false,
    full_rows_persisted: false,
    provider_call_executed: false,
    news_call_executed: false,
    supabase_read_executed: false,
    supabase_write_executed: false,
    persistence_executed: false,
    replay_executed: false,
    runtime_integration_executed: false,
    feedback_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendations_mutated: false,
  },
  lint_readiness: "blocked_by_pre_existing_action_404_no_explicit_any",
  recommended_next_action: failed.length === 0 ? "action_407_mapped_only_pattern_discovery_static_shadow_execution_approval_gate" : "remediate_action_406_hash_freeze_gate",
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exitCode = failed.length === 0 ? 0 : 1;
