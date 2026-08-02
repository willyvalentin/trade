import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  MARKET_CONTEXT_ACTION_667M4A_SYNTHETIC_FIXTURES_V1,
  marketContextPilotPostSubmissionFixtureV2,
  marketContextPilotPreSubmissionFixtureV2,
} from "../../lib/market-context-intelligence-lab/action-667m4a-fixtures-v1";
import {
  MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2,
  computeMarketContextPilotBatchFilesDigestV2,
  computeMarketContextPilotJobMetadataDigestV2,
  evaluateMarketContextPilotPostSubmissionAdmissionV2,
  evaluateMarketContextPilotPreSubmissionAdmissionV2,
} from "../../lib/market-context-intelligence-lab/five-session-pilot-two-stage-admission-v2";
import { stableMarketContextTradePreparationJsonV2 } from "../../lib/market-context-intelligence-lab/trade-to-candle-preparation-v2";
import {
  MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1,
  MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_ARTIFACT,
  MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CANONICAL_JSON,
  MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CORE,
  MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_SHA256,
  validateMarketContextXnysAcquisitionCalendar2026V1,
} from "../../lib/market-context-intelligence-lab/xnys-acquisition-calendar-2026-v1";

const repositoryRoot = resolve(process.cwd());

test.describe.configure({ timeout: 60_000 });

function errorCodes(result: unknown) {
  const value = result as {
    status?: string;
    error_codes?: unknown;
  };
  expect(value.status).toBe("not_admitted");
  if (!Array.isArray(value.error_codes)) {
    throw new Error("Expected fail-closed error codes");
  }
  return value.error_codes as string[];
}

test("M.4A versions, stages, and authoritative calendar are explicit", () => {
  expect(MARKET_CONTEXT_ACTION_667M4A_SYNTHETIC_FIXTURES_V1).toBe(
    "market_context_action_667m4a_synthetic_fixtures_v1",
  );
  expect(MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2).toBe(
    "market_context_five_session_pilot_two_stage_admission_v2",
  );
  expect(MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2).toBe(
    "market_context_five_session_pilot_two_stage_policy_2026_07_27_v2",
  );
  expect(MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1).toBe(
    "market_context_databento_batch_provenance_v1",
  );
  expect(MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1).toBe(
    "market_context_xnys_acquisition_calendar_2026_v1",
  );
  expect(
    validateMarketContextXnysAcquisitionCalendar2026V1(
      MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_ARTIFACT,
    ).status,
  ).toBe("valid_calendar");
  expect(
    MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_SHA256,
  ).toMatch(/^[a-f0-9]{64}$/);
  expect(
    JSON.parse(
      MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CANONICAL_JSON,
    ).sessions,
  ).toHaveLength(5);
});

test("calendar evidence JSON is byte-material equivalent to the normative artifact", () => {
  const evidence = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs/evidence/market-context-xnys-acquisition-calendar-2026-v1.json",
      ),
      "utf8",
    ),
  ) as {
    canonical_json_sha256: string;
    canonical_json_material: unknown;
  };
  expect(evidence.canonical_json_sha256).toBe(
    MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_SHA256,
  );
  expect(
    stableMarketContextTradePreparationJsonV2(
      evidence.canonical_json_material,
    ),
  ).toBe(
    stableMarketContextTradePreparationJsonV2(
      MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_CORE,
    ),
  );
});

