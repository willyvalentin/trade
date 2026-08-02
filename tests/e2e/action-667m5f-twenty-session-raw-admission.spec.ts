import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const reportPath =
  "docs/evidence/action-667m5f-twenty-session-receive-lag-report.json";
const evidencePath =
  "docs/evidence/action-667m5f-twenty-session-raw-admission.json";

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

test("M.5F evidence and twenty-session report remain canonical", () => {
  const reportBytes = readFileSync(reportPath);
  const report = JSON.parse(reportBytes.toString("utf8"));
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  const material = evidence.decision_material;

  expect(
    createHash("sha256").update(reportBytes).digest("hex"),
  ).toBe(
    "b0d8a4ee6ec12f4689a2d3e9aa209c1e1d6a77652d6f835e1115fe2b448c8622",
  );
  expect(
    createHash("sha256").update(canonical(report.report)).digest("hex"),
  ).toBe(report.report_digest);
  expect(report.report_digest).toBe(
    "f89ba8123f48c0553e3aa03a361edde1c5f593c8a953d44e385983ca7dc5abe4",
  );
  expect(
    createHash("sha256")
      .update(canonical(material))
      .digest("hex"),
  ).toBe(evidence.evidence_digest);
});

test("M.5F reconciles the exact admitted 15 plus 5 session scope", () => {
  const report = JSON.parse(readFileSync(reportPath, "utf8")).report;
  const input = report.input;
  const reconciliation = report.record_reconciliation;
  const calibration = report.source_group_raw_admission.calibration;

  expect(input).toMatchObject({
    file_count: 20,
    source_group_file_counts: {
      calibration: 15,
      pilot: 5,
    },
    total_compressed_bytes: 35_949_632,
    hashes_before_and_after_identical: true,
    partial_extra_or_temporary_file_count: 0,
  });
  expect(
    input.raw_files.some(
      (item: { filename: string }) =>
        item.filename.includes("20260703"),
    ),
  ).toBe(false);
  expect(reconciliation).toMatchObject({
    support_record_count: 2_420_049,
    decoded_record_count: 2_420_049,
    reconciled: true,
    source_group_record_counts: {
      calibration: 1_903_887,
      pilot: 516_162,
    },
    publisher_ids: { "95": 2_420_049 },
    actions: { T: 2_420_049 },
  });
  expect(reconciliation.twenty_exact_sessions).toHaveLength(20);
  expect(calibration).toMatchObject({
    record_count: 1_903_887,
    file_count: 15,
    session_count: 15,
    symbol_count: 13,
    publisher_ids: { "95": 1_903_887 },
    actions: { T: 1_903_887 },
    flags: { "0": 482_926, "128": 1_420_961 },
    unknown_action_count: 0,
    unknown_flag_bit_count: 0,
    exact_duplicate_record_count: 2_707,
    timestamp_validity: {
      negative_receive_lag_count: 0,
      undefined_ts_event_count: 0,
      undefined_ts_recv_count: 0,
    },
    fallback_identity: {
      identity_count: 1_903_887,
      unique_identity_count: 1_903_887,
      collision_count: 0,
    },
  });
});

test("M.5F preserves the watermark policy and authorization boundary", () => {
  const report = JSON.parse(readFileSync(reportPath, "utf8")).report;
  const lag = report.receive_lag_study;
  const watermark = report.watermark_recommendation;

  expect(lag.all_computable_records).toMatchObject({
    count: 2_420_049,
    minimum_ns: 17_239,
    median_ns: 89_817,
    p90_ns: 154_379,
    p95_ns: 274_357,
    p99_ns: 916_381,
    p99_9_ns: 4_953_390,
    maximum_ns: 244_157_745,
  });
  for (const threshold of ["1s", "2s", "3s", "5s"]) {
    expect(lag.late_record_risk[threshold].count).toBe(0);
  }
  expect(watermark).toMatchObject({
    current_normative_watermark_ns: 2_000_000_000,
    current_validation_status: "empirically_unvalidated",
    recommendation: "insufficient_evidence",
    normative_watermark_changed: false,
    retain_or_increase_decision_authorized: false,
    rule_checks: {
      minimum_20_sessions: true,
      sale_condition_semantics_observable: false,
    },
  });
  expect(report.semantic_classification.sale_conditions).toEqual({
    status: "not_exposed_by_dbn_trades_record_schema",
    mapping_attempted: false,
    inference_used: false,
  });
  expect(report.admission).toMatchObject({
    normalization_gate_ready: true,
    candle_normalization_performed: false,
    historical_replay_performed: false,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
});
