export type AvanzaRealWorldInstrumentSearchStep =
  | "search_button_visible"
  | "search_panel_open"
  | "search_input_ready"
  | "search_results_visible"
  | "matching_instrument_visible"
  | "instrument_detail_page"
  | "instrument_verification_section"
  | "buy_sell_entry_buttons"
  | "unknown";

export type AvanzaRealWorldInstrumentSearchSide =
  | "buy"
  | "sell"
  | "neutral"
  | "unknown";

export type AvanzaRealWorldInstrumentSearchObservedUrlKind =
  | "avanza_any_page"
  | "avanza_search_panel"
  | "avanza_search_results"
  | "avanza_instrument"
  | "avanza_order_entry"
  | "unknown";

export type AvanzaRealWorldInstrumentSearchSignal = {
  signalId: string;
  label: string;
  safeText: string;
  category:
    | "button"
    | "input"
    | "result"
    | "instrument_identity"
    | "verification"
    | "entry_button"
    | "warning";
};

export type AvanzaRealWorldInstrumentSearchSafetyFlags = {
  sanitized: boolean;
  containsCredentials: false;
  containsPassword: false;
  containsPersonalIdentityNumber: false;
  containsAccountNumber: false;
  containsCookie: false;
  containsSessionToken: false;
  containsBankIdQr: false;
  containsOrderId: false;
  canUseAsFixture: boolean;
  canUseForInstrumentPlanning: boolean;
  canUseForSelectorPlanning: boolean;
  canOpenSearch: false;
  canFillSearch: false;
  canSelectSearchResult: false;
  canNavigateToInstrument: false;
  canVerifyInstrument: boolean;
  canClickBuy: false;
  canClickSell: false;
  canSubmitOrder: false;
  canReadCookies: false;
  canExportSession: false;
  canAutomateBankId: false;
  canBypassBankId: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
};

export type AvanzaRealWorldInstrumentSearchSignalPack =
  AvanzaRealWorldInstrumentSearchSafetyFlags & {
    signalPackId: string;
    createdAt: string;
    source: "sanitized_user_visual_material";
    step: AvanzaRealWorldInstrumentSearchStep;
    side: AvanzaRealWorldInstrumentSearchSide;
    observedUrlKind: AvanzaRealWorldInstrumentSearchObservedUrlKind;
    visibleTexts: string[];
    buttonTexts: string[];
    inputLabels: string[];
    inputPlaceholders: string[];
    resultTexts: string[];
    instrumentIdentityTexts: string[];
    verificationTexts: string[];
    entryButtonTexts: string[];
    warningTexts: string[];
    searchAvailable: boolean;
    searchPanelDetected: boolean;
    searchInputDetected: boolean;
    searchResultsDetected: boolean;
    matchingInstrumentDetected: boolean;
    instrumentPageDetected: boolean;
    instrumentVerificationDetected: boolean;
    buyButtonDetected: boolean;
    sellButtonDetected: boolean;
    signals: AvanzaRealWorldInstrumentSearchSignal[];
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaRealWorldInstrumentSearchSafetyFlags;
  };

export type AvanzaRealWorldInstrumentSearchSignalInput = {
  signalPackId?: string;
  createdAt?: string;
  step?: AvanzaRealWorldInstrumentSearchStep;
  side?: AvanzaRealWorldInstrumentSearchSide;
  observedUrlKind?: AvanzaRealWorldInstrumentSearchObservedUrlKind;
  visibleTexts?: readonly string[];
  buttonTexts?: readonly string[];
  inputLabels?: readonly string[];
  inputPlaceholders?: readonly string[];
  resultTexts?: readonly string[];
  instrumentIdentityTexts?: readonly string[];
  verificationTexts?: readonly string[];
  entryButtonTexts?: readonly string[];
  warningTexts?: readonly string[];
};

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token|order\s*id|orderid/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeTexts(values: readonly string[] | undefined) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function includesText(values: readonly string[], pattern: RegExp) {
  return values.some((value) => pattern.test(value));
}

function buildSignals(
  category: AvanzaRealWorldInstrumentSearchSignal["category"],
  values: readonly string[],
) {
  return values.map((value, index) => ({
    signalId: `${category}_${index + 1}`,
    label: value,
    safeText: value,
    category,
  }));
}

function buildSafetyFlags(
  step: AvanzaRealWorldInstrumentSearchStep,
): AvanzaRealWorldInstrumentSearchSafetyFlags {
  const canUseAsFixture = step !== "unknown";
  const canVerifyInstrument =
    step === "instrument_verification_section" ||
    step === "buy_sell_entry_buttons";

  return {
    sanitized: true,
    containsCredentials: false,
    containsPassword: false,
    containsPersonalIdentityNumber: false,
    containsAccountNumber: false,
    containsCookie: false,
    containsSessionToken: false,
    containsBankIdQr: false,
    containsOrderId: false,
    canUseAsFixture,
    canUseForInstrumentPlanning: canUseAsFixture,
    canUseForSelectorPlanning: canUseAsFixture,
    canOpenSearch: false,
    canFillSearch: false,
    canSelectSearchResult: false,
    canNavigateToInstrument: false,
    canVerifyInstrument,
    canClickBuy: false,
    canClickSell: false,
    canSubmitOrder: false,
    canReadCookies: false,
    canExportSession: false,
    canAutomateBankId: false,
    canBypassBankId: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
  };
}

