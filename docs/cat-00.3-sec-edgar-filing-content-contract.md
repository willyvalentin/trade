# CAT-00.3 SEC EDGAR Filing Content Contract

## Purpose

CAT-00.3 proves only that caller-supplied UTF-8 filing text exactly matches the
SHA-256 digest declared by an already validated CAT-00.2 SEC EDGAR receipt. It
is a local content-integrity boundary, not an EDGAR client, collector or
extractor.

## Default-deny behavior

- The supplied CAT-00.2 receipt bundle must already return
  `sec_edgar_receipts_validated_not_admitted`.
- Each validated receipt must have exactly one dense, plain-data filing-content
  entry. The entry carries only its evidence ID and non-empty UTF-8 text.
- The text is capped at 1 MiB of UTF-8 bytes, hashed without normalization and
  compared to the receipt's lowercase SHA-256 value. The returned record keeps
  only the evidence ID, digest and byte length; it never returns or retains the
  supplied text.
- A valid bundle returns only
  `sec_edgar_filing_content_validated_not_admitted`. It is not catalyst truth,
  ranking, recommendation, evaluation, promotion, risk or execution authority.

## Explicit exclusions

There is no network or provider call, SEC fetch, account or credential use,
spend, subscription, persistence, route, worker, scheduler, runtime
integration, model or agent invocation, ranking or recommendation mutation,
deployment, broker action or production behavior. A future source adapter,
collection path or advisory influence still needs its own product decision,
technical boundary and evidence plan.
