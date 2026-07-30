# Action 652C — Independent Re-Review

Reviewed at: `2026-07-30T10:54:01Z`

Base and branch:

```text
base:7120c0cc9467a0106c4c9da84312b7f4d7ef4774
branch:codex/action-652a-execution-risk-envelope-admission
```

The review was read-only with respect to the five refrozen normative Action
652C artifacts. No normative byte changed after the refreeze began.

## Byte and predecessor reconciliation

```text
action_652a_normative_digest:
0b227fe371b5ce9059635ed05df5b345f8da6121eac95313323ba36a3a085d6f

action_652b_freeze_manifest_sha256:
2106fe67b04cec14ba0d2bfb39169949b1b5c717aad75e8a2a07bb34a5c685a4

action_652b_independent_review_sha256:
85481bdcf5f89151146b413bcf98e56635ddb5c85db0db4246e54dff24cc07d9

action_652b_adversarial_suite_sha256:
77af29659ea22f78b8b0174a9989fc60b247b688a05bc4e3efe8b0ea52066416

action_652c_normative_refreeze_digest:
778f4ff560e83ed99dba0831c8a73b6f08500415316dfbfdb05db0bf8bb2520d

action_652c_refreeze_manifest_sha256:
286f0619222981cb101987f7c7a3b232e97edcb47bf2004f3acb7715052a0ffd

action_652c_independent_rereview_suite_sha256:
7cc1b116e2a8cf2d8db6ddce56d65ac64147bcf2b46e2ea1e6cc1164dd7b60ef
```

The independent rebuild reproduced every per-path SHA-256 and the combined
refreeze digest using the manifest's bytewise path-order method.

## Authority and M1 review

The caller-visible V2 request surface is exactly:

```text
prepared
intent
admission_at
```

Issuer, authority handle, policy, limits, trust root, registry owner,
capability digest, cash/exposure/open-intent snapshot, and market/calendar
authority fields are not accepted. Plain caller data containing an added field
fails as `caller_authority_surface_rejected`; executable/accessor/proxy input
fails earlier as `private_authority_snapshot_rejected`.

Issuance is behind a non-exported module boundary. The private runtime reference
has `WeakSet` provenance. The opaque capability reference has `WeakMap`
provenance, is consumed internally once, and is neither exported nor returned.
The underlying V1 authority is constructed only from the single bounded,
descriptor-inspected, deeply frozen snapshot of the private registry entry.

The binding independently covers:

- external registry owner identity and digest;
- risk-policy identity, version, and rebuilt digest;
- exact issuance and strict expiry instants;
- session and execution identities;
- cash, exposure, and open-intent snapshot identities;
- exact instrument/side membership;
- all quantity, notional, price-deviation, daily, cash, exposure, open-intent,
  and snapshot-age limits;
- immutable authority snapshot digest and private capability digest.

The original `652B-M1` caller-created permissive V1 issuer was reproduced: it
admits an intent that the restrictive V1 authority rejects. Passing that
authority or an issuer function to V2 is rejected before private lookup and
cannot yield a manual-confirmation gate.

The attack matrix also rejected copied result evidence, caller-created handles,
cross-session and cross-execution requests, exact-expiry and post-expiry use,
forged owner/policy/snapshot/capability digests, accessors without executing
their getters, proxies, cycles, excessive inputs, and post-verification
mutation. Expiry minus one nanosecond remained admitted.

## Interoperation and safety

An original, deeply frozen, provenance-backed V2 admission with a rebuilt
terminal digest is the only V2 result that may proceed to manual confirmation.
The synthetic chain remains:

```text
admitted
→ identity-bound manual confirmation
→ confirmed synthetic replay
→ Action 651C diagnostic audit
```

No authority handle or live capability is exposed by that chain. Static import
and invocation review found no V2 edge to Avanza, broker transport, credentials,
cookies, BankID, browser automation, CDP, live provider data, Supabase writes,
database persistence, process spawning, automatic execution, real
order/trade/position mutation, or production writes.

Default-off and kill-switch paths returned before request inspection, private
registry lookup, snapshotting, capability issuance, authority construction, or
digest work.

## Validation

```text
Action 652A focused:12/12 passed
Action 652B independent review:6/6 passed with expected V1 M1 reproduction
Action 652C focused:12/12 passed
Action 652C independent re-review:10/10 passed
Action 650S/650U security union:66/66 passed
Action 651A/651C/re-review union:34/34 passed
Actions 519–533 content-addressed evidence:1802/1802 preserved
Actions 519–533 direct filenames:114/139 passed
TypeScript:passed
scoped ESLint:passed with zero warnings
production build:passed
JSON and diff checks:passed
```

The direct historical Action 519–533 filenames reproduced their exact existing
`114 passed / 25 failed` baseline. The 25 failures are unchanged historical
path/hash/verifier expectations and are not introduced by V2.

Disposable clean-room checkouts used the same committed base. The successor
checkout added only the locally refrozen 652 artifacts through Git exclusions,
so both candidates remained Git-clean during collection:

```text
broad base:3451 passed / 13 failed
broad successor:3451 passed / 13 failed
broad test identity, order, normalized message digest:equal

restricted base:22 passed / 5 failed
restricted successor:22 passed / 5 failed
restricted test identity, order, normalized message digest:equal

full_execution_regression_passed:false
```

All failing test and affected tracked source bytes are identical because both
clean rooms share exact committed base `7120c0cc9467a0106c4c9da84312b7f4d7ef4774`;
the ignored successor artifacts do not import or reach any failing live-fill or
write surface.

## Findings and decision

```text
blocker:0
major:0
minor:0
nit:0
```

`652B-M1` is closed by the additive V2 successor. The refreeze and independent
re-review are approved for a local checkpoint. The full execution regression
remains correctly false because its documented, baseline-identical failures
remain present.

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
full_execution_regression_passed:false
```
