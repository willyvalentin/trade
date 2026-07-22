export const continuousIntelligenceShadowCanaryRuntimeDeploymentCommitEnvironmentVariable =
  "TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT" as const;

const deploymentCommitPattern = /^[0-9a-f]{40}$/;

type DeploymentEnvironment = Record<string, string | undefined>;

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
