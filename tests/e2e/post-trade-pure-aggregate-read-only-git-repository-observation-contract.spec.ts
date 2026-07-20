import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildCanonicalPorcelainStatusCompletionInput,
  buildPureByteOrientedPorcelainStatusCompletion,
  type PorcelainStatusCompletionInput,
} from "../../lib/post-trade-pure-byte-oriented-porcelain-status-completion-contract-core";
import {
  PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY,
  PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY,
  buildApprovedAggregateGitWorktreeLinkage,
  buildPureAggregateReadOnlyGitRepositoryObservation,
  type PureAggregateGitRepositoryObservationInput,
  type PureAggregateGitWorktreeLinkage,
} from "../../lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core";
import {
  buildCanonicalGitObservationCompletionInput,
  buildPureReadOnlyGitObservationCompletion,
  canonicalize,
  sha256,
  type GitObservationCapabilityIdentity,
  type GitObservationCompletionInput,
} from "../../lib/post-trade-pure-read-only-git-observation-completion-contract-core";
import { buildPureGitBranchStateInterpretation } from "../../lib/post-trade-pure-read-only-git-branch-state-interpretation-contract-core";
	import { buildPureGitHeadObjectIdInterpretation, type PureGitHeadObjectIdResult } from "../../lib/post-trade-pure-read-only-git-head-object-id-interpretation-contract-core";
	import { buildPureGitObjectFormatInterpretation, type PureGitObjectFormatResult } from "../../lib/post-trade-pure-read-only-git-object-format-interpretation-contract-core";
	import { buildPureReadOnlyGitPorcelainStatusInterpretation } from "../../lib/post-trade-pure-read-only-git-porcelain-status-interpretation-contract-core";
	import { buildPureGitRepositoryRootInterpretation, type PureGitRepositoryRootResult } from "../../lib/post-trade-pure-read-only-git-repository-root-interpretation-contract-core";

const repoRoot = process.cwd();
const modulePath = "lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core.ts";
const sequence = PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.sequenceIdentity;
const workingDirectoryFingerprint = "b".repeat(64);
const sha1Head = "1234567890abcdef1234567890abcdef12345678";
const sha1HeadTwo = "abcdef1234567890abcdef1234567890abcdef12";
const sha256Head = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function simpleCompletion(capabilityIdentity: GitObservationCapabilityIdentity, stdoutText: string, patch: Partial<GitObservationCompletionInput> = {}) {
  return buildPureReadOnlyGitObservationCompletion(buildCanonicalGitObservationCompletionInput(capabilityIdentity, stdoutText, {
    observationSequenceIdentity: sequence,
    workingDirectoryFingerprint,
    ...patch,
  }));
}

function porcelainCompletion(stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  return buildPureByteOrientedPorcelainStatusCompletion(buildCanonicalPorcelainStatusCompletionInput(stdoutBytesHex, {
    boundarySessionId: "git-observation-session-001",
    observationSequenceIdentity: sequence,
    workingDirectoryFingerprint,
    ...patch,
  }));
}

function root(stdoutText = "/Users/willysimonsson/Dev/trade-action-534\n", patch: Partial<GitObservationCompletionInput> = {}) {
  return buildPureGitRepositoryRootInterpretation(simpleCompletion("git_repository_root_v1", stdoutText, patch));
}

function objectFormat(stdoutText = "sha1\n", patch: Partial<GitObservationCompletionInput> = {}) {
  return buildPureGitObjectFormatInterpretation(simpleCompletion("git_object_format_v1", stdoutText, patch));
}

function head(format: PureGitObjectFormatResult, stdoutText = `${sha1Head}\n`, patch: Partial<GitObservationCompletionInput> = {}) {
  return buildPureGitHeadObjectIdInterpretation(simpleCompletion("git_head_object_v1", stdoutText, patch), format);
}

function branch(stdoutText = "main\n", patch: Partial<GitObservationCompletionInput> = {}) {
  return buildPureGitBranchStateInterpretation(simpleCompletion("git_branch_state_v1", stdoutText, patch));
}

function status(stdoutBytesHex = "", patch: Partial<PorcelainStatusCompletionInput> = {}) {
  return buildPureReadOnlyGitPorcelainStatusInterpretation(porcelainCompletion(stdoutBytesHex, patch));
}

