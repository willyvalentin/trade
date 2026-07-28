import { expect, test } from "@playwright/test";

import {
  MARKET_CONTEXT_ACTION_667M4B2_PRE_SUBMISSION_DECISION_DIGEST,
  MARKET_CONTEXT_DATABENTO_EXISTING_JOB_SUPPORT_ADMISSION_V1,
  evaluateMarketContextDatabentoExistingJobSupportAdmissionV1,
  type MarketContextDatabentoExistingJobSupportAdmissionInputV1,
} from "@/lib/market-context-intelligence-lab/databento-existing-job-support-admission-v1";

const providerFiles = [
  {
    filename: "condition.json",
    file_kind: "condition" as const,
    data_domain: "support" as const,
    size_bytes: 602,
    provider_sha256:
      "4117c91b85dc1aac7a4e00c6a03f9eb3458f8ce6cd549c8762c55ad66c3fd22c",
  },
  {
    filename: "manifest.json",
    file_kind: "manifest" as const,
    data_domain: "support" as const,
    size_bytes: 3_433,
    provider_sha256:
      "bfcda9afd11db4054d83daf1ef8f456fac10ac0de21d2b6fa9bb7383dd37c454",
  },
  {
    filename: "metadata.json",
    file_kind: "metadata" as const,
    data_domain: "support" as const,
    size_bytes: 917,
    provider_sha256:
      "5f6c56edbb2b9c17e0188b0c0ae09a793c3b4a612eb84fe7752e636ae224e105",
  },
  ...[
    [
      "equs-mini-20260720.trades.dbn.zst",
      1_507_782,
      "d1a291e27b85bb7fcb84ef3c641740e305007954851a619d1dab6a01d8e7bcaa",
    ],
    [
      "equs-mini-20260721.trades.dbn.zst",
      1_370_766,
      "406a28eabd8069fdaf52e48324ea76bbe47521e95a0413703c6413348522b260",
    ],
    [
      "equs-mini-20260722.trades.dbn.zst",
      1_284_129,
      "161129cd3370a80cd5f6e57974795627a472588ac434859914e5cc7a0f03f18d",
    ],
    [
      "equs-mini-20260723.trades.dbn.zst",
      1_837_789,
      "0c6ffefd008a79147e481bd563b93b29528cc7345d120bfebdf3aefd3b6195dc",
    ],
    [
      "equs-mini-20260724.trades.dbn.zst",
      1_729_386,
      "6ac904b839ec8b06d2c02e94ed3520d91776ad0aebe97acc35d8a7d6535102f3",
    ],
  ].map(([filename, size_bytes, provider_sha256]) => ({
    filename: filename as string,
    file_kind: "market_data" as const,
    data_domain: "trades" as const,
    size_bytes: size_bytes as number,
    provider_sha256: provider_sha256 as string,
  })),
];

