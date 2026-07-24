import {
  buildAvanzaRealWorldLoginSignalPack,
  type AvanzaRealWorldLoginSignalPack,
  type AvanzaRealWorldLoginSignalPackInput,
} from "./avanza-real-world-login-signals";

export type AvanzaRealWorldLoginSignalFixtureId =
  | "initial_login_choice_page"
  | "private_toggle_detected"
  | "company_toggle_detected"
  | "username_password_option_detected"
  | "private_username_password_form"
  | "company_username_password_form"
  | "bankid_qr_option_forbidden"
  | "bankid_same_device_option_forbidden";

export type AvanzaRealWorldLoginSignalFixture = {
  fixtureId: AvanzaRealWorldLoginSignalFixtureId;
  label: string;
  expectedFlowKind: AvanzaRealWorldLoginSignalPack["flowKind"];
  expectedCustomerType: AvanzaRealWorldLoginSignalPack["customerType"];
  expectedLoginMethod: AvanzaRealWorldLoginSignalPack["loginMethod"];
  input: AvanzaRealWorldLoginSignalPackInput;
  signalPack: AvanzaRealWorldLoginSignalPack;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

function buildFixture(
  fixtureId: AvanzaRealWorldLoginSignalFixtureId,
  label: string,
  input: AvanzaRealWorldLoginSignalPackInput,
): AvanzaRealWorldLoginSignalFixture {
  const signalPack = buildAvanzaRealWorldLoginSignalPack({
    createdAt: fixtureNow,
    signalPackId: fixtureId,
    ...input,
  });

  return {
    fixtureId,
    label,
    expectedFlowKind: signalPack.flowKind,
    expectedCustomerType: signalPack.customerType,
    expectedLoginMethod: signalPack.loginMethod,
    input,
    signalPack,
  };
}

export const avanzaRealWorldLoginSignalFixtures:
  AvanzaRealWorldLoginSignalFixture[] = [
    buildFixture("initial_login_choice_page", "Initial Avanza login choice page", {
      buttonTexts: ["Logga in"],
      flowKind: "initial_login_choice",
      loginMethod: "unknown",
      customerType: "unknown",
      secondaryActions: ["Bli kund", "Hjälp att logga in"],
      toggleLabels: ["Privat", "Företag"],
      visibleTexts: ["Logga in", "Privat", "Företag"],
      warnings: ["sanitized visual material only; no credential values"],
    }),
    buildFixture("private_toggle_detected", "Private login toggle detected", {
      buttonTexts: ["Logga in"],
      flowKind: "initial_login_choice",
      loginMethod: "unknown",
      customerType: "private",
      toggleLabels: ["Privat", "Företag"],
      visibleTexts: ["Privat", "Användarnamn och lösenord"],
      warnings: ["private toggle is a selector-planning signal only"],
    }),
    buildFixture("company_toggle_detected", "Company login toggle detected", {
      buttonTexts: ["Logga in"],
      flowKind: "initial_login_choice",
      loginMethod: "unknown",
      customerType: "company",
      secondaryActions: ["Logga in på företagswebben"],
      toggleLabels: ["Privat", "Företag"],
      visibleTexts: ["Företag", "Logga in på företagswebben"],
      warnings: ["company toggle is a selector-planning signal only"],
    }),
    buildFixture(
      "username_password_option_detected",
      "Username/password option detected",
      {
        buttonTexts: ["Användarnamn och lösenord"],
        flowKind: "initial_login_choice",
        loginMethod: "username_password",
        customerType: "private",
        toggleLabels: ["Privat"],
        visibleTexts: ["Användarnamn och lösenord", "Logga in"],
        warnings: [
          "option text is safe; no username value and no password value included",
        ],
      },
    ),
    buildFixture(
      "private_username_password_form",
      "Private username/password login form",
      {
        buttonTexts: ["Logga in"],
        flowKind: "private_username_password_login",
        formLabels: ["Privatkund"],
        inputLabels: ["Användarnamn", "Lösenord"],
        inputTypes: ["text", "masked-field-type-only"],
        loginMethod: "username_password",
        customerType: "private",
        secondaryActions: ["Avbryt"],
        toggleLabels: ["Privat"],
        visibleTexts: ["Privatkund", "Användarnamn", "Lösenord", "Avbryt"],
        warnings: ["field labels only; no entered credential values"],
      },
    ),
    buildFixture(
      "company_username_password_form",
      "Company username/password login form",
      {
        buttonTexts: ["Logga in"],
        flowKind: "company_username_password_login",
        formLabels: ["Företag"],
        inputLabels: ["Användarnamn", "Lösenord"],
        inputTypes: ["text", "masked-field-type-only"],
        loginMethod: "username_password",
        customerType: "company",
        secondaryActions: ["Logga in på företagswebben"],
        toggleLabels: ["Företag"],
        visibleTexts: [
          "Företag",
          "Användarnamn",
          "Lösenord",
          "Logga in på företagswebben",
        ],
        warnings: ["company login is model-only and non-executing"],
      },
    ),
    buildFixture("bankid_qr_option_forbidden", "BankID QR option detected", {
      buttonTexts: ["Visa QR-kod"],
      blockedReasons: ["BankID QR is detected but forbidden for automation"],
      flowKind: "bankid_qr_option",
      loginMethod: "bankid_qr",
      customerType: "unknown",
      visibleTexts: ["BankID", "Visa QR-kod"],
      warnings: ["no QR payload or image is stored"],
    }),
    buildFixture(
      "bankid_same_device_option_forbidden",
      "BankID same-device option detected",
      {
        buttonTexts: ["Öppna BankID på samma enhet"],
        blockedReasons: [
          "same-device BankID is detected but forbidden for automation",
        ],
        flowKind: "bankid_same_device_option",
        loginMethod: "bankid_same_device",
        customerType: "unknown",
        visibleTexts: ["BankID", "Öppna BankID på samma enhet"],
        warnings: ["manual user action remains required"],
      },
    ),
  ];

export const avanzaRealWorldLoginSignalDefaultFixture =
  avanzaRealWorldLoginSignalFixtures[0];
