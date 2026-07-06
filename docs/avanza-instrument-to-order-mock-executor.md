# Avanza Instrument To Order Mock Executor

## Purpose

The Avanza instrument-to-order mock executor simulates the full pre-submit
handoff chain using simulated Avanza page state. It is the order-side equivalent
of the login mock executor and exists only for fixture/model/dev-QA visibility.

The chain now has a mock execution layer after dry-run. This still does not activate real Avanza execution. Final human confirmation remains mandatory.

## Mock Flow

The mock path is:

1. Ture execution package.
2. Mock search panel.
3. Mock search results.
4. Mock matching instrument selected.
5. Mock instrument page verified.
6. Mock BUY/SELL entry located.
7. Mock order ticket field preparation.
8. Mock review-ready state.
9. Stop before final KÖP/SÄLJ.

The executor supports BUY and SELL. It simulates search, instrument
verification, order ticket preparation, and review-ready state.

## Implemented Artifacts

- `lib/avanza-instrument-to-order-mock-executor.ts`
- `lib/avanza-instrument-to-order-mock-executor-fixtures.ts`
- `components/execution/AvanzaInstrumentToOrderMockExecutorHarness.tsx`
- A fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`

## Safety Boundaries

This mock layer does not execute real search, navigation, fill, click, review,
or submit behavior.

- No real search execution.
- No real Avanza navigation.
- No real form fill.
- No click.
- No BUY/SELL entry click.
- No final KÖP/SÄLJ click.
- No order submission.
- No cookies/session handling.
- No credential material.
- No BankID automation.
- No BankID bypass.
- No Trade UI wiring.
- No API route wiring.
- No Supabase execution write.
- Not production-ready.

Every action report keeps `containsCredentialMaterial: false` and
`realBrowserAction: false`. The safety flags keep real browser action, real
search, real navigation, real fill, real click, final KÖP/SÄLJ click, and order
submission disabled. Controls remain disabled and the gate remains locked.

## Route Visibility

The dev-only Avanza visual QA route renders the mock executor harness with
static fixtures only. The route remains unlinked from main navigation.

## Next Step

The next phase can either stop here with mock/fixture visibility or plan a
separate hard-gated local-dev mock invocation path. Any future real Avanza
execution work must be separately approved and must still preserve final human
confirmation before KÖP/SÄLJ.

## Settlement Note / Order Information Follow-Up

Settlement note signals now exist as the post-trade reconciliation foundation.
Exact courtage, FX/exchange rate, settlement amount, and realized execution
cost are future extraction targets from Avanza avräkningsnota after manual
execution. This mock executor phase still does not activate post-trade
navigation, PDF/download/read, OCR, value extraction, trade reconciliation
writes, Trade UI wiring, API route wiring, cookie/session handling, BankID
automation, or Supabase writes.
