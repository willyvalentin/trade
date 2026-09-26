import "server-only";

import {
  observationSeriesActivationPreflightReadbackFromUnknown,
  observationSeriesActivationPreflightRpcName,
  type ObservationSeriesActivationPreflightReadback,
} from "@/lib/observation-series-activation-preflight";
import type { ObservationSeriesControl } from "@/lib/observation-series-control";
import { getServerSupabaseClient } from "@/lib/supabase-server";

type ObservationSeriesActivationPreflightRpcClient = Readonly<{
  rpc(
    name: typeof observationSeriesActivationPreflightRpcName,
    args: Readonly<{
      p_owner_user_id: string;
      p_trading_date: string;
      p_starts_at_utc: string;
      p_expires_at_utc: string;
      p_max_attempts: number;
      p_max_provider_credits: number;
    }>,
  ): Promise<Readonly<{ data: unknown; error: unknown }>>;
}>;

function unavailable(): ObservationSeriesActivationPreflightReadback {
  return {
    status: "unavailable",
    reason_codes: ["observation_series_activation_preflight_invalid"],
  };
}

export async function readObservationSeriesActivationPreflight(input: {
  owner_user_id: string;
  control: ObservationSeriesControl;
}): Promise<ObservationSeriesActivationPreflightReadback> {
  const control = input.control;
  if (
    control.status !== "ready" ||
    !control.trading_date ||
    !control.starts_at_utc ||
    !control.expires_at_utc ||
    !control.max_attempts ||
    !control.max_provider_credits
  ) {
    return unavailable();
  }
  const serverSupabase = getServerSupabaseClient();
  if (!serverSupabase.client) return unavailable();

  try {
    const client =
      serverSupabase.client as unknown as ObservationSeriesActivationPreflightRpcClient;
    const { data, error } = await client.rpc(
      observationSeriesActivationPreflightRpcName,
      {
        p_owner_user_id: input.owner_user_id,
        p_trading_date: control.trading_date,
        p_starts_at_utc: control.starts_at_utc,
        p_expires_at_utc: control.expires_at_utc,
        p_max_attempts: control.max_attempts,
        p_max_provider_credits: control.max_provider_credits,
      },
    );
    if (error || !Array.isArray(data) || data.length !== 1) return unavailable();
    return observationSeriesActivationPreflightReadbackFromUnknown(
      data[0],
      control,
    );
  } catch {
    return unavailable();
  }
}
