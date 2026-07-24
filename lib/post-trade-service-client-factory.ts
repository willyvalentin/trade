import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY =
  "SUPABASE_STAGING_SERVICE_ROLE_KEY" as const;
export const POST_TRADE_STAGING_SUPABASE_URL_ENV_KEY =
  "SUPABASE_STAGING_URL" as const;

export const POST_TRADE_STAGING_PROJECT_REF = "pdvzyuhykomwfqyyztru" as const;
export const POST_TRADE_STAGING_ENVIRONMENT_NAME = "ture-staging" as const;

export type PostTradeServiceClientFactoryDraftStatus =
  | "ready_for_future_factory_gate"
  | "blocked_missing_staging_service_role_key"
  | "blocked_client_exposed_service_role_key"
  | "blocked_production_like_target"
  | "blocked_ambiguous_target";

export type PostTradeServiceClientFactoryDraftInput = {
  environmentName?: string | null;
  projectRef?: string | null;
  serviceRoleEnvKeyName?: string | null;
  serviceRoleEnvKeyPresent?: boolean;
};

export type PostTradeServiceClientFactoryDraftResult = {
  status: PostTradeServiceClientFactoryDraftStatus;
  ready: boolean;
  environmentName: typeof POST_TRADE_STAGING_ENVIRONMENT_NAME;
  projectRef: typeof POST_TRADE_STAGING_PROJECT_REF;
  serviceRoleEnvKeyName: typeof POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY;
  safetyFlags: {
    serverOnlyModule: true;
    stagingOnly: true;
    productionBlocked: true;
    clientExposureBlocked: true;
    noSecretValueReturned: true;
    noSupabaseClientCreated: true;
    noDatabaseConnection: true;
    noDatabaseWrite: true;
    noRuntimeActivation: true;
  };
  reasons: string[];
};

export type PostTradeStagingServiceClientStatus =
  | "ready_staging_service_client"
  | "blocked_missing_staging_supabase_url"
  | "blocked_missing_staging_service_role_key"
  | "blocked_client_exposed_service_role_key"
  | "blocked_production_like_target"
  | "blocked_ambiguous_target";

export type PostTradeStagingServiceClientInput = {
  environmentName?: string | null;
  projectRef?: string | null;
  serviceRoleEnvKeyName?: string | null;
  supabaseUrlEnvKeyName?: string | null;
};

export type PostTradeStagingServiceClientResult = {
  status: PostTradeStagingServiceClientStatus;
  client: SupabaseClient | null;
  environmentName: typeof POST_TRADE_STAGING_ENVIRONMENT_NAME;
  projectRef: typeof POST_TRADE_STAGING_PROJECT_REF;
  serviceRoleEnvKeyName: typeof POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY;
  supabaseUrlEnvKeyName: typeof POST_TRADE_STAGING_SUPABASE_URL_ENV_KEY;
  safetyFlags: {
    serverOnlyModule: true;
    stagingOnly: true;
    productionBlocked: true;
    clientExposureBlocked: true;
    noSecretValueReturned: true;
    noDatabaseWrite: true;
    noRuntimeActivation: true;
  };
  reasons: string[];
};

function isProductionLike(value: string | null | undefined) {
  if (!value) return false;
  return /\b(prod|production|trade)\b/i.test(value);
}

function buildBlockedResult(
  status: Exclude<
    PostTradeServiceClientFactoryDraftStatus,
    "ready_for_future_factory_gate"
  >,
  reasons: string[],
): PostTradeServiceClientFactoryDraftResult {
  return {
    status,
    ready: false,
    environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
    projectRef: POST_TRADE_STAGING_PROJECT_REF,
    serviceRoleEnvKeyName: POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY,
    safetyFlags: factorySafetyFlags(),
    reasons,
  };
}

function factorySafetyFlags(): PostTradeServiceClientFactoryDraftResult["safetyFlags"] {
  return {
    serverOnlyModule: true,
    stagingOnly: true,
    productionBlocked: true,
    clientExposureBlocked: true,
    noSecretValueReturned: true,
    noSupabaseClientCreated: true,
    noDatabaseConnection: true,
    noDatabaseWrite: true,
    noRuntimeActivation: true,
  };
}

function serviceClientSafetyFlags(): PostTradeStagingServiceClientResult["safetyFlags"] {
  return {
    serverOnlyModule: true,
    stagingOnly: true,
    productionBlocked: true,
    clientExposureBlocked: true,
    noSecretValueReturned: true,
    noDatabaseWrite: true,
    noRuntimeActivation: true,
  };
}

function blockedServiceClientResult(
  status: Exclude<
    PostTradeStagingServiceClientStatus,
    "ready_staging_service_client"
  >,
  reasons: string[],
): PostTradeStagingServiceClientResult {
  return {
    status,
    client: null,
    environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
    projectRef: POST_TRADE_STAGING_PROJECT_REF,
    serviceRoleEnvKeyName: POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY,
    supabaseUrlEnvKeyName: POST_TRADE_STAGING_SUPABASE_URL_ENV_KEY,
    safetyFlags: serviceClientSafetyFlags(),
    reasons,
  };
}

