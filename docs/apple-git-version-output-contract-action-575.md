# Action 575 - Apple Git Version Output Contract

## Approved Action 574 Baseline

Action 575 starts from:

- workspace: `/Users/willysimonsson/Dev/trade-action-534`;
- branch: `codex/action-534-live-resolver`;
- Action 574 checkpoint commit: `59e7fec Add Git capability inventory and compatibility baseline`;
- initial worktree: clean.

Action 574 selected `unresolved_platform_output_prerequisite` because the current approved macOS `/usr/bin/git` target can emit Apple-suffixed version output while the approved parser rejects suffixes.

## Evidence Methodology

Allowed read-only development evidence commands:

- `/usr/bin/git --version`;
- `/usr/bin/xcode-select -p`;
- `stat -f '%N %HT %z bytes mode=%p uid=%u gid=%g mtime=%Sm' /usr/bin/git`;
- `file /usr/bin/git`;
- `codesign -dv /usr/bin/git`;
- `pkgutil --file-info /usr/bin/git`;
- `pkgutil --pkg-info=com.apple.pkg.CLTools_Executables`;
- `printf 'git version 2.39.5 (Apple Git-154)\n' | wc -c`.

These commands were development evidence only. They did not activate the product chain and did not authorize runtime Git execution.

Primary or authoritative sources reviewed:

- Apple command-line tools installation documentation: https://developer.apple.com/documentation/xcode/installing-the-command-line-tools/
- Apple command-line tools configuration documentation: https://developer.apple.com/documentation/xcode/configuring-command-line-tools-settings
- Apple Xcode command-line tool reference: https://developer.apple.com/documentation/xcode/xcode-command-line-tool-reference
- Apple technical note TN2339: https://developer.apple.com/library/archive/technotes/tn2339/_index.html
- Apple open-source Git distribution repository: https://github.com/apple-oss-distributions/Git
- Git `git-version` documentation: https://git-scm.com/docs/git-version/2.33.1.html
- Git command documentation: https://git-scm.com/docs/git

## Exact Observed Output

Observed command:

`/usr/bin/git --version`

Observed stdout:

`git version 2.39.5 (Apple Git-154)`

Observed output properties:

| Property | Value |
| --- | --- |
| prefix | `git version ` |
| upstream numeric version | `2.39.5` |
| upstream component count | 3 |
| separator after upstream version | one ASCII space |
| suffix opening | `(` |
| vendor label | `Apple Git` |
| vendor separator | `-` |
| vendor build string | `154` |
| vendor build component count | 1 |
| suffix closing | `)` |
| final newline | present in terminal output |
| stdout byte count with final LF | 35 |
| stderr posture | no stderr output observed |
| encoding | ASCII-compatible UTF-8 |
| variants evidenced | one exact variant only |

No evidence collected in Action 575 supports accepting `Apple Git-154.1`, a missing build number, alternate vendor casing, extra spaces, localization, arbitrary parenthetical text, or any non-Apple suffix.

## Primary-Source Findings

Apple documents that Command Line Tools for Xcode can be installed as a separate package, that the package is installed at `/Library/Developer/CommandLineTools`, and that `xcode-select --print-path` reports the active developer directory. Apple also documents checking the Command Line Tools package version with `pkgutil --pkg-info=com.apple.pkg.CLTools_Executables`.

Apple technical note TN2339 states that macOS includes shims or wrapper executables for command-line tools.

Local evidence for this machine:

- active developer directory: `/Library/Developer/CommandLineTools`;
- `/usr/bin/git` code signature identifier: `com.apple.dt.xcode_select.tool-shim`;
- `/usr/bin/git` file type: Mach-O universal binary;
- package receipt: `com.apple.pkg.CLTools_Executables`;
- package version: `16.4.0.0.1.1747106510`.

Git documentation states that `git --version` is equivalent to `git version` and prints the Git suite version from which the program came. It does not define Apple's vendor suffix grammar.

Apple's public docs reviewed in Action 575 do not define a stable `Apple Git-N` suffix grammar, do not state whether the suffix can contain dot components, and do not state whether the suffix changes independently from the upstream numeric Git version.

## Current Parser Incompatibility

The approved parser contract remains:

- exact lowercase prefix `git version `;
- exactly three ASCII numeric components;
- no suffix;
- no vendor metadata;
- no parentheses;
- no extra text;
- optional exactly one final LF;
- empty stderr;
- no trim or repair;
- fixture-only;
- `authority:"none"`;
- `observedLiveProcess:false`;
- `toctouEliminated:false`.

The Apple output is currently rejected because the token after `git version ` is:

`2.39.5 (Apple Git-154)`

That token contains whitespace, parentheses, letters, and a hyphen. Under the current implementation, it triggers `suffix_rejected` and `version_grammar_rejected`. If parsing continued to component splitting, it would also fail exact numeric component grammar.

Action 575 does not change the parser.

## Platform Identity

The approved chain currently represents:

- platform: `macos`;
- executable: `/usr/bin/git`;
- resolver candidate root: `/usr/bin`;
- direct-spawn argv: `["--version"]`;
- parser executable expectation: `/usr/bin/git`.

Executable path alone is insufficient to prove vendor semantics. In the observed environment, vendor provenance is supported by the combination of:

