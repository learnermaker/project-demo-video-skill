# Distribution and listings

Where this skill is, or can be, listed. Checked 2026-10-23.

## Automatic (nothing to submit)

| Directory | How it lists skills | Status |
|---|---|---|
| [skills.sh](https://skills.sh) | Ranks skills by anonymous install telemetry from the `skills` CLI | Appears after people run `npx skills add learnermaker/project-demo-video-skill` |
| [SkillsMP](https://skillsmp.com) | Aggregates public GitHub repos that contain `SKILL.md` with `name` and `description` | Repo meets the format; indexing is on their schedule |
| [claudemarketplaces.com](https://claudemarketplaces.com) | Crawls marketplaces and plugins, refreshes stars and installs | Repo has `.claude-plugin/marketplace.json` |
| GitHub search | Topics: `agent-skills`, `skill-md`, `claude-code`, `codex`, `cursor`, `demo-video`, `hackathon` and more | Done |

## Curated lists (submit by hand when you qualify)

| List | Requirement | Entry to paste |
|---|---|---|
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | at least 10 GitHub stars; the pull request must not be AI-generated or AI-submitted; skill must have more than one file (this one does) | `- **[project-demo-video-skill](https://github.com/learnermaker/project-demo-video-skill)** - Makes narrated, captioned 1080p demo videos of any project with Playwright and ffmpeg` |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | real community usage; brand-new skills are declined; description 10 words or fewer; PR title `Add skill: author/skill-name` | `- **[learnermaker/project-demo-video](https://github.com/learnermaker/project-demo-video-skill/tree/main/skills/project-demo-video)** - Narrated, captioned demo videos for any project` |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | adds a skill folder with `SKILL.md` to their repo; needs a real use case, examples, tested | open their `CONTRIBUTING.md` and follow the PR steps |

Official plugin directory submissions (Anthropic) go through their web form, which must be filled in by a person.

## How to grow installs

Share the demo video, post the one-line install (`npx skills add learnermaker/project-demo-video-skill`), and ask agents' users for bug reports through issues or Discussions.
