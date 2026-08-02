import { hashAction650sCanonicalValue } from "../../lib/action-650s-execution-identity";
import {
  createAction652aExternalRiskAuthority,
  rebuildAction652aExternalRiskPolicyDigest,
  type Action652aAdmissionRequest,
  type Action652aExecutionIntent,
  type Action652aExternalRiskAuthority,
  type Action652aExternalRiskAuthorityInput,
} from "../../lib/action-652a-execution-risk-envelope-admission";
import { canonicalizeAction650uNanosecondInstant } from "../../lib/action-650u-temporal-confirmation-policy";
import {
  buildAction651cFixtureScenario,
  type Action651cFixtureScenario,
} from "./action-651c-execution-quality-audit-v2-fixtures";

export type Action652aFixtureClock =
  | "utc_a"
  | "utc_b"
  | "stockholm"
  | "new_york";

type Action652aFixtureOptions = Readonly<{
  reverse_allowlist?: boolean;
  execution_identity?: string;
  admission_at?: string;
  intent?: Partial<Action652aExecutionIntent>;
  policy?: Partial<Action652aExternalRiskAuthorityInput["policy"]>;
  snapshot?: Partial<Action652aExternalRiskAuthorityInput["snapshot"]>;
  market_authority?: Partial<
    Action652aExternalRiskAuthorityInput["market_authority"]
  >;
}>;

const clockInstants: Record<
  Action652aFixtureClock,
  Readonly<{
    policy_effective: string;
    policy_expires: string;
    intent_created: string;
    intent_expires: string;
    snapshot_observed: string;
    snapshot_finalized: string;
    snapshot_expires: string;
    session_open: string;
    session_close: string;
    admission: string;
  }>
> = {
  utc_a: {
    policy_effective: "2026-07-29T09:00:00.000000000Z",
    policy_expires: "2026-07-29T11:00:00.000000000Z",
    intent_created: "2026-07-29T09:59:59.000000000Z",
    intent_expires: "2026-07-29T10:00:01.000000000Z",
    snapshot_observed: "2026-07-29T09:59:59.500000000Z",
    snapshot_finalized: "2026-07-29T09:59:59.750000000Z",
    snapshot_expires: "2026-07-29T10:00:10.000000000Z",
    session_open: "2026-07-29T08:00:00.000000000Z",
    session_close: "2026-07-29T16:30:00.000000000Z",
    admission: "2026-07-29T10:00:00.000000000Z",
  },
  utc_b: {
    policy_effective: "2026-07-29T09:00:00Z",
    policy_expires: "2026-07-29T11:00:00+00:00",
    intent_created: "2026-07-29T09:59:59Z",
    intent_expires: "2026-07-29T10:00:01+00:00",
    snapshot_observed: "2026-07-29T09:59:59.5Z",
    snapshot_finalized: "2026-07-29T09:59:59.75+00:00",
    snapshot_expires: "2026-07-29T10:00:10Z",
    session_open: "2026-07-29T08:00:00+00:00",
    session_close: "2026-07-29T16:30:00Z",
    admission: "2026-07-29T10:00:00+00:00",
  },
  stockholm: {
    policy_effective: "2026-07-29T11:00:00+02:00",
    policy_expires: "2026-07-29T13:00:00+02:00",
    intent_created: "2026-07-29T11:59:59+02:00",
    intent_expires: "2026-07-29T12:00:01+02:00",
    snapshot_observed: "2026-07-29T11:59:59.500000000+02:00",
    snapshot_finalized: "2026-07-29T11:59:59.750000000+02:00",
    snapshot_expires: "2026-07-29T12:00:10+02:00",
    session_open: "2026-07-29T10:00:00+02:00",
    session_close: "2026-07-29T18:30:00+02:00",
    admission: "2026-07-29T12:00:00+02:00",
  },
  new_york: {
    policy_effective: "2026-07-29T05:00:00-04:00",
    policy_expires: "2026-07-29T07:00:00-04:00",
    intent_created: "2026-07-29T05:59:59-04:00",
    intent_expires: "2026-07-29T06:00:01-04:00",
    snapshot_observed: "2026-07-29T05:59:59.500000000-04:00",
    snapshot_finalized: "2026-07-29T05:59:59.750000000-04:00",
    snapshot_expires: "2026-07-29T06:00:10-04:00",
    session_open: "2026-07-29T04:00:00-04:00",
    session_close: "2026-07-29T12:30:00-04:00",
    admission: "2026-07-29T06:00:00-04:00",
  },
};

export type Action652aFixtureScenario = Readonly<{
  predecessor: Action651cFixtureScenario;
  authority: Action652aExternalRiskAuthority;
  request: Action652aAdmissionRequest;
}>;

