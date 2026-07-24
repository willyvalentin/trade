import { buildFinalizationCandidate } from "@/lib/finalization-candidate-builder";
import {
  FINALIZATION_CANDIDATE_BUILDER_CONTRACT_VERSION,
  type FinalizationCandidateBuilderInput,
  type FinalizationCandidateBuilderResult,
} from "@/lib/finalization-candidate-builder-contract";
import {
  buildFinalSettlementNoteMatchDevFixtureFinalNote,
  buildFinalSettlementNoteMatchDevFixtureImmediateReadback,
  buildFinalSettlementNoteMatchDevFixtureResult,
} from "@/lib/final-settlement-note-match-dev-fixture";
import { buildMappedBrokerExecutionResultCandidateDevFixtureResult } from "@/lib/mapped-broker-execution-result-candidate-dev-fixture";

const FINALIZATION_CANDIDATE_DEV_FIXTURE_TIMESTAMP =
  "2026-06-16T10:15:00.000Z";
const FINALIZATION_CANDIDATE_DEV_FIXTURE_HANDOFF =
  "final-note-match-dev-fixture-handoff-001";

export function buildFinalizationCandidateDevFixtureInput(
  overrides: Partial<FinalizationCandidateBuilderInput> = {},
): FinalizationCandidateBuilderInput {
  const provisionalImmediateReadbackEvidence =
    overrides.provisionalImmediateReadbackEvidence ??
    buildFinalSettlementNoteMatchDevFixtureImmediateReadback();
  const finalSettlementNoteEvidence =
    overrides.finalSettlementNoteEvidence ??
    buildFinalSettlementNoteMatchDevFixtureFinalNote();
  const finalSettlementNoteMatchingResult =
    overrides.finalSettlementNoteMatchingResult ??
    buildFinalSettlementNoteMatchDevFixtureResult();
  const brokerExecutionResultCandidate =
    overrides.brokerExecutionResultCandidate ??
    buildMappedBrokerExecutionResultCandidateDevFixtureResult()
      .mappedCandidate;

  if (!brokerExecutionResultCandidate) {
    throw new Error(
      "Finalization candidate dev fixture requires a mapped broker execution result candidate.",
    );
  }

  return {
    contractVersion: FINALIZATION_CANDIDATE_BUILDER_CONTRACT_VERSION,
    requestedAt: FINALIZATION_CANDIDATE_DEV_FIXTURE_TIMESTAMP,
    provisionalImmediateReadbackEvidence,
    finalSettlementNoteEvidence,
    finalSettlementNoteMatchingResult,
    brokerExecutionResultCandidate,
    provisionalTradeContext: {
      provisionalTradeId: "finalization-candidate-dev-fixture-trade-001",
      recommendationId:
        "finalization-candidate-dev-fixture-recommendation-001",
      positionId: "finalization-candidate-dev-fixture-position-001",
      ticker: "ERIC B",
      instrumentName: "Ericsson B",
      side: "buy",
      quantity: 12,
      status: "final_note_pending",
    },
    handoffPayloadFingerprint: FINALIZATION_CANDIDATE_DEV_FIXTURE_HANDOFF,
    accountContext: finalSettlementNoteEvidence.accountContext ?? null,
    metadata: {
      fixtureOnly: true,
      source: "finalization_candidate_dev_fixture",
      readOnlyPreview: true,
      explicitTriggerOnly: true,
      pureBuilderOnly: true,
      noLiveAvanzaData: true,
      noCapture: true,
      noBrowserAutomation: true,
      noAvanzaBehavior: true,
      noFinalization: true,
      noPersistence: true,
      noExecutionRecordCreated: true,
      noStatsUpdate: true,
      noTradeMutation: true,
    },
    ...overrides,
  };
}

export function buildFinalizationCandidateDevFixtureResult(
  input: FinalizationCandidateBuilderInput =
    buildFinalizationCandidateDevFixtureInput(),
): FinalizationCandidateBuilderResult {
  return buildFinalizationCandidate(input);
}
