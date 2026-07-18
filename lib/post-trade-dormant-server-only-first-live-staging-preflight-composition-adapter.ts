import "server-only";

import {
  hasFirstLiveTrustedResolverLiveFilesystemProvenance,
  resolveFirstLiveTrustedExecutable,
} from "@/lib/post-trade-first-live-trusted-resolver-adapter";
import {
  composeDormantServerOnlyFirstLiveStagingPreflightCore,
  neutralizeOriginalFirstLiveResolverResultCore,
  type DormantFirstLiveCompositionAdapterInput,
  type DormantFirstLiveCompositionAdapterResult,
  type VerifiedOriginalResolverResultInput,
} from "@/lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";

export * from "@/lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";

export async function composeDormantServerOnlyFirstLiveStagingPreflight(input: DormantFirstLiveCompositionAdapterInput): Promise<DormantFirstLiveCompositionAdapterResult> {
  return composeDormantServerOnlyFirstLiveStagingPreflightCore(input, {
    resolveFirstLiveTrustedExecutable,
    hasLiveResolverPrivateProvenance: hasFirstLiveTrustedResolverLiveFilesystemProvenance,
  });
}

export function neutralizeOriginalFirstLiveResolverResultForDormantComposition(input: VerifiedOriginalResolverResultInput): DormantFirstLiveCompositionAdapterResult {
  return neutralizeOriginalFirstLiveResolverResultCore(input, hasFirstLiveTrustedResolverLiveFilesystemProvenance);
}
