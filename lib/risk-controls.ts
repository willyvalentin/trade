export const RISK_CONTROLS_STORAGE_KEY = "trade-risk-controls-v1";

export type RiskControlsMode = "demo" | "real_prep" | "strict";
export type RiskControlsStatus = "ok" | "warning" | "blocked" | "disabled";
export type RiskControlsPositionSizeMode = "manual" | "risk_based";
export type RiskControlsPositionSizingMode =
  | "manual"
  | "fixed_risk_amount"
  | "fixed_risk_percent"
  | "max_affordable"
  | "risk_controls";

export type RiskControlsSettings = {
  settings_version: "1.0";
  enabled: boolean;
  mode: RiskControlsMode;
  max_risk_per_trade_amount: number | null;
  max_risk_per_trade_percent: number | null;
  account_size: number | null;
  default_risk_amount_per_trade: number | null;
  default_risk_percent_per_trade: number | null;
  max_position_value: number | null;
  position_sizing_mode: RiskControlsPositionSizingMode;
  max_daily_loss_amount: number | null;
  max_daily_loss_r: number | null;
  max_trades_per_day: number | null;
  max_open_positions: number | null;
  allowed_tickers: string[];
  blocked_tickers: string[];
  require_manual_review_for_real_mode: boolean;
  block_new_trades_after_daily_stop: boolean;
  cooldown_after_loss_enabled: boolean;
  cooldown_after_loss_minutes: number | null;
  default_position_size_mode: RiskControlsPositionSizeMode;
  notes: string | null;
  updated_at: string;
};

export type RiskControlRule = {
  rule_id: string;
  label: string;
  status: RiskControlsStatus;
  message: string;
  blocks_new_trade: boolean;
};

export type RiskControlViolation = {
  violation_id: string;
  rule_id: string;
  message: string;
};

export type RiskControlWarning = {
  warning_id: string;
  rule_id: string;
  message: string;
};

export type RiskControlBlocker = {
  blocker_id: string;
  rule_id: string;
  message: string;
};

export type RiskControlsEvaluation = {
  evaluation_id: string;
  evaluation_version: "1.0";
  evaluation_kind: "new_trade" | "live_trade";
  evaluated_at: string;
  status: RiskControlsStatus;
  mode: RiskControlsMode;
  enabled: boolean;
  ticker: string | null;
  blocks_new_trade: boolean;
  advisory_only: boolean;
  rules: RiskControlRule[];
  violations: RiskControlViolation[];
  blockers: RiskControlBlocker[];
  warnings: RiskControlWarning[];
  next_action_label: string;
  next_action_description: string;
  snapshot: {
    planned_risk_amount: number | null;
    planned_risk_percent: number | null;
    open_positions_count: number | null;
    closed_trades_today_count: number | null;
    daily_realized_pnl: number | null;
    daily_realized_r: number | null;
    cooldown_until: string | null;
  };
};

export type RiskControlsNewTradeInput = {
  settings: RiskControlsSettings;
  ticker?: string | null;
  plannedRiskAmount?: number | null;
  plannedRiskPercent?: number | null;
  openPositionsCount?: number | null;
  closedTradesTodayCount?: number | null;
  dailyRealizedPnl?: number | null;
  dailyRealizedR?: number | null;
  lastLossClosedAt?: string | null;
  isDemo?: boolean;
  now?: Date;
};

export type RiskControlsLiveTradeInput = {
  settings: RiskControlsSettings;
  ticker?: string | null;
  openPositionsCount?: number | null;
  closedTradesTodayCount?: number | null;
  dailyRealizedPnl?: number | null;
  dailyRealizedR?: number | null;
  currentUnrealizedPnl?: number | null;
  currentR?: number | null;
  lastLossClosedAt?: string | null;
  now?: Date;
};

export function createDefaultRiskControlsSettings(
  now = new Date(),
): RiskControlsSettings {
  return {
    settings_version: "1.0",
    enabled: true,
    mode: "demo",
    max_risk_per_trade_amount: null,
    max_risk_per_trade_percent: null,
    account_size: null,
    default_risk_amount_per_trade: null,
    default_risk_percent_per_trade: null,
    max_position_value: null,
    position_sizing_mode: "manual",
    max_daily_loss_amount: null,
    max_daily_loss_r: null,
    max_trades_per_day: null,
    max_open_positions: null,
    allowed_tickers: [],
    blocked_tickers: [],
    require_manual_review_for_real_mode: true,
    block_new_trades_after_daily_stop: true,
    cooldown_after_loss_enabled: false,
    cooldown_after_loss_minutes: null,
    default_position_size_mode: "manual",
    notes: null,
    updated_at: now.toISOString(),
  };
}

