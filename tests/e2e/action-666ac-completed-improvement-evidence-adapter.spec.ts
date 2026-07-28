import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

import goldenReport from "@/docs/action-666ac-golden-improvement-adapter-report.json";
import {
  action666acDuplicateExperimentIdentityBundle,
  action666acEmptyPreviousBindingLookup,
  action666acGoldenScenarios,
  action666acMappedBundle,
  action666acMappedBundleDigest,
  action666acMetricInventoryDriftBundle,
  action666acMissingMembershipBundle,
  action666acModelVersionDriftBundle,
  action666acNoChangeBundle,
  action666acOutcomeLineageConflictBundle,
  action666acPointInTimeViolationBundle,
  action666acPreviousBindingCollisionLookup,
  action666acReorderedBundle,
  action666acTamperedDigestRequest,
  action666acTrustRootSubstitutionBundle,
} from "@/lib/server/canonical-model-improvement-input-adapter-fixtures";
import {
  CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
  CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION,
  DEFAULT_OFF_IMPROVEMENT_REPLAY_ENABLED,
  DEFAULT_OFF_IMPROVEMENT_REPLAY_KILL_SWITCH_ENGAGED,
  canonicalCompletedImprovementEvidenceBundleDigest,
  createCanonicalImprovementProposalReplayHarness,
  projectCanonicalCompletedImprovementEvidence,
  verifyCanonicalImprovementReplayResult,
  type CanonicalCompletedImprovementAdapterCounters,
  type CanonicalImprovementReplayResult,
} from "@/lib/server/canonical-model-improvement-input-adapter";
import {
  canonicalModelImprovementDigest,
} from "@/lib/server/canonical-model-improvement-proposal";

function zeroCounters(): CanonicalCompletedImprovementAdapterCounters {
  return {
    request_reads: 0,
    clones: 0,
    registry_lookups: 0,
    previous_binding_lookups: 0,
    upstream_verifications: 0,
    proposal_builds: 0,
    replay_attempts: 0,
    input_digests: 0,
  };
}

function project(
  bundle = action666acMappedBundle,
  previousBindingLookup = action666acEmptyPreviousBindingLookup,
) {
  return projectCanonicalCompletedImprovementEvidence(bundle, {
    previous_binding_lookup: previousBindingLookup,
  });
}

function replay(
  bundle = action666acMappedBundle,
  previousBindingLookup = action666acEmptyPreviousBindingLookup,
) {
  const harness = createCanonicalImprovementProposalReplayHarness({
    enabled: true,
    kill_switch_engaged: false,
    previous_binding_lookup: previousBindingLookup,
  });
  if (!harness.replay) throw new Error("action_666ac_harness_not_ready");
  return harness.replay({
    bundle,
    expected_bundle_digest:
      canonicalCompletedImprovementEvidenceBundleDigest(bundle),
  });
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
}

