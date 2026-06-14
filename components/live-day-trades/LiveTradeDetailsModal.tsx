"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Image from "next/image";

import { LiveDayTradeEodSafetyPanel } from "@/components/live-day-trades/LiveDayTradeEodSafetyPanel";
import {
  RecommendationDetailsContextCard,
  RecommendationDetailsContextRow,
  RecommendationDetailsMetricGrid,
  RecommendationDetailsPill,
  RecommendationDetailsSection,
  RecommendationDetailsTextCard,
  RecommendationDetailsTextStack,
} from "@/components/recommendations/RecommendationDetailsModal";
import { recommendationDetailsValue } from "@/components/recommendations/recommendation-details-display-helpers";
import type { BrokerExecutionMetadata } from "@/lib/broker-execution-metadata";
import { brokerOrderStatusLabel } from "@/lib/broker-execution-metadata";
import type { IntradayIndicators } from "@/lib/intraday-indicators";
import type { LiveSellGuidance, LiveSellUrgency } from "@/lib/live-sell-guidance";
import type { RiskControlsEvaluation } from "@/lib/risk-controls";

type LiveTradeDetailsPosition = {
  companyName: string;
  direction: string;
  entryPrice: string;
  entryPriceValue: number | null;
  executionMetadata: BrokerExecutionMetadata | null;
  invalidation: string;
  openedAt: string;
  openedAtRaw: string | null;
  positionSize: string;
  positionSizeValue: number | null;
  recommendationId: string | null;
  stopLoss: string;
  stopLossValue: number | null;
  target1: string;
  ticker: string;
};

type LiveTradeDetailsLatestUpdate = {
  currentPrice: string;
  explanation: string;
  intradayIndicators: IntradayIndicators | null;
  newStop: string;
  reason: string;
  unrealizedPercentValue: number | null;
  updatedAt: string;
};

type LiveTradeDetailsEodSafetyStatus = {
  message: string;
  severity: "none" | "warning" | "critical";
  status: string;
};

type LiveTradeDetailsPositionUrgency = {
  urgency: "normal" | "warning" | "critical";
};

type LiveTradeDetailsAuditDisplay = {
  auditHandoffQuality: {
    calculated_at: string;
    label: string;
    rating: "excellent" | "good" | "acceptable" | "poor" | "unknown";
    score: number;
    summary: string;
  };
  auditReplay: {
    handoff_session_id?: string;
    overall_status: "complete" | "partial" | "failed" | "unknown";
    summary: string;
  };
  auditSummary: string;
  firstSuggestion?: {
    priority: "high" | "medium" | "low";
    suggested_action: string;
  };
  firstTimelineDescription?: string;
  fullAuditTrail: ReactNode;
  previewWarningLabel: string;
  suggestionsCount: number;
  timelineCount: number;
  executionQuality: {
    quality_rating: "excellent" | "good" | "acceptable" | "poor" | "unknown";
  };
  executionQualityLabel: string;
};

