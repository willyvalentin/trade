import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  createOpenPositionReplayKey,
  resolveOpenPositionReplay,
  type OpenPositionReplayKeyInput,
} from "../../lib/open-position-replay";

const repositoryRoot = path.resolve(__dirname, "../..");

function replayInput(
  overrides: Partial<OpenPositionReplayKeyInput> = {},
): OpenPositionReplayKeyInput {
  return {
    recommendationId: "11111111-1111-4111-8111-111111111111",
    ticker: "ACME",
    payloadId: "payload-1",
    payloadFingerprint: "a".repeat(64),
    brokerOrderStatus: "filled",
    actualFillPrice: 101.5,
    actualShares: 10,
    brokerReferenceNote: "fill-42",
    manualBrokerConfirmed: true,
    brokerPlanMatches: true,
    previewCommission: "1.25",
    previewFxFee: "",
    previewTotalCost: "1.25",
    buyingPowerStatus: "ok",
    previewWarningType: "none",
    previewWarningText: "",
    screenshotReferenceNote: "manual evidence",
    brokerCostModel: '{"currency":"USD"}',
    ...overrides,
  };
}

test("same manual-fill retry reuses the original captured command", () => {
  const key = createOpenPositionReplayKey(replayInput());
  let created = 0;
  const first = resolveOpenPositionReplay(null, key, () => ({
    brokerConfirmedAt: `timestamp-${++created}`,
  }));
  const retry = resolveOpenPositionReplay(first, key, () => ({
    brokerConfirmedAt: `timestamp-${++created}`,
  }));

  expect(retry).toBe(first);
  expect(retry.value.brokerConfirmedAt).toBe("timestamp-1");
  expect(created).toBe(1);
});

test("a changed manual fill gets a new command rather than reusing the prior one", () => {
  const firstKey = createOpenPositionReplayKey(replayInput());
  const secondKey = createOpenPositionReplayKey(replayInput({ actualShares: 11 }));
  const first = resolveOpenPositionReplay(null, firstKey, () => ({ command: 1 }));
  const changed = resolveOpenPositionReplay(first, secondKey, () => ({ command: 2 }));

  expect(secondKey).not.toBe(firstKey);
  expect(changed).not.toBe(first);
  expect(changed.value.command).toBe(2);
});

test("insignificant whitespace cannot turn the same fill into a conflicting retry", () => {
  expect(
    createOpenPositionReplayKey(replayInput({ brokerReferenceNote: " fill-42 " })),
  ).toBe(createOpenPositionReplayKey(replayInput()));
});

test("the trade modal retains and reuses the replay-safe broker fill before the owner-bound request", async () => {
  const source = await readFile(path.join(repositoryRoot, "app/trade-app.tsx"), "utf8");

  expect(source).toContain("submittedBrokerFillRef");
  expect(source).toContain("createOpenPositionReplayKey");
  expect(source).toContain("resolveOpenPositionReplay(");
  expect(source).toContain("submittedBrokerFillRef.current = replay;");
  expect(source).toContain("onSubmit(event, replay.value);");
});
