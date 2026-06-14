# Navigation/Tab State Hook Boundary Reassessment

## 1. Purpose

Reassess navigation/tab state as the first possible app-wide state hook
extraction after the UI decomposition phase.

Action 389 identified navigation as the smallest likely hook boundary. This
document verifies whether `app/trade-app.tsx` can safely move that state into a
small hook without changing runtime behavior.

## 2. Current Navigation State Inventory

Current primary navigation state:

- `activeTab`, initialized with `"Recommendations"`.
- `setActiveTab`, used directly by navigation buttons and a few app handlers.

Tab type and constants:

- `Tab` is a string union:
  - `"Recommendations"`
  - `"Live Day Trades"`
  - `"Stats Today"`
  - `"Statistics"`
  - `"History"`
  - `"Market"`
- `primaryTabs` is `["Recommendations", "Live Day Trades", "Stats Today"]`.
- `secondaryTabs` is `["Market", "Statistics", "History"]`.

Handlers and call sites:

- Top-left logo click sets `"Recommendations"`.
- Secondary nav buttons set `"Market"`, `"Statistics"`, or `"History"`.
- Primary nav buttons set `"Recommendations"`, `"Live Day Trades"`, or
  `"Stats Today"`.
- Demo recommendation creation sets `"Recommendations"`.
- Successful add-trade/open-position flows set `"Live Day Trades"`.
- Successful close-position flows set `"History"`.
- Statistics dashboard and Market diagnostics panels pass callbacks that set
  `"History"` or `"Statistics"`.

Derived flags and active-view rendering:

- The parent renders tab content with direct checks such as
  `activeTab === "Recommendations"`, `activeTab === "Live Day Trades"`,
  `activeTab === "Stats Today"`, `activeTab === "Statistics"`,
  `activeTab === "History"`, and `activeTab === "Market"`.
- Active nav styling also compares `activeTab` with the tab value.
- There are no repeated named derived booleans today.

Navigation render dependencies:

- primary and secondary nav labels are e2e-visible UI copy.
- active class names are:
  - `trade-primary-tab--active`
  - `trade-topbar-link--active`
- the Settings link is not part of `activeTab`; it remains a route link to
  `/settings`.

URL/hash/localStorage coupling:

- No URL, hash, router, search param, or localStorage persistence currently owns
  `activeTab`.
- The default tab is hardcoded as `"Recommendations"`.

App-wide dependencies:

- `refreshIslandsForTab(activeTab)` chooses which refresh islands belong to the
  current tab.
- `refreshIntervalForTab({ tab: activeTab, ... })` chooses current-surface
  refresh cadence.
- the live trades auto-refresh effect checks
  `activeTab !== "Live Day Trades"`.
- the focus refresh effect depends on `activeTab` so it rebinds the focus
  handler for the active surface.
- `marketDiagnosticsConsoleSummary` includes `active_tab: activeTab`.

## 3. Coupling Analysis

Tab state is mostly isolated:

- there is one primary state variable.
- tab labels and ordering are static constants.
- there is no URL, hash, localStorage, or Supabase persistence for active tab.
- changing the tab does not directly mutate trades, persistence, or execution
  records.

Changing tabs does trigger effects indirectly:

- Live Day Trades auto-refresh only runs when the active tab is
  `"Live Day Trades"`.
- current-surface refresh cadence depends on the active tab.
- focus refresh refreshes the current surface.
- refresh helpers use `activeTab` to decide refresh islands.

Data fetching/persistence coupling:

- tab state affects when refresh effects run and which islands refresh.
- `activeTab` does not own the fetch functions or persistence effects.
- `refreshIslandsForTab`, `refreshIntervalForTab`, `refreshCurrentSurface`, and
  refresh refs should remain in `app/trade-app.tsx` for the first hook
  extraction.

Execution/handoff coupling:

- `activeTab` does not own execution or handoff state.
- execution modals, orchestrator calls, and Avanza diagnostics do not depend on
  tab state except through the mounted view.

Modal coupling:

- tab switches happen after add-trade and close-position flows.
- these flows should keep calling the exposed setter or a simple `setActiveTab`
  alias.
- selected recommendation/position state and modal state should not move with
  navigation.

E2E label/selector coupling:

- tab labels are visible and should not change.
- active class names should not change.
- nav DOM structure should stay in `app/trade-app.tsx` for the first extraction.

## 4. Proposed Hook Boundary

Recommended file:

- `hooks/trade-app/useTradeAppNavigationState.ts`

