"use client";

import { useState } from "react";

import {
  checkLocalhostBridgeInstrumentVerification,
  checkLocalhostBridgeSearchOnly,
  checkLocalhostBridgeSessionDetection,
  type LocalhostBridgeClientInstrumentVerificationResult,
  type LocalhostBridgeClientSearchOnlyResult,
  type LocalhostBridgeClientSessionDetectionResult,
} from "@/lib/avanza-localhost-bridge-client";
import type { ExecutionIntent } from "@/lib/execution";
import type { ExecutionIntentToAvanzaDryRunResult } from "@/lib/execution-intent-to-avanza-dry-run";

export type UseEarlyPhasePreviewStateInput = {
  avanzaDryRunRequestPreview: ExecutionIntentToAvanzaDryRunResult | null;
  executionDevToolsEnabled: boolean;
  selectedIntent: ExecutionIntent | null;
};

export function useEarlyPhasePreviewState({
  avanzaDryRunRequestPreview,
  executionDevToolsEnabled,
  selectedIntent,
}: UseEarlyPhasePreviewStateInput) {
  const [
    localhostSessionDetectionResult,
    setLocalhostSessionDetectionResult,
  ] = useState<LocalhostBridgeClientSessionDetectionResult | null>(null);
  const [
    isLocalhostSessionDetectionRunning,
    setIsLocalhostSessionDetectionRunning,
  ] = useState(false);
  const [
    localhostSessionDetectionMessage,
    setLocalhostSessionDetectionMessage,
  ] = useState("");
  const [
    localhostSearchOnlyResult,
    setLocalhostSearchOnlyResult,
  ] = useState<LocalhostBridgeClientSearchOnlyResult | null>(null);
  const [
    isLocalhostSearchOnlyRunning,
    setIsLocalhostSearchOnlyRunning,
  ] = useState(false);
  const [
    localhostSearchOnlyMessage,
    setLocalhostSearchOnlyMessage,
  ] = useState("");
  const [
    localhostInstrumentVerificationResult,
    setLocalhostInstrumentVerificationResult,
  ] = useState<LocalhostBridgeClientInstrumentVerificationResult | null>(null);
  const [
    isLocalhostInstrumentVerificationRunning,
    setIsLocalhostInstrumentVerificationRunning,
  ] = useState(false);
  const [
    localhostInstrumentVerificationMessage,
    setLocalhostInstrumentVerificationMessage,
  ] = useState("");

  const avanzaSearchOnlyExpectedInstrument =
    avanzaDryRunRequestPreview?.request?.instrument ?? null;
  const avanzaSearchOnlyExpectedInstrumentValid = Boolean(
    avanzaSearchOnlyExpectedInstrument?.ticker,
  );
  const canCheckLocalhostSessionDetection =
    executionDevToolsEnabled && !isLocalhostSessionDetectionRunning;
  const canCheckLocalhostSearchOnly =
    executionDevToolsEnabled &&
    avanzaSearchOnlyExpectedInstrumentValid &&
    !isLocalhostSearchOnlyRunning;
  const canCheckLocalhostInstrumentVerification =
    executionDevToolsEnabled &&
    avanzaSearchOnlyExpectedInstrumentValid &&
    !isLocalhostInstrumentVerificationRunning;

  const localhostSessionDetection =
    localhostSessionDetectionResult?.response?.sessionDetection ?? null;
  const localhostSessionDetectionHasRun = Boolean(localhostSessionDetection);
  const localhostSessionDetectionReadyForSearchOnly =
    localhostSessionDetection?.ok === true &&
    localhostSessionDetection.status === "ready_for_search_only";
  const localhostSessionDetectionNoBrowserActions =
    localhostSessionDetection?.metadata?.noBrowserActions === true ||
    localhostSessionDetectionResult?.response?.metadata
      ?.no_browser_actions_executed === true;
  const localhostSessionDetectionNoAvanzaTouched =
    localhostSessionDetectionResult?.response?.metadata
      ?.no_avanza_page_touched === true;

  const localhostSearchOnly =
    localhostSearchOnlyResult?.response?.searchOnly ?? null;
  const localhostSearchOnlyHasRun = Boolean(localhostSearchOnly);
  const localhostSearchOnlyExactMatch =
    localhostSearchOnly?.ok === true &&
    localhostSearchOnly.status === "exact_match";
  const localhostSearchOnlyAmbiguous =
    localhostSearchOnly?.status === "ambiguous";
  const localhostSearchOnlyNoMatch = localhostSearchOnly?.status === "no_match";
  const localhostSearchOnlyBlocked =
    localhostSearchOnly?.status === "blocked" ||
    localhostSearchOnly?.status === "failed";
  const localhostSearchOnlyNoBrowserActions =
    localhostSearchOnlyResult?.response?.metadata
      ?.no_browser_actions_executed === true;
  const localhostSearchOnlyNoAvanzaTouched =
    localhostSearchOnlyResult?.response?.metadata
      ?.no_avanza_page_touched === true;
  const localhostSearchOnlyNoOrderPageOpened =
    localhostSearchOnlyResult?.response?.metadata
      ?.no_order_page_opened === true ||
    localhostSearchOnly?.metadata?.noOrderPage === true;
  const localhostSearchOnlyNoBrokerSubmission =
    localhostSearchOnly?.metadata?.noBrokerSubmission === true ||
    localhostSearchOnlyResult?.response?.metadata?.no_broker_submission === true;

  const localhostInstrumentVerification =
    localhostInstrumentVerificationResult?.response?.instrumentVerification ??
    null;
  const localhostInstrumentVerificationHasRun = Boolean(
    localhostInstrumentVerification,
  );
  const localhostInstrumentVerified =
    localhostInstrumentVerification?.ok === true &&
    localhostInstrumentVerification.status === "verified";
  const localhostInstrumentRejected =
    localhostInstrumentVerification?.status === "rejected";
  const localhostInstrumentAmbiguous =
    localhostInstrumentVerification?.status === "ambiguous";
  const localhostInstrumentBlocked =
    localhostInstrumentVerification?.status === "blocked" ||
    localhostInstrumentVerification?.status === "failed";
  const localhostInstrumentNoBrowserActions =
    localhostInstrumentVerificationResult?.response?.metadata
      ?.no_browser_actions_executed === true;
  const localhostInstrumentNoAvanzaTouched =
    localhostInstrumentVerificationResult?.response?.metadata
      ?.no_avanza_page_touched === true;
  const localhostInstrumentNoOrderPageOpened =
    localhostInstrumentVerificationResult?.response?.metadata
      ?.no_order_page_opened === true ||
    localhostInstrumentVerification?.metadata?.noOrderPage === true;
  const localhostInstrumentNoBrokerSubmission =
    localhostInstrumentVerification?.metadata?.noBrokerSubmission === true ||
    localhostInstrumentVerificationResult?.response?.metadata
      ?.no_broker_submission === true;
  const localhostInstrumentNoFormFill =
    localhostInstrumentVerification?.metadata?.noFormFill === true;

  async function checkLocalhostSessionDetectionStub() {
    setLocalhostSessionDetectionMessage("");
    setLocalhostSessionDetectionResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostSessionDetectionMessage(
        "Session-detection preview is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    setIsLocalhostSessionDetectionRunning(true);

    try {
      const sessionDetectionResult =
        await checkLocalhostBridgeSessionDetection();

      setLocalhostSessionDetectionResult(sessionDetectionResult);
      setLocalhostSessionDetectionMessage(
        sessionDetectionResult.ok
          ? "Session-detection stub returned readiness metadata. No browser control or Avanza page touch occurred."
          : "Session-detection stub finished safely with blockers or errors. No browser control or Avanza page touch occurred.",
      );
    } catch (error) {
      setLocalhostSessionDetectionMessage(
        error instanceof Error
          ? `Session-detection stub check failed safely: ${error.message}`
          : "Session-detection stub check failed safely. No browser control or Avanza page touch occurred.",
      );
    } finally {
      setIsLocalhostSessionDetectionRunning(false);
    }
  }

  async function checkLocalhostSearchOnlyStub() {
    setLocalhostSearchOnlyMessage("");
    setLocalhostSearchOnlyResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostSearchOnlyMessage(
        "Search-only preview is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    const expectedInstrument =
      avanzaDryRunRequestPreview?.request?.instrument ?? null;

    if (!expectedInstrument?.ticker) {
      setLocalhostSearchOnlyMessage(
        "Unavailable: invalid expected instrument.",
      );
      return;
    }

    if (!selectedIntent) {
      setLocalhostSearchOnlyMessage(
        "Search-only stub check requires a selected execution intent.",
      );
      return;
    }

    setIsLocalhostSearchOnlyRunning(true);

    try {
      const searchOnlyResult = await checkLocalhostBridgeSearchOnly({
        expectedInstrument: {
          ticker: expectedInstrument.ticker,
          name: expectedInstrument.name,
          market: expectedInstrument.market,
          currency: expectedInstrument.currency,
          instrumentType: expectedInstrument.instrumentType,
        },
        requestId: `localhost_search_only_stub_${selectedIntent.intent_id}`,
        sessionDetection: localhostSessionDetection ?? undefined,
        metadata: {
          source: "execution_handoff_preview_modal",
          read_only_response_preview: true,
          stub_only: true,
          no_browser_actions_requested: true,
          no_avanza_session: true,
          no_order_page: true,
          no_buy_sell_click: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      });

      setLocalhostSearchOnlyResult(searchOnlyResult);
      setLocalhostSearchOnlyMessage(
        searchOnlyResult.ok
          ? "Search-only stub response normalized. No browser control, Avanza page touch, order page, or broker submission occurred."
          : "Search-only stub finished safely with blockers or errors. No browser control, Avanza page touch, order page, or broker submission occurred.",
      );
    } catch (error) {
      setLocalhostSearchOnlyMessage(
        error instanceof Error
          ? `Search-only stub check failed safely: ${error.message}`
          : "Search-only stub check failed safely. No browser control, Avanza page touch, order page, or broker submission occurred.",
      );
    } finally {
      setIsLocalhostSearchOnlyRunning(false);
    }
  }

  async function checkLocalhostInstrumentVerificationStub() {
    setLocalhostInstrumentVerificationMessage("");
    setLocalhostInstrumentVerificationResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostInstrumentVerificationMessage(
        "Instrument verification preview is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    const expectedInstrument =
      avanzaDryRunRequestPreview?.request?.instrument ?? null;

    if (!expectedInstrument?.ticker) {
      setLocalhostInstrumentVerificationMessage(
        "Unavailable: invalid expected instrument.",
      );
      return;
    }

    if (!selectedIntent) {
      setLocalhostInstrumentVerificationMessage(
        "Instrument-verification stub check requires a selected execution intent.",
      );
      return;
    }

    setIsLocalhostInstrumentVerificationRunning(true);

    try {
      const hasExactSearchCandidate =
        localhostSearchOnlyExactMatch &&
        Boolean(localhostSearchOnly?.selectedCandidate);
      const instrumentVerificationResult =
        await checkLocalhostBridgeInstrumentVerification({
          expectedInstrument: {
            ticker: expectedInstrument.ticker,
            name: expectedInstrument.name,
            market: expectedInstrument.market,
            currency: expectedInstrument.currency,
            instrumentType: expectedInstrument.instrumentType,
          },
          requestId: `localhost_instrument_verification_stub_${selectedIntent.intent_id}`,
          searchOnlyResult: hasExactSearchCandidate
            ? localhostSearchOnly
            : undefined,
          selectedCandidate: hasExactSearchCandidate
            ? localhostSearchOnly?.selectedCandidate
            : undefined,
          metadata: {
            source: "execution_handoff_preview_modal",
            read_only_response_preview: true,
            stub_only: true,
            search_only_exact_candidate_available: hasExactSearchCandidate,
            real_verification_requires_exact_search_only_candidate:
              !hasExactSearchCandidate,
            no_browser_actions_requested: true,
            no_avanza_session: true,
            no_order_page: true,
            no_buy_sell_click: true,
            no_form_fill: true,
            no_broker_submission: true,
            no_broker_result_created: true,
            no_trade_mutation: true,
          },
        });

      setLocalhostInstrumentVerificationResult(instrumentVerificationResult);
      setLocalhostInstrumentVerificationMessage(
        instrumentVerificationResult.ok
          ? "Instrument-verification stub response normalized. No browser control, Avanza page touch, order page, buy/sell click, form fill, or broker submission occurred."
          : "Instrument-verification stub finished safely with blockers or errors. No browser control, Avanza page touch, order page, buy/sell click, form fill, or broker submission occurred.",
      );
    } catch (error) {
      setLocalhostInstrumentVerificationMessage(
        error instanceof Error
          ? `Instrument-verification stub check failed safely: ${error.message}`
          : "Instrument-verification stub check failed safely. No browser control, Avanza page touch, order page, buy/sell click, form fill, or broker submission occurred.",
      );
    } finally {
      setIsLocalhostInstrumentVerificationRunning(false);
    }
  }

  return {
    avanzaSearchOnlyExpectedInstrument,
    avanzaSearchOnlyExpectedInstrumentValid,
    canCheckLocalhostInstrumentVerification,
    canCheckLocalhostSearchOnly,
    canCheckLocalhostSessionDetection,
    checkLocalhostInstrumentVerificationStub,
    checkLocalhostSearchOnlyStub,
    checkLocalhostSessionDetectionStub,
    isLocalhostInstrumentVerificationRunning,
    isLocalhostSearchOnlyRunning,
    isLocalhostSessionDetectionRunning,
    localhostInstrumentAmbiguous,
    localhostInstrumentBlocked,
    localhostInstrumentNoAvanzaTouched,
    localhostInstrumentNoBrokerSubmission,
    localhostInstrumentNoBrowserActions,
    localhostInstrumentNoFormFill,
    localhostInstrumentNoOrderPageOpened,
    localhostInstrumentRejected,
    localhostInstrumentVerification,
    localhostInstrumentVerificationHasRun,
    localhostInstrumentVerificationMessage,
    localhostInstrumentVerificationResult,
    localhostInstrumentVerified,
    localhostSearchOnly,
    localhostSearchOnlyAmbiguous,
    localhostSearchOnlyBlocked,
    localhostSearchOnlyExactMatch,
    localhostSearchOnlyHasRun,
    localhostSearchOnlyMessage,
    localhostSearchOnlyNoAvanzaTouched,
    localhostSearchOnlyNoBrokerSubmission,
    localhostSearchOnlyNoBrowserActions,
    localhostSearchOnlyNoMatch,
    localhostSearchOnlyNoOrderPageOpened,
    localhostSearchOnlyResult,
    localhostSessionDetection,
    localhostSessionDetectionHasRun,
    localhostSessionDetectionMessage,
    localhostSessionDetectionNoAvanzaTouched,
    localhostSessionDetectionNoBrowserActions,
    localhostSessionDetectionReadyForSearchOnly,
    localhostSessionDetectionResult,
  };
}
