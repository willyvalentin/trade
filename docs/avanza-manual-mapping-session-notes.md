# Avanza Manual Mapping Session Notes

Date: 2026-06-11

Status: Documentation-only intake template for future manual Avanza mapping sessions. No Avanza automation was added, no Avanza URL or selector was added to runtime code, no credential was added, no scraping was added, and no order submission is in scope.

Related:

- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-vs-mock-order-contract-gap-analysis.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Use this template to capture sanitized observations from a manual Avanza order-flow research session and feed those observations back into the mapping, selector-note, and mock-contract gap documents.

This document is manual-only. It does not authorize Avanza automation, runtime selectors, Avanza URLs, credentials, scraping, broker result capture, Supabase writes, trade mutation, or order submission.

Before a fresh mapping session, start with
`docs/avanza-manual-mapping-refresh-pack.md`. The refresh pack defines the
session setup, required flows, field/validation/readback templates, and
green/yellow/red outcome categories for deciding whether the dry-run specs and
mock contracts still match the current UI.

## Session Metadata

| Field | Value |
| --- | --- |
| Date/time |  |
| Researcher |  |
| Environment/browser |  |
| Screen size |  |
| Language |  |
| Market status |  |
| Instrument(s) |  |
| Action tested: buy/sell |  |
| Order type tab tested: Advanced/Stop Loss/Glidande |  |
| Sensitive info removed: yes/no |  |
| Final confirmation avoided: yes/no |  |

## Safety Confirmation

- [ ] Automatic mode off.
- [ ] No final `Bekräfta köp` clicked.
- [ ] No final `Bekräfta sälj` clicked.
- [ ] No credentials recorded.
- [ ] Account, balance, and holdings hidden or removed.
- [ ] Personal info hidden or removed.
- [ ] Screenshots sanitized.
- [ ] BankID, session tokens, cookies, local storage, and browser storage not captured.
- [ ] Flow stopped before any real order submission.

## Observed Flow Summary

- Entry point:
- Steps taken:
- Where flow stopped:
- Unexpected behavior:
- Screenshots included:

## Screenshot Index

| Filename | Step | Description | Sensitive info removed? | Notes |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Step Observation Table

| Step ID | UI area | Visible label/anchor | Field/button type | Action taken | Expected result | Observed result | Mock field mapping | Confidence | Risk note | Open question |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  | high/medium/low |  |  |

## Form Field Inventory

### Search Drawer Fields

| Label | Type | Required? | Value example | Validation behavior | Mock equivalent |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

### Stock Page Anchors

| Label | Type | Required? | Value example | Validation behavior | Mock equivalent |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

### Advanced Order Fields

| Label | Type | Required? | Value example | Validation behavior | Mock equivalent |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

### Stop Loss Fields

| Label | Type | Required? | Value example | Validation behavior | Mock equivalent |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

### Glidande Fields

| Label | Type | Required? | Value example | Validation behavior | Mock equivalent |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

### Confirmation Modal Fields

| Label | Type | Required? | Value example | Validation behavior | Mock equivalent |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Validation Observations

| Scenario | Action taken | Error text | Field affected | Can recover? | Mock validation equivalent | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Empty required field |  |  |  | yes/no | `required` |  |
| Minimum amount |  |  |  | yes/no | `minimum_amount` |  |
| Invalid quantity |  |  |  | yes/no | `invalid_number` |  |
| Invalid price |  |  |  | yes/no | `invalid_price` |  |
| Unsupported order mode |  |  |  | yes/no | `unsupported_order_mode` |  |

## Confirmation Modal Observations

Do not click final `Bekräfta köp` or `Bekräfta sälj`.

| Field label | Shown value | Matches order form? | Required for semi-auto verification? | Mock equivalent | Notes |
| --- | --- | --- | --- | --- | --- |
|  |  | yes/no | yes/no |  |  |

## Risk Findings

| Risk | Present? | Evidence | Mitigation / note |
| --- | --- | --- | --- |
| Wrong instrument risk | yes/no |  |  |
| Wrong account risk | yes/no |  |  |
| Wrong action risk | yes/no |  |  |
| Wrong order mode risk | yes/no |  |  |
| Wrong price/quantity risk | yes/no |  |  |
| Validation risk | yes/no |  |  |
| Final submit proximity risk | yes/no |  |  |
| Session timeout risk | yes/no |  |  |
| Responsive layout risk | yes/no |  |  |

## Open Questions Resolved

| Question | Answer | Evidence screenshot | Confidence | Follow-up needed? |
| --- | --- | --- | --- | --- |
|  |  |  | high/medium/low | yes/no |

## New Open Questions

| Question | Why it matters | Proposed next test |
| --- | --- | --- |
|  |  |  |

## Recommended Doc Updates

- [ ] Update `docs/avanza-ui-research-mapping.md`.
- [ ] Update `docs/avanza-manual-selector-notes.md`.
- [ ] Update `docs/avanza-vs-mock-order-contract-gap-analysis.md`.
- [ ] Update mock contract if needed.
- [ ] Update `docs/avanza-manual-mapping-qa-checklist.md` if a checklist item is missing.

## Next Action Recommendation

Default:

- Action 242 - Avanza Mapping Update from Session Notes

If the session produced no new information:

- Action 242 - Semi-auto Avanza Prototype Safety Plan

Keep any Action 242 work documentation-first unless a separate explicit automation safety plan is approved.
