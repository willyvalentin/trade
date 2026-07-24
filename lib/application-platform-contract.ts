export const applicationCanonicalProductionOrigin =
  "https://trade.valentinlabs.com" as const;
export const applicationNetlifyDefaultOrigin =
  "https://trade-vl.netlify.app" as const;
export const applicationOriginEnvironmentVariable =
  "TURE_APPLICATION_ORIGIN" as const;
export const applicationLoginRuntimeProofEnvironmentVariable =
  "TURE_LOGIN_RUNTIME_PROOF_ENABLED" as const;

export const applicationEnvironmentScopeContract = Object.freeze({
  production: {
    application_origin: "required_canonical_origin",
    application_authentication: "enabled",
    authenticated_mutations: "enabled",
    secret_source: "production_only",
    required_scope: "functions",
  },
  deploy_preview: {
    application_origin: "absent",
    application_authentication: "disabled",
    authenticated_mutations: "disabled",
    secret_source: "none",
    required_scope: "none",
  },
  branch_deploy: {
    application_origin: "absent",
    application_authentication: "disabled",
    authenticated_mutations: "disabled",
    secret_source: "none",
    required_scope: "none",
  },
  local_development: {
    application_origin: "request_local_origin",
    application_authentication: "local_credentials_only",
    authenticated_mutations: "same_origin_only",
    secret_source: "developer_local_file",
    required_scope: "none",
  },
} as const);

export type ApplicationEnvironmentVariableMetadata = Readonly<{
  key: string;
  scopes: readonly string[];
  contexts: readonly string[];
}>;

const productionCredentialKeys = new Set([
  "TRADE_APP_PASSWORD",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_SECRET",
  "AUTOMATION_SECRET",
  "OPENAI_API_KEY",
  "TWELVE_DATA_API_KEY",
  "POLYGON_API_KEY",
  "FINNHUB_API_KEY",
]);

function isPreviewExposed(contexts: readonly string[]) {
  return contexts.some((context) =>
    context === "all" ||
    context === "deploy-preview" ||
    context === "branch-deploy",
  );
}

export function evaluateApplicationEnvironmentScopeMetadata(
  metadata: readonly ApplicationEnvironmentVariableMetadata[],
) {
  const origin = metadata.find(
    (entry) => entry.key === applicationOriginEnvironmentVariable,
  );
  const previewExposedCredentials = metadata
    .filter(
      (entry) =>
        productionCredentialKeys.has(entry.key) &&
        isPreviewExposed(entry.contexts),
    )
    .map((entry) => entry.key)
    .sort();

  return Object.freeze({
    application_origin_configured: Boolean(origin),
    application_origin_functions_scoped:
      Boolean(origin?.scopes.includes("functions")),
    application_origin_production_only:
      Boolean(origin) &&
      origin!.contexts.includes("production") &&
      !isPreviewExposed(origin!.contexts),
    preview_exposed_credential_keys: Object.freeze(
      previewExposedCredentials,
    ),
    preview_credentials_isolated: previewExposedCredentials.length === 0,
    values_returned: false,
  });
}

export function buildCanonicalProductionHostRedirect(input: string) {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return null;
  }
  if (parsed.origin !== applicationNetlifyDefaultOrigin) return null;

  const destination = new URL(applicationCanonicalProductionOrigin);
  destination.pathname = parsed.pathname;
  destination.search = parsed.search;
  destination.hash = parsed.hash;
  return destination.toString();
}
