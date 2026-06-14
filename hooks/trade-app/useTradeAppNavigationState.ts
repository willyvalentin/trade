"use client";

import { useState } from "react";

export type TradeAppTab =
  | "Recommendations"
  | "Live Day Trades"
  | "Stats Today"
  | "Statistics"
  | "History"
  | "Market";

export function useTradeAppNavigationState() {
  const [activeTab, setActiveTab] = useState<TradeAppTab>("Recommendations");

  return {
    activeTab,
    setActiveTab,
  };
}
