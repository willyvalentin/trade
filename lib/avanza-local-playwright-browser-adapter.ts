export type AvanzaLocalPlaywrightBrowserAdapterMode =
  | "disabled"
  | "local_dev";

export type AvanzaLocalPlaywrightBrowserAdapterStatus =
  | "adapter_disabled"
  | "adapter_unavailable"
  | "adapter_ready"
  | "browser_launch_available"
  | "browser_connect_available"
  | "browser_connected"
  | "page_snapshot_read"
  | "adapter_blocked"
  | "adapter_error"
  | "unknown";

export type AvanzaLocalPlaywrightBrowserPageSnapshot = {
  snapshotId: string;
  observedUrl: string;
  title?: string;
  textSignals: string[];
  formSignals: string[];
  capturedAt: string;
};

export type AvanzaLocalPlaywrightBrowserAdapterSafetyFlags = {
  adapterEnabled: boolean;
  localDevOnly: boolean;
  canLaunchBrowser: boolean;
  canConnectToExistingBrowser: boolean;
  canReadPageSnapshot: boolean;
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
  canWriteSupabaseExecution: false;
  userMustConfirm: true;
  finalHumanClickRequired: true;
  controlsEnabled: false;
  gateLocked: true;
};

export type AvanzaLocalPlaywrightBrowserAdapterConfig = {
  adapterId?: string;
  mode?: AvanzaLocalPlaywrightBrowserAdapterMode;
  enabled?: boolean;
  provider?: "playwright";
  localOnly?: boolean;
  adapterAvailable?: boolean;
  browserConnected?: boolean;
  allowLaunchBrowser?: boolean;
  allowConnectToExistingBrowser?: boolean;
  allowReadPageSnapshot?: boolean;
  allowNavigate?: boolean;
  allowFormFill?: boolean;
  allowClick?: boolean;
  allowFinalBuyClick?: boolean;
  allowFinalSellClick?: boolean;
  allowSubmitOrder?: boolean;
  allowCredentialHandling?: boolean;
  allowCookieRead?: boolean;
  allowSessionExport?: boolean;
  allowBankIdBypass?: boolean;
  allowedOrigins?: readonly string[];
  pageSnapshot?: AvanzaLocalPlaywrightBrowserPageSnapshot;
  createdAt?: string;
  now?: string;
  label?: string;
  reason?: string;
  warnings?: readonly string[];
  blockedReasons?: readonly string[];
  forceError?: boolean;
  statusOverride?: AvanzaLocalPlaywrightBrowserAdapterStatus;
};

export type AvanzaLocalPlaywrightBrowserAdapterState =
  AvanzaLocalPlaywrightBrowserAdapterSafetyFlags & {
    adapterId: string;
    mode: AvanzaLocalPlaywrightBrowserAdapterMode;
    provider: "playwright";
    localOnly: boolean;
    status: AvanzaLocalPlaywrightBrowserAdapterStatus;
    label: string;
    reason: string;
    allowedOrigins: string[];
    createdAt: string;
    now: string;
    warnings: string[];
    blockedReasons: string[];
    pageSnapshot?: AvanzaLocalPlaywrightBrowserPageSnapshot;
    safetyFlags: AvanzaLocalPlaywrightBrowserAdapterSafetyFlags;
  };

export type AvanzaLocalPlaywrightBrowserAdapterResult = {
  resultId: string;
  status: AvanzaLocalPlaywrightBrowserAdapterStatus;
  label: string;
  reason: string;
  state: AvanzaLocalPlaywrightBrowserAdapterState;
  pageSnapshot?: AvanzaLocalPlaywrightBrowserPageSnapshot;
  warnings: string[];
  blockedReasons: string[];
  didLaunchBrowser: boolean;
  didConnectToBrowser: boolean;
  didReadPageSnapshot: boolean;
  didNavigate: false;
  didFillForm: false;
  didClick: false;
  didSubmitOrder: false;
  credentialMaterialTouched: false;
  cookiesTouched: false;
  sessionMaterialTouched: false;
  supabaseWriteAttempted: false;
};

export type AvanzaLocalPlaywrightBrowserAdapterDependencies = {
  launchBrowser?: () => Promise<unknown> | unknown;
  connectToExistingBrowser?: () => Promise<unknown> | unknown;
  readCurrentPageSnapshot?: () =>
    | Promise<AvanzaLocalPlaywrightBrowserPageSnapshot>
    | AvanzaLocalPlaywrightBrowserPageSnapshot;
};

