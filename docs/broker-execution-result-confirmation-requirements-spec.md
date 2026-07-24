# BrokerExecutionResult Confirmation Requirements Spec

## 1. Purpose

Define what counts as a production-safe confirmed `BrokerExecutionResult`.

This specification turns the Action 448 confirmation-path reassessment into
explicit source classifications, evidence requirements, Avanza-specific
expectations, validation rules, provenance requirements, rejection mapping, and
non-goals.

This action is documentation/spec only. It adds no runtime code, refactor,
behavior change, `BrokerExecutionResult` creation, broker confirmation capture
change, Avanza/browser behavior, Supabase change, persistence/write behavior,
audit append, or trade mutation.

## 2. Scope

Included:

- production-safe confirmed broker-originating execution result requirements.
- semi-automatic manual confirmation path requirements.
- source evidence requirements.
- conversion eligibility requirements.
- persistence eligibility preconditions.
- anti-spoofing and provenance requirements.

Excluded:

- preview-only broker result data.
- dev fixture data.
- dry-run route output.
- mock broker output.
- local diagnostics records.
- Avanza automation itself.
- final confirmation click automation.
- execution-record persistence.
- Supabase writes.
- audit append.
- trade mutation.
- automatic mode.

## 3. Source classifications

`preview_only`:

- BrokerExecutionResult-shaped display or mapping output that is explicitly
  labeled preview-only.
- Allowed for candidate preview only when the candidate builder/validator
  rejects it as preview-only.
- Not allowed for execution record creation, persistence, or trade mutation.

`dev_fixture`:

- Controlled fixture data used for UI QA and dev-only preview flows.
- May produce eligible-looking candidate previews.
- Must keep `safeToPersist=false`.
- Not allowed for persistence or trade mutation.

`mock_broker`:

- Data from the dev mock broker page, mock broker confirmation payloads, or
  converted dev mock broker results.
- Allowed for test/dev diagnostics only.
- Not allowed for production execution record creation, persistence, or trade
  mutation.

`dry_run`:

- Output from the dry-run insert route, dry-run client helper, or dry-run UI
  preview.
- Allowed for route/client/UI validation only.
- Not a broker result.
- Not allowed for persistence or trade mutation.

`local_diagnostics`:

- Local bridge responses, agent diagnostics, execution audit diagnostics, and
  Settings-only diagnostic records.
- Allowed for troubleshooting and preview display only.
- Not broker-confirmed.
- Not allowed for persistence or trade mutation.

`broker_confirmed`:

- Future source classification for broker-originating sanitized evidence that
  passes confirmation evidence requirements.
- May become eligible for conversion to a production-safe
  `BrokerExecutionResult` only after all required evidence, validation,
  provenance, and anti-spoofing checks pass.
- Does not automatically persist or mutate trades.

`production_safe_candidate`:

- A confirmed broker-originating result that passed source classification,
  confirmation requirements, conversion validation, creation validation,
  persistence validation, idempotency checks, and current schema/security
  preconditions.
- May be considered for a future server-only persistence path.
- Still not allowed to mutate trade state without a separate trade mutation
  boundary.

Classification usage:

| Source class | Candidate preview | Execution record creation | Persistence | Trade mutation |
| --- | --- | --- | --- | --- |
| `preview_only` | Display/rejection only | No | No | No |
| `dev_fixture` | Dev UI QA only | No production creation | No | No |
| `mock_broker` | Tests/dev diagnostics only | No | No | No |
| `dry_run` | Route/UI validation only | No | No | No |
| `local_diagnostics` | Diagnostics only | No | No | No |
| `broker_confirmed` | Future only after validation | Future candidate only | Not by itself | No |
| `production_safe_candidate` | Yes | Future server-only path | Future only after all persistence gates | No, separate boundary |

## 4. Required broker confirmation evidence

A production-safe confirmed `BrokerExecutionResult` must include or derive:

- broker name, initially `avanza`.
- broker/source environment.
- broker order id.
- broker confirmation id, fill id, execution id, or a reviewed strong
  equivalent.
