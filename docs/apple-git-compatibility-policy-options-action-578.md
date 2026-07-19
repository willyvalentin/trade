# Action 578 - Apple Git Compatibility Policy Options

## Option Comparison

| Option | Description | Benefits | Risks | Verdict |
| --- | --- | --- | --- | --- |
| A - Upstream version only | Use supported upstream major set and per-major minimum; retain Apple build as evidence. | Simple and aligns with Action 573 generic policy shape. | Assumes Apple preserves upstream behavior/security and ignores Apple package/build semantics. Current evidence does not prove this. | Rejected for Apple `/usr/bin/git`. |
| B - Apple build only | Use exact or minimum Apple build; retain upstream version as evidence. | Centers the observed Apple suffix and platform packaging. | Apple does not document `Apple Git-N` comparison, monotonicity, source mapping, or security mapping in reviewed sources. | Rejected. |
| C - Combined upstream plus Apple build | Require upstream version posture plus Apple build allowlist/minimum. | Keeps upstream and Apple vendor evidence separated. | Still lacks exact future command/security requirements and authoritative Apple build semantics. | Premature. |
| D - Command-capability matrix without version floor | Define compatibility by exact approved command/flag capabilities rather than numeric version. | Avoids overclaiming from version numbers. | Requires an exact activation command contract; live probes would need separate review and could introduce authority/TOCTOU concerns. | Promising after Action 579. |
| E - Policy remains unresolved | Do not invent a baseline until exact activation requirements and Apple semantics are reviewable. | Preserves fail-closed posture and avoids tautological or unsupported policy. | Requires another planning step. | Selected as Option 2 in the Action 578 decision model. |

## Policy-Shape Re-Evaluation

Action 573's preferred generic shape was supported major set plus per-major minimum. Action 578 keeps that as a possible component for upstream Git evidence but does not adopt it as the complete Apple policy.

Apple-specific policy may need one of these future forms:

1. upstream major set plus per-major minimum and Apple build allowlist;
2. upstream major set plus per-major minimum and CLT package allowlist;
3. exact closed platform tuple allowlist;
4. command-capability matrix plus parser/provenance evidence;
5. unresolved policy until future activation contracts exist.

Action 578 selects unresolved policy pending an exact read-only activation capability contract.

## Why Current Values Are Not Enough

Observed values:

- upstream Git version: `2.39.5`;
- Apple build: `154`;
- CLT package version: `16.4.0.0.1.1747106510`.

These values are evidence, not sufficient policy by themselves.

Action 578 does not choose them solely because they are present. It also does not claim lower values fail or higher values pass, because those conclusions require exact future command requirements and platform/security criteria.

## Recommended Next Action

Action 579 - Define Exact Read-Only Git Activation Capability Contract.

That action should decide exactly which Git commands, flags, output formats, config controls, path handling, repository trust assumptions, and security constraints are in scope before any numeric or tuple compatibility baseline is implemented.
