export type OpenPositionReplayKeyInput = {
  recommendationId: string;
  ticker: string;
  payloadId: string;
  payloadFingerprint: string;
  brokerOrderStatus: string;
  actualFillPrice: number;
  actualShares: number;
  brokerReferenceNote: string;
  manualBrokerConfirmed: boolean;
  brokerPlanMatches: boolean;
  previewCommission: string;
  previewFxFee: string;
  previewTotalCost: string;
  buyingPowerStatus: string;
  previewWarningType: string;
  previewWarningText: string;
  screenshotReferenceNote: string;
  brokerCostModel: string | null;
};

export type OpenPositionReplay<T> = {
  key: string;
  value: T;
};

// A position open command includes captured execution metadata. Keep retries of
// the same manual fill byte-for-byte stable so the server-owned transaction can
// reuse the original position instead of treating a new timestamp as a conflict.
export function createOpenPositionReplayKey(input: OpenPositionReplayKeyInput) {
  return JSON.stringify([
    input.recommendationId,
    input.ticker,
    input.payloadId,
    input.payloadFingerprint,
    input.brokerOrderStatus,
    input.actualFillPrice,
    input.actualShares,
    input.brokerReferenceNote.trim(),
    input.manualBrokerConfirmed,
    input.brokerPlanMatches,
    input.previewCommission.trim(),
    input.previewFxFee.trim(),
    input.previewTotalCost.trim(),
    input.buyingPowerStatus,
    input.previewWarningType,
    input.previewWarningText.trim(),
    input.screenshotReferenceNote.trim(),
    input.brokerCostModel,
  ]);
}

export function resolveOpenPositionReplay<T>(
  current: OpenPositionReplay<T> | null,
  key: string,
  createValue: () => T,
): OpenPositionReplay<T> {
  return current?.key === key ? current : { key, value: createValue() };
}
