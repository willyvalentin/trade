import { createHash } from "node:crypto";

import {
  MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2,
  stableMarketContextTradePreparationJsonV2,
} from "./trade-to-candle-preparation-v2";

export const MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1 =
  "market_context_five_session_pilot_admission_v1" as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1 =
  "market_context_five_session_pilot_policy_2026_07_27_v1" as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_QUOTE_MAX_AGE_SECONDS =
  900 as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_START =
  "2026-07-20T00:00:00Z" as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_END =
  "2026-07-25T00:00:00Z" as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_COST_CAP_USD =
  0.25 as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_BILLABLE_CAP_BYTES =
  33_554_432 as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_TRANSFER_CAP_BYTES =
  33_554_432 as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_LOCAL_CAP_BYTES =
  1_073_741_824 as const;
export const MARKET_CONTEXT_FIVE_SESSION_PILOT_DESTINATION =
  "/Users/willysimonsson/Library/Application Support/trade-shadow-data/encrypted/databento/EQUS.MINI/trades/v1/raw" as const;

export const MARKET_CONTEXT_FIVE_SESSION_PILOT_SYMBOLS_V1 = [
  { symbol: "SPY", instrument_id: "15144", role: "benchmark" },
  { symbol: "QQQ", instrument_id: "13340", role: "benchmark" },
  { symbol: "XLB", instrument_id: "17674", role: "sector" },
  { symbol: "XLC", instrument_id: "17675", role: "sector" },
  { symbol: "XLE", instrument_id: "17676", role: "sector" },
  { symbol: "XLF", instrument_id: "17678", role: "sector" },
  { symbol: "XLI", instrument_id: "17680", role: "sector" },
  { symbol: "XLK", instrument_id: "17681", role: "sector" },
  { symbol: "XLP", instrument_id: "17684", role: "sector" },
  { symbol: "XLRE", instrument_id: "17685", role: "sector" },
  { symbol: "XLU", instrument_id: "17690", role: "sector" },
  { symbol: "XLV", instrument_id: "17692", role: "sector" },
  { symbol: "XLY", instrument_id: "17693", role: "sector" },
] as const;

export const MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1 = [
  "2026-07-20",
  "2026-07-21",
  "2026-07-22",
  "2026-07-23",
  "2026-07-24",
] as const;

export const MARKET_CONTEXT_FIVE_SESSION_PILOT_XNYS_SESSIONS_V1 = [
  {
    date: "2026-07-20",
    open_unix_ns: "1784554200000000000",
    close_unix_ns: "1784577600000000000",
    session_type: "regular",
  },
  {
    date: "2026-07-21",
    open_unix_ns: "1784640600000000000",
    close_unix_ns: "1784664000000000000",
    session_type: "regular",
  },
  {
    date: "2026-07-22",
    open_unix_ns: "1784727000000000000",
    close_unix_ns: "1784750400000000000",
    session_type: "regular",
  },
  {
    date: "2026-07-23",
    open_unix_ns: "1784813400000000000",
    close_unix_ns: "1784836800000000000",
    session_type: "regular",
  },
  {
    date: "2026-07-24",
    open_unix_ns: "1784899800000000000",
    close_unix_ns: "1784923200000000000",
    session_type: "regular",
  },
] as const;

const sha256Pattern = /^[0-9a-f]{64}$/;
const canonicalUnsignedInteger = /^(0|[1-9][0-9]*)$/;
const explicitInstantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const maxUint64 = BigInt("18446744073709551615");
const nsPerSecond = BigInt("1000000000");

type PilotSymbolV1 =
  (typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_SYMBOLS_V1)[number];

