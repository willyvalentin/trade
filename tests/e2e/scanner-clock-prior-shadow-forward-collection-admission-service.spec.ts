import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type {
  ScannerClockPriorShadowForwardDecisionPlanReceipt,
} from "@/lib/scanner-clock-prior-shadow-forward-decision-store";
import { scannerClockPriorShadowForwardPlanProfile } from "@/lib/scanner-clock-prior-shadow-forward-plan-profile";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  assessScannerClockPriorShadowForwardCollectionAdmission,
} from "@/lib/server/scanner-clock-prior-shadow-forward-collection-admission";
import {
  createScannerClockPriorShadowForwardCollectionAdmissionService,
  scannerClockPriorShadowForwardCollectionAdmissionAuthority,
  type ScannerClockPriorShadowForwardCollectionAdmissionDependencies,
} from "@/lib/server/scanner-clock-prior-shadow-forward-collection-admission-service";
import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  buildScannerClockPriorShadowPolicyReference,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

const ownerUserId = "11111111-1111-4111-8111-111111111111";
const charterId = "22222222-2222-4222-8222-222222222222";
const planId = "33333333-3333-4333-8333-333333333333";
const segmentKey = "clock-prior:all-us-equities";

const charterInput = buildRecommendationEvaluationCharterInput({
  ownerUserId,
  segmentKey,
  policy: {
    recommendation_publish_policy_version: "recommendation_publish_policy_v1",
    canonical_evaluation_versions: {
      engine_version: "engine_v1",
      scoring_version: "scoring_v1",
      ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
      setup_taxonomy_version: "setup_v1",
      confidence_contract_version: "confidence_v1",
      evaluator_version: "evaluator_v1",
      provider_contract_version: "provider_v1",
      git_commit: "fixture-commit",
      build_identity: "fixture-build",
    },
  },
  charter: scannerClockPriorShadowEvaluationCharterDefinition,
});
if (!charterInput) throw new Error("charter fixture must build");
const charter: RecommendationEvaluationCharter = {
  ...charterInput,
  charter_id: charterId,
  created_at: "2026-09-27T08:00:00.000Z",
};
const policyReference = buildScannerClockPriorShadowPolicyReference({
  charter,
  createdAt: charter.created_at,
});
if (!policyReference) throw new Error("policy reference fixture must build");
const plan = buildScannerClockPriorShadowForwardDecisionPlan({
  created_at: "2026-09-27T08:01:00.000Z",
  owner_user_id: ownerUserId,
  segment_key: segmentKey,
  hypothesis: charter.charter.hypothesis,
  evaluation_charter_id: charterId,
  evaluation_charter_fingerprint: charter.charter_fingerprint,
  policy_reference: policyReference,
  baseline_ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  candidate_ranking_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
  primary_k: scannerClockPriorShadowForwardPlanProfile.primary_k,
  windows: scannerClockPriorShadowForwardPlanProfile.windows,
  thresholds: scannerClockPriorShadowForwardPlanProfile.thresholds,
});
if (!plan) throw new Error("plan fixture must build");

const planReceipt: ScannerClockPriorShadowForwardDecisionPlanReceipt = {
  plan_id: planId,
  plan_fingerprint: plan.plan_fingerprint,
  owner_user_id: ownerUserId,
  plan,
  recorded_at: "2026-09-27T08:02:00.000Z",
};

function dependencies(
  overrides: Partial<
    ScannerClockPriorShadowForwardCollectionAdmissionDependencies
  > = {},
): ScannerClockPriorShadowForwardCollectionAdmissionDependencies {
  return {
    readPlans: async () => ({
      status: "available",
      receipts: [planReceipt],
      safe_blocker: null,
    }),
    readEvidence: async () => ({
      status: "available",
      scanRuns: [],
      source_counts: {
        window_scan_rows: 2,
        clock_prior_scan_rows: 0,
      },
      safe_blocker: null,
    }),
    assess: assessScannerClockPriorShadowForwardCollectionAdmission,
    ...overrides,
  };
}

test("reads the exact owner-bound plan and emits Monday's predeclared admission", async () => {
  const service = createScannerClockPriorShadowForwardCollectionAdmissionService(
    dependencies(),
  );
  const result = await service.read({
    ownerUserId,
    now: new Date("2026-09-28T13:10:00.000Z"),
  });

  expect(result.status).toBe("available");
  if (result.status !== "available") return;
  expect(result.plan_receipt).toEqual(planReceipt);
  expect(result.source_counts).toEqual({
    window_scan_rows: 2,
    clock_prior_scan_rows: 0,
  });
  expect(result.admission).toMatchObject({
    status: "admitted",
    target_trading_date: "2026-09-28",
    target_partition: "held_out",
    target_day: {
      admitted_slots: [
        "2026-09-28T13:30:00.000Z",
        "2026-09-28T13:45:00.000Z",
        "2026-09-28T14:00:00.000Z",
        "2026-09-28T14:15:00.000Z",
      ],
      maximum_provider_credits: 32,
    },
  });
  expect(result.authority).toEqual(
    scannerClockPriorShadowForwardCollectionAdmissionAuthority,
  );
  expect(Object.values(result.authority).every((value) => value === false)).toBe(
    true,
  );
});

