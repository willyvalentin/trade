import "server-only";

import {
  buildScopedMacosFixtureObserverAdapter,
  buildScopedMacosProcessObserverFuturePlan,
  validateFixtureObserverAdapter,
  type ScopedMacosFixtureObserverAdapter,
  type ScopedObserverValidationResult,
} from "@/lib/post-trade-scoped-macos-process-observer-core";

export const SCOPED_MACOS_PROCESS_OBSERVER_SERVER_BOUNDARY_ID =
  "post_trade_scoped_macos_process_observer_server_fixture_boundary_v1" as const;

export type ScopedMacosProcessObserverServerBoundary = Readonly<{
  boundaryId: typeof SCOPED_MACOS_PROCESS_OBSERVER_SERVER_BOUNDARY_ID;
  serverOnly: true;
  fixtureOnly: true;
  observedLive: false;
  authoritativeLive: false;
  defaultLiveObserverPresent: false;
  ambientSingletonPresent: false;
  acceptsRawPid: false;
  acceptsRawProcessGroupId: false;
  exposesGlobalEnumeration: false;
  exposesProcessNameLookup: false;
  exposesExecutableLookup: false;
  exposesCommandLineLookup: false;
  canSendSignals: false;
  canStartProcess: false;
  canTerminateProcess: false;
  enablesPreflightRunner: false;
  futurePlan: ReturnType<typeof buildScopedMacosProcessObserverFuturePlan>;
}>;

export function buildScopedMacosProcessObserverServerBoundary(): ScopedMacosProcessObserverServerBoundary {
  return {
    boundaryId: SCOPED_MACOS_PROCESS_OBSERVER_SERVER_BOUNDARY_ID,
    serverOnly: true,
    fixtureOnly: true,
    observedLive: false,
    authoritativeLive: false,
    defaultLiveObserverPresent: false,
    ambientSingletonPresent: false,
    acceptsRawPid: false,
    acceptsRawProcessGroupId: false,
    exposesGlobalEnumeration: false,
    exposesProcessNameLookup: false,
    exposesExecutableLookup: false,
    exposesCommandLineLookup: false,
    canSendSignals: false,
    canStartProcess: false,
    canTerminateProcess: false,
    enablesPreflightRunner: false,
    futurePlan: buildScopedMacosProcessObserverFuturePlan(),
  } as const;
}

export function createScopedMacosFixtureObserverBoundary(): Readonly<{
  boundary: ScopedMacosProcessObserverServerBoundary;
  adapter: ScopedMacosFixtureObserverAdapter;
  validation: ScopedObserverValidationResult<ScopedMacosFixtureObserverAdapter>;
  liveObservationEnabled: false;
}> {
  const adapter = buildScopedMacosFixtureObserverAdapter();
  return {
    boundary: buildScopedMacosProcessObserverServerBoundary(),
    adapter,
    validation: validateFixtureObserverAdapter(adapter),
    liveObservationEnabled: false,
  } as const;
}