export function normalizeRiskControlsSettings(
  value: unknown,
): RiskControlsSettings {
  const defaults = createDefaultRiskControlsSettings();
  const raw = isRecord(value) ? value : {};

  return {
    settings_version: "1.0",
    enabled: raw.enabled === undefined ? defaults.enabled : raw.enabled === true,
    mode: normalizeMode(raw.mode),
    max_risk_per_trade_amount: positiveNumberOrNull(
      raw.max_risk_per_trade_amount,
    ),
    max_risk_per_trade_percent: positiveNumberOrNull(
      raw.max_risk_per_trade_percent,
    ),
    account_size: positiveNumberOrNull(raw.account_size),
    default_risk_amount_per_trade: positiveNumberOrNull(
      raw.default_risk_amount_per_trade,
    ),
    default_risk_percent_per_trade: positiveNumberOrNull(
      raw.default_risk_percent_per_trade,
    ),
    max_position_value: positiveNumberOrNull(raw.max_position_value),
    position_sizing_mode: normalizePositionSizingMode(
      raw.position_sizing_mode,
    ),
    max_daily_loss_amount: positiveNumberOrNull(raw.max_daily_loss_amount),
    max_daily_loss_r: positiveNumberOrNull(raw.max_daily_loss_r),
    max_trades_per_day: positiveIntegerOrNull(raw.max_trades_per_day),
    max_open_positions: positiveIntegerOrNull(raw.max_open_positions),
    allowed_tickers: normalizeTickers(raw.allowed_tickers),
    blocked_tickers: normalizeTickers(raw.blocked_tickers),
    require_manual_review_for_real_mode:
      raw.require_manual_review_for_real_mode === undefined
        ? defaults.require_manual_review_for_real_mode
        : raw.require_manual_review_for_real_mode === true,
    block_new_trades_after_daily_stop:
      raw.block_new_trades_after_daily_stop === undefined
        ? defaults.block_new_trades_after_daily_stop
        : raw.block_new_trades_after_daily_stop === true,
    cooldown_after_loss_enabled:
      raw.cooldown_after_loss_enabled === undefined
        ? defaults.cooldown_after_loss_enabled
        : raw.cooldown_after_loss_enabled === true,
    cooldown_after_loss_minutes: positiveIntegerOrNull(
      raw.cooldown_after_loss_minutes,
    ),
    default_position_size_mode:
      raw.default_position_size_mode === "risk_based" ? "risk_based" : "manual",
    notes: stringOrNull(raw.notes),
    updated_at: stringOrNull(raw.updated_at) ?? defaults.updated_at,
  };
}

export function evaluateRiskControlsForNewTrade(
  input: RiskControlsNewTradeInput,
): RiskControlsEvaluation {
  const now = input.now ?? new Date();
  const settings = input.settings;
  const context = normalizeEvaluationContext(input);

  if (!settings.enabled) {
    return buildEvaluation({
      kind: "new_trade",
      now,
      settings,
      context,
      rules: [
        rule("risk_controls_enabled", "Risk Controls Enabled", "disabled", "Risk controls are disabled.", false),
      ],
    });
  }

  const cooldownUntil = getCooldownUntil({
    settings,
    lastLossClosedAt: input.lastLossClosedAt ?? null,
  });
  const rules: RiskControlRule[] = [
    rule("risk_controls_enabled", "Risk Controls Enabled", "ok", "Risk controls are enabled.", false),
    evaluateTickerRule(settings, context.ticker),
    evaluateAllowedTickerRule(settings, context.ticker),
    evaluateRiskAmountRule(settings, context.plannedRiskAmount),
    evaluateRiskPercentRule(settings, context.plannedRiskPercent),
    evaluateOpenPositionsRule(settings, context.openPositionsCount),
    evaluateTradesPerDayRule(settings, context.closedTradesTodayCount),
    evaluateDailyLossAmountRule(settings, context.dailyRealizedPnl),
    evaluateDailyLossRRule(settings, context.dailyRealizedR),
    evaluateCooldownRule(settings, cooldownUntil, now),
  ];

  if (settings.mode !== "demo" && settings.require_manual_review_for_real_mode) {
    rules.push(
      rule(
        "manual_review_required_real_mode",
        "Manual Review Required",
        "warning",
        "Real-prep/strict mode requires manual review before creating a trade.",
        false,
      ),
    );
  }

  return buildEvaluation({
    kind: "new_trade",
    now,
    settings,
    context: { ...context, cooldownUntil },
    rules,
  });
}

