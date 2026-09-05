#!/usr/bin/env node

/**
 * Value-free preflight for the first persisted staging diagnostic scan.
 *
 * It reads only process-environment presence and the public Supabase hostname.
 * It never opens a network connection, emits a value, calls a provider, or
 * invokes an application route. The caller must explicitly export the scoped
 * Netlify values before running it.
 */

export const stagingSupabaseProjectRef = "pdvzyuhykomwfqyyztru";

const serviceRoleAliases = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_SECRET",
];

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function configured(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function refFromSupabaseUrl(value) {
  if (!configured(value)) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const suffix = ".supabase.co";
    if (!url.hostname.endsWith(suffix)) return null;
    const ref = url.hostname.slice(0, -suffix.length);
    return /^[a-z0-9]{20}$/i.test(ref) ? ref.toLowerCase() : null;
  } catch {
    return null;
  }
}

function ownerIdIsValid(value) {
  return configured(value) && uuidPattern.test(value.trim());
}

/**
 * Returns only value-free status evidence suitable for terminals, CI logs and
 * review. Keep this independent of Next.js so it can be run before deployment.
 */
export function evaluateStagingDiagnosticReadiness(environment = process.env) {
  const urlRef = refFromSupabaseUrl(environment.NEXT_PUBLIC_SUPABASE_URL);
  const configuredServiceRoleAliases = serviceRoleAliases.filter((key) =>
    configured(environment[key]),
  );
  const dynamicMoversEnabled =
    environment.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED?.trim() === "true";
  const failures = [];

  if (!configured(environment.AUTOMATION_SECRET)) {
    failures.push("automation_secret_missing");
  }
  if (urlRef === null) {
    failures.push("staging_supabase_url_invalid");
  } else if (urlRef !== stagingSupabaseProjectRef) {
    failures.push("staging_supabase_project_mismatch");
  }
  if (configuredServiceRoleAliases.length === 0) {
    failures.push("staging_service_role_missing");
  } else if (configuredServiceRoleAliases.length > 1) {
    failures.push("staging_service_role_alias_ambiguous");
  }
  if (!ownerIdIsValid(environment.TURE_APPLICATION_OWNER_USER_ID)) {
    failures.push("staging_application_owner_missing_or_invalid");
  }
  if (dynamicMoversEnabled) {
    failures.push("dynamic_movers_must_be_disabled_for_env_check");
  }

  return {
    contract: "ture_staging_diagnostic_readiness_v1",
    ready: failures.length === 0,
    failures,
    evidence: {
      expected_supabase_project_ref: stagingSupabaseProjectRef,
      configured_supabase_project_ref: urlRef,
      automation_secret_configured: configured(environment.AUTOMATION_SECRET),
      service_role_aliases_configured: configuredServiceRoleAliases,
      application_owner_id_valid: ownerIdIsValid(
        environment.TURE_APPLICATION_OWNER_USER_ID,
      ),
      dynamic_movers_enabled: dynamicMoversEnabled,
      openai_key_configured: configured(environment.OPENAI_API_KEY),
      market_data_key_configured: configured(environment.TWELVE_DATA_API_KEY),
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = evaluateStagingDiagnosticReadiness();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.ready ? 0 : 1;
}