function deriveStep(
  inputStep: AvanzaRealWorldInstrumentSearchStep | undefined,
  values: {
    buttonTexts: readonly string[];
    inputLabels: readonly string[];
    inputPlaceholders: readonly string[];
    resultTexts: readonly string[];
    instrumentIdentityTexts: readonly string[];
    verificationTexts: readonly string[];
    entryButtonTexts: readonly string[];
  },
): AvanzaRealWorldInstrumentSearchStep {
  if (inputStep) return inputStep;
  if (includesText(values.entryButtonTexts, /k[oö]p|s[aä]lj/i)) {
    return "buy_sell_entry_buttons";
  }
  if (
    includesText(values.verificationTexts, /om dep[aå]beviset|marknadsplats|kortnamn|isin/i)
  ) {
    return "instrument_verification_section";
  }
  if (values.instrumentIdentityTexts.length > 0) return "instrument_detail_page";
  if (includesText(values.resultTexts, /nokia/i)) {
    return "matching_instrument_visible";
  }
  if (values.resultTexts.length > 0) return "search_results_visible";
  if (
    values.inputLabels.length > 0 ||
    values.inputPlaceholders.length > 0
  ) {
    return "search_input_ready";
  }
  if (includesText(values.buttonTexts, /s[oö]k/i)) return "search_button_visible";

  return "unknown";
}

export function buildAvanzaRealWorldInstrumentSearchSignalPack(
  input: AvanzaRealWorldInstrumentSearchSignalInput = {},
): AvanzaRealWorldInstrumentSearchSignalPack {
  const visibleTexts = safeTexts(input.visibleTexts);
  const buttonTexts = safeTexts(input.buttonTexts);
  const inputLabels = safeTexts(input.inputLabels);
  const inputPlaceholders = safeTexts(input.inputPlaceholders);
  const resultTexts = safeTexts(input.resultTexts);
  const instrumentIdentityTexts = safeTexts(input.instrumentIdentityTexts);
  const verificationTexts = safeTexts(input.verificationTexts);
  const entryButtonTexts = safeTexts(input.entryButtonTexts);
  const warningTexts = safeTexts(input.warningTexts);
  const step = deriveStep(input.step, {
    buttonTexts,
    inputLabels,
    inputPlaceholders,
    resultTexts,
    instrumentIdentityTexts,
    verificationTexts,
    entryButtonTexts,
  });
  const safetyFlags = buildSafetyFlags(step);
  const searchAvailable = includesText(buttonTexts, /s[oö]k/i);
  const searchPanelDetected =
    input.observedUrlKind === "avanza_search_panel" ||
    step === "search_panel_open" ||
    step === "search_input_ready" ||
    step === "search_results_visible" ||
    step === "matching_instrument_visible";
  const searchInputDetected =
    step === "search_input_ready" ||
    inputLabels.length > 0 ||
    inputPlaceholders.length > 0;
  const searchResultsDetected =
    step === "search_results_visible" ||
    step === "matching_instrument_visible" ||
    resultTexts.length > 0;
  const matchingInstrumentDetected =
    step === "matching_instrument_visible" ||
    includesText(resultTexts, /nokia|nokia adr/i);
  const instrumentPageDetected =
    step === "instrument_detail_page" ||
    step === "instrument_verification_section" ||
    step === "buy_sell_entry_buttons";
  const instrumentVerificationDetected =
    step === "instrument_verification_section" ||
    includesText(verificationTexts, /om dep[aå]beviset|marknadsplats|kortnamn|isin/i);
  const buyButtonDetected = includesText(entryButtonTexts, /k[oö]p/i);
  const sellButtonDetected = includesText(entryButtonTexts, /s[aä]lj/i);

  return {
    ...safetyFlags,
    signalPackId: safeText(input.signalPackId) ?? "avanza-instrument-search-signals",
    createdAt: safeText(input.createdAt) ?? defaultCreatedAt,
    source: "sanitized_user_visual_material",
    step,
    side: input.side ?? "unknown",
    observedUrlKind: input.observedUrlKind ?? "unknown",
    visibleTexts,
    buttonTexts,
    inputLabels,
    inputPlaceholders,
    resultTexts,
    instrumentIdentityTexts,
    verificationTexts,
    entryButtonTexts,
    warningTexts,
    searchAvailable,
    searchPanelDetected,
    searchInputDetected,
    searchResultsDetected,
    matchingInstrumentDetected,
    instrumentPageDetected,
    instrumentVerificationDetected,
    buyButtonDetected,
    sellButtonDetected,
    signals: [
      ...buildSignals("button", buttonTexts),
      ...buildSignals("input", [...inputLabels, ...inputPlaceholders]),
      ...buildSignals("result", resultTexts),
      ...buildSignals("instrument_identity", instrumentIdentityTexts),
      ...buildSignals("verification", verificationTexts),
      ...buildSignals("entry_button", entryButtonTexts),
      ...buildSignals("warning", warningTexts),
    ],
    warnings: warningTexts,
    blockedReasons:
      step === "unknown" ? ["Instrument search step is unknown."] : [],
    safetyFlags,
  };
}
