import { createHash } from "node:crypto";

import {
  MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_DESTINATION,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_END,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_START,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_SYMBOLS_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_XNYS_SESSIONS_V1,
  computeMarketContextPilotCalendarDigestV1,
  type MarketContextFiveSessionPilotAdmissionInputV1,
} from "./five-session-pilot-admission-v1";
import {
  MARKET_CONTEXT_DBN_EXTRACTION_LINEAGE_V1,
  MARKET_CONTEXT_HISTORICAL_DATASET_NS_CANONICAL_JSON_V1,
  MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1,
  type MarketContextHistoricalNanosecondReceiverMetadataV1,
} from "./historical-dataset-nanosecond-receiver-v1";
import {
  MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1,
  bindMarketContextTradePreparationToM1V2,
} from "./trade-to-candle-m1-binding-v2";
import {
  fixtureUnixNsV2,
  marketContextTradeM1BindingMetadataFixtureV2,
  marketContextTradeManifestFixtureV2,
  marketContextTradePreparationFixtureV2,
  rehashMarketContextTradeInputV2,
} from "./trade-to-candle-preparation-fixtures-v2";
import {
  MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2,
  prepareMarketContextTradesToCandlesV2,
  stableMarketContextTradePreparationJsonV2,
} from "./trade-to-candle-preparation-v2";

export const MARKET_CONTEXT_ACTION_667M3A_SYNTHETIC_FIXTURES_V1 =
  "market_context_action_667m3a_synthetic_fixtures_v1" as const;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function marketContextNanosecondReceiverFixtureV1() {
  const tradeInput = marketContextTradePreparationFixtureV2();
  tradeInput.manifest = marketContextTradeManifestFixtureV2({
    sessions: [
      {
        session_id: "XNYS-2026-03-09-regular",
        session_date: "2026-03-09",
        session_type: "regular",
        exchange_timezone: "America/New_York",
        open_unix_ns: fixtureUnixNsV2("2026-03-09T13:30:00Z"),
        close_unix_ns: fixtureUnixNsV2("2026-03-09T13:33:00Z"),
      },
    ],
  });
  rehashMarketContextTradeInputV2(tradeInput);
  const prepared = prepareMarketContextTradesToCandlesV2(tradeInput);
  if (prepared.status !== "prepared") {
    throw new Error(
      `synthetic_preparation_failed:${prepared.error_codes.join(",")}`,
    );
  }
  const bindingMetadata =
    marketContextTradeM1BindingMetadataFixtureV2(prepared);
  const bound = bindMarketContextTradePreparationToM1V2({
    prepared,
    metadata: bindingMetadata,
  });
  if (bound.status !== "bindable") {
    throw new Error(
      `synthetic_binding_failed:${bound.error_codes.join(",")}`,
    );
  }
  const sourceFileId = "synthetic-five-session-pilot.dbn.zst";
  const metadata: MarketContextHistoricalNanosecondReceiverMetadataV1 =
    {
      receiver_version:
        MARKET_CONTEXT_HISTORICAL_DATASET_NS_RECEIVER_V1,
      extension_version:
        MARKET_CONTEXT_HISTORICAL_DATASET_NS_EXTENSION_V1,
      canonicalization_version:
        MARKET_CONTEXT_HISTORICAL_DATASET_NS_CANONICAL_JSON_V1,
      provider_revision: {
        provider_build: prepared.candles[0]!.provider_build,
        encoder_build: "synthetic_dbn_zstd_encoder_build_1",
        dataset_revision: prepared.candles[0]!.provider_revision,
        revision_evidence_reference:
          "repository:synthetic-action-667m3a-revision-evidence",
        revision_evidence_sha256: sha256(
          "synthetic revision evidence",
        ),
      },
      stable_tiebreak_evidence: {
        status: "documented_stable",
        policy_reference:
          "repository:synthetic-global-record-identity-policy",
        evidence_sha256: sha256("synthetic stable tiebreak evidence"),
      },
      license_reference: {
        status: "written_confirmed",
        reference_id: "synthetic-fixture-license-only",
        evidence_sha256: sha256("synthetic license evidence"),
      },
      publisher_semantics: {
        publisher_id: 95,
        required_action: "T",
        allowed_flags_mask: 129,
        conditions_policy: "empty_only_fail_closed",
        unknown_action_policy: "reject",
        unknown_flag_policy: "reject",
        unknown_sale_condition_policy: "reject",
      },
      source_files: [
        {
          source_file_id: sourceFileId,
          media_type: "application/vnd.databento.dbn",
          compression: "zstd",
          compressed_bytes: 512,
          compressed_sha256: sha256("synthetic compressed DBN"),
          uncompressed_bytes: 2048,
          uncompressed_sha256: sha256("synthetic uncompressed DBN"),
        },
      ],
      extraction_lineage: bound.metadata.raw_files.map((file) => {
        const core = {
          normalized_file_id: file.file_id,
          source_file_id: sourceFileId,
          extraction_policy_version:
            MARKET_CONTEXT_DBN_EXTRACTION_LINEAGE_V1,
          decoder_build: "synthetic_dbn_decoder_build_1",
        };
        return {
          ...core,
          lineage_sha256: sha256(
            stableMarketContextTradePreparationJsonV2(core),
          ),
        };
      }),
    };
  return { tradeInput, prepared, bound, metadata };
}