export function evaluateRiskControlsForLiveTrade(
  input: RiskControlsLiveTradeInput,
): RiskControlsEvaluation {
  const now = input.now ?? new Date();
  const settings = input.settings;
  const context = normalizeEvaluationContext(input);
  const cooldownUntil = getCooldownUntil({
    settings,
    lastLossClosedAt: input.lastLossClosedAt ?? null,
  });
  const rules: RiskControlRule[] = settings.enabled
    ? [
        rule("risk_controls_enabled", "Risk Controls Enabled", "ok", "Risk controls are enabled.", false),
        evaluateOpenPositionsRule(settings, context.openPositionsCount),
        evaluateDailyLossAmountRule(settings, context.dailyRealizedPnl, false),
        evaluateDailyLossRRule(settings, context.dailyRealizedR, false),
        evaluateCooldownRule(settings, cooldownUntil, now, false),
      ]
    : [
        rule("risk_controls_enabled", "Risk Controls Enabled", "disabled", "Risk controls are disabled.", false),
      ];

  if (
    input.currentUnrealizedPnl !== null &&
    input.currentUnrealizedPnl !== undefined &&
    input.currentUnrealizedPnl < 0
  ) {
    rules.push(
      rule(
        "live_trade_unrealized_loss",
        "Live Unrealized Loss",
        "warning",
        "This live trade is currently below entry. Risk controls do not block closing/selling.",
        false,
      ),
    );
  }

  return buildEvaluation({
    kind: "live_trade",
    now,
    settings,
    context: { ...context, cooldownUntil },
    rules,
    forceAdvisoryOnly: true,
  });
}

export function riskControlsSettingsJson(settings: RiskControlsSettings) {
  return JSON.stringify(settings, null, 2);
}

export function riskControlsEvaluationJson(evaluation: RiskControlsEvaluation) {
  return JSON.stringify(evaluation, null, 2);
}

function buildEvaluation({
  kind,
  now,
  settings,
  context,
  rules,
  forceAdvisoryOnly = false,
}: {
  kind: RiskControlsEvaluation["evaluation_kind"];
  now: Date;
  settings: RiskControlsSettings;
  context: ReturnType<typeof normalizeEvaluationContext> & {
    cooldownUntil?: string | null;
  };
  rules: RiskControlRule[];
  forceAdvisoryOnly?: boolean;
}): RiskControlsEvaluation {
  const blockingRules = rules.filter((item) => item.blocks_new_trade);
  const warningRules = rules.filter((item) => item.status === "warning");
  const disabled = rules.every((item) => item.status === "disabled");
  const strictBlocks =
    kind === "new_trade" && settings.mode === "strict" && blockingRules.length > 0;
  const status: RiskControlsStatus = disabled
    ? "disabled"
    : strictBlocks
      ? "blocked"
      : blockingRules.length > 0 || warningRules.length > 0
        ? "warning"
        : "ok";
  const blocksNewTrade = !forceAdvisoryOnly && kind === "new_trade" && strictBlocks;
  const blockers = blockingRules.map((item): RiskControlBlocker => ({
    blocker_id: `${item.rule_id}_blocker`,
    rule_id: item.rule_id,
    message: item.message,
  }));
  const warnings = rules
    .filter((item) => item.status === "warning" || item.status === "blocked")
    .map((item): RiskControlWarning => ({
      warning_id: `${item.rule_id}_warning`,
      rule_id: item.rule_id,
      message: item.message,
    }));
  const violations = blockingRules.map((item): RiskControlViolation => ({
    violation_id: `${item.rule_id}_violation`,
    rule_id: item.rule_id,
    message: item.message,
  }));

  return {
    evaluation_id: `risk_controls_${kind}_${safeId(context.ticker)}_${safeId(
      now.toISOString(),
    )}`,
    evaluation_version: "1.0",
    evaluation_kind: kind,
    evaluated_at: now.toISOString(),
    status,
    mode: settings.mode,
    enabled: settings.enabled,
    ticker: context.ticker,
    blocks_new_trade: blocksNewTrade,
    advisory_only: forceAdvisoryOnly || settings.mode !== "strict",
    rules,
    violations,
    blockers,
    warnings,
    next_action_label: getNextActionLabel({
      kind,
      status,
      blocksNewTrade,
      settings,
    }),
    next_action_description: getNextActionDescription({
      kind,
      status,
      blocksNewTrade,
      settings,
    }),
    snapshot: {
      planned_risk_amount: context.plannedRiskAmount,
      planned_risk_percent: context.plannedRiskPercent,
      open_positions_count: context.openPositionsCount,
      closed_trades_today_count: context.closedTradesTodayCount,
      daily_realized_pnl: context.dailyRealizedPnl,
      daily_realized_r: context.dailyRealizedR,
      cooldown_until: context.cooldownUntil ?? null,
    },
  };
}

