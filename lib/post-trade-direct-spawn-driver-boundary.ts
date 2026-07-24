import "server-only";

import {
  DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY,
  buildDirectSpawnCompatibilitySummary,
  buildDirectSpawnFixtureDriverAdapter,
  buildDirectSpawnFutureLiveDriverPlan,
  validateDirectSpawnDriverIdentity,
  type DirectSpawnFixtureDriverAdapter,
  type DirectSpawnValidationResult,
} from "@/lib/post-trade-direct-spawn-driver-boundary-core";

export const DIRECT_SPAWN_DRIVER_SERVER_BOUNDARY_ID =
  "post_trade_direct_spawn_driver_server_fixture_boundary_v1" as const;

export type DirectSpawnDriverServerBoundary = Readonly<{
  boundaryId: typeof DIRECT_SPAWN_DRIVER_SERVER_BOUNDARY_ID;
  serverOnly: true;
  fixtureOnly: true;
  defaultLiveDriverPresent: false;
  ambientAuthorityPresent: false;
  exposesSpawn: false;
  exposesExec: false;
  exposesShell: false;
  exposesGenericCommandRunner: false;
  exposesRawExecutablePathExecution: false;
  exposesArbitraryWorkingDirectory: false;
  exposesArbitraryEnvironment: false;
  canSpawnProcess: false;
  canCreatePid: false;
  canCreateProcessGroup: false;
  canSendSignals: false;
  canScheduleTimeout: false;
  canReadEnvironment: false;
  canInspectPath: false;
  canInspectFilesystem: false;
  canAccessCredentials: false;
  canConsumeAuthorization: false;
  enablesProcessStart: false;
  enablesPreflightRunner: false;
  compatibility: ReturnType<typeof buildDirectSpawnCompatibilitySummary>;
  futurePlan: ReturnType<typeof buildDirectSpawnFutureLiveDriverPlan>;
}>;

export function buildDirectSpawnDriverServerBoundary(): DirectSpawnDriverServerBoundary {
  return {
    boundaryId: DIRECT_SPAWN_DRIVER_SERVER_BOUNDARY_ID,
    serverOnly: true,
    fixtureOnly: true,
    defaultLiveDriverPresent: false,
    ambientAuthorityPresent: false,
    exposesSpawn: false,
    exposesExec: false,
    exposesShell: false,
    exposesGenericCommandRunner: false,
    exposesRawExecutablePathExecution: false,
    exposesArbitraryWorkingDirectory: false,
    exposesArbitraryEnvironment: false,
    canSpawnProcess: false,
    canCreatePid: false,
    canCreateProcessGroup: false,
    canSendSignals: false,
    canScheduleTimeout: false,
    canReadEnvironment: false,
    canInspectPath: false,
    canInspectFilesystem: false,
    canAccessCredentials: false,
    canConsumeAuthorization: false,
    enablesProcessStart: false,
    enablesPreflightRunner: false,
    compatibility: buildDirectSpawnCompatibilitySummary(),
    futurePlan: buildDirectSpawnFutureLiveDriverPlan(),
  } as const;
}

export function createDirectSpawnFixtureBoundary(): Readonly<{
  boundary: DirectSpawnDriverServerBoundary;
  adapter: DirectSpawnFixtureDriverAdapter;
  identityValidation: DirectSpawnValidationResult<typeof DIRECT_SPAWN_DRIVER_BOUNDARY_IDENTITY>;
  liveExecutionEnabled: false;
}> {
  const adapter = buildDirectSpawnFixtureDriverAdapter();
  return {
    boundary: buildDirectSpawnDriverServerBoundary(),
    adapter,
    identityValidation: validateDirectSpawnDriverIdentity(adapter.identity),
    liveExecutionEnabled: false,
  } as const;
}
