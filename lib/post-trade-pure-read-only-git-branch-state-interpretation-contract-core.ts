import {
  deepFreeze,
  sha256,
  validateGitObservationCompletionResult,
  type GitObservationCompletionEvidence,
} from "@/lib/post-trade-pure-read-only-git-observation-completion-contract-core";

export const PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_read_only_git_branch_state_interpretation_contract",
  contractId: "ture.execution.pure-read-only-git-branch-state-interpretation-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.read-only-git-branch-state-interpretation.fixture-boundary.v1",
  grammarId: "ture.execution.read-only-git-branch-ref.narrow-short-ascii.v1",
  grammarVersion: 1,
  normalizationId: "ture.execution.read-only-git-line-output.optional-single-final-lf.v1",
  normalizationVersion: 1,
  capabilityIdentity: "git_branch_state_v1",
  fixtureOnly: true,
  authority: "none",
} as const);

export type PureGitBranchStateReason = "accepted" | "attached" | "detached" | "input_contract_rejected" | "completion_state_rejected" | "detached_exit_state_rejected" | "stderr_not_empty" | "stdout_empty" | "stdout_multiple_lines" | "whitespace_rejected" | "carriage_return_rejected" | "nul_rejected" | "control_character_rejected" | "ansi_escape_rejected" | "branch_ref_empty" | "branch_ref_prefix_rejected" | "branch_ref_component_rejected" | "branch_ref_reserved_sequence_rejected" | "branch_ref_suffix_rejected" | "branch_ref_character_rejected";

export type PureGitBranchStateResult = Readonly<{
  resultKind: "pure_read_only_git_branch_state_interpretation_result";
  resultVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.contractId;
  status: "accepted_fixture_git_branch_state" | "blocked_fail_closed";
  blockingReasons: readonly PureGitBranchStateReason[];
  evidence: PureGitBranchStateEvidence;
  resultFingerprint: string;
}>;

export type PureGitBranchStateEvidence = Readonly<{
  evidenceKind: "pure_read_only_git_branch_state_interpretation_evidence";
  evidenceVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.boundaryId;
  grammarId: typeof PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.grammarId;
  normalizationId: typeof PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.normalizationId;
  sourceCompletionEvidenceFingerprint: string | null;
  sourceSpawnFingerprint: string | null;
  boundarySessionId: string | null;
  purpose: "first_live_read_only_staging_preflight" | null;
  platform: "macos" | null;
  executable: "/usr/bin/git" | null;
  argv: readonly ["symbolic-ref", "--quiet", "--short", "HEAD"] | null;
  workingDirectoryFingerprint: string | null;
  observationSequenceIdentity: string | null;
  status: "accepted" | "rejected";
  primaryReason: PureGitBranchStateReason;
  reasons: readonly PureGitBranchStateReason[];
  originalStdoutFingerprint: string | null;
  normalizedStdoutFingerprint: string | null;
  finalLfRemoved: boolean;
  stderrEmpty: boolean;
  eligibleCompletion: boolean;
  branchState: "attached" | "detached" | null;
  branchName: string | null;
  branchNameFingerprint: string | null;
  detached: boolean;
  shortRef: boolean;
  refGrammarIdentity: typeof PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.grammarId;
  exactExitCode: 0 | 1 | null;
  observedLiveProcess: false;
  repositoryReadAuthorityGranted: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  evidenceFingerprint: string;
}>;

export function buildPureGitBranchStateInterpretation(input: unknown): PureGitBranchStateResult {
  const completion = validateGitObservationCompletionResult(input, "git_branch_state_v1");
  if (!completion.valid) return buildResult(null, ["input_contract_rejected"]);
  const reasons = validateBranch(completion.evidence);
  return buildResult(completion.evidence, reasons);
}

