# Contributing

Thanks for helping. This repo is small on purpose: one skill, one set of templates.

## Good first contributions

- A macOS (`say`) or Linux (`espeak-ng`, Piper) speech adapter for `templates/lib/tts.mjs`.
- New scene templates (mobile app, CLI-only project, data dashboard).
- Fixes to the pitfalls table in `SKILL.md` with the symptom, the cause and the fix.
- Better steps for agents that struggled: tell us where yours got stuck (open an issue).

## Rules

1. Run `node scripts/validate.mjs` before every pull request. It must print `validate: ok`.
2. Templates are plain JavaScript `.mjs` (no TypeScript syntax) and add no npm dependencies.
3. Keep `SKILL.md` clear for weaker agents: numbered steps, a "Done when" check for each phase, commands that can be copied.
4. Never commit keys, tokens, `.env` files, recorded media or personal paths.
5. Bump the version in `SKILL.md` metadata, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `CHANGELOG.md` together for user-visible changes.

## Pull request checklist

- [ ] `node scripts/validate.mjs` passes
- [ ] I tried the change on a real project, or explain why not
- [ ] CHANGELOG updated
