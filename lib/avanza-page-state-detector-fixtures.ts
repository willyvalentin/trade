import {
  buildAvanzaPageStateModel,
  type AvanzaPageStateModel,
  type AvanzaPageStateModelInput,
  type AvanzaPageStateStatus,
} from "./avanza-page-state-detector";

export type AvanzaPageStateDetectorFixtureId =
  | "disabled_not_checked"
  | "unknown"
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

export type AvanzaPageStateDetectorFixture = {
  fixtureId: AvanzaPageStateDetectorFixtureId;
  label: string;
  expectedStatus: AvanzaPageStateStatus;
  input: AvanzaPageStateModelInput;
  modelResult: AvanzaPageStateModel;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

function buildFixture(
  fixtureId: AvanzaPageStateDetectorFixtureId,
  label: string,
  expectedStatus: AvanzaPageStateStatus,
  input: AvanzaPageStateModelInput,
): AvanzaPageStateDetectorFixture {
  return {
    fixtureId,
    label,
    expectedStatus,
    input,
    modelResult: buildAvanzaPageStateModel(input),
  };
}

export const avanzaPageStateDetectorFixtures: AvanzaPageStateDetectorFixture[] =
  [
    buildFixture(
      "disabled_not_checked",
      "Disabled detector not checked",
      "not_checked",
      {
        mode: "disabled",
        now: fixtureNow,
      },
    ),
    buildFixture("unknown", "Unknown page state", "unknown", {
      detectorEnabled: true,
      mode: "snapshot_model",
      now: fixtureNow,
      observedTextSignals: ["visible page content"],
    }),
    buildFixture("non_avanza_page", "Non-Avanza page", "non_avanza_page", {
      detectorEnabled: true,
      mode: "snapshot_model",
      now: fixtureNow,
      observedTextSignals: ["Example page"],
      observedUrl: "https://example.test/",
    }),
    buildFixture(
      "avanza_public_page",
      "Avanza public page",
      "avanza_public_page",
      {
        detectorEnabled: true,
        mode: "snapshot_model",
        now: fixtureNow,
        observedTextSignals: ["Avanza public market page"],
        observedUrl: "https://www.avanza.se/",
      },
    ),
    buildFixture("avanza_login_page", "Avanza login page", "avanza_login_page", {
      detectorEnabled: true,
      mode: "local_dev_snapshot",
      now: fixtureNow,
      observedFormSignals: ["username field", "password field"],
      observedTextSignals: ["Logga in"],
      observedUrl: "https://www.avanza.se/logga-in",
    }),
    buildFixture(
      "avanza_logged_in_home",
      "Avanza logged-in home",
      "avanza_logged_in_home",
      {
        detectorEnabled: true,
        mode: "local_dev_snapshot",
        now: fixtureNow,
        observedTextSignals: ["logged in mina sidor"],
        observedUrl: "https://www.avanza.se/mina-sidor",
      },
    ),
    buildFixture(
      "avanza_account_overview",
      "Avanza account overview",
      "avanza_account_overview",
      {
        detectorEnabled: true,
        mode: "local_dev_snapshot",
        now: fixtureNow,
        observedTextSignals: ["account overview portfolio innehav"],
        observedUrl: "https://www.avanza.se/mina-sidor/overview",
      },
    ),
    buildFixture(
      "avanza_instrument_page",
      "Avanza instrument page",
      "avanza_instrument_page",
      {
        detectorEnabled: true,
        mode: "local_dev_snapshot",
        now: fixtureNow,
        observedTextSignals: ["ticker instrument senast betalt orderdjup"],
        observedUrl: "https://www.avanza.se/aktier/om-aktien.html",
      },
    ),
    buildFixture("avanza_order_ticket", "Avanza order ticket", "avanza_order_ticket", {
      detectorEnabled: true,
      mode: "local_dev_snapshot",
      now: fixtureNow,
      observedFormSignals: ["limitpris", "antal"],
      observedTextSignals: ["order ticket köporder"],
      observedUrl: "https://www.avanza.se/order",
    }),
    buildFixture("avanza_order_review", "Avanza order review", "avanza_order_review", {
      detectorEnabled: true,
      mode: "local_dev_snapshot",
      now: fixtureNow,
      observedButtonSignals: ["manual review button visible"],
      observedTextSignals: ["order review granska köp"],
      observedUrl: "https://www.avanza.se/order/review",
    }),
    buildFixture(
      "avanza_order_confirmation",
      "Avanza order confirmation",
      "avanza_order_confirmation",
      {
        detectorEnabled: true,
        mode: "local_dev_snapshot",
        now: fixtureNow,
        observedTextSignals: ["order confirmation order received"],
        observedUrl: "https://www.avanza.se/order/confirmation",
      },
    ),
    buildFixture(
      "avanza_bankid_or_mfa",
      "Avanza BankID or MFA required",
      "avanza_bankid_or_mfa",
      {
        detectorEnabled: true,
        mode: "local_dev_snapshot",
        now: fixtureNow,
        observedTextSignals: ["BankID verification required"],
        warnings: ["manual action only"],
      },
    ),
    buildFixture("avanza_error_page", "Avanza error page", "avanza_error_page", {
      detectorEnabled: true,
      mode: "local_dev_snapshot",
      now: fixtureNow,
      observedTextSignals: ["technical problem temporarily unavailable"],
      observedUrl: "https://www.avanza.se/",
    }),
    buildFixture("blocked", "Detector blocked", "blocked", {
      blockedReasons: ["page snapshot guard blocked"],
      detectorEnabled: true,
      mode: "local_dev_snapshot",
      now: fixtureNow,
    }),
  ];

export const avanzaPageStateDetectorDefaultFixture =
  avanzaPageStateDetectorFixtures[0];
