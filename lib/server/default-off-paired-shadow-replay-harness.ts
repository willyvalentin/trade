import "server-only";

import { createHash } from "node:crypto";

import {
  adaptCompletedPairedShadowObservationBundle,
  completedPairedShadowObservationInputDigest,
  type CompletedPairedShadowObservationAdapterResult,
  type CompletedPairedShadowObservationBundle,
} from "@/lib/server/completed-paired-shadow-observation-adapter";
import {
  evaluateCanonicalShadowRankingConfidencePair,
  verifyCanonicalShadowEvaluationResult,
  type CanonicalShadowEvaluationResult,
  type CanonicalShadowPairComparisonInput,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  verifyTrustedPairedShadowFixture,
  type TrustedPairedShadowFixtureAnchor,
  type TrustedPairedShadowFixtureRegistry,
} from "@/lib/server/trusted-paired-shadow-fixture-registry";

export const DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION =
  "default_off_paired_shadow_replay_harness_v1" as const;
export const DEFAULT_OFF_PAIRED_SHADOW_REPLAY_ENABLED = false;

export type PairedShadowReplayHarnessResult =
  | {
      harness_version:
        typeof DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION;
      status: "disabled";
      synthetic_fixture_only: true;
      offline_shadow_only: true;
      adapter_executed: false;
      evaluation_executed: false;
      input_digest_verified: false;
      input_digest: null;
      adapter_status: null;
      evaluation_status: null;
      evaluation_result: null;
      evaluation_result_verified: false;
      replay_digest: null;
      reason_codes: ["paired_shadow_replay_disabled"];
    }
  | {
      harness_version:
        typeof DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION;
      status: "rejected";
      synthetic_fixture_only: true;
      offline_shadow_only: true;
      adapter_executed: boolean;
      evaluation_executed: boolean;
      input_digest_verified: boolean;
      input_digest: string | null;
      adapter_status: "mapped" | "conflicting" | "unmappable" | null;
      evaluation_status: null;
      evaluation_result: null;
      evaluation_result_verified: false;
      replay_digest: null;
      reason_codes: string[];
    }
  | {
      harness_version:
        typeof DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION;
      status: "evaluated";
      synthetic_fixture_only: true;
      offline_shadow_only: true;
      adapter_executed: true;
      evaluation_executed: true;
      input_digest_verified: true;
      input_digest: string;
      adapter_status: "mapped";
      evaluation_status: CanonicalShadowEvaluationResult["status"];
      evaluation_result: CanonicalShadowEvaluationResult;
      evaluation_result_verified: true;
      replay_digest: string;
      reason_codes: string[];
    };

export type PairedShadowReplayDependencies = {
  adapt(
    bundle: CompletedPairedShadowObservationBundle,
  ): CompletedPairedShadowObservationAdapterResult;
  evaluate(
    input: CanonicalShadowPairComparisonInput,
  ): CanonicalShadowEvaluationResult;
};

export type PairedShadowReplayHarness = {
  readonly enabled: boolean;
  readonly harness_version:
    typeof DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION;
  run(
    bundle: CompletedPairedShadowObservationBundle,
  ): PairedShadowReplayHarnessResult;
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  return value;
}
function replayDigest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values)).sort();
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

function withReplayDigest<
  T extends Omit<PairedShadowReplayHarnessResult, "replay_digest">,
>(payload: T): PairedShadowReplayHarnessResult {
  return deepFreeze({
    ...payload,
    replay_digest: replayDigest(payload),
  } as PairedShadowReplayHarnessResult);
}

function rejected(
  payload: Omit<
    Extract<PairedShadowReplayHarnessResult, { status: "rejected" }>,
    "replay_digest"
  >,
): PairedShadowReplayHarnessResult {
  return deepFreeze({
    ...payload,
    replay_digest: null,
  });
}

const defaultDependencies: PairedShadowReplayDependencies = {
  adapt: adaptCompletedPairedShadowObservationBundle,
  evaluate: evaluateCanonicalShadowRankingConfidencePair,
};

