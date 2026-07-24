# Avanza Login Route Planner

Status: `avanza_login_route_planner_model_added`

## Purpose

The Avanza login route planner models the intended login path for the Sharp Semi Auto Execution Agent from explicit inputs only:

- Ture execution settings profile
- Avanza login state model
- Avanza page state model
- sanitized real-world login signal pack

It is a route-model-only helper. It does not navigate, log in, read credentials, fill forms, click buttons, call an API route, fetch, place orders, capture confirmations, or write Supabase execution records.

No credentials are read or returned.

## User Settings Drive The Route

User-selected Privat/Företag in Ture Settings drives the route. Private and company routes are distinct:

- Private route uses `customerType: private`.
- Company route uses `customerType: company`.
- Unknown or incomplete settings stop in a credentials/settings-required state.

Username/password login is the only supported automated login method. BankID is forbidden for automation and bypass.

## Private Flow

The private flow is planned as disabled, non-executable steps:

1. choose "Användarnamn och lösenord" when needed
2. fill Användarnamn
3. fill Lösenord
4. submit "Logga in"
5. stop before any order flow

Each planned action step has `allowedInThisTask: false`.

## Company Flow

The company flow is planned as disabled, non-executable steps:

1. choose "Företag" when needed
2. choose "Användarnamn och lösenord" when needed
3. fill Användarnamn
4. fill Lösenord
5. submit "Logga in"
6. stop before any order flow

Each planned action step has `allowedInThisTask: false`.

## BankID And MFA Boundary

BankID/MFA states stop and require manual action. Signals such as "Visa QR-kod" and "Öppna BankID på samma enhet" are warning/manual-action signals only.

The planner never plans BankID automation, BankID bypass, QR handling, same-device BankID handling, cookie/session export, or credential material handling.

## Safety Guarantees

- `canSelectPrivateToggle` remains `false`
- `canSelectCompanyToggle` remains `false`
- `canSelectUsernamePasswordMethod` remains `false`
- `canFillUsername` remains `false`
- `canFillPassword` remains `false`
- `canSubmitLogin` remains `false`
- `canHandleCredentialMaterial` remains `false`
- `canAutomateBankId` remains `false`
- `canBypassBankId` remains `false`
- `canReadCookies` remains `false`
- `canExportSession` remains `false`
- `canNavigate` remains `false`
- `canClick` remains `false`
- `canFillForm` remains `false`
- `canSubmitOrder` remains `false`
- `userMustConfirm` remains `true`
- `finalHumanClickRequired` remains `true`
- `controlsEnabled` remains `false`
- `gateLocked` remains `true`

## Dev QA Visibility

The model is implemented in `lib/avanza-login-route-planner.ts`.

Static fixtures are in `lib/avanza-login-route-planner-fixtures.ts`.

The isolated fixture/model-only harness is `components/execution/AvanzaLoginRoutePlannerHarness.tsx`.

The dev-only visual QA route renders the harness with static fixtures only. The route remains unlinked from main navigation and is not wired into `app/trade-app.tsx`.

## Login Action Contract Relationship

Login action contract is now modeled in
`docs/avanza-login-action-contract.md` and
`lib/avanza-login-action-contract.ts`. It is the bridge between route planning
and future browser actions.

Actions are currently contract-only and non-executable. No credential material
appears in action output.

## Login Dry-Run Executor Relationship

Login dry-run executor is now modeled in
`docs/avanza-login-dry-run-executor.md` and
`lib/avanza-login-dry-run-executor.ts`.

It verifies that login action plans are internally coherent before any real
action execution. It remains non-executing: no navigation, login, credential
access, form fill, click, cookie/session handling, API route call, fetch, order
behavior, BankID automation/bypass, or Supabase execution write is added.

## Login Mock Page Executor Relationship

Mock executor is now modeled in
`docs/avanza-login-mock-page-executor.md` and
`lib/avanza-login-mock-page-executor.ts`.

It can simulate private/company login action sequences against mock page state
only. It remains mock-only and non-browser. It still does not access
credentials, use Playwright, navigate to Avanza, fill real forms, click real
buttons, submit login, handle cookies/session, submit orders, or write Supabase
execution records.
