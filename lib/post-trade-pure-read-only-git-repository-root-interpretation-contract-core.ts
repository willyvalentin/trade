import {
  deepFreeze,
  sha256,
  validateGitObservationCompletionResult,
  type GitObservationCompletionEvidence,
} from "@/lib/post-trade-pure-read-only-git-observation-completion-contract-core";

export const PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_read_only_git_repository_root_interpretation_contract",
  contractId: "ture.execution.pure-read-only-git-repository-root-interpretation-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.read-only-git-repository-root-interpretation.fixture-boundary.v1",
  grammarId: "ture.execution.read-only-git-root-path.absolute-posix-utf8.v1",
  grammarVersion: 1,
  normalizationId: "ture.execution.read-only-git-line-output.optional-single-final-lf.v1",
  normalizationVersion: 1,
  capabilityIdentity: "git_repository_root_v1",
  fixtureOnly: true,
  authority: "none",
} as const);

export type PureGitRepositoryRootReason =
  | "accepted"
  | "input_contract_rejected"
  | "source_linkage_rejected"
  | "completion_state_rejected"
  | "stderr_not_empty"
  | "stdout_empty"
  | "stdout_multiple_lines"
  | "stdout_byte_count_rejected"
  | "whitespace_rejected"
  | "carriage_return_rejected"
  | "nul_rejected"
  | "control_character_rejected"
  | "ansi_escape_rejected"
  | "path_not_absolute"
  | "path_root_rejected"
  | "path_trailing_slash_rejected"
  | "path_repeated_slash_rejected"
  | "path_dot_component_rejected"
  | "path_parent_component_rejected"
  | "path_grammar_rejected";

export type PureGitRepositoryRootResult = Readonly<{
  resultKind: "pure_read_only_git_repository_root_interpretation_result";
  resultVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.contractId;
  status: "accepted_fixture_git_repository_root" | "blocked_fail_closed";
  blockingReasons: readonly PureGitRepositoryRootReason[];
  evidence: PureGitRepositoryRootEvidence;
  resultFingerprint: string;
}>;

export type PureGitRepositoryRootEvidence = Readonly<{
  evidenceKind: "pure_read_only_git_repository_root_interpretation_evidence";
  evidenceVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.boundaryId;
  grammarId: typeof PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.grammarId;
  normalizationId: typeof PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.normalizationId;
  sourceCompletionEvidenceFingerprint: string | null;
  sourceSpawnFingerprint: string | null;
  boundarySessionId: string | null;
  purpose: "first_live_read_only_staging_preflight" | null;
  platform: "macos" | null;
  executable: "/usr/bin/git" | null;
  argv: readonly ["rev-parse", "--show-toplevel"] | null;
  workingDirectoryFingerprint: string | null;
  observationSequenceIdentity: string | null;
  evidenceTimestamp: string | null;
  status: "accepted" | "rejected";
  primaryReason: PureGitRepositoryRootReason;
  reasons: readonly PureGitRepositoryRootReason[];
  originalStdoutFingerprint: string | null;
  normalizedStdoutFingerprint: string | null;
  originalStdoutByteCount: number | null;
  normalizedStdoutByteCount: number | null;
  finalLfRemoved: boolean;
  stderrEmpty: boolean;
  eligibleCompletion: boolean;
  repositoryRootPath: string | null;
  repositoryRootPathFingerprint: string | null;
  absolutePath: boolean;
  canonicalFilesystemPathClaimed: false;
  pathComponentCount: number | null;
  rootPath: boolean;
  observedLiveProcess: false;
  repositoryReadAuthorityGranted: false;
  processAuthorityGranted: false;
  observerAuthorityGranted: false;
  cliExecutionAuthorityGranted: false;
  compatibilityAuthorityGranted: false;
  runtimeAuthorityGranted: false;
  stagingAuthorityGranted: false;
  deploymentAuthorityGranted: false;
  credentialAuthorityGranted: false;
  networkAuthorityGranted: false;
  mutationAuthorityGranted: false;
  authorizationConsumed: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  evidenceFingerprint: string;
}>;

export function buildPureGitRepositoryRootInterpretation(input: unknown): PureGitRepositoryRootResult {
  const completion = validateGitObservationCompletionResult(input, "git_repository_root_v1");
  if (!completion.valid) return buildResult(null, completion.reasons.includes("stderr_not_empty") ? ["stderr_not_empty"] : ["input_contract_rejected"]);
  const reasons = validateRootStdout(completion.evidence);
  return buildResult(completion.evidence, reasons);
}

