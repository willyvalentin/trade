import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  assessAction666dnMarketObservationReadback,
} from "../../lib/action-666dn-market-observation-readback-boundary";
import {
  action666dnAdversarialInputs,
  action666dnCanonicalInput,
} from "../fixtures/action-666dn-market-observation-readback-boundary-fixtures";

const root = resolve(__dirname, "../..");
const modulePath = resolve(root, "lib/action-666dn-market-observation-readback-boundary.ts");
const dmModulePath = resolve(root, "lib/action-666dm-market-observation-provenance.ts");
const evaluatorPath = resolve(root, "lib/action-655b-canonical-exit-evaluator.ts");
const docPath = resolve(root, "docs/action-666dn-market-observation-readback-boundary.md");
const evidencePath = resolve(root, "docs/evidence/action-666dn-market-observation-readback-boundary.json");

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("666DN derives a frozen, canonical freshness assessment without runtime authority", () => {
  const result = assessAction666dnMarketObservationReadback(action666dnCanonicalInput);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.value).toMatchObject({
    assessment_kind: "freshness_satisfied",
    contract_version: "action_666dn_market_observation_readback_boundary_v1",
    maximum_market_data_age_ns: "5000000000",
    refusal_code: null,
    runtime_authority_granted: false,
    side_effects_performed: false,
  });
  expect(result.value.assessment_identity).toMatch(/^market_readback_boundary:v1:[0-9a-f]{64}$/);
  expect(Object.isFrozen(result.value)).toBe(true);
  expect(JSON.stringify(result.value)).toBe(
    JSON.stringify(Object.fromEntries(Object.entries(result.value).sort(([left], [right]) => left.localeCompare(right)))),
  );
  expect(assessAction666dnMarketObservationReadback(action666dnCanonicalInput)).toEqual(result);
});

test("666DN rejects malformed input and preserves 666DM as an opaque canonical prerequisite", () => {
  expect(assessAction666dnMarketObservationReadback(action666dnAdversarialInputs.reordered)).toMatchObject({
    ok: false,
    error_code: "noncanonical_input",
  });
  expect(assessAction666dnMarketObservationReadback(action666dnAdversarialInputs.invalidProvenance)).toEqual({
    ok: false,
    error_code: "invalid_provenance",
    error_path: "/market_observation_provenance",
  });
  expect(assessAction666dnMarketObservationReadback(action666dnAdversarialInputs.invalidObservedAt)).toEqual({
    ok: false,
    error_code: "invalid_observed_at",
    error_path: "/decision_requested_at",
  });
  let reads = 0;
  const hostile = new Proxy({}, { get() { reads += 1; throw new Error("unexpected_property_read"); } });
  expect(assessAction666dnMarketObservationReadback(hostile)).toEqual({
    ok: false,
    error_code: "invalid_input_type",
    error_path: null,
  });
  expect(reads).toBe(0);
});

test("666DN mirrors the 655G freshness ordering but never admits runtime use", () => {
  for (const [input, refusalCode] of [
    [action666dnAdversarialInputs.futureMarketData, "future_market_data"],
    [action666dnAdversarialInputs.futureObservation, "future_observation"],
    [action666dnAdversarialInputs.staleObservation, "stale_observation"],
    [action666dnAdversarialInputs.staleMarketData, "stale_observation"],
  ] as const) {
    const result = assessAction666dnMarketObservationReadback(input);
    expect(result).toMatchObject({
      ok: true,
      value: {
        assessment_kind: "freshness_refused",
        refusal_code: refusalCode,
        runtime_authority_granted: false,
        side_effects_performed: false,
      },
    });
  }
});

test("666DN remains provider-free and freezes its exact source-only authority boundary", () => {
  const source = readFileSync(modulePath, "utf8");
  const dmSource = readFileSync(dmModulePath, "utf8");
  const evaluatorSource = readFileSync(evaluatorPath, "utf8");
  const doc = readFileSync(docPath, "utf8");
  const evidenceRaw = readFileSync(evidencePath, "utf8");
  expect(source).not.toMatch(/@supabase|fetch\(|https?:\/\/|process\.env|child_process|market-data/);
  expect(source).toContain("runtime_authority_granted: false");
  expect(source).toContain("side_effects_performed: false");
  expect(evaluatorSource).toContain('maximum_market_data_age_ns: "5000000000"');
  expect(`${doc}\n${evidenceRaw}`).not.toMatch(/https?:\/\/|sk-[A-Za-z0-9]|eyJ[a-zA-Z0-9_-]{20,}|(?:api[_ -]?key|authorization|bearer|password|credential)\s*[:=]\s*["']?\S+/i);
  expect(`${doc}\n${evidenceRaw}`).toContain("no raw provider payload");

  const evidence = JSON.parse(evidenceRaw);
  expect(evidence).toEqual({
    contract_version: "trade.action666dn.market-observation-readback-boundary.v1",
    action_id: "ACTION_666DN",
    predecessor: {
      protected_main_commit: "d2a1a17c615349b6fd774ef3fc10a9ca9ea46bf4",
      protected_main_tree: "d440d6b6f301e844e234ccef5a01af286a3ff6d1",
    },
    source_artifact_sha256: {
      "docs/action-666dn-market-observation-readback-boundary.md": "31b6586e37df476fa36f4fb24617bb5e5bf50e15156047b861917b4b2566f55f",
      "lib/action-655b-canonical-exit-evaluator.ts": "bd1db79a948f44293a5e02af94d55d1c965e03c3083aad13ab8ac43b95268af1",
      "lib/action-666dm-market-observation-provenance.ts": "3cc1e027a84948ffb59bdf8e8a9e6f41d19081258a46faf3d362abf3f6af9982",
      "lib/action-666dn-market-observation-readback-boundary.ts": "509de4bb0c924765bbf523a2b8a04eb6f5da3af3b7cd45dae337e42059539823",
      "tests/fixtures/action-666dn-market-observation-readback-boundary-fixtures.ts": "82afaa61dc55bf8c1c22810204d1931cf89a52f717b2541526706863841d9af8",
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
      source_reference_kind: "opaque_666dm_commitment_only",
    },
    contract: {
      input_contract_version: "action_666dn_market_observation_readback_input_v1",
      output_contract_version: "action_666dn_market_observation_readback_boundary_v1",
      action_655g_freshness_profile: "maximum_market_data_age_ns_5000000000",
      runtime_authority_granted: false,
      side_effects_performed: false,
    },
    next_gate: "separately_authorized_provider_readback_adapter_and_runtime_integration",
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
