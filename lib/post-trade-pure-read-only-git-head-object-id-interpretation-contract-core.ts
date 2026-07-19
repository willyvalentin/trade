import {
  canonicalize,
  deepFreeze,
  hasExactKeys,
  isPlainRecord,
  isSha256,
  sha256,
  validateGitObservationCompletionResult,
  type GitObservationCompletionEvidence,
} from "@/lib/post-trade-pure-read-only-git-observation-completion-contract-core";
import {
  PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY,
  type GitObjectFormat,
  type PureGitObjectFormatResult,
} from "@/lib/post-trade-pure-read-only-git-object-format-interpretation-contract-core";

export const PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY = deepFreeze({
  contractKind: "pure_read_only_git_head_object_id_interpretation_contract",
  contractId: "ture.execution.pure-read-only-git-head-object-id-interpretation-contract.fixture.v1",
  contractVersion: 1,
  boundaryId: "ture.execution.read-only-git-head-object-id-interpretation.fixture-boundary.v1",
  grammarId: "ture.execution.read-only-git-head-object-id.object-format-linked-lower-hex.v1",
  grammarVersion: 1,
  normalizationId: "ture.execution.read-only-git-line-output.optional-single-final-lf.v1",
  normalizationVersion: 1,
  capabilityIdentity: "git_head_object_v1",
  fixtureOnly: true,
  authority: "none",
} as const);

export type PureGitHeadObjectIdReason = "accepted" | "input_contract_rejected" | "object_format_evidence_rejected" | "object_format_linkage_rejected" | "completion_state_rejected" | "stderr_not_empty" | "stdout_empty" | "stdout_multiple_lines" | "whitespace_rejected" | "carriage_return_rejected" | "nul_rejected" | "control_character_rejected" | "ansi_escape_rejected" | "object_id_length_rejected" | "object_id_case_rejected" | "object_id_grammar_rejected" | "object_id_all_zero_rejected";

export type PureGitHeadObjectIdResult = Readonly<{
  resultKind: "pure_read_only_git_head_object_id_interpretation_result";
  resultVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.contractId;
  status: "accepted_fixture_git_head_object_id" | "blocked_fail_closed";
  blockingReasons: readonly PureGitHeadObjectIdReason[];
  evidence: PureGitHeadObjectIdEvidence;
  resultFingerprint: string;
}>;

export type PureGitHeadObjectIdEvidence = Readonly<{
  evidenceKind: "pure_read_only_git_head_object_id_interpretation_evidence";
  evidenceVersion: 1;
  contractId: typeof PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.contractId;
  boundaryId: typeof PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.boundaryId;
  grammarId: typeof PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.grammarId;
  normalizationId: typeof PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.normalizationId;
  sourceCompletionEvidenceFingerprint: string | null;
  sourceSpawnFingerprint: string | null;
  objectFormatEvidenceFingerprint: string | null;
  boundarySessionId: string | null;
  purpose: "first_live_read_only_staging_preflight" | null;
  platform: "macos" | null;
  executable: "/usr/bin/git" | null;
  argv: readonly ["rev-parse", "--verify", "HEAD"] | null;
  workingDirectoryFingerprint: string | null;
  observationSequenceIdentity: string | null;
  status: "accepted" | "rejected";
  primaryReason: PureGitHeadObjectIdReason;
  reasons: readonly PureGitHeadObjectIdReason[];
  originalStdoutFingerprint: string | null;
  normalizedStdoutFingerprint: string | null;
  finalLfRemoved: boolean;
  stderrEmpty: boolean;
  eligibleCompletion: boolean;
  objectFormat: GitObjectFormat | null;
  headObjectId: string | null;
  headObjectIdFingerprint: string | null;
  headObjectIdHexLength: 40 | 64 | null;
  fullObjectId: boolean;
  allZero: false;
  observedLiveProcess: false;
  repositoryReadAuthorityGranted: false;
  runtimeActivated: false;
  toctouEliminated: false;
  authority: "none";
  evidenceFingerprint: string;
}>;

const OBJECT_FORMAT_RESULT_KEYS = [
  "resultKind",
  "resultVersion",
  "contractId",
  "status",
  "blockingReasons",
  "evidence",
  "resultFingerprint",
] as const;

