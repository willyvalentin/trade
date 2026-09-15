import { expect, test } from "@playwright/test";

import { buildRealScannerBaseCandidateSelection } from "@/lib/real-scanner-candidate-generation";
import {
  getScheduledScannerUniverseRotationBatch,
  scannerUniverseTickers,
  scheduledScannerUniverseRotationCadenceMinutes,
} from "@/lib/scanner-universe";
import { buildDynamicMarketMoversSelection } from "@/lib/dynamic-market-movers";

const rotationStart = new Date("2026-09-14T13:30:00.000Z");
const scheduledBudget = 10;

function rotatedSelection(batchOffset: number) {
  const now = new Date(
    rotationStart.getTime() +
      batchOffset *
        scheduledScannerUniverseRotationCadenceMinutes *
        60 *
        1000,
  );

  return buildRealScannerBaseCandidateSelection({
    scanWindow: "midday",
    requestedScanBudget: scheduledBudget,
    selectionMode: "scheduled_rotating",
    now,
  });
}

test.describe("scheduled scanner universe rotation", () => {
  test("moves each scheduled batch through the full tradable universe without raising the per-run budget", () => {
    const batches = Array.from({ length: 10 }, (_, index) =>
      rotatedSelection(index),
    );
    const selectedTickers = batches.flatMap((selection) =>
      selection.candidates.map((candidate) => candidate.ticker),
    );
    const tradableTickers = scannerUniverseTickers
      .filter((ticker) => ticker.enabled && ticker.tradable)
      .map((ticker) => ticker.ticker);

    expect(batches.every((selection) => selection.candidates.length === scheduledBudget)).toBe(
      true,
    );
    expect(
      batches.every(
        (selection) =>
          selection.coverage?.scan_budget.effective_tickers === scheduledBudget,
      ),
    ).toBe(true);
    expect(new Set(selectedTickers)).toEqual(new Set(tradableTickers));
    expect(new Set(batches[0].candidates.map((candidate) => candidate.ticker))).not.toEqual(
      new Set(batches[1].candidates.map((candidate) => candidate.ticker)),
    );
  });

  test("keeps manual selection stable and gives one rotation batch to a repeated scheduled slot", () => {
    const sameSlot = new Date(rotationStart);
    const nextSlot = new Date(
      rotationStart.getTime() +
        scheduledScannerUniverseRotationCadenceMinutes * 60 * 1000,
    );
    const manualAtStart = buildRealScannerBaseCandidateSelection({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      now: sameSlot,
    });
    const manualAtNextSlot = buildRealScannerBaseCandidateSelection({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      now: nextSlot,
    });
    const firstScheduled = rotatedSelection(0);
    const repeatedScheduled = buildRealScannerBaseCandidateSelection({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      selectionMode: "scheduled_rotating",
      now: sameSlot,
    });

    expect(manualAtStart.candidates.map((candidate) => candidate.ticker)).toEqual(
      manualAtNextSlot.candidates.map((candidate) => candidate.ticker),
    );
    expect(repeatedScheduled.rotationBatch).toBe(firstScheduled.rotationBatch);
    expect(repeatedScheduled.candidates.map((candidate) => candidate.ticker)).toEqual(
      firstScheduled.candidates.map((candidate) => candidate.ticker),
    );
    expect(getScheduledScannerUniverseRotationBatch(nextSlot)).toBe(
      getScheduledScannerUniverseRotationBatch(sameSlot) + 1,
    );
  });

  test("admits a dynamic symbol beyond the static universe without increasing the scan budget", () => {
    const dynamicMovers = buildDynamicMarketMoversSelection({
      scanWindow: "midday",
      selectedBudget: scheduledBudget,
      providerResult: {
        provider: "twelve_data",
        status: "available",
        fetched_at: rotationStart.toISOString(),
        movers: [
          {
            ticker: "NEWM",
            company_name: "New Mover, Inc.",
            source: "top_gainer",
            source_rank: 1,
            percent_change: 12.4,
            volume: 1_200_000,
            price: 24.5,
            tradable: true,
          },
        ],
      },
      now: rotationStart,
    });
    const selection = buildRealScannerBaseCandidateSelection({
      scanWindow: "midday",
      requestedScanBudget: scheduledBudget,
      dynamicMovers,
      now: rotationStart,
    });

    expect(selection.candidates).toHaveLength(scheduledBudget);
    expect(selection.candidates.map((candidate) => candidate.ticker)).toContain(
      "NEWM",
    );
    expect(selection.coverage?.dynamic_mover_selected_count).toBe(1);
    expect(selection.coverage?.scan_budget.effective_tickers).toBe(scheduledBudget);
  });
});
