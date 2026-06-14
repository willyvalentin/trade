export type StatisticsMetricCardProps = {
  label: string;
  tone?: number | null;
  value: string;
};

export function StatisticsMetricCard({
  label,
  tone,
  value,
}: StatisticsMetricCardProps) {
  const valueClassName =
    tone === undefined || tone === null || tone === 0
      ? "text-white"
      : tone > 0
        ? "text-emerald-100"
        : "text-rose-100";

  return (
    <div className="bg-surface-subtle rounded-lg border border-white/10 p-4">
      <div className={`font-mono text-2xl font-semibold ${valueClassName}`}>
        {value}
      </div>
      <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}
