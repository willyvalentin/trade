import {
  buildAvanzaSanitizedPageSnapshot,
  type AvanzaSanitizedPageSnapshot,
  type AvanzaSanitizedPageSnapshotInput,
  type AvanzaSanitizedPageSnapshotKind,
} from "./avanza-sanitized-page-snapshot";

export type AvanzaSanitizedPageSnapshotFixtureId =
  | "sanitized_login_page_notes"
  | "sanitized_username_password_login_notes"
  | "sanitized_bankid_mfa_notes"
  | "sanitized_logged_in_home_notes"
  | "sanitized_account_overview_notes"
  | "sanitized_instrument_page_notes"
  | "sanitized_order_ticket_notes"
  | "sanitized_order_review_notes"
  | "sanitized_order_confirmation_notes"
  | "blocked_password_material"
  | "blocked_personnummer_material"
  | "blocked_cookie_session_material"
  | "blocked_bankid_qr_material";

export type AvanzaSanitizedPageSnapshotFixture = {
  fixtureId: AvanzaSanitizedPageSnapshotFixtureId;
  label: string;
  expectedKind: AvanzaSanitizedPageSnapshotKind;
  input: AvanzaSanitizedPageSnapshotInput;
  snapshot: AvanzaSanitizedPageSnapshot;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

function buildFixture(
  fixtureId: AvanzaSanitizedPageSnapshotFixtureId,
  label: string,
  expectedKind: AvanzaSanitizedPageSnapshotKind,
  input: AvanzaSanitizedPageSnapshotInput,
): AvanzaSanitizedPageSnapshotFixture {
  return {
    fixtureId,
    label,
    expectedKind,
    input,
    snapshot: buildAvanzaSanitizedPageSnapshot({
      createdAt: fixtureNow,
      snapshotId: fixtureId,
      ...input,
    }),
  };
}

export const avanzaSanitizedPageSnapshotFixtures:
  AvanzaSanitizedPageSnapshotFixture[] = [
    buildFixture("sanitized_login_page_notes", "Sanitized login page notes", "login", {
      buttonTexts: ["Logga in"],
      formLabels: ["Användarnamn"],
      inputPlaceholders: ["Användarnamn"],
      kind: "login",
      observedUrlKind: "avanza_login",
      source: "manual_screenshot_notes",
      titleText: "Avanza login",
      visibleTextSignals: ["Välkommen till Avanza", "Logga in"],
    }),
    buildFixture(
      "sanitized_username_password_login_notes",
      "Sanitized username/password login page notes",
      "username_password_login",
      {
        buttonTexts: ["Fortsätt"],
        formLabels: ["Användarnamn", "Lösenord"],
        inputPlaceholders: ["Användarnamn", "Lösenord"],
        kind: "username_password_login",
        observedUrlKind: "avanza_login",
        source: "manual_dom_notes",
        titleText: "Avanza username password login",
        visibleTextSignals: ["Logga in med användarnamn"],
        warnings: ["field names only; no entered values"],
      },
    ),
    buildFixture(
      "sanitized_bankid_mfa_notes",
      "Sanitized BankID/MFA page notes",
      "bankid_or_mfa",
      {
        buttonTexts: ["Starta BankID på annan enhet"],
        kind: "bankid_or_mfa",
        observedUrlKind: "avanza_login",
        source: "manual_screenshot_notes",
        titleText: "Avanza manual verification",
        visibleTextSignals: ["Verifiering krävs", "Öppna BankID manuellt"],
        warnings: ["no QR code or token included"],
      },
    ),
    buildFixture(
      "sanitized_logged_in_home_notes",
      "Sanitized logged-in home notes",
      "logged_in_home",
      {
        buttonTexts: ["Mina sidor"],
        kind: "logged_in_home",
        observedUrlKind: "avanza_account",
        source: "manual_screenshot_notes",
        titleText: "Avanza logged-in home",
        visibleTextSignals: ["Mina sidor", "Översikt", "Innehav"],
      },
    ),
    buildFixture(
      "sanitized_account_overview_notes",
      "Sanitized account overview notes",
      "account_overview",
      {
        kind: "account_overview",
        observedUrlKind: "avanza_account",
        source: "manual_dom_notes",
        titleText: "Avanza account overview",
        visibleTextSignals: ["Kontoöversikt", "Innehav", "Account number masked"],
        warnings: ["account numbers redacted before fixture creation"],
      },
    ),
    buildFixture(
      "sanitized_instrument_page_notes",
      "Sanitized instrument page notes",
      "instrument_page",
      {
        buttonTexts: ["Köp", "Sälj"],
        kind: "instrument_page",
        observedUrlKind: "avanza_instrument",
        source: "manual_screenshot_notes",
        titleText: "Avanza instrument page",
        visibleTextSignals: ["Instrument", "Senast betalt", "Orderdjup"],
      },
    ),
    buildFixture(
      "sanitized_order_ticket_notes",
      "Sanitized order ticket notes",
      "order_ticket",
      {
        buttonTexts: ["Granska"],
        formLabels: ["Antal", "Limitpris"],
        inputPlaceholders: ["Antal", "Pris"],
        kind: "order_ticket",
        observedUrlKind: "avanza_order",
        source: "manual_dom_notes",
        titleText: "Avanza order ticket",
        visibleTextSignals: ["Köporder", "Säljorder", "Ordervillkor"],
      },
    ),
    buildFixture(
      "sanitized_order_review_notes",
      "Sanitized order review notes",
      "order_review",
      {
        buttonTexts: ["Manual final confirmation"],
        kind: "order_review",
        observedUrlKind: "avanza_review",
        source: "manual_screenshot_notes",
        titleText: "Avanza order review",
        visibleTextSignals: ["Granska order", "Kontrollera ordern"],
      },
    ),
    buildFixture(
      "sanitized_order_confirmation_notes",
      "Sanitized order confirmation notes",
      "order_confirmation",
      {
        kind: "order_confirmation",
        observedUrlKind: "avanza_confirmation",
        source: "manual_screenshot_notes",
        titleText: "Avanza order confirmation",
        visibleTextSignals: ["Order mottagen", "Kvittens"],
      },
    ),
    buildFixture(
      "blocked_password_material",
      "Blocked password-like material",
      "username_password_login",
      {
        inputPlaceholders: ["Lösenord"],
        kind: "username_password_login",
        observedUrlKind: "avanza_login",
        source: "manual_dom_notes",
        visibleTextSignals: ["password: sample-placeholder"],
      },
    ),
    buildFixture(
      "blocked_personnummer_material",
      "Blocked personnummer-like material",
      "login",
      {
        kind: "login",
        observedUrlKind: "avanza_login",
        source: "manual_screenshot_notes",
        visibleTextSignals: ["Personnummer 19900101-1234"],
      },
    ),
    buildFixture(
      "blocked_cookie_session_material",
      "Blocked cookie/session-like material",
      "logged_in_home",
      {
        kind: "logged_in_home",
        observedUrlKind: "avanza_account",
        source: "local_dev_snapshot",
        visibleTextSignals: ["set-cookie: avanza_session=abc", "token value"],
      },
    ),
    buildFixture(
      "blocked_bankid_qr_material",
      "Blocked BankID QR-like material",
      "bankid_or_mfa",
      {
        kind: "bankid_or_mfa",
        observedUrlKind: "avanza_login",
        source: "manual_screenshot_notes",
        visibleTextSignals: ["BankID QR code visible"],
      },
    ),
  ];

export const avanzaSanitizedPageSnapshotDefaultFixture =
  avanzaSanitizedPageSnapshotFixtures[0];
