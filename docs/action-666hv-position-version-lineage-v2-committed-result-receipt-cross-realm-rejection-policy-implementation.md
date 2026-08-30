# Action 666HV — V2 committed-result receipt cross-realm rejection policy implementation

## Explicit policy decision

Action 666HU selected a future source-only cross-realm rejection review, but
the exact-main observation found that a valid frozen plain receipt-shaped
object created in a foreign JavaScript realm was admitted by the completed
comparator. The selected review could not truthfully prove its required
rejection while remaining source-only.

This explicitly authorized action therefore replaces that unexecuted review
shape with one bounded policy implementation: an immutable receipt is
admissible only when its direct prototype is exactly the comparator realm's
`Object.prototype`. A separately created foreign-realm frozen plain object is
rejected fail-closed in either argument slot.

## Bounded implementation and observations

The comparator changes only its receipt-admission predicate from a structural
root-prototype shape check to exact local-realm prototype identity. All existing
frozen-object, closed-key, data-descriptor, scalar and catch-to-dedicated-error
checks remain in place.

The independent regression invokes the comparator three times in each argument
order with a local valid receipt and a separately created frozen foreign-realm
receipt-shaped object. It proves six fresh dedicated errors with the stable
public name and message, without input or cross-error aliasing. A local frozen
receipt remains admissible. Existing isolated comparator tests explicitly
share their nominal local controls' `Object` intrinsic with the comparator VM;
that test-harness alignment adds no application behavior or runtime binding.

## Supersession and containment

This action supersedes only the unexecuted review shape selected by Action
666HU; it does not alter Action 666HU's historical selection evidence. A new
independent review may follow only after this policy implementation has passed
the required Ready and exact-main six-shard Full CI plus matched provenance.

The action neither adapts, imports nor normalizes foreign material and creates
no receipt consumer, caller, writer, storage, transport, credential, provider,
broker, route/UI, deployment or runtime binding. It changes neither required
checks, branch protection nor Netlify. No CI deduplication is authorized.
