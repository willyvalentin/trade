import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildPostTradeReadOnlyLivePreflightCanonicalEvidence,
  buildPostTradeReadOnlyLivePreflightEvidenceFingerprint,
  buildPostTradeReadOnlyLivePreflightWorktreeObservationFingerprint,
  buildPostTradeReadOnlyLivePreflightPlan,
  evaluatePostTradeReadOnlyLiveStagingMigrationPreflight,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_DEPLOYMENT_UNIT_ALLOWLIST,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REJECTED_SOURCES,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REQUIRED_EVIDENCE_TYPES,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_TRUSTED_SOURCES,
  POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_UNRELATED_DEPLOYMENT_DENYLIST,
  type PostTradeReadOnlyLivePreflightEvidenceSet,
} from "../../lib/post-trade-read-only-live-staging-migration-preflight-contract";
import {
  POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT,
  POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
  POST_TRADE_STAGING_MIGRATION_FILENAME,
  POST_TRADE_STAGING_MIGRATION_PATH,
  POST_TRADE_STAGING_MIGRATION_PROJECT_REF,
  POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
  POST_TRADE_STAGING_MIGRATION_TARGET_TABLE,
} from "../../lib/post-trade-staging-migration-deployment-gate-core";

const evaluatedAtIso = "2026-07-12T12:00:30.000Z";

