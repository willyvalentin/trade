import "server-only";

import type { InternalPaperExitCommand } from "@/lib/internal-paper-exit";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export const INTERNAL_PAPER_READBACK_V2_VERSION =
  "internal_paper_readback_v2" as const;

export type InternalPaperExitPersistenceResult =
  | Readonly<{
      status: "available";
      data: Readonly<{
        intent_id: string;
        fill_id: string;
        position_id: string;
        disposition: "created" | "reused";
        exit_reason: "stop_loss" | "target_partial" | "target_final" | "eod";
        quantity: number;
        remaining_quantity: number;
        fill_price: number;
        net_cash_proceeds: number;
        realized_net_pnl: number;
        account_state_version: number;
        cash_balance: number;
        account_status: "ready" | "paused" | "killed";
        ledger_entry_count: 4;
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
  const numeric = {
    quantity: finiteNumber(row?.quantity),
    remaining_quantity: finiteNumber(row?.remaining_quantity),
    fill_price: finiteNumber(row?.fill_price),
    net_cash_proceeds: finiteNumber(row?.net_cash_proceeds),
    realized_net_pnl: finiteNumber(row?.realized_net_pnl),
    account_state_version: finiteNumber(row?.account_state_version),
  };
  const cashBalance = finiteNumber(row?.cash_balance);

  if (
    !row ||
    typeof row.intent_id !== "string" ||
    !UUID_PATTERN.test(row.intent_id) ||
    typeof row.fill_id !== "string" ||
    !UUID_PATTERN.test(row.fill_id) ||
    typeof row.position_id !== "string" ||
    !UUID_PATTERN.test(row.position_id) ||
    (row.disposition !== "created" && row.disposition !== "reused") ||
    !["stop_loss", "target_partial", "target_final", "eod"].includes(
      String(row.exit_reason),
    ) ||
    !["ready", "paused", "killed"].includes(String(row.account_status)) ||
    numeric.quantity === null ||
    !Number.isSafeInteger(numeric.quantity) ||
    numeric.quantity <= 0 ||
    numeric.remaining_quantity === null ||
    !Number.isSafeInteger(numeric.remaining_quantity) ||
    numeric.remaining_quantity < 0 ||
    numeric.fill_price === null ||
    numeric.fill_price <= 0 ||
    numeric.net_cash_proceeds === null ||
    numeric.net_cash_proceeds < 0 ||
    numeric.realized_net_pnl === null ||
    numeric.account_state_version === null ||
    !Number.isSafeInteger(numeric.account_state_version) ||
    numeric.account_state_version <= 0 ||
    cashBalance === null ||
    cashBalance < 0 ||
    row.ledger_entry_count !== 4
  ) {
    return null;
  }

  return {
    intent_id: row.intent_id,
    fill_id: row.fill_id,
    position_id: row.position_id,
    disposition: row.disposition as "created" | "reused",
    exit_reason: row.exit_reason as
      | "stop_loss"
      | "target_partial"
      | "target_final"
      | "eod",
    quantity: numeric.quantity,
    remaining_quantity: numeric.remaining_quantity,
    fill_price: numeric.fill_price,
    net_cash_proceeds: numeric.net_cash_proceeds,
    realized_net_pnl: numeric.realized_net_pnl,
    account_state_version: numeric.account_state_version,
    cash_balance: cashBalance,
    account_status: row.account_status as "ready" | "paused" | "killed",
    ledger_entry_count: 4 as const,
  };
}

export async function applyInternalPaperExit(
  command: InternalPaperExitCommand,
): Promise<InternalPaperExitPersistenceResult> {
  const { client } = getServerSupabaseClient();
  if (!client) return { status: "unavailable" };

  const { data, error } = await client.rpc("app_apply_internal_paper_exit_v1", {
    p_owner_user_id: command.owner_user_id,
    p_account_id: command.account_id,
    p_position_id: command.position_id,
    p_candle_id: command.candle_id,
    p_fill_model_version: command.fill_model_version,
    p_evidence_version: command.evidence_version,
    p_command_version: command.command_version,
  });
  const parsed = parseResult(Array.isArray(data) ? data[0] : data);
  return error || !parsed
    ? { status: "failed" }
    : { status: "available", data: parsed };
}

export async function readInternalPaperAccountV2(input: {
  owner_user_id: string;
  account_id: string;
}) {
  const { client } = getServerSupabaseClient();
  if (!client) return { status: "unavailable" } as const;

  const { data, error } = await client.rpc("app_read_internal_paper_account_v2", {
    p_owner_user_id: input.owner_user_id,
    p_account_id: input.account_id,
    p_read_version: INTERNAL_PAPER_READBACK_V2_VERSION,
  });
  const readback = objectOrNull(data);
  if (
    error ||
    !readback ||
    readback.readback_version !== INTERNAL_PAPER_READBACK_V2_VERSION ||
    readback.owner_user_id !== input.owner_user_id ||
    readback.account_id !== input.account_id
  ) {
    return { status: "failed" } as const;
  }
  return { status: "available", data: readback } as const;
}
