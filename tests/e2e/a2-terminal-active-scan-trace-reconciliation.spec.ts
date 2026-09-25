import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildRecommendationScanRun,
  reconcileRecommendationScanRunTerminalTrace,
} from "@/lib/recommendation-scan-run";

const observedAt = "2026-09-24T16:30:43.189Z";

function productionShapedRun() {
  const scanRun = buildRecommendationScanRun({
    trading_date: "2026-09-24",
    observed_at: observedAt,
    started_at: "2026-09-24T16:30:32.060Z",
    completed_at: observedAt,
    window: "midday",
    source: "supabase",
    data_mode: "supabase_record",
    scanned_ticker_count: 3,
    raw_candidate_count: 3,
    payload: {
      active_scan_trace: {
        last_stage_reached: "persistence",
        stages: {
          final: "not_reached",
        },
        ranking: { ranked_count: 3, selected_count: 0 },
        raw_candidates: { raw_candidate_count: 3 },
        final: {
          decision: null,
          status: null,
          candidates_generated: 0,
          recommendations_served: 0,
          recommendations_created: 0,
          ranked_candidates_count: 0,
          recommendations_published_count: 0,
          recommendations_built_count: 0,
          ranked_candidates_not_published_reason: null,
          no_publish_reason: null,
          recommendation_build_path: null,
          scan_run_fingerprint: null,
          zero_candidate_reason: null,
          selected_candidate_build_diagnostics: [],
          selected_to_built_drop_off: null,
        },
      },
      selected_candidate_build_diagnostics: [],
      selected_to_built_drop_off: {
        selected_count: 0,
        built_count: 0,
        rejected_count: 0,
        rejection_counts: {},
        category_counts: {},
        examples_by_reason: {},
        output_below_target_reason_category: "healthy_caution",
        output_below_target_explanation:
          "Candidate quality did not justify publication.",
      },
    },
  });

  scanRun.payload_json.candidate_decision_record = {
    record_kind: "candidate_decision_record",
    record_version: "candidate_decision_record_v3",
    scan_run_fingerprint: scanRun.run_fingerprint,
    coverage: {
      expected_candidate_count: 8,
      observed_candidate_count: 3,
      ranked_candidate_count: 3,
    },
    candidates: Array.from({ length: 8 }, (_, index) => ({
      ticker: `T${index + 1}`,
      disposition: "not_evaluated",
    })),
    final_decision: {
      disposition: "no_trade",
      no_trade_reason: "no_publishable_ranked_candidates",
      published_tickers: [],
      recommendation_build_path: "no_publish",
    },
  };

  return scanRun;
}

