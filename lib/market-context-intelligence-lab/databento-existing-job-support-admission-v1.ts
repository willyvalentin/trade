import { createHash } from "node:crypto";

export const MARKET_CONTEXT_DATABENTO_EXISTING_JOB_SUPPORT_ADMISSION_V1 =
  "market_context_databento_existing_job_support_admission_v1" as const;

export const MARKET_CONTEXT_ACTION_667M4B2_PRE_SUBMISSION_DECISION_DIGEST =
  "c8b32756e82ea2f584021dcb93774cf1e5ef192a97ba3b1128c1db30af60ca5b" as const;

export const MARKET_CONTEXT_ACTION_667M4B3_COST_CAP_USD = 0.25;
export const MARKET_CONTEXT_ACTION_667M4B3_BILLABLE_CAP_BYTES =
  32 * 1024 * 1024;
export const MARKET_CONTEXT_ACTION_667M4B3_TRANSFER_CAP_BYTES =
  32 * 1024 * 1024;
export const MARKET_CONTEXT_ACTION_667M4B3_LOCAL_CAP_BYTES =
  1024 * 1024 * 1024;

const expectedSymbols = [
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
] as const;

const expectedDates = [
  "2026-07-20",
  "2026-07-21",
  "2026-07-22",
  "2026-07-23",
  "2026-07-24",
] as const;

const expectedSupportFiles = [
  "condition.json",
  "manifest.json",
  "metadata.json",
] as const;

const expectedMarketFiles = expectedDates.map(
  (date) =>
    `equs-mini-${date.replaceAll("-", "")}.trades.dbn.zst`,
);

type PilotScope = {
  dataset: string;
  schema: string;
  encoding: string;
  compression: string;
  publisher_id: number;
  symbols: string[];
  start: string;
  end_exclusive: string;
};

type InventoryFile = {
  filename: string;
  file_kind: "condition" | "manifest" | "metadata" | "market_data";
  data_domain: "support" | "trades";
  size_bytes: number;
  provider_sha256: string;
};

type VerifiedSupportFile = {
  filename: string;
  size_bytes: number;
  provider_sha256: string;
  local_sha256: string;
  size_matches: boolean;
  sha256_matches: boolean;
  mode: "0600";
};

