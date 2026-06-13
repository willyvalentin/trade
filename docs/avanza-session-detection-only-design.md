# Avanza Session Detection Only Design

Date: 2026-06-11

Status: Documentation-only design for a possible future Avanza-adjacent session detection phase. No Avanza automation was added, no Avanza URL or selector was added to runtime code, no Playwright import was added, no browser control was added, no run/start button was added, no order submission is in scope, no broker result is created, no Supabase write occurs, and no trade state is mutated.

Related:

- `lib/avanza-session-detection-contract.ts`
- `lib/avanza-search-only-result-contract.ts`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/safe-browser-action-contract.md`
- `docs/avanza-final-confirm-block-design.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Define the first future Avanza-adjacent runner phase: session detection only.

The phase may confirm whether a watched browser/session appears ready for a later search-only design. It must not interact with the order flow, search for instruments, navigate to Avanza, click, type, fill, submit, scrape account data, or create broker results.

The output of this phase is readiness metadata only.

Action 270 added `lib/avanza-session-detection-contract.ts`, a pure
TypeScript result contract for this phase. The contract can classify sanitized
context as unavailable, browser-not-connected, Avanza-not-visible,
login-required, ready-for-search-only, blocked, or failed. It does not import
Playwright, control a browser, add Avanza URLs/selectors, or touch Avanza.

Action 271 added a localhost bridge `GET /session-detection` contract, client
helper, server stub, and smoke coverage for explicit stub modes. The endpoint
returns only synthetic `AvanzaSessionDetectionResult`-compatible metadata and
does not connect to a browser, touch Avanza, read account data, submit orders,
create broker results, write Supabase, or mutate trades.

Action 272 added a dev-gated, read-only `Session-detection preview` to the
Execution Handoff Preview Modal. The user can manually check the localhost
stub, inspect status/summary/labels/sanitized context, and see informational
readiness rows. This does not enable search-only, add a run/start/search
button, control a browser, touch Avanza, or create broker effects.

Action 273 added `docs/avanza-search-only-phase-design.md`, a
documentation-only design for the next possible phase. Search-only may later
locate sanitized instrument candidates, but it explicitly forbids order pages,
buy/sell clicks, order forms, submissions, broker results, Supabase writes, and
trade mutation.

Action 274 added `lib/avanza-search-only-result-contract.ts`, a pure
TypeScript result contract for search-only candidate classification. It can
score sanitized candidates, classify exact/ambiguous/no-match/blocked states,
and emit safety labels without browser control, Avanza selectors or URLs, order
pages, buy/sell clicks, broker results, Supabase writes, or trade mutation.

## Scope

Allowed:

- detect whether a browser connection exists
- detect current page context generically
- detect whether the user appears logged in without reading sensitive account details
- detect whether an Avanza UI shell appears reachable or visible
- classify readiness or blocked state
- emit local diagnostics
- report sanitized context

Forbidden:

- click
- type
- search
- navigate to Avanza
- open an order page
- fill fields
- click review
- read balances
- read holdings
- read personal or account identifiers
- read raw page HTML
- capture unsanitized screenshots
- submit anything
- create `brokerResult`
- create execution records
- write Supabase
- mutate trade state

## Required Prerequisites

- Manual mapping refresh completed or explicitly deferred with a written reason.
- User manually opens the browser/session.
- User manually logs into Avanza if needed.
- User watches the browser.
- Execution dev tools are enabled.
- Dry-run runner self-check exists for the local process.
- Capability gate remains `dry_run_only`.
- Broker submission is disabled.
- Final-confirm click support is disabled.
- Automatic mode is disabled.
- No Avanza run/start button exists.

## Detection Strategy

Allowed detection only:

- Browser reachable?
- Active page title or domain class only, not stored raw if sensitive.
- Login wall vs app shell vs unknown.
- UI language/state as a coarse label.
- Market/session context only if visible without account or personal data.
- Runner capability and self-check metadata.
- No DOM dump.
- No page source persistence.
- No screenshots unless sanitized before storage.

Suggested generic context classes:

- `browser_unreachable`
- `unknown_page`
- `login_wall`
- `avanza_shell_visible`
- `sensitive_context_visible`
- `session_timeout_possible`

Do not store exact account labels, user names, balances, holdings, account numbers, personal identifiers, cookies, tokens, or browser storage.

## Session Detection Result Contract

File:

- `lib/avanza-session-detection-contract.ts`

Planned result shape:

