# Action 552 - Dormant Fixed Read-Only Direct-Spawn Lifecycle Remediation

## Summary

Action 552 remediates the Action 551 blocked findings for the dormant server-only fixed read-only direct-spawn adapter. The adapter remains dormant, server-only, fixed-command, one-shot, non-authoritative, and runtime-unreachable.

No real executable was run. No real Git version was collected. No credentials or environment values were read. No network request occurred. No runtime/API/UI/runner/observer was activated. No Avanza, trading, order, position, settlement, persistence, deployment, commit, push, or merge behavior occurred.

Decision: `post_trade_dormant_server_only_fixed_read_only_direct_spawn_adapter_action_551_findings_remediated_ready_for_re_review`

Result status: `post_trade_dormant_server_only_fixed_read_only_direct_spawn_adapter_action_552_remediation_completed_not_activated`

## Remediated Findings

- `F-551-001` High: remediated by making stdout, stderr, or combined output overflow an internal terminal condition that stops retaining output, requests fixed child termination exactly once, removes reviewed data/listener paths, and settles without relying indefinitely on `close`.
- `F-551-002` High: remediated by adding stdout and stderr stream-error handling. Stream errors now produce sanitized deterministic terminal evidence, request the same fixed termination action, and ignore later events.
- `F-551-003` Medium: remediated by expanding the focused mocked-spawn suite from 13 to 19 tests, covering overflow, fixed termination, kill failure/throw, stream errors, never-closing children after internal terminal conditions, event ordering, listener cleanup, byte limits, split UTF-8, invalid UTF-8, unexpected chunks, one-shot consumption, and authority preservation.

## Terminal Settlement Model

The server-only wrapper now has a single private terminal-settlement controller. It uses module-local state inside one invocation:

- `settled`;
- `terminalReason`;
- internal terminal condition flag;
- child termination request state;
- child termination request failure state;
- retained stdout/stderr byte counters and bounded buffers.

Every event handler checks `settled` before acting. Terminal settlement clears retained output buffers, detaches reviewed listeners, leaves private no-op error sinks in place to prevent late EventEmitter error crashes, and resolves the promise exactly once. No settlement controls are exported.

## Overflow Termination Behavior

The fixed overflow behavior is:

- stdout limit: 16 KiB;
- stderr limit: 16 KiB;
- combined limit: 32 KiB;
- raw byte counting during streaming;
- no output parsing;
- no retry;
- no fallback;
- no second process attempt;
- fixed termination request: `child.kill(\"SIGKILL\")` exactly once;
- no caller-controlled signal;
- no signal escalation sequence;
- no timer loop.

If `kill(\"SIGKILL\")` returns `false` or throws, the result records `childTerminationRequestFailed:true` and remains terminal. The adapter does not claim that the child actually terminated merely because termination was requested.

## Stream-Error Behavior

stdout and stderr `error` events are handled as internal terminal conditions:

- stdout error maps to `stdout_stream_error`;
- stderr error maps to `stderr_stream_error`;
- raw error details, stacks, paths, environment values, and sensitive material are not included in evidence;
- the same fixed `SIGKILL` termination request is made exactly once;
- later close, child error, stream error, or data events cannot overwrite the result.

## Never-Closing Child Behavior

For internally terminal conditions, the adapter settles immediately after cleanup and fixed termination request. It does not wait indefinitely for `close`. A terminal result can therefore precede confirmed process closure. Evidence is explicit that actual process death is not proven by the returned result.

Ordinary successful process completion still uses `close` semantics and does not treat `spawn` or `exit` alone as command success or complete output collection.

## Listener Cleanup

The wrapper registers and cleans up reviewed listeners for:

- child `spawn`;
- child `error`;
- child `exit`;
- child `close`;
- stdout `data`;
- stdout `error`;
- stderr `data`;
- stderr `error`.

Private no-op error sinks are installed at child creation and remain after terminal settlement. They are not authority paths; they prevent late EventEmitter `error` events from becoming process crashes after the reviewed terminal listeners are removed.

## Event Ordering

The deterministic ordering model is:

- synchronous spawn throw returns sanitized `spawn_exception` evidence;
- asynchronous child error returns sanitized `child_process_error` evidence;
- `spawn` is process-start observation only, not command success;
- `exit` alone is not enough for ordinary completion;
- ordinary completion uses `close`;
- overflow, stream error, and unexpected chunk are internal fatal conditions that settle independently of close;
- close, exit, data, stream error, or child error after settlement are ignored;
- consumed input cannot be reused after any terminal outcome.

## Output And UTF-8

The adapter preserves exact raw-byte limits and fatal UTF-8 decoding. Split UTF-8 sequences across retained chunks are decoded only at close. Invalid UTF-8 fails closed. Unexpected stream chunk types fail closed. Raw output remains non-authoritative direct-spawn evidence only and is not interpreted as CLI-version evidence.

## Authority And TOCTOU

The remediation adds no observer authority, credential authority, CLI-version authority, authorization-consumption authority, network authority, API/UI/runner authority, trading authority, Avanza authority, order/position/settlement authority, persistence authority, deployment authority, or reusable spawn authority.

`toctouEliminated:false` remains unchanged. The path can still change after pre-spawn revalidation, the adapter does not retain a file descriptor, and it does not claim that the exact revalidated inode was executed.

## Remaining Blockers

Before observer or CLI-version interpretation:

- independent re-review of the Action 552 lifecycle remediation;
- separate observer integration approval;
- separate CLI-version interpretation approval;
- separate runtime activation approval;
- separate deployment approval.

This remediation does not make the adapter staging-ready, observer-ready, CLI-version-ready, runtime-ready, Avanza-ready, trading-ready, deployment-ready, or production-ready.