test.describe("A.2 terminal active-scan trace reconciliation", () => {
  test("joins the persisted decision and scan identity into the terminal trace", () => {
    const scanRun = productionShapedRun();
    const reconciled = reconcileRecommendationScanRunTerminalTrace(scanRun);
    const trace = reconciled.payload_json.active_scan_trace as {
      last_stage_reached: string;
      stages: Record<string, unknown>;
      final: Record<string, unknown>;
    };

    expect(reconciled).not.toBe(scanRun);
    expect(trace.final).toMatchObject({
      decision: "scanned",
      status: "completed",
      candidates_generated: 3,
      ranked_candidates_count: 3,
      recommendations_built_count: 0,
      recommendations_published_count: 0,
      no_publish_reason: "no_publishable_ranked_candidates",
      ranked_candidates_not_published_reason:
        "no_publishable_ranked_candidates",
      recommendation_build_path: "no_publish",
      scan_run_fingerprint: scanRun.run_fingerprint,
      zero_candidate_reason: "no_publishable_ranked_candidates",
    });
    expect(trace.last_stage_reached).toBe("final");
    expect(trace.stages.final).toBe("completed");
    expect(scanRun.payload_json.active_scan_trace).not.toEqual(
      reconciled.payload_json.active_scan_trace,
    );
  });

  test("does not treat unobserved universe membership as generated candidates", () => {
    const scanRun = productionShapedRun();
    scanRun.raw_candidate_count = null;
    const trace = scanRun.payload_json.active_scan_trace as {
      raw_candidates: Record<string, unknown>;
      ranking: Record<string, unknown>;
      final: Record<string, unknown>;
    };
    trace.raw_candidates.raw_candidate_count = null;
    trace.ranking.ranked_count = null;
    trace.final.ranked_candidates_count = 0;

    const reconciled = reconcileRecommendationScanRunTerminalTrace(scanRun);
    const reconciledTrace = reconciled.payload_json.active_scan_trace as {
      final: Record<string, unknown>;
    };

    expect(reconciledTrace.final.candidates_generated).toBe(3);
    expect(reconciledTrace.final.ranked_candidates_count).toBe(3);
  });

  test("leaves runs without a candidate decision record unchanged", () => {
    const scanRun = productionShapedRun();
    delete scanRun.payload_json.candidate_decision_record;

    expect(reconcileRecommendationScanRunTerminalTrace(scanRun)).toBe(scanRun);
  });

  test("retains a published decision without inventing no-trade reasons", () => {
    const scanRun = productionShapedRun();
    scanRun.counts.visible_recommendation_count = 0;
    const trace = scanRun.payload_json.active_scan_trace as {
      final: Record<string, unknown>;
    };
    trace.final.decision = "skipped";
    trace.final.candidates_generated = 8;
    trace.final.ranked_candidates_count = 8;
    trace.final.recommendations_created = 3;
    trace.final.recommendations_served = 3;
    trace.final.recommendations_published_count = 3;
    (
      scanRun.payload_json.selected_to_built_drop_off as Record<string, unknown>
    ).built_count = 7;
    trace.final.no_publish_reason = "stale_no_trade_reason";
    trace.final.ranked_candidates_not_published_reason =
      "stale_no_trade_reason";
    trace.final.zero_candidate_reason = "stale_no_trade_reason";
    const record = scanRun.payload_json
      .candidate_decision_record as Record<string, unknown>;
    record.final_decision = {
      disposition: "recommendations_published",
      no_trade_reason: null,
      published_tickers: ["T1"],
      recommendation_build_path: "published",
    };
    (record.candidates as Array<Record<string, unknown>>)[0]!.disposition =
      "published";

    const reconciled = reconcileRecommendationScanRunTerminalTrace(scanRun);
    const reconciledTrace = reconciled.payload_json.active_scan_trace as {
      final: Record<string, unknown>;
    };

    expect(reconciledTrace.final).toMatchObject({
      decision: "scanned",
      candidates_generated: 3,
      ranked_candidates_count: 3,
      recommendations_created: 1,
      recommendations_served: 1,
      recommendations_built_count: 1,
      recommendations_published_count: 1,
      no_publish_reason: null,
      ranked_candidates_not_published_reason: null,
      recommendation_build_path: "published",
      zero_candidate_reason: null,
    });
  });

  test("fails closed on contradictory terminal decision evidence", () => {
    const scanRun = productionShapedRun();
    const record = scanRun.payload_json
      .candidate_decision_record as Record<string, unknown>;
    record.final_decision = {
      disposition: "no_trade",
      no_trade_reason: "no_publishable_ranked_candidates",
      published_tickers: ["T1"],
      recommendation_build_path: "no_publish",
    };

    expect(() => reconcileRecommendationScanRunTerminalTrace(scanRun)).toThrow(
      "candidate_decision_terminal_evidence_invalid",
    );
  });

  test("does not preserve a stale successful terminal state for a failed run", () => {
    const scanRun = productionShapedRun();
    scanRun.status = "failed";
    const trace = scanRun.payload_json.active_scan_trace as {
      final: Record<string, unknown>;
    };
    trace.final.decision = "scanned";
    trace.final.status = "completed";

    const reconciled = reconcileRecommendationScanRunTerminalTrace(scanRun);
    const reconciledTrace = reconciled.payload_json.active_scan_trace as {
      final: Record<string, unknown>;
    };

    expect(reconciledTrace.final).toMatchObject({
      decision: "failed",
      status: "failed",
    });
    const reconciledActiveTrace = reconciled.payload_json.active_scan_trace as {
      last_stage_reached: string;
      stages: Record<string, unknown>;
    };
    expect(reconciledActiveTrace.last_stage_reached).toBe("final");
    expect(reconciledActiveTrace.stages.final).toBe("failed");
  });

  test("fails closed instead of rounding fractional coverage counts", () => {
    const scanRun = productionShapedRun();
    const record = scanRun.payload_json
      .candidate_decision_record as Record<string, unknown>;
    (record.coverage as Record<string, unknown>).observed_candidate_count = 2.5;

    expect(() => reconcileRecommendationScanRunTerminalTrace(scanRun)).toThrow(
      "candidate_decision_terminal_evidence_invalid",
    );
  });

  test("fails closed on decision or trace identity drift", () => {
    const decisionMismatch = productionShapedRun();
    (
      decisionMismatch.payload_json.candidate_decision_record as Record<
        string,
        unknown
      >
    ).scan_run_fingerprint = "rec_scan_run_other";
    expect(() =>
      reconcileRecommendationScanRunTerminalTrace(decisionMismatch),
    ).toThrow("candidate_decision_scan_run_fingerprint_mismatch");

    const traceMismatch = productionShapedRun();
    const trace = traceMismatch.payload_json.active_scan_trace as {
      final: Record<string, unknown>;
    };
    trace.final.scan_run_fingerprint = "rec_scan_run_other";
    expect(() =>
      reconcileRecommendationScanRunTerminalTrace(traceMismatch),
    ).toThrow("active_scan_trace_scan_run_fingerprint_mismatch");
  });

  test("applies reconciliation at the final server persistence boundary", () => {
    const persistenceSource = readFileSync(
      resolve(process.cwd(), "lib/server/recommendation-scan-run-persistence.ts"),
      "utf8",
    );

    expect(persistenceSource).toMatch(
      /const reconciledScanRun =\s*reconcileRecommendationScanRunTerminalTrace\(scanRun\)/,
    );
    expect(persistenceSource).toMatch(
      /\.upsert\?\.\(toSupabaseRow\(reconciledScanRun, ownerUserId\)/,
    );
  });
});