export type LiveTradeDetailsModalProps = {
  audit: LiveTradeDetailsAuditDisplay;
  currentPercent: string;
  currentR: number | null;
  dataModeNotice: ReactNode;
  eodRiskAcknowledged: boolean;
  eodSafetyLabel: string;
  eodSafetyStatus: LiveTradeDetailsEodSafetyStatus;
  headerIdentity: ReactNode;
  latestUpdate?: LiveTradeDetailsLatestUpdate;
  liveSellGuidance: LiveSellGuidance;
  maxLoss: string;
  onAcknowledgeEndOfDayRisk: () => void;
  onClose: () => void;
  position: LiveTradeDetailsPosition;
  positionUrgency: LiveTradeDetailsPositionUrgency;
  positionValue: string;
  realityBadgeRow: ReactNode;
  riskControlsEvaluation: RiskControlsEvaluation;
  riskControlsEvaluationJsonText: string;
  riskControlsPanel: ReactNode;
  riskFlags: string[];
  riskPerShare: string;
  setupLabel: string;
  showEodManualReview: boolean;
  status: ReactNode;
  unrealizedPnl: { pnl: number | null; percent: number | null };
  warnings: string[];
};

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatShares(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedCurrency(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  const formatted = formatCurrency(Math.abs(value));
  return `${value >= 0 ? "+" : "-"}${formatted}`;
}

function formatSignedR(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTimeInTrade(value: string | null) {
  if (!value) {
    return "—";
  }

  const openedAt = new Date(value).getTime();

  if (Number.isNaN(openedAt)) {
    return "—";
  }

  const diffMs = Date.now() - openedAt;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatIntradayIndicatorValue(value: number | null, suffix = "") {
  return value === null ? "Unknown" : `${value.toFixed(2)}${suffix}`;
}

function shortPayloadId(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.length <= 14 ? value : `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function isCloseRequiredAction(action: string) {
  return action === "CLOSE_POSITION" || action === "STOP_LOSS";
}

function isTakeProfitAction(value: string) {
  return value === "TAKE_PROFIT" || value === "TAKE_PARTIAL_PROFIT";
}

function liveSellActionToLegacyAction(action: LiveSellGuidance["action"]) {
  if (action === "take_profit") return "TAKE_PROFIT";
  if (action === "close_position") return "CLOSE_POSITION";
  if (action === "review_required") return "REVIEW_REQUIRED";
  return "HOLD";
}

function liveSellUrgencyTone(
  urgency: LiveSellUrgency,
): "positive" | "warning" | "danger" | "neutral" {
  if (urgency === "critical") return "danger";
  if (urgency === "high" || urgency === "medium") return "warning";
  if (urgency === "low") return "positive";
  return "neutral";
}

function liveDetailsToneFromAction(
  action: string,
): "positive" | "warning" | "danger" | "neutral" {
  if (isCloseRequiredAction(action)) return "danger";
  if (isTakeProfitAction(action)) return "positive";
  if (action === "NO_ACTION" || action === "HOLD") return "neutral";
  if (action === "REVIEW_REQUIRED" || action === "WATCH") return "warning";
  return "warning";
}

function liveDetailsToneFromSeverity(
  severity:
    | LiveTradeDetailsEodSafetyStatus["severity"]
    | LiveTradeDetailsPositionUrgency["urgency"],
): "positive" | "warning" | "danger" | "neutral" {
  if (severity === "critical") return "danger";
  if (severity === "warning") return "warning";
  if (severity === "normal" || severity === "none") return "positive";
  return "neutral";
}

export function LiveTradeDetailsModal({
  audit,
  currentPercent,
  currentR,
  dataModeNotice,
  eodRiskAcknowledged,
  eodSafetyLabel,
  eodSafetyStatus,
  headerIdentity,
  latestUpdate,
  liveSellGuidance,
  maxLoss,
  onAcknowledgeEndOfDayRisk,
  onClose,
  position,
  positionUrgency,
  positionValue,
  realityBadgeRow,
  riskControlsEvaluation,
  riskControlsEvaluationJsonText,
  riskControlsPanel,
  riskFlags,
  riskPerShare,
  setupLabel,
  showEodManualReview,
  status,
  unrealizedPnl,
  warnings,
}: LiveTradeDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const intradayIndicators = latestUpdate?.intradayIndicators;
  const guidance = liveSellGuidance.primary_message;
  const guidanceAction = liveSellActionToLegacyAction(liveSellGuidance.action);
  const updatedAt = latestUpdate ? latestUpdate.updatedAt : position.openedAt;

  return (
    <div
      className="trade-recommendation-details-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <section
        aria-labelledby="trade-live-details-title"
        aria-modal="true"
        className="trade-recommendation-details-modal trade-live-details-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="trade-recommendation-details-titlebar">
          <h2 id="trade-live-details-title">Live Day Trade Details</h2>
          <button
            type="button"
            aria-label="Close live day trade details"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="trade-recommendation-details-close"
          >
            <Image
              src="/trade-assets/x-icn.svg"
              alt=""
              aria-hidden="true"
              width={29}
              height={29}
            />
          </button>
        </div>

        <div className="trade-recommendation-details-scroll">
          <header className="trade-recommendation-details-header">
            {headerIdentity}
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {realityBadgeRow}
              {status}
            </div>
          </header>

          {dataModeNotice}

          <RecommendationDetailsSection title="Quick Decision">
            <div className="trade-recommendation-details-quick-decision">
              <div className="trade-recommendation-details-guidance">
                <div>
                  <p>{recommendationDetailsValue(guidance)}</p>
                  <span className="trade-recommendation-details-guidance__timestamp">
                    Updated {recommendationDetailsValue(updatedAt)}
                  </span>
                </div>
                <div className="trade-recommendation-details-pill-row trade-recommendation-details-pill-row--quick">
                  <RecommendationDetailsPill
                    label={liveSellGuidance.primary_label}
                    tone={liveDetailsToneFromAction(guidanceAction)}
                  />
                  <RecommendationDetailsPill
                    label={liveSellGuidance.urgency}
                    tone={liveSellUrgencyTone(liveSellGuidance.urgency)}
                  />
                  <RecommendationDetailsPill
                    label={liveSellGuidance.trigger}
                    tone={liveSellUrgencyTone(liveSellGuidance.urgency)}
                  />
                </div>
              </div>

              <div className="trade-recommendation-details-two-column">
                <RecommendationDetailsTextCard label="Live Sell Guidance">
                  <p>{recommendationDetailsValue(liveSellGuidance.next_step)}</p>
                  <p>{recommendationDetailsValue(liveSellGuidance.why_now)}</p>
                  <p>
                    Guidance is advisory only. Trade cannot submit orders or click
                    Avanza SÄLJ.
                  </p>
                </RecommendationDetailsTextCard>
                <RecommendationDetailsTextCard label="Watch This">
                  <RecommendationDetailsTextStack
                    items={[
                      ...liveSellGuidance.blockers,
                      ...liveSellGuidance.warnings,
                      ...riskFlags,
                    ].slice(0, 4)}
                    empty="No major live risk flags surfaced."
                    tone="warning"
                  />
                </RecommendationDetailsTextCard>
              </div>

              <RecommendationDetailsMetricGrid
                variant="wide"
                metrics={[
                  {
                    label: "Trigger",
                    value: liveSellGuidance.trigger,
                  },
                  {
                    label: "Confidence",
                    value: liveSellGuidance.confidence,
                  },
                  {
                    label: "Distance to Target",
                    value: formatCurrency(liveSellGuidance.distance_to_target),
                  },
                  {
                    label: "Distance to Stop",
                    value: formatCurrency(liveSellGuidance.distance_to_stop),
                  },
                  {
                    label: "Current R",
                    value: formatSignedR(liveSellGuidance.current_r),
                  },
                  {
                    label: "Best Known Price",
                    value: formatCurrency(liveSellGuidance.best_price),
                  },
                  {
                    label: "Best Known R",
                    value: formatSignedR(liveSellGuidance.best_r),
                  },
                  {
                    label: "Fade From Best",
                    value: formatSignedR(liveSellGuidance.profit_fade_from_best),
                  },
                  {
                    label: "Evaluated",
                    value: formatDate(liveSellGuidance.evaluated_at),
                  },
                ]}
              />
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Trade Plan">
            <div className="trade-recommendation-details-trade-plan">
              <RecommendationDetailsMetricGrid
                metrics={[
                  {
                    label: "Current",
                    value: latestUpdate ? latestUpdate.currentPrice : "—",
                  },
                  {
                    label: "Unrealized",
                    value: formatSignedCurrency(unrealizedPnl.pnl),
                    tone: unrealizedPnl.pnl,
                  },
                  { label: "PnL %", value: currentPercent },
                  { label: "Current R", value: formatSignedR(currentR) },
                  { label: "Entry", value: position.entryPrice },
                  { label: "Stop", value: position.stopLoss },
                  { label: "Target", value: position.target1 },
                  { label: "Shares", value: position.positionSize },
                ]}
              />
              <div
                className="trade-recommendation-details-trade-plan__divider"
                aria-hidden="true"
              />
              <RecommendationDetailsMetricGrid
                variant="wide"
                metrics={[
                  { label: "Direction", value: position.direction },
                  {
                    label: "Setup Type",
                    value: setupLabel,
                  },
                  { label: "Position Value", value: positionValue },
                  { label: "Max Loss", value: maxLoss },
                  { label: "Risk/share", value: riskPerShare },
                  {
                    label: "Partial Status",
                    value:
                      position.executionMetadata?.partial_position_status?.replaceAll(
                        "_",
                        " ",
                      ) ?? "fully open",
                  },
                  {
                    label: "Realized From Exits",
                    value: formatSignedCurrency(
                      position.executionMetadata?.realized_pnl_from_exits ?? null,
                    ),
                    tone:
                      position.executionMetadata?.realized_pnl_from_exits ?? null,
                  },
                  { label: "Time In Trade", value: formatTimeInTrade(position.openedAtRaw) },
                ]}
              />
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Live Trade Context">
            <div className="trade-recommendation-details-stack">
              {riskControlsPanel}
              <div
                id="trade-risk-controls-live-trade-evaluation-json"
                data-agent-readable="true"
                data-evaluation-id={riskControlsEvaluation.evaluation_id}
                data-evaluation-status={riskControlsEvaluation.status}
                data-mode={riskControlsEvaluation.mode}
                className="sr-only"
              >
                {riskControlsEvaluationJsonText}
              </div>

              {positionUrgency.urgency === "critical" && (
                <RecommendationDetailsTextCard
                  label="Critical Manual Action Required"
                  pill={<RecommendationDetailsPill label="Critical" tone="danger" />}
                >
                  <p>{recommendationDetailsValue(guidance)}</p>
                </RecommendationDetailsTextCard>
              )}

              {showEodManualReview && (
                <LiveDayTradeEodSafetyPanel
                  acknowledged={eodRiskAcknowledged}
                  acknowledgeLabel="Acknowledge EOD Risk"
                  label={eodRiskAcknowledged ? "Acknowledged" : eodSafetyLabel}
                  message={`${eodSafetyStatus.message} Close in broker first, then close trade in app.`}
                  onAcknowledge={onAcknowledgeEndOfDayRisk}
                  tone={
                    eodRiskAcknowledged
                      ? "neutral"
                      : liveDetailsToneFromSeverity(eodSafetyStatus.severity)
                  }
                />
              )}

              {(liveSellGuidance.why_now ||
                liveSellGuidance.protective_action_reason ||
                liveSellGuidance.is_profit_fading) && (
                <RecommendationDetailsTextCard
                  label="Why Now?"
                  pill={
                    liveSellGuidance.is_profit_fading ? (
                      <RecommendationDetailsPill label="Profit Fade" tone="warning" />
                    ) : undefined
                  }
                >
                  <p>{recommendationDetailsValue(liveSellGuidance.why_now)}</p>
                  {liveSellGuidance.protective_action_reason && (
                    <p>
                      {recommendationDetailsValue(
                        liveSellGuidance.protective_action_reason,
                      )}
                    </p>
                  )}
                  {liveSellGuidance.is_profit_fading && (
                    <p>
                      Best known R {formatSignedR(liveSellGuidance.best_r)} has
                      faded by{" "}
                      {formatSignedR(liveSellGuidance.profit_fade_from_best)}.
                    </p>
                  )}
                </RecommendationDetailsTextCard>
              )}
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Live Trade Details">
            <div className="trade-recommendation-details-stack">
              <RecommendationDetailsTextCard
                label="Intraday Confirmation"
                pill={
                  <RecommendationDetailsPill
                    label={
                      intradayIndicators?.isAboveVwap === false
                        ? "Below VWAP"
                        : intradayIndicators
                          ? "Live Data"
                          : "Waiting"
                    }
                    tone={
                      intradayIndicators?.isAboveVwap === false
                        ? "danger"
                        : intradayIndicators
                          ? "positive"
                          : "neutral"
                    }
                  />
                }
              >
                <p>
                  {intradayIndicators
                    ? `VWAP ${
                        intradayIndicators.isAboveVwap === null
                          ? "Unavailable"
                          : intradayIndicators.isAboveVwap
                            ? "Above"
                            : "Below"
                      }, Price vs VWAP ${formatIntradayIndicatorValue(
                        intradayIndicators.priceVsVwapPercent,
                        "%",
                      )}, Momentum ${recommendationDetailsValue(
                        intradayIndicators.momentumDirection,
                      )}, Volume ${recommendationDetailsValue(
                        intradayIndicators.volumeTrend,
                      )}`
                    : "Intraday indicators are waiting for the next live update."}
                </p>
              </RecommendationDetailsTextCard>

              <div className="trade-recommendation-details-two-column trade-recommendation-details-two-column--flush">
                <RecommendationDetailsTextCard label="Action Reason">
                  <p>{recommendationDetailsValue(latestUpdate?.reason)}</p>
                  {latestUpdate?.explanation && (
                    <p>{recommendationDetailsValue(latestUpdate.explanation)}</p>
                  )}
                </RecommendationDetailsTextCard>
                <RecommendationDetailsTextCard label="Invalidation / Warnings">
                  <RecommendationDetailsTextStack
                    items={[
                      position.invalidation,
                      ...warnings,
                      latestUpdate?.newStop && latestUpdate.newStop !== "Not set"
                        ? `New stop: ${latestUpdate.newStop}`
                        : null,
                    ].filter((item): item is string => Boolean(item))}
                    empty="—"
                    tone="warning"
                  />
                </RecommendationDetailsTextCard>
              </div>
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Execution Audit">
            <div className="trade-recommendation-details-stack">
              <RecommendationDetailsTextCard
                label="Audit Summary"
                pill={
                  <RecommendationDetailsPill
                    label={
                      position.executionMetadata
                        ? audit.executionQualityLabel
                        : "Not Recorded"
                    }
                    tone={
                      position.executionMetadata
                        ? audit.executionQuality.quality_rating === "poor"
                          ? "danger"
                          : audit.executionQuality.quality_rating === "acceptable"
                            ? "warning"
                            : "positive"
                        : "neutral"
                    }
                  />
                }
              >
                <p>{recommendationDetailsValue(audit.auditSummary)}</p>
                <p>
                  Execution audit is analytics only. It does not create orders,
                  submit broker actions, or control Avanza.
                </p>
              </RecommendationDetailsTextCard>

              <RecommendationDetailsMetricGrid
                variant="wide"
                metrics={[
                  {
                    label: "Broker Status",
                    value:
                      position.executionMetadata?.broker_order_status
                        ? brokerOrderStatusLabel(
                            position.executionMetadata.broker_order_status,
                          )
                        : "—",
                  },
                  {
                    label: "Handoff",
                    value: `${audit.auditHandoffQuality.label} · ${audit.auditHandoffQuality.score}/100`,
                  },
                  {
                    label: "Replay",
                    value: audit.auditReplay.overall_status,
                  },
                  {
                    label: "Timeline Events",
                    value: String(audit.timelineCount),
                  },
                  {
                    label: "Preview Warning",
                    value: audit.previewWarningLabel,
                  },
                  {
                    label: "Suggestions",
                    value: String(audit.suggestionsCount),
                  },
                ]}
              />

              <div
                className="trade-recommendation-details-dashed-divider"
                aria-hidden="true"
              />

              <RecommendationDetailsContextCard
                label="Execution Trail"
                pill={
                  <RecommendationDetailsPill
                    label={audit.auditReplay.overall_status}
                    tone={
                      audit.auditReplay.overall_status === "complete"
                        ? "positive"
                        : audit.auditReplay.overall_status === "failed"
                          ? "danger"
                          : audit.auditReplay.overall_status === "partial"
                            ? "warning"
                            : "neutral"
                    }
                  />
                }
                rows={[
                  <RecommendationDetailsContextRow
                    key="broker-execution"
                    label="Broker Execution"
                    summary={
                      position.executionMetadata
                        ? `Actual shares ${formatShares(
                            position.executionMetadata.actual_shares,
                          )}, planned ${formatShares(
                            position.executionMetadata.planned_shares,
                          )}.`
                        : "No broker execution metadata recorded."
                    }
                    detail={
                      position.executionMetadata?.broker_confirmed_at
                        ? `Confirmed ${formatDate(
                            position.executionMetadata.broker_confirmed_at,
                          )}`
                        : undefined
                    }
                    pill={
                      <RecommendationDetailsPill
                        label={
                          position.executionMetadata?.broker_order_status
                            ? brokerOrderStatusLabel(
                                position.executionMetadata.broker_order_status,
                              )
                            : "Unknown"
                        }
                        tone={position.executionMetadata ? "positive" : "neutral"}
                      />
                    }
                  />,
                  <RecommendationDetailsContextRow
                    key="handoff-quality"
                    label="Handoff Quality"
                    summary={audit.auditHandoffQuality.summary}
                    detail={`Calculated ${formatDate(
                      audit.auditHandoffQuality.calculated_at,
                    )}`}
                    pill={
                      <RecommendationDetailsPill
                        label={`${audit.auditHandoffQuality.score}/100`}
                        tone={
                          audit.auditHandoffQuality.rating === "poor"
                            ? "danger"
                            : audit.auditHandoffQuality.rating === "acceptable"
                              ? "warning"
                              : "positive"
                        }
                      />
                    }
                  />,
                  <RecommendationDetailsContextRow
                    key="handoff-replay"
                    label="Handoff Replay"
                    summary={audit.auditReplay.summary}
                    detail={
                      audit.auditReplay.handoff_session_id
                        ? `Session ${shortPayloadId(audit.auditReplay.handoff_session_id)}`
                        : undefined
                    }
                    pill={
                      <RecommendationDetailsPill
                        label={audit.auditReplay.overall_status}
                        tone={
                          audit.auditReplay.overall_status === "complete"
                            ? "positive"
                            : audit.auditReplay.overall_status === "failed"
                              ? "danger"
                              : audit.auditReplay.overall_status === "partial"
                                ? "warning"
                                : "neutral"
                        }
                      />
                    }
                  />,
                  <RecommendationDetailsContextRow
                    key="improvements"
                    label="Improvement Suggestions"
                    summary={
                      audit.firstSuggestion?.suggested_action ||
                      "No execution improvement suggestions surfaced."
                    }
                    detail={`Open suggestions: ${audit.suggestionsCount}`}
                    pill={
                      <RecommendationDetailsPill
                        label={audit.firstSuggestion?.priority || "None"}
                        tone={
                          audit.firstSuggestion?.priority === "high"
                            ? "danger"
                            : audit.firstSuggestion?.priority === "medium"
                              ? "warning"
                              : "neutral"
                        }
                      />
                    }
                  />,
                ]}
                footer="Full audit details stay available below for traceability, but they do not affect trading logic or broker flow."
              >
                <p>
                  {recommendationDetailsValue(
                    audit.firstTimelineDescription ||
                      "Audit trail is based on available execution metadata and local handoff events.",
                  )}
                </p>
              </RecommendationDetailsContextCard>
            </div>

            {audit.fullAuditTrail}
            <div className="trade-recommendation-details-brand-mark" aria-hidden="true">
              <Image
                src="/trade-assets/ture-logo-mark.svg"
                alt=""
                width={72}
                height={72}
              />
            </div>
          </RecommendationDetailsSection>
        </div>
      </section>
    </div>
  );
}
