---
name: project-demo-video
description: Produce a narrated, captioned 1080p demo video (3 minutes or less) for any software project, hackathon entry or product, as code, with Playwright and ffmpeg-static. Records the real app, replays real terminal proof output, tours real source code, draws diagrams, adds speech (Windows built-in voice by default, ElevenLabs optional) and burns in captions. Use when asked to make, redo or re-time a demo, pitch or submission video, or to prove on video that a project works.
license: MIT
compatibility: Needs Node.js 22+ with @playwright/test (Chromium) and ffmpeg-static in the project copy. Speech synthesis in the templates is Windows-only (System.Speech); other systems need a small adaptation of lib/tts.mjs. ElevenLabs is optional and needs an account and API key.
metadata:
  version: "1.0.0"
  category: video-production
  tags: demo-video hackathon playwright ffmpeg captions text-to-speech
---

# project-demo-video

Build the demo video **as code** so it can be re-rendered in minutes after any change. Everything on screen is the real thing: the running app, the real command output, the real source files. Nothing is a mock-up.

This skill is written so a less capable coding agent can follow it step by step. Follow the phases in order. Each phase has a **Done when** line: do not move on until it is true. Copy files from `templates/` instead of writing them again.

Install: copy this whole folder (SKILL.md and `templates/`) to the agent's skills folder, for example `~/.claude/skills/project-demo-video/`, or just point the agent at `SKILL.md`.

## What you produce

| Output | Notes |
|---|---|
| `<name>-voiced.mp4` | 1920x1080, 30 fps, H.264 + AAC, captions burned in, with voice |
| `<name>-captions-only.mp4` | same picture, silent audio track (the user may pick this or record their own voice) |
| `<name>.srt` | captions as a file, same text as the narration |
| `thumbnail.png` | 1280x720 |
| `narration.md`, `shotlist.md` | script with real timestamps; each scene with its source |
| `frames/` | the QA frames you actually looked at |
| `repo/` | changed or new project files, mirrored at their repo paths |
| `COPY_LIST.md`, `README-snippet.md`, `REPORT.md` | what to copy where, a "See it work" README section, what is done and what is risky |

## 0. Rules you must not break

1. **Read-only source.** Never write to, commit in or push from the user's real repos. Work in a copy (`robocopy`/`cp`, excluding `node_modules`, `.git`, build output), then `npm ci` there. Keep changes worth keeping under the output folder, mirroring repo paths, plus `COPY_LIST.md`. Another tool or person does the git work.
2. **Be honest on screen.** Anything simulated (a device, a connector, a payment, a model) is labelled as simulated in the video. Never imply hardware, deployments or users that do not exist. Copy the project's own "real vs simulated" table; if the README is wrong, say so in the report and do not repeat the claim.
3. **No secrets on screen or in files you ship:** tokens, API keys, `.env` contents, private keys, real emails. Dev tokens that the project documents (for example `Bearer dev-alice`) are fine. When you show code, pick line ranges that exclude secrets.
4. **No mention of the AI tool that wrote the code, or its vendor,** in frames, narration, captions or shipped docs, unless the user says otherwise. A runtime model id that is part of the product config may appear as a model name. Check with `grep -ri` before you finish.
5. **Respect the contest rules.** Read the length limit (usually "less than 3:00"; aim for 2:50) and the required-technology rule. The video must show the required technology really running, not only mention it.
6. **Free tier, no deploys, no purchases.** Do not deploy, create cloud resources or spend money. If a step needs a credential or a recording from the user, ask once, plainly, and continue with everything else.
7. **Ask the user only for** credentials, their own recordings, or a choice that is really theirs (for example which voice). Decide everything else yourself and say what you decided.

## 1. Prerequisites (check, do not assume)

