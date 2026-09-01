# Action 666IU — B-03 local sandbox private V2 writer capability proof

## Bounded objective and authority boundary

Action 666IU exercises the reviewed V2 writer routine once inside an ephemeral
local PostgreSQL sandbox. It is a behavior-level proof for the explicitly
approved B-03 sandbox slice, not a staging or production activation.

```text
action_or_decision_id: ACTION_666IU / B03_LOCAL_SANDBOX_PRIVATE_V2_WRITER_CAPABILITY_PROOF
bounded_objective: Prove the reviewed V2 writer's created/replayed and rejected/rolled-back behavior using a disposable local database, a dedicated writer identity and a private loopback-only transport.
milestone_or_product_outcome: B-03 transactional recommendation-to-position handoff, with local behavior evidence only.
threat_or_delivery_risk_reduced: Prevent a source-only private routine and its static contracts from being confused with an observed transactional behavior proof.
blocked_by: A named remote staging-only administration principal, managed non-public runtime material, remote least-privileged identity provisioning, and separately admitted runtime wiring remain absent.
unblocks: A future remote staging admission decision may reuse the value-free local proof pattern, but no remote action is authorized by this Action.
authority_boundary: Local Docker PostgreSQL only; no provider, broker, deployment, Netlify, production, remote staging, route or UI authority.
required_evidence: Exact reviewed V2 migration checksum, no host port, internal Docker network, process-generated local authentication material, dedicated role ACL proof, created/replayed invocation, rejected invocation rollback and destructive sandbox cleanup.
focused_verification: Action 666IU provider-free contract, explicit local sandbox run, conservative scoped lint, git diff --check and unchanged six-shard CI structure.
residual_risks: The local sandbox does not establish protected secret management, least-privileged identity or private transport in an actual staging/production provider environment.
autonomous_governance_controller: Codex autonomous governance controller.
delivery_automation: Codex delivery automation.
independent_machine_verification: Local disposable Docker PostgreSQL receipt plus provider-free E2E contract, Ready Full CI and exact-main CI.
decision_policy_version: roadmap-operating-governance.v1.
stop_go_or_closeout_trigger: Stop after one behavior proof; do not bind application runtime or contact a remote environment until a separate remote admission names its exact principal and rollback plan.
rollback_or_containment: The failed writer call proves statement rollback, then the container and internal network are removed before the receipt is emitted.
```

## Local behavior proof

The harness at
[`action-666iu-b03-local-sandbox-v2-writer.mjs`](../scripts/action-666iu-b03-local-sandbox-v2-writer.mjs)
requires the explicit `B03_LOCAL_SANDBOX=1` opt-in. It resolves the locally
available `postgres:16-alpine` tag to its immutable local image ID before
starting, uses that ID with `--pull=never`, creates an internal Docker bridge
with no published host port, and runs PostgreSQL only inside that network
namespace. It waits for PostgreSQL's final post-initialization readiness marker
and a live local query before applying the compatible substrate.

At startup it generates separate container and writer authentication material
as process-scoped values. Neither value is committed, read from a deployment
setting, printed, or persisted in the repository or receipt; each is passed
only to the disposable local Docker client/container that needs it and ends
with that execution. A `NOLOGIN`
`b03_sandbox_definer` owns only the local substrate and the security-definer
routine; the effective writer role is `b03_writer`. It has database connect,
`private` schema usage, and execute on exactly
`private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)`.
It receives no direct read or mutation privilege on recommendation, position,
history or receipt tables, cannot assume the definer role, and the local
`service_role` grant created by the reviewed migration is revoked before the
writer invocation.

The harness builds a minimal compatible schema, applies the exact immutable V2
migration bytes and then Action 666IU's forward-only replay-qualification
repair, seeds synthetic local fixtures, and invokes the private routine through
loopback TCP inside the database container. The repair is required because the
first real sandbox replay exposed a PL/pgSQL output-parameter/column ambiguity;
the original migration stays unchanged. Its only success claims are value-free
booleans: a first call creates, the exact retry replays the same committed
identifiers, direct table access is rejected for the writer role, and an
ineligible recommendation must raise the exact expected `55000` error before
the proof accepts its rollback, leaving no receipt, position, history or
recommendation-state change behind.

The receipt is intentionally bounded. It does not query, configure, disclose
or use any remote service; it does not create an application transport module,
server caller, route, UI binding, queue, deployment or broker order. It leaves
the application runtime default-deny and does not change the six-shard CI
suite, branch protection, required checks, Netlify or no-deduplication policy.

## Milestone disposition

The sandbox proof advances only the local evidence for B-03. It uses a minimal
compatibility substrate rather than reproducing a provider-managed RLS,
append-only, monitoring, or recovery posture, so it is not an environment
security attestation. The image ID is immutable for its individual local run,
not a host-independent provenance allowlist. Milestone B remains
`not_complete`; B-01 and B-03 remain in progress. B-05 through B-08 remain
blocked for a real environment because the approved slice has no named staging
administration principal or provider-managed material. B-09 through B-12 remain
planned. Notion remains program tracking only, never runtime, provider,
broker, deployment or production authority.