- ticker or broker instrument identifier.
- instrument name when available.
- market when available.
- instrument type when available.
- side, `buy` or `sell`.
- executed quantity.
- execution price or average fill price.
- currency.
- fees/courtage when available.
- gross/net/total amount when available.
- confirmation timestamp from broker evidence.
- captured timestamp from the capture process.
- source capture method.
- source page/flow identity.
- source capture id or evidence id.
- source evidence fingerprint.
- linked prior handoff payload/fingerprint.
- linked dry-run request or execution intent when available.
- semi-automatic human/manual confirmation marker.
- provenance metadata proving this is not preview/dev/mock/dry-run/local
  diagnostics.

The evidence must not include broker credentials, cookies, tokens, 2FA
material, raw personal data, account numbers, balances, holdings, raw DOM, or
unsanitized screenshots.

## 5. Avanza-specific evidence expectations

Confirmation page/readback expectations:

- The readback should come from a post-confirmation Avanza receipt,
  confirmation, order status, or execution/fill view.
- The source page/flow identity must distinguish it from pre-confirmation order
  entry and review pages.
- Readback should expose action, ticker/instrument, quantity, price, currency,
  timestamp, and order/reference id when available.
- Readback should include order status wording that can distinguish
  `filled/executed` from `placed/accepted/pending`.

Screenshot/text/readback fields:

- Text/OCR/browser extraction may be used only as sanitized evidence.
- Extracted fields must be normalized and validated against the original
  handoff/dry-run request.
- Raw page text, raw screenshots, DOM, credentials, account numbers, balances,
  holdings, cookies, and tokens must not be stored as broker result evidence.

Order preview vs confirmed execution:

- Pre-confirmation forms and order previews are not execution evidence.
- Review-click readback is not execution evidence.
- `user_confirmed_unverified` is not execution evidence.
- Placed or accepted order wording is not a confirmed filled execution.
- A confirmed execution requires filled/executed wording or an explicitly
  reviewed broker-specific equivalent.

Missing order id / confirmation id:

- Missing broker order id should block by default.
- Missing confirmation id may be allowed only if a strong equivalent exists and
  the missing-id policy is explicitly reviewed.
- Any missing-id allowance must still produce a deterministic idempotency key
  and should require manual review.

Partial fills:

- Partial fills must not be mapped to full execution records until a
  partial-fill accounting policy exists.
- If Avanza evidence indicates partial fill, conversion should return blocked
  or needs-review status.
- A future partial-fill policy must define quantity, remaining quantity,
  average price, fees, position state, and duplicate handling.

## 6. Field validation rules

Side/action:

- side must be present and equal to expected action.
- mismatch maps to `side_mismatch`.

Instrument:

- ticker or broker instrument identifier must be present.
- instrument must match intended ticker/instrument according to the reviewed
  instrument policy.
- mismatch maps to `instrument_mismatch`.

Quantity:

- executed quantity must be numeric, finite, and positive.
- quantity must match expected quantity unless a future tolerance/partial-fill
  policy allows otherwise.
- invalid quantity maps to `quantity_invalid`.
- mismatch maps to `quantity_mismatch`.

Price:

- execution price or average fill price must be numeric, finite, and positive.
- price must be tied to broker evidence, not only the intended/limit price.
- invalid price maps to `price_invalid`.

Timestamp:

- confirmation timestamp must be present and plausible.
- captured timestamp must be present.
- confirmation timestamp must not be generated as authoritative evidence
  unless a future policy explicitly allows it.
- missing confirmation timestamp maps to
  `missing_confirmation_timestamp`.

Account/session context:

- broker session/account context should be present or explicitly documented as
  unavailable.
- account context must be sanitized.
- ownership/user/account context must align with future RLS/server-only
  persistence rules.

Broker confirmation id:

- broker order id, confirmation id, fill id, execution id, or reviewed strong
  equivalent must be present.
- missing stable broker reference maps to `missing_order_id`.

Source classification:

- source must not be `preview_only`, `dev_fixture`, `mock_broker`, `dry_run`, or
  `local_diagnostics`.