```bash
node --version          # 22+ (24 recommended; .mjs files must be plain JavaScript, no TypeScript casts)
```
- In the project copy: `@playwright/test` (with Chromium installed) and `ffmpeg-static` must exist. Check: `node -e "import('@playwright/test').then(async m=>{const b=await m.chromium.launch();console.log(b.version());await b.close()})"` and `node -e "import('ffmpeg-static').then(m=>console.log(m.default))"`. If missing and the project forbids new dependencies, put them in a separate tools folder and point to it.
- Speech: Windows PowerShell with `System.Speech` (built in). On macOS use `say`, on Linux `espeak-ng`; then you must adapt `templates/lib/tts.mjs` (only `synthAll` and `tts.ps1` are OS-specific).
- No `ffprobe` ships with ffmpeg-static: measure durations from WAV headers (`wavSeconds` in `templates/lib/tts.mjs`) and from the recorder's own timing.
- Windows shell notes: prefer the Write and Edit tools for any file that contains backslashes, regexes or `$`. Inline `python -c`/heredoc rewriting of JS silently corrupts escapes. Foreground `sleep` is blocked in some agents: wait with `until grep -q "done" log; do sleep 10; done`.

## 2. Phases

### Phase A: Requirements and proof map
Read the rules page, the README, the project's own docs and any storyline notes. Write a table in your notes:

| Judge must be convinced that | Where the video proves it | Scene |
|---|---|---|
| the required technology is called in code | real call visible: request log, terminal, code excerpt | ... |
| the experience works | app running in a browser | ... |
| what is real vs simulated | the project's own table | ... |

**Done when** every row has a scene.

### Phase B: Workspace
1. Copy the repo into a scratch folder, then install: `npm ci`.
2. Copy `templates/` into the copy as `video/` (keep the structure: `video/lib`, `video/pages`, `video/scenes`, `video/final.mjs`, `video/narration.mjs`, ...). Add to `package.json` scripts: `"video:final": "node video/final.mjs"`. Add no dependencies.
3. Add `video/out/` to `.gitignore` in the copy.

### Phase C: Dry-run the real app and hunt bugs (do this before recording anything)
Start the app the way a judge would (`npm run demo` or the README command) on its documented default port, so every command shown on screen is literal. Drive it with a small Playwright script, take screenshots at 1920x1080 after every step of the story, and look at them. Check:
- sign-in, empty panels, red error banners, console errors;
- every state the story needs actually renders (the first run of the reference project showed a failed sign-in, an empty inbox and a missing key view, all hidden by an old draft video);
- text duplicated or cut off.

Fix real bugs **in the copy**, minimally, run the project's own checks (`npm run verify`, tests, typecheck) and record each fix for `COPY_LIST.md`. If the app has no way to show the wire traffic, add a small optional hook (a request log) rather than faking one.
**Done when** the whole story runs clean twice in a row and the project's checks pass.

### Phase D: Storyboard and narration
1. Pick scenes. Reference story (about 2:50):

| Scene | Length | Shows |
|---|---|---|
| hook | 12 s | one change ripples through several commitments (animated card) |
| boot | 6 s | the one command that starts everything, real output |
| sim (the app) | 60 s | 8-10 beats; request log opened on 2 beats |
| proof terminal(s) | 17-30 s | official client or CLI against the same server; auth checks |
| code tour | 16 s | 3-4 real excerpts that prove the required technology |
| architecture, cloud stack, real vs simulated | 30 s | diagram, stack source, honesty table, open-source card |
| close | 12 s | tagline, repo links, build credits, "X is simulated" footer |

2. Write `video/narration.mjs`: `scenes = [{ id, title, segs: [{ id, text }] }]`. Every `seg` is one spoken line and one caption (`text` is shown verbatim). Rules: about 2.4 words per second; total spoken words 330-380; one idea per line; no more than about 12 words on any on-screen card; sentence case; no hype.
3. Add pronunciation hints in the `say` table for the speech engine only (acronyms spelled out, "Alexa+" as "Alexa plus"); never change the caption text.
**Done when** the narration reads as a story a stranger understands and every proof-map row is spoken or shown.

