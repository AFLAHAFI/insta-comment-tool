import crypto from "node:crypto";
import { rules } from "../rules.js";

const V = process.env.GRAPH_VERSION || "v26.0";
const API = `https://graph.instagram.com/${V}`;

// Meta calls GET once to verify the webhook URL.
export async function GET(request) {
  const p = new URL(request.url).searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.VERIFY_TOKEN) {
    return new Response(p.get("hub.challenge"), { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// Meta calls POST for every new comment.
export async function POST(request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new Response("Bad signature", { status: 401 });
  }

  const body = JSON.parse(raw);
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "comments") continue;
      try {
        await handleComment(change.value);
      } catch (err) {
        console.error("handleComment failed:", err.message);
      }
    }
  }
  return new Response("EVENT_RECEIVED", { status: 200 });
}

async function handleComment(c) {
  // Skip our own replies, or the bot replies to itself forever.
  if (!c?.id || c.from?.id === process.env.IG_USER_ID) return;

  const rule = findRule(c.media?.id, c.text || "");
  if (!rule) return;

  console.log(`Match: @${c.from?.username} "${c.text}" on ${c.media?.id}`);

  // 1. Private reply DM (Meta allows one per comment, within 7 days).
  await ig(`/${process.env.IG_USER_ID}/messages`, {
    recipient: { comment_id: c.id },
    message: { text: rule.dm },
  });

  // 2. Public reply on the comment.
  const replies = [].concat(rule.reply || []);
  if (replies.length) {
    const text = replies[Math.floor(Math.random() * replies.length)];
    await ig(`/${c.id}/replies`, { message: text });
  }
}

function findRule(mediaId, text) {
  const t = text.toUpperCase();
  const hit = (r) => !r.keywords?.length || r.keywords.some((k) => t.includes(k.toUpperCase()));
  return (
    rules.find((r) => r.media === mediaId && hit(r)) ||
    rules.find((r) => r.media === "*" && hit(r))
  );
}

async function ig(path, payload) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.IG_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path}: ${JSON.stringify(data.error || data)}`);
  return data;
}

function validSignature(raw, header) {
  if (!header || !process.env.APP_SECRET) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", process.env.APP_SECRET).update(raw).digest("hex");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
