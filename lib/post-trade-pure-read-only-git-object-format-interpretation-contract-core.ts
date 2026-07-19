import {
  deepFreeze,
  sha256,
  validateGitObservationCompletionResult,
  type GitObservationCompletionEvidence,
} from "@/lib/post-trade-pure-read-only-git-observation-completion-contract-core";

export const PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_read_only_git_object_format_interpretation_contract",
  contractId: "ture.execution.pure-read-only-git-object-format-interpretation-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.read-only-git-object-format-interpretation.fixture-boundary.v1",
  grammarId: "ture.execution.read-only-git-object-format.sha1-sha256-enum.v1",
  grammarVersion: 1,
  normalizationId: "ture.execution.read-only-git-line-output.optional-single-final-lf.v1",
  normalizationVersion: 1,
  capabilityIdentity: "git_object_format_v1",
  fixtureOnly: true,
  authority: "none",
} as const);

export type GitObjectFormat = "sha1" | "sha256";
export type PureGitObjectFormatReason = "accepted" | "input_contract_rejected" | "completion_state_rejected" | "stderr_not_empty" | "stdout_empty" | "stdout_multiple_lines" | "whitespace_rejected" | "carriage_return_rejected" | "nul_rejected" | "control_character_rejected" | "ansi_escape_rejected" | "object_format_rejected" | "stdout_byte_count_rejected";

export type PureGitObjectFormatResult = Readonly<{
  resultKind: "pure_read_only_git_object_format_interpretation_result";
  resultVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.contractId;
  status: "accepted_fixture_git_object_format" | "blocked_fail_closed";
  blockingReasons: readonly PureGitObjectFormatReason[];
  evidence: PureGitObjectFormatEvidence;
  resultFingerprint: string;
}>;

export type PureGitObjectFormatEvidence = Readonly<{
  evidenceKind: "pure_read_only_git_object_format_interpretation_evidence";
  evidenceVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.boundaryId;
  grammarId: typeof PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.grammarId;
  normalizationId: typeof PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.normalizationId;
  sourceCompletionEvidenceFingerprint: string | null;
  sourceSpawnFingerprint: string | null;
  boundarySessionId: string | null;
  purpose: "first_live_read_only_staging_preflight" | null;
  platform: "macos" | null;
  executable: "/usr/bin/git" | null;
  argv: readonly ["rev-parse", "--show-object-format"] | null;
  workingDirectoryFingerprint: string | null;
  observationSequenceIdentity: string | null;
  evidenceTimestamp: string | null;
  status: "accepted" | "rejected";
  primaryReason: PureGitObjectFormatReason;
  reasons: readonly PureGitObjectFormatReason[];
  originalStdoutFingerprint: string | null;
  normalizedStdoutFingerprint: string | null;
  originalStdoutByteCount: number | null;
  normalizedStdoutByteCount: number | null;
  finalLfRemoved: boolean;
  stderrEmpty: boolean;
  eligibleCompletion: boolean;
  objectFormat: GitObjectFormat | null;
  objectIdHexLength: 40 | 64 | null;
  objectIdByteLength: 20 | 32 | null;
  transitionFormat: false;
  observedLiveProcess: false;
  repositoryReadAuthorityGranted: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  evidenceFingerprint: string;
}>;

export function buildPureGitObjectFormatInterpretation(input: unknown): PureGitObjectFormatResult {
  const completion = validateGitObservationCompletionResult(input, "git_object_format_v1");
  if (!completion.valid) return buildResult(null, ["input_contract_rejected"]);
  const reasons = validateOutput(completion.evidence);
  return buildResult(completion.evidence, reasons);
}

