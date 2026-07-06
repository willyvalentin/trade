import {
  buildAvanzaLocalPlaywrightBrowserAdapterState,
  createDisabledAvanzaLocalPlaywrightBrowserAdapter,
  createLocalDevAvanzaLocalPlaywrightBrowserAdapter,
  type AvanzaLocalPlaywrightBrowserAdapterConfig,
  type AvanzaLocalPlaywrightBrowserAdapterState,
  type AvanzaLocalPlaywrightBrowserAdapterStatus,
} from "./avanza-local-playwright-browser-adapter";

export type AvanzaLocalPlaywrightBrowserAdapterFixtureId =
  | "disabled_default"
  | "adapter_unavailable"
  | "adapter_ready_local_dev"
  | "browser_launch_available"
  | "browser_connect_available"
  | "browser_connected_modeled"
  | "page_snapshot_read_modeled"
  | "navigation_blocked"
  | "form_fill_blocked"
  | "final_buy_click_forbidden"
  | "final_sell_click_forbidden"
  | "credential_handling_forbidden"
  | "cookie_session_export_forbidden"
  | "bankid_bypass_forbidden"
  | "adapter_error"
  | "unknown";

export type AvanzaLocalPlaywrightBrowserAdapterFixture = {
  fixtureId: AvanzaLocalPlaywrightBrowserAdapterFixtureId;
  label: string;
  expectedStatus: AvanzaLocalPlaywrightBrowserAdapterStatus;
  input: AvanzaLocalPlaywrightBrowserAdapterConfig;
  modelResult: AvanzaLocalPlaywrightBrowserAdapterState;
};

const fixtureNow = "2026-07-05T12:00:00.000Z";

const modeledPageSnapshot = {
  capturedAt: fixtureNow,
  formSignals: ["read-only form presence modeled"],
  observedUrl: "about:blank",
  snapshotId: "fixture-page-snapshot-read-only",
  textSignals: ["fixture-only page title", "no Avanza navigation"],
  title: "Fixture page snapshot",
};

function buildFixture(
  fixtureId: AvanzaLocalPlaywrightBrowserAdapterFixtureId,
  label: string,
  expectedStatus: AvanzaLocalPlaywrightBrowserAdapterStatus,
  input: AvanzaLocalPlaywrightBrowserAdapterConfig,
  modelResult = buildAvanzaLocalPlaywrightBrowserAdapterState(input),
): AvanzaLocalPlaywrightBrowserAdapterFixture {
  return {
    fixtureId,
    label,
    expectedStatus,
    input,
    modelResult,
  };
}

export const avanzaLocalPlaywrightBrowserAdapterFixtures:
  AvanzaLocalPlaywrightBrowserAdapterFixture[] = [
    buildFixture(
      "disabled_default",
      "Disabled default",
      "adapter_disabled",
      {
        createdAt: fixtureNow,
      },
      createDisabledAvanzaLocalPlaywrightBrowserAdapter({
        createdAt: fixtureNow,
      }).getState(),
    ),
    buildFixture("adapter_unavailable", "Adapter unavailable", "adapter_unavailable", {
      adapterAvailable: false,
      createdAt: fixtureNow,
      enabled: true,
      mode: "local_dev",
    }),
    buildFixture(
      "adapter_ready_local_dev",
      "Adapter ready local dev",
      "adapter_ready",
      {
        allowReadPageSnapshot: true,
        allowedOrigins: ["about:blank"],
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
        warnings: ["adapter callable contract modeled"],
      },
      createLocalDevAvanzaLocalPlaywrightBrowserAdapter({
        allowReadPageSnapshot: true,
        allowedOrigins: ["about:blank"],
        createdAt: fixtureNow,
        warnings: ["adapter callable contract modeled"],
      }).getState(),
    ),
    buildFixture(
      "browser_launch_available",
      "Browser launch available",
      "browser_launch_available",
      {
        allowLaunchBrowser: true,
        allowedOrigins: ["about:blank"],
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
        warnings: ["launch is explicit-call only"],
      },
    ),
    buildFixture(
      "browser_connect_available",
      "Browser connect available",
      "browser_connect_available",
      {
        allowConnectToExistingBrowser: true,
        allowedOrigins: ["about:blank"],
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
        warnings: ["connect is explicit-call only"],
      },
    ),
    buildFixture(
      "browser_connected_modeled",
      "Browser connected modeled",
      "browser_connected",
      {
        allowConnectToExistingBrowser: true,
        browserConnected: true,
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
        warnings: ["browser connection modeled only"],
      },
    ),
    buildFixture(
      "page_snapshot_read_modeled",
      "Page snapshot read modeled",
      "page_snapshot_read",
      {
        allowReadPageSnapshot: true,
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
        pageSnapshot: modeledPageSnapshot,
        warnings: ["page snapshot is sanitized fixture output"],
      },
    ),
    buildFixture("navigation_blocked", "Navigation blocked", "adapter_blocked", {
      allowNavigate: true,
      createdAt: fixtureNow,
      enabled: true,
      mode: "local_dev",
    }),
    buildFixture("form_fill_blocked", "Form fill blocked", "adapter_blocked", {
      allowFormFill: true,
      createdAt: fixtureNow,
      enabled: true,
      mode: "local_dev",
    }),
    buildFixture(
      "final_buy_click_forbidden",
      "Final buy click forbidden",
      "adapter_blocked",
      {
        allowFinalBuyClick: true,
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
      },
    ),
    buildFixture(
      "final_sell_click_forbidden",
      "Final sell click forbidden",
      "adapter_blocked",
      {
        allowFinalSellClick: true,
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
      },
    ),
    buildFixture(
      "credential_handling_forbidden",
      "Credential handling forbidden",
      "adapter_blocked",
      {
        allowCredentialHandling: true,
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
      },
    ),
    buildFixture(
      "cookie_session_export_forbidden",
      "Cookie and session export forbidden",
      "adapter_blocked",
      {
        allowCookieRead: true,
        allowSessionExport: true,
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
      },
    ),
    buildFixture(
      "bankid_bypass_forbidden",
      "BankID bypass forbidden",
      "adapter_blocked",
      {
        allowBankIdBypass: true,
        createdAt: fixtureNow,
        enabled: true,
        mode: "local_dev",
      },
    ),
    buildFixture("adapter_error", "Adapter error", "adapter_error", {
      createdAt: fixtureNow,
      enabled: true,
      forceError: true,
      mode: "local_dev",
    }),
    buildFixture("unknown", "Unknown", "unknown", {
      createdAt: fixtureNow,
      statusOverride: "unknown",
    }),
  ];

export const avanzaLocalPlaywrightBrowserAdapterDefaultFixture =
  avanzaLocalPlaywrightBrowserAdapterFixtures[0];
