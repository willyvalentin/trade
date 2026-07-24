import {
  buildAvanzaTradeCardExecutionReadinessAdapter,
  type AvanzaTradeCardExecutionReadinessAdapterResult,
} from "@/lib/avanza-trade-card-execution-readiness-adapter";

type AvanzaTradeCardExecutionReadinessBadgeProps = {
  result?: AvanzaTradeCardExecutionReadinessAdapterResult;
  readinessModel?: unknown;
  compact?: boolean;
  className?: string;
};

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "n/a";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "none";

  return String(value);
}

export function AvanzaTradeCardExecutionReadinessBadge({
  className = "",
  compact = false,
  readinessModel,
  result,
}: AvanzaTradeCardExecutionReadinessBadgeProps) {
  const adapterResult =
    result ??
    buildAvanzaTradeCardExecutionReadinessAdapter({
      compact,
      readinessModel,
    });

  return (
    <section
      className={`grid gap-3 rounded-md border border-white/10 bg-black/20 p-3 ${className}`}
      data-read-only="true"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-100">
            {compact ? adapterResult.shortLabel : adapterResult.label}
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            {adapterResult.tooltip}
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300">
          {adapterResult.severity}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {adapterResult.badges
          .filter((badge) => badge.visible)
          .map((badge) => (
            <span
              className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-zinc-300"
              key={badge.badgeId}
              title={badge.safeTooltip}
            >
              {badge.label}
            </span>
          ))}
      </div>

      <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["ctaType", adapterResult.ctaType],
          ["source", adapterResult.source],
          ["intent", adapterResult.intent],
          ["ticker", formatValue(adapterResult.ticker)],
          ["side", formatValue(adapterResult.side)],
          ["showOnRecommendationCard", adapterResult.showOnRecommendationCard],
          ["showOnLivePositionCard", adapterResult.showOnLivePositionCard],
          ["warnings", formatValue(adapterResult.warnings)],
          ["blockedReasons", formatValue(adapterResult.blockedReasons)],
        ].map(([label, value]) => (
          <div
            className="rounded-md border border-white/10 bg-white/[0.025] p-2"
            key={String(label)}
          >
            <dt className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              {label}
            </dt>
            <dd className="mt-1 break-words font-semibold text-zinc-200">
              {formatValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