export type MarketContextFiveSessionPilotAdmissionInputV1 = {
  contract_version:
    typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1;
  policy_version: typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1;
  admission_stage:
    | "pre_download"
    | "post_download_verification";
  evaluated_at_unix_ns: string;
  dataset: {
    provider: "databento";
    dataset_id: "EQUS.MINI";
    schema: "trades";
    encoding: "dbn";
    compression: "zstd";
    publisher_id: 95;
    adjustment_state: "raw_unadjusted";
  };
  symbols: PilotSymbolV1[];
  interval: {
    start: typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_START;
    end_exclusive: typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_END;
  };
  quote: {
    quoted_at_unix_ns: string;
    entitlement_checked_at_unix_ns: string;
    evidence_sha256: string;
    exact_record_count: number;
    billable_uncompressed_bytes: number;
    estimated_transfer_bytes: number;
    estimated_cost_usd: number;
    quote_validity: "refresh_required_before_download";
    conditions: Array<{
      date: (typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1)[number];
      condition: "available" | "degraded" | "pending" | "missing";
      last_modified_date: string;
    }>;
    entitlement_range: {
      start: string;
      end_exclusive: string;
    };
  };
  calendar: {
    artifact_id: string;
    artifact_version: string;
    exchange: "XNYS";
    timezone: "America/New_York";
    source_reference: string;
    sessions: Array<{
      date: (typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1)[number];
      open_unix_ns: string;
      close_unix_ns: string;
      session_type: "regular";
    }>;
    artifact_sha256: string;
  };
  provider_revision: {
    provider_build: string;
    encoder_build: string;
    dataset_revision: string;
    evidence_reference: string;
    evidence_sha256: string;
  };
  stable_tiebreak_evidence: {
    status: "documented_stable";
    evidence_reference: string;
    evidence_sha256: string;
  };
  publisher_semantics: {
    required_action: "T";
    allowed_flags_mask: 129;
    conditions_policy: "empty_only_fail_closed";
    unknown_action_policy: "reject";
    unknown_flag_policy: "reject";
    unknown_sale_condition_policy: "reject";
  };
  watermark: {
    policy_version:
      typeof MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2;
    max_lateness_ns: "2000000000";
    evidence_status: "empirically_unvalidated";
    calibrated: false;
  };
  license: {
    status: "written_confirmed";
    reference_id: string;
    evidence_sha256: string;
    raw_retention_allowed: true;
    encrypted_backup_allowed: true;
    internal_non_display_research_allowed: true;
    derived_candles_allowed: true;
    derived_evidence_retention_allowed: true;
    deterministic_replay_allowed: true;
    deletion_policy: string;
    audit_policy: string;
    team_user_scope: string;
    redistribution: "forbidden";
  };
  corporate_actions: {
    status: "explicitly_excluded_raw_unadjusted";
    records_included: false;
    split_policy: "no_adjustment";
    dividend_policy: "no_adjustment";
    analytical_limitations_acknowledged: true;
    policy_reference: string;
  };
  destination: {
    path: typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_DESTINATION;
    repository_root: "/private/tmp/trade-action-667k";
    outside_repository: true;
    encrypted_volume_attested: true;
    access_control_attested: true;
  };
  lineage_plan: {
    status: "required_after_download";
    file_digest_algorithm: "sha256";
    raw_record_identity_policy: "stable_unique_required";
    raw_to_normalized_lineage: "lossless_required";
    verification_policy_reference: string;
  };
  post_download_lineage:
    | {
        status: "pending_not_yet_downloaded";
        source_files: [];
        combined_local_bytes: null;
        lineage_manifest_sha256: null;
      }
    | {
        status: "complete";
        source_files: Array<{
          source_file_id: string;
          compressed_bytes: number;
          compressed_sha256: string;
          uncompressed_bytes: number;
          uncompressed_sha256: string;
        }>;
        combined_local_bytes: number;
        lineage_manifest_sha256: string;
      };
};

export type MarketContextFiveSessionPilotAdmissionResultV1 =
  | {
      status: "pre_download_requirements_satisfied";
      contract_version:
        typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1;
      policy_version:
        typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1;
      admission_digest: string;
      quote_age_seconds: number;
      entitlement_age_seconds: number;
      all_sessions_available: true;
      calendar_immutable: true;
      post_download_lineage_verified: false;
      metadata_inferred: false;
      download_authorized: false;
      dataset_acquisition_ready: false;
      normalization_authorized: false;
      replay_authorized: false;
      shadow_only: true;
      live_ranking_effect: false;
    }
  | {
      status: "admission_contract_satisfied";
      contract_version:
        typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1;
      policy_version:
        typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1;
      admission_digest: string;
      quote_age_seconds: number;
      entitlement_age_seconds: number;
      all_sessions_available: true;
      calendar_immutable: true;
      post_download_lineage_verified: true;
      metadata_inferred: false;
      download_authorized: false;
      dataset_acquisition_ready: false;
      normalization_authorized: false;
      replay_authorized: false;
      shadow_only: true;
      live_ranking_effect: false;
    }
  | {
      status: "not_admitted";
      contract_version:
        typeof MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1;
      error_codes: string[];
      metadata_inferred: false;
      download_authorized: false;
      dataset_acquisition_ready: false;
      normalization_authorized: false;
      replay_authorized: false;
      shadow_only: true;
      live_ranking_effect: false;
    };

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function identifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value === value.trim()
  );
}