- source must not have `previewOnly`, `notBrokerExecutionResult`,
  `isSynthetic`, `isDevOnly`, or `isMock` production flags.

Idempotency:

- source evidence fingerprint must be derivable.
- idempotency key must be derivable.
- duplicate detection must include broker reference, confirmation timestamp,
  side, ticker/instrument, quantity, and price where possible.

## 7. Anti-spoofing/provenance requirements

- source type must be explicit.
- capture source must be auditable.
- arbitrary JSON must not be accepted as confirmation.
- user-entered-only data must not be accepted as a broker result.
- preview-shaped objects must not be accepted as broker confirmations.
- confirmation must be linked to a prior handoff payload/fingerprint.
- confirmation must include `captured_at` and source capture metadata.
- source evidence fingerprint must be stable and deterministic.
- capture must preserve enough provenance to trace request, capture, and
  conversion decisions.
- future OCR/browser extraction must be treated as untrusted until normalized,
  sanitized, and validated against the original handoff.
- sensitive/raw data detection must block conversion.
- evidence must identify whether the broker page is post-confirmation,
  order-status, fill/execution, review, or pre-confirmation.
- agent final-confirm attempts must block production-safe classification.

## 8. Relationship to execution record creation

- Broker confirmation does not automatically create an execution record.
- `validateExecutionRecordCreationInput(...)` still runs.
- `buildExecutionRecordCandidate(...)` still runs.
- Persistence validator still runs.
- Migration/schema readiness is still required.
- RLS/user/account readiness is still required.
- Duplicate lookup is still required.
- Server-only write boundary is still required.
- `safeToPersist` remains false unless all future gates explicitly pass.
- Existing preview/dev/mock/dry-run/local diagnostic sources remain blocked.

## 9. Relationship to trade mutation

- Broker confirmation does not automatically mutate trade state.
- Opening/closing live or history trade state requires a separate mutation
  boundary.
- Trade mutation must remain separate from broker confirmation capture,
  BrokerExecutionResult conversion, execution-record creation, and Supabase
  persistence.
- Semi-automatic user confirmation remains required for real execution paths.
- Automatic mode remains out of scope.
- Any future trade mutation path needs its own validator, idempotency strategy,
  audit policy, rollback/error handling, and e2e coverage.

## 10. Rejection reason mapping

Existing reason codes:

| Evidence failure | Current reason code |
| --- | --- |
| No broker-originating result | `missing_confirmed_broker_result` |
| Preview-only source | `preview_only_result` |
| Explicit not-a-broker-result source | `not_broker_execution_result` |
| Missing idempotency key | `missing_idempotency_key` |
| Missing source fingerprint | `missing_source_fingerprint` |
| Missing broker order/confirmation/reference | `missing_order_id` |
| Missing confirmation timestamp | `missing_confirmation_timestamp` |
| Unsupported broker | `unsupported_broker` |
| Placed/accepted but not filled | `placed_or_accepted_not_filled` |
| Partial fill without policy | `partial_fill_policy_missing` |
| Synthetic source | `synthetic_result_not_allowed` |
| Dev/mock source | `dev_or_mock_result_not_allowed` |
| Missing side | `missing_side` |
| Side mismatch | `side_mismatch` |
| Missing instrument | `missing_instrument` |
| Instrument mismatch | `instrument_mismatch` |
| Invalid quantity | `quantity_invalid` |
| Quantity mismatch | `quantity_mismatch` |
| Invalid price | `price_invalid` |
| Missing currency | `currency_missing` |
| Sensitive data | `sensitive_data_detected` |
| Raw data | `raw_data_detected` |
| Supabase write attempted in source | `supabase_write_attempted` |
| Trade mutation attempted in source | `trade_mutation_attempted` |
| Automatic mode | `automatic_mode_not_supported` |
| Production policy missing | `production_policy_missing` |

Future reason codes likely needed:

- `provenance_missing`
- `confirmation_source_untrusted`
- `source_page_not_post_confirmation`
- `broker_session_context_missing`
- `capture_timestamp_missing`
- `source_handoff_fingerprint_missing`
- `ocr_evidence_untrusted`
- `order_status_not_execution`
- `account_context_unverified`