function evaluateTickerRule(
  settings: RiskControlsSettings,
  ticker: string | null,
) {
  if (!ticker) {
    return rule("ticker_available", "Ticker Available", "warning", "Ticker is unavailable for risk checks.", false);
  }

  if (settings.blocked_tickers.includes(ticker)) {
    return rule("blocked_ticker", "Blocked Ticker", "blocked", `${ticker} is blocked by Risk Controls.`, true);
  }

  return rule("blocked_ticker", "Blocked Ticker", "ok", `${ticker} is not blocked.`, false);
}

function evaluateAllowedTickerRule(
  settings: RiskControlsSettings,
  ticker: string | null,
) {
  if (settings.allowed_tickers.length === 0) {
    return rule("allowed_ticker", "Allowed Ticker", "ok", "No allowed ticker list is configured.", false);
  }

  if (!ticker || !settings.allowed_tickers.includes(ticker)) {
    return rule("allowed_ticker", "Allowed Ticker", "blocked", `${ticker ?? "Ticker"} is not in the allowed ticker list.`, true);
  }

  return rule("allowed_ticker", "Allowed Ticker", "ok", `${ticker} is allowed.`, false);
}

function evaluateRiskAmountRule(
  settings: RiskControlsSettings,
  plannedRiskAmount: number | null,
) {
  if (settings.max_risk_per_trade_amount === null) {
    return rule("max_risk_amount", "Max Risk Amount", "ok", "No max risk amount is configured.", false);
  }

  if (plannedRiskAmount === null) {
    return rule("max_risk_amount", "Max Risk Amount", "warning", "Planned risk amount is unavailable.", false);
  }

  if (plannedRiskAmount > settings.max_risk_per_trade_amount) {
    return rule("max_risk_amount", "Max Risk Amount", "blocked", `Planned risk ${formatNumber(plannedRiskAmount)} exceeds max ${formatNumber(settings.max_risk_per_trade_amount)}.`, true);
  }

  return rule("max_risk_amount", "Max Risk Amount", "ok", "Planned risk amount is within limit.", false);
}

function evaluateRiskPercentRule(
  settings: RiskControlsSettings,
  plannedRiskPercent: number | null,
) {
  if (settings.max_risk_per_trade_percent === null) {
    return rule("max_risk_percent", "Max Risk Percent", "ok", "No max risk percent is configured.", false);
  }

  if (plannedRiskPercent === null) {
    return rule("max_risk_percent", "Max Risk Percent", "warning", "Planned risk percent is unavailable.", false);
  }

  if (plannedRiskPercent > settings.max_risk_per_trade_percent) {
    return rule("max_risk_percent", "Max Risk Percent", "blocked", `Planned risk ${formatNumber(plannedRiskPercent)}% exceeds max ${formatNumber(settings.max_risk_per_trade_percent)}%.`, true);
  }

  return rule("max_risk_percent", "Max Risk Percent", "ok", "Planned risk percent is within limit.", false);
}

function evaluateOpenPositionsRule(
  settings: RiskControlsSettings,
  openPositionsCount: number | null,
) {
  if (settings.max_open_positions === null) {
    return rule("max_open_positions", "Max Open Positions", "ok", "No max open positions limit is configured.", false);
  }

  if (openPositionsCount === null) {
    return rule("max_open_positions", "Max Open Positions", "warning", "Open position count is unavailable.", false);
  }

  if (openPositionsCount >= settings.max_open_positions) {
    return rule("max_open_positions", "Max Open Positions", "blocked", `Open positions ${openPositionsCount} reached max ${settings.max_open_positions}.`, true);
  }

  return rule("max_open_positions", "Max Open Positions", "ok", "Open position count is within limit.", false);
}

