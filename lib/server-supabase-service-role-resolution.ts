export const serverSupabaseServiceRoleEnvironmentAliases = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_SECRET",
] as const;

export type ServerSupabaseServiceRoleEnvironmentAlias =
  (typeof serverSupabaseServiceRoleEnvironmentAliases)[number];

export type ServerSupabaseServiceRoleEnvironment = Readonly<
  Record<string, string | undefined>
>;

export type ServerSupabaseServiceRoleResolution =
  | {
      status: "ready";
      alias: ServerSupabaseServiceRoleEnvironmentAlias;
    }
  | {
      status: "missing";
      aliases: [];
    }
  | {
      status: "ambiguous";
      aliases: ServerSupabaseServiceRoleEnvironmentAlias[];
    };

function configured(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Resolves configuration identity, never a credential value. The caller owns
 * the environment and must fail closed instead of choosing an alias from an
 * ambiguous configuration.
 */
export function resolveServerSupabaseServiceRole(
  environment: ServerSupabaseServiceRoleEnvironment,
): ServerSupabaseServiceRoleResolution {
  const aliases = serverSupabaseServiceRoleEnvironmentAliases.filter((alias) =>
    configured(environment[alias]),
  );

  if (aliases.length === 0) {
    return { status: "missing", aliases: [] };
  }

  if (aliases.length > 1) {
    return { status: "ambiguous", aliases };
  }

  return { status: "ready", alias: aliases[0] };
}
