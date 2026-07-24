export type AvanzaRealWorldLoginFlowKind =
  | "initial_login_choice"
  | "private_username_password_login"
  | "company_username_password_login"
  | "bankid_qr_option"
  | "bankid_same_device_option"
  | "unknown";

export type AvanzaLoginCustomerType = "private" | "company" | "unknown";

export type AvanzaLoginMethod =
  | "username_password"
  | "bankid_qr"
  | "bankid_same_device"
  | "unknown";

export type AvanzaRealWorldLoginSignal = {
  signalId: string;
  kind:
    | "visible_text"
    | "toggle_label"
    | "button_text"
    | "form_label"
    | "input_label"
    | "secondary_action";
  value: string;
};

export type AvanzaRealWorldLoginSignalPackSafetyFlags = {
  sanitized: true;
  containsCredentials: false;
  containsPassword: false;
  containsPersonalIdentityNumber: false;
  containsAccountNumber: false;
  containsCookie: false;
  containsSessionToken: false;
  containsBankIdQr: false;
  canUseAsFixture: true;
  canUseForLoginPlanning: true;
  canUseForSelectorPlanning: true;
  canAutomateBankId: false;
  canBypassBankId: false;
  canSubmitLogin: false;
  canHandleCredentials: false;
  canFillLoginForm: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
};

export type AvanzaRealWorldLoginSignalPackInput = {
  signalPackId?: string;
  createdAt?: string;
  customerType?: AvanzaLoginCustomerType;
  loginMethod?: AvanzaLoginMethod;
  flowKind?: AvanzaRealWorldLoginFlowKind;
  visibleTexts?: readonly string[];
  toggleLabels?: readonly string[];
  buttonTexts?: readonly string[];
  formLabels?: readonly string[];
  inputLabels?: readonly string[];
  inputTypes?: readonly string[];
  secondaryActions?: readonly string[];
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
};

export type AvanzaRealWorldLoginSignalPack =
  AvanzaRealWorldLoginSignalPackSafetyFlags & {
    signalPackId: string;
    createdAt: string;
    source: "sanitized_user_visual_material";
    customerType: AvanzaLoginCustomerType;
    loginMethod: AvanzaLoginMethod;
    flowKind: AvanzaRealWorldLoginFlowKind;
    observedUrlKind: "avanza_login";
    visibleTexts: string[];
    toggleLabels: string[];
    buttonTexts: string[];
    formLabels: string[];
    inputLabels: string[];
    inputTypes: string[];
    secondaryActions: string[];
    bankIdOptionsDetected: boolean;
    usernamePasswordOptionDetected: boolean;
    companyLoginDetected: boolean;
    privateLoginDetected: boolean;
    warnings: string[];
    blockedReasons: string[];
    safetyFlags: AvanzaRealWorldLoginSignalPackSafetyFlags;
  };

const defaultCreatedAt = "2026-07-05T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid\s*qr\s*data|cookie|credential|password\s*[:=]|personnummer|\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4}|secret|session|storage|token/i;

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

function buildSafetyFlags(): AvanzaRealWorldLoginSignalPackSafetyFlags {
  return {
    sanitized: true,
    containsCredentials: false,
    containsPassword: false,
    containsPersonalIdentityNumber: false,
    containsAccountNumber: false,
    containsCookie: false,
    containsSessionToken: false,
    containsBankIdQr: false,
    canUseAsFixture: true,
    canUseForLoginPlanning: true,
    canUseForSelectorPlanning: true,
    canAutomateBankId: false,
    canBypassBankId: false,
    canSubmitLogin: false,
    canHandleCredentials: false,
    canFillLoginForm: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
  };
}

export function buildAvanzaRealWorldLoginSignalPack(
  input: AvanzaRealWorldLoginSignalPackInput = {},
): AvanzaRealWorldLoginSignalPack {
  const visibleTexts = safeStringArray(input.visibleTexts);
  const toggleLabels = safeStringArray(input.toggleLabels);
  const buttonTexts = safeStringArray(input.buttonTexts);
  const formLabels = safeStringArray(input.formLabels);
  const inputLabels = safeStringArray(input.inputLabels);
  const inputTypes = safeStringArray(input.inputTypes);
  const secondaryActions = safeStringArray(input.secondaryActions);
  const allSignals = normalized([
    ...visibleTexts,
    ...toggleLabels,
    ...buttonTexts,
    ...formLabels,
    ...inputLabels,
    ...secondaryActions,
  ]);
  const bankIdOptionsDetected =
    /bankid|visa qr-kod|öppna bankid på samma enhet|oppna bankid pa samma enhet/.test(
      allSignals,
    );
  const usernamePasswordOptionDetected =
    /anv[aä]ndarnamn och l[oö]senord|anv[aä]ndarnamn|l[oö]senord/.test(
      allSignals,
    );
  const companyLoginDetected =
    /f[oö]retag|f[oö]retagswebben/.test(allSignals);
  const privateLoginDetected = /privat|privatkund/.test(allSignals);
  const safetyFlags = buildSafetyFlags();

  return {
    ...safetyFlags,
    signalPackId: safeText(input.signalPackId) ?? "avanza-login-signal-pack",
    createdAt: safeText(input.createdAt) ?? defaultCreatedAt,
    source: "sanitized_user_visual_material",
    customerType: input.customerType ?? "unknown",
    loginMethod: input.loginMethod ?? "unknown",
    flowKind: input.flowKind ?? "unknown",
    observedUrlKind: "avanza_login",
    visibleTexts,
    toggleLabels,
    buttonTexts,
    formLabels,
    inputLabels,
    inputTypes,
    secondaryActions,
    bankIdOptionsDetected,
    usernamePasswordOptionDetected,
    companyLoginDetected,
    privateLoginDetected,
    warnings: safeStringArray(input.warnings),
    blockedReasons: safeStringArray(input.blockedReasons),
    safetyFlags,
  };
}