### Phase E: Adapt the templates
Edit only what is project-specific:

| File | Edit |
|---|---|
| `video/narration.mjs` | your scenes and lines |
| `video/scenes/sim.mjs` | your app's steps: what to type or click, selectors, the camera zooms (`lens(...)`, `zoomWire`) |
| `video/scenes/static.mjs` | terminal commands (`CMD`), `codeBlocks` (file + regex of the first line + line count + highlight regexes), hook/close page calls |
| `video/proofs.mjs`, `video/proof-auth.mjs` | the real commands that prove your claims; they print status codes and error names only |
| `video/pages/*.html` | text, colours, tiles, diagram boxes, table rows, links |
| `video/lib/overlay.mjs` | `SIM_CSS` selectors for your app's layout (see Layout rules), the ticker's data source |
| `video/final.mjs` | the `LIMIT` constant and scene order (order comes from `narration.mjs`) |
| `video/thumbnail.mjs`, `video/docs.mjs` | titles and the `SHOT` table |

Do not edit `lib/recorder.mjs`, `lib/director.mjs`, `lib/tts.*` unless something is broken.

### Phase F: Capture real proof output
`node video/proofs.mjs` starts a fresh server, runs the real commands (official inspector or client CLI, auth checks, install/boot output) and saves what they printed to `video/out/proofs.json`. The terminal scenes **replay this captured output** in an HTML terminal at a readable size. Rules: show the real command text (shorten only the package path); truncate very long output visibly (a dim "... N lines ..." line) and put "Recorded run" in the chip; never print tokens; pretty-print JSON and say so if you do.

### Phase G: Narration audio
Default (no account needed): `node video/final.mjs --rate 2` makes one WAV per line with the built-in Windows voice (`Microsoft Zira`) and measures each length. Rate 1 is about 150 s of speech for the reference script, rate 2 about 139 s, rate 3 is too fast. Pick the slowest rate that keeps the whole video under the limit.
Optional human-sounding voice: see Appendix A. Everything below works the same with either.

### Phase H: Record and assemble
```bash
node video/final.mjs --rate 2                   # everything: tts, proofs, record all scenes, assemble both cuts
node video/final.mjs --rate 2 --reuse-proofs    # skip re-running proofs
node video/final.mjs --scenes sim,close --reuse-tts --reuse-proofs   # re-record some scenes only
node video/final.mjs --assemble-only            # re-mux (captions, audio) without re-recording
node video/final.mjs --tts-dir video/out/tts-human --name my_video --single    # build from another audio folder
```
A full run takes 6-10 minutes; run it in the background and poll the log. The script **fails if the total is 180 s or more**. Aim for 170 s.
Important: if you change narration text or the voice, durations change, so **every** scene must be re-recorded (the marks come from the durations). Changing only visuals of one scene means `--scenes <id> --reuse-tts`.

