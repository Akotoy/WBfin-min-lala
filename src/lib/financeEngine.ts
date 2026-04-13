import { WBReportDetail, FinancialReportRow, WBProduct } from "../types";

export function calculateFinancialReport(
  reports: WBReportDetail[],
  products: WBProduct[],
  cogs: Record<number, number>,
  taxRate: number
): FinancialReportRow[] {
  const rowMap = new Map<number, FinancialReportRow>();

  // Initialize rows from products
  products.forEach(p => {
    rowMap.set(p.nmId, {
      nmId: p.nmId,
      title: p.title,
      vendorCode: p.vendorCode,
      salesCount: 0,
      revenue: 0,
      revenueAfterCommission: 0,
      commissionRub: 0,
      commissionPercent: 0,
      returnsCount: 0,
      returnsRub: 0,
      logisticsCount: 0,
      logisticsRub: 0,
      penalties: 0,
      ads: 0, // TODO: from ads API
      storage: 0, // TODO: from storage API
      acceptance: 0, // TODO: from acceptance API
      forPay: 0,
      taxPercent: taxRate,
      taxRub: 0,
      stock: p.stock,
      cogsUnit: cogs[p.nmId] || 0,
      cogsTotal: 0,
      netProfit: 0,
      roi: 0,
      details: { sales: [], returns: [], logistics: [], penalties: [] }
    });
  });

  // Process reports
  reports.forEach(r => {
    if (!rowMap.has(r.nm_id)) {
      rowMap.set(r.nm_id, {
        nmId: r.nm_id,
        title: r.sa_name || "Неизвестно",
        vendorCode: r.sa_name || "Неизвестно",
        salesCount: 0,
        revenue: 0,
        revenueAfterCommission: 0,
        commissionRub: 0,
        commissionPercent: 0,
        returnsCount: 0,
        returnsRub: 0,
        logisticsCount: 0,
        logisticsRub: 0,
        penalties: 0,
        ads: 0,
        storage: 0,
        acceptance: 0,
        forPay: 0,
        taxPercent: taxRate,
        taxRub: 0,
        stock: 0,
        cogsUnit: cogs[r.nm_id] || 0,
        cogsTotal: 0,
        netProfit: 0,
        roi: 0,
        details: { sales: [], returns: [], logistics: [], penalties: [] }
      });
    }
    const row = rowMap.get(r.nm_id)!;

    // Продажа
    if (r.supplier_oper_name === "Продажа") {
      row.salesCount += r.quantity;
      row.revenue += r.retail_amount; // D: выручка до комиссии
      row.revenueAfterCommission += Math.abs(r.ppvz_for_pay || 0); // E: продажи с вычетом комиссии
      row.details.sales.push({ date: r.sale_dt || r.rr_dt, quantity: r.quantity, amount: r.retail_amount, forPay: r.ppvz_for_pay });
    }

    // Возврат
    if (r.supplier_oper_name === "Возврат") {
      row.returnsCount += r.quantity; // H: возвраты шт
      row.returnsRub += Math.abs(r.ppvz_for_pay || 0); // I: возвраты руб
      row.details.returns.push({ date: r.sale_dt || r.rr_dt, quantity: r.quantity, amount: r.retail_amount, forPay: r.ppvz_for_pay });
    }

    // Логистика
    if (r.delivery_rub !== 0) {
      row.logisticsCount += 1;
      row.logisticsRub += Math.abs(r.delivery_rub || 0); // K: логистика руб
      row.details.logistics.push({ date: r.order_dt || r.rr_dt, amount: r.delivery_rub });
    }

    // Штрафы и доплаты
    const penaltySum = (r.penalty || 0) - (r.additional_payment || 0); // L: штрафы
    row.penalties += penaltySum;
    if (penaltySum !== 0) {
      row.details.penalties.push({ date: r.rr_dt, amount: penaltySum, description: r.doc_type_name || "Штраф/Доплата" });
    }
  });

  // Завершающие расчеты по формулам юзерской таблицы
  const result = Array.from(rowMap.values());
  result.forEach(row => {
    // E (продажи с вычетом комиссии) уже подсчитан как сумма ppvz_for_pay по операциям "Продажа"
    
    // F: комиссия руб = D - E
    row.commissionRub = row.revenue - row.revenueAfterCommission;
    
    // G: комиссия % = F / D
    row.commissionPercent = row.revenue > 0 ? (row.commissionRub / row.revenue) * 100 : 0;
    
    // P: от ВБ = E - I - K - L - M - N - O
    row.forPay = row.revenueAfterCommission - row.returnsRub - row.logisticsRub - row.penalties - row.ads - row.storage - row.acceptance;
    
    // R: налог руб = D * Q
    row.taxRub = row.revenue * (row.taxPercent / 100);
    
    // S: остаток (после налога) = P - R
    const remainingAfterTb = row.forPay - row.taxRub;
    
    // U: общая себестоимость = (C - H) * T
    row.cogsTotal = (row.salesCount - row.returnsCount) * row.cogsUnit;
    
    // V: Чистая прибыль = S - U
    row.netProfit = remainingAfterTb - row.cogsTotal;
    
    // W: рентабельность = V / D
    row.roi = row.revenue > 0 ? (row.netProfit / row.revenue) * 100 : 0;
  });

  return result;
}
