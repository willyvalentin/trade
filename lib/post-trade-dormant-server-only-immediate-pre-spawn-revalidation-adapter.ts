import "server-only";

import { createHash } from "node:crypto";
import { lstat } from "node:fs/promises";

import {
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY,
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY,
  DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS,
  buildImmediatePreSpawnRevalidationObservation,
  evaluateImmediatePreSpawnRevalidationCore,
  type ImmediatePreSpawnRevalidationBlockingReason,
  type ImmediatePreSpawnRevalidationEvidence,
  type ImmediatePreSpawnRevalidationResult,
} from "@/lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";
import { consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation } from "@/lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter";
import type { DormantFirstLiveCompositionAdapterResult } from "@/lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core";

export * from "@/lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core";

export type DormantServerOnlyImmediatePreSpawnRevalidationInput = Readonly<{
  compositionAdapterResult: DormantFirstLiveCompositionAdapterResult;
}>;

const PRODUCTION_REVALIDATION_RESULT_PROVENANCE = new WeakSet<object>();
const PRODUCTION_REVALIDATION_EVIDENCE_PROVENANCE = new WeakSet<object>();
const PRODUCTION_REVALIDATION_RESULTS_CONSUMED_FOR_DORMANT_FIXED_DIRECT_SPAWN = new WeakSet<object>();

export async function revalidateDormantServerOnlyImmediatePreSpawn(input: DormantServerOnlyImmediatePreSpawnRevalidationInput): Promise<ImmediatePreSpawnRevalidationResult> {
  const claimed = consumeOriginalDormantFirstLiveCompositionForImmediatePreSpawnRevalidation(input);
  if (!claimed.ok) return blockedResult(claimed.evaluatedAt, claimed.blockingReasons);
  const currentObservation = await observeApprovedPathWithLstat(claimed.preLstatEligibility.approvedResolvedAbsolutePath, claimed.evaluatedAt);
  return markProductionProvenance(evaluateImmediatePreSpawnRevalidationCore({
    compositionAdapterResult: claimed.compositionAdapterResult,
    currentObservation,
    evaluatedAt: claimed.evaluatedAt,
    attempt: 1,
    retryCount: 0,
    productionLiveProvenance: false,
  }));
}

export type ImmediatePreSpawnRevalidationForDormantFixedDirectSpawnConsumption = Readonly<
  | {
    ok: true;
    revalidationResult: ImmediatePreSpawnRevalidationResult;
    evaluatedAt: string;
    approvedExecutablePath: string;
  }
  | {
    ok: false;
    evaluatedAt: string;
    blockingReasons: readonly string[];
  }
>;

export function consumeOriginalImmediatePreSpawnRevalidationForDormantFixedReadOnlyDirectSpawn(input: unknown): ImmediatePreSpawnRevalidationForDormantFixedDirectSpawnConsumption {
  const evaluatedAt = new Date().toISOString();
  const shape = validateDirectSpawnHandoffShape(input);
  if (!shape.ok) return { ok: false, evaluatedAt, blockingReasons: ["input_shape_rejected"] };
  if (!PRODUCTION_REVALIDATION_RESULT_PROVENANCE.has(shape.revalidationResult) || !PRODUCTION_REVALIDATION_EVIDENCE_PROVENANCE.has(shape.revalidationResult.revalidationEvidence)) {
    return { ok: false, evaluatedAt, blockingReasons: ["production_revalidation_provenance_missing"] };
  }
  if (PRODUCTION_REVALIDATION_RESULTS_CONSUMED_FOR_DORMANT_FIXED_DIRECT_SPAWN.has(shape.revalidationResult)) {
    return { ok: false, evaluatedAt, blockingReasons: ["second_attempt_rejected"] };
  }
  const reasons = validateProductionRevalidationForDormantFixedDirectSpawn(shape.revalidationResult);
  if (reasons.length > 0) return { ok: false, evaluatedAt, blockingReasons: reasons };
  PRODUCTION_REVALIDATION_RESULTS_CONSUMED_FOR_DORMANT_FIXED_DIRECT_SPAWN.add(shape.revalidationResult);
  return {
    ok: true,
    revalidationResult: shape.revalidationResult,
    evaluatedAt,
    approvedExecutablePath: "/usr/bin/git",
  };
}

async function observeApprovedPathWithLstat(path: string, observedAt: string) {
  try {
    const stats = await lstat(path, { bigint: true });
    const fileType = stats.isSymbolicLink()
      ? "symlink"
      : stats.isDirectory()
        ? "directory"
        : stats.isFile()
          ? "regular_file"
          : stats.isSocket()
            ? "socket"
            : stats.isFIFO()
              ? "fifo"
              : stats.isBlockDevice()
                ? "block_device"
                : stats.isCharacterDevice()
                  ? "character_device"
                  : "other";
    return buildImmediatePreSpawnRevalidationObservation({
      observationSource: "server_only_lstat",
      observedPath: path,
      outcome: "ok",
      fileType,
      metadata: fileType === "regular_file"
        ? {
          deviceId: canonicalBigIntString(stats.dev),
          inode: canonicalBigIntString(stats.ino),
          sizeBytes: safeNumberFromBigInt(stats.size),
          mode: safeNumberFromBigInt(stats.mode),
          modifiedTimeMs: safeNumberFromBigInt(stats.mtimeMs),
        }
        : null,
      observedAt,
    });
  } catch (error) {
    return buildImmediatePreSpawnRevalidationObservation({
      observationSource: "server_only_lstat",
      observedPath: path,
      outcome: isMissingError(error) ? "missing" : "filesystem_error",
      fileType: "missing",
      metadata: null,
      observedAt,
    });
  }
}