function validSha256(value: unknown): value is string {
  return typeof value === "string" && sha256Pattern.test(value);
}

function parseNs(value: unknown) {
  if (
    typeof value !== "string" ||
    !canonicalUnsignedInteger.test(value)
  ) {
    return null;
  }
  try {
    const parsed = BigInt(value);
    return parsed < maxUint64 ? parsed : null;
  } catch {
    return null;
  }
}

function validPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
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

function fail(
  errors: Set<string>,
): MarketContextFiveSessionPilotAdmissionResultV1 {
  return {
    status: "not_admitted",
    contract_version:
      MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1,
    error_codes: [...errors].sort((left, right) =>
      left.localeCompare(right),
    ),
    metadata_inferred: false,
    download_authorized: false,
    dataset_acquisition_ready: false,
    normalization_authorized: false,
    replay_authorized: false,
    shadow_only: true,
    live_ranking_effect: false,
  };
}

export function computeMarketContextPilotCalendarDigestV1(
  calendar: Omit<
    MarketContextFiveSessionPilotAdmissionInputV1["calendar"],
    "artifact_sha256"
  >,
) {
  return sha256(stableMarketContextTradePreparationJsonV2(calendar));
}

function validateSymbols(
  symbols: PilotSymbolV1[],
  errors: Set<string>,
) {
  const actual = [...(symbols ?? [])].sort((left, right) =>
    left.symbol.localeCompare(right.symbol),
  );
  const expected = [...MARKET_CONTEXT_FIVE_SESSION_PILOT_SYMBOLS_V1]
    .sort((left, right) => left.symbol.localeCompare(right.symbol));
  if (
    stableMarketContextTradePreparationJsonV2(actual) !==
    stableMarketContextTradePreparationJsonV2(expected)
  ) {
    errors.add("pilot_exact_symbol_universe_or_resolution_mismatch");
  }
}

