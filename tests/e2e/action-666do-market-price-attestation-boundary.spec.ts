import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  attestAction666doMarketPrice,
} from "../../lib/action-666do-market-price-attestation-boundary";
import {
  action666doAdversarialInputs,
  action666doCanonicalInput,
} from "../fixtures/action-666do-market-price-attestation-boundary-fixtures";

const root = resolve(__dirname, "../..");
const modulePath = resolve(root, "lib/action-666do-market-price-attestation-boundary.ts");
const dmModulePath = resolve(root, "lib/action-666dm-market-observation-provenance.ts");
const dnModulePath = resolve(root, "lib/action-666dn-market-observation-readback-boundary.ts");
const evaluatorPath = resolve(root, "lib/action-655b-canonical-exit-evaluator.ts");
const docPath = resolve(root, "docs/action-666do-market-price-attestation-boundary.md");
const evidencePath = resolve(root, "docs/evidence/action-666do-market-price-attestation-boundary.json");

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("666DO derives a frozen canonical price attestation from fresh opaque provenance", () => {
  const result = attestAction666doMarketPrice(action666doCanonicalInput);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.value).toMatchObject({
    contract_version: "action_666do_market_price_attestation_v1",
    current_price_units: "1234500",
    runtime_authority_granted: false,
    side_effects_performed: false,
  });
  expect(result.value.attestation_identity).toMatch(/^market_price_attestation:v1:[0-9a-f]{64}$/);
  expect(Object.isFrozen(result.value)).toBe(true);
  expect(JSON.stringify(result.value)).toBe(
    JSON.stringify(Object.fromEntries(Object.entries(result.value).sort(([left], [right]) => left.localeCompare(right)))),
  );
  expect(attestAction666doMarketPrice(action666doCanonicalInput)).toEqual(result);
});

test("666DO rejects noncanonical and out-of-domain price inputs before attestation", () => {
  expect(attestAction666doMarketPrice(action666doAdversarialInputs.reordered)).toEqual({
    ok: false,
    error_code: "noncanonical_input",
    error_path: null,
  });
  for (const input of [
    action666doAdversarialInputs.zeroPrice,
    action666doAdversarialInputs.leadingZeroPrice,
    action666doAdversarialInputs.oversizedPrice,
  ]) {
    expect(attestAction666doMarketPrice(input)).toEqual({
      ok: false,
      error_code: "invalid_price_units",
      error_path: "/current_price_units",
    });
  }
  expect(attestAction666doMarketPrice(action666doAdversarialInputs.staleMarketData)).toEqual({
    ok: false,
    error_code: "freshness_refused",
    error_path: "/market_observation_provenance",
  });
  let reads = 0;
  const hostile = new Proxy({}, { get() { reads += 1; throw new Error("unexpected_property_read"); } });
  expect(attestAction666doMarketPrice(hostile)).toEqual({
    ok: false,
    error_code: "invalid_input_type",
    error_path: null,
  });
  expect(reads).toBe(0);
});

test("666DO remains provider-free and verifies its privacy-safe evidence", () => {
  const source = readFileSync(modulePath, "utf8");
  const dmSource = readFileSync(dmModulePath, "utf8");
  const dnSource = readFileSync(dnModulePath, "utf8");
  const evaluatorSource = readFileSync(evaluatorPath, "utf8");
  const doc = readFileSync(docPath, "utf8");
  const evidenceRaw = readFileSync(evidencePath, "utf8");
  expect(source).not.toMatch(/@supabase|fetch\(|https?:\/\/|process\.env|child_process|market-data/);
  expect(source).toContain("runtime_authority_granted: false");
  expect(source).toContain("side_effects_performed: false");
  expect(dnSource).toContain("maximum_market_data_age_ns");
  expect(evaluatorSource).toContain('maximum_market_data_age_ns: "5000000000"');
  expect(`${doc}\n${evidenceRaw}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(`${doc}\n${evidenceRaw}`).toContain("no raw provider payload");

  const evidence = JSON.parse(evidenceRaw);
  expect(evidence).toEqual({
    contract_version: "trade.action666do.market-price-attestation-boundary.v1",
    action_id: "ACTION_666DO",
    predecessor: {
      protected_main_commit: "f7bb504b16dd824c74b961bc96d6041d625e7822",
      protected_main_tree: "5b9f3a0bce9c1bea5eb0f6d732b89d32bec5c190",
    },
    source_artifact_sha256: {
      "docs/action-666do-market-price-attestation-boundary.md": "b2cc5ebbd90f13105ba45569eacfd6dbb668117da1abe4ca5f1bc396eba8dfc2",
      "lib/action-655b-canonical-exit-evaluator.ts": "bd1db79a948f44293a5e02af94d55d1c965e03c3083aad13ab8ac43b95268af1",
      "lib/action-666dm-market-observation-provenance.ts": "3cc1e027a84948ffb59bdf8e8a9e6f41d19081258a46faf3d362abf3f6af9982",
      "lib/action-666dn-market-observation-readback-boundary.ts": "509de4bb0c924765bbf523a2b8a04eb6f5da3af3b7cd45dae337e42059539823",
      "lib/action-666do-market-price-attestation-boundary.ts": "122577cbf406230381eb29d22ddd6a660d06cb4f22ada753b783333ffe484d8f",
      "tests/fixtures/action-666do-market-price-attestation-boundary-fixtures.ts": "6048f42810f4ca09101639253bf92c9ffbebd9841475e1ca805930c92327c5d1",
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
      price_representation: "sanitized_exact_integer_units_only",
    },
    contract: {
      input_contract_version: "action_666do_market_price_attestation_input_v1",
      output_contract_version: "action_666do_market_price_attestation_v1",
      prerequisite: "fresh_opaque_666dm_666dn_lineage",
      runtime_authority_granted: false,
      side_effects_performed: false,
    },
    next_gate: "separately_authorized_provider_adapter_source_linkage_and_runtime_integration",
  });
  for (const [relativePath, expectedHash] of Object.entries(evidence.source_artifact_sha256)) {
    expect(sha256(resolve(root, relativePath))).toBe(expectedHash);
  }
  for (const mutation of [
    evidenceRaw.replace('"provider_calls": false', '"provider_calls": true'),
    evidenceRaw.replace('"runtime_authority_granted": false', '"runtime_authority_granted": true'),
    evidenceRaw.replace('"deployment": false', '"deployment": true'),
  ]) {
    expect(mutation).not.toBe(evidenceRaw);
    expect(JSON.parse(mutation)).not.toEqual(evidence);
  }
  expect(dmSource).toContain("market_observation_provenance_v1");
});