function validateRootStdout(evidence: GitObservationCompletionEvidence): PureGitRepositoryRootReason[] {
  const text = evidence.stdoutText ?? "";
  const normalized = text.endsWith("\n") ? text.slice(0, -1) : text;
  const reasons: PureGitRepositoryRootReason[] = [];
  if (evidence.exitCode !== 0 || !evidence.eligibleCompletion) reasons.push("completion_state_rejected");
  if (!evidence.stderrEmpty) reasons.push("stderr_not_empty");
  if (text.length === 0) reasons.push("stdout_empty");
  if (text.includes("\0")) reasons.push("nul_rejected");
  if (text.includes("\r")) reasons.push("carriage_return_rejected");
  if ((text.match(/\n/gu) ?? []).length > (text.endsWith("\n") ? 1 : 0)) reasons.push("stdout_multiple_lines");
  if (/\u001b\[/u.test(text)) reasons.push("ansi_escape_rejected");
  if (/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(text)) reasons.push("control_character_rejected");
  if (/[ \t]$/u.test(normalized) || /^\s/u.test(normalized) || normalized.includes("\t")) reasons.push("whitespace_rejected");
  if (evidence.stdoutByteCount > 1024) reasons.push("stdout_byte_count_rejected");
  if (!normalized.startsWith("/")) reasons.push("path_not_absolute");
  if (normalized === "/") reasons.push("path_root_rejected");
  if (normalized.length > 1 && normalized.endsWith("/")) reasons.push("path_trailing_slash_rejected");
  if (normalized.includes("//")) reasons.push("path_repeated_slash_rejected");
  const components = normalized.split("/").slice(1);
  if (components.includes(".")) reasons.push("path_dot_component_rejected");
  if (components.includes("..")) reasons.push("path_parent_component_rejected");
  if (components.some((item) => item.length === 0 || item.length > 255)) reasons.push("path_grammar_rejected");
  return reasons.length === 0 ? ["accepted"] : sortReasons(reasons);
}

function buildResult(source: GitObservationCompletionEvidence | null, reasons: readonly PureGitRepositoryRootReason[]): PureGitRepositoryRootResult {
  const accepted = source !== null && reasons.length === 1 && reasons[0] === "accepted";
  const text = source?.stdoutText ?? null;
  const normalized = text === null ? null : text.endsWith("\n") ? text.slice(0, -1) : text;
  const evidenceBase = {
    evidenceKind: "pure_read_only_git_repository_root_interpretation_evidence" as const,
    evidenceVersion: 1 as const,
    contractId: PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.boundaryId,
    grammarId: PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.grammarId,
    normalizationId: PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.normalizationId,
    sourceCompletionEvidenceFingerprint: source?.evidenceFingerprint ?? null,
    sourceSpawnFingerprint: source?.sourceSpawnFingerprint ?? null,
    boundarySessionId: source?.boundarySessionId ?? null,
    purpose: source?.purpose ?? null,
    platform: source?.platform ?? null,
    executable: source?.canonicalExecutablePath ?? null,
    argv: source?.argv as readonly ["rev-parse", "--show-toplevel"] | null ?? null,
    workingDirectoryFingerprint: source?.workingDirectoryFingerprint ?? null,
    observationSequenceIdentity: source?.observationSequenceIdentity ?? null,
    evidenceTimestamp: source?.evidenceTimestamp ?? null,
    status: accepted ? "accepted" as const : "rejected" as const,
    primaryReason: reasons[0] ?? "input_contract_rejected",
    reasons,
    originalStdoutFingerprint: text === null ? null : sha256("ture:pure-read-only-git-root:original-stdout:v1", text),
    normalizedStdoutFingerprint: normalized === null ? null : sha256("ture:pure-read-only-git-root:normalized-stdout:v1", normalized),
    originalStdoutByteCount: source?.stdoutByteCount ?? null,
    normalizedStdoutByteCount: normalized === null ? null : Buffer.byteLength(normalized, "utf8"),
    finalLfRemoved: text?.endsWith("\n") ?? false,
    stderrEmpty: source?.stderrEmpty ?? false,
    eligibleCompletion: source?.eligibleCompletion ?? false,
    repositoryRootPath: accepted ? normalized : null,
    repositoryRootPathFingerprint: accepted && normalized !== null ? sha256("ture:pure-read-only-git-root:path:v1", normalized) : null,
    absolutePath: accepted,
    canonicalFilesystemPathClaimed: false as const,
    pathComponentCount: accepted && normalized !== null ? normalized.split("/").slice(1).length : null,
    rootPath: accepted && normalized === "/",
    ...authorityFields(),
  };
  const evidence = deepFreeze({ ...evidenceBase, evidenceFingerprint: sha256("ture:pure-read-only-git-root:evidence:v1", evidenceBase) });
  const resultBase = { resultKind: "pure_read_only_git_repository_root_interpretation_result" as const, resultVersion: 1 as const, contractId: PURE_READ_ONLY_GIT_REPOSITORY_ROOT_CONTRACT_IDENTITY.contractId, status: accepted ? "accepted_fixture_git_repository_root" as const : "blocked_fail_closed" as const, blockingReasons: reasons, evidence };
  return deepFreeze({ ...resultBase, resultFingerprint: sha256("ture:pure-read-only-git-root:result:v1", resultBase) });
}

function authorityFields() {
  return {
    observedLiveProcess: false as const,
    repositoryReadAuthorityGranted: false as const,
    processAuthorityGranted: false as const,
    observerAuthorityGranted: false as const,
    cliExecutionAuthorityGranted: false as const,
    compatibilityAuthorityGranted: false as const,
    runtimeAuthorityGranted: false as const,
    stagingAuthorityGranted: false as const,
    deploymentAuthorityGranted: false as const,
    credentialAuthorityGranted: false as const,
    networkAuthorityGranted: false as const,
    mutationAuthorityGranted: false as const,
    authorizationConsumed: false as const,
    runtimeActivated: false as const,
    toctouEliminated: false as const,
    authority: "none" as const,
  };
}

function sortReasons(reasons: readonly PureGitRepositoryRootReason[]) {
  return deepFreeze([...new Set(reasons)]);
}
