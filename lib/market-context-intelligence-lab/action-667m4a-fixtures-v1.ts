import { createHash } from "node:crypto";

import {
  MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2,
  computeMarketContextPilotBatchFilesDigestV2,
  computeMarketContextPilotJobMetadataDigestV2,
  evaluateMarketContextPilotPreSubmissionAdmissionV2,
  type MarketContextPilotBatchFileV2,
  type MarketContextPilotPostSubmissionInputV2,
  type MarketContextPilotPreSubmissionInputV2,
  type MarketContextPilotScopeV2,
} from "./five-session-pilot-two-stage-admission-v2";
import { MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_ARTIFACT } from "./xnys-acquisition-calendar-2026-v1";

export const MARKET_CONTEXT_ACTION_667M4A_SYNTHETIC_FIXTURES_V1 =
  "market_context_action_667m4a_synthetic_fixtures_v1" as const;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function unixNs(value: string) {
  return (BigInt(Date.parse(value)) * BigInt(1_000_000)).toString();
}

export function marketContextPilotScopeFixtureV2(): MarketContextPilotScopeV2 {
  return {
    provider: "databento",
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
    adjustment_state: "raw_unadjusted",
    corporate_actions_included: false,
  };
}

export function marketContextPilotPreSubmissionFixtureV2(): MarketContextPilotPreSubmissionInputV2 {
  return {
    contract_version:
      MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2,
    policy_version:
      MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2,
    admission_stage: "pre_submission_admission",
    evaluated_at_unix_ns: unixNs("2026-07-27T14:05:46Z"),
    operator_authorizations: {
      batch_submission_authorized: false,
      download_authorized: false,
    },
    scope: marketContextPilotScopeFixtureV2(),
    quote: {
      quoted_at_unix_ns: unixNs("2026-07-27T14:05:29Z"),
      entitlement_checked_at_unix_ns: unixNs(
        "2026-07-27T14:05:30Z",
      ),
      evidence_sha256: sha256("synthetic M.4A quote evidence"),
      record_count: 516_162,
      billable_bytes: 24_775_776,
      cost_usd: 0.138445436954,
      entitlement_start: "2023-03-28T00:00:00.000000000Z",
      entitlement_end_exclusive:
        "2026-07-27T04:00:00.000000000Z",
      conditions: [
        { date: "2026-07-20", condition: "available" },
        { date: "2026-07-21", condition: "available" },
        { date: "2026-07-22", condition: "available" },
        { date: "2026-07-23", condition: "available" },
        { date: "2026-07-24", condition: "available" },
      ],
    },
    license_readiness: {
      evidence_version:
        "market_context_action_667m3d_provider_verbatim_license_evidence_v1",
      evidence_freeze_digest:
        "c9398b9c2321ed778ea089931a7491c03ed7b91cf8ba6bade72b239c2dd5330c",
      license_sufficient: true,
      internal_non_display: true,
      organization_scope: true,
      redistribution_allowed: false,
    },
    destination: {
      path: "/Users/willysimonsson/Library/Application Support/trade-shadow-data/encrypted/databento/EQUS.MINI/trades/v1/raw",
      repository_root: "/private/tmp/trade-action-667k",
      outside_repository: true,
      underlying_volume_encrypted: true,
      access_control_policy: "owner_only_before_download",
      free_bytes: 14_707_425_280,
    },
    calendar: structuredClone(
      MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_ARTIFACT,
    ),
    provider_provenance: {
      policy_version: MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1,
      internal_provider_build: {
        status: "not_exposed_by_provider",
      },
      internal_dataset_revision: {
        status: "not_exposed_by_provider",
      },
      sdk: {
        name: "databento",
        version: "0.82.0",
      },
      decoder: {
        name: "databento-dbn",
        version: "0.63.0",
        dbn_format_version_source: "file_header_after_download",
      },
      public_evidence_sha256: sha256(
        "Databento public batch list_jobs list_files DBN documentation retrieved 2026-07-27",
      ),
    },
  };
}