export type MarketContextDatabentoExistingJobSupportAdmissionInputV1 = {
  contract_version:
    typeof MARKET_CONTEXT_DATABENTO_EXISTING_JOB_SUPPORT_ADMISSION_V1;
  admission_stage: "post_submission_pre_download_admission";
  pre_submission_decision_digest: string;
  provider_job_identity_sha256: string;
  control: {
    schema_valid: boolean;
    scope_digest_valid: boolean;
    owner_current_user: boolean;
    mode: "0600";
    outside_git: boolean;
    underlying_volume_encrypted: boolean;
  };
  scope: PilotScope;
  terminal_job: {
    state: "done";
    scope_exact: boolean;
    record_count: number;
    billable_bytes: number;
    actual_size_bytes: number;
    package_size_bytes: number;
    actual_cost_usd: number;
  };
  inventory: {
    files: InventoryFile[];
    support_transfer_bytes: number;
    market_data_transfer_bytes: number;
    declared_total_transfer_bytes: number;
    calculated_local_total_bytes: number;
  };
  support_files: VerifiedSupportFile[];
  support_content: {
    manifest_identity_matches_control: boolean;
    metadata_identity_matches_control: boolean;
    metadata_scope_exact: boolean;
    all_five_days_available: boolean;
    degraded_or_partial_days: number;
    path_traversal_or_symlinks: number;
    duplicate_filenames: number;
    support_json_valid: boolean;
    market_records_read: false;
    sensitive_fields_persisted: false;
  };
  authorizations: {
    market_data_download_authorized: false;
    normalization_authorized: false;
    replay_authorized: false;
    canonical_binding_ready: false;
  };
  no_effect: {
    new_batch_submissions: 0;
    market_data_files_downloaded: 0;
    live_ranking_effect: false;
  };
};

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stable).join(",")}]`;
  }
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([key, child]) =>
        `${JSON.stringify(key)}:${stable(child)}`,
    )
    .join(",")}}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function validSha256(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{64}$/.test(value)
  );
}

function validSafePositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

function exactScope(scope: PilotScope | undefined): boolean {
  return (
    scope?.dataset === "EQUS.MINI" &&
    scope.schema === "trades" &&
    scope.encoding === "dbn" &&
    scope.compression === "zstd" &&
    scope.publisher_id === 95 &&
    stable(scope.symbols) === stable(expectedSymbols) &&
    scope.start === "2026-07-20T00:00:00Z" &&
    scope.end_exclusive === "2026-07-25T00:00:00Z"
  );
}

function safeProviderFilename(value: string): boolean {
  return (
    value.length > 0 &&
    !value.includes("/") &&
    !value.includes("\\") &&
    value !== "." &&
    value !== ".."
  );
}

function validateInventory(
  files: InventoryFile[] | undefined,
  errors: Set<string>,
): void {
  if (!Array.isArray(files) || files.length !== 8) {
    errors.add("provider_inventory_not_exact");
    return;
  }
  const names = files.map(({ filename }) => filename);
  if (
    new Set(names).size !== files.length ||
    files.some(
      ({ filename, size_bytes, provider_sha256 }) =>
        !safeProviderFilename(filename) ||
        !validSafePositiveInteger(size_bytes) ||
        !validSha256(provider_sha256),
    )
  ) {
    errors.add("provider_inventory_invalid");
  }
  const expectedNames = [
    ...expectedSupportFiles,
    ...expectedMarketFiles,
  ].sort();
  if (stable([...names].sort()) !== stable(expectedNames)) {
    errors.add("provider_inventory_scope_drift");
  }
  for (const file of files) {
    const supportIndex = expectedSupportFiles.indexOf(
      file.filename as (typeof expectedSupportFiles)[number],
    );
    const isMarket = expectedMarketFiles.includes(file.filename);
    const expectedKind =
      supportIndex >= 0
        ? expectedSupportFiles[supportIndex]!.replace(".json", "")
        : "market_data";
    if (
      (supportIndex < 0 && !isMarket) ||
      file.file_kind !== expectedKind ||
      file.data_domain !==
        (supportIndex >= 0 ? "support" : "trades")
    ) {
      errors.add("provider_inventory_data_domain_invalid");
    }
  }
}

function validateSupportFiles(
  files: VerifiedSupportFile[] | undefined,
  errors: Set<string>,
): void {
  if (!Array.isArray(files) || files.length !== 3) {
    errors.add("verified_support_inventory_not_exact");
    return;
  }
  if (
    stable(files.map(({ filename }) => filename).sort()) !==
    stable([...expectedSupportFiles].sort())
  ) {
    errors.add("verified_support_inventory_scope_drift");
  }
  if (
    files.some(
      (file) =>
        !safeProviderFilename(file.filename) ||
        !validSafePositiveInteger(file.size_bytes) ||
        !validSha256(file.provider_sha256) ||
        !validSha256(file.local_sha256) ||
        file.provider_sha256 !== file.local_sha256 ||
        file.size_matches !== true ||
        file.sha256_matches !== true ||
        file.mode !== "0600",
    )
  ) {
    errors.add("verified_support_integrity_invalid");
  }
}

export function evaluateMarketContextDatabentoExistingJobSupportAdmissionV1(
  input: unknown,
) {
  const errors = new Set<string>();
  try {
    const value =
      input as MarketContextDatabentoExistingJobSupportAdmissionInputV1;
    const before = stable(value);
    if (
      value?.contract_version !==
        MARKET_CONTEXT_DATABENTO_EXISTING_JOB_SUPPORT_ADMISSION_V1 ||
      value?.admission_stage !==
        "post_submission_pre_download_admission"
    ) {
      errors.add("contract_or_stage_invalid");
    }
    if (
      value?.pre_submission_decision_digest !==
      MARKET_CONTEXT_ACTION_667M4B2_PRE_SUBMISSION_DECISION_DIGEST
    ) {
      errors.add("pre_submission_lineage_invalid");
    }
    if (
      !validSha256(value?.provider_job_identity_sha256) ||
      value?.control?.schema_valid !== true ||
      value?.control?.scope_digest_valid !== true ||
      value?.control?.owner_current_user !== true ||
      value?.control?.mode !== "0600" ||
      value?.control?.outside_git !== true ||
      value?.control?.underlying_volume_encrypted !== true
    ) {
      errors.add("control_boundary_invalid");
    }
    if (!exactScope(value?.scope)) {
      errors.add("scope_drift");
    }
    const job = value?.terminal_job;
    if (
      job?.state !== "done" ||
      job?.scope_exact !== true ||
      job?.record_count !== 516_162 ||
      job?.billable_bytes !== 24_775_776 ||
      job?.actual_size_bytes !== 24_775_776 ||
      job?.package_size_bytes !== 7_734_804 ||
      job?.actual_cost_usd !== 0.1384454369545 ||
      job.billable_bytes >
        MARKET_CONTEXT_ACTION_667M4B3_BILLABLE_CAP_BYTES ||
      job.actual_cost_usd >
        MARKET_CONTEXT_ACTION_667M4B3_COST_CAP_USD
    ) {
      errors.add("terminal_job_or_caps_invalid");
    }
    validateInventory(value?.inventory?.files, errors);
    const inventory = value?.inventory;
    const summedSupport = inventory?.files
      ?.filter(({ data_domain }) => data_domain === "support")
      .reduce((total, file) => total + file.size_bytes, 0);
    const summedMarket = inventory?.files
      ?.filter(({ data_domain }) => data_domain === "trades")
      .reduce((total, file) => total + file.size_bytes, 0);
    if (
      inventory?.support_transfer_bytes !== 4_952 ||
      inventory?.market_data_transfer_bytes !== 7_729_852 ||
      inventory?.declared_total_transfer_bytes !== 7_734_804 ||
      inventory?.calculated_local_total_bytes !== 15_469_608 ||
      summedSupport !== inventory.support_transfer_bytes ||
      summedMarket !== inventory.market_data_transfer_bytes ||
      inventory.market_data_transfer_bytes >
        MARKET_CONTEXT_ACTION_667M4B3_TRANSFER_CAP_BYTES ||
      inventory.declared_total_transfer_bytes >
        MARKET_CONTEXT_ACTION_667M4B3_TRANSFER_CAP_BYTES ||
      inventory.calculated_local_total_bytes >
        MARKET_CONTEXT_ACTION_667M4B3_LOCAL_CAP_BYTES
    ) {
      errors.add("transfer_or_local_cap_invalid");
    }
    validateSupportFiles(value?.support_files, errors);
    const content = value?.support_content;
    if (
      content?.manifest_identity_matches_control !== true ||
      content?.metadata_identity_matches_control !== true ||
      content?.metadata_scope_exact !== true ||
      content?.all_five_days_available !== true ||
      content?.degraded_or_partial_days !== 0 ||
      content?.path_traversal_or_symlinks !== 0 ||
      content?.duplicate_filenames !== 0 ||
      content?.support_json_valid !== true ||
      content?.market_records_read !== false ||
      content?.sensitive_fields_persisted !== false
    ) {
      errors.add("support_content_invalid");
    }
    if (
      value?.authorizations?.market_data_download_authorized !==
        false ||
      value?.authorizations?.normalization_authorized !== false ||
      value?.authorizations?.replay_authorized !== false ||
      value?.authorizations?.canonical_binding_ready !== false ||
      value?.no_effect?.new_batch_submissions !== 0 ||
      value?.no_effect?.market_data_files_downloaded !== 0 ||
      value?.no_effect?.live_ranking_effect !== false
    ) {
      errors.add("authorization_or_no_effect_boundary_invalid");
    }
    if (stable(value) !== before) {
      errors.add("input_mutated");
    }
    if (errors.size > 0) {
      return {
        status: "not_ready",
        admission_stage:
          "post_submission_pre_download_admission" as const,
        reason_codes: [...errors].sort(),
        download_authorized: false as const,
        normalization_authorized: false as const,
        replay_authorized: false as const,
        canonical_binding_ready: false as const,
        live_ranking_effect: false as const,
      };
    }
    return {
      status:
        "ready_for_separate_market_data_download_authorization" as const,
      admission_stage:
        "post_submission_pre_download_admission" as const,
      contract_version:
        MARKET_CONTEXT_DATABENTO_EXISTING_JOB_SUPPORT_ADMISSION_V1,
      admission_digest: sha256(stable(value)),
      provider_job_identity_sha256:
        value.provider_job_identity_sha256,
      actual_size_semantics:
        "provider_uncompressed_actual_bytes" as const,
      package_size_semantics:
        "provider_compressed_total_transfer_bytes" as const,
      support_files_verified: true as const,
      all_five_days_available: true as const,
      declared_market_data_transfer_bytes:
        value.inventory.market_data_transfer_bytes,
      local_total_requirement_bytes:
        value.inventory.calculated_local_total_bytes,
      metadata_inferred: false as const,
      download_authorized: false as const,
      normalization_authorized: false as const,
      replay_authorized: false as const,
      canonical_binding_ready: false as const,
      live_ranking_effect: false as const,
    };
  } catch {
    return {
      status: "not_ready",
      admission_stage:
        "post_submission_pre_download_admission" as const,
      reason_codes: ["malformed_runtime_input"],
      download_authorized: false as const,
      normalization_authorized: false as const,
      replay_authorized: false as const,
      canonical_binding_ready: false as const,
      live_ranking_effect: false as const,
    };
  }
}
