import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  createAction666dmMarketObservationProvenance,
  validateAction666dmMarketObservationProvenance,
} from "../../lib/action-666dm-market-observation-provenance";
import {
  action666dmAdversarialCanonicalInputs,
  action666dmCanonicalInput,
  action666dmExpectedProvenance,
} from "../fixtures/action-666dm-market-observation-provenance-fixtures";

const root = resolve(__dirname, "../..");
const modulePath = resolve(root, "lib/action-666dm-market-observation-provenance.ts");
const docPath = resolve(root, "docs/action-666dm-provider-neutral-market-observation-provenance.md");
const evidencePath = resolve(root, "docs/evidence/action-666dm-provider-neutral-market-observation-provenance.json");

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("666DM constructs a frozen provider-neutral commitment for the 655G market-data fields", () => {
  const result = createAction666dmMarketObservationProvenance(action666dmCanonicalInput);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.value).toEqual(action666dmExpectedProvenance);
  expect(Object.isFrozen(result.value)).toBe(true);
  expect(result.value.side_effects_performed).toBe(false);
  expect(validateAction666dmMarketObservationProvenance(JSON.stringify(result.value))).toEqual({
    valid: true,
    value: result.value,
  });
});

test("666DM rejects noncanonical, malformed and provider-shaped input before construction", () => {
  expect(createAction666dmMarketObservationProvenance(action666dmAdversarialCanonicalInputs.reordered)).toMatchObject({
    ok: false,
    error_code: "noncanonical_input",
  });
  expect(createAction666dmMarketObservationProvenance(action666dmAdversarialCanonicalInputs.sourceIdentity)).toEqual({
    ok: false,
    error_code: "invalid_source_identity",
    error_path: "/source_identity",
  });
  expect(createAction666dmMarketObservationProvenance(action666dmAdversarialCanonicalInputs.observedAt)).toEqual({
    ok: false,
    error_code: "invalid_observed_at",
    error_path: "/source_observed_at",
  });
  expect(createAction666dmMarketObservationProvenance(action666dmAdversarialCanonicalInputs.yearZero)).toEqual({
    ok: false,
    error_code: "invalid_observed_at",
    error_path: "/source_observed_at",
  });
  expect(createAction666dmMarketObservationProvenance(action666dmAdversarialCanonicalInputs.instrumentIdentity)).toEqual({
    ok: false,
    error_code: "invalid_instrument_identity",
    error_path: "/instrument_identity",
  });
  expect(createAction666dmMarketObservationProvenance("{}" as unknown)).toMatchObject({ ok: false, error_code: "invalid_shape" });
  expect(createAction666dmMarketObservationProvenance("[]" as unknown)).toMatchObject({ ok: false, error_code: "invalid_shape" });
});

test("666DM rejects non-string objects without reading their traps", () => {
  let reads = 0;
  const hostile = new Proxy({}, { get() { reads += 1; throw new Error("unexpected_property_read"); } });
  expect(createAction666dmMarketObservationProvenance(hostile)).toEqual({
    ok: false,
    error_code: "invalid_input_type",
    error_path: null,
  });
  expect(validateAction666dmMarketObservationProvenance(hostile)).toEqual({
    valid: false,
    error_code: "invalid_input_type",
    error_path: null,
  });
  expect(reads).toBe(0);
});

test("666DM validator fails closed on each bound market-data commitment", () => {
  const built = createAction666dmMarketObservationProvenance(action666dmCanonicalInput);
  expect(built.ok).toBe(true);
  if (!built.ok) return;
  for (const [key, value] of Object.entries({
    market_data_observation_identity: `market_observation:v1:${"0".repeat(64)}`,
    market_data_digest: "0".repeat(64),
    market_data_observed_at: "2026-08-22T12:00:00.123456788Z",
    source_identity: `market_source:v1:${"0".repeat(64)}`,
    provenance_digest: "0".repeat(64),
    side_effects_performed: true,
  })) {
    const candidate = { ...built.value, [key]: value };
    const result = validateAction666dmMarketObservationProvenance(JSON.stringify(candidate));
    expect(result.valid, key).toBe(false);
  }
});

test("666DM remains source-only and its documented evidence contains no raw provider material", () => {
  const source = readFileSync(modulePath, "utf8");
  const doc = readFileSync(docPath, "utf8");
  const evidenceRaw = readFileSync(evidencePath, "utf8");
  expect(source).not.toMatch(/@supabase|fetch\(|https?:\/\/|process\.env|market-data/);
  expect(source).toContain("side_effects_performed: false");
  expect(`${doc}\n${evidenceRaw}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(`${doc}\n${evidenceRaw}`).toContain("no raw provider payload");

  const evidence = JSON.parse(evidenceRaw);
  expect(evidence).toEqual({
    contract_version: "trade.action666dm.provider_neutral_market_observation_provenance.v1",
    action_id: "ACTION_666DM",
    predecessor: {
      protected_main_commit: "4efcea11a73c3e8a96fac0a9872392c166844eb4",
      protected_main_tree: "a93872a575afcd9dc4076a8963a536c1f7bfd961",
    },
    source_artifact_sha256: {
      "docs/action-666dm-provider-neutral-market-observation-provenance.md": "6a96f69c934ef8c1f2707c8fd44bb4bd3483f3e52d2d7349ca926b40a1f640f5",
      "lib/action-666dm-market-observation-provenance.ts": "3cc1e027a84948ffb59bdf8e8a9e6f41d19081258a46faf3d362abf3f6af9982",
      "tests/fixtures/action-666dm-market-observation-provenance-fixtures.ts": "39d4f424e16e44f083af6ff09d9e62dc368e296c26765b0a950f1a7f4c15d7cc",
    },
    delivery: {
      kind: "source_only_candidate",
      runtime_wiring: false,
      provider_calls: false,
      database_operations: false,
      deployment: false,
      broker_operations: false,
    },
    privacy: {
      no_raw_provider_payload: true,
      no_connection_or_credential_material: true,
      source_reference_kind: "opaque_sha256_commitment_only",
    },
    contract: {
      input_contract_version: "action_666dm_market_observation_input_v1",
      output_contract_version: "action_666dm_market_observation_provenance_v1",
      output_is_655g_compatible_commitment_only: true,
      side_effects_performed: false,
    },
    next_gate: "separately_reviewed_adapter_and_freshness_integration",
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(resolve(root, relativePath))).toBe(expectedHash);
  }
  for (const mutation of [
    evidenceRaw.replace('"provider_calls": false', '"provider_calls": true'),
    evidenceRaw.replace('"database_operations": false', '"database_operations": true'),
    evidenceRaw.replace('"runtime_wiring": false', '"runtime_wiring": true'),
    evidenceRaw.replace('"broker_operations": false', '"broker_operations": true'),
  ]) {
    expect(mutation).not.toBe(evidenceRaw);
    expect(JSON.parse(mutation)).not.toEqual(evidence);
  }
});