These future codes should be added only in a later type/contract action.

## 11. Candidate next actions

A. Create Broker Result Source Classification Types

- safest next implementation-adjacent step.
- encodes `preview_only`, `dev_fixture`, `mock_broker`, `dry_run`,
  `local_diagnostics`, `broker_confirmed`, and `production_safe_candidate`
  without enabling capture, persistence, or trade mutation.
- helps validators and future docs use consistent classifications.

B. Create Avanza Broker Confirmation Evidence Contract

- important after source classification.
- would define typed Avanza evidence fields, provenance, and blocked states.
- closer to capture implementation, so it should follow classification types.

C. Reassess Avanza Broker Confirmation Capture Readiness

- useful once classification/evidence contracts are clearer.
- higher risk because it approaches Avanza/browser behavior.

D. Create BrokerExecutionResult Confirmation Validator

- should wait for source classification and evidence contracts.
- validation before contracts risks encoding ambiguous evidence assumptions.

## 12. Recommended next action

**Action 450 - Create Broker Result Source Classification Types**

## Action 450 Follow-Up

Action 450 created `lib/broker-result-source-classification.ts`.

Result:

- Added contract-only source classification types/constants for
  `preview_only`, `dev_fixture`, `mock_broker`, `dry_run`,
  `local_diagnostics`, `broker_confirmed`, and
  `production_safe_candidate`.
- Added pure policy metadata for candidate preview, execution-record creation,
  persistence, and trade mutation capability flags.
- Confirmed preview/dev/mock/dry-run/local diagnostics are blocked from
  persistence and trade mutation.
- Confirmed `broker_confirmed` is still not persistence-eligible by itself.
- Confirmed trade mutation remains false for every class.

Boundary:

- No validator, conversion, capture, persistence, Supabase write, audit append,
  trade mutation, browser, or Avanza behavior was added.

Next recommended action:

**Action 451 - Reassess Broker Result Source Classification Types**

## Action 451 Follow-Up

Action 451 created
`docs/broker-result-source-classification-types-reassessment.md`.

Result:

- Verified `lib/broker-result-source-classification.ts` remains
  type/constant-only.
- Confirmed classifications match this requirements spec.
- Confirmed preview/dev/mock/dry-run/local diagnostics are
  persistence-blocked.
- Confirmed `broker_confirmed` is not persistence-capable by itself.
- Confirmed trade mutation is false for every class.
- Documented policy gaps before runtime validation/enforcement.

Next recommended action:

**Action 452 - Create Broker Result Source Classification Validator**

## Action 452 Follow-Up

Action 452 created `lib/broker-result-source-classification-validator.ts`.

Requirements impact:

- Source classification now has a pure policy validator.
- The validator does not create or convert BrokerExecutionResults.
- The validator does not capture broker evidence, persist execution records,
  write Supabase, append audit events, mutate trades, control a browser, or
  touch Avanza.
- Preview/dev/mock/dry-run/local diagnostics remain blocked for persistence
  and trade mutation.
- `broker_confirmed` still requires additional persistence gates.

Next recommended action:

**Action 453 - Reassess Broker Result Source Classification Validator**

Rationale:

- current docs repeatedly rely on source labels like preview-only, dev fixture,
  mock broker, dry-run, local diagnostics, and broker-confirmed.
- adding contract-only classification types is a low-risk way to make future
  validators and evidence contracts more precise.
- this keeps the next step type-only and avoids broker capture, persistence,
  Supabase writes, or trade mutation.

## 13. Risk assessment

Spoofed confirmation risk:

- high. Arbitrary JSON, user-entered fields, preview-shaped data, and mock
  diagnostics can spoof broker-like fields without provenance.

Preview mistaken as confirmed risk:

- high. Existing preview metadata must continue to block confirmation,
  persistence, and trade mutation.

Partial-fill ambiguity:

- high. Partial fills need separate accounting and should block full execution
  results until policy exists.

