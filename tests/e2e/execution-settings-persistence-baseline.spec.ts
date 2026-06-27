import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEFAULT_EXECUTION_MODE,
  EXECUTION_MODE_STORAGE_KEY,
  getExecutionAuthorityForMode,
  getExecutionTriggerPriority,
  isAutomaticExecutionModeFeatureEnabled,
  normalizeExecutionMode,
  type ExecutionAction,
  type ExecutionIntent,
  type ExecutionMode,
  type ExecutionTriggerType,
} from "../../lib/execution";
import { runExecutionOrchestrator } from "../../lib/execution-orchestrator";

const root = process.cwd();
const testPath = join(root, "tests/e2e/execution-settings-persistence-baseline.spec.ts");
const executionPath = join(root, "lib/execution.ts");
const settingsPath = join(root, "app/settings/page.tsx");
const settingsStateHookPath = join(
  root,
  "hooks/execution/useExecutionSettingsState.ts",
);
const tradeAppPath = join(root, "app/trade-app.tsx");
const executionSettingsPanelPath = join(
  root,
  "components/execution/execution-settings-panel.tsx",
);
const executionAuditLogViewerPath = join(
  root,
  "components/execution/execution-audit-log-viewer.tsx",
);
const executionLocalRecordsViewerPath = join(
  root,
  "components/execution/execution-local-records-viewer.tsx",
);
const handoffPreviewModalPath = join(
  root,
  "components/execution/execution-handoff-preview-modal.tsx",
);
const modalHelperPath = join(root, "lib/execution-modal-state-helpers.ts");
const localStorageHelperPath = join(root, "lib/execution-local-storage-helpers.ts");
const lifecycleAdapterPath = join(root, "lib/execution-lifecycle-ui-state-adapter.ts");

const forbiddenSettingsBaselineFragments = [
  "server-only",
  "execution-record-audit-writer",
  "execution-lifecycle-transition-service",
  "transitionExecutionLifecycleOnServer",
  "transitionExecutionLifecycleAndAppendAuditEvent",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_KEY",
  "createClient",
  "fetch(",
  ".insert(",
  ".update(",
  ".delete(",
  ".upsert(",
  ".select(",
  "/api/execution/audit/writer",
  "public.execution_record_audit_events",
];

function read(path: string) {
  return readFileSync(path, "utf8");
}

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.has(key) ? this.values.get(key) ?? null : null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, String(value));
  }
}

function readExecutionModePreferenceFixture(
  storage: Storage,
  options: { automaticEnabled?: boolean } = {},
) {
  return normalizeExecutionMode(storage.getItem(EXECUTION_MODE_STORAGE_KEY), {
    automaticEnabled: options.automaticEnabled,
  });
}

function writeExecutionModePreferenceFixture(storage: Storage, mode: ExecutionMode) {
  storage.setItem(EXECUTION_MODE_STORAGE_KEY, mode);
}

function createIntent(
  overrides: Partial<ExecutionIntent> & {
    action?: ExecutionAction;
    mode?: ExecutionMode;
    trigger_type?: ExecutionTriggerType;
  } = {},
): ExecutionIntent {
  const mode = overrides.mode ?? "semi_automatic";
  const action = overrides.action ?? "buy";
  const triggerType = overrides.trigger_type ?? "entry_recommendation_ready";

  return {
    intent_version: "1.0",
    intent_id: overrides.intent_id ?? `settings-baseline-${action}-${mode}`,
    created_at: overrides.created_at ?? "2026-06-27T12:00:00.000Z",
    mode,
    authority: overrides.authority ?? getExecutionAuthorityForMode(mode),
    action,
    trigger_type: triggerType,
    trigger_priority:
      overrides.trigger_priority ?? getExecutionTriggerPriority(triggerType),
    broker_hint: "AVANZA",
    source: overrides.source ?? "recommendation",
    trading_package: {
      package_version: "1.0",
      recommendation_id: action === "buy" ? "rec-settings-baseline-001" : null,
      live_position_id: action === "sell" ? "position-settings-baseline-001" : null,
      ticker: "TURE",
      market: "US",
      quantity: 10,
      order_type: "limit",
      limit_price: 123.45,
      stop_loss: action === "sell" ? 110 : null,
      target_price: action === "sell" ? 140 : null,
      expires_at: "2026-06-27T20:00:00.000Z",
      payload_id: "payload-settings-baseline-001",
      payload_fingerprint: "payload-fingerprint-settings-baseline-001",
      ...overrides.trading_package,
    },
    safety_warnings: overrides.safety_warnings ?? [],
    broker_result: overrides.broker_result ?? null,
    ...overrides,
  };
}

