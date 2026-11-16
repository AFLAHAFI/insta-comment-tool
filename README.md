# ALVIMIO AutoDM

Comment keyword → private reply DM + public comment reply, for your own Instagram account.

- `api/webhook.js` — receives Meta comment webhooks, sends DM + reply
- `rules.js` — per-post keyword / DM / reply settings (edit this for each new post)
- `api/posts.js` — lists your post IDs: `/api/posts?key=ADMIN_KEY`
- `privacy.html` — privacy policy URL needed to set the Meta app to Live

Env vars: see `.env.example`. Logs: Vercel dashboard > Project > Logs.
