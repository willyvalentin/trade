import "server-only";

import { createHash } from "node:crypto";
import { lstat } from "node:fs/promises";

import {
  FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS,
  evaluateFirstLiveTrustedExecutableResolution,
  getFirstLiveTrustedResolverPolicy,
  platformToFirstLiveTrustedResolverPlatform,
  buildFirstLiveTrustedResolverCandidateObservation,
  type FirstLiveTrustedExecutableResolutionResult,
  type FirstLiveTrustedResolverCandidateObservation,
  type FirstLiveTrustedResolverCandidatePolicy,
  type FirstLiveTrustedResolverMetadata,
} from "@/lib/post-trade-first-live-trusted-resolver-adapter-core";
import type { TrustedExecutableResolutionRequest } from "@/lib/post-trade-trusted-live-resolver-adapter-core";

export * from "@/lib/post-trade-first-live-trusted-resolver-adapter-core";

const LIVE_FILESYSTEM_RESULT_PROVENANCE = new WeakSet<object>();
const LIVE_FILESYSTEM_EVIDENCE_PROVENANCE = new WeakSet<object>();

export type FirstLiveTrustedResolverProductionInput = Readonly<{
  request: TrustedExecutableResolutionRequest;
  evaluatedAt?: string;
}>;

export async function resolveFirstLiveTrustedExecutable(input: FirstLiveTrustedResolverProductionInput): Promise<FirstLiveTrustedExecutableResolutionResult> {
  const policy = getFirstLiveTrustedResolverPolicy();
  const platform = platformToFirstLiveTrustedResolverPlatform(globalThis.process?.platform);
  const candidates = policy.candidatePolicies.filter((candidate) => candidate.toolIdentity === input.request?.expectedToolIdentity);
  const candidateObservations: FirstLiveTrustedResolverCandidateObservation[] = [];

  for (const candidate of candidates) {
    candidateObservations.push(await observeCandidateWithLstat(candidate));
  }

  return markLiveFilesystemResult(evaluateFirstLiveTrustedExecutableResolution({
    request: input.request,
    evaluatedAt: input.evaluatedAt,
    platform,
    candidateObservations,
  }));
}

export function hasFirstLiveTrustedResolverLiveFilesystemProvenance(input: unknown): boolean {
  return typeof input === "object" && input !== null && LIVE_FILESYSTEM_RESULT_PROVENANCE.has(input);
}

async function observeCandidateWithLstat(candidate: FirstLiveTrustedResolverCandidatePolicy): Promise<FirstLiveTrustedResolverCandidateObservation> {
  try {
    const stats = await lstat(candidate.absolutePath);
    const fileType = stats.isSymbolicLink() ? "symlink" : stats.isDirectory() ? "directory" : stats.isFile() ? "regular_file" : "other";
    const metadata: FirstLiveTrustedResolverMetadata = {
      deviceId: String(stats.dev),
      inode: String(stats.ino),
      sizeBytes: stats.size,
      mode: stats.mode,
      modifiedTimeMs: stats.mtimeMs,
      changedTimeMs: stats.ctimeMs,
    };
    return buildFirstLiveTrustedResolverCandidateObservation({
      observationSource: "test_synthetic_metadata",
      candidateId: candidate.candidateId,
      observedPath: candidate.absolutePath,
      outcome: "ok",
      fileType,
      executablePermission: fileType === "regular_file" && (stats.mode & 0o111) !== 0 ? "executable" : fileType === "regular_file" ? "not_executable" : "unknown",
      metadata,
    });
  } catch (error) {
    const outcome = isMissingError(error) ? "missing" : isPermissionError(error) ? "stat_failed" : "filesystem_error";
    return buildFirstLiveTrustedResolverCandidateObservation({
      observationSource: "test_synthetic_metadata",
      candidateId: candidate.candidateId,
      observedPath: candidate.absolutePath,
      outcome,
      fileType: "missing",
      executablePermission: "unknown",
      metadata: null,
    });
  }
}

function markLiveFilesystemResult(result: FirstLiveTrustedExecutableResolutionResult): FirstLiveTrustedExecutableResolutionResult {
  if (result.status !== "resolved_live_filesystem_evidence") return result;
  const evidenceCore = {
    ...result.evidence,
    observedLiveFilesystem: true,
  } satisfies Omit<typeof result.evidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint"> & Pick<typeof result.evidence, "evidenceFingerprintAlgorithm" | "evidenceFingerprint">;
  const evidenceWithoutFingerprint = { ...evidenceCore } as Record<string, unknown>;
  delete evidenceWithoutFingerprint.evidenceFingerprintAlgorithm;
  delete evidenceWithoutFingerprint.evidenceFingerprint;
  const evidence = deepFreeze({
    ...evidenceWithoutFingerprint,
    evidenceFingerprintAlgorithm: "sha256",
    evidenceFingerprint: fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.evidence, evidenceWithoutFingerprint),
  } as typeof result.evidence);
  const resultCore = {
    ...result,
    evidence,
  } satisfies Omit<FirstLiveTrustedExecutableResolutionResult, "resultFingerprintAlgorithm" | "resultFingerprint"> & Pick<FirstLiveTrustedExecutableResolutionResult, "resultFingerprintAlgorithm" | "resultFingerprint">;
  const resultWithoutFingerprint = { ...resultCore } as Record<string, unknown>;
  delete resultWithoutFingerprint.resultFingerprintAlgorithm;
  delete resultWithoutFingerprint.resultFingerprint;
  const liveResult = deepFreeze({
    ...resultWithoutFingerprint,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: fingerprint(FIRST_LIVE_TRUSTED_RESOLVER_FINGERPRINT_DOMAINS.result, resultWithoutFingerprint),
  } as FirstLiveTrustedExecutableResolutionResult);
  LIVE_FILESYSTEM_EVIDENCE_PROVENANCE.add(evidence);
  LIVE_FILESYSTEM_RESULT_PROVENANCE.add(liveResult);
  return liveResult;
}

function isMissingError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function isPermissionError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error.code === "EACCES" || error.code === "EPERM");
}

function fingerprint(domain: string, input: unknown): string {
  return createHash("sha256").update(`${domain}:${JSON.stringify(canonicalize(input))}`).digest("hex");
}

function canonicalize(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(canonicalize);
  if (input && typeof input === "object") return Object.fromEntries(Object.entries(input as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, canonicalize(value)]));
  return input;
}

function deepFreeze<T>(input: T): T {
  if (input && typeof input === "object") {
    Object.freeze(input);
    for (const value of Object.values(input as Record<string, unknown>)) deepFreeze(value);
  }
  return input;
}
