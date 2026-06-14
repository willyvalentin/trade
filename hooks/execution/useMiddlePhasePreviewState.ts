"use client";

import { useState } from "react";

import {
  checkLocalhostBridgeAdvancedFormFill,
  checkLocalhostBridgeInstrumentPage,
  checkLocalhostBridgeOrderPageOpen,
  checkLocalhostBridgeReviewClick,
  type LocalhostBridgeClientAdvancedFormFillResult,
  type LocalhostBridgeClientInstrumentPageResult,
  type LocalhostBridgeClientOrderPageOpenResult,
  type LocalhostBridgeClientReviewClickResult,
} from "@/lib/avanza-localhost-bridge-client";
import type { AvanzaInstrumentVerificationResult } from "@/lib/avanza-instrument-verification-contract";
import type { ExecutionIntent } from "@/lib/execution";
import type { ExecutionIntentToAvanzaDryRunResult } from "@/lib/execution-intent-to-avanza-dry-run";

export type UseMiddlePhasePreviewStateInput = {
  avanzaDryRunRequestPreview: ExecutionIntentToAvanzaDryRunResult | null;
  executionDevToolsEnabled: boolean;
  localhostInstrumentVerification: AvanzaInstrumentVerificationResult | null;
  localhostInstrumentVerified: boolean;
  selectedIntent: ExecutionIntent | null;
};

