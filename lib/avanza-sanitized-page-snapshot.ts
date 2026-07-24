import type { AvanzaPageStateModelInput } from "./avanza-page-state-detector";

export type AvanzaSanitizedPageSnapshotKind =
  | "unknown"
  | "login"
  | "username_password_login"
  | "bankid_or_mfa"
  | "logged_in_home"
  | "account_overview"
  | "instrument_page"
  | "order_ticket"
  | "order_review"
  | "order_confirmation"
  | "error_page";

export type AvanzaSanitizedPageSnapshotSource =
  | "manual_screenshot_notes"
  | "manual_dom_notes"
  | "local_dev_snapshot"
  | "fixture";

export type AvanzaSanitizedObservedUrlKind =
  | "unknown"
  | "avanza"
  | "avanza_login"
  | "avanza_account"
  | "avanza_instrument"
  | "avanza_order"
  | "avanza_review"
  | "avanza_confirmation";

export type AvanzaSanitizedPageSignal = {
  signalId: string;
  kind:
    | "visible_text"
    | "form_label"
    | "input_placeholder"
    | "button_text"
    | "title_text";
  value: string;
};

export type AvanzaSanitizedPageSnapshotSafetyFlags = {
  sanitized: boolean;
  containsCredentials: boolean;
  containsPassword: boolean;
  containsPersonalIdentityNumber: boolean;
  containsAccountNumber: boolean;
  containsCookie: boolean;
  containsSessionToken: boolean;
  containsBankIdQr: boolean;
  containsBrokerSecret: boolean;
  canStoreInDocs: boolean;
  canUseAsFixture: boolean;
  canUseForSelectorPlanning: boolean;
  canUseForLoginPlanning: boolean;
  canUseForOrderPlanning: boolean;
  canBypassBankId: false;
  canSubmitOrder: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
};

export type AvanzaSanitizedPageSnapshotInput = {
  snapshotId?: string;
  createdAt?: string;
  kind?: AvanzaSanitizedPageSnapshotKind;
  source?: AvanzaSanitizedPageSnapshotSource;
  observedUrlKind?: AvanzaSanitizedObservedUrlKind;
  titleText?: string;
  visibleTextSignals?: readonly string[];
  formLabels?: readonly string[];
  inputPlaceholders?: readonly string[];
  buttonTexts?: readonly string[];
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaSanitizedPageSnapshot =
  AvanzaSanitizedPageSnapshotSafetyFlags & {
    snapshotId: string;
    createdAt: string;
    kind: AvanzaSanitizedPageSnapshotKind;
    source: AvanzaSanitizedPageSnapshotSource;
    observedUrlKind: AvanzaSanitizedObservedUrlKind;
    titleText?: string;
    visibleTextSignals: string[];
    formLabels: string[];
    inputPlaceholders: string[];
    buttonTexts: string[];
    detectedSensitiveTokens: string[];
    redactionNotes: string[];
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaSanitizedPageSnapshotSafetyFlags;
  };

export type AvanzaSanitizedTextSignalResult = {
  sanitizedSignals: string[];
  detectedSensitiveTokens: string[];
  redactionNotes: string[];
};

const defaultCreatedAt = "2026-07-05T12:00:00.000Z";

const sensitivePatterns = [
  {
    token: "password",
    note: "Password-like material was redacted.",
    pattern: /(?:password|passcode|pwd|l[oö]senord)\s*[:=]\s*\S+|••+|●●+/i,
    replacement: "[redacted:password]",
  },
  {
    token: "personal_identity_number",
    note: "Personnummer-like material was redacted.",
    pattern: /\b(?:\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4})\b/g,
    replacement: "[redacted:personal-identity-number]",
  },
  {
    token: "account_number",
    note: "Account-number-like material was redacted.",
    pattern:
      /(?:account|konto|kontonr|dep[åa]|account number).{0,24}\d+|\b\d{4}[-\s]\d{4}[-\s]\d{2,}\b/gi,
    replacement: "[redacted:account-number]",
  },
  {
    token: "cookie",
    note: "Cookie-like material was redacted.",
    pattern: /set-cookie|cookie\s*[:=]|document\.cookie/i,
    replacement: "[redacted:cookie]",
  },
  {
    token: "session_token",
    note: "Session or token-like material was redacted.",
    pattern:
      /\b(?:session|sessionstorage|localstorage|token|bearer|jwt|authorization)\b.{0,80}/gi,
    replacement: "[redacted:session-token]",
  },
  {
    token: "bankid_qr",
    note: "BankID QR-like material was redacted.",
    pattern: /bankid.{0,30}qr|qr.{0,30}bankid|qr[-\s]?kod|qr[-\s]?code/i,
    replacement: "[redacted:bankid-qr]",
  },
  {
    token: "broker_secret",
    note: "Broker secret-like material was redacted.",
    pattern: /broker\s*secret|avanza\s*secret|api\s*secret/i,
    replacement: "[redacted:broker-secret]",
  },
  {
    token: "email",
    note: "Email-like material was redacted.",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: "[redacted:email]",
  },
] as const;

