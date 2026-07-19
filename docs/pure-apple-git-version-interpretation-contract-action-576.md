# Action 576 - Pure Apple Git Version Interpretation Contract

## Scope

Action 576 implements a pure, fixture-only Apple Git version interpretation contract.

Created implementation:

- `lib/post-trade-pure-apple-git-version-interpretation-contract-core.ts`
- `tests/e2e/post-trade-pure-apple-git-version-interpretation-contract.spec.ts`

The existing generic Git version parser remains unchanged.

## Contract Identity

The Apple parser uses a separate contract identity from the generic parser:

- contract ID: `ture.execution.pure-apple-git-version-interpretation-contract.fixture.v1`
- boundary ID: `ture.execution.apple-git-version-interpretation.fixture-boundary.v1`
- grammar ID: `ture.execution.apple-git-version-grammar.exact-upstream-three-component-apple-build-integer.v1`
- normalization ID: `ture.execution.apple-git-version-normalization.optional-single-final-lf.v1`
- vendor identity: `apple-git`

The identity and policy are frozen source-controlled objects. They are not caller supplied and are not environment selected.

## Input Eligibility

The parser accepts only an existing pure raw process completion result from:

`ture.execution.pure-raw-process-completion-evidence-contract.fixture.v1`

Before parsing stdout, the contract:

- verifies exact result and evidence schema keys;
- verifies the raw result identity and accepted raw status;
- rebuilds raw-completion evidence through `buildPureRawProcessCompletionEvidence`;
- compares rebuilt raw result and evidence fingerprints;
- rejects copied, mutated, malformed, cloned, blocked, or fingerprint-mismatched raw inputs;
- rejects non-macOS, non-`git`, non-`/usr/bin/git`, non-`["--version"]`, non-zero-exit, non-empty-stderr, overflowed, invalid-encoding, stream-error, termination, retry, fallback, authority, runtime, live, or TOCTOU claims.

Blocked raw-completion results are not reinterpreted by the Apple parser. They fail closed as unapproved input.

## Accepted Grammar

The only accepted stdout shape is:

```text
git version M.m.p (Apple Git-B)
```

with an optional exactly one final line feed.

Constraints:

- exact lowercase prefix `git version `;
- upstream version has exactly three ASCII numeric components;
- upstream components have no leading zero except exactly `0`;
- upstream component length is at most 5 digits;
- upstream component numeric value is at most `65535`;
- exactly one ASCII space before the Apple parenthetical suffix;
- exact opening and closing parentheses;
- exact case-sensitive vendor label `Apple Git`;
- exact hyphen before the Apple build;
- Apple build is one ASCII integer;
- Apple build has no leading zero except exactly `0`;
- Apple build length is at most 8 digits;
- Apple build numeric value is at most `99999999`;
- stderr must be empty;
- no extra lines, CR/CRLF, NUL, control characters, ANSI escape sequences, tabs, surrounding whitespace, localization, suffixes, parser options, or broad trim.

## Output Model

Accepted evidence retains both:

- upstream Git version metadata: `upstreamVersionString`, `upstreamMajor`, `upstreamMinor`, `upstreamPatch`;
- Apple vendor/build metadata: `appleVendorLabel`, `appleBuildString`, `appleBuildNumber`.

Rejected evidence returns no partial parsed upstream or Apple build fields.

Every result and evidence object is deeply frozen and includes:

- source raw-completion result/evidence fingerprint linkage;
- source spawn fingerprint linkage from the raw evidence;
- stdout fingerprints for original and normalized stdout;
- Apple build metadata fingerprint;
- contract identity and policy fingerprints;
- result fingerprint.

Fingerprints are SHA-256 over deterministic canonical JSON domains. They are evidence linkage only and grant no authority.

## Authority Posture

The contract always returns:

- `fixtureOnly: true`
- `observedLiveProcess: false`
- `authoritativeLive: false`
- `authority: "none"`
- `compatibilityAuthorityGranted: false`
- `runtimeActivated: false`
- `toctouEliminated: false`

Parser acceptance means only that approved pure raw-completion evidence contained stdout matching the narrow Apple grammar. It does not mean Git is currently installed, unchanged, supported, compatible, executable, staging-ready, runtime-ready, deployment-ready, or production-ready.

## Forbidden Behavior

Action 576 introduced no:

- `server-only` module;
- filesystem reads or writes;
- environment access;
- network access;
- credential, cookie, session, Keychain, BankID, browser, or Avanza access;
- process creation, process observation, timeout scheduling, signal sending, Git execution, or CLI version collection;
- API, UI, runner, orchestration, compatibility-policy, direct-spawn, resolver, neutralization, raw-completion, revalidation, composition, trading, order, position, persistence, deployment, commit, push, or merge behavior.

## Test Coverage

The focused Action 576 suite covers:

- identity, policy, frozen registry, and static inertness;
- accepted Apple stdout with and without one final LF;
- upstream and Apple build metadata retention;
- generic parser separation;
- stdout shape rejection;
- upstream grammar rejection;
- Apple build grammar rejection;
- blocked raw input rejection;
- tampered raw identities, fingerprints, platform, tool, executable, argv, authority, runtime, live, and TOCTOU claims;
- schema closure against unknown fields, accessors, symbols, classes, functions, arrays, and parser injection;
- rejected evidence containing no partial parsed data;
- deterministic fingerprints over version, build, source, session, and LF posture;
- deep immutability.

## Remaining Blockers

Before this parser can influence any compatibility decision or runtime chain, the project still requires:

- Action 577 static security and contract review;
- a separately reviewed parser-selection or orchestration policy;
- a separately reviewed Git compatibility policy;
- separate runtime activation approval;
- separate deployment approval.

## Decision

Decision: `post_trade_pure_apple_git_version_interpretation_contract_ready_for_static_security_review`

Result status: `post_trade_pure_apple_git_version_interpretation_contract_action_576_implemented_fixture_only`

Recommended next Action: Action 577 - Static Security and Contract Review of Pure Apple Git Version Interpretation Contract.
