import type { AddTradePreflightSummary } from "@/lib/add-trade-preflight-summary";
import type { MarketSessionEvaluation } from "@/lib/market-session";
import type { PositionSizingResult } from "@/lib/position-sizing";
import type { RiskControlsEvaluation } from "@/lib/risk-controls";
import type { TradePlanQualityResult } from "@/lib/trade-plan-quality";

export type TradePlanningSnapshot = {
  snapshot_id: string;
  snapshot_version: "1.0";
  captured_at: string;
  ticker: string | null;
  side: string | null;
  entry_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  planned_quantity: number | null;
  actual_entry_shares: number | null;
  risk_per_share: number | null;
  reward_per_share: number | null;
  risk_reward_ratio: number | null;
  recommended_quantity: number | null;
  estimated_risk_amount: number | null;
  estimated_reward_amount: number | null;
  position_sizing_status: string | null;
  position_sizing_warnings: string[];
  position_sizing_blockers: string[];
  trade_plan_quality_status: string | null;
  trade_plan_quality_grade: string | null;
  trade_plan_quality_warnings: string[];
  trade_plan_quality_blockers: string[];
  risk_controls_status: string | null;
  risk_controls_mode: string | null;
  risk_controls_warnings: string[];
  risk_controls_blockers: string[];
  market_session_phase: string | null;
  market_session_risk: string | null;
  market_session_source: string | null;
  preflight_status: string | null;
  preflight_warnings: string[];
  preflight_blockers: string[];
  broker_fill_status: string | null;
  broker_reference: string | null;
  demo_or_real_source: "demo" | "real" | "mock" | "unknown";
};

export type BuildTradePlanningSnapshotInput = {
  ticker?: string | null;
  side?: string | null;
  entryPrice?: number | null;
  stopPrice?: number | null;
  targetPrice?: number | null;
  plannedQuantity?: number | null;
  actualEntryShares?: number | null;
  positionSizing?: PositionSizingResult | null;
  tradePlanQuality?: TradePlanQualityResult | null;
  riskControls?: RiskControlsEvaluation | null;
  marketSession?: MarketSessionEvaluation | null;
  preflight?: AddTradePreflightSummary | null;
  brokerFillStatus?: string | null;
  brokerReference?: string | null;
  demoOrRealSource?: "demo" | "real" | "mock" | "unknown" | null;
  capturedAt?: string | null;
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function messageList(
  value: unknown,
  key: "message" | "label" = "message",
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const raw = item as Record<string, unknown>;
      return nullableString(raw[key]) ?? nullableString(raw.message);
    })
    .filter((item): item is string => item !== null);
}

function snapshotId(input: {
  ticker: string | null;
  capturedAt: string;
  preflightStatus?: string | null;
}) {
  return [
    "trade-plan-snapshot",
    input.ticker ?? "unknown",
    input.preflightStatus ?? "unknown",
    input.capturedAt.replace(/[^0-9a-z]/gi, "").slice(0, 18),
  ].join("-");
}

export function buildTradePlanningSnapshot(
  input: BuildTradePlanningSnapshotInput,
): TradePlanningSnapshot {
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  const ticker = nullableString(input.ticker)?.toUpperCase() ?? null;
  const positionSizing = input.positionSizing;
  const tradePlanQuality = input.tradePlanQuality;
  const riskControls = input.riskControls;
  const marketSession = input.marketSession;
  const preflight = input.preflight;
  const actualEntryShares = finiteNumber(input.actualEntryShares);
  const plannedQuantity =
    finiteNumber(input.plannedQuantity) ??
    finiteNumber(positionSizing?.planned_quantity) ??
    finiteNumber(tradePlanQuality?.planned_quantity);
  const partialFillWarning =
    plannedQuantity !== null &&
    actualEntryShares !== null &&
    actualEntryShares !== plannedQuantity
      ? [`Actual entry shares (${actualEntryShares}) differ from planned quantity (${plannedQuantity}).`]
      : [];

  return {
    snapshot_id: snapshotId({
      ticker,
      capturedAt,
      preflightStatus: preflight?.status ?? null,
    }),
    snapshot_version: "1.0",
    captured_at: capturedAt,
    ticker,
    side: nullableString(input.side),
    entry_price:
      finiteNumber(input.entryPrice) ??
      finiteNumber(positionSizing?.entry_price) ??
      finiteNumber(tradePlanQuality?.entry_price),
    stop_price:
      finiteNumber(input.stopPrice) ??
      finiteNumber(positionSizing?.stop_price) ??
      finiteNumber(tradePlanQuality?.stop_price),
    target_price:
      finiteNumber(input.targetPrice) ??
      finiteNumber(positionSizing?.target_price) ??
      finiteNumber(tradePlanQuality?.target_price),
    planned_quantity: plannedQuantity,
    actual_entry_shares: actualEntryShares,
    risk_per_share:
      finiteNumber(positionSizing?.risk_per_share) ??
      finiteNumber(tradePlanQuality?.risk_per_share),
    reward_per_share:
      finiteNumber(positionSizing?.reward_per_share) ??
      finiteNumber(tradePlanQuality?.reward_per_share),
    risk_reward_ratio:
      finiteNumber(positionSizing?.risk_reward_ratio) ??
      finiteNumber(tradePlanQuality?.risk_reward_ratio),
    recommended_quantity: finiteNumber(positionSizing?.recommended_quantity),
    estimated_risk_amount: finiteNumber(
      positionSizing?.estimated_risk_at_planned_quantity,
    ),
    estimated_reward_amount: finiteNumber(
      positionSizing?.estimated_reward_at_planned_quantity,
    ),
    position_sizing_status: nullableString(positionSizing?.status),
    position_sizing_warnings: [
      ...messageList(positionSizing?.warnings),
      ...partialFillWarning,
    ],
    position_sizing_blockers: messageList(positionSizing?.blockers),
    trade_plan_quality_status: nullableString(tradePlanQuality?.status),
    trade_plan_quality_grade: nullableString(tradePlanQuality?.grade),
    trade_plan_quality_warnings: messageList(tradePlanQuality?.warnings),
    trade_plan_quality_blockers: messageList(tradePlanQuality?.blockers),
    risk_controls_status: nullableString(riskControls?.status),
    risk_controls_mode: nullableString(riskControls?.mode),
    risk_controls_warnings: messageList(riskControls?.warnings),
    risk_controls_blockers: messageList(riskControls?.blockers),
    market_session_phase: nullableString(marketSession?.phase),
    market_session_risk: nullableString(marketSession?.risk_level),
    market_session_source: nullableString(marketSession?.source),
    preflight_status: nullableString(preflight?.status),
    preflight_warnings: messageList(preflight?.warnings),
    preflight_blockers: messageList(preflight?.blockers),
    broker_fill_status: nullableString(input.brokerFillStatus),
    broker_reference: nullableString(input.brokerReference),
    demo_or_real_source: input.demoOrRealSource ?? "unknown",
  };
}

