"use client";

import { useMemo, useState } from "react";

import {
  checkLocalhostBridgeBrokerConfirmationCapture,
  checkLocalhostBridgeBrokerExecutionResultEligibility,
  checkLocalhostBridgeBrokerExecutionResultPreview,
  checkLocalhostBridgeExecutionRecordEligibility,
  type LocalhostBridgeClientBrokerConfirmationCaptureResult,
  type LocalhostBridgeClientBrokerExecutionResultEligibilityResult,
  type LocalhostBridgeClientBrokerExecutionResultPreviewResult,
  type LocalhostBridgeClientExecutionRecordEligibilityResult,
} from "@/lib/avanza-localhost-bridge-client";
import type { ExecutionIntent } from "@/lib/execution";
import type { ExecutionIntentToAvanzaDryRunResult } from "@/lib/execution-intent-to-avanza-dry-run";
import { buildExecutionRecordCandidate } from "@/lib/execution-record-candidate-builder";
import {
  EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
  type ExecutionRecordCandidate as ExecutionRecordCreationCandidate,
  type ExecutionRecordCreationInput,
} from "@/lib/execution-record-creation-contract";
import { buildExecutionRecordCreationDevFixtureInput } from "@/lib/execution-record-creation-dev-fixture";
import type { ExecutionRecordCandidate } from "@/lib/execution-record-eligibility";
import { requestExecutionRecordInsertDryRun } from "@/lib/execution-record-insert-dry-run-client";
import {
  EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION,
  type ExecutionRecordInsertRouteRequest,
  type ExecutionRecordInsertRouteResponse,
} from "@/lib/execution-record-insert-route-contract";
import {
  EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
  type ExecutionRecordPersistenceAuditMetadata,
  type ExecutionRecordPersistenceInput,
} from "@/lib/execution-record-persistence-contract";
import {
  buildFinalizationActionDevFixtureResult,
  type FinalizationActionDevFixtureResult,
} from "@/lib/finalization-action-dev-fixture";
import {
  buildFinalizationExecutionRecordBridgeDevFixtureResult,
  type FinalizationExecutionRecordBridgeDevFixtureResult,
} from "@/lib/finalization-execution-record-bridge-dev-fixture";
import {
  buildExecutionRecordCandidateBuilderIntegrationDevFixtureResult,
  type ExecutionRecordCandidateBuilderIntegrationDevFixtureResult,
} from "@/lib/execution-record-candidate-builder-integration-dev-fixture";
import { buildFinalizationCandidateDevFixtureResult } from "@/lib/finalization-candidate-dev-fixture";
import type { FinalizationCandidateBuilderResult } from "@/lib/finalization-candidate-builder-contract";
import { buildMappedBrokerExecutionResultCandidateDevFixtureResult } from "@/lib/mapped-broker-execution-result-candidate-dev-fixture";
import type { EvidenceToBrokerExecutionResultMapperResult } from "@/lib/evidence-to-broker-execution-result-mapper-contract";
import { buildFinalSettlementNoteMatchDevFixtureResult } from "@/lib/final-settlement-note-match-dev-fixture";
import type { FinalSettlementNoteMatchingResult } from "@/lib/final-settlement-note-matching-contract";

export type UseLatePhasePreviewStateInput = {
  avanzaDryRunRequestPreview: ExecutionIntentToAvanzaDryRunResult | null;
  executionDevToolsEnabled: boolean;
  selectedIntent: ExecutionIntent | null;
};

function isMetadataObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sourceBrokerMetadata(candidate: ExecutionRecordCreationCandidate) {
  const metadata = candidate.provenanceMetadata?.sourceBrokerResultMetadata;

  return isMetadataObject(metadata) ? metadata : {};
}

function buildDryRunInsertRouteRequest(input: {
  candidate: ExecutionRecordCreationCandidate;
  candidateSafeToPersist: boolean;
  requestId: string;
  sourceEventIds: string[];
}): ExecutionRecordInsertRouteRequest {
  const { candidate, candidateSafeToPersist, requestId, sourceEventIds } = input;
  const metadata = sourceBrokerMetadata(candidate);
  const previewOnly =
    metadata.previewOnly === true || metadata.notBrokerExecutionResult === true;
  const devFixture =
    metadata.fixtureOnly === true ||
    metadata.source === "execution_record_creation_dev_fixture";
  const synthetic = metadata.isSynthetic === true;
  const mock = metadata.isMock === true;
  const brokerConfirmation = {
    broker: candidate.broker,
    brokerOrderId: candidate.brokerOrderId ?? null,
    brokerConfirmationId: candidate.brokerConfirmationId ?? null,
    brokerResultFingerprint: candidate.brokerResultFingerprint ?? null,
    confirmedAt: candidate.confirmationTimestamp,
    capturedAt: candidate.createdAt,
    sourceFingerprint: candidate.sourceEvidenceFingerprint,
  };
  const association = {
    sourceRecommendationId: candidate.recommendationId ?? null,
    sourcePositionId: candidate.positionId ?? null,
    handoffSessionId: candidate.handoffSessionId ?? null,
    planningSnapshotId: candidate.planningSnapshotId ?? null,
    tradeAssociationConfidence: "confirmed" as const,
  };
  const userContext = {
    userId: "execution-dry-run-ui-preview-user",
    accountId: "execution-dry-run-ui-preview-account",
    actor: "server_route" as const,
    sourceEnvironment: candidate.sourceEnvironment,
  };
  const safetyChecklist = {
    candidateValidated: true,
    candidateSafeToPersist,
    notPreviewOnly: !previewOnly,
    notDevFixture: !devFixture,
    notSynthetic: !synthetic,
    notMock: !mock,
    hasConfirmedBrokerResult: Boolean(
      candidate.brokerOrderId || candidate.brokerConfirmationId,
    ),
    hasIdempotencyKey: Boolean(candidate.idempotencyKey),
    hasRecordFingerprint: Boolean(candidate.recordFingerprint),
    hasSourceFingerprint: Boolean(candidate.sourceEvidenceFingerprint),
    hasUserOrAccountContext: true,
    hasUnambiguousTradeAssociation: true,
    schemaAvailable: true,
    rlsContextPresent: true,
    auditPolicyReviewed: true,
    tradeMutationSeparated: true,
    automaticModeReviewed: candidate.executionMode !== "automatic",
  };
  const auditMetadata: ExecutionRecordPersistenceAuditMetadata = {
    noTradeMutation: true,
    noAuditAppendInContract: true,
    persistenceAttempted: false,
    supabaseWriteAttempted: false,
    tradeMutationAttempted: false,
    auditAppendAttempted: false,
    actor: "server_route" as const,
    sourceEnvironment: candidate.sourceEnvironment,
    sourceEventIds,
    idempotencyKey: candidate.idempotencyKey,
    recordFingerprint: candidate.recordFingerprint,
    sourceFingerprint: candidate.sourceEvidenceFingerprint,
    brokerResultFingerprint: candidate.brokerResultFingerprint ?? null,
    handoffSessionId: candidate.handoffSessionId ?? null,
  };
  const persistenceInput: ExecutionRecordPersistenceInput = {
    contractVersion: EXECUTION_RECORD_PERSISTENCE_CONTRACT_VERSION,
    requestedAt: new Date().toISOString(),
    candidate,
    idempotencyKey: candidate.idempotencyKey,
    recordFingerprint: candidate.recordFingerprint,
    sourceFingerprint: candidate.sourceEvidenceFingerprint,
    brokerConfirmation,
    association,
    userContext,
    safetyChecklist,
    auditMetadata,
    schemaReference: {
      tableName: "execution_records",
      expectedColumnsVersion: "execution_records_v1",
      migrationVersion: "planned",
    },
    metadata: {
      source: "execution_handoff_preview_modal",
      dry_run_route_preview: true,
      read_only: true,
      no_supabase_write: true,
      no_trade_mutation: true,
      no_audit_append: true,
      no_record_persisted: true,
    },
  };

  return {
    contractVersion: EXECUTION_RECORD_INSERT_ROUTE_CONTRACT_VERSION,
    method: "POST",
    routePath: "/api/execution/records/insert",
    requestedAt: new Date().toISOString(),
    mode: "dry_run",
    dryRun: true,
    persistenceInput,
    candidate,
    idempotencyKey: candidate.idempotencyKey,
    recordFingerprint: candidate.recordFingerprint,
    sourceFingerprint: candidate.sourceEvidenceFingerprint,
    brokerConfirmation,
    association,
    userContext,
    auditMetadata,
    safetyChecklist,
    clientContext: {
      expectedUserId: userContext.userId,
      expectedAccountId: userContext.accountId,
      requestId,
    },
    metadata: {
      source: "execution_handoff_preview_modal",
      dry_run_route_preview: true,
      read_only: true,
      no_supabase_write: true,
      no_trade_mutation: true,
      no_audit_append: true,
      no_record_persisted: true,
    },
  };
}