test("M.4A readable and machine-readable decisions, digests, and predecessor lineage are in parity", () => {
  const path =
    "docs/evidence/action-667m4a-two-stage-admission-and-calendar-remediation.json";
  const evidence = JSON.parse(
    readFileSync(resolve(repositoryRoot, path), "utf8"),
  ) as {
    evidence_digest: string;
    decision_material: {
      predecessor_freezes: Record<string, string>;
      statuses: Record<string, boolean>;
    };
  };
  const calculated = createHash("sha256")
    .update(
      stableMarketContextTradePreparationJsonV2(
        evidence.decision_material,
      ),
    )
    .digest("hex");
  expect(evidence.evidence_digest).toBe(calculated);
  expect(evidence.decision_material.predecessor_freezes).toEqual({
    m2a_v1:
      "28b5ef0a42023605d299671c05d926e4fbf7e129f421f4feed02a6c6b02f9370",
    m2c_v2:
      "f5b3ad14fb10fb8fd7fed6547f521f430d8b30895bccb5b684db457160e2de4f",
    m3b_foundation:
      "d94c986ba4d988b4cf2c4b5ac939b7a0916de60dd46e28c1e2620dd00b36023c",
    m3c_license:
      "f30202c86df83d0cbebacbca5a2ff1dfe92e0d6b6a57e905f0a805c7e0af126c",
    m3d_provider_verbatim:
      "c9398b9c2321ed778ea089931a7491c03ed7b91cf8ba6bade72b239c2dd5330c",
    m4_fail_closed_decision:
      "1b896d2387af207fa03b59172bfeed38be17a19daedb23395e66f73b6474ce8d",
  });
  expect(evidence.decision_material.statuses).toMatchObject({
    action_667m4a_two_stage_admission_ready: true,
    action_667m4a_authoritative_calendar_ready: true,
    action_667m4a_provider_provenance_sufficient: true,
    action_667m4a_independent_review_approved: true,
    batch_submission_authorized: false,
    download_authorized: false,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
  const doc = readFileSync(
    resolve(
      repositoryRoot,
      "docs/action-667m4a-two-stage-batch-admission-and-calendar-remediation.md",
    ),
    "utf8",
  );
  expect(doc).toContain(calculated);
  for (const [key, value] of Object.entries(
    evidence.decision_material.statuses,
  )) {
    expect(doc).toContain(`${key}: ${String(value)}`);
  }
});

test("pre-submission admission is ready but grants no authorization", () => {
  const input = marketContextPilotPreSubmissionFixtureV2();
  const before = stableMarketContextTradePreparationJsonV2(input);
  const result =
    evaluateMarketContextPilotPreSubmissionAdmissionV2(input);
  expect(result.status).toBe(
    "ready_for_separate_batch_submission_authorization",
  );
  if (
    result.status !==
    "ready_for_separate_batch_submission_authorization"
  ) {
    return;
  }
  expect(result).toMatchObject({
    quote_age_seconds: 17,
    entitlement_age_seconds: 16,
    provider_internal_revision_status: "not_exposed_by_provider",
    batch_submission_authorized: false,
    download_authorized: false,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
    live_ranking_effect: false,
  });
  expect(
    stableMarketContextTradePreparationJsonV2(input),
  ).toBe(before);
});

test("post-submission admission verifies transfer and provenance but grants no download", () => {
  const input = marketContextPilotPostSubmissionFixtureV2();
  const before = stableMarketContextTradePreparationJsonV2(input);
  const result =
    evaluateMarketContextPilotPostSubmissionAdmissionV2(input);
  expect(result.status).toBe(
    "ready_for_separate_file_download_authorization",
  );
  if (
    result.status !==
    "ready_for_separate_file_download_authorization"
  ) {
    return;
  }
  expect(result).toMatchObject({
    transfer_bytes: 20_003_584,
    calculated_local_total_bytes: 40_007_168,
    provider_provenance_sufficient: true,
    raw_file_identity_status:
      "sufficient_pre_download_pending_local_sha256",
    provider_internal_revision_status: "not_exposed_by_provider",
    batch_submission_authorized: false,
    download_authorized: false,
    normalization_authorized: false,
    replay_authorized: false,
    canonical_binding_ready: false,
    rollback_policy:
      "discard_unexecuted_admission_receipt_and_require_fresh_pre_submission_admission",
    live_ranking_effect: false,
  });
  expect(
    stableMarketContextTradePreparationJsonV2(input),
  ).toBe(before);
});

test("stale quote, unavailable day, cap, license, and destination failures reject pre-submission", () => {
  const cases: Array<{
    mutate: (
      value: ReturnType<typeof marketContextPilotPreSubmissionFixtureV2>,
    ) => void;
    code: string;
  }> = [
    {
      mutate: (value) => {
        value.evaluated_at_unix_ns = (
          BigInt(value.quote.quoted_at_unix_ns) +
          BigInt(901_000_000_000)
        ).toString();
      },
      code: "pre_submission_quote_or_entitlement_stale",
    },
    {
      mutate: (value) => {
        value.quote.conditions[2]!.condition = "degraded";
      },
      code: "pre_submission_entitlement_or_session_conditions_invalid",
    },
    {
      mutate: (value) => {
        value.quote.cost_usd = 0.250000001;
      },
      code: "pre_submission_quote_or_cap_invalid",
    },
    {
      mutate: (value) => {
        value.license_readiness.license_sufficient = false as true;
      },
      code: "pre_submission_m3d_license_readiness_invalid",
    },
    {
      mutate: (value) => {
        value.destination.underlying_volume_encrypted = false as true;
      },
      code: "pre_submission_destination_or_free_space_invalid",
    },
    {
      mutate: (value) => {
        value.quote.entitlement_end_exclusive =
          "2026-07-25T00:00:00";
      },
      code: "pre_submission_entitlement_or_session_conditions_invalid",
    },
  ];
  for (const { mutate, code } of cases) {
    const fixture = marketContextPilotPreSubmissionFixtureV2();
    mutate(fixture);
    const result =
      evaluateMarketContextPilotPreSubmissionAdmissionV2(fixture);
    expect(result.status).toBe("not_admitted");
    expect(errorCodes(result)).toContain(code);
  }
});

test("freshness boundary is exact at 900 seconds plus or minus one nanosecond", () => {
  const exact = marketContextPilotPreSubmissionFixtureV2();
  exact.evaluated_at_unix_ns = (
    BigInt(exact.quote.quoted_at_unix_ns) +
    BigInt(900_000_000_000)
  ).toString();
  expect(
    evaluateMarketContextPilotPreSubmissionAdmissionV2(exact)
      .status,
  ).toBe("ready_for_separate_batch_submission_authorization");

  const over = marketContextPilotPreSubmissionFixtureV2();
  over.evaluated_at_unix_ns = (
    BigInt(over.quote.quoted_at_unix_ns) +
    BigInt(900_000_000_001)
  ).toString();
  expect(
    errorCodes(
      evaluateMarketContextPilotPreSubmissionAdmissionV2(over),
    ),
  ).toContain("pre_submission_quote_or_entitlement_stale");
});

test("calendar mutation and synthetic substitution fail closed", () => {
  const boundary = marketContextPilotPreSubmissionFixtureV2();
  (
    boundary.calendar.sessions[0] as {
      open_unix_ns: string;
    }
  ).open_unix_ns = (
    BigInt(boundary.calendar.sessions[0]!.open_unix_ns) +
    BigInt(1)
  ).toString();
  const boundaryResult =
    evaluateMarketContextPilotPreSubmissionAdmissionV2(boundary);
  expect(boundaryResult.status).toBe("not_admitted");
  expect(errorCodes(boundaryResult)).toContain(
    "pre_submission_calendar_invalid",
  );

  const synthetic = marketContextPilotPreSubmissionFixtureV2();
  (
    synthetic.calendar as {
      artifact_version: string;
    }
  ).artifact_version = "synthetic_xnys_calendar";
  const syntheticResult =
    evaluateMarketContextPilotPreSubmissionAdmissionV2(synthetic);
  expect(syntheticResult.status).toBe("not_admitted");
  expect(errorCodes(syntheticResult)).toContain(
    "pre_submission_calendar_invalid",
  );
});

test("missing, mismatched, or oversized transfer stops before download", () => {
  const cases = [
    (value: ReturnType<typeof marketContextPilotPostSubmissionFixtureV2>) => {
      value.provider_manifest.declared_transfer_bytes = null;
    },
    (value: ReturnType<typeof marketContextPilotPostSubmissionFixtureV2>) => {
      value.provider_manifest.declared_transfer_bytes =
        32 * 1024 * 1024 + 1;
    },
    (value: ReturnType<typeof marketContextPilotPostSubmissionFixtureV2>) => {
      value.provider_manifest.files[3]!.size_bytes += 1;
    },
  ];
  for (const mutate of cases) {
    const fixture = marketContextPilotPostSubmissionFixtureV2();
    mutate(fixture);
    const result =
      evaluateMarketContextPilotPostSubmissionAdmissionV2(fixture);
    expect(result.status).toBe("not_admitted");
    expect(errorCodes(result)).toContain(
      "post_submission_transfer_missing_mismatch_or_cap_exceeded",
    );
    expect(result.download_authorized).toBe(false);
  }
});

test("missing or excessive local total stops before download", () => {
  const missing = marketContextPilotPostSubmissionFixtureV2();
  missing.provider_manifest.calculated_local_total_bytes = null;
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(missing),
    ),
  ).toContain("post_submission_local_total_missing_or_cap_exceeded");

  const excessive = marketContextPilotPostSubmissionFixtureV2();
  excessive.provider_manifest.calculated_local_total_bytes =
    1024 * 1024 * 1024 + 1;
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(excessive),
    ),
  ).toContain("post_submission_local_total_missing_or_cap_exceeded");
});