export function normalizeTradePlanningSnapshot(
  value: unknown,
): TradePlanningSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const snapshotVersion = raw.snapshot_version === "1.0" ? "1.0" : null;
  const capturedAt = nullableString(raw.captured_at);

  if (!snapshotVersion || !capturedAt) {
    return null;
  }

  return {
    snapshot_id:
      nullableString(raw.snapshot_id) ??
      snapshotId({
        ticker: nullableString(raw.ticker),
        capturedAt,
        preflightStatus: nullableString(raw.preflight_status),
      }),
    snapshot_version: snapshotVersion,
    captured_at: capturedAt,
    ticker: nullableString(raw.ticker),
    side: nullableString(raw.side),
    entry_price: finiteNumber(raw.entry_price),
    stop_price: finiteNumber(raw.stop_price),
    target_price: finiteNumber(raw.target_price),
    planned_quantity: finiteNumber(raw.planned_quantity),
    actual_entry_shares: finiteNumber(raw.actual_entry_shares),
    risk_per_share: finiteNumber(raw.risk_per_share),
    reward_per_share: finiteNumber(raw.reward_per_share),
    risk_reward_ratio: finiteNumber(raw.risk_reward_ratio),
    recommended_quantity: finiteNumber(raw.recommended_quantity),
    estimated_risk_amount: finiteNumber(raw.estimated_risk_amount),
    estimated_reward_amount: finiteNumber(raw.estimated_reward_amount),
    position_sizing_status: nullableString(raw.position_sizing_status),
    position_sizing_warnings: stringList(raw.position_sizing_warnings),
    position_sizing_blockers: stringList(raw.position_sizing_blockers),
    trade_plan_quality_status: nullableString(raw.trade_plan_quality_status),
    trade_plan_quality_grade: nullableString(raw.trade_plan_quality_grade),
    trade_plan_quality_warnings: stringList(raw.trade_plan_quality_warnings),
    trade_plan_quality_blockers: stringList(raw.trade_plan_quality_blockers),
    risk_controls_status: nullableString(raw.risk_controls_status),
    risk_controls_mode: nullableString(raw.risk_controls_mode),
    risk_controls_warnings: stringList(raw.risk_controls_warnings),
    risk_controls_blockers: stringList(raw.risk_controls_blockers),
    market_session_phase: nullableString(raw.market_session_phase),
    market_session_risk: nullableString(raw.market_session_risk),
    market_session_source: nullableString(raw.market_session_source),
    preflight_status: nullableString(raw.preflight_status),
    preflight_warnings: stringList(raw.preflight_warnings),
    preflight_blockers: stringList(raw.preflight_blockers),
    broker_fill_status: nullableString(raw.broker_fill_status),
    broker_reference: nullableString(raw.broker_reference),
    demo_or_real_source:
      raw.demo_or_real_source === "demo" ||
      raw.demo_or_real_source === "real" ||
      raw.demo_or_real_source === "mock"
        ? raw.demo_or_real_source
        : "unknown",
  };
}

export function tradePlanningSnapshotJson(
  snapshot: TradePlanningSnapshot,
): string {
  return JSON.stringify(snapshot, null, 2);
}
