import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY,
  PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY,
  buildDormantGitAuthorityConsumptionKey,
  buildDormantGitAuthorityCurrentStateFingerprint,
  buildDormantGitAuthorityConsumptionTransition,
  buildFixtureDormantGitAuthorityPackageIssuedResultForTransition,
  type DormantGitAuthorityConsumptionCurrentState,
  type DormantGitAuthorityConsumptionStageState,
  type DormantGitAuthorityConsumptionTransitionResult,
} from "../../lib/post-trade-pure-dormant-git-authority-consumption-transition-contract-core";

const repoRoot = process.cwd();
const corePath = "lib/post-trade-pure-dormant-git-authority-consumption-transition-contract-core.ts";
const observedAt = "2026-07-17T12:00:01.000Z";
const consumerId = "dormant-git-authority-consumer-alpha-0001";
const consumerFingerprint = "9".repeat(64);
const packageFingerprintDomain = "ture:pure-dormant-git-runner-authority-package:package:v1";
const packageResultFingerprintDomain = "ture:pure-dormant-git-runner-authority-package:result:v1";

function source(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

function packageResult() {
  return buildFixtureDormantGitAuthorityPackageIssuedResultForTransition();
}

function sha256(domain: string, input: unknown) {
  return createHash("sha256").update(`${domain}:${JSON.stringify(input)}`).digest("hex");
}

function rehashPackageResult(result: ReturnType<typeof packageResult>) {
  const packageCore = { ...result.issuedPackage! } as Record<string, unknown>;
  delete packageCore.packageFingerprintAlgorithm;
  delete packageCore.packageFingerprint;
  const issuedPackage = {
    ...result.issuedPackage!,
    packageFingerprint: sha256(packageFingerprintDomain, packageCore),
  };
  const resultCore = {
    ...result,
    issuedPackage,
    packageId: issuedPackage.packageId,
    packageFingerprint: issuedPackage.packageFingerprint,
    executableResolutionFingerprint: issuedPackage.executableResolutionFingerprint,
    executableRevalidationFingerprint: issuedPackage.executableRevalidationFingerprint,
    compatibilityResultFingerprint: issuedPackage.compatibilityResultFingerprint,
    worktreeEvidenceFingerprint: issuedPackage.worktreeEvidenceFingerprint,
    executable: issuedPackage.executable,
    worktreeFingerprint: issuedPackage.worktreeFingerprint,
    session: issuedPackage.session,
    sequenceIdentity: issuedPackage.observationSequenceIdentity,
    platform: issuedPackage.platform,
    sourcePolicyId: issuedPackage.sourcePolicyId,
    sourcePolicyVersion: issuedPackage.sourcePolicyVersion,
  } as Record<string, unknown>;
  delete resultCore.resultFingerprintAlgorithm;
  delete resultCore.resultFingerprint;
  return {
    ...result,
    ...resultCore,
    resultFingerprintAlgorithm: "sha256",
    resultFingerprint: sha256(packageResultFingerprintDomain, resultCore),
  };
}

function registerForgedPackage(mutator: (issuedPackage: Record<string, unknown>, result: Record<string, unknown>) => void) {
  const original = packageResult();
  const issuedPackage = { ...original.issuedPackage! } as Record<string, unknown>;
  const result = { ...original, issuedPackage } as Record<string, unknown>;
  mutator(issuedPackage, result);
  const forged = rehashPackageResult(result as ReturnType<typeof packageResult>);
  return transition(registerInput({
    authorityPackageResult: forged,
    consumptionKey: buildDormantGitAuthorityConsumptionKey(String(forged.issuedPackage!.packageId), String(forged.issuedPackage!.packageFingerprint)),
  }));
}

function rehashCurrentState(state: DormantGitAuthorityConsumptionCurrentState): DormantGitAuthorityConsumptionCurrentState {
  const core = { ...state } as Omit<DormantGitAuthorityConsumptionCurrentState, "stateFingerprintAlgorithm" | "stateFingerprint"> & Record<string, unknown>;
  delete core.stateFingerprintAlgorithm;
  delete core.stateFingerprint;
  return {
    ...state,
    stateFingerprintAlgorithm: "sha256",
    stateFingerprint: buildDormantGitAuthorityCurrentStateFingerprint(core),
  };
}

function registerInput(patch: Record<string, unknown> = {}) {
  const issued = packageResult();
  const consumptionKey = buildDormantGitAuthorityConsumptionKey(issued.issuedPackage!.packageId, issued.issuedPackage!.packageFingerprint);
  return {
    inputKind: "pure_dormant_git_authority_consumption_transition_input",
    inputVersion: 1,
    contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
    operation: "register_package",
    observedAt,
    authorityPackageResult: issued,
    consumptionKey,
    initialTransitionVersion: 0,
    ...patch,
  };
}

function transition(input: unknown) {
  return buildDormantGitAuthorityConsumptionTransition(input);
}

function registeredState() {
  const result = transition(registerInput());
  expect(result.status).toBe("transition_permitted");
  expect(result.nextState).not.toBeNull();
  return result.nextState!;
}

function claimState(state = registeredState()) {
  const result = transition({
    inputKind: "pure_dormant_git_authority_consumption_transition_input",
    inputVersion: 1,
    contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
    operation: "claim_consumer",
    observedAt: "2026-07-17T12:00:02.000Z",
    currentState: state,
    currentStateFingerprint: state.stateFingerprint,
    expectedTransitionVersion: state.transitionVersion,
    consumerId,
    consumerFingerprint,
  });
  expect(result.status).toBe("transition_permitted");
  return result.nextState!;
}

function consumeStage(state: DormantGitAuthorityConsumptionCurrentState, stageIndex = state.currentStageIndex as 0 | 1 | 2 | 3 | 4 | 5) {
  const result = transition({
    inputKind: "pure_dormant_git_authority_consumption_transition_input",
    inputVersion: 1,
    contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
    operation: "consume_stage",
    observedAt: `2026-07-17T12:00:${String(3 + stageIndex * 2).padStart(2, "0")}.000Z`,
    currentState: state,
    currentStateFingerprint: state.stateFingerprint,
    expectedTransitionVersion: state.transitionVersion,
    consumerId,
    consumerFingerprint,
    stageIndex,
    stageGrantFingerprint: state.stages[stageIndex].stageGrantFingerprint,
    processRequestFingerprint: `${stageIndex}`.repeat(64),
  });
  expect(result.status).toBe("transition_permitted");
  return result.nextState!;
}

function completeStage(
  state: DormantGitAuthorityConsumptionCurrentState,
  outcome: "accepted" | "accepted_detached_observation" | "rejected" | "process_failed" | "ambiguous_process_state" = "accepted",
) {
  const stageIndex = state.currentStageIndex as 0 | 1 | 2 | 3 | 4 | 5;
  const result = transition({
    inputKind: "pure_dormant_git_authority_consumption_transition_input",
    inputVersion: 1,
    contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
    boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
    operation: "record_stage_completion",
    observedAt: `2026-07-17T12:00:${String(4 + stageIndex * 2).padStart(2, "0")}.000Z`,
    currentState: state,
    currentStateFingerprint: state.stateFingerprint,
    expectedTransitionVersion: state.transitionVersion,
    consumerId,
    consumerFingerprint,
    stageIndex,
    processRequestFingerprint: state.stages[stageIndex].processRequestFingerprint,
    completionFingerprint: `${stageIndex + 1}`.repeat(64).slice(0, 64),
    interpretationFingerprint: outcome === "accepted" || outcome === "accepted_detached_observation" ? `${stageIndex + 2}`.repeat(64).slice(0, 64) : null,
    outcome,
  });
  expect(result.status).toBe("transition_permitted");
  return result.nextState!;
}

function allAcceptedState() {
  let state = claimState();
  for (let index = 0; index < 6; index += 1) {
    state = consumeStage(state, index as 0 | 1 | 2 | 3 | 4 | 5);
    state = completeStage(state, index === 3 ? "accepted_detached_observation" : "accepted");
  }
  return state;
}

function expectRejected(result: DormantGitAuthorityConsumptionTransitionResult, reason: string) {
  expect(result.status).toBe("transition_rejected");
  expect(result.reason).toBe(reason);
  expect(result.nextState).toBeNull();
  expect(result.auditEvents).toEqual([]);
  expect(result.authority).toBe("none");
  expect(result.runtimeActivated).toBe(false);
  expect(result.toctouEliminated).toBe(false);
  expect(Object.isFrozen(result)).toBe(true);
}

function expectSingleAudit(result: DormantGitAuthorityConsumptionTransitionResult, stageIndex: number | null, reason: string) {
  expect(result.status).toBe("transition_permitted");
  expect(result.auditEvents).toHaveLength(1);
  const audit = result.auditEvents[0];
  expect(audit.reason).toBe(reason);
  expect(audit.stageIndex).toBe(stageIndex);
  expect(audit.nextStateFingerprint).toBe(result.nextState?.stateFingerprint);
  expect(result.nextState?.lastAuditEventFingerprint).toBe(audit.eventFingerprint);
  expect(result.nextState?.nextAuditSequence).toBe((audit.eventSequence ?? 0) + 1);
  expect(audit.transitionVersionAfter).toBe(result.nextState?.transitionVersion);
}

test.describe("Action 615 pure dormant Git authority consumption transition contract", () => {
  test("exports exact fixture identities and no authority policy", () => {
    expect(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId).toBe("ture.execution.pure-dormant-git-authority-consumption-transition-contract.fixture.v1");
    expect(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY.statePolicyId).toBe("ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1");
    expect(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY.authority).toBe("none");
    expect(PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_POLICY.runtimeActivated).toBe(false);
  });

  test("core remains pure and storage/runtime free", () => {
    const text = source(corePath);
    expect(text).not.toContain('import { createHash } from "node:crypto";');
    expect(text).not.toContain("sha256ForDormantGitAuthorityTransitionTest");
    for (const forbidden of ["server-only", "@supabase", "node:fs", "fs/promises", "child_process", "process.env", "fetch(", "setTimeout", "spawn(", "exec(", "createClient("]) {
      expect(text).not.toContain(forbidden);
    }
  });

  test("canonical registration builds issued state, six stages, audit, and fingerprints", () => {
    const result = transition(registerInput());
    expect(result.status).toBe("transition_permitted");
    expect(result.reason).toBe("package_registered");
    expect(result.nextState?.state).toBe("issued");
    expect(result.nextState?.transitionVersion).toBe(1);
    expect(result.nextState?.stages).toHaveLength(6);
    expect(result.nextState?.stages.every((stage) => !stage.consumed)).toBe(true);
    expect(result.auditEvents).toHaveLength(1);
    expect(result.auditEvents[0].reason).toBe("package_registered");
    expect(result.auditEvents[0].nextStateFingerprint).toBe(result.nextState?.stateFingerprint);
    expect(result.nextState?.lastAuditEventFingerprint).toBe(result.auditEvents[0].eventFingerprint);
  });

  test("registration is deterministic for the same canonical fixture", () => {
    const one = transition(registerInput());
    const two = transition(registerInput());
    expect(two).toEqual(one);
  });

  test("registration rejects expired package observation", () => {
    expectRejected(transition(registerInput({ observedAt: "2026-07-17T12:00:30.000Z" })), "package_expired");
  });

  test("registration rejects wrong consumption key", () => {
    expectRejected(transition(registerInput({ consumptionKey: "f".repeat(64) })), "package_linkage_rejected");
  });

  test("registration rejects malformed authority package", () => {
    expectRejected(transition(registerInput({ authorityPackageResult: { ...packageResult(), status: "input_rejected" } })), "authority_package_rejected");
  });

  test.describe("Action 617 authority-package semantic forgeries", () => {
    const cases: Array<[string, (issuedPackage: Record<string, unknown>, result: Record<string, unknown>) => void]> = [
      ["altered policy fingerprint", (pkg, result) => {
        pkg.authorityPolicyFingerprint = "f".repeat(64);
        result.authorityPolicyFingerprint = "f".repeat(64);
      }],
      ["altered prerequisite linkage", (pkg) => {
        pkg.executableRevalidationFingerprint = "e".repeat(64);
      }],
      ["altered expiry delta", (pkg) => {
        pkg.expiresAt = "2026-07-17T12:00:31.000Z";
      }],
      ["altered expiry posture", (pkg) => {
        pkg.refreshAllowed = true;
      }],
      ["altered stage count", (pkg) => {
        pkg.stageGrants = (pkg.stageGrants as unknown[]).slice(0, 5);
      }],
      ["altered stage order", (pkg) => {
        const grants = [...pkg.stageGrants as unknown[]];
        pkg.stageGrants = [grants[1], grants[0], ...grants.slice(2)];
      }],
      ["altered stage argv", (pkg) => {
        const grants = [...pkg.stageGrants as Array<Record<string, unknown>>];
        grants[0] = { ...grants[0], argv: ["status"] };
        pkg.stageGrants = grants;
      }],
      ["altered stage limit", (pkg) => {
        const grants = [...pkg.stageGrants as Array<Record<string, unknown>>];
        grants[4] = { ...grants[4], stdoutLimitBytes: 1 };
        pkg.stageGrants = grants;
      }],
      ["consumed stage grant", (pkg) => {
        const grants = [...pkg.stageGrants as Array<Record<string, unknown>>];
        grants[0] = { ...grants[0], consumed: true };
        pkg.stageGrants = grants;
      }],
      ["altered initial current stage", (pkg) => {
        pkg.currentStageIndex = 1;
      }],
      ["terminal claim", (pkg) => {
        pkg.terminal = true;
      }],
      ["runtime activation", (pkg, result) => {
        pkg.runtimeActivated = true;
        result.runtimeActivated = true;
      }],
      ["mutation authority", (pkg, result) => {
        pkg.mutationAuthorityGranted = true;
        result.mutationAuthorityGranted = true;
      }],
      ["credential authority", (pkg, result) => {
        pkg.credentialAuthorityGranted = true;
        result.credentialAuthorityGranted = true;
      }],
      ["replay posture claim", (pkg) => {
        pkg.replayDetected = true;
      }],
      ["TOCTOU claim", (pkg, result) => {
        pkg.toctouEliminated = true;
        result.toctouEliminated = true;
      }],
    ];

    for (const [name, mutate] of cases) {
      test(`registration rejects recomputed ${name}`, () => {
        expectRejected(registerForgedPackage(mutate), "authority_package_rejected");
      });
    }
  });

  test("registration rejects nonzero initial transition version", () => {
    expectRejected(transition(registerInput({ initialTransitionVersion: 1 })), "stale_transition_rejected");
  });

  test("claim transitions issued state to active with exact consumer", () => {
    const state = claimState();
    expect(state.state).toBe("active");
    expect(state.activeConsumerId).toBe(consumerId);
    expect(state.activeConsumerFingerprint).toBe(consumerFingerprint);
    expect(state.transitionVersion).toBe(2);
  });

  test("claim rejects second claim", () => {
    const state = claimState();
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "claim_consumer",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId: "dormant-git-authority-consumer-beta-0002",
      consumerFingerprint,
    }), "package_not_claimable");
  });

  test("claim rejects stale transition version", () => {
    const state = registeredState();
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "claim_consumer",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: 99,
      consumerId,
      consumerFingerprint,
    }), "stale_transition_rejected");
  });

  test("claim rejects malformed consumer identity", () => {
    const state = registeredState();
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "claim_consumer",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId: "bad",
      consumerFingerprint,
    }), "consumer_linkage_rejected");
  });

  test("stage consumption records consumed-before-completion posture", () => {
    const claimed = claimState();
    const result = transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "consume_stage",
      observedAt: "2026-07-17T12:00:03.000Z",
      currentState: claimed,
      currentStateFingerprint: claimed.stateFingerprint,
      expectedTransitionVersion: claimed.transitionVersion,
      consumerId,
      consumerFingerprint,
      stageIndex: 0,
      stageGrantFingerprint: claimed.stages[0].stageGrantFingerprint,
      processRequestFingerprint: "0".repeat(64),
    });
    expectSingleAudit(result, 0, "stage_authority_consumed");
    const state = result.nextState!;
    expect(state.state).toBe("partially_consumed");
    expect(state.currentStageIndex).toBe(0);
    expect(state.consumedStageCount).toBe(1);
    expect(state.stages[0].consumed).toBe(true);
    expect(state.stages[0].completionRecorded).toBe(false);
  });

  test("stage consumption rejects wrong stage order", () => {
    const state = claimState();
    const input = {
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "consume_stage",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId,
      consumerFingerprint,
      stageIndex: 1,
      stageGrantFingerprint: state.stages[1].stageGrantFingerprint,
      processRequestFingerprint: "1".repeat(64),
    };
    expectRejected(transition(input), "stage_order_rejected");
  });

  test("stage consumption rejects duplicate consumption", () => {
    const state = consumeStage(claimState(), 0);
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "consume_stage",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId,
      consumerFingerprint,
      stageIndex: 0,
      stageGrantFingerprint: state.stages[0].stageGrantFingerprint,
      processRequestFingerprint: "1".repeat(64),
    }), "stage_already_consumed");
  });

  test("stage consumption rejects wrong consumer", () => {
    const state = claimState();
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "consume_stage",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId: "dormant-git-authority-consumer-other-0003",
      consumerFingerprint,
      stageIndex: 0,
      stageGrantFingerprint: state.stages[0].stageGrantFingerprint,
      processRequestFingerprint: "1".repeat(64),
    }), "consumer_linkage_rejected");
  });

  test("completion advances accepted stage and allows next stage", () => {
    const consumed = consumeStage(claimState(), 0);
    const result = transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "record_stage_completion",
      observedAt: "2026-07-17T12:00:04.000Z",
      currentState: consumed,
      currentStateFingerprint: consumed.stateFingerprint,
      expectedTransitionVersion: consumed.transitionVersion,
      consumerId,
      consumerFingerprint,
      stageIndex: 0,
      processRequestFingerprint: consumed.stages[0].processRequestFingerprint,
      completionFingerprint: "1".repeat(64),
      interpretationFingerprint: "2".repeat(64),
      outcome: "accepted",
    });
    expectSingleAudit(result, 0, "stage_completion_recorded");
    const state = result.nextState!;
    expect(state.currentStageIndex).toBe(1);
    expect(state.stages[0].completionRecorded).toBe(true);
    expect(state.stages[0].outcome).toBe("accepted");
  });

  test("detached completion is accepted only for stage 3", () => {
    const stageZero = consumeStage(claimState(), 0);
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "record_stage_completion",
      observedAt: "2026-07-17T12:00:04.000Z",
      currentState: stageZero,
      currentStateFingerprint: stageZero.stateFingerprint,
      expectedTransitionVersion: stageZero.transitionVersion,
      consumerId,
      consumerFingerprint,
      stageIndex: 0,
      processRequestFingerprint: "0".repeat(64),
      completionFingerprint: "1".repeat(64),
      interpretationFingerprint: "2".repeat(64),
      outcome: "accepted_detached_observation",
    }), "detached_outcome_rejected");
    let state = claimState();
    for (let index = 0; index < 3; index += 1) {
      state = completeStage(consumeStage(state, index as 0 | 1 | 2), "accepted");
    }
    state = completeStage(consumeStage(state, 3), "accepted_detached_observation");
    expect(state.currentStageIndex).toBe(4);
  });

  test("rejected completion terminalizes failed consumed", () => {
    const state = completeStage(consumeStage(claimState(), 0), "rejected");
    expect(state.state).toBe("failed_consumed");
    expect(state.terminal).toBe(true);
    expect(state.activeConsumerId).toBeNull();
  });

  test("ambiguous completion terminalizes ambiguous failed consumed", () => {
    const state = completeStage(consumeStage(claimState(), 0), "ambiguous_process_state");
    expect(state.state).toBe("ambiguous_failed_consumed");
    expect(state.terminalReason).toBe("ambiguous_failed_terminal");
  });

  test("completion rejects before consumption", () => {
    const state = claimState();
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "record_stage_completion",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId,
      consumerFingerprint,
      stageIndex: 0,
      processRequestFingerprint: "0".repeat(64),
      completionFingerprint: "1".repeat(64),
      interpretationFingerprint: "2".repeat(64),
      outcome: "accepted",
    }), "state_transition_rejected");
  });

  test("completion rejects wrong process linkage", () => {
    const state = consumeStage(claimState(), 0);
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "record_stage_completion",
      observedAt: "2026-07-17T12:00:04.000Z",
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId,
      consumerFingerprint,
      stageIndex: 0,
      processRequestFingerprint: "f".repeat(64),
      completionFingerprint: "1".repeat(64),
      interpretationFingerprint: "2".repeat(64),
      outcome: "accepted",
    }), "process_request_linkage_rejected");
  });

  test("aggregate finalization consumes all six accepted stages", () => {
    const state = allAcceptedState();
    const result = transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "finalize_aggregate",
      observedAt: "2026-07-17T12:00:20.000Z",
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId,
      consumerFingerprint,
      aggregateFingerprint: "a".repeat(64),
    });
    expect(result.status).toBe("transition_permitted");
    expect(result.nextState?.state).toBe("consumed");
    expect(result.nextState?.aggregateFingerprint).toBe("a".repeat(64));
  });

  test("aggregate finalization rejects missing completion", () => {
    const state = consumeStage(claimState(), 0);
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "finalize_aggregate",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId,
      consumerFingerprint,
      aggregateFingerprint: "a".repeat(64),
    }), "aggregate_prerequisite_rejected");
  });

  test("expiry terminalizes exactly at expiry boundary", () => {
    const state = claimState();
    const result = transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_expiry",
      observedAt: "2026-07-17T12:00:30.000Z",
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
    });
    expect(result.status).toBe("transition_permitted");
    expect(result.nextState?.state).toBe("expired");
  });

  test("expiry rejects before expiry", () => {
    const state = claimState();
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_expiry",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
    }), "expiry_transition_rejected");
  });

  test("revocation terminalizes non-terminal state", () => {
    const state = claimState();
    const result = transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "revoke_package",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      revocationFingerprint: "b".repeat(64),
      revocationReason: "operator_revoked",
    });
    expect(result.status).toBe("transition_permitted");
    expect(result.nextState?.state).toBe("revoked");
  });

  test("explicit failure terminalization requires consumed stage", () => {
    const state = claimState();
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_failure",
      observedAt,
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId,
      consumerFingerprint,
      failureFingerprint: "c".repeat(64),
    }), "failure_terminalization_rejected");
  });

  test("explicit ambiguous terminalization preserves consumed ambiguity", () => {
    const state = consumeStage(claimState(), 0);
    const result = transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_ambiguous_failure",
      observedAt: "2026-07-17T12:00:05.000Z",
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId,
      consumerFingerprint,
      failureFingerprint: "c".repeat(64),
    });
    expect(result.status).toBe("transition_permitted");
    expect(result.nextState?.state).toBe("ambiguous_failed_consumed");
  });

  test("changed current-state fingerprint rejects", () => {
    const state = claimState();
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_expiry",
      observedAt: "2026-07-17T12:00:30.000Z",
      currentState: state,
      currentStateFingerprint: "e".repeat(64),
      expectedTransitionVersion: state.transitionVersion,
    }), "input_fingerprint_rejected");
  });

  test("state invariant validation rejects count mismatch with recomputed-looking input", () => {
    const state = claimState();
    const forged = { ...state, consumedStageCount: 1 };
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_expiry",
      observedAt: "2026-07-17T12:00:30.000Z",
      currentState: forged,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
    }), "current_state_rejected");
  });

  test("state invariant validation rejects completion without consumption", () => {
    const state = claimState();
    const badStage = { ...state.stages[0], completionRecorded: true, completionFingerprint: "1".repeat(64), outcome: "accepted", reason: "stage_completion_recorded", completedAt: "2026-07-17T12:00:04.000Z" };
    const forged = { ...state, stages: [badStage, ...state.stages.slice(1)] };
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_expiry",
      observedAt: "2026-07-17T12:00:30.000Z",
      currentState: forged,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
    }), "current_state_rejected");
  });

  test("schema rejects unknown input property", () => {
    expectRejected(transition({ ...registerInput(), extra: "nope" }), "input_contract_rejected");
  });

  test("schema rejects non-enumerable input property", () => {
    const input = registerInput();
    Object.defineProperty(input, "hidden", { value: true, enumerable: false });
    expectRejected(transition(input), "input_contract_rejected");
  });

  test("schema rejects symbol property", () => {
    const input = registerInput() as Record<PropertyKey, unknown>;
    input[Symbol("bad")] = true;
    expectRejected(transition(input), "input_contract_rejected");
  });

  test("schema rejects accessor property", () => {
    const input = registerInput();
    Object.defineProperty(input, "observedAt", { get: () => observedAt, enumerable: true });
    expectRejected(transition(input), "input_contract_rejected");
  });

  test("schema rejects inherited enumerable property", () => {
    const input = registerInput();
    const prototype = { inherited: true };
    Object.setPrototypeOf(input, prototype);
    expectRejected(transition(input), "input_contract_rejected");
  });

  test("schema rejects class instance", () => {
    class BadInput {
      readonly inputKind = "pure_dormant_git_authority_consumption_transition_input";
    }
    expectRejected(transition(new BadInput()), "input_contract_rejected");
  });

  test("schema rejects sparse stage array", () => {
    const state = claimState();
    const stages = [...state.stages] as Array<DormantGitAuthorityConsumptionStageState | undefined>;
    delete stages[1];
    const forged = { ...state, stages };
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_expiry",
      observedAt: "2026-07-17T12:00:30.000Z",
      currentState: forged,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
    }), "current_state_rejected");
  });

  test.describe("Action 617 exact stage-array closure", () => {
    const attacks: Array<[string, (stages: DormantGitAuthorityConsumptionStageState[]) => unknown]> = [
      ["extra enumerable property", (stages) => Object.assign(stages, { extra: true })],
      ["extra non-enumerable property", (stages) => {
        Object.defineProperty(stages, "hidden", { value: true, enumerable: false });
        return stages;
      }],
      ["symbol property", (stages) => {
        (stages as unknown as Record<PropertyKey, unknown>)[Symbol("bad")] = true;
        return stages;
      }],
      ["accessor property", (stages) => {
        Object.defineProperty(stages, "metadata", { get: () => true, enumerable: true });
        return stages;
      }],
      ["appended seventh stage", (stages) => [...stages, stages[0]]],
      ["deleted required stage", (stages) => {
        delete (stages as Array<DormantGitAuthorityConsumptionStageState | undefined>)[1];
        return stages;
      }],
      ["reordered stages", (stages) => [stages[1], stages[0], ...stages.slice(2)]],
      ["duplicate stage", (stages) => [stages[0], stages[0], ...stages.slice(2)]],
      ["subclassed array", (stages) => {
        class StageArray<T> extends Array<T> {}
        return StageArray.from(stages);
      }],
      ["exotic prototype", (stages) => {
        Object.setPrototypeOf(stages, {});
        return stages;
      }],
      ["shadowed map", (stages) => {
        Object.defineProperty(stages, "map", { value: () => [], enumerable: true });
        return stages;
      }],
      ["noncanonical numeric key", (stages) => {
        Object.defineProperty(stages, "01", { value: stages[1], enumerable: true });
        return stages;
      }],
    ];

    for (const [name, attack] of attacks) {
      test(`rejects recomputed currentState.stages ${name}`, () => {
        const state = claimState();
        const attackedStages = attack([...state.stages]);
        let forged: DormantGitAuthorityConsumptionCurrentState;
        try {
          forged = rehashCurrentState({ ...state, stages: attackedStages as DormantGitAuthorityConsumptionStageState[] });
        } catch {
          forged = { ...state, stages: attackedStages as DormantGitAuthorityConsumptionStageState[] };
        }
        expectRejected(transition({
          inputKind: "pure_dormant_git_authority_consumption_transition_input",
          inputVersion: 1,
          contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
          boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
          operation: "terminalize_expiry",
          observedAt: "2026-07-17T12:00:30.000Z",
          currentState: forged,
          currentStateFingerprint: forged.stateFingerprint,
          expectedTransitionVersion: forged.transitionVersion,
        }), "current_state_rejected");
      });
    }
  });

  test("state invariant rejects two pending consumed stages with recomputed fingerprint", () => {
    const state = consumeStage(claimState(), 0);
    const secondPending = {
      ...state.stages[1],
      consumed: true,
      consumedAt: "2026-07-17T12:00:05.000Z",
      consumedByFingerprint: consumerFingerprint,
      stageConsumptionFingerprint: "4".repeat(64),
      processRequestFingerprint: "5".repeat(64),
    };
    const forged = rehashCurrentState({
      ...state,
      stages: [state.stages[0], secondPending, ...state.stages.slice(2)],
      consumedStageCount: 2,
      remainingStageCount: 4,
    });
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_expiry",
      observedAt: "2026-07-17T12:00:30.000Z",
      currentState: forged,
      currentStateFingerprint: forged.stateFingerprint,
      expectedTransitionVersion: forged.transitionVersion,
    }), "current_state_rejected");
  });

  test("state invariant rejects terminal failure with later stage progress", () => {
    const failed = completeStage(consumeStage(claimState(), 0), "rejected");
    const later = {
      ...failed.stages[1],
      consumed: true,
      consumedAt: "2026-07-17T12:00:07.000Z",
      consumedByFingerprint: consumerFingerprint,
      stageConsumptionFingerprint: "6".repeat(64),
      processRequestFingerprint: "7".repeat(64),
    };
    const forged = rehashCurrentState({
      ...failed,
      stages: [failed.stages[0], later, ...failed.stages.slice(2)],
      consumedStageCount: 2,
      remainingStageCount: 4,
    });
    expectRejected(transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "terminalize_expiry",
      observedAt: "2026-07-17T12:00:30.000Z",
      currentState: forged,
      currentStateFingerprint: forged.stateFingerprint,
      expectedTransitionVersion: forged.transitionVersion,
    }), "current_state_rejected");
  });

  test("schema rejects caller next-state injection", () => {
    expectRejected(transition({ ...registerInput(), nextState: registeredState() }), "input_contract_rejected");
  });

  test("timestamp grammar rejects offsets and missing milliseconds", () => {
    expectRejected(transition(registerInput({ observedAt: "2026-07-17T12:00:01Z" })), "timestamp_rejected");
    expectRejected(transition(registerInput({ observedAt: "2026-07-17T12:00:01.000+00:00" })), "timestamp_rejected");
  });

  test("fingerprints change when consumer changes", () => {
    const state = registeredState();
    const first = claimState(state);
    const second = transition({
      inputKind: "pure_dormant_git_authority_consumption_transition_input",
      inputVersion: 1,
      contractId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.contractId,
      boundaryId: PURE_DORMANT_GIT_AUTHORITY_CONSUMPTION_TRANSITION_CONTRACT_IDENTITY.boundaryId,
      operation: "claim_consumer",
      observedAt: "2026-07-17T12:00:02.000Z",
      currentState: state,
      currentStateFingerprint: state.stateFingerprint,
      expectedTransitionVersion: state.transitionVersion,
      consumerId: "dormant-git-authority-consumer-gamma-0004",
      consumerFingerprint: "8".repeat(64),
    });
    expect(second.status).toBe("transition_permitted");
    expect(second.nextState?.stateFingerprint).not.toBe(first.stateFingerprint);
  });

  test("output is deeply frozen and isolated from input mutation", () => {
    const input = registerInput();
    const result = transition(input);
    input.consumptionKey = "f".repeat(64);
    expect(result.status).toBe("transition_permitted");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.nextState)).toBe(true);
    expect(Object.isFrozen(result.nextState?.stages)).toBe(true);
    expect(Object.isFrozen(result.auditEvents)).toBe(true);
  });
});
