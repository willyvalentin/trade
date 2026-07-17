import { useEffect, type ReactNode } from "react";
import Image from "next/image";

import type { CalibrationGuardrailResult } from "@/lib/calibration-guardrails";
import type { IntradayIndicators } from "@/lib/intraday-indicators";
import type { PreTradeRiskContextResult } from "@/lib/pre-trade-risk-context";
import type { RecommendationDecisionStackResult } from "@/lib/recommendation-decision-stack";
import type { ConfidenceCalibrationProjectionPreviewResult } from "@/lib/confidence-calibration-recommendation-advisory-projection-preview";
import { getSetupTypeDescription, getSetupTypeLabel } from "@/lib/setup-types";
import type { TradeEligibilityResult } from "@/lib/trade-eligibility";
import { ConfidenceCalibrationProjectionPreview } from "@/components/recommendations/ConfidenceCalibrationProjectionPreview";
import {
  recommendationDetailsCurrency,
  recommendationDetailsShares,
  recommendationDetailsToneClassName,
  recommendationDetailsToneFromCalibration,
  recommendationDetailsToneFromConfirmation,
  recommendationDetailsToneFromConfidence,
  recommendationDetailsToneFromDecisionStatus,
  recommendationDetailsToneFromEligibility,
  recommendationDetailsToneFromRiskContext,
  recommendationDetailsValue,
  recommendationQuickDecisionToneFromEligibility,
  type RecommendationDetailsTone,
} from "@/components/recommendations/recommendation-details-display-helpers";

export type RecommendationDetailsModalRecommendation = {
  companyName: string;
  confidenceReasoning: string;
  confidenceScore: number | null;
  createdAt: string;
  direction: string;
  entryZone: string;
  intradayIndicators: IntradayIndicators | null;
  invalidation: string;
  reasonToAvoid: string;
  riskFlags: string[];
  riskReward: string;
  setupType: unknown;
  stopLoss: string;
  target1: string;
  thesis: string;
  ticker: string;
};

export type RecommendationDetailsModalPositionSizing = {
  maxLossAtStop: number | null;
  riskPerShare: number | null;
  suggestedPositionValue: number | null;
  suggestedShares: number | null;
};

export type RecommendationDetailsModalConfirmation = {
  reasons: string[];
  status: "confirmed" | "mixed" | "weak" | "unknown";
};

export type RecommendationDetailsModalProps = {
  addTradeGateMessage: string;
  calibrationGuardrails: CalibrationGuardrailResult | null;
  confidenceBreakdownItems: Array<[string, number]>;
  confidenceLabel: string;
  confidenceCalibrationProjectionPreview?:
    | ConfidenceCalibrationProjectionPreviewResult
    | null;
  confidenceTone: string;
  confirmation: RecommendationDetailsModalConfirmation;
  decisionStack: RecommendationDecisionStackResult | null;
  freshness: string;
  identity: ReactNode;
  keyReasons: { positive: string[]; warnings: string[] };
  onClose: () => void;
  positionSizing: RecommendationDetailsModalPositionSizing;
  preTradeRiskContext: PreTradeRiskContextResult | null;
  recommendation: RecommendationDetailsModalRecommendation;
  sourceBadges: ReactNode;
  tradeEligibility: TradeEligibilityResult | null;
};

export function RecommendationDetailsPill({
  label,
  tone,
}: {
  label: string;
  tone: RecommendationDetailsTone;
}) {
  return (
    <span
      className={`trade-recommendation-details-pill ${recommendationDetailsToneClassName(
        tone,
      )}`}
    >
      {recommendationDetailsValue(label)}
    </span>
  );
}

export function RecommendationDetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="trade-recommendation-details-section">
      <div className="trade-recommendation-details-section__title">
        <span aria-hidden="true" className="trade-recommendation-details-section__icon">
          <Image
            src="/trade-assets/chevron-icn.svg"
            alt=""
            width={10}
            height={10}
          />
        </span>
        <h3>{title}</h3>
      </div>
      <div className="trade-recommendation-details-section__body">{children}</div>
    </section>
  );
}

