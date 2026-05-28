import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "POST") {
      const response = req.body;
      response.ts = new Date().toISOString();
      await kv.lpush("gojuice:responses", JSON.stringify(response));
      return res.status(200).json({ ok: true });
    }

    if (req.method === "GET") {
      const raw = await kv.lrange("gojuice:responses", 0, -1);
      const responses = raw.map(r => typeof r === "string" ? JSON.parse(r) : r);
      return res.status(200).json({ responses });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Storage not connected yet" });
  }
}
