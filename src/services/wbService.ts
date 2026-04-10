import { WBProduct, WBSale, WBOrder } from "../types";

const API_BASE = "/api/wb-proxy";

export async function fetchFromWB(url: string, token: string, method = "GET", body?: any) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, method, body, token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch from Wildberries");
  }

  return response.json();
}

export async function getProducts(token: string): Promise<WBProduct[]> {
  // WB Content API for products
  const data = await fetchFromWB("https://content-api.wildberries.ru/content/v2/get/cards/list", token, "POST", {
    settings: {
      cursor: { limit: 100 },
      filter: { withPhoto: -1 }
    }
  });
  
  // This is a simplified mapping, real API returns more complex structure
  return data.cards?.map((card: any) => ({
    nmId: card.nmID,
    vendorCode: card.vendorCode,
    title: card.title || "No Title",
    price: card.sizes?.[0]?.price || 0,
    discount: card.sizes?.[0]?.discount || 0,
    stock: 0, // Stock needs another API call
    category: card.subjectName
  })) || [];
}

export async function getSales(token: string, dateFrom: string): Promise<WBSale[]> {
  return fetchFromWB(`https://statistics-api.wildberries.ru/statistics/v1/supplier/sales?dateFrom=${dateFrom}`, token);
}

export async function getOrders(token: string, dateFrom: string): Promise<WBOrder[]> {
  return fetchFromWB(`https://statistics-api.wildberries.ru/statistics/v1/supplier/orders?dateFrom=${dateFrom}`, token);
}

export async function getStocks(token: string): Promise<any[]> {
  return fetchFromWB(`https://statistics-api.wildberries.ru/statistics/v1/supplier/stocks?dateFrom=2024-01-01`, token);
}

export async function getReportDetailByPeriod(token: string, dateFrom: string, dateTo: string): Promise<any[]> {
  return fetchFromWB(`https://statistics-api.wildberries.ru/statistics/v1/supplier/reportDetailByPeriod?dateFrom=${dateFrom}&dateTo=${dateTo}`, token);
}

export async function updatePrice(token: string, nmId: number, price: number): Promise<void> {
  await fetchFromWB("https://content-api.wildberries.ru/content/v2/get/cards/list", token, "POST", {
    // This is a placeholder. Real WB API for price update is different:
    // https://common-api.wildberries.ru/api/v1/prices
  });
  // Real implementation for price update:
  await fetchFromWB("https://common-api.wildberries.ru/api/v1/prices", token, "POST", [
    { nmId, price }
  ]);
}
