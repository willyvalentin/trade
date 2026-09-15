import { isProviderRateLimitLikeError } from "@/lib/provider-rate-limit";

export class MarketDataProviderResponseError extends Error {
  readonly provider_response_observed: boolean;

  constructor(message: string, providerResponseObserved: boolean) {
    super(message);
    this.name = "MarketDataProviderResponseError";
    this.provider_response_observed = providerResponseObserved;
  }
}

export function marketDataProviderResponseObserved(error: unknown) {
  return (
    error instanceof MarketDataProviderResponseError &&
    error.provider_response_observed
  );
}

export function classifyMarketDataProviderFailure(error: unknown) {
  const providerResponseObserved = marketDataProviderResponseObserved(error);

  return {
    provider_response_observed: providerResponseObserved,
    outcome:
      providerResponseObserved && isProviderRateLimitLikeError(error)
        ? ("rate_limited" as const)
        : ("provider_error" as const),
  };
}
