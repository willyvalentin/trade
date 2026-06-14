export function buildEndOfDayAcknowledgementKey(
  positionId: string,
  date: string,
) {
  return `eod_acknowledged_${positionId}_${date}`;
}

export function readEndOfDayAcknowledgement(positionId: string, date: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(
      buildEndOfDayAcknowledgementKey(positionId, date),
    ) === "true";
  } catch {
    return false;
  }
}

export function writeEndOfDayAcknowledgement(
  positionId: string,
  date: string,
  acknowledged: boolean,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const key = buildEndOfDayAcknowledgementKey(positionId, date);

    if (acknowledged) {
      window.localStorage.setItem(key, "true");
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Local acknowledgement is optional and must never hide the EOD risk.
  }
}
