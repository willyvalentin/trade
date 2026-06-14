import type { ReactNode } from "react";

export type HistoryTabProps = {
  children: ReactNode;
  dataModeBanner: ReactNode;
  diagnostics: ReactNode;
  outcomeEvaluationRunner?: ReactNode;
  statusbar: ReactNode;
};

export function HistoryTab({
  children,
  dataModeBanner,
  diagnostics,
  outcomeEvaluationRunner,
  statusbar,
}: HistoryTabProps) {
  return (
    <section className="trade-statistics-section space-y-8">
      <div>
        <h2 className="font-mono text-2xl font-semibold tracking-normal text-white">
          History
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Closed trades first. Recommendation history stays available for review
          when you want to inspect Ture’s learning data.
        </p>
      </div>

      {statusbar}

      {dataModeBanner}

      {outcomeEvaluationRunner}

      {diagnostics}

      {children}
    </section>
  );
}
