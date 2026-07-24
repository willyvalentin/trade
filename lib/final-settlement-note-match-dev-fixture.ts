import {
  FINAL_SETTLEMENT_NOTE_MATCHING_CONTRACT_VERSION,
  FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_POLICY_SNAPSHOT,
  type FinalSettlementNoteMatchingInput,
  type FinalSettlementNoteMatchingResult,
} from "@/lib/final-settlement-note-matching-contract";
import { validateFinalSettlementNoteMatch } from "@/lib/final-settlement-note-matching-validator";
import {
  TWO_STAGE_BROKER_EVIDENCE_CONTRACT_VERSION,
  TWO_STAGE_BROKER_EVIDENCE_DEFAULT_SAFETY_POLICY,
  type BrokerEvidenceMaskedAccountContext,
  type BrokerEvidenceSourceReference,
  type FinalBrokerSettlementNoteEvidence,
  type ImmediateBrokerReadbackEvidence,
} from "@/lib/two-stage-broker-evidence-contract";

const FINAL_NOTE_MATCH_DEV_FIXTURE_TIMESTAMP = "2026-06-16T10:10:00.000Z";
const FINAL_NOTE_MATCH_DEV_FIXTURE_HANDOFF =
  "final-note-match-dev-fixture-handoff-001";

const accountContext = {
  accountLabel: "Masked ISK",
  accountType: "ISK",
  maskedAccountId: "****1234",
} as const satisfies BrokerEvidenceMaskedAccountContext;

function buildSourceReference(
  overrides: Partial<BrokerEvidenceSourceReference> = {},
): BrokerEvidenceSourceReference {
  return {
    sourceClassification: "production_safe_candidate",
    sourcePageIdentity: "dev-fixture-final-settlement-note",
    sourceReferenceLabel: "AVZ-FINAL-NOTE-FIXTURE-001",
    capturedAt: "2026-06-16T10:05:00.000Z",
    evidenceFingerprint: "final-note-match-dev-fixture-final-evidence-001",
    captureId: "final-note-match-dev-fixture-capture-001",
    requestId: "final-note-match-dev-fixture-request-001",
    handoffPayloadFingerprint: FINAL_NOTE_MATCH_DEV_FIXTURE_HANDOFF,
    rawSensitiveDataStored: false,
    metadata: {
      fixtureOnly: true,
      readOnlyPreview: true,
      noFinalization: true,
      noPersistence: true,
      noExecutionRecordCreated: true,
      noTradeMutation: true,
      noBrowserAutomation: true,
      noAvanzaBehavior: true,
    },
    ...overrides,
  };
}

export function buildFinalSettlementNoteMatchDevFixtureImmediateReadback(
  overrides: Partial<ImmediateBrokerReadbackEvidence> = {},
): ImmediateBrokerReadbackEvidence {
  return {
    contractVersion: TWO_STAGE_BROKER_EVIDENCE_CONTRACT_VERSION,
    evidenceStage: "immediate_readback",
    lifecycleStatus: "final_note_pending",
    broker: "avanza",
    accountContext,
    instrument: {
      instrumentName: "Ericsson B",
      ticker: "ERIC B",
      isin: "SE0000108656",
      instrumentId: "5361",
      market: "Stockholm",
      venue: "XSTO",
    },
    side: "buy",
    quantity: 12,
    visiblePrice: {
      value: 86.5,
      currency: "SEK",
      rawLabel: "Genomfort pris",
    },
    visibleCurrency: "SEK",
    transactionReadbackTimestamp: "2026-06-16T10:00:00.000Z",
    sourcePageIdentity: "dev-fixture-immediate-readback",
    handoffPayloadFingerprint: FINAL_NOTE_MATCH_DEV_FIXTURE_HANDOFF,
    provisionalStatus: "provisional",
    finalNotePending: true,
    missingFields: [],
    provisionalFields: [],
    provenance: buildSourceReference({
      sourcePageIdentity: "dev-fixture-immediate-readback",
      sourceReferenceLabel: "AVZ-IMMEDIATE-READBACK-FIXTURE-001",
      evidenceFingerprint:
        "final-note-match-dev-fixture-immediate-evidence-001",
    }),
    safetyPolicy: TWO_STAGE_BROKER_EVIDENCE_DEFAULT_SAFETY_POLICY,
    reviewFlags: [],
    warnings: [],
    metadata: {
      fixtureOnly: true,
      readOnlyPreview: true,
      noFinalization: true,
      noPersistence: true,
      noExecutionRecordCreated: true,
      noTradeMutation: true,
    },
    ...overrides,
  };
}