test.describe("Action 666AC completed improvement evidence adapter", () => {
  test("golden matrix maps, conflicts, or rejects missing joins deterministically", () => {
    for (const scenario of action666acGoldenScenarios) {
      const result = projectCanonicalCompletedImprovementEvidence(
        scenario.bundle,
        {
          previous_binding_lookup: scenario.previous_binding_lookup,
        },
      );
      expect(
        result.status,
        `${scenario.name}:${result.reason_codes.join(",")}`,
      ).toBe(scenario.expected_mapping_status);
      expect(result.mapping?.proposal_result.status ?? null).toBe(
        scenario.expected_proposal_status,
      );
    }
  });

  test("complete evidence maps through canonical 664-666 replay and proposal build", () => {
    const result = project();
    expect(result).toMatchObject({
      status: "mapped",
      reason_codes: [],
      shadow_only: true,
      live_ranking_effect: false,
      automatic_training_allowed: false,
      automatic_parameter_change_allowed: false,
      automatic_threshold_change_allowed: false,
      automatic_model_change_allowed: false,
      automatic_promotion_allowed: false,
      causal_improvement_claimed: false,
      mapping: {
        adapter_version:
          CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
        bundle_digest: action666acMappedBundleDigest,
        proposal_result: { status: "proposal_ready" },
      },
    });
    expect(result.mapping?.mapping_digest).toMatch(/^[a-f0-9]{64}$/);
  });

  test("different conflicting inputs with the same reasons have distinct replay provenance", () => {
    const firstBundle = action666acMetricInventoryDriftBundle();
    const secondBundle = action666acMetricInventoryDriftBundle();
    secondBundle.bundle_identity =
      "action-666ac:conflicting:metric-inventory:second";
    const first = replay(firstBundle);
    const second = replay(secondBundle);
    expect(first.status).toBe("conflicting");
    expect(second.status).toBe("conflicting");
    expect(second.reason_codes).toEqual(first.reason_codes);
    expect(second.input_projection.observed_bundle_digest).not.toBe(
      first.input_projection.observed_bundle_digest,
    );
    expect(second.input_projection.projection_digest).not.toBe(
      first.input_projection.projection_digest,
    );
    expect(second.replay_digest).not.toBe(first.replay_digest);
  });

  test("different unmappable inputs with the same reasons have distinct replay provenance", () => {
    const firstBundle = action666acMissingMembershipBundle();
    const secondBundle = action666acMissingMembershipBundle();
    secondBundle.bundle_identity =
      "action-666ac:unmappable:missing-membership:second";
    const first = replay(firstBundle);
    const second = replay(secondBundle);
    expect(first.status).toBe("unmappable");
    expect(second.status).toBe("unmappable");
    expect(second.reason_codes).toEqual(first.reason_codes);
    expect(second.input_projection.observed_bundle_digest).not.toBe(
      first.input_projection.observed_bundle_digest,
    );
    expect(second.replay_digest).not.toBe(first.replay_digest);
  });

  test("explicit no-change is mapped but never becomes an executable change", () => {
    const result = project(action666acNoChangeBundle);
    expect(result).toMatchObject({
      status: "mapped",
      mapping: {
        proposal_result: {
          status: "no_change",
          proposal: {
            proposal_type: "no_change",
            experiment_plan: null,
            automatic_promotion_allowed: false,
          },
        },
      },
    });
  });

  test("missing opportunity membership and missing producer fields are unmappable", () => {
    expect(project(action666acMissingMembershipBundle())).toMatchObject({
      status: "unmappable",
      mapping: null,
      reason_codes: ["opportunity_membership_incomplete"],
    });
    expect(
      projectCanonicalCompletedImprovementEvidence(
        {
          bundle_version:
            CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
        },
        {
          previous_binding_lookup: action666acEmptyPreviousBindingLookup,
        },
      ),
    ).toMatchObject({
      status: "unmappable",
      mapping: null,
    });
  });

  test("outcome lineage contradiction is conflicting and never reconstructed", () => {
    expect(project(action666acOutcomeLineageConflictBundle())).toMatchObject({
      status: "conflicting",
      mapping: null,
      reason_codes: [
        "completed_bundle_trusted_post_semantic_conflict",
      ],
    });
  });

  test("metric inventory and model-version drift fail closed", () => {
    expect(project(action666acMetricInventoryDriftBundle())).toMatchObject({
      status: "conflicting",
      mapping: null,
      reason_codes: ["completed_producer_binding_conflicting"],
    });
    expect(project(action666acModelVersionDriftBundle())).toMatchObject({
      status: "conflicting",
      mapping: null,
      reason_codes: ["completed_producer_binding_conflicting"],
    });
  });

  test("point-in-time violation and external trust-root substitution fail closed", () => {
    expect(project(action666acPointInTimeViolationBundle())).toMatchObject({
      status: "conflicting",
      mapping: null,
    });
    expect(project(action666acTrustRootSubstitutionBundle())).toMatchObject({
      status: "conflicting",
      mapping: null,
      reason_codes: [
        "external_proposal_registry_authority_conflicting",
      ],
    });
  });

  test("previous binding collision is read-only and explicit", () => {
    const counters = zeroCounters();
    const result = projectCanonicalCompletedImprovementEvidence(
      action666acMappedBundle,
      {
        previous_binding_lookup:
          action666acPreviousBindingCollisionLookup,
        counters,
      },
    );
    expect(result).toMatchObject({
      status: "conflicting",
      mapping: null,
      reason_codes: expect.arrayContaining([
        "previous_experiment_binding_semantic_conflict",
        "previous_proposal_binding_semantic_conflict",
      ]),
    });
    expect(counters.previous_binding_lookups).toBe(2);
    expect(counters.proposal_builds).toBe(1);
  });

  test("duplicate experiment identity fails before proposal build", () => {
    const counters = zeroCounters();
    expect(
      projectCanonicalCompletedImprovementEvidence(
        action666acDuplicateExperimentIdentityBundle(),
        {
          previous_binding_lookup: action666acEmptyPreviousBindingLookup,
          counters,
        },
      ),
    ).toMatchObject({
      status: "conflicting",
      mapping: null,
      reason_codes: expect.arrayContaining([
        "duplicate_experiment_identity",
      ]),
    });
    expect(counters.proposal_builds).toBe(0);
    expect(counters.previous_binding_lookups).toBe(0);
  });

  test("complete but insufficient diversity maps to an insufficient proposal", () => {
    const scenario = action666acGoldenScenarios.find(
      (item) => item.name === "insufficient_diversity",
    );
    if (!scenario) throw new Error("insufficient_fixture_missing");
    expect(
      projectCanonicalCompletedImprovementEvidence(scenario.bundle, {
        previous_binding_lookup: scenario.previous_binding_lookup,
      }),
    ).toMatchObject({
      status: "mapped",
      mapping: {
        proposal_result: {
          status: "insufficient_evidence",
          reason_codes: ["proposal_minimum_evidence_not_met"],
        },
      },
    });
  });

  test("caller authority booleans are forbidden rather than trusted", () => {
    const callerAssertion = {
      ...action666acMappedBundle,
      comparable: true,
      complete: true,
      approved: true,
      proposal_ready: true,
      producer_bindings: {
        ...action666acMappedBundle.producer_bindings,
        trusted: true,
      },
    };
    expect(
      projectCanonicalCompletedImprovementEvidence(callerAssertion, {
        previous_binding_lookup: action666acEmptyPreviousBindingLookup,
      }),
    ).toMatchObject({
      status: "conflicting",
      mapping: null,
      reason_codes: expect.arrayContaining([
        "caller_authority_field_forbidden:approved",
        "caller_authority_field_forbidden:comparable",
        "caller_authority_field_forbidden:complete",
        "caller_authority_field_forbidden:proposal_ready",
        "caller_producer_authority_field_forbidden:trusted",
      ]),
    });
  });

  test("default-off and kill switch perform zero reads, lookups, clones, or builds", () => {
    expect(DEFAULT_OFF_IMPROVEMENT_REPLAY_ENABLED).toBe(false);
    expect(
      DEFAULT_OFF_IMPROVEMENT_REPLAY_KILL_SWITCH_ENGAGED,
    ).toBe(true);
    for (const mode of [
      { enabled: false, kill_switch_engaged: false },
      { enabled: true, kill_switch_engaged: true },
    ]) {
      const counters = zeroCounters();
      let lookupReads = 0;
      const options = {
        ...mode,
        counters,
      } as Parameters<
        typeof createCanonicalImprovementProposalReplayHarness
      >[0];
      Object.defineProperty(options, "previous_binding_lookup", {
        get() {
          lookupReads += 1;
          throw new Error("default_off_must_not_read_lookup");
        },
      });
      const harness =
        createCanonicalImprovementProposalReplayHarness(options);
      expect(harness.replay).toBeNull();
      expect(lookupReads).toBe(0);
      expect(counters).toEqual(zeroCounters());
    }
  });

  test("replay is byte-identical across retry and caller input ordering", () => {
    const first = replay();
    const second = replay();
    const reordered = replay(action666acReorderedBundle());
    expect(first.replay_version).toBe(
      CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION,
    );
    expect(second).toEqual(first);
    expect(reordered).toEqual(first);
    expect(canonicalModelImprovementDigest(second)).toBe(
      canonicalModelImprovementDigest(first),
    );
  });

  test("input digest tampering is stopped before clone, registry, or verifier work", () => {
    const counters = zeroCounters();
    const harness = createCanonicalImprovementProposalReplayHarness({
      enabled: true,
      kill_switch_engaged: false,
      previous_binding_lookup: action666acEmptyPreviousBindingLookup,
      counters,
    });
    if (!harness.replay) throw new Error("tamper_harness_not_ready");
    expect(harness.replay(action666acTamperedDigestRequest())).toMatchObject({
      status: "input_digest_mismatch",
      adapter_result: null,
    });
    expect(counters).toMatchObject({
      request_reads: 1,
      replay_attempts: 1,
      clones: 0,
      registry_lookups: 0,
      previous_binding_lookups: 0,
      upstream_verifications: 0,
      proposal_builds: 0,
      input_digests: 1,
    });
  });

  test("observed and expected digest mismatches are independently bound", () => {
    const harness = createCanonicalImprovementProposalReplayHarness({
      enabled: true,
      kill_switch_engaged: false,
      previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    });
    if (!harness.replay) throw new Error("digest_binding_harness_not_ready");
    const first = harness.replay({
      bundle: action666acMappedBundle,
      expected_bundle_digest: "a".repeat(64),
    });
    const second = harness.replay({
      bundle: action666acMappedBundle,
      expected_bundle_digest: "b".repeat(64),
    });
    expect(first.status).toBe("input_digest_mismatch");
    expect(second.status).toBe("input_digest_mismatch");
    expect(first.input_projection.observed_bundle_digest).toBe(
      second.input_projection.observed_bundle_digest,
    );
    expect(first.input_projection.expected_bundle_binding_digest).not.toBe(
      second.input_projection.expected_bundle_binding_digest,
    );
    expect(first.replay_digest).not.toBe(second.replay_digest);
  });

  test("failure replay independently rebuilds and rejects self-consistent tampering", () => {
    const harness = createCanonicalImprovementProposalReplayHarness({
      enabled: true,
      kill_switch_engaged: false,
      previous_binding_lookup: action666acEmptyPreviousBindingLookup,
    });
    if (!harness.replay) throw new Error("verification_harness_not_ready");
    const unmappableBundle = action666acMissingMembershipBundle();
    const conflictingBundle = action666acMetricInventoryDriftBundle();
    const cases = [
      {
        request: {
          bundle: unmappableBundle,
          expected_bundle_digest:
            canonicalCompletedImprovementEvidenceBundleDigest(
              unmappableBundle,
            ),
        },
        expected_status: "unmappable",
      },
      {
        request: {
          bundle: conflictingBundle,
          expected_bundle_digest:
            canonicalCompletedImprovementEvidenceBundleDigest(
              conflictingBundle,
            ),
        },
        expected_status: "conflicting",
      },
      {
        request: action666acTamperedDigestRequest(),
        expected_status: "input_digest_mismatch",
      },
    ] as const;
    for (const scenario of cases) {
      const rebuiltResult = harness.replay(scenario.request);
      expect(rebuiltResult.status).toBe(scenario.expected_status);
      expect(
        verifyCanonicalImprovementReplayResult({
          request: scenario.request,
          result: rebuiltResult,
          previous_binding_lookup: action666acEmptyPreviousBindingLookup,
        }),
      ).toMatchObject({ valid: true, reason_codes: [] });
    }
    const request = cases[0].request;
    const result = harness.replay(request);

    const resign = (
      mutate: (draft: Record<string, unknown>) => void,
    ): CanonicalImprovementReplayResult => {
      const draft = structuredClone(result) as unknown as Record<
        string,
        unknown
      >;
      mutate(draft);
      const projection = draft.input_projection as Record<string, unknown>;
      const {
        projection_digest: ignoredProjectionDigest,
        ...projectionPayload
      } = projection;
      void ignoredProjectionDigest;
      projection.projection_digest =
        canonicalModelImprovementDigest(projectionPayload);
      const { replay_digest: ignoredReplayDigest, ...replayPayload } = draft;
      void ignoredReplayDigest;
      draft.replay_digest = canonicalModelImprovementDigest(replayPayload);
      return draft as unknown as CanonicalImprovementReplayResult;
    };
    const tamperedResults = [
      resign((draft) => {
        (draft.input_projection as Record<string, unknown>).bundle_identity =
          "action-666ac:tampered:failure-result";
      }),
      resign((draft) => {
        (draft.input_projection as Record<string, unknown>)
          .observed_bundle_digest = "a".repeat(64);
      }),
      resign((draft) => {
        const projection = draft.input_projection as Record<string, unknown>;
        projection.expected_bundle_digest = "b".repeat(64);
        projection.expected_bundle_binding_digest = "b".repeat(64);
      }),
      resign((draft) => {
        draft.adapter_version =
          "canonical_completed_improvement_evidence_adapter_tampered";
        (draft.input_projection as Record<string, unknown>).adapter_version =
          "canonical_completed_improvement_evidence_adapter_tampered";
      }),
      resign((draft) => {
        draft.status = "conflicting";
        (draft.adapter_result as Record<string, unknown>).status =
          "conflicting";
        (draft.input_projection as Record<string, unknown>).mapping_status =
          "conflicting";
      }),
      resign((draft) => {
        const reasons = ["tampered_failure_reason"];
        draft.reason_codes = reasons;
        (draft.adapter_result as Record<string, unknown>).reason_codes =
          reasons;
        (draft.input_projection as Record<string, unknown>).reason_codes =
          reasons;
      }),
    ];
    for (const tamperedResult of tamperedResults) {
      expect(
        verifyCanonicalImprovementReplayResult({
          request,
          result: tamperedResult,
          previous_binding_lookup: action666acEmptyPreviousBindingLookup,
        }),
      ).toEqual({
        valid: false,
        canonical_result: null,
        reason_codes: ["canonical_improvement_replay_result_tampered"],
      });
    }
  });

  test("lookup exceptions are deterministic, sanitized, and separate from bundle shape", () => {
    const firstLookup = {
      lookup_proposal_binding: () => {
        throw new Error("secret-backend-message-one");
      },
      lookup_experiment_binding: () => {
        throw new Error("secret-backend-message-one");
      },
    };
    const secondLookup = {
      lookup_proposal_binding: () => {
        throw new Error("different-sensitive-detail");
      },
      lookup_experiment_binding: () => {
        throw new Error("different-sensitive-detail");
      },
    };
    const first = replay(action666acMappedBundle, firstLookup);
    const second = replay(action666acMappedBundle, secondLookup);
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      status: "unmappable",
      reason_codes: ["previous_binding_lookup_failed"],
      adapter_result: {
        status: "unmappable",
        reason_codes: ["previous_binding_lookup_failed"],
      },
      input_projection: {
        previous_binding_request_identity: expect.stringMatching(
          /^[a-f0-9]{64}$/,
        ),
      },
    });
    expect(JSON.stringify(first)).not.toContain("secret-backend");
    expect(JSON.stringify(first)).not.toContain("sensitive-detail");
    expect(
      projectCanonicalCompletedImprovementEvidence(null, {
        previous_binding_lookup: action666acEmptyPreviousBindingLookup,
      }),
    ).toMatchObject({
      status: "unmappable",
      reason_codes: ["completed_improvement_bundle_missing"],
    });
  });

  test("deep-frozen input remains byte-identical after adapter and replay", () => {
    const frozenDraft = structuredClone(action666acMappedBundle);
    frozenDraft.trust_boundary = action666acMappedBundle.trust_boundary;
    const frozen = deepFreeze(frozenDraft);
    const before = canonicalCompletedImprovementEvidenceBundleDigest(frozen);
    const result = replay(frozen);
    expect(result.status).toBe("mapped");
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(canonicalCompletedImprovementEvidenceBundleDigest(frozen)).toBe(
      before,
    );
  });

  test("golden report is exact synthetic adapter evidence", () => {
    const scenarios = action666acGoldenScenarios.map((scenario) => {
      const result = projectCanonicalCompletedImprovementEvidence(
        scenario.bundle,
        {
          previous_binding_lookup: scenario.previous_binding_lookup,
        },
      );
      return {
        name: scenario.name,
        mapping_status: result.status,
        proposal_status: result.mapping?.proposal_result.status ?? null,
        reason_codes: result.reason_codes,
        bundle_digest:
          canonicalCompletedImprovementEvidenceBundleDigest(
            scenario.bundle,
          ),
        mapping_digest: result.mapping?.mapping_digest ?? null,
      };
    });
    expect(goldenReport).toEqual({
      report_version:
        "action_666ae_golden_improvement_adapter_report_v2",
      adapter_version:
        CANONICAL_COMPLETED_IMPROVEMENT_EVIDENCE_ADAPTER_VERSION,
      replay_version: CANONICAL_IMPROVEMENT_PROPOSAL_REPLAY_VERSION,
      evidence_class: "synthetic_fixture_only",
      synthetic_evidence: true,
      not_publishable: true,
      ...{
        shadow_only: true,
        live_ranking_effect: false,
        automatic_training_allowed: false,
        automatic_parameter_change_allowed: false,
        automatic_threshold_change_allowed: false,
        automatic_model_change_allowed: false,
        automatic_promotion_allowed: false,
        causal_improvement_claimed: false,
      },
      scenarios,
    });
  });

  test("foundation remains server-only with no live import or persistence call-site", () => {
    const root = process.cwd();
    const importNeedles = [
      "canonical-model-improvement-input-adapter",
      "canonical-model-improvement-input-adapter-fixtures",
    ];
    const offenders: string[] = [];
    for (const liveRoot of ["app", "components", "pages"]) {
      const absolute = path.join(root, liveRoot);
      if (!fs.existsSync(absolute)) continue;
      const stack = [absolute];
      while (stack.length > 0) {
        const current = stack.pop()!;
        for (const entry of fs.readdirSync(current, {
          withFileTypes: true,
        })) {
          const child = path.join(current, entry.name);
          if (entry.isDirectory()) stack.push(child);
          else if (
            /\.(?:ts|tsx|js|jsx)$/.test(entry.name) &&
            importNeedles.some((needle) =>
              fs.readFileSync(child, "utf8").includes(needle),
            )
          ) {
            offenders.push(path.relative(root, child));
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
