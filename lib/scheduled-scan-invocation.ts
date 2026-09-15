/**
 * Netlify can deliver more than one invocation for a single cron occurrence.
 * Bind that occurrence to its configured fifteen-minute UTC slot, rather than
 * to the arrival timestamp, so only one invocation may claim provider work.
 */
export const SCHEDULED_SCAN_SLOT_MINUTES = 15;

export function scheduledScanSlotStartedAt(now: Date) {
  const timestamp = now.getTime();

  if (!Number.isFinite(timestamp)) {
    throw new Error("Scheduled scan slot requires a valid timestamp.");
  }

  const slotMilliseconds = SCHEDULED_SCAN_SLOT_MINUTES * 60 * 1000;
  return new Date(Math.floor(timestamp / slotMilliseconds) * slotMilliseconds);
}

export function buildScheduledScanInvocationFingerprint(now: Date) {
  const slotStartedAt = scheduledScanSlotStartedAt(now).toISOString();

  return `scheduled_scan_attempt_${stableHash(
    `netlify_scheduled_function|${slotStartedAt}`,
  )}`;
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}
