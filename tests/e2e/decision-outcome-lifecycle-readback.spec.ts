import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildDecisionOutcomeLifecycleReadback,
  decisionOutcomeLifecycleReadbackFromUnknown,
} from "@/lib/decision-outcome-lifecycle-readback";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { ScheduledOutcomeEvaluationAttempt } from "@/lib/scheduled-outcome-evaluation-receipt";

const observedAt = "2026-09-21T13:30:00.000Z";

function scanRun(
  overrides: Partial<RecommendationScanRun> = {},
): RecommendationScanRun {
  return {
    id: "scan-run-id",
    run_fingerprint: "scan-run-fingerprint",
    trading_date: "2026-09-21",
    window: "morning",
    observed_at: observedAt,
    data_mode: "research_only",
    payload_json: {},
    ...overrides,
  } as RecommendationScanRun;
}

function snapshot(
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  return {
    scan_run_id: "scan-run-fingerprint",
    snapshot_fingerprint: "snapshot-fingerprint",
    source_mode: "research_only",
    data_mode: "research_only",
    is_visible: false,
    status: "hidden",
    payload_json: {
      scan_run_fingerprint: "scan-run-fingerprint",
      visibility_status: "research_only",
    },
    ...overrides,
  } as RecommendationSnapshot;
}

function outcome(
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  return {
    id: "outcome-id",
    snapshot_fingerprint: "snapshot-fingerprint",
    data_completeness: "complete",
    ...overrides,
  } as RecommendationOutcome;
}

function attempt(
  overrides: Partial<ScheduledOutcomeEvaluationAttempt> = {},
): ScheduledOutcomeEvaluationAttempt {
  return {
    status: "completed",
    scheduled_slot_at: "2026-09-21T14:00:00.000Z",
    ...overrides,
  } as ScheduledOutcomeEvaluationAttempt;
}

test("keeps the production-shaped retained-decision gap explicit", () => {
  const readback = buildDecisionOutcomeLifecycleReadback({
    scanRuns: [scanRun()],
    snapshots: [snapshot()],
    outcomes: [],
    scheduledEvaluationAttempts: [],
  });

  expect(readback).toMatchObject({
    status: "decision_retained_outcome_not_attempted",
    decision: {
      scan_run_fingerprint: "scan-run-fingerprint",
      retained_snapshot_count: 1,
      research_only_snapshot_count: 1,
      visible_snapshot_count: 0,
      candidate_decision_record_status: "missing",
      decision_lineage_receipt_status: "missing",
      decision_lineage_receipt_reason_codes: [],
      strategy_id: null,
      strategy_version: null,
      strategy_rollback_identity: null,
      symbol_selection_policy_id: null,
      symbol_selection_policy_version: null,
      observed_universe_version: null,
      coverage_claim: null,
    },
    outcome_evidence: {
      linked_outcome_count: 0,
      retained_scheduled_evaluation_attempt_count: 0,
      scheduled_receipt_attribution: "no_retained_attempt",
    },
  });
  expect(readback.blockers).toEqual([
    "linked_outcome_rows_missing",
    "scheduled_outcome_evaluation_attempt_missing",
  ]);
  expect(decisionOutcomeLifecycleReadbackFromUnknown(readback)).toEqual(readback);
});