function canonical() {
  return buildPostTradeReadOnlyLivePreflightCanonicalEvidence();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function evaluate(input: unknown) {
  return evaluatePostTradeReadOnlyLiveStagingMigrationPreflight(input, evaluatedAtIso);
}

function mutated(
  mutator: (evidence: PostTradeReadOnlyLivePreflightEvidenceSet) => void,
) {
  const evidence = clone(canonical());
  mutator(evidence);
  return evidence;
}

test.describe("post-trade read-only live staging migration preflight contract", () => {
  test("canonical structural evidence can produce a ready hypothetical decision without deployment", () => {
    const evidence = canonical();
    const decision = evaluate(evidence);

    expect(decision.contractId).toBe(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_ID);
    expect(decision.contractVersion).toBe(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_CONTRACT_VERSION);
    expect(decision.blockingReasons).toEqual([]);
    expect(decision.decisionClassification).toBe("ready_for_explicit_staging_deployment_action");
    expect(decision.readyForExplicitStagingDeploymentAction).toBe(true);
    expect(decision.deploymentEnabled).toBe(false);
    expect(decision.deploymentStatus).toBe("not_deployed");
    expect(decision.remoteMutation).toBe(false);
    expect(decision.sqlExecuted).toBe(false);
    expect(decision.migrationsApplied).toBe(0);
    expect(decision.rowsCreated).toBe(0);
    expect(decision.futureRunnerRequired).toBe(true);
    expect(decision.recommendsSeparateExplicitDeploymentAction).toBe(true);
    expect(evidence.collectionSession.targetStagingProjectRef).toBe(POST_TRADE_STAGING_MIGRATION_PROJECT_REF);
    expect(evidence.collectionSession.rejectedProductionProjectRef).toBe(
      POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
    );
  });

  test("contract defines explicit evidence categories, trust sources, rejected sources, and freshness windows", () => {
    expect(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REQUIRED_EVIDENCE_TYPES).toEqual([
      "readiness_artifact",
      "local_migration_content",
      "git_worktree",
      "local_migration_inventory",
      "supabase_project_link",
      "supabase_target_project",
      "remote_migration_history",
      "remote_catalog_schema",
      "remote_privilege_rls_baseline",
      "collection_session_freshness",
    ]);
    expect(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_TRUSTED_SOURCES).toContain("trusted_supabase_catalog_reader_v1");
    expect(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_REJECTED_SOURCES).toEqual(
      expect.arrayContaining(["caller", "manual", "user", "expected_constant", "environment_only", "self_asserted", "unknown"]),
    );
    expect(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.projectIdentity).toBeLessThanOrEqual(2 * 60 * 1000);
    expect(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_FRESHNESS_MS.remoteCatalog).toBeLessThanOrEqual(2 * 60 * 1000);
  });

  test("canonical evidence binds the reviewed readiness artifact and migration identities", () => {
    const evidence = canonical();

    expect(evidence.readinessArtifact.artifactFingerprint).toBe(
      POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_READINESS_ARTIFACT_FINGERPRINT,
    );
    expect(evidence.localMigrationContent.migrationFilename).toBe(POST_TRADE_STAGING_MIGRATION_FILENAME);
    expect(evidence.localMigrationContent.migrationPath).toBe(POST_TRADE_STAGING_MIGRATION_PATH);
    expect(evidence.localMigrationContent.sha256).toBe(POST_TRADE_STAGING_MIGRATION_EXPECTED_FINGERPRINT);
    expect(evidence.localMigrationContent.normalizedSqlByteLength).toBe(
      POST_TRADE_STAGING_MIGRATION_EXPECTED_NORMALIZED_LENGTH,
    );
    expect(evidence.remoteCatalog.targetTableExists).toBe(false);
    expect(evidence.remoteCatalog.referencedExecutionRecordsTableExists).toBe(true);
    expect(evidence.remoteCatalog.referencedAuditEventsTableExists).toBe(true);
  });

  test("plan is read-only, non-executable, and explicitly stops before deployment", () => {
    const plan = buildPostTradeReadOnlyLivePreflightPlan();

    expect(plan.planStatus).toBe("pure_future_runner_plan_only");
    expect(plan.containsExecutableCommands).toBe(false);
    expect(plan.containsSecrets).toBe(false);
    expect(plan.deploymentEnabled).toBe(false);
    expect(plan.remoteMutation).toBe(false);
    expect(plan.sqlExecuted).toBe(false);
    expect(plan.steps).toContain("stop_without_deployment");
    expect(plan.steps).not.toContain("deploy_migration");
    expect(plan.futureRunnerForbiddenCategories).toEqual(
      expect.arrayContaining(["deployment", "database_mutation", "schema_mutation", "migration_repair", "migration_reset"]),
    );
  });

  test("fingerprint builder is deterministic and rejects unsupported or cyclic values", () => {
    const evidence = canonical();
    expect(buildPostTradeReadOnlyLivePreflightEvidenceFingerprint(evidence)).toBe(
      buildPostTradeReadOnlyLivePreflightEvidenceFingerprint(clone(evidence)),
    );
    expect(() => buildPostTradeReadOnlyLivePreflightEvidenceFingerprint(new Date())).toThrow(
      /Unsupported evidence value/,
    );
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => buildPostTradeReadOnlyLivePreflightEvidenceFingerprint(cyclic)).toThrow(
      /Cyclic evidence value/,
    );
  });

  test("unrelated deployment denylist can be present outside scope but never inside deployment unit", () => {
    const allowedOutside = mutated((evidence) => {
      evidence.worktree.unrelatedFilesPresentButExcluded = [
        "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
        "docs/action-367-read-only-dependency-bridge-capability-verification.md",
      ];
      evidence.worktree.scopeClassification = "unrelated_changes_present_but_excluded";
      evidence.worktree.normalizedWorktreeFingerprint =
        buildPostTradeReadOnlyLivePreflightWorktreeObservationFingerprint(evidence.worktree);
    });
    const decision = evaluate(allowedOutside);
    expect(decision.blockingReasons).toEqual([]);
    expect(decision.readyForExplicitStagingDeploymentAction).toBe(true);

    expect(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_DEPLOYMENT_UNIT_ALLOWLIST).toEqual([
      POST_TRADE_STAGING_MIGRATION_PATH,
    ]);
    expect(POST_TRADE_READ_ONLY_LIVE_PREFLIGHT_UNRELATED_DEPLOYMENT_DENYLIST).toEqual(
      expect.arrayContaining([
        "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
        "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
        "scripts/action-320-static-replay-branch-package-verify.mjs",
        "scripts/action-366-corrected-immutable-preview-candidate-preparation-approval-gate-verify.mjs",
        "docs/action-367-read-only-dependency-bridge-capability-verification.md",
        "docs/action-368-isolated-dependency-materialization-strategy-approval-gate.md",
        "docs/action-369-copy-on-write-dependency-clone-capability-verification.md",
      ]),
    );
  });

  const blockingCases: {
    name: string;
    mutate: (evidence: PostTradeReadOnlyLivePreflightEvidenceSet) => void;
    reason: string;
    classification?: string;
  }[] = [
    {
      name: "collection session is required",
      mutate: (evidence) => {
        delete (evidence as unknown as Record<string, unknown>).collectionSession;
      },
      reason: "malformed_evidence",
      classification: "invalid",
    },
    {
      name: "session completion before start is blocked",
      mutate: (evidence) => {
        evidence.collectionSession.collectionStartedAtIso = "2026-07-12T12:01:00.000Z";
        evidence.collectionSession.collectionCompletedAtIso = "2026-07-12T12:00:00.000Z";
      },
      reason: "malformed_evidence",
    },
    {
      name: "stale session is blocked",
      mutate: (evidence) => {
        evidence.collectionSession.collectionStartedAtIso = "2026-07-12T11:00:00.000Z";
        evidence.collectionSession.collectionCompletedAtIso = "2026-07-12T11:00:01.000Z";
      },
      reason: "evidence_stale",
      classification: "stale",
    },
    {
      name: "future session is blocked",
      mutate: (evidence) => {
        evidence.collectionSession.collectionStartedAtIso = "2026-07-12T12:05:00.000Z";
        evidence.collectionSession.collectionCompletedAtIso = "2026-07-12T12:05:01.000Z";
      },
      reason: "future_dated_evidence",
    },
    {
      name: "evidence before session start is blocked",
      mutate: (evidence) => {
        evidence.collectionSession.collectionStartedAtIso = "2026-07-12T12:00:10.000Z";
        evidence.remoteCatalog.observedAtIso = "2026-07-12T12:00:00.000Z";
      },
      reason: "mixed_collection_sessions",
    },
    {
      name: "evidence after session completion is blocked",
      mutate: (evidence) => {
        evidence.collectionSession.collectionCompletedAtIso = "2026-07-12T12:00:10.000Z";
        evidence.remoteCatalog.observedAtIso = "2026-07-12T12:00:20.000Z";
      },
      reason: "mixed_collection_sessions",
    },
    {
      name: "empty session id is blocked",
      mutate: (evidence) => {
        evidence.collectionSession.preflightSessionId = "";
      },
      reason: "malformed_evidence",
      classification: "invalid",
    },
    {
      name: "unknown collector version is blocked",
      mutate: (evidence) => {
        evidence.collectionSession.collectorVersion = "unknown_collector" as never;
      },
      reason: "malformed_evidence",
      classification: "invalid",
    },
    {
      name: "source and evidence category mismatch is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.sourceIdentity = "trusted_supabase_migration_list_runner_v1" as never;
      },
      reason: "source_untrusted",
    },
    {
      name: "generic caller source is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.sourceIdentity = "caller" as never;
      },
      reason: "source_untrusted",
    },
    {
      name: "generic manual source is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.sourceIdentity = "manual" as never;
      },
      reason: "source_untrusted",
    },
    {
      name: "source name alone does not prove authority",
      mutate: (evidence) => {
        evidence.remoteCatalog.authoritative = false;
      },
      reason: "evidence_not_authoritative",
    },
    {
      name: "missing envelope field is blocked",
      mutate: (evidence) => {
        delete (evidence.remoteCatalog as unknown as Record<string, unknown>).evidenceId;
      },
      reason: "evidence_incomplete",
    },
    {
      name: "unknown envelope field is blocked",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).algorithm = "sha256";
      },
      reason: "malformed_evidence",
    },
    {
      name: "null envelope field is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.evidenceId = null as never;
      },
      reason: "evidence_incomplete",
    },
    {
      name: "partial fingerprint is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.evidenceFingerprint = "a".repeat(32);
      },
      reason: "malformed_evidence",
    },
    {
      name: "prefix fingerprint is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.evidenceFingerprint = `${"a".repeat(64)}extra`;
      },
      reason: "malformed_evidence",
    },
    {
      name: "unknown algorithm field is blocked",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).fingerprintAlgorithm = "md5";
      },
      reason: "malformed_evidence",
    },
    {
      name: "changed structured observation invalidates its structured fingerprint",
      mutate: (evidence) => {
        evidence.remoteCatalog.targetTableExists = true;
      },
      reason: "malformed_evidence",
    },
    {
      name: "raw-output hash without structured observations is insufficient",
      mutate: (evidence) => {
        evidence.projectLink.observedProjectRef = null;
        evidence.projectLink.linkedProjectRef = null;
      },
      reason: "project_not_staging",
    },
    {
      name: "Map is blocked",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).catalogEvidenceFingerprint = new Map();
      },
      reason: "unsupported_evidence_value",
    },
    {
      name: "Set is blocked",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).catalogEvidenceFingerprint = new Set();
      },
      reason: "unsupported_evidence_value",
    },
    {
      name: "function value is blocked",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).catalogEvidenceFingerprint =
          (() => "nope") as never;
      },
      reason: "unsupported_evidence_value",
    },
    {
      name: "symbol value is blocked",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).catalogEvidenceFingerprint =
          Symbol("nope") as never;
      },
      reason: "unsupported_evidence_value",
    },
    {
      name: "self-asserted expected project is insufficient",
      mutate: (evidence) => {
        evidence.projectLink.sourceIdentity = "expected_constant" as never;
      },
      reason: "source_untrusted",
    },
    {
      name: "missing readiness artifact is blocked",
      mutate: (evidence) => {
        delete (evidence as Partial<PostTradeReadOnlyLivePreflightEvidenceSet>).readinessArtifact;
      },
      reason: "readiness_artifact_missing",
      classification: "invalid",
    },
    {
      name: "invalid readiness artifact is blocked",
      mutate: (evidence) => {
        evidence.readinessArtifact.artifactState = "invalid";
      },
      reason: "readiness_artifact_invalid",
    },
    {
      name: "expired readiness artifact is blocked",
      mutate: (evidence) => {
        evidence.readinessArtifact.artifactState = "expired";
      },
      reason: "readiness_artifact_expired",
    },
    {
      name: "consumed readiness artifact is blocked",
      mutate: (evidence) => {
        evidence.readinessArtifact.artifactState = "consumed";
      },
      reason: "readiness_artifact_consumed",
    },
    {
      name: "artifact fingerprint mismatch is blocked",
      mutate: (evidence) => {
        evidence.readinessArtifact.artifactFingerprint = "a".repeat(64) as never;
      },
      reason: "artifact_fingerprint_mismatch",
    },
    {
      name: "migration fingerprint mismatch is blocked",
      mutate: (evidence) => {
        evidence.localMigrationContent.sha256 = "b".repeat(64);
      },
      reason: "migration_fingerprint_mismatch",
    },
    {
      name: "mixed collection sessions are blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.collectionSessionId = "different_session";
      },
      reason: "mixed_collection_sessions",
    },
    {
      name: "stale project evidence is blocked",
      mutate: (evidence) => {
        evidence.projectLink.expiresAtIso = "2026-07-12T11:59:00.000Z";
      },
      reason: "evidence_stale",
      classification: "stale",
    },
    {
      name: "stale worktree evidence is blocked",
      mutate: (evidence) => {
        evidence.worktree.expiresAtIso = "2026-07-12T11:59:00.000Z";
      },
      reason: "evidence_stale",
    },
    {
      name: "stale migration evidence is blocked",
      mutate: (evidence) => {
        evidence.localMigrationContent.expiresAtIso = "2026-07-12T11:59:00.000Z";
      },
      reason: "evidence_stale",
    },
    {
      name: "stale history evidence is blocked",
      mutate: (evidence) => {
        evidence.remoteMigrationHistory.expiresAtIso = "2026-07-12T11:59:00.000Z";
      },
      reason: "evidence_stale",
    },
    {
      name: "stale catalog evidence is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.expiresAtIso = "2026-07-12T11:59:00.000Z";
      },
      reason: "evidence_stale",
    },
    {
      name: "future-dated evidence is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.observedAtIso = "2026-07-12T12:05:00.000Z";
      },
      reason: "future_dated_evidence",
    },
    {
      name: "untrusted evidence source is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.sourceIdentity = "unknown" as never;
      },
      reason: "source_untrusted",
    },
    {
      name: "self-asserted source is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.sourceIdentity = "self_asserted" as never;
      },
      reason: "source_untrusted",
    },
    {
      name: "incomplete evidence is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.complete = false;
      },
      reason: "evidence_incomplete",
    },
    {
      name: "non-authoritative evidence is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.authoritative = false;
      },
      reason: "evidence_not_authoritative",
    },
    {
      name: "non-read-only evidence is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.readOnly = false;
      },
      reason: "evidence_not_read_only",
    },
    {
      name: "malformed evidence fingerprint is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.evidenceFingerprint = "not-a-fingerprint";
      },
      reason: "malformed_evidence",
    },
    {
      name: "production project is blocked",
      mutate: (evidence) => {
        evidence.targetProject.observedProjectRef = POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF;
        evidence.targetProject.agreementClassification = "production_match";
      },
      reason: "production_project_detected",
    },
    {
      name: "alternate project is blocked",
      mutate: (evidence) => {
        evidence.projectLink.observedProjectRef = "aaaaaaaaaaaaaaaaaaaa";
        evidence.projectLink.agreementClassification = "alternate_project";
      },
      reason: "project_not_staging",
    },
    {
      name: "malformed project ref is blocked",
      mutate: (evidence) => {
        evidence.projectLink.observedProjectRef = "not-a-ref";
      },
      reason: "malformed_evidence",
    },
    {
      name: "project whitespace variant is blocked",
      mutate: (evidence) => {
        evidence.targetProject.observedProjectRef = `${POST_TRADE_STAGING_MIGRATION_PROJECT_REF} `;
      },
      reason: "malformed_evidence",
    },
    {
      name: "project case variant is blocked",
      mutate: (evidence) => {
        evidence.targetProject.observedProjectRef =
          POST_TRADE_STAGING_MIGRATION_PROJECT_REF.toUpperCase();
      },
      reason: "malformed_evidence",
    },
    {
      name: "missing linked project is blocked",
      mutate: (evidence) => {
        evidence.projectLink.linkedProjectRef = null;
        evidence.projectLink.linkState = "not_linked";
        evidence.projectLink.agreementClassification = "no_linked_project";
      },
      reason: "project_not_staging",
    },
    {
      name: "conflicting project refs are blocked",
      mutate: (evidence) => {
        evidence.projectLink.observedProjectRef = "aaaaaaaaaaaaaaaaaaaa";
      },
      reason: "project_evidence_conflicting",
    },
    {
      name: "environment-only project assertion is blocked",
      mutate: (evidence) => {
        evidence.projectLink.sourceIdentity = "environment_only" as never;
      },
      reason: "source_untrusted",
    },
    {
      name: "exact migration file is required",
      mutate: (evidence) => {
        evidence.localMigrationContent.migrationPath = "supabase/migrations/20260710000000_other.sql" as never;
      },
      reason: "reviewed_migration_missing",
    },
    {
      name: "symlink migration is blocked",
      mutate: (evidence) => {
        evidence.localMigrationContent.symlinkStatus = "symlink";
      },
      reason: "unsafe_path",
    },
    {
      name: "non-regular migration file is blocked",
      mutate: (evidence) => {
        evidence.localMigrationContent.regularFileStatus = "not_regular_file";
      },
      reason: "unsafe_path",
    },
    {
      name: "duplicate migration path is blocked",
      mutate: (evidence) => {
        evidence.localMigrationContent.duplicatePathStatus = "duplicate_path";
      },
      reason: "unsafe_path",
    },
    {
      name: "changed byte length is blocked",
      mutate: (evidence) => {
        evidence.localMigrationContent.normalizedSqlByteLength = 1 as never;
      },
      reason: "migration_content_mismatch",
    },
    {
      name: "raw byte-length mismatch is blocked",
      mutate: (evidence) => {
        evidence.localMigrationContent.fileByteLength = 1;
      },
      reason: "migration_content_mismatch",
    },
    {
      name: "changed statement inventory is blocked",
      mutate: (evidence) => {
        evidence.localMigrationContent.statementInventory = {
          ...evidence.localMigrationContent.statementInventory,
          createTable: 2,
        } as never;
      },
      reason: "migration_content_mismatch",
    },
    {
      name: "target migration must exist exactly once",
      mutate: (evidence) => {
        evidence.localMigrationInventory.targetMigrationPresence = "missing";
      },
      reason: "reviewed_migration_missing",
    },
    {
      name: "duplicate migration timestamp is blocked",
      mutate: (evidence) => {
        evidence.localMigrationInventory.duplicateTimestamps = ["20260710000000"];
      },
      reason: "extra_migration_included",
    },
    {
      name: "duplicate migration filename is blocked",
      mutate: (evidence) => {
        evidence.localMigrationInventory.duplicateNames = [POST_TRADE_STAGING_MIGRATION_FILENAME];
      },
      reason: "extra_migration_included",
    },
    {
      name: "extra migration in deployment unit is blocked",
      mutate: (evidence) => {
        evidence.localMigrationInventory.migrationCountInProposedDeploymentUnit = 2;
      },
      reason: "extra_migration_included",
    },
    {
      name: "unexpected unapplied migration that would be deployed is blocked",
      mutate: (evidence) => {
        evidence.localMigrationInventory.migrationsNewerThanTarget = [
          "20260711000000_unreviewed.sql",
        ];
      },
      reason: "extra_migration_included",
    },
    {
      name: "invalid migration ordering is blocked",
      mutate: (evidence) => {
        evidence.localMigrationInventory.orderingClassification = "invalid";
      },
      reason: "extra_migration_included",
    },
    {
      name: "target already applied is classified separately",
      mutate: (evidence) => {
        evidence.remoteMigrationHistory.targetMigrationAppliedStatus = "already_applied";
        evidence.remoteMigrationHistory.resultClassification = "target_already_applied";
      },
      reason: "migration_already_applied",
      classification: "already_applied",
    },
    {
      name: "migration-history divergence is blocked",
      mutate: (evidence) => {
        evidence.remoteMigrationHistory.migrationDivergenceStatus = "diverged";
        evidence.remoteMigrationHistory.resultClassification = "remote_history_diverged";
      },
      reason: "remote_migration_history_divergence",
    },
    {
      name: "unexpected remote migration is blocked",
      mutate: (evidence) => {
        evidence.remoteMigrationHistory.remoteOnlyMigrationStatus = "unexpected_remote_migration";
        evidence.remoteMigrationHistory.resultClassification = "unexpected_remote_migration";
      },
      reason: "unexpected_remote_migration",
    },
    {
      name: "missing prerequisite migration is blocked",
      mutate: (evidence) => {
        evidence.remoteMigrationHistory.orderingConsistency = "missing_prerequisite";
        evidence.remoteMigrationHistory.resultClassification = "missing_prerequisite_migration";
      },
      reason: "missing_prerequisite_migration",
    },
    {
      name: "incomplete migration history is ambiguous",
      mutate: (evidence) => {
        evidence.remoteMigrationHistory.resultClassification = "ambiguous_history";
      },
      reason: "ambiguous_result",
      classification: "ambiguous",
    },
    {
      name: "target table already exists is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.targetTableExists = true;
        evidence.remoteCatalog.resultClassification = "table_already_exists";
      },
      reason: "target_relation_already_exists",
    },
    {
      name: "conflicting view is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.conflictingRelationKind = "view";
      },
      reason: "conflicting_remote_object",
    },
    {
      name: "conflicting materialized view is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.conflictingRelationKind = "materialized_view";
      },
      reason: "conflicting_remote_object",
    },
    {
      name: "conflicting type is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.conflictingRelationKind = "type";
      },
      reason: "conflicting_remote_object",
    },
    {
      name: "referenced execution-records table missing is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.referencedExecutionRecordsTableExists = false;
      },
      reason: "referenced_dependency_missing",
    },
    {
      name: "referenced audit-events table missing is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.referencedAuditEventsTableExists = false;
      },
      reason: "referenced_dependency_missing",
    },
    {
      name: "referenced PK missing is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.referencedPrimaryKeyColumnsExist = false;
      },
      reason: "referenced_dependency_missing",
    },
    {
      name: "referenced PK type mismatch is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.referencedPrimaryKeyTypesMatchUuid = false;
      },
      reason: "foreign_key_type_mismatch",
    },
    {
      name: "catalog ambiguity is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.resultClassification = "ambiguous_catalog";
      },
      reason: "ambiguous_result",
    },
    {
      name: "missing catalog evidence is not treated as absence",
      mutate: (evidence) => {
        delete (evidence as Partial<PostTradeReadOnlyLivePreflightEvidenceSet>).remoteCatalog;
      },
      reason: "malformed_evidence",
    },
    {
      name: "target policy already exists is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.targetPoliciesExist = true;
      },
      reason: "conflicting_remote_object",
    },
    {
      name: "target function already exists is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.targetFunctionOrTriggerExists = true;
      },
      reason: "conflicting_remote_object",
    },
    {
      name: "missing UUID-generation capability is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.uuidGenerationAvailable = false;
      },
      reason: "referenced_dependency_missing",
    },
    {
      name: "missing privilege evidence is blocked",
      mutate: (evidence) => {
        delete (evidence as Partial<PostTradeReadOnlyLivePreflightEvidenceSet>)
          .remotePrivilegeBaseline;
      },
      reason: "malformed_evidence",
    },
    {
      name: "unexpected anon grant is blocked",
      mutate: (evidence) => {
        evidence.remotePrivilegeBaseline.anonGrantsClassification = "too_broad";
      },
      reason: "conflicting_remote_object",
    },
    {
      name: "unexpected authenticated grant is blocked",
      mutate: (evidence) => {
        evidence.remotePrivilegeBaseline.authenticatedGrantsClassification = "too_broad";
      },
      reason: "conflicting_remote_object",
    },
    {
      name: "service-role risk is not marked eliminated",
      mutate: (evidence) => {
        evidence.remotePrivilegeBaseline.serviceRoleConsideration =
          "service_role_risk_eliminated" as never;
      },
      reason: "conflicting_remote_object",
    },
    {
      name: "git conflict is blocked",
      mutate: (evidence) => {
        evidence.worktree.conflictedFiles = [POST_TRADE_STAGING_MIGRATION_PATH];
      },
      reason: "worktree_scope_mismatch",
    },
    {
      name: "deployment allowlist mismatch is blocked",
      mutate: (evidence) => {
        evidence.worktree.deploymentUnitFiles = ["supabase/migrations/20260710000000_other.sql"];
      },
      reason: "worktree_scope_mismatch",
    },
    {
      name: "file in allowlist and denylist is blocked",
      mutate: (evidence) => {
        evidence.worktree.deploymentUnitFiles = [
          "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
        ];
      },
      reason: "worktree_scope_mismatch",
    },
    ...[
      "scripts/action-366-corrected-immutable-preview-candidate-preparation-approval-gate-verify.mjs",
      "docs/action-367-read-only-dependency-bridge-capability-verification.md",
      "docs/action-368-isolated-dependency-materialization-strategy-approval-gate.md",
      "docs/action-369-copy-on-write-dependency-clone-capability-verification.md",
      "scripts/action-318-static-replay-batch-commit-readiness-verify.mjs",
      "scripts/action-319-static-replay-batch-post-commit-verify.mjs",
      "scripts/action-320-static-replay-branch-package-verify.mjs",
    ].map((path) => ({
      name: `${path} cannot enter deployment unit`,
      mutate: (evidence: PostTradeReadOnlyLivePreflightEvidenceSet) => {
        evidence.worktree.deploymentUnitFiles = [path];
      },
      reason: "worktree_scope_mismatch",
    })),
    {
      name: "renamed target migration is blocked",
      mutate: (evidence) => {
        evidence.worktree.renamedFiles = [POST_TRADE_STAGING_MIGRATION_PATH];
      },
      reason: "worktree_scope_mismatch",
    },
    {
      name: "deleted target migration is blocked",
      mutate: (evidence) => {
        evidence.worktree.deletedFiles = [POST_TRADE_STAGING_MIGRATION_PATH];
      },
      reason: "reviewed_migration_missing",
    },
    {
      name: "unsafe path is blocked",
      mutate: (evidence) => {
        evidence.worktree.deploymentUnitFiles = ["Supabase/Migrations/file.sql"];
      },
      reason: "unsafe_path",
    },
    {
      name: "absolute path is blocked",
      mutate: (evidence) => {
        evidence.worktree.deploymentUnitFiles = ["/tmp/file.sql"];
      },
      reason: "unsafe_path",
    },
    {
      name: "traversal path is blocked",
      mutate: (evidence) => {
        evidence.worktree.deploymentUnitFiles = ["supabase/migrations/../other.sql"];
      },
      reason: "unsafe_path",
    },
    {
      name: "symlink ambiguity is blocked",
      mutate: (evidence) => {
        evidence.worktree.symlinkPaths = [POST_TRADE_STAGING_MIGRATION_PATH];
      },
      reason: "ambiguous_result",
    },
    {
      name: "duplicate path is blocked",
      mutate: (evidence) => {
        evidence.worktree.deploymentUnitFiles = [
          POST_TRADE_STAGING_MIGRATION_PATH,
          POST_TRADE_STAGING_MIGRATION_PATH,
        ];
      },
      reason: "worktree_scope_mismatch",
    },
    {
      name: "control-character path is blocked",
      mutate: (evidence) => {
        evidence.worktree.deploymentUnitFiles = [`${POST_TRADE_STAGING_MIGRATION_PATH}\n`];
      },
      reason: "unsafe_path",
    },
    {
      name: "NUL path is blocked",
      mutate: (evidence) => {
        evidence.worktree.deploymentUnitFiles = [`${POST_TRADE_STAGING_MIGRATION_PATH}\u0000`];
      },
      reason: "unsafe_path",
    },
    {
      name: "unknown nested field is blocked",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).surprise = true;
      },
      reason: "malformed_evidence",
    },
    {
      name: "unsupported nested value is blocked",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).catalogEvidenceFingerprint =
          new Date();
      },
      reason: "unsupported_evidence_value",
      classification: "invalid",
    },
    {
      name: "nested production ref is blocked",
      mutate: (evidence) => {
        evidence.remoteMigrationHistory.remoteAppliedMigrationIdentifiers = [
          POST_TRADE_STAGING_MIGRATION_REJECTED_PRODUCTION_REF,
        ];
      },
      reason: "production_project_detected",
    },
    {
      name: "production URL is blocked",
      mutate: (evidence) => {
        evidence.remoteCatalog.catalogEvidenceFingerprint =
          "https://production.example.invalid" as never;
      },
      reason: "production_project_detected",
    },
    {
      name: "evidence from unknown parser version is blocked",
      mutate: (evidence) => {
        evidence.localMigrationContent.normalizationContractVersion = "unknown_parser" as never;
      },
      reason: "migration_content_mismatch",
    },
    {
      name: "truncated output classification is ambiguous",
      mutate: (evidence) => {
        evidence.projectLink.agreementClassification = "ambiguous_project";
      },
      reason: "ambiguous_result",
    },
    {
      name: "timed-out collection is ambiguous",
      mutate: (evidence) => {
        evidence.worktree.scopeClassification = "ambiguous_evidence";
      },
      reason: "ambiguous_result",
    },
    {
      name: "missing raw-output fingerprint is blocked",
      mutate: (evidence) => {
        evidence.projectLink.rawOutputFingerprint = "";
      },
      reason: "malformed_evidence",
    },
    {
      name: "access token field is rejected",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).accessToken = "redacted";
      },
      reason: "secret_material_detected",
    },
    {
      name: "service-role key field is rejected",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).serviceRoleKey = "redacted";
      },
      reason: "secret_material_detected",
    },
    {
      name: "password field is rejected",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).password = "redacted";
      },
      reason: "secret_material_detected",
    },
    {
      name: "environment dump field is rejected",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).environmentDump = {};
      },
      reason: "secret_material_detected",
    },
    {
      name: "database password field is rejected",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).databasePassword =
          "redacted";
      },
      reason: "secret_material_detected",
    },
    {
      name: "connection string field is rejected",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).connectionString =
          "postgres://redacted";
      },
      reason: "secret_material_detected",
    },
    {
      name: "authorization header field is rejected",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).authorizationHeader =
          "Bearer redacted";
      },
      reason: "secret_material_detected",
    },
    {
      name: "private key field is rejected",
      mutate: (evidence) => {
        (evidence.remoteCatalog as unknown as Record<string, unknown>).privateKey =
          "redacted";
      },
      reason: "secret_material_detected",
    },
    {
      name: "personal path field is rejected as unsafe deployment path",
      mutate: (evidence) => {
        evidence.worktree.deploymentUnitFiles = ["/users/person/project/file.sql"];
      },
      reason: "unsafe_path",
    },
  ];

  for (const { name, mutate, reason, classification } of blockingCases) {
    test(name, () => {
      const decision = evaluate(mutated(mutate));

      expect(decision.readyForExplicitStagingDeploymentAction).toBe(false);
      expect(decision.deploymentEnabled).toBe(false);
      expect(decision.remoteMutation).toBe(false);
      expect(decision.sqlExecuted).toBe(false);
      expect(decision.migrationsApplied).toBe(0);
      expect(decision.rowsCreated).toBe(0);
      expect(decision.blockingReasons).toContain(reason);
      if (classification) expect(decision.decisionClassification).toBe(classification);
    });
  }

  test("cyclic input is blocked by evaluator as unsupported evidence", () => {
    const evidence = canonical() as unknown as Record<string, unknown>;
    evidence.self = evidence;
    const decision = evaluate(evidence);

    expect(decision.readyForExplicitStagingDeploymentAction).toBe(false);
    expect(decision.blockingReasons).toContain("unsupported_evidence_value");
  });

  test("generic verified booleans are insufficient because unknown fields are rejected", () => {
    const evidence = canonical() as unknown as Record<string, unknown>;
    evidence.verified = true;

    const decision = evaluate(evidence);

    expect(decision.readyForExplicitStagingDeploymentAction).toBe(false);
    expect(decision.blockingReasons).toContain("malformed_evidence");
  });

  test("source contains no runner, deployment, SQL execution, or state-mutation implementation", () => {
    const source = readFileSync(
      join(process.cwd(), "lib/post-trade-read-only-live-staging-migration-preflight-contract.ts"),
      "utf8",
    );

    expect(source).not.toMatch(/child_process|spawn\s*\(|execFile\s*\(|exec\s*\(/);
    expect(source).not.toMatch(/@supabase\/supabase-js|createClient|getPostTradeStagingServiceClient/);
    expect(source).not.toMatch(/\.(insert|delete|upsert|rpc|storage)\s*\(/);
    expect(source).not.toMatch(/supabase\s+db|migration\s+repair|migration\s+reset|db\s+push/);
    expect(source).not.toMatch(/fs\.write|writeFile|appendFile|unlink|rmSync/);
  });

  test("contract is not wired into API route or Trade UI", () => {
    const routeSource = readFileSync(
      join(process.cwd(), "app/api/post-trade/payload/validate/route.ts"),
      "utf8",
    );
    const tradeUiSource = readFileSync(join(process.cwd(), "app/trade-app.tsx"), "utf8");

    expect(routeSource).not.toContain("post-trade-read-only-live-staging-migration-preflight-contract");
    expect(tradeUiSource).not.toContain("post-trade-read-only-live-staging-migration-preflight-contract");
    expect(tradeUiSource).not.toContain(POST_TRADE_STAGING_MIGRATION_TARGET_TABLE);
  });
});
