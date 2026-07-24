import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  createMemoryExecutionSettingsStorage,
  DEFAULT_EXECUTION_MODE,
  EXECUTION_MODE_STORAGE_KEY,
  EXECUTION_MODE_VALUES,
  getBrowserExecutionSettingsStorage,
  isExecutionModeValue,
  normalizeExecutionMode,
  readExecutionModePreference,
  resolveExecutionAuthorityMode,
  resolveExecutionModeAvailability,
  writeExecutionModePreference,
  type ExecutionSettingsStorageLike,
} from "../../lib/execution-settings-persistence-helpers";

const root = process.cwd();
const helperPath = join(root, "lib/execution-settings-persistence-helpers.ts");
const baselinePath = join(root, "tests/e2e/execution-settings-persistence-baseline.spec.ts");
const tradeAppPath = join(root, "app/trade-app.tsx");
const settingsPath = join(root, "app/settings/page.tsx");
const settingsStateHookPath = join(
  root,
  "hooks/execution/useExecutionSettingsState.ts",
);

const forbiddenHelperFragments = [
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
  "process.env",
];

function read(path: string) {
  return readFileSync(path, "utf8");
}

function createThrowingStorage(): ExecutionSettingsStorageLike {
  return {
    getItem() {
      throw new Error("read unavailable");
    },
    setItem() {
      throw new Error("write unavailable");
    },
    removeItem() {
      throw new Error("remove unavailable");
    },
  };
}

