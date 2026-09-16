/**
 * Netlify cron uses UTC. This cadence contains every 15-minute scan slot in
 * the US regular session in both New York offsets: 13:30–19:45 UTC during
 * daylight saving time and 14:30–20:45 UTC during standard time. The route's
 * existing market-calendar gate keeps the additional closed-session UTC slots
 * provider-free.
 */
export const scheduledScanRegularSessionCron = "*/15 13-20 * * 1-5" as const;
