import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).slice(2, 8);

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    console.error(`[${requestId}] ❌ Method not allowed: ${req.method}`);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, method, body, token } = req.body || {};

  // Логируем входящий запрос (без токена — безопасность)
  console.log(`[${requestId}] ➡️  ${method || "GET"} ${url}`);

  if (!url || typeof url !== "string") {
    console.error(`[${requestId}] ❌ Missing or invalid URL`);
    return res.status(400).json({ error: "Missing or invalid 'url' parameter" });
  }

  if (!token) {
    console.error(`[${requestId}] ❌ No token provided`);
    return res.status(401).json({ error: "WB API Token is required" });
  }

  // Валидация домена
  const allowedDomains = [
    "statistics-api.wildberries.ru",
    "content-api.wildberries.ru",
    "common-api.wildberries.ru",
    "discounts-prices-api.wildberries.ru",
    "advert-api.wildberries.ru",
    "marketplace-api.wildberries.ru",
    "seller-analytics-api.wildberries.ru",
    "supplies-api.wildberries.ru",
    "feedbacks-api.wildberries.ru",
    "returns-api.wildberries.ru",
    "documents-api.wildberries.ru",
  ];

  try {
    const parsedUrl = new URL(url);
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      console.error(`[${requestId}] ❌ Domain blocked: ${parsedUrl.hostname}`);
      return res.status(403).json({ error: `Domain '${parsedUrl.hostname}' is not allowed` });
    }
  } catch {
    console.error(`[${requestId}] ❌ Invalid URL: ${url}`);
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const headers: Record<string, string> = {
      Authorization: token,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      headers["Content-Type"] = "application/json";
    }

    const wbResponse = await fetch(url, {
      method: method || "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const elapsed = Date.now() - startTime;

    // Пробрасываем rate-limit заголовки
    const rlLimit = wbResponse.headers.get("X-Ratelimit-Limit");
    const rlRemaining = wbResponse.headers.get("X-Ratelimit-Remaining");
    const rlRetry = wbResponse.headers.get("X-Ratelimit-Retry");

    if (rlLimit) res.setHeader("X-Ratelimit-Limit", rlLimit);
    if (rlRemaining) res.setHeader("X-Ratelimit-Remaining", rlRemaining);
    if (rlRetry) res.setHeader("X-Ratelimit-Retry", rlRetry);

    // Логируем ответ WB
    const rlInfo = rlRemaining ? ` [RL: ${rlRemaining}/${rlLimit}]` : "";
    if (wbResponse.ok || wbResponse.status === 204) {
      console.log(`[${requestId}] ✅ ${wbResponse.status} (${elapsed}ms)${rlInfo}`);
    } else {
      console.warn(`[${requestId}] ⚠️  ${wbResponse.status} (${elapsed}ms)${rlInfo}`);
    }

    // 204 No Content
    if (wbResponse.status === 204) {
      return res.status(204).end();
    }

    const contentType = wbResponse.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await wbResponse.json();

      // При ошибках логируем тело ответа WB
      if (!wbResponse.ok) {
        console.error(`[${requestId}] 📋 WB response body:`, JSON.stringify(data).slice(0, 500));
      }

      return res.status(wbResponse.status).json(data);
    } else {
      const text = await wbResponse.text();
      if (!wbResponse.ok) {
        console.error(`[${requestId}] 📋 WB response text:`, text.slice(0, 500));
      }
      return res.status(wbResponse.status).send(text);
    }
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[${requestId}] 💥 CRASH (${elapsed}ms):`, error.message || error);
    console.error(`[${requestId}] Stack:`, error.stack || "no stack");
    return res.status(500).json({
      error: "Failed to fetch from Wildberries API",
      details: error.message || "Unknown error",
    });
  }
}
