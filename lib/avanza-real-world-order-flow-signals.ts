export type AvanzaRealWorldOrderFlowStep =
  | "instrument_order_panel"
  | "order_review"
  | "order_success_confirmation"
  | "order_failed_confirmation"
  | "order_list"
  | "order_detail_panel"
  | "unknown";

export type AvanzaRealWorldOrderSide = "buy" | "sell" | "unknown";

export type AvanzaRealWorldOrderObservedUrlKind =
  | "avanza_instrument"
  | "avanza_order"
  | "avanza_order_review"
  | "avanza_order_confirmation"
  | "avanza_order_list"
  | "unknown";

export type AvanzaRealWorldOrderSignal = {
  signalId: string;
  kind:
    | "visible_text"
    | "button_text"
    | "form_label"
    | "field_label"
    | "tab"
    | "status_text"
    | "confirmation_text"
    | "warning_text"
    | "failure_text"
    | "success_text";
  value: string;
};

export type AvanzaRealWorldOrderSignalPackSafetyFlags = {
  sanitized: true;
  containsCredentials: false;
  containsPassword: false;
  containsPersonalIdentityNumber: false;
  containsAccountNumber: false;
  containsCookie: false;
  containsSessionToken: false;
  containsBankIdQr: false;
  containsOrderId: false;
  canUseAsFixture: true;
  canUseForOrderPlanning: true;
  canUseForSelectorPlanning: true;
  canFillOrderFields: false;
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

export type AvanzaRealWorldOrderSignalPackInput = {
  signalPackId?: string;
  createdAt?: string;
  side?: AvanzaRealWorldOrderSide;
  step?: AvanzaRealWorldOrderFlowStep;
  observedUrlKind?: AvanzaRealWorldOrderObservedUrlKind;
  visibleTexts?: readonly string[];
  buttonTexts?: readonly string[];
  formLabels?: readonly string[];
  fieldLabels?: readonly string[];
  tabs?: readonly string[];
  statusTexts?: readonly string[];
  confirmationTexts?: readonly string[];
  warningTexts?: readonly string[];
  failureTexts?: readonly string[];
  successTexts?: readonly string[];
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaRealWorldOrderSignalPack =
  AvanzaRealWorldOrderSignalPackSafetyFlags & {
    signalPackId: string;
    createdAt: string;
    source: "sanitized_user_visual_material";
    side: AvanzaRealWorldOrderSide;
    step: AvanzaRealWorldOrderFlowStep;
    observedUrlKind: AvanzaRealWorldOrderObservedUrlKind;
    visibleTexts: string[];
    buttonTexts: string[];
    formLabels: string[];
    fieldLabels: string[];
    tabs: string[];
    statusTexts: string[];
    confirmationTexts: string[];
    warningTexts: string[];
    failureTexts: string[];
    successTexts: string[];
    finalActionDetected: boolean;
    finalActionForbidden: true;
    warnings: string[];
    blockedReasons: string[];
    signals: AvanzaRealWorldOrderSignal[];
    safetyFlags: AvanzaRealWorldOrderSignalPackSafetyFlags;
  };

const defaultCreatedAt = "2026-07-06T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|cookie|credential|order\s*id|ordernummer|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token/i;

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text)) return undefined;

  return text;
}

function safeStringArray(values: readonly string[] | undefined) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

function normalized(values: readonly string[]) {
  return values.join(" ").toLowerCase();
}

function buildSafetyFlags(): AvanzaRealWorldOrderSignalPackSafetyFlags {
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
    canUseAsFixture: true,
    canUseForOrderPlanning: true,
    canUseForSelectorPlanning: true,
    canFillOrderFields: false,
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

function buildSignals(
  kind: AvanzaRealWorldOrderSignal["kind"],
  values: readonly string[],
) {
  return values.map((value, index) => ({
    signalId: `${kind}_${index + 1}`,
    kind,
    value,
  }));
}

export function buildAvanzaRealWorldOrderSignalPack(
  input: AvanzaRealWorldOrderSignalPackInput = {},
): AvanzaRealWorldOrderSignalPack {
  const visibleTexts = safeStringArray(input.visibleTexts);
  const buttonTexts = safeStringArray(input.buttonTexts);
  const formLabels = safeStringArray(input.formLabels);
  const fieldLabels = safeStringArray(input.fieldLabels);
  const tabs = safeStringArray(input.tabs);
  const statusTexts = safeStringArray(input.statusTexts);
  const confirmationTexts = safeStringArray(input.confirmationTexts);
  const warningTexts = safeStringArray(input.warningTexts);
  const failureTexts = safeStringArray(input.failureTexts);
  const successTexts = safeStringArray(input.successTexts);
  const allSignals = normalized([
    ...visibleTexts,
    ...buttonTexts,
    ...formLabels,
    ...fieldLabels,
    ...tabs,
    ...statusTexts,
    ...confirmationTexts,
    ...warningTexts,
    ...failureTexts,
    ...successTexts,
  ]);
  const finalActionDetected = /\b(k[oö]p|s[aä]lj)\b/.test(allSignals);
  const safetyFlags = buildSafetyFlags();

  return {
    ...safetyFlags,
    signalPackId: safeText(input.signalPackId) ?? "avanza-order-signal-pack",
    createdAt: safeText(input.createdAt) ?? defaultCreatedAt,
    source: "sanitized_user_visual_material",
    side: input.side ?? "unknown",
    step: input.step ?? "unknown",
    observedUrlKind: input.observedUrlKind ?? "unknown",
    visibleTexts,
    buttonTexts,
    formLabels,
    fieldLabels,
    tabs,
    statusTexts,
    confirmationTexts,
    warningTexts,
    failureTexts,
    successTexts,
    finalActionDetected,
    finalActionForbidden: true,
    warnings: safeStringArray(input.warnings),
    blockedReasons: safeStringArray(input.blockedReasons),
    signals: [
      ...buildSignals("visible_text", visibleTexts),
      ...buildSignals("button_text", buttonTexts),
      ...buildSignals("form_label", formLabels),
      ...buildSignals("field_label", fieldLabels),
      ...buildSignals("tab", tabs),
      ...buildSignals("status_text", statusTexts),
      ...buildSignals("confirmation_text", confirmationTexts),
      ...buildSignals("warning_text", warningTexts),
      ...buildSignals("failure_text", failureTexts),
      ...buildSignals("success_text", successTexts),
    ],
    safetyFlags,
  };
}
