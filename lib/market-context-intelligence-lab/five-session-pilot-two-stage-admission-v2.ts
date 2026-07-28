import { createHash } from "node:crypto";

import {
  MARKET_CONTEXT_FIVE_SESSION_PILOT_BILLABLE_CAP_BYTES,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_COST_CAP_USD,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_DESTINATION,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_END,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_LOCAL_CAP_BYTES,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_QUOTE_MAX_AGE_SECONDS,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_START,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_SYMBOLS_V1,
  MARKET_CONTEXT_FIVE_SESSION_PILOT_TRANSFER_CAP_BYTES,
} from "./five-session-pilot-admission-v1";
import { stableMarketContextTradePreparationJsonV2 } from "./trade-to-candle-preparation-v2";
import {
  MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1,
  MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_ARTIFACT,
  validateMarketContextXnysAcquisitionCalendar2026V1,
} from "./xnys-acquisition-calendar-2026-v1";

export const MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2 =
  "market_context_five_session_pilot_two_stage_admission_v2" as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2 =
  "market_context_five_session_pilot_two_stage_policy_2026_07_27_v2" as const;
export const MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1 =
  "market_context_databento_batch_provenance_v1" as const;

const expectedSymbols = MARKET_CONTEXT_FIVE_SESSION_PILOT_SYMBOLS_V1
  .map(({ symbol }) => symbol)
  .sort((left, right) => left.localeCompare(right));
const sha256Pattern = /^[0-9a-f]{64}$/;
const unsignedIntegerPattern = /^(0|[1-9][0-9]*)$/;
const nsPerSecond = BigInt("1000000000");
const maxQuoteAgeNs =
  BigInt(MARKET_CONTEXT_FIVE_SESSION_PILOT_QUOTE_MAX_AGE_SECONDS) *
  nsPerSecond;
const maxUint64 = BigInt("18446744073709551615");
const explicitInstantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

export type MarketContextPilotScopeV2 = {
  provider: "databento";
  dataset: "EQUS.MINI";
  schema: "trades";
  encoding: "dbn";
  compression: "zstd";
  publisher_id: 95;
  symbols: string[];
  start: typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_START;
  end_exclusive: typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_END;
  adjustment_state: "raw_unadjusted";
  corporate_actions_included: false;
};

export type MarketContextPilotPreSubmissionInputV2 = {
  contract_version:
    typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2;
  policy_version:
    typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2;
  admission_stage: "pre_submission_admission";
  evaluated_at_unix_ns: string;
  operator_authorizations: {
    batch_submission_authorized: false;
    download_authorized: false;
  };
  scope: MarketContextPilotScopeV2;
  quote: {
    quoted_at_unix_ns: string;
    entitlement_checked_at_unix_ns: string;
    evidence_sha256: string;
    record_count: number;
    billable_bytes: number;
    cost_usd: number;
    entitlement_start: string;
    entitlement_end_exclusive: string;
    conditions: Array<{
      date: string;
      condition: "available" | "degraded" | "missing" | "partial";
    }>;
  };
  license_readiness: {
    evidence_version:
      "market_context_action_667m3d_provider_verbatim_license_evidence_v1";
    evidence_freeze_digest:
      "c9398b9c2321ed778ea089931a7491c03ed7b91cf8ba6bade72b239c2dd5330c";
    license_sufficient: true;
    internal_non_display: true;
    organization_scope: true;
    redistribution_allowed: false;
  };
  destination: {
    path: typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_DESTINATION;
    repository_root: "/private/tmp/trade-action-667k";
    outside_repository: true;
    underlying_volume_encrypted: true;
    access_control_policy: "owner_only_before_download";
    free_bytes: number;
  };
  calendar: typeof MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1_ARTIFACT;
  provider_provenance: {
    policy_version: typeof MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1;
    internal_provider_build: {
      status: "not_exposed_by_provider";
    };
    internal_dataset_revision: {
      status: "not_exposed_by_provider";
    };
    sdk: {
      name: "databento";
      version: string;
    };
    decoder: {
      name: "databento-dbn";
      version: string;
      dbn_format_version_source: "file_header_after_download";
    };
    public_evidence_sha256: string;
  };
};

export type MarketContextPilotBatchFileV2 = {
  filename: string;
  file_kind: "condition" | "manifest" | "metadata" | "market_data";
  data_domain: "support" | "trades";
  size_bytes: number;
  provider_sha256: string;
};