function isMissingError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

type ProductionCompositionInput = DormantFirstLiveCompositionAdapterResult & Readonly<{ resolvedAbsolutePath: string }>;

function blockedResult(evaluatedAt: string, blockingReasons: readonly ImmediatePreSpawnRevalidationBlockingReason[]): ImmediatePreSpawnRevalidationResult {
  const reasons: readonly ImmediatePreSpawnRevalidationBlockingReason[] = blockingReasons.length > 0 ? blockingReasons : ["input_shape_rejected"];
  const currentObservation = buildImmediatePreSpawnRevalidationObservation({
    observationSource: "server_only_lstat",
    observedPath: "",
    outcome: "filesystem_error",
    fileType: "unknown",
    metadata: null,
    observedAt: evaluatedAt,
  });
  const result = evaluateImmediatePreSpawnRevalidationCore({
    compositionAdapterResult: null as unknown as ProductionCompositionInput,
    currentObservation,
    evaluatedAt,
    attempt: blockingReasons.includes("second_attempt_rejected") ? 2 as 1 : 1,
    retryCount: 0,
    productionLiveProvenance: false,
  });
  const evidenceCore = {
    ...stripEvidenceFingerprint(result.revalidationEvidence),
    observedResolvedAbsolutePath: null,
    observedMetadata: null,
    observationSource: null,
    observationFingerprint: null,
    exactMetadataMatched: false,
    immediateRevalidationOccurred: false,
    filesystemAttemptCount: 0,
    status: "blocked_fail_closed",
    blockingReasons: reasons,
  } satisfies Omit<ImmediatePreSpawnRevalidationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  const evidence = deepFreeze({
    ...evidenceCore,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.evidence, evidenceCore),
  } satisfies ImmediatePreSpawnRevalidationEvidence);
  const resultCore = {
    ...stripResultFingerprint(result),
    status: "blocked_fail_closed",
    revalidationEvidence: evidence,
  } satisfies Omit<ImmediatePreSpawnRevalidationResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  return deepFreeze({
    ...resultCore,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.result, resultCore),
  } satisfies ImmediatePreSpawnRevalidationResult);
}

function markProductionProvenance(result: ImmediatePreSpawnRevalidationResult): ImmediatePreSpawnRevalidationResult {
  if (result.status !== "revalidated_non_authoritative_evidence") return result;
  const evidenceCore = {
    ...stripEvidenceFingerprint(result.revalidationEvidence),
    productionLiveRevalidationProvenance: "server_only_private_original_object",
  } satisfies Omit<ImmediatePreSpawnRevalidationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  const evidence = deepFreeze({
    ...evidenceCore,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.evidence, evidenceCore),
  } satisfies ImmediatePreSpawnRevalidationEvidence);
  const resultCore = {
    ...stripResultFingerprint(result),
    revalidationEvidence: evidence,
  };
  const marked = deepFreeze({
    ...resultCore,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.result, resultCore),
  } satisfies ImmediatePreSpawnRevalidationResult);
  PRODUCTION_REVALIDATION_EVIDENCE_PROVENANCE.add(evidence);
  PRODUCTION_REVALIDATION_RESULT_PROVENANCE.add(marked);
  return marked;
}

function validateDirectSpawnHandoffShape(input: unknown): { ok: true; revalidationResult: ImmediatePreSpawnRevalidationResult } | { ok: false } {
  if (!isPlainOwnDataObject(input)) return { ok: false };
  const keys = Object.keys(input);
  if (keys.length !== 1 || keys[0] !== "revalidationResult") return { ok: false };
  const revalidationResult = input.revalidationResult;
  if (typeof revalidationResult !== "object" || revalidationResult === null) return { ok: false };
  return { ok: true, revalidationResult: revalidationResult as ImmediatePreSpawnRevalidationResult };
}

