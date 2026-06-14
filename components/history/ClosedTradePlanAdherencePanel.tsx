import { Detail } from "@/components/execution/handoff-modal-shared";
import type {
  PlanVsActualReview,
  PlanVsActualStatus,
} from "@/lib/plan-vs-actual-review";

export type ClosedTradePlanAdherencePanelProps = {
  review: PlanVsActualReview;
  reviewJson: string;
  ticker: string;
};

function displayValue(value: unknown, fallback = "—") {
  if (value === null || value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim();
  if (
    normalized === "" ||
    normalized.toLowerCase() === "null" ||
    normalized.toLowerCase() === "undefined"
  ) {
    return fallback;
  }

  return normalized;
}

function formatNumber(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return `${value.toFixed(2)}${suffix}`;
}

function formatShares(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedCurrency(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  const formatted = formatCurrency(Math.abs(value));
  return `${value >= 0 ? "+" : "-"}${formatted}`;
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function formatSignedR(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}R`;
}

function formatIntradayIndicatorValue(value: number | null, suffix = "") {
  return value === null ? "—" : `${formatNumber(value)}${suffix}`;
}

function formatStatisticsStatusLabel(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return value.replace(/_/g, " ").toUpperCase();
}

function planVsActualTone(status: PlanVsActualStatus) {
  if (status === "followed_plan") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "minor_deviation") {
    return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
  }

  if (status === "needs_review" || status === "incomplete") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function formatPlanVsActualMetricValue(
  value: number | string | null,
  unit: PlanVsActualReview["metrics"][number]["unit"],
) {
  if (typeof value === "string") {
    return displayValue(value);
  }

  if (unit === "shares") {
    return formatShares(value);
  }

  if (unit === "currency") {
    return formatSignedCurrency(value);
  }

  if (unit === "percent") {
    return formatPercent(value);
  }

  if (unit === "r_multiple") {
    return formatSignedR(value);
  }

  if (unit === "ratio") {
    return formatIntradayIndicatorValue(value, "R/R");
  }

  return displayValue(value);
}

export function ClosedTradePlanAdherencePanel({
  review,
  reviewJson,
  ticker,
}: ClosedTradePlanAdherencePanelProps) {
  const visibleDeviations = review.deviations.slice(0, 4);
  const visibleWarnings = review.warnings.slice(0, 4);

  return (
    <section className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
      <div
        id="trade-plan-vs-actual-review-json"
        data-agent-readable="true"
        data-review-id={review.review_id}
        data-review-status={review.status}
        data-review-grade={review.grade}
        data-snapshot-id={review.snapshot_id ?? ""}
        data-ticker={ticker}
        className="sr-only"
      >
        {reviewJson}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
            Plan vs Actual Review
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {review.process_summary}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            A losing trade can still follow the plan if the loss stayed within
            planned risk. This review is descriptive, not predictive.
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${planVsActualTone(
            review.status,
          )}`}
        >
          {formatStatisticsStatusLabel(review.status)} · {review.grade}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          label="Quantity Deviation"
          value={formatPercent(review.quantity_deviation_percent)}
        />
        <Detail
          label="Risk Deviation"
          value={formatPercent(review.risk_deviation_percent)}
        />
        <Detail
          label="Reward Capture"
          value={formatPercent(review.reward_capture_percent)}
        />
        <Detail
          label="Realized vs Planned R"
          value={formatIntradayIndicatorValue(review.realized_vs_planned_r, "x")}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-white/10 bg-black/20">
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-b border-white/10 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-500">
          <span>Metric</span>
          <span>Planned</span>
          <span>Actual</span>
        </div>
        <div className="divide-y divide-white/10">
          {review.metrics.map((metric) => (
            <div
              key={metric.metric_id}
              className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-3 py-2 text-xs leading-5 text-zinc-300"
            >
              <span className="font-medium text-zinc-200">{metric.label}</span>
              <span>
                {formatPlanVsActualMetricValue(
                  metric.planned_value,
                  metric.unit,
                )}
              </span>
              <span>
                {formatPlanVsActualMetricValue(metric.actual_value, metric.unit)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {(visibleDeviations.length > 0 || visibleWarnings.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-rose-300/15 bg-rose-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rose-100">
              Deviations
            </p>
            {visibleDeviations.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-rose-50/80">
                {visibleDeviations.map((item) => (
                  <li key={item.deviation_id}>{item.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs leading-5 text-zinc-500">—</p>
            )}
          </div>
          <div className="rounded-md border border-amber-300/15 bg-amber-300/[0.035] p-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-100">
              Review Warnings
            </p>
            {visibleWarnings.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-50/80">
                {visibleWarnings.map((item) => (
                  <li key={item.warning_id}>{item.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs leading-5 text-zinc-500">—</p>
            )}
          </div>
        </div>
      )}

      <details className="mt-3 rounded-md border border-white/10 bg-white/[0.025] p-3">
        <summary className="cursor-pointer font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
          View plan-vs-actual checks
        </summary>
        <div className="mt-3 space-y-2">
          {review.checks.map((item) => (
            <div
              key={item.check_id}
              className="rounded-md border border-white/10 bg-black/20 p-3"
            >
              <p className="text-sm font-semibold text-zinc-200">
                {item.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
