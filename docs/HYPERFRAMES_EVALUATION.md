# HyperFrames renderer evaluation

**Evaluation date:** 2026-11-04  
**Decision:** conditional go for an isolated proof of concept; no production dependency or default-pipeline change.

## Why evaluate it

The existing Playwright recorder is the source of truth for real application footage. HyperFrames is a plausible specialist renderer for *designed* footage: title cards, transitions, animated diagrams, charts and short feature explainers. It must not replace authentic UI capture, terminal evidence or source-code tours.

## Findings from the official project

| Area | Finding | Consequence for this skill |
|---|---|---|
| License | The HyperFrames repository contains an Apache-2.0 license. | Permissive for evaluation and use, subject to retaining required notices when redistributing covered software. Re-check the exact release and its dependency notices before shipping. |
| Runtime | Node.js 22 or newer. | Compatible with the skill's Node 22+ baseline. |
| Local render dependencies | The CLI documentation lists FFmpeg as a local-render prerequisite; its doctor checks Node, FFmpeg and bundled Chrome. | The existing templates use `ffmpeg-static`, but that does not automatically satisfy a separate CLI's system-FFmpeg check. This is a real portability gap, especially on fresh Windows machines. |
| Docker | Optional. Docker mode pins Chrome and fonts for reproducible output. | Do not require Docker. Local mode is simpler but may vary slightly across operating systems and font installations. |
| Rendering model | Frame-oriented, seek-driven capture; the same frame is intended to render identically regardless of wall-clock timing. | Strong conceptual fit for repeatable, code-defined motion scenes. The actual sample still needs repeat-render comparison. |
| Composition | HTML/CSS with timed clips and seekable animation timelines; CLI supports preview and MP4 render. | Agents can author it, but animation must obey the renderer's seek contract. Avoid network-loaded assets and unseeded randomness. |
| Current package snapshot | npm reported `hyperframes@0.9.12` on the evaluation date. | Treat this as a snapshot, not a floating version. Pin the exact version for any experiment and record the resolved version. |

Official references:
- [HyperFrames repository and README](https://github.com/heygen-com/hyperframes)
- [Official license](https://github.com/heygen-com/hyperframes/blob/main/LICENSE)
- [Quickstart and prerequisites](https://hyperframes.app/docs/1-startup/2-quickstart)
- [Rendering guide](https://hyperframes.app/docs/3-guides/4-rendering)
- [Deterministic rendering contract](https://hyperframes.app/docs/2-concepts/4-determinism)
- [npm package](https://www.npmjs.com/package/hyperframes)

## Architecture decision

Keep the current production path unchanged:

```text
Playwright recorder ── authentic app / terminal / code evidence ──┐
                                                                  ├─> existing FFmpeg final assembly
Optional HyperFrames ── designed motion clips only ───────────────┘
Narration / captions / audio QA ──────────────────────────────────┘
```

The optional renderer is a sidecar, not a dependency of the user's application or the base skill template. It may produce short silent intermediate clips in the video output workspace. The existing FFmpeg orchestrator remains the final authority for ordering, narration timing, captions, audio mixing, duration limits and final exports.

**Never**:
- record the real application with HyperFrames or replace Playwright evidence with a mock;
- make the default skill require HyperFrames, Docker, a paid account or a cloud service;
- fetch fonts, images, scripts or other assets during a production render;
- let a second renderer take over final narration timing, captions or audio assembly;
- install system software or alter PATH without the user's approval.

## Proof-of-concept protocol

Run this only when the project benefits from motion that cannot be expressed cleanly with the existing HTML cards. Use a disposable workspace, not the user's source repository.

1. Record the machine's Node version and whether system FFmpeg is available. Do not assume `ffmpeg-static` is visible to the HyperFrames CLI.
2. Pin the CLI version (the evaluation snapshot was 0.9.12); do not use an unpinned `@latest` command in a reproducible build.
3. Run the CLI's doctor command and record its output. If prerequisites are missing, stop and report the blocker rather than silently installing them.
4. Scaffold the documented blank example in a temporary folder using the CLI's non-interactive mode.
5. Create one 5–8 second 1920×1080 composition containing a title, one diagram with 3–5 nodes, and a restrained transition. Use local assets only.
6. Preview it, render it, then render it again from the same inputs.
7. Compare the two outputs: duration, dimensions, frame rate, stream metadata, frame count, and sampled frame hashes. Investigate any visual difference rather than assuming determinism.
8. Test the rendered clip in the existing FFmpeg assembly with narration and captions. Confirm that the current voiced and captions-only outputs remain correct and under the project's runtime limit.
9. Repeat on Windows and at least one Linux/macOS environment before calling the renderer cross-platform.
10. Record tool version, license, environment, commands, elapsed time, output size, failures and visual QA findings in the production report.

## Acceptance gates

Adopt an adapter only when all of these are true:

- The sample renders twice reproducibly from the same inputs.
- No render-time network access is needed.
- A clean setup path exists for Windows, macOS and Linux, or unsupported platforms are explicitly documented.
- System FFmpeg requirements are explained and do not silently conflict with `ffmpeg-static`.
- It creates an intermediate clip that the current FFmpeg pipeline can consume without changing narration/caption timing.
- The rendered diagram is more legible and useful than the existing static HTML card.
- Runtime, memory use and install footprint are acceptable on an ordinary developer workstation.
- Licensing and attribution for the renderer, fonts, icons, sound and other assets are recorded.

If any gate fails, retain the existing HTML cards and FFmpeg path. A renderer is not an improvement merely because it adds motion.

## Current status and next step

This is a documentation-backed feasibility decision, **not** a completed render test. HyperFrames has not yet been installed or executed against this repository, and no visual quality or cross-platform claim is made.

The next implementation step, after the proof-of-concept passes, is a tiny adapter that accepts a composition directory and emits a silent intermediate clip plus a machine-readable render report. Keep it optional and isolated. Do not add HyperFrames to the root dependency manifest.
