import type {
  AvanzaPassiveTradeExecutionReadinessIntent,
  AvanzaPassiveTradeExecutionReadinessModel,
  AvanzaPassiveTradeExecutionReadinessSource,
  AvanzaPassiveTradeExecutionReadinessStatus,
} from "./avanza-passive-trade-execution-readiness";

export type AvanzaTradeCardExecutionReadinessSeverity =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "blocked"
  | "danger"
  | "unknown";

export type AvanzaTradeCardExecutionReadinessCtaType =
  | "none"
  | "passive_info_only"
  | "settings_review_only"
  | "local_dev_only_info"
  | "manual_review_required";

export type AvanzaTradeCardExecutionReadinessBadge = {
  badgeId: string;
  label: string;
  severity: AvanzaTradeCardExecutionReadinessSeverity;
  reason?: string;
  visible: boolean;
  iconHint?: string;
  safeTooltip?: string;
};

export type AvanzaTradeCardExecutionReadinessAdapterSafetyFlags = {
  adapterOnly: true;
  readOnly: true;
  canRenderBadge: true;
  canStartHandoff: false;
  canPrepareOrder: false;
  canRunSmokeTestFromUi: false;
  canCallApiRoute: false;
  canFetch: false;
  canPoll: false;
  canUseBrowserAutomation: false;
  canAccessCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canSubmitOrder: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canWriteSupabase: false;
  canClaimProductionReady: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaTradeCardExecutionReadinessAdapterInput = {
  readinessModel?: unknown;
  source?: AvanzaPassiveTradeExecutionReadinessSource;
  compact?: boolean;
  now?: string;
};

export type AvanzaTradeCardExecutionReadinessAdapterResult = {
  adapterId: string;
  createdAt: string;
  label: string;
  shortLabel: string;
  severity: AvanzaTradeCardExecutionReadinessSeverity;
  ctaType: AvanzaTradeCardExecutionReadinessCtaType;
  tooltip: string;
  source: AvanzaPassiveTradeExecutionReadinessSource;
  intent: AvanzaPassiveTradeExecutionReadinessIntent;
  ticker?: string;
  side?: "buy" | "sell" | "unknown";
  badges: AvanzaTradeCardExecutionReadinessBadge[];
  warnings: string[];
  blockedReasons: string[];
  showOnRecommendationCard: boolean;
  showOnLivePositionCard: boolean;
  safetyFlags: AvanzaTradeCardExecutionReadinessAdapterSafetyFlags;
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";

export const avanzaTradeCardExecutionReadinessAdapterSafetyFlags:
  AvanzaTradeCardExecutionReadinessAdapterSafetyFlags = {
    adapterOnly: true,
    readOnly: true,
    canRenderBadge: true,
    canStartHandoff: false,
    canPrepareOrder: false,
    canRunSmokeTestFromUi: false,
    canCallApiRoute: false,
    canFetch: false,
    canPoll: false,
    canUseBrowserAutomation: false,
    canAccessCredentials: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canSubmitOrder: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canWriteSupabase: false,
    canClaimProductionReady: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();

  return trimmed ? trimmed : undefined;
}

function safeTextArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        const text = safeText(item);

        return text ? [text] : [];
      })
    : [];
}

function normalizeSource(
  source: unknown,
): AvanzaPassiveTradeExecutionReadinessSource {
  if (
    source === "recommendation" ||
    source === "live_position" ||
    source === "fixture" ||
    source === "manual_review"
  ) {
    return source;
  }

  return "unknown";
}

function normalizeIntent(
  intent: unknown,
): AvanzaPassiveTradeExecutionReadinessIntent {
  if (
    intent === "entry_buy" ||
    intent === "exit_sell" ||
    intent === "review_only"
  ) {
    return intent;
  }

  return "unknown";
}

function normalizeStatus(
  status: unknown,
): AvanzaPassiveTradeExecutionReadinessStatus | "unknown" {
  if (
    status === "ready_passive" ||
    status === "incomplete_profile" ||
    status === "missing_trade_package" ||
    status === "missing_ticker" ||
    status === "missing_side" ||
    status === "missing_quantity" ||
    status === "missing_limit_price" ||
    status === "blocked" ||
    status === "local_dev_only"
  ) {
    return status;
  }

  return "unknown";
}

function normalizeSide(side: unknown): "buy" | "sell" | "unknown" {
  if (side === "buy" || side === "sell") return side;

  return "unknown";
}

function normalizeReadinessModel(
  readinessModel: unknown,
): Partial<AvanzaPassiveTradeExecutionReadinessModel> {
  if (!isObject(readinessModel)) return {};

  return {
    blockers: safeTextArray(readinessModel.blockers),
    hardStops: safeTextArray(readinessModel.hardStops),
    intent: normalizeIntent(readinessModel.intent),
    reason: safeText(readinessModel.reason),
    side: normalizeSide(readinessModel.side),
    source: normalizeSource(readinessModel.source),
    status: normalizeStatus(readinessModel.status),
    ticker: safeText(readinessModel.ticker),
    warnings: safeTextArray(readinessModel.warnings),
  };
}