export function createDefaultOffPairedShadowReplayHarness(options: {
  enabled?: boolean;
  dependencies?: PairedShadowReplayDependencies;
  trusted_fixture_registry?: TrustedPairedShadowFixtureRegistry;
  trust_anchor?: TrustedPairedShadowFixtureAnchor;
} = {}): PairedShadowReplayHarness {
  const enabled =
    options.enabled ?? DEFAULT_OFF_PAIRED_SHADOW_REPLAY_ENABLED;
  const dependencies = options.dependencies ?? defaultDependencies;
  return {
    enabled,
    harness_version: DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION,
    run(bundle) {
      if (!enabled) {
        return deepFreeze({
          harness_version:
            DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION,
          status: "disabled",
          synthetic_fixture_only: true,
          offline_shadow_only: true,
          adapter_executed: false,
          evaluation_executed: false,
          input_digest_verified: false,
          input_digest: null,
          adapter_status: null,
          evaluation_status: null,
          evaluation_result: null,
          evaluation_result_verified: false,
          replay_digest: null,
          reason_codes: ["paired_shadow_replay_disabled"],
        });
      }

      let source: CompletedPairedShadowObservationBundle;
      try {
        source = structuredClone(bundle);
      } catch {
        return rejected({
          harness_version:
            DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION,
          status: "rejected",
          synthetic_fixture_only: true,
          offline_shadow_only: true,
          adapter_executed: false,
          evaluation_executed: false,
          input_digest_verified: false,
          input_digest: null,
          adapter_status: null,
          evaluation_status: null,
          evaluation_result: null,
          evaluation_result_verified: false,
          reason_codes: ["fixture_bundle_not_cloneable"],
        });
      }
      if (!options.trusted_fixture_registry || !options.trust_anchor) {
        return rejected({
          harness_version:
            DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION,
          status: "rejected",
          synthetic_fixture_only: true,
          offline_shadow_only: true,
          adapter_executed: false,
          evaluation_executed: false,
          input_digest_verified: false,
          input_digest: source.input_digest || null,
          adapter_status: null,
          evaluation_status: null,
          evaluation_result: null,
          evaluation_result_verified: false,
          reason_codes: ["trusted_fixture_registry_and_anchor_required"],
        });
      }
      const fixtureTrust = verifyTrustedPairedShadowFixture({
        bundle: source,
        registry: options.trusted_fixture_registry,
        trust_anchor: options.trust_anchor,
      });
      if (!fixtureTrust.trusted) {
        return rejected({
          harness_version:
            DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION,
          status: "rejected",
          synthetic_fixture_only: true,
          offline_shadow_only: true,
          adapter_executed: false,
          evaluation_executed: false,
          input_digest_verified: false,
          input_digest: source.input_digest || null,
          adapter_status: null,
          evaluation_status: null,
          evaluation_result: null,
          evaluation_result_verified: false,
          reason_codes: uniqueSorted(fixtureTrust.reason_codes),
        });
      }
      const expectedDigest =
        completedPairedShadowObservationInputDigest(source);
      if (expectedDigest !== source.input_digest) {
        return rejected({
          harness_version:
            DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION,
          status: "rejected",
          synthetic_fixture_only: true,
          offline_shadow_only: true,
          adapter_executed: false,
          evaluation_executed: false,
          input_digest_verified: false,
          input_digest: source.input_digest || null,
          adapter_status: null,
          evaluation_status: null,
          evaluation_result: null,
          evaluation_result_verified: false,
          reason_codes: ["fixture_input_digest_mismatch"],
        });
      }

      const adapter = dependencies.adapt(source);
      if (adapter.status !== "mapped" || !adapter.comparison_input) {
        return rejected({
          harness_version:
            DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION,
          status: "rejected",
          synthetic_fixture_only: true,
          offline_shadow_only: true,
          adapter_executed: true,
          evaluation_executed: false,
          input_digest_verified: true,
          input_digest: source.input_digest,
          adapter_status: adapter.status,
          evaluation_status: null,
          evaluation_result: null,
          evaluation_result_verified: false,
          reason_codes: uniqueSorted(adapter.reason_codes),
        });
      }

      const evaluation = dependencies.evaluate(adapter.comparison_input);
      const verification = verifyCanonicalShadowEvaluationResult({
        comparison_input: adapter.comparison_input,
        evaluation_result: evaluation,
      });
      if (!verification.valid || !verification.canonical_result) {
        return rejected({
          harness_version:
            DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION,
          status: "rejected",
          synthetic_fixture_only: true,
          offline_shadow_only: true,
          adapter_executed: true,
          evaluation_executed: true,
          input_digest_verified: true,
          input_digest: source.input_digest,
          adapter_status: "mapped",
          evaluation_status: null,
          evaluation_result: null,
          evaluation_result_verified: false,
          reason_codes: uniqueSorted(verification.reason_codes),
        });
      }
      return withReplayDigest({
        harness_version:
          DEFAULT_OFF_PAIRED_SHADOW_REPLAY_HARNESS_VERSION,
        status: "evaluated",
        synthetic_fixture_only: true,
        offline_shadow_only: true,
        adapter_executed: true,
        evaluation_executed: true,
        input_digest_verified: true,
        input_digest: source.input_digest,
        adapter_status: "mapped",
        evaluation_status: verification.canonical_result.status,
        evaluation_result: verification.canonical_result,
        evaluation_result_verified: true,
        reason_codes: uniqueSorted(
          verification.canonical_result.reason_codes,
        ),
      });
    },
  };
}
