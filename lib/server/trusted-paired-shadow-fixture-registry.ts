import "server-only";

import { createHash } from "node:crypto";

import {
  buildCanonicalShadowVersionTuple,
  type CanonicalShadowVersionTuple,
} from "@/lib/server/canonical-shadow-ranking-confidence-evaluation";
import {
  completedPairedShadowObservationInputDigest,
  type CompletedPairedShadowObservationBundle,
} from "@/lib/server/completed-paired-shadow-observation-adapter";

export const TRUSTED_PAIRED_SHADOW_FIXTURE_REGISTRY_VERSION =
  "trusted_paired_shadow_fixture_registry_v1" as const;
export const TRUSTED_PAIRED_SHADOW_FIXTURE_ENTRY_VERSION =
  "trusted_paired_shadow_fixture_entry_v1" as const;
export const TRUSTED_PAIRED_SHADOW_FIXTURE_ANCHOR_VERSION =
  "trusted_paired_shadow_fixture_anchor_v1" as const;

export type TrustedPairedShadowFixtureRegistryEntry = {
  entry_version: typeof TRUSTED_PAIRED_SHADOW_FIXTURE_ENTRY_VERSION;
  fixture_identity: string;
  bundle_digest: string;
  baseline_version_tuple: CanonicalShadowVersionTuple;
  candidate_version_tuple: CanonicalShadowVersionTuple;
  semantic_digest_algorithm: "sha256_canonical_json_v1";
  semantic_digest: string;
};

export type TrustedPairedShadowFixtureRegistry = {
  registry_version: typeof TRUSTED_PAIRED_SHADOW_FIXTURE_REGISTRY_VERSION;
  entries: TrustedPairedShadowFixtureRegistryEntry[];
  root_digest_algorithm: "sha256_canonical_json_v1";
  root_digest: string;
};

export type TrustedPairedShadowFixtureAnchor = {
  anchor_version: typeof TRUSTED_PAIRED_SHADOW_FIXTURE_ANCHOR_VERSION;
  registry_version: typeof TRUSTED_PAIRED_SHADOW_FIXTURE_REGISTRY_VERSION;
  expected_root_digest: string;
};

