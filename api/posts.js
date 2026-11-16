// Lists your recent posts with their IDs, so you can fill rules.js.
// Open: https://YOUR-APP.vercel.app/api/posts?key=ADMIN_KEY
const V = process.env.GRAPH_VERSION || "v26.0";

export async function GET(request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return new Response("Forbidden", { status: 403 });
  }
  const url = `https://graph.instagram.com/${V}/me/media?fields=id,caption,permalink,timestamp&limit=25`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.IG_ACCESS_TOKEN}` } });
  const data = await res.json();
  const list = (data.data || []).map((m) => ({
    id: m.id,
    date: m.timestamp?.slice(0, 10),
    caption: (m.caption || "").slice(0, 60),
    link: m.permalink,
  }));
  return Response.json(data.error ? data : list, { status: res.status });
}
