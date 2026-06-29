# Gated Real Avanza Fill-Only Adapter Operator Setup Checklist

## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- No new operator-provided Avanza setup evidence was supplied, so missing
  evidence is documented explicitly.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Purpose

Action 1031 adds the manual operator setup checklist for a future gated adapter
manual run setup.

This is not the real run. This is not implementation. This is not order
execution. It does not access Avanza, launch or control a browser, query the
DOM, fill fields, click buttons, click `Granska köp`, click `Bekräfta köp`,
click `Bekräfta sälj`, submit an order, call providers/routes/scans, call
Supabase, or mutate trades/stats/PnL.

## Operator Prerequisites

- [ ] Operator is present.
- [ ] Operator has read the first fill-only POC runbook.
- [ ] Operator understands the locked scope.
- [ ] Operator understands the stop point is before `Granska köp`.
- [ ] Operator understands final confirm is permanently forbidden.
- [ ] Operator can close the tab/browser immediately.
- [ ] Operator has screenshot/evidence plan ready.
- [ ] Operator has sensitive-info redaction plan ready.

## Browser/Avanza Manual Setup

- [ ] Operator opens the browser manually.
- [ ] Operator logs in to Avanza manually.
- [ ] Operator handles BankID/2FA manually.
- [ ] No credentials or session data are shared with Ture or the agent.
- [ ] Correct account is manually selected and verified.
- [ ] Correct instrument/order page is manually opened and verified.
- [ ] Buy side is visible.
- [ ] Avancerad/Limit is selected.
- [ ] Amount and price fields are visible.
- [ ] Total amount output is visible.
- [ ] No modal is open.
- [ ] No `Bekräfta köp` or `Bekräfta sälj` control is visible as a target.
- [ ] Browser is ready to close if needed.

## Ture/Local Setup

- [ ] Approval capture exists and is approved.
- [ ] Adapter skeleton can return `ready_for_manual_run_setup` in local
      evaluation.
- [ ] Implementation stub is safe.
- [ ] Dry-run harness is safe.
- [ ] Guard is safe.
- [ ] Selector policy is safe.
- [ ] Cap policy is safe.
- [ ] All real execution capability flags are false.
- [ ] Review click remains blocked.
- [ ] Final confirm remains forbidden.
- [ ] `.env.local` is unchanged.
- [ ] No service-role exposure exists.
- [ ] No audit writer client path exists.
- [ ] No provider/scan invocation is performed.

## Locked POC Values

- [ ] Cap is explicitly chosen and is less than or equal to 1,000 SEK.
- [ ] Sizing mode is amount-based.
- [ ] Approved amount value is below cap.
- [ ] Approved price value is documented.
- [ ] Instrument is documented.
- [ ] Account is documented only in redacted/generic form.
- [ ] Order type is Limit/Avancerad.
- [ ] Stop point is before review.

## Hard Stop Confirmation

Stop immediately if any of these are true:

- [ ] Side is not buy.
- [ ] Order type is not Limit.
- [ ] Account mismatch.
- [ ] Instrument mismatch.
- [ ] Total cannot be parsed.
- [ ] Total exceeds cap.
- [ ] Validation errors appear.
- [ ] Review click is requested.
- [ ] Modal opens.
- [ ] Final confirm appears targeted.
- [ ] User uncertainty.

## Evidence Setup

- [ ] Before screenshot plan.
- [ ] After-fill screenshot plan.
- [ ] Guard output capture plan.
- [ ] Selector policy output capture plan.
- [ ] Cap output capture plan.
- [ ] Approval output capture plan.
- [ ] No review click statement.
- [ ] No modal statement.
- [ ] No final click statement.
- [ ] No order placed statement.

## Setup Readiness Decision

Use one:

- `operator_setup_ready_for_manual_run_setup`
- `operator_setup_deferred`
- `operator_setup_blocked`

Default for this action:

`operator_setup_deferred`

Reason: Action 1031 creates the checklist only. It does not observe actual
operator setup and does not run the adapter against Avanza.

## Result Status

`gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`

## Recommended Next Action

Action 1032 - Capture Gated Adapter Operator Setup Evidence.

Reason: after the checklist exists, operator setup evidence must be captured
before any actual manual run setup.

## Safety Confirmation

- No runtime code was modified.
- No browser automation was added.
- No Avanza access was added.
- No DOM query code was added.
- No field filling implementation was added.
- No review button click behavior was added.
- No final click behavior was added.
- No submit or order placement behavior was added.
- No broker behavior was added.
- No automatic order submission enablement was added.
- No Supabase call or write was added.
- No provider/route/scan invocation was performed.
- No audit writer UI/browser/client invocation was added.
- No migration, type generation, or generated type edit was performed.
- `.env.local` was not modified.

## Validation Results

- Documentation/static-only action completed.
- Referenced docs/path scan passed; all requested docs exist.
- Status consistency scan found
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added` in the
  updated trail.
- Next-action scan found Action 1032 references in the updated trail.
- `operator_setup_deferred` consistency scan passed.
- Optional runtime denial harness exists; import check reached its
  configuration guard and reported missing env names only. No secret values
  were printed.
- Audit writer UI/app-shell scan found only the existing server route boundary.
- Checklist-specific executable scan found expected documentation-only safety
  terms and no executable code.
- `NEXT_PUBLIC_*SERVICE*` and service-role scan found expected existing
  server-side service-role modules plus this checklist's redaction statement;
  no service-role value was printed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- `git diff --check` passed.
- Touched-file trailing whitespace scan returned no output.
- `find docs -type f -size 0` returned no output.
- `.env.local` diff check returned no output.
