import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

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
  snapshots: Array<Pick<RecommendationSnapshot, "intake_quality_json">>,
): RecommendationIntakeQualityProvenance {
  const eligibleSnapshotCount = snapshots.length;
  const receipts = snapshots.map((snapshot) =>
    recommendationIntakeQualityReceiptFromUnknown(snapshot.intake_quality_json),
  );
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
