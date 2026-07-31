# Action 661J.5N.2A Descriptor-Bound Certification Consumer V2

## Additive authority boundary

`action_661j5n2a_descriptor_bound_certification_consumer_v2` is an additive
successor to the frozen N.1 consumer and N.2 review. It closes findings N2-M1,
N2-m1, and N2-m2 without changing predecessor bytes. N.1 remains the semantic
28/28 chain verifier; V2 supplies a descriptor-bound, bounded read boundary and
passes only verified in-memory bytes to that predecessor.

The consumer is default-off. A request without literal `enabled:true` performs
zero filesystem/provider calls and zero digest work. Enabled requests are closed
to `enabled` and `repository_root`; callers cannot provide paths, authorities,
digests, protocols, or preverified results.

## Descriptor-bound read order

For each allowlisted repository-relative file, V2 performs this fixed order:

1. Validate the canonical repository root as a non-symlink directory.
2. `lstat` the root and every path component, recording device, inode, mode,
   size, file type, ctime, and mtime. Only directories followed by one regular
   file are accepted.
3. Open the final path read-only with `O_NOFOLLOW`. Missing platform semantics
   fail closed.
4. Immediately `fstat` the descriptor and compare device, inode, and file type
   with the captured final-path identity. Size must also match.
5. Re-`lstat` every captured path component and reject an ancestor or final-path
   identity change before any content read.
6. Read content only through the verified descriptor in bounded chunks.
7. `fstat` again and reject device, inode, type, mode, size, ctime, or mtime
   mutation.
8. Close the descriptor exactly once on every post-open success or failure path.

No filesystem `readFile` operation exists after identity validation. Replacing
the pathname after open cannot redirect the verified descriptor. Symlink swaps,
ancestor swaps, inode substitutions, truncation, and extension fail closed.

## Budgets and scope

The explicit limits are 96 files, 16 MiB total bytes, 2 MiB per file, 32 path
components, 500,000 JSON nodes, depth 32, 4,096 array entries, 512 object fields,
and 1 MiB per string. The per-file limit is checked before open and enforced by
descriptor-sized reads; a file over the exact boundary returns
`file_byte_budget_exceeded`. File count, total byte, traversal, and JSON budgets
remain closed `scope_rejected` failures.

Absolute artifact paths, dot traversal, backslashes, unknown prefixes, root
aliases, non-regular files, symlinks, and root substitution are rejected. The
implementation has no write, subprocess, network, Docker, environment-secret,
migration, CI, deployment, or production capability.

## Failure identity

Every rejection carries a separate `failure_identity_digest`. Its canonical
preimage binds consumer version, closed status and reason, sanitized provider
stage, sanitized provider error code and class, SHA-256 of the approved relative
path when present, and bounded metadata. Stages are exactly
`root_validation`, `lstat`, `open`, `descriptor_fstat`,
`descriptor_identity`, `descriptor_read`, `post_read_fstat`, and `close`.

Raw provider messages and provider-controlled paths are never emitted. Distinct
stages or error codes produce distinct identities, and the focused suite
independently rebuilds each digest. Result status remains closed to `certified`,
`incomplete`, `tampered`, `incompatible`, and `scope_rejected`.

## Verification and compatibility

The focused matrix covers descriptor and ancestor replacement, symlink and inode
substitution, mutation during read, replacement after open, byte boundaries,
provider errors at every stage, close discipline, failure-identity separation,
full 28-fixture semantic rebuild, and UTC/Stockholm/New York determinism.
N.1/N.2 artifact hashes are rechecked before and after regression. The companion
golden report records the observed V2 verification, but it is not runtime
authority. A separate freeze and re-review is required before checkpoint-ready.
