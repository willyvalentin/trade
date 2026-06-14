# Navigation/Tab State Hook Post-Extraction Reassessment

## 1. Purpose

Reassess the first app-wide state hook extraction after Action 391.

Action 391 extracted `useTradeAppNavigationState` and moved only the active tab
state out of `app/trade-app.tsx`. This document verifies that the boundary
stayed narrow and identifies the next safest state/effects extraction target.

## 2. Current Navigation Hook Inventory

Hook file:

- `hooks/trade-app/useTradeAppNavigationState.ts`

Exported API:

- `TradeAppTab`
- `useTradeAppNavigationState()`

Hook return shape:

- `activeTab`
- `setActiveTab`

Default state:

- `"Recommendations"`

Call site in `app/trade-app.tsx`:

- `const { activeTab, setActiveTab } = useTradeAppNavigationState();`
- the hook call replaced the previous inline
  `useState<Tab>("Recommendations")` in the same top-level state area.

Type ownership:

- the hook exports `TradeAppTab`.
- `app/trade-app.tsx` keeps `type Tab = TradeAppTab` so existing tab constants,
  refresh helpers, and props can remain unchanged.

Remaining parent-owned navigation rendering/effects:

- `primaryTabs` and `secondaryTabs`.
- primary and secondary navigation markup.
- Settings route link.
- active class names.
- tab content conditional rendering.
- `refreshIslandsForTab`.
- `refreshIntervalForTab`.
- live-trades auto-refresh effect.
- current-surface refresh effect.
- focus refresh effect.

## 3. Behavior Preservation Check

Default tab:

- preserved as `"Recommendations"` in the hook.

Tab switching:

- existing call sites still use `setActiveTab`.
- logo, primary tabs, secondary tabs, demo recommendation flow, add-trade
  success flow, close-position success flow, Statistics "View History", and
  Market panel navigation callbacks still set the same tab labels as before.

Nav rendering:

- stayed in `app/trade-app.tsx`.
- no nav DOM structure moved.
- no tab labels moved into the hook.
- no Settings route behavior changed.

E2E-visible labels:

- preserved:
  - `Recommendations`
  - `Live Day Trades`
  - `Stats Today`
  - `Market`
  - `Statistics`
  - `History`
  - `Settings`
- active class names remain parent-owned:
  - `trade-primary-tab--active`
  - `trade-topbar-link--active`

Effects/persistence:

- no refresh helper moved.
- no refresh effect moved.
- no localStorage, URL, hash, router, Supabase, or persistence behavior was
  added or moved.

Execution/handoff:

- no execution modal state moved.
- no orchestrator calls moved.
- no handoff preview behavior moved.
- no Avanza/browser behavior was added.

Derived behavior:

- no derived booleans or memoized helpers were added.
- the hook is intentionally just state plus setter.

## 4. Lessons for Future Hook Extraction

Hook size:

- the safest state extraction was a tiny hook with one `useState` and one
  exported type.
- future hooks should begin similarly small when possible.

Hook order handling:

- replacing the inline state call with one hook call in the same top-level area
  minimized hook order risk.
- future extractions should preserve call location when moving state.

Type ownership:

- exporting a domain-specific type from the hook worked cleanly because it kept
  `app/trade-app.tsx` typed without moving rendering or constants.
- type movement is safe only when it does not pull app rendering or business
  logic into the hook module.

Parent-owned behavior boundaries:

- render labels, refresh effects, persistence, data loading, calculations,
  modals, execution wiring, and trade mutations stayed parent-owned.
- future hooks should keep the same discipline: move state ownership only, then
  reassess before moving effects or handlers.

Testing expectations:

- runtime hook extractions should run:
  - `./node_modules/.bin/tsc --noEmit`
  - `npm run lint`
  - `git diff --check`
  - `npm run test:e2e`
- if e2e cannot bind its local server in the sandbox, rerun with appropriate
  escalation and document the reason.

## 5. Candidate Next State/Effects Targets

A. Statistics range/filter state boundary:

- next safest candidate.
- current state is `selectedStatisticsRange` plus `setSelectedStatisticsRange`.
- default is `"today"`.
- no localStorage/URL persistence was observed.
- risk is that the value feeds multiple calculation builders, so the next
  action should reassess before moving it.

B. Generic modal open/close UI state boundary:

- medium risk.
- selected recommendation/position modal state is coupled to validation, saving,
  and mutation flows.
- should wait until smaller UI-only state hooks are done.

C. Recommendation UI-only state boundary:

- medium-to-high risk.
- filters and UI flags may be separable later, but recommendation data,
  validation, discard persistence, diagnostics, and handoff creation are
  intertwined.

D. History UI-only state boundary:

- medium risk.
- filters may be separable, but History derivation still touches PnL,
  plan-vs-actual, audit/timeline, and Statistics context.

E. Persistence/localStorage effects later:

- high risk.
- should wait for a dedicated persistence boundary plan.

F. Execution/handoff/orchestrator state much later:

- very high risk and safety-sensitive.
- should remain parent/modal-owned until execution record and persistence
  boundaries are clearer.

## 6. Recommended Next Action

Recommended next action:

**Action 393 - Reassess Statistics Range State Hook Boundary**

## Action 393 Result

Action 393 added `docs/statistics-range-state-hook-boundary-reassessment.md`.

Result:

- Confirmed Statistics range state is one `useState` pair:
  `selectedStatisticsRange` and `setSelectedStatisticsRange`.
- Confirmed the default remains `"today"` and there is no localStorage/URL
  coupling.
- Documented that the range value feeds multiple calculation builders, so those
  calculations must remain parent-owned.
- Recommended extracting only the range state and setter next.

Next recommended action:

**Action 394 - Extract Statistics Range State Hook**

## Action 394 Result

Action 394 added `hooks/trade-app/useStatisticsRangeState.ts`.

Result:

- Extracted the second tiny app state hook after navigation.
- Moved only Statistics range state ownership and the setter return value.
- Preserved the `"today"` default and all range-driven calculations/rendering in
  `app/trade-app.tsx`.

Next recommended action:

**Action 395 - Reassess Statistics Range State Hook Extraction**

Why:

- it is the smallest remaining obvious UI-state boundary.
- it has no persistence coupling today.
- it affects calculation inputs, so a documentation-only boundary reassessment
  should happen before runtime extraction.

## 7. Risk Assessment

Hook order risk:

- low for the completed navigation hook.
- still present for future hooks if state is not replaced in the same top-level
  order.

Stale closure risk:

- low for navigation because the setter is stable and no callbacks were moved.
- higher for future hooks if effects or handlers are moved prematurely.

Type ownership risk:

- low for `TradeAppTab`.
- future hook types should avoid importing broad app-only types unless needed.

E2E reliance:

- tab labels and class names are e2e-visible and stayed unchanged.
- future UI-state extractions should preserve labels, button text, and DOM
  structure.

Future state extraction risk:

- Statistics range state is small but calculation-adjacent.
- modal, Recommendation, History, persistence, and execution state have higher
  coupling and should not be next without reassessment.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.
