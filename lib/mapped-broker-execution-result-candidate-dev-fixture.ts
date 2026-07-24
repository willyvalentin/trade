import {
  AVANZA_BROKER_CONFIRMATION_EVIDENCE_CONTRACT_VERSION,
  type AvanzaConfirmationEvidence,
} from "@/lib/avanza-broker-confirmation-evidence-contract";
import { validateAvanzaConfirmationEvidence } from "@/lib/avanza-broker-confirmation-evidence-validator";
import {
  BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATOR_CONTRACT_VERSION,
  type BrokerExecutionResultConfirmationValidatorInput,
} from "@/lib/broker-execution-result-confirmation-validator-contract";
import { validateBrokerExecutionResultConfirmation } from "@/lib/broker-execution-result-confirmation-validator";
import { mapEvidenceToBrokerExecutionResultCandidate } from "@/lib/evidence-to-broker-execution-result-mapper";
import {
  EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_CONTRACT_VERSION,
  type EvidenceToBrokerExecutionResultMapperInput,
  type EvidenceToBrokerExecutionResultMapperResult,
} from "@/lib/evidence-to-broker-execution-result-mapper-contract";

export function buildMappedBrokerExecutionResultCandidateDevFixtureEvidence(
  overrides: Partial<AvanzaConfirmationEvidence> = {},
): AvanzaConfirmationEvidence {
  return {
    contractVersion: AVANZA_BROKER_CONFIRMATION_EVIDENCE_CONTRACT_VERSION,
    broker: "avanza",
    sourceType: "final_confirmation",
    sourcePageFlowIdentifier: "dev-fixture-avanza-final-confirmation",
    side: "buy",
    quantity: 12,
    price: {
      value: 86.5,
      fieldType: "execution_price",
      currency: "SEK",
      rawLabel: "Genomfort pris",
    },
    currency: "SEK",
    confirmationTimestamp: "2026-06-15T09:35:10.000Z",
    capturedTimestamp: "2026-06-15T09:35:15.000Z",
    manualConfirmationCheckpoint: true,
    sourceClassification: "production_safe_candidate",
    provenance: {
      captureMethod: "manual_review",
      captureMode: "manual_review",
      pageIdentity: "final_confirmation",
      capturedAt: "2026-06-15T09:35:15.000Z",
      evidenceFingerprint: "mapped-candidate-dev-fixture-evidence-001",
      sourceClassification: "production_safe_candidate",
      extractionConfidence: 0.96,
      fieldConfidence: {
        instrument: { value: 0.98 },
        side: { value: 0.99 },
        quantity: { value: 0.97 },
        price: { value: 0.96 },
        timestamp: { value: 0.94 },
        brokerReference: { value: 0.95 },
        status: { value: 0.93 },
        currency: { value: 0.98 },
      },
      userConfirmationCheckpoint: true,
      captureId: "mapped-candidate-dev-fixture-capture-001",
      requestId: "mapped-candidate-dev-fixture-request-001",
      handoffPayloadFingerprint: "mapped-candidate-dev-fixture-handoff-001",
      metadata: {
        fixtureOnly: true,
        readOnlyPreview: true,
        noBrokerExecutionResultCreated: true,
        noExecutionRecordCreated: true,
        noSupabaseWrite: true,
        noTradeMutation: true,
      },
    },
    privacy: {
      containsRawScreenshot: false,
      containsRawPageText: false,
      containsRawDom: false,
      containsCredentials: false,
      containsCookiesOrTokens: false,
      containsAccountNumber: false,
      containsBalanceOrHoldings: false,
      accountIdentifierMasked: true,
      rawUrlStored: false,
      rawSensitiveDataStored: false,
    },
    instrument: {
      instrumentName: "Ericsson B",
      ticker: "ERIC B",
      isin: "SE0000108656",
      instrumentId: "5361",
      market: "Stockholm",
      venue: "XSTO",
      instrumentType: "stock",
    },
    brokerReferences: {
      orderId: "AVZ-MAPPED-CANDIDATE-FIXTURE-ORDER-001",
      confirmationId: "AVZ-MAPPED-CANDIDATE-FIXTURE-CONFIRM-001",
      brokerReference: "AVZ-MAPPED-CANDIDATE-FIXTURE-REF-001",
    },
    orderStatus: "filled",
    orderType: "limit",
    accountContext: {
      accountLabel: "Masked ISK",
      accountType: "ISK",
      maskedAccountId: "****1234",
    },
    handoffPayloadFingerprint: "mapped-candidate-dev-fixture-handoff-001",
    fee: 1.5,
    totalAmount: 1038,
    metadata: {
      fixtureOnly: true,
      source: "mapped_broker_execution_result_candidate_dev_fixture",
      readOnlyPreview: true,
      noBrokerExecutionResultCreated: true,
      noExecutionRecordCreated: true,
      noSupabaseWrite: true,
      noTradeMutation: true,
    },
    ...overrides,
  };
}

