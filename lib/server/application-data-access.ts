import "server-only";

import {
  RECENT_RECOMMENDATION_OUTCOMES_READ_LIMIT,
  RECENT_RECOMMENDATION_SNAPSHOTS_READ_LIMIT,
} from "@/lib/recent-recommendation-readback";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { normalizeApplicationOwnerUserId } from "@/lib/application-session-core";

export type ApplicationDataAccessResult<T> =
  | { status: "available"; data: T }
  | { status: "unavailable" | "failed" };

function unavailable<T>(): ApplicationDataAccessResult<T> {
  return { status: "unavailable" };
}

function failed<T>(): ApplicationDataAccessResult<T> {
  return { status: "failed" };
}

export async function readApplicationDashboardData(ownerUserId: string) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const { client } = getServerSupabaseClient();

  if (!client || !owner) {
    return unavailable<Record<string, unknown>>();
  }

  const since24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since36HoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  const [
    recommendations,
    userSettings,
    openPositions,
    closedPositions,
    positionUpdates,
    scheduledScanRuns,
    scheduledScanAttempts,
    recommendationScanRuns,
    recommendationBatches,
    recommendationSnapshots,
    recommendationOutcomes,
    marketRegime,
  ] = await Promise.all([
    client.from("recommendations").select("*").eq("owner_user_id", owner),
    client
      .from("user_settings")
      .select("portfolio_size, risk_per_trade_percent")
      .eq("owner_user_id", owner)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    client
      .from("positions")
      .select(
        "*, recommendations!positions_recommendation_owner_fkey(setup_type,invalidation)",
      )
      .eq("status", "open")
      .eq("owner_user_id", owner),
    client
      .from("positions")
      .select(
        "*, recommendations!positions_recommendation_owner_fkey(setup_type)",
      )
      .eq("status", "closed")
      .eq("owner_user_id", owner)
      .order("closed_at", { ascending: false }),
    client
      .from("position_updates")
      .select("*")
      .eq("owner_user_id", owner)
      .order("created_at", { ascending: false }),
    client
      .from("scheduled_scan_runs")
      .select("id,created_at,scan_date,session_type,status,recommendations_created,message")
      .gte("created_at", since24HoursAgo)
      .order("created_at", { ascending: false })
      .limit(50),
    client
      .from("scheduled_scan_attempts")
      .select("*")
      .gte("utc_timestamp", since36HoursAgo)
      .order("utc_timestamp", { ascending: false })
      .limit(100),
    client
      .from("recommendation_scan_runs")
      .select("*")
      .eq("owner_user_id", owner)
      .order("observed_at", { ascending: false })
      .limit(100),
    client
      .from("recommendation_batches")
      .select("*")
      .eq("owner_user_id", owner)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(100),
    client
      .from("recommendation_snapshots")
      .select("*")
      .eq("owner_user_id", owner)
      .order("created_at", { ascending: false })
      .limit(RECENT_RECOMMENDATION_SNAPSHOTS_READ_LIMIT),
    client
      .from("recommendation_outcomes")
      .select("*")
      .eq("owner_user_id", owner)
      .order("evaluated_at", { ascending: false })
      .limit(RECENT_RECOMMENDATION_OUTCOMES_READ_LIMIT),
    client
      .from("market_regime_snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const results = [
    recommendations,
    userSettings,
    openPositions,
    closedPositions,
    positionUpdates,
    scheduledScanRuns,
    scheduledScanAttempts,
    recommendationScanRuns,
    recommendationBatches,
    recommendationSnapshots,
    recommendationOutcomes,
    marketRegime,
  ];

  if (results.some((result) => result.error)) {
    return failed<Record<string, unknown>>();
  }

  return {
    status: "available" as const,
    data: {
      recommendations: recommendations.data ?? [],
      user_settings: userSettings.data,
      open_positions: openPositions.data ?? [],
      closed_positions: closedPositions.data ?? [],
      position_updates: positionUpdates.data ?? [],
      scheduled_scan_runs: scheduledScanRuns.data ?? [],
      scheduled_scan_attempts: scheduledScanAttempts.data ?? [],
      recommendation_scan_runs: recommendationScanRuns.data ?? [],
      recommendation_batches: recommendationBatches.data ?? [],
      recommendation_snapshots: recommendationSnapshots.data ?? [],
      recommendation_outcomes: recommendationOutcomes.data ?? [],
      market_regime: marketRegime.data,
    },
  };
}

export async function readUserSettings(ownerUserId: string) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const { client } = getServerSupabaseClient();
  if (!client || !owner) return unavailable<Record<string, unknown> | null>();

  const result = await client
    .from("user_settings")
    .select("*")
    .eq("owner_user_id", owner)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return result.error || !result.data
    ? failed<Record<string, unknown> | null>()
    : { status: "available" as const, data: result.data };
}

