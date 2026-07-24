import "server-only";

import { createClient } from "@supabase/supabase-js";

export type ServerSupabaseUnavailableReason =
  | "supabase_missing_env"
  | "supabase_service_role_missing";

export function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_ROLE_SECRET;

  if (!supabaseUrl) {
    return {
      client: null,
      unavailable_reason: "supabase_missing_env" as const,
    };
  }

  if (!serviceRoleKey) {
    return {
      client: null,
      unavailable_reason: "supabase_service_role_missing" as const,
    };
  }

  return {
    client: createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
    unavailable_reason: null,
  };
}
