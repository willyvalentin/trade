import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const reportPath =
  "docs/evidence/action-667m5a-raw-receive-lag-report.json";
const admissionPath =
  "docs/evidence/action-667m5a-raw-dataset-admission.json";

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(",")}]`;
  }
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) =>
      left < right ? -1 : left > right ? 1 : 0,
    )
    .map(
      ([key, child]) =>
        `${JSON.stringify(key)}:${stable(child)}`,
    )
    .join(",")}}`;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

const reportRaw = readFileSync(reportPath);
const report = JSON.parse(reportRaw.toString("utf8")) as {
  report_digest: string;
  report: {
    input: Record<string, unknown>;
    record_reconciliation: Record<string, unknown> & {
      five_exact_sessions: unknown[];
    };
    symbology: Record<string, unknown> & { symbols: unknown[] };
    receive_lag_study: {
      all_computable_records: Record<string, unknown> & {
        after_candle_finalization_watermark: Record<
          string,
          unknown
        >;
      };
      thresholds_ns: Record<string, unknown>;
      per_file: unknown[];
      per_symbol: unknown[];
      per_session: unknown[];
      per_publisher: unknown[];
    };
    semantic_classification: Record<string, unknown>;
    watermark_recommendation: Record<string, unknown>;
    admission: Record<string, unknown>;
    provider_calls: number;
    credentials_loaded: boolean;
    read_only_analysis: boolean;
  };
};
const admissionRaw = readFileSync(admissionPath, "utf8");
const admission = JSON.parse(admissionRaw) as {
  evidence_digest: string;
  decision_material: {
    determinism: Record<string, unknown>;
    statuses: Record<string, unknown>;
  };
};

test("M.5A canonical report and compact evidence digests are exact", () => {
  expect(sha256(stable(report.report))).toBe(
    report.report_digest,
  );
  expect(sha256(reportRaw)).toBe(
    "93e24ed7d2ebfb4be31fe727be098295aa62475617da9bf03fc8b8653019ac27",
  );
  expect(sha256(stable(admission.decision_material))).toBe(
    admission.evidence_digest,
  );
  expect(admission.evidence_digest).toBe(
    "954d68fd88133eb939b62aad2a359b0f6e57df503ba6cb4295af41379b2e2d37",
  );
});

test("raw admission reconciles exact files, records, sessions, and symbols", () => {
  expect(report.report.input).toMatchObject({
    file_count: 5,
    total_compressed_bytes: 7_729_852,
    hashes_before_and_after_identical: true,
  });
  expect(report.report.record_reconciliation).toMatchObject({
    support_record_count: 516_162,
    decoded_record_count: 516_162,
    reconciled: true,
    thirteen_symbol_universe_exact: true,
    exact_duplicate_record_count: 692,
  });
  expect(
    report.report.record_reconciliation.five_exact_sessions,
  ).toHaveLength(5);
  expect(report.report.symbology.symbols).toHaveLength(13);
  expect(report.report.symbology).toMatchObject({
    unknown_instrument_record_count: 0,
    mapping_inference_used: false,
  });
});

test("receive-lag evidence includes exact required thresholds and groups", () => {
  const study = report.report.receive_lag_study;
  expect(study.all_computable_records).toMatchObject({
    count: 516_162,
    minimum_ns: 17_328,
    median_ns: 90_439,
    p90_ns: 159_503,
    p95_ns: 300_494,
    p99_ns: 959_754,
    p99_9_ns: 5_940_924,
    maximum_ns: 66_456_177,
  });
  expect(Object.keys(study.thresholds_ns).sort()).toEqual(
    [
      "100ms",
      "250ms",
      "500ms",
      "1s",
      "2s",
      "3s",
      "5s",
      "10s",
    ].sort(),
  );
  expect(study.per_file).toHaveLength(5);
  expect(study.per_symbol).toHaveLength(13);
  expect(study.per_session).toHaveLength(5);
  expect(study.per_publisher).toHaveLength(1);
  expect(
    study.all_computable_records
      .after_candle_finalization_watermark["2s"],
  ).toMatchObject({
    count: 0,
    total: 516_162,
    fraction: "0/516162",
  });
});

test("semantic uncertainty is explicit and watermark remains unvalidated", () => {
  expect(report.report.semantic_classification).toMatchObject({
    trade_action: {
      known_value: "T",
      unknown_or_unsupported_count: 0,
    },
    flags: {
      unknown_or_reserved_bit_record_count: 0,
      publisher_specific_unresolved_record_count: 0,
      bad_receive_timestamp_record_count: 0,
    },
    sale_conditions: {
      status: "not_exposed_by_dbn_trades_record_schema",
      mapping_attempted: false,
      inference_used: false,
    },
  });
  expect(report.report.watermark_recommendation).toMatchObject({
    current_validation_status: "empirically_unvalidated",
    recommendation: "insufficient_evidence",
    normative_watermark_changed: false,
    retain_or_increase_decision_authorized: false,
  });
});

test("two-run and cross-timezone determinism are bound without downstream authority", () => {
  expect(admission.decision_material.determinism).toMatchObject({
    two_utc_runs_byte_identical: true,
    cross_timezone_byte_identical: true,
    report_digest:
      "f478b8fabcd8825f9bef5fae04cc799c588491e6d9cf139b575cec1c26b6a894",
  });
  expect(admission.decision_material.statuses).toMatchObject({
    action_667m5a_raw_dataset_admitted: true,
    action_667m5a_decoder_provenance_verified: true,
    action_667m5a_record_inventory_reconciled: true,
    action_667m5a_receive_lag_study_complete: true,
    action_667m5a_two_run_determinism_passed: true,
    action_667m5a_watermark_recommendation:
      "insufficient_evidence",
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
});

test("repository evidence contains no private provider identifiers or raw records", () => {
  const combined = `${reportRaw.toString("utf8")}\n${admissionRaw}`;
  for (const forbidden of [
    /"job_id"\s*:/i,
    /"account_id"\s*:/i,
    /"billing_id"\s*:/i,
    /"request_id"\s*:/i,
    /"credential_value"\s*:/i,
    /"raw_records"\s*:/i,
  ]) {
    expect(combined).not.toMatch(forbidden);
  }
  expect(report.report).toMatchObject({
    provider_calls: 0,
    credentials_loaded: false,
    read_only_analysis: true,
  });
  expect(report.report.admission).toMatchObject({
    candle_normalization_performed: false,
    historical_replay_performed: false,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
});
