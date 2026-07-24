import {
  buildAvanzaLoginStateModel,
  type AvanzaLoginStateModel,
  type AvanzaLoginStateModelInput,
  type AvanzaLoginStateStatus,
} from "./avanza-login-state-detector";
import {
  createLocalDevAvanzaBrowserAgentRuntime,
} from "./avanza-local-browser-agent-runtime";

export type AvanzaLoginStateDetectorFixtureId =
  | "disabled_not_checked"
  | "unknown"
  | "logged_in"
  | "logged_out"
  | "login_page_detected"
  | "username_password_possible"
  | "mfa_or_bankid_required"
  | "manual_user_action_required"
  | "blocked"
  | "error";

export type AvanzaLoginStateDetectorFixture = {
  expectedStatus: AvanzaLoginStateStatus;
  fixtureId: AvanzaLoginStateDetectorFixtureId;
  input: AvanzaLoginStateModelInput;
  label: string;
  modelResult: AvanzaLoginStateModel;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";
const readyRuntime = createLocalDevAvanzaBrowserAgentRuntime({
  allowReadPage: true,
  runtimeEnabled: true,
});

function buildFixture(
  fixtureId: AvanzaLoginStateDetectorFixtureId,
  label: string,
  expectedStatus: AvanzaLoginStateStatus,
  input: AvanzaLoginStateModelInput,
): AvanzaLoginStateDetectorFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    modelResult: buildAvanzaLoginStateModel(input),
  };
}

export const avanzaLoginStateDetectorFixtures: AvanzaLoginStateDetectorFixture[] =
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
    buildFixture("unknown", "Unknown login state", "unknown", {
      detectorEnabled: true,
      mode: "read_only_model",
      now: fixtureNow,
      observedTextSignals: ["Avanza page visible"],
      runtimeState: readyRuntime,
    }),
    buildFixture("logged_in", "Logged in", "logged_in", {
      detectorEnabled: true,
      mode: "local_dev_read_only",
      now: fixtureNow,
      observedTextSignals: ["Logged in account overview portfolio"],
      observedUrl: "https://www.avanza.se/mina-sidor/overview",
      runtimeState: readyRuntime,
    }),
    buildFixture("logged_out", "Logged out", "logged_out", {
      detectorEnabled: true,
      mode: "local_dev_read_only",
      now: fixtureNow,
      observedTextSignals: ["logged out"],
      observedUrl: "https://www.avanza.se/",
      runtimeState: readyRuntime,
    }),
    buildFixture(
      "login_page_detected",
      "Login page detected",
      "login_page_detected",
      {
        detectorEnabled: true,
        mode: "local_dev_read_only",
        now: fixtureNow,
        observedTextSignals: ["Logga in"],
        observedUrl: "https://www.avanza.se/logga-in",
        runtimeState: readyRuntime,
      },
    ),
    buildFixture(
      "username_password_possible",
      "Username/password possible",
      "username_password_possible",
      {
        detectorEnabled: true,
        mode: "local_dev_read_only",
        now: fixtureNow,
        observedFormSignals: ["username field", "password field"],
        observedUrl: "https://www.avanza.se/logga-in",
        runtimeState: readyRuntime,
      },
    ),
    buildFixture(
      "mfa_or_bankid_required",
      "MFA or BankID required",
      "mfa_or_bankid_required",
      {
        detectorEnabled: true,
        mode: "local_dev_read_only",
        now: fixtureNow,
        observedTextSignals: ["BankID verification required"],
        runtimeState: readyRuntime,
      },
    ),
    buildFixture(
      "manual_user_action_required",
      "Manual user action required",
      "manual_user_action_required",
      {
        detectorEnabled: true,
        mode: "local_dev_read_only",
        now: fixtureNow,
        observedTextSignals: ["user action required"],
        runtimeState: readyRuntime,
      },
    ),
    buildFixture("blocked", "Detector blocked", "blocked", {
      blockedReasons: ["runtime safety guard blocked"],
      detectorEnabled: true,
      mode: "local_dev_read_only",
      now: fixtureNow,
      runtimeState: readyRuntime,
    }),
    buildFixture("error", "Detector error", "error", {
      detectorEnabled: true,
      forceError: true,
      mode: "local_dev_read_only",
      now: fixtureNow,
      runtimeState: readyRuntime,
    }),
  ];

export const avanzaLoginStateDetectorDefaultFixture =
  avanzaLoginStateDetectorFixtures[0];
