import type { ProviderPlanProfileMode } from "@/lib/provider-plan-profile";

export type GrowMaxLearningModeEnabledSource =
  | "server_env"
  | "public_env_fallback"
  | "default_grow_env"
  | "none";

export type GrowMaxLearningModeBlockedReason =
  | "env_flag_not_enabled"
  | "provider_plan_not_eligible"
  | null;

export type GrowMaxLearningModeEnvDiagnostics = {
  grow_max_learning_mode_env_raw_present: boolean;
  grow_max_learning_mode_env_raw_value_normalized: boolean;
  grow_max_learning_mode_public_env_raw_present: boolean;
  grow_max_learning_mode_public_env_raw_value_normalized: boolean;
  grow_max_learning_mode_requested: boolean;
  grow_max_learning_mode_blocked_reason: GrowMaxLearningModeBlockedReason;
  grow_max_learning_mode_enabled_source: GrowMaxLearningModeEnabledSource;
};

export type GrowMaxLearningModeEvaluation =
  GrowMaxLearningModeEnvDiagnostics & {
    grow_max_learning_mode: boolean;
  };

export function normalizeGrowMaxLearningBoolean(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return false;

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return false;
}

export function evaluateGrowMaxLearningMode({
  providerPlanProfileMode,
  env = process.env,
}: {
  providerPlanProfileMode: ProviderPlanProfileMode;
  env?: Record<string, string | undefined>;
}): GrowMaxLearningModeEvaluation {
  const serverPresent = env.TURE_GROW_MAX_LEARNING_MODE !== undefined;
  const publicPresent =
    env.NEXT_PUBLIC_TURE_GROW_MAX_LEARNING_MODE !== undefined;
  const serverValue = normalizeGrowMaxLearningBoolean(
    env.TURE_GROW_MAX_LEARNING_MODE,
  );
  const publicValue = normalizeGrowMaxLearningBoolean(
    env.NEXT_PUBLIC_TURE_GROW_MAX_LEARNING_MODE,
  );
  const defaultGrowValue = normalizeGrowMaxLearningBoolean(
    env.TURE_GROW_MAX_LEARNING_MODE_DEFAULT_GROW,
  );
  const requested =
    serverValue === true ||
    (!serverPresent && publicValue === true) ||
    (providerPlanProfileMode === "grow" && defaultGrowValue === true);
  const enabledSource: GrowMaxLearningModeEnabledSource =
    serverValue === true
      ? "server_env"
      : !serverPresent && publicValue === true
        ? "public_env_fallback"
        : providerPlanProfileMode === "grow" && defaultGrowValue === true
          ? "default_grow_env"
          : "none";
  const planEligible =
    providerPlanProfileMode === "grow" ||
    providerPlanProfileMode === "pro" ||
    providerPlanProfileMode === "custom";
  const enabled = requested && planEligible;
  const blockedReason: GrowMaxLearningModeBlockedReason = enabled
    ? null
    : requested
      ? "provider_plan_not_eligible"
      : "env_flag_not_enabled";

  return {
    grow_max_learning_mode: enabled,
    grow_max_learning_mode_env_raw_present: serverPresent,
    grow_max_learning_mode_env_raw_value_normalized: serverValue,
    grow_max_learning_mode_public_env_raw_present: publicPresent,
    grow_max_learning_mode_public_env_raw_value_normalized: publicValue,
    grow_max_learning_mode_requested: requested,
    grow_max_learning_mode_blocked_reason: blockedReason,
    grow_max_learning_mode_enabled_source: enabled ? enabledSource : "none",
  };
}