- `/usr/bin/git` path;
- macOS platform posture;
- xcode-select active developer directory;
- `com.apple.dt.xcode_select.tool-shim` code signature identifier;
- `com.apple.pkg.CLTools_Executables` package receipt;
- Apple-suffixed output.

The current source evidence does not yet carry all of these as contract fields. A future Apple parser can require the exact Apple output grammar and source linkage, but a later provenance contract may still be needed before runtime activation or security compatibility uses Apple package identity.

## Suffix Semantics

Action 575 classifies `(Apple Git-154)` as vendor/build metadata, not part of the upstream semantic Git version.

Rationale:

- the upstream numeric version remains the `2.39.5` token immediately after `git version `;
- the parenthetical suffix is Apple-specific and absent from the generic parser contract;
- the suffix has a vendor label and build string structure;
- Apple docs reviewed do not define the build string as semver.

Compatibility may eventually require two separate values:

- upstream Git version: `2.39.5`;
- Apple package/build identity: `Apple Git-154`, plus Command Line Tools package provenance where reviewed.

Action 575 does not claim that upstream version alone is sufficient for Apple security compatibility. Apple may backport fixes without changing the upstream numeric version, and Action 575 did not find primary documentation that maps `Apple Git-154` to security fixes or command-capability deltas.

## Chosen Contract Direction

Chosen option:

`OPTION C - ADD A SEPARATE PURE APPLE GIT VERSION INTERPRETATION CONTRACT`

Reasons:

- preserves the approved generic strict parser unchanged;
- avoids silently stripping vendor metadata;
- keeps Apple-specific grammar and evidence under a distinct contract identity;
- allows retention of upstream version and Apple build metadata;
- makes future compatibility policy explicitly platform-aware;
- avoids selecting a different executable or adding installation assumptions.

## Narrow Future Apple Grammar

A future Apple-specific parser should accept only the evidenced shape unless additional variants are separately reviewed:

```text
git version <major>.<minor>.<patch> (Apple Git-<build>)
```

Planned grammar constraints:

- exact prefix `git version `;
- upstream version is exactly three ASCII decimal components;
- upstream components have no leading zero except exactly `0`;
- upstream component digit and numeric bounds should mirror the approved generic parser unless revised by review;
- exactly one ASCII space after upstream patch;
- exact `(` opening parenthesis;
- exact case-sensitive vendor label `Apple Git`;
- exact hyphen separator;
- build is ASCII decimal digits only;
- build has one component in the initial contract;
- build has no leading zero except exactly `0`;
- exact `)` closing parenthesis;
- optional exactly one final LF;
- empty stderr;
- no extra whitespace;
- no additional suffix;
- no localization;
- no ANSI;
- no NUL/control characters;
- no CR/CRLF;
- no broad trim;
- no Unicode normalization;
- no arbitrary vendor string.

The grammar must reject `Apple Git-154.1`, `apple git-154`, `AppleGit-154`, `Apple Git -154`, `Apple Git-154 beta`, and all non-evidenced variants until separately reviewed.

## Future Interpretation Output Model

The future Apple parser evidence should include:

- contract kind/version/boundary;
- parser grammar identity/version;
- normalization identity/version;
- source raw-completion fingerprint;
- source spawn fingerprint;
- platform identity;
- canonical executable `/usr/bin/git`;
- original stdout fingerprint;
- normalized stdout fingerprint;
- upstream version string;
- upstream `major`, `minor`, `patch`;
- vendor identity `Apple Git`;
- Apple build string;
- Apple build numeric components;
- `vendorSuffixPresent:true`;
- interpretation status and deterministic reason;
- `observedLiveProcess:false`;
- `compatibilityAuthorityGranted:false`;
- `runtimeAuthorityGranted:false`;
- `deploymentAuthorityGranted:false`;
- `authority:"none"`;
- `toctouEliminated:false`.

Generic and Apple evidence should use separate versioned contracts rather than a shared union in the current stage. A later compatibility policy may accept both only after a separate integration review.

## Compatibility Impact

Future compatibility should not be driven by parser acceptance alone.

Compatibility values should remain unresolved until:

1. Apple-specific parser evidence exists;
2. upstream version and Apple build metadata are both retained;
3. platform provenance requirements are defined;
4. security baseline decides whether upstream version, Apple build, Command Line Tools package version, or a combination is authoritative.

Action 574's supported-major/per-major-minimum policy shape remains plausible for upstream Git versions, but Apple packaging likely needs an additional exact Apple-build or package-provenance posture. Action 575 does not resume baseline derivation.

## Authority And Semantic Limits

Any future Apple parser grants no:

- process execution authority;
- process observation authority;
- repository access authority;
- Git command authority;
- compatibility authority;
- runtime authority;
- staging authority;
- deployment authority;
- credential authority;
- network authority;
- API/UI/runner authority;
- Avanza/trading authority;
- persistence authority.

Accepted Apple interpretation would mean only that neutral evidence matched a reviewed Apple grammar. It would not prove the executable still exists, the binary remains unchanged, Apple Git is secure, required commands will succeed, runtime may activate, deployment may proceed, or TOCTOU is eliminated.

## Decision

Decision: `post_trade_apple_git_version_output_contract_resolved_separate_parser_required`

Result status: `post_trade_apple_git_version_output_action_575_completed_separate_parser_planned`

Recommended next Action: Action 576 - Implement Pure Apple Git Version Interpretation Contract.