export type TrustedPairedShadowFixtureVerification = {
  trusted: boolean;
  reason_codes: string[];
  fixture_entry: TrustedPairedShadowFixtureRegistryEntry | null;
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

function semanticDigest(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function exactCanonicalJson(first: unknown, second: unknown) {
  return (
    JSON.stringify(canonicalize(first)) ===
    JSON.stringify(canonicalize(second))
  );
}

function orderedEntries(entries: TrustedPairedShadowFixtureRegistryEntry[]) {
  return [...entries].sort((first, second) =>
    first.fixture_identity.localeCompare(second.fixture_identity),
  );
}

function entryPayload(
  entry: Omit<TrustedPairedShadowFixtureRegistryEntry, "semantic_digest">,
) {
  return entry;
}

function registryPayload(input: {
  entries: TrustedPairedShadowFixtureRegistryEntry[];
}) {
  return {
    registry_version: TRUSTED_PAIRED_SHADOW_FIXTURE_REGISTRY_VERSION,
    entries: orderedEntries(input.entries),
    root_digest_algorithm: "sha256_canonical_json_v1" as const,
  };
}

export function buildTrustedPairedShadowFixtureRegistry(
  bundles: CompletedPairedShadowObservationBundle[],
): TrustedPairedShadowFixtureRegistry {
  const identities = bundles.map((bundle) => bundle.fixture_identity);
  if (
    identities.some((identity) => !identity.trim()) ||
    new Set(identities).size !== identities.length
  ) {
    throw new Error("trusted_fixture_identity_missing_or_duplicate");
  }
  const entries = bundles.map((bundle) => {
    const baselineVersionTuple = buildCanonicalShadowVersionTuple(
      bundle.baseline.versions,
    );
    const candidateVersionTuple = buildCanonicalShadowVersionTuple(
      bundle.candidate.versions,
    );
    const payload: Omit<
      TrustedPairedShadowFixtureRegistryEntry,
      "semantic_digest"
    > = {
      entry_version: TRUSTED_PAIRED_SHADOW_FIXTURE_ENTRY_VERSION,
      fixture_identity: bundle.fixture_identity,
      bundle_digest: completedPairedShadowObservationInputDigest(bundle),
      baseline_version_tuple: baselineVersionTuple,
      candidate_version_tuple: candidateVersionTuple,
      semantic_digest_algorithm: "sha256_canonical_json_v1",
    };
    return {
      ...payload,
      semantic_digest: semanticDigest(entryPayload(payload)),
    };
  });
  const payload = registryPayload({ entries });
  return {
    ...payload,
    root_digest: semanticDigest(payload),
  };
}

export function trustedPairedShadowFixtureAnchor(
  registry: TrustedPairedShadowFixtureRegistry,
): TrustedPairedShadowFixtureAnchor {
  return {
    anchor_version: TRUSTED_PAIRED_SHADOW_FIXTURE_ANCHOR_VERSION,
    registry_version: TRUSTED_PAIRED_SHADOW_FIXTURE_REGISTRY_VERSION,
    expected_root_digest: registry.root_digest,
  };
}

export function verifyTrustedPairedShadowFixture(input: {
  bundle: CompletedPairedShadowObservationBundle;
  registry: TrustedPairedShadowFixtureRegistry;
  trust_anchor: TrustedPairedShadowFixtureAnchor;
}): TrustedPairedShadowFixtureVerification {
  const reasons: string[] = [];
  const { bundle, registry, trust_anchor: trustAnchor } = input;
  if (
    registry.registry_version !==
      TRUSTED_PAIRED_SHADOW_FIXTURE_REGISTRY_VERSION ||
    trustAnchor.registry_version !==
      TRUSTED_PAIRED_SHADOW_FIXTURE_REGISTRY_VERSION ||
    trustAnchor.anchor_version !==
      TRUSTED_PAIRED_SHADOW_FIXTURE_ANCHOR_VERSION
  ) {
    reasons.push("trusted_fixture_registry_or_anchor_version_invalid");
  }
  const identities = registry.entries.map((entry) => entry.fixture_identity);
  if (new Set(identities).size !== identities.length) {
    reasons.push("trusted_fixture_registry_identity_duplicate");
  }
  for (const entry of registry.entries) {
    const { semantic_digest: entryDigest, ...payload } = entry;
    if (
      entry.entry_version !==
        TRUSTED_PAIRED_SHADOW_FIXTURE_ENTRY_VERSION ||
      semanticDigest(entryPayload(payload)) !== entryDigest ||
      buildCanonicalShadowVersionTuple(entry.baseline_version_tuple)
        .semantic_digest !==
        entry.baseline_version_tuple.semantic_digest ||
      buildCanonicalShadowVersionTuple(entry.candidate_version_tuple)
        .semantic_digest !==
        entry.candidate_version_tuple.semantic_digest
    ) {
      reasons.push("trusted_fixture_registry_entry_invalid");
    }
  }
  const expectedRoot = semanticDigest(
    registryPayload({ entries: registry.entries }),
  );
  if (registry.root_digest !== expectedRoot) {
    reasons.push("trusted_fixture_registry_root_invalid");
  }
  if (trustAnchor.expected_root_digest !== expectedRoot) {
    reasons.push("trusted_fixture_anchor_mismatch");
  }
  const entries = registry.entries.filter(
    (entry) => entry.fixture_identity === bundle.fixture_identity,
  );
  if (entries.length !== 1) {
    reasons.push("trusted_fixture_unknown_or_ambiguous");
  }
  const entry = entries[0] ?? null;
  if (entry) {
    const bundleDigest =
      completedPairedShadowObservationInputDigest(bundle);
    const baselineVersionTuple = buildCanonicalShadowVersionTuple(
      bundle.baseline.versions,
    );
    const candidateVersionTuple = buildCanonicalShadowVersionTuple(
      bundle.candidate.versions,
    );
    if (
      bundle.input_digest !== bundleDigest ||
      entry.bundle_digest !== bundleDigest
    ) {
      reasons.push("trusted_fixture_bundle_digest_mismatch");
    }
    if (
      !exactCanonicalJson(
        entry.baseline_version_tuple,
        baselineVersionTuple,
      ) ||
      !exactCanonicalJson(
        entry.candidate_version_tuple,
        candidateVersionTuple,
      )
    ) {
      reasons.push("trusted_fixture_version_tuple_mismatch");
    }
  }
  return reasons.length > 0
    ? {
        trusted: false,
        reason_codes: Array.from(new Set(reasons)).sort(),
        fixture_entry: null,
      }
    : {
        trusted: true,
        reason_codes: [],
        fixture_entry: entry,
      };
}