export type AvanzaLocalPlaywrightBrowserAdapter = {
  getState: () => AvanzaLocalPlaywrightBrowserAdapterState;
  launchBrowser: () => Promise<AvanzaLocalPlaywrightBrowserAdapterResult>;
  connectToExistingBrowser: () => Promise<AvanzaLocalPlaywrightBrowserAdapterResult>;
  readCurrentPageSnapshot: () => Promise<AvanzaLocalPlaywrightBrowserAdapterResult>;
  close: () => Promise<AvanzaLocalPlaywrightBrowserAdapterResult>;
};

const defaultTimestamp = "2026-07-05T12:00:00.000Z";
const unsafeTextPattern =
  /account\s*id|accountid|bankid|broker\s*secret|cookie|credential|password|secret|session|storage|token/i;

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

function safeSnapshot(
  snapshot: AvanzaLocalPlaywrightBrowserPageSnapshot | undefined,
) {
  if (!snapshot) return undefined;

  const snapshotId = safeText(snapshot.snapshotId);
  const observedUrl = safeText(snapshot.observedUrl);

  if (!snapshotId || !observedUrl) return undefined;

  return {
    snapshotId,
    observedUrl,
    title: safeText(snapshot.title),
    textSignals: safeStringArray(snapshot.textSignals),
    formSignals: safeStringArray(snapshot.formSignals),
    capturedAt: safeText(snapshot.capturedAt) ?? defaultTimestamp,
  };
}

function buildExplicitBlockedReasons(
  config: AvanzaLocalPlaywrightBrowserAdapterConfig,
) {
  const blockedReasons: string[] = [];

  if (config.allowNavigate === true) {
    blockedReasons.push("navigation is not enabled in this adapter phase");
  }
  if (config.allowFormFill === true) {
    blockedReasons.push("form fill is not enabled in this adapter phase");
  }
  if (config.allowClick === true) {
    blockedReasons.push("clicking is not enabled in this adapter phase");
  }
  if (config.allowFinalBuyClick === true) {
    blockedReasons.push("final buy click is forbidden");
  }
  if (config.allowFinalSellClick === true) {
    blockedReasons.push("final sell click is forbidden");
  }
  if (config.allowSubmitOrder === true) {
    blockedReasons.push("order submission is forbidden");
  }
  if (config.allowCredentialHandling === true) {
    blockedReasons.push("credential handling is forbidden");
  }
  if (config.allowCookieRead === true) {
    blockedReasons.push("cookie reads are forbidden");
  }
  if (config.allowSessionExport === true) {
    blockedReasons.push("session export is forbidden");
  }
  if (config.allowBankIdBypass === true) {
    blockedReasons.push("BankID bypass is forbidden");
  }

  return blockedReasons;
}

function deriveStatus(
  config: AvanzaLocalPlaywrightBrowserAdapterConfig,
  blockedReasons: readonly string[],
  snapshot: AvanzaLocalPlaywrightBrowserPageSnapshot | undefined,
): AvanzaLocalPlaywrightBrowserAdapterStatus {
  if (config.statusOverride) return config.statusOverride;
  if (config.forceError === true) return "adapter_error";
  if (blockedReasons.length > 0) return "adapter_blocked";
  if (config.mode !== "local_dev" || config.enabled !== true) {
    return "adapter_disabled";
  }
  if (config.adapterAvailable === false || config.localOnly === false) {
    return "adapter_unavailable";
  }
  if (config.allowReadPageSnapshot === true && snapshot) {
    return "page_snapshot_read";
  }
  if (config.browserConnected === true) return "browser_connected";
  if (config.allowLaunchBrowser === true) return "browser_launch_available";
  if (config.allowConnectToExistingBrowser === true) {
    return "browser_connect_available";
  }
  if (config.allowReadPageSnapshot === true) return "adapter_ready";

  return "adapter_ready";
}

function buildSafetyFlags(
  config: AvanzaLocalPlaywrightBrowserAdapterConfig,
  status: AvanzaLocalPlaywrightBrowserAdapterStatus,
): AvanzaLocalPlaywrightBrowserAdapterSafetyFlags {
  const adapterEnabled =
    config.mode === "local_dev" &&
    config.enabled === true &&
    config.localOnly !== false &&
    ![
      "adapter_disabled",
      "adapter_unavailable",
      "adapter_blocked",
      "adapter_error",
      "unknown",
    ].includes(status);

  return {
    adapterEnabled,
    localDevOnly: adapterEnabled && config.mode === "local_dev",
    canLaunchBrowser:
      adapterEnabled === true && config.allowLaunchBrowser === true,
    canConnectToExistingBrowser:
      adapterEnabled === true &&
      config.allowConnectToExistingBrowser === true,
    canReadPageSnapshot:
      adapterEnabled === true && config.allowReadPageSnapshot === true,
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
    canWriteSupabaseExecution: false,
    userMustConfirm: true,
    finalHumanClickRequired: true,
    controlsEnabled: false,
    gateLocked: true,
  };
}

