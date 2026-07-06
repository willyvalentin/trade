export type AvanzaLoginStateStatus =
  | "unknown"
  | "not_checked"
  | "logged_in"
  | "logged_out"
  | "login_page_detected"
  | "username_password_possible"
  | "mfa_or_bankid_required"
  | "manual_user_action_required"
  | "blocked"
  | "error";

export type AvanzaLoginStateDetectionMode =
  | "disabled"
  | "read_only_model"
  | "local_dev_read_only";

export type AvanzaObservedUrlKind =
  | "unknown"
  | "avanza"
  | "non_avanza"
  | "login"
  | "account"
  | "order";

export type AvanzaLoginStateSafetyFlags = {
  detectorEnabled: boolean;
  readOnly: true;
  canReadPageSignals: boolean;
  canNavigate: false;
  canFillUsername: false;
  canFillPassword: false;
  canSubmitLogin: false;
  canHandleCredentials: false;
  canReadCookies: false;
  canExportSession: false;
  canBypassBankId: false;
  canStoreBrokerCredentials: false;
  canWriteSupabase: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLoginStateModelInput = {
  mode?: AvanzaLoginStateDetectionMode;
  detectorEnabled?: boolean;
  runtimeState?: unknown;
  observedUrl?: string;
  observedTitle?: string;
  observedTextSignals?: readonly string[];
  observedFormSignals?: readonly string[];
  now?: string;
  detectionId?: string;
  blockedReasons?: readonly string[];
  warnings?: readonly string[];
  statusOverride?: AvanzaLoginStateStatus;
  forceError?: boolean;
};

export type AvanzaLoginStateModel = AvanzaLoginStateSafetyFlags & {
  detectionId: string;
  createdAt: string;
  mode: AvanzaLoginStateDetectionMode;
  status: AvanzaLoginStateStatus;
  label: string;
  reason: string;
  observedUrlKind: AvanzaObservedUrlKind;
  loggedInLikely: boolean;
  loggedOutLikely: boolean;
  usernamePasswordLoginPossible: boolean;
  mfaOrBankIdLikely: boolean;
  manualActionRequired: boolean;
  warnings: string[];
  blockedReasons: string[];
  safetyFlags: AvanzaLoginStateSafetyFlags;
};

const defaultCreatedAt = "2026-07-05T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|broker\s*secret|cookie|credential|secret|session|storage|token/i;

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

function normalizedSignals(input: AvanzaLoginStateModelInput) {
  return [
    safeText(input.observedUrl),
    safeText(input.observedTitle),
    ...safeStringArray(input.observedTextSignals),
    ...safeStringArray(input.observedFormSignals),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasBankIdOrMfaSignal(signals: string) {
  return /bankid|bank id|mfa|two[-\s]?factor|2fa|verify identity|manual action|visa qr-kod|visa qr kod|[öo]ppna bankid p[åa] samma enhet/.test(
    signals,
  );
}

function hasUsernamePasswordSignal(signals: string) {
  return /username|user name|anv[aä]ndarnamn och l[oö]senord|anv[aä]ndarnamn|l[oö]senord|privatkund/.test(
    signals,
  );
}

function runtimeBlocksDetector(runtimeState: unknown) {
  if (!isRecord(runtimeState)) return false;

  return (
    runtimeState.status === "runtime_blocked" ||
    runtimeState.status === "runtime_error" ||
    runtimeState.canBypassBankId === true ||
    runtimeState.canHandleCredentials === true ||
    runtimeState.canReadCookies === true ||
    runtimeState.canExportSession === true ||
    runtimeState.canSubmitOrder === true ||
    runtimeState.controlsEnabled === true ||
    runtimeState.gateLocked === false
  );
}

function detectObservedUrlKind(observedUrl: string | undefined): AvanzaObservedUrlKind {
  const url = observedUrl?.toLowerCase();

  if (!url) return "unknown";
  if (!url.includes("avanza")) return "non_avanza";
  if (/login|logga-in|inlogg/.test(url)) return "login";
  if (/konto|account|mina-sidor|overview/.test(url)) return "account";
  if (/order|handla|buy|sell|kop|salj|köp|sälj/.test(url)) return "order";

  return "avanza";
}

function deriveStatus(
  input: AvanzaLoginStateModelInput,
  observedUrlKind: AvanzaObservedUrlKind,
  blockedReasons: readonly string[],
) {
  if (input.statusOverride) return input.statusOverride;
  if (input.forceError === true) return "error";
  if (blockedReasons.length > 0 || runtimeBlocksDetector(input.runtimeState)) {
    return "blocked";
  }
  if (input.mode === "disabled" || input.detectorEnabled !== true) {
    return "not_checked";
  }

  const signals = normalizedSignals(input);

  if (hasBankIdOrMfaSignal(signals)) {
    return "mfa_or_bankid_required";
  }
  if (/manual user action|required manual action|user action required/.test(signals)) {
    return "manual_user_action_required";
  }
  if (hasUsernamePasswordSignal(signals)) {
    return "username_password_possible";
  }
  if (/logged in|inloggad|account overview|portfolio|konto[öo]versikt/.test(signals)) {
    return "logged_in";
  }
  if (/logged out|utloggad|session expired/.test(signals)) return "logged_out";
  if (
    observedUrlKind === "login" ||
    /login|logga in|logga-in|inloggning/.test(signals)
  ) {
    return "login_page_detected";
  }

  return signals.length > 0 || observedUrlKind !== "unknown" ? "unknown" : "not_checked";
}

function labelFor(status: AvanzaLoginStateStatus) {
  switch (status) {
    case "not_checked":
      return "Login state not checked";
    case "logged_in":
      return "Logged in";
    case "logged_out":
      return "Logged out";
    case "login_page_detected":
      return "Login page detected";
    case "username_password_possible":
      return "Username/password possible";
    case "mfa_or_bankid_required":
      return "MFA or BankID required";
    case "manual_user_action_required":
      return "Manual user action required";
    case "blocked":
      return "Login detector blocked";
    case "error":
      return "Login detector error";
    case "unknown":
      return "Login state unknown";
  }
}

function reasonFor(status: AvanzaLoginStateStatus) {
  switch (status) {
    case "not_checked":
      return "Login state detector is disabled or has no explicit signals.";
    case "logged_in":
      return "Explicit read-only signals indicate an already logged-in Avanza state.";
    case "logged_out":
      return "Explicit read-only signals indicate a logged-out Avanza state.";
    case "login_page_detected":
      return "Explicit read-only signals indicate an Avanza login page.";
    case "username_password_possible":
      return "Explicit read-only signals indicate username/password login may be possible later.";
    case "mfa_or_bankid_required":
      return "Explicit read-only signals indicate MFA or BankID; manual user action is required.";
    case "manual_user_action_required":
      return "Explicit signals require manual user action.";
    case "blocked":
      return "Login state detector is blocked by explicit safety input.";
    case "error":
      return "Login state detector returned an error state.";
    case "unknown":
      return "Explicit signals were insufficient to classify login state.";
  }
}

function buildSafetyFlags(
  input: AvanzaLoginStateModelInput,
  status: AvanzaLoginStateStatus,
): AvanzaLoginStateSafetyFlags {
  const detectorEnabled =
    input.detectorEnabled === true &&
    input.mode !== "disabled" &&
    status !== "blocked" &&
    status !== "error";

  return {
    detectorEnabled,
    readOnly: true,
    canReadPageSignals: detectorEnabled,
    canNavigate: false,
    canFillUsername: false,
    canFillPassword: false,
    canSubmitLogin: false,
    canHandleCredentials: false,
    canReadCookies: false,
    canExportSession: false,
    canBypassBankId: false,
    canStoreBrokerCredentials: false,
    canWriteSupabase: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

export function buildAvanzaLoginStateModel(
  input: AvanzaLoginStateModelInput = {},
): AvanzaLoginStateModel {
  const mode = input.mode ?? "disabled";
  const warnings = safeStringArray(input.warnings);
  const blockedReasons = safeStringArray(input.blockedReasons);
  const observedUrl = safeText(input.observedUrl);
  const observedUrlKind = detectObservedUrlKind(observedUrl);
  const status = deriveStatus({ ...input, mode }, observedUrlKind, blockedReasons);
  const safetyFlags = buildSafetyFlags({ ...input, mode }, status);
  const usernamePasswordLoginPossible =
    status === "username_password_possible";
  const mfaOrBankIdLikely = status === "mfa_or_bankid_required";
  const manualActionRequired =
    mfaOrBankIdLikely || status === "manual_user_action_required";

  return {
    ...safetyFlags,
    detectionId: safeText(input.detectionId) ?? "avanza-login-detector-disabled",
    createdAt: safeText(input.now) ?? defaultCreatedAt,
    mode,
    status,
    label: labelFor(status),
    reason: reasonFor(status),
    observedUrlKind,
    loggedInLikely: status === "logged_in",
    loggedOutLikely:
      status === "logged_out" ||
      status === "login_page_detected" ||
      usernamePasswordLoginPossible ||
      mfaOrBankIdLikely,
    usernamePasswordLoginPossible,
    mfaOrBankIdLikely,
    manualActionRequired,
    warnings,
    blockedReasons,
    safetyFlags,
  };
}
