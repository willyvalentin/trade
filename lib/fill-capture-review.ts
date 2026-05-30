export type FillCaptureReviewSide = "BUY" | "SELL";

export type FillCaptureReviewStatus =
  | "ready"
  | "needs_review"
  | "blocked"
  | "incomplete";

export type FillCaptureReviewSource =
  | "broker_confirmation_form"
  | "broker_exit_confirmation_form"
  | "ture_trade_plan"
  | "ture_live_position"
  | "manual_user_confirmation"
  | "optional_broker_cost";

export type FillCaptureReviewField = {
  field_id: string;
  label: string;
  value: string;
  source: FillCaptureReviewSource;
  required: boolean;
  status: "present" | "missing" | "warning" | "blocked";
};

export type FillCaptureReviewCheck = {
  check_id: string;
  label: string;
  status: "passed" | "warning" | "failed" | "missing";
  message: string;
};

export type FillCaptureReviewBlocker = {
  blocker_id: string;
  label: string;
  message: string;
};

export type FillCaptureReviewWarning = {
  warning_id: string;
  label: string;
  message: string;
};

export type FillCaptureReview = {
  review_id: string;
  review_version: "1.0";
  review_kind: "fill_capture_review";
  side: FillCaptureReviewSide;
  created_at: string;
  status: FillCaptureReviewStatus;
  confidence_score: number;
  confidence_label: "high" | "medium" | "low" | "unknown";
  fields: FillCaptureReviewField[];
  checks: FillCaptureReviewCheck[];
  blockers: FillCaptureReviewBlocker[];
  warnings: FillCaptureReviewWarning[];
  next_action_label: string;
  next_action_description: string;
  can_continue: boolean;
};

export type BuildBuyFillCaptureReviewInput = {
  payloadId: string;
  ticker: string;
  brokerStatus: string;
  actualFillPrice: number | null;
  actualFilledShares: number | null;
  brokerReferenceNote?: string | null;
  manualAvanzaBuyConfirmed: boolean;
  brokerOrderMatchesTradePlan: boolean;
  plannedQuantity: number | null;
  commission?: number | null;
  fxFee?: number | null;
  createdAt?: string;
};

export type BuildSellFillCaptureReviewInput = {
  payloadId: string;
  positionId: string;
  ticker: string;
  exitStatus: string;
  actualExitPrice: number | null;
  actualSoldShares: number | null;
  brokerReferenceNote?: string | null;
  manualAvanzaSellConfirmed: boolean;
  brokerOrderMatchesTurePosition: boolean;
  openPositionSize: number | null;
  exitCommission?: number | null;
  exitFxFee?: number | null;
  createdAt?: string;
};

function finitePositiveNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function finiteNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function noteValue(value: string | null | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function boolValue(value: boolean) {
  return value ? "Yes" : "No";
}

function numberValue(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function normalizeStatus(value: string) {
  return value.trim().replaceAll("_", " ") || "—";
}

function fieldStatus({
  present,
  warning = false,
  blocked = false,
}: {
  present: boolean;
  warning?: boolean;
  blocked?: boolean;
}): FillCaptureReviewField["status"] {
  if (blocked) return "blocked";
  if (!present) return "missing";
  if (warning) return "warning";
  return "present";
}

function confidenceFrom({
  blockers,
  warnings,
  missingChecks,
}: {
  blockers: FillCaptureReviewBlocker[];
  warnings: FillCaptureReviewWarning[];
  missingChecks: number;
}) {
  if (blockers.length > 0) {
    return {
      score: 0,
      label: "unknown" as const,
    };
  }

  if (missingChecks > 0) {
    return {
      score: 45,
      label: "low" as const,
    };
  }

  if (warnings.length > 0) {
    return {
      score: 75,
      label: "medium" as const,
    };
  }

  return {
    score: 95,
    label: "high" as const,
  };
}

function statusFrom({
  blockers,
  warnings,
  missingChecks,
}: {
  blockers: FillCaptureReviewBlocker[];
  warnings: FillCaptureReviewWarning[];
  missingChecks: number;
}): FillCaptureReviewStatus {
  if (blockers.length > 0) return "blocked";
  if (missingChecks > 0) return "incomplete";
  if (warnings.length > 0) return "needs_review";
  return "ready";
}

function nextActionForBuy(status: FillCaptureReviewStatus) {
  if (status === "ready") {
    return {
      label: "Create Live Day Trade",
      description:
        "Broker fill review is ready. You can create the Live Day Trade from the captured Avanza fill.",
    };
  }

  if (status === "needs_review") {
    return {
      label: "Review fill details",
      description:
        "Check the warning items before creating the Live Day Trade in Ture.",
    };
  }

  if (status === "blocked") {
    return {
      label: "Resolve blockers",
      description:
        "Do not create the Live Day Trade until the broker fill blockers are resolved.",
    };
  }

  return {
    label: "Complete broker fill capture",
    description:
      "Enter the missing Avanza fill details and manual confirmation state.",
  };
}

function nextActionForSell(status: FillCaptureReviewStatus) {
  if (status === "ready") {
    return {
      label: "Close trade in Ture",
      description:
        "Broker exit review is ready. You can close the trade from the captured Avanza exit fill.",
    };
  }

  if (status === "needs_review") {
    return {
      label: "Review exit details",
      description:
        "Check the warning items before closing the trade in Ture.",
    };
  }

  if (status === "blocked") {
    return {
      label: "Resolve blockers",
      description:
        "Do not close the trade in Ture until the broker exit blockers are resolved.",
    };
  }

  return {
    label: "Complete broker exit capture",
    description:
      "Enter the missing Avanza exit fill details and manual confirmation state.",
  };
}

export function buildBuyFillCaptureReview({
  payloadId,
  ticker,
  brokerStatus,
  actualFillPrice,
  actualFilledShares,
  brokerReferenceNote,
  manualAvanzaBuyConfirmed,
  brokerOrderMatchesTradePlan,
  plannedQuantity,
  commission,
  fxFee,
  createdAt,
}: BuildBuyFillCaptureReviewInput): FillCaptureReview {
  const now = createdAt ?? new Date().toISOString();
  const blockers: FillCaptureReviewBlocker[] = [];
  const warnings: FillCaptureReviewWarning[] = [];
  const checks: FillCaptureReviewCheck[] = [];
  const brokerFilled =
    brokerStatus === "filled" || brokerStatus === "partially_filled";
  const fillPrice = finitePositiveNumber(actualFillPrice);
  const filledShares = finitePositiveNumber(actualFilledShares);
  const plannedShares = finitePositiveNumber(plannedQuantity);
  const referenceNote = noteValue(brokerReferenceNote);

  if (brokerStatus === "submitted_not_filled") {
    blockers.push({
      blocker_id: "broker_status_not_filled",
      label: "Broker status is not filled",
      message: "Avanza has not reported a fill yet.",
    });
  }

  if (fillPrice === null && actualFillPrice !== null) {
    blockers.push({
      blocker_id: "invalid_fill_price",
      label: "Invalid fill price",
      message: "Actual fill price must be greater than zero.",
    });
  }

  if (filledShares === null && actualFilledShares !== null) {
    blockers.push({
      blocker_id: "invalid_filled_shares",
      label: "Invalid filled shares",
      message: "Actual filled shares must be greater than zero.",
    });
  }

  if (brokerStatus === "partially_filled") {
    warnings.push({
      warning_id: "partial_fill",
      label: "Partial fill",
      message: "Live Day Trade can track filled shares, but verify remaining shares manually.",
    });
  }

  if (
    filledShares !== null &&
    plannedShares !== null &&
    filledShares !== plannedShares
  ) {
    warnings.push({
      warning_id: "filled_shares_mismatch",
      label: "Filled shares differ from plan",
      message: "Actual filled shares differ from planned quantity. Review before creating.",
    });
  }

  checks.push(
    {
      check_id: "status_filled",
      label: "Status is filled",
      status: brokerFilled ? "passed" : "failed",
      message: brokerFilled
        ? "Broker status is filled or partially filled."
        : "Broker status must be filled or partially filled.",
    },
    {
      check_id: "price_positive",
      label: "Price is positive",
      status: fillPrice !== null ? "passed" : actualFillPrice === null ? "missing" : "failed",
      message:
        fillPrice !== null
          ? "Actual fill price is present."
          : "Actual fill price must be greater than zero.",
    },
    {
      check_id: "shares_positive",
      label: "Shares are positive",
      status:
        filledShares !== null ? "passed" : actualFilledShares === null ? "missing" : "failed",
      message:
        filledShares !== null
          ? "Actual filled shares are present."
          : "Actual filled shares must be greater than zero.",
    },
    {
      check_id: "manual_buy_confirmed",
      label: "Manual KÖP confirmed",
      status: manualAvanzaBuyConfirmed ? "passed" : "missing",
      message: manualAvanzaBuyConfirmed
        ? "Manual Avanza KÖP confirmation is recorded."
        : "Confirm that you manually clicked KÖP in Avanza.",
    },
    {
      check_id: "plan_match_confirmed",
      label: "Plan match confirmed",
      status: brokerOrderMatchesTradePlan ? "passed" : "missing",
      message: brokerOrderMatchesTradePlan
        ? "Broker order match is confirmed."
        : "Confirm that the broker order matches the Ture trade plan.",
    },
    {
      check_id: "reference_note_present",
      label: "Reference note present",
      status: referenceNote ? "passed" : "warning",
      message: referenceNote
        ? "Broker reference or note is present."
        : "Broker reference/note is recommended for audit clarity.",
    },
  );

  if (!referenceNote) {
    warnings.push({
      warning_id: "missing_reference_note",
      label: "Reference note missing",
      message: "Add an Avanza reference or short fill note if available.",
    });
  }

  const missingChecks = checks.filter((check) => check.status === "missing").length;
  const status = statusFrom({ blockers, warnings, missingChecks });
  const confidence = confidenceFrom({ blockers, warnings, missingChecks });
  const nextAction = nextActionForBuy(status);

  return {
    review_id: `buy_fill_review_${ticker}_${payloadId}`,
    review_version: "1.0",
    review_kind: "fill_capture_review",
    side: "BUY",
    created_at: now,
    status,
    confidence_score: confidence.score,
    confidence_label: confidence.label,
    fields: [
      {
        field_id: "broker_status",
        label: "Broker status",
        value: normalizeStatus(brokerStatus),
        source: "broker_confirmation_form",
        required: true,
        status: fieldStatus({ present: brokerFilled, blocked: !brokerFilled }),
      },
      {
        field_id: "actual_fill_price",
        label: "Actual fill price",
        value: numberValue(actualFillPrice),
        source: "broker_confirmation_form",
        required: true,
        status: fieldStatus({
          present: fillPrice !== null,
          blocked: actualFillPrice !== null && fillPrice === null,
        }),
      },
      {
        field_id: "actual_filled_shares",
        label: "Actual filled shares",
        value: numberValue(actualFilledShares),
        source: "broker_confirmation_form",
        required: true,
        status: fieldStatus({
          present: filledShares !== null,
          warning:
            filledShares !== null &&
            plannedShares !== null &&
            filledShares !== plannedShares,
          blocked: actualFilledShares !== null && filledShares === null,
        }),
      },
      {
        field_id: "broker_reference_note",
        label: "Broker reference / note",
        value: referenceNote ?? "—",
        source: "broker_confirmation_form",
        required: true,
        status: fieldStatus({ present: referenceNote !== null, warning: referenceNote === null }),
      },
      {
        field_id: "manual_avanza_buy_confirmation",
        label: "Manual Avanza KÖP confirmation",
        value: boolValue(manualAvanzaBuyConfirmed),
        source: "manual_user_confirmation",
        required: true,
        status: fieldStatus({ present: manualAvanzaBuyConfirmed }),
      },
      {
        field_id: "broker_order_matches_ture_trade_plan",
        label: "Broker order matches Ture trade plan",
        value: boolValue(brokerOrderMatchesTradePlan),
        source: "manual_user_confirmation",
        required: true,
        status: fieldStatus({ present: brokerOrderMatchesTradePlan }),
      },
      {
        field_id: "commission",
        label: "Commission",
        value: numberValue(commission),
        source: "optional_broker_cost",
        required: false,
        status: fieldStatus({ present: finiteNumber(commission) !== null }),
      },
      {
        field_id: "fx_fee",
        label: "FX fee",
        value: numberValue(fxFee),
        source: "optional_broker_cost",
        required: false,
        status: fieldStatus({ present: finiteNumber(fxFee) !== null }),
      },
    ],
    checks,
    blockers,
    warnings,
    next_action_label: nextAction.label,
    next_action_description: nextAction.description,
    can_continue: status === "ready" || status === "needs_review",
  };
}

export function buildSellFillCaptureReview({
  payloadId,
  positionId,
  ticker,
  exitStatus,
  actualExitPrice,
  actualSoldShares,
  brokerReferenceNote,
  manualAvanzaSellConfirmed,
  brokerOrderMatchesTurePosition,
  openPositionSize,
  exitCommission,
  exitFxFee,
  createdAt,
}: BuildSellFillCaptureReviewInput): FillCaptureReview {
  const now = createdAt ?? new Date().toISOString();
  const blockers: FillCaptureReviewBlocker[] = [];
  const warnings: FillCaptureReviewWarning[] = [];
  const checks: FillCaptureReviewCheck[] = [];
  const brokerFilled =
    exitStatus === "filled" || exitStatus === "partially_filled";
  const exitPrice = finitePositiveNumber(actualExitPrice);
  const soldShares = finitePositiveNumber(actualSoldShares);
  const positionSize = finitePositiveNumber(openPositionSize);
  const referenceNote = noteValue(brokerReferenceNote);

  if (exitStatus === "submitted_not_filled") {
    blockers.push({
      blocker_id: "broker_status_not_filled",
      label: "Broker status is not filled",
      message: "Avanza has not reported an exit fill yet.",
    });
  }

  if (exitStatus === "cancelled_or_rejected") {
    blockers.push({
      blocker_id: "broker_order_cancelled_or_rejected",
      label: "Broker order cancelled / rejected",
      message: "The position should remain live unless a new exit order is confirmed.",
    });
  }

  if (exitPrice === null && actualExitPrice !== null) {
    blockers.push({
      blocker_id: "invalid_exit_price",
      label: "Invalid exit price",
      message: "Actual exit price must be greater than zero.",
    });
  }

  if (soldShares === null && actualSoldShares !== null) {
    blockers.push({
      blocker_id: "invalid_sold_shares",
      label: "Invalid sold shares",
      message: "Actual sold shares must be greater than zero.",
    });
  }

  if (
    soldShares !== null &&
    positionSize !== null &&
    soldShares > positionSize
  ) {
    blockers.push({
      blocker_id: "sold_shares_exceed_position",
      label: "Sold shares exceed position",
      message: "Actual sold shares cannot exceed the current Ture position size.",
    });
  }

  if (exitStatus === "partially_filled") {
    warnings.push({
      warning_id: "partial_exit_fill",
      label: "Partial exit fill",
      message: "Partial fills are allowed, but verify remaining shares manually.",
    });
  }

  if (
    soldShares !== null &&
    positionSize !== null &&
    soldShares < positionSize
  ) {
    warnings.push({
      warning_id: "sold_shares_below_position",
      label: "Sold shares below position",
      message: "Actual sold shares are below open position size. Review remaining shares.",
    });
  }

  checks.push(
    {
      check_id: "status_filled",
      label: "Status is filled",
      status: brokerFilled ? "passed" : "failed",
      message: brokerFilled
        ? "Broker exit status is filled or partially filled."
        : "Broker exit status must be filled or partially filled.",
    },
    {
      check_id: "price_positive",
      label: "Price is positive",
      status: exitPrice !== null ? "passed" : actualExitPrice === null ? "missing" : "failed",
      message:
        exitPrice !== null
          ? "Actual exit price is present."
          : "Actual exit price must be greater than zero.",
    },
    {
      check_id: "shares_positive",
      label: "Shares are positive",
      status: soldShares !== null ? "passed" : actualSoldShares === null ? "missing" : "failed",
      message:
        soldShares !== null
          ? "Actual sold shares are present."
          : "Actual sold shares must be greater than zero.",
    },
    {
      check_id: "shares_not_above_position",
      label: "Shares do not exceed position",
      status:
        soldShares !== null && positionSize !== null && soldShares > positionSize
          ? "failed"
          : soldShares === null || positionSize === null
            ? "missing"
            : "passed",
      message:
        soldShares !== null && positionSize !== null && soldShares <= positionSize
          ? "Sold shares are within open position size."
          : "Sold shares must not exceed open position size.",
    },
    {
      check_id: "manual_sell_confirmed",
      label: "Manual SÄLJ confirmed",
      status: manualAvanzaSellConfirmed ? "passed" : "missing",
      message: manualAvanzaSellConfirmed
        ? "Manual Avanza SÄLJ confirmation is recorded."
        : "Confirm that you manually clicked SÄLJ in Avanza.",
    },
    {
      check_id: "position_match_confirmed",
      label: "Position match confirmed",
      status: brokerOrderMatchesTurePosition ? "passed" : "missing",
      message: brokerOrderMatchesTurePosition
        ? "Broker order match is confirmed."
        : "Confirm that the broker order matches this Ture position.",
    },
    {
      check_id: "reference_note_present",
      label: "Reference note present",
      status: referenceNote ? "passed" : "warning",
      message: referenceNote
        ? "Broker reference or note is present."
        : "Broker reference/note is recommended for audit clarity.",
    },
  );

  if (!referenceNote) {
    warnings.push({
      warning_id: "missing_reference_note",
      label: "Reference note missing",
      message: "Add an Avanza reference or short exit note if available.",
    });
  }

  const missingChecks = checks.filter((check) => check.status === "missing").length;
  const status = statusFrom({ blockers, warnings, missingChecks });
  const confidence = confidenceFrom({ blockers, warnings, missingChecks });
  const nextAction = nextActionForSell(status);

  return {
    review_id: `sell_fill_review_${ticker}_${positionId}_${payloadId}`,
    review_version: "1.0",
    review_kind: "fill_capture_review",
    side: "SELL",
    created_at: now,
    status,
    confidence_score: confidence.score,
    confidence_label: confidence.label,
    fields: [
      {
        field_id: "exit_status",
        label: "Exit status",
        value: normalizeStatus(exitStatus),
        source: "broker_exit_confirmation_form",
        required: true,
        status: fieldStatus({ present: brokerFilled, blocked: !brokerFilled }),
      },
      {
        field_id: "actual_exit_price",
        label: "Actual exit price",
        value: numberValue(actualExitPrice),
        source: "broker_exit_confirmation_form",
        required: true,
        status: fieldStatus({
          present: exitPrice !== null,
          blocked: actualExitPrice !== null && exitPrice === null,
        }),
      },
      {
        field_id: "actual_sold_shares",
        label: "Actual sold shares",
        value: numberValue(actualSoldShares),
        source: "broker_exit_confirmation_form",
        required: true,
        status: fieldStatus({
          present: soldShares !== null,
          warning:
            soldShares !== null &&
            positionSize !== null &&
            soldShares < positionSize,
          blocked:
            (actualSoldShares !== null && soldShares === null) ||
            (soldShares !== null && positionSize !== null && soldShares > positionSize),
        }),
      },
      {
        field_id: "broker_reference_note",
        label: "Broker reference / note",
        value: referenceNote ?? "—",
        source: "broker_exit_confirmation_form",
        required: true,
        status: fieldStatus({ present: referenceNote !== null, warning: referenceNote === null }),
      },
      {
        field_id: "manual_avanza_sell_confirmation",
        label: "Manual Avanza SÄLJ confirmation",
        value: boolValue(manualAvanzaSellConfirmed),
        source: "manual_user_confirmation",
        required: true,
        status: fieldStatus({ present: manualAvanzaSellConfirmed }),
      },
      {
        field_id: "broker_order_matches_ture_position",
        label: "Broker order matches Ture position",
        value: boolValue(brokerOrderMatchesTurePosition),
        source: "manual_user_confirmation",
        required: true,
        status: fieldStatus({ present: brokerOrderMatchesTurePosition }),
      },
      {
        field_id: "exit_commission",
        label: "Exit commission",
        value: numberValue(exitCommission),
        source: "optional_broker_cost",
        required: false,
        status: fieldStatus({ present: finiteNumber(exitCommission) !== null }),
      },
      {
        field_id: "exit_fx_fee",
        label: "Exit FX fee",
        value: numberValue(exitFxFee),
        source: "optional_broker_cost",
        required: false,
        status: fieldStatus({ present: finiteNumber(exitFxFee) !== null }),
      },
    ],
    checks,
    blockers,
    warnings,
    next_action_label: nextAction.label,
    next_action_description: nextAction.description,
    can_continue: status === "ready" || status === "needs_review",
  };
}

export function fillCaptureReviewJson(review: FillCaptureReview) {
  return JSON.stringify(review, null, 2);
}