function input(): MarketContextDatabentoExistingJobSupportAdmissionInputV1 {
  return {
    contract_version:
      MARKET_CONTEXT_DATABENTO_EXISTING_JOB_SUPPORT_ADMISSION_V1,
    admission_stage: "post_submission_pre_download_admission",
    pre_submission_decision_digest:
      MARKET_CONTEXT_ACTION_667M4B2_PRE_SUBMISSION_DECISION_DIGEST,
    provider_job_identity_sha256:
      "891132899a1fdaa67b65c215024053c6b972268c4c114542e727360f64297139",
    control: {
      schema_valid: true,
      scope_digest_valid: true,
      owner_current_user: true,
      mode: "0600",
      outside_git: true,
      underlying_volume_encrypted: true,
    },
    scope: {
      dataset: "EQUS.MINI",
      schema: "trades",
      encoding: "dbn",
      compression: "zstd",
      publisher_id: 95,
      symbols: [
        "SPY",
        "QQQ",
        "XLB",
        "XLC",
        "XLE",
        "XLF",
        "XLI",
        "XLK",
        "XLP",
        "XLRE",
        "XLU",
        "XLV",
        "XLY",
      ],
      start: "2026-07-20T00:00:00Z",
      end_exclusive: "2026-07-25T00:00:00Z",
    },
    terminal_job: {
      state: "done",
      scope_exact: true,
      record_count: 516_162,
      billable_bytes: 24_775_776,
      actual_size_bytes: 24_775_776,
      package_size_bytes: 7_734_804,
      actual_cost_usd: 0.1384454369545,
    },
    inventory: {
      files: structuredClone(providerFiles),
      support_transfer_bytes: 4_952,
      market_data_transfer_bytes: 7_729_852,
      declared_total_transfer_bytes: 7_734_804,
      calculated_local_total_bytes: 15_469_608,
    },
    support_files: providerFiles
      .filter(({ data_domain }) => data_domain === "support")
      .map((file) => ({
        filename: file.filename,
        size_bytes: file.size_bytes,
        provider_sha256: file.provider_sha256,
        local_sha256: file.provider_sha256,
        size_matches: true,
        sha256_matches: true,
        mode: "0600" as const,
      })),
    support_content: {
      manifest_identity_matches_control: true,
      metadata_identity_matches_control: true,
      metadata_scope_exact: true,
      all_five_days_available: true,
      degraded_or_partial_days: 0,
      path_traversal_or_symlinks: 0,
      duplicate_filenames: 0,
      support_json_valid: true,
      market_records_read: false,
      sensitive_fields_persisted: false,
    },
    authorizations: {
      market_data_download_authorized: false,
      normalization_authorized: false,
      replay_authorized: false,
      canonical_binding_ready: false,
    },
    no_effect: {
      new_batch_submissions: 0,
      market_data_files_downloaded: 0,
      live_ranking_effect: false,
    },
  };
}

test.describe("Action 667M.4B.3 existing-job support admission", () => {
  test("accepts the exact terminal job and verified support inventory", () => {
    const fixture = input();
    const before = JSON.stringify(fixture);
    const result =
      evaluateMarketContextDatabentoExistingJobSupportAdmissionV1(
        fixture,
      );

    expect(result).toMatchObject({
      status:
        "ready_for_separate_market_data_download_authorization",
      actual_size_semantics:
        "provider_uncompressed_actual_bytes",
      package_size_semantics:
        "provider_compressed_total_transfer_bytes",
      support_files_verified: true,
      all_five_days_available: true,
      download_authorized: false,
      normalization_authorized: false,
      replay_authorized: false,
      canonical_binding_ready: false,
      live_ranking_effect: false,
    });
    expect(JSON.stringify(fixture)).toBe(before);
  });

  for (const [label, mutate] of [
    ["scope drift", (value: ReturnType<typeof input>) => {
      value.scope.dataset = "OTHER";
    }],
    ["extra provider file", (value: ReturnType<typeof input>) => {
      value.inventory.files.push({
        ...value.inventory.files[0]!,
        filename: "unexpected.json",
      });
    }],
    ["support digest mismatch", (value: ReturnType<typeof input>) => {
      value.support_files[0]!.local_sha256 = "0".repeat(64);
    }],
    ["degraded day", (value: ReturnType<typeof input>) => {
      value.support_content.degraded_or_partial_days = 1;
    }],
    ["market transfer over cap", (value: ReturnType<typeof input>) => {
      value.inventory.market_data_transfer_bytes =
        32 * 1024 * 1024 + 1;
    }],
    ["lineage drift", (value: ReturnType<typeof input>) => {
      value.pre_submission_decision_digest = "0".repeat(64);
    }],
  ] as const) {
    test(`fails closed on ${label}`, () => {
      const fixture = input();
      mutate(fixture);
      const result =
        evaluateMarketContextDatabentoExistingJobSupportAdmissionV1(
          fixture,
        );
      expect(result.status).toBe("not_ready");
      expect(result.download_authorized).toBe(false);
    });
  }
});
