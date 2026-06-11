export type ExecutionPersistenceEnvironment =
  | "local_dev"
  | "staging"
  | "production";

export type ExecutionPersistenceFlagEnv = Partial<
  Pick<
    NodeJS.ProcessEnv,
    | "EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED"
    | "EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED"
    | "EXECUTION_PERSISTENCE_ENVIRONMENT"
    | "EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION"
    | "NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS"
  >
>;

export type ExecutionAuditPersistenceAllowedResult = {
  ok: boolean;
  environment: ExecutionPersistenceEnvironment;
  persistenceEnabled: boolean;
  writerEnabled: boolean;
  productionAllowed: boolean;
  errors: string[];
  warnings: string[];
};

const environments: ExecutionPersistenceEnvironment[] = [
  "local_dev",
  "staging",
  "production",
];

function envValue(
  env: ExecutionPersistenceFlagEnv | undefined,
  key: keyof ExecutionPersistenceFlagEnv,
) {
  return env?.[key] ?? process.env[key];
}

function isTrue(value: string | undefined) {
  return value === "true";
}

export function isExecutionAuditSupabasePersistenceEnabled(
  env?: ExecutionPersistenceFlagEnv,
) {
  return isTrue(envValue(env, "EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED"));
}

export function isExecutionAuditSupabaseWriterEnabled(
  env?: ExecutionPersistenceFlagEnv,
) {
  return isTrue(envValue(env, "EXECUTION_AUDIT_SUPABASE_WRITER_ENABLED"));
}

export function getExecutionPersistenceEnvironment(
  env?: ExecutionPersistenceFlagEnv,
): ExecutionPersistenceEnvironment {
  const value = envValue(env, "EXECUTION_PERSISTENCE_ENVIRONMENT");

  return environments.includes(value as ExecutionPersistenceEnvironment)
    ? (value as ExecutionPersistenceEnvironment)
    : "local_dev";
}

export function getExecutionPersistenceEnvironmentWarnings(
  env?: ExecutionPersistenceFlagEnv,
) {
  const value = envValue(env, "EXECUTION_PERSISTENCE_ENVIRONMENT");

  return value && !environments.includes(value as ExecutionPersistenceEnvironment)
    ? [
        `Unknown EXECUTION_PERSISTENCE_ENVIRONMENT "${value}" normalized to local_dev.`,
      ]
    : [];
}

export function assertExecutionAuditPersistenceAllowed(
  env?: ExecutionPersistenceFlagEnv,
): ExecutionAuditPersistenceAllowedResult {
  const environment = getExecutionPersistenceEnvironment(env);
  const persistenceEnabled =
    isExecutionAuditSupabasePersistenceEnabled(env);
  const writerEnabled = isExecutionAuditSupabaseWriterEnabled(env);
  const productionAllowed = isTrue(
    envValue(env, "EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION"),
  );
  const devToolsEnabled = isTrue(
    envValue(env, "NEXT_PUBLIC_ENABLE_EXECUTION_DEV_TOOLS"),
  );
  const errors: string[] = [];
  const warnings = getExecutionPersistenceEnvironmentWarnings(env);

  if (!persistenceEnabled) {
    errors.push(
      "Execution audit Supabase persistence is disabled. Set EXECUTION_AUDIT_SUPABASE_PERSISTENCE_ENABLED=true to enable future writes.",
    );
  }

  if (writerEnabled && !persistenceEnabled) {
    warnings.push(
      "Execution audit Supabase writer flag is enabled while persistence is disabled; writer will not be used.",
    );
  }

  if (environment === "production" && !productionAllowed) {
    errors.push(
      "Execution audit Supabase persistence is blocked in production unless EXECUTION_AUDIT_SUPABASE_ALLOW_PRODUCTION=true is also set.",
    );
  }

  if (environment === "production" && productionAllowed) {
    warnings.push(
      "Production audit persistence was explicitly allowed. This is not recommended until RLS and user_id ownership are finalized.",
    );
  }

  if (persistenceEnabled && !devToolsEnabled) {
    warnings.push(
      "Execution audit Supabase persistence is enabled while execution dev tools are disabled; confirm this is intentional for server-side writes.",
    );
  }

  return {
    ok: errors.length === 0,
    environment,
    persistenceEnabled,
    writerEnabled,
    productionAllowed,
    errors,
    warnings,
  };
}