export function buildFinalSettlementNoteMatchDevFixtureFinalNote(
  overrides: Partial<FinalBrokerSettlementNoteEvidence> = {},
): FinalBrokerSettlementNoteEvidence {
  return {
    contractVersion: TWO_STAGE_BROKER_EVIDENCE_CONTRACT_VERSION,
    evidenceStage: "final_settlement_note",
    lifecycleStatus: "final_note_available",
    broker: "avanza",
    noteReferenceNumber: "AVZ-FINAL-NOTE-FIXTURE-001",
    businessDate: "2026-06-16",
    settlementDate: "2026-06-18",
    printDate: "2026-06-16",
    instrument: {
      instrumentName: "Ericsson B",
      ticker: "ERIC B",
      isin: "SE0000108656",
      instrumentId: "5361",
      market: "Stockholm",
      venue: "XSTO",
    },
    isin: "SE0000108656",
    side: "buy",
    quantity: 12,
    executionPrice: {
      value: 86.5,
      currency: "SEK",
      rawLabel: "Slutlig kurs",
    },
    currency: "SEK",
    executionTime: "2026-06-16T10:03:00.000Z",
    orderType: "limit",
    marketOrVenue: "XSTO",
    commission: {
      value: 1.5,
      currency: "SEK",
      rawLabel: "Courtage",
    },
    consideration: {
      value: 1038,
      currency: "SEK",
      rawLabel: "Likvid",
    },
    fxRates: [],
    totalAmount: {
      value: 1039.5,
      currency: "SEK",
      rawLabel: "Totalt belopp",
    },
    accountContext,
    provenance: buildSourceReference(),
    matchingCandidate: {
      provisionalEvidenceFingerprint:
        "final-note-match-dev-fixture-immediate-evidence-001",
      finalNoteEvidenceFingerprint:
        "final-note-match-dev-fixture-final-evidence-001",
      noteReferenceNumber: "AVZ-FINAL-NOTE-FIXTURE-001",
      broker: "avanza",
      accountContext,
      instrument: {
        instrumentName: "Ericsson B",
        ticker: "ERIC B",
        isin: "SE0000108656",
        instrumentId: "5361",
      },
      side: "buy",
      quantity: 12,
      tradeDate: "2026-06-16",
      approximateExecutionTime: "2026-06-16T10:00:00.000Z",
      price: {
        value: 86.5,
        currency: "SEK",
        rawLabel: "limit",
      },
      handoffPayloadFingerprint: FINAL_NOTE_MATCH_DEV_FIXTURE_HANDOFF,
      matchingStatus: "exact_match",
      matchingReasons: [],
      reviewFlags: [],
    },
    finalizedFields: [],
    missingFields: [],
    safetyPolicy: TWO_STAGE_BROKER_EVIDENCE_DEFAULT_SAFETY_POLICY,
    reviewFlags: [],
    warnings: [],
    metadata: {
      fixtureOnly: true,
      readOnlyPreview: true,
      noFinalization: true,
      noPersistence: true,
      noExecutionRecordCreated: true,
      noTradeMutation: true,
      noBrowserAutomation: true,
      noAvanzaBehavior: true,
    },
    ...overrides,
  };
}

export function buildFinalSettlementNoteMatchDevFixtureInput(
  overrides: Partial<FinalSettlementNoteMatchingInput> = {},
): FinalSettlementNoteMatchingInput {
  const immediateReadback =
    overrides.provisionalImmediateReadbackEvidence ??
    buildFinalSettlementNoteMatchDevFixtureImmediateReadback();
  const finalNote =
    overrides.finalSettlementNoteEvidence ??
    buildFinalSettlementNoteMatchDevFixtureFinalNote();

  return {
    contractVersion: FINAL_SETTLEMENT_NOTE_MATCHING_CONTRACT_VERSION,
    requestedAt: FINAL_NOTE_MATCH_DEV_FIXTURE_TIMESTAMP,
    broker: "avanza",
    provisionalImmediateReadbackEvidence: immediateReadback,
    provisionalTradeContext: {
      broker: "avanza",
      accountContext,
      instrumentName: "Ericsson B",
      ticker: "ERIC B",
      isin: "SE0000108656",
      instrumentId: "5361",
      side: "buy",
      quantity: 12,
      tradeDate: "2026-06-16",
      approximateExecutionTime: "2026-06-16T10:00:00.000Z",
      expectedPrice: {
        value: 86.5,
        currency: "SEK",
      },
      handoffPayloadFingerprint: FINAL_NOTE_MATCH_DEV_FIXTURE_HANDOFF,
      provenance: immediateReadback.provenance,
      metadata: {
        fixtureOnly: true,
        readOnlyPreview: true,
      },
    },
    handoffPayloadFingerprint: FINAL_NOTE_MATCH_DEV_FIXTURE_HANDOFF,
    finalSettlementNoteEvidence: finalNote,
    accountContext,
    sourceMetadata: {
      broker: "avanza",
      sourceClassification: "production_safe_candidate",
      sourcePageIdentity: "dev-fixture-final-settlement-note",
      sourceReferenceLabel: "AVZ-FINAL-NOTE-FIXTURE-001",
      sourceEvidenceFingerprint:
        "final-note-match-dev-fixture-final-evidence-001",
      finalNoteReferenceNumber: "AVZ-FINAL-NOTE-FIXTURE-001",
      capturedAt: "2026-06-16T10:05:00.000Z",
      provenance: finalNote.provenance,
    },
    policySnapshot: FINAL_SETTLEMENT_NOTE_MATCHING_DEFAULT_POLICY_SNAPSHOT,
    metadata: {
      fixtureOnly: true,
      source: "final_settlement_note_match_dev_fixture",
      readOnlyPreview: true,
      explicitTriggerOnly: true,
      noLiveAvanzaData: true,
      noFinalization: true,
      noPersistence: true,
      noExecutionRecordCreated: true,
      noTradeMutation: true,
      noBrowserAutomation: true,
      noAvanzaBehavior: true,
    },
    ...overrides,
  };
}

export function buildFinalSettlementNoteMatchDevFixtureResult(
  input: FinalSettlementNoteMatchingInput =
    buildFinalSettlementNoteMatchDevFixtureInput(),
): FinalSettlementNoteMatchingResult {
  return validateFinalSettlementNoteMatch(input);
}
