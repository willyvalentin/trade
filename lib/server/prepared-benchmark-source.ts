import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { getConfiguredApplicationSessionSecret } from "@/lib/application-session-core";
import { buildBasicFreeDiscoveryCreditReservationClaimId } from "@/lib/basic-free-discovery-credit-reservation-store";
import type { CompletedDailyContext } from "@/lib/scanner-completed-daily-context";

export const PREPARED_BENCHMARK_CONTEXT_POLICY_VERSION = "prepared_completed_benchmark_context_v1" as const;
export const PREPARED_BENCHMARK_SOURCE_VERSION = "owner_prepared_benchmark_source_receipt_v1" as const;
export const preparedBenchmarkTickers = Object.freeze(["SPY", "QQQ"] as const);
// Keep the existing paid identity. A new context policy must not buy the same
// owner's ticker again under another namespace, minute or universe fingerprint.
const claimNamespace = "completed_session_history_preparation_v1";
export type PreparedBenchmarkSourceReceipt = Readonly<{
  receipt_version: typeof PREPARED_BENCHMARK_SOURCE_VERSION;
  data_role: "completed_benchmark_historical_daily";
  owner_user_id: string;
  trading_date: string;
  ticker: "SPY" | "QQQ";
  claim_id: string;
  execution_fingerprint: string;
  minute_bucket: string;
  captured_at: string;
  content_sha256: string;
  provider_payload_sha256: string;
  calendar_fingerprint: string;
  signature_algorithm: "hmac_sha256_domain_v1";
  signature: string;
}>;

export function preparedBenchmarkClaim(owner: string, date: string, ticker: "SPY" | "QQQ") {
  const execution_fingerprint = `${claimNamespace}|${owner}|${date}|${ticker}`;
  return { execution_fingerprint, claim_id: buildBasicFreeDiscoveryCreditReservationClaimId({
    trading_date: date, execution_fingerprint,
  }) };
}

function signature(value: Omit<PreparedBenchmarkSourceReceipt, "signature">) {
  const secret = getConfiguredApplicationSessionSecret();
  if (!secret) return null;
  // Separate key domain from operator cookies. Never disclose or persist key
  // material. The immutable message binds the paid identity and original data.
  return createHmac("sha256", `ture:prepared-benchmark-input:${secret}`)
    .update(JSON.stringify([value.receipt_version, value.data_role, value.owner_user_id,
      value.trading_date, value.ticker, value.claim_id, value.execution_fingerprint,
      value.minute_bucket, value.captured_at, value.content_sha256,
      value.provider_payload_sha256, value.calendar_fingerprint, value.signature_algorithm]))
    .digest("hex");
}

export function createPreparedBenchmarkSourceReceipt(input: {
  owner: string; tradingDate: string; minuteBucket: string; context: CompletedDailyContext;
}): PreparedBenchmarkSourceReceipt | null {
  if (!preparedBenchmarkTickers.some(ticker => ticker === input.context.symbol)) return null;
  const ticker = input.context.symbol as "SPY" | "QQQ";
  const paid = preparedBenchmarkClaim(input.owner, input.tradingDate, ticker);
  const value: Omit<PreparedBenchmarkSourceReceipt, "signature"> = {
    receipt_version: PREPARED_BENCHMARK_SOURCE_VERSION,
    data_role: "completed_benchmark_historical_daily", owner_user_id: input.owner,
    trading_date: input.tradingDate, ticker, ...paid, minute_bucket: input.minuteBucket,
    captured_at: input.context.captured_at, content_sha256: input.context.content_sha256,
    provider_payload_sha256: input.context.response_identity.payload_sha256,
    calendar_fingerprint: input.context.calendar_fingerprint,
    signature_algorithm: "hmac_sha256_domain_v1",
  };
  const signed = signature(value);
  return signed ? Object.freeze({ ...value, signature: signed }) : null;
}

export function readPreparedBenchmarkSourceReceipt(value: unknown, input: {
  owner: string; tradingDate: string; context: CompletedDailyContext;
}): PreparedBenchmarkSourceReceipt | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (Object.keys(raw).length !== 14 || typeof raw.minute_bucket !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/.test(raw.minute_bucket) ||
    !Number.isFinite(Date.parse(raw.minute_bucket)) ||
    new Date(raw.minute_bucket).toISOString() !== raw.minute_bucket ||
    Date.parse(raw.minute_bucket) > Date.parse(input.context.captured_at) ||
    typeof raw.signature !== "string" || !/^[a-f0-9]{64}$/.test(raw.signature)) return null;
  const rebuilt = createPreparedBenchmarkSourceReceipt({ owner: input.owner,
    tradingDate: input.tradingDate, minuteBucket: raw.minute_bucket, context: input.context });
  if (!rebuilt || !Object.entries(rebuilt).every(([key, expected]) =>
    key === "signature" || raw[key] === expected)) return null;
  return timingSafeEqual(Buffer.from(raw.signature, "hex"), Buffer.from(rebuilt.signature, "hex")) ? rebuilt : null;
}
