import type { ProviderBudgetPlanMode } from "@/lib/provider-budget-guard";
import {
  TRADE_DEV_PREVIEW_RECOMMENDATIONS_HIDDEN_STORAGE_KEY,
  TRADE_DISMISSED_WARNINGS_STORAGE_KEY,
  TRADE_MOCK_BROKER_LATEST_FILL_STORAGE_KEY,
  TRADE_PROVIDER_PLAN_MODE_STORAGE_KEY,
} from "@/lib/persistence/local-storage-keys";

export function normalizeProviderPlanMode(value: unknown): ProviderBudgetPlanMode {
  if (
    value === "free" ||
    value === "grow" ||
    value === "pro" ||
    value === "custom" ||
    value === "unknown"
  ) {
    return value;
  }

  return "unknown";
}

export function readProviderPlanModeHint(): ProviderBudgetPlanMode {
  if (typeof window === "undefined") {
    return "unknown";
  }

  try {
    return normalizeProviderPlanMode(
      window.localStorage.getItem(TRADE_PROVIDER_PLAN_MODE_STORAGE_KEY),
    );
  } catch {
    return "unknown";
  }
}

export function writeProviderPlanModeHint(mode: ProviderBudgetPlanMode) {
  try {
    window.localStorage.setItem(TRADE_PROVIDER_PLAN_MODE_STORAGE_KEY, mode);
  } catch {
    // Local provider plan hint is diagnostics-only.
  }
}

export function readDevPreviewRecommendationsHidden() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(
        TRADE_DEV_PREVIEW_RECOMMENDATIONS_HIDDEN_STORAGE_KEY,
      ) === "true"
    );
  } catch {
    return false;
  }
}

export function writeDevPreviewRecommendationsHidden(hidden: boolean) {
  try {
    window.localStorage.setItem(
      TRADE_DEV_PREVIEW_RECOMMENDATIONS_HIDDEN_STORAGE_KEY,
      hidden ? "true" : "false",
    );
  } catch {
    // Local dev-preview preference should never block the app.
  }
}

export function readDismissedWarnings() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(TRADE_DISMISSED_WARNINGS_STORAGE_KEY) ?? "[]",
    );

    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [],
    );
  } catch {
    return new Set<string>();
  }
}

export function writeDismissedWarning(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const dismissedWarnings = readDismissedWarnings();
    dismissedWarnings.add(key);
    window.localStorage.setItem(
      TRADE_DISMISSED_WARNINGS_STORAGE_KEY,
      JSON.stringify(Array.from(dismissedWarnings).slice(-250)),
    );
  } catch {
    // Local UI dismiss only; if storage is unavailable the warning simply stays visible.
  }
}

export function readLatestMockBrokerFillRaw() {
  return window.localStorage.getItem(TRADE_MOCK_BROKER_LATEST_FILL_STORAGE_KEY);
}

export function removeLatestMockBrokerFill() {
  window.localStorage.removeItem(TRADE_MOCK_BROKER_LATEST_FILL_STORAGE_KEY);
}
