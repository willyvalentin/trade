export const EXECUTION_RECORD_ELIGIBILITY_VERSION =
  "execution_record_eligibility_v1" as const;

export type ExecutionRecordEligibilityStatus =
  | "eligible"
  | "not_eligible"
  | "duplicate_risk"
  | "blocked"
  | "failed";

export type ExecutionRecordEligibilityReason =
  | "broker_result_missing"
  | "broker_result_preview_only"
  | "broker_result_not_filled"
  | "missing_action"
  | "missing_instrument"
  | "missing_quantity"
  | "missing_price"
  | "missing_timestamp"
  | "missing_broker_reference"
  | "missing_source_fingerprint"
  | "duplicate_source_fingerprint"
  | "duplicate_broker_reference"
  | "sensitive_data_detected"
  | "raw_data_detected"
  | "supabase_write_attempted"
  | "trade_mutation_attempted"
  | "execution_record_creation_attempted"
  | "manual_review_required";

export type ExecutionRecordCandidate = {
  broker?: string;
  action?: "buy" | "sell" | string;
  ticker?: string;
  instrumentName?: string;
  market?: string;
  currency?: string;
  instrumentType?: string;
  quantity?: number | null;
  price?: number | null;
  fees?: number | null;
  totalAmount?: number | null;
  timestamp?: string;
  brokerOrderId?: string;
  sourceEvidenceFingerprint?: string;
  sourceRequestId?: string;
  sourceCaptureId?: string;
  sourceBrokerResultFingerprint?: string;
  status?: string;
  warnings?: string[];
  metadata?: Record<string, unknown> & {
    previewOnly?: boolean;
    notBrokerExecutionResult?: boolean;
    sensitiveDataDetected?: boolean;
    rawDataDetected?: boolean;
    supabaseWriteAttempted?: boolean;
    tradeMutationAttempted?: boolean;
    executionRecordCreationAttempted?: boolean;
  };
};

export type ExecutionRecordEligibilityOptions = {
  allowPreviewOnly?: boolean;
  allowMissingBrokerReference?: boolean;
  allowMissingTimestamp?: boolean;
  requireFilledStatus?: boolean;
};

export type ExecutionRecordEligibilityInput = {
  candidate?: ExecutionRecordCandidate | null;
  existingSourceFingerprints?: string[];
  existingBrokerReferences?: string[];
  options?: ExecutionRecordEligibilityOptions;
};

export type ExecutionRecordEligibilityResult = {
  ok: boolean;
  status: ExecutionRecordEligibilityStatus;
  checkedAt: string;
  eligible: boolean;
  reasons: ExecutionRecordEligibilityReason[];
  blockers: string[];
  warnings: string[];
  errors: string[];
  recordFingerprint?: string;
  labels: string[];
  metadata: {
    version: typeof EXECUTION_RECORD_ELIGIBILITY_VERSION;
    eligibilityOnly: true;
    noExecutionRecordCreated: true;
    noSupabaseWrite: true;
    noTradeMutation: true;
    options: Required<ExecutionRecordEligibilityOptions>;
  };
};

const DEFAULT_OPTIONS: Required<ExecutionRecordEligibilityOptions> = {
  allowPreviewOnly: false,
  allowMissingBrokerReference: false,
  allowMissingTimestamp: false,
  requireFilledStatus: true,
};

const EXECUTION_RECORD_ELIGIBILITY_LABELS = [
  "Execution record eligibility only",
  "No execution record created",
  "No Supabase write",
  "No trade mutation",
] as const;

const FILLED_STATUSES = new Set(["filled", "executed"]);