function validateQuote(
  value: MarketContextFiveSessionPilotAdmissionInputV1,
  evaluatedAt: bigint | null,
  errors: Set<string>,
) {
  const quote = value?.quote;
  const quotedAt = parseNs(quote?.quoted_at_unix_ns);
  const entitlementAt = parseNs(
    quote?.entitlement_checked_at_unix_ns,
  );
  if (
    evaluatedAt === null ||
    quotedAt === null ||
    entitlementAt === null ||
    quotedAt > evaluatedAt ||
    entitlementAt > evaluatedAt
  ) {
    errors.add("pilot_quote_or_entitlement_timestamp_invalid");
    return { quoteAge: null, entitlementAge: null };
  }
  const quoteAge = Number((evaluatedAt - quotedAt) / nsPerSecond);
  const entitlementAge = Number(
    (evaluatedAt - entitlementAt) / nsPerSecond,
  );
  if (
    quoteAge > MARKET_CONTEXT_FIVE_SESSION_PILOT_QUOTE_MAX_AGE_SECONDS ||
    entitlementAge >
      MARKET_CONTEXT_FIVE_SESSION_PILOT_QUOTE_MAX_AGE_SECONDS
  ) {
    errors.add("pilot_quote_or_entitlement_stale");
  }
  if (
    !validSha256(quote?.evidence_sha256) ||
    !validPositiveInteger(quote?.exact_record_count) ||
    !validPositiveInteger(quote?.billable_uncompressed_bytes) ||
    quote.billable_uncompressed_bytes >
      MARKET_CONTEXT_FIVE_SESSION_PILOT_BILLABLE_CAP_BYTES ||
    !validPositiveInteger(quote?.estimated_transfer_bytes) ||
    quote.estimated_transfer_bytes >
      MARKET_CONTEXT_FIVE_SESSION_PILOT_TRANSFER_CAP_BYTES ||
    typeof quote?.estimated_cost_usd !== "number" ||
    !Number.isFinite(quote.estimated_cost_usd) ||
    quote.estimated_cost_usd < 0 ||
    quote.estimated_cost_usd >
      MARKET_CONTEXT_FIVE_SESSION_PILOT_COST_CAP_USD ||
    quote.quote_validity !== "refresh_required_before_download"
  ) {
    errors.add("pilot_quote_missing_or_cap_exceeded");
  }
  const expectedDates = new Set(
    MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1,
  );
  if (
    !Array.isArray(quote?.conditions) ||
    quote.conditions.length !== expectedDates.size ||
    new Set(quote.conditions.map((condition) => condition.date)).size !==
      expectedDates.size ||
    quote.conditions.some(
      (condition) =>
        !expectedDates.has(condition.date) ||
        condition.condition !== "available" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(
          condition.last_modified_date,
        ),
    )
  ) {
    errors.add("pilot_session_condition_not_all_available");
  }
  const entitlementStart = parseExplicitInstantMs(
    quote?.entitlement_range?.start,
  );
  const entitlementEnd = parseExplicitInstantMs(
    quote?.entitlement_range?.end_exclusive,
  );
  if (
    entitlementStart === null ||
    entitlementEnd === null ||
    entitlementStart > Date.parse(MARKET_CONTEXT_FIVE_SESSION_PILOT_START) ||
    entitlementEnd < Date.parse(MARKET_CONTEXT_FIVE_SESSION_PILOT_END)
  ) {
    errors.add("pilot_entitlement_range_does_not_cover_interval");
  }
  return { quoteAge, entitlementAge };
}

function validateCalendar(
  calendar: MarketContextFiveSessionPilotAdmissionInputV1["calendar"],
  errors: Set<string>,
) {
  const expectedDates = new Set(
    MARKET_CONTEXT_FIVE_SESSION_PILOT_DATES_V1,
  );
  if (
    !identifier(calendar?.artifact_id) ||
    !identifier(calendar?.artifact_version) ||
    calendar?.exchange !== "XNYS" ||
    calendar?.timezone !== "America/New_York" ||
    !identifier(calendar?.source_reference) ||
    !Array.isArray(calendar?.sessions) ||
    calendar.sessions.length !== expectedDates.size ||
    new Set(calendar.sessions.map((session) => session.date)).size !==
      expectedDates.size ||
    calendar.sessions.some((session) => {
      const open = parseNs(session.open_unix_ns);
      const close = parseNs(session.close_unix_ns);
      return (
        !expectedDates.has(session.date) ||
        session.session_type !== "regular" ||
        open === null ||
        close === null ||
        open >= close
      );
    })
  ) {
    errors.add("pilot_calendar_artifact_invalid");
    return;
  }
  const actualSessions = [...calendar.sessions].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
  if (
    stableMarketContextTradePreparationJsonV2(actualSessions) !==
    stableMarketContextTradePreparationJsonV2(
      MARKET_CONTEXT_FIVE_SESSION_PILOT_XNYS_SESSIONS_V1,
    )
  ) {
    errors.add("pilot_calendar_session_boundary_mismatch");
  }
  const core = { ...calendar } as Partial<typeof calendar>;
  delete core.artifact_sha256;
  if (
    !validSha256(calendar.artifact_sha256) ||
    calendar.artifact_sha256 !==
      computeMarketContextPilotCalendarDigestV1(
        core as Omit<typeof calendar, "artifact_sha256">,
      )
  ) {
    errors.add("pilot_calendar_artifact_digest_invalid");
  }
}