test("incomplete manifest and unexpected files or domains fail closed", () => {
  const missing = marketContextPilotPostSubmissionFixtureV2();
  missing.provider_manifest.files = missing.provider_manifest.files.filter(
    ({ filename }) => filename !== "metadata.json",
  );
  missing.provider_manifest.files_canonical_sha256 =
    computeMarketContextPilotBatchFilesDigestV2(
      missing.provider_manifest.files,
    );
  const missingResult =
    evaluateMarketContextPilotPostSubmissionAdmissionV2(missing);
  expect(errorCodes(missingResult)).toContain(
    "post_submission_file_manifest_incomplete",
  );

  const unexpected = marketContextPilotPostSubmissionFixtureV2();
  unexpected.provider_manifest.files.push({
    filename: "corporate-actions.json",
    file_kind: "market_data",
    data_domain: "trades",
    size_bytes: 100,
    provider_sha256: "a".repeat(64),
  });
  unexpected.provider_manifest.files_canonical_sha256 =
    computeMarketContextPilotBatchFilesDigestV2(
      unexpected.provider_manifest.files,
    );
  const unexpectedResult =
    evaluateMarketContextPilotPostSubmissionAdmissionV2(unexpected);
  expect(errorCodes(unexpectedResult)).toContain(
    "post_submission_unexpected_file_or_data_domain",
  );
});

