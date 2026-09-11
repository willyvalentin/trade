import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { resolveDashboardRefreshContention } from "../../lib/dashboard-refresh-contention";

const repositoryRoot = path.resolve(__dirname, "../..");

function createDeferredRefresh() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });

  return { promise, resolve };
}

test.describe("MVP-03 post-write dashboard refresh", () => {
  test("coalesces background reads without dropping the existing behavior", async () => {
    const inFlight = createDeferredRefresh();

    await expect(
      resolveDashboardRefreshContention({
        existingRefresh: inFlight.promise,
        isInitialLoad: false,
        source: "auto",
      }),
    ).resolves.toBe("skip");

    inFlight.resolve();
  });

  test("waits for an earlier read before refreshing a completed action", async () => {
    const inFlight = createDeferredRefresh();
    let settled = false;
    const decision = resolveDashboardRefreshContention({
      existingRefresh: inFlight.promise,
      isInitialLoad: false,
      source: "action",
    }).then((value) => {
      settled = true;
      return value;
    });

    await Promise.resolve();
    expect(settled).toBe(false);
    inFlight.resolve();
    await expect(decision).resolves.toBe("run");
  });

  test("keeps the position-open action on the queued refresh path", async () => {
    const tradeApp = await readFile(
      path.join(repositoryRoot, "app/trade-app.tsx"),
      "utf8",
    );

    expect(tradeApp).toContain("dataRefreshInFlightPromiseRef");
    expect(tradeApp).toContain("resolveDashboardRefreshContention({");
    expect(tradeApp).toContain(
      '["recommendations", "live_trades", "stats_today"],\n      "action",',
    );
  });
});