const OBJECT_FORMAT_EVIDENCE_KEYS = [
  "evidenceKind",
  "evidenceVersion",
  "contractId",
  "boundaryId",
  "grammarId",
  "normalizationId",
  "sourceCompletionEvidenceFingerprint",
  "sourceSpawnFingerprint",
  "boundarySessionId",
  "purpose",
  "platform",
  "executable",
  "argv",
  "workingDirectoryFingerprint",
  "observationSequenceIdentity",
  "evidenceTimestamp",
  "status",
  "primaryReason",
  "reasons",
  "originalStdoutFingerprint",
  "normalizedStdoutFingerprint",
  "originalStdoutByteCount",
  "normalizedStdoutByteCount",
  "finalLfRemoved",
  "stderrEmpty",
  "eligibleCompletion",
  "objectFormat",
  "objectIdHexLength",
  "objectIdByteLength",
  "transitionFormat",
  "observedLiveProcess",
  "repositoryReadAuthorityGranted",
  "runtimeActivated",
  "toctouEliminated",
  "authority",
  "evidenceFingerprint",
] as const;

export function buildPureGitHeadObjectIdInterpretation(input: unknown, objectFormatResult: unknown): PureGitHeadObjectIdResult {
  const completion = validateGitObservationCompletionResult(input, "git_head_object_v1");
  const format = validateObjectFormatEvidence(objectFormatResult);
  if (!completion.valid) return buildResult(null, null, ["input_contract_rejected"]);
  if (!format.valid) return buildResult(completion.evidence, null, ["object_format_evidence_rejected"]);
  const linkage = validateObjectFormatLinkage(completion.evidence, format.result);
  if (linkage.length > 0) return buildResult(completion.evidence, format.result, linkage);
  const reasons = validateHeadStdout(completion.evidence, format.result.evidence.objectFormat);
  return buildResult(completion.evidence, format.result, reasons);
}

