# Action 666GC — Adversarial input contract for exit-decision explanation

## Decision

Action 666GC hardens and reviews Action 666GA's source-only explanation
projection at its object-descriptor boundary. It remains a pure, default-off,
runtime-unwired advisory primitive with no evaluator, provider, persistence,
route/UI, broker or execution authority.

## Input boundary

The projection now reads own names, symbols and descriptors within one
fail-closed observation boundary. If an object exotic such as a throwing Proxy
rejects that observation, the projection returns `invalid_input_shape` rather
than throwing or projecting advisory text.

For ordinary objects, classification is derived solely from the exact three own
data properties: `decision_status`, `decision_reason` and
`decision_priority`. A null prototype or an untrusted inherited prototype is
not inspected, read or mutated. Inherited accessors cannot substitute for a
required own field, and an inherited getter remains uninvoked even when an own
field with the same name is valid. The projection does not make a claim that a
Proxy's host-defined traps are side-effect free; it only contains failed
descriptor observation as a rejected result.

## Delivery decision

This is source-only contract hardening. It creates no caller and changes no
workflow, required check, branch protection, Netlify configuration or Full CI
deduplication policy. Ready and exact-main six-shard Full CI remain mandatory.

The next bounded action is `ACTION_666GD`: a source-only immutable-result and
fixed-advisory-copy review. It must preserve this descriptor boundary and may
not add runtime wiring.