export function marketContextFiveSessionPilotAdmissionFixtureV1():
  MarketContextFiveSessionPilotAdmissionInputV1 {
  const calendarCore = {
    artifact_id: "synthetic-xnys-five-session-pilot-calendar",
    artifact_version: "synthetic_xnys_2026_07_20_24_v1",
    exchange: "XNYS" as const,
    timezone: "America/New_York" as const,
    source_reference:
      "repository:synthetic-action-667m3a-calendar-evidence",
    sessions: MARKET_CONTEXT_FIVE_SESSION_PILOT_XNYS_SESSIONS_V1.map(
      (session) => ({ ...session }),
    ),
  };
  const calendar = {
    ...calendarCore,
    artifact_sha256:
      computeMarketContextPilotCalendarDigestV1(calendarCore),
  };
  return {
    contract_version:
      MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1,
    policy_version: MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1,
    admission_stage: "post_download_verification",
    evaluated_at_unix_ns: fixtureUnixNsV2(
      "2026-07-27T10:00:00Z",
    ),
    dataset: {
      provider: "databento",
      dataset_id: "EQUS.MINI",
      schema: "trades",
      encoding: "dbn",
      compression: "zstd",
      publisher_id: 95,
      adjustment_state: "raw_unadjusted",
    },
    symbols: MARKET_CONTEXT_FIVE_SESSION_PILOT_SYMBOLS_V1.map(
      (symbol) => ({ ...symbol }),
    ),
    interval: {
      start: MARKET_CONTEXT_FIVE_SESSION_PILOT_START,
      end_exclusive: MARKET_CONTEXT_FIVE_SESSION_PILOT_END,
    },
    quote: {
      quoted_at_unix_ns: fixtureUnixNsV2(
        "2026-07-27T09:55:00Z",
      ),
      entitlement_checked_at_unix_ns: fixtureUnixNsV2(
        "2026-07-27T09:55:00Z",
      ),
      evidence_sha256: sha256("synthetic pre-download quote"),
      exact_record_count: 516_162,
      billable_uncompressed_bytes: 24_775_776,
      estimated_transfer_bytes: 12_000_000,
      estimated_cost_usd: 0.13844554752111435,
      quote_validity: "refresh_required_before_download",
      conditions: MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1.map(
        (date) => ({
          date,
          condition: "available" as const,
          last_modified_date: "2026-07-26",
        }),
      ),
      entitlement_range: {
        start: "2018-05-01T00:00:00Z",
        end_exclusive: "2026-07-27T00:00:00Z",
      },
    },
    calendar,
    provider_revision: {
      provider_build: "synthetic_provider_build_1",
      encoder_build: "synthetic_dbn_zstd_encoder_build_1",
      dataset_revision: "synthetic_EQUS_MINI_revision_1",
      evidence_reference:
        "repository:synthetic-action-667m3a-provider-revision",
      evidence_sha256: sha256("synthetic provider revision"),
    },
    stable_tiebreak_evidence: {
      status: "documented_stable",
      evidence_reference:
        "repository:synthetic-action-667m3a-tiebreak",
      evidence_sha256: sha256("synthetic stable tiebreak"),
    },
    publisher_semantics: {
      required_action: "T",
      allowed_flags_mask: 129,
      conditions_policy: "empty_only_fail_closed",
      unknown_action_policy: "reject",
      unknown_flag_policy: "reject",
      unknown_sale_condition_policy: "reject",
    },
    watermark: {
      policy_version: MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2,
      max_lateness_ns: "2000000000",
      evidence_status: "empirically_unvalidated",
      calibrated: false,
    },
    license: {
      status: "written_confirmed",
      reference_id: "synthetic-fixture-license-only",
      evidence_sha256: sha256("synthetic written license"),
      raw_retention_allowed: true,
      encrypted_backup_allowed: true,
      internal_non_display_research_allowed: true,
      derived_candles_allowed: true,
      derived_evidence_retention_allowed: true,
      deterministic_replay_allowed: true,
      deletion_policy: "synthetic fixture retention policy",
      audit_policy: "synthetic fixture audit policy",
      team_user_scope: "synthetic single-user fixture",
      redistribution: "forbidden",
    },
    corporate_actions: {
      status: "explicitly_excluded_raw_unadjusted",
      records_included: false,
      split_policy: "no_adjustment",
      dividend_policy: "no_adjustment",
      analytical_limitations_acknowledged: true,
      policy_reference:
        "repository:synthetic-action-667m3a-raw-unadjusted-policy",
    },
    destination: {
      path: MARKET_CONTEXT_FIVE_SESSION_PILOT_DESTINATION,
      repository_root: "/private/tmp/trade-action-667k",
      outside_repository: true,
      encrypted_volume_attested: true,
      access_control_attested: true,
    },
    lineage_plan: {
      status: "required_after_download",
      file_digest_algorithm: "sha256",
      raw_record_identity_policy: "stable_unique_required",
      raw_to_normalized_lineage: "lossless_required",
      verification_policy_reference:
        "repository:market-context-dbn-lineage-verification-v1",
    },
    post_download_lineage: {
      status: "complete",
      source_files: [
        {
          source_file_id: "synthetic-five-session-pilot.dbn.zst",
          compressed_bytes: 12_000_000,
          compressed_sha256: sha256("synthetic compressed DBN"),
          uncompressed_bytes: 24_775_776,
          uncompressed_sha256: sha256("synthetic uncompressed DBN"),
        },
      ],
      combined_local_bytes: 36_775_776,
      lineage_manifest_sha256: sha256(
        "synthetic post-download lineage manifest",
      ),
    },
  };
}
