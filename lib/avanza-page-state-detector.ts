export type AvanzaPageStateStatus =
  | "unknown"
  | "not_checked"
  | "non_avanza_page"
  | "avanza_public_page"
  | "avanza_login_page"
  | "avanza_logged_in_home"
  | "avanza_account_overview"
  | "avanza_instrument_page"
  | "avanza_order_ticket"
  | "avanza_order_review"
  | "avanza_order_confirmation"
  | "avanza_bankid_or_mfa"
  | "avanza_error_page"
  | "blocked";

export type AvanzaPageStateDetectionMode =
  | "disabled"
  | "snapshot_model"
  | "local_dev_snapshot";

export type AvanzaPageStateUrlKind =
  | "unknown"
  | "non_avanza"
  | "avanza"
  | "avanza_login"
  | "avanza_account"
  | "avanza_instrument"
  | "avanza_order"
  | "avanza_review"
  | "avanza_confirmation";

export type AvanzaPageStateSafetyFlags = {
  detectorEnabled: boolean;
  readOnly: true;
  canReadSnapshot: boolean;
  canNavigate: false;
  canFillForm: false;
  canClick: false;
  canClickFinalBuy: false;
  canClickFinalSell: false;
  canSubmitOrder: false;
  canHandleCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canBypassBankId: false;
  canWriteSupabase: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaPageStateModelInput = {
  mode?: AvanzaPageStateDetectionMode;
  detectorEnabled?: boolean;
  pageSnapshot?: unknown;
  observedUrl?: string;
  observedTitle?: string;
  observedTextSignals?: readonly string[];
  observedFormSignals?: readonly string[];
  observedButtonSignals?: readonly string[];
  observedInputSignals?: readonly string[];
  now?: string;
  detectionId?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
  statusOverride?: AvanzaPageStateStatus;
};

export type AvanzaPageStateModel = AvanzaPageStateSafetyFlags & {
  detectionId: string;
  createdAt: string;
  mode: AvanzaPageStateDetectionMode;
  status: AvanzaPageStateStatus;
  label: string;
  reason: string;
  urlKind: AvanzaPageStateUrlKind;
  isAvanza: boolean;
  isLoginPage: boolean;
  isLoggedInLikely: boolean;
  isInstrumentPageLikely: boolean;
  isOrderTicketLikely: boolean;
  isOrderReviewLikely: boolean;
  isOrderConfirmationLikely: boolean;
  isBankIdOrMfaLikely: boolean;
  manualActionRequired: boolean;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaPageStateSafetyFlags;
};

const defaultCreatedAt = "2026-07-05T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|broker\s*secret|cookie|credential|password|secret|session|storage|token/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  if (!text) return undefined;
  if (unsafeTextPattern.test(text) || /\d{5,}/.test(text)) return undefined;

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

function snapshotText(snapshot: unknown, key: string) {
  if (!isRecord(snapshot)) return undefined;

  return safeText(snapshot[key]);
}

function snapshotStringArray(snapshot: unknown, key: string) {
  if (!isRecord(snapshot)) return [];

  const value = snapshot[key];

  return Array.isArray(value) ? safeStringArray(value) : [];
}

function inputWithSnapshot(input: AvanzaPageStateModelInput) {
  const snapshot = input.pageSnapshot;

  return {
    observedUrl:
      safeText(input.observedUrl) ??
      snapshotText(snapshot, "observedUrl") ??
      snapshotText(snapshot, "url"),
    observedTitle:
      safeText(input.observedTitle) ??
      snapshotText(snapshot, "title") ??
      snapshotText(snapshot, "observedTitle"),
    observedTextSignals: [
      ...safeStringArray(input.observedTextSignals),
      ...snapshotStringArray(snapshot, "textSignals"),
      ...snapshotStringArray(snapshot, "observedTextSignals"),
    ],
    observedFormSignals: [
      ...safeStringArray(input.observedFormSignals),
      ...snapshotStringArray(snapshot, "formSignals"),
      ...snapshotStringArray(snapshot, "observedFormSignals"),
    ],
    observedButtonSignals: safeStringArray(input.observedButtonSignals),
    observedInputSignals: safeStringArray(input.observedInputSignals),
  };
}

function detectUrlKind(url: string | undefined): AvanzaPageStateUrlKind {
  const value = url?.toLowerCase();

  if (!value) return "unknown";
  if (!value.includes("avanza")) return "non_avanza";
  if (/login|logga-in|inlogg/.test(value)) return "avanza_login";
  if (/konto|account|mina-sidor|overview|portfolio/.test(value)) {
    return "avanza_account";
  }
  if (/aktier|fonder|instrument|om-aktien|orderbook/.test(value)) {
    return "avanza_instrument";
  }
  if (/bekrafta|bekr[aä]fta|confirm|confirmation|kvittens/.test(value)) {
    return "avanza_confirmation";
  }
  if (/granska|review/.test(value)) return "avanza_review";
  if (/order|handla|buy|sell|kop|salj|k[oö]p|s[aä]lj/.test(value)) {
    return "avanza_order";
  }

  return "avanza";
}

function normalizedSignals(input: AvanzaPageStateModelInput) {
  const snapshot = inputWithSnapshot(input);

  return [
    snapshot.observedUrl,
    snapshot.observedTitle,
    ...snapshot.observedTextSignals,
    ...snapshot.observedFormSignals,
    ...snapshot.observedButtonSignals,
    ...snapshot.observedInputSignals,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasBankIdOrMfaSignal(signals: string) {
  return /bankid|bank id|mfa|two[-\s]?factor|2fa|verify identity|visa qr-kod|visa qr kod|[öo]ppna bankid p[åa] samma enhet/.test(
    signals,
  );
}

function hasAvanzaLoginSignal(signals: string) {
  return /login|logga in|logga-in|inloggning|anv[aä]ndarnamn och l[oö]senord|anv[aä]ndarnamn|l[oö]senord|privatkund|privat|f[oö]retag|f[oö]retagswebben/.test(
    signals,
  );
}

function deriveStatus(
  input: AvanzaPageStateModelInput,
  urlKind: AvanzaPageStateUrlKind,
  blockedReasons: readonly string[],
): AvanzaPageStateStatus {
  if (input.statusOverride) return input.statusOverride;
  if (blockedReasons.length > 0) return "blocked";
  if (input.mode === "disabled" || input.detectorEnabled !== true) {
    return "not_checked";
  }
  if (urlKind === "non_avanza") return "non_avanza_page";

  const signals = normalizedSignals(input);

  if (hasBankIdOrMfaSignal(signals)) {
    return "avanza_bankid_or_mfa";
  }
  if (/error|fel|technical problem|temporarily unavailable/.test(signals)) {
    return "avanza_error_page";
  }
  if (/order confirmation|kvittens|order received|order lagd/.test(signals)) {
    return "avanza_order_confirmation";
  }
  if (
    /order review|review order|granska order|granska k[oö]p|granska s[aä]lj/.test(
      signals,
    )
  ) {
    return "avanza_order_review";
  }
  if (/order ticket|order form|limitpris|antal|k[oö]porder|s[aä]ljorder/.test(signals)) {
    return "avanza_order_ticket";
  }
  if (/instrument|ticker|senast betalt|orderdjup|om aktien/.test(signals)) {
    return "avanza_instrument_page";
  }
  if (/account overview|konto[öo]versikt|portfolio|innehav/.test(signals)) {
    return "avanza_account_overview";
  }
  if (/logged in|inloggad|mina sidor|min ekonomi/.test(signals)) {
    return "avanza_logged_in_home";
  }
  if (
    urlKind === "avanza_login" ||
    hasAvanzaLoginSignal(signals)
  ) {
    return "avanza_login_page";
  }
  if (urlKind === "avanza_account") return "avanza_account_overview";
  if (urlKind === "avanza_instrument") return "avanza_instrument_page";
  if (urlKind === "avanza_order") return "avanza_order_ticket";
  if (urlKind === "avanza_review") return "avanza_order_review";
  if (urlKind === "avanza_confirmation") return "avanza_order_confirmation";
  if (urlKind === "avanza") return "avanza_public_page";

  return signals.length > 0 ? "unknown" : "not_checked";
}

function labelFor(status: AvanzaPageStateStatus) {
  switch (status) {
    case "not_checked":
      return "Page state not checked";
    case "non_avanza_page":
      return "Non-Avanza page";
    case "avanza_public_page":
      return "Avanza public page";
    case "avanza_login_page":
      return "Avanza login page";
    case "avanza_logged_in_home":
      return "Avanza logged-in home";
    case "avanza_account_overview":
      return "Avanza account overview";
    case "avanza_instrument_page":
      return "Avanza instrument page";
    case "avanza_order_ticket":
      return "Avanza order ticket";
    case "avanza_order_review":
      return "Avanza order review";
    case "avanza_order_confirmation":
      return "Avanza order confirmation";
    case "avanza_bankid_or_mfa":
      return "Avanza BankID or MFA";
    case "avanza_error_page":
      return "Avanza error page";
    case "blocked":
      return "Page state detector blocked";
    case "unknown":
      return "Page state unknown";
  }
}

function reasonFor(status: AvanzaPageStateStatus) {
  switch (status) {
    case "not_checked":
      return "Page state detector is disabled or has no explicit snapshot signals.";
    case "non_avanza_page":
      return "Explicit snapshot signals indicate a non-Avanza page.";
    case "avanza_public_page":
      return "Explicit snapshot signals indicate an Avanza public page.";
    case "avanza_login_page":
      return "Explicit snapshot signals indicate an Avanza login page.";
    case "avanza_logged_in_home":
      return "Explicit snapshot signals indicate an Avanza logged-in home state.";
    case "avanza_account_overview":
      return "Explicit snapshot signals indicate an Avanza account overview.";
    case "avanza_instrument_page":
      return "Explicit snapshot signals indicate an Avanza instrument page.";
    case "avanza_order_ticket":
      return "Explicit snapshot signals indicate an Avanza order ticket.";
    case "avanza_order_review":
      return "Explicit snapshot signals indicate an Avanza order review page.";
    case "avanza_order_confirmation":
      return "Explicit snapshot signals indicate an Avanza order confirmation page.";
    case "avanza_bankid_or_mfa":
      return "Explicit snapshot signals indicate BankID or MFA; manual action is required.";
    case "avanza_error_page":
      return "Explicit snapshot signals indicate an Avanza error page.";
    case "blocked":
      return "Page state detector is blocked by explicit safety input.";
    case "unknown":
      return "Explicit snapshot signals were insufficient to classify page state.";
  }
}

function buildSafetyFlags(
  input: AvanzaPageStateModelInput,
  status: AvanzaPageStateStatus,
): AvanzaPageStateSafetyFlags {
  const detectorEnabled =
    input.detectorEnabled === true &&
    input.mode !== "disabled" &&
    status !== "blocked";

  return {
    detectorEnabled,
    readOnly: true,
    canReadSnapshot: detectorEnabled,
    canNavigate: false,
    canFillForm: false,
    canClick: false,
    canClickFinalBuy: false,
    canClickFinalSell: false,
    canSubmitOrder: false,
    canHandleCredentials: false,
    canReadCookies: false,
    canExportSession: false,
    canBypassBankId: false,
    canWriteSupabase: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

export function buildAvanzaPageStateModel(
  input: AvanzaPageStateModelInput = {},
): AvanzaPageStateModel {
  const mode = input.mode ?? "disabled";
  const snapshot = inputWithSnapshot(input);
  const warnings = safeStringArray(input.warnings);
  const blockedReasons = safeStringArray(input.blockedReasons);
  const urlKind = detectUrlKind(snapshot.observedUrl);
  const status = deriveStatus({ ...input, mode }, urlKind, blockedReasons);
  const safetyFlags = buildSafetyFlags({ ...input, mode }, status);
  const isBankIdOrMfaLikely = status === "avanza_bankid_or_mfa";

  return {
    ...safetyFlags,
    detectionId:
      safeText(input.detectionId) ?? "avanza-page-state-detector-disabled",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode,
    status,
    label: labelFor(status),
    reason: reasonFor(status),
    urlKind,
    isAvanza: urlKind !== "unknown" && urlKind !== "non_avanza",
    isLoginPage: status === "avanza_login_page",
    isLoggedInLikely:
      status === "avanza_logged_in_home" ||
      status === "avanza_account_overview",
    isInstrumentPageLikely: status === "avanza_instrument_page",
    isOrderTicketLikely: status === "avanza_order_ticket",
    isOrderReviewLikely: status === "avanza_order_review",
    isOrderConfirmationLikely: status === "avanza_order_confirmation",
    isBankIdOrMfaLikely,
    manualActionRequired: isBankIdOrMfaLikely,
    warnings,
    blockedReasons,
    safetyFlags,
  };
}
