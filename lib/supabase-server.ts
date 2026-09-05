import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  resolveServerSupabaseServiceRole,
} from "@/lib/server-supabase-service-role-resolution";

export type ServerSupabaseUnavailableReason =
  | "supabase_missing_env"
  | "supabase_service_role_missing"
  | "supabase_service_role_ambiguous";

export type ServerSupabaseEnvironment = Readonly<
  Record<string, string | undefined>
>;

function configured(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function getServerSupabaseClient(
  environment: ServerSupabaseEnvironment = process.env,
) {
  const supabaseUrl = environment.NEXT_PUBLIC_SUPABASE_URL;

  if (!configured(supabaseUrl)) {
    return {
      client: null,
      unavailable_reason: "supabase_missing_env" as const,
    };
  }

  const serviceRole = resolveServerSupabaseServiceRole(environment);
  if (serviceRole.status === "missing") {
    return {
      client: null,
      unavailable_reason: "supabase_service_role_missing" as const,
    };
  }

  if (serviceRole.status === "ambiguous") {
    return {
      client: null,
      unavailable_reason: "supabase_service_role_ambiguous" as const,
    };
  }

  const serviceRoleKey = environment[serviceRole.alias];
  if (!configured(serviceRoleKey)) {
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
