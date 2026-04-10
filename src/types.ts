export interface WBProduct {
  nmId: number;
  vendorCode: string;
  title: string;
  price: number;
  discount: number;
  stock: number;
  category: string;
}

export interface WBSale {
  date: string;
  lastChangeDate: string;
  warehouseName: string;
  countryName: string;
  regionName: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  category: string;
  subject: string;
  brand: string;
  techSize: string;
  incomeID: number;
  isSupply: boolean;
  isRealization: boolean;
  totalPrice: number;
  discountPercent: number;
  spp: number;
  paymentSaleAmount: number;
  forPay: number;
  finishedPrice: number;
  priceWithDisc: number;
  saleID: string;
  orderType: string;
  sticker: string;
  gNumber: string;
  srid: string;
}

export interface WBOrder {
  date: string;
  lastChangeDate: string;
  warehouseName: string;
  countryName: string;
  regionName: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  category: string;
  subject: string;
  brand: string;
  techSize: string;
  incomeID: number;
  isSupply: boolean;
  isRealization: boolean;
  totalPrice: number;
  discountPercent: number;
  spp: number;
  finishedPrice: number;
  priceWithDisc: number;
  orderID: string;
  orderType: string;
  sticker: string;
  gNumber: string;
  srid: string;
}

export interface WBSettings {
  tokens: {
    standard: string;
    statistics: string;
    ads: string;
  };
  taxRate: number;
}

export interface WBReportDetail {
  realizationreport_id: number;
  date_from: string;
  date_to: string;
  create_dt: string;
  suppliercontract_code: string;
  rrd_id: number;
  gi_id: number;
  subject_name: string;
  nm_id: number;
  brand_name: string;
  sa_name: string;
  ts_name: string;
  barcode: string;
  doc_type_name: string;
  quantity: number;
  retail_price: number;
  retail_amount: number;
  sale_percent: number;
  commission_percent: number;
  office_name: string;
  supplier_oper_name: string;
  order_dt: string;
  sale_dt: string;
  rr_dt: string;
  shk_id: number;
  retail_price_withdisc_rub: number;
  delivery_amount: number;
  return_amount: number;
  delivery_rub: number;
  gi_box_type_name: string;
  product_discount: number;
  old_fare: number;
  sbp_fare: number;
  ppvz_for_pay: number;
  delivery_tie_up: number;
  penalty: number;
  additional_payment: number;
  srid: string;
}

export interface FinancialReportRow {
  nmId: number;
  title: string;
  vendorCode: string;
  salesCount: number;
  revenue: number;
  revenueAfterCommission: number;
  commissionRub: number;
  commissionPercent: number;
  returnsCount: number;
  returnsRub: number;
  logisticsCount: number;
  logisticsRub: number;
  penalties: number;
  ads: number;
  storage: number;
  acceptance: number;
  forPay: number;
  taxPercent: number;
  taxRub: number;
  stock: number;
  cogsUnit: number;
  cogsTotal: number;
  netProfit: number;
  roi: number;
  details: {
    sales: { date: string; quantity: number; amount: number; forPay: number }[];
    returns: { date: string; quantity: number; amount: number; forPay: number }[];
    logistics: { date: string; amount: number }[];
    penalties: { date: string; amount: number; description: string }[];
  };
}

export interface FinancialStats {
  revenue: number;
  ordersCount: number;
  salesCount: number;
  averageCheck: number;
  profit: number; // Estimated
}
