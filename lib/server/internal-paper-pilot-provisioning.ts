import "server-only";

import { getServerSupabaseClient } from "@/lib/supabase-server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const INTERNAL_PAPER_PILOT_PROVISIONING_VERSION =
  "internal_paper_pilot_provisioning_v1" as const;
export const INTERNAL_PAPER_PILOT_POLICY_VERSION =
  "internal_paper_pilot_operating_policy_2026_09_22_v1" as const;

type ProvisioningInput = {
  owner_user_id: string;
  account_id: string;
  account_key: string;
  strategy_id: string;
  strategy_version: string;
  strategy_rollback_identity: string;
  symbol_selection_policy_id: string;
  symbol_selection_policy_version: string;
  observed_universe_version: string;
  eligible_symbols: string[];
  config_version: string;
  starting_cash: number;
  per_trade_risk_cap: number;
  daily_loss_cap: number;
  spread_bps: number;
  slippage_bps: number;
  commission_per_order: number;
  provider_rights_evidence_id: string;
  derived_evidence_retention_days: number;
  max_derived_evidence_bytes: number;
  frozen_at: string;
};

export type InternalPaperPilotProvisioningReceipt = {
  provisioning_version: typeof INTERNAL_PAPER_PILOT_PROVISIONING_VERSION;
  disposition: "created" | "reused";
  owner_user_id: string;
  account_id: string;
  account_key: string;
  account_status: "paused";
  account_config_version: string;
  eligible_symbols: string[];
  provider_rights_evidence_id: string;
  policy_version: typeof INTERNAL_PAPER_PILOT_POLICY_VERSION;
  policy_disposition: "created" | "reused";
  frozen_at: string;
};

type RpcClient = NonNullable<ReturnType<typeof getServerSupabaseClient>["client"]>;

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function sameInstant(left: string, right: string) {
  return explicitInstant(left) && Date.parse(left) === Date.parse(right);
}

export function parseInternalPaperPilotProvisioningReceipt(
  value: unknown,
): InternalPaperPilotProvisioningReceipt | null {
  const receipt = objectOrNull(value);
  const eligibleSymbols = Array.isArray(receipt?.eligible_symbols)
    ? receipt.eligible_symbols.filter(
        (symbol): symbol is string =>
          typeof symbol === "string" && /^[A-Z][A-Z0-9.]{0,15}$/.test(symbol),
      )
    : [];
  if (
    !receipt ||
    receipt.provisioning_version !== INTERNAL_PAPER_PILOT_PROVISIONING_VERSION ||
    (receipt.disposition !== "created" && receipt.disposition !== "reused") ||
    typeof receipt.owner_user_id !== "string" ||
    !UUID_PATTERN.test(receipt.owner_user_id) ||
    typeof receipt.account_id !== "string" ||
    !UUID_PATTERN.test(receipt.account_id) ||
    typeof receipt.account_key !== "string" ||
    receipt.account_key.length === 0 ||
    receipt.account_status !== "paused" ||
    typeof receipt.account_config_version !== "string" ||
    receipt.account_config_version.length === 0 ||
    eligibleSymbols.length === 0 ||
    eligibleSymbols.length !== (receipt.eligible_symbols as unknown[]).length ||
    typeof receipt.provider_rights_evidence_id !== "string" ||
    receipt.provider_rights_evidence_id.length === 0 ||
    receipt.policy_version !== INTERNAL_PAPER_PILOT_POLICY_VERSION ||
    (receipt.policy_disposition !== "created" &&
      receipt.policy_disposition !== "reused") ||
    !explicitInstant(receipt.frozen_at)
  ) {
    return null;
  }
  return {
    provisioning_version: INTERNAL_PAPER_PILOT_PROVISIONING_VERSION,
    disposition: receipt.disposition,
    owner_user_id: receipt.owner_user_id,
    account_id: receipt.account_id,
    account_key: receipt.account_key,
    account_status: "paused",
    account_config_version: receipt.account_config_version,
    eligible_symbols: eligibleSymbols,
    provider_rights_evidence_id: receipt.provider_rights_evidence_id,
    policy_version: INTERNAL_PAPER_PILOT_POLICY_VERSION,
    policy_disposition: receipt.policy_disposition,
    frozen_at: receipt.frozen_at,
  };
}

export async function provisionInternalPaperPilot(
  input: ProvisioningInput & { client?: RpcClient },
) {
  const client = input.client ?? getServerSupabaseClient().client;
  if (!client) return { status: "unavailable" } as const;
  const { data, error } = await client.rpc(
    "app_provision_internal_paper_pilot_v1",
    {
      p_owner_user_id: input.owner_user_id,
      p_account_id: input.account_id,
      p_account_key: input.account_key,
      p_strategy_id: input.strategy_id,
      p_strategy_version: input.strategy_version,
      p_strategy_rollback_identity: input.strategy_rollback_identity,
      p_symbol_selection_policy_id: input.symbol_selection_policy_id,
      p_symbol_selection_policy_version: input.symbol_selection_policy_version,
      p_observed_universe_version: input.observed_universe_version,
      p_eligible_symbols: input.eligible_symbols,
      p_config_version: input.config_version,
      p_starting_cash: input.starting_cash,
      p_per_trade_risk_cap: input.per_trade_risk_cap,
      p_daily_loss_cap: input.daily_loss_cap,
      p_spread_bps: input.spread_bps,
      p_slippage_bps: input.slippage_bps,
      p_commission_per_order: input.commission_per_order,
      p_provider_rights_evidence_id: input.provider_rights_evidence_id,
      p_derived_evidence_retention_days:
        input.derived_evidence_retention_days,
      p_max_derived_evidence_bytes: input.max_derived_evidence_bytes,
      p_frozen_at: input.frozen_at,
      p_provisioning_version: INTERNAL_PAPER_PILOT_PROVISIONING_VERSION,
    },
  );
  const receipt = error
    ? null
    : parseInternalPaperPilotProvisioningReceipt(data);
  const expectedSymbols = [...new Set(
    input.eligible_symbols.map((symbol) => symbol.trim().toUpperCase()),
  )].sort();
  const exactReceipt =
    receipt &&
    receipt.owner_user_id === input.owner_user_id &&
    receipt.account_id === input.account_id &&
    receipt.account_key === input.account_key &&
    receipt.account_config_version === input.config_version &&
    receipt.provider_rights_evidence_id === input.provider_rights_evidence_id &&
    sameInstant(input.frozen_at, receipt.frozen_at) &&
    JSON.stringify(receipt.eligible_symbols) === JSON.stringify(expectedSymbols)
      ? receipt
      : null;
  return exactReceipt
    ? ({ status: "provisioned", receipt: exactReceipt } as const)
    : ({ status: "failed" } as const);
}