export function useLatePhasePreviewState({
  avanzaDryRunRequestPreview,
  executionDevToolsEnabled,
  selectedIntent,
}: UseLatePhasePreviewStateInput) {
  const [
    localhostBrokerConfirmationCaptureResult,
    setLocalhostBrokerConfirmationCaptureResult,
  ] = useState<LocalhostBridgeClientBrokerConfirmationCaptureResult | null>(
    null,
  );
  const [
    isLocalhostBrokerConfirmationCaptureRunning,
    setIsLocalhostBrokerConfirmationCaptureRunning,
  ] = useState(false);
  const [
    localhostBrokerConfirmationCaptureMessage,
    setLocalhostBrokerConfirmationCaptureMessage,
  ] = useState("");
  const [
    localhostBrokerExecutionConversionState,
    setLocalhostBrokerExecutionConversionState,
  ] = useState<{
    eligibilityResult: LocalhostBridgeClientBrokerExecutionResultEligibilityResult | null;
    isEligibilityRunning: boolean;
    eligibilityMessage: string;
    previewResult: LocalhostBridgeClientBrokerExecutionResultPreviewResult | null;
    isPreviewRunning: boolean;
    previewMessage: string;
  }>({
    eligibilityResult: null,
    isEligibilityRunning: false,
    eligibilityMessage: "",
    previewResult: null,
    isPreviewRunning: false,
    previewMessage: "",
  });
  const [
    localhostExecutionRecordEligibilityState,
    setLocalhostExecutionRecordEligibilityState,
  ] = useState<{
    result: LocalhostBridgeClientExecutionRecordEligibilityResult | null;
    isRunning: boolean;
    message: string;
  }>({
    result: null,
    isRunning: false,
    message: "",
  });
  const [
    executionRecordInsertDryRunPreviewState,
    setExecutionRecordInsertDryRunPreviewState,
  ] = useState<{
    result: ExecutionRecordInsertRouteResponse | null;
    isRunning: boolean;
    message: string;
  }>({
    result: null,
    isRunning: false,
    message: "",
  });
  const [
    mappedBrokerExecutionResultCandidatePreviewState,
    setMappedBrokerExecutionResultCandidatePreviewState,
  ] = useState<{
    result: EvidenceToBrokerExecutionResultMapperResult | null;
    isRunning: boolean;
    message: string;
  }>({
    result: null,
    isRunning: false,
    message: "",
  });
  const [
    finalSettlementNoteMatchPreviewState,
    setFinalSettlementNoteMatchPreviewState,
  ] = useState<{
    result: FinalSettlementNoteMatchingResult | null;
    isRunning: boolean;
    message: string;
  }>({
    result: null,
    isRunning: false,
    message: "",
  });
  const [
    finalizationCandidatePreviewState,
    setFinalizationCandidatePreviewState,
  ] = useState<{
    result: FinalizationCandidateBuilderResult | null;
    isRunning: boolean;
    message: string;
  }>({
    result: null,
    isRunning: false,
    message: "",
  });
  const [
    finalizationActionPreviewState,
    setFinalizationActionPreviewState,
  ] = useState<{
    result: FinalizationActionDevFixtureResult | null;
    isRunning: boolean;
    message: string;
  }>({
    result: null,
    isRunning: false,
    message: "",
  });
  const [
    finalizationExecutionRecordBridgePreviewState,
    setFinalizationExecutionRecordBridgePreviewState,
  ] = useState<{
    result: FinalizationExecutionRecordBridgeDevFixtureResult | null;
    isRunning: boolean;
    message: string;
  }>({
    result: null,
    isRunning: false,
    message: "",
  });
  const [
    executionRecordCandidateBuilderIntegrationPreviewState,
    setExecutionRecordCandidateBuilderIntegrationPreviewState,
  ] = useState<{
    result: ExecutionRecordCandidateBuilderIntegrationDevFixtureResult | null;
    isRunning: boolean;
    message: string;
  }>({
    result: null,
    isRunning: false,
    message: "",
  });

  const canCheckLocalhostBrokerConfirmationCapture =
    executionDevToolsEnabled &&
    avanzaDryRunRequestPreview?.ok === true &&
    Boolean(avanzaDryRunRequestPreview.request) &&
    !isLocalhostBrokerConfirmationCaptureRunning;

  const localhostBrokerExecutionEligibilityResult =
    localhostBrokerExecutionConversionState.eligibilityResult;
  const isLocalhostBrokerExecutionEligibilityRunning =
    localhostBrokerExecutionConversionState.isEligibilityRunning;
  const localhostBrokerExecutionEligibilityMessage =
    localhostBrokerExecutionConversionState.eligibilityMessage;
  const localhostBrokerExecutionPreviewResult =
    localhostBrokerExecutionConversionState.previewResult;
  const isLocalhostBrokerExecutionPreviewRunning =
    localhostBrokerExecutionConversionState.isPreviewRunning;
  const localhostBrokerExecutionPreviewMessage =
    localhostBrokerExecutionConversionState.previewMessage;
  const localhostExecutionRecordEligibilityResult =
    localhostExecutionRecordEligibilityState.result;
  const isLocalhostExecutionRecordEligibilityRunning =
    localhostExecutionRecordEligibilityState.isRunning;
  const localhostExecutionRecordEligibilityMessage =
    localhostExecutionRecordEligibilityState.message;
  const canCheckLocalhostBrokerExecutionEligibility =
    executionDevToolsEnabled && !isLocalhostBrokerExecutionEligibilityRunning;
  const canCheckLocalhostBrokerExecutionPreview =
    executionDevToolsEnabled && !isLocalhostBrokerExecutionPreviewRunning;
  const canCheckLocalhostExecutionRecordEligibility =
    executionDevToolsEnabled && !isLocalhostExecutionRecordEligibilityRunning;

  const localhostBrokerConfirmationCapture =
    localhostBrokerConfirmationCaptureResult?.response
      ?.brokerConfirmationCapture ?? null;
  const localhostBrokerConfirmationCaptureHasRun = Boolean(
    localhostBrokerConfirmationCapture,
  );
  const localhostBrokerConfirmationCaptured =
    localhostBrokerConfirmationCapture?.ok === true &&
    localhostBrokerConfirmationCapture.status === "confirmation_captured";
  const localhostBrokerConfirmationPartial =
    localhostBrokerConfirmationCapture?.status === "confirmation_partial";
  const localhostBrokerConfirmationMismatch =
    localhostBrokerConfirmationCapture?.status === "confirmation_mismatch";
  const localhostBrokerConfirmationRejectedOrCancelled =
    localhostBrokerConfirmationCapture?.status ===
    "confirmation_rejected_or_cancelled";
  const localhostBrokerConfirmationBlocked =
    localhostBrokerConfirmationCapture?.status === "blocked" ||
    localhostBrokerConfirmationCapture?.status === "failed" ||
    localhostBrokerConfirmationCapture?.status ===
      "manual_confirmation_not_observed" ||
    localhostBrokerConfirmationCapture?.status ===
      "confirmation_page_not_found";
  const localhostBrokerConfirmationNoBrowserActions =
    localhostBrokerConfirmationCaptureResult?.response?.metadata
      ?.no_browser_actions_executed === true;
  const localhostBrokerConfirmationNoAvanzaTouched =
    localhostBrokerConfirmationCaptureResult?.response?.metadata
      ?.no_avanza_page_touched === true;
  const localhostBrokerConfirmationNoBekrafta =
    localhostBrokerConfirmationCapture?.metadata?.noBekraftaByAgent === true ||
    localhostBrokerConfirmationCaptureResult?.response?.metadata
      ?.no_bekrafta_clicked === true;
  const localhostBrokerConfirmationNoBrokerExecutionResult =
    localhostBrokerConfirmationCapture?.metadata
      ?.noBrokerExecutionResult === true ||
    localhostBrokerConfirmationCaptureResult?.response?.metadata
      ?.no_broker_execution_result_created === true;
  const localhostBrokerConfirmationNoExecutionRecord =
    localhostBrokerConfirmationCapture?.metadata?.noExecutionRecord === true ||
    localhostBrokerConfirmationCaptureResult?.response?.metadata
      ?.no_execution_record_created === true;
  const localhostBrokerConfirmationNoSupabaseWrite =
    localhostBrokerConfirmationCapture?.metadata?.noSupabaseWrite === true ||
    localhostBrokerConfirmationCaptureResult?.response?.metadata
      ?.no_supabase_write === true;
  const localhostBrokerConfirmationNoTradeMutation =
    localhostBrokerConfirmationCapture?.metadata?.noTradeMutation === true ||
    localhostBrokerConfirmationCaptureResult?.response?.metadata
      ?.no_trade_mutation === true;

  const localhostBrokerExecutionEligibility =
    localhostBrokerExecutionEligibilityResult?.response?.eligibility ?? null;
  const localhostBrokerExecutionEligibilityHasRun = Boolean(
    localhostBrokerExecutionEligibility,
  );
  const localhostBrokerExecutionEligible =
    localhostBrokerExecutionEligibility?.ok === true &&
    localhostBrokerExecutionEligibility.status === "eligible";
  const localhostBrokerExecutionPartialOnly =
    localhostBrokerExecutionEligibility?.status === "partial_only";
  const localhostBrokerExecutionDuplicateRisk =
    localhostBrokerExecutionEligibility?.status === "duplicate_risk";
  const localhostBrokerExecutionNotEligible =
    localhostBrokerExecutionEligibility?.status === "not_eligible";
  const localhostBrokerExecutionEligibilityBlocked =
    localhostBrokerExecutionEligibility?.status === "blocked";
  const localhostBrokerExecutionEligibilityFailed =
    localhostBrokerExecutionEligibility?.status === "failed";
  const localhostBrokerExecutionEligibilityNoBrokerExecutionResult =
    localhostBrokerExecutionEligibility?.metadata
      ?.noBrokerExecutionResultCreated === true ||
    localhostBrokerExecutionEligibilityResult?.response?.metadata
      ?.no_broker_execution_result_created === true;
  const localhostBrokerExecutionEligibilityNoExecutionRecord =
    localhostBrokerExecutionEligibility?.metadata?.noExecutionRecordCreated ===
      true ||
    localhostBrokerExecutionEligibilityResult?.response?.metadata
      ?.no_execution_record_created === true;
  const localhostBrokerExecutionEligibilityNoSupabaseWrite =
    localhostBrokerExecutionEligibility?.metadata?.noSupabaseWrite === true ||
    localhostBrokerExecutionEligibilityResult?.response?.metadata
      ?.no_supabase_write === true;
  const localhostBrokerExecutionEligibilityNoTradeMutation =
    localhostBrokerExecutionEligibility?.metadata?.noTradeMutation === true ||
    localhostBrokerExecutionEligibilityResult?.response?.metadata
      ?.no_trade_mutation === true;

  const localhostBrokerExecutionPreview =
    localhostBrokerExecutionPreviewResult?.response
      ?.brokerExecutionResultPreview ?? null;
  const localhostBrokerExecutionPreviewShape =
    localhostBrokerExecutionPreview?.preview ?? null;
  const localhostBrokerExecutionPreviewHasRun = Boolean(
    localhostBrokerExecutionPreview,
  );
  const localhostBrokerExecutionPreviewAvailable =
    localhostBrokerExecutionPreview?.ok === true &&
    localhostBrokerExecutionPreview.status === "preview_available";
  const localhostBrokerExecutionPreviewPartialOnly =
    localhostBrokerExecutionPreview?.status === "partial_only";
  const localhostBrokerExecutionPreviewDuplicateRisk =
    localhostBrokerExecutionPreview?.status === "duplicate_risk";
  const localhostBrokerExecutionPreviewNotEligible =
    localhostBrokerExecutionPreview?.status === "not_eligible";
  const localhostBrokerExecutionPreviewBlocked =
    localhostBrokerExecutionPreview?.status === "blocked";
  const localhostBrokerExecutionPreviewFailed =
    localhostBrokerExecutionPreview?.status === "failed";
  const localhostBrokerExecutionPreviewNoRealBrokerExecutionResult =
    localhostBrokerExecutionPreview?.metadata?.notBrokerExecutionResult ===
      true ||
    localhostBrokerExecutionPreviewShape?.metadata?.notBrokerExecutionResult ===
      true ||
    localhostBrokerExecutionPreviewResult?.response?.metadata
      ?.no_real_broker_execution_result_created === true;
  const localhostBrokerExecutionPreviewNoExecutionRecord =
    localhostBrokerExecutionPreview?.metadata?.noExecutionRecord === true ||
    localhostBrokerExecutionPreviewShape?.metadata?.noExecutionRecord ===
      true ||
    localhostBrokerExecutionPreviewResult?.response?.metadata
      ?.no_execution_record_created === true;
  const localhostBrokerExecutionPreviewNoSupabaseWrite =
    localhostBrokerExecutionPreview?.metadata?.noSupabaseWrite === true ||
    localhostBrokerExecutionPreviewShape?.metadata?.noSupabaseWrite === true ||
    localhostBrokerExecutionPreviewResult?.response?.metadata
      ?.no_supabase_write === true;
  const localhostBrokerExecutionPreviewNoTradeMutation =
    localhostBrokerExecutionPreview?.metadata?.noTradeMutation === true ||
    localhostBrokerExecutionPreviewShape?.metadata?.noTradeMutation === true ||
    localhostBrokerExecutionPreviewResult?.response?.metadata
      ?.no_trade_mutation === true;

  const executionRecordEligibilityCandidate: ExecutionRecordCandidate | null =
    localhostBrokerExecutionPreviewShape
      ? {
          action: localhostBrokerExecutionPreviewShape.action,
          broker: localhostBrokerExecutionPreviewShape.broker,
          brokerOrderId: localhostBrokerExecutionPreviewShape.brokerOrderId,
          currency: localhostBrokerExecutionPreviewShape.currency,
          fees: localhostBrokerExecutionPreviewShape.fees,
          instrumentName: localhostBrokerExecutionPreviewShape.instrumentName,
          instrumentType: localhostBrokerExecutionPreviewShape.instrumentType,
          market: localhostBrokerExecutionPreviewShape.market,
          metadata: {
            ...(localhostBrokerExecutionPreviewShape.metadata.metadata ?? {}),
            noExecutionRecord:
              localhostBrokerExecutionPreviewShape.metadata.noExecutionRecord,
            noSupabaseWrite:
              localhostBrokerExecutionPreviewShape.metadata.noSupabaseWrite,
            noTradeMutation:
              localhostBrokerExecutionPreviewShape.metadata.noTradeMutation,
            notBrokerExecutionResult:
              localhostBrokerExecutionPreviewShape.metadata
                .notBrokerExecutionResult,
            previewOnly:
              localhostBrokerExecutionPreviewShape.metadata.previewOnly,
          },
          price: localhostBrokerExecutionPreviewShape.price,
          quantity: localhostBrokerExecutionPreviewShape.quantity,
          sourceBrokerResultFingerprint:
            localhostBrokerExecutionPreviewShape.sourceCaptureFingerprint,
          sourceCaptureId:
            localhostBrokerExecutionPreviewShape.sourceCaptureId,
          sourceEvidenceFingerprint:
            localhostBrokerExecutionPreviewShape.sourceCaptureFingerprint,
          sourceRequestId:
            localhostBrokerExecutionPreviewShape.sourceRequestId,
          status: localhostBrokerExecutionPreviewShape.orderStatus,
          ticker: localhostBrokerExecutionPreviewShape.ticker,
          timestamp: localhostBrokerExecutionPreviewShape.timestamp,
          totalAmount: localhostBrokerExecutionPreviewShape.totalAmount,
          warnings: localhostBrokerExecutionPreviewShape.warnings,
        }
      : null;
  const executionRecordEligibilityCandidateIsPreviewOnly =
    executionRecordEligibilityCandidate?.metadata?.previewOnly === true ||
    executionRecordEligibilityCandidate?.metadata?.notBrokerExecutionResult ===
      true;
  const executionRecordCreationPreview = useMemo(() => {
    if (!executionDevToolsEnabled || !selectedIntent) {
      return null;
    }

    const packageSnapshot = selectedIntent.trading_package;
    if (!localhostBrokerExecutionPreviewShape) {
      return {
        result: buildExecutionRecordCandidate(
          buildExecutionRecordCreationDevFixtureInput({
            action: selectedIntent.action,
            executionMode: selectedIntent.mode,
            handoffSessionId: selectedIntent.intent_id,
            livePositionId: packageSnapshot.live_position_id,
            market: packageSnapshot.market,
            payloadFingerprint: packageSnapshot.payload_fingerprint,
            payloadId: packageSnapshot.payload_id,
            quantity: packageSnapshot.quantity,
            recommendationId: packageSnapshot.recommendation_id,
            ticker: packageSnapshot.ticker,
          }),
        ),
        sourceDescription:
          "Dev fixture candidate for read-only UI coverage only. Not broker evidence. No persistence or trade mutation.",
        sourceLabel: "Dev fixture candidate",
      };
    }

    const sourceFingerprint =
      localhostBrokerExecutionPreviewShape.sourceCaptureFingerprint;
    const sourceRequestId =
      localhostBrokerExecutionPreviewShape.sourceRequestId ?? null;
    const sourceCaptureId =
      localhostBrokerExecutionPreviewShape.sourceCaptureId ?? null;
    const executionPhase =
      localhostBrokerExecutionPreviewShape.action === "buy" ? "entry" : "exit";
    const creationInput: ExecutionRecordCreationInput = {
      contractVersion: EXECUTION_RECORD_CREATION_CONTRACT_VERSION,
      requestedAt:
        localhostBrokerExecutionPreviewShape.timestamp ??
        localhostBrokerExecutionPreviewResult?.response?.completedAt ??
        localhostBrokerExecutionPreviewResult?.response?.receivedAt ??
        "",
      sourceEnvironment: "local_dev",
      executionMode: selectedIntent.mode,
      executionPhase,
      expectedAction: localhostBrokerExecutionPreviewShape.action,
      expectedInstrument: {
        ticker: packageSnapshot.ticker,
        name: localhostBrokerExecutionPreviewShape.instrumentName ?? null,
        market:
          localhostBrokerExecutionPreviewShape.market ??
          packageSnapshot.market ??
          null,
        currency: localhostBrokerExecutionPreviewShape.currency ?? null,
        instrumentType:
          localhostBrokerExecutionPreviewShape.instrumentType ?? null,
      },
      expectedQuantity: packageSnapshot.quantity,
      expectedPositionId: packageSnapshot.live_position_id,
      recommendationId: packageSnapshot.recommendation_id,
      positionId: packageSnapshot.live_position_id,
      sourceBrokerExecutionResult: {
        broker: localhostBrokerExecutionPreviewShape.broker,
        status: localhostBrokerExecutionPreviewShape.orderStatus,
        side: localhostBrokerExecutionPreviewShape.action,
        ticker: localhostBrokerExecutionPreviewShape.ticker,
        instrumentName: localhostBrokerExecutionPreviewShape.instrumentName,
        market: localhostBrokerExecutionPreviewShape.market,
        currency: localhostBrokerExecutionPreviewShape.currency,
        instrumentType: localhostBrokerExecutionPreviewShape.instrumentType,
        filledQuantity: localhostBrokerExecutionPreviewShape.quantity,
        averageFillPrice: localhostBrokerExecutionPreviewShape.price,
        grossAmount: localhostBrokerExecutionPreviewShape.totalAmount,
        netAmount: localhostBrokerExecutionPreviewShape.totalAmount,
        fees: localhostBrokerExecutionPreviewShape.fees,
        brokerOrderId: localhostBrokerExecutionPreviewShape.brokerOrderId,
        confirmationTimestamp: localhostBrokerExecutionPreviewShape.timestamp,
        metadata: {
          ...localhostBrokerExecutionPreviewShape.metadata.metadata,
          previewOnly:
            localhostBrokerExecutionPreviewShape.metadata.previewOnly,
          notBrokerExecutionResult:
            localhostBrokerExecutionPreviewShape.metadata
              .notBrokerExecutionResult,
          noSupabaseWrite:
            localhostBrokerExecutionPreviewShape.metadata.noSupabaseWrite,
          noTradeMutation:
            localhostBrokerExecutionPreviewShape.metadata.noTradeMutation,
          noBrokerExecution: true,
          noAvanzaAutomation: true,
        },
      },
      brokerMetadata: {
        broker: "avanza",
        brokerOrderId:
          localhostBrokerExecutionPreviewShape.brokerOrderId ?? null,
        confirmationTimestamp:
          localhostBrokerExecutionPreviewShape.timestamp ?? "",
      },
      idempotency: {
        idempotencyKey: sourceFingerprint,
        sourceEvidenceFingerprint: sourceFingerprint,
        brokerResultFingerprint: sourceFingerprint,
        handoffPayloadFingerprint: packageSnapshot.payload_fingerprint,
        captureId: sourceCaptureId,
        requestId: sourceRequestId,
      },
      auditContext: {
        handoffSessionId: selectedIntent.intent_id,
        payloadId: packageSnapshot.payload_id,
        sourceEventIds: [],
        sourceCaptureStatus:
          localhostBrokerExecutionPreviewShape.metadata.captureStatus,
        sourceOrderStatus: localhostBrokerExecutionPreviewShape.orderStatus,
        createdBy: "dev_stub",
        isSynthetic: false,
        isDevOnly: false,
        isMock: false,
      },
      planningSnapshotRef: packageSnapshot.payload_id
        ? {
            snapshotId: packageSnapshot.payload_id,
            snapshotVersion: packageSnapshot.package_version,
          }
        : null,
      existingTradeRef: {
        positionId: packageSnapshot.live_position_id,
        recommendationId: packageSnapshot.recommendation_id,
        ticker: packageSnapshot.ticker,
      },
    };

    return {
      result: buildExecutionRecordCandidate(creationInput),
      sourceDescription:
        "Derived from broker-result preview-shaped diagnostics. Preview-only sources should remain blocked.",
      sourceLabel: "Broker-result preview diagnostics",
    };
  }, [
    executionDevToolsEnabled,
    localhostBrokerExecutionPreviewResult?.response?.completedAt,
    localhostBrokerExecutionPreviewResult?.response?.receivedAt,
    localhostBrokerExecutionPreviewShape,
    selectedIntent,
  ]);
  const executionRecordCreationPreviewResult =
    executionRecordCreationPreview?.result ?? null;
  const executionRecordCreationPreviewSourceDescription =
    executionRecordCreationPreview?.sourceDescription;
  const executionRecordCreationPreviewSourceLabel =
    executionRecordCreationPreview?.sourceLabel;
  const executionRecordInsertDryRunRequest = useMemo(() => {
    const candidate = executionRecordCreationPreviewResult?.recordCandidate;

    if (!executionDevToolsEnabled || !selectedIntent || !candidate) {
      return null;
    }

    return buildDryRunInsertRouteRequest({
      candidate,
      candidateSafeToPersist:
        executionRecordCreationPreviewResult.safeToPersist === true,
      requestId: `execution_record_insert_dry_run_ui_${selectedIntent.intent_id}`,
      sourceEventIds: [`execution_handoff_preview_${selectedIntent.intent_id}`],
    });
  }, [
    executionDevToolsEnabled,
    executionRecordCreationPreviewResult,
    selectedIntent,
  ]);
  const executionRecordInsertDryRunUnavailableReason =
    executionDevToolsEnabled && !executionRecordInsertDryRunRequest
      ? "Dry-run route preview unavailable until a safe sandbox execution record request is available."
      : null;
  const canRunExecutionRecordInsertDryRun =
    executionDevToolsEnabled &&
    Boolean(executionRecordInsertDryRunRequest) &&
    !executionRecordInsertDryRunPreviewState.isRunning;
  const mappedBrokerExecutionResultCandidatePreviewUnavailableReason =
    executionDevToolsEnabled
      ? null
      : "Mapped candidate preview is hidden unless execution dev tools are enabled.";
  const canRunMappedBrokerExecutionResultCandidatePreview =
    executionDevToolsEnabled &&
    !mappedBrokerExecutionResultCandidatePreviewState.isRunning;
  const finalSettlementNoteMatchPreviewUnavailableReason =
    executionDevToolsEnabled
      ? null
      : "Final settlement note match preview is hidden unless execution dev tools are enabled.";
  const canRunFinalSettlementNoteMatchPreview =
    executionDevToolsEnabled && !finalSettlementNoteMatchPreviewState.isRunning;
  const finalizationCandidatePreviewUnavailableReason =
    executionDevToolsEnabled
      ? null
      : "Finalization candidate preview is hidden unless execution dev tools are enabled.";
  const canRunFinalizationCandidatePreview =
    executionDevToolsEnabled && !finalizationCandidatePreviewState.isRunning;
  const finalizationActionPreviewUnavailableReason =
    executionDevToolsEnabled
      ? null
      : "Finalization action dry-run preview is hidden unless execution dev tools are enabled.";
  const canRunFinalizationActionPreview =
    executionDevToolsEnabled && !finalizationActionPreviewState.isRunning;
  const finalizationExecutionRecordBridgePreviewUnavailableReason =
    executionDevToolsEnabled
      ? null
      : "Execution-record bridge preview is hidden unless execution dev tools are enabled.";
  const canRunFinalizationExecutionRecordBridgePreview =
    executionDevToolsEnabled &&
    !finalizationExecutionRecordBridgePreviewState.isRunning;
  const executionRecordCandidateBuilderIntegrationPreviewUnavailableReason =
    executionDevToolsEnabled
      ? null
      : "Execution-record candidate builder integration preview is hidden unless execution dev tools are enabled.";
  const canRunExecutionRecordCandidateBuilderIntegrationPreview =
    executionDevToolsEnabled &&
    !executionRecordCandidateBuilderIntegrationPreviewState.isRunning;

  const localhostExecutionRecordEligibility =
    localhostExecutionRecordEligibilityResult?.response
      ?.executionRecordEligibility ?? null;
  const localhostExecutionRecordEligibilityHasRun = Boolean(
    localhostExecutionRecordEligibility,
  );
  const localhostExecutionRecordEligible =
    localhostExecutionRecordEligibility?.ok === true &&
    localhostExecutionRecordEligibility.status === "eligible";
  const localhostExecutionRecordDuplicateRisk =
    localhostExecutionRecordEligibility?.status === "duplicate_risk";
  const localhostExecutionRecordNotEligible =
    localhostExecutionRecordEligibility?.status === "not_eligible";
  const localhostExecutionRecordBlocked =
    localhostExecutionRecordEligibility?.status === "blocked";
  const localhostExecutionRecordFailed =
    localhostExecutionRecordEligibility?.status === "failed";
  const localhostExecutionRecordNoBrokerExecutionResult =
    localhostExecutionRecordEligibilityResult?.response?.metadata
      ?.no_broker_execution_result_created === true;
  const localhostExecutionRecordNoExecutionRecord =
    localhostExecutionRecordEligibility?.metadata?.noExecutionRecordCreated ===
      true ||
    localhostExecutionRecordEligibilityResult?.response?.metadata
      ?.no_execution_record_created === true;
  const localhostExecutionRecordNoSupabaseWrite =
    localhostExecutionRecordEligibility?.metadata?.noSupabaseWrite === true ||
    localhostExecutionRecordEligibilityResult?.response?.metadata
      ?.no_supabase_write === true;
  const localhostExecutionRecordNoTradeMutation =
    localhostExecutionRecordEligibility?.metadata?.noTradeMutation === true ||
    localhostExecutionRecordEligibilityResult?.response?.metadata
      ?.no_trade_mutation === true;

  async function checkLocalhostBrokerConfirmationCaptureStub() {
    setLocalhostBrokerConfirmationCaptureMessage("");
    setLocalhostBrokerConfirmationCaptureResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostBrokerConfirmationCaptureMessage(
        "Broker confirmation capture preview is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    if (!avanzaDryRunRequestPreview?.ok || !avanzaDryRunRequestPreview.request) {
      setLocalhostBrokerConfirmationCaptureMessage(
        "Unavailable: invalid dry-run request.",
      );
      return;
    }

    if (!selectedIntent) {
      setLocalhostBrokerConfirmationCaptureMessage(
        "Broker-confirmation-capture stub check requires a selected execution intent.",
      );
      return;
    }

    setIsLocalhostBrokerConfirmationCaptureRunning(true);

    try {
      const brokerConfirmationCaptureResult =
        await checkLocalhostBridgeBrokerConfirmationCapture({
          dryRunOrderInput: avanzaDryRunRequestPreview.request,
          requestId: `localhost_broker_confirmation_capture_stub_${selectedIntent.intent_id}`,
          metadata: {
            source: "execution_handoff_preview_modal",
            read_only_response_preview: true,
            stub_only: true,
            real_broker_confirmation_capture_requires_user_confirmed_unverified:
              true,
            manual_confirmation_wait_preview_available: false,
            no_browser_actions_requested: true,
            no_avanza_session: true,
            no_avanza_page_touched: true,
            no_bekrafta_clicked: true,
            no_order_submission: true,
            no_broker_execution_result_created: true,
            no_execution_record_created: true,
            no_supabase_write: true,
            no_trade_mutation: true,
            sanitized_evidence_only: true,
          },
        });

      setLocalhostBrokerConfirmationCaptureResult(
        brokerConfirmationCaptureResult,
      );
      setLocalhostBrokerConfirmationCaptureMessage(
        brokerConfirmationCaptureResult.ok
          ? "Broker-confirmation-capture stub response normalized. No browser control, Avanza page touch, Bekrafta click, BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred."
          : "Broker-confirmation-capture stub finished safely with blockers or errors. No browser control, Avanza page touch, Bekrafta click, BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred.",
      );
    } catch (error) {
      setLocalhostBrokerConfirmationCaptureMessage(
        error instanceof Error
          ? `Broker-confirmation-capture stub check failed safely: ${error.message}`
          : "Broker-confirmation-capture stub check failed safely. No browser control, Avanza page touch, Bekrafta click, BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred.",
      );
    } finally {
      setIsLocalhostBrokerConfirmationCaptureRunning(false);
    }
  }

  async function checkLocalhostBrokerExecutionEligibilityStub() {
    setLocalhostBrokerExecutionConversionState((current) => ({
      ...current,
      eligibilityResult: null,
      eligibilityMessage: "",
    }));

    if (!executionDevToolsEnabled) {
      setLocalhostBrokerExecutionConversionState((current) => ({
        ...current,
        eligibilityMessage:
          "BrokerExecutionResult eligibility preview is hidden unless execution dev tools are enabled.",
      }));
      return;
    }

    if (!selectedIntent) {
      setLocalhostBrokerExecutionConversionState((current) => ({
        ...current,
        eligibilityMessage:
          "BrokerExecutionResult eligibility stub check requires a selected execution intent.",
      }));
      return;
    }

    let preflightMessage = "";
    if (!localhostBrokerConfirmationCapture) {
      preflightMessage =
        "Real eligibility requires broker confirmation capture evidence. This stub check may still return synthetic local metadata; no BrokerExecutionResult, execution record, Supabase write, or trade mutation will occur.";
    }

    setLocalhostBrokerExecutionConversionState((current) => ({
      ...current,
      eligibilityResult: null,
      isEligibilityRunning: true,
      eligibilityMessage: preflightMessage,
    }));

    try {
      const eligibilityResult =
        await checkLocalhostBridgeBrokerExecutionResultEligibility({
          captureResult: localhostBrokerConfirmationCapture ?? undefined,
          requestId: `localhost_broker_execution_result_eligibility_stub_${selectedIntent.intent_id}`,
          metadata: {
            source: "execution_handoff_preview_modal",
            read_only_response_preview: true,
            stub_only: true,
            real_eligibility_requires_broker_confirmation_capture:
              !localhostBrokerConfirmationCapture,
            eligibility_check_only: true,
            no_browser_actions_requested: true,
            no_avanza_session: true,
            no_avanza_page_touched: true,
            no_broker_execution_result_created: true,
            no_execution_record_created: true,
            no_supabase_write: true,
            no_trade_mutation: true,
          },
        });

      const normalizedMessage = eligibilityResult.ok
        ? "BrokerExecutionResult eligibility stub response normalized. No BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred."
        : "BrokerExecutionResult eligibility stub finished safely with blockers or errors. No BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred.";

      setLocalhostBrokerExecutionConversionState((current) => ({
        ...current,
        eligibilityResult,
        isEligibilityRunning: false,
        eligibilityMessage: preflightMessage
          ? `${preflightMessage} ${normalizedMessage}`
          : normalizedMessage,
      }));
    } catch (error) {
      setLocalhostBrokerExecutionConversionState((current) => ({
        ...current,
        eligibilityResult: null,
        isEligibilityRunning: false,
        eligibilityMessage:
          error instanceof Error
            ? `BrokerExecutionResult eligibility stub check failed safely: ${error.message}`
            : "BrokerExecutionResult eligibility stub check failed safely. No BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred.",
      }));
    }
  }

  async function checkLocalhostBrokerExecutionPreviewStub() {
    setLocalhostBrokerExecutionConversionState((current) => ({
      ...current,
      previewResult: null,
      previewMessage: "",
    }));

    if (!executionDevToolsEnabled) {
      setLocalhostBrokerExecutionConversionState((current) => ({
        ...current,
        previewMessage:
          "BrokerExecutionResult conversion preview is hidden unless execution dev tools are enabled.",
      }));
      return;
    }

    if (!selectedIntent) {
      setLocalhostBrokerExecutionConversionState((current) => ({
        ...current,
        previewMessage:
          "BrokerExecutionResult preview stub check requires a selected execution intent.",
      }));
      return;
    }

    let preflightMessage = "";
    if (
      !localhostBrokerConfirmationCapture &&
      !localhostBrokerExecutionEligibility
    ) {
      preflightMessage =
        "Real preview conversion requires eligible broker confirmation capture evidence. This stub check may still return synthetic local metadata; no real BrokerExecutionResult, execution record, Supabase write, or trade mutation will occur.";
    }

    setLocalhostBrokerExecutionConversionState((current) => ({
      ...current,
      previewResult: null,
      isPreviewRunning: true,
      previewMessage: preflightMessage,
    }));

    try {
      const previewResult =
        await checkLocalhostBridgeBrokerExecutionResultPreview({
          captureResult: localhostBrokerConfirmationCapture ?? undefined,
          eligibilityResult:
            localhostBrokerExecutionEligibility ?? undefined,
          requestId: `localhost_broker_execution_result_preview_stub_${selectedIntent.intent_id}`,
          metadata: {
            source: "execution_handoff_preview_modal",
            read_only_response_preview: true,
            stub_only: true,
            preview_only: true,
            real_preview_requires_eligible_broker_confirmation_capture:
              !localhostBrokerConfirmationCapture ||
              !localhostBrokerExecutionEligible,
            no_browser_actions_requested: true,
            no_avanza_session: true,
            no_avanza_page_touched: true,
            no_real_broker_execution_result_created: true,
            no_execution_record_created: true,
            no_supabase_write: true,
            no_trade_mutation: true,
          },
        });

      const normalizedMessage = previewResult.ok
        ? "BrokerExecutionResult preview stub response normalized. Preview only; no real BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred."
        : "BrokerExecutionResult preview stub finished safely with blockers or errors. No real BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred.";

      setLocalhostBrokerExecutionConversionState((current) => ({
        ...current,
        previewResult,
        isPreviewRunning: false,
        previewMessage: preflightMessage
          ? `${preflightMessage} ${normalizedMessage}`
          : normalizedMessage,
      }));
    } catch (error) {
      setLocalhostBrokerExecutionConversionState((current) => ({
        ...current,
        previewResult: null,
        isPreviewRunning: false,
        previewMessage:
          error instanceof Error
            ? `BrokerExecutionResult preview stub check failed safely: ${error.message}`
            : "BrokerExecutionResult preview stub check failed safely. No real BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred.",
      }));
    }
  }

  async function checkLocalhostExecutionRecordEligibilityStub() {
    setLocalhostExecutionRecordEligibilityState({
      result: null,
      isRunning: false,
      message: "",
    });

    if (!executionDevToolsEnabled) {
      setLocalhostExecutionRecordEligibilityState({
        result: null,
        isRunning: false,
        message:
          "Execution record eligibility preview is hidden unless execution dev tools are enabled.",
      });
      return;
    }

    if (!selectedIntent) {
      setLocalhostExecutionRecordEligibilityState({
        result: null,
        isRunning: false,
        message:
          "Execution record eligibility stub check requires a selected execution intent.",
      });
      return;
    }

    const preflightMessages: string[] = [];

    if (!executionRecordEligibilityCandidate) {
      preflightMessages.push(
        "Real execution-record eligibility requires a non-preview BrokerExecutionResult candidate. This stub check may still return synthetic local metadata.",
      );
    } else if (executionRecordEligibilityCandidateIsPreviewOnly) {
      preflightMessages.push(
        "Latest BrokerExecutionResult-shaped candidate is preview-only; default eligibility should block it unless the stub synthesizes a safe eligible response.",
      );
    }

    setLocalhostExecutionRecordEligibilityState({
      result: null,
      isRunning: true,
      message: preflightMessages.join(" "),
    });

    try {
      const eligibilityResult =
        await checkLocalhostBridgeExecutionRecordEligibility({
          candidate: executionRecordEligibilityCandidate ?? undefined,
          requestId: `localhost_execution_record_eligibility_stub_${selectedIntent.intent_id}`,
          metadata: {
            source: "execution_handoff_preview_modal",
            read_only_response_preview: true,
            stub_only: true,
            execution_record_eligibility_check_only: true,
            real_eligibility_requires_non_preview_broker_result_candidate:
              !executionRecordEligibilityCandidate ||
              executionRecordEligibilityCandidateIsPreviewOnly,
            no_browser_actions_requested: true,
            no_avanza_session: true,
            no_avanza_page_touched: true,
            no_broker_execution_result_created: true,
            no_execution_record_created: true,
            no_supabase_write: true,
            no_trade_mutation: true,
          },
        });

      const normalizedMessage = eligibilityResult.ok
        ? "Execution record eligibility stub response normalized. No BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred."
        : "Execution record eligibility stub finished safely with blockers or errors. No BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred.";

      setLocalhostExecutionRecordEligibilityState({
        result: eligibilityResult,
        isRunning: false,
        message: preflightMessages.length
          ? `${preflightMessages.join(" ")} ${normalizedMessage}`
          : normalizedMessage,
      });
    } catch (error) {
      setLocalhostExecutionRecordEligibilityState({
        result: null,
        isRunning: false,
        message:
          error instanceof Error
            ? `Execution record eligibility stub check failed safely: ${error.message}`
            : "Execution record eligibility stub check failed safely. No BrokerExecutionResult, execution record, Supabase write, or trade mutation occurred.",
      });
    }
  }

  async function runExecutionRecordInsertDryRunPreview() {
    setExecutionRecordInsertDryRunPreviewState((current) => ({
      ...current,
      message: "",
      result: null,
    }));

    if (!executionDevToolsEnabled) {
      setExecutionRecordInsertDryRunPreviewState({
        result: null,
        isRunning: false,
        message:
          "Execution record insert dry-run preview is hidden unless execution dev tools are enabled.",
      });
      return;
    }

    if (!executionRecordInsertDryRunRequest) {
      setExecutionRecordInsertDryRunPreviewState({
        result: null,
        isRunning: false,
        message:
          "Dry-run route preview unavailable until a safe sandbox execution record request is available.",
      });
      return;
    }

    setExecutionRecordInsertDryRunPreviewState({
      result: null,
      isRunning: true,
      message:
        "Running dry-run route preview. No Supabase write, audit append, trade mutation, or record persistence will occur.",
    });

    try {
      const result = await requestExecutionRecordInsertDryRun(
        executionRecordInsertDryRunRequest,
      );

      setExecutionRecordInsertDryRunPreviewState({
        result,
        isRunning: false,
        message:
          result.status === "dry_run"
            ? "Dry-run route preview completed. No execution record was created."
            : "Dry-run route preview finished safely with validation metadata. No execution record was created.",
      });
    } catch (error) {
      setExecutionRecordInsertDryRunPreviewState({
        result: null,
        isRunning: false,
        message:
          error instanceof Error
            ? `Dry-run route preview failed safely: ${error.message}`
            : "Dry-run route preview failed safely. No write, mutation, or audit append occurred.",
      });
    }
  }

  function runMappedBrokerExecutionResultCandidatePreview() {
    setMappedBrokerExecutionResultCandidatePreviewState({
      result: null,
      isRunning: false,
      message: "",
    });

    if (!executionDevToolsEnabled) {
      setMappedBrokerExecutionResultCandidatePreviewState({
        result: null,
        isRunning: false,
        message:
          "Mapped candidate preview is hidden unless execution dev tools are enabled.",
      });
      return;
    }

    setMappedBrokerExecutionResultCandidatePreviewState({
      result: null,
      isRunning: true,
      message:
        "Running mapped candidate preview from controlled dev fixture data only. No live broker data, persistence, audit append, trade mutation, browser, or Avanza behavior will occur.",
    });

    try {
      const result =
        buildMappedBrokerExecutionResultCandidateDevFixtureResult();

      setMappedBrokerExecutionResultCandidatePreviewState({
        result,
        isRunning: false,
        message:
          result.status === "mapped_candidate"
            ? "Mapped candidate preview completed from controlled dev fixture data. No runtime BrokerExecutionResult, execution record, persistence, audit append, trade mutation, browser, or Avanza behavior occurred."
            : "Mapped candidate preview finished safely with validation metadata. No runtime BrokerExecutionResult, execution record, persistence, audit append, trade mutation, browser, or Avanza behavior occurred.",
      });
    } catch (error) {
      setMappedBrokerExecutionResultCandidatePreviewState({
        result: null,
        isRunning: false,
        message:
          error instanceof Error
            ? `Mapped candidate preview failed safely: ${error.message}`
            : "Mapped candidate preview failed safely. No runtime BrokerExecutionResult, execution record, persistence, audit append, trade mutation, browser, or Avanza behavior occurred.",
      });
    }
  }

  function runFinalSettlementNoteMatchPreview() {
    setFinalSettlementNoteMatchPreviewState({
      result: null,
      isRunning: false,
      message: "",
    });

    if (!executionDevToolsEnabled) {
      setFinalSettlementNoteMatchPreviewState({
        result: null,
        isRunning: false,
        message:
          "Final settlement note match preview is hidden unless execution dev tools are enabled.",
      });
      return;
    }

    setFinalSettlementNoteMatchPreviewState({
      result: null,
      isRunning: true,
      message:
        "Running final note match preview from controlled fixture data only. No live Avanza data, capture, persistence, finalization, execution-record creation, audit append, trade mutation, browser, or Avanza behavior will occur.",
    });

    try {
      const result = buildFinalSettlementNoteMatchDevFixtureResult();

      setFinalSettlementNoteMatchPreviewState({
        result,
        isRunning: false,
        message:
          result.status === "matched"
            ? "Final note match preview completed from controlled fixture data. No finalization, persistence, execution record, audit append, trade mutation, browser, or Avanza behavior occurred."
            : "Final note match preview finished safely with review metadata. No finalization, persistence, execution record, audit append, trade mutation, browser, or Avanza behavior occurred.",
      });
    } catch (error) {
      setFinalSettlementNoteMatchPreviewState({
        result: null,
        isRunning: false,
        message:
          error instanceof Error
            ? `Final note match preview failed safely: ${error.message}`
            : "Final note match preview failed safely. No finalization, persistence, execution record, audit append, trade mutation, browser, or Avanza behavior occurred.",
      });
    }
  }

  function runFinalizationCandidatePreview() {
    setFinalizationCandidatePreviewState({
      result: null,
      isRunning: false,
      message: "",
    });

    if (!executionDevToolsEnabled) {
      setFinalizationCandidatePreviewState({
        result: null,
        isRunning: false,
        message:
          "Finalization candidate preview is hidden unless execution dev tools are enabled.",
      });
      return;
    }

    setFinalizationCandidatePreviewState({
      result: null,
      isRunning: true,
      message:
        "Running finalization candidate preview from controlled fixture data only. No live Avanza data, capture, browser automation, finalization, persistence, execution-record creation, audit append, stats/PnL update, or trade mutation will occur.",
    });

    try {
      const result = buildFinalizationCandidateDevFixtureResult();

      setFinalizationCandidatePreviewState({
        result,
        isRunning: false,
        message:
          result.status === "candidate_built"
            ? "Finalization candidate preview completed from controlled fixture data. Candidate metadata only; no finalization, persistence, execution record, audit append, stats/PnL update, trade mutation, browser, or Avanza behavior occurred."
            : "Finalization candidate preview finished safely with review metadata. Candidate metadata only; no finalization, persistence, execution record, audit append, stats/PnL update, trade mutation, browser, or Avanza behavior occurred.",
      });
    } catch (error) {
      setFinalizationCandidatePreviewState({
        result: null,
        isRunning: false,
        message:
          error instanceof Error
            ? `Finalization candidate preview failed safely: ${error.message}`
            : "Finalization candidate preview failed safely. No finalization, persistence, execution record, audit append, stats/PnL update, trade mutation, browser, or Avanza behavior occurred.",
      });
    }
  }

  function runFinalizationActionPreview() {
    setFinalizationActionPreviewState({
      result: null,
      isRunning: false,
      message: "",
    });

    if (!executionDevToolsEnabled) {
      setFinalizationActionPreviewState({
        result: null,
        isRunning: false,
        message:
          "Finalization action dry-run preview is hidden unless execution dev tools are enabled.",
      });
      return;
    }

    setFinalizationActionPreviewState({
      result: null,
      isRunning: true,
      message:
        "Running finalization action dry-run preview from controlled fixture data only. No live Avanza data, capture, browser automation, action execution, finalization, persistence, execution-record creation, audit append, stats/PnL update, rollback/correction, or trade mutation will occur.",
    });

    try {
      const result = buildFinalizationActionDevFixtureResult();

      setFinalizationActionPreviewState({
        result,
        isRunning: false,
        message:
          result.dryRunResult.status === "dry_run_ready"
            ? "Finalization action dry-run preview completed from controlled fixture data. Proposed impacts only; no action execution, finalization, persistence, execution record, audit append, stats/PnL update, rollback/correction, trade mutation, browser, or Avanza behavior occurred."
            : "Finalization action dry-run preview finished safely with review metadata. Proposed impacts only; no action execution, finalization, persistence, execution record, audit append, stats/PnL update, rollback/correction, trade mutation, browser, or Avanza behavior occurred.",
      });
    } catch (error) {
      setFinalizationActionPreviewState({
        result: null,
        isRunning: false,
        message:
          error instanceof Error
            ? `Finalization action dry-run preview failed safely: ${error.message}`
            : "Finalization action dry-run preview failed safely. No action execution, finalization, persistence, execution record, audit append, stats/PnL update, rollback/correction, trade mutation, browser, or Avanza behavior occurred.",
      });
    }
  }

  function runFinalizationExecutionRecordBridgePreview() {
    setFinalizationExecutionRecordBridgePreviewState({
      result: null,
      isRunning: false,
      message: "",
    });

    if (!executionDevToolsEnabled) {
      setFinalizationExecutionRecordBridgePreviewState({
        result: null,
        isRunning: false,
        message:
          "Execution-record bridge preview is hidden unless execution dev tools are enabled.",
      });
      return;
    }

    setFinalizationExecutionRecordBridgePreviewState({
      result: null,
      isRunning: true,
      message:
        "Running execution-record bridge preview from controlled fixture data only. No live Avanza data, capture, browser automation, candidate builder, execution-record creation, persistence, audit append, stats/PnL update, rollback/correction, trade mutation, broker, or order behavior will occur.",
    });

    try {
      const result =
        buildFinalizationExecutionRecordBridgeDevFixtureResult();

      setFinalizationExecutionRecordBridgePreviewState({
        result,
        isRunning: false,
        message:
          result.validatorResult.status === "bridge_validation_valid"
            ? "Execution-record bridge preview completed from controlled fixture data. Mapper and validator metadata only; no candidate builder, execution-record creation, persistence, audit append, stats/PnL update, rollback/correction, trade mutation, browser, Avanza, broker, or order behavior occurred."
            : "Execution-record bridge preview finished safely with validation metadata. No candidate builder, execution-record creation, persistence, audit append, stats/PnL update, rollback/correction, trade mutation, browser, Avanza, broker, or order behavior occurred.",
      });
    } catch (error) {
      setFinalizationExecutionRecordBridgePreviewState({
        result: null,
        isRunning: false,
        message:
          error instanceof Error
            ? `Execution-record bridge preview failed safely: ${error.message}`
            : "Execution-record bridge preview failed safely. No candidate builder, execution-record creation, persistence, audit append, stats/PnL update, rollback/correction, trade mutation, browser, Avanza, broker, or order behavior occurred.",
      });
    }
  }

  function runExecutionRecordCandidateBuilderIntegrationPreview() {
    setExecutionRecordCandidateBuilderIntegrationPreviewState({
      result: null,
      isRunning: false,
      message: "",
    });

    if (!executionDevToolsEnabled) {
      setExecutionRecordCandidateBuilderIntegrationPreviewState({
        result: null,
        isRunning: false,
        message:
          "Execution-record candidate builder integration preview is hidden unless execution dev tools are enabled.",
      });
      return;
    }

    setExecutionRecordCandidateBuilderIntegrationPreviewState({
      result: null,
      isRunning: true,
      message:
        "Running fixture-only candidate builder integration preview. No builder, candidate, record, persistence, audit, stats, rollback, trade, browser, Avanza, broker, or order behavior will run.",
    });

    try {
      const result =
        buildExecutionRecordCandidateBuilderIntegrationDevFixtureResult();

      setExecutionRecordCandidateBuilderIntegrationPreviewState({
        result,
        isRunning: false,
        message:
          "Candidate builder integration preview completed from controlled fixture data. Pure adapter and pure validator only; buildExecutionRecordCandidate(...) was not called and no execution-record candidate, record, persistence, audit, stats, rollback, trade mutation, browser, Avanza, broker, or order behavior occurred.",
      });
    } catch (error) {
      setExecutionRecordCandidateBuilderIntegrationPreviewState({
        result: null,
        isRunning: false,
        message:
          error instanceof Error
            ? `Candidate builder integration preview failed safely: ${error.message}`
            : "Candidate builder integration preview failed safely. No builder, candidate, record, persistence, audit, stats, rollback, trade mutation, browser, Avanza, broker, or order behavior occurred.",
      });
    }
  }

  return {
    canRunMappedBrokerExecutionResultCandidatePreview,
    canRunExecutionRecordCandidateBuilderIntegrationPreview,
    canRunFinalSettlementNoteMatchPreview,
    canRunFinalizationCandidatePreview,
    canRunFinalizationActionPreview,
    canRunFinalizationExecutionRecordBridgePreview,
    canCheckLocalhostBrokerConfirmationCapture,
    canCheckLocalhostBrokerExecutionEligibility,
    canCheckLocalhostBrokerExecutionPreview,
    canCheckLocalhostExecutionRecordEligibility,
    canRunExecutionRecordInsertDryRun,
    checkLocalhostBrokerConfirmationCaptureStub,
    checkLocalhostBrokerExecutionEligibilityStub,
    checkLocalhostBrokerExecutionPreviewStub,
    checkLocalhostExecutionRecordEligibilityStub,
    executionRecordEligibilityCandidate,
    executionRecordEligibilityCandidateIsPreviewOnly,
    executionRecordCreationPreviewResult,
    executionRecordCreationPreviewSourceDescription,
    executionRecordCreationPreviewSourceLabel,
    executionRecordInsertDryRunMessage:
      executionRecordInsertDryRunPreviewState.message,
    executionRecordInsertDryRunResult:
      executionRecordInsertDryRunPreviewState.result,
    executionRecordInsertDryRunUnavailableReason,
    executionRecordCandidateBuilderIntegrationPreviewMessage:
      executionRecordCandidateBuilderIntegrationPreviewState.message,
    executionRecordCandidateBuilderIntegrationPreviewResult:
      executionRecordCandidateBuilderIntegrationPreviewState.result,
    executionRecordCandidateBuilderIntegrationPreviewUnavailableReason,
    mappedBrokerExecutionResultCandidatePreviewMessage:
      mappedBrokerExecutionResultCandidatePreviewState.message,
    mappedBrokerExecutionResultCandidatePreviewResult:
      mappedBrokerExecutionResultCandidatePreviewState.result,
    mappedBrokerExecutionResultCandidatePreviewUnavailableReason,
    finalSettlementNoteMatchPreviewMessage:
      finalSettlementNoteMatchPreviewState.message,
    finalSettlementNoteMatchPreviewResult:
      finalSettlementNoteMatchPreviewState.result,
    finalSettlementNoteMatchPreviewUnavailableReason,
    finalizationCandidatePreviewMessage:
      finalizationCandidatePreviewState.message,
    finalizationCandidatePreviewResult:
      finalizationCandidatePreviewState.result,
    finalizationCandidatePreviewUnavailableReason,
    finalizationActionPreviewMessage:
      finalizationActionPreviewState.message,
    finalizationActionPreviewResult:
      finalizationActionPreviewState.result,
    finalizationActionPreviewUnavailableReason,
    finalizationExecutionRecordBridgePreviewMessage:
      finalizationExecutionRecordBridgePreviewState.message,
    finalizationExecutionRecordBridgePreviewResult:
      finalizationExecutionRecordBridgePreviewState.result,
    finalizationExecutionRecordBridgePreviewUnavailableReason,
    isLocalhostBrokerConfirmationCaptureRunning,
    isLocalhostBrokerExecutionEligibilityRunning,
    isLocalhostBrokerExecutionPreviewRunning,
    isLocalhostExecutionRecordEligibilityRunning,
    isExecutionRecordInsertDryRunRunning:
      executionRecordInsertDryRunPreviewState.isRunning,
    isExecutionRecordCandidateBuilderIntegrationPreviewRunning:
      executionRecordCandidateBuilderIntegrationPreviewState.isRunning,
    isMappedBrokerExecutionResultCandidatePreviewRunning:
      mappedBrokerExecutionResultCandidatePreviewState.isRunning,
    isFinalSettlementNoteMatchPreviewRunning:
      finalSettlementNoteMatchPreviewState.isRunning,
    isFinalizationCandidatePreviewRunning:
      finalizationCandidatePreviewState.isRunning,
    isFinalizationActionPreviewRunning:
      finalizationActionPreviewState.isRunning,
    isFinalizationExecutionRecordBridgePreviewRunning:
      finalizationExecutionRecordBridgePreviewState.isRunning,
    localhostBrokerConfirmationBlocked,
    localhostBrokerConfirmationCapture,
    localhostBrokerConfirmationCaptured,
    localhostBrokerConfirmationCaptureHasRun,
    localhostBrokerConfirmationCaptureMessage,
    localhostBrokerConfirmationCaptureResult,
    localhostBrokerConfirmationMismatch,
    localhostBrokerConfirmationNoAvanzaTouched,
    localhostBrokerConfirmationNoBekrafta,
    localhostBrokerConfirmationNoBrokerExecutionResult,
    localhostBrokerConfirmationNoBrowserActions,
    localhostBrokerConfirmationNoExecutionRecord,
    localhostBrokerConfirmationNoSupabaseWrite,
    localhostBrokerConfirmationNoTradeMutation,
    localhostBrokerConfirmationPartial,
    localhostBrokerConfirmationRejectedOrCancelled,
    localhostBrokerExecutionDuplicateRisk,
    localhostBrokerExecutionEligibility,
    localhostBrokerExecutionEligibilityBlocked,
    localhostBrokerExecutionEligibilityFailed,
    localhostBrokerExecutionEligibilityHasRun,
    localhostBrokerExecutionEligibilityMessage,
    localhostBrokerExecutionEligibilityNoBrokerExecutionResult,
    localhostBrokerExecutionEligibilityNoExecutionRecord,
    localhostBrokerExecutionEligibilityNoSupabaseWrite,
    localhostBrokerExecutionEligibilityNoTradeMutation,
    localhostBrokerExecutionEligibilityResult,
    localhostBrokerExecutionEligible,
    localhostBrokerExecutionNotEligible,
    localhostBrokerExecutionPartialOnly,
    localhostBrokerExecutionPreview,
    localhostBrokerExecutionPreviewAvailable,
    localhostBrokerExecutionPreviewBlocked,
    localhostBrokerExecutionPreviewDuplicateRisk,
    localhostBrokerExecutionPreviewFailed,
    localhostBrokerExecutionPreviewHasRun,
    localhostBrokerExecutionPreviewMessage,
    localhostBrokerExecutionPreviewNoExecutionRecord,
    localhostBrokerExecutionPreviewNoRealBrokerExecutionResult,
    localhostBrokerExecutionPreviewNoSupabaseWrite,
    localhostBrokerExecutionPreviewNoTradeMutation,
    localhostBrokerExecutionPreviewNotEligible,
    localhostBrokerExecutionPreviewPartialOnly,
    localhostBrokerExecutionPreviewResult,
    localhostBrokerExecutionPreviewShape,
    localhostExecutionRecordBlocked,
    localhostExecutionRecordDuplicateRisk,
    localhostExecutionRecordEligibility,
    localhostExecutionRecordEligibilityHasRun,
    localhostExecutionRecordEligibilityMessage,
    localhostExecutionRecordEligibilityResult,
    localhostExecutionRecordEligible,
    localhostExecutionRecordFailed,
    localhostExecutionRecordNoBrokerExecutionResult,
    localhostExecutionRecordNoExecutionRecord,
    localhostExecutionRecordNoSupabaseWrite,
    localhostExecutionRecordNoTradeMutation,
    localhostExecutionRecordNotEligible,
    runExecutionRecordCandidateBuilderIntegrationPreview,
    runExecutionRecordInsertDryRunPreview,
    runFinalizationActionPreview,
    runFinalizationExecutionRecordBridgePreview,
    runFinalSettlementNoteMatchPreview,
    runFinalizationCandidatePreview,
    runMappedBrokerExecutionResultCandidatePreview,
  };
}
