export const environmentBoundaryAuditRouteMarker =
  "action_275_environment_boundary_audit";

export const firstTinyFetchRouteExpectedMarker =
  "action_276_api_auth_middleware_boundary_audit";

export const expectedProductionSupabaseRef = "ekdyopdrrkphlrsilyoo";
export const knownStagingSupabaseRef = "pdvzyuhykomwfqyyztru";
export const expectedProductionUrl = "https://trade.valentinlabs.com";

export type EnvironmentBoundaryAuditEnv = Record<string, string | undefined>;

export type EnvironmentBoundaryAuditSummary = {
  advisory_only: true;
  environment_audit_only: true;
  app_runtime: {
    node_env: string | null;
    vercel_env: string | null;
    netlify_context: string | null;
    deploy_url_present: boolean;
    site_url_present: boolean;
    production_url_expected: typeof expectedProductionUrl;
  };
  supabase_refs: {
    public_supabase_url_present: boolean;
    public_supabase_project_ref: string | null;
    expected_production_ref: typeof expectedProductionSupabaseRef;
    known_staging_ref: typeof knownStagingSupabaseRef;
    points_to_production: boolean | "unknown";
    points_to_staging: boolean | "unknown";
  };
  secrets_presence: {
    automation_secret_present: boolean;
    automation_secret_length: number | null;
    twelve_data_api_key_present: boolean;
    twelve_data_api_key_length: number | null;
    supabase_service_role_present: boolean;
    supabase_service_role_length: number | null;
  };
  route_versions: {
    app_build_marker: string | null;
    first_tiny_fetch_route_expected_marker: typeof firstTinyFetchRouteExpectedMarker;
    diagnostics_route_marker_present: boolean | "unknown";
  };
  safety: {
    no_secret_values_returned: true;
    no_secret_hashes_returned: true;
    provider_fetch_added: false;
    provider_call_executed: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
};

function text(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function secretLength(value: string | undefined) {
  const normalized = text(value);
  return normalized ? normalized.length : null;
}

function serviceRoleSecret(env: EnvironmentBoundaryAuditEnv) {
  return (
    text(env.SUPABASE_SERVICE_ROLE_KEY) ??
    text(env.SUPABASE_SERVICE_ROLE) ??
    text(env.SUPABASE_SERVICE_ROLE_SECRET)
  );
}

function extractSupabaseProjectRef(value: string | null) {
  if (!value) return null;
  try {
    const host = new URL(value).hostname;
    const [ref] = host.split(".");
    return ref && ref !== host ? ref : null;
  } catch {
    return null;
  }
}

function pointStatus(projectRef: string | null, expectedRef: string) {
  return projectRef ? projectRef === expectedRef : "unknown";
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

export function buildEnvironmentBoundaryAudit(
  env: EnvironmentBoundaryAuditEnv = process.env,
): EnvironmentBoundaryAuditSummary {
  const publicSupabaseUrl = text(env.NEXT_PUBLIC_SUPABASE_URL);
  const publicSupabaseProjectRef =
    extractSupabaseProjectRef(publicSupabaseUrl);
  const pointsToProduction = pointStatus(
    publicSupabaseProjectRef,
    expectedProductionSupabaseRef,
  );
  const pointsToStaging = pointStatus(
    publicSupabaseProjectRef,
    knownStagingSupabaseRef,
  );
  const automationSecretLength = secretLength(env.AUTOMATION_SECRET);
  const twelveDataKeyLength = secretLength(env.TWELVE_DATA_API_KEY);
  const serviceRole = serviceRoleSecret(env);
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!publicSupabaseUrl) {
    pushUnique(warnings, "public_supabase_url_missing");
  }
  if (pointsToStaging === true) {
    pushUnique(warnings, "public_supabase_points_to_known_staging_ref");
  }
  if (pointsToProduction === false) {
    pushUnique(warnings, "public_supabase_not_expected_production_ref");
  }
  if (automationSecretLength === null) {
    pushUnique(warnings, "automation_secret_missing_from_server_runtime");
  }
  if (twelveDataKeyLength === null) {
    pushUnique(warnings, "twelve_data_api_key_missing_from_server_runtime");
  }
  if (!serviceRole) {
    pushUnique(warnings, "supabase_service_role_missing_from_server_runtime");
  }

  return {
    advisory_only: true,
    environment_audit_only: true,
    app_runtime: {
      node_env: text(env.NODE_ENV),
      vercel_env: text(env.VERCEL_ENV),
      netlify_context: text(env.CONTEXT),
      deploy_url_present: text(env.DEPLOY_URL) !== null,
      site_url_present: text(env.URL) !== null || text(env.SITE_URL) !== null,
      production_url_expected: expectedProductionUrl,
    },
    supabase_refs: {
      public_supabase_url_present: publicSupabaseUrl !== null,
      public_supabase_project_ref: publicSupabaseProjectRef,
      expected_production_ref: expectedProductionSupabaseRef,
      known_staging_ref: knownStagingSupabaseRef,
      points_to_production: pointsToProduction,
      points_to_staging: pointsToStaging,
    },
    secrets_presence: {
      automation_secret_present: automationSecretLength !== null,
      automation_secret_length: automationSecretLength,
      twelve_data_api_key_present: twelveDataKeyLength !== null,
      twelve_data_api_key_length: twelveDataKeyLength,
      supabase_service_role_present: serviceRole !== null,
      supabase_service_role_length: serviceRole?.length ?? null,
    },
    route_versions: {
      app_build_marker:
        text(env.NEXT_PUBLIC_APP_BUILD_MARKER) ??
        text(env.NEXT_PUBLIC_DEPLOY_MARKER) ??
        null,
      first_tiny_fetch_route_expected_marker:
        firstTinyFetchRouteExpectedMarker,
      diagnostics_route_marker_present: true,
    },
    safety: {
      no_secret_values_returned: true,
      no_secret_hashes_returned: true,
      provider_fetch_added: false,
      provider_call_executed: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
    },
    blockers,
    warnings,
    recommended_next_steps: [
      ...(warnings.length > 0
        ? ["compare_netlify_context_supabase_ref_and_server_secret_presence"]
        : ["environment_boundary_matches_expected_safe_signals"]),
      "verify_first_tiny_route_ping_marker_after_deploy",
      "keep_provider_fetch_persistence_replay_and_scanner_effects_disabled",
    ],
  };
}