function labelFor(status: AvanzaLocalPlaywrightBrowserAdapterStatus) {
  switch (status) {
    case "adapter_disabled":
      return "Adapter disabled";
    case "adapter_unavailable":
      return "Adapter unavailable";
    case "adapter_ready":
      return "Adapter ready for local/dev modeling";
    case "browser_launch_available":
      return "Browser launch available for explicit local/dev call";
    case "browser_connect_available":
      return "Existing browser connection available for explicit local/dev call";
    case "browser_connected":
      return "Browser connected in model";
    case "page_snapshot_read":
      return "Page snapshot read in model";
    case "adapter_blocked":
      return "Adapter blocked";
    case "adapter_error":
      return "Adapter error";
    case "unknown":
      return "Adapter unknown";
  }
}

function reasonFor(status: AvanzaLocalPlaywrightBrowserAdapterStatus) {
  switch (status) {
    case "adapter_disabled":
      return "The local Playwright browser adapter is disabled by default.";
    case "adapter_unavailable":
      return "The local Playwright browser adapter is unavailable for this explicit input.";
    case "adapter_ready":
      return "The adapter can model local/dev read-only readiness without launching a browser during render.";
    case "browser_launch_available":
      return "An explicit local/dev launch callback may be called by a caller, but render remains inert.";
    case "browser_connect_available":
      return "An explicit local/dev connect callback may be called by a caller, but render remains inert.";
    case "browser_connected":
      return "A browser connection is modeled without navigation, fill, click, credential, or order behavior.";
    case "page_snapshot_read":
      return "A sanitized page snapshot is modeled as read-only output.";
    case "adapter_blocked":
      return "The adapter blocked input that requested behavior outside this phase.";
    case "adapter_error":
      return "The adapter returned a modeled error state.";
    case "unknown":
      return "The adapter state is unknown.";
  }
}

function buildResult(
  resultId: string,
  state: AvanzaLocalPlaywrightBrowserAdapterState,
  input: {
    status?: AvanzaLocalPlaywrightBrowserAdapterStatus;
    label?: string;
    reason?: string;
    pageSnapshot?: AvanzaLocalPlaywrightBrowserPageSnapshot;
    warnings?: readonly string[];
    blockedReasons?: readonly string[];
    didLaunchBrowser?: boolean;
    didConnectToBrowser?: boolean;
    didReadPageSnapshot?: boolean;
  } = {},
): AvanzaLocalPlaywrightBrowserAdapterResult {
  const status = input.status ?? state.status;

  return {
    resultId,
    status,
    label: input.label ?? labelFor(status),
    reason: input.reason ?? reasonFor(status),
    state,
    pageSnapshot: input.pageSnapshot,
    warnings: input.warnings ? safeStringArray(input.warnings) : state.warnings,
    blockedReasons: input.blockedReasons
      ? safeStringArray(input.blockedReasons)
      : state.blockedReasons,
    didLaunchBrowser: input.didLaunchBrowser === true,
    didConnectToBrowser: input.didConnectToBrowser === true,
    didReadPageSnapshot: input.didReadPageSnapshot === true,
    didNavigate: false,
    didFillForm: false,
    didClick: false,
    didSubmitOrder: false,
    credentialMaterialTouched: false,
    cookiesTouched: false,
    sessionMaterialTouched: false,
    supabaseWriteAttempted: false,
  };
}

export function buildAvanzaLocalPlaywrightBrowserAdapterState(
  input: AvanzaLocalPlaywrightBrowserAdapterConfig = {},
): AvanzaLocalPlaywrightBrowserAdapterState {
  const config: AvanzaLocalPlaywrightBrowserAdapterConfig = {
    adapterAvailable: true,
    enabled: false,
    localOnly: true,
    mode: "disabled",
    provider: "playwright",
    ...input,
  };
  const snapshot = safeSnapshot(config.pageSnapshot);
  const warnings = safeStringArray(config.warnings);
  const blockedReasons = [
    ...safeStringArray(config.blockedReasons),
    ...buildExplicitBlockedReasons(config),
  ];
  const status = deriveStatus(config, blockedReasons, snapshot);
  const safetyFlags = buildSafetyFlags(config, status);
  const adapterId =
    safeText(config.adapterId) ??
    (status === "adapter_disabled"
      ? "avanza-local-playwright-browser-adapter-disabled"
      : "avanza-local-playwright-browser-adapter-local-dev");

  return {
    ...safetyFlags,
    adapterId,
    mode: config.mode ?? "disabled",
    provider: "playwright",
    localOnly: config.localOnly !== false,
    status,
    label: safeText(config.label) ?? labelFor(status),
    reason: safeText(config.reason) ?? reasonFor(status),
    allowedOrigins: safeStringArray(config.allowedOrigins),
    createdAt: safeText(config.createdAt) ?? defaultTimestamp,
    now: safeText(config.now) ?? safeText(config.createdAt) ?? defaultTimestamp,
    warnings,
    blockedReasons,
    pageSnapshot: snapshot,
    safetyFlags,
  };
}

