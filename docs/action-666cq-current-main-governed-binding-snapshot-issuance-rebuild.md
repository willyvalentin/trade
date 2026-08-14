# Action 666CQ current-main governed binding snapshot issuance rebuild

## Authority boundary

This rebuild starts from exact current-main commit
`9a18c2ee394f34e470e3a2804bf9e9b1e444a38c` and tree
`794a94999150113599f4aa32c91650b1a2879ba0`.

Historical PR #72 remains an open Draft stacked non-authority. Its current head
is `40155d6b5bf03cb8e3ed2207f4f771d62b6f6937`; its first bounded issuance code
layer came from historical commit
`4152531b50cd7b4968733afe02fb235a62fd9493`. Historical review commit
`e9cfbcc14d4fb8b8973712ed62e5fcdf5565be38`, later PR #72 commits and historical
freeze/review evidence cannot authorize this current-main rebuild.

No historical review artifact is imported. Current bytes require a new
manifest, exact-head CI, independent current-head review and explicit operator
approval naming the PR and exact head.

## Bounded current-main layer

Action 666CQ reconciles only the first governed issuance layer from PR #72. The
larger historical observation-authority chain remains outside this Action. The
rebuild is deliberately split so that the smaller issuance trust boundary can
be reviewed and delivered independently.

The bounded layer is:

- server-only, synthetic-only, fixture-only and default-off;
- runtime-unwired and provider-free;
- read-only against the frozen AX binding store;
- unable to persist, publish, promote, train, change model parameters or affect
  live ranking;
- pinned to the current-main BD admission, AX store and AJ/AC/V/AQ replay
  authorities.

The current-main implementation additionally requires literal activation,
exact recursive request shells, independent authority pins, complete builder
and runtime semantic parity, construction-time callback capture, private
counters, private originating-harness verification, bounded public digests and
structured never-throw containment.

## Delivery boundary

Track 2 remains open. This rebuild earns no live-product, production,
database, provider, broker, training, promotion or milestone authority.

Delivery requires all of the following without substitution:

1. exact normative bytes and manifest reach one frozen PR head;
2. exact-head CI succeeds;
3. a fresh independent current-head review reports no findings;
4. explicit operator approval names the PR and exact head;
5. the ordinary PR merge preserves the reviewed scope on `main`;
6. exact-main CI succeeds.

Production deployment is not authorized by this Action. If external automation
publishes despite that boundary, the event must be reported and reconciled; it
does not retroactively create deployment approval.
