# Sandbox Browser Agent Selector Stability QA

## Purpose

Action 1001 hardens the sandbox browser-agent proof of concept with durable
selector conventions for the local `/sandbox-broker` page.

This is sandbox/test hardening only. It is not Avanza automation, not real
broker execution, not Production runtime browser automation, and not automatic
trading.

## Selector Contract

The sandbox order form now exposes stable `data-testid` selectors for browser
agent and QA targeting:

- `sandbox-broker-form`
- `sandbox-broker-field-ticker`
- `sandbox-broker-field-side`
- `sandbox-broker-field-quantity`
- `sandbox-broker-field-order-type`
- `sandbox-broker-field-entry-price`
- `sandbox-broker-field-stop`
- `sandbox-broker-field-target`
- `sandbox-broker-field-planned-risk`
- `sandbox-broker-field-payload-id`
- `sandbox-broker-preview`
- `sandbox-broker-safety-checklist`
- `sandbox-broker-final-control`
- `sandbox-broker-no-avanza-copy`
- `sandbox-broker-no-broker-submit-copy`
- `sandbox-broker-no-automatic-submit-copy`

The existing `data-sandbox-broker-field` attributes remain in place for
backward compatibility with the earlier sandbox adapter/fill-only POC.

## Test Behavior

Added `tests/e2e/sandbox-browser-agent-selector-stability.spec.ts`.

The selector-stability QA verifies:

- All required sandbox selectors exist in source.
- The sandbox fill-only flow fills fields through stable selectors.
- The local preview reflects ticker, side/action, quantity, order type, entry
  price, stop, target, planned risk, and payload id through the preview
  selector.
- The safety checklist is addressable through a stable selector.
- The fake final control is addressable through a stable selector and remains
  disabled.
- No form action or submit behavior exists.
- No external navigation occurs.
- No `/api/` requests occur during the selector-based fill test.
- No Avanza/broker URL or executable production automation path is introduced.

The existing fill-only Playwright POC now uses the stable `data-testid`
selectors for field fill, preview checks, safety checklist checks, and final
control checks.

## Safety Invariants

- No Avanza order.
- No broker submit.
- No final click.
- No automatic submit.
- No external calls.
- No Supabase write.
- No audit writer invocation.
- No provider, route, or scan invocation.
- No trade/stats/PnL mutation.
- No credentials, environment values, or service-role values are printed.
- No migration, type generation, generated type edit, or `.env.local` change.

## Market-Window Parking Note

The Production market-window dry run remains parked until Monday/open US
market session. Action 1001 intentionally avoids another blocked Sunday
market-window observation.

Recommended market action remains: Action 1002 - Run Production Market-Window
Dry Run During Open US Session.

## Result Status

Result status: `sandbox_browser_agent_selector_stability_qa_added`

## Validation Results

- New selector-stability test passed with 3 tests in normal web-server mode.
- Existing fill-only Playwright POC passed with 2 tests after selector
  migration.
- Focused no-server sandbox/result-capture/human-final-confirmation/
  browser-automation-boundary/sandbox-page/sandbox-adapter pack passed with 24
  tests.
- Focused semi-auto stack passed with 51 tests.
- Related execution/handoff/settings bundle passed with 57 tests.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- Optional runtime denial script was absent and documented.
- Anon/authenticated denial syntax checks passed.
- UI/app-shell audit writer import scan returned no matches.
- Sandbox/semi-auto market-loop/scanner/provider scan returned no matches.
- Service-role exposure scan returned only existing server-support aliases in
  `lib/supabase-server.ts` and `lib/active-scan-trace.ts`, with no secret
  values printed.
- Selector-stability safety scan returned expected selector names,
  documentation-only boundary language, and test guard literals only.
- Automatic-mode safety scan returned existing false/guard assertions and
  established safety copy only.
- Dead-doc/path scan returned no missing files.
- Status string and next-action consistency scans passed.
- `git diff --check` passed.
- Touched-file trailing whitespace scan returned no matches.
- `find docs -type f -size 0` returned no output.
- `.env.local` diff check returned no output.

Validation note: a combined `PLAYWRIGHT_SKIP_WEB_SERVER=true` run that included
the server-dependent selector browser-fill case failed because no local server
was listening. The selector browser-fill test passed in normal web-server
mode, and the no-server focused pack passed separately without that
server-dependent case.

## Recommended Next Action

Action 1002 - Run Production Market-Window Dry Run During Open US Session.

## Action 1002 Follow-Up

Follow-up status: Action 1002 created
`docs/monday-production-market-window-dry-run-handoff.md` with result status
`monday_production_market_window_dry_run_handoff_created`.

Production market-window validation remains parked until Monday/open US market
session and operator evidence exists.

Recommended next action: Action 1003 - Run Production Market-Window Dry Run
With Operator Evidence.

## Not Performed

- No Production runtime browser automation.
- No Avanza integration.
- No broker behavior.
- No automatic order submission.
- No automatic mode enablement.
- No final `KOP`/`SALJ` or `KÖP`/`SÄLJ` click.
- No fake final button enablement.
- No real submit path.
- No Avanza access.
- No Avanza URL constants.
- No credential storage.
- No 2FA bypass.
- No provider call.
- No scan route invocation.
- No live market scan.
- No database write.
- No Supabase manual call.
- No service-role adapter call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No service-role value printed.
- No audit writer UI/browser/client invocation.
- No real trade.
- No trade/stats/PnL mutation.