export function buildAction652aFixtureScenario(
  clockName: Action652aFixtureClock = "utc_a",
  options: Action652aFixtureOptions = {},
): Action652aFixtureScenario {
  const times = clockInstants[clockName];
  const predecessor = buildAction651cFixtureScenario(clockName, {
    execution_identity:
      options.execution_identity ?? "action-651a-execution",
  });
  const prepared = predecessor.predecessor.prepared;
  const allowlist = options.reverse_allowlist
    ? ["MSFT", "AAPL"]
    : ["AAPL", "MSFT"];
  const policyWithoutDigest = {
    identity: "action-652a-policy-stockholm-read-only",
    version: "2026-07-29.1",
    effective_at: times.policy_effective,
    expires_at: times.policy_expires,
    symbol_allowlist: allowlist,
    maximum_quantity_units: "5",
    maximum_notional_micros: "895000000",
    reference_price_micros: "179000000",
    maximum_price_deviation_ppm: "0",
    maximum_daily_orders: "10",
    maximum_daily_notional_micros: "10000000000",
    maximum_cash_use_micros: "1000000000",
    maximum_exposure_micros: "5000000000",
    maximum_open_intents: "4",
    maximum_open_intent_notional_micros: "2000000000",
    maximum_snapshot_age_nanoseconds: "500000000",
    quantity_scale: 0 as const,
    price_scale: 6 as const,
    notional_scale: 6 as const,
    currency: "SEK" as const,
    ...options.policy,
  };
  const canonicalPolicyForDigest = {
    ...policyWithoutDigest,
    symbol_allowlist: [...new Set(policyWithoutDigest.symbol_allowlist)]
      .map((symbol) => symbol.trim().toUpperCase())
      .sort(),
    effective_at:
      canonicalizeAction650uNanosecondInstant(policyWithoutDigest.effective_at)
        ?.canonical_instant ?? policyWithoutDigest.effective_at,
    expires_at:
      canonicalizeAction650uNanosecondInstant(policyWithoutDigest.expires_at)
        ?.canonical_instant ?? policyWithoutDigest.expires_at,
  };
  const policyDigest = rebuildAction652aExternalRiskPolicyDigest(
    canonicalPolicyForDigest,
  );
  const snapshot = {
    identity: "action-652a-snapshot-finalized-read-only",
    policy_digest: policyDigest,
    session_identity: "action-651a-confirmation-session",
    observed_at: times.snapshot_observed,
    finalized_at: times.snapshot_finalized,
    expires_at: times.snapshot_expires,
    finalized: true as const,
    cash_available_micros: "2000000000",
    exposure_micros: "1000000000",
    open_intent_count: "1",
    open_intent_notional_micros: "100000000",
    daily_order_count: "2",
    daily_notional_micros: "1000000000",
    ...options.snapshot,
  };
  const marketProjection = {
    identity: "action-652a-market-session-authority",
    calendar_identity: "action-652a-synthetic-calendar",
    calendar_version: "2026.07.29",
    session_identity: "action-651a-confirmation-session",
    session_type: "synthetic_regular" as const,
    session_open_at: times.session_open,
    session_close_at: times.session_close,
    ...options.market_authority,
  };
  const canonicalMarketProjection = {
    ...marketProjection,
    session_open_at:
      canonicalizeAction650uNanosecondInstant(marketProjection.session_open_at)
        ?.canonical_instant ?? marketProjection.session_open_at,
    session_close_at:
      canonicalizeAction650uNanosecondInstant(marketProjection.session_close_at)
        ?.canonical_instant ?? marketProjection.session_close_at,
  };
  const marketAuthority = {
    ...canonicalMarketProjection,
    digest: `action_652a_market_authority_${hashAction650sCanonicalValue(
      canonicalMarketProjection,
    )}`,
    calendar_digest: `action_652a_calendar_${hashAction650sCanonicalValue({
      identity: canonicalMarketProjection.calendar_identity,
      version: canonicalMarketProjection.calendar_version,
    })}`,
  };
  const authority = createAction652aExternalRiskAuthority({
    policy: policyWithoutDigest,
    snapshot,
    market_authority: marketAuthority,
  });
  if (!authority) {
    throw new Error("Action 652A external authority fixture creation failed.");
  }

  const intent = {
    execution_identity: prepared.runtime_identity_context.execution_identity,
    preparation_trace_identity: prepared.trace_identity,
    handoff_identity: prepared.handoff.identity.handoff_identity,
    instrument: prepared.handoff.payload.ticker,
    side: prepared.handoff.payload.side,
    quantity: {
      value: "5",
      scale: 0,
      unit: "units",
    },
    limit_price: {
      value: "179000000",
      scale: 6,
      unit: "SEK_micros_per_unit",
    },
    notional: {
      value: "895000000",
      scale: 6,
      unit: "SEK_micros",
    },
    session_identity: "action-651a-confirmation-session",
    intent_created_at: times.intent_created,
    intent_expires_at: times.intent_expires,
    ...options.intent,
  } as Action652aExecutionIntent;

  return {
    predecessor,
    authority,
    request: {
      prepared,
      intent,
      external_risk_authority: authority,
      admission_at: options.admission_at ?? times.admission,
    },
  };
}

export const action652aGoldenMatrixCases = [
  { name: "utc_a", clock: "utc_a", reverse_allowlist: false },
  { name: "utc_b", clock: "utc_b", reverse_allowlist: false },
  { name: "stockholm", clock: "stockholm", reverse_allowlist: false },
  { name: "new_york", clock: "new_york", reverse_allowlist: false },
  { name: "reverse_input_order", clock: "utc_a", reverse_allowlist: true },
] as const;