### Phase I: QA (never skip, never trust the log)
1. Extract frames at the end of each narration line from the final MP4: `ffmpeg -ss <markEnd-0.3> -i final.mp4 -frames:v 1 frame.png` (the timeline is in `video/out/timeline.json`). View them. Check legibility at 1080p, empty space, clipped text, caption position and size, sync (the caption's event is on screen), no secret, no vendor mention, honesty labels present.
2. `ffmpeg -i final.mp4 -af volumedetect -f null -`: mean about -22 dB, max below 0 dB.
3. Duration under the limit in both cuts; both files have a video and an audio stream.
4. `grep -ril "<vendor words>" video/pages video/narration.mjs <output docs>` returns nothing except an allowed model id.
5. Run the project's checks again (`npm run verify`; e2e if the UI changed).
6. Fix and re-render until all pass.

### Phase J: Deliverables
Generate `narration.md` and `shotlist.md` with `node video/docs.mjs <outdir>` (real timestamps). Copy the MP4s, SRT, thumbnail (`node video/thumbnail.mjs <png>`), the QA frames, and the changed repo files (all differing files between the original and your copy, at their repo paths). Write `COPY_LIST.md` (bug fixes first, then new files, suggested commit messages, "run build and verify after copying"), `README-snippet.md` (run command, entry-point file:line, client file:line, skill file, video link placeholder) and `REPORT.md` (done, what the user must do, risks). Say plainly what you could not check (for example, you could not listen to the voice).

## 3. How the pipeline works (read before changing it)

**Recorder** (`lib/recorder.mjs`). Playwright's own `recordVideo` caps bitrate and blurs small text, so this uses Chromium screencast: JPEG frames (quality 92) are stamped when they arrive, written to disk and encoded at a constant 30 fps with libx264 crf 17. Static screens produce few frames; the last frame is held. Timestamps come from one clock (`performance.timeOrigin + performance.now()`), the same one the director uses.

**Director** (`lib/director.mjs`). Each narration line is a *segment*. `d.seg(id, actions, {tail})` records the start time, runs the on-screen actions, then holds until the line has finished playing plus `tail * 0.45` seconds (tails are trimmed globally to fit the limit). The marks (`id`, start, end, text) are saved to `video/out/<scene>.marks.json`. Because audio is later placed **at the recorded marks**, picture and voice cannot drift. Rule for a beat: do the action inside the segment and make sure the action finishes before the narration does; if the line is shorter than the action, split it into two lines (this is why one story beat became `sim9` and `sim10`).

**Audio** (`final.mjs`). Each WAV is delayed to its global start with `adelay`, mixed with `amix=normalize=0`, limited with `alimiter`, and padded with `apad=whole_dur=<total>` (without the pad, `-shortest` cuts the end of the video).

**Captions.** Cues are the narration text split at sentence ends (decimals such as "2.0" are protected) and at commas when over 82 characters, with time split in proportion to length. The `.srt` is shipped. The burned-in version uses a generated **ASS file with `PlayResX: 1920, PlayResY: 1080`** and font size 36. Do not burn an SRT with `force_style`: libass scales it against a 288-pixel-high canvas and the text comes out about four times too big.

**Overlay** (`lib/overlay.mjs`), injected into the recorded app page only (the app itself is not edited):
- a 1920x1080 layout override (`SIM_CSS`);
- a visible cursor glides to each target, then a ring shows the click; wait about 0.5 s for the glide before clicking, and wait for a camera move to finish before aiming (coordinates are measured on screen);
- a step label chip (top left) naming the beat in at most 12 words;
- a ticker strip showing the last real request (method, tool, status, ms, who): live proof on every beat;
- a camera: `__focus(selector, {crop, maxZoom, dim})` is a CSS transform on `body`, so text re-renders crisp; `dim` fades everything else; `__reset()` returns to full view;
- transcript auto-scroll.

**Pages** (`pages/*.html`) are static cards driven by tiny APIs (`window.step(n)`, `window.T.type/out/mark`, `window.C.show`, `window.A.view/rows`), recorded the same way as the app.

**Code tour.** Excerpts are read from the real files at record time by regex on the first line, so line numbers are always correct. At most about 14-16 lines per screen (fonts 25 px, line height 38 px); long lines wrap; highlight lines with regexes. Never include a line that holds a secret.

**Wire log (optional, recommended).** If the project has a server, add a small `onWire` hook that records method, tool, status, ms, caller identity (never the token) and the JSON bodies, and serve it at `GET /api/wire`. The drawer and the ticker read it. This is the cheapest honest way to show "a real call happened".

## 4. Layout and design rules

- Canvas 1920x1080. Keep the **bottom 100 px free** for captions. Fonts at least 25 px for code and terminal text, 30+ for card text.
- **No dead space.** If a screen is more than a quarter empty, enlarge, add a real element (ticker, second panel) or zoom. Re-check every screen at full size.
- One palette: dark background `#0b0f14`, one accent colour, red/green only for status. Cards at most about 12 words, sentence case.
- Hold each important frame at least 2 seconds. Zoom into the region that matters instead of showing 10 px text.
- Drawers/overlays that open on top of the UI start below the part of the UI you need visible.
- Chips label scenes ("Recorded run", "AWS CDK stack: synthesized, not deployed"); the footer of the closing card states what is simulated.
- Thumbnail: render with `page.setContent` and a base64 data-URL image (`file://` images are blocked from `about:blank`); use a frame without captions.

## 5. Time budget (reference numbers)

| Item | Seconds |
|---|---|
| Speech at Windows rate 2 | about 139 |
| Same script, a natural neural voice at 1.12x | about 142 |
| Total video | 168-172 |
| Limit | under 180 (aim 170) |

Levers, in order: shorten lines; reduce `tail` values; raise speech rate (not above +3 for Windows, 1.15x for neural); cut a scene's hold times; merge scenes. Never cut the proof scenes.

## 6. Pitfalls and fixes

| Symptom | Cause and fix |
|---|---|
| Captions huge | burned an SRT with `force_style`; use the generated ASS with PlayRes 1920x1080 |
| Video ends 1 s early | audio shorter than video and `-shortest`; add `apad=whole_dur` |
| Terminal command still typing when the narration ends | typing too slow; type per animation frame (`per = round(cps/60)` characters) |
| Click lands in the wrong place | camera still moving; wait for the transition before measuring |
| Beat narrated before the result appears | action longer than the line; split into two lines or shorten the action |
| Caption cuts "2.0" into "2." and "0" | protect decimal points before sentence splitting |
| Text clipped at the right edge of a code block | use `pre-wrap` with `overflow-wrap:anywhere`, fewer lines |
| Blurry text | used `recordVideo`; use the screencast recorder |
| Browser sign-in shows a red banner | `fetch(..., {redirect:"manual"})` hides `Location` in browsers; follow the redirect and read the code from `res.url` |
| Panel empty although the server has data | UI reads a different response field than the API returns; fix the UI mapping |
| Python/sed edit corrupted a regex or a newline | use the Edit tool; never rewrite JS with shell one-liners on Windows |
| `.mjs` fails with "Unexpected token" | TypeScript syntax (`as`, `!`) in a plain JS file |
| `curl` fails "CRYPT_E_REVOCATION_OFFLINE" | add `--ssl-no-revoke` for a public file; extract archives with PowerShell `tar`, not Git Bash `tar` |
| Long command "moved to background" | normal; poll its log with an `until` loop instead of sleeping |
| Frame count tiny for static scenes | expected; frames are only produced when the screen changes |
| Narration changed but video looks out of sync | scenes were not re-recorded; re-run without `--reuse-tts` and without `--scenes` |

## 7. Quality bar (self-check before you report)

- [ ] Every claim in the proof map is visible or audible in a specific scene.
- [ ] The app was run from the documented command; shown commands are literal.
- [ ] Real vs simulated is stated on screen.
- [ ] No empty screens, no clipped text, captions legible and matching the voice.
- [ ] Runtime under the limit in every cut; audio present in both cuts.
- [ ] No secrets, no vendor mentions, no real personal data.
- [ ] The project's own checks pass with your fixes applied in the copy.
- [ ] REPORT lists what you could not verify.

## Appendix A: ElevenLabs human voice (optional)

Skip this appendix unless the user asks for a more human voice. The default Windows voice is enough to deliver a complete video.

1. **Connect (the user approves in a browser).** In a separate folder (not the repo): `npx -y @elevenlabs/cli@latest onboard init`, then do exactly what each reply's `say`/`run` fields say. `onboard connect --env-path .env.local` opens a page; the user clicks Authorize and the key is saved to `.env.local`. **Never print, cat or paste the key**; never ask for it in chat; never put it in code (the SDK reads `ELEVENLABS_API_KEY`). The tool will ask what to build and wait for the user's answer; relay it, then run `onboard check --answered --env-path .env.local`. Install the SDK in that folder: `npm install @elevenlabs/elevenlabs-js`. Load the key with `node --env-file=.env.local`.
2. **Free plan facts.** About 10,000 characters per month. **Voices from the public Voice Library (category "professional") are blocked through the API on the free plan** (HTTP 402 `paid_plan_required`); only the built-in premade voices work, unless the user adds credits. Check a voice without spending: `node --env-file=.env.local templates/elevenlabs/check-voice.mjs <voiceId>` (shows plan and voice category). If the voice is blocked, tell the user and offer premade voices; do not spend credits or money without their yes. Premade male narration voices: George `JBFqnCBsd6RMkjVDRZzb`, Daniel `onwK4e9ZLuTAKqWW03F9`, Eric `cjVigY5qzO86Huf0OWal`, Chris `iP95p4xoKVk53GoZ742B`, Brian `nPczCjzI2devNBz1zQrb`, Will `bIHbv24MWmeRgasZH58o`. Female: Alice `Xb7hH8MSUJpSbSDYk0k2`, Sarah `EXAVITQu4vr4xnSDxMaL`. If the user says "do not render", do not generate even short samples.
3. **Render.** `node --env-file=.env.local render-narration.mjs <voiceId> <repo>/video/out/tts-human <repo>`. It uses model `eleven_v4` (settings: stability 0.55, similarity 0.75), writes one cached MP3 per line (cache key = hash of text, voice, model, settings, so re-runs cost nothing), converts to 48 kHz mono WAV and writes `durations.json`. It uses `spokenHuman()` from `narration.mjs` (acronyms spelled "M-C-P", "O-Auth"). The reference script costs about 2,100 characters.
4. **Trim silence the safe way.** `silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse`. Do **not** use `stop_periods`: it cuts the line at its first pause (a 140 s narration came out as 72 s).
5. **Pace.** A natural voice is slower. If the total is too long, speed up with `TEMPO=1.12` (`atempo`, pitch preserved) before you shorten text; text changes cost credits.
6. **Build.** `node video/final.mjs --tts-dir video/out/tts-human --name <my_video> --single --reuse-proofs` writes `<my_video>.mp4` and `<my_video>.srt`. It does not touch the other cuts.
7. Listen is not possible for an agent: say so in the report and ask the user to listen once.

## Appendix B: Reference run (so you can sanity-check your numbers)

Project: an MCP server plus a simulated assistant UI. Scenes and lengths (seconds): hook 12.5, boot 5.4, sim 60, inspector 17-22, auth 11, code 15.5, architecture 9, cloud stack 11, honesty 12, close 12.7; total 168-172. Frames per scene 20-1600. Narration 28 lines, 2,100 characters. Full render about 7 minutes on a laptop; final encode with `-preset slow` takes about 2 minutes per cut.

## Appendix C: Command cheat-sheet

```bash
# workspace
robocopy <repo> <scratch>\<copy> /E /XD node_modules .git cdk.out test-results   # Windows
cd <scratch>\<copy> && npm ci
# run the app and look (dry run)
npm run demo            # or the README command, default port
# build the video
node video/final.mjs --rate 2
# check the result (plain `ffmpeg` is usually not installed: use the bundled binary,
# node -e "import('ffmpeg-static').then(m=>console.log(m.default))" prints its path; call it instead of `ffmpeg`)
ffmpeg -i out.mp4                                        # duration, streams
ffmpeg -ss 45.2 -i out.mp4 -frames:v 1 frame.png         # one frame
ffmpeg -i out.mp4 -af volumedetect -f null -             # loudness
# project checks (in the copy)
npm run verify && npm test
```
