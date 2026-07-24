import {
  buildAvanzaLocalBrowserAgentRuntimeState,
  createDisabledAvanzaLocalBrowserAgentRuntime,
  createLocalDevAvanzaBrowserAgentRuntime,
  type AvanzaLocalBrowserAgentRuntimeConfig,
  type AvanzaLocalBrowserAgentRuntimeState,
  type AvanzaLocalBrowserAgentRuntimeStatus,
} from "./avanza-local-browser-agent-runtime";

export type AvanzaLocalBrowserAgentRuntimeFixtureId =
  | "disabled_default"
  | "runtime_unavailable"
  | "runtime_blocked"
  | "local_dev_ready_modeled"
  | "local_dev_browser_launch_allowed"
  | "local_dev_connect_existing_browser_allowed"
  | "local_dev_read_only_navigation_allowed"
  | "runtime_error"
  | "unknown";

export type AvanzaLocalBrowserAgentRuntimeFixture = {
  expectedStatus: AvanzaLocalBrowserAgentRuntimeStatus;
  fixtureId: AvanzaLocalBrowserAgentRuntimeFixtureId;
  input: AvanzaLocalBrowserAgentRuntimeConfig;
  label: string;
  modelResult: AvanzaLocalBrowserAgentRuntimeState;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

function buildFixture(
  fixtureId: AvanzaLocalBrowserAgentRuntimeFixtureId,
  label: string,
  expectedStatus: AvanzaLocalBrowserAgentRuntimeStatus,
  input: AvanzaLocalBrowserAgentRuntimeConfig,
  modelResult = buildAvanzaLocalBrowserAgentRuntimeState(input),
): AvanzaLocalBrowserAgentRuntimeFixture {
  return {
    expectedStatus,
    fixtureId,
    input,
    label,
    modelResult,
  };
}

export const avanzaLocalBrowserAgentRuntimeFixtures: AvanzaLocalBrowserAgentRuntimeFixture[] =
  [
    buildFixture(
      "disabled_default",
      "Disabled default runtime",
      "runtime_disabled",
      {
        createdAt: fixtureNow,
      },
      createDisabledAvanzaLocalBrowserAgentRuntime({
        createdAt: fixtureNow,
      }),
    ),
    buildFixture(
      "runtime_unavailable",
      "Runtime unavailable",
      "runtime_unavailable",
      {
        browserProvider: "unknown",
        createdAt: fixtureNow,
        mode: "local_dev",
        runtimeAvailable: false,
        runtimeEnabled: true,
      },
    ),
    buildFixture(
      "runtime_blocked",
      "Runtime blocked",
      "runtime_blocked",
      {
        blockedReasons: ["explicit runtime guard blocked"],
        browserProvider: "playwright",
        createdAt: fixtureNow,
        mode: "local_dev",
        runtimeAvailable: true,
        runtimeBlocked: true,
        runtimeEnabled: true,
      },
    ),
    buildFixture(
      "local_dev_ready_modeled",
      "Local dev ready modeled",
      "runtime_ready_local_dev",
      {
        browserProvider: "playwright",
        createdAt: fixtureNow,
        mode: "local_dev",
        runtimeAvailable: true,
        runtimeEnabled: true,
        warnings: ["model-only readiness"],
      },
      createLocalDevAvanzaBrowserAgentRuntime({
        createdAt: fixtureNow,
        runtimeEnabled: true,
        warnings: ["model-only readiness"],
      }),
    ),
    buildFixture(
      "local_dev_browser_launch_allowed",
      "Local dev browser launch allowed",
      "runtime_ready_local_dev",
      {
        allowLaunchBrowser: true,
        browserProvider: "playwright",
        createdAt: fixtureNow,
        mode: "local_dev",
        runtimeAvailable: true,
        runtimeEnabled: true,
        warnings: ["launch capability modeled only"],
      },
    ),
    buildFixture(
      "local_dev_connect_existing_browser_allowed",
      "Local dev existing browser connection allowed",
      "runtime_ready_local_dev",
      {
        allowConnectToExistingBrowser: true,
        browserProvider: "playwright",
        createdAt: fixtureNow,
        mode: "local_dev",
        runtimeAvailable: true,
        runtimeEnabled: true,
        warnings: ["existing browser connection modeled only"],
      },
    ),
    buildFixture(
      "local_dev_read_only_navigation_allowed",
      "Local dev read-only navigation allowed",
      "runtime_ready_local_dev",
      {
        allowConnectToExistingBrowser: true,
        allowNavigate: true,
        allowReadPage: true,
        browserProvider: "playwright",
        createdAt: fixtureNow,
        mode: "local_dev",
        runtimeAvailable: true,
        runtimeEnabled: true,
        warnings: ["read-only navigation modeled only"],
      },
    ),
    buildFixture(
      "runtime_error",
      "Runtime error",
      "runtime_error",
      {
        browserProvider: "playwright",
        createdAt: fixtureNow,
        forceError: true,
        mode: "local_dev",
        runtimeAvailable: true,
        runtimeEnabled: true,
      },
    ),
    buildFixture("unknown", "Unknown runtime", "unknown", {
      createdAt: fixtureNow,
      statusOverride: "unknown",
    }),
  ];

export const avanzaLocalBrowserAgentRuntimeDefaultFixture =
  avanzaLocalBrowserAgentRuntimeFixtures[0];
