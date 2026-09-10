import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildLiveSellGuidance } from "../../lib/live-sell-guidance";
import {
  resolvePositionDisplayDirection,
} from "../../lib/position-display-direction";

const root = process.cwd();
const applicationDataAccessPath = join(
  root,
  "lib/server/application-data-access.ts",
);
const tradeAppPath = join(root, "app/trade-app.tsx");
const livePositionHandoffStatePath = join(
  root,
  "hooks/execution/useExecutionLivePositionHandoffState.ts",
);

function read(path: string) {
  return readFileSync(path, "utf8");
}

test.describe("MVP-03 position-direction truthfulness", () => {
  test("uses a persisted direction first, falls back to the linked recommendation, and otherwise stays unknown", () => {
    expect(
      resolvePositionDisplayDirection({
        positionDirection: " SHORT ",
        recommendationDirection: "long",
      }),
    ).toBe("Short");
    expect(
      resolvePositionDisplayDirection({ recommendationDirection: "short" }),
    ).toBe("Short");
    expect(resolvePositionDisplayDirection({ positionDirection: "buy" })).toBe(
      "Unknown",
    );
    expect(resolvePositionDisplayDirection({})).toBe("Unknown");
  });

  test("blocks guidance and manual-handoff preparation when the direction is unknown", () => {
    const guidance = buildLiveSellGuidance({
      direction: "Unknown",
      current_price: 110,
      entry_price: 100,
      stop_price: 95,
      target_price: 120,
      position_size: 5,
      now: "2026-09-10T13:00:00.000Z",
    });

    expect(guidance).toMatchObject({
      action: "review_required",
      trigger: "missing_direction",
      current_r: null,
      unrealized_pnl: null,
      unrealized_pnl_percent: null,
      should_prepare_sell_handoff: false,
      confidence: "unknown",
    });
    expect(guidance.blockers).toContain("Position direction is unavailable.");
  });

  test("reads the linked recommendation direction for both open and closed positions", () => {
    const dataAccessSource = read(applicationDataAccessPath);
    const tradeAppSource = read(tradeAppPath);
    const handoffStateSource = read(livePositionHandoffStatePath);

    expect(dataAccessSource).toContain(
      "recommendations!positions_recommendation_owner_fkey(setup_type,invalidation,direction)",
    );
    expect(dataAccessSource).toContain(
      "recommendations!positions_recommendation_owner_fkey(setup_type,direction)",
    );
    expect(tradeAppSource).toContain("resolvePositionDisplayDirection({");
    expect(tradeAppSource).toContain(
      "recommendationDirection: row.recommendations?.direction",
    );
    expect(tradeAppSource).toContain("if (!isKnownPositionDirection(direction)) {");
    expect(handoffStateSource).toContain('direction: "Long" | "Short" | "Unknown";');
    expect(handoffStateSource).toContain('direction !== "Long"');
  });
});
