# Action 666GA — Provider-free exit-decision explanation projection

## Bounded objective

Implement the one outcome selected by Action 666FZ: a deterministic Swedish
explanation projection for an already-declared exit-decision classification.
The implementation is a standalone library value and is default-off because no
route, component, API, server action, scheduler, queue, writer or caller
imports it in application runtime.

## Closed input and output contract

`projectAction666gaExitDecisionExplanation` accepts exactly these own data
fields and rejects every other shape:

| Field | Accepted value |
| --- | --- |
| `decision_status` | A closed, previously declared classification status |
| `decision_reason` | A closed, previously declared classification reason |
| `decision_priority` | The corresponding safe integer priority |

It accepts only the seven exact tuples recorded in the source contract:
`hard_stop`, `invalidation`, `session_close`, `final_target`,
`first_target_partial`, `profit_protection_stop_move` and `hold`. A tuple with
individually known values but an unknown combination is rejected. The result
contains fixed Swedish advisory copy and the explicit authority
`advisory_projection_no_execution_authority`; it has no trade, persistence or
runtime effect.

## Explicit exclusions

The projection does not import or invoke the exit evaluator. It does not accept
canonical input JSON, price, quantity, position or recommendation identity,
digest, policy, credential or timestamp. It has no external imports and does
not read a database, service, environment, secret, queue or provider; it makes
no network request and mutates no state.

The projection neither decides nor changes a classification. It has no route,
UI, authenticated read, deployment, writer, broker or execution wiring. Any
future caller must be admitted in a separate action and re-read its own durable
state; this implementation conveys no such authority.

## Evidence and next boundary

Action 666GA starts from protected main
`4b4d6dc15ccc0d2e9741aec94fe048771b7da5ab`, whose exact-main Full CI run
`33080999099` is green. Its post-merge provenance reports `matched`: candidate
`ce7c44d884e73871bfcc1d4d3ec9e9dee86a9361` and main share tree
`79ab9d0aeca475281877cad3e0fddccfe38fd5db`.

The next bounded action is `ACTION_666GB`: an independent static scope review
of this source contract. It may not wire the projection into any runtime path
or reopen the blocked secret, transport, writer, database, route/UI, provider
or broker prerequisites.
