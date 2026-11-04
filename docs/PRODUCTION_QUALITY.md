# Production quality workflow

This document describes the first additive production-quality upgrade. The existing Playwright recorder, narration-driven director and FFmpeg assembly remain the trusted baseline. New capabilities are optional and must not make the local-first workflow depend on a paid account.

## 1. Audio quality gate

The template `audio-qa.mjs` measures the final audio stream with FFmpeg's EBU R128 `loudnorm` filter in measurement mode. It does not modify the source file.

Run it from the copied project, where `ffmpeg-static` is already available:

```bash
node video/audio-qa.mjs video/out/final/thread-final-voiced.mp4
```

The report includes integrated loudness (LUFS), true peak (dBTP), loudness range (LU) and review warnings. The initial review targets are -16 LUFS integrated, -1.5 dBTP true peak and 11 LU loudness range. These are production starting points, not universal platform requirements. Listen to the mix and adjust for the target platform and content.

A non-zero exit code means the report contains a warning or the measurement could not be completed. It is a review gate, not proof that audio sounds good. Keep the generated report with the video's QA artifacts.

## 2. Speech alignment and captions

The existing pipeline remains compatible with its current narration timing. Character-weighted caption timing is approximate and must not be described as word-level synchronization.

For higher-precision captions, an agent may optionally use a local forced-alignment tool such as [WhisperX](https://github.com/m-bain/whisperX) after the final narration audio is generated. Keep the spoken audio and original narration text as the source of truth; review recognized words, punctuation, acronyms and product names before replacing caption cues. Do not make WhisperX a mandatory dependency: it has additional Python/model requirements and may require GPU/CPU resources.

Never silently alter the narration or caption wording to match a transcription error. If alignment is unavailable, retain the current sentence/clause cues and disclose that their timing is estimated.

## 3. Motion-graphics renderer boundary

Keep the real application recording separate from designed explanatory footage:

- **Authentic footage:** Playwright captures the actual running application, terminal output and source excerpts. Never replace this evidence with a generated mock UI.
- **Designed footage:** a separate renderer may create title cards, transitions, animated diagrams, charts and feature explanations.
- **Assembly:** FFmpeg remains responsible for final sequencing, audio mix, captions and export.

[HyperFrames](https://github.com/heygen-com/hyperframes) is the first candidate evaluated for this boundary. Its current documented model is HTML/CSS compositions rendered frame-by-frame with seekable timelines. The repository is Apache-2.0 licensed and its documented baseline is Node.js 22+; local rendering requires system FFmpeg, and Docker is optional for a pinned Chrome/font environment. Local output can vary slightly with platform fonts and browser versions. These facts make it promising, but not yet a production dependency for this skill.

The existing project uses `ffmpeg-static` for its own pipeline. Do not assume this binary is discoverable by HyperFrames' separate CLI. A disposable proof of concept must verify prerequisites, render the same sample twice, compare output, and test Windows plus another platform before an adapter is approved. Keep HyperFrames optional, pinned, isolated and limited to designed clips. The existing FFmpeg assembly remains responsible for narration, captions, audio and final exports.

See [HyperFrames evaluation](HYPERFRAMES_EVALUATION.md) for the current findings, architecture decision, proof-of-concept protocol and acceptance gates. [Motion Canvas](https://motioncanvas.io/) remains a specialist alternative for technical diagrams, not an additional dependency to integrate in parallel.

## 4. Creative direction and editorial review

Before recording, prepare a creative brief with:

1. Audience and viewing context.
2. One-sentence product promise.
3. The three most valuable differentiators.
4. Evidence required for each factual claim.
5. Visual style, typography, palette and motion principles.
6. Runtime and platform constraints.
7. Scene-by-scene purpose and intended emotional progression.

Choose a style appropriate to the product rather than applying cinematic effects indiscriminately. Keep real UI readable, use motion to direct attention, and reserve diagrams for concepts that are difficult to show in the product itself.

Review a contact sheet of representative frames before final assembly. Reject scenes with clipped text, weak hierarchy, inconsistent typography, excessive empty space, unreadable UI or decorative motion that distracts from the product.

## 5. Integration principles

- Local-first and free-tier-friendly by default.
- Optional providers must have a working no-account fallback.
- No cloud deployment, purchases or API usage without explicit user approval.
- Do not bundle large model weights or third-party media assets.
- Record exact tool versions and licenses in the production report.
- Keep evidence capture deterministic; use AI browser actions only for exploration or recovery, then convert successful flows to deterministic Playwright steps.
- Do not claim a video is award-winning or predict judging outcomes. Report what was measured and what remains subjective.