function severityForStatus(
  status: AvanzaPassiveTradeExecutionReadinessStatus | "unknown",
): AvanzaTradeCardExecutionReadinessSeverity {
  if (status === "ready_passive") return "success";
  if (status === "local_dev_only") return "info";
  if (status === "incomplete_profile") return "warning";
  if (
    status === "missing_ticker" ||
    status === "missing_side" ||
    status === "missing_quantity" ||
    status === "missing_limit_price" ||
    status === "missing_trade_package"
  ) {
    return "blocked";
  }
  if (status === "blocked") return "danger";

  return "unknown";
}

function ctaTypeForStatus(
  status: AvanzaPassiveTradeExecutionReadinessStatus | "unknown",
): AvanzaTradeCardExecutionReadinessCtaType {
  if (status === "ready_passive") return "passive_info_only";
  if (status === "local_dev_only") return "local_dev_only_info";
  if (status === "incomplete_profile") return "settings_review_only";
  if (status === "unknown") return "none";

  return "manual_review_required";
}

function labelForStatus(
  status: AvanzaPassiveTradeExecutionReadinessStatus | "unknown",
) {
  if (status === "ready_passive") return "Execution readiness: modeled";
  if (status === "local_dev_only") return "Local-dev only";
  if (status === "incomplete_profile") return "Profile incomplete";
  if (status === "missing_ticker") return "Missing ticker";
  if (status === "missing_side") return "Missing side";
  if (status === "missing_quantity") return "Missing quantity";
  if (status === "missing_limit_price") return "Missing limit price";
  if (status === "missing_trade_package") return "Missing trade package";
  if (status === "blocked") return "Execution readiness blocked";

  return "Execution readiness unknown";
}

function badge(
  badgeId: string,
  label: string,
  severity: AvanzaTradeCardExecutionReadinessSeverity,
  reason?: string,
): AvanzaTradeCardExecutionReadinessBadge {
  return {
    badgeId,
    iconHint: severity,
    label,
    reason,
    safeTooltip: reason ?? label,
    severity,
    visible: true,
  };
}

function buildBadges(input: {
  status: AvanzaPassiveTradeExecutionReadinessStatus | "unknown";
  source: AvanzaPassiveTradeExecutionReadinessSource;
  intent: AvanzaPassiveTradeExecutionReadinessIntent;
  reason?: string;
  hardStops: readonly string[];
}) {
  const severity = severityForStatus(input.status);
  const badges = [
    badge("execution_readiness", labelForStatus(input.status), severity, input.reason),
  ];

  if (input.source === "recommendation" && input.intent === "entry_buy") {
    badges.push(
      badge(
        "recommendation_buy_badge",
        "Recommendation BUY badge modeled",
        "info",
        "Read-only recommendation card metadata only.",
      ),
    );
  }
  if (input.source === "live_position" && input.intent === "exit_sell") {
    badges.push(
      badge(
        "live_position_sell_exit_badge",
        "Live-position SELL/exit badge modeled",
        "info",
        "Read-only live-position card metadata only.",
      ),
    );
  }
  if (input.status === "local_dev_only") {
    badges.push(
      badge("local_dev_only", "Local-dev only", "info", "No production readiness claim."),
    );
  }

  const hardStopText = input.hardStops.join(" | ").toLowerCase();
  if (hardStopText.includes("final")) {
    badges.push(
      badge(
        "final_click_human_only",
        "Final click human-only",
        "blocked",
        "Final KÖP/SÄLJ remains a manual user action.",
      ),
    );
  }
  if (hardStopText.includes("order submission")) {
    badges.push(
      badge(
        "order_submission_forbidden",
        "No order submission",
        "blocked",
        "The adapter cannot submit orders.",
      ),
    );
  }

  return badges;
}

export function buildAvanzaTradeCardExecutionReadinessAdapter(
  input: AvanzaTradeCardExecutionReadinessAdapterInput = {},
): AvanzaTradeCardExecutionReadinessAdapterResult {
  const readiness = normalizeReadinessModel(input.readinessModel);
  const source = normalizeSource(readiness.source ?? input.source);
  const intent = normalizeIntent(readiness.intent);
  const status = normalizeStatus(readiness.status);
  const severity = severityForStatus(status);
  const label = labelForStatus(status);
  const warnings = safeTextArray(readiness.warnings);
  const blockedReasons = safeTextArray(readiness.blockers);
  const hardStops = safeTextArray(readiness.hardStops);
  const badges = buildBadges({
    hardStops,
    intent,
    reason: safeText(readiness.reason),
    source,
    status,
  });

  return {
    adapterId: `avanza-trade-card-readiness-${source}-${intent}-${status}`,
    badges,
    blockedReasons,
    createdAt: input.now ?? defaultCreatedAt,
    ctaType: ctaTypeForStatus(status),
    intent,
    label,
    safetyFlags: avanzaTradeCardExecutionReadinessAdapterSafetyFlags,
    severity,
    shortLabel: input.compact ? label.replace("Execution readiness: ", "") : label,
    showOnLivePositionCard: source === "live_position",
    showOnRecommendationCard: source === "recommendation",
    side: normalizeSide(readiness.side),
    source,
    ticker: safeText(readiness.ticker),
    tooltip:
      safeText(readiness.reason) ??
      "Read-only trade card execution readiness metadata only.",
    warnings,
  };
}
