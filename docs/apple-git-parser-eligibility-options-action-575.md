# Action 575 - Apple Git Parser Eligibility Options

## Option Comparison

| Option | Description | Benefits | Risks | Verdict |
| --- | --- | --- | --- | --- |
| A | Keep strict generic parser unchanged and leave Apple output ineligible. | Preserves existing contract with zero implementation work. | Blocks the approved `/usr/bin/git` path observed on macOS Command Line Tools. | Rejected as too blocking for the reviewed target. |
| B | Extend existing parser with one exact Apple suffix grammar. | Single parser entry point. | Blurs generic and vendor-specific evidence, requires contract identity/version changes, and increases risk of broad suffix acceptance. | Rejected for this stage. |
| C | Add a separate pure Apple Git version interpretation contract. | Preserves generic parser, keeps Apple grammar explicit, retains vendor metadata, and improves reviewability. | Adds another pure contract and later integration work. | Chosen. |
| D | Change canonical executable to a non-Apple Git binary. | Could preserve strict generic output. | Adds installation/path/provenance assumptions and may require Homebrew or other external tooling. | Rejected as premature. |
| E | Normalize Apple output before current parser. | Minimal parser change in appearance. | Destroys vendor evidence, hides platform provenance, weakens fingerprint linkage, and creates ambiguity. | Rejected as unsafe. |

## Chosen Option

Action 575 chooses Option C:

`Add a separate pure Apple Git version interpretation contract`.

The existing generic parser remains unchanged. The future Apple parser must be pure, fixture-only until separately integrated, deterministic, authority-free, source-controlled, and unreachable from runtime/API/UI/runner paths.

## Why Not Parser V2 Now

A parser v2 combining generic and Apple output would require deciding whether one contract can safely represent both output families. Action 575 finds that the Apple suffix is vendor/build metadata and should be retained separately. A separate contract is narrower and easier to review.

## Why Not Silent Normalization

Stripping `(Apple Git-154)` before the current parser would hide trust-relevant vendor metadata. It would also make the normalized output appear generic even though the source executable and platform are Apple-specific. This is inconsistent with the Action 533 and Action 568-572 fingerprint-linkage posture.

## Future Grammar Gate

The future implementation should use this exact initial grammar:

```text
git version M.m.p (Apple Git-B)
```

Where:

- `M`, `m`, and `p` are ASCII decimal upstream Git components;
- `B` is one ASCII decimal Apple build component;
- label and punctuation are exact and case-sensitive;
- one final LF is optional;
- stderr must be empty;
- all unreviewed variants reject.

## Future Review Gates

Required future gates:

1. Apple output evidence review.
2. Primary-source provenance review.
3. Platform identity review.
4. Grammar closure review.
5. Vendor metadata semantics review.
6. Upstream/build separation review.
7. Output byte/UTF-8 review.
8. Fingerprint-linkage review.
9. Result-schema review.
10. Authority/no-runtime review.
11. Export-surface review.
12. Runtime-reachability review.
13. Independent static security review.
14. Remediation and final re-review.
15. Separate compatibility baseline review.
16. Separate orchestrator integration planning.
17. Separate runtime activation approval.
18. Separate deployment approval.

## Non-Authorizations

Action 575 does not authorize:

- modifying the generic Git parser;
- implementing the Apple parser;
- implementing compatibility evaluation;
- creating a compatibility policy module;
- activating runtime/API/UI/runner paths;
- changing resolver, revalidation, direct-spawn, neutralization, raw-completion, composition, or orchestration behavior;
- Git execution through product behavior;
- repository access;
- credentials, environment access, network, Avanza, trading, persistence, deployment, commit, push, merge, or deploy.

## Recommended Next Action

Action 576 - Implement Pure Apple Git Version Interpretation Contract.