test.describe("execution settings persistence helpers", () => {
  test("preserves execution mode key, default, allowed values, and type guard", () => {
    expect(EXECUTION_MODE_STORAGE_KEY).toBe("ture_execution_mode");
    expect(DEFAULT_EXECUTION_MODE).toBe("semi_automatic");
    expect(EXECUTION_MODE_VALUES).toEqual(["semi_automatic", "automatic"]);

    expect(isExecutionModeValue("semi_automatic")).toBe(true);
    expect(isExecutionModeValue("automatic")).toBe(true);
    expect(isExecutionModeValue("manual")).toBe(false);
    expect(isExecutionModeValue(null)).toBe(false);
  });

  test("preserves missing, invalid, semi-auto, and automatic read behavior", () => {
    const storage = createMemoryExecutionSettingsStorage();

    expect(readExecutionModePreference(storage)).toEqual({
      mode: "semi_automatic",
      storedValue: null,
      storageAvailable: true,
      error: null,
      automaticEnabled: false,
    });

    storage.setItem(EXECUTION_MODE_STORAGE_KEY, "invalid");
    expect(readExecutionModePreference(storage)).toMatchObject({
      mode: "semi_automatic",
      storedValue: "invalid",
      storageAvailable: true,
      error: null,
    });

    storage.setItem(EXECUTION_MODE_STORAGE_KEY, "semi_automatic");
    expect(readExecutionModePreference(storage).mode).toBe("semi_automatic");

    storage.setItem(EXECUTION_MODE_STORAGE_KEY, "automatic");
    expect(readExecutionModePreference(storage)).toMatchObject({
      mode: "semi_automatic",
      storedValue: "automatic",
      automaticEnabled: false,
    });
    expect(
      readExecutionModePreference(storage, { automaticEnabled: true }),
    ).toMatchObject({
      mode: "automatic",
      storedValue: "automatic",
      automaticEnabled: true,
    });
  });

  test("preserves automatic feature flag interaction without reading env directly", () => {
    expect(resolveExecutionModeAvailability()).toBe(false);
    expect(resolveExecutionModeAvailability({ automaticFeatureFlagValue: "true" })).toBe(
      true,
    );
    expect(resolveExecutionModeAvailability({ automaticFeatureFlagValue: "TRUE" })).toBe(
      false,
    );
    expect(resolveExecutionModeAvailability({ automaticEnabled: true })).toBe(true);
    expect(
      resolveExecutionModeAvailability({
        automaticEnabled: false,
        automaticFeatureFlagValue: "true",
      }),
    ).toBe(false);

    expect(normalizeExecutionMode("automatic")).toBe("semi_automatic");
    expect(
      normalizeExecutionMode("automatic", { automaticFeatureFlagValue: "true" }),
    ).toBe("automatic");
  });

  test("preserves write behavior and deterministic memory storage snapshots", () => {
    const first = createMemoryExecutionSettingsStorage();
    const second = createMemoryExecutionSettingsStorage();

    expect(writeExecutionModePreference(first, "semi_automatic")).toEqual({
      written: true,
      mode: "semi_automatic",
      storageAvailable: true,
      error: null,
    });
    expect(writeExecutionModePreference(second, "semi_automatic")).toEqual({
      written: true,
      mode: "semi_automatic",
      storageAvailable: true,
      error: null,
    });
    expect(first.snapshot()).toEqual(second.snapshot());
    expect(first.snapshot()).toEqual({
      [EXECUTION_MODE_STORAGE_KEY]: "semi_automatic",
    });

    expect(writeExecutionModePreference(first, "automatic")).toMatchObject({
      written: true,
      mode: "automatic",
    });
    expect(first.snapshot()).toEqual({
      [EXECUTION_MODE_STORAGE_KEY]: "automatic",
    });
  });

  test("handles unavailable and throwing storage deterministically", () => {
    expect(readExecutionModePreference(null)).toEqual({
      mode: "semi_automatic",
      storedValue: null,
      storageAvailable: false,
      error: null,
      automaticEnabled: false,
    });
    expect(writeExecutionModePreference(null, "semi_automatic")).toEqual({
      written: false,
      mode: "semi_automatic",
      storageAvailable: false,
      error: null,
    });

    const throwingStorage = createThrowingStorage();
    expect(readExecutionModePreference(throwingStorage)).toMatchObject({
      mode: "semi_automatic",
      storedValue: null,
      storageAvailable: true,
      error: "read unavailable",
      automaticEnabled: false,
    });
    expect(writeExecutionModePreference(throwingStorage, "automatic")).toMatchObject({
      written: false,
      mode: "automatic",
      storageAvailable: true,
      error: "write unavailable",
    });
  });

  test("preserves authority relationship without adding broker execution behavior", () => {
    expect(resolveExecutionAuthorityMode("semi_automatic")).toMatchObject({
      mode: "semi_automatic",
      authority: {
        can_submit_broker_order: false,
        allowFinalSubmit: false,
        requires_human_final_confirmation: true,
        final_confirmation_actor: "human",
      },
    });

    const automatic = resolveExecutionAuthorityMode("automatic", {
      automaticEnabled: true,
    });
    expect(automatic).toMatchObject({
      mode: "automatic",
      authority: {
        can_submit_broker_order: true,
        allowFinalSubmit: true,
        requires_human_final_confirmation: false,
        final_confirmation_actor: "agent",
      },
    });
    expect(automatic.authority.forbidden_agent_actions).not.toContain("click_buy");
  });

  test("keeps browser storage resolution client-safe and nullable", () => {
    Reflect.deleteProperty(globalThis, "window");
    expect(getBrowserExecutionSettingsStorage()).toBeNull();

    const storage = createMemoryExecutionSettingsStorage();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: { localStorage: storage },
    });

    expect(getBrowserExecutionSettingsStorage()).toBe(storage);
    Reflect.deleteProperty(globalThis, "window");
  });

  test("keeps helper source client-safe and wired only into settings read/write paths", () => {
    const helperSource = read(helperPath);

    for (const fragment of forbiddenHelperFragments) {
      expect(helperSource, `${fragment} must stay out of helper source`).not.toContain(
        fragment,
      );
    }

    expect(helperSource).not.toContain("export function reset");
    expect(helperSource).not.toContain("export function clear");
    expect(helperSource).not.toContain("removeExecutionModePreference");

    const baselineSource = read(baselinePath);
    expect(baselineSource).toContain("execution settings persistence baseline");

    const tradeAppSource = read(tradeAppPath);
    expect(tradeAppSource).toContain("execution-settings-persistence-helpers");
    expect(tradeAppSource).toContain("readExecutionModePreferenceForTradeApp");
    expect(tradeAppSource).toContain(
      "readExecutionModePreference(getBrowserExecutionSettingsStorage()",
    );
    expect(tradeAppSource).not.toContain(
      "window.localStorage.getItem(EXECUTION_MODE_STORAGE_KEY)",
    );

    const settingsSource = read(settingsPath);
    const settingsStateHookSource = read(settingsStateHookPath);
    expect(settingsSource).toContain("useExecutionSettingsState");
    expect(settingsSource).toContain("const executionSettingsState =");
    expect(settingsSource).toContain(
      "onSelectExecutionMode={updateExecutionModePreference}",
    );
    expect(settingsSource).not.toContain("function readExecutionModePreference()");
    expect(settingsSource).not.toContain("function writeExecutionModePreference(");
    expect(settingsStateHookSource).toContain("execution-settings-persistence-helpers");
    expect(settingsStateHookSource).toContain("function readExecutionModePreference()");
    expect(settingsStateHookSource).toContain("function writeExecutionModePreference(");
    expect(settingsStateHookSource).toContain(
      "readStoredExecutionModePreference(getBrowserExecutionSettingsStorage()",
    );
    expect(settingsStateHookSource).toContain("writeStoredExecutionModePreference(");
    expect(settingsStateHookSource).toContain(
      "Automatic mode is locked. Set NEXT_PUBLIC_ENABLE_AUTOMATIC_EXECUTION=true to enable the advanced opt-in.",
    );
    expect(settingsStateHookSource).toContain(
      "Automatic execution mode saved locally. Broker automation is still not connected in this build.",
    );
    expect(settingsSource).not.toContain(
      "window.localStorage.setItem(EXECUTION_MODE_STORAGE_KEY, mode)",
    );
    expect(settingsStateHookSource).not.toContain(
      "window.localStorage.setItem(EXECUTION_MODE_STORAGE_KEY, mode)",
    );
  });
});