export function buildPostTradeServiceClientFactoryDraft(
  input: PostTradeServiceClientFactoryDraftInput = {},
): PostTradeServiceClientFactoryDraftResult {
  const serviceRoleEnvKeyName =
    input.serviceRoleEnvKeyName ?? POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY;
  const environmentName =
    input.environmentName ?? POST_TRADE_STAGING_ENVIRONMENT_NAME;
  const projectRef = input.projectRef ?? POST_TRADE_STAGING_PROJECT_REF;

  if (serviceRoleEnvKeyName.startsWith("NEXT_PUBLIC_")) {
    return buildBlockedResult("blocked_client_exposed_service_role_key", [
      "serviceRoleEnvKeyName:client_exposed_service_role_key",
    ]);
  }

  if (serviceRoleEnvKeyName !== POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY) {
    return buildBlockedResult("blocked_ambiguous_target", [
      "serviceRoleEnvKeyName:unexpected_service_role_key_name",
    ]);
  }

  if (
    environmentName !== POST_TRADE_STAGING_ENVIRONMENT_NAME ||
    projectRef !== POST_TRADE_STAGING_PROJECT_REF
  ) {
    return buildBlockedResult("blocked_ambiguous_target", [
      "target:staging_target_mismatch",
    ]);
  }

  if (isProductionLike(environmentName) || isProductionLike(projectRef)) {
    return buildBlockedResult("blocked_production_like_target", [
      "target:production_like_target_blocked",
    ]);
  }

  if (input.serviceRoleEnvKeyPresent !== true) {
    return buildBlockedResult("blocked_missing_staging_service_role_key", [
      "SUPABASE_STAGING_SERVICE_ROLE_KEY:missing_staging_service_role_key",
    ]);
  }

  return {
    status: "ready_for_future_factory_gate",
    ready: true,
    environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
    projectRef: POST_TRADE_STAGING_PROJECT_REF,
    serviceRoleEnvKeyName: POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY,
    safetyFlags: factorySafetyFlags(),
    reasons: [],
  };
}

export function getPostTradeStagingServiceClient(
  input: PostTradeStagingServiceClientInput = {},
): PostTradeStagingServiceClientResult {
  const serviceRoleEnvKeyName =
    input.serviceRoleEnvKeyName ?? POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY;
  const supabaseUrlEnvKeyName =
    input.supabaseUrlEnvKeyName ?? POST_TRADE_STAGING_SUPABASE_URL_ENV_KEY;
  const environmentName =
    input.environmentName ?? POST_TRADE_STAGING_ENVIRONMENT_NAME;
  const projectRef = input.projectRef ?? POST_TRADE_STAGING_PROJECT_REF;

  if (serviceRoleEnvKeyName.startsWith("NEXT_PUBLIC_")) {
    return blockedServiceClientResult("blocked_client_exposed_service_role_key", [
      "serviceRoleEnvKeyName:client_exposed_service_role_key",
    ]);
  }

  if (
    serviceRoleEnvKeyName !== POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY ||
    supabaseUrlEnvKeyName !== POST_TRADE_STAGING_SUPABASE_URL_ENV_KEY
  ) {
    return blockedServiceClientResult("blocked_ambiguous_target", [
      "target:unexpected_staging_env_key_name",
    ]);
  }

  if (
    environmentName !== POST_TRADE_STAGING_ENVIRONMENT_NAME ||
    projectRef !== POST_TRADE_STAGING_PROJECT_REF
  ) {
    return blockedServiceClientResult("blocked_ambiguous_target", [
      "target:staging_target_mismatch",
    ]);
  }

  if (isProductionLike(environmentName) || isProductionLike(projectRef)) {
    return blockedServiceClientResult("blocked_production_like_target", [
      "target:production_like_target_blocked",
    ]);
  }

  const supabaseUrl = process.env[POST_TRADE_STAGING_SUPABASE_URL_ENV_KEY];

  if (!supabaseUrl) {
    return blockedServiceClientResult("blocked_missing_staging_supabase_url", [
      "SUPABASE_STAGING_URL:missing_staging_supabase_url",
    ]);
  }

  const serviceRoleCredential =
    process.env[POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY];

  if (!serviceRoleCredential) {
    return blockedServiceClientResult("blocked_missing_staging_service_role_key", [
      "SUPABASE_STAGING_SERVICE_ROLE_KEY:missing_staging_service_role_key",
    ]);
  }

  return {
    status: "ready_staging_service_client",
    client: createClient(supabaseUrl, serviceRoleCredential, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
    environmentName: POST_TRADE_STAGING_ENVIRONMENT_NAME,
    projectRef: POST_TRADE_STAGING_PROJECT_REF,
    serviceRoleEnvKeyName: POST_TRADE_STAGING_SERVICE_ROLE_ENV_KEY,
    supabaseUrlEnvKeyName: POST_TRADE_STAGING_SUPABASE_URL_ENV_KEY,
    safetyFlags: serviceClientSafetyFlags(),
    reasons: [],
  };
}
