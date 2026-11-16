// One rule per post. Find post IDs at /api/posts?key=ADMIN_KEY
// media: post ID, or "*" for every post (put "*" rules last).
// keywords: comment must contain one of these (case-insensitive). [] = any comment.
// reply: public comment reply. Several options = random pick (looks less like spam).

export const rules = [
  {
    media: "PASTE_POST_ID_HERE",
    keywords: ["SKILL"],
    dm: "Hi 👋 SKILL guide ഇതാ: https://example.com/skill",
    reply: ["DM അയച്ചിട്ടുണ്ട് 📩", "Inbox check ചെയ്യൂ 📩", "Sent! DM നോക്കൂ ✅"],
  },
  {
    media: "*",
    keywords: ["INFO"],
    dm: "ALVIMIO details: https://example.com",
    reply: ["DM അയച്ചിട്ടുണ്ട് 📩"],
  },
];