function unique(values: readonly string[]) {
  return Array.from(new Set(values));
}

function safeText(value: unknown) {
  if (typeof value !== "string") return undefined;

  const text = value.trim();

  return text ? text : undefined;
}

function safeStringArray(values: readonly string[] | undefined) {
  return Array.isArray(values)
    ? values.flatMap((value) => {
        const text = safeText(value);

        return text ? [text] : [];
      })
    : [];
}

export function sanitizeAvanzaPageTextSignals(
  values: readonly string[] = [],
): AvanzaSanitizedTextSignalResult {
  const detectedSensitiveTokens: string[] = [];
  const redactionNotes: string[] = [];

  const sanitizedSignals = safeStringArray(values).flatMap((value) => {
    let sanitizedValue = value;

    for (const sensitivePattern of sensitivePatterns) {
      sensitivePattern.pattern.lastIndex = 0;
      if (sensitivePattern.pattern.test(sanitizedValue)) {
        detectedSensitiveTokens.push(sensitivePattern.token);
        redactionNotes.push(sensitivePattern.note);
        sensitivePattern.pattern.lastIndex = 0;
        sanitizedValue = sanitizedValue.replace(
          sensitivePattern.pattern,
          sensitivePattern.replacement,
        );
      }
    }

    const safeValue = safeText(sanitizedValue);

    return safeValue ? [safeValue] : [];
  });

  return {
    sanitizedSignals,
    detectedSensitiveTokens: unique(detectedSensitiveTokens),
    redactionNotes: unique(redactionNotes),
  };
}

function combineSanitizedResults(
  values: readonly AvanzaSanitizedTextSignalResult[],
) {
  return {
    detectedSensitiveTokens: unique(
      values.flatMap((value) => value.detectedSensitiveTokens),
    ),
    redactionNotes: unique(values.flatMap((value) => value.redactionNotes)),
  };
}

function buildSafetyFlags(
  detectedSensitiveTokens: readonly string[],
  kind: AvanzaSanitizedPageSnapshotKind,
): AvanzaSanitizedPageSnapshotSafetyFlags {
  const containsPassword = detectedSensitiveTokens.includes("password");
  const containsPersonalIdentityNumber = detectedSensitiveTokens.includes(
    "personal_identity_number",
  );
  const containsAccountNumber =
    detectedSensitiveTokens.includes("account_number");
  const containsCookie = detectedSensitiveTokens.includes("cookie");
  const containsSessionToken =
    detectedSensitiveTokens.includes("session_token");
  const containsBankIdQr = detectedSensitiveTokens.includes("bankid_qr");
  const containsBrokerSecret = detectedSensitiveTokens.includes("broker_secret");
  const containsCredentials = containsPassword ||
    detectedSensitiveTokens.includes("email");
  const hasSensitiveMaterial = detectedSensitiveTokens.length > 0;

  return {
    sanitized: true,
    containsCredentials,
    containsPassword,
    containsPersonalIdentityNumber,
    containsAccountNumber,
    containsCookie,
    containsSessionToken,
    containsBankIdQr,
    containsBrokerSecret,
    canStoreInDocs: !hasSensitiveMaterial,
    canUseAsFixture: !hasSensitiveMaterial,
    canUseForSelectorPlanning: !hasSensitiveMaterial,
    canUseForLoginPlanning:
      !hasSensitiveMaterial &&
      ["login", "username_password_login", "bankid_or_mfa"].includes(kind),
    canUseForOrderPlanning:
      !hasSensitiveMaterial &&
      ["instrument_page", "order_ticket", "order_review", "order_confirmation"].includes(
        kind,
      ),
    canBypassBankId: false,
    canSubmitOrder: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
  };
}

