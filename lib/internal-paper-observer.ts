export const INTERNAL_PAPER_OBSERVER_VERSION =
  "internal_paper_observer_v1" as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type JsonObject = Record<string, unknown>;

export type InternalPaperObserver = Readonly<{
  observer_version: typeof INTERNAL_PAPER_OBSERVER_VERSION;
  observed_at: string;
  owner_user_id: string;
  account_id: string;
  account: Readonly<{
    status: "ready" | "paused" | "killed";
    base_currency: "USD";
    config_version: string;
    state_version: number;
    strategy_id: string;
    strategy_version: string;
    eligible_symbols: string[];
    updated_at: string;
  }>;
  engine_health: Readonly<{
    status: "idle" | "backlog" | "working" | "blocked" | "paused" | "killed";
    queued_count: number;
    leased_count: number;
    completed_count: number;
    no_trade_count: number;
    blocked_count: number;
    latest_activity_at: string;
  }>;
  freshness: Readonly<{
    latest_activity_at: string;
    age_seconds: number;
    classification: "unclassified";
    threshold_seconds: null;
  }>;
  latest_decision: JsonObject | null;
  pending_orders: JsonObject[];
  positions: JsonObject[];
  accounting: Readonly<{
    currency: "USD";
    starting_cash: number;
    cash_balance: number;
    open_position_cost_basis: number;
    book_value: number;
    marked_equity: null;
    equity_status: "unavailable_without_current_mark";
    realized_gross_pnl: number;
    realized_net_pnl: number;
    total_commission_paid: number;
    ledger_entry_count: number;
    ledger_balance: number;
  }>;
  latest_realized_result: JsonObject | null;
}>;

