# Security

This repo contains documentation and local scripts; it has no server. The scripts launch a browser against your own app and call `ffmpeg`.

- Never put API keys in files you commit. The ElevenLabs renderer reads `ELEVENLABS_API_KEY` from the environment (`node --env-file=.env.local`).
- Report a security concern by opening a private security advisory on GitHub (Security tab) or an issue without sensitive details.