function blockedReasonsForSensitiveTokens(
  detectedSensitiveTokens: readonly string[],
) {
  return detectedSensitiveTokens.map(
    (token) => `sensitive material detected: ${token}`,
  );
}

export function buildAvanzaSanitizedPageSnapshot(
  input: AvanzaSanitizedPageSnapshotInput = {},
): AvanzaSanitizedPageSnapshot {
  const titleResult = sanitizeAvanzaPageTextSignals(
    input.titleText ? [input.titleText] : [],
  );
  const visibleTextResult = sanitizeAvanzaPageTextSignals(
    input.visibleTextSignals,
  );
  const formLabelResult = sanitizeAvanzaPageTextSignals(input.formLabels);
  const placeholderResult = sanitizeAvanzaPageTextSignals(
    input.inputPlaceholders,
  );
  const buttonTextResult = sanitizeAvanzaPageTextSignals(input.buttonTexts);
  const combined = combineSanitizedResults([
    titleResult,
    visibleTextResult,
    formLabelResult,
    placeholderResult,
    buttonTextResult,
  ]);
  const kind = input.kind ?? "unknown";
  const source = input.source ?? "fixture";
  const safetyFlags = buildSafetyFlags(
    combined.detectedSensitiveTokens,
    kind,
  );
  const blockedReasons = [
    ...safeStringArray(input.blockedReasons),
    ...blockedReasonsForSensitiveTokens(combined.detectedSensitiveTokens),
  ];

  return {
    ...safetyFlags,
    snapshotId: safeText(input.snapshotId) ?? "avanza-sanitized-snapshot",
    createdAt: safeText(input.createdAt) ?? defaultCreatedAt,
    kind,
    source,
    observedUrlKind: input.observedUrlKind ?? "unknown",
    titleText: titleResult.sanitizedSignals[0],
    visibleTextSignals: visibleTextResult.sanitizedSignals,
    formLabels: formLabelResult.sanitizedSignals,
    inputPlaceholders: placeholderResult.sanitizedSignals,
    buttonTexts: buttonTextResult.sanitizedSignals,
    detectedSensitiveTokens: combined.detectedSensitiveTokens,
    redactionNotes: combined.redactionNotes,
    warnings: safeStringArray(input.warnings),
    blockedReasons,
    safetyFlags,
  };
}

export function mapAvanzaSanitizedPageSnapshotToPageStateInput(
  snapshot: AvanzaSanitizedPageSnapshot,
): AvanzaPageStateModelInput {
  return {
    detectorEnabled: snapshot.canUseForSelectorPlanning,
    mode: snapshot.canUseForSelectorPlanning ? "snapshot_model" : "disabled",
    observedTitle: snapshot.titleText,
    observedTextSignals: [
      snapshot.kind,
      snapshot.observedUrlKind,
      ...snapshot.visibleTextSignals,
    ],
    observedFormSignals: snapshot.formLabels,
    observedButtonSignals: snapshot.buttonTexts,
    observedInputSignals: snapshot.inputPlaceholders,
    now: snapshot.createdAt,
  };
}