test("job or manifest scope drift fails closed", () => {
  const job = marketContextPilotPostSubmissionFixtureV2();
  job.batch_job.scope.symbols.pop();
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(job),
    ),
  ).toContain("post_submission_job_scope_state_or_caps_invalid");

  const manifest = marketContextPilotPostSubmissionFixtureV2();
  manifest.provider_manifest.scope.publisher_id = 94 as 95;
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(manifest),
    ),
  ).toContain("post_submission_manifest_scope_mismatch");
});

test("changed batch cost or billable size outside hard caps fails closed", () => {
  const cost = marketContextPilotPostSubmissionFixtureV2();
  cost.batch_job.cost_usd = 0.250000001;
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(cost),
    ),
  ).toContain("post_submission_job_scope_state_or_caps_invalid");

  const billable = marketContextPilotPostSubmissionFixtureV2();
  billable.batch_job.billed_size_bytes = 32 * 1024 * 1024 + 1;
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(billable),
    ),
  ).toContain("post_submission_job_scope_state_or_caps_invalid");
});

test("provider-internal revisions are never invented and public provenance must remain exact", () => {
  const pre = marketContextPilotPreSubmissionFixtureV2();
  pre.provider_provenance.internal_provider_build.status =
    "verified" as "not_exposed_by_provider";
  expect(
    errorCodes(evaluateMarketContextPilotPreSubmissionAdmissionV2(pre)),
  ).toContain("pre_submission_provider_provenance_policy_invalid");

  const post = marketContextPilotPostSubmissionFixtureV2();
  post.provider_provenance.internal_dataset_revision.status =
    "verified" as "not_exposed_by_provider";
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(post),
    ),
  ).toContain("post_submission_provider_provenance_invalid");

  const jobDigest = marketContextPilotPostSubmissionFixtureV2();
  jobDigest.batch_job.job_metadata_sha256 = "f".repeat(64);
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(jobDigest),
    ),
  ).toContain("post_submission_job_metadata_digest_invalid");

  const timestampOrder = marketContextPilotPostSubmissionFixtureV2();
  timestampOrder.batch_job.timestamps.process_done =
    "2026-07-27T14:05:49.000000000Z";
  const timestampOrderCore: Partial<
    typeof timestampOrder.batch_job
  > = { ...timestampOrder.batch_job };
  delete timestampOrderCore.job_metadata_sha256;
  timestampOrder.batch_job.job_metadata_sha256 =
    computeMarketContextPilotJobMetadataDigestV2(
      timestampOrderCore as Omit<
        typeof timestampOrder.batch_job,
        "job_metadata_sha256"
      >,
    );
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(
        timestampOrder,
      ),
    ),
  ).toContain("post_submission_job_timestamp_order_invalid");
});

test("quote must still have been fresh at the actual batch submission instant", () => {
  const fixture = marketContextPilotPostSubmissionFixtureV2();
  fixture.batch_submission.submitted_at_unix_ns = (
    BigInt(fixture.pre_submission_input.quote.quoted_at_unix_ns) +
    BigInt(901_000_000_000)
  ).toString();
  fixture.evaluated_at_unix_ns = (
    BigInt(fixture.batch_submission.submitted_at_unix_ns) +
    BigInt(1_000_000_000)
  ).toString();
  expect(
    errorCodes(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(fixture),
    ),
  ).toContain(
    "post_submission_timestamp_or_submission_evidence_invalid",
  );
});

