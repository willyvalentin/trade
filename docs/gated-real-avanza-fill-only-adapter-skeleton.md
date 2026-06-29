# Gated Real Avanza Fill-Only Adapter Skeleton

## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- The disabled skeleton remains non-executing; actual operator setup evidence
  remains missing.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Action 1031 Operator Setup Checklist Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-checklist.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`.
- Setup readiness decision: `operator_setup_deferred`.
- The checklist is documentation only and does not change the disabled,
  non-executing skeleton behavior.
- Recommended next action: Action 1032 - Capture Gated Adapter Operator Setup
  Evidence.

## Purpose

Action 1030 adds a disabled-by-default, non-executing adapter skeleton for a
future first real Avanza fill-only POC.

This is not a real run. It does not access Avanza, launch a browser, query the
DOM, fill fields, click `Granska köp`, click `Bekräfta köp`, click
`Bekräfta sälj`, submit an order, call providers/routes/scans, call Supabase,
or mutate trades/stats/PnL.

## Implementation

- Module:
  `lib/gated-real-avanza-fill-only-adapter-skeleton.ts`.
- Tests:
  `tests/e2e/gated-real-avanza-fill-only-adapter-skeleton.spec.ts`.
- The skeleton composes the existing approval contract, dry-run harness,
  fill-only guard, selector mapping contract, and implementation stub.
- The input flag is `adapter_skeleton_enabled`; default is disabled.

Result statuses:

- `disabled`
- `blocked`
- `ready_for_manual_run_setup`
- `failed_safety`

## Disabled By Default

With no input, the decision returns:

- `status: disabled`
- `adapter_skeleton_enabled: false`
- `blocked_reasons: ["adapter_skeleton_disabled"]`

No execution capability is enabled by the disabled state.

## Capability Flags

All capability flags are always false, including the ready state:

- `can_access_avanza: false`
- `can_launch_browser: false`
- `can_query_dom: false`
- `can_fill_fields: false`
- `can_click_review: false`
- `can_click_final_confirm: false`
- `can_submit_order: false`

## Gated Readiness Result

If enabled, the skeleton requires:

- Approval snapshot.
- Payload snapshot.
- Selector readiness snapshot.
- Operator approval snapshot.
- Operator setup snapshot.
- Evidence plan snapshot.
- Existing implementation stub readiness.
- Existing selector policy readiness.

Only if every prerequisite passes does it return
`ready_for_manual_run_setup`. This status is setup metadata only and still has
all capability flags false.

## Planned Future Sequence Metadata

The skeleton exposes metadata for the future fill-only sequence:

1. Verify instrument.
2. Verify account.
3. Verify buy side.
4. Verify Limit/Avancerad.
5. Fill amount.
6. Fill price.
7. Read total amount.
8. Stop before review.

The stop point remains `before_review_button`.

## Forbidden Actions

The skeleton hard-blocks:

- Review click / `Granska köp`.
- Final confirm / `Bekräfta köp`.
- Final confirm / `Bekräfta sälj`.
- Sell.
- Stop Loss.
- Glidande.
- Account change.
- Side switch.
- Steppers.
- `Välj alla på kontot`.

The skeleton exposes the selector metadata for these actions but does not use
selectors to access a page.

## Evidence Requirements

The skeleton exposes the existing first-fill-only evidence list and any
operator-provided planned artifact names. Evidence is metadata only in this
action.

## Safety Confirmation

- No real Avanza access.
- No browser launch.
- No DOM query.
- No field filling.
- No click.
- No review modal.
- No final confirmation.
- No submit.
- No broker behavior.
- No Supabase call.
- No route/provider/scan invocation.
- No `.env.local` change.

## Test Coverage

The new focused tests cover:

- Default disabled state.
- Disabled capabilities all false.
- Enabled missing approval blocks.
- Invalid guard/harness blocks.
- Safe approval, guard, and harness can return setup-ready.
- Setup-ready capabilities remain false.
- Planned sequence metadata.
- Evidence requirements.
- Hard forbidden selectors.
- Review click blocked.
- Final confirm forbidden.
- Sell, Stop Loss, and Glidande blocked.
- Account change, side switch, steppers, and `Välj alla på kontot` forbidden.
- Stop point before review.
- Pure import/static safety scan.
- No function name or status implies order placement.

## Result Status

`gated_real_avanza_fill_only_adapter_skeleton_added`

## Recommended Next Action

Action 1031 - Add Gated Adapter Operator Setup Checklist.

## Validation Results

- New focused skeleton test passed: 16/16.
- Existing focused approval, dry-run harness, implementation stub, fill-only
  guard, selector mapping, human-final-confirmation guard, and browser safety
  suite passed: 113/113.
- Runtime import coverage passed through Playwright module import in the new
  focused spec. A standalone `tsx` loader is not installed in this repo.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- `git diff --check` passed.
- `find docs -type f -size 0` returned no output.
- `.env.local` diff check returned no output.
- New production skeleton source scan returned no browser automation, DOM,
  fetch, environment, Supabase, route, provider, scan, audit writer, locator,
  navigation, click, fill, or service-role tokens.
- App/components/hooks import scan found no gated skeleton imports.
- Audit writer UI/app-shell scan found only the existing server route boundary;
  no new audit writer client path was added.
- Market-loop/scanner scan found no gated skeleton import or invocation.
- Automatic-mode scan found only the expected forbidden-action label for
  `Bekräfta köp/sälj`; no automatic submit capability was added.
- Touched-file trailing whitespace scan returned no output.
