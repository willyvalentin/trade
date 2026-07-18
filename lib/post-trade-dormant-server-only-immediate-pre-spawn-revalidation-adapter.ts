import "server-only";

import { createHash } from "node:crypto";
import { lstat } from "node:fs/promises";

import {
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
