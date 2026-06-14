import type { ReactNode } from "react";
import { EmptyState } from "@/components/execution/handoff-modal-shared";
import type { StatisticsTimeRange } from "@/lib/statistics-dashboard";

export type StatisticsDashboardRangeOption = {
  label: string;
  value: StatisticsTimeRange;
};

export type StatisticsDashboardProps = {
  children: ReactNode;
  demoTradeCount: number;
  isLoading: boolean;
  onRangeChange: (range: StatisticsTimeRange) => void;
  progressClassName: string;
  progressTitle: string;
  rangeDescription: string;
  rangeLabel: string;
  rangeOptions: readonly StatisticsDashboardRangeOption[];
  realTradeCount: number;
  selectedRange: StatisticsTimeRange;
};

export function StatisticsDashboard({
  children,
  demoTradeCount,
  isLoading,
  onRangeChange,
  progressClassName,
  progressTitle,
  rangeDescription,
  rangeLabel,
  rangeOptions,
  realTradeCount,
  selectedRange,
}: StatisticsDashboardProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-black/25 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Statistics
            </p>
            <h2 className="mt-2 font-mono text-2xl font-semibold tracking-normal text-white">
              Progress Dashboard
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Realized performance, R curves, daily rhythm, and partial-close
              context for the selected period. Performance analytics are
              descriptive, not predictions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onRangeChange(option.value)}
                className={`min-h-9 rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                  selectedRange === option.value
                    ? "border-[#00db94]/45 bg-[#00db94]/15 text-emerald-100"
                    : "border-white/10 bg-white/[0.035] text-zinc-500 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-md border border-white/10 bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">{rangeLabel}</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {rangeDescription}
            </p>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Demo trades: {demoTradeCount} · Real trades: {realTradeCount}
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${progressClassName}`}
          >
            {progressTitle}
          </span>
        </div>
      </div>

      {isLoading ? (
        <EmptyState
          title="Loading statistics"
          message="Trade is calculating progress from manually closed positions."
        />
      ) : (
        children
      )}
    </div>
  );
}
