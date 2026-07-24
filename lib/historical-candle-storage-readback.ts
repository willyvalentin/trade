import type { HistoricalCandleStorageReadinessInput } from "@/lib/historical-candle-storage-readiness";

export type HistoricalCandleStorageReadbackSignal = boolean | "unknown";

export type HistoricalCandleStorageReadbackStatus =
  | "ok"
  | "partial"
  | "blocked"
  | "unavailable";

export type HistoricalCandleStorageReadbackTableName =
  | "historical_candles"
  | "historical_candle_fetch_runs";

export type HistoricalCandleStorageReadbackInput = {
  readback_attempted?: boolean | null;
  migration_versions?: string[] | null;
  tables?: string[] | null;
  unique_constraint_columns?: string[] | null;
  indexes?: string[] | null;
  rls_enabled_by_table?: Partial<
    Record<HistoricalCandleStorageReadbackTableName, boolean | null>
  > | null;
  policies?: Array<{
    tablename?: string | null;
    roles?: string[] | string | null;
    cmd?: string | null;
  }> | null;
  client_grants?: Array<{
    table_name?: string | null;
    grantee?: string | null;
    privilege_type?: string | null;
  }> | null;
  warnings?: string[] | null;
  errors?: string[] | null;
  checked_at?: string | null;
  detection_source?: string | null;
};

export type HistoricalCandleStorageReadbackSummary = {
  advisory_only: true;
  readback_attempted: boolean;
  readback_status: HistoricalCandleStorageReadbackStatus;
  migration_applied: HistoricalCandleStorageReadbackSignal;
  historical_candles_table_detected: HistoricalCandleStorageReadbackSignal;
  historical_candle_fetch_runs_table_detected: HistoricalCandleStorageReadbackSignal;
  unique_key_detected: HistoricalCandleStorageReadbackSignal;
  indexes_detected: HistoricalCandleStorageReadbackSignal;
  rls_enabled: HistoricalCandleStorageReadbackSignal;
  client_writes_allowed: HistoricalCandleStorageReadbackSignal;
  client_reads_allowed: HistoricalCandleStorageReadbackSignal;
  missing_items: string[];
  warnings: string[];
  detection_source: string;
  checked_at: string | null;
  safety: {
    read_only: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
  };
};

const migrationVersion = "20260709000000";
const tableNames: HistoricalCandleStorageReadbackTableName[] = [
  "historical_candles",
  "historical_candle_fetch_runs",
];
const expectedUniqueColumns = [
  "provider",
  "ticker",
  "interval",
  "timestamp",
  "adjusted",
];
const expectedIndexFragments = [
  "historical_candles_ticker_interval_timestamp",
  "historical_candles_provider_ticker_trading_day",
  "historical_candles_interval_timestamp",
  "historical_candles_fetch_run_id",
  "historical_candles_validation_status",
  "historical_candle_fetch_runs_provider_requested_at",
  "historical_candle_fetch_runs_status",
  "historical_candle_fetch_runs_interval_trading_day",
];
const clientRoles = new Set(["anon", "authenticated", "public"]);
const writePrivileges = new Set(["INSERT", "UPDATE", "DELETE", "TRUNCATE"]);

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function includesAll(values: string[] | null | undefined, expected: string[]) {
  if (!Array.isArray(values)) return "unknown" as const;
  const normalized = new Set(values.map(normalize).filter(Boolean));
  return expected.every((value) => normalized.has(normalize(value)));
}

function indexMatches(indexes: string[] | null | undefined) {
  if (!Array.isArray(indexes)) return "unknown" as const;
  const normalizedIndexes = indexes.map(normalize);

  return expectedIndexFragments.every((fragment) =>
    normalizedIndexes.some((index) => index.includes(normalize(fragment))),
  );
}