Missing broker id risk:

- high. Missing order/confirmation id weakens idempotency and duplicate
  protection.

Avanza UI fragility:

- high. Wording, page flow, order states, and available identifiers may vary.
  Ambiguous UI evidence should block or require manual review.

OCR/browser extraction trust risk:

- high. OCR/browser extraction is untrusted until sanitized, normalized, and
  validated against the handoff.

Trade mutation coupling risk:

- high. Broker confirmation must not directly open/close/settle trades.

Persistence false-positive risk:

- high. A false positive could create durable incorrect execution records and
  corrupt downstream History/Statistics.

## 14. Verification

Verification for this documentation-only specification:

- `git diff --check`

No runtime code changes were made. No `BrokerExecutionResult` creation, broker
confirmation capture changes, Avanza/browser behavior, persistence/write
behavior, Supabase changes, audit append, or trade mutation was added.

## Action 453 Follow-Up

Action 453 created
`docs/broker-result-source-classification-validator-reassessment.md`.

Requirements impact:

- The source classification validator was reassessed as pure and policy-only.
- It continues to block preview/dev/mock/dry-run/local diagnostics from
  persistence.
- It continues to reject trade mutation for every current source class.
- `broker_confirmed` remains insufficient for persistence by itself.
- `production_safe_candidate` remains policy metadata only and does not enable
  writes or trade mutation.

Next recommended action:

**Action 454 - Create Avanza Broker Confirmation Evidence Contract**

## Action 454 Follow-Up

Action 454 created
`docs/avanza-broker-confirmation-evidence-contract.md`.

Requirements impact:

- Avanza confirmation evidence now has a documentation-only contract covering
  source types, required fields, optional fields, provenance, validation
  prerequisites, partial fills, rejection flags, and privacy.
- Order form and preview sources are explicitly disallowed as confirmed
  execution evidence.
- Final confirmation/readback or account/order history evidence is required
  before future conversion can be considered.
- No `BrokerExecutionResult` creation, capture implementation, persistence,
  Supabase behavior, audit append, trade mutation, browser, or Avanza behavior
  was added.

Next recommended action:

**Action 455 - Create Avanza Broker Confirmation Evidence Types**

## Action 455 Follow-Up

Action 455 created
`lib/avanza-broker-confirmation-evidence-contract.ts`.

Requirements impact:

- Avanza confirmation evidence now has type/constant-only contracts.
- Required/optional evidence fields, provenance metadata, privacy metadata,
  field confidence, partial-fill evidence, and rejection/uncertainty flags are
  modeled.
- Source types and allowed/disallowed source categories are explicit.
- No validator, capture implementation, conversion, persistence, Supabase
  behavior, audit append, trade mutation, browser automation, or Avanza
  behavior was added.

Next recommended action:

**Action 456 - Reassess Avanza Broker Confirmation Evidence Types**

## Action 456 Follow-Up

Action 456 created
`docs/avanza-broker-confirmation-evidence-types-reassessment.md`.

Requirements impact:

- Avanza evidence types were verified as aligned with the requirements spec
  and evidence contract.
- Source types, required/optional fields, provenance/privacy metadata,
  partial-fill evidence, and rejection/uncertainty flags are modeled.
- Typed evidence still does not validate broker confirmation or enable
  conversion, persistence, Supabase writes, audit append, trade mutation,
  browser behavior, or Avanza behavior.

Next recommended action:

**Action 457 - Create Avanza Broker Confirmation Evidence Validator**

## Action 457 Follow-Up

Action 457 created
`lib/avanza-broker-confirmation-evidence-validator.ts`.

Requirements impact:

- Avanza confirmation evidence now has a pure validation gate before any
  future `BrokerExecutionResult` confirmation validator.
- The validator is conservative and rejects preview/missing/invalid evidence
  while marking ambiguous partial fills and low confidence as needs-review.
- It does not create BrokerExecutionResults, capture Avanza pages, convert
  evidence, persist records, write Supabase, append audit, mutate trades, or
  automate browsers.

Next recommended action:

