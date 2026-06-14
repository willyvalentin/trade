import type { ReactNode } from "react";

export type StatisticsSummaryGridColumns = "five" | "six";

export type StatisticsSummaryGridProps = {
  children: ReactNode;
  className?: string;
  columns?: StatisticsSummaryGridColumns;
};

export function StatisticsSummaryGrid({
  children,
  className = "",
  columns = "five",
}: StatisticsSummaryGridProps) {
  const columnClassName =
    columns === "six" ? "xl:grid-cols-6" : "xl:grid-cols-5";
  const classNames = [
    className,
    "grid gap-3 sm:grid-cols-2",
    columnClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classNames}>{children}</div>;
}