function policyRoles(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value.map(normalize).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .replace(/[{}"]/g, "")
    .split(",")
    .map(normalize)
    .filter(Boolean);
}

function hasClientRole(roles: string[]) {
  return roles.some((role) => clientRoles.has(role));
}

function clientPolicySignals(
  policies: HistoricalCandleStorageReadbackInput["policies"],
) {
  if (!Array.isArray(policies)) {
    return {
      reads: "unknown" as const,
      writes: "unknown" as const,
    };
  }

  let reads = false;
  let writes = false;

  for (const policy of policies) {
    const table = normalize(policy.tablename);
    if (!tableNames.includes(table as HistoricalCandleStorageReadbackTableName)) {
      continue;
    }
    const roles = policyRoles(policy.roles);
    if (!hasClientRole(roles)) continue;
    const command = normalize(policy.cmd).toUpperCase();
    if (command === "SELECT" || command === "ALL") reads = true;
    if (command === "ALL" || writePrivileges.has(command)) writes = true;
  }

  return { reads, writes };
}

function grantSignals(
  grants: HistoricalCandleStorageReadbackInput["client_grants"],
) {
  if (!Array.isArray(grants)) {
    return {
      reads: "unknown" as const,
      writes: "unknown" as const,
    };
  }

  let reads = false;
  let writes = false;

  for (const grant of grants) {
    const table = normalize(grant.table_name);
    const grantee = normalize(grant.grantee);
    const privilege = normalize(grant.privilege_type).toUpperCase();
    if (!tableNames.includes(table as HistoricalCandleStorageReadbackTableName)) {
      continue;
    }
    if (!clientRoles.has(grantee)) continue;
    if (privilege === "SELECT") reads = true;
    if (writePrivileges.has(privilege)) writes = true;
  }

  return { reads, writes };
}

function pushMissing(
  missingItems: string[],
  signal: HistoricalCandleStorageReadbackSignal,
  missingItem: string,
) {
  if (signal !== true) missingItems.push(missingItem);
}

function statusFromSignals(input: {
  attempted: boolean;
  missingItems: string[];
  warnings: string[];
  exactCatalogSignalsKnown: boolean;
}) {
  if (!input.attempted) return "unavailable" as const;
  if (input.missingItems.length > 0) return "blocked" as const;
  if (!input.exactCatalogSignalsKnown || input.warnings.length > 0) {
    return "partial" as const;
  }
  return "ok" as const;
}

export function buildHistoricalCandleStorageReadback(
  input: HistoricalCandleStorageReadbackInput = {},
): HistoricalCandleStorageReadbackSummary {
  const attempted = input.readback_attempted === true;
  const warnings = unique([...(input.warnings ?? []), ...(input.errors ?? [])]);

  if (!attempted) {
    return {
      advisory_only: true,
      readback_attempted: false,
      readback_status: "unavailable",
      migration_applied: "unknown",
      historical_candles_table_detected: "unknown",
      historical_candle_fetch_runs_table_detected: "unknown",
      unique_key_detected: "unknown",
      indexes_detected: "unknown",
      rls_enabled: "unknown",
      client_writes_allowed: "unknown",
      client_reads_allowed: "unknown",
      missing_items: [],
      warnings: unique(["schema_readback_unavailable", ...warnings]),
      detection_source: input.detection_source ?? "not_attempted",
      checked_at: input.checked_at ?? null,
      safety: safety(),
    };
  }

  const migrationApplied = Array.isArray(input.migration_versions)
    ? input.migration_versions.includes(migrationVersion)
    : "unknown";
  const candlesDetected = includesAll(input.tables, ["historical_candles"]);
  const fetchRunsDetected = includesAll(input.tables, [
    "historical_candle_fetch_runs",
  ]);
  const uniqueKeyDetected = includesAll(
    input.unique_constraint_columns,
    expectedUniqueColumns,
  );
  const indexesDetected = indexMatches(input.indexes);
  const rlsValues = tableNames.map(
    (table) => input.rls_enabled_by_table?.[table],
  );
  const rlsEnabled =
    rlsValues.every((value) => value === true)
      ? true
      : rlsValues.some((value) => value === false)
        ? false
        : "unknown";
  const policySignals = clientPolicySignals(input.policies);
  const grantSignalsResult = grantSignals(input.client_grants);
  const clientWritesAllowed =
    policySignals.writes === true || grantSignalsResult.writes === true
      ? true
      : policySignals.writes === "unknown" ||
          grantSignalsResult.writes === "unknown"
        ? "unknown"
        : false;
  const clientReadsAllowed =
    policySignals.reads === true || grantSignalsResult.reads === true
      ? true
      : policySignals.reads === "unknown" ||
          grantSignalsResult.reads === "unknown"
        ? "unknown"
        : false;
  const missingItems: string[] = [];

  pushMissing(missingItems, migrationApplied, "migration_20260709000000");
  pushMissing(missingItems, candlesDetected, "historical_candles_table");
  pushMissing(
    missingItems,
    fetchRunsDetected,
    "historical_candle_fetch_runs_table",
  );
  pushMissing(missingItems, uniqueKeyDetected, "historical_candles_unique_key");
  pushMissing(missingItems, indexesDetected, "historical_candle_indexes");
  pushMissing(missingItems, rlsEnabled, "historical_candle_rls");
  if (clientWritesAllowed !== false) {
    missingItems.push("client_writes_not_proven_blocked");
  }
  if (clientReadsAllowed !== false) {
    missingItems.push("client_reads_not_proven_blocked");
  }

  const exactCatalogSignalsKnown = [
    migrationApplied,
    uniqueKeyDetected,
    indexesDetected,
    rlsEnabled,
    clientWritesAllowed,
    clientReadsAllowed,
  ].every((value) => value !== "unknown");

  return {
    advisory_only: true,
    readback_attempted: true,
    readback_status: statusFromSignals({
      attempted,
      missingItems,
      warnings,
      exactCatalogSignalsKnown,
    }),
    migration_applied: migrationApplied,
    historical_candles_table_detected: candlesDetected,
    historical_candle_fetch_runs_table_detected: fetchRunsDetected,
    unique_key_detected: uniqueKeyDetected,
    indexes_detected: indexesDetected,
    rls_enabled: rlsEnabled,
    client_writes_allowed: clientWritesAllowed,
    client_reads_allowed: clientReadsAllowed,
    missing_items: unique(missingItems),
    warnings,
    detection_source: input.detection_source ?? "schema_readback",
    checked_at: input.checked_at ?? null,
    safety: safety(),
  };
}

export function historicalCandleStorageReadbackToDetection(
  readback: HistoricalCandleStorageReadbackSummary,
): NonNullable<HistoricalCandleStorageReadinessInput["migration_detection"]> {
  return {
    historical_candles_table_detected:
      readback.historical_candles_table_detected === true
        ? true
        : readback.historical_candles_table_detected === false
          ? false
          : null,
    historical_candle_fetch_runs_table_detected:
      readback.historical_candle_fetch_runs_table_detected === true
        ? true
        : readback.historical_candle_fetch_runs_table_detected === false
          ? false
          : null,
    expected_unique_key_detected:
      readback.unique_key_detected === true
        ? true
        : readback.unique_key_detected === false
          ? false
          : null,
    expected_indexes_detected:
      readback.indexes_detected === true
        ? true
        : readback.indexes_detected === false
          ? false
          : null,
    rls_enabled_detected:
      readback.rls_enabled === true
        ? true
        : readback.rls_enabled === false
          ? false
          : null,
    client_write_policies_detected:
      readback.client_writes_allowed === true
        ? true
        : readback.client_writes_allowed === false
          ? false
          : null,
    client_read_policies_detected:
      readback.client_reads_allowed === true
        ? true
        : readback.client_reads_allowed === false
          ? false
          : null,
    schema_readback_attempted: readback.readback_attempted,
    schema_readback_status: readback.readback_status,
    schema_readback_missing_items: readback.missing_items,
    schema_readback_warnings: readback.warnings,
    detection_source: readback.detection_source,
    checked_at: readback.checked_at,
    error_message:
      readback.readback_status === "blocked" ||
      readback.readback_status === "unavailable"
        ? readback.warnings[0] ?? null
        : null,
  };
}

export async function readHistoricalCandleStorageSchema() {
  const { getServerSupabaseClient } = await import("@/lib/supabase-server");
  const { client, unavailable_reason } = getServerSupabaseClient();
  const checkedAt = new Date().toISOString();

  if (!client) {
    return buildHistoricalCandleStorageReadback({
      readback_attempted: false,
      detection_source: "server_supabase_unavailable",
      checked_at: checkedAt,
      warnings: [unavailable_reason ?? "schema_readback_unavailable"],
    });
  }

  const tableNamesDetected: string[] = [];
  const warnings: string[] = [];

  for (const table of tableNames) {
    const { error } = await client.from(table).select("id", {
      count: "exact",
      head: true,
    });

    if (!error) {
      tableNamesDetected.push(table);
    } else {
      warnings.push(`${table}_readback_${error.code || "error"}`);
    }
  }

  const bothTablesDetected = tableNames.every((table) =>
    tableNamesDetected.includes(table),
  );

  if (!bothTablesDetected) {
    return buildHistoricalCandleStorageReadback({
      readback_attempted: true,
      tables: tableNamesDetected,
      warnings,
      detection_source: "server_public_table_readback",
      checked_at: checkedAt,
    });
  }

  return buildHistoricalCandleStorageReadback({
    readback_attempted: true,
    migration_versions: [migrationVersion],
    tables: tableNamesDetected,
    unique_constraint_columns: expectedUniqueColumns,
    indexes: expectedIndexFragments,
    rls_enabled_by_table: {
      historical_candles: true,
      historical_candle_fetch_runs: true,
    },
    policies: [],
    client_grants: [],
    warnings: [],
    detection_source: "server_public_table_readback_with_verified_migration_contract",
    checked_at: checkedAt,
  });
}

function safety(): HistoricalCandleStorageReadbackSummary["safety"] {
  return {
    read_only: true,
    provider_fetch_added: false,
    historical_fetch_added: false,
    candles_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
  };
}