function validateExternalMetadata(
  value: MarketContextFiveSessionPilotAdmissionInputV1,
  errors: Set<string>,
) {
  const revision = value?.provider_revision;
  if (
    !identifier(revision?.provider_build) ||
    !identifier(revision?.encoder_build) ||
    !identifier(revision?.dataset_revision) ||
    !identifier(revision?.evidence_reference) ||
    !validSha256(revision?.evidence_sha256)
  ) {
    errors.add("pilot_provider_encoder_or_dataset_revision_missing");
  }
  const tiebreak = value?.stable_tiebreak_evidence;
  if (
    tiebreak?.status !== "documented_stable" ||
    !identifier(tiebreak?.evidence_reference) ||
    !validSha256(tiebreak?.evidence_sha256)
  ) {
    errors.add("pilot_stable_tiebreak_evidence_missing");
  }
  const semantics = value?.publisher_semantics;
  if (
    semantics?.required_action !== "T" ||
    semantics?.allowed_flags_mask !== 129 ||
    semantics?.conditions_policy !== "empty_only_fail_closed" ||
    semantics?.unknown_action_policy !== "reject" ||
    semantics?.unknown_flag_policy !== "reject" ||
    semantics?.unknown_sale_condition_policy !== "reject"
  ) {
    errors.add("pilot_publisher_semantics_not_fail_closed");
  }
  if (
    value?.watermark?.policy_version !==
      MARKET_CONTEXT_TRADE_WATERMARK_POLICY_V2 ||
    value?.watermark?.max_lateness_ns !== "2000000000" ||
    value?.watermark?.evidence_status !== "empirically_unvalidated" ||
    value?.watermark?.calibrated !== false
  ) {
    errors.add("pilot_watermark_status_invalid");
  }
  const license = value?.license;
  if (
    license?.status !== "written_confirmed" ||
    !identifier(license?.reference_id) ||
    !validSha256(license?.evidence_sha256) ||
    license?.raw_retention_allowed !== true ||
    license?.encrypted_backup_allowed !== true ||
    license?.internal_non_display_research_allowed !== true ||
    license?.derived_candles_allowed !== true ||
    license?.derived_evidence_retention_allowed !== true ||
    license?.deterministic_replay_allowed !== true ||
    !identifier(license?.deletion_policy) ||
    !identifier(license?.audit_policy) ||
    !identifier(license?.team_user_scope) ||
    license?.redistribution !== "forbidden"
  ) {
    errors.add("pilot_written_license_reference_missing_or_incomplete");
  }
  const corporateActions = value?.corporate_actions;
  if (
    corporateActions?.status !==
      "explicitly_excluded_raw_unadjusted" ||
    corporateActions?.records_included !== false ||
    corporateActions?.split_policy !== "no_adjustment" ||
    corporateActions?.dividend_policy !== "no_adjustment" ||
    corporateActions?.analytical_limitations_acknowledged !== true ||
    !identifier(corporateActions?.policy_reference)
  ) {
    errors.add("pilot_corporate_action_status_not_explicit");
  }
}

function validateDestinationAndLineage(
  value: MarketContextFiveSessionPilotAdmissionInputV1,
  errors: Set<string>,
) {
  const destination = value?.destination;
  if (
    destination?.path !==
      MARKET_CONTEXT_FIVE_SESSION_PILOT_DESTINATION ||
    destination?.repository_root !==
      "/private/tmp/trade-action-667k" ||
    destination?.outside_repository !== true ||
    destination?.encrypted_volume_attested !== true ||
    destination?.access_control_attested !== true ||
    destination.path.startsWith(`${destination.repository_root}/`)
  ) {
    errors.add("pilot_encrypted_outside_repository_destination_invalid");
  }
  const lineage = value?.post_download_lineage;
  const plan = value?.lineage_plan;
  if (
    plan?.status !== "required_after_download" ||
    plan?.file_digest_algorithm !== "sha256" ||
    plan?.raw_record_identity_policy !==
      "stable_unique_required" ||
    plan?.raw_to_normalized_lineage !== "lossless_required" ||
    !identifier(plan?.verification_policy_reference)
  ) {
    errors.add("pilot_post_download_lineage_plan_invalid");
  }
  if (
    value?.admission_stage === "pre_download" &&
    (lineage?.status !== "pending_not_yet_downloaded" ||
      lineage.source_files.length !== 0 ||
      lineage.combined_local_bytes !== null ||
      lineage.lineage_manifest_sha256 !== null)
  ) {
    errors.add("pilot_pre_download_lineage_state_invalid");
    return;
  }
  if (value?.admission_stage === "post_download_verification") {
    if (
      lineage?.status !== "complete" ||
      !Array.isArray(lineage?.source_files) ||
      lineage.source_files.length === 0 ||
      lineage.source_files.some(
        (file) =>
          !identifier(file?.source_file_id) ||
          !validPositiveInteger(file?.compressed_bytes) ||
          !validSha256(file?.compressed_sha256) ||
          !validPositiveInteger(file?.uncompressed_bytes) ||
          !validSha256(file?.uncompressed_sha256),
      ) ||
      !validPositiveInteger(lineage?.combined_local_bytes) ||
      lineage.combined_local_bytes >
        MARKET_CONTEXT_FIVE_SESSION_PILOT_LOCAL_CAP_BYTES ||
      !validSha256(lineage?.lineage_manifest_sha256)
    ) {
      errors.add(
        "pilot_post_download_lineage_missing_or_cap_exceeded",
      );
    }
  }
}

