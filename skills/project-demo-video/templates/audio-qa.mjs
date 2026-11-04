// Analyze the final narration mix with FFmpeg's EBU R128 loudness meter.
// Usage: node video/audio-qa.mjs <video-or-audio-file>
// This is measurement only: it never rewrites or normalizes the supplied media.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const input = process.argv[2];
if (!input || process.argv.length > 3 || input.startsWith("--")) {
  console.error("Usage: node video/audio-qa.mjs <video-or-audio-file>");
  process.exit(2);
}
const file = resolve(input);
if (!existsSync(file)) {
  console.error(`audio QA: file not found: ${file}`);
  process.exit(2);
}
if (!ffmpegPath) {
  console.error("audio QA: ffmpeg-static did not provide an executable path");
  process.exit(2);
}

const args = [
  "-hide_banner", "-nostats", "-i", file,
  "-vn",
  "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
  "-f", "null", "-"
];
const run = spawnSync(ffmpegPath, args, { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
if (run.error) throw run.error;
const stderr = run.stderr ?? "";
if (run.status !== 0) {
  console.error(stderr.split("\n").slice(-18).join("\n"));
  process.exit(run.status ?? 1);
}

const blocks = [...stderr.matchAll(/\{\s*"input_i"[\s\S]*?\}/g)];
if (!blocks.length) {
  console.error("audio QA: FFmpeg completed but did not return loudnorm measurement JSON.");
  console.error(stderr.split("\n").slice(-18).join("\n"));
  process.exit(1);
}
const metrics = JSON.parse(blocks.at(-1)[0]);
const number = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};
const measured = {
  integrated_loudness_lufs: number(metrics.input_i),
  true_peak_dbtp: number(metrics.input_tp),
  loudness_range_lu: number(metrics.input_lra),
  threshold_lufs: number(metrics.input_thresh),
  target: { integrated_loudness_lufs: -16, true_peak_dbtp: -1.5, loudness_range_lu: 11 }
};
const warnings = [];
if (measured.integrated_loudness_lufs === null) warnings.push("Integrated loudness could not be measured (the audio may be silent).");
else if (measured.integrated_loudness_lufs < -19 || measured.integrated_loudness_lufs > -13) warnings.push("Integrated loudness is outside the suggested -19 to -13 LUFS review range.");
if (measured.true_peak_dbtp === null) warnings.push("True peak could not be measured.");
else if (measured.true_peak_dbtp > -1) warnings.push("True peak exceeds -1 dBTP; check for clipping risk.");
if (measured.loudness_range_lu !== null && measured.loudness_range_lu > 15) warnings.push("Loudness range is high; check speech consistency on ordinary speakers.");

console.log(JSON.stringify({ file, measured, warnings }, null, 2));
if (warnings.length) process.exitCode = 1;
