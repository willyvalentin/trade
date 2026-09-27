import "server-only";

import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type {
  RecommendationEvaluationCharterReadResult,
  RecommendationEvaluationCharterWriteResult,
} from "@/lib/recommendation-evaluation-charter-store";
import {
  buildRecommendationLearningBaselineSegmentation,
  type RecommendationLearningBaselineSegment,
} from "@/lib/recommendation-learning-baseline-segments";
import { parseRecommendationLearningBaselineSource } from "@/lib/recommendation-learning-baseline-source";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import { readRecommendationLearningBaselineSource } from "@/lib/server/application-data-access";
import {
  readRecommendationEvaluationCharters,
  recordRecommendationEvaluationCharter,
} from "@/lib/server/recommendation-evaluation-charter-persistence";
import {
  scannerClockPriorShadowEvaluationCharterAuthority,
  scannerClockPriorShadowEvaluationCharterDefinition,
} from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

type SegmentReadResult =
  | { status: "available"; segments: RecommendationLearningBaselineSegment[] }
  | { status: "unavailable"; segments: [] };

export type ScannerClockPriorShadowEvaluationCharterDependencies = {
  readSegments: (ownerUserId: string) => Promise<SegmentReadResult>;
  readCharters: (
    ownerUserId: string,
  ) => Promise<RecommendationEvaluationCharterReadResult>;
  recordCharter: (
    input: NonNullable<ReturnType<typeof buildRecommendationEvaluationCharterInput>>,
  ) => Promise<RecommendationEvaluationCharterWriteResult>;
};

export type ScannerClockPriorShadowEvaluationCharterActivationResult =
  | {
      status: "recorded" | "already_recorded";
      charter: RecommendationEvaluationCharter;
      safe_blocker: null;
      authority: typeof scannerClockPriorShadowEvaluationCharterAuthority;
    }
  | {
      status:
        | "invalid_request"
        | "not_ready"
        | "different_charter_already_recorded"
        | "unavailable";
      charter: null;
      safe_blocker: string;
      authority: typeof scannerClockPriorShadowEvaluationCharterAuthority;
    };

async function readCurrentSegments(ownerUserId: string): Promise<SegmentReadResult> {
  const sourceResult = await readRecommendationLearningBaselineSource(ownerUserId);
  if (sourceResult.status !== "available") {
    return { status: "unavailable", segments: [] };
  }
  const source = parseRecommendationLearningBaselineSource(sourceResult.data);
  if (!source) return { status: "unavailable", segments: [] };
  return {
    status: "available",
    segments: buildRecommendationLearningBaselineSegmentation({
      scanRuns: source.scanRuns,
      snapshots: source.snapshots,
      outcomes: source.outcomes,
    }).segments,
  };
}

const productionDependencies: ScannerClockPriorShadowEvaluationCharterDependencies = {
  readSegments: readCurrentSegments,
  readCharters: readRecommendationEvaluationCharters,
  recordCharter: recordRecommendationEvaluationCharter,
};

function unavailable(
  status: Exclude<
    ScannerClockPriorShadowEvaluationCharterActivationResult["status"],
    "recorded" | "already_recorded"
  >,
  safeBlocker: string,
): ScannerClockPriorShadowEvaluationCharterActivationResult {
  return {
    status,
    charter: null,
    safe_blocker: safeBlocker,
    authority: scannerClockPriorShadowEvaluationCharterAuthority,
  };
}

function activationRequest(value: unknown) {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).length !== 1 ||
    typeof (value as Record<string, unknown>).segment_key !== "string"
  ) {
    return null;
  }
  const segmentKey = (value as { segment_key: string }).segment_key;
  return segmentKey.length >= 1 && segmentKey.length <= 16_384
    ? segmentKey
    : null;
}

function matchingCharter(
  charters: RecommendationEvaluationCharter[],
  fingerprint: string,
) {
  const matches = charters.filter(
    (charter) => charter.charter_fingerprint === fingerprint,
  );
  return matches.length === 1 ? matches[0]! : null;
}

export function createScannerClockPriorShadowEvaluationCharterService(
  dependencies: ScannerClockPriorShadowEvaluationCharterDependencies =
    productionDependencies,
) {
  return {
    async activate({
      ownerUserId,
      request,
    }: {
      ownerUserId: string;
      request: unknown;
    }): Promise<ScannerClockPriorShadowEvaluationCharterActivationResult> {
      const segmentKey = activationRequest(request);
      if (!segmentKey) {
        return unavailable(
          "invalid_request",
          "clock_prior_evaluation_charter_activation_request_invalid",
        );
      }

      const [segments, charters] = await Promise.all([
        dependencies.readSegments(ownerUserId),
        dependencies.readCharters(ownerUserId),
      ]);
      if (segments.status !== "available" || charters.status === "unavailable") {
        return unavailable(
          "unavailable",
          "clock_prior_evaluation_charter_activation_evidence_unavailable",
        );
      }
      const matchingSegments = segments.segments.filter(
        (segment) =>
          segment.segment_key === segmentKey &&
          segment.policy_attribution.canonical_evaluation_versions
            .ranking_version === SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
      );
      if (matchingSegments.length !== 1) {
        return unavailable(
          "not_ready",
          "clock_prior_evaluation_charter_baseline_segment_missing_or_ambiguous",
        );
      }

      const segment = matchingSegments[0]!;
      const input = buildRecommendationEvaluationCharterInput({
        ownerUserId,
        segmentKey,
        policy: segment.policy_attribution,
        charter: scannerClockPriorShadowEvaluationCharterDefinition,
      });
      if (!input) {
        return unavailable(
          "unavailable",
          "clock_prior_evaluation_charter_server_profile_invalid",
        );
      }

      const existing = matchingCharter(charters.charters, input.charter_fingerprint);
      if (existing) {
        return {
          status: "already_recorded",
          charter: existing,
          safe_blocker: null,
          authority: scannerClockPriorShadowEvaluationCharterAuthority,
        };
      }
      if (charters.charters.some((charter) => charter.segment_key === segmentKey)) {
        return unavailable(
          "different_charter_already_recorded",
          "different_recommendation_evaluation_charter_already_recorded",
        );
      }

      const write = await dependencies.recordCharter(input);
      if (
        write.status !== "recorded" &&
        write.status !== "already_recorded"
      ) {
        return unavailable(
          write.status === "different_charter_already_recorded"
            ? "different_charter_already_recorded"
            : "unavailable",
          write.safe_blocker ??
            "clock_prior_evaluation_charter_activation_write_unavailable",
        );
      }
      const readback = await dependencies.readCharters(ownerUserId);
      if (readback.status !== "available") {
        return unavailable(
          "unavailable",
          "clock_prior_evaluation_charter_activation_readback_unavailable",
        );
      }
      const recorded = matchingCharter(
        readback.charters,
        input.charter_fingerprint,
      );
      if (
        !recorded ||
        recorded.charter_id !== write.charter.charter_id ||
        recorded.created_at !== write.charter.created_at
      ) {
        return unavailable(
          "unavailable",
          "clock_prior_evaluation_charter_activation_readback_mismatch",
        );
      }
      return {
        status: write.status,
        charter: recorded,
        safe_blocker: null,
        authority: scannerClockPriorShadowEvaluationCharterAuthority,
      };
    },
  };
}

const currentService = createScannerClockPriorShadowEvaluationCharterService();

export function activateCurrentScannerClockPriorShadowEvaluationCharter(input: {
  ownerUserId: string;
  request: unknown;
}) {
  return currentService.activate(input);
}