**Action 458 - Reassess Avanza Broker Confirmation Evidence Validator**

## Action 458 Follow-Up

Action 458 created
`docs/avanza-broker-confirmation-evidence-validator-reassessment.md`.

Requirements impact:

- The evidence validator remains a pre-conversion evidence sanity gate only.
- It does not create confirmed BrokerExecutionResults.
- It does not authorize persistence, Supabase writes, audit append, trade
  mutation, browser behavior, or Avanza behavior.
- Evidence-to-BrokerExecutionResult mapping still needs a design before
  conversion can be considered.

Next recommended action:

**Action 459 - Create Evidence-to-BrokerExecutionResult Mapping Design**

## Action 459 Follow-Up

Action 459 created
`docs/avanza-evidence-to-broker-execution-result-mapping-design.md`.

Requirements impact:

- Future BrokerExecutionResult conversion now has a design-only field mapping
  from validated Avanza evidence.
- The design preserves source classification, provenance, idempotency inputs,
  partial-fill uncertainty, and no-persistence/no-trade-mutation boundaries.
- No conversion implementation or broker result creation was added.

Next recommended action:

**Action 460 - Create BrokerExecutionResult Confirmation Validator Design**

## Action 460 Follow-Up

Action 460 created
`docs/broker-execution-result-confirmation-validator-design.md`.

Requirements impact:

- The confirmation requirements now have a dedicated future validator design.
- The design keeps `confirmed_candidate` separate from persistence approval and
  trade mutation.
- It defines layered checks for evidence validation, source classification,
  source origin, broker references, intent matching, handoff linkage,
  partial-fill clarity, and idempotency readiness.

Next recommended action:

**Action 461 - Create BrokerExecutionResult Confirmation Validator Contract Types**

## Action 461 Follow-Up

Action 461 created
`lib/broker-execution-result-confirmation-validator-contract.ts`.

Requirements impact:

- The confirmation requirements now have type/constant-only contracts for
  validator inputs, statuses, rejection reasons, warnings, policy snapshots,
  evidence references, and fingerprint summaries.
- The contracts preserve the requirement that conversion eligibility is
  separate from persistence and trade mutation eligibility.
- No validator, conversion, capture, persistence, Supabase, audit append, trade
  mutation, browser, or Avanza behavior was added.

Next recommended action:

**Action 462 - Reassess BrokerExecutionResult Confirmation Validator Contract Types**

## Action 462 Follow-Up

Action 462 created
`docs/broker-execution-result-confirmation-validator-contract-reassessment.md`.

Requirements impact:

- The confirmation validator contract was verified against the requirements
  for evidence validation, source classification, handoff linkage, intent
  matching, provenance, and fingerprint readiness.
- The reassessment explicitly confirmed `safeToPersist=false` and
  `safeToMutateTrade=false`.
- No runtime validator, mapper, conversion, persistence, Supabase, audit
  append, trade mutation, browser, or Avanza behavior was added.

Next recommended action:

**Action 463 - Create BrokerExecutionResult Confirmation Validator**

## Action 463 Follow-Up

Action 463 created
`lib/broker-execution-result-confirmation-validator.ts`.

Requirements impact:

- The confirmation requirements now have a pure validator implementation.
- The validator enforces conservative gates for evidence status, source
  classification production safety, handoff fingerprint, broker references,
  side/instrument/quantity/price/timestamp/provenance, partial-fill ambiguity,
  and automatic-mode rejection.
- Confirmed candidates remain non-persistent and non-mutating.

Next recommended action:

**Action 464 - Reassess BrokerExecutionResult Confirmation Validator**

## Action 464 Follow-Up

Action 464 created
`docs/broker-execution-result-confirmation-validator-reassessment.md`.

Requirements impact:

- Verified the pure confirmation validator enforces the current requirements
  for evidence status, source safety, handoff linkage, broker references,
  intent matching, timestamp/provenance checks, partial-fill review, and
  automatic-mode rejection.
- Confirmed `confirmed_candidate` remains non-persistent and non-mutating.

Next recommended action:

**Action 465 - Create Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 465 Follow-Up