export type MarketContextPilotPostSubmissionInputV2 = {
  contract_version:
    typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2;
  policy_version:
    typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2;
  admission_stage: "post_submission_pre_download_admission";
  evaluated_at_unix_ns: string;
  operator_authorizations: {
    download_authorized: false;
  };
  pre_submission_input: MarketContextPilotPreSubmissionInputV2;
  pre_submission_decision_digest: string;
  batch_submission: {
    submitted_at_unix_ns: string;
    separate_operator_authorization_evidence_sha256: string;
  };
  batch_job: {
    state: "done" | "queued" | "processing" | "expired";
    provider_job_identity_sha256: string;
    scope: MarketContextPilotScopeV2;
    record_count: number | null;
    billed_size_bytes: number | null;
    actual_size_bytes: number | null;
    package_size_bytes: number | null;
    cost_usd: number | null;
    timestamps: {
      received: string;
      queued: string;
      process_start: string;
      process_done: string;
    };
    job_metadata_sha256: string;
  };
  provider_manifest: {
    status: "complete" | "incomplete";
    scope: MarketContextPilotScopeV2;
    files: MarketContextPilotBatchFileV2[];
    files_canonical_sha256: string;
    declared_transfer_bytes: number | null;
    local_total_policy:
      "package_bytes_plus_equal_atomic_download_reserve";
    calculated_local_total_bytes: number | null;
  };
  provider_provenance: {
    policy_version: typeof MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1;
    internal_provider_build: {
      status: "not_exposed_by_provider";
    };
    internal_dataset_revision: {
      status: "not_exposed_by_provider";
    };
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
    ];
    verifiable_file_fields: ["filename", "size", "sha256"];
    dbn_header_verification: "required_after_download";
    local_file_sha256: "required_after_download";
    sdk: {
      name: "databento";
      version: string;
    };
    decoder: {
      name: "databento-dbn";
      version: string;
    };
    evidence_sha256: string;
  };
  inspection_attestation: {
    metadata_only: true;
    market_records_received: false;
    files_downloaded: false;
  };
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function validSha256(value: unknown): value is string {
  return typeof value === "string" && sha256Pattern.test(value);
}

function validPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function parseNs(value: unknown) {
  if (
    typeof value !== "string" ||
    !unsignedIntegerPattern.test(value)
  ) {
    return null;
  }
  try {
    const parsed = BigInt(value);
    return parsed <= maxUint64 ? parsed : null;
  } catch {
    return null;
  }
}

