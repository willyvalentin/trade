export const continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable =
  "TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT" as const;

const deploymentCommitPattern = /^[0-9a-f]{40}$/;

type DeploymentEnvironment = Record<string, string | undefined>;

export type ContinuousIntelligenceShadowCanaryScheduledDeploymentBinding =
  | "exact"
  | "mismatch"
  | "request_mismatch"
  | "explicit_configuration_conflict"
  | "explicit_configuration_malformed"
  | "platform_identity_conflict"
  | "platform_identity_malformed"
  | "unavailable";

export type ContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity = Readonly<{
  status: Exclude<ContinuousIntelligenceShadowCanaryScheduledDeploymentBinding, "exact" | "mismatch" | "request_mismatch"> | "available";
  deployment_commit: string | null;
  source: "platform_commit_ref" | "platform_netlify_commit_ref" | "explicit_fallback" | null;
  explicit_commit: string | null;
}>;

function canonicalCommit(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized && deploymentCommitPattern.test(normalized) ? normalized : null;
}

function hasInvalidCommitValue(value: string | undefined) {
  return value !== undefined && value.trim().length > 0 && canonicalCommit(value) === null;
}

/**
 * A deployment binding accepts only a canonical Git commit SHA. This keeps the
 * value non-secret, bounded, and stable for the revision that issued it.
 */
export function resolveContinuousIntelligenceShadowCanaryRuntimeDeploymentCommit(
  environment: DeploymentEnvironment,
) {
  const candidates = [
    environment[continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable],
    environment.COMMIT_REF,
    environment.NETLIFY_COMMIT_REF,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim().toLowerCase();
    if (value && deploymentCommitPattern.test(value)) return value;
  }

  return null;
}

/**
 * Scheduled work binds to platform deployment metadata when it is available.
 * The explicit Ture value is an assertion in that case, and only a fallback
 * when the platform exposes no valid deployment identity.
 */
export function resolveContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity(
  environment: DeploymentEnvironment,
): ContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity {
  const explicitRaw = environment[continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable];
  const commitRefRaw = environment.COMMIT_REF;
  const netlifyCommitRefRaw = environment.NETLIFY_COMMIT_REF;
  const explicit = canonicalCommit(explicitRaw);
  const commitRef = canonicalCommit(commitRefRaw);
  const netlifyCommitRef = canonicalCommit(netlifyCommitRefRaw);

  if (hasInvalidCommitValue(explicitRaw)) {
    return Object.freeze({ status: "explicit_configuration_malformed", deployment_commit: null, source: null, explicit_commit: null });
  }
  if (hasInvalidCommitValue(commitRefRaw) || hasInvalidCommitValue(netlifyCommitRefRaw)) {
    return Object.freeze({ status: "platform_identity_malformed", deployment_commit: null, source: null, explicit_commit: explicit });
  }
  if (commitRef && netlifyCommitRef && commitRef !== netlifyCommitRef) {
    return Object.freeze({ status: "platform_identity_conflict", deployment_commit: null, source: null, explicit_commit: explicit });
  }

  const platformCommit = commitRef ?? netlifyCommitRef;
  const platformSource = commitRef ? "platform_commit_ref" as const : netlifyCommitRef ? "platform_netlify_commit_ref" as const : null;
  if (platformCommit && explicit && explicit !== platformCommit) {
    return Object.freeze({ status: "explicit_configuration_conflict", deployment_commit: platformCommit, source: platformSource, explicit_commit: explicit });
  }
  if (platformCommit) {
    return Object.freeze({ status: "available", deployment_commit: platformCommit, source: platformSource, explicit_commit: explicit });
  }
  if (explicit) {
    return Object.freeze({ status: "available", deployment_commit: explicit, source: "explicit_fallback", explicit_commit: explicit });
  }
  return Object.freeze({ status: "unavailable", deployment_commit: null, source: null, explicit_commit: null });
}

export function evaluateContinuousIntelligenceShadowCanaryScheduledDeploymentBinding(input: {
  runtime: ContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity;
  request_deployment_commit: string | null;
}): ContinuousIntelligenceShadowCanaryScheduledDeploymentBinding {
  if (input.runtime.status !== "available") return input.runtime.status;
  if (!input.runtime.deployment_commit || !input.request_deployment_commit) return "unavailable";
  return input.runtime.deployment_commit === input.request_deployment_commit ? "exact" : "request_mismatch";
}

export function buildContinuousIntelligenceDeploymentAssertionReadiness(
  environment: DeploymentEnvironment,
) {
  const runtime = resolveContinuousIntelligenceShadowCanaryScheduledRuntimeDeploymentIdentity(environment);
  const explicitRaw =
    environment[continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable];
  const platformRaw = environment.COMMIT_REF ?? environment.NETLIFY_COMMIT_REF;

  return Object.freeze({
    configured: typeof explicitRaw === "string" && explicitRaw.trim().length > 0,
    configured_value_canonical: canonicalCommit(explicitRaw) !== null,
    platform_identity_present: canonicalCommit(platformRaw) !== null,
    assertion_matches_platform: runtime.status === "available" && runtime.explicit_commit !== null,
    status: runtime.status,
    identity_value_returned: false,
  });
}
