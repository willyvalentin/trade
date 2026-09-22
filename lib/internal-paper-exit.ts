import type { SharedCandleCacheCandle } from "@/lib/shared-candle-cache";

export const INTERNAL_PAPER_EXIT_COMMAND_VERSION =
  "internal_paper_exit_command_v1" as const;
export const INTERNAL_PAPER_EXIT_FILL_MODEL_VERSION =
  "internal_paper_immediate_costed_exit_v1" as const;
export const INTERNAL_PAPER_EXIT_EVIDENCE_VERSION =
  "internal_paper_durable_candle_evidence_v1" as const;

export type InternalPaperExitReasonCode =
  | "account_identity_invalid"
  | "position_identity_invalid"
  | "candle_identity_invalid"
  | "candle_not_valid"
  | "candle_not_regular_one_minute"
  | "candle_market_identity_invalid"
  | "candle_price_invalid"
  | "candle_time_invalid"
  | "candle_provenance_incomplete";

export type InternalPaperExitCommand = Readonly<{
  command_version: typeof INTERNAL_PAPER_EXIT_COMMAND_VERSION;
  fill_model_version: typeof INTERNAL_PAPER_EXIT_FILL_MODEL_VERSION;
  evidence_version: typeof INTERNAL_PAPER_EXIT_EVIDENCE_VERSION;
  owner_user_id: string;
  account_id: string;
  position_id: string;
  candle_id: string;
}>;

export type InternalPaperExitBuildResult =
  | Readonly<{
      status: "ready";
      reason_codes: [];
      command: InternalPaperExitCommand;
    }>
  | Readonly<{
      status: "blocked";
      reason_codes: InternalPaperExitReasonCode[];
      command: null;
    }>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.endsWith("Z") &&
    Number.isFinite(Date.parse(value))
  );
}

function positiveFinite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Admits only the identity of already-durable market evidence. Exit reason,
 * quantity and price are deliberately absent: the database derives all three
 * from the stored candle and locked paper position.
 */
export function buildInternalPaperExitCommand(input: {
  owner_user_id: string;
  account_id: string;
  position_id: string;
  durable_candle_id: string;
  position_ticker: string;
  candle: SharedCandleCacheCandle;
}): InternalPaperExitBuildResult {
  const reasons: InternalPaperExitReasonCode[] = [];
  const ticker = input.position_ticker.trim().toUpperCase();

  if (!UUID_PATTERN.test(input.owner_user_id) || !UUID_PATTERN.test(input.account_id)) {
    reasons.push("account_identity_invalid");
  }
  if (!UUID_PATTERN.test(input.position_id)) {
    reasons.push("position_identity_invalid");
  }
  if (!UUID_PATTERN.test(input.durable_candle_id)) {
    reasons.push("candle_identity_invalid");
  }
  if (
    input.candle.contract_version !== "shared_candle_cache_v1" ||
    input.candle.validation_status !== "valid"
  ) {
    reasons.push("candle_not_valid");
  }
  if (
    input.candle.interval !== "1min" ||
    input.candle.market_session !== "regular"
  ) {
    reasons.push("candle_not_regular_one_minute");
  }
  if (
    !ticker ||
    input.candle.ticker.trim().toUpperCase() !== ticker ||
    !input.candle.provider.trim() ||
    input.candle.timezone !== "America/New_York"
  ) {
    reasons.push("candle_market_identity_invalid");
  }
  if (
    !positiveFinite(input.candle.open) ||
    !positiveFinite(input.candle.high) ||
    !positiveFinite(input.candle.low) ||
    !positiveFinite(input.candle.close) ||
    input.candle.high < input.candle.low ||
    input.candle.high < Math.max(input.candle.open, input.candle.close) ||
    input.candle.low > Math.min(input.candle.open, input.candle.close)
  ) {
    reasons.push("candle_price_invalid");
  }
  if (
    !explicitInstant(input.candle.timestamp) ||
    !explicitInstant(input.candle.fetched_at) ||
    Date.parse(input.candle.fetched_at) < Date.parse(input.candle.timestamp)
  ) {
    reasons.push("candle_time_invalid");
  }
  if (!input.candle.source_request_id.trim()) {
    reasons.push("candle_provenance_incomplete");
  }

  if (reasons.length > 0) {
    return {
      status: "blocked",
      reason_codes: Array.from(new Set(reasons)).sort(),
      command: null,
    };
  }

  return {
    status: "ready",
    reason_codes: [],
    command: {
      command_version: INTERNAL_PAPER_EXIT_COMMAND_VERSION,
      fill_model_version: INTERNAL_PAPER_EXIT_FILL_MODEL_VERSION,
      evidence_version: INTERNAL_PAPER_EXIT_EVIDENCE_VERSION,
      owner_user_id: input.owner_user_id,
      account_id: input.account_id,
      position_id: input.position_id,
      candle_id: input.durable_candle_id,
    },
  };
}