test("derives the target date from New York rather than the server's UTC date", async () => {
  const service = createScannerClockPriorShadowForwardCollectionAdmissionService(
    dependencies(),
  );
  const result = await service.read({
    ownerUserId,
    now: new Date("2026-09-29T02:00:00.000Z"),
  });

  expect(result.status).toBe("available");
  if (result.status !== "available") return;
  expect(result.admission.target_trading_date).toBe("2026-09-28");
});

test("fails closed when the frozen plan is absent or ambiguous", async () => {
  const notFound = createScannerClockPriorShadowForwardCollectionAdmissionService(
    dependencies({
      readPlans: async () => ({
        status: "not_found",
        receipts: [],
        safe_blocker: "clock_prior_forward_decision_plan_not_found",
      }),
    }),
  );
  await expect(notFound.read({ ownerUserId })).resolves.toMatchObject({
    status: "not_ready",
    safe_blocker: "clock_prior_forward_collection_admission_plan_not_found",
    admission: null,
  });

  const ambiguous = createScannerClockPriorShadowForwardCollectionAdmissionService(
    dependencies({
      readPlans: async () => ({
        status: "available",
        receipts: [
          planReceipt,
          {
            ...planReceipt,
            plan_id: "44444444-4444-4444-8444-444444444444",
          },
        ],
        safe_blocker: null,
      }),
    }),
  );
  await expect(ambiguous.read({ ownerUserId })).resolves.toMatchObject({
    status: "conflicting",
    safe_blocker:
      "clock_prior_forward_collection_admission_plan_missing_or_ambiguous",
    admission: null,
  });
});

test("rejects a plan receipt that is not bound to the authenticated owner", async () => {
  let evidenceRead = false;
  const mismatchedReceipt = {
    ...planReceipt,
    owner_user_id: "55555555-5555-4555-8555-555555555555",
  };
  const service = createScannerClockPriorShadowForwardCollectionAdmissionService(
    dependencies({
      readPlans: async () => ({
        status: "available",
        receipts: [mismatchedReceipt],
        safe_blocker: null,
      }),
      readEvidence: async () => {
        evidenceRead = true;
        return dependencies().readEvidence(ownerUserId, plan);
      },
    }),
  );

  await expect(service.read({ ownerUserId })).resolves.toMatchObject({
    status: "conflicting",
    safe_blocker:
      "clock_prior_forward_collection_admission_plan_owner_mismatched",
    admission: null,
  });
  expect(evidenceRead).toBe(false);
});

test("propagates bounded scan-read failures without attempting admission", async () => {
  let assessed = false;
  const service = createScannerClockPriorShadowForwardCollectionAdmissionService(
    dependencies({
      readEvidence: async () => ({
        status: "failed",
        scanRuns: null,
        source_counts: null,
        safe_blocker:
          "clock_prior_forward_collection_scan_evidence_incomplete_or_unbounded",
      }),
      assess: (input) => {
        assessed = true;
        return dependencies().assess(input);
      },
    }),
  );
  const result = await service.read({ ownerUserId });

  expect(result).toMatchObject({
    status: "unavailable",
    safe_blocker:
      "clock_prior_forward_collection_scan_evidence_incomplete_or_unbounded",
    admission: null,
  });
  expect(assessed).toBe(false);
});

test("returns a blocked admission as evidence instead of hiding plan drift", async () => {
  const driftedReceipt = {
    ...planReceipt,
    plan: { ...plan, primary_k: 1 },
  } as ScannerClockPriorShadowForwardDecisionPlanReceipt;
  const service = createScannerClockPriorShadowForwardCollectionAdmissionService(
    dependencies({
      readPlans: async () => ({
        status: "available",
        receipts: [driftedReceipt],
        safe_blocker: null,
      }),
    }),
  );
  const result = await service.read({
    ownerUserId,
    now: new Date("2026-09-28T13:10:00.000Z"),
  });

  expect(result.status).toBe("available");
  if (result.status !== "available") return;
  expect(result.admission.status).toBe("blocked");
  expect(result.admission.reason_codes).toEqual([
    "frozen_plan_invalid_or_drifted",
  ]);
  expect(result.admission.target_day.maximum_provider_credits).toBe(0);
});

test("the readback route is session-bound, uncached, and read-only", () => {
  const route = readFileSync(resolve(
    process.cwd(),
    "app/api/app/scanner-clock-prior-shadow-forward-collection-admission/route.ts",
  ), "utf8");

  expect(route).toContain("requireApplicationSession");
  expect(route).toContain("session.owner_user_id");
  expect(route).toContain('export const dynamic = "force-dynamic"');
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).toContain("source_counts");
  expect(route).not.toMatch(/export async function (POST|PUT|PATCH|DELETE)/);
  expect(route).not.toContain("runScan");
  expect(route).not.toContain("provider");
  expect(route).not.toContain("publishCandidate");
  expect(route).not.toContain("broker");
});
