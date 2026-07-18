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
import {
  validateImmediatePreSpawnRevalidationPreLstatEligibility,
  type ImmediatePreSpawnRevalidationBlockingReason,
  type ImmediatePreSpawnRevalidationPreLstatEligibility,
} from "@/lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";

export * from "@/lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";

const DORMANT_FIRST_LIVE_COMPOSITION_RESULT_PROVENANCE = new WeakSet<object>();
const DORMANT_FIRST_LIVE_COMPOSITION_RESULTS_CONSUMED_FOR_IMMEDIATE_REVALIDATION = new WeakSet<object>();

export type DormantFirstLiveCompositionForImmediatePreSpawnRevalidationConsumption = Readonly<
  | {
    ok: true;
    compositionAdapterResult: DormantFirstLiveCompositionAdapterResult & Readonly<{ resolvedAbsolutePath: string }>;
    evaluatedAt: string;
    preLstatEligibility: ImmediatePreSpawnRevalidationPreLstatEligibility & Readonly<{ status: "eligible_for_single_server_lstat"; approvedResolvedAbsolutePath: string }>;
  }
  | {
    ok: false;
    evaluatedAt: string;
    blockingReasons: readonly ImmediatePreSpawnRevalidationBlockingReason[];
    preLstatEligibility: ImmediatePreSpawnRevalidationPreLstatEligibility | null;
  }
>;

export async function composeDormantServerOnlyFirstLiveStagingPreflight(input: DormantFirstLiveCompositionAdapterInput): Promise<DormantFirstLiveCompositionAdapterResult> {
  return markOriginalCompositionResult(composeDormantServerOnlyFirstLiveStagingPreflightCore(input, {
    resolveFirstLiveTrustedExecutable,
    hasLiveResolverPrivateProvenance: hasFirstLiveTrustedResolverLiveFilesystemProvenance,
  }));
}

export function neutralizeOriginalFirstLiveResolverResultForDormantComposition(input: VerifiedOriginalResolverResultInput): DormantFirstLiveCompositionAdapterResult {
  return markOriginalCompositionResult(neutralizeOriginalFirstLiveResolverResultCore(input, hasFirstLiveTrustedResolverLiveFilesystemProvenance));
}

export function consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation(input: unknown): DormantFirstLiveCompositionForImmediatePreSpawnRevalidationConsumption {
  const evaluatedAt = new Date().toISOString();
  const shape = validateRevalidationHandoffShape(input);
  if (!shape.ok) return { ok: false, evaluatedAt, blockingReasons: ["input_shape_rejected"], preLstatEligibility: null };
  if (!DORMANT_FIRST_LIVE_COMPOSITION_RESULT_PROVENANCE.has(shape.compositionAdapterResult)) {
    return { ok: false, evaluatedAt, blockingReasons: ["production_live_provenance_missing"], preLstatEligibility: null };
  }
  if (DORMANT_FIRST_LIVE_COMPOSITION_RESULTS_CONSUMED_FOR_IMMEDIATE_REVALIDATION.has(shape.compositionAdapterResult)) {
    return { ok: false, evaluatedAt, blockingReasons: ["second_attempt_rejected"], preLstatEligibility: null };
  }
  const preLstatEligibility = validateImmediatePreSpawnRevalidationPreLstatEligibility({
    compositionAdapterResult: shape.compositionAdapterResult,
    evaluatedAt,
  });
  if (preLstatEligibility.status !== "eligible_for_single_server_lstat" || preLstatEligibility.approvedResolvedAbsolutePath === null) {
    return { ok: false, evaluatedAt, blockingReasons: preLstatEligibility.blockingReasons, preLstatEligibility };
  }
  DORMANT_FIRST_LIVE_COMPOSITION_RESULTS_CONSUMED_FOR_IMMEDIATE_REVALIDATION.add(shape.compositionAdapterResult);
  return {
    ok: true,
    compositionAdapterResult: shape.compositionAdapterResult as DormantFirstLiveCompositionAdapterResult & Readonly<{ resolvedAbsolutePath: string }>,
    evaluatedAt,
    preLstatEligibility: preLstatEligibility as ImmediatePreSpawnRevalidationPreLstatEligibility & Readonly<{ status: "eligible_for_single_server_lstat"; approvedResolvedAbsolutePath: string }>,
  };
}

function markOriginalCompositionResult<T extends DormantFirstLiveCompositionAdapterResult | Promise<DormantFirstLiveCompositionAdapterResult>>(input: T): T {
  if (input instanceof Promise) {
    return input.then((result) => markOriginalCompositionResult(result)) as T;
  }
  if (input.status === "neutralized_composition_input_ready") DORMANT_FIRST_LIVE_COMPOSITION_RESULT_PROVENANCE.add(input);
  return input;
}

function validateRevalidationHandoffShape(input: unknown): { ok: true; compositionAdapterResult: DormantFirstLiveCompositionAdapterResult } | { ok: false } {
  if (!isPlainOwnDataObject(input)) return { ok: false };
  const keys = Object.keys(input);
  if (keys.length !== 1 || keys[0] !== "compositionAdapterResult") return { ok: false };
  const compositionAdapterResult = input.compositionAdapterResult;
  if (typeof compositionAdapterResult !== "object" || compositionAdapterResult === null) return { ok: false };
  return { ok: true, compositionAdapterResult: compositionAdapterResult as DormantFirstLiveCompositionAdapterResult };
}

function isPlainOwnDataObject(input: unknown): input is Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return false;
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return false;
  if (Object.getOwnPropertySymbols(input).length > 0) return false;
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(input))) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") return false;
    if (descriptor.get || descriptor.set || !descriptor.enumerable) return false;
  }
  for (const key in input) if (!Object.prototype.hasOwnProperty.call(input, key)) return false;
  return true;
}
