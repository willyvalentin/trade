# CAT-00.6 SEC EDGAR Pre-Read Authorization Contract

## Product outcome and bounded decision

CAT-00.6 resolves the planning circularity discovered after CAT-00.5: the
first public filing read cannot require a receipt that can exist only after
that read. It validates a caller-supplied, one-read authorization shape from
already validated CAT-00.1 primary-evidence identity to one exact SEC archive
locator. It is the local prerequisite for a later, separately admitted public
source operation.

## Accepted authorization

The input contains one CAT-00.1-valid evidence envelope and one dense,
plain-data authorization. Its `evidence_id` must name an existing
`primary_evidence` item with `source_id: "sec_edgar"`. It permits only one
exact SEC archive locator whose accession component matches the supplied
accession number, with:

- a bounded lowercase authorization ID;
- `GET`, `redirect_mode: "error"`, and `credentials_mode: "omit"`;
- expected HTTP `200`, `text/html`, and a response cap from 1 through
  1,048,576 bytes;
- `validate_only_no_persistence`, no runtime binding, no advisory influence,
  no broker action, and `not_executed`; and
- the explicit `required_before_external_authority` CI re-hardening marker.

The returned record is detached and immutable. It contains only fixed policy
scalars and no response body, credential, user identity, environment name,
provider token, runtime handle, receipt digest, or retrieval timestamp.

## Default-deny and authority boundary

Malformed or accessor-backed data, an unvalidated envelope, unbound/non-SEC
primary evidence, a mismatched SEC locator/accession, unsafe request fields,
unbounded response, unsafe post-read disposition, or absent re-hardening
marker fail closed.

Even a valid result is only
`sec_edgar_pre_read_authorization_validated_not_executed`. It makes no HTTP
request and is not an external authorization: it has no credential or
environment read, persistence, route, worker, scheduler, runtime binding,
recommendation/risk mutation, deployment, broker action, or production effect.

## Later gate

Any public SEC request remains a distinct policy-bound operation. It needs an
exact machine-verifiable authority policy, independent readback evidence,
containment/rollback plan, and a CI re-hardening review before external or
provider authority. A successful response must still pass the CAT-00.2,
CAT-00.3, CAT-00.4 and CAT-00.5 receipt/content/retrieval/post-read boundaries;
CAT-00.6 cannot authorize collection, persistence, advisory, or ongoing
runtime behavior.