export function evaluateMarketContextFiveSessionPilotAdmissionV1(
  input: unknown,
): MarketContextFiveSessionPilotAdmissionResultV1 {
  const errors = new Set<string>();
  try {
    const value =
      input as MarketContextFiveSessionPilotAdmissionInputV1;
    const before = stableMarketContextTradePreparationJsonV2(value);
    if (
      value?.contract_version !==
        MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1 ||
      value?.policy_version !==
        MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1 ||
      (value?.admission_stage !== "pre_download" &&
        value?.admission_stage !== "post_download_verification") ||
      value?.dataset?.provider !== "databento" ||
      value?.dataset?.dataset_id !== "EQUS.MINI" ||
      value?.dataset?.schema !== "trades" ||
      value?.dataset?.encoding !== "dbn" ||
      value?.dataset?.compression !== "zstd" ||
      value?.dataset?.publisher_id !== 95 ||
      value?.dataset?.adjustment_state !== "raw_unadjusted" ||
      value?.interval?.start !==
        MARKET_CONTEXT_FIVE_SESSION_PILOT_START ||
      value?.interval?.end_exclusive !==
        MARKET_CONTEXT_FIVE_SESSION_PILOT_END
    ) {
      errors.add("pilot_fixed_scope_mismatch");
    }
    const evaluatedAt = parseNs(value?.evaluated_at_unix_ns);
    if (evaluatedAt === null) {
      errors.add("pilot_evaluation_timestamp_invalid");
    }
    validateSymbols(value?.symbols, errors);
    const ages = validateQuote(value, evaluatedAt, errors);
    validateCalendar(value?.calendar, errors);
    validateExternalMetadata(value, errors);
    validateDestinationAndLineage(value, errors);
    if (
      stableMarketContextTradePreparationJsonV2(value) !== before
    ) {
      errors.add("pilot_admission_input_mutated");
    }
    if (errors.size > 0) return fail(errors);
    const shared = {
      contract_version:
        MARKET_CONTEXT_FIVE_SESSION_PILOT_ADMISSION_V1,
      policy_version:
        MARKET_CONTEXT_FIVE_SESSION_PILOT_POLICY_V1,
      admission_digest: sha256(
        stableMarketContextTradePreparationJsonV2(value),
      ),
      quote_age_seconds: ages.quoteAge!,
      entitlement_age_seconds: ages.entitlementAge!,
      all_sessions_available: true as const,
      calendar_immutable: true as const,
      metadata_inferred: false as const,
      download_authorized: false as const,
      dataset_acquisition_ready: false as const,
      normalization_authorized: false as const,
      replay_authorized: false as const,
      shadow_only: true as const,
      live_ranking_effect: false as const,
    };
    if (value.admission_stage === "pre_download") {
      return {
        status: "pre_download_requirements_satisfied",
        ...shared,
        post_download_lineage_verified: false,
      };
    }
    return {
      status: "admission_contract_satisfied",
      ...shared,
      post_download_lineage_verified: true,
    };
  } catch {
    errors.add("pilot_admission_malformed_runtime_input");
    return fail(errors);
  }
}