function validateOutput(evidence: GitObservationCompletionEvidence): PureGitObjectFormatReason[] {
  const text = evidence.stdoutText ?? "";
  const normalized = text.endsWith("\n") ? text.slice(0, -1) : text;
  const reasons: PureGitObjectFormatReason[] = [];
  if (evidence.exitCode !== 0 || !evidence.eligibleCompletion) reasons.push("completion_state_rejected");
  if (!evidence.stderrEmpty) reasons.push("stderr_not_empty");
  if (text.length === 0) reasons.push("stdout_empty");
  if ((text.match(/\n/gu) ?? []).length > (text.endsWith("\n") ? 1 : 0)) reasons.push("stdout_multiple_lines");
  if (/\s/u.test(normalized)) reasons.push("whitespace_rejected");
  if (text.includes("\r")) reasons.push("carriage_return_rejected");
  if (text.includes("\0")) reasons.push("nul_rejected");
  if (/\u001b\[/u.test(text)) reasons.push("ansi_escape_rejected");
  if (/[\u0001-\u001f\u007f]/u.test(normalized)) reasons.push("control_character_rejected");
  if (evidence.stdoutByteCount > 8) reasons.push("stdout_byte_count_rejected");
  if (normalized !== "sha1" && normalized !== "sha256") reasons.push("object_format_rejected");
  return reasons.length === 0 ? ["accepted"] : deepFreeze([...new Set(reasons)]);
}

function buildResult(source: GitObservationCompletionEvidence | null, reasons: readonly PureGitObjectFormatReason[]): PureGitObjectFormatResult {
  const accepted = source !== null && reasons.length === 1 && reasons[0] === "accepted";
  const text = source?.stdoutText ?? null;
  const normalized = text === null ? null : text.endsWith("\n") ? text.slice(0, -1) : text;
  const objectFormat = accepted ? normalized as GitObjectFormat : null;
  const evidenceBase = {
    evidenceKind: "pure_read_only_git_object_format_interpretation_evidence" as const,
    evidenceVersion: 1 as const,
    contractId: PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.boundaryId,
    grammarId: PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.grammarId,
    normalizationId: PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.normalizationId,
    sourceCompletionEvidenceFingerprint: source?.evidenceFingerprint ?? null,
    sourceSpawnFingerprint: source?.sourceSpawnFingerprint ?? null,
    boundarySessionId: source?.boundarySessionId ?? null,
    purpose: source?.purpose ?? null,
    platform: source?.platform ?? null,
    executable: source?.canonicalExecutablePath ?? null,
    argv: source?.argv as readonly ["rev-parse", "--show-object-format"] | null ?? null,
    workingDirectoryFingerprint: source?.workingDirectoryFingerprint ?? null,
    observationSequenceIdentity: source?.observationSequenceIdentity ?? null,
    evidenceTimestamp: source?.evidenceTimestamp ?? null,
    status: accepted ? "accepted" as const : "rejected" as const,
    primaryReason: reasons[0] ?? "input_contract_rejected",
    reasons,
    originalStdoutFingerprint: text === null ? null : sha256("ture:pure-read-only-git-object-format:original-stdout:v1", text),
    normalizedStdoutFingerprint: normalized === null ? null : sha256("ture:pure-read-only-git-object-format:normalized-stdout:v1", normalized),
    originalStdoutByteCount: source?.stdoutByteCount ?? null,
    normalizedStdoutByteCount: normalized === null ? null : Buffer.byteLength(normalized, "utf8"),
    finalLfRemoved: text?.endsWith("\n") ?? false,
    stderrEmpty: source?.stderrEmpty ?? false,
    eligibleCompletion: source?.eligibleCompletion ?? false,
    objectFormat,
    objectIdHexLength: objectFormat === "sha1" ? 40 as const : objectFormat === "sha256" ? 64 as const : null,
    objectIdByteLength: objectFormat === "sha1" ? 20 as const : objectFormat === "sha256" ? 32 as const : null,
    transitionFormat: false as const,
    observedLiveProcess: false as const,
    repositoryReadAuthorityGranted: false as const,
    runtimeActivated: false as const,
    toctouEliminated: false as const,
    authority: "none" as const,
  };
  const evidence = deepFreeze({ ...evidenceBase, evidenceFingerprint: sha256("ture:pure-read-only-git-object-format:evidence:v1", evidenceBase) });
  const resultBase = { resultKind: "pure_read_only_git_object_format_interpretation_result" as const, resultVersion: 1 as const, contractId: PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.contractId, status: accepted ? "accepted_fixture_git_object_format" as const : "blocked_fail_closed" as const, blockingReasons: reasons, evidence };
  return deepFreeze({ ...resultBase, resultFingerprint: sha256("ture:pure-read-only-git-object-format:result:v1", resultBase) });
}