```ts
type AvanzaSessionDetectionStatus =
  | "unavailable"
  | "browser_not_connected"
  | "avanza_not_visible"
  | "login_required"
  | "ready_for_search_only"
  | "blocked"
  | "failed";

type AvanzaSessionDetectionResult = {
  ok: boolean;
  status: AvanzaSessionDetectionStatus;
  checkedAt: string;
  capabilityValidation?: unknown;
  blockers: string[];
  warnings: string[];
  errors: string[];
  sanitizedContext?: {
    pageContextClass?: string;
    language?: string;
    loginState?: "unknown" | "login_required" | "appears_logged_in";
    sensitiveContextVisible?: boolean;
  };
  metadata: {
    targetEnvironment: "avanza_broker";
    sessionDetectionOnly: true;
    noBrowserActions: true;
    noBrokerSubmission: true;
    noFinalConfirm: true;
    noOrderPreparation: true;
  };
};
```

Status meanings:

- `unavailable`: session detection runner does not exist or is disabled.
- `browser_not_connected`: watched browser connection cannot be reached.
- `avanza_not_visible`: browser is reachable but current page is not classed as Avanza-visible.
- `login_required`: login wall or challenge appears present.
- `ready_for_search_only`: app shell appears reachable and no sensitive-data blocker is present.
- `blocked`: known unsafe or unsupported state.
- `failed`: detection failed unexpectedly.

## Privacy / Data Minimization

- Do not store account number.
- Do not store account label if it identifies the user.
- Do not store balances.
- Do not store holdings.
- Do not store personal identifiers.
- Do not store raw page HTML.
- Do not store credentials.
- Do not store cookies, session tokens, local storage, or browser storage.
- Redact user/account labels before any diagnostics leave the browser-runner boundary.
- Keep diagnostics local only.
- Store only coarse context classes and safety labels.

## UI Behavior

A future readiness panel may show session-detection status, but it must remain informational.

Allowed labels:

- Session detection only
- No browser actions
- No broker submission
- No order preparation
- No search
- No navigation
- No final confirmation

Forbidden UI behavior:

- no `Run Avanza` button
- no `Start Avanza dry-run` button during this phase
- no trade/execute/submit copy
- no automatic call on modal render
- no route that opens or controls Avanza
- no broker result display

## Failure Handling

- Unknown page -> `blocked`.
- Login challenge -> `login_required`.
- Browser unreachable -> `browser_not_connected`.
- Avanza not visible -> `avanza_not_visible`.
- Sensitive info detected -> stop, redact, and return `blocked`.
- Unexpected UI -> `blocked`.
- User abort -> `blocked` or `failed` safely.
- Capability drift toward broker submission -> `blocked`.
- Final-confirm capability detected -> `blocked`.
- Automatic mode detected -> `blocked`.

Every failure path must preserve:

- no click
- no typing
- no navigation
- no order preparation
- no broker submission
- no broker result
- no trade mutation

## Test Plan

Before implementation:

- Pure contract tests for planned result statuses.
- Capability-gate tests for session-detection-only metadata.
- Skeleton runner self-check tests.
- Mock browser context tests if a local fake browser context is useful.
- Manual Avanza observation using `docs/avanza-manual-mapping-refresh-pack.md`.
- No real Avanza browser interaction until the user explicitly approves a separate implementation action.

Implementation test boundaries:

- no Playwright import in app/runtime
- no Avanza selectors in runtime
- no Avanza URL in runtime
- no browser control in the first contract action
- no persisted sensitive context

## Graduation Criteria To Search-Only Phase

Move to search-only design only when:

- Manual mapping refresh is complete or explicitly deferred with written rationale.
- Session detection result contract is implemented and tested.
- Session detection emits no sensitive data.
- User can clearly see session status.
- No click/type/navigation behavior exists.
- No Avanza selector/URL has been added to runtime.
- Dry-run remains unavailable beyond detection.
- Capability gate still blocks broker submission, final confirmation, and automatic mode.
- All diagnostics are local and clearly labeled as readiness only.

The search-only design is now documented in
`docs/avanza-search-only-phase-design.md`, and the pure result contract now
exists in `lib/avanza-search-only-result-contract.ts`. Any browser-adjacent
behavior still requires a separate implementation plan and explicit user
approval.

The next phase after a search-only exact match is now documented in
`docs/avanza-instrument-verification-phase-design.md`. That design remains
identity-verification only and still forbids order pages, buy/sell clicks,
order-form behavior, submissions, broker results, Supabase writes, and trade
mutation.

The next phase after verified instrument identity is now documented in
`docs/avanza-instrument-page-phase-design.md`. That design remains non-order
instrument-page identity only and still forbids order pages, buy/sell clicks,
order-form behavior, submissions, broker results, Supabase writes, and trade
mutation.

## Recommended Next Action

Recommended:

- Action 282 - Avanza Instrument Page Result Contract

That action should add only pure TypeScript result types/helpers for
instrument-page identity outcomes. It should not add browser control, Avanza
selectors, Avanza URLs, Playwright imports, instrument-page/run/start buttons,
order-page behavior, order submission, broker results, Supabase writes, or
trade mutation.