function filesFixture(): MarketContextPilotBatchFileV2[] {
  return [
    {
      filename: "condition.json",
      file_kind: "condition",
      data_domain: "support",
      size_bytes: 512,
      provider_sha256: sha256("synthetic condition"),
    },
    {
      filename: "manifest.json",
      file_kind: "manifest",
      data_domain: "support",
      size_bytes: 2_048,
      provider_sha256: sha256("synthetic manifest"),
    },
    {
      filename: "metadata.json",
      file_kind: "metadata",
      data_domain: "support",
      size_bytes: 1_024,
      provider_sha256: sha256("synthetic metadata"),
    },
    {
      filename:
        "equs-mini-20260720-20260724.trades.dbn.zst",
      file_kind: "market_data",
      data_domain: "trades",
      size_bytes: 20_000_000,
      provider_sha256: sha256("synthetic trades dbn zstd"),
    },
  ];
}

export function marketContextPilotPostSubmissionFixtureV2(): MarketContextPilotPostSubmissionInputV2 {
  const preSubmissionInput =
    marketContextPilotPreSubmissionFixtureV2();
  const pre = evaluateMarketContextPilotPreSubmissionAdmissionV2(
    preSubmissionInput,
  );
  if (
    pre.status !==
    "ready_for_separate_batch_submission_authorization"
  ) {
    throw new Error("Synthetic pre-submission fixture is invalid");
  }
  const files = filesFixture();
  const packageSize = files.reduce(
    (total, file) => total + file.size_bytes,
    0,
  );
  const batchJobCore = {
    state: "done" as const,
    provider_job_identity_sha256: sha256(
      "synthetic provider job identity",
    ),
    scope: marketContextPilotScopeFixtureV2(),
    record_count: 516_162,
    billed_size_bytes: 24_775_776,
    actual_size_bytes: 20_000_000,
    package_size_bytes: packageSize,
    cost_usd: 0.138445436954,
    timestamps: {
      received: "2026-07-27T14:05:50.000000000Z",
      queued: "2026-07-27T14:05:50.100000000Z",
      process_start: "2026-07-27T14:05:51.000000000Z",
      process_done: "2026-07-27T14:05:59.000000000Z",
    },
  };
  return {
    contract_version:
      MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2,
    policy_version:
      MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2,
    admission_stage: "post_submission_pre_download_admission",
    evaluated_at_unix_ns: unixNs("2026-07-27T14:06:00Z"),
    operator_authorizations: {
      download_authorized: false,
    },
    pre_submission_input: preSubmissionInput,
    pre_submission_decision_digest:
      pre.pre_submission_decision_digest,
    batch_submission: {
      submitted_at_unix_ns: unixNs("2026-07-27T14:05:50Z"),
      separate_operator_authorization_evidence_sha256: sha256(
        "synthetic separate batch authorization",
      ),
    },
    batch_job: {
      ...batchJobCore,
      job_metadata_sha256:
        computeMarketContextPilotJobMetadataDigestV2(batchJobCore),
    },
    provider_manifest: {
      status: "complete",
      scope: marketContextPilotScopeFixtureV2(),
      files,
      files_canonical_sha256:
        computeMarketContextPilotBatchFilesDigestV2(files),
      declared_transfer_bytes: packageSize,
      local_total_policy:
        "package_bytes_plus_equal_atomic_download_reserve",
      calculated_local_total_bytes: packageSize * 2,
    },
    provider_provenance: {
      policy_version: MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1,
      internal_provider_build: {
        status: "not_exposed_by_provider",
      },
      internal_dataset_revision: {
        status: "not_exposed_by_provider",
      },
      verifiable_job_fields: [
        "dataset",
        "symbols",
        "schema",
        "start",
        "end",
        "encoding",
        "compression",
        "record_count",
        "billed_size",
        "actual_size",
        "package_size",
        "cost_usd",
        "state",
        "job_timestamps",
      ],
      verifiable_file_fields: ["filename", "size", "sha256"],
      dbn_header_verification: "required_after_download",
      local_file_sha256: "required_after_download",
      sdk: {
        name: "databento",
        version: "0.82.0",
      },
      decoder: {
        name: "databento-dbn",
        version: "0.63.0",
      },
      evidence_sha256: sha256(
        "synthetic batch provenance evidence",
      ),
    },
    inspection_attestation: {
      metadata_only: true,
      market_records_received: false,
      files_downloaded: false,
    },
  };
}
