function errorText(error: unknown) {
  if (error instanceof Error) return error.message.toLowerCase();
  if (typeof error === "string") return error.toLowerCase();

  try {
    const serialized = JSON.stringify(error);
    return typeof serialized === "string" ? serialized.toLowerCase() : "";
  } catch {
    return "";
  }
}

/**
 * A quota failure cannot be made healthy by retrying the same scan. Keep this
 * classification shared so the scanner and its scheduled caller record the
 * same fail-closed state.
 */
export function isProviderRateLimitLikeError(error: unknown) {
  const message = errorText(error);

  return (
    message.includes("rate limit") ||
    message.includes("too many request") ||
    message.includes("quota") ||
    message.includes("api credits") ||
    message.includes("credit limit")
  );
}
