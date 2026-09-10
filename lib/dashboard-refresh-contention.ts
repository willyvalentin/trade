export type DashboardRefreshContentionSource =
  | "initial"
  | "manual"
  | "auto"
  | "focus"
  | "action";

/**
 * Background reads are intentionally coalesced. A completed user action is
 * different: the UI must refresh the durable result after any earlier read
 * finishes, rather than silently leaving the new position off screen.
 */
export async function resolveDashboardRefreshContention({
  existingRefresh,
  isInitialLoad,
  source,
}: {
  existingRefresh: Promise<void> | null;
  isInitialLoad: boolean;
  source?: DashboardRefreshContentionSource;
}): Promise<"run" | "skip"> {
  if (isInitialLoad || !existingRefresh) {
    return "run";
  }

  if (source !== "action") {
    return "skip";
  }

  await existingRefresh;
  return "run";
}
