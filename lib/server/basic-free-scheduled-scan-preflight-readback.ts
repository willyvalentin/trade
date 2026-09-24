import "server-only";

import {
  basicFreeScheduledScanPreflightReadbackFromUnknown,
  basicFreeScheduledScanPreflightRpcName,
  type BasicFreeScheduledScanPreflightReadback,
} from "@/lib/basic-free-scheduled-scan-preflight-readback";
import { getServerSupabaseClient } from "@/lib/supabase-server";

type PreflightRpcClient = {
  rpc(
    name: typeof basicFreeScheduledScanPreflightRpcName,
    args: {
      p_owner_user_id: string;
      p_trading_date: string;
      p_target_slot_utc: string;
    },
  ): Promise<{ data: unknown; error: unknown }>;
};

function exactlyOne(value: unknown) {
  return Array.isArray(value) && value.length === 1 ? value[0] : null;
}

function unavailable(): BasicFreeScheduledScanPreflightReadback {
  return {
    status: "unavailable",
    reason_codes: ["basic_free_scheduled_scan_preflight_missing_or_invalid"],
  };
}

/**
 * Uses only the explicitly service-role-granted aggregate RPC. The reservation
 * table stays unreadable to direct clients, including this server adapter.
 */
export async function readBasicFreeScheduledScanPreflight(input: {
  owner_user_id: string;
  trading_date: string;
  target_slot_utc: string;
}): Promise<BasicFreeScheduledScanPreflightReadback> {
  const serverSupabase = getServerSupabaseClient();
  if (!serverSupabase.client) return unavailable();

  try {
    // The generated database types intentionally remain untouched until this
    // additive migration has been applied and catalog-verified. This narrow
    // transport port still fixes the RPC name and exact three input values.
    const client = serverSupabase.client as unknown as PreflightRpcClient;
    const { data, error } = await client.rpc(
      basicFreeScheduledScanPreflightRpcName,
      {
        p_owner_user_id: input.owner_user_id,
        p_trading_date: input.trading_date,
        p_target_slot_utc: input.target_slot_utc,
      },
    );
    if (error) return unavailable();
    return basicFreeScheduledScanPreflightReadbackFromUnknown(exactlyOne(data), {
      trading_date: input.trading_date,
      target_slot_utc: input.target_slot_utc,
    });
  } catch {
    return unavailable();
  }
}
