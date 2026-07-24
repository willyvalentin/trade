# Avanza Real-World Login Flow Signals

Status: `avanza_real_world_login_flow_signals_added`

## Purpose

This document records the sanitized Avanza login-flow signals derived from
user-provided visual material. The material is used for selector and state
planning only.

## Observed Sanitized Flow

The sanitized visual material shows:

- initial Avanza login page
- Private/Företag toggle
- private username/password path by selecting `Användarnamn och lösenord`
- company login path by selecting `Företag`
- private/company forms using `Användarnamn` and `Lösenord`
- primary login button `Logga in`
- private secondary action `Avbryt`
- company secondary action `Logga in på företagswebben`
- BankID options including `Visa QR-kod`
- same-device BankID option `Öppna BankID på samma enhet`

## Implemented Signal Pack

The login-flow signal pack is implemented in:

- `lib/avanza-real-world-login-signals.ts`
- `lib/avanza-real-world-login-signals-fixtures.ts`
- `components/execution/AvanzaRealWorldLoginSignalsHarness.tsx`

The dev-only visual QA route renders the harness as fixture/model-only content.

## Detector Strengthening

The login state detector and page state detector now recognize the sanitized
Swedish login cues. `Användarnamn och lösenord`, `Privatkund`, `Användarnamn`,
and `Lösenord` can classify username/password possibility in read-only model
state. `Visa QR-kod` and `Öppna BankID på samma enhet` classify BankID/MFA
signals and remain manual-user-action only.

`Logga in` alone is not treated as enough to infer username/password form
readiness.

## Safety Guarantees

- no credentials
- no password values
- no personnummer
- no account numbers
- no cookies/session
- no BankID QR payload or image
- no actual login
- no credential provider access
- no Keychain, 1Password, or environment read
- no form fill
- no click
- no Avanza navigation
- no Trade UI wiring
- no BUY/SELL fill
- no final KÖP/SÄLJ
- no order submission
- no confirmation capture
- no Supabase execution write
- final human confirmation required
- not production ready

The dev QA visibility surface must keep these exact source-level safety phrases:

- Avanza real-world login signal pack
- Based on sanitized user-provided visual material
- Fixture only
- No credentials
- No password values
- No personnummer
- No account numbers
- No cookies/session
- No BankID QR
- Username/password flow recognized
- Private login flow recognized
- Company login flow recognized
- BankID options detected but forbidden
- No actual login
- No credential handling
- No form fill
- No click
- No Avanza navigation
- No order submission
- Final human confirmation required
- Not production ready

## Phase Boundary

This is a sanitized signal-pack/model phase only. It may inform future selector
planning, but it does not permit login automation, BankID automation, credential
handling, browser navigation, or order behavior.

## Relationship To Execution Settings

The Ture Avanza execution settings profile now models the user-selected
customer type that will choose between the `Privat` and `Företag` login paths.
It also models username/password credential configuration and secure provider
selection without storing or returning raw credential material.

BankID cues in this signal pack remain detection-only and forbidden for
automation. Actual credential access and login are still not implemented.

## Login Route Planner Relationship

Login route planning is now modeled in `docs/avanza-login-route-planner.md` and
`lib/avanza-login-route-planner.ts`. The sanitized signal pack can indicate
whether the private route needs "Användarnamn och lösenord", whether the company
route needs "Företag", whether username/password fields are visible, or whether
BankID/MFA requires manual action.

Private and company routes are distinct. BankID options are manual-action only.
Action steps are planned but not executable yet.
