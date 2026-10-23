# project-demo-video: an Agent Skill that makes demo videos

[![validate](https://github.com/learnermaker/project-demo-video-skill/actions/workflows/validate.yml/badge.svg)](https://github.com/learnermaker/project-demo-video-skill/actions/workflows/validate.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![agent skill](https://img.shields.io/badge/Agent%20Skill-SKILL.md-37cdbe)

Give any coding agent this skill and it can produce a **narrated, captioned 1080p demo video of 3 minutes or less** for your project, hackathon entry or product. The video is built **as code** with Playwright and ffmpeg, so you can re-render it in minutes after any change.

Everything on screen is real: your app running, real command output replayed in a terminal, real source code excerpts, and diagrams. Nothing is a mock-up, and anything simulated is labelled as simulated.

Works with **Claude Code, Codex CLI, Cursor, Gemini CLI, GitHub Copilot, Windsurf and any agent that reads `SKILL.md` or `AGENTS.md`**.

> Extracted from a real hackathon submission. Example output: [the THREAD demo video](https://www.youtube.com/watch?v=SVKYPkIxvBg) (2:48, 1080p, voiced, captioned).

## What the agent will do

1. Read the contest rules and map every claim a judge must believe to a scene.
2. Work in a **copy** of your repo (never touching the original) and run the app the way a judge would.
3. Find and fix real bugs the video would expose, in the copy, and list them for you to copy back.
4. Write a narration script and a storyboard that fit the time limit.
5. Capture real proof output (official client or CLI, auth checks, boot output).
6. Record every scene at 1920x1080 / 30 fps, with a visible cursor, zooms and a live "last request" strip.
7. Make speech (Windows built-in voice by default; **ElevenLabs is optional**) and burn in captions.
8. Deliver two cuts (with voice, and captions-only), `.srt`, thumbnail, shot list, QA frames and a report.

## Install

Pick one. All methods install the same folder: [`skills/project-demo-video/`](skills/project-demo-video/).

```bash
# Any agent (Vercel "skills" CLI): installs for the agents you choose
npx skills add learnermaker/project-demo-video-skill
```

```text
# Claude Code plugin marketplace
/plugin marketplace add learnermaker/project-demo-video-skill
/plugin install project-demo-video@demo-video-skills
```

```bash
# Manual copy (personal skills; use your agent's skills folder)
git clone https://github.com/learnermaker/project-demo-video-skill.git
cp -r project-demo-video-skill/skills/project-demo-video ~/.claude/skills/        # Claude Code
cp -r project-demo-video-skill/skills/project-demo-video ~/.codex/skills/         # Codex CLI
cp -r project-demo-video-skill/skills/project-demo-video <your-project>/.cursor/skills/   # Cursor (project)
```

No skills folder? Open your project with the agent and say: *"Read `skills/project-demo-video/SKILL.md` from https://github.com/learnermaker/project-demo-video-skill and follow it to make a demo video of this project."*

## Use it

Ask your agent, in plain words:

> Make a demo video (under 3 minutes) of this project for our hackathon submission. Use the project-demo-video skill. Work in a copy, don't change the repo.

Optional extras you can ask for: *"use ElevenLabs voice <id>"*, *"captions only"*, *"also give me a thumbnail"*.

## Requirements

- Node.js 22 or newer.
- In the project copy: `@playwright/test` with Chromium, and `ffmpeg-static` (the skill explains how to add them without changing your repo's dependencies).
- Speech: the built-in templates use Windows `System.Speech`. macOS and Linux need a small adaptation of one file (`lib/tts.mjs`), described in the skill.
- ElevenLabs (optional): an account and API key. The free plan works with the built-in premade voices only (see Appendix A in the skill).

## What is inside

```
skills/project-demo-video/
  SKILL.md                 the skill: rules, 10 phases with "done when" checks, pitfalls, QA checklist
  templates/               a working pipeline to copy into the project
    final.mjs              orchestrator: speech, proofs, record all scenes, assemble both cuts
    narration.mjs          the script (one line = one spoken line = one caption)
    lib/                   recorder (screencast), director (timing), overlay (cursor, camera), tts
    pages/                 title, terminal, code tour, architecture and closing cards
    scenes/                scene recorders (app, terminal, code, diagrams)
    proofs.mjs, proof-auth.mjs   capture real command output
    docs.mjs, thumbnail.mjs      narration.md, shotlist.md, thumbnail
    elevenlabs/            optional human-voice renderer
scripts/validate.mjs       checks the skill and manifests (also runs in CI)
.claude-plugin/            Claude Code plugin and marketplace manifests
AGENTS.md  llms.txt        guidance for agents and LLM crawlers
```

## Design principles

- **Honest by construction.** Simulated parts are labelled; real output is replayed, never typed by hand.
- **Narration sets the pace.** Every spoken line is a segment; audio is placed at the moments the picture recorded, so voice and picture cannot drift.
- **Fail loudly.** The build refuses a video that is 3:00 or longer.
- **Safe by default.** Work on a copy, never print keys, free tier only, no deploys.
- **Weak-agent friendly.** Small steps, copy-paste templates, a pitfalls table from a real build.

## Contributing

Issues and pull requests are welcome, especially macOS/Linux speech adapters and new scene templates. See [CONTRIBUTING.md](CONTRIBUTING.md). Run `node scripts/validate.mjs` before you open a PR.

## License

[MIT](LICENSE)

<sub>Keywords: agent skill, SKILL.md, AGENTS.md, Claude Code skill, Codex skill, Cursor skill, demo video generator, hackathon submission video, Playwright screen recording, ffmpeg captions, text to speech, ElevenLabs, MCP server demo.</sub>