Existing hook organization has `hooks/execution/*` for execution-specific hooks.
A `hooks/trade-app/*` namespace is a better fit for app-shell state than adding
navigation to `hooks/execution`.

Safe hook responsibilities:

- own `activeTab`.
- initialize to `"Recommendations"`.
- expose `setActiveTab`.
- optionally expose tiny typed helpers such as `goToRecommendations`,
  `goToLiveDayTrades`, `goToHistory`, and `goToStatistics` only if they preserve
  current behavior exactly.

Do not include in the first hook:

- `primaryTabs` or `secondaryTabs` unless the extraction is purely typed and
  does not move render behavior.
- `refreshIslandsForTab`.
- `refreshIntervalForTab`.
- refresh effects.
- focus/visibility effects.
- URL/hash/localStorage persistence.
- app content rendering.
- modal state or trade mutation handlers.

The lowest-risk Action 391 implementation is:

- create `useTradeAppNavigationState`.
- replace `useState<Tab>("Recommendations")` with the hook.
- keep all tab constants, nav rendering, effects, handlers, and refresh helpers
  in `app/trade-app.tsx`.

## 5. What Should Remain In trade-app.tsx

- primary and secondary nav rendering.
- Settings route link.
- tab content conditional rendering.
- `primaryTabs` and `secondaryTabs` initially, unless Action 391 finds exporting
  them with the hook is mechanically safer.
- `refreshIslandsForTab` and `refreshIntervalForTab`.
- refresh effects and refs.
- data fetching and state.
- modals and selected recommendation/position state.
- execution/handoff state.
- persistence effects.
- trade mutation flows.
- e2e-visible labels, active class names, and markup structure.

## 6. Risk Assessment

Hook order risk:

- Low if Action 391 replaces one `useState` call at the top of `TradeApp` with
  one custom hook call in the same position.

Stale closure risk:

- Low if the hook only returns state and setter.
- Higher if callback wrappers are added and then used in effects; avoid that in
  the first extraction.

E2E label/selector risk:

- Low if labels, constants, nav rendering, class names, and DOM structure stay
  in `app/trade-app.tsx`.

localStorage/URL coupling risk:

- Low because none exists today.
- Do not add persistence or deep-linking during the extraction.

Accidental tab default change:

- Medium impact, low likelihood.
- The hook must initialize to `"Recommendations"` exactly.

Modal/execution interaction risk:

- Low if existing handlers keep calling the returned setter.
- Do not move selected modal state, close/open logic, execution preview state, or
  handoff logic.

Refresh behavior risk:

- Medium because refresh effects depend on `activeTab`.
- Keep the refresh effects parent-owned and only feed them the same value from
  the hook.

## 7. Recommended Next Action

Recommended next action:

**Action 391 - Extract Navigation/Tab State Hook**

Scope:

- create `hooks/trade-app/useTradeAppNavigationState.ts`.
- move only `activeTab` state ownership and the setter return value.
- preserve the `"Recommendations"` default.
- keep nav rendering, tab constants, refresh helpers/effects, data loading,
  modals, persistence, and execution wiring in `app/trade-app.tsx`.

## 8. Verification

Verification for this documentation-only action:

- `git diff --check`

No runtime code changes are expected.

## Action 391 Result

Action 391 added `hooks/trade-app/useTradeAppNavigationState.ts`.

Result:

- Extracted only `activeTab` state and its setter into a tiny hook.
- Preserved the default tab as `"Recommendations"`.
- Kept the `Tab` alias in `app/trade-app.tsx` by importing the hook's
  `TradeAppTab` type.
- Kept primary/secondary nav rendering, tab labels, active class names,
  refresh helpers/effects, route links, data fetching, persistence, modals,
  calculations, and execution/handoff wiring parent-owned.

Next recommended action:

**Action 392 - Reassess Navigation/Tab State Hook Extraction**

## Action 392 Result

Action 392 added
`docs/navigation-tab-state-hook-post-extraction-reassessment.md`.

Result:

- Confirmed the navigation hook boundary stayed tiny: `activeTab`,
  `setActiveTab`, and the `TradeAppTab` type only.
- Confirmed the default tab remains `"Recommendations"`.
- Confirmed nav rendering, labels, active class names, refresh helpers/effects,
  persistence, calculations, modals, and execution/handoff behavior remain
  parent-owned.
- Recommended reassessing Statistics range state before moving another hook.

Next recommended action:

**Action 393 - Reassess Statistics Range State Hook Boundary**