function evaluateTradesPerDayRule(
  settings: RiskControlsSettings,
  closedTradesTodayCount: number | null,
) {
  if (settings.max_trades_per_day === null) {
    return rule("max_trades_per_day", "Max Trades Per Day", "ok", "No daily trade count limit is configured.", false);
  }

  if (closedTradesTodayCount === null) {
    return rule("max_trades_per_day", "Max Trades Per Day", "warning", "Closed trades today count is unavailable.", false);
  }

  if (closedTradesTodayCount >= settings.max_trades_per_day) {
    return rule("max_trades_per_day", "Max Trades Per Day", "blocked", `Closed trades today ${closedTradesTodayCount} reached max ${settings.max_trades_per_day}.`, true);
  }

  return rule("max_trades_per_day", "Max Trades Per Day", "ok", "Daily trade count is within limit.", false);
}

function evaluateDailyLossAmountRule(
  settings: RiskControlsSettings,
  dailyRealizedPnl: number | null,
  canBlock = true,
) {
  if (settings.max_daily_loss_amount === null) {
    return rule("max_daily_loss_amount", "Max Daily Loss Amount", "ok", "No daily loss amount is configured.", false);
  }

  if (dailyRealizedPnl === null) {
    return rule("max_daily_loss_amount", "Max Daily Loss Amount", "warning", "Daily realized PnL is unavailable.", false);
  }

  if (dailyRealizedPnl <= -settings.max_daily_loss_amount) {
    return rule("max_daily_loss_amount", "Max Daily Loss Amount", canBlock && settings.block_new_trades_after_daily_stop ? "blocked" : "warning", `Daily realized loss ${formatNumber(dailyRealizedPnl)} reached stop ${formatNumber(-settings.max_daily_loss_amount)}.`, canBlock && settings.block_new_trades_after_daily_stop);
  }

  return rule("max_daily_loss_amount", "Max Daily Loss Amount", "ok", "Daily realized PnL is within limit.", false);
}

function evaluateDailyLossRRule(
  settings: RiskControlsSettings,
  dailyRealizedR: number | null,
  canBlock = true,
) {
  if (settings.max_daily_loss_r === null) {
    return rule("max_daily_loss_r", "Max Daily Loss R", "ok", "No daily R loss is configured.", false);
  }

  if (dailyRealizedR === null) {
    return rule("max_daily_loss_r", "Max Daily Loss R", "warning", "Daily realized R is unavailable.", false);
  }

  if (dailyRealizedR <= -settings.max_daily_loss_r) {
    return rule("max_daily_loss_r", "Max Daily Loss R", canBlock && settings.block_new_trades_after_daily_stop ? "blocked" : "warning", `Daily realized R ${formatNumber(dailyRealizedR)} reached stop -${formatNumber(settings.max_daily_loss_r)}R.`, canBlock && settings.block_new_trades_after_daily_stop);
  }

  return rule("max_daily_loss_r", "Max Daily Loss R", "ok", "Daily realized R is within limit.", false);
}

function evaluateCooldownRule(
  settings: RiskControlsSettings,
  cooldownUntil: string | null,
  now: Date,
  canBlock = true,
) {
  if (!settings.cooldown_after_loss_enabled) {
    return rule("cooldown_after_loss", "Cooldown After Loss", "ok", "Cooldown after loss is disabled.", false);
  }

  if (!settings.cooldown_after_loss_minutes) {
    return rule("cooldown_after_loss", "Cooldown After Loss", "warning", "Cooldown is enabled but minutes are not configured.", false);
  }

  if (!cooldownUntil) {
    return rule("cooldown_after_loss", "Cooldown After Loss", "ok", "No recent loss cooldown is active.", false);
  }

  if (new Date(cooldownUntil).getTime() > now.getTime()) {
    return rule("cooldown_after_loss", "Cooldown After Loss", canBlock ? "blocked" : "warning", `Cooldown after loss is active until ${cooldownUntil}.`, canBlock);
  }

  return rule("cooldown_after_loss", "Cooldown After Loss", "ok", "Cooldown window has passed.", false);
}