function validateProductionRevalidationForDormantFixedDirectSpawn(input: ImmediatePreSpawnRevalidationResult): readonly string[] {
  const reasons: string[] = [];
  const evidence = input.revalidationEvidence;
  if (!Object.isFrozen(input) || !Object.isFrozen(evidence)) reasons.push("revalidation_result_mutated_or_cloned");
  if (input.resultKind !== "dormant_server_only_immediate_pre_spawn_revalidation_result" || input.resultVersion !== 1) reasons.push("revalidation_result_rejected");
  if (input.adapterId !== DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_IDENTITY.adapterId) reasons.push("revalidation_result_boundary_mismatch");
  if (input.status !== "revalidated_non_authoritative_evidence" || evidence.status !== "revalidated_non_authoritative_evidence") reasons.push("revalidation_result_not_ready");
  if (input.serverOnly !== true || input.dormant !== true) reasons.push("revalidation_result_boundary_mismatch");
  if (input.processSpawned !== false || input.shellUsed !== false || input.credentialAccessed !== false || input.networkAccessed !== false || input.cliVersionCollected !== false || input.observerInvoked !== false || input.authorizationConsumed !== false || input.enablesProcessStart !== false || input.enablesPreflightRunner !== false) reasons.push("revalidation_result_authority_rejected");
  if (evidence.productionLiveRevalidationProvenance !== "server_only_private_original_object") reasons.push("production_revalidation_provenance_missing");
  if (evidence.toolIdentity !== "git") reasons.push("revalidation_result_tool_mismatch");
  if (evidence.platform !== "macos") reasons.push("revalidation_result_platform_mismatch");
  if (evidence.purpose !== "first_live_read_only_staging_preflight") reasons.push("revalidation_result_purpose_mismatch");
  if (evidence.policyId !== DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.policyId || evidence.policyVersion !== DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_ADAPTER_POLICY.policyVersion) reasons.push("revalidation_result_policy_mismatch");
  if (evidence.expectedResolvedAbsolutePath !== "/usr/bin/git" || evidence.observedResolvedAbsolutePath !== "/usr/bin/git") reasons.push("revalidation_result_path_mismatch");
  if (evidence.exactMetadataMatched !== true || evidence.immediateRevalidationOccurred !== true || evidence.pointInTimeOnly !== true || evidence.toctouEliminated !== false) reasons.push("revalidation_result_toctou_claim_rejected");
  if (evidence.authoritativeLive !== false || evidence.spawnAuthority !== "none" || evidence.observerAuthority !== "none" || evidence.credentialAuthority !== "none" || evidence.cliExecutionAuthority !== "none" || evidence.runnerAuthority !== "none" || evidence.authorizationConsumptionAuthority !== "none" || evidence.networkAuthority !== "none" || evidence.apiAuthority !== "none" || evidence.uiAuthority !== "none" || evidence.tradingAuthority !== "none" || evidence.avanzaAuthority !== "none" || evidence.persistenceAuthority !== "none" || evidence.deploymentAuthority !== "none") reasons.push("revalidation_result_authority_rejected");
  if (evidence.processSpawned !== false || evidence.shellUsed !== false || evidence.cliVersionCollected !== false || evidence.credentialAccessed !== false || evidence.networkAccessed !== false || evidence.observerInvoked !== false || evidence.authorizationConsumed !== false || evidence.retryCount !== 0 || evidence.filesystemAttemptCount !== 1) reasons.push("revalidation_result_authority_rejected");
  if (input.resultFingerprintAlgorithm !== "sha256" || input.resultFingerprint !== fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.result, stripResultFingerprint(input))) reasons.push("revalidation_result_mutated_or_cloned");
  if (evidence.evidenceFingerprintAlgorithm !== "sha256" || evidence.evidenceFingerprint !== fingerprint(DORMANT_SERVER_ONLY_IMMEDIATE_PRE_SPAWN_REVALIDATION_FINGERPRINT_DOMAINS.evidence, stripEvidenceFingerprint(evidence))) reasons.push("revalidation_result_mutated_or_cloned");
  return [...new Set(reasons)].sort();
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

function stripEvidenceFingerprint(input: ImmediatePreSpawnRevalidationEvidence): Omit<ImmediatePreSpawnRevalidationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint"> {
  const core = { ...input } as Record<string, unknown>;
  delete core.evidenceFingerprintAlgorithm;
  delete core.evidenceFingerprint;
  return core as Omit<ImmediatePreSpawnRevalidationEvidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
}

function stripResultFingerprint(input: ImmediatePreSpawnRevalidationResult): Omit<ImmediatePreSpawnRevalidationResult, "resultFingerprintAlgorithm" | "resultFingerprint"> {
  const core = { ...input } as Record<string, unknown>;
  delete core.resultFingerprintAlgorithm;
  delete core.resultFingerprint;
  return core as Omit<ImmediatePreSpawnRevalidationResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
}

function canonicalBigIntString(input: bigint): string {
  return input.toString(10);
}

function safeNumberFromBigInt(input: bigint): number {
  const asNumber = Number(input);
  if (!Number.isSafeInteger(asNumber) || asNumber < 0) return Number.NaN;
  return asNumber;
}

function fingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(canonicalize(input))}`).digest("hex");
}

function canonicalize(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(canonicalize);
  if (input && typeof input === "object") {
    return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, canonicalize(value)]));
  }
  return input;
}

function deepFreeze<T>(input: T): T {
  if (input && typeof input === "object") {
    Object.freeze(input);
    for (const value of Object.values(input as Record<string, unknown>)) deepFreeze(value);
  }
  return input;
}
