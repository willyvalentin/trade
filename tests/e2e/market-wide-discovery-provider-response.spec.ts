import { expect, test } from "@playwright/test";

import {
  classifyMarketDataProviderFailure,
  MarketDataProviderResponseError,
} from "@/lib/provider-response-observation";

test.describe("market-wide discovery provider-response evidence", () => {
  test("classifies a connection failure without claiming a provider response", () => {
    expect(
      classifyMarketDataProviderFailure(
        new Error("Could not reach market data provider: network unavailable"),
      ),
    ).toEqual({
      outcome: "provider_error",
      provider_response_observed: false,
    });
  });

  test("retains a provider response for an observed rate-limit error", () => {
    expect(
      classifyMarketDataProviderFailure(
        new MarketDataProviderResponseError("rate limit reached", true),
      ),
    ).toEqual({
      outcome: "rate_limited",
      provider_response_observed: true,
    });
  });
});
