import {
  DEFAULT_EXECUTION_MODE as EXECUTION_DEFAULT_MODE,
  EXECUTION_MODE_STORAGE_KEY as EXECUTION_STORAGE_KEY,
  getExecutionAuthorityForMode,
  normalizeExecutionMode as normalizeStoredExecutionMode,
  type ExecutionAuthority,
  type ExecutionMode,
} from "@/lib/execution";

export type ExecutionSettingsStorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type ExecutionModePreferenceReadResult = {
  mode: ExecutionMode;
  storedValue: string | null;
  storageAvailable: boolean;
  error: string | null;
  automaticEnabled: boolean;
};

export type ExecutionModePreferenceWriteResult = {
  written: boolean;
  mode: ExecutionMode;
  storageAvailable: boolean;
  error: string | null;
};

export type ExecutionModeAvailabilityInput = {
  automaticEnabled?: boolean;
  automaticFeatureFlagValue?: string | null;
};

export type ExecutionAuthorityModeResult = {
  mode: ExecutionMode;
  authority: ExecutionAuthority;
};

export const EXECUTION_MODE_STORAGE_KEY = EXECUTION_STORAGE_KEY;
export const DEFAULT_EXECUTION_MODE = EXECUTION_DEFAULT_MODE;
export const EXECUTION_MODE_VALUES = ["semi_automatic", "automatic"] as const;

export function isExecutionModeValue(value: unknown): value is ExecutionMode {
  return value === "semi_automatic" || value === "automatic";
}

export function resolveExecutionModeAvailability(
  input: ExecutionModeAvailabilityInput = {},
): boolean {
  if (typeof input.automaticEnabled === "boolean") {
    return input.automaticEnabled;
  }

  return input.automaticFeatureFlagValue === "true";
}

export function normalizeExecutionMode(
  value: unknown,
  options: ExecutionModeAvailabilityInput = {},
): ExecutionMode {
  return normalizeStoredExecutionMode(value, {
    automaticEnabled: resolveExecutionModeAvailability(options),
  });
}

export function getBrowserExecutionSettingsStorage(): ExecutionSettingsStorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readExecutionModePreference(
  storage: ExecutionSettingsStorageLike | null | undefined,
  options: ExecutionModeAvailabilityInput = {},
): ExecutionModePreferenceReadResult {
  const automaticEnabled = resolveExecutionModeAvailability(options);

  if (!storage) {
    return {
      mode: DEFAULT_EXECUTION_MODE,
      storedValue: null,
      storageAvailable: false,
      error: null,
      automaticEnabled,
    };
  }

  try {
    const storedValue = storage.getItem(EXECUTION_MODE_STORAGE_KEY);

    return {
      mode: normalizeStoredExecutionMode(storedValue, { automaticEnabled }),
      storedValue,
      storageAvailable: true,
      error: null,
      automaticEnabled,
    };
  } catch (error) {
    return {
      mode: DEFAULT_EXECUTION_MODE,
      storedValue: null,
      storageAvailable: true,
      error: error instanceof Error ? error.message : "Unknown storage read error.",
      automaticEnabled,
    };
  }
}

export function writeExecutionModePreference(
  storage: ExecutionSettingsStorageLike | null | undefined,
  mode: ExecutionMode,
): ExecutionModePreferenceWriteResult {
  if (!storage) {
    return {
      written: false,
      mode,
      storageAvailable: false,
      error: null,
    };
  }

  try {
    storage.setItem(EXECUTION_MODE_STORAGE_KEY, mode);

    return {
      written: true,
      mode,
      storageAvailable: true,
      error: null,
    };
  } catch (error) {
    return {
      written: false,
      mode,
      storageAvailable: true,
      error: error instanceof Error ? error.message : "Unknown storage write error.",
    };
  }
}

export function resolveExecutionAuthorityMode(
  value: unknown,
  options: ExecutionModeAvailabilityInput = {},
): ExecutionAuthorityModeResult {
  const mode = normalizeExecutionMode(value, options);

  return {
    mode,
    authority: getExecutionAuthorityForMode(mode),
  };
}

export function createMemoryExecutionSettingsStorage(
  initialValues: Record<string, string> = {},
): ExecutionSettingsStorageLike & { snapshot: () => Record<string, string> } {
  let values = new Map(Object.entries(initialValues));

  return {
    getItem(key: string) {
      return values.has(key) ? values.get(key) ?? null : null;
    },
    setItem(key: string, value: string) {
      values.set(key, String(value));
    },
    removeItem(key: string) {
      values = new Map([...values.entries()].filter(([itemKey]) => itemKey !== key));
    },
    snapshot() {
      return Object.fromEntries(values.entries());
    },
  };
}