test.describe("execution settings persistence baseline", () => {
  test("locks execution mode key, defaults, allowed values, and feature flag normalization", () => {
    expect(EXECUTION_MODE_STORAGE_KEY).toBe("ture_execution_mode");
    expect(DEFAULT_EXECUTION_MODE).toBe("semi_automatic");

    expect(normalizeExecutionMode(undefined)).toBe(DEFAULT_EXECUTION_MODE);
    expect(normalizeExecutionMode(null)).toBe(DEFAULT_EXECUTION_MODE);
    expect(normalizeExecutionMode("")).toBe(DEFAULT_EXECUTION_MODE);
    expect(normalizeExecutionMode("manual")).toBe(DEFAULT_EXECUTION_MODE);
    expect(normalizeExecutionMode("semi_automatic")).toBe("semi_automatic");
    expect(normalizeExecutionMode("automatic")).toBe(DEFAULT_EXECUTION_MODE);
    expect(normalizeExecutionMode("automatic", { automaticEnabled: false })).toBe(
      DEFAULT_EXECUTION_MODE,
    );
    expect(normalizeExecutionMode("automatic", { automaticEnabled: true })).toBe(
      "automatic",
    );

    expect(isAutomaticExecutionModeFeatureEnabled("true")).toBe(true);
    expect(isAutomaticExecutionModeFeatureEnabled("TRUE")).toBe(false);
    expect(isAutomaticExecutionModeFeatureEnabled("1")).toBe(false);
    expect(isAutomaticExecutionModeFeatureEnabled("false")).toBe(false);
    expect(isAutomaticExecutionModeFeatureEnabled(undefined)).toBe(false);
  });

  test("locks current localStorage read/write characterization for execution mode preference", () => {
    const storage = new MemoryStorage();

    expect(readExecutionModePreferenceFixture(storage)).toBe(DEFAULT_EXECUTION_MODE);

    storage.setItem(EXECUTION_MODE_STORAGE_KEY, "not-a-mode");
    expect(readExecutionModePreferenceFixture(storage)).toBe(DEFAULT_EXECUTION_MODE);

    writeExecutionModePreferenceFixture(storage, "semi_automatic");
    expect(storage.getItem(EXECUTION_MODE_STORAGE_KEY)).toBe("semi_automatic");
    expect(readExecutionModePreferenceFixture(storage)).toBe("semi_automatic");

    writeExecutionModePreferenceFixture(storage, "automatic");
    expect(storage.getItem(EXECUTION_MODE_STORAGE_KEY)).toBe("automatic");
    expect(readExecutionModePreferenceFixture(storage)).toBe(DEFAULT_EXECUTION_MODE);
    expect(readExecutionModePreferenceFixture(storage, { automaticEnabled: true })).toBe(
      "automatic",
    );

    storage.removeItem(EXECUTION_MODE_STORAGE_KEY);
    expect(readExecutionModePreferenceFixture(storage)).toBe(DEFAULT_EXECUTION_MODE);
  });

  test("locks settings and trade app helper-backed read/write surfaces", () => {
    const settingsSource = read(settingsPath);
    const settingsStateHookSource = read(settingsStateHookPath);
    const executionSettingsPanelSource = read(executionSettingsPanelPath);
    const tradeAppSource = read(tradeAppPath);
    const handoffPreviewModalSource = read(handoffPreviewModalPath);

    expect(settingsSource).toContain("useExecutionSettingsState");
    expect(settingsSource).toContain("const executionSettingsState =");
    expect(settingsSource).toContain(
      "onSelectExecutionMode={updateExecutionModePreference}",
    );
    expect(settingsSource).not.toContain("function readExecutionModePreference()");
    expect(settingsSource).not.toContain("function writeExecutionModePreference(");
    expect(settingsStateHookSource).toContain(
      'from "@/lib/execution-settings-persistence-helpers"',
    );
    expect(settingsStateHookSource).toContain("function readExecutionModePreference()");
    expect(settingsStateHookSource).toContain("function writeExecutionModePreference(");
    expect(settingsStateHookSource).toContain(
      "readStoredExecutionModePreference(getBrowserExecutionSettingsStorage()",
    );
    expect(settingsStateHookSource).toContain("writeStoredExecutionModePreference(");
    expect(settingsSource).not.toContain(
      "window.localStorage.getItem(EXECUTION_MODE_STORAGE_KEY)",
    );
    expect(settingsSource).not.toContain(
      "window.localStorage.setItem(EXECUTION_MODE_STORAGE_KEY, mode)",
    );
    expect(settingsStateHookSource).toContain(
      "Automatic mode is locked. Set NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=true to enable the advanced opt-in.",
    );
    expect(settingsStateHookSource).toContain(
      "Automatic execution mode saved locally. Broker automation is still not connected in this build.",
    );
    expect(settingsSource).not.toContain(
      "window.localStorage.removeItem(EXECUTION_MODE_STORAGE_KEY)",
    );
    expect(settingsSource).toContain(
      'from "@/components/execution/execution-settings-panel"',
    );
    expect(settingsSource).toContain("<ExecutionSettingsPanel");
    expect(settingsSource).toContain(
      "onSelectExecutionMode={updateExecutionModePreference}",
    );
    expect(settingsSource).not.toContain("function ExecutionSettingsPanel");

    expect(executionSettingsPanelSource).toContain('"use client";');
    expect(executionSettingsPanelSource).toContain(
      "export function ExecutionSettingsPanel",
    );
    expect(executionSettingsPanelSource).toContain("Execution Mode");
    expect(executionSettingsPanelSource).toContain("Semi-automatic");
    expect(executionSettingsPanelSource).toContain("Default");
    expect(executionSettingsPanelSource).toContain("Recommended");
    expect(executionSettingsPanelSource).toContain("Automatic");
    expect(executionSettingsPanelSource).toContain("Advanced");
    expect(executionSettingsPanelSource).toContain("Experimental");
    expect(executionSettingsPanelSource).toContain("Locked");
    expect(executionSettingsPanelSource).toContain(
      "disabled={!automaticExecutionEnabled}",
    );
    expect(executionSettingsPanelSource).toContain(
      "NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION is set to true.",
    );
    expect(executionSettingsPanelSource).not.toContain(
      "readStoredExecutionModePreference",
    );
    expect(executionSettingsPanelSource).not.toContain(
      "writeStoredExecutionModePreference",
    );
    expect(executionSettingsPanelSource).not.toContain("localStorage");
    expect(executionSettingsPanelSource).not.toContain("reset");

    expect(tradeAppSource).toContain(
      'from "@/lib/execution-settings-persistence-helpers"',
    );
    expect(tradeAppSource).toContain("function readExecutionModePreferenceForTradeApp()");
    expect(tradeAppSource).toContain(
      "readExecutionModePreference(getBrowserExecutionSettingsStorage()",
    );
    expect(tradeAppSource).not.toContain(
      "window.localStorage.getItem(EXECUTION_MODE_STORAGE_KEY)",
    );
    expect(tradeAppSource).toContain("setSelectedExecutionMode(readExecutionModePreferenceForTradeApp())");
    expect(tradeAppSource).toContain('window.addEventListener("storage"');
    expect(tradeAppSource).toContain('window.addEventListener("focus"');
    expect(tradeAppSource).toContain("refreshExecutionMode");
    expect(handoffPreviewModalSource).toContain(
      "Automatic authority allows final submit when all checks are ready, but no broker connection or order execution is implemented here.",
    );
  });

  test("locks persisted mode relationship to orchestrator authority without adding execution behavior", () => {
    const semiAutomaticResult = runExecutionOrchestrator({
      candidateIntents: [createIntent({ mode: "semi_automatic" })],
      createdAt: "2026-06-27T12:00:00.000Z",
    });
    expect(semiAutomaticResult.selectedIntent?.mode).toBe("semi_automatic");
    expect(semiAutomaticResult.selectedIntent?.authority).toMatchObject({
      can_submit_broker_order: false,
      allowFinalSubmit: false,
      requires_human_final_confirmation: true,
      final_confirmation_actor: "human",
    });
    expect(semiAutomaticResult.selectedIntent?.authority.forbidden_agent_actions).toContain(
      "submit_order",
    );

    const automaticResult = runExecutionOrchestrator({
      candidateIntents: [createIntent({ mode: "automatic" })],
      createdAt: "2026-06-27T12:00:00.000Z",
    });
    expect(automaticResult.selectedIntent?.mode).toBe("automatic");
    expect(automaticResult.selectedIntent?.authority).toMatchObject({
      can_submit_broker_order: true,
      allowFinalSubmit: true,
      requires_human_final_confirmation: false,
      final_confirmation_actor: "agent",
    });
    expect(automaticResult.handoff?.broker).toBe("avanza");
    expect(automaticResult.handoff?.status).not.toBe("submitted");
    expect(automaticResult.handoff?.status).not.toBe("filled");
    expect(automaticResult.selectedIntent?.broker_result).toBeNull();
  });

  test("locks client-safe boundaries for settings persistence baseline and adjacent helper wiring", () => {
    const testImports = read(testPath)
      .split("\n")
      .filter((line) => line.startsWith("import "));
    expect(testImports).toEqual(
      expect.not.arrayContaining([
        expect.stringContaining("../../lib/server/"),
        expect.stringContaining("../../app/api/execution/audit/writer"),
      ]),
    );

    for (const path of [executionPath, modalHelperPath, lifecycleAdapterPath]) {
      const source = read(path);

      for (const fragment of forbiddenSettingsBaselineFragments) {
        expect(source, `${path} must not contain ${fragment}`).not.toContain(fragment);
      }
    }

    const localStorageHelperSource = read(localStorageHelperPath);
    expect(localStorageHelperSource).toContain("function getBrowserExecutionLocalStorage");
    expect(localStorageHelperSource).toContain("function readExecutionLocalJsonArray");
    expect(localStorageHelperSource).not.toContain("server-only");
    expect(localStorageHelperSource).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(localStorageHelperSource).not.toContain("public.execution_record_audit_events");

    const settingsSource = read(settingsPath);
    const settingsStateHookSource = read(settingsStateHookPath);
    const executionSettingsPanelSource = read(executionSettingsPanelPath);
    const executionAuditLogViewerSource = read(executionAuditLogViewerPath);
    const executionLocalRecordsViewerSource = read(executionLocalRecordsViewerPath);
    expect(settingsSource).toContain("useExecutionSettingsState");
    expect(settingsSource).not.toContain("readStoredExecutionModePreference");
    expect(settingsSource).not.toContain("writeStoredExecutionModePreference");
    expect(settingsSource).not.toContain("getBrowserExecutionSettingsStorage");
    expect(settingsStateHookSource).toContain("readStoredExecutionModePreference");
    expect(settingsStateHookSource).toContain("writeStoredExecutionModePreference");
    expect(settingsStateHookSource).toContain("getBrowserExecutionSettingsStorage");
    expect(settingsSource).not.toContain("execution-record-audit-writer");
    expect(settingsSource).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(settingsStateHookSource).not.toContain("execution-record-audit-writer");
    expect(settingsStateHookSource).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(settingsSource).toContain(
      'from "@/components/execution/execution-audit-log-viewer"',
    );
    expect(settingsSource).toContain(
      'from "@/components/execution/execution-local-records-viewer"',
    );
    expect(settingsSource).toContain("<ExecutionAuditLogViewer");
    expect(settingsSource).toContain("<ExecutionLocalRecordsViewer");
    expect(settingsSource).toContain("onRefresh={refreshExecutionEventLog}");
    expect(settingsSource).toContain("onClear={clearExecutionEventLog}");
    expect(settingsSource).toContain("onRefresh={refreshExecutionRecords}");
    expect(settingsSource).toContain("onClear={clearLocalExecutionRecords}");
    expect(settingsSource).not.toContain("function ExecutionEventLogPanel");
    expect(settingsSource).not.toContain("function ExecutionRecordsPanel");

    for (const [label, source] of [
      ["execution settings panel", executionSettingsPanelSource],
      ["execution audit log viewer", executionAuditLogViewerSource],
      ["execution local records viewer", executionLocalRecordsViewerSource],
    ] as const) {
      for (const fragment of forbiddenSettingsBaselineFragments) {
        expect(source, `${label} must not contain ${fragment}`).not.toContain(
          fragment,
        );
      }
    }

    expect(executionAuditLogViewerSource).toContain(
      "export function ExecutionAuditLogViewer",
    );
    expect(executionAuditLogViewerSource).toContain("Execution Event Log");
    expect(executionAuditLogViewerSource).toContain("Clear execution event log");
    expect(executionAuditLogViewerSource).toContain("onClick={onRefresh}");
    expect(executionAuditLogViewerSource).toContain("onClick={onClear}");
    expect(executionAuditLogViewerSource).not.toContain("localStorage");
    expect(executionAuditLogViewerSource).not.toContain("readExecutionEventLog");
    expect(executionAuditLogViewerSource).not.toContain(
      "clearExecutionAuditEvents",
    );
    expect(executionLocalRecordsViewerSource).toContain(
      "export function ExecutionLocalRecordsViewer",
    );
    expect(executionLocalRecordsViewerSource).toContain("Execution Records");
    expect(executionLocalRecordsViewerSource).toContain("Clear execution records");
    expect(executionLocalRecordsViewerSource).toContain(
      "Stub/dev records are not proof of",
    );
    expect(executionLocalRecordsViewerSource).toContain("onClick={onRefresh}");
    expect(executionLocalRecordsViewerSource).toContain("onClick={onClear}");
    expect(executionLocalRecordsViewerSource).not.toContain("localStorage");
    expect(executionLocalRecordsViewerSource).not.toContain(
      "readExecutionRecordStoreResult",
    );
    expect(executionLocalRecordsViewerSource).not.toContain(
      "clearExecutionRecords",
    );

    const tradeAppSource = read(tradeAppPath);
    expect(tradeAppSource).toContain("readExecutionModePreference");
    expect(tradeAppSource).toContain("getBrowserExecutionSettingsStorage");
    expect(tradeAppSource).not.toContain("/api/execution/audit/writer");
    expect(tradeAppSource).not.toContain("SUPABASE_SERVICE_ROLE");
  });
});
