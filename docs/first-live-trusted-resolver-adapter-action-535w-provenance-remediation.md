# Action 535W - First Live Resolver Live-Observation Provenance Remediation

Action 535W closed the remaining Action 535V provenance seam without executing the adapter or activating observer, spawn, CLI execution, version collection, credential, runner, API, UI, browser, Avanza, order, position, settlement, network, or environment behavior.

## Previous Defect

The pure core exported observation construction and evaluation APIs that could create structurally valid observations marked as `server_only_lstat`. Because `buildEvidence` treated that field as sufficient, a caller could synthesize `observedLiveFilesystem: true` without the observation originating from the protected server-only adapter.

## Final Provenance Model

- The pure core can only construct synthetic metadata observations.
- Synthetic observations are classified as `test_synthetic_metadata` and cannot claim `server_only_lstat` provenance.
- The pure evaluator always emits `observedLiveFilesystem: false`.
- The server-only adapter remains the only module that imports `node:fs/promises` and calls `lstat`.
- After an explicit resolver call, the server-only adapter upgrades a successful result to live-observed evidence and recomputes evidence/result fingerprints.
- Live provenance is tracked with private module-local WeakSets inside the server-only adapter.
- The private WeakSets are not exported and cannot be reconstructed by plain objects, spread clones, or JSON serialization.

## Production API Before And After

Before Action 535R/535W, the production resolver accepted injected policy/filesystem behavior and the pure core could construct live-looking observations.

After Action 535W:

- production accepts only a reviewed resolver request and optional evaluation time;
- production closes over the canonical frozen source-controlled policy;
- production owns the only live `lstat` path;
- pure-core callers can perform synthetic evaluation only;
- no exported pure-core function can set `observedLiveFilesystem: true`;
- no exported pure-core function can choose authoritative `server_only_lstat` provenance.

## Authority Boundaries

Live provenance remains evidence-only. It does not grant process-spawn authority, runner authority, observer authority, credential authority, authorization-consumption authority, trading authority, order authority, or position authority.

## Safety Assertions

- No executable was run.
- No CLI version was collected.
- No process was spawned.
- No shell was used.
- No environment value was read.
- No credential was read.
- No network request occurred.
- No API, UI, runner, observer, or spawn boundary was activated.
- No Avanza interaction occurred.
- No order or position behavior changed.
- No deployment occurred.

## Decision

`post_trade_first_live_trusted_resolver_live_observation_provenance_closed_ready_for_final_re_review`

## Result Status

`post_trade_first_live_trusted_resolver_adapter_action_535w_remediation_completed`