export function useMiddlePhasePreviewState({
  avanzaDryRunRequestPreview,
  executionDevToolsEnabled,
  localhostInstrumentVerification,
  localhostInstrumentVerified,
  selectedIntent,
}: UseMiddlePhasePreviewStateInput) {
  const [
    localhostInstrumentPageResult,
    setLocalhostInstrumentPageResult,
  ] = useState<LocalhostBridgeClientInstrumentPageResult | null>(null);
  const [
    isLocalhostInstrumentPageRunning,
    setIsLocalhostInstrumentPageRunning,
  ] = useState(false);
  const [
    localhostInstrumentPageMessage,
    setLocalhostInstrumentPageMessage,
  ] = useState("");
  const [
    localhostOrderPageOpenResult,
    setLocalhostOrderPageOpenResult,
  ] = useState<LocalhostBridgeClientOrderPageOpenResult | null>(null);
  const [
    isLocalhostOrderPageOpenRunning,
    setIsLocalhostOrderPageOpenRunning,
  ] = useState(false);
  const [
    localhostOrderPageOpenMessage,
    setLocalhostOrderPageOpenMessage,
  ] = useState("");
  const [
    localhostAdvancedFormFillResult,
    setLocalhostAdvancedFormFillResult,
  ] = useState<LocalhostBridgeClientAdvancedFormFillResult | null>(null);
  const [
    isLocalhostAdvancedFormFillRunning,
    setIsLocalhostAdvancedFormFillRunning,
  ] = useState(false);
  const [
    localhostAdvancedFormFillMessage,
    setLocalhostAdvancedFormFillMessage,
  ] = useState("");
  const [localhostReviewClickResult, setLocalhostReviewClickResult] =
    useState<LocalhostBridgeClientReviewClickResult | null>(null);
  const [isLocalhostReviewClickRunning, setIsLocalhostReviewClickRunning] =
    useState(false);
  const [localhostReviewClickMessage, setLocalhostReviewClickMessage] =
    useState("");

  const avanzaSearchOnlyExpectedInstrument =
    avanzaDryRunRequestPreview?.request?.instrument ?? null;
  const avanzaSearchOnlyExpectedInstrumentValid = Boolean(
    avanzaSearchOnlyExpectedInstrument?.ticker,
  );
  const canCheckLocalhostInstrumentPage =
    executionDevToolsEnabled &&
    avanzaSearchOnlyExpectedInstrumentValid &&
    !isLocalhostInstrumentPageRunning;
  const canCheckLocalhostOrderPageOpen =
    executionDevToolsEnabled &&
    avanzaDryRunRequestPreview?.ok === true &&
    Boolean(avanzaDryRunRequestPreview.request) &&
    !isLocalhostOrderPageOpenRunning;
  const canCheckLocalhostAdvancedFormFill =
    executionDevToolsEnabled &&
    avanzaDryRunRequestPreview?.ok === true &&
    Boolean(avanzaDryRunRequestPreview.request) &&
    !isLocalhostAdvancedFormFillRunning;
  const canCheckLocalhostReviewClick =
    executionDevToolsEnabled &&
    avanzaDryRunRequestPreview?.ok === true &&
    Boolean(avanzaDryRunRequestPreview.request) &&
    !isLocalhostReviewClickRunning;

  const localhostInstrumentPage =
    localhostInstrumentPageResult?.response?.instrumentPage ?? null;
  const localhostInstrumentPageHasRun = Boolean(localhostInstrumentPage);
  const localhostInstrumentPageIdentified =
    localhostInstrumentPage?.ok === true &&
    localhostInstrumentPage.status === "page_identified";
  const localhostInstrumentPageMismatch =
    localhostInstrumentPage?.status === "page_mismatch";
  const localhostInstrumentPageBlocked =
    localhostInstrumentPage?.status === "blocked" ||
    localhostInstrumentPage?.status === "failed";
  const localhostInstrumentPageProhibitedControlsVisible =
    localhostInstrumentPage?.riskFlags.includes(
      "prohibited_buy_button_visible",
    ) === true ||
    localhostInstrumentPage?.riskFlags.includes(
      "prohibited_sell_button_visible",
    ) === true ||
    localhostInstrumentPage?.status === "prohibited_order_controls_detected";
  const localhostInstrumentPageNoBrowserActions =
    localhostInstrumentPageResult?.response?.metadata
      ?.no_browser_actions_executed === true;
  const localhostInstrumentPageNoAvanzaTouched =
    localhostInstrumentPageResult?.response?.metadata
      ?.no_avanza_page_touched === true;
  const localhostInstrumentPageNoOrderPageOpened =
    localhostInstrumentPageResult?.response?.metadata
      ?.no_order_page_opened === true ||
    localhostInstrumentPage?.metadata?.noOrderPage === true;
  const localhostInstrumentPageNoBuySellClick =
    localhostInstrumentPage?.metadata?.noBuySellClick === true ||
    localhostInstrumentPageResult?.response?.metadata?.no_buy_sell_click ===
      true;
  const localhostInstrumentPageNoFormFill =
    localhostInstrumentPage?.metadata?.noFormFill === true ||
    localhostInstrumentPageResult?.response?.metadata?.no_form_fill === true;
  const localhostInstrumentPageNoBrokerSubmission =
    localhostInstrumentPage?.metadata?.noBrokerSubmission === true ||
    localhostInstrumentPageResult?.response?.metadata
      ?.no_broker_submission === true;

  const localhostOrderPageOpen =
    localhostOrderPageOpenResult?.response?.orderPageOpen ?? null;
  const localhostOrderPageOpenHasRun = Boolean(localhostOrderPageOpen);
  const localhostOrderPageOpened =
    localhostOrderPageOpen?.ok === true &&
    localhostOrderPageOpen.status === "order_page_opened";
  const localhostOrderPageWrongAction =
    localhostOrderPageOpen?.status === "wrong_action_opened";
  const localhostOrderPageMismatch =
    localhostOrderPageOpen?.status === "order_page_mismatch";
  const localhostOrderPageBlocked =
    localhostOrderPageOpen?.status === "blocked" ||
    localhostOrderPageOpen?.status === "failed" ||
    localhostOrderPageOpen?.status ===
      "prohibited_form_interaction_detected";
  const localhostOrderPageNoBrowserActions =
    localhostOrderPageOpenResult?.response?.metadata
      ?.no_browser_actions_executed === true;
  const localhostOrderPageNoAvanzaTouched =
    localhostOrderPageOpenResult?.response?.metadata
      ?.no_avanza_page_touched === true;
  const localhostOrderPageNoRealOrderPageOpened =
    localhostOrderPageOpenResult?.response?.metadata
      ?.no_real_order_page_opened === true || localhostOrderPageNoAvanzaTouched;
  const localhostOrderPageNoFormFill =
    localhostOrderPageOpen?.metadata?.noFormFill === true ||
    localhostOrderPageOpenResult?.response?.metadata?.no_form_fill === true;
  const localhostOrderPageNoReviewClick =
    localhostOrderPageOpen?.metadata?.noReviewClick === true ||
    localhostOrderPageOpenResult?.response?.metadata?.no_review_click === true;
  const localhostOrderPageNoFinalConfirmClick =
    localhostOrderPageOpen?.metadata?.noFinalConfirmClick === true ||
    localhostOrderPageOpenResult?.response?.metadata
      ?.no_final_confirm_click === true;
  const localhostOrderPageNoBrokerSubmission =
    localhostOrderPageOpen?.metadata?.noBrokerSubmission === true ||
    localhostOrderPageOpenResult?.response?.metadata
      ?.no_broker_submission === true;

  const localhostAdvancedFormFill =
    localhostAdvancedFormFillResult?.response?.advancedFormFill ?? null;
  const localhostAdvancedFormFillHasRun = Boolean(localhostAdvancedFormFill);
  const localhostAdvancedFormFilled =
    localhostAdvancedFormFill?.ok === true &&
    localhostAdvancedFormFill.status === "form_filled";
  const localhostAdvancedFormFieldMismatch =
    localhostAdvancedFormFill?.status === "field_mismatch";
  const localhostAdvancedFormValidationError =
    localhostAdvancedFormFill?.status === "validation_error";
  const localhostAdvancedFormUnsupportedMode =
    localhostAdvancedFormFill?.status === "unsupported_order_mode";
  const localhostAdvancedFormProhibited =
    localhostAdvancedFormFill?.status === "prohibited_review_detected" ||
    localhostAdvancedFormFill?.status ===
      "prohibited_final_confirm_detected";
  const localhostAdvancedFormBlocked =
    localhostAdvancedFormFill?.status === "blocked" ||
    localhostAdvancedFormFill?.status === "failed" ||
    localhostAdvancedFormProhibited;
  const localhostAdvancedFormNoBrowserActions =
    localhostAdvancedFormFillResult?.response?.metadata
      ?.no_browser_actions_executed === true;
  const localhostAdvancedFormNoAvanzaTouched =
    localhostAdvancedFormFillResult?.response?.metadata
      ?.no_avanza_page_touched === true;
  const localhostAdvancedFormNoRealFormFieldsFilled =
    localhostAdvancedFormFillResult?.response?.metadata
      ?.no_real_form_fields_filled === true;
  const localhostAdvancedFormNoReviewClick =
    localhostAdvancedFormFill?.metadata?.noReviewClick === true ||
    localhostAdvancedFormFillResult?.response?.metadata?.no_review_click ===
      true;
  const localhostAdvancedFormNoFinalConfirmClick =
    localhostAdvancedFormFill?.metadata?.noFinalConfirmClick === true ||
    localhostAdvancedFormFillResult?.response?.metadata
      ?.no_final_confirm_click === true;
  const localhostAdvancedFormNoBrokerSubmission =
    localhostAdvancedFormFill?.metadata?.noBrokerSubmission === true ||
    localhostAdvancedFormFillResult?.response?.metadata
      ?.no_broker_submission === true;

  const localhostReviewClick =
    localhostReviewClickResult?.response?.reviewClick ?? null;
  const localhostReviewClickHasRun = Boolean(localhostReviewClick);
  const localhostReviewClickConfirmationReady =
    localhostReviewClick?.ok === true &&
    localhostReviewClick.status === "confirmation_ready";
  const localhostReviewClickConfirmationMismatch =
    localhostReviewClick?.status === "confirmation_mismatch";
  const localhostReviewClickValidationError =
    localhostReviewClick?.status === "validation_error";
  const localhostReviewClickFinalConfirmBlocked =
    localhostReviewClick?.status === "prohibited_final_confirm_detected";
  const localhostReviewClickBlocked =
    localhostReviewClick?.status === "blocked" ||
    localhostReviewClick?.status === "failed" ||
    localhostReviewClickFinalConfirmBlocked;
  const localhostReviewClickWaitingForManualConfirmation =
    localhostReviewClickConfirmationReady &&
    localhostReviewClick?.metadata?.waitingForManualConfirmation === true;
  const localhostReviewClickNoBrowserActions =
    localhostReviewClickResult?.response?.metadata
      ?.no_browser_actions_executed === true;
  const localhostReviewClickNoAvanzaTouched =
    localhostReviewClickResult?.response?.metadata
      ?.no_avanza_page_touched === true;
  const localhostReviewClickNoRealReviewClick =
    localhostReviewClick?.metadata?.noRealReviewClick === true ||
    localhostReviewClickResult?.response?.metadata
      ?.no_real_granska_clicked === true ||
    localhostReviewClickResult?.response?.metadata?.no_review_click === true;
  const localhostReviewClickNoFinalConfirmClick =
    localhostReviewClick?.metadata?.noFinalConfirmClick === true ||
    localhostReviewClickResult?.response?.metadata
      ?.no_final_confirm_click === true;
  const localhostReviewClickNoBrokerResult =
    localhostReviewClick?.metadata?.noBrokerResult === true ||
    localhostReviewClickResult?.response?.metadata
      ?.no_broker_result_created === true;
  const localhostReviewClickNoTradeMutation =
    localhostReviewClick?.metadata?.noTradeMutation === true ||
    localhostReviewClickResult?.response?.metadata?.no_trade_mutation === true;

  async function checkLocalhostInstrumentPageStub() {
    setLocalhostInstrumentPageMessage("");
    setLocalhostInstrumentPageResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostInstrumentPageMessage(
        "Instrument page preview is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    const expectedInstrument =
      avanzaDryRunRequestPreview?.request?.instrument ?? null;

    if (!expectedInstrument?.ticker) {
      setLocalhostInstrumentPageMessage(
        "Unavailable: invalid expected instrument.",
      );
      return;
    }

    if (!selectedIntent) {
      setLocalhostInstrumentPageMessage(
        "Instrument-page stub check requires a selected execution intent.",
      );
      return;
    }

    setIsLocalhostInstrumentPageRunning(true);

    try {
      const hasVerifiedInstrument =
        localhostInstrumentVerified && Boolean(localhostInstrumentVerification);
      const instrumentPageResult = await checkLocalhostBridgeInstrumentPage({
        expectedInstrument: {
          ticker: expectedInstrument.ticker,
          name: expectedInstrument.name,
          market: expectedInstrument.market,
          currency: expectedInstrument.currency,
          instrumentType: expectedInstrument.instrumentType,
        },
        requestId: `localhost_instrument_page_stub_${selectedIntent.intent_id}`,
        instrumentVerificationResult: hasVerifiedInstrument
          ? localhostInstrumentVerification
          : undefined,
        metadata: {
          source: "execution_handoff_preview_modal",
          read_only_response_preview: true,
          stub_only: true,
          verified_instrument_available: hasVerifiedInstrument,
          real_instrument_page_phase_requires_verified_instrument:
            !hasVerifiedInstrument,
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

      setLocalhostInstrumentPageResult(instrumentPageResult);
      setLocalhostInstrumentPageMessage(
        instrumentPageResult.ok
          ? "Instrument-page stub response normalized. No browser control, Avanza page touch, order page, buy/sell click, form fill, or broker submission occurred."
          : "Instrument-page stub finished safely with blockers or errors. No browser control, Avanza page touch, order page, buy/sell click, form fill, or broker submission occurred.",
      );
    } catch (error) {
      setLocalhostInstrumentPageMessage(
        error instanceof Error
          ? `Instrument-page stub check failed safely: ${error.message}`
          : "Instrument-page stub check failed safely. No browser control, Avanza page touch, order page, buy/sell click, form fill, or broker submission occurred.",
      );
    } finally {
      setIsLocalhostInstrumentPageRunning(false);
    }
  }

  async function checkLocalhostOrderPageOpenStub() {
    setLocalhostOrderPageOpenMessage("");
    setLocalhostOrderPageOpenResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostOrderPageOpenMessage(
        "Order page open preview is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    if (!avanzaDryRunRequestPreview?.ok || !avanzaDryRunRequestPreview.request) {
      setLocalhostOrderPageOpenMessage(
        "Unavailable: invalid dry-run request.",
      );
      return;
    }

    if (!selectedIntent) {
      setLocalhostOrderPageOpenMessage(
        "Order-page-open stub check requires a selected execution intent.",
      );
      return;
    }

    setIsLocalhostOrderPageOpenRunning(true);

    try {
      const hasIdentifiedInstrumentPage =
        localhostInstrumentPageIdentified && Boolean(localhostInstrumentPage);
      const orderPageOpenResult = await checkLocalhostBridgeOrderPageOpen({
        dryRunOrderInput: avanzaDryRunRequestPreview.request,
        requestId: `localhost_order_page_open_stub_${selectedIntent.intent_id}`,
        instrumentPageResult: hasIdentifiedInstrumentPage
          ? localhostInstrumentPage
          : undefined,
        attemptedAction: avanzaDryRunRequestPreview.request.action,
        metadata: {
          source: "execution_handoff_preview_modal",
          read_only_response_preview: true,
          stub_only: true,
          identified_instrument_page_available: hasIdentifiedInstrumentPage,
          real_order_page_open_phase_requires_identified_instrument_page:
            !hasIdentifiedInstrumentPage,
          no_browser_actions_requested: true,
          no_avanza_session: true,
          no_real_order_page_opened: true,
          no_form_fill: true,
          no_review_click: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_trade_mutation: true,
        },
      });

      setLocalhostOrderPageOpenResult(orderPageOpenResult);
      setLocalhostOrderPageOpenMessage(
        orderPageOpenResult.ok
          ? "Order-page-open stub response normalized. No browser control, Avanza page touch, real order page, form fill, Granska, Bekrafta, or broker submission occurred."
          : "Order-page-open stub finished safely with blockers or errors. No browser control, Avanza page touch, real order page, form fill, Granska, Bekrafta, or broker submission occurred.",
      );
    } catch (error) {
      setLocalhostOrderPageOpenMessage(
        error instanceof Error
          ? `Order-page-open stub check failed safely: ${error.message}`
          : "Order-page-open stub check failed safely. No browser control, Avanza page touch, real order page, form fill, Granska, Bekrafta, or broker submission occurred.",
      );
    } finally {
      setIsLocalhostOrderPageOpenRunning(false);
    }
  }

  async function checkLocalhostAdvancedFormFillStub() {
    setLocalhostAdvancedFormFillMessage("");
    setLocalhostAdvancedFormFillResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostAdvancedFormFillMessage(
        "Advanced form-fill preview is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    if (!avanzaDryRunRequestPreview?.ok || !avanzaDryRunRequestPreview.request) {
      setLocalhostAdvancedFormFillMessage(
        "Unavailable: invalid dry-run request.",
      );
      return;
    }

    if (!selectedIntent) {
      setLocalhostAdvancedFormFillMessage(
        "Advanced form-fill stub check requires a selected execution intent.",
      );
      return;
    }

    setIsLocalhostAdvancedFormFillRunning(true);

    try {
      const hasOpenedOrderPage =
        localhostOrderPageOpened && Boolean(localhostOrderPageOpen);
      const advancedFormFillResult =
        await checkLocalhostBridgeAdvancedFormFill({
          dryRunOrderInput: avanzaDryRunRequestPreview.request,
          requestId: `localhost_advanced_form_fill_stub_${selectedIntent.intent_id}`,
          orderPageOpenResult: hasOpenedOrderPage
            ? localhostOrderPageOpen
            : undefined,
          metadata: {
            source: "execution_handoff_preview_modal",
            read_only_response_preview: true,
            stub_only: true,
            opened_order_page_available: hasOpenedOrderPage,
            real_advanced_form_fill_phase_requires_order_page_open:
              !hasOpenedOrderPage,
            no_browser_actions_requested: true,
            no_avanza_session: true,
            no_avanza_page_touched: true,
            no_real_form_fields_filled: true,
            no_review_click: true,
            no_final_confirm_click: true,
            no_broker_submission: true,
            no_broker_result_created: true,
            no_supabase_write: true,
            no_trade_mutation: true,
          },
        });

      setLocalhostAdvancedFormFillResult(advancedFormFillResult);
      setLocalhostAdvancedFormFillMessage(
        advancedFormFillResult.ok
          ? "Advanced form-fill stub response normalized. No browser control, Avanza page touch, real form fields, Granska, Bekrafta, or broker submission occurred."
          : "Advanced form-fill stub finished safely with blockers or errors. No browser control, Avanza page touch, real form fields, Granska, Bekrafta, or broker submission occurred.",
      );
    } catch (error) {
      setLocalhostAdvancedFormFillMessage(
        error instanceof Error
          ? `Advanced form-fill stub check failed safely: ${error.message}`
          : "Advanced form-fill stub check failed safely. No browser control, Avanza page touch, real form fields, Granska, Bekrafta, or broker submission occurred.",
      );
    } finally {
      setIsLocalhostAdvancedFormFillRunning(false);
    }
  }

  async function checkLocalhostReviewClickStub() {
    setLocalhostReviewClickMessage("");
    setLocalhostReviewClickResult(null);

    if (!executionDevToolsEnabled) {
      setLocalhostReviewClickMessage(
        "Review-click preview is hidden unless execution dev tools are enabled.",
      );
      return;
    }

    if (!avanzaDryRunRequestPreview?.ok || !avanzaDryRunRequestPreview.request) {
      setLocalhostReviewClickMessage("Unavailable: invalid dry-run request.");
      return;
    }

    if (!selectedIntent) {
      setLocalhostReviewClickMessage(
        "Review-click stub check requires a selected execution intent.",
      );
      return;
    }

    setIsLocalhostReviewClickRunning(true);

    try {
      const hasFilledAdvancedForm =
        localhostAdvancedFormFilled && Boolean(localhostAdvancedFormFill);
      const reviewClickResult = await checkLocalhostBridgeReviewClick({
        dryRunOrderInput: avanzaDryRunRequestPreview.request,
        requestId: `localhost_review_click_stub_${selectedIntent.intent_id}`,
        advancedFormFillResult: hasFilledAdvancedForm
          ? localhostAdvancedFormFill
          : undefined,
        reviewClickAttempted: true,
        reviewLabel:
          avanzaDryRunRequestPreview.request.action === "sell"
            ? "Granska sälj"
            : "Granska köp",
        metadata: {
          source: "execution_handoff_preview_modal",
          read_only_response_preview: true,
          stub_only: true,
          advanced_form_fill_available: hasFilledAdvancedForm,
          real_review_click_phase_requires_form_filled:
            !hasFilledAdvancedForm,
          no_browser_actions_requested: true,
          no_avanza_session: true,
          no_avanza_page_touched: true,
          no_real_granska_clicked: true,
          no_bekrafta_clicked: true,
          no_final_confirm_click: true,
          no_broker_submission: true,
          no_broker_result_created: true,
          no_supabase_write: true,
          no_trade_mutation: true,
        },
      });

      setLocalhostReviewClickResult(reviewClickResult);
      setLocalhostReviewClickMessage(
        reviewClickResult.ok
          ? "Review-click stub response normalized. No browser control, Avanza page touch, real Granska, Bekrafta, broker result, or trade mutation occurred."
          : "Review-click stub finished safely with blockers or errors. No browser control, Avanza page touch, real Granska, Bekrafta, broker result, or trade mutation occurred.",
      );
    } catch (error) {
      setLocalhostReviewClickMessage(
        error instanceof Error
          ? `Review-click stub check failed safely: ${error.message}`
          : "Review-click stub check failed safely. No browser control, Avanza page touch, real Granska, Bekrafta, broker result, or trade mutation occurred.",
      );
    } finally {
      setIsLocalhostReviewClickRunning(false);
    }
  }

  return {
    canCheckLocalhostAdvancedFormFill,
    canCheckLocalhostInstrumentPage,
    canCheckLocalhostOrderPageOpen,
    canCheckLocalhostReviewClick,
    checkLocalhostAdvancedFormFillStub,
    checkLocalhostInstrumentPageStub,
    checkLocalhostOrderPageOpenStub,
    checkLocalhostReviewClickStub,
    isLocalhostAdvancedFormFillRunning,
    isLocalhostInstrumentPageRunning,
    isLocalhostOrderPageOpenRunning,
    isLocalhostReviewClickRunning,
    localhostAdvancedFormBlocked,
    localhostAdvancedFormFieldMismatch,
    localhostAdvancedFormFill,
    localhostAdvancedFormFilled,
    localhostAdvancedFormFillHasRun,
    localhostAdvancedFormFillMessage,
    localhostAdvancedFormFillResult,
    localhostAdvancedFormNoAvanzaTouched,
    localhostAdvancedFormNoBrokerSubmission,
    localhostAdvancedFormNoBrowserActions,
    localhostAdvancedFormNoFinalConfirmClick,
    localhostAdvancedFormNoRealFormFieldsFilled,
    localhostAdvancedFormNoReviewClick,
    localhostAdvancedFormProhibited,
    localhostAdvancedFormUnsupportedMode,
    localhostAdvancedFormValidationError,
    localhostInstrumentPage,
    localhostInstrumentPageBlocked,
    localhostInstrumentPageHasRun,
    localhostInstrumentPageIdentified,
    localhostInstrumentPageMessage,
    localhostInstrumentPageMismatch,
    localhostInstrumentPageNoAvanzaTouched,
    localhostInstrumentPageNoBrokerSubmission,
    localhostInstrumentPageNoBrowserActions,
    localhostInstrumentPageNoBuySellClick,
    localhostInstrumentPageNoFormFill,
    localhostInstrumentPageNoOrderPageOpened,
    localhostInstrumentPageProhibitedControlsVisible,
    localhostInstrumentPageResult,
    localhostOrderPageBlocked,
    localhostOrderPageMismatch,
    localhostOrderPageNoAvanzaTouched,
    localhostOrderPageNoBrokerSubmission,
    localhostOrderPageNoBrowserActions,
    localhostOrderPageNoFinalConfirmClick,
    localhostOrderPageNoFormFill,
    localhostOrderPageNoRealOrderPageOpened,
    localhostOrderPageNoReviewClick,
    localhostOrderPageOpen,
    localhostOrderPageOpenHasRun,
    localhostOrderPageOpenMessage,
    localhostOrderPageOpenResult,
    localhostOrderPageOpened,
    localhostOrderPageWrongAction,
    localhostReviewClick,
    localhostReviewClickBlocked,
    localhostReviewClickConfirmationMismatch,
    localhostReviewClickConfirmationReady,
    localhostReviewClickFinalConfirmBlocked,
    localhostReviewClickHasRun,
    localhostReviewClickMessage,
    localhostReviewClickNoAvanzaTouched,
    localhostReviewClickNoBrokerResult,
    localhostReviewClickNoBrowserActions,
    localhostReviewClickNoFinalConfirmClick,
    localhostReviewClickNoRealReviewClick,
    localhostReviewClickNoTradeMutation,
    localhostReviewClickResult,
    localhostReviewClickValidationError,
    localhostReviewClickWaitingForManualConfirmation,
  };
}
