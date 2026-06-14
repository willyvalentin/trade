"use client";

import { useState } from "react";
import type { StatisticsTimeRange } from "@/lib/statistics-dashboard";

export function useStatisticsRangeState() {
  const [selectedStatisticsRange, setSelectedStatisticsRange] =
    useState<StatisticsTimeRange>("today");

  return {
    selectedStatisticsRange,
    setSelectedStatisticsRange,
  };
}