function uniqueStrings<T extends string>(values: readonly T[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function normalizeOptions(
  options: ExecutionRecordEligibilityOptions | null | undefined,
): Required<ExecutionRecordEligibilityOptions> {
  return {
    ...DEFAULT_OPTIONS,
    ...(options ?? {}),
  };
}

function optionalText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normalizeFingerprintPart(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return encodeURIComponent(normalized.length > 0 ? normalized : "missing");
}

function normalizeNumberFingerprintPart(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? String(value)
    : "missing";
}

function isPositiveFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function hasFlag(candidate: ExecutionRecordCandidate, flag: string) {
  return candidate.metadata?.[flag] === true;
}

function createResult(input: {
  status: ExecutionRecordEligibilityStatus;
  options: Required<ExecutionRecordEligibilityOptions>;
  reasons?: ExecutionRecordEligibilityReason[];
  blockers?: string[];
  warnings?: string[];
  errors?: string[];
  recordFingerprint?: string;
}): ExecutionRecordEligibilityResult {
  const blockers = uniqueStrings(input.blockers ?? []);
  const errors = uniqueStrings(input.errors ?? blockers);
  const warnings = uniqueStrings(input.warnings ?? []);
  const reasons = uniqueStrings(input.reasons ?? []);

  return {
    ok: input.status === "eligible",
    status: input.status,
    checkedAt: new Date().toISOString(),
    eligible: input.status === "eligible",
    reasons,
    blockers,
    warnings,
    errors,
    recordFingerprint: input.recordFingerprint,
    labels: [...EXECUTION_RECORD_ELIGIBILITY_LABELS],
    metadata: {
      version: EXECUTION_RECORD_ELIGIBILITY_VERSION,
      eligibilityOnly: true,
      noExecutionRecordCreated: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
      options: input.options,
    },
  };
}

export function buildExecutionRecordCandidateFingerprint(
  candidate: ExecutionRecordCandidate,
) {
  const parts = [
    "execution_record_candidate",
    normalizeFingerprintPart(candidate.broker),
    normalizeFingerprintPart(candidate.action),
    normalizeFingerprintPart(candidate.ticker),
    normalizeNumberFingerprintPart(candidate.quantity),
    normalizeNumberFingerprintPart(candidate.price),
    normalizeFingerprintPart(candidate.timestamp),
    normalizeFingerprintPart(candidate.brokerOrderId),
    normalizeFingerprintPart(candidate.sourceEvidenceFingerprint),
    normalizeFingerprintPart(candidate.sourceBrokerResultFingerprint),
  ];

  return parts.join("|");
}

export function evaluateExecutionRecordEligibility(
  input: ExecutionRecordEligibilityInput,
): ExecutionRecordEligibilityResult {
  const options = normalizeOptions(input.options);
  const candidate = input.candidate ?? undefined;

  if (!candidate) {
    return createResult({
      status: "not_eligible",
      options,
      reasons: ["broker_result_missing"],
      blockers: ["Broker result candidate is missing."],
    });
  }

  const recordFingerprint = buildExecutionRecordCandidateFingerprint(candidate);
  const reasons: ExecutionRecordEligibilityReason[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [...(candidate.warnings ?? [])];

  if (
    candidate.metadata?.previewOnly === true ||
    candidate.metadata?.notBrokerExecutionResult === true
  ) {
    reasons.push("broker_result_preview_only");

    if (options.allowPreviewOnly) {
      reasons.push("manual_review_required");
      warnings.push(
        "Preview-only broker result was allowed by explicit option; manual review is required before any future record creation.",
      );
    } else {
      blockers.push(
        "Broker result candidate is preview-only and cannot become an execution record.",
      );
    }
  }

  if (candidate.action !== "buy" && candidate.action !== "sell") {
    reasons.push("missing_action");
    blockers.push("Broker result candidate action is missing or unsupported.");
  }

  if (!optionalText(candidate.ticker)) {
    reasons.push("missing_instrument");
    blockers.push("Broker result candidate ticker/instrument is missing.");
  }

  if (!isPositiveFiniteNumber(candidate.quantity)) {
    reasons.push("missing_quantity");
    blockers.push("Broker result candidate quantity is missing or invalid.");
  }

  if (!isPositiveFiniteNumber(candidate.price)) {
    reasons.push("missing_price");
    blockers.push("Broker result candidate price is missing or invalid.");
  }

  if (!optionalText(candidate.timestamp)) {
    reasons.push("missing_timestamp");

    if (options.allowMissingTimestamp) {
      warnings.push("Broker result candidate timestamp is missing.");
    } else {
      blockers.push("Broker result candidate timestamp is missing.");
    }
  }

  if (!optionalText(candidate.brokerOrderId)) {
    reasons.push("missing_broker_reference");

    if (options.allowMissingBrokerReference) {
      warnings.push("Broker result candidate broker reference is missing.");
    } else {
      blockers.push("Broker result candidate broker reference is missing.");
    }
  }

  if (
    !optionalText(candidate.sourceEvidenceFingerprint) &&
    !optionalText(candidate.sourceBrokerResultFingerprint)
  ) {
    reasons.push("missing_source_fingerprint");
    blockers.push("Broker result candidate source fingerprint is missing.");
  }

  if (options.requireFilledStatus) {
    const status = optionalText(candidate.status)?.toLowerCase();

    if (!status || !FILLED_STATUSES.has(status)) {
      reasons.push("broker_result_not_filled");
      blockers.push(
        "Broker result candidate status is not filled/executed.",
      );
    }
  }

  if (
    candidate.metadata?.sensitiveDataDetected === true ||
    hasFlag(candidate, "accountDataDetected") ||
    hasFlag(candidate, "balanceDataDetected") ||
    hasFlag(candidate, "holdingsDataDetected")
  ) {
    reasons.push("sensitive_data_detected");
    blockers.push("Sensitive account, balance, holdings, or personal data was detected.");
  }

  if (candidate.metadata?.rawDataDetected === true) {
    reasons.push("raw_data_detected");
    blockers.push("Raw or unsanitized source data was detected.");
  }

  if (candidate.metadata?.supabaseWriteAttempted === true) {
    reasons.push("supabase_write_attempted");
    blockers.push(
      "Supabase write was attempted during eligibility evaluation.",
    );
  }

  if (candidate.metadata?.tradeMutationAttempted === true) {
    reasons.push("trade_mutation_attempted");
    blockers.push(
      "Trade mutation was attempted during eligibility evaluation.",
    );
  }

  if (candidate.metadata?.executionRecordCreationAttempted === true) {
    reasons.push("execution_record_creation_attempted");
    blockers.push(
      "Execution record creation was attempted before eligibility was approved.",
    );
  }

  if (blockers.length > 0) {
    return createResult({
      status: "blocked",
      options,
      reasons,
      blockers,
      warnings,
      recordFingerprint,
    });
  }

  const existingSourceFingerprints = new Set(
    input.existingSourceFingerprints ?? [],
  );
  const sourceFingerprints = [
    optionalText(candidate.sourceEvidenceFingerprint),
    optionalText(candidate.sourceBrokerResultFingerprint),
    recordFingerprint,
  ].filter((value): value is string => Boolean(value));

  if (
    sourceFingerprints.some((fingerprint) =>
      existingSourceFingerprints.has(fingerprint),
    )
  ) {
    return createResult({
      status: "duplicate_risk",
      options,
      reasons: ["duplicate_source_fingerprint"],
      blockers: [
        "Source fingerprint already exists; creating another execution record would risk a duplicate.",
      ],
      warnings,
      recordFingerprint,
    });
  }

  const brokerReference = optionalText(candidate.brokerOrderId);
  const existingBrokerReferences = new Set(
    input.existingBrokerReferences ?? [],
  );

  if (brokerReference && existingBrokerReferences.has(brokerReference)) {
    return createResult({
      status: "duplicate_risk",
      options,
      reasons: ["duplicate_broker_reference"],
      blockers: [
        "Broker reference already exists; creating another execution record would risk a duplicate.",
      ],
      warnings,
      recordFingerprint,
    });
  }

  return createResult({
    status: "eligible",
    options,
    reasons,
    warnings,
    recordFingerprint,
  });
}

export function summarizeExecutionRecordEligibility(
  result: ExecutionRecordEligibilityResult,
) {
  switch (result.status) {
    case "eligible":
      return "Eligible for future local execution record creation. No execution record was created.";
    case "duplicate_risk":
      return `Duplicate risk: ${
        result.blockers[0] ?? "source evidence or broker reference already exists"
      }. No execution record was created.`;
    case "blocked":
      return `Blocked: ${
        result.blockers[0] ?? "eligibility checks failed"
      }. No execution record was created.`;
    case "failed":
      return "Execution record eligibility check failed. No execution record was created.";
    case "not_eligible":
    default:
      return `Not eligible: ${
        result.blockers[0] ?? "candidate is not eligible"
      }. No execution record was created.`;
  }
}

export function getExecutionRecordEligibilityLabels(
  result: ExecutionRecordEligibilityResult,
) {
  return [...result.labels];
}

export function isExecutionRecordEligible(
  result: ExecutionRecordEligibilityResult,
) {
  return result.ok && result.eligible && result.status === "eligible";
}