Action 465 created
`lib/evidence-to-broker-execution-result-mapper-contract.ts`.

Requirements impact:

- The evidence-to-result mapping requirements now have contract types for
  future mapper input/output shape.
- The contract preserves provenance, fingerprint, partial-fill, no-persistence,
  and no-trade-mutation requirements.
- No conversion implementation or BrokerExecutionResult creation was added.

Next recommended action:

**Action 466 - Reassess Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 466 Follow-Up

Action 466 created
`docs/evidence-to-broker-execution-result-mapper-contract-reassessment.md`.

Requirements impact:

- The mapper contract was verified against confirmation and mapping
  requirements.
- The reassessment confirmed mapped candidates are not persistence approval and
  not trade mutation approval.
- Runtime mapper and BrokerExecutionResult creation remain absent.

Next recommended action:

**Action 467 - Create BrokerExecutionResult Candidate Type/Shape Reassessment**

## Action 467 Follow-Up

Action 467 created
`docs/broker-execution-result-candidate-shape-reassessment.md`.

Requirements impact:

- Required candidate fields and safety flags are now documented before mapper
  implementation.
- Existing preview/dev/mock/execution-record shapes should not be used as the
  production mapper target.
- A dedicated candidate contract is required.

Next recommended action:

**Action 468 - Create BrokerExecutionResult Candidate Contract Types**

## Action 468 Follow-Up

Action 468 created
`lib/broker-execution-result-candidate-contract.ts`.

Requirements impact:

- BrokerExecutionResult candidate contract types now model the required
  broker/source, confirmation, broker reference, instrument, execution, price,
  timestamp, provenance, field mapping, fingerprint, warning, review flag, and
  partial-fill fields.
- The contract explicitly keeps candidate output separate from execution
  records, persistence approval, and trade mutation approval.
- Runtime mapper, conversion, persistence, audit append, and trade mutation
  remain unimplemented.

Next recommended action:

**Action 469 - Reassess BrokerExecutionResult Candidate Contract Types**

## Action 469 Follow-Up

Action 469 created
`docs/broker-execution-result-candidate-contract-reassessment.md`.

Requirements impact:

- Candidate contract requirements were verified after type creation.
- The contract preserves required provenance, fingerprint, partial-fill,
  no-persistence, and no-trade-mutation requirements.
- Mapper implementation remains the next safe contract-driven step.

Next recommended action:

**Action 470 - Create Evidence-to-BrokerExecutionResult Mapper**

## Action 470 Follow-Up

Action 470 created
`lib/evidence-to-broker-execution-result-mapper.ts`.

Requirements impact:

- The pure mapper implements the conservative candidate-only mapping
  requirements.
- It preserves provenance, field mapping, fingerprint contribution,
  partial-fill review handling, and no-persistence/no-trade-mutation safety
  metadata.
- Runtime BrokerExecutionResult creation, execution-record creation,
  persistence, audit append, and trade mutation remain absent.

Next recommended action:

**Action 471 - Reassess Evidence-to-BrokerExecutionResult Mapper**

## Action 471 Follow-Up

Action 471 created
`docs/evidence-to-broker-execution-result-mapper-reassessment.md`.

Requirements impact:

- The mapper was verified as candidate-only and no-write/no-mutation.
- Candidate content carries provenance, field mapping, fingerprint,
  partial-fill, warning/review flag, and safety policy metadata.
- A preview design is recommended before any user-visible mapper output.

Next recommended action:

**Action 472 - Create Mapped BrokerExecutionResult Candidate Preview Design**

## Action 472 Follow-Up

Action 472 created
`docs/mapped-broker-execution-result-candidate-preview-design.md`.

Requirements impact:

- The preview design carries forward confirmation, provenance, field mapping,
  fingerprint, partial-fill, warning/review flag, and safety policy
  requirements.
- It explicitly requires no-persistence and no-trade-mutation labels.
- It keeps user-visible preview separate from execution-record creation and
  persistence.

Next recommended action:

**Action 473 - Create Mapped BrokerExecutionResult Candidate Dev Preview**
