import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import {
  diagnosticNormalizationPreflightFixtureV1,
  MARKET_CONTEXT_ACTION_667M5H_SYNTHETIC_FIXTURES_V1,
} from "../../lib/market-context-intelligence-lab/diagnostic-trade-to-candle-normalization-fixtures-v1";
import {
  evaluateDiagnosticNormalizationPreflightV1,
  MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_POLICY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_TRADE_TO_CANDLE_NORMALIZATION_V1,
  stableDiagnosticNormalizationJsonV1,
  type MarketContextDiagnosticNormalizationPreflightV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-trade-to-candle-normalization-v1";

function canonical(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function fileSha256(path: string) {
  return createHash("sha256")
    .update(readFileSync(path))
    .digest("hex");
}

test("M.5H machine evidence and implementation bindings are exact", () => {
  const evidence = JSON.parse(
    readFileSync(
      "docs/evidence/action-667m5h-diagnostic-normalization.json",
      "utf8",
    ),
  );
  const material = evidence.decision_material;
  expect(
    createHash("sha256").update(canonical(material)).digest("hex"),
  ).toBe(evidence.evidence_digest);
  expect(
    fileSha256(material.implementation_bindings.typescript_contract_path),
  ).toBe(
    material.implementation_bindings.typescript_contract_sha256,
  );
  expect(
    fileSha256(material.implementation_bindings.fixtures_path),
  ).toBe(material.implementation_bindings.fixtures_sha256);
  expect(
    fileSha256(material.implementation_bindings.normalizer_path),
  ).toBe(material.implementation_bindings.normalizer_sha256);
  expect(material.statuses).toMatchObject({
    action_667m5h_diagnostic_normalization_completed: true,
    action_667m5h_raw_to_candle_lineage_verified: true,
    action_667m5h_gap_and_coverage_report_ready: true,
    action_667m5h_two_run_determinism_passed: true,
    action_667m5h_normalized_dataset_admitted: true,
    action_667m5i_diagnostic_replay_ready: true,
    replay_authorized: false,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
});

test("M.5H diagnostic preflight is versioned and diagnostic-only", () => {
  expect(
    MARKET_CONTEXT_DIAGNOSTIC_TRADE_TO_CANDLE_NORMALIZATION_V1,
  ).toBe(
    "market_context_diagnostic_trade_to_candle_normalization_v1",
  );
  expect(MARKET_CONTEXT_ACTION_667M5H_SYNTHETIC_FIXTURES_V1).toBe(
    "market_context_action_667m5h_synthetic_fixtures_v1",
  );

  const input = diagnosticNormalizationPreflightFixtureV1();
  const before = stableDiagnosticNormalizationJsonV1(input);
  const result = evaluateDiagnosticNormalizationPreflightV1(input);

  expect(result).toMatchObject({
    status: "diagnostic_normalization_ready",
    reason_codes: [],
    duplicate_treatment:
      MARKET_CONTEXT_DIAGNOSTIC_DUPLICATE_POLICY_V1,
    records_expected: 2_420_049,
    normalization_authorized: true,
    replay_authorized: false,
    canonical_binding_ready: false,
    live_ranking_effect: false,
    input_immutable_required: true,
  });
  expect(result.result_digest).toMatch(/^[a-f0-9]{64}$/);
  expect(stableDiagnosticNormalizationJsonV1(input)).toBe(before);
});

test("M.5H binds every byte-identical record to a unique identity and forbids dedupe", () => {
  const input = diagnosticNormalizationPreflightFixtureV1();
  expect(input.duplicate_handling).toEqual({
    policy:
      "include_each_unique_raw_identity_no_deduplication_v1",
    exact_duplicate_record_count: 3_399,
    silent_deduplication_allowed: false,
    stable_identity:
      "source_file_sha256_plus_zero_based_record_ordinal",
    stable_identity_collision_count: 0,
  });

  input.duplicate_handling.silent_deduplication_allowed =
    true as false;
  const result = evaluateDiagnosticNormalizationPreflightV1(input);
  expect(result.status).toBe("not_ready");
  expect(result.reason_codes).toContain(
    "duplicate_policy_or_stable_identity_invalid",
  );
  expect(result.normalization_authorized).toBe(false);
});

test("M.5H fails closed on raw, calendar, inventory, timestamp or decoder drift", () => {
  const cases: Array<{
    mutate: (
      input: MarketContextDiagnosticNormalizationPreflightV1,
    ) => void;
    reason: string;
  }> = [
    {
      mutate: (input) => {
        input.evidence.raw_file_digest_root = "0".repeat(64);
      },
      reason: "raw_policy_calendar_or_scope_digest_drift",
    },
    {
      mutate: (input) => {
        input.calendar.session_dates.pop();
      },
      reason: "session_calendar_drift",
    },
    {
      mutate: (input) => {
        input.admitted_inventory.flags["64"] = 1;
        input.admitted_inventory.unknown_flag_bit_count = 1;
      },
      reason: "unknown_or_drifted_action_or_flag_inventory",
    },
    {
      mutate: (input) => {
        input.admitted_inventory.negative_receive_lag_count = 1;
      },
      reason: "timestamp_scope_or_sentinel_admission_failed",
    },
    {
      mutate: (input) => {
        Object.assign(input.decoder, { version: "0.64.0" });
      },
      reason: "decoder_provenance_invalid",
    },
    {
      mutate: (input) => {
        input.output.destination_filevault_encrypted = false;
      },
      reason: "encrypted_output_boundary_invalid",
    },
  ];

  for (const scenario of cases) {
    const input = diagnosticNormalizationPreflightFixtureV1();
    scenario.mutate(input);
    const result = evaluateDiagnosticNormalizationPreflightV1(input);
    expect(result.status).toBe("not_ready");
    expect(result.reason_codes).toContain(scenario.reason);
    expect(result.normalization_authorized).toBe(false);
  }
});

test("official, canonical, adjusted or live claims are conflicting", () => {
  const mutations: Array<
    (
      input: MarketContextDiagnosticNormalizationPreflightV1,
    ) => void
  > = [
    (input) => {
      Object.assign(input.claims, {
        official_ohlcv_claimed: true,
      });
    },
    (input) => {
      Object.assign(input.claims, {
        canonical_performance_eligible: true,
      });
    },
    (input) => {
      Object.assign(input.claims, {
        corporate_actions_applied: true,
      });
    },
    (input) => {
      Object.assign(input.claims, {
        live_ranking_effect: true,
      });
    },
  ];

  for (const mutate of mutations) {
    const input = diagnosticNormalizationPreflightFixtureV1();
    mutate(input);
    const result = evaluateDiagnosticNormalizationPreflightV1(input);
    expect(result.status).toBe("conflicting");
    expect(result.reason_codes).toContain(
      "official_canonical_adjusted_or_live_claim_forbidden",
    );
    expect(result.replay_authorized).toBe(false);
    expect(result.canonical_binding_ready).toBe(false);
    expect(result.live_ranking_effect).toBe(false);
  }
});

test("watermark is fixed at provisional unvalidated two seconds", () => {
  const input = diagnosticNormalizationPreflightFixtureV1();
  input.claims.watermark_value_ns =
    "3000000000" as "2000000000";
  const result = evaluateDiagnosticNormalizationPreflightV1(input);

  expect(result.status).toBe("not_ready");
  expect(result.reason_codes).toContain(
    "diagnostic_claim_or_watermark_invalid",
  );
});
