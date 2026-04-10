import { WBProduct, WBSale, WBOrder, WBReportDetail } from "../types";

// ─── Конфигурация ───────────────────────────────────────────────
const API_BASE = "/api/wb-proxy";

// Домены WB API (актуальные на 2026)
const WB = {
  statistics: "https://statistics-api.wildberries.ru",
  content:    "https://content-api.wildberries.ru",
  prices:     "https://discounts-prices-api.wildberries.ru",
  common:     "https://common-api.wildberries.ru",
  analytics:  "https://seller-analytics-api.wildberries.ru",
} as const;

// ─── Базовый транспорт с retry-логикой ─────────────────────────
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export async function fetchFromWB(
  url: string,
  token: string,
  method = "GET",
  body?: unknown
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, method, body, token }),
    });

    // 429 Too Many Requests → ждём и повторяем
    if (response.status === 429) {
      const retryAfter = response.headers.get("X-Ratelimit-Retry");
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      console.warn(`[WB] Rate limit hit, retrying in ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(waitMs);
      continue;
    }

    // 204 No Content → пустой ответ (конец пагинации)
    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      let errorMsg = `WB API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch {
        // не удалось распарсить ответ — используем общее сообщение
      }
      lastError = new Error(errorMsg);

      // 401/403 — повторять бесполезно
      if (response.status === 401 || response.status === 403) {
        throw lastError;
      }

      // Другие ошибки — retry с backoff
      await sleep(INITIAL_BACKOFF_MS * Math.pow(2, attempt));
      continue;
    }

    return response.json();
  }

  throw lastError || new Error("Failed to fetch from Wildberries after retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Сборка списка товаров из данных статистики ────────────────
// Не требует Content-токена. Собираем уникальные товары из продаж,
// финотчётов и остатков.
export function buildProductsFromData(
  sales: WBSale[],
  reports: WBReportDetail[],
  stocks: any[]
): WBProduct[] {
  const productMap = new Map<number, WBProduct>();

  // Из продаж
  for (const s of sales) {
    if (!s.nmId || productMap.has(s.nmId)) continue;
    productMap.set(s.nmId, {
      nmId: s.nmId,
      vendorCode: s.supplierArticle || "",
      title: [s.brand, s.subject, s.supplierArticle].filter(Boolean).join(" / ") || "Без названия",
      price: s.totalPrice || s.finishedPrice || 0,
      discount: s.discountPercent || 0,
      stock: 0,
      category: s.category || s.subject || "",
    });
  }

  // Из финотчётов (может содержать товары которые не было в продажах за 30 дней)
  for (const r of reports) {
    if (!r.nm_id || productMap.has(r.nm_id)) continue;
    productMap.set(r.nm_id, {
      nmId: r.nm_id,
      vendorCode: r.sa_name || "",
      title: [r.brand_name, r.subject_name, r.sa_name].filter(Boolean).join(" / ") || "Без названия",
      price: r.retail_price || 0,
      discount: r.sale_percent || 0,
      stock: 0,
      category: r.subject_name || "",
    });
  }

  // Мержим остатки
  for (const st of stocks) {
    const nmId = st.nmId;
    if (!nmId) continue;
    const existing = productMap.get(nmId);
    if (existing) {
      existing.stock += (st.quantity || 0);
    } else {
      productMap.set(nmId, {
        nmId,
        vendorCode: st.supplierArticle || "",
        title: [st.brand, st.subject, st.supplierArticle].filter(Boolean).join(" / ") || "Без названия",
        price: st.Price || 0,
        discount: st.Discount || 0,
        stock: st.quantity || 0,
        category: st.category || st.subject || "",
      });
    }
  }

  return Array.from(productMap.values());
}

// ─── Продажи (Statistics API) ──────────────────────────────────
export async function getSales(token: string, dateFrom: string): Promise<WBSale[]> {
  return (
    (await fetchFromWB(
      `${WB.statistics}/api/v1/supplier/sales?dateFrom=${dateFrom}`,
      token
    )) || []
  );
}

// ─── Заказы (Statistics API) ───────────────────────────────────
export async function getOrders(token: string, dateFrom: string): Promise<WBOrder[]> {
  return (
    (await fetchFromWB(
      `${WB.statistics}/api/v1/supplier/orders?dateFrom=${dateFrom}`,
      token
    )) || []
  );
}

// ─── Остатки на складах (Statistics API) ───────────────────────
// ⚠️ Endpoint /api/v1/supplier/stocks будет отключён 23.06.2026
// TODO: Мигрировать на POST /api/analytics/v1/stocks-report/wb-warehouses
export async function getStocks(token: string): Promise<any[]> {
  return (
    (await fetchFromWB(
      `${WB.statistics}/api/v1/supplier/stocks?dateFrom=2019-01-01`,
      token
    )) || []
  );
}

// ─── Финансовый отчёт с ПОЛНОЙ пагинацией (Statistics API) ─────
// Endpoint использует rrdid для пагинации.
// Запрашиваем порциями, пока API не вернёт 204 (No Content) или пустой ответ.
export async function getReportDetailByPeriod(
  token: string,
  dateFrom: string,
  dateTo: string
): Promise<WBReportDetail[]> {
  const allRecords: WBReportDetail[] = [];
  let rrdid = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${WB.statistics}/api/v5/supplier/reportDetailByPeriod?dateFrom=${dateFrom}&dateTo=${dateTo}&rrdid=${rrdid}&limit=100000`;

    const data = await fetchFromWB(url, token);

    // 204 или null → конец данных
    if (!data || (Array.isArray(data) && data.length === 0)) {
      hasMore = false;
      break;
    }

    const records: WBReportDetail[] = Array.isArray(data) ? data : [];
    allRecords.push(...records);

    if (records.length === 0) {
      hasMore = false;
    } else {
      // Берём rrd_id последней записи для следующей страницы
      rrdid = records[records.length - 1].rrd_id;
    }
  }

  return allRecords;
}

// ─── Обновление цены (Prices API) ─────────────────────────────
export async function updatePrice(
  token: string,
  nmId: number,
  price: number
): Promise<void> {
  await fetchFromWB(
    `${WB.prices}/api/v2/upload/task`,
    token,
    "POST",
    {
      data: [{ nmID: nmId, price }],
    }
  );
}