function hex(bytes: readonly number[]) {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function asciiBytes(value: string) {
  return [...value].map((item) => item.charCodeAt(0));
}

function record(statusPair: string, path: string) {
  return hex([...asciiBytes(statusPair), 0x20, ...asciiBytes(path), 0x00]);
}

function validInput(patch: Partial<PureAggregateGitRepositoryObservationInput> = {}): PureAggregateGitRepositoryObservationInput {
  const repositoryRootEvidence = root();
  const objectFormatEvidence = objectFormat();
  const headBeforeEvidence = head(objectFormatEvidence);
  const branchStateEvidence = branch();
  const porcelainStatusEvidence = status();
  const headAfterEvidence = head(objectFormatEvidence);
  const approvedWorktreeEvidence = buildApprovedAggregateGitWorktreeLinkage({
    repositoryRootPathFingerprint: repositoryRootEvidence.evidence.repositoryRootPathFingerprint ?? "",
    workingDirectoryFingerprint,
    observationSequenceIdentity: sequence,
  });
  return {
    contractKind: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractKind,
    contractVersion: 1,
    boundaryId: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.boundaryId,
    policyId: PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId,
    policyVersion: 1,
    repositoryRootEvidence,
    objectFormatEvidence,
    headBeforeEvidence,
    branchStateEvidence,
    porcelainStatusEvidence,
    headAfterEvidence,
    approvedWorktreeEvidence,
    ...patch,
  };
}

function aggregate(input: unknown = validInput()) {
  const result = buildPureAggregateReadOnlyGitRepositoryObservation(input);
  expect(result.fixtureOnly).toBe(true);
  expect(result.authority).toBe("none");
  expect(result.observedLiveProcess).toBe(false);
  expect(result.runtimeActivated).toBe(false);
  expect(result.compatibilityAuthorityGranted).toBe(false);
  expect(result.repositoryReadAuthorityGranted).toBe(false);
  expect(result.deploymentAuthorityGranted).toBe(false);
  expect(result.evidence.toctouEliminated).toBe(false);
  expect(result.resultFingerprint).toMatch(/^[a-f0-9]{64}$/u);
  expectFrozenDeep(result);
  return result;
}

function expectFrozenDeep(value: unknown) {
  expect(Object.isFrozen(value)).toBe(true);
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) {
      if (child && typeof child === "object") expect(Object.isFrozen(child)).toBe(true);
    }
  }
}

	function recomputeSimpleResult<T extends PureGitRepositoryRootResult | PureGitObjectFormatResult | PureGitHeadObjectIdResult>(
	  result: T,
  evidencePatch: Partial<T["evidence"]>,
  evidenceDomain: string,
  resultDomain: string,
): T {
  const evidenceBase = { ...result.evidence, ...evidencePatch } as T["evidence"];
  delete (evidenceBase as { evidenceFingerprint?: string }).evidenceFingerprint;
  const evidence = {
    ...evidenceBase,
    evidenceFingerprint: sha256(evidenceDomain, canonicalize(evidenceBase)),
  } as T["evidence"];
  const resultBase = { ...result, evidence } as T;
  delete (resultBase as { resultFingerprint?: string }).resultFingerprint;
  return {
    ...resultBase,
    resultFingerprint: sha256(resultDomain, canonicalize(resultBase)),
	  } as T;
	}

	function recomputeRootResultWithPatch(
	  result: PureGitRepositoryRootResult,
	  evidencePatch: Record<string, unknown>,
	): PureGitRepositoryRootResult {
	  const evidenceBase = { ...result.evidence, ...evidencePatch };
	  delete (evidenceBase as { evidenceFingerprint?: string }).evidenceFingerprint;
	  const evidence = {
	    ...evidenceBase,
	    evidenceFingerprint: sha256("ture:pure-read-only-git-root:evidence:v1", canonicalize(evidenceBase)),
	  };
	  const resultBase = { ...result, evidence };
	  delete (resultBase as { resultFingerprint?: string }).resultFingerprint;
	  return {
	    ...resultBase,
	    resultFingerprint: sha256("ture:pure-read-only-git-root:result:v1", canonicalize(resultBase)),
	  } as PureGitRepositoryRootResult;
	}

