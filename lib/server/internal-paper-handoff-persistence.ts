import "server-only";

import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import {
  buildInternalPaperDecisionHandoff,
  INTERNAL_PAPER_HANDOFF_CONTEXT_VERSION,
  type InternalPaperHandoffAccountContext,
} from "@/lib/internal-paper-handoff";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import { enqueueInternalPaperWorkerJob } from "@/lib/server/internal-paper-worker-persistence";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function finiteNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseAccountContext(value: unknown): InternalPaperHandoffAccountContext | null {
  const row = objectOrNull(value);
  if (!row) return null;
  const eligibleSymbols = Array.isArray(row.eligible_symbols)
    ? row.eligible_symbols.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      )
    : [];
  const numeric = {
    cash_balance: finiteNumber(row.cash_balance),
    per_trade_risk_cap: finiteNumber(row.per_trade_risk_cap),
    spread_bps: finiteNumber(row.spread_bps),
    slippage_bps: finiteNumber(row.slippage_bps),
    commission_per_order: finiteNumber(row.commission_per_order),
  };
  if (
    row.context_version !== INTERNAL_PAPER_HANDOFF_CONTEXT_VERSION ||
    typeof row.owner_user_id !== "string" ||
    !UUID_PATTERN.test(row.owner_user_id) ||
    typeof row.account_id !== "string" ||
    !UUID_PATTERN.test(row.account_id) ||
    (row.status !== "ready" && row.status !== "paused" && row.status !== "killed") ||
    typeof row.config_version !== "string" ||
    typeof row.strategy_id !== "string" ||
    typeof row.strategy_version !== "string" ||
    typeof row.strategy_rollback_identity !== "string" ||
    typeof row.symbol_selection_policy_id !== "string" ||
    typeof row.symbol_selection_policy_version !== "string" ||
    typeof row.observed_universe_version !== "string" ||
    eligibleSymbols.length === 0 ||
    Object.values(numeric).some((item) => item === null)
  ) {
    return null;
  }
  return {
    context_version: INTERNAL_PAPER_HANDOFF_CONTEXT_VERSION,
    owner_user_id: row.owner_user_id,
    account_id: row.account_id,
    status: row.status,
    config_version: row.config_version,
    strategy_id: row.strategy_id,
    strategy_version: row.strategy_version,
    strategy_rollback_identity: row.strategy_rollback_identity,
    symbol_selection_policy_id: row.symbol_selection_policy_id,
    symbol_selection_policy_version: row.symbol_selection_policy_version,
    observed_universe_version: row.observed_universe_version,
    eligible_symbols: eligibleSymbols,
    cash_balance: numeric.cash_balance as number,
    per_trade_risk_cap: numeric.per_trade_risk_cap as number,
    spread_bps: numeric.spread_bps as number,
    slippage_bps: numeric.slippage_bps as number,
    commission_per_order: numeric.commission_per_order as number,
  };
}

export async function enqueueInternalPaperDecisionHandoff(input: {
  owner_user_id: string;
  account_id: string;
  scan_run_id: string;
  decision: CandidateDecisionRecord;
  decision_lineage_status: "reconstructable" | "incomplete" | "missing";
  scan_run_persisted: boolean;
  snapshots: RecommendationSnapshot[];
  persisted_snapshot_fingerprints: string[];
}) {
  const { client } = getServerSupabaseClient();
  if (!client) return { status: "unavailable" } as const;
  const { data, error } = await client.rpc(
    "app_read_internal_paper_handoff_context_v1",
    {
      p_owner_user_id: input.owner_user_id,
      p_account_id: input.account_id,
      p_context_version: INTERNAL_PAPER_HANDOFF_CONTEXT_VERSION,
    },
  );
  const account = error ? null : parseAccountContext(data);
  if (!account) return { status: "failed" } as const;

  const handoff = buildInternalPaperDecisionHandoff({ ...input, account });
  if (handoff.status !== "ready") return handoff;
  const enqueued = await enqueueInternalPaperWorkerJob(handoff.job, client);
  if (enqueued.status !== "available") return { status: enqueued.status } as const;
  return {
    status: "enqueued",
    selected_ticker: handoff.selected_ticker,
    quantity: handoff.quantity,
    work_kind: handoff.job.work_kind,
    queue: enqueued.data,
  } as const;
}
