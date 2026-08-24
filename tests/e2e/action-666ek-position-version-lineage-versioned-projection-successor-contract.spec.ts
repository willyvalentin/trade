import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
const actionPath =
  "docs/action-666ek-position-version-lineage-versioned-projection-successor-contract.md";
const evidencePath =
  "docs/evidence/action-666ek-position-version-lineage-versioned-projection-successor-contract.json";
const roadmapPath = "docs/ture-master-roadmap.md";
const ledgerPath = "docs/ture-current-state-ledger.md";
const registrationPath = "scripts/action-660j-provider-free-ci-registration.json";
const runnerPath = "scripts/action-660j-run-provider-free-ci-shard.mjs";
const thisTest =
  "tests/e2e/action-666ek-position-version-lineage-versioned-projection-successor-contract.spec.ts";
const evidenceSha256 =
  "6badd35dbb8603f81217839962eef7021a6cb88d402a7c8cb366f609a84453fd";

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("666EK pins the exact green 666EJ predecessor and keeps v1 immutable", () => {
  const raw = source(evidencePath);
  expect(sha256(raw)).toBe(evidenceSha256);
  const evidence = JSON.parse(raw);

  expect(evidence.predecessor).toEqual({
    protected_main_commit: "0b884a0d533698d7029e393cd45664a1bd3bd451",
    exact_main_ci_run: 32716854248,
    exact_main_ci_conclusion: "success",
    action_666de_contract_path:
      "docs/evidence/action-666de-deterministic-recommendation-lineage-backfill-contract.json",
    action_666ej_reconciliation_path:
      "docs/evidence/action-666ej-position-version-lineage-control-character-projection-provenance-reconciliation.json",
  });
  expect(evidence.v1_immutability).toEqual({
    contract_version: "legacy_recommendation_normative_projection_v1",
    relaxed: false,
    in_place_upgrade_allowed: false,
  });
});

test("666EK freezes the separate v2 projection and canonical narrative escapes", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.v2_normative_digest).toMatchObject({
    contract_version: "legacy_recommendation_normative_projection_v2",
    domain: "trade.legacy_recommendation_normative_digest.v2",
    algorithm: "sha256",
    digest_format: "64_lowercase_hexadecimal_characters",
    frame_keys: ["contract_version", "domain", "projection"],
    utf8_without_bom_required: true,
    raw_frame_must_equal_canonical_serialization: true,
    nullable_values_explicit_null: true,
    lossless_decimal_contract_reused_from_action_666de: true,
    identity_contract_reused_from_action_666de: true,
  });
  expect(evidence.v2_normative_digest.projection_keys).toEqual([
    "archived",
    "company_name",
    "confidence",
    "created_at",
    "direction",
    "entry_high",
    "entry_low",
    "invalidation",
    "owner_user_id",
    "reason_to_avoid",
    "recommendation_id",
    "risk_reward",
    "session_type",
    "setup_type",
    "status",
    "stop_loss",
    "target_1",
    "target_2",
    "thesis",
    "ticker",
    "timeframe",
  ]);
  expect(evidence.text_policy).toEqual({
    nfc_required: true,
    categorical_control_characters_allowed: false,
    narrative_members: ["invalidation", "reason_to_avoid", "thesis"],
    allowed_narrative_control_code_points: ["U+0009", "U+000A", "U+000D"],
    canonical_json_escape_sequences: ["\\t", "\\n", "\\r"],
    literal_control_byte_allowed: false,
    unicode_escape_alternative_allowed: false,
    trim_or_normalization_allowed: false,
    rejected_disposition: "blocked_non_whitespace_narrative_control_character",
  });
  expect(JSON.stringify("alpha\tbeta")).toBe('"alpha\\tbeta"');
  expect(JSON.stringify("alpha\nbeta")).toBe('"alpha\\nbeta"');
  expect(JSON.stringify("alpha\r\nbeta")).toBe('"alpha\\r\\nbeta"');
});

test("666EK bounds future durable binding and keeps the successor source-only", () => {
  const evidence = JSON.parse(source(evidencePath));
  expect(evidence.future_durable_binding).toEqual({
    execution_authorized: false,
    projection_contract_marker_required: true,
    marker_required_on_recommendation_and_position: true,
    initial_marker_value: "legacy_recommendation_normative_projection_v2",
    mixed_contract_retry_allowed: false,
    v1_to_v2_in_place_upgrade_allowed: false,
    owner_matching_copy_required: true,
    next_bounded_objective:
      "position_version_lineage_projection_contract_storage_design",
  });
  expect(evidence.authority_limits).toEqual({
    database_query_performed: false,
    database_mutation_performed: false,
    schema_mutation_performed: false,
    durable_backfill_performed: false,
    constraint_validation_performed: false,
    generated_types_refresh_performed: false,
    runtime_wiring_performed: false,
    grant_or_policy_change_performed: false,
    production_deployment_performed: false,
    provider_or_broker_contact_performed: false,
  });
  expect(evidence.decision).toEqual({
    bounded_objective_closed:
      "position_version_lineage_versioned_projection_successor_contract",
    database_write_authorized: false,
    migration_authorized: false,
    staging_apply_authorized: false,
    production_apply_authorized: false,
    v2_writer_activation_authorized: false,
  });
});

test("666EK documents a registered, credential-free successor contract", () => {
  const documentation = [source(actionPath), source(evidencePath)].join("\n");
  expect(documentation).toMatch(/v2.*projection|projection.*v2/i);
  expect(documentation).not.toMatch(
    /https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i,
  );
  expect(source(roadmapPath)).toMatch(/action 666ek/i);
  expect(source(ledgerPath)).toMatch(/action 666ek/i);

  const registration = JSON.parse(source(registrationPath)) as string[];
  expect(registration.filter((entry) => entry === thisTest)).toEqual([thisTest]);
  expect(new Set(registration).size).toBe(registration.length);
  expect(source(runnerPath).split(JSON.stringify(thisTest)).length - 1).toBe(1);
});
