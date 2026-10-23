// Checks the account and the chosen voice without generating any speech (no credits spent).
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
const client = new ElevenLabsClient();
const voiceId = process.argv[2];
try {
  const sub = await client.user.subscription.get();
  console.log("plan:", sub.tier, "| characters used", sub.characterCount, "of", sub.characterLimit);
} catch (e) { console.log("subscription:", e.statusCode ?? "", e.message?.slice(0, 160)); }
try {
  const v = await client.voices.get(voiceId);
  console.log("voice:", v.name, "| category:", v.category, "| labels:", JSON.stringify(v.labels ?? {}), "| description:", (v.description ?? "").slice(0, 120));
} catch (e) { console.log("voice lookup:", e.statusCode ?? "", e.message?.slice(0, 200)); }
