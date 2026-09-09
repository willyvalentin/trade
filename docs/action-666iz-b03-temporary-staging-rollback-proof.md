# ACTION 666IZ — temporary B-03 staging rollback proof

This Draft-only branch contains one temporary Netlify Function to exercise the
already isolated B-03 PostgreSQL transport against `ture-staging`. It is not a
product route, runtime binding, deployment promotion or production change.

The function accepts only `POST` plus a short-lived token from Netlify's secret
manager. It fixes the synthetic owner and recommendation identifiers in source,
accepts no request body, invokes exactly the private writer routine in a
client-owned `BEGIN`/`ROLLBACK` transaction, and returns only
`{"outcome":"rolled_back"}`. It never returns database identifiers,
connection material or a writer receipt.

The function, its three preview-scoped secrets, the synthetic fixture and the
temporary credential must all be removed after exactly one proof attempt. This
branch must be closed without merging.
