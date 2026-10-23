// node scripts/validate.mjs: checks the skill, templates and manifests. Exits 1 with a list of problems.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const problems = [];
const bad = (m) => problems.push(m);
const files = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? (n === "node_modules" || n === ".git" ? [] : files(p)) : [p];
});

// 1. every skills/<name>/SKILL.md has valid frontmatter, and name equals the folder
const skillsDir = join(root, "skills");
const versions = new Set();
for (const name of readdirSync(skillsDir)) {
  const md = join(skillsDir, name, "SKILL.md");
  if (!existsSync(md)) { bad(`skills/${name}: missing SKILL.md`); continue; }
  const text = readFileSync(md, "utf8");
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) { bad(`${name}: no frontmatter`); continue; }
  const fm = m[1];
  const field = (k) => new RegExp(`^${k}:\\s*(.+)$`, "m").exec(fm)?.[1]?.trim();
  if (field("name") !== name) bad(`${name}: frontmatter name "${field("name")}" must equal the folder name`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64) bad(`${name}: name must be lowercase letters, digits, hyphens, max 64`);
  const d = field("description") ?? "";
  if (d.length < 40 || d.length > 1024) bad(`${name}: description length ${d.length} must be 40-1024`);
  const v = /version:\s*"?([\d.]+)"?/.exec(fm)?.[1];
  if (v) versions.add(v);
  if (!/^# /m.test(text.slice(m[0].length))) bad(`${name}: SKILL.md has no top-level heading`);
}

// 2. manifests parse and agree on the version
for (const f of [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json"]) {
  try {
    const j = JSON.parse(readFileSync(join(root, f), "utf8"));
    const v = j.version ?? j.plugins?.[0]?.version;
    if (v) versions.add(v);
  } catch (e) { bad(`${f}: ${e.message}`); }
}
if (versions.size > 1) bad(`versions disagree: ${[...versions].join(", ")}`);

// 3. templates: JavaScript syntax, and no secrets
const secret = [/sk_[a-z0-9]{20,}/i, /AKIA[0-9A-Z]{16}/, /gh[pousr]_[A-Za-z0-9]{30,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /ELEVENLABS_API_KEY\s*=\s*\S+/];
for (const f of files(root)) {
  const rel = relative(root, f).replace(/\\/g, "/");
  if (f === fileURLToPath(import.meta.url)) continue;
  if (/\.(mp4|mp3|wav|png|jpg)$/i.test(f)) continue;
  const text = readFileSync(f, "utf8");
  for (const re of secret) if (re.test(text)) bad(`${rel}: looks like a secret (${re})`);
  if (rel.endsWith(".mjs") && rel.startsWith("skills/")) {
    const r = spawnSync(process.execPath, ["--check", f], { encoding: "utf8" });
    if (r.status !== 0) bad(`${rel}: ${r.stderr.split("\n").find((l) => l.includes("Error")) ?? "syntax error"}`);
  }
}

if (problems.length) {
  console.error(`validate: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`validate: ok (skills: ${readdirSync(skillsDir).join(", ")}; version ${[...versions].join(",") || "n/a"})`);
