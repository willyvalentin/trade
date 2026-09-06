# CAT-00.2 SEC EDGAR Evidence Receipt Contract

## Purpose

CAT-00.2 binds a CAT-00.1 primary-evidence ID to a caller-supplied,
immutable-looking SEC EDGAR archive receipt. It is a local validation boundary
for source metadata, not an EDGAR client or an evidence collector.

## Required receipt fields

Every receipt carries its CAT-00.1 `evidence_id`, source ID `sec_edgar`, a
standard SEC accession number, a canonical HTTPS SEC Archives locator, a
lowercase SHA-256 digest for the already-supplied document bytes, publication
and retrieval instants, and an explicit decision-time availability bit.

The archive locator is accepted only when it is a parameter-free
`https://www.sec.gov/Archives/edgar/data/...` URL whose accession path segment
matches the supplied accession number without dashes. The module does not
download, dereference, hash, retain, or otherwise inspect document bytes.

## Default-deny behavior

- CAT-00.1 must already have returned `evidence_validated_not_admitted`.
- This first bounded receipt implementation supports only `sec_edgar` primary
  evidence. Any other primary source stays explicitly not admitted rather than
  being generalized silently.
- There must be exactly one receipt for every primary evidence ID and no
  receipt may name an ID absent from the envelope.
- Publication and retrieval must be no later than the envelope decision time;
  retrieval cannot predate publication.
- A fully valid bundle returns only
  `sec_edgar_receipts_validated_not_admitted`. That is not ranking,
  recommendation, evaluation, promotion, risk, execution or catalyst-truth
  authority.

## Explicit exclusions

There is no network or provider call, account/credential selection, spend,
subscription, persistence, route, worker, scheduler, runtime integration,
model or agent invocation, ranking or recommendation mutation, deployment,
broker action, or production behavior. The contract does not reopen a
Milestone B gate.