export function buildMappedBrokerExecutionResultCandidateDevFixtureResult(
  evidence: AvanzaConfirmationEvidence =
    buildMappedBrokerExecutionResultCandidateDevFixtureEvidence(),
): EvidenceToBrokerExecutionResultMapperResult {
  const evidenceValidationResult = validateAvanzaConfirmationEvidence(evidence);
  const confirmationInput: BrokerExecutionResultConfirmationValidatorInput = {
    contractVersion:
      BROKER_EXECUTION_RESULT_CONFIRMATION_VALIDATOR_CONTRACT_VERSION,
    requestedAt: "2026-06-15T09:36:00.000Z",
    broker: "avanza",
    mode: "semi_auto_manual_confirmed",
    rawEvidence: evidence,
    evidenceValidationResult,
    sourceClassification: evidence.sourceClassification,
    intendedSide: evidence.side,
    intendedInstrument: {
      ticker: evidence.instrument.ticker,
      instrumentName: evidence.instrument.instrumentName,
      isin: evidence.instrument.isin,
      instrumentId: evidence.instrument.instrumentId,
      market: evidence.instrument.market,
      currency: evidence.currency,
    },
    intendedQuantity: evidence.quantity,
    intendedPrice: {
      expectedExecutionPrice: evidence.price.value,
      currency: evidence.currency,
      source: "manual_review",
    },
    handoffPayloadFingerprint: evidence.handoffPayloadFingerprint,
    expectedAccountContext: {
      broker: "avanza",
      accountLabel: evidence.accountContext?.accountLabel ?? null,
      accountType: evidence.accountContext?.accountType ?? null,
      maskedAccountId: evidence.accountContext?.maskedAccountId ?? null,
    },
    mappingPolicyVersion: "mapped-candidate-dev-fixture-policy-v1",
    metadata: {
      fixtureOnly: true,
      readOnlyPreview: true,
      noPersistence: true,
      noTradeMutation: true,
    },
  };
  const confirmationValidationResult =
    validateBrokerExecutionResultConfirmation(confirmationInput);
  const mapperInput: EvidenceToBrokerExecutionResultMapperInput = {
    contractVersion:
      EVIDENCE_TO_BROKER_EXECUTION_RESULT_MAPPER_CONTRACT_VERSION,
    requestedAt: "2026-06-15T09:37:00.000Z",
    broker: "avanza",
    mode: "contract_preview",
    rawEvidence: evidence,
    evidenceValidationResult,
    confirmationValidationResult,
    sourceClassification: evidence.sourceClassification,
    handoffPayloadFingerprint: evidence.handoffPayloadFingerprint,
    intendedContext: {
      side: evidence.side,
      ticker: evidence.instrument.ticker,
      instrumentName: evidence.instrument.instrumentName,
      isin: evidence.instrument.isin,
      instrumentId: evidence.instrument.instrumentId,
      quantity: evidence.quantity,
      expectedExecutionPrice: evidence.price.value,
      currency: evidence.currency,
      handoffPayloadFingerprint: evidence.handoffPayloadFingerprint,
    },
    metadata: {
      fixtureOnly: true,
      readOnlyPreview: true,
      noPersistence: true,
      noTradeMutation: true,
    },
  };

  return mapEvidenceToBrokerExecutionResultCandidate(mapperInput);
}
