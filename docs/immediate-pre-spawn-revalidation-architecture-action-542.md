# Action 542 - Immediate Pre-Spawn Revalidation Architecture

## Purpose

Action 542 plans the smallest safe immediate pre-spawn revalidation boundary for the first-live read-only staging preflight chain. It does not implement revalidation and does not authorize process spawn.

The future boundary must verify, immediately before any separately reviewed spawn attempt, that the executable filesystem object still matches the object approved earlier by the live resolver.

## Current Approved Chain

```text
server-only live resolver
  -> original in-process resolver object with private provenance
dormant server-only live composition adapter
  -> neutral non-authoritative metadata
pure fixture composition contract
  -> structural composition evidence only
```

None of these components grants spawn authority, observer authority, credential authority, CLI-execution authority, runner authority, API/UI authority, trading authority, persistence authority, deployment authority, or production authority.

## Metadata Available For Future Comparison

The current chain preserves or links the following comparison inputs:

- tool identity: `git` or `supabase_cli`
- platform: macOS / `darwin`
- resolver policy identity and policy fingerprint
- resolved absolute path where the reviewed structural linkage requires it
- boundary session and resolver session capability fingerprint
- purpose and request fingerprint
- `deviceId`
- `inode`
- `sizeBytes`
- `mode`
- `modifiedTimeMs`
- resolver evidence evaluated-at timestamp
- resolver result and evidence fingerprints
- private original-object provenance at the server-only composition boundary

The composition adapter intentionally does not emit `changedTimeMs` into pure composition metadata. Future revalidation may compare only the neutral five-field schema unless a later reviewed contract explicitly carries additional metadata.

## TOCTOU Problem

Resolver evidence is point-in-time. A file can be replaced, mutated, relinked, or permission-changed after resolution and before process creation.

Neutralization does not preserve permanent trust. Fingerprinting metadata does not eliminate TOCTOU. A future spawn boundary must not treat the initial resolver evidence or a completed composition result as current executable integrity.

Revalidation must occur immediately before process creation, and revalidation and spawn should be separated by the smallest practical code and time boundary. The architecture does not claim complete TOCTOU elimination.

## Future Revalidation Contract

A future immediate pre-spawn revalidation boundary must:

1. Be server-only with `import "server-only";` as the first effective import.
2. Use only fixed source-controlled paths already approved by the resolver.
3. Accept no caller path, filesystem implementation, policy, candidate list, dependency injection, environment source, or external config in production.
4. Use only the minimum filesystem primitive required, expected to be `lstat`.
5. Never execute the file and never read file contents.
6. Reject symlinks and avoid following symlinks.
7. Perform no PATH discovery.
8. Read no environment values.
9. Access no credentials, Keychain, cookies, browser state, BankID, Avanza, Supabase auth, or network.
10. Compare the current filesystem object against initial approved evidence.
11. Require exact match for path, tool, platform, policy identity/version/fingerprint, session, purpose, `deviceId`, `inode`, `sizeBytes`, `mode`, and `modifiedTimeMs`.
12. Reject missing, changed, replaced, malformed, symlinked, non-regular, stale, cloned, mutated, expired, cross-session, cross-purpose, cross-tool, cross-platform, or cross-boundary evidence.
13. Emit immutable, non-authoritative revalidation evidence.
14. Grant no spawn authority.
15. Be one-shot and no-retry.
16. Remain dormant after implementation.
17. Require static/security review before any spawn work.
18. Be consumed by a future spawn boundary only in the same tightly controlled operation chain.
19. Not be persisted or serialized as reusable authority.

## Evidence Linkage

Future revalidation evidence should bind:

- revalidation adapter identity and policy identity/version;
- resolver adapter identity and resolver policy identity/version/fingerprint;
- composition adapter identity where consumed through composition;
- request, purpose, tool, platform, session, and capability fingerprints;
- expected path and expected neutral metadata;
- current `lstat` metadata;
- revalidation timestamp;
- `toctouEliminated: false`;
- `spawnAuthority: "none"`;
- `processSpawned: false`;
- `shellUsed: false`;
- `cliVersionCollected: false`;
- `authorizationConsumed: false`;
- deterministic blocking reasons.

## Architecture Options

| Option | Description | TOCTOU Exposure | Authority Separation | Provenance / Replay | Testability | Reviewability | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | Dedicated server-only revalidation adapter called immediately before future spawn adapter. | Low for this phase; still not eliminated. | Strong: revalidation evidence remains separate from spawn authority. | Good if original/session/fingerprint linkage is enforced and evidence is not persisted. | Good with pure core and test-only filesystem seam. | Best: small bounded surface. | Recommended. |
| B | Revalidation performed internally by future direct-spawn adapter. | Potentially lower time gap, but mixes responsibilities. | Weaker: revalidation and spawn authority are coupled. | Harder to reason about replay and failure modes. | Harder without process-capable tests. | Larger review surface. | Defer. |
| C | Closed server-only orchestration module revalidates then invokes separately reviewed spawn primitive. | Low if tightly controlled, but broader. | Medium: orchestration can become implicit runner authority. | Good only with strict one-shot controls. | Moderate. | Larger than needed now. | Later candidate. |
| D | Persisted or serialized revalidation evidence consumed later. | High: stale evidence can be replayed. | Weak: serialized evidence risks becoming authority. | Poor. | Easy but unsafe. | Not acceptable. | Rejected. |
| E | Caller-supplied filesystem metadata assertion. | High: caller can forge freshness. | Weak: caller metadata becomes authority. | Poor. | Easy but unsafe. | Not acceptable. | Rejected. |

## Next-Step Comparison

| Next Action | Benefit | Risk | Fit |
| --- | --- | --- | --- |
| Implement dormant revalidation adapter | Adds bounded `lstat` comparison without process execution. | Requires strict server-only and test seam review. | Best next step. |
| More pure contract work | Could refine schemas but does not solve current TOCTOU gap. | Low. | Not the narrowest useful next step. |
| Direct-spawn design | Useful later but premature before revalidation boundary exists. | Medium. | Defer. |
| Direct-spawn implementation | Introduces process authority too early. | High. | Reject now. |
| Observer implementation | Useful after spawn/revalidation sequencing exists. | Medium. | Defer. |
| CLI-version collector implementation | Requires process execution path eventually. | High now. | Reject now. |

## Recommended Next Action

Action 543 - Implement Dormant Server-Only Immediate Pre-Spawn Revalidation Adapter.

Action 543 should introduce only bounded `lstat` behavior, perform no process execution, grant no authority, remain dormant, be independently testable, and require a separate static/security review before any spawn work begins.

## Commit / Deploy

No deploy is recommended for Action 542. A source-control checkpoint commit may be considered only after the complete diff has been manually inspected. Do not deploy.