function validateBranch(evidence: GitObservationCompletionEvidence): PureGitBranchStateReason[] {
  const text = evidence.stdoutText ?? "";
  const normalized = text.endsWith("\n") ? text.slice(0, -1) : text;
  const reasons: PureGitBranchStateReason[] = [];
  if (evidence.exitCode !== 0 && evidence.exitCode !== 1) reasons.push("detached_exit_state_rejected");
  if (!evidence.eligibleCompletion) reasons.push("completion_state_rejected");
  if (!evidence.stderrEmpty) reasons.push("stderr_not_empty");
  if (evidence.exitCode === 1) {
    if (text !== "") reasons.push("detached_exit_state_rejected");
    return reasons.length === 0 ? ["detached"] : deepFreeze([...new Set(reasons)]);
  }
  if (text.length === 0) reasons.push("stdout_empty");
  if ((text.match(/\n/gu) ?? []).length > (text.endsWith("\n") ? 1 : 0)) reasons.push("stdout_multiple_lines");
  if (/^\s|\s$/u.test(normalized) || normalized.includes(" ") || normalized.includes("\t")) reasons.push("whitespace_rejected");
  if (text.includes("\r")) reasons.push("carriage_return_rejected");
  if (text.includes("\0")) reasons.push("nul_rejected");
  if (/\u001b\[/u.test(text)) reasons.push("ansi_escape_rejected");
  if (/[\u0001-\u001f\u007f]/u.test(normalized)) reasons.push("control_character_rejected");
  if (normalized === "") reasons.push("branch_ref_empty");
  if (normalized.startsWith("refs/heads/")) reasons.push("branch_ref_prefix_rejected");
  if (normalized.startsWith("/") || normalized.endsWith("/") || normalized.includes("//")) reasons.push("branch_ref_component_rejected");
  if (normalized.includes("..") || normalized.includes("@{") || normalized === "@") reasons.push("branch_ref_reserved_sequence_rejected");
  if (normalized.endsWith(".") || normalized.split("/").some((part) => part.startsWith(".") || part.endsWith(".lock"))) reasons.push("branch_ref_suffix_rejected");
  if (!/^[A-Za-z0-9._/-]+$/u.test(normalized) || /[:?*[\\]/u.test(normalized)) reasons.push("branch_ref_character_rejected");
  return reasons.length === 0 ? ["attached"] : deepFreeze([...new Set(reasons)]);
}

function buildResult(source: GitObservationCompletionEvidence | null, reasons: readonly PureGitBranchStateReason[]): PureGitBranchStateResult {
  const accepted = source !== null && reasons.length === 1 && (reasons[0] === "attached" || reasons[0] === "detached");
  const text = source?.stdoutText ?? null;
  const normalized = text === null ? null : text.endsWith("\n") ? text.slice(0, -1) : text;
  const attached = accepted && reasons[0] === "attached";
  const detached = accepted && reasons[0] === "detached";
  const exactExitCode = source?.exitCode === 0 ? 0 as const : source?.exitCode === 1 ? 1 as const : null;
  const evidenceBase = {
    evidenceKind: "pure_read_only_git_branch_state_interpretation_evidence" as const,
    evidenceVersion: 1 as const,
    contractId: PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.boundaryId,
    grammarId: PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.grammarId,
    normalizationId: PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.normalizationId,
    sourceCompletionEvidenceFingerprint: source?.evidenceFingerprint ?? null,
    sourceSpawnFingerprint: source?.sourceSpawnFingerprint ?? null,
    boundarySessionId: source?.boundarySessionId ?? null,
    purpose: source?.purpose ?? null,
    platform: source?.platform ?? null,
    executable: source?.canonicalExecutablePath ?? null,
    argv: source?.argv as readonly ["symbolic-ref", "--quiet", "--short", "HEAD"] | null ?? null,
    workingDirectoryFingerprint: source?.workingDirectoryFingerprint ?? null,
    observationSequenceIdentity: source?.observationSequenceIdentity ?? null,
    status: accepted ? "accepted" as const : "rejected" as const,
    primaryReason: reasons[0] ?? "input_contract_rejected",
    reasons,
    originalStdoutFingerprint: text === null ? null : sha256("ture:pure-read-only-git-branch-state:original-stdout:v1", text),
    normalizedStdoutFingerprint: normalized === null ? null : sha256("ture:pure-read-only-git-branch-state:normalized-stdout:v1", normalized),
    finalLfRemoved: text?.endsWith("\n") ?? false,
    stderrEmpty: source?.stderrEmpty ?? false,
    eligibleCompletion: source?.eligibleCompletion ?? false,
    branchState: attached ? "attached" as const : detached ? "detached" as const : null,
    branchName: attached ? normalized : null,
    branchNameFingerprint: attached && normalized !== null ? sha256("ture:pure-read-only-git-branch-state:branch-name:v1", normalized) : null,
    detached,
    shortRef: attached,
    refGrammarIdentity: PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.grammarId,
    exactExitCode,
    observedLiveProcess: false as const,
    repositoryReadAuthorityGranted: false as const,
    runtimeActivated: false as const,
    toctouEliminated: false as const,
    authority: "none" as const,
  };
  const evidence = deepFreeze({ ...evidenceBase, evidenceFingerprint: sha256("ture:pure-read-only-git-branch-state:evidence:v1", evidenceBase) });
  const resultBase = { resultKind: "pure_read_only_git_branch_state_interpretation_result" as const, resultVersion: 1 as const, contractId: PURE_READ_ONLY_GIT_BRANCH_STATE_CONTRACT_IDENTITY.contractId, status: accepted ? "accepted_fixture_git_branch_state" as const : "blocked_fail_closed" as const, blockingReasons: reasons, evidence };
  return deepFreeze({ ...resultBase, resultFingerprint: sha256("ture:pure-read-only-git-branch-state:result:v1", resultBase) });
}
