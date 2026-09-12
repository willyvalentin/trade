import { expect, test } from "@playwright/test";

import { buildBrokerExecutionMetadata } from "../../lib/broker-execution-metadata";
import { buildBrokerExitConfirmation } from "../../lib/broker-exit-confirmation";
import {
  hasManualBrokerEntryEvidence,
  hasManualBrokerExitEvidence,
} from "../../lib/server/manual-broker-evidence";

const recommendationId = "44e29c6a-f7e4-4f5d-9d61-83f6c9c1fc5a";
const confirmedAt = "2026-09-12T14:30:00.000Z";

function entryMetadata() {
  return buildBrokerExecutionMetadata({
    brokerOrderStatus: "filled",
    brokerConfirmedAt: confirmedAt,
    actualFillPrice: 100,
    actualShares: 10,
    recommendationId,
  });
}

function exitMetadata({ soldShares = 10 }: { soldShares?: number } = {}) {
  const brokerExitConfirmation = buildBrokerExitConfirmation({
    exitStatus: "filled",
    actualExitPrice: 110,
    actualSoldShares: soldShares,
    brokerConfirmedAt: confirmedAt,
    userManuallyConfirmedSell: true,
    brokerOrderMatchesTradePlan: true,
  });
  return buildBrokerExecutionMetadata({
    brokerOrderStatus: "filled",
    brokerConfirmedAt: confirmedAt,
    actualFillPrice: 100,
    actualShares: 10,
    recommendationId,
    brokerExitConfirmation,
  });
}

test.describe("MVP-03 server manual broker evidence", () => {
  test("accepts the complete manual entry metadata emitted by the UI", () => {
    expect(
      hasManualBrokerEntryEvidence({
        recommendationId,
        entryPrice: 100,
        positionSize: 10,
        executionMetadata: entryMetadata(),
      }),
    ).toBe(true);
  });

  test("fails closed for missing or mismatched manual entry evidence", () => {
    expect(
      hasManualBrokerEntryEvidence({
        recommendationId,
        entryPrice: 100,
        positionSize: 10,
        executionMetadata: undefined,
      }),
    ).toBe(false);
    expect(
      hasManualBrokerEntryEvidence({
        recommendationId,
        entryPrice: 100,
        positionSize: 10,
        executionMetadata: {
          ...entryMetadata(),
          manual_confirmation_required: false,
        },
      }),
    ).toBe(false);
    expect(
      hasManualBrokerEntryEvidence({
        recommendationId,
        entryPrice: 100,
        positionSize: 10,
        executionMetadata: {
          ...entryMetadata(),
          actual_shares: 9,
        },
      }),
    ).toBe(false);
  });

  test("accepts a complete exit and binds it to the sell quantity", () => {
    expect(
      hasManualBrokerExitEvidence({
        exitPrice: 110,
        expectedSoldShares: 10,
        executionMetadata: exitMetadata(),
      }),
    ).toBe(true);
    expect(
      hasManualBrokerExitEvidence({
        exitPrice: 110,
        expectedSoldShares: 5,
        executionMetadata: exitMetadata(),
      }),
    ).toBe(false);
  });

  test("fails closed when the exit confirmation is incomplete or its fill differs", () => {
    const metadata = exitMetadata({ soldShares: 5 });
    expect(
      hasManualBrokerExitEvidence({
        exitPrice: 110,
        expectedSoldShares: 5,
        executionMetadata: {
          ...metadata,
          broker_exit_confirmation: {
            ...metadata.broker_exit_confirmation!,
            user_manually_confirmed_sell: false,
          },
        },
      }),
    ).toBe(false);
    expect(
      hasManualBrokerExitEvidence({
        exitPrice: 110,
        expectedSoldShares: 5,
        executionMetadata: {
          ...metadata,
          exit_fills: [],
        },
      }),
    ).toBe(false);
  });
});