function validateObjectFormatEvidence(input: unknown): { valid: true; result: PureGitObjectFormatResult } | { valid: false } {
  if (!isPlainRecord(input) || !hasExactKeys(input, OBJECT_FORMAT_RESULT_KEYS)) return { valid: false };
  const result = input as Partial<PureGitObjectFormatResult>;
  if (result.resultKind !== "pure_read_only_git_object_format_interpretation_result"
    || result.resultVersion !== 1
    || result.contractId !== PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.contractId
    || result.status !== "accepted_fixture_git_object_format"
    || !Array.isArray(result.blockingReasons)
    || result.blockingReasons.length !== 1
    || result.blockingReasons[0] !== "accepted"
    || !result.evidence
    || !isPlainRecord(result.evidence)
    || !hasExactKeys(result.evidence, OBJECT_FORMAT_EVIDENCE_KEYS)
    || result.evidence.evidenceKind !== "pure_read_only_git_object_format_interpretation_evidence"
    || result.evidence.evidenceVersion !== 1
    || result.evidence.contractId !== PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.contractId
    || result.evidence.boundaryId !== PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.boundaryId
    || result.evidence.grammarId !== PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.grammarId
    || result.evidence.normalizationId !== PURE_READ_ONLY_GIT_OBJECT_FORMAT_CONTRACT_IDENTITY.normalizationId
    || result.evidence.status !== "accepted"
    || result.evidence.primaryReason !== "accepted"
    || !Array.isArray(result.evidence.reasons)
    || result.evidence.reasons.length !== 1
    || result.evidence.reasons[0] !== "accepted"
    || !isSha256(result.evidence.sourceCompletionEvidenceFingerprint)
    || !isSha256(result.evidence.sourceSpawnFingerprint)
    || !isNonEmptyString(result.evidence.boundarySessionId)
    || result.evidence.purpose !== "first_live_read_only_staging_preflight"
    || result.evidence.platform !== "macos"
    || result.evidence.executable !== "/usr/bin/git"
    || !sameArray(result.evidence.argv, ["rev-parse", "--show-object-format"])
    || !isSha256(result.evidence.workingDirectoryFingerprint)
    || !isNonEmptyString(result.evidence.observationSequenceIdentity)
    || typeof result.evidence.evidenceTimestamp !== "string"
    || Number.isNaN(Date.parse(result.evidence.evidenceTimestamp))
    || !isSha256(result.evidence.originalStdoutFingerprint)
    || !isSha256(result.evidence.normalizedStdoutFingerprint)
    || typeof result.evidence.originalStdoutByteCount !== "number"
    || typeof result.evidence.normalizedStdoutByteCount !== "number"
    || result.evidence.stderrEmpty !== true
    || result.evidence.eligibleCompletion !== true
    || (result.evidence.objectFormat !== "sha1" && result.evidence.objectFormat !== "sha256")
    || result.evidence.objectIdHexLength !== (result.evidence.objectFormat === "sha1" ? 40 : 64)
    || result.evidence.objectIdByteLength !== (result.evidence.objectFormat === "sha1" ? 20 : 32)
    || result.evidence.transitionFormat !== false
    || result.evidence.observedLiveProcess !== false
    || result.evidence.repositoryReadAuthorityGranted !== false
    || result.evidence.runtimeActivated !== false
    || result.evidence.toctouEliminated !== false
    || result.evidence.authority !== "none"
  ) return { valid: false };
  const normalizedStdout = result.evidence.objectFormat;
  const originalStdout = result.evidence.finalLfRemoved ? `${normalizedStdout}\n` : normalizedStdout;
  if (result.evidence.originalStdoutByteCount !== Buffer.byteLength(originalStdout, "utf8")
    || result.evidence.normalizedStdoutByteCount !== Buffer.byteLength(normalizedStdout, "utf8")
    || result.evidence.originalStdoutFingerprint !== sha256("ture:pure-read-only-git-object-format:original-stdout:v1", originalStdout)
    || result.evidence.normalizedStdoutFingerprint !== sha256("ture:pure-read-only-git-object-format:normalized-stdout:v1", normalizedStdout)
  ) return { valid: false };
  const { evidenceFingerprint, ...evidenceWithoutFingerprint } = result.evidence;
  if (evidenceFingerprint !== sha256("ture:pure-read-only-git-object-format:evidence:v1", canonicalize(evidenceWithoutFingerprint))) return { valid: false };
  const { resultFingerprint, ...resultWithoutFingerprint } = result;
  if (resultFingerprint !== sha256("ture:pure-read-only-git-object-format:result:v1", canonicalize(resultWithoutFingerprint))) return { valid: false };
  return { valid: true, result: input as PureGitObjectFormatResult };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function sameArray(value: unknown, expected: readonly string[]): boolean {
  return Array.isArray(value) && value.length === expected.length && value.every((item, index) => item === expected[index]);
}

function validateObjectFormatLinkage(completion: GitObservationCompletionEvidence, format: PureGitObjectFormatResult): PureGitHeadObjectIdReason[] {
  return completion.boundarySessionId === format.evidence.boundarySessionId
    && completion.purpose === format.evidence.purpose
    && completion.platform === format.evidence.platform
    && completion.canonicalExecutablePath === format.evidence.executable
    && completion.workingDirectoryFingerprint === format.evidence.workingDirectoryFingerprint
    && completion.observationSequenceIdentity === format.evidence.observationSequenceIdentity
    ? []
    : ["object_format_linkage_rejected"];
}

function validateHeadStdout(evidence: GitObservationCompletionEvidence, format: GitObjectFormat | null): PureGitHeadObjectIdReason[] {
  const text = evidence.stdoutText ?? "";
  const normalized = text.endsWith("\n") ? text.slice(0, -1) : text;
  const length = format === "sha1" ? 40 : 64;
  const reasons: PureGitHeadObjectIdReason[] = [];
  if (evidence.exitCode !== 0 || !evidence.eligibleCompletion) reasons.push("completion_state_rejected");
  if (!evidence.stderrEmpty) reasons.push("stderr_not_empty");
  if (text.length === 0) reasons.push("stdout_empty");
  if ((text.match(/\n/gu) ?? []).length > (text.endsWith("\n") ? 1 : 0)) reasons.push("stdout_multiple_lines");
  if (/\s/u.test(normalized)) reasons.push("whitespace_rejected");
  if (text.includes("\r")) reasons.push("carriage_return_rejected");
  if (text.includes("\0")) reasons.push("nul_rejected");
  if (/\u001b\[/u.test(text)) reasons.push("ansi_escape_rejected");
  if (/[\u0001-\u001f\u007f]/u.test(normalized)) reasons.push("control_character_rejected");
  if (normalized.length !== length) reasons.push("object_id_length_rejected");
  if (/[A-F]/u.test(normalized)) reasons.push("object_id_case_rejected");
  if (!/^[a-f0-9]+$/u.test(normalized)) reasons.push("object_id_grammar_rejected");
  if (/^0+$/u.test(normalized)) reasons.push("object_id_all_zero_rejected");
  return reasons.length === 0 ? ["accepted"] : deepFreeze([...new Set(reasons)]);
}

function buildResult(source: GitObservationCompletionEvidence | null, format: PureGitObjectFormatResult | null, reasons: readonly PureGitHeadObjectIdReason[]): PureGitHeadObjectIdResult {
  const accepted = source !== null && format !== null && reasons.length === 1 && reasons[0] === "accepted";
  const text = source?.stdoutText ?? null;
  const normalized = text === null ? null : text.endsWith("\n") ? text.slice(0, -1) : text;
  const evidenceBase = {
    evidenceKind: "pure_read_only_git_head_object_id_interpretation_evidence" as const,
    evidenceVersion: 1 as const,
    contractId: PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.boundaryId,
    grammarId: PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.grammarId,
    normalizationId: PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.normalizationId,
    sourceCompletionEvidenceFingerprint: source?.evidenceFingerprint ?? null,
    sourceSpawnFingerprint: source?.sourceSpawnFingerprint ?? null,
    objectFormatEvidenceFingerprint: format?.evidence.evidenceFingerprint ?? null,
    boundarySessionId: source?.boundarySessionId ?? null,
    purpose: source?.purpose ?? null,
    platform: source?.platform ?? null,
    executable: source?.canonicalExecutablePath ?? null,
    argv: source?.argv as readonly ["rev-parse", "--verify", "HEAD"] | null ?? null,
    workingDirectoryFingerprint: source?.workingDirectoryFingerprint ?? null,
    observationSequenceIdentity: source?.observationSequenceIdentity ?? null,
    status: accepted ? "accepted" as const : "rejected" as const,
    primaryReason: reasons[0] ?? "input_contract_rejected",
    reasons,
    originalStdoutFingerprint: text === null ? null : sha256("ture:pure-read-only-git-head-object-id:original-stdout:v1", text),
    normalizedStdoutFingerprint: normalized === null ? null : sha256("ture:pure-read-only-git-head-object-id:normalized-stdout:v1", normalized),
    finalLfRemoved: text?.endsWith("\n") ?? false,
    stderrEmpty: source?.stderrEmpty ?? false,
    eligibleCompletion: source?.eligibleCompletion ?? false,
    objectFormat: accepted ? format.evidence.objectFormat : null,
    headObjectId: accepted ? normalized : null,
    headObjectIdFingerprint: accepted && normalized !== null ? sha256("ture:pure-read-only-git-head-object-id:object-id:v1", normalized) : null,
    headObjectIdHexLength: accepted && format.evidence.objectFormat === "sha1" ? 40 as const : accepted && format.evidence.objectFormat === "sha256" ? 64 as const : null,
    fullObjectId: accepted,
    allZero: false as const,
    observedLiveProcess: false as const,
    repositoryReadAuthorityGranted: false as const,
    runtimeActivated: false as const,
    toctouEliminated: false as const,
    authority: "none" as const,
  };
  const evidence = deepFreeze({ ...evidenceBase, evidenceFingerprint: sha256("ture:pure-read-only-git-head-object-id:evidence:v1", evidenceBase) });
  const resultBase = { resultKind: "pure_read_only_git_head_object_id_interpretation_result" as const, resultVersion: 1 as const, contractId: PURE_READ_ONLY_GIT_HEAD_OBJECT_ID_CONTRACT_IDENTITY.contractId, status: accepted ? "accepted_fixture_git_head_object_id" as const : "blocked_fail_closed" as const, blockingReasons: reasons, evidence };
  return deepFreeze({ ...resultBase, resultFingerprint: sha256("ture:pure-read-only-git-head-object-id:result:v1", resultBase) });
}