function getCooldownUntil({
  settings,
  lastLossClosedAt,
}: {
  settings: RiskControlsSettings;
  lastLossClosedAt: string | null;
}) {
  if (
    !settings.cooldown_after_loss_enabled ||
    !settings.cooldown_after_loss_minutes ||
    !lastLossClosedAt
  ) {
    return null;
  }

  const closedAtMs = new Date(lastLossClosedAt).getTime();

  if (!Number.isFinite(closedAtMs)) {
    return null;
  }

  return new Date(
    closedAtMs + settings.cooldown_after_loss_minutes * 60 * 1000,
  ).toISOString();
}

function getNextActionLabel({
  kind,
  status,
  blocksNewTrade,
}: {
  kind: RiskControlsEvaluation["evaluation_kind"];
  status: RiskControlsStatus;
  blocksNewTrade: boolean;
  settings: RiskControlsSettings;
}) {
  if (status === "disabled") return "Risk controls disabled";
  if (blocksNewTrade) return "Resolve strict risk blockers";
  if (kind === "live_trade") return "Use as advisory context";
  if (status === "warning") return "Review risk warnings";
  return "Risk controls clear";
}

function getNextActionDescription({
  kind,
  status,
  blocksNewTrade,
  settings,
}: {
  kind: RiskControlsEvaluation["evaluation_kind"];
  status: RiskControlsStatus;
  blocksNewTrade: boolean;
  settings: RiskControlsSettings;
}) {
  if (status === "disabled") {
    return "Risk controls are disabled in Settings.";
  }

  if (blocksNewTrade) {
    return "Strict mode blocks creating a new Live Day Trade until blockers are resolved.";
  }

  if (kind === "live_trade") {
    return "Risk controls never block closing or selling a live trade.";
  }

  if (settings.mode === "demo") {
    return "Demo mode shows warnings only and does not block this trade.";
  }

  if (settings.mode === "real_prep") {
    return "Real-prep mode requires manual review but does not block creation.";
  }

  return "Strict mode will block only when configured limits are breached.";
}

function normalizeEvaluationContext(input: {
  ticker?: string | null;
  plannedRiskAmount?: number | null;
  plannedRiskPercent?: number | null;
  openPositionsCount?: number | null;
  closedTradesTodayCount?: number | null;
  dailyRealizedPnl?: number | null;
  dailyRealizedR?: number | null;
}) {
  return {
    ticker: normalizeTicker(input.ticker),
    plannedRiskAmount: finiteNumberOrNull(input.plannedRiskAmount),
    plannedRiskPercent: finiteNumberOrNull(input.plannedRiskPercent),
    openPositionsCount: finiteNumberOrNull(input.openPositionsCount),
    closedTradesTodayCount: finiteNumberOrNull(input.closedTradesTodayCount),
    dailyRealizedPnl: finiteNumberOrNull(input.dailyRealizedPnl),
    dailyRealizedR: finiteNumberOrNull(input.dailyRealizedR),
  };
}

function rule(
  rule_id: string,
  label: string,
  status: RiskControlsStatus,
  message: string,
  blocks_new_trade: boolean,
): RiskControlRule {
  return {
    rule_id,
    label,
    status,
    message,
    blocks_new_trade,
  };
}

function normalizeMode(value: unknown): RiskControlsMode {
  if (value === "real_prep" || value === "strict") {
    return value;
  }

  return "demo";
}

function normalizePositionSizingMode(value: unknown): RiskControlsPositionSizingMode {
  if (
    value === "fixed_risk_amount" ||
    value === "fixed_risk_percent" ||
    value === "max_affordable" ||
    value === "risk_controls"
  ) {
    return value;
  }

  return "manual";
}

function normalizeTickers(value: unknown): string[] {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return Array.from(
    new Set(
      source
        .map((item) => normalizeTicker(item))
        .filter((item): item is string => Boolean(item)),
    ),
  );
}

function normalizeTicker(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim().toUpperCase()
    : null;
}

function positiveNumberOrNull(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function positiveIntegerOrNull(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}

function finiteNumberOrNull(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function safeId(value: string | null | undefined) {
  return value?.replace(/[^a-zA-Z0-9_-]+/g, "_") || "unknown";
}

function formatNumber(value: number) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
    : "unknown";
}
