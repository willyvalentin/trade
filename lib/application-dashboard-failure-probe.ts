import {
  applicationCanonicalStagingOrigin,
} from "@/lib/application-platform-contract";
import { applicationDeploymentContext } from "@/lib/application-mutation-guard-core";

export const mvp01cDashboardFailureProbeEnvironmentVariable =
  "MVP_01C_STAGING_DASHBOARD_FAILURE_PROBE" as const;
export const mvp01cDashboardFailureProbeQueryParameter =
  "mvp01c_dashboard_failure" as const;
export const mvp01cDashboardFailureProbeQueryValue =
  "first_read" as const;

const applicationDashboardPath = "/api/app/dashboard" as const;

type Environment = Record<string, string | undefined>;

export function applicationDashboardReadPath(input: Readonly<{
  origin: string;
  search: string;
}>) {
  if (input.origin !== applicationCanonicalStagingOrigin) {
    return applicationDashboardPath;
  }

  const search = new URLSearchParams(input.search);
  if (
    search.get(mvp01cDashboardFailureProbeQueryParameter) !==
    mvp01cDashboardFailureProbeQueryValue
  ) {
    return applicationDashboardPath;
  }

  return `${applicationDashboardPath}?${mvp01cDashboardFailureProbeQueryParameter}=${mvp01cDashboardFailureProbeQueryValue}`;
}

export function isMvp01cStagingDashboardFailureProbe(
  request: Request,
  environment: Environment,
) {
  if (
    environment[mvp01cDashboardFailureProbeEnvironmentVariable] !== "enabled" ||
    applicationDeploymentContext(environment) !== "dedicated_staging"
  ) {
    return false;
  }

  const requestUrl = new URL(request.url);
  return (
    requestUrl.origin === applicationCanonicalStagingOrigin &&
    requestUrl.searchParams.get(mvp01cDashboardFailureProbeQueryParameter) ===
      mvp01cDashboardFailureProbeQueryValue
  );
}