test("uses immutable identifiers instead of recency or unrelated rows", () => {
  const retainedDecision = scanRun({
    id: "retained-scan-id",
    run_fingerprint: "retained-scan-fingerprint",
    observed_at: "2026-09-21T13:00:00.000Z",
  });
  const newestNonDecisionScan = scanRun({
    id: "newest-scan-id",
    run_fingerprint: "newest-scan-fingerprint",
    observed_at: "2026-09-21T14:00:00.000Z",
  });
  const retainedSnapshot = snapshot({
    scan_run_id: "retained-scan-fingerprint",
    snapshot_fingerprint: "retained-snapshot-fingerprint",
    payload_json: { scan_run_fingerprint: "retained-scan-fingerprint" },
  });
  const conflictedSnapshot = snapshot({
    scan_run_id: "retained-scan-fingerprint",
    snapshot_fingerprint: "conflicted-snapshot-fingerprint",
    payload_json: { scan_run_fingerprint: "different-scan-fingerprint" },
  });

  const readback = buildDecisionOutcomeLifecycleReadback({
    scanRuns: [newestNonDecisionScan, retainedDecision],
    snapshots: [retainedSnapshot, conflictedSnapshot],
    outcomes: [
      outcome({
        id: "linked-outcome",
        snapshot_fingerprint: "retained-snapshot-fingerprint",
      }),
      outcome({
        id: "unrelated-outcome",
        snapshot_fingerprint: "unrelated-snapshot-fingerprint",
      }),
    ],
    scheduledEvaluationAttempts: [],
  });

  expect(readback.status).toBe("decision_retained_outcome_evidence");
  expect(readback.decision.scan_run_fingerprint).toBe(
    "retained-scan-fingerprint",
  );
  expect(readback.decision.retained_snapshot_count).toBe(1);
  expect(readback.decision.identity_conflict_excluded_snapshot_count).toBe(1);
  expect(readback.outcome_evidence.linked_outcome_count).toBe(1);
  expect(readback.outcome_evidence.complete_linked_outcome_count).toBe(1);
});

test("does not attribute a scheduled receipt to a decision without an exact outcome row", () => {
  const readback = buildDecisionOutcomeLifecycleReadback({
    scanRuns: [scanRun()],
    snapshots: [snapshot()],
    outcomes: [],
    scheduledEvaluationAttempts: [attempt()],
  });

  expect(readback.status).toBe("decision_retained_outcome_unproven");
  expect(readback.outcome_evidence).toMatchObject({
    linked_outcome_count: 0,
    retained_scheduled_evaluation_attempt_count: 1,
    latest_scheduled_evaluation_status: "completed",
    scheduled_receipt_attribution: "not_decision_attributable",
  });
  expect(readback.blockers).toContain(
    "scheduled_receipt_not_decision_attributable",
  );
});

test("fails closed for malformed lifecycle JSON", () => {
  const readback = buildDecisionOutcomeLifecycleReadback({
    scanRuns: [scanRun()],
    snapshots: [snapshot()],
    outcomes: [],
    scheduledEvaluationAttempts: [],
  });

  expect(
    decisionOutcomeLifecycleReadbackFromUnknown({
      ...readback,
      outcome_evidence: {
        ...readback.outcome_evidence,
        linked_outcome_count: -1,
      },
    }),
  ).toBeNull();
  expect(
    decisionOutcomeLifecycleReadbackFromUnknown({
      ...readback,
      decision: {
        ...readback.decision,
        decision_lineage_receipt_status: "reconstructable",
        strategy_id: "fabricated_strategy",
      },
    }),
  ).toBeNull();
  expect(
    decisionOutcomeLifecycleReadbackFromUnknown({
      ...readback,
      status: "high_confidence",
    }),
  ).toBeNull();
});

test("the authenticated dashboard exposes the derived lifecycle contract", () => {
  const root = process.cwd();
  const dataAccess = readFileSync(
    join(root, "lib/server/application-data-access.ts"),
    "utf8",
  );
  const browser = readFileSync(join(root, "app/trade-app.tsx"), "utf8");

  expect(dataAccess).toContain('import "server-only"');
  expect(dataAccess).toContain("buildDecisionOutcomeLifecycleReadback");
  expect(dataAccess).toContain("decision_outcome_lifecycle: decisionOutcomeLifecycle");
  expect(browser).toContain("decisionOutcomeLifecycleReadbackFromUnknown");
  expect(browser).toContain("DecisionOutcomeLifecycleReadbackPanel");
  expect(browser).toContain("Strategy and symbol-selection identity");
  expect(browser).not.toContain('from "@/lib/supabase"');
});