export function RecommendationDetailsMetricGrid({
  metrics,
  variant = "default",
}: {
  metrics: Array<{ label: string; value: string; tone?: number | null }>;
  variant?: "default" | "wide";
}) {
  return (
    <div
      className={`trade-recommendation-details-metrics ${
        variant === "wide" ? "trade-recommendation-details-metrics--wide" : ""
      }`}
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="trade-recommendation-details-metric">
          <div className="trade-recommendation-details-metric__label">
            {recommendationDetailsValue(metric.label).toUpperCase()}
          </div>
          <div
            className={`trade-recommendation-details-metric__value ${
              metric.tone === undefined || metric.tone === null || metric.tone === 0
                ? ""
                : metric.tone > 0
                  ? "trade-recommendation-details-metric__value--positive"
                  : "trade-recommendation-details-metric__value--negative"
            }`}
          >
            {recommendationDetailsValue(metric.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecommendationDetailsTextCard({
  label,
  children,
  pill,
}: {
  label: string;
  children: ReactNode;
  pill?: ReactNode;
}) {
  return (
    <div className="trade-recommendation-details-text-card">
      <div className="trade-recommendation-details-text-card__header">
        <span className="trade-recommendation-details-text-card__label">
          {recommendationDetailsValue(label).toUpperCase()}
        </span>
        {pill}
      </div>
      <div className="trade-recommendation-details-text-card__content">
        {children}
      </div>
    </div>
  );
}

export function RecommendationDetailsTextStack({
  items,
  empty,
  tone = "neutral",
}: {
  items: string[];
  empty: string;
  tone?: "neutral" | "warning";
}) {
  const visibleItems = items.map((item) => recommendationDetailsValue(item)).filter(
    (item) => item !== "—",
  );

  if (visibleItems.length === 0) {
    return <p>{empty}</p>;
  }

  return (
    <div
      className={`trade-recommendation-details-text-stack ${
        tone === "warning" ? "trade-recommendation-details-text-stack--warning" : ""
      }`}
    >
      {visibleItems.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}

function RecommendationDetailsDecisionItem({
  label,
  summary,
  detail,
  pill,
}: {
  label: string;
  summary: string;
  detail?: string;
  pill?: ReactNode;
}) {
  return (
    <div className="trade-recommendation-details-decision-item">
      <div>
        <h4>{recommendationDetailsValue(label)}</h4>
        <p className="trade-recommendation-details-decision-item__copy">
          {recommendationDetailsValue(summary)}
        </p>
        {detail && (
          <span className="trade-recommendation-details-decision-item__copy">
            {recommendationDetailsValue(detail)}
          </span>
        )}
      </div>
      {pill}
    </div>
  );
}

export function RecommendationDetailsContextCard({
  label,
  pill,
  children,
  rows,
  footer,
}: {
  label: string;
  pill?: ReactNode;
  children: ReactNode;
  rows?: ReactNode;
  footer?: string;
}) {
  return (
    <div className="trade-recommendation-details-context-card">
      <div className="trade-recommendation-details-context-card__header">
        <span className="trade-recommendation-details-context-card__label">
          {recommendationDetailsValue(label).toUpperCase()}
        </span>
        {pill}
      </div>
      <div className="trade-recommendation-details-context-card__content">
        {children}
      </div>
      {rows ? (
        <div className="trade-recommendation-details-context-rows">{rows}</div>
      ) : null}
      {footer ? (
        <p className="trade-recommendation-details-context-card__footer">
          {recommendationDetailsValue(footer)}
        </p>
      ) : null}
    </div>
  );
}

export function RecommendationDetailsContextRow({
  label,
  summary,
  detail,
  pill,
}: {
  label: string;
  summary: string;
  detail?: string;
  pill?: ReactNode;
}) {
  return (
    <div className="trade-recommendation-details-context-row">
      <div>
        <h4>{recommendationDetailsValue(label)}</h4>
        <p className="trade-recommendation-details-context-row__copy">
          {recommendationDetailsValue(summary)}
        </p>
        {detail && (
          <span className="trade-recommendation-details-context-row__copy">
            {recommendationDetailsValue(detail)}
          </span>
        )}
      </div>
      {pill}
    </div>
  );
}

function recommendationQuickRiskLabel(
  level: PreTradeRiskContextResult["level"],
) {
  if (level === "avoid") return "Risky avoid";
  if (level === "caution") return "Risky";
  return `Risk ${level}`;
}

function intradayConfirmationLabel(
  status: RecommendationDetailsModalConfirmation["status"],
) {
  return status.toUpperCase();
}

function vwapLabel(indicators: IntradayIndicators | null) {
  if (!indicators || indicators.isAboveVwap === null) return "Unknown";
  return indicators.isAboveVwap ? "Above" : "Below";
}

function titleCaseValue(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : "Unknown";
}

function formatSignedPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function RecommendationDetailsModal({
  recommendation,
  calibrationGuardrails,
  preTradeRiskContext,
  tradeEligibility,
  decisionStack,
  positionSizing,
  freshness,
  addTradeGateMessage,
  confirmation,
  confidenceBreakdownItems,
  confidenceCalibrationProjectionPreview,
  keyReasons,
  identity,
  sourceBadges,
  confidenceLabel,
  confidenceTone,
  onClose,
}: RecommendationDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const quickDecision =
    decisionStack?.primary_warning ||
    addTradeGateMessage ||
    decisionStack?.summary ||
    keyReasons.positive[0] ||
    recommendation.thesis ||
    "Review the trade plan, then use Make Trade for the existing validation flow.";
  const indicators = recommendation.intradayIndicators;
  const confidenceScoreLabel =
    recommendation.confidenceScore === null
      ? "—"
      : `${recommendation.confidenceScore}/100`;
  const calibrationSeverity =
    calibrationGuardrails?.guardrails.some(
      (guardrail) => guardrail.severity === "warning",
    )
      ? "warning"
      : calibrationGuardrails?.guardrails.some(
            (guardrail) => guardrail.severity === "caution",
          )
        ? "caution"
        : "info";

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
        aria-labelledby="trade-recommendation-details-title"
        aria-modal="true"
        className="trade-recommendation-details-modal"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="trade-recommendation-details-titlebar">
          <h2 id="trade-recommendation-details-title">Recommendation Details</h2>
          <button
            type="button"
            aria-label="Close recommendation details"
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
            {identity}
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {sourceBadges}
              <span
                className={`trade-recommendation-confidence-pill trade-recommendation-confidence-pill--${confidenceTone}`}
              >
                {confidenceLabel}
              </span>
            </div>
          </header>

          <RecommendationDetailsSection title="Quick Decision">
            <div className="trade-recommendation-details-quick-decision">
              <div className="trade-recommendation-details-guidance">
                <div>
                  <p>{recommendationDetailsValue(quickDecision)}</p>
                  <span className="trade-recommendation-details-guidance__timestamp">
                    Updated {recommendationDetailsValue(recommendation.createdAt)}
                  </span>
                </div>
                <div className="trade-recommendation-details-pill-row trade-recommendation-details-pill-row--quick">
                  {decisionStack && (
                    <RecommendationDetailsPill
                      label={`Stack ${decisionStack.overall_status}`}
                      tone={recommendationDetailsToneFromDecisionStatus(
                        decisionStack.overall_status,
                      )}
                    />
                  )}
                  {tradeEligibility && (
                    <RecommendationDetailsPill
                      label={tradeEligibility.status.replaceAll("_", " ")}
                      tone={recommendationQuickDecisionToneFromEligibility(
                        tradeEligibility.status,
                      )}
                    />
                  )}
                  {preTradeRiskContext && (
                    <RecommendationDetailsPill
                      label={recommendationQuickRiskLabel(preTradeRiskContext.level)}
                      tone={recommendationDetailsToneFromRiskContext(
                        preTradeRiskContext.level,
                      )}
                    />
                  )}
                </div>
              </div>
              <div className="trade-recommendation-details-two-column">
                <RecommendationDetailsTextCard label="Why This Setup">
                  <RecommendationDetailsTextStack
                    items={keyReasons.positive}
                    empty="No strong positive reasons surfaced."
                  />
                </RecommendationDetailsTextCard>
                <RecommendationDetailsTextCard label="Main Risk / Red Flags">
                  <RecommendationDetailsTextStack
                    items={keyReasons.warnings}
                    empty="No major red flags surfaced from current advisory layers."
                    tone="warning"
                  />
                </RecommendationDetailsTextCard>
              </div>
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Trade Plan">
            <div className="trade-recommendation-details-trade-plan">
              <RecommendationDetailsMetricGrid
                metrics={[
                  { label: "Entry", value: recommendation.entryZone },
                  { label: "Stop", value: recommendation.stopLoss },
                  { label: "Target", value: recommendation.target1 },
                  { label: "Reward : Risk", value: recommendation.riskReward },
                  {
                    label: "Shares",
                    value: recommendationDetailsShares(
                      positionSizing.suggestedShares,
                    ),
                  },
                  {
                    label: "Position Value",
                    value: recommendationDetailsCurrency(
                      positionSizing.suggestedPositionValue,
                    ),
                  },
                  {
                    label: "Max Loss",
                    value: recommendationDetailsCurrency(
                      positionSizing.maxLossAtStop,
                    ),
                  },
                  {
                    label: "Risk/share",
                    value: recommendationDetailsCurrency(positionSizing.riskPerShare),
                  },
                ]}
              />
              <div
                className="trade-recommendation-details-trade-plan__divider"
                aria-hidden="true"
              />
              <RecommendationDetailsMetricGrid
                variant="wide"
                metrics={[
                  { label: "Direction", value: recommendation.direction },
                  {
                    label: "Setup Type",
                    value: getSetupTypeLabel(recommendation.setupType),
                  },
                  { label: "Freshness", value: freshness },
                  {
                    label: "Confidence",
                    value: confidenceScoreLabel,
                  },
                ]}
              />
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Decision Details">
            <div className="trade-recommendation-details-stack trade-recommendation-details-stack--decision">
              <ConfidenceCalibrationProjectionPreview
                preview={confidenceCalibrationProjectionPreview}
              />

              <RecommendationDetailsTextCard
                label="Recommendation Decision Stack"
                pill={
                  decisionStack ? (
                    <RecommendationDetailsPill
                      label={decisionStack.overall_status}
                      tone={recommendationDetailsToneFromDecisionStatus(
                        decisionStack.overall_status,
                      )}
                    />
                  ) : undefined
                }
              >
                <p>
                  {recommendationDetailsValue(
                    decisionStack?.summary ?? "Decision stack is unavailable.",
                  )}
                </p>
                {decisionStack?.title && <p>{recommendationDetailsValue(decisionStack.title)}</p>}
              </RecommendationDetailsTextCard>

              {decisionStack?.items.map((item) => (
                <RecommendationDetailsDecisionItem
                  key={item.type}
                  label={item.label}
                  summary={item.summary}
                  detail={item.detail}
                  pill={
                    <RecommendationDetailsPill
                      label={item.status}
                      tone={recommendationDetailsToneFromDecisionStatus(item.status)}
                    />
                  }
                />
              ))}

              <div
                className="trade-recommendation-details-dashed-divider"
                aria-hidden="true"
              />

              <RecommendationDetailsTextCard
                label="Intraday Confirmation"
                pill={
                  <RecommendationDetailsPill
                    label={intradayConfirmationLabel(confirmation.status)}
                    tone={recommendationDetailsToneFromConfirmation(
                      confirmation.status,
                    )}
                  />
                }
              >
                <p>
                  {indicators
                    ? `VWAP ${vwapLabel(indicators)}, Price vs VWAP ${formatSignedPercent(
                        indicators.priceVsVwapPercent,
                      )}, Momentum ${titleCaseValue(
                        indicators.momentumDirection,
                      )}, Volume ${titleCaseValue(indicators.volumeTrend)}`
                    : "Intraday confirmation unavailable."}
                </p>
                {confirmation.reasons.length > 0 && (
                  <p>{confirmation.reasons.slice(0, 3).join(" ")}</p>
                )}
              </RecommendationDetailsTextCard>

              {confidenceBreakdownItems.length > 0 && (
                <div className="trade-recommendation-details-score-grid">
                  {confidenceBreakdownItems.map(([label, score]) => (
                    <div
                      key={label}
                      className="trade-recommendation-details-score"
                    >
                      <span>{label}</span>
                      <strong
                        className={`trade-recommendation-details-score__value trade-recommendation-details-score__value--${recommendationDetailsToneFromConfidence(
                          score,
                        )}`}
                      >
                        {score}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              {(recommendation.confidenceReasoning ||
                recommendation.riskFlags.length > 0) && (
                <>
                  <div
                    className="trade-recommendation-details-dashed-divider"
                    aria-hidden="true"
                  />
                  <div className="trade-recommendation-details-two-column trade-recommendation-details-two-column--flush">
                    {recommendation.confidenceReasoning && (
                      <RecommendationDetailsTextCard label="Confidence Reasoning">
                        <p>
                          {recommendationDetailsValue(
                            recommendation.confidenceReasoning,
                          )}
                        </p>
                      </RecommendationDetailsTextCard>
                    )}
                    {recommendation.riskFlags.length > 0 && (
                      <RecommendationDetailsTextCard label="Risk Flags">
                        <RecommendationDetailsTextStack
                          items={recommendation.riskFlags}
                          empty="—"
                          tone="warning"
                        />
                      </RecommendationDetailsTextCard>
                    )}
                  </div>
                </>
              )}
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="More Trade Context">
            <div className="trade-recommendation-details-context-stack">
              {preTradeRiskContext ? (
                <RecommendationDetailsContextCard
                  label="Pre-Trade Risk Context"
                  pill={
                    <RecommendationDetailsPill
                      label={preTradeRiskContext.level}
                      tone={recommendationDetailsToneFromRiskContext(
                        preTradeRiskContext.level,
                      )}
                    />
                  }
                  rows={
                    preTradeRiskContext.signals.length > 0
                      ? preTradeRiskContext.signals.slice(0, 5).map((signal) => (
                          <RecommendationDetailsContextRow
                            key={signal.code}
                            label={signal.title}
                            summary={signal.description}
                            pill={
                              <RecommendationDetailsPill
                                label={signal.level}
                                tone={recommendationDetailsToneFromRiskContext(
                                  signal.level,
                                )}
                              />
                            }
                          />
                        ))
                      : undefined
                  }
                  footer="Advisory only. Making the trade still uses the normal validation gate and this panel does not change scoring, risk settings, or broker flow."
                >
                  <p>{recommendationDetailsValue(preTradeRiskContext.title)}</p>
                  <p>{recommendationDetailsValue(preTradeRiskContext.summary)}</p>
                  <p>
                    {recommendationDetailsValue(
                      preTradeRiskContext.suggested_action,
                    )}
                  </p>
                </RecommendationDetailsContextCard>
              ) : (
                <RecommendationDetailsContextCard label="Pre-Trade Risk Context">
                  <p>—</p>
                </RecommendationDetailsContextCard>
              )}

              {tradeEligibility ? (
                <RecommendationDetailsContextCard
                  label="Trade Eligibility"
                  pill={
                    <RecommendationDetailsPill
                      label={tradeEligibility.status.replaceAll("_", " ")}
                      tone={recommendationDetailsToneFromEligibility(
                        tradeEligibility.status,
                      )}
                    />
                  }
                  rows={
                    tradeEligibility.signals.length > 0
                      ? tradeEligibility.signals.slice(0, 5).map((signal) => (
                          <RecommendationDetailsContextRow
                            key={signal.code}
                            label={signal.label}
                            summary={signal.description}
                            pill={
                              <RecommendationDetailsPill
                                label={signal.impact}
                                tone={
                                  signal.impact === "positive"
                                    ? "positive"
                                    : signal.impact === "neutral"
                                      ? "neutral"
                                      : signal.impact === "warning"
                                        ? "warning"
                                        : "danger"
                                }
                              />
                            }
                          />
                        ))
                      : undefined
                  }
                  footer={`${
                    tradeEligibility.can_attempt_add_trade
                      ? "Making the trade still runs normal validation."
                      : "Existing gate/freshness rules prevent ADD TRADE."
                  } This summary is decision support only and adds no new blocking rules.`}
                >
                  <p>{recommendationDetailsValue(tradeEligibility.title)}</p>
                  <p>{recommendationDetailsValue(tradeEligibility.summary)}</p>
                  <p>
                    {tradeEligibility.can_attempt_add_trade
                      ? "Making the trade still runs normal validation."
                      : "Existing gate/freshness rules prevent ADD TRADE."}{" "}
                    This summary is decision support only and adds no new blocking
                    rules.
                  </p>
                </RecommendationDetailsContextCard>
              ) : (
                <RecommendationDetailsContextCard label="Trade Eligibility">
                  <p>—</p>
                </RecommendationDetailsContextCard>
              )}

              {calibrationGuardrails && calibrationGuardrails.guardrails.length > 0 ? (
                <RecommendationDetailsContextCard
                  label="Calibration Guardrails"
                  pill={
                    <RecommendationDetailsPill
                      label={calibrationSeverity === "info" ? "advisory" : calibrationSeverity}
                      tone={recommendationDetailsToneFromCalibration(
                        calibrationSeverity,
                      )}
                    />
                  }
                  rows={calibrationGuardrails.guardrails
                    .slice(0, 5)
                    .map((guardrail) => (
                      <RecommendationDetailsContextRow
                        key={`${guardrail.code}-${guardrail.scope}`}
                        label={guardrail.title}
                        summary={guardrail.description}
                        detail={
                          guardrail.data_points && guardrail.data_points.length > 0
                            ? guardrail.data_points
                                .slice(0, 4)
                                .map((item) => `${item.label}: ${item.value}`)
                                .join(" · ")
                            : guardrail.suggested_action
                        }
                        pill={
                          <RecommendationDetailsPill
                            label={guardrail.severity}
                            tone={recommendationDetailsToneFromCalibration(
                              guardrail.severity,
                            )}
                          />
                        }
                      />
                    ))}
                  footer="Calibration guardrails are advisory only. They do not block trades or change recommendation scoring."
                >
                  <p>{recommendationDetailsValue(calibrationGuardrails.summary)}</p>
                </RecommendationDetailsContextCard>
              ) : (
                <RecommendationDetailsContextCard label="Calibration Guardrails">
                  <p>No calibration guardrails active.</p>
                </RecommendationDetailsContextCard>
              )}
            </div>
          </RecommendationDetailsSection>

          <RecommendationDetailsSection title="Full Rationale">
            <div className="trade-recommendation-details-rationale-grid">
              <RecommendationDetailsTextCard label="Setup Type">
                <p>
                  {recommendationDetailsValue(
                    getSetupTypeDescription(recommendation.setupType),
                  )}
                </p>
              </RecommendationDetailsTextCard>
              <RecommendationDetailsTextCard label="Thesis">
                <p>{recommendationDetailsValue(recommendation.thesis)}</p>
              </RecommendationDetailsTextCard>
              <RecommendationDetailsTextCard label="Invalidation">
                <p>{recommendationDetailsValue(recommendation.invalidation)}</p>
              </RecommendationDetailsTextCard>
              <RecommendationDetailsTextCard label="Reason to Avoid">
                <p>{recommendationDetailsValue(recommendation.reasonToAvoid)}</p>
              </RecommendationDetailsTextCard>
            </div>
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