test("reorderable inputs are deterministic and remain immutable", () => {
  const firstPre = marketContextPilotPreSubmissionFixtureV2();
  const secondPre = marketContextPilotPreSubmissionFixtureV2();
  secondPre.scope.symbols.reverse();
  secondPre.quote.conditions.reverse();
  const firstPreResult =
    evaluateMarketContextPilotPreSubmissionAdmissionV2(firstPre);
  const secondPreResult =
    evaluateMarketContextPilotPreSubmissionAdmissionV2(secondPre);
  expect(firstPreResult).toEqual(secondPreResult);

  const firstPost = marketContextPilotPostSubmissionFixtureV2();
  const secondPost = marketContextPilotPostSubmissionFixtureV2();
  secondPost.pre_submission_input.scope.symbols.reverse();
  secondPost.pre_submission_input.quote.conditions.reverse();
  const refreshedPre =
    evaluateMarketContextPilotPreSubmissionAdmissionV2(
      secondPost.pre_submission_input,
    );
  expect(refreshedPre.status).toBe(
    "ready_for_separate_batch_submission_authorization",
  );
  if (
    refreshedPre.status !==
    "ready_for_separate_batch_submission_authorization"
  ) {
    return;
  }
  secondPost.pre_submission_decision_digest =
    refreshedPre.pre_submission_decision_digest;
  secondPost.batch_job.scope.symbols.reverse();
  secondPost.provider_manifest.scope.symbols.reverse();
  secondPost.provider_manifest.files.reverse();
  const firstPostResult =
    evaluateMarketContextPilotPostSubmissionAdmissionV2(firstPost);
  const secondPostResult =
    evaluateMarketContextPilotPostSubmissionAdmissionV2(secondPost);
  expect(firstPostResult).toEqual(secondPostResult);
});

test("malformed runtime inputs reject without uncaught exceptions", () => {
  for (const input of [null, {}, [], { quote: null }]) {
    expect(() =>
      evaluateMarketContextPilotPreSubmissionAdmissionV2(input),
    ).not.toThrow();
    expect(
      evaluateMarketContextPilotPreSubmissionAdmissionV2(input)
        .status,
    ).toBe("not_admitted");
    expect(() =>
      evaluateMarketContextPilotPostSubmissionAdmissionV2(input),
    ).not.toThrow();
    expect(
      evaluateMarketContextPilotPostSubmissionAdmissionV2(input)
        .status,
    ).toBe("not_admitted");
  }
});

test("fixed M.4A cross-process digest", () => {
  const pre = evaluateMarketContextPilotPreSubmissionAdmissionV2(
    marketContextPilotPreSubmissionFixtureV2(),
  );
  const post = evaluateMarketContextPilotPostSubmissionAdmissionV2(
    marketContextPilotPostSubmissionFixtureV2(),
  );
  const digest =
    pre.status ===
      "ready_for_separate_batch_submission_authorization" &&
    post.status ===
      "ready_for_separate_file_download_authorization"
      ? `${MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_SHA256}:${pre.pre_submission_decision_digest}:${post.admission_digest}`
      : "invalid";
  expect(digest).toMatch(
    /^[a-f0-9]{64}:[a-f0-9]{64}:[a-f0-9]{64}$/,
  );
  console.log(`ACTION_667M4A_TZ_DIGEST=${digest}`);
});

test("UTC, Stockholm, and New York processes are byte-identical", () => {
  const digests = [
    "UTC",
    "Europe/Stockholm",
    "America/New_York",
  ].map((timezone) => {
    const child = spawnSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        "tests/e2e/action-667m4a-two-stage-batch-admission.spec.ts",
        "--grep",
        "fixed M.4A cross-process digest",
        "--reporter=line",
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TZ: timezone,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
          FORCE_COLOR: "0",
        },
      },
    );
    expect(child.status, child.stderr).toBe(0);
    return child.stdout.match(
      /ACTION_667M4A_TZ_DIGEST=([a-f0-9:]+)/,
    )?.[1];
  });
  expect(new Set(digests).size).toBe(1);
});

test("M.4A modules have no credential, provider client, database, replay, or live imports", () => {
  const files = [
    "lib/market-context-intelligence-lab/xnys-acquisition-calendar-2026-v1.ts",
    "lib/market-context-intelligence-lab/five-session-pilot-two-stage-admission-v2.ts",
    "lib/market-context-intelligence-lab/action-667m4a-fixtures-v1.ts",
  ];
  const contents = files.map((path) =>
    readFileSync(resolve(repositoryRoot, path), "utf8"),
  );
  const imports = contents.flatMap((content) =>
    Array.from(content.matchAll(/from\s+["']([^"']+)["']/g)).map(
      (match) => match[1] ?? "",
    ),
  );
  expect(
    imports.some((source) =>
      /databento$|supabase|provider-client|collector|scanner|recommendation|shadow-replay|app\/api/.test(
        source,
      ),
    ),
  ).toBe(false);
  expect(contents.join("\n")).not.toContain("DATABENTO_API_KEY");
});
