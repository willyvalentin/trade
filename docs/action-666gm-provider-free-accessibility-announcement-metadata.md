# Action 666GM — Provider-free accessibility-announcement metadata

## Bounded objective

Implement the Action 666GL selection as one standalone, pure metadata
projection. It accepts only one of the seven fixed Action 666GJ presentation
keys and returns a fixed accessibility-announcement key or an explicit
fail-closed rejection.

## Closed contract

| Field | Boundary |
| --- | --- |
| Input | An own-data object with exactly one string `presentation_key` field. |
| Accepted vocabulary | The seven fixed Action 666GJ presentation keys only. |
| Output | A frozen fixed accessibility-announcement key, or a frozen rejection with a null key. |
| Authority | Advisory metadata only; it has no execution authority. |
| Runtime state | Unwired, with no side effect. |

The projection does not import or invoke the evaluator. It performs no
data/provider/secret/network read and no writer, database, route, UI, deploy,
broker or execution work. It produces no prose, recommendation, price,
quantity, position, timestamp, identity or credential. In particular, there
is no rendered message, ARIA attribute or runtime wiring.

## Deliberate containment

The seven input literals are duplicated as a closed local table rather than
importing the prior projection. That preserves this module's standalone
source-only boundary and creates no runtime consumer of Action 666GJ.

`ACTION_666GN` may only review the static table and source-containment
properties of this module. Any caller, localized message, accessibility UI,
route or wider runtime capability still needs a separate redesign-or-stop
decision.
