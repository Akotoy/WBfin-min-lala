import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for browser requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, method, body, token } = req.body || {};

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' parameter" });
  }

  if (!token) {
    return res.status(401).json({ error: "WB API Token is required" });
  }

  // Валидация: разрешаем только запросы к доменам WB
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
      return res.status(403).json({ error: `Domain '${parsedUrl.hostname}' is not allowed` });
    }
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const headers: Record<string, string> = {
      Authorization: token,
    };

    // Content-Type только для запросов с телом
    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: method || "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Пробрасываем rate-limit заголовки от WB обратно клиенту
    const rateLimitHeaders = [
      "X-Ratelimit-Limit",
      "X-Ratelimit-Remaining",
      "X-Ratelimit-Retry",
    ];
    for (const header of rateLimitHeaders) {
      const value = response.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    }

    // 204 No Content — пустой ответ (конец пагинации)
    if (response.status === 204) {
      return res.status(204).end();
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (error: any) {
    console.error("[wb-proxy] Error:", error.message || error);
    return res.status(500).json({
      error: "Failed to fetch from Wildberries API",
      details: error.message || "Unknown error",
    });
  }
}