function objectOrNull(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function explicitInstant(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function finiteNumber(value: unknown) {
  const parsed = typeof value === "number"
    ? value
    : typeof value === "string" && value.trim().length > 0
      ? Number(value)
      : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function nearlyEqual(left: number, right: number) {
  return Math.abs(left - right) <= 0.000001;
}

function nonNegativeInteger(value: unknown) {
  const parsed = finiteNumber(value);
  return parsed !== null && Number.isSafeInteger(parsed) && parsed >= 0
    ? parsed
    : null;
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function objectArray(value: unknown): JsonObject[] | null {
  if (!Array.isArray(value)) return null;
  const parsed = value.map(objectOrNull);
  return parsed.every((item) => item !== null) ? (parsed as JsonObject[]) : null;
}

export function internalPaperObserverFromUnknown(
  value: unknown,
  expected: { owner_user_id: string; account_id: string },
): InternalPaperObserver | null {
  const row = objectOrNull(value);
  const account = objectOrNull(row?.account);
  const engine = objectOrNull(row?.engine_health);
  const freshness = objectOrNull(row?.freshness);
  const accounting = objectOrNull(row?.accounting);
  const pendingOrders = objectArray(row?.pending_orders);
  const positions = objectArray(row?.positions);
  const latestDecision = row?.latest_decision === null
    ? null
    : objectOrNull(row?.latest_decision);
  const latestResult = row?.latest_realized_result === null
    ? null
    : objectOrNull(row?.latest_realized_result);
  const accountStatus = account?.status;
  const engineStatus = engine?.status;
  const stateVersion = nonNegativeInteger(account?.state_version);
  const ageSeconds = nonNegativeInteger(freshness?.age_seconds);
  const counts = {
    queued_count: nonNegativeInteger(engine?.queued_count),
    leased_count: nonNegativeInteger(engine?.leased_count),
    completed_count: nonNegativeInteger(engine?.completed_count),
    no_trade_count: nonNegativeInteger(engine?.no_trade_count),
    blocked_count: nonNegativeInteger(engine?.blocked_count),
  };
  const numbers = {
    starting_cash: finiteNumber(accounting?.starting_cash),
    cash_balance: finiteNumber(accounting?.cash_balance),
    open_position_cost_basis: finiteNumber(accounting?.open_position_cost_basis),
    book_value: finiteNumber(accounting?.book_value),
    realized_gross_pnl: finiteNumber(accounting?.realized_gross_pnl),
    realized_net_pnl: finiteNumber(accounting?.realized_net_pnl),
    total_commission_paid: finiteNumber(accounting?.total_commission_paid),
    ledger_entry_count: nonNegativeInteger(accounting?.ledger_entry_count),
    ledger_balance: finiteNumber(accounting?.ledger_balance),
  };
  const eligibleSymbols = Array.isArray(account?.eligible_symbols)
    ? account.eligible_symbols.filter(
        (symbol): symbol is string =>
          typeof symbol === "string" && /^[A-Z][A-Z0-9.]{0,15}$/.test(symbol),
      )
    : [];
  const expectedAgeSeconds = explicitInstant(row?.observed_at) &&
      explicitInstant(engine?.latest_activity_at)
    ? Math.max(
        0,
        Math.floor(
          (Date.parse(row.observed_at) - Date.parse(engine.latest_activity_at)) /
            1_000,
        ),
      )
    : null;

  if (
    !row || !account || !engine || !freshness || !accounting ||
    row.observer_version !== INTERNAL_PAPER_OBSERVER_VERSION ||
    row.owner_user_id !== expected.owner_user_id ||
    row.account_id !== expected.account_id ||
    !UUID_PATTERN.test(expected.owner_user_id) ||
    !UUID_PATTERN.test(expected.account_id) ||
    !explicitInstant(row.observed_at) ||
    !["ready", "paused", "killed"].includes(String(accountStatus)) ||
    account.base_currency !== "USD" ||
    !nonEmptyString(account.config_version) ||
    stateVersion === null ||
    !nonEmptyString(account.strategy_id) ||
    !nonEmptyString(account.strategy_version) ||
    eligibleSymbols.length === 0 ||
    eligibleSymbols.length !== (account.eligible_symbols as unknown[]).length ||
    !explicitInstant(account.updated_at) ||
    !["idle", "backlog", "working", "blocked", "paused", "killed"].includes(
      String(engineStatus),
    ) ||
    Object.values(counts).some((count) => count === null) ||
    !explicitInstant(engine.latest_activity_at) ||
    freshness.latest_activity_at !== engine.latest_activity_at ||
    ageSeconds === null ||
    expectedAgeSeconds === null ||
    ageSeconds !== expectedAgeSeconds ||
    freshness.classification !== "unclassified" ||
    freshness.threshold_seconds !== null ||
    pendingOrders === null ||
    positions === null ||
    (row.latest_decision !== null && latestDecision === null) ||
    (row.latest_realized_result !== null && latestResult === null) ||
    accounting.currency !== "USD" ||
    Object.values(numbers).some((number) => number === null) ||
    (numbers.starting_cash as number) <= 0 ||
    (numbers.cash_balance as number) < 0 ||
    (numbers.open_position_cost_basis as number) < 0 ||
    (numbers.book_value as number) < 0 ||
    (numbers.total_commission_paid as number) < 0 ||
    !nearlyEqual(
      numbers.book_value as number,
      (numbers.cash_balance as number) +
        (numbers.open_position_cost_basis as number),
    ) ||
    !nearlyEqual(
      numbers.ledger_balance as number,
      (numbers.cash_balance as number) - (numbers.starting_cash as number),
    ) ||
    accounting.marked_equity !== null ||
    accounting.equity_status !== "unavailable_without_current_mark"
  ) {
    return null;
  }

  return {
    observer_version: INTERNAL_PAPER_OBSERVER_VERSION,
    observed_at: row.observed_at,
    owner_user_id: row.owner_user_id as string,
    account_id: row.account_id as string,
    account: {
      status: accountStatus as InternalPaperObserver["account"]["status"],
      base_currency: "USD",
      config_version: account.config_version as string,
      state_version: stateVersion,
      strategy_id: account.strategy_id as string,
      strategy_version: account.strategy_version as string,
      eligible_symbols: eligibleSymbols,
      updated_at: account.updated_at as string,
    },
    engine_health: {
      status: engineStatus as InternalPaperObserver["engine_health"]["status"],
      queued_count: counts.queued_count as number,
      leased_count: counts.leased_count as number,
      completed_count: counts.completed_count as number,
      no_trade_count: counts.no_trade_count as number,
      blocked_count: counts.blocked_count as number,
      latest_activity_at: engine.latest_activity_at as string,
    },
    freshness: {
      latest_activity_at: freshness.latest_activity_at as string,
      age_seconds: ageSeconds,
      classification: "unclassified",
      threshold_seconds: null,
    },
    latest_decision: latestDecision,
    pending_orders: pendingOrders,
    positions,
    accounting: {
      currency: "USD",
      starting_cash: numbers.starting_cash as number,
      cash_balance: numbers.cash_balance as number,
      open_position_cost_basis: numbers.open_position_cost_basis as number,
      book_value: numbers.book_value as number,
      marked_equity: null,
      equity_status: "unavailable_without_current_mark",
      realized_gross_pnl: numbers.realized_gross_pnl as number,
      realized_net_pnl: numbers.realized_net_pnl as number,
      total_commission_paid: numbers.total_commission_paid as number,
      ledger_entry_count: numbers.ledger_entry_count as number,
      ledger_balance: numbers.ledger_balance as number,
    },
    latest_realized_result: latestResult,
  };
}
