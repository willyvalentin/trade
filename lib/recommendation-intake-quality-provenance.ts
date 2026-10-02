import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import {
  buildCompletedInputResearchIntakeQualityResult,
  COMPLETED_INPUT_RESEARCH_INTAKE_QUALITY_RESULT_VERSION,
} from "@/lib/recommendation-intake-quality";
import { scannerDecisionInputSnapshotFromUnknown } from "@/lib/scanner-decision-input-snapshot";
import { COMPLETED_INPUT_RESEARCH_CAPTURE_VERSION } from "@/lib/completed-input-research-selection";

export type IntakeQualityEvidenceSnapshot =
  Pick<RecommendationSnapshot, "intake_quality_json"> & Partial<RecommendationSnapshot>;

/**
 * A small, strict read model for persisted intake-quality receipts. It is
 * shared by outcome receipts and baseline readiness so a malformed receipt
 * cannot be accepted by one learning boundary and rejected by another.
 */
export type RecommendationIntakeQualityReceipt = {
  result_version: string;
  status: "accepted" | "needs_review" | "rejected" | "incomplete";
  grade: "A" | "B" | "C" | "D" | "F" | "unknown";
  accepted_for_visible_list: boolean;
};

export type RecommendationIntakeQualityProvenance = {
  status: "not_recorded" | "unavailable" | "complete" | "mixed" | "incomplete";
  eligible_snapshot_count: number;
  valid_receipt_count: number;
  missing_receipt_count: number;
  invalid_receipt_count: number;
  accepted_for_visible_list_count: number;
  result_versions: string[];
  result_statuses: string[];
  grades: string[];
};

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function uniqueSorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort();
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function finiteNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value :
    typeof value === "string" && value.trim() ? Number(value) : NaN;
  return Number.isFinite(number) ? number : null;
}

/** Validate the new research diagnostic against retained decision-time context,
 * not refreshed data or the evaluation clock. This is diagnostic consistency,
 * not independent reproduction of the scanner's ordinal score or provider data.
 * Source/decision/owner admission remains a separate mandatory learning gate.
 * Legacy receipts keep their original structural validation contract. */
function completedInputAssessmentMatches(snapshot: IntakeQualityEvidenceSnapshot): boolean {
  const payload = objectOrNull(snapshot.payload_json);
  const ticker = textOrNull(snapshot.ticker);
  const decisionAt = textOrNull(snapshot.recommended_at);
  const candidateId = textOrNull(payload?.candidate_id);
  if (!payload || !ticker || !decisionAt || !candidateId ||
    !Number.isFinite(Date.parse(decisionAt)) ||
    payload.decision_timestamp !== decisionAt ||
    payload.research_capture_version !== COMPLETED_INPUT_RESEARCH_CAPTURE_VERSION ||
    snapshot.source_mode !== "research_only" || snapshot.is_visible !== false ||
    snapshot.status !== "hidden" || snapshot.side !== "long" ||
    snapshot.recommendation_id !== null) return false;
  const input = scannerDecisionInputSnapshotFromUnknown(
    payload.scanner_decision_input_snapshot, ticker, decisionAt,
  );
  if (!input?.current_session ||
    payload.data_timestamp !== input.current_session.latest_bar_started_at) return false;
  const marketSession = objectOrNull(payload.market_session);
  const expected = {
    ...buildCompletedInputResearchIntakeQualityResult({
      ticker,
      company_name: snapshot.company_name,
      direction: "long",
      entry_price: snapshot.entry,
      entry_low: snapshot.entry_low,
      entry_high: snapshot.entry_high,
      stop_price: snapshot.stop,
      target_price: snapshot.target,
      current_price: input.features.latest_close,
      confidence_score: finiteNumber(snapshot.score),
      setup_type: textOrNull(payload.setup_type),
      reason_text: snapshot.rationale,
      generated_at: decisionAt,
      market_data_timestamp: input.current_session.latest_bar_started_at,
      market_data_stale: false,
      latest_volume: input.intraday_indicators?.latestVolume,
      average_volume: input.intraday_indicators?.averageVolume,
      market_session: {
        phase: textOrNull(marketSession?.phase),
        risk_level: textOrNull(marketSession?.risk_level),
        source: textOrNull(marketSession?.source),
        is_market_open: typeof marketSession?.market_is_open === "boolean"
          ? marketSession.market_is_open : null,
      },
      now: decisionAt,
    }),
    result_id: `recommendation-intake-research-${candidateId}`,
  };
  return canonicalJson(snapshot.intake_quality_json) === canonicalJson(expected);
}

export function recommendationIntakeQualityReceiptFromUnknown(
  value: unknown,
): RecommendationIntakeQualityReceipt | null {
  const raw = objectOrNull(value);
  const resultVersion = textOrNull(raw?.result_version);
  const status = raw?.status;
  const grade = raw?.grade;

  if (
    !raw ||
    raw.result_kind !== "recommendation_intake_quality" ||
    raw.internal_only !== true ||
    !resultVersion ||
    (status !== "accepted" &&
      status !== "needs_review" &&
      status !== "rejected" &&
      status !== "incomplete") ||
    (grade !== "A" &&
      grade !== "B" &&
      grade !== "C" &&
      grade !== "D" &&
      grade !== "F" &&
      grade !== "unknown") ||
    typeof raw.accepted_for_visible_list !== "boolean"
  ) {
    return null;
  }

  return {
    result_version: resultVersion,
    status,
    grade,
    accepted_for_visible_list: raw.accepted_for_visible_list,
  };
}

export function buildRecommendationIntakeQualityProvenance(
  snapshots: IntakeQualityEvidenceSnapshot[],
): RecommendationIntakeQualityProvenance {
  const eligibleSnapshotCount = snapshots.length;
  const receipts = snapshots.map((snapshot) => {
    const receipt = recommendationIntakeQualityReceiptFromUnknown(snapshot.intake_quality_json);
    return receipt?.result_version === COMPLETED_INPUT_RESEARCH_INTAKE_QUALITY_RESULT_VERSION &&
      !completedInputAssessmentMatches(snapshot) ? null : receipt;
  });
  const validReceipts = receipts.filter(
    (receipt): receipt is RecommendationIntakeQualityReceipt => receipt !== null,
  );
  const missingReceiptCount = snapshots.filter(
    (snapshot) =>
      snapshot.intake_quality_json === null ||
      snapshot.intake_quality_json === undefined,
  ).length;
  const invalidReceiptCount =
    eligibleSnapshotCount - validReceipts.length - missingReceiptCount;
  const resultVersions = uniqueSorted(
    validReceipts.map((receipt) => receipt.result_version),
  );
  const resultStatuses = uniqueSorted(
    validReceipts.map((receipt) => receipt.status),
  );
  const grades = uniqueSorted(validReceipts.map((receipt) => receipt.grade));

  return {
    status:
      eligibleSnapshotCount === 0
        ? "unavailable"
        : validReceipts.length === 0 && invalidReceiptCount === 0
          ? "not_recorded"
          : missingReceiptCount > 0 || invalidReceiptCount > 0
            ? "incomplete"
            : resultVersions.length === 1
              ? "complete"
              : "mixed",
    eligible_snapshot_count: eligibleSnapshotCount,
    valid_receipt_count: validReceipts.length,
    missing_receipt_count: missingReceiptCount,
    invalid_receipt_count: invalidReceiptCount,
    accepted_for_visible_list_count: validReceipts.filter(
      (receipt) => receipt.accepted_for_visible_list,
    ).length,
    result_versions: resultVersions,
    result_statuses: resultStatuses,
    grades,
  };
}
