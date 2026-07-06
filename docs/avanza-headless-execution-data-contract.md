# Avanza Headless Execution Data Contract

## Current Status

`lib/avanza-headless-execution-data-contract.ts` defines a pure, headless data
contract for future Sharp Semi Auto Execution Agent consumption.

The contract is represented in dev QA through:

- `lib/avanza-headless-execution-data-contract-fixtures.ts`;
- `components/execution/AvanzaHeadlessExecutionDataContractHarness.tsx`;
- the fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`.

The companion selector is documented in
`docs/avanza-headless-execution-contract-selector.md`. It chooses the next
agent-readable contract under the surface while keeping the UI hidden and
inactive.

## UI Strategy

Ture UI stays visually simple. Recommendation cards should remain clean and
should not expose execution debug details, readiness internals, or hidden agent
metadata.

More execution capability should live under the surface as explicit headless
contracts instead of adding visual clutter to cards.

Visual readiness badges remain optional, default-off, and dev-QA only.

Execution selection is now also headless. Exits outrank entries, stop-loss
exits outrank target exits, and target exits outrank entries without adding
visible Trade UI elements.

## Purpose

The headless contract describes what a future Execution Agent needs to prepare
an Avanza BUY or SELL limit order later:

- source identity;
- intent;
- ticker and instrument identity;
- side;
- quantity;
- order type;
- limit price;
- stop/target context;
- risk context;
- readiness metadata;
- human confirmation requirements;
- forbidden actions;
- audit metadata;
- settlement expectations.

## Headless Boundary

The contract is agent-readable and UI-hidden.

`visibleInUi` is always `false`.

`uiDisplayMode` is `hidden_under_surface`.

`canRenderVisualBadge` is `false` by default.

The contract is not visible on Trade cards, is not a handoff, is not a prepare
action, cannot call APIs, cannot fetch or poll, cannot start browser automation,
cannot access credentials, cannot read cookies/session, cannot automate BankID,
cannot submit orders, cannot click final KÖP/SÄLJ, and cannot write Supabase.

## Readiness Rules

`ready_headless` requires:

- ticker present;
- side present;
- quantity present;
- limit price present;
- order type `limit`;
- intent `entry_buy` or `exit_sell`.

Missing ticker, side, quantity, or limit price returns the matching
`missing_*` status. Market orders are blocked. Incomplete profile can produce a
warning while still allowing the contract to be modeled if the order package is
otherwise complete.

## Human Confirmation

Final confirmation is human-only.

The contract requires the future Execution Agent to stop at broker
review/final confirmation, wait for the user final click, and capture a result
later only through an approved flow.

Agent final KÖP/SÄLJ click remains forbidden.

## Settlement Expectation

Settlement expectation is modeled for later Avanza avräkningsnota
reconciliation.

The expected broker document is `avanza_avrakningsnota`. Expected fields are
courtage, fx rate, settlement amount, execution price, quantity, trade date,
and settlement date. Reconciliation mode is `manual_or_future_agent`, and
write enablement is `false`.

## Safety Boundary

The contract keeps:

- `headlessOnly: true`;
- `visibleInUi: false`;
- `canRenderVisualBadge: false`;
- `canStartHandoff: false`;
- `canPrepareOrder: false`;
- `canRunSmokeTestFromUi: false`;
- `canCallApiRoute: false`;
- `canFetch: false`;
- `canPoll: false`;
- `canUseBrowserAutomation: false`;
- `canAccessCredentials: false`;
- `canReadCookies: false`;
- `canExportSession: false`;
- `canAutomateBankId: false`;
- `canSubmitOrder: false`;
- `canClickFinalBuy: false`;
- `canClickFinalSell: false`;
- `canWriteSupabase: false`;
- `canClaimProductionReady: false`;
- `userMustConfirm: true`;
- `finalHumanClickRequired: true`;
- `controlsEnabled: false`;
- `gateLocked: true`.

## Production Readiness

This layer is model/helper/docs/dev-QA only and is not production-ready. It does
not activate Trade UI behavior, does not mutate trades, does not call the
disabled API route, and does not write Supabase execution records.

## Plan Builder Consumer

The headless agent plan builder now consumes the headless execution data contract
through `docs/avanza-headless-agent-plan-builder.md`. The headless execution data contract is now consumed by
`docs/avanza-headless-agent-plan-builder.md` through the selector path. The
builder turns a selected contract into a future agent preparation plan without
changing the UI surface or activating execution. The plan remains
agent-readable, UI-hidden, and under the surface; it stops before final
confirmation and keeps final KOP/SALJ human-only.
