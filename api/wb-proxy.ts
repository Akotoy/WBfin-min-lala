import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, method, body, token } = req.body || {};

  if (!token) {
    return res.status(401).json({ error: "WB API Token is required" });
  }

  try {
    const response = await fetch(url, {
      method: method || "GET",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error("WB Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch from Wildberries API" });
  }
}
