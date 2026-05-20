import type { IntradayScanWindow } from "@/lib/intraday-scan-window";

export type RecommendationFreshness = "fresh" | "aging" | "stale" | "expired";

export type RecommendationFreshnessInput = {
  created_at?: string | null;
  expires_at?: string | null;
  scan_window?: IntradayScanWindow | string | null;
};

const defaultExpiryMinutes = 60;

function parseTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? time : null;
}

export function getRecommendationExpiryMinutes(
  scanWindow?: string | null,
) {
  if (scanWindow === "opening") {
    return 30;
  }

  if (
    scanWindow === "morning_momentum" ||
    scanWindow === "midday" ||
    scanWindow === "afternoon"
  ) {
    return 45;
  }

  if (scanWindow === "power_hour") {
    return 30;
  }

  return defaultExpiryMinutes;
}

export function getRecommendationExpiresAt(
  recommendation: RecommendationFreshnessInput,
) {
  const explicitExpiry = parseTime(recommendation.expires_at);

  if (explicitExpiry !== null) {
    return explicitExpiry;
  }

  const createdAt = parseTime(recommendation.created_at);

  if (createdAt === null) {
    return null;
  }

  return (
    createdAt +
    getRecommendationExpiryMinutes(recommendation.scan_window) * 60 * 1000
  );
}

export function getRecommendationFreshness(
  recommendation: RecommendationFreshnessInput,
  now = new Date(),
): RecommendationFreshness {
  const nowTime = now.getTime();
  const expiresAt = getRecommendationExpiresAt(recommendation);

  if (expiresAt !== null && nowTime >= expiresAt) {
    return "expired";
  }

  const createdAt = parseTime(recommendation.created_at);

  if (createdAt === null) {
    return "expired";
  }

  const ageMinutes = (nowTime - createdAt) / 60000;

  if (ageMinutes < 20) {
    return "fresh";
  }

  if (ageMinutes < 45) {
    return "aging";
  }

  if (ageMinutes < defaultExpiryMinutes) {
    return "stale";
  }

  return "expired";
}

export function isRecommendationExpired(
  recommendation: RecommendationFreshnessInput,
  now = new Date(),
) {
  return getRecommendationFreshness(recommendation, now) === "expired";
}

export function getDefaultRecommendationExpiryCutoff(now = new Date()) {
  return new Date(now.getTime() - defaultExpiryMinutes * 60 * 1000).toISOString();
}