function parseExplicitInstantMs(value: unknown) {
  if (
    typeof value !== "string" ||
    !explicitInstantPattern.test(value)
  ) {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validScope(value: unknown): value is MarketContextPilotScopeV2 {
  const scope = value as MarketContextPilotScopeV2;
  return (
    scope?.provider === "databento" &&
    scope.dataset === "EQUS.MINI" &&
    scope.schema === "trades" &&
    scope.encoding === "dbn" &&
    scope.compression === "zstd" &&
    scope.publisher_id === 95 &&
    scope.start === MARKET_CONTEXT_FIVE_SESSION_PILOT_START &&
    scope.end_exclusive === MARKET_CONTEXT_FIVE_SESSION_PILOT_END &&
    scope.adjustment_state === "raw_unadjusted" &&
    scope.corporate_actions_included === false &&
    Array.isArray(scope.symbols) &&
    new Set(scope.symbols).size === expectedSymbols.length &&
    stableMarketContextTradePreparationJsonV2(
      [...scope.symbols].sort((left, right) =>
        left.localeCompare(right),
      ),
    ) === stableMarketContextTradePreparationJsonV2(expectedSymbols)
  );
}

export function computeMarketContextPilotScopeDigestV2(
  scope: MarketContextPilotScopeV2,
) {
  return sha256(
    stableMarketContextTradePreparationJsonV2({
      ...scope,
      symbols: [...scope.symbols].sort((left, right) =>
        left.localeCompare(right),
      ),
    }),
  );
}

export function computeMarketContextPilotBatchFilesDigestV2(
  files: MarketContextPilotBatchFileV2[],
) {
  return sha256(
    stableMarketContextTradePreparationJsonV2(
      [...files].sort((left, right) =>
        left.filename.localeCompare(right.filename),
      ),
    ),
  );
}

export function computeMarketContextPilotJobMetadataDigestV2(
  job: Omit<
    MarketContextPilotPostSubmissionInputV2["batch_job"],
    "job_metadata_sha256"
  >,
) {
  return sha256(
    stableMarketContextTradePreparationJsonV2({
      ...job,
      scope: {
        ...job.scope,
        symbols: [...job.scope.symbols].sort((left, right) =>
          left.localeCompare(right),
        ),
      },
    }),
  );
}

function canonicalPreSubmissionInput(
  value: MarketContextPilotPreSubmissionInputV2,
) {
  return {
    ...value,
    scope: {
      ...value.scope,
      symbols: [...value.scope.symbols].sort((left, right) =>
        left.localeCompare(right),
      ),
    },
    quote: {
      ...value.quote,
      conditions: [...value.quote.conditions].sort((left, right) =>
        left.date.localeCompare(right.date),
      ),
    },
  };
}

function canonicalPostSubmissionInput(
  value: MarketContextPilotPostSubmissionInputV2,
) {
  return {
    ...value,
    pre_submission_input: canonicalPreSubmissionInput(
      value.pre_submission_input,
    ),
    batch_job: {
      ...value.batch_job,
      scope: {
        ...value.batch_job.scope,
        symbols: [...value.batch_job.scope.symbols].sort((left, right) =>
          left.localeCompare(right),
        ),
      },
    },
    provider_manifest: {
      ...value.provider_manifest,
      scope: {
        ...value.provider_manifest.scope,
        symbols: [...value.provider_manifest.scope.symbols].sort(
          (left, right) => left.localeCompare(right),
        ),
      },
      files: [...value.provider_manifest.files].sort((left, right) =>
        left.filename.localeCompare(right.filename),
      ),
    },
  };
}

function fail(stage: string, errors: Set<string>) {
  return {
    status: "not_admitted" as const,
    admission_stage: stage,
    contract_version:
      MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2,
    error_codes: [...errors].sort((left, right) =>
      left.localeCompare(right),
    ),
    metadata_inferred: false as const,
    batch_submission_authorized: false as const,
    download_authorized: false as const,
    normalization_authorized: false as const,
    replay_authorized: false as const,
    canonical_binding_ready: false as const,
    shadow_only: true as const,
    live_ranking_effect: false as const,
  };
}

export function evaluateMarketContextPilotPreSubmissionAdmissionV2(
  input: unknown,
) {
  const errors = new Set<string>();
  try {
    const value = input as MarketContextPilotPreSubmissionInputV2;
    const before = stableMarketContextTradePreparationJsonV2(value);
    if (
      value?.contract_version !==
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2 ||
      value?.policy_version !==
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2 ||
      value?.admission_stage !== "pre_submission_admission"
    ) {
      errors.add("pre_submission_contract_or_stage_invalid");
    }
    if (!validScope(value?.scope)) {
      errors.add("pre_submission_scope_mismatch");
    }
    if (
      value?.operator_authorizations?.batch_submission_authorized !==
        false ||
      value?.operator_authorizations?.download_authorized !== false
    ) {
      errors.add("pre_submission_authorization_must_default_false");
    }

    const evaluatedAt = parseNs(value?.evaluated_at_unix_ns);
    const quotedAt = parseNs(value?.quote?.quoted_at_unix_ns);
    const entitlementAt = parseNs(
      value?.quote?.entitlement_checked_at_unix_ns,
    );
    let quoteAgeSeconds: number | null = null;
    let entitlementAgeSeconds: number | null = null;
    if (
      evaluatedAt === null ||
      quotedAt === null ||
      entitlementAt === null ||
      quotedAt > evaluatedAt ||
      entitlementAt > evaluatedAt
    ) {
      errors.add("pre_submission_quote_timestamp_invalid");
    } else {
      const quoteAgeNs = evaluatedAt - quotedAt;
      const entitlementAgeNs = evaluatedAt - entitlementAt;
      quoteAgeSeconds = Number(quoteAgeNs) / Number(nsPerSecond);
      entitlementAgeSeconds =
        Number(entitlementAgeNs) / Number(nsPerSecond);
      if (
        quoteAgeNs > maxQuoteAgeNs ||
        entitlementAgeNs > maxQuoteAgeNs
      ) {
        errors.add("pre_submission_quote_or_entitlement_stale");
      }
    }
    const quote = value?.quote;
    if (
      !validSha256(quote?.evidence_sha256) ||
      !validPositiveInteger(quote?.record_count) ||
      !validPositiveInteger(quote?.billable_bytes) ||
      quote.billable_bytes >
        MARKET_CONTEXT_FIVE_SESSION_PILOT_BILLABLE_CAP_BYTES ||
      typeof quote?.cost_usd !== "number" ||
      !Number.isFinite(quote.cost_usd) ||
      quote.cost_usd < 0 ||
      quote.cost_usd >
        MARKET_CONTEXT_FIVE_SESSION_PILOT_COST_CAP_USD
    ) {
      errors.add("pre_submission_quote_or_cap_invalid");
    }
    const expectedDates = new Set(
      MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1,
    );
    const entitlementStart = parseExplicitInstantMs(
      quote?.entitlement_start,
    );
    const entitlementEnd = parseExplicitInstantMs(
      quote?.entitlement_end_exclusive,
    );
    if (
      !Array.isArray(quote?.conditions) ||
      quote.conditions.length !== expectedDates.size ||
      new Set(quote.conditions.map(({ date }) => date)).size !==
        expectedDates.size ||
      quote.conditions.some(
        ({ date, condition }) =>
          !expectedDates.has(
            date as (typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1)[number],
          ) || condition !== "available",
      ) ||
      entitlementStart === null ||
      entitlementEnd === null ||
      entitlementStart >
        Date.parse(MARKET_CONTEXT_FIVE_SESSION_PILOT_START) ||
      entitlementEnd <
        Date.parse(MARKET_CONTEXT_FIVE_SESSION_PILOT_END)
    ) {
      errors.add(
        "pre_submission_entitlement_or_session_conditions_invalid",
      );
    }

    const license = value?.license_readiness;
    if (
      license?.evidence_version !==
        "market_context_action_667m3d_provider_verbatim_license_evidence_v1" ||
      license?.evidence_freeze_digest !==
        "c9398b9c2321ed778ea089931a7491c03ed7b91cf8ba6bade72b239c2dd5330c" ||
      license?.license_sufficient !== true ||
      license?.internal_non_display !== true ||
      license?.organization_scope !== true ||
      license?.redistribution_allowed !== false
    ) {
      errors.add("pre_submission_m3d_license_readiness_invalid");
    }
    const destination = value?.destination;
    if (
      destination?.path !==
        MARKET_CONTEXT_FIVE_SESSION_PILOT_DESTINATION ||
      destination?.repository_root !==
        "/private/tmp/trade-action-667k" ||
      destination?.outside_repository !== true ||
      destination?.underlying_volume_encrypted !== true ||
      destination?.access_control_policy !==
        "owner_only_before_download" ||
      !validPositiveInteger(destination?.free_bytes) ||
      destination.free_bytes <
        MARKET_CONTEXT_FIVE_SESSION_PILOT_LOCAL_CAP_BYTES ||
      destination.path.startsWith(`${destination.repository_root}/`)
    ) {
      errors.add("pre_submission_destination_or_free_space_invalid");
    }
    if (
      validateMarketContextXnysAcquisitionCalendar2026V1(
        value?.calendar,
      ).status !== "valid_calendar"
    ) {
      errors.add("pre_submission_calendar_invalid");
    }
    const provenance = value?.provider_provenance;
    if (
      provenance?.policy_version !==
        MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1 ||
      provenance?.internal_provider_build?.status !==
        "not_exposed_by_provider" ||
      provenance?.internal_dataset_revision?.status !==
        "not_exposed_by_provider" ||
      provenance?.sdk?.name !== "databento" ||
      !provenance.sdk.version ||
      provenance?.decoder?.name !== "databento-dbn" ||
      !provenance.decoder.version ||
      provenance?.decoder?.dbn_format_version_source !==
        "file_header_after_download" ||
      !validSha256(provenance?.public_evidence_sha256)
    ) {
      errors.add("pre_submission_provider_provenance_policy_invalid");
    }
    if (
      stableMarketContextTradePreparationJsonV2(value) !== before
    ) {
      errors.add("pre_submission_input_mutated");
    }
    if (errors.size > 0) {
      return fail("pre_submission_admission", errors);
    }
    const inputDigest = sha256(
      stableMarketContextTradePreparationJsonV2(
        canonicalPreSubmissionInput(value),
      ),
    );
    const scopeDigest = computeMarketContextPilotScopeDigestV2(
      value.scope,
    );
    return {
      status:
        "ready_for_separate_batch_submission_authorization" as const,
      admission_stage: "pre_submission_admission" as const,
      contract_version:
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2,
      policy_version:
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2,
      pre_submission_decision_digest: sha256(
        stableMarketContextTradePreparationJsonV2({
          input_digest: inputDigest,
          scope_digest: scopeDigest,
          calendar_sha256: value.calendar.artifact_sha256,
        }),
      ),
      scope_digest: scopeDigest,
      quote_age_seconds: quoteAgeSeconds!,
      entitlement_age_seconds: entitlementAgeSeconds!,
      calendar_version:
        MARKET_CONTEXT_XNYS_ACQUISITION_CALENDAR_2026_V1,
      provider_internal_revision_status:
        "not_exposed_by_provider" as const,
      metadata_inferred: false as const,
      batch_submission_authorized: false as const,
      download_authorized: false as const,
      normalization_authorized: false as const,
      replay_authorized: false as const,
      canonical_binding_ready: false as const,
      shadow_only: true as const,
      live_ranking_effect: false as const,
    };
  } catch {
    errors.add("pre_submission_malformed_runtime_input");
    return fail("pre_submission_admission", errors);
  }
}

function validFiles(
  manifest: MarketContextPilotPostSubmissionInputV2["provider_manifest"],
  errors: Set<string>,
) {
  if (
    manifest?.status !== "complete" ||
    !Array.isArray(manifest?.files) ||
    manifest.files.length < 4 ||
    new Set(manifest.files.map(({ filename }) => filename)).size !==
      manifest.files.length
  ) {
    errors.add("post_submission_file_manifest_incomplete");
    return;
  }
  const required = new Map([
    ["condition.json", "condition"],
    ["manifest.json", "manifest"],
    ["metadata.json", "metadata"],
  ]);
  for (const file of manifest.files) {
    const expectedSupportKind = required.get(file.filename);
    const dataName = /^[a-z0-9._-]+\.trades\.dbn\.zst$/i.test(
      file.filename,
    );
    if (
      !validPositiveInteger(file.size_bytes) ||
      !validSha256(file.provider_sha256) ||
      (expectedSupportKind !== undefined &&
        (file.file_kind !== expectedSupportKind ||
          file.data_domain !== "support")) ||
      (expectedSupportKind === undefined &&
        (!dataName ||
          file.file_kind !== "market_data" ||
          file.data_domain !== "trades"))
    ) {
      errors.add("post_submission_unexpected_file_or_data_domain");
    }
  }
  for (const name of required.keys()) {
    if (!manifest.files.some(({ filename }) => filename === name)) {
      errors.add("post_submission_file_manifest_incomplete");
    }
  }
  if (
    !manifest.files.some(({ file_kind }) => file_kind === "market_data")
  ) {
    errors.add("post_submission_file_manifest_incomplete");
  }
}

export function evaluateMarketContextPilotPostSubmissionAdmissionV2(
  input: unknown,
) {
  const errors = new Set<string>();
  try {
    const value = input as MarketContextPilotPostSubmissionInputV2;
    const before = stableMarketContextTradePreparationJsonV2(value);
    if (
      value?.contract_version !==
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2 ||
      value?.policy_version !==
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2 ||
      value?.admission_stage !==
        "post_submission_pre_download_admission"
    ) {
      errors.add("post_submission_contract_or_stage_invalid");
    }
    if (value?.operator_authorizations?.download_authorized !== false) {
      errors.add("post_submission_download_authorization_must_be_false");
    }
    const pre = evaluateMarketContextPilotPreSubmissionAdmissionV2(
      value?.pre_submission_input,
    );
    if (
      pre.status !==
        "ready_for_separate_batch_submission_authorization" ||
      !validSha256(value?.pre_submission_decision_digest) ||
      value.pre_submission_decision_digest !==
        pre.pre_submission_decision_digest
    ) {
      errors.add("post_submission_pre_submission_receipt_invalid");
    }
    const evaluatedAt = parseNs(value?.evaluated_at_unix_ns);
    const submittedAt = parseNs(
      value?.batch_submission?.submitted_at_unix_ns,
    );
    const quotedAt = parseNs(
      value?.pre_submission_input?.quote?.quoted_at_unix_ns,
    );
    const entitlementAt = parseNs(
      value?.pre_submission_input?.quote
        ?.entitlement_checked_at_unix_ns,
    );
    if (
      evaluatedAt === null ||
      submittedAt === null ||
      quotedAt === null ||
      entitlementAt === null ||
      submittedAt > evaluatedAt ||
      quotedAt > submittedAt ||
      entitlementAt > submittedAt ||
      submittedAt - quotedAt > maxQuoteAgeNs ||
      submittedAt - entitlementAt > maxQuoteAgeNs ||
      !validSha256(
        value?.batch_submission
          ?.separate_operator_authorization_evidence_sha256,
      )
    ) {
      errors.add("post_submission_timestamp_or_submission_evidence_invalid");
    }
    const job = value?.batch_job;
    if (
      job?.state !== "done" ||
      !validSha256(job?.provider_job_identity_sha256) ||
      !validScope(job?.scope) ||
      computeMarketContextPilotScopeDigestV2(job.scope) !==
        computeMarketContextPilotScopeDigestV2(
          value?.pre_submission_input?.scope,
        ) ||
      !validPositiveInteger(job?.record_count) ||
      !validPositiveInteger(job?.billed_size_bytes) ||
      job.billed_size_bytes >
        MARKET_CONTEXT_FIVE_SESSION_PILOT_BILLABLE_CAP_BYTES ||
      !validPositiveInteger(job?.actual_size_bytes) ||
      !validPositiveInteger(job?.package_size_bytes) ||
      job.actual_size_bytes > job.package_size_bytes ||
      typeof job?.cost_usd !== "number" ||
      !Number.isFinite(job.cost_usd) ||
      job.cost_usd < 0 ||
      job.cost_usd >
        MARKET_CONTEXT_FIVE_SESSION_PILOT_COST_CAP_USD ||
      [
        job?.timestamps?.received,
        job?.timestamps?.queued,
        job?.timestamps?.process_start,
        job?.timestamps?.process_done,
      ].some((timestamp) => parseExplicitInstantMs(timestamp) === null) ||
      !validSha256(job?.job_metadata_sha256)
    ) {
      errors.add("post_submission_job_scope_state_or_caps_invalid");
    }
    const jobTimestamps = [
      parseExplicitInstantMs(job?.timestamps?.received),
      parseExplicitInstantMs(job?.timestamps?.queued),
      parseExplicitInstantMs(job?.timestamps?.process_start),
      parseExplicitInstantMs(job?.timestamps?.process_done),
    ];
    if (
      jobTimestamps.every(
        (timestamp): timestamp is number => timestamp !== null,
      ) &&
      jobTimestamps.some(
        (timestamp, index) =>
          index > 0 && timestamp < jobTimestamps[index - 1]!,
      )
    ) {
      errors.add("post_submission_job_timestamp_order_invalid");
    }
    if (job && validSha256(job.job_metadata_sha256)) {
      const jobCore: Partial<typeof job> = { ...job };
      delete jobCore.job_metadata_sha256;
      if (
        job.job_metadata_sha256 !==
        computeMarketContextPilotJobMetadataDigestV2(
          jobCore as Omit<typeof job, "job_metadata_sha256">,
        )
      ) {
        errors.add("post_submission_job_metadata_digest_invalid");
      }
    }
    const manifest = value?.provider_manifest;
    if (
      !validScope(manifest?.scope) ||
      computeMarketContextPilotScopeDigestV2(manifest.scope) !==
        computeMarketContextPilotScopeDigestV2(
          value?.pre_submission_input?.scope,
        )
    ) {
      errors.add("post_submission_manifest_scope_mismatch");
    }
    validFiles(manifest, errors);
    const filesDigest = Array.isArray(manifest?.files)
      ? computeMarketContextPilotBatchFilesDigestV2(manifest.files)
      : null;
    const summedTransfer = Array.isArray(manifest?.files)
      ? manifest.files.reduce(
          (sum, file) =>
            Number.isSafeInteger(file?.size_bytes)
              ? sum + file.size_bytes
              : Number.NaN,
          0,
        )
      : Number.NaN;
    if (
      !validSha256(manifest?.files_canonical_sha256) ||
      manifest.files_canonical_sha256 !== filesDigest ||
      !Number.isSafeInteger(summedTransfer) ||
      !validPositiveInteger(manifest?.declared_transfer_bytes) ||
      manifest.declared_transfer_bytes !== summedTransfer ||
      manifest.declared_transfer_bytes !== job?.package_size_bytes ||
      manifest.declared_transfer_bytes >
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TRANSFER_CAP_BYTES
    ) {
      errors.add("post_submission_transfer_missing_mismatch_or_cap_exceeded");
    }
    if (
      manifest?.local_total_policy !==
        "package_bytes_plus_equal_atomic_download_reserve" ||
      !Number.isSafeInteger(summedTransfer * 2) ||
      !validPositiveInteger(manifest?.calculated_local_total_bytes) ||
      manifest.calculated_local_total_bytes !== summedTransfer * 2 ||
      manifest.calculated_local_total_bytes >
        MARKET_CONTEXT_FIVE_SESSION_PILOT_LOCAL_CAP_BYTES ||
      manifest.calculated_local_total_bytes >
        value?.pre_submission_input?.destination?.free_bytes
    ) {
      errors.add("post_submission_local_total_missing_or_cap_exceeded");
    }
    const provenance = value?.provider_provenance;
    if (
      provenance?.policy_version !==
        MARKET_CONTEXT_DATABENTO_BATCH_PROVENANCE_V1 ||
      provenance?.internal_provider_build?.status !==
        "not_exposed_by_provider" ||
      provenance?.internal_dataset_revision?.status !==
        "not_exposed_by_provider" ||
      stableMarketContextTradePreparationJsonV2(
        provenance?.verifiable_job_fields,
      ) !==
        stableMarketContextTradePreparationJsonV2([
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
        ]) ||
      stableMarketContextTradePreparationJsonV2(
        provenance?.verifiable_file_fields,
      ) !==
        stableMarketContextTradePreparationJsonV2([
          "filename",
          "size",
          "sha256",
        ]) ||
      provenance?.dbn_header_verification !==
        "required_after_download" ||
      provenance?.local_file_sha256 !==
        "required_after_download" ||
      provenance?.sdk?.name !== "databento" ||
      provenance.sdk.version !==
        value?.pre_submission_input?.provider_provenance?.sdk
          ?.version ||
      provenance?.decoder?.name !== "databento-dbn" ||
      provenance.decoder.version !==
        value?.pre_submission_input?.provider_provenance?.decoder
          ?.version ||
      !validSha256(provenance?.evidence_sha256)
    ) {
      errors.add("post_submission_provider_provenance_invalid");
    }
    if (
      value?.inspection_attestation?.metadata_only !== true ||
      value?.inspection_attestation?.market_records_received !== false ||
      value?.inspection_attestation?.files_downloaded !== false
    ) {
      errors.add("post_submission_inspection_boundary_invalid");
    }
    if (
      stableMarketContextTradePreparationJsonV2(value) !== before
    ) {
      errors.add("post_submission_input_mutated");
    }
    if (errors.size > 0) {
      return fail(
        "post_submission_pre_download_admission",
        errors,
      );
    }
    return {
      status:
        "ready_for_separate_file_download_authorization" as const,
      admission_stage:
        "post_submission_pre_download_admission" as const,
      contract_version:
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_ADMISSION_V2,
      policy_version:
        MARKET_CONTEXT_FIVE_SESSION_PILOT_TWO_STAGE_POLICY_V2,
      admission_digest: sha256(
        stableMarketContextTradePreparationJsonV2(
          canonicalPostSubmissionInput(value),
        ),
      ),
      pre_submission_decision_digest:
        value.pre_submission_decision_digest,
      scope_digest: computeMarketContextPilotScopeDigestV2(
        value.pre_submission_input.scope,
      ),
      transfer_bytes: manifest.declared_transfer_bytes!,
      calculated_local_total_bytes:
        manifest.calculated_local_total_bytes!,
      provider_provenance_sufficient: true as const,
      raw_file_identity_status:
        "sufficient_pre_download_pending_local_sha256" as const,
      provider_internal_revision_status:
        "not_exposed_by_provider" as const,
      metadata_inferred: false as const,
      batch_submission_authorized: false as const,
      download_authorized: false as const,
      normalization_authorized: false as const,
      replay_authorized: false as const,
      canonical_binding_ready: false as const,
      rollback_policy:
        "discard_unexecuted_admission_receipt_and_require_fresh_pre_submission_admission" as const,
      shadow_only: true as const,
      live_ranking_effect: false as const,
    };
  } catch {
    errors.add("post_submission_malformed_runtime_input");
    return fail("post_submission_pre_download_admission", errors);
  }
}
