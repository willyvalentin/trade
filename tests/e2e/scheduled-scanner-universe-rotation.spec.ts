import { expect, test } from "@playwright/test";

import { buildRealScannerBaseCandidateSelection } from "@/lib/real-scanner-candidate-generation";
import {
  getManualScannerUniverseRotationBatch,
  getScheduledScannerUniverseRotationBatch,
  manualScannerUniverseRotationCadenceMinutes,
  scannerUniverseTickers,
  scheduledScannerUniverseRotationCadenceMinutes,
} from "@/lib/scanner-universe";

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
  test("moves each 15-minute scheduled batch through the full tradable universe without raising the per-run budget", () => {
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

  test("moves the one-ticker manual scan through the tradable universe every minute without raising its provider budget", () => {
    const minuteSelections = Array.from({ length: scannerUniverseTickers.length }, (_, index) => {
      const now = new Date(
        rotationStart.getTime() +
          index * manualScannerUniverseRotationCadenceMinutes * 60 * 1000,
      );

      return buildRealScannerBaseCandidateSelection({
        scanWindow: "midday",
        requestedScanBudget: 1,
        selectionMode: "manual_rotating",
        now,
      });
    });
    const selectedTickers = minuteSelections.flatMap((selection) =>
      selection.candidates.map((candidate) => candidate.ticker),
    );
    const tradableTickers = scannerUniverseTickers
      .filter((ticker) => ticker.enabled && ticker.tradable)
      .map((ticker) => ticker.ticker);
    const firstMinute = rotationStart;
    const nextMinute = new Date(
      rotationStart.getTime() +
        manualScannerUniverseRotationCadenceMinutes * 60 * 1000,
    );

    expect(minuteSelections.every((selection) => selection.candidates.length === 1)).toBe(
      true,
    );
    expect(
      minuteSelections.every(
        (selection) => selection.coverage?.scan_budget.effective_tickers === 1,
      ),
    ).toBe(true);
    expect(new Set(selectedTickers)).toEqual(new Set(tradableTickers));
    expect(minuteSelections[0].candidates[0]?.ticker).not.toBe(
      minuteSelections[1].candidates[0]?.ticker,
    );
    expect(getManualScannerUniverseRotationBatch(nextMinute)).toBe(
      getManualScannerUniverseRotationBatch(firstMinute) + 1,
    );
  });
});
