// Renders every narration line with ElevenLabs (eleven_v4) and writes 48 kHz WAVs + durations.json for the video pipeline.
// Each line is cached by a hash of (text, voice, model, settings), so re-running never spends credits twice.
// Usage (from the folder holding .env.local and node_modules/@elevenlabs/elevenlabs-js):
//   node --env-file=.env.local render-narration.mjs <voiceId> <outDir> <repo>
// Optional: TEMPO=1.12 (pitch-preserving speed-up so the narration fits the time limit).
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// <repo> is the project copy that holds video/ (the pipeline) and node_modules/ (ffmpeg-static)
const [voiceId, outDir, repo] = process.argv.slice(2);
const alexa = repo;
const { scenes, spokenHuman } = await import(pathToFileURL(`${alexa}/video/narration.mjs`).href);
const { default: ffmpeg } = await import(pathToFileURL(`${alexa}/node_modules/ffmpeg-static/index.js`).href);
const { wavSeconds } = await import(pathToFileURL(`${alexa}/video/lib/tts.mjs`).href);

const MODEL = "eleven_v4", SETTINGS = { stability: 0.55, similarityBoost: 0.75 };
mkdirSync(outDir, { recursive: true });
const cache = `${outDir}/mp3`; mkdirSync(cache, { recursive: true });
const client = new ElevenLabsClient();
const segs = scenes.flatMap((s) => s.segs);
let chars = 0;
for (const [i, g] of segs.entries()) {
  const text = spokenHuman(g);
  const key = createHash("sha1").update(JSON.stringify([text, voiceId, MODEL, SETTINGS])).digest("hex").slice(0, 12);
  const mp3 = `${cache}/${g.id}.${key}.mp3`;
  if (!existsSync(mp3)) {
    const audio = await client.textToSpeech.convert(voiceId, { text, modelId: MODEL, outputFormat: "mp3_44100_128", voiceSettings: SETTINGS, applyTextNormalization: "on" });
    writeFileSync(mp3, Buffer.from(await new Response(audio).arrayBuffer()));
    chars += text.length;
    console.log(`rendered ${g.id} (${text.length} chars)`);
  }
  // 48 kHz mono WAV, leading/trailing silence trimmed so the pacing matches the picture
  const r = spawnSync(ffmpeg, ["-y", "-i", mp3, "-af", `silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,atempo=${process.env.TEMPO ?? "1.12"},aresample=48000`, "-ac", "1", `${outDir}/${g.id}.wav`], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`convert ${g.id}: ${r.stderr.slice(-300)}`);
}
const durations = Object.fromEntries(segs.map((g) => [g.id, Number(wavSeconds(`${outDir}/${g.id}.wav`).toFixed(3))]));
writeFileSync(`${outDir}/durations.json`, JSON.stringify(durations, null, 2));
console.log(`characters spent this run: ${chars}; speech total ${Object.values(durations).reduce((a, b) => a + b, 0).toFixed(1)} s`);