export async function createDefaultUserSettings(
  ownerUserId: string,
  settings: Record<string, unknown>,
) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const { client } = getServerSupabaseClient();
  if (!client || !owner) return unavailable<Record<string, unknown>>();

  const result = await client
    .from("user_settings")
    .insert({ ...settings, owner_user_id: owner })
    .select("*")
    .single();
  return result.error
    ? failed<Record<string, unknown>>()
    : { status: "available" as const, data: result.data };
}

export async function updateUserSettings(
  ownerUserId: string,
  id: string | number,
  settings: Record<string, unknown>,
) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const { client } = getServerSupabaseClient();
  if (!client || !owner) return unavailable<Record<string, unknown> | null>();

  const result = await client
    .from("user_settings")
    .update(settings)
    .eq("id", id)
    .eq("owner_user_id", owner)
    .select("*")
    .maybeSingle();

  return result.error
    ? failed<Record<string, unknown> | null>()
    : { status: "available" as const, data: result.data };
}

export async function readApplicationExecutionRecords(ownerUserId: string) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const { client } = getServerSupabaseClient();
  if (!client || !owner) return unavailable<unknown[]>();

  const result = await client
    .from("execution_records")
    .select(
      "id,created_at,ticker,side,quantity,execution_phase,validation_status,record_fingerprint",
    )
    .eq("user_id", owner)
    .order("created_at", { ascending: false })
    .limit(100);

  return result.error
    ? failed<unknown[]>()
    : { status: "available" as const, data: result.data ?? [] };
}

export async function readRecentScheduledScanRuns() {
  const { client } = getServerSupabaseClient();
  if (!client) return unavailable<unknown[]>();

  const result = await client
    .from("scheduled_scan_runs")
    .select("id,created_at,scan_date,session_type,status,recommendations_created,message")
    .order("created_at", { ascending: false })
    .limit(20);

  return result.error
    ? failed<unknown[]>()
    : { status: "available" as const, data: result.data ?? [] };
}

export type OutcomeBackfillReadOperation =
  | "snapshots_by_fingerprint"
  | "snapshots_by_scan_run"
  | "batches_by_fingerprint"
  | "batches_by_scan_run";

const outcomeBackfillLimit = 200;

function boundedIdentifiers(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > outcomeBackfillLimit) {
    return null;
  }

  const identifiers = value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0 && item.length <= 200,
  );

  return identifiers.length === value.length ? [...new Set(identifiers)] : null;
}

export async function readOutcomeBackfillRows(
  ownerUserId: string,
  operation: OutcomeBackfillReadOperation,
  requestedIdentifiers: unknown,
) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const identifiers = boundedIdentifiers(requestedIdentifiers);
  const { client } = getServerSupabaseClient();
  if (!client || !owner) return unavailable<unknown[]>();
  if (!identifiers) return failed<unknown[]>();

  const result =
    operation === "snapshots_by_fingerprint"
      ? await client
          .from("recommendation_snapshots")
          .select("*")
          .eq("owner_user_id", owner)
          .in("snapshot_fingerprint", identifiers)
      : operation === "snapshots_by_scan_run"
        ? await client
            .from("recommendation_snapshots")
            .select("*")
            .eq("owner_user_id", owner)
            .in("scan_run_id", identifiers)
            .limit(outcomeBackfillLimit)
        : operation === "batches_by_fingerprint"
          ? await client
              .from("recommendation_batches")
              .select("*")
              .eq("owner_user_id", owner)
              .in("batch_fingerprint", identifiers)
          : await client
              .from("recommendation_batches")
              .select("*")
              .eq("owner_user_id", owner)
              .in("scan_run_fingerprint", identifiers);

  return result.error
    ? failed<unknown[]>()
    : { status: "available" as const, data: result.data ?? [] };
}

const recommendationStatuses = new Set([
  "new",
  "watched",
  "ignored",
  "discarded",
  "rejected",
  "taken",
]);

export async function updateRecommendationLifecycle(input: {
  owner_user_id: string;
  recommendation_id: string;
  status: string;
  archived?: boolean;
  reason_to_avoid?: string;
}) {
  const owner = normalizeApplicationOwnerUserId(input.owner_user_id);
  const { client } = getServerSupabaseClient();
  if (!client || !owner) return unavailable<null>();
  if (
    !input.recommendation_id ||
    input.recommendation_id.length > 160 ||
    !recommendationStatuses.has(input.status) ||
    (input.archived !== undefined && typeof input.archived !== "boolean") ||
    (input.reason_to_avoid !== undefined && input.reason_to_avoid.length > 4000)
  ) {
    return failed<null>();
  }

  const update: Record<string, unknown> = { status: input.status };
  if (input.archived !== undefined) update.archived = input.archived;
  if (input.reason_to_avoid !== undefined) update.reason_to_avoid = input.reason_to_avoid;
  const result = await client
    .from("recommendations")
    .update(update)
    .eq("id", input.recommendation_id)
    .eq("owner_user_id", owner)
    .select("id,status,archived")
    .maybeSingle();

  return result.error || !result.data
    ? failed<null>()
    : { status: "available" as const, data: null };
}

function validPositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function validPositionInput(value: Record<string, unknown>) {
  return (
    typeof value.recommendation_id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.recommendation_id,
    ) &&
    typeof value.ticker === "string" &&
    /^[A-Z.]{1,16}$/.test(value.ticker) &&
    typeof value.company_name === "string" &&
    value.company_name.length <= 240 &&
    validPositiveNumber(value.entry_price) &&
    validPositiveNumber(value.position_size) &&
    validPositiveNumber(value.current_stop) &&
    validPositiveNumber(value.target_1) &&
    validPositiveNumber(value.target_2)
  );
}

export type ApplicationOpenPositionResult =
  | {
      status: "available";
      data: {
        position_id: string;
        disposition: "created" | "reused";
        snapshot_link_count: number;
      };
    }
  | { status: "unavailable" | "failed" | "invalid" };

export async function openApplicationPosition(
  ownerUserId: string,
  input: Record<string, unknown>,
) {
  const owner = normalizeApplicationOwnerUserId(ownerUserId);
  const { client } = getServerSupabaseClient();
  if (!client || !owner) return { status: "unavailable" } as const;
  if (
    !validPositionInput(input) ||
    (input.execution_metadata !== undefined &&
      (typeof input.execution_metadata !== "object" ||
        input.execution_metadata === null ||
        Array.isArray(input.execution_metadata)))
  ) {
    return { status: "invalid" } as const;
  }

  const { data, error } = await client.rpc("app_open_owned_position_transaction", {
    p_owner_user_id: owner,
    p_recommendation_id: input.recommendation_id,
    p_ticker: input.ticker,
    p_company_name: input.company_name,
    p_entry_price: input.entry_price,
    p_position_size: input.position_size,
    p_current_stop: input.current_stop,
    p_target_1: input.target_1,
    p_target_2: input.target_2,
    p_execution_metadata: input.execution_metadata ?? null,
    p_command_version: "application_open_owned_position_v1",
  });
  const row = Array.isArray(data) ? data[0] : data;
  if (
    error ||
    !row ||
    typeof row !== "object" ||
    typeof (row as Record<string, unknown>).position_id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(
      (row as Record<string, unknown>).position_id as string,
    ) ||
    !["created", "reused"].includes(
      (row as Record<string, unknown>).disposition as string,
    ) ||
    !Number.isInteger((row as Record<string, unknown>).snapshot_link_count) ||
    ((row as Record<string, unknown>).snapshot_link_count as number) < 0
  ) {
    return { status: "failed" } as const;
  }

  const result = row as {
    position_id: string;
    disposition: "created" | "reused";
    snapshot_link_count: number;
  };
  return { status: "available" as const, data: result };
}

export async function updateApplicationPosition(input: {
  owner_user_id: string;
  position_id: string;
  operation: "partial_close" | "close";
  values: Record<string, unknown>;
}) {
  const owner = normalizeApplicationOwnerUserId(input.owner_user_id);
  const { client } = getServerSupabaseClient();
  if (!client || !owner) return unavailable<null>();
  if (!input.position_id || input.position_id.length > 160) return failed<null>();

  const values = input.values;
  const update =
    input.operation === "partial_close"
      ? {
          status: "open",
          position_size: values.position_size,
          ...(values.execution_metadata && typeof values.execution_metadata === "object"
            ? { execution_metadata: values.execution_metadata }
            : {}),
        }
      : {
          status: "closed",
          exit_price: values.exit_price,
          closed_at: values.closed_at,
          pnl: values.pnl,
          pnl_percent: values.pnl_percent,
          r_multiple: values.r_multiple,
          exit_notes: values.exit_notes,
          ...(values.execution_metadata && typeof values.execution_metadata === "object"
            ? { execution_metadata: values.execution_metadata }
            : {}),
        };
  if (
    (input.operation === "partial_close" && !validPositiveNumber(values.position_size)) ||
    (input.operation === "close" &&
      (!validPositiveNumber(values.exit_price) ||
        typeof values.closed_at !== "string" ||
        Number.isNaN(Date.parse(values.closed_at))))
  ) {
    return failed<null>();
  }

  let result = await client
    .from("positions")
    .update(update)
    .eq("id", input.position_id)
    .eq("owner_user_id", owner)
    .select("id")
    .maybeSingle();
  if (result.error && "execution_metadata" in update) {
    const fallback = { ...update } as Record<string, unknown>;
    delete fallback.execution_metadata;
    result = await client
      .from("positions")
      .update(fallback)
      .eq("id", input.position_id)
      .eq("owner_user_id", owner)
      .select("id")
      .maybeSingle();
  }

  return result.error || !result.data
    ? failed<null>()
    : { status: "available" as const, data: null };
}
