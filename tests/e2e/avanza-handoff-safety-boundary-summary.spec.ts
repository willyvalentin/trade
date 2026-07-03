import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  avanzaHandoffSafetyBoundarySummary,
} from "../../lib/avanza-handoff-safety-boundary-summary";

const repoRoot = process.cwd();

const requiredBoundaryIds = [
  "preview_only",
  "disabled_control",
  "no_live_recommendation_wiring",
  "no_trade_ui_bridge_call",
  "no_trade_ui_localhost_fetch",
  "no_polling",
  "no_trigger_phrase",
  "no_runner_fill_endpoint",
  "no_granska_kop_click",
  "no_review_modal",
  "no_final_confirmation",
  "no_submit",
  "no_order_placement",
  "no_credentials_session_bankid_cookies_storage",
  "no_supabase_execution_write",
  "total_read_unresolved_advisory",
] as const;

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

test.describe("Avanza handoff safety boundary summary", () => {
  test("model contains required hard boundaries", () => {
    const ids = avanzaHandoffSafetyBoundarySummary.boundaries.map(
      (boundary) => boundary.id,
    );

    for (const id of requiredBoundaryIds) {
      expect(ids).toContain(id);
    }

    expect(avanzaHandoffSafetyBoundarySummary.label).toBe("Safety boundaries");
  });

  test("hard boundaries are enforced and total-read remains advisory", () => {
    const byId = new Map(
      avanzaHandoffSafetyBoundarySummary.boundaries.map((boundary) => [
        boundary.id,
        boundary,
      ]),
    );

    for (const id of requiredBoundaryIds) {
      const boundary = byId.get(id);
      expect(boundary, `Boundary ${id}`).toBeTruthy();
      expect(boundary?.label.length).toBeGreaterThan(0);
      expect(boundary?.detail.length).toBeGreaterThan(0);
    }

    expect(byId.get("total_read_unresolved_advisory")?.status).toBe("advisory");
    expect(byId.get("preview_only")?.status).toBe("enforced");
    expect(byId.get("no_order_placement")?.status).toBe("enforced");
    expect(byId.get("no_supabase_execution_write")?.status).toBe("enforced");
  });

  test("card renders key boundaries from the static fixture", () => {
    const cardSource = readRepoFile(
      "components/execution/AvanzaHandoffPackagePreviewCard.tsx",
    );
    const tradeSource = readRepoFile("app/trade-app.tsx");
    const fixtureSource = readRepoFile(
      "lib/avanza-handoff-package-preview-fixtures.ts",
    );
    const avanzaPreviewCallSite =
      tradeSource.match(
        /<AvanzaHandoffPackagePreviewCard[\s\S]*?\/>/,
      )?.[0] ?? "";

    expect(cardSource).toContain("safetyBoundarySummary.label");
    expect(cardSource).toContain("safetyBoundarySummary.boundaries.map");
    expect(cardSource).toContain("Total-read unresolved/advisory");
    expect(fixtureSource).toContain("avanzaGameStopHandoffSafetyBoundarySummaryFixture");
    expect(avanzaPreviewCallSite).toContain("safetyBoundarySummary={");
    expect(avanzaPreviewCallSite).toContain(
      "avanzaGameStopHandoffSafetyBoundarySummaryFixture",
    );
  });

  test("model contains no live endpoint strings or exact trigger phrase", () => {
    const source = readRepoFile("lib/avanza-handoff-safety-boundary-summary.ts");

    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
  });
});
