import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import {
  buildMarketContextDiagnosticContextFixtureResultV2,
  loadMarketContextDiagnosticContextFixtureInputsV2,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-fixtures-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2,
  createMarketContextDiagnosticContextSnapshotBatchV2,
  createMarketContextDiagnosticContextSnapshotV2,
  verifyMarketContextDiagnosticContextSnapshotV2,
  type MarketContextDiagnosticContextSnapshotRequestV2,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v2";
import {
  MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1,
  createMarketContextDiagnosticTrustedSourceRegistryV1,
  type MarketContextDiagnosticTrustedSourceAuthorityV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-trusted-source-registry-v1";
import {
  MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
  marketContextDiagnosticContextSha256V1,
  stableMarketContextDiagnosticContextJsonV1,
} from "../../lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v1";

const repositoryRoot = resolve(__dirname, "../..");
let fixtureCache:
  | ReturnType<typeof loadMarketContextDiagnosticContextFixtureInputsV2>
  | undefined;

function fixtures() {
  fixtureCache ??= loadMarketContextDiagnosticContextFixtureInputsV2({
    repo_root: repositoryRoot,
  });
  return fixtureCache;
}

function firstMappedRequest() {
  const fixture = fixtures();
  const request = fixture.requests.find((candidate) => {
    const snapshot = createMarketContextDiagnosticContextSnapshotV2(candidate, {
      enabled: true,
      authority: fixture.authority,
    });
    return snapshot.taxonomy === "mapped";
  });
  if (!request) throw new Error("mapped_v2_fixture_missing");
  return structuredClone(request);
}

type MutableDecision = {
  schedule: {
    provisional_watermark_ns: string;
  };
  evaluation: {
    point_in_time_audit: {
      observation_times: { observation_timestamp: string }[];
      provider_times: {
        source_timestamp: string;
        received_timestamp: string;
      }[];
    };
    v2_evaluation: {
      provider_timestamps: {
        source_timestamp: string;
        received_timestamp: string;
      }[];
    };
  };
};

function unixNsToExplicitUtc(unixNs: bigint) {
  const seconds = unixNs / BigInt(1_000_000_000);
  const fraction = (unixNs % BigInt(1_000_000_000))
    .toString()
    .padStart(9, "0");
  return `${new Date(Number(seconds) * 1000)
    .toISOString()
    .replace(".000Z", "")}.${fraction}Z`;
}

function authorityWithDecision(
  request: MarketContextDiagnosticContextSnapshotRequestV2,
  mutate: (decision: MutableDecision) => void,
) {
  const fixture = fixtures();
  const trusted = fixture.trusted_decisions.get(
    request.decision_identity.external_decision_id,
  );
  if (!trusted) throw new Error("trusted_fixture_decision_missing");
  const sourceDecision = structuredClone(
    trusted.source_decision,
  ) as MutableDecision;
  mutate(sourceDecision);
  const sourceDecisionSha256 =
    marketContextDiagnosticContextSha256V1(sourceDecision);
  request.source_decision_sha256 = sourceDecisionSha256;
  const decisionDigests = structuredClone(fixture.registry.decision_digests);
  decisionDigests[request.decision_identity.external_decision_id] =
    sourceDecisionSha256;
  const registry = createMarketContextDiagnosticTrustedSourceRegistryV1({
    registry_identity: fixture.registry.registry_identity,
    decision_source: fixture.registry.decision_source,
    source_bundle: fixture.registry.source_bundle,
    decision_digests: decisionDigests,
  });
  const authority: MarketContextDiagnosticTrustedSourceAuthorityV1 = {
    authority_version: MARKET_CONTEXT_DIAGNOSTIC_TRUSTED_SOURCE_AUTHORITY_V1,
    expected_registry_anchor: {
      registry_identity: registry.registry_identity,
      registry_version: registry.registry_version,
      registry_digest: registry.registry_digest,
    },
    read_registry: () => structuredClone(registry),
    read_decision: (identity) =>
      identity === request.decision_identity.external_decision_id
        ? {
            status: "resolved" as const,
            source_decision_sha256: sourceDecisionSha256,
            source_decision: structuredClone(sourceDecision),
          }
        : fixture.authority.read_decision(identity),
  };
  return authority;
}

function hash(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

test("v2 versions the contract, result, registry binding, and compatibility boundary", () => {
  const fixture = fixtures();
  const request = firstMappedRequest();
  const snapshot = createMarketContextDiagnosticContextSnapshotV2(request, {
    enabled: true,
    authority: fixture.authority,
  });
  expect(snapshot).toMatchObject({
    contract_version:
      "market_context_diagnostic_decision_time_context_feature_snapshot_v2",
    result_version:
      "market_context_diagnostic_decision_time_context_feature_result_v2",
    taxonomy: "mapped",
    boundary: MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
    compatibility: {
      predecessor_contract:
        "market_context_diagnostic_decision_time_context_feature_snapshot_v1",
      predecessor_snapshots_implicitly_remediated: false,
    },
  });
  expect(snapshot.identities.trusted_source_registry).toEqual({
    authority_version: "market_context_diagnostic_trusted_source_authority_v1",
    registry_identity: fixture.registry.registry_identity,
    registry_version: fixture.registry.registry_version,
    registry_digest: fixture.registry.registry_digest,
    verification_status: "verified",
  });
  expect(snapshot.feature_snapshot_digest).toMatch(/^[a-f0-9]{64}$/);
});

test("all sixty decisions reconcile under the externally anchored authority", () => {
  const result = buildMarketContextDiagnosticContextFixtureResultV2({
    repo_root: repositoryRoot,
  });
  expect(result.decision_count).toBe(60);
  expect(result.taxonomy_counts).toEqual({
    mapped: 31,
    insufficient_data: 7,
    conflicting: 22,
    not_point_in_time_safe: 0,
  });
  expect(new Set(result.snapshots.map((item) => item.feature_snapshot_digest)).size)
    .toBe(60);
  for (const snapshot of result.snapshots) {
    expect(snapshot.identities.trusted_source_registry.verification_status).toBe(
      "verified",
    );
    expect(snapshot.boundary).toEqual(
      MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_BOUNDARY_V1,
    );
    expect(snapshot.point_in_time).toMatchObject({
      finalization_policy_version:
        MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FINALIZATION_POLICY_V2,
      candle_bucket_end_after_finalized_boundary_count: 0,
      finalization_timestamp_after_decision_count: 0,
      pending_buckets_counted_as_missing: false,
    });
  }
});

test("nested forbidden claims in objects, arrays, and deep combinations fail closed", () => {
  const authority = fixtures().authority;
  const mutations = [
    (input: Record<string, unknown>) => {
      const identity = input.decision_identity as Record<string, unknown>;
      identity.canonical = false;
    },
    (input: Record<string, unknown>) => {
      const replay = input.replay as Record<string, unknown>;
      replay.extension = [{ metadata: { trusted: true } }];
    },
    (input: Record<string, unknown>) => {
      input.extension = {
        list: [{ nested: [{ model_input_allowed: false }] }],
      };
    },
    (input: Record<string, unknown>) => {
      const policy = input.policy_bundle as Record<string, unknown>;
      policy.metadata = { causal: false };
    },
  ];
  const expectedClaims = [
    "canonical",
    "trusted",
    "model_input_allowed",
    "causal",
  ];
  mutations.forEach((mutate, index) => {
    const request = firstMappedRequest() as unknown as Record<string, unknown>;
    mutate(request);
    const snapshot = createMarketContextDiagnosticContextSnapshotV2(request, {
      enabled: true,
      authority,
    });
    expect(snapshot.taxonomy).toBe("not_point_in_time_safe");
    expect(
      snapshot.reason_codes.some((reason) =>
        reason.endsWith(`.${expectedClaims[index]}`),
      ),
    ).toBe(true);
  });
});

test("all declared authority-claim names are rejected at arbitrary depth", () => {
  const claims = [
    "canonical",
    "verified",
    "trusted",
    "point_in_time_safe",
    "complete",
    "sufficient",
    "official_ohlcv",
    "performance_eligible",
    "outcome_explanatory",
    "causal",
    "model_input_allowed",
    "live_ranking_effect",
  ];
  for (const claim of claims) {
    const request = firstMappedRequest() as unknown as Record<string, unknown>;
    request.extension = [{ one: { two: { [claim]: false } } }];
    const snapshot = createMarketContextDiagnosticContextSnapshotV2(request, {
      enabled: true,
      authority: fixtures().authority,
    });
    expect(snapshot.taxonomy, claim).toBe("not_point_in_time_safe");
    expect(
      snapshot.reason_codes.some((reason) => reason.endsWith(`.${claim}`)),
      claim,
    ).toBe(true);
  }
});

test("closed nested schemas reject unknown and missing fields without stripping them", () => {
  const unknown = firstMappedRequest() as unknown as Record<string, unknown>;
  (unknown.calendar as Record<string, unknown>).issuer = "caller";
  const unknownResult = createMarketContextDiagnosticContextSnapshotV2(unknown, {
    enabled: true,
    authority: fixtures().authority,
  });
  expect(unknownResult.taxonomy).toBe("conflicting");
  expect(unknownResult.reason_codes).toContain(
    "closed_schema_unknown_field:$.calendar.issuer",
  );

  const missing = firstMappedRequest() as unknown as Record<string, unknown>;
  delete (missing.decision_source as Record<string, unknown>).version;
  expect(
    createMarketContextDiagnosticContextSnapshotV2(missing, {
      enabled: true,
      authority: fixtures().authority,
    }).reason_codes,
  ).toContain("closed_schema_missing_field:$.decision_source.version");
});

test("factory is default-off before registry or decision reads", () => {
  let registryReads = 0;
  let decisionReads = 0;
  const base = fixtures().authority;
  const authority: MarketContextDiagnosticTrustedSourceAuthorityV1 = {
    ...base,
    read_registry: () => {
      registryReads += 1;
      return base.read_registry();
    },
    read_decision: (identity) => {
      decisionReads += 1;
      return base.read_decision(identity);
    },
  };
  const snapshot = createMarketContextDiagnosticContextSnapshotV2(
    firstMappedRequest(),
    { enabled: false, authority },
  );
  expect(snapshot).toMatchObject({
    taxonomy: "insufficient_data",
    reason_codes: ["snapshot_factory_default_off"],
    identities: {
      trusted_source_registry: {
        verification_status: "not_read_default_off",
      },
    },
  });
  expect({ registryReads, decisionReads }).toEqual({
    registryReads: 0,
    decisionReads: 0,
  });
});

test("caller cannot supply an expected authority root or self-authorize alternative roots", () => {
  const expectedRoot = firstMappedRequest() as unknown as Record<string, unknown>;
  expectedRoot.expected_registry_digest = fixtures().registry.registry_digest;
  expect(
    createMarketContextDiagnosticContextSnapshotV2(expectedRoot, {
      enabled: true,
      authority: fixtures().authority,
    }).reason_codes,
  ).toContain("closed_schema_unknown_field:$.expected_registry_digest");

  const substituted = firstMappedRequest();
  substituted.normalized_dataset.dataset_digest = "a".repeat(64);
  substituted.replay.dataset_digest = "b".repeat(64);
  substituted.calendar.digest = "c".repeat(64);
  const snapshot = createMarketContextDiagnosticContextSnapshotV2(substituted, {
    enabled: true,
    authority: fixtures().authority,
  });
  expect(snapshot).toMatchObject({
    taxonomy: "conflicting",
    reason_codes: ["trusted_source_bundle_mismatch"],
  });
});

test("registry anchor and registry content drift are fail-closed", () => {
  const fixture = fixtures();
  const anchorDrift: MarketContextDiagnosticTrustedSourceAuthorityV1 = {
    ...fixture.authority,
    expected_registry_anchor: {
      ...fixture.authority.expected_registry_anchor,
      registry_digest: "f".repeat(64),
    },
  };
  expect(
    createMarketContextDiagnosticContextSnapshotV2(firstMappedRequest(), {
      enabled: true,
      authority: anchorDrift,
    }).reason_codes,
  ).toContain("trusted_source_registry_anchor_mismatch");

  const invalidRegistry: MarketContextDiagnosticTrustedSourceAuthorityV1 = {
    ...fixture.authority,
    read_registry: () => ({
      ...fixture.registry,
      decision_inventory_digest: "e".repeat(64),
    }),
  };
  expect(
    createMarketContextDiagnosticContextSnapshotV2(firstMappedRequest(), {
      enabled: true,
      authority: invalidRegistry,
    }).reason_codes,
  ).toContain("trusted_source_registry_invalid");
});

test("authority lookup exceptions are sanitized and never expose exception text", () => {
  for (const authority of [
    {
      ...fixtures().authority,
      read_registry: () => {
        throw new Error("private-provider-account-identity");
      },
    },
    {
      ...fixtures().authority,
      read_decision: () => {
        throw new Error("private-provider-request-identity");
      },
    },
    {
      ...fixtures().authority,
      read_registry: () =>
        new Proxy(fixtures().registry, {
          get() {
            throw new Error("private-provider-registry-getter");
          },
        }),
    },
    {
      ...fixtures().authority,
      read_decision: () =>
        new Proxy(
          {
            status: "not_found" as const,
          },
          {
            get() {
              throw new Error("private-provider-decision-getter");
            },
          },
        ),
    },
  ]) {
    const snapshot = createMarketContextDiagnosticContextSnapshotV2(
      firstMappedRequest(),
      { enabled: true, authority },
    );
    expect(snapshot.taxonomy).toBe("conflicting");
    expect(stableMarketContextDiagnosticContextJsonV1(snapshot)).not.toContain(
      "private-provider",
    );
  }
});

test("finalized bucket boundary accepts minus one nanosecond and exact boundary", () => {
  for (const delta of [BigInt(-1), BigInt(0)]) {
    const request = firstMappedRequest();
    const decisionNs = BigInt(request.decision_unix_ns);
    const watermarkNs = BigInt(2_000_000_000);
    const boundary = decisionNs - watermarkNs;
    const authority = authorityWithDecision(request, (decision) => {
      decision.evaluation.point_in_time_audit.observation_times[0]!
        .observation_timestamp = unixNsToExplicitUtc(boundary + delta);
    });
    const snapshot = createMarketContextDiagnosticContextSnapshotV2(request, {
      enabled: true,
      authority,
    });
    expect(snapshot.taxonomy, delta.toString()).not.toBe(
      "not_point_in_time_safe",
    );
    expect(snapshot.point_in_time.latest_finalized_bucket_unix_ns).toBe(
      boundary.toString(),
    );
  }
});

test("finalized bucket boundary rejects plus one nanosecond and keeps pending separate from missing", () => {
  const request = firstMappedRequest();
  const decisionNs = BigInt(request.decision_unix_ns);
  const boundary = decisionNs - BigInt(2_000_000_000);
  const authority = authorityWithDecision(request, (decision) => {
    decision.evaluation.point_in_time_audit.observation_times[0]!
      .observation_timestamp = unixNsToExplicitUtc(boundary + BigInt(1));
  });
  const snapshot = createMarketContextDiagnosticContextSnapshotV2(request, {
    enabled: true,
    authority,
  });
  expect(snapshot.taxonomy).toBe("not_point_in_time_safe");
  expect(snapshot.reason_codes).toEqual(
    expect.arrayContaining([
      expect.stringContaining("candle_bucket_end_after_finalized_boundary"),
      expect.stringContaining("finalization_timestamp_after_decision"),
    ]),
  );
  expect(snapshot.point_in_time.pending_buckets_counted_as_missing).toBe(false);
});

test("provider source and receive timestamps are checked separately from bucket finalization", () => {
  const request = firstMappedRequest();
  const decisionNs = BigInt(request.decision_unix_ns);
  const authority = authorityWithDecision(request, (decision) => {
    decision.evaluation.v2_evaluation.provider_timestamps[0]!.source_timestamp =
      unixNsToExplicitUtc(decisionNs + BigInt(1));
  });
  const snapshot = createMarketContextDiagnosticContextSnapshotV2(request, {
    enabled: true,
    authority,
  });
  expect(snapshot.taxonomy).toBe("not_point_in_time_safe");
  expect(snapshot.reason_codes).toEqual(
    expect.arrayContaining([
      expect.stringContaining("provider_source_timestamp_after_decision"),
    ]),
  );
  expect(snapshot.reason_codes).not.toEqual(
    expect.arrayContaining([
      expect.stringContaining("candle_bucket_end_after_finalized_boundary"),
    ]),
  );
});

test("schedule watermark must equal the externally registered policy value", () => {
  const request = firstMappedRequest();
  const authority = authorityWithDecision(request, (decision) => {
    decision.schedule.provisional_watermark_ns = "3000000000";
  });
  const snapshot = createMarketContextDiagnosticContextSnapshotV2(request, {
    enabled: true,
    authority,
  });
  expect(snapshot.taxonomy).toBe("not_point_in_time_safe");
  expect(snapshot.reason_codes).toContain(
    "watermark_policy_value_invalid_or_mismatch",
  );
});

test("duplicate, collision, tampering, and malformed request remain fail-closed", () => {
  const request = firstMappedRequest();
  const duplicate = createMarketContextDiagnosticContextSnapshotBatchV2(
    [request, structuredClone(request)],
    { enabled: true, authority: fixtures().authority },
  );
  expect(duplicate[1]?.reason_codes).toContain("duplicate_decision_identity");

  const collision = structuredClone(request);
  collision.decision_unix_ns = (
    BigInt(collision.decision_unix_ns) + BigInt(1)
  ).toString();
  const collisionResults = createMarketContextDiagnosticContextSnapshotBatchV2(
    [request, collision],
    { enabled: true, authority: fixtures().authority },
  );
  expect(collisionResults[1]?.reason_codes).toContain(
    "decision_identity_collision",
  );

  const snapshot = createMarketContextDiagnosticContextSnapshotV2(request, {
    enabled: true,
    authority: fixtures().authority,
  });
  const tampered = structuredClone(snapshot);
  if (!tampered.context) throw new Error("mapped_context_expected");
  tampered.context.regime_classification = "risk_on_trending";
  expect(
    verifyMarketContextDiagnosticContextSnapshotV2(
      tampered,
      request,
      { enabled: true, authority: fixtures().authority },
    ),
  ).toBe(false);

  const malformed = firstMappedRequest();
  malformed.decision_unix_ns = "NaN";
  expect(
    createMarketContextDiagnosticContextSnapshotV2(malformed, {
      enabled: true,
      authority: fixtures().authority,
    }).taxonomy,
  ).toBe("not_point_in_time_safe");
});

test("input order is deterministic and request bytes are immutable", () => {
  const fixture = fixtures();
  const before = stableMarketContextDiagnosticContextJsonV1(fixture.requests);
  const canonical = createMarketContextDiagnosticContextSnapshotBatchV2(
    fixture.requests,
    { enabled: true, authority: fixture.authority },
  );
  expect(stableMarketContextDiagnosticContextJsonV1(fixture.requests)).toBe(
    before,
  );
  const reverse = createMarketContextDiagnosticContextSnapshotBatchV2(
    [...fixture.requests].reverse(),
    { enabled: true, authority: fixture.authority },
  );
  expect(stableMarketContextDiagnosticContextJsonV1(reverse)).toBe(
    stableMarketContextDiagnosticContextJsonV1(canonical),
  );
});

test("fixed N.2A cross-process digest", () => {
  const result = buildMarketContextDiagnosticContextFixtureResultV2({
    repo_root: repositoryRoot,
    input_order:
      process.env.ACTION_667N2A_INPUT_ORDER === "reverse"
        ? "reverse"
        : "canonical",
  });
  console.log(`ACTION_667N2A_TZ_DIGEST=${result.canonical_result_digest}`);
  console.log(
    `ACTION_667N2A_RECEIPT=${stableMarketContextDiagnosticContextJsonV1({
      decision_count: result.decision_count,
      taxonomy_counts: result.taxonomy_counts,
      trusted_source_registry: result.trusted_source_registry,
      source_inventory_digest: result.source_inventory_digest,
      canonical_result_digest: result.canonical_result_digest,
    })}`,
  );
  expect(result.contract_version).toBe(
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_SNAPSHOT_V2,
  );
  expect(result.snapshots[0]?.result_version).toBe(
    MARKET_CONTEXT_DIAGNOSTIC_CONTEXT_FEATURE_RESULT_V2,
  );
});

test("UTC A/B, Stockholm reverse, and New York are byte-identical", () => {
  test.setTimeout(180_000);
  const runs = [
    ["UTC", "canonical"],
    ["UTC", "canonical"],
    ["Europe/Stockholm", "reverse"],
    ["America/New_York", "canonical"],
  ] as const;
  const digests = runs.map(([timezone, order], index) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667n2a-context-snapshot-remediation.spec.ts",
        "--grep",
        "fixed N.2A cross-process digest",
        "--reporter=line",
        "--output",
        `/private/tmp/action-667n2a-${index}-${timezone.replaceAll("/", "-")}`,
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          ACTION_667N2A_INPUT_ORDER: order,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
        timeout: 120_000,
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(/ACTION_667N2A_TZ_DIGEST=([a-f0-9]{64})/)?.[1];
  });
  expect(digests.every((digest) => digest?.length === 64)).toBe(true);
  expect(new Set(digests).size).toBe(1);
});

test("predecessor freeze/review and isolation boundaries remain byte-identical", () => {
  expect(
    hash(
      "docs/evidence/action-667n2-context-snapshot-foundation-freeze-manifest.json",
    ),
  ).toBe("261f48472b20781c3f941b8bf08298909ba6fcad8d3386283207179e1de7efc5");
  const historicalReview = JSON.parse(
    readFileSync(
      "docs/evidence/action-667n2-context-snapshot-foundation-independent-review.json",
      "utf8",
    ),
  );
  expect(historicalReview.review_evidence_digest).toBe(
    "7ac402599e5615d84738da08383409bc8189cddc11de0d04d0eeb15bc019f0b5",
  );
  const paths = [
    "lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-v2.ts",
    "lib/market-context-intelligence-lab/diagnostic-context-trusted-source-registry-v1.ts",
    "lib/market-context-intelligence-lab/diagnostic-context-feature-snapshot-fixtures-v2.ts",
    "scripts/market_context_diagnostic_context_snapshots_v2.ts",
  ];
  const source = paths.map((path) => readFileSync(path, "utf8")).join("\n");
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:@databento|supabase|database|scanner|recommendation|publication|capture|action-665|action-666)[^"']*["']/i,
  );
  expect(source).not.toContain("DATABENTO_API_KEY");
  expect(source).not.toMatch(/outcome[_-](?:join|bundle|result)/i);
});
