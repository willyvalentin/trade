import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";

export const DECISION_LINEAGE_RECEIPT_VERSION =
  "decision_lineage_receipt_v1" as const;

export type DecisionLineageReceiptStatus = "reconstructable" | "incomplete";

export type DecisionLineageReceipt = {
  receipt_version: typeof DECISION_LINEAGE_RECEIPT_VERSION;
  receipt_kind: "decision_lineage";
  scan_run_id: string;
  scan_run_fingerprint: string;
  decision_timestamp: string;
  decision_record_version: CandidateDecisionRecord["record_version"];
  decision_categories: {
    published_candidate_count: number;
    rejected_candidate_count: number;
    explicit_no_trade: boolean;
  };
  versions: {
    strategy_version: string | null;
    model: {
      status: "not_applicable";
      version: null;
    };
    engine_version: string | null;
    scoring_version: string | null;
    ranking_version: string | null;
    provider_contract_version: string | null;
    git_commit: string | null;
    build_identity: string | null;
  };
  availability: {
    expected_candidate_count: number;
    observed_candidate_count: number;
    source_timestamp_at_or_before_decision_count: number;
    missing_source_timestamp_count: number;
    source_timestamp_after_decision_count: number;
    ranked_feature_capture_count: number;
  };
  status: DecisionLineageReceiptStatus;
  reason_codes: string[];
};

type DecisionLineageReceiptScanRun = Pick<
  RecommendationScanRun,
  "id" | "run_fingerprint" | "payload_json"
>;

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isoOrNull(value: unknown) {
  const text = textOrNull(value);
  if (!text) return null;

  const timestamp = new Date(text);
  return Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : null;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return null;
  }

  const values = value.map((item) => item.trim());
  return values.every(Boolean) ? values : null;
}

function finiteNonNegative(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }

  const object = objectOrNull(value);
  if (object) {
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value) ?? "null";
}

/**
 * Builds an append-only receipt from the captured scan-run decision record
 * that is persisted alongside it. It makes no market-data request and
 * deliberately represents the current deterministic scanner as
 * model-not-applicable rather than inventing a learned-model version.
 */
export function buildDecisionLineageReceipt(
  record: CandidateDecisionRecord,
): DecisionLineageReceipt {
  const decisionTimestamp = new Date(record.decision_timestamp).toISOString();
  const decisionTime = Date.parse(decisionTimestamp);
  const canonicalVersions =
    record.learning_attribution.canonical_evaluation_versions;
  const strategyVersion =
    record.learning_attribution.recommendation_publish_policy_version ===
    "not_recorded"
      ? null
      : record.learning_attribution.recommendation_publish_policy_version;
  const availability = record.candidates.reduce(
    (summary, candidate) => {
      const sourceTimestamp = candidate.data.source_timestamp;
      const sourceTime = sourceTimestamp ? Date.parse(sourceTimestamp) : Number.NaN;

      if (!Number.isFinite(sourceTime)) {
        summary.missing_source_timestamp_count += 1;
      } else if (sourceTime > decisionTime) {
        summary.source_timestamp_after_decision_count += 1;
      } else {
        summary.source_timestamp_at_or_before_decision_count += 1;
      }

      if (
        candidate.ranking !== null &&
        candidate.ranking.components !== null &&
        typeof candidate.ranking.components === "object"
      ) {
        summary.ranked_feature_capture_count += 1;
      }

      return summary;
    },
    {
      source_timestamp_at_or_before_decision_count: 0,
      missing_source_timestamp_count: 0,
      source_timestamp_after_decision_count: 0,
      ranked_feature_capture_count: 0,
    },
  );
  const rejectedCandidateCount = record.candidates.filter(
    (candidate) => candidate.disposition !== "published",
  ).length;
  const reasonCodes = uniqueSorted([
    ...(record.coverage.full_membership_captured
      ? []
      : ["candidate_membership_incomplete"]),
    ...(canonicalVersions ? [] : ["canonical_version_lineage_missing"]),
    ...(strategyVersion ? [] : ["strategy_version_missing"]),
    ...(availability.missing_source_timestamp_count === 0
      ? []
      : ["source_timestamp_missing"]),
    ...(availability.source_timestamp_after_decision_count === 0
      ? []
      : ["source_timestamp_after_decision"]),
  ]);

  return {
    receipt_version: DECISION_LINEAGE_RECEIPT_VERSION,
    receipt_kind: "decision_lineage",
    scan_run_id: record.scan_run_id,
    scan_run_fingerprint: record.scan_run_fingerprint,
    decision_timestamp: decisionTimestamp,
    decision_record_version: record.record_version,
    decision_categories: {
      published_candidate_count: record.candidates.filter(
        (candidate) => candidate.disposition === "published",
      ).length,
      rejected_candidate_count: rejectedCandidateCount,
      explicit_no_trade: record.final_decision.disposition === "no_trade",
    },
    versions: {
      strategy_version: strategyVersion,
      model: {
        status: "not_applicable",
        version: null,
      },
      engine_version: canonicalVersions?.engine_version ?? null,
      scoring_version: canonicalVersions?.scoring_version ?? null,
      ranking_version: canonicalVersions?.ranking_version ?? null,
      provider_contract_version: canonicalVersions?.provider_contract_version ?? null,
      git_commit: canonicalVersions?.git_commit ?? null,
      build_identity: canonicalVersions?.build_identity ?? null,
    },
    availability: {
      expected_candidate_count: record.coverage.expected_candidate_count,
      observed_candidate_count: record.coverage.observed_candidate_count,
      ...availability,
    },
    status: reasonCodes.length === 0 ? "reconstructable" : "incomplete",
    reason_codes: reasonCodes,
  };
}

