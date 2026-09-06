# CAT-00.4 SEC EDGAR Retrieval Evidence Contract

## Product outcome and bounded decision

CAT-00.4 closes the provenance gap between CAT-00.2's SEC archive receipt and
CAT-00.3's filing text. It validates an already captured, caller-supplied HTTP
retrieval capsule before it can be represented as verified source evidence.
The selected scope is a local integrity check only: it does not collect a
filing, operate a provider or make the result advisory truth.

The considered alternatives were to defer (which preserves the response
provenance gap) or to add a live SEC client (which would require a separately
authorized external-operation policy). The reversible local verifier is the
chosen step because it gives that future operation a strict, independently
testable contract without creating network authority.

## Accepted capsule

The input must first pass CAT-00.2. It then supplies exactly one dense,
plain-data retrieval entry per validated receipt. Each entry contains only:

- the primary evidence ID;
- the requested URL and final response URL;
- exact receipt retrieval time;
- explicit `GET`, `redirect_mode: "error"`, and `credentials_mode: "omit"`;
- HTTP status `200` and `text/html` content type (an explicit UTF-8 charset is
  accepted);
- the non-empty response text.

Both URLs and the retrieval timestamp must equal the validated CAT-00.2
receipt. CAT-00.3 then recomputes the text SHA-256 and byte length without
normalization. The returned record retains only the evidence ID, receipt URL,
timestamp, fixed response metadata, digest and byte length; it never returns
or persists response text.

## Default-deny behavior

A valid capsule returns only
`sec_edgar_retrieval_evidence_validated_not_admitted`. Mismatched request or
response URLs, redirects, credentials, non-GET methods, non-200 responses,
non-HTML media types, timestamp mismatches, duplicate IDs, malformed or
accessor-backed containers, and digest mismatches fail closed.

The capsule remains caller-supplied and non-authoritative. It is not evidence
that a real retrieval occurred and it cannot become catalyst truth, ranking,
recommendation, evaluation, promotion, risk or execution authority.

## Explicit exclusions and later gate

There is no network or provider call, SEC client, account or credential use,
spend, subscription, persistence, route, worker, scheduler, runtime
integration, model or agent invocation, ranking or recommendation mutation,
deployment, broker action or production behavior.

One later public, read-only SEC retrieval operation still needs its own
pre-authorized, machine-verifiable operational policy, independent evidence,
containment and rollback plan. CAT-00.4 merely makes its response-evidence
shape testable in advance.