export function createDisabledAvanzaLocalPlaywrightBrowserAdapter(
  input: AvanzaLocalPlaywrightBrowserAdapterConfig = {},
  dependencies: AvanzaLocalPlaywrightBrowserAdapterDependencies = {},
): AvanzaLocalPlaywrightBrowserAdapter {
  const state = buildAvanzaLocalPlaywrightBrowserAdapterState({
    ...input,
    enabled: false,
    mode: "disabled",
  });

  return createAdapterFromState(state, dependencies);
}

export function createLocalDevAvanzaLocalPlaywrightBrowserAdapter(
  input: AvanzaLocalPlaywrightBrowserAdapterConfig = {},
  dependencies: AvanzaLocalPlaywrightBrowserAdapterDependencies = {},
): AvanzaLocalPlaywrightBrowserAdapter {
  const state = buildAvanzaLocalPlaywrightBrowserAdapterState({
    adapterAvailable: true,
    enabled: true,
    localOnly: true,
    ...input,
    mode: "local_dev",
    provider: "playwright",
  });

  return createAdapterFromState(state, dependencies);
}

function createAdapterFromState(
  state: AvanzaLocalPlaywrightBrowserAdapterState,
  dependencies: AvanzaLocalPlaywrightBrowserAdapterDependencies,
): AvanzaLocalPlaywrightBrowserAdapter {
  return {
    getState: () => state,
    launchBrowser: async () => {
      if (!state.canLaunchBrowser) {
        return buildResult("launch-browser-blocked", state, {
          status: "adapter_blocked",
          blockedReasons: ["browser launch is not allowed for this state"],
        });
      }
      if (!dependencies.launchBrowser) {
        return buildResult("launch-browser-unavailable", state, {
          status: "adapter_unavailable",
          blockedReasons: ["no launch callback was injected"],
        });
      }

      await dependencies.launchBrowser();

      return buildResult("launch-browser-modeled", state, {
        status: "browser_launch_available",
        didLaunchBrowser: true,
        warnings: ["explicit local/dev launch callback completed"],
      });
    },
    connectToExistingBrowser: async () => {
      if (!state.canConnectToExistingBrowser) {
        return buildResult("connect-browser-blocked", state, {
          status: "adapter_blocked",
          blockedReasons: ["browser connect is not allowed for this state"],
        });
      }
      if (!dependencies.connectToExistingBrowser) {
        return buildResult("connect-browser-unavailable", state, {
          status: "adapter_unavailable",
          blockedReasons: ["no connect callback was injected"],
        });
      }

      await dependencies.connectToExistingBrowser();

      return buildResult("connect-browser-modeled", state, {
        status: "browser_connected",
        didConnectToBrowser: true,
        warnings: ["explicit local/dev connect callback completed"],
      });
    },
    readCurrentPageSnapshot: async () => {
      if (!state.canReadPageSnapshot) {
        return buildResult("read-page-snapshot-blocked", state, {
          status: "adapter_blocked",
          blockedReasons: ["page snapshot read is not allowed for this state"],
        });
      }

      const providedSnapshot = dependencies.readCurrentPageSnapshot
        ? await dependencies.readCurrentPageSnapshot()
        : state.pageSnapshot;
      const pageSnapshot = safeSnapshot(providedSnapshot);

      if (!pageSnapshot) {
        return buildResult("read-page-snapshot-unavailable", state, {
          status: "adapter_unavailable",
          blockedReasons: ["no sanitized page snapshot was available"],
        });
      }

      return buildResult("read-page-snapshot-modeled", state, {
        status: "page_snapshot_read",
        pageSnapshot,
        didReadPageSnapshot: true,
        warnings: ["read-only page snapshot callback completed"],
      });
    },
    close: async () =>
      buildResult("adapter-close-noop", state, {
        warnings: ["adapter close is a modeled no-op"],
      }),
  };
}