test.describe("pure aggregate read-only Git repository observation contract", () => {
  test("identity policy and worktree linkage are immutable fixture-only contracts", () => {
    expect(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY).toMatchObject({
      contractKind: "pure_aggregate_read_only_git_repository_observation_contract",
      contractId: "ture.execution.pure-aggregate-read-only-git-repository-observation-contract.fixture.v1",
      boundaryId: "ture.execution.aggregate-read-only-git-repository-observation.fixture-boundary.v1",
      fixtureOnly: true,
      observedLiveProcess: false,
      authority: "none",
    });
    expect(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.stageSlots).toEqual([
      "repository_root",
      "object_format",
      "head_before",
      "branch_state",
      "porcelain_status",
      "head_after",
    ]);
    const linkage = buildApprovedAggregateGitWorktreeLinkage({
      repositoryRootPathFingerprint: "c".repeat(64),
      workingDirectoryFingerprint,
      observationSequenceIdentity: sequence,
    });
    expect(linkage.evidenceFingerprint).toMatch(/^[a-f0-9]{64}$/u);
    expect(linkage.repositoryReadAuthorityGranted).toBe(false);
    expect(linkage.toctouEliminated).toBe(false);
    expect(Object.isFrozen(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY)).toBe(true);
    expect(Object.isFrozen(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY)).toBe(true);
    expectFrozenDeep(linkage);
  });

  test("production core is pure with no live imports or runtime wiring", () => {
    const text = source(modulePath);
    expect(text).not.toContain('import "server-only"');
    expect(text).not.toMatch(/from\s+["']node:fs|from\s+["']fs\/promises|from\s+["']node:child_process|spawn\(|exec\(|execFile\(|fork\(|process\.env|process\.cwd|fetch\(|axios|keychain|keytar|osascript|createClient\(|\.insert\(|\.upsert\(|\.rpc\(|setTimeout|setInterval|new Date|Date\.now|performance\.now/u);
    expect(source("app/trade-app.tsx")).not.toContain("post-trade-pure-aggregate-read-only-git-repository-observation");
    expect(source("app/api/post-trade/payload/validate/route.ts")).not.toContain("post-trade-pure-aggregate-read-only-git-repository-observation");
  });

  test("builds clean stable sha1 attached observation without authority", () => {
    const result = aggregate();
    expect(result.status).toBe("repository_clean_stable_observation");
    expect(result.reason).toBe("repository_clean_stable_observation");
    expect(result.evidence.repositoryRootMatched).toBe(true);
    expect(result.evidence.objectFormat).toBe("sha1");
    expect(result.evidence.headStable).toBe(true);
    expect(result.evidence.branchState).toBe("attached");
    expect(result.evidence.clean).toBe(true);
    expect(result.evidence.dirty).toBe(false);
    expect(result.evidence.laterActivationEligibility).toBe(false);
    expect(result.evidence.eligibilityPolicyResolved).toBe(false);
    expect(result.evidence.compatibilityDecision).toBeNull();
    expect(JSON.stringify(result)).not.toContain("/Users/willysimonsson/Dev/trade-action-534");
  });

  test("builds clean stable sha256 observation with linked HEAD length", () => {
    const objectFormatEvidence = objectFormat("sha256\n");
    const input = validInput({
      objectFormatEvidence,
      headBeforeEvidence: head(objectFormatEvidence, `${sha256Head}\n`),
      headAfterEvidence: head(objectFormatEvidence, `${sha256Head}\n`),
    });
    const result = aggregate(input);
    expect(result.status).toBe("repository_clean_stable_observation");
    expect(result.evidence.objectFormat).toBe("sha256");
    expect(result.evidence.headStable).toBe(true);
  });

  test("returns repository root mismatch as observational outcome", () => {
    const input = validInput();
    const wrongWorktree = buildApprovedAggregateGitWorktreeLinkage({
      repositoryRootPathFingerprint: "d".repeat(64),
      workingDirectoryFingerprint,
      observationSequenceIdentity: sequence,
    });
    const result = aggregate({ ...input, approvedWorktreeEvidence: wrongWorktree });
    expect(result.status).toBe("repository_root_mismatch");
    expect(result.reason).toBe("repository_root_mismatch");
    expect(result.evidence.repositoryRootMatched).toBe(false);
    expect(result.evidence.laterActivationEligibility).toBe(false);
  });

  test("rejects malformed root and worktree evidence", () => {
    expect(aggregate(validInput({ repositoryRootEvidence: root("relative\n") }))).toMatchObject({ status: "input_rejected", reason: "root_evidence_rejected" });
    expect(aggregate(validInput({ approvedWorktreeEvidence: { ...validInput().approvedWorktreeEvidence, evidenceFingerprint: "bad" } as PureAggregateGitWorktreeLinkage }))).toMatchObject({ status: "input_rejected", reason: "worktree_evidence_rejected" });
  });

  test("detects HEAD changed during observation and does not preserve clean status", () => {
    const objectFormatEvidence = objectFormat();
    const result = aggregate(validInput({
      objectFormatEvidence,
      headBeforeEvidence: head(objectFormatEvidence, `${sha1Head}\n`),
      headAfterEvidence: head(objectFormatEvidence, `${sha1HeadTwo}\n`),
    }));
    expect(result.status).toBe("head_changed_during_observation");
    expect(result.reason).toBe("head_changed_during_observation");
    expect(result.evidence.headStable).toBe(false);
    expect(result.evidence.clean).toBe(false);
  });

  test("rejects cross-linked object-format and HEAD evidence", () => {
    const sha1Format = objectFormat("sha1\n");
    const sha256Format = objectFormat("sha256\n");
    const result = aggregate(validInput({
      objectFormatEvidence: sha1Format,
      headBeforeEvidence: head(sha256Format, `${sha256Head}\n`),
      headAfterEvidence: head(sha1Format, `${sha1Head}\n`),
    }));
    expect(result.status).toBe("input_rejected");
    expect(result.reason).toBe("object_format_head_linkage_rejected");
  });

  test("rejects zero object IDs through HEAD stage validation", () => {
    const objectFormatEvidence = objectFormat();
    const result = aggregate(validInput({
      objectFormatEvidence,
      headBeforeEvidence: head(objectFormatEvidence, `${"0".repeat(40)}\n`),
    }));
    expect(result.status).toBe("input_rejected");
    expect(result.reason).toBe("head_before_evidence_rejected");
  });

  test("returns detached HEAD as non-authoritative observational outcome", () => {
    const result = aggregate(validInput({ branchStateEvidence: branch("", { exitCode: 1, closeCode: 1, stdoutByteCount: 0, combinedByteCount: 0 }) }));
    expect(result.status).toBe("detached_head");
    expect(result.reason).toBe("detached_head");
    expect(result.evidence.detached).toBe(true);
    expect(result.evidence.laterActivationEligibility).toBe(false);
  });

  test("rejects wrong branch linkage and does not invent branch approval", () => {
    const wrongBranch = branch("main\n", { observationSequenceIdentity: "another-sequence" });
    const result = aggregate(validInput({ branchStateEvidence: wrongBranch }));
    expect(result.status).toBe("input_rejected");
    expect(result.reason).toBe("sequence_identity_rejected");
    const attached = aggregate();
    expect(attached.evidence.branchNameFingerprint).toMatch(/^[a-f0-9]{64}$/u);
    expect(attached.evidence.eligibilityPolicyResolved).toBe(false);
  });

  for (const [name, statusPair, expectedCounts] of [
    ["staged", "M ", { stagedChangeCount: 1, unstagedChangeCount: 0, untrackedCount: 0, unmergedCount: 0 }],
    ["unstaged", " M", { stagedChangeCount: 0, unstagedChangeCount: 1, untrackedCount: 0, unmergedCount: 0 }],
    ["staged and unstaged", "MM", { stagedChangeCount: 1, unstagedChangeCount: 1, untrackedCount: 0, unmergedCount: 0 }],
    ["untracked", "??", { stagedChangeCount: 0, unstagedChangeCount: 0, untrackedCount: 1, unmergedCount: 0 }],
    ["unmerged", "UU", { stagedChangeCount: 0, unstagedChangeCount: 0, untrackedCount: 0, unmergedCount: 1 }],
  ] as const) {
    test(`classifies dirty ${name} status`, () => {
      const result = aggregate(validInput({ porcelainStatusEvidence: status(record(statusPair, `${name}.txt`)) }));
      expect(result.status).toBe("repository_dirty");
      expect(result.reason).toBe("repository_dirty");
      expect(result.evidence.clean).toBe(false);
      expect(result.evidence.dirty).toBe(true);
      expect(result.evidence).toMatchObject(expectedCounts);
    });
  }

  test("preserves multiple dirty category counts", () => {
    const output = `${record("M ", "a.txt")}${record(" M", "b.txt")}${record("??", "c.txt")}${record("UU", "d.txt")}`;
    const result = aggregate(validInput({ porcelainStatusEvidence: status(output) }));
    expect(result.status).toBe("repository_dirty");
    expect(result.evidence.stagedChangeCount).toBe(1);
    expect(result.evidence.unstagedChangeCount).toBe(1);
    expect(result.evidence.untrackedCount).toBe(1);
    expect(result.evidence.unmergedCount).toBe(1);
  });

  test("rejects rejected status evidence and malformed stage contracts", () => {
    expect(aggregate(validInput({ porcelainStatusEvidence: status(record("!!", "ignored.txt")) }))).toMatchObject({ status: "input_rejected", reason: "status_evidence_rejected" });
    expect(aggregate(validInput({ objectFormatEvidence: objectFormat("sha512\n") }))).toMatchObject({ status: "input_rejected", reason: "object_format_evidence_rejected" });
    expect(aggregate(validInput({ headAfterEvidence: head(objectFormat(), `${"f".repeat(39)}\n`) }))).toMatchObject({ status: "input_rejected", reason: "head_after_evidence_rejected" });
  });

  test("rejects shared session platform policy executable worktree and sequence mismatch", () => {
    expect(aggregate(validInput({ repositoryRootEvidence: root(undefined, { boundarySessionId: "other-session" }) }))).toMatchObject({ status: "input_rejected", reason: "session_linkage_rejected" });
    expect(aggregate(validInput({ headBeforeEvidence: head(objectFormat(), `${sha1Head}\n`, { platform: "linux" as never }) }))).toMatchObject({ status: "input_rejected", reason: "head_before_evidence_rejected" });
    expect(aggregate(validInput({ repositoryRootEvidence: root(undefined, { policyId: "wrong" as never }) }))).toMatchObject({ status: "input_rejected", reason: "root_evidence_rejected" });
    expect(aggregate(validInput({ porcelainStatusEvidence: status("", { canonicalExecutablePath: "/opt/git" as never }) }))).toMatchObject({ status: "input_rejected", reason: "status_evidence_rejected" });
    expect(aggregate(validInput({ repositoryRootEvidence: root(undefined, { workingDirectoryFingerprint: "e".repeat(64) }) }))).toMatchObject({ status: "input_rejected", reason: "worktree_linkage_rejected" });
    expect(aggregate(validInput({ porcelainStatusEvidence: status("", { observationSequenceIdentity: "other-sequence" }) }))).toMatchObject({ status: "input_rejected", reason: "sequence_identity_rejected" });
  });

	  test("rejects recomputed fingerprint security forgery", () => {
	    const input = validInput();
	    const forgedRoot = recomputeSimpleResult(
      input.repositoryRootEvidence,
      { observedLiveProcess: true as false },
      "ture:pure-read-only-git-root:evidence:v1",
      "ture:pure-read-only-git-root:result:v1",
    );
    const result = aggregate({ ...input, repositoryRootEvidence: forgedRoot });
	    expect(result.status).toBe("input_rejected");
	    expect(result.reason).toBe("root_evidence_rejected");
	  });

	  for (const [field, value] of [
	    ["processAuthorityGranted", true],
	    ["observerAuthorityGranted", true],
	    ["cliExecutionAuthorityGranted", true],
	    ["credentialAuthorityGranted", true],
	    ["networkAuthorityGranted", true],
	    ["mutationAuthorityGranted", true],
	    ["repositoryReadAuthorityGranted", true],
	    ["compatibilityAuthorityGranted", true],
	    ["runtimeAuthorityGranted", true],
	    ["stagingAuthorityGranted", true],
	    ["deploymentAuthorityGranted", true],
	    ["authorizationConsumed", true],
	    ["observedLiveProcess", true],
	    ["runtimeActivated", true],
	    ["toctouEliminated", true],
	    ["authority", "fixture_structural_only"],
	  ] as const) {
	    test(`rejects recomputed root evidence authority forgery for ${field}`, () => {
	      const input = validInput();
	      const forgedRoot = recomputeRootResultWithPatch(input.repositoryRootEvidence, { [field]: value });
	      const result = aggregate({ ...input, repositoryRootEvidence: forgedRoot });
	      expect(result.status).toBe("input_rejected");
	      expect(result.reason).toBe("root_evidence_rejected");
	      expect(result.evidence.laterActivationEligibility).toBe(false);
	      expect(result.evidence.authority).toBe("none");
	      expect(result.evidence.toctouEliminated).toBe(false);
	    });
	  }

	  for (const field of [
	    "credentialsUsed",
	    "networkUsed",
	    "shellUsed",
	    "pathLookupUsed",
	    "inheritedEnvironmentUsed",
	  ] as const) {
	    test(`rejects root evidence schema extension for unsupported security field ${field}`, () => {
	      const input = validInput();
	      const forgedRoot = recomputeRootResultWithPatch(input.repositoryRootEvidence, { [field]: true });
	      const result = aggregate({ ...input, repositoryRootEvidence: forgedRoot });
	      expect(result.status).toBe("input_rejected");
	      expect(result.reason).toBe("root_evidence_rejected");
	      expect(result.evidence.laterActivationEligibility).toBe(false);
	      expect(result.evidence.authority).toBe("none");
	      expect(result.evidence.toctouEliminated).toBe(false);
	    });
	  }

	  for (const [name, patch] of [
    ["runtime", { runtimeActivated: true }],
    ["authority", { repositoryReadAuthorityGranted: true }],
    ["toctou", { toctouEliminated: true }],
  ] as const) {
    test(`rejects ${name} claim in status evidence`, () => {
      const statusResult = status();
      const forged = { ...statusResult, evidence: { ...statusResult.evidence, ...patch } };
      expect(aggregate(validInput({ porcelainStatusEvidence: forged as unknown as typeof statusResult }))).toMatchObject({ status: "input_rejected", reason: "status_evidence_rejected" });
    });
  }

  test("rejects aggregate schema identity policy and caller-controlled extra fields", () => {
    expect(aggregate({ ...validInput(), callerClean: true })).toMatchObject({ status: "input_rejected", reason: "input_contract_rejected" });
    expect(aggregate({ ...validInput(), contractKind: "wrong" })).toMatchObject({ status: "input_rejected", reason: "input_identity_rejected" });
    expect(aggregate({ ...validInput(), policyId: "wrong" })).toMatchObject({ status: "input_rejected", reason: "aggregate_policy_rejected" });
    expect(aggregate([validInput()])).toMatchObject({ status: "input_rejected", reason: "input_contract_rejected" });
  });

  test("rejects accessors symbols inherited fields functions arrays classes and malformed fingerprints", () => {
    const accessor = {};
    Object.defineProperty(accessor, "contractKind", { get: () => PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_CONTRACT_IDENTITY.contractKind });
    expect(aggregate(accessor)).toMatchObject({ status: "input_rejected", reason: "input_contract_rejected" });
    expect(aggregate(Object.assign(Object.create({ inherited: true }), validInput()))).toMatchObject({ status: "input_rejected", reason: "input_contract_rejected" });
    expect(aggregate({ ...validInput(), [Symbol("x")]: true })).toMatchObject({ status: "input_rejected", reason: "input_contract_rejected" });
    expect(aggregate({ ...validInput(), repositoryRootEvidence: () => root() })).toMatchObject({ status: "input_rejected", reason: "root_evidence_rejected" });
    expect(aggregate({ ...validInput(), repositoryRootEvidence: [] })).toMatchObject({ status: "input_rejected", reason: "root_evidence_rejected" });
    class Stage {}
    expect(aggregate({ ...validInput(), repositoryRootEvidence: new Stage() })).toMatchObject({ status: "input_rejected", reason: "root_evidence_rejected" });
    expect(aggregate(validInput({ approvedWorktreeEvidence: { ...validInput().approvedWorktreeEvidence, workingDirectoryFingerprint: "not-a-fingerprint" } as PureAggregateGitWorktreeLinkage }))).toMatchObject({ status: "input_rejected", reason: "worktree_evidence_rejected" });
  });

  test("fingerprints are deterministic and bind stage worktree sequence branch status and HEAD", () => {
    const first = aggregate();
    const second = aggregate();
    expect(first).toEqual(second);
    expect(aggregate(validInput({ approvedWorktreeEvidence: buildApprovedAggregateGitWorktreeLinkage({ repositoryRootPathFingerprint: "d".repeat(64), workingDirectoryFingerprint, observationSequenceIdentity: sequence }) }))).not.toEqual(first);
    expect(aggregate(validInput({ branchStateEvidence: branch("release\n") }))).not.toEqual(first);
    expect(aggregate(validInput({ porcelainStatusEvidence: status(record("M ", "a.txt")) }))).not.toEqual(first);
    expect(aggregate(validInput({ headAfterEvidence: head(objectFormat(), `${sha1HeadTwo}\n`) }))).not.toEqual(first);
  });

  test("input mutation cannot alter completed result and aggregate does not retain original references", () => {
    const input = validInput();
    const result = aggregate(input);
    (input as { policyId: string }).policyId = "mutated";
    expect(result.status).toBe("repository_clean_stable_observation");
    expect(result.evidence.policyId).toBe(PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.policyId);
    expect(JSON.stringify(result)).not.toContain("repositoryRootPath");
  });
});
