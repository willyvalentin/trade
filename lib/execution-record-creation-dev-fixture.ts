import {
  EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
  type ExecutionRecordCreationInput,
  type ExecutionRecordCreationMode,
  type ExecutionRecordCreationPhase,
  type ExecutionRecordCreationSide,
} from "@/lib/execution-record-creation-contract";

export const EXECUTION_RECORD_CREATION_DEV_FIXTURE_SOURCE =
  "execution_record_creation_dev_fixture" as const;

export type ExecutionRecordCreationDevFixtureOptions = {
  action: ExecutionRecordCreationSide;
  executionMode: ExecutionRecordCreationMode;
  executionPhase?: ExecutionRecordCreationPhase;
  handoffSessionId: string;
  livePositionId?: string | null;
  market?: string | null;
  payloadFingerprint?: string | null;
  payloadId?: string | null;
  quantity?: number | null;
  recommendationId?: string | null;
  requestedAt?: string | null;
  ticker: string;
};

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeTicker(value: string): string {
  return normalizeText(value)?.toUpperCase() ?? "DEV.FIXTURE";
}

function positiveQuantity(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 1;
}

function fixtureSafeId(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
  return normalized.replace(/^_+|_+$/g, "") || "dev_fixture";
}

export function buildExecutionRecordCreationDevFixtureInput(
  options: ExecutionRecordCreationDevFixtureOptions,
): ExecutionRecordCreationInput {
  const ticker = normalizeTicker(options.ticker);
  const quantity = positiveQuantity(options.quantity);
  const requestedAt =
    normalizeText(options.requestedAt) ?? "2026-06-11T16:40:00.000Z";
  const fixtureId = fixtureSafeId(
    `${options.handoffSessionId}_${ticker}_${options.action}`,
  );
  const executionPhase =
    options.executionPhase ?? (options.action === "buy" ? "entry" : "exit");
  const brokerOrderId = `DEV-FIXTURE-ORDER-${fixtureId}`;
  const brokerConfirmationId = `DEV-FIXTURE-CONFIRM-${fixtureId}`;
  const sourceFingerprint = `dev-fixture-source-${fixtureId}`;
  const brokerFingerprint = `dev-fixture-broker-${fixtureId}`;
  const idempotencyKey = `dev-fixture-idempotency-${fixtureId}`;

  return {
    contractVersion: EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
    requestedAt,
    sourceEnvironment: "local_dev",
    executionMode: options.executionMode,
    executionPhase,
    expectedAction: options.action,
    expectedInstrument: {
      ticker,
      name: `${ticker} dev fixture`,
      market: normalizeText(options.market) ?? "DEV",
      currency: "SEK",
      instrumentType: "dev_fixture_stock",
    },
    expectedQuantity: quantity,
    expectedPositionId: options.livePositionId ?? null,
    recommendationId: options.recommendationId ?? null,
    positionId: options.livePositionId ?? null,
    sourceBrokerExecutionResult: {
      broker: "avanza",
      status: "filled",
      side: options.action,
      ticker,
      instrumentName: `${ticker} dev fixture`,
      market: normalizeText(options.market) ?? "DEV",
      currency: "SEK",
      instrumentType: "dev_fixture_stock",
      filledQuantity: quantity,
      averageFillPrice: 100,
      grossAmount: quantity * 100,
      netAmount: quantity * 100,
      fees: 0,
      brokerOrderId,
      brokerConfirmationId,
      confirmationTimestamp: requestedAt,
      metadata: {
        fixtureOnly: true,
        source: EXECUTION_RECORD_CREATION_DEV_FIXTURE_SOURCE,
        noSupabaseWrite: true,
        noTradeMutation: true,
        noBrokerExecution: true,
        noAvanzaAutomation: true,
      },
    },
    brokerMetadata: {
      broker: "avanza",
      brokerOrderId,
      brokerConfirmationId,
      brokerReference: `DEV-FIXTURE-REF-${fixtureId}`,
      confirmationTimestamp: requestedAt,
    },
    idempotency: {
      idempotencyKey,
      sourceEvidenceFingerprint: sourceFingerprint,
      brokerResultFingerprint: brokerFingerprint,
      handoffPayloadFingerprint: options.payloadFingerprint ?? null,
      captureId: `dev-fixture-capture-${fixtureId}`,
      requestId: `dev-fixture-request-${fixtureId}`,
    },
    auditContext: {
      handoffSessionId: options.handoffSessionId,
      payloadId: options.payloadId ?? null,
      sourceEventIds: [`dev-fixture-event-${fixtureId}`],
      sourceCaptureStatus: "dev_fixture_captured",
      sourceOrderStatus: "filled",
      createdBy: "dev_stub",
      isSynthetic: false,
      isDevOnly: false,
      isMock: false,
    },
    planningSnapshotRef: options.payloadId
      ? {
          snapshotId: options.payloadId,
          snapshotVersion: "dev_fixture",
        }
      : null,
    existingTradeRef: {
      positionId: options.livePositionId ?? null,
      recommendationId: options.recommendationId ?? null,
      ticker,
    },
  };
}
