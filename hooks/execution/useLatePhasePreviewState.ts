"use client";

import { useState } from "react";

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
import type { ExecutionRecordCandidate } from "@/lib/execution-record-eligibility";

export type UseLatePhasePreviewStateInput = {
  avanzaDryRunRequestPreview: ExecutionIntentToAvanzaDryRunResult | null;
  executionDevToolsEnabled: boolean;
  selectedIntent: ExecutionIntent | null;
};

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

  return {
    canCheckLocalhostBrokerConfirmationCapture,
    canCheckLocalhostBrokerExecutionEligibility,
    canCheckLocalhostBrokerExecutionPreview,
    canCheckLocalhostExecutionRecordEligibility,
    checkLocalhostBrokerConfirmationCaptureStub,
    checkLocalhostBrokerExecutionEligibilityStub,
    checkLocalhostBrokerExecutionPreviewStub,
    checkLocalhostExecutionRecordEligibilityStub,
    executionRecordEligibilityCandidate,
    executionRecordEligibilityCandidateIsPreviewOnly,
    isLocalhostBrokerConfirmationCaptureRunning,
    isLocalhostBrokerExecutionEligibilityRunning,
    isLocalhostBrokerExecutionPreviewRunning,
    isLocalhostExecutionRecordEligibilityRunning,
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
  };
}
