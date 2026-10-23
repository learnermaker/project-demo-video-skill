# AGENTS.md

This repository publishes one Agent Skill: **project-demo-video** (`skills/project-demo-video/SKILL.md`).

## If you were asked to make a demo video for a project

1. Read `skills/project-demo-video/SKILL.md` completely, then follow its phases in order.
2. Copy `skills/project-demo-video/templates/` into the target project's working copy as `video/`.
3. Never write to the user's original repository; work in a copy.
4. Never print or store an API key. ElevenLabs is optional (Appendix A of the skill).

## If you were asked to change this repository

- The skill lives only in `skills/project-demo-video/`. Keep `SKILL.md` frontmatter valid (`name` equals the folder name, lowercase letters, digits and hyphens; `description` under 1024 characters).
- Templates are plain JavaScript `.mjs` (no TypeScript syntax) and add no npm dependencies of their own.
- Before committing run `node scripts/validate.mjs`. It checks frontmatter, JavaScript syntax, manifest JSON, version consistency and secret patterns.
- Keep versions in sync: `SKILL.md` metadata, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `CHANGELOG.md`.
- Do not add the name of any AI coding tool to template output text that ends up on a video.

## Layout

```
skills/project-demo-video/{SKILL.md,templates/}
scripts/validate.mjs
.claude-plugin/{plugin.json,marketplace.json}
```