/**
 * Browser and dashboard callers must not attribute an arbitrary JSON object to
 * a scan run. Accept only the exact receipt contract, require the immutable
 * scan identity to agree with the owner-scoped row, and compare it with the
 * retained decision record that produced it.
 */
export function decisionLineageReceiptFromScanRun(
  scanRun: DecisionLineageReceiptScanRun,
  record: CandidateDecisionRecord,
): DecisionLineageReceipt | null {
  const raw = objectOrNull(scanRun.payload_json.decision_lineage_receipt);
  const categories = objectOrNull(raw?.decision_categories);
  const versions = objectOrNull(raw?.versions);
  const model = objectOrNull(versions?.model);
  const availability = objectOrNull(raw?.availability);
  const decisionTimestamp = isoOrNull(raw?.decision_timestamp);
  const reasonCodes = stringArray(raw?.reason_codes);

  if (
    raw?.receipt_version !== DECISION_LINEAGE_RECEIPT_VERSION ||
    raw?.receipt_kind !== "decision_lineage" ||
    raw?.scan_run_id !== scanRun.id ||
    raw?.scan_run_fingerprint !== scanRun.run_fingerprint ||
    decisionTimestamp === null ||
    (raw?.decision_record_version !== "candidate_decision_record_v1" &&
      raw?.decision_record_version !== "candidate_decision_record_v2") ||
    !categories ||
    !finiteNonNegative(categories.published_candidate_count) ||
    !finiteNonNegative(categories.rejected_candidate_count) ||
    typeof categories.explicit_no_trade !== "boolean" ||
    !versions ||
    !model ||
    model.status !== "not_applicable" ||
    model.version !== null ||
    !["strategy_version", "engine_version", "scoring_version", "ranking_version", "provider_contract_version", "git_commit", "build_identity"].every(
      (key) => versions[key] === null || textOrNull(versions[key]) !== null,
    ) ||
    !availability ||
    ![
      "expected_candidate_count",
      "observed_candidate_count",
      "source_timestamp_at_or_before_decision_count",
      "missing_source_timestamp_count",
      "source_timestamp_after_decision_count",
      "ranked_feature_capture_count",
    ].every((key) => finiteNonNegative(availability[key])) ||
    (raw?.status !== "reconstructable" && raw?.status !== "incomplete") ||
    reasonCodes === null ||
    uniqueSorted(reasonCodes).length !== reasonCodes.length ||
    (raw.status === "reconstructable" && reasonCodes.length !== 0) ||
    (raw.status === "incomplete" && reasonCodes.length === 0)
  ) {
    return null;
  }

  const receipt: DecisionLineageReceipt = {
    receipt_version: DECISION_LINEAGE_RECEIPT_VERSION,
    receipt_kind: "decision_lineage",
    scan_run_id: scanRun.id,
    scan_run_fingerprint: scanRun.run_fingerprint,
    decision_timestamp: decisionTimestamp,
    decision_record_version: raw.decision_record_version,
    decision_categories: {
      published_candidate_count: Number(categories.published_candidate_count),
      rejected_candidate_count: Number(categories.rejected_candidate_count),
      explicit_no_trade: categories.explicit_no_trade,
    },
    versions: {
      strategy_version: textOrNull(versions.strategy_version),
      model: { status: "not_applicable", version: null },
      engine_version: textOrNull(versions.engine_version),
      scoring_version: textOrNull(versions.scoring_version),
      ranking_version: textOrNull(versions.ranking_version),
      provider_contract_version: textOrNull(versions.provider_contract_version),
      git_commit: textOrNull(versions.git_commit),
      build_identity: textOrNull(versions.build_identity),
    },
    availability: {
      expected_candidate_count: Number(availability.expected_candidate_count),
      observed_candidate_count: Number(availability.observed_candidate_count),
      source_timestamp_at_or_before_decision_count:
        Number(availability.source_timestamp_at_or_before_decision_count),
      missing_source_timestamp_count: Number(availability.missing_source_timestamp_count),
      source_timestamp_after_decision_count:
        Number(availability.source_timestamp_after_decision_count),
      ranked_feature_capture_count: Number(availability.ranked_feature_capture_count),
    },
    status: raw.status,
    reason_codes: uniqueSorted(reasonCodes),
  };

  // The scan-row identity prevents cross-run attachment. Exact semantic
  // equality prevents a caller from replacing one version, source timestamp
  // count or category with a plausible but inferred value.
  if (stableJson(receipt) !== stableJson(buildDecisionLineageReceipt(record))) {
    return null;
  }

  return receipt;
}
