import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

import {
  marketContextDiagnosticCandlePolicyFixtureV1,
  MARKET_CONTEXT_ACTION_667M5G_SYNTHETIC_FIXTURES_V1,
} from "../../lib/market-context-intelligence-lab/diagnostic-all-reported-trades-candle-fixtures-v1";
import {
  evaluateMarketContextDiagnosticCandlePolicyV1,
  MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1,
  MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1,
  MARKET_CONTEXT_DIAGNOSTIC_NORMALIZATION_GATE_V1,
  MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1,
  MARKET_CONTEXT_SALE_CONDITION_GAP_DECISION_V1,
  stableMarketContextDiagnosticCandlePolicyJsonV1,
  type MarketContextDiagnosticCandlePolicyInputV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-all-reported-trades-candle-policy-v1";

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

test("M.5G machine evidence and implementation bindings are exact", () => {
  const evidence = JSON.parse(
    readFileSync(
      "docs/evidence/action-667m5g-sale-condition-gap-decision.json",
      "utf8",
    ),
  );
  const material = evidence.decision_material;
  expect(
    createHash("sha256").update(canonical(material)).digest("hex"),
  ).toBe(evidence.evidence_digest);
  expect(
    fileSha256(material.artifact_bindings.policy_path),
  ).toBe(material.artifact_bindings.policy_sha256);
  expect(
    fileSha256(material.artifact_bindings.fixtures_path),
  ).toBe(material.artifact_bindings.fixtures_sha256);
  expect(material.statuses).toMatchObject({
    action_667m5g_sale_condition_gap_classified: true,
    action_667m5g_diagnostic_candle_policy_ready: true,
    action_667m5g_official_ohlcv_claim_prevented: true,
    action_667m5g_independent_review_approved: true,
    action_667m5h_diagnostic_normalization_ready: true,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
});

test("M.5G versions and diagnostic-only semantic boundary are explicit", () => {
  expect(
    MARKET_CONTEXT_DIAGNOSTIC_ALL_REPORTED_TRADES_CANDLE_POLICY_V1,
  ).toBe(
    "market_context_diagnostic_all_reported_trades_candle_policy_v1",
  );
  expect(MARKET_CONTEXT_SALE_CONDITION_GAP_DECISION_V1).toBe(
    "market_context_sale_condition_gap_decision_2026_07_28_v1",
  );
  expect(MARKET_CONTEXT_DIAGNOSTIC_NORMALIZATION_GATE_V1).toBe(
    "market_context_diagnostic_normalization_gate_v1",
  );
  expect(MARKET_CONTEXT_ACTION_667M5G_SYNTHETIC_FIXTURES_V1).toBe(
    "market_context_action_667m5g_synthetic_fixtures_v1",
  );

  const input = marketContextDiagnosticCandlePolicyFixtureV1();
  const before =
    stableMarketContextDiagnosticCandlePolicyJsonV1(input);
  const result =
    evaluateMarketContextDiagnosticCandlePolicyV1(input);

  expect(result).toMatchObject({
    status: "diagnostic_normalization_ready",
    reason_codes: [],
    official_ohlcv_claim_prevented: true,
    sale_condition_gap_classification:
      "diagnostic_only_with_explicit_non_official_semantics",
    input_immutable: true,
    metadata_inferred: false,
    normalization_performed: false,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
    shadow_only: true,
    live_ranking_effect: false,
  });
  expect(result.decision_digest).toMatch(/^[a-f0-9]{64}$/);
  expect(
    stableMarketContextDiagnosticCandlePolicyJsonV1(input),
  ).toBe(before);
});

test("only the diagnostic all-reported-trades usage class is ready", () => {
  const result = evaluateMarketContextDiagnosticCandlePolicyV1(
    marketContextDiagnosticCandlePolicyFixtureV1(),
  );

  expect(result.usage_classes).toEqual({
    provider_official_or_eligibility_filtered_candles: {
      allowed: false,
      classification: "not_ready",
      blocker: "sale_condition_or_eligibility_evidence_required",
    },
    diagnostic_all_reported_trades_candles: {
      allowed: true,
      classification: "diagnostic_normalization_ready",
      claim: "diagnostic_all_reported_trades_not_official_ohlcv",
    },
    canonical_performance_or_evaluation_candles: {
      allowed: false,
      classification: "not_ready",
      blocker:
        "canonical_eligibility_and_adjustment_evidence_required",
    },
    live_ranking_inputs: {
      allowed: false,
      classification: "not_ready",
      blocker: "live_use_forbidden",
    },
  });
  expect(result.output_contract).toMatchObject({
    namespace: MARKET_CONTEXT_DIAGNOSTIC_CANDLE_NAMESPACE_V1,
    source_trade_semantics: "all_reported_trade_records",
    official_ohlcv_claimed: false,
    canonical_performance_eligible: false,
    raw_unadjusted: true,
    corporate_actions_included: false,
    no_forward_fill: true,
    explicit_gaps: true,
    candles_emitted_by_gate: 0,
  });
});

test("the two-second watermark remains provisional and unvalidated", () => {
  const result = evaluateMarketContextDiagnosticCandlePolicyV1(
    marketContextDiagnosticCandlePolicyFixtureV1(),
  );

  expect(result.watermark).toEqual({
    identity:
      MARKET_CONTEXT_DIAGNOSTIC_PROVISIONAL_WATERMARK_V1,
    value_ns: "2000000000",
    status: "empirically_unvalidated",
    twenty_session_receive_lag_gate_passed: true,
    sale_condition_gap_resolved: false,
    provider_certified: false,
    production_ready: false,
    threshold_changed: false,
  });

  const changed = marketContextDiagnosticCandlePolicyFixtureV1();
  Object.assign(changed.watermark, { value_ns: "3000000000" });
  const rejected =
    evaluateMarketContextDiagnosticCandlePolicyV1(changed);
  expect(rejected.status).toBe("not_ready");
  expect(rejected.reason_codes).toContain(
    "provisional_diagnostic_watermark_invalid",
  );
});

test("unknown actions, flags, publisher or raw lineage fail closed", () => {
  const cases: Array<{
    mutate: (
      value: MarketContextDiagnosticCandlePolicyInputV1,
    ) => void;
    reason: string;
  }> = [
    {
      mutate: (value) => {
        value.observed_inventory.actions = {
          T: 2_420_048,
          X: 1,
        };
        value.observed_inventory.unknown_action_count = 1;
      },
      reason: "unknown_or_unsupported_action",
    },
    {
      mutate: (value) => {
        value.observed_inventory.flags["64"] = 1;
        value.observed_inventory.unknown_flag_bit_count = 1;
      },
      reason: "unknown_or_unsafe_flag",
    },
    {
      mutate: (value) => {
        Object.assign(value.source, { publisher_id: 96 });
      },
      reason: "publisher_drift",
    },
    {
      mutate: (value) => {
        value.evidence.raw_file_digest_root = "0".repeat(64);
      },
      reason: "raw_digest_drift",
    },
    {
      mutate: (value) => {
        value.lineage.record_identity_complete = false;
      },
      reason: "raw_record_bucket_lineage_or_tiebreak_missing",
    },
  ];

  for (const scenario of cases) {
    const input = marketContextDiagnosticCandlePolicyFixtureV1();
    scenario.mutate(input);
    const result =
      evaluateMarketContextDiagnosticCandlePolicyV1(input);
    expect(result.status).toBe("not_ready");
    expect(result.reason_codes).toContain(scenario.reason);
    expect(
      result.usage_classes
        .diagnostic_all_reported_trades_candles.allowed,
    ).toBe(false);
  }
});

test("calendar, timestamp and point-in-time violations fail closed", () => {
  const missingSession =
    marketContextDiagnosticCandlePolicyFixtureV1();
  missingSession.calendar.session_dates.pop();
  missingSession.calendar.missing_or_unknown_session_count = 1;
  expect(
    evaluateMarketContextDiagnosticCandlePolicyV1(missingSession)
      .reason_codes,
  ).toContain("session_calendar_missing_or_invalid");

  const negativeLag =
    marketContextDiagnosticCandlePolicyFixtureV1();
  negativeLag.observed_inventory.negative_receive_lag_count = 1;
  expect(
    evaluateMarketContextDiagnosticCandlePolicyV1(negativeLag)
      .reason_codes,
  ).toContain("negative_receive_lag");

  const future = marketContextDiagnosticCandlePolicyFixtureV1();
  future.point_in_time.maximum_ts_event_unix_ns =
    "1784937600000000001";
  future.point_in_time.event_after_as_of_count = 1;
  expect(
    evaluateMarketContextDiagnosticCandlePolicyV1(future)
      .reason_codes,
  ).toContain("point_in_time_as_of_violation");
});

test("new sale-condition data without a frozen mapping is conflicting", () => {
  const input = marketContextDiagnosticCandlePolicyFixtureV1();
  input.sale_conditions.semantics_available = true;
  input.sale_conditions.mapping_status =
    "available_mapping_not_frozen";

  const result =
    evaluateMarketContextDiagnosticCandlePolicyV1(input);
  expect(result.status).toBe("conflicting");
  expect(result.reason_codes).toContain(
    "sale_condition_data_present_without_frozen_mapping",
  );
  expect(
    result.usage_classes.diagnostic_all_reported_trades_candles
      .allowed,
  ).toBe(false);
});

test("official, canonical, live or adjustment claims are conflicting", () => {
  const claimMutations: Array<
    (
      value: MarketContextDiagnosticCandlePolicyInputV1,
    ) => void
  > = [
    (value) => {
      Object.assign(value.requested_claims, {
        official_ohlcv_claimed: true,
      });
    },
    (value) => {
      Object.assign(value.requested_claims, {
        canonical_performance_eligible: true,
      });
    },
    (value) => {
      Object.assign(value.requested_claims, {
        live_ranking_effect: true,
      });
    },
    (value) => {
      Object.assign(value.adjustment, {
        adjustment_inferred: true,
      });
    },
  ];

  for (const mutate of claimMutations) {
    const input = marketContextDiagnosticCandlePolicyFixtureV1();
    mutate(input);
    const result =
      evaluateMarketContextDiagnosticCandlePolicyV1(input);
    expect(result.status).toBe("conflicting");
    expect(result.official_ohlcv_claim_prevented).toBe(true);
    expect(result.normalization_authorized).toBe(false);
    expect(result.canonical_binding_ready).toBe(false);
    expect(result.live_ranking_effect).toBe(false);
  }
});

test("malformed runtime input returns a deterministic rejection", () => {
  const malformed = null as unknown as
    MarketContextDiagnosticCandlePolicyInputV1;
  const first =
    evaluateMarketContextDiagnosticCandlePolicyV1(malformed);
  const second =
    evaluateMarketContextDiagnosticCandlePolicyV1(malformed);

  expect(first.status).toBe("not_ready");
  expect(first.reason_codes.length).toBeGreaterThan(0);
  expect(
    stableMarketContextDiagnosticCandlePolicyJsonV1(first),
  ).toBe(stableMarketContextDiagnosticCandlePolicyJsonV1(second));
});
