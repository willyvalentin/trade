import "server-only";

import type { InternalPaperEntryCommand } from "@/lib/internal-paper-entry";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export const INTERNAL_PAPER_READBACK_VERSION =
  "internal_paper_readback_v1" as const;

export type InternalPaperEntryPersistenceResult =
  | Readonly<{
      status: "available";
      data: Readonly<{
        intent_id: string;
        fill_id: string;
        position_id: string;
        disposition: "created" | "reused";
        account_state_version: number;
        cash_balance: number;
        fill_price: number;
        total_cash_cost: number;
        ledger_entry_count: 3;
      }>;
    }>
  | Readonly<{ status: "unavailable" | "failed" }>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function finiteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseResult(value: unknown) {
  const row = objectOrNull(value);
  const accountStateVersion = finiteNumber(row?.account_state_version);
  const cashBalance = finiteNumber(row?.cash_balance);
  const fillPrice = finiteNumber(row?.fill_price);
  const totalCashCost = finiteNumber(row?.total_cash_cost);

  if (
    !row ||
    typeof row.intent_id !== "string" ||
    !UUID_PATTERN.test(row.intent_id) ||
    typeof row.fill_id !== "string" ||
    !UUID_PATTERN.test(row.fill_id) ||
    typeof row.position_id !== "string" ||
    !UUID_PATTERN.test(row.position_id) ||
    (row.disposition !== "created" && row.disposition !== "reused") ||
    accountStateVersion === null ||
    !Number.isSafeInteger(accountStateVersion) ||
    accountStateVersion <= 0 ||
    cashBalance === null ||
    cashBalance < 0 ||
    fillPrice === null ||
    fillPrice <= 0 ||
    totalCashCost === null ||
    totalCashCost <= 0 ||
    row.ledger_entry_count !== 3
  ) {
    return null;
  }

  const disposition = row.disposition as "created" | "reused";

  return {
    intent_id: row.intent_id,
    fill_id: row.fill_id,
    position_id: row.position_id,
    disposition,
    account_state_version: accountStateVersion,
    cash_balance: cashBalance,
    fill_price: fillPrice,
    total_cash_cost: totalCashCost,
    ledger_entry_count: 3 as const,
  };
}

/**
 * Server-only persistence boundary. The database RPC is the sole authority for
 * account scope, risk, idempotency and the atomic economic paper effect.
 */
export async function applyInternalPaperEntry(
  command: InternalPaperEntryCommand,
): Promise<InternalPaperEntryPersistenceResult> {
  const { client } = getServerSupabaseClient();
  if (!client) return { status: "unavailable" };

  const { data, error } = await client.rpc("app_apply_internal_paper_entry_v1", {
    p_owner_user_id: command.owner_user_id,
    p_account_id: command.account_id,
    p_scan_run_id: command.scan_run_id,
    p_scan_run_fingerprint: command.scan_run_fingerprint,
    p_snapshot_id: command.snapshot_id,
    p_snapshot_fingerprint: command.snapshot_fingerprint,
    p_candidate_identity: command.candidate_identity,
    p_strategy_id: command.strategy_id,
    p_strategy_version: command.strategy_version,
    p_strategy_rollback_identity: command.strategy_rollback_identity,
    p_symbol_selection_policy_id: command.symbol_selection_policy_id,
    p_symbol_selection_policy_version: command.symbol_selection_policy_version,
    p_observed_universe_version: command.observed_universe_version,
    p_ticker: command.ticker,
    p_quantity: command.quantity,
    p_arrival_price: command.arrival_price,
    p_stop_price: command.stop_price,
    p_target_price: command.target_price,
    p_submitted_at: command.submitted_at,
    p_fill_model_version: command.fill_model_version,
    p_command_version: command.command_version,
  });

  const parsed = parseResult(Array.isArray(data) ? data[0] : data);
  return error || !parsed
    ? { status: "failed" }
    : { status: "available", data: parsed };
}

export async function readInternalPaperAccount(input: {
  owner_user_id: string;
  account_id: string;
}) {
  const { client } = getServerSupabaseClient();
  if (!client) return { status: "unavailable" } as const;

  const { data, error } = await client.rpc("app_read_internal_paper_account_v1", {
    p_owner_user_id: input.owner_user_id,
    p_account_id: input.account_id,
    p_read_version: INTERNAL_PAPER_READBACK_VERSION,
  });
  const readback = objectOrNull(data);

  if (
    error ||
    !readback ||
    readback.readback_version !== INTERNAL_PAPER_READBACK_VERSION ||
    readback.owner_user_id !== input.owner_user_id ||
    readback.account_id !== input.account_id
  ) {
    return { status: "failed" } as const;
  }

  return { status: "available", data: readback } as const;
}
