import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildAvanzaSelectedRecommendationHandoffContract,
  summarizeAvanzaSelectedRecommendationHandoffContract,
} from "../../lib/avanza-selected-recommendation-handoff-contract";
import type {
  AvanzaBridgeReadinessSummary,
} from "../../lib/avanza-bridge-readiness-checklist";

const repoRoot = process.cwd();

const readinessSummaryFixture: AvanzaBridgeReadinessSummary = {
  advisory_count: 1,
  blocked_count: 0,
  label: "Ready for read-only observation",
  ready_count: 11,
  severity: "warning",
  shortCopy:
    "Bridge checks are ready for read-only observation. Total-read remains advisory.",
  status: "ready_for_read_only_observation",
  unknown_count: 0,
};

function readRepoFile(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function byId(
  contract: ReturnType<typeof buildAvanzaSelectedRecommendationHandoffContract>,
  id: string,
) {
  const item = contract.items.find((candidate) => candidate.id === id);
  expect(item, `Contract item ${id}`).toBeTruthy();
  return item!;
}

test.describe("Avanza selected recommendation handoff contract", () => {
  test("valid selected recommendation contract is preview-ready", () => {
    const contract = buildAvanzaSelectedRecommendationHandoffContract({
      accountDisplayName: "Valentin Labs KF",
      readinessSummary: readinessSummaryFixture,
      selectedRecommendation: {
        companyName: "GameStop",
        direction: "long",
        entryPriceValue: 21.98,
        id: "rec-gme-selected",
        positionSizeValue: 1,
        ticker: "GME",
      },
    });

    expect(contract.status).toBe("preview_ready");
    expect(contract.selectedRecommendationId).toBe("rec-gme-selected");
    expect(contract.previewOnly).toBe(true);
    expect(contract.orderMode).toBe("Avancerad/Limit");
    expect(contract.totalReadStatus).toBe("unresolved_advisory");
    expect(byId(contract, "selected_recommendation_present").status).toBe(
      "ready",
    );
    expect(byId(contract, "ticker_present").status).toBe("ready");
    expect(byId(contract, "buy_side_only").status).toBe("ready");
    expect(byId(contract, "total_read_unresolved_advisory").status).toBe(
      "advisory",
    );
    expect(byId(contract, "preview_only_not_enabled").status).toBe("advisory");

    const summary = summarizeAvanzaSelectedRecommendationHandoffContract(contract);
    expect(summary.status).toBe("preview_ready");
    expect(summary.severity).toBe("warning");
    expect(summary.label).toContain("preview");
    expect(summary.shortCopy).toContain("preview only");
    expect(summary.shortCopy).toContain("not enabled");
    expect(summary.shortCopy).toContain("not execution-ready");
    expect(summary.shortCopy).toContain("no order placement");
    expect(summary.advisoryCount).toBeGreaterThan(0);
  });

  test("missing selected recommendation is blocked", () => {
    const contract = buildAvanzaSelectedRecommendationHandoffContract({
      accountDisplayName: "Valentin Labs KF",
      readinessSummary: readinessSummaryFixture,
      selectedRecommendation: null,
    });

    expect(contract.status).toBe("blocked");
    expect(byId(contract, "selected_recommendation_present").status).toBe(
      "blocked",
    );
    expect(byId(contract, "ticker_present").status).toBe("blocked");

    const summary = summarizeAvanzaSelectedRecommendationHandoffContract(contract);
    expect(summary.status).toBe("blocked");
    expect(summary.severity).toBe("danger");
    expect(summary.blockedCount).toBeGreaterThan(0);
  });

  test("non-buy side is blocked", () => {
    const contract = buildAvanzaSelectedRecommendationHandoffContract({
      accountDisplayName: "Valentin Labs KF",
      readinessSummary: readinessSummaryFixture,
      selectedRecommendation: {
        direction: "short",
        entryPriceValue: 21.98,
        id: "rec-short-selected",
        positionSizeValue: 1,
        ticker: "GME",
      },
    });

    expect(contract.status).toBe("blocked");
    expect(byId(contract, "buy_side_only").status).toBe("blocked");
    expect(summarizeAvanzaSelectedRecommendationHandoffContract(contract).status).toBe(
      "blocked",
    );
  });

  test("missing quantity or price are advisory gaps", () => {
    const contract = buildAvanzaSelectedRecommendationHandoffContract({
      accountDisplayName: "Valentin Labs KF",
      readinessSummary: readinessSummaryFixture,
      selectedRecommendation: {
        direction: "long",
        id: "rec-advisory-selected",
        ticker: "GME",
      },
    });

    expect(contract.status).toBe("preview_ready");
    expect(byId(contract, "quantity_or_position_size_present").status).toBe(
      "advisory",
    );
    expect(byId(contract, "entry_or_limit_price_present").status).toBe(
      "advisory",
    );

    const summary = summarizeAvanzaSelectedRecommendationHandoffContract(contract);
    expect(summary.status).toBe("advisory_gaps");
    expect(summary.severity).toBe("warning");
    expect(summary.shortCopy).toContain("Quantity or price");
    expect(summary.shortCopy).toContain("not execution-ready");
  });

  test("total-read remains advisory in the eligibility summary counts", () => {
    const contract = buildAvanzaSelectedRecommendationHandoffContract({
      accountDisplayName: "Valentin Labs KF",
      readinessSummary: readinessSummaryFixture,
      selectedRecommendation: {
        companyName: "GameStop",
        direction: "long",
        entryPriceValue: 21.98,
        id: "rec-gme-total-read",
        positionSizeValue: 1,
        ticker: "GME",
      },
    });
    const totalReadItem = byId(contract, "total_read_unresolved_advisory");
    const summary = summarizeAvanzaSelectedRecommendationHandoffContract(contract);

    expect(totalReadItem.status).toBe("advisory");
    expect(summary.readyCount).toBeLessThan(contract.items.length);
    expect(summary.advisoryCount).toBeGreaterThan(0);
  });

  test("helper is pure and contains no live bridge, trigger, fill, or storage behavior", () => {
    const source = readRepoFile(
      "lib/avanza-selected-recommendation-handoff-contract.ts",
    );

    expect(source).toContain(
      "summarizeAvanzaSelectedRecommendationHandoffContract",
    );
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).not.toMatch(/localhost|127\.0\.0\.1/);
    expect(source).not.toMatch(/\/live-fill-only-runner\//);
    expect(source).not.toMatch(/fillQuantityField|fillPriceField|fillAmountField/);
    expect(source).not.toMatch(/FINAL LIVE EXECUTE ATTEMPT/);
    expect(source).not.toMatch(/method:\s*["']POST["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|cookie|BankID/i);
  });
});
