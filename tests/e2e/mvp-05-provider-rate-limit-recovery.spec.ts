import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { isProviderRateLimitLikeError } from "../../lib/provider-rate-limit";

const repositoryRoot = path.resolve(__dirname, "../..");

test("provider credit exhaustion is classified as a rate limit", () => {
  expect(
    isProviderRateLimitLikeError(
      new Error(
        "You have run out of API credits for the current minute. 48 API credits were used, with the current limit being 8.",
      ),
    ),
  ).toBe(true);
  expect(isProviderRateLimitLikeError(new Error("Invalid candle payload."))).toBe(
    false,
  );
});

test("the scanner propagates a provider rate limit for fail-closed scheduler recovery", async () => {
  const scanner = await readFile(path.join(repositoryRoot, "lib/scanner.ts"), "utf8");
  const route = await readFile(
    path.join(repositoryRoot, "app/api/automation/run-scan/route.ts"),
    "utf8",
  );

  expect(scanner).toContain('from "@/lib/provider-rate-limit"');
  expect(scanner).toContain("if (isProviderRateLimitLikeError(error)) {");
  expect(route).toContain("status === 429 || isProviderRateLimitLikeError(normalized)");
  expect(route).toContain('return "provider_rate_limited";');
});
