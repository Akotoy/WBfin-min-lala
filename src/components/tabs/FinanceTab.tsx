import React, { useState } from "react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { Wallet, TrendingUp, Calculator, AlertTriangle, ChevronUp, ChevronDown, TrendingDown, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FinancialReportRow } from "../../types";
import { StatCard } from "./DashboardTab";

interface FinanceTabProps {
  financeSummary: { revenue: number, profit: number, tax: number, commission: number, logistics: number, roi: number };
  profitChartData: any[];
  financeRows: FinancialReportRow[];
  taxRate: number;
}

export function FinanceTab({ financeSummary, profitChartData, financeRows, taxRate }: FinanceTabProps) {
  const [expandedFinanceRow, setExpandedFinanceRow] = useState<number | null>(null);

  return (
    <motion.div
      key="finance"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Итого Выручка"
          value={`${financeSummary.revenue.toLocaleString()} ₽`}
          trend="За выбранный период"
          up={true}
          icon={<Wallet className="text-blue-600" />}
        />
        <StatCard
          title="Итого Чистая Прибыль"
          value={`${financeSummary.profit.toLocaleString()} ₽`}
          trend="После всех вычетов"
          up={financeSummary.profit >= 0}
          icon={<TrendingUp className={financeSummary.profit >= 0 ? "text-green-600" : "text-red-600"} />}
        />
        <StatCard
          title="Средняя Рентабельность"
          value={`${financeSummary.roi.toFixed(1)}%`}
          trend="ROI"
          up={financeSummary.roi >= 0}
          icon={<Calculator className="text-purple-600" />}
        />
        <StatCard
          title="Итого Налог"
          value={`${financeSummary.tax.toLocaleString()} ₽`}
          trend={`${taxRate}% от выручки`}
          up={false}
          icon={<AlertTriangle className="text-orange-600" />}
        />
      </div>

      {/* Profit Bar Chart */}
      {profitChartData.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Чистая прибыль по товарам</CardTitle>
            <CardDescription>Рейтинг артикулов по доходности</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94A3B8' }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8F9FA' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value.toLocaleString()} ₽`, 'Прибыль']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {profitChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Финансовый отчет</CardTitle>
          <CardDescription>Детализация по артикулам (на основе еженедельных отчетов)</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="sticky left-0 bg-white z-10">Товар</TableHead>
                  <TableHead>Продажи шт</TableHead>
                  <TableHead>Общая себестоимость</TableHead>
                  <TableHead>Чистая прибыль</TableHead>
                  <TableHead>Рентабельность</TableHead>
                  <TableHead>Выручка до комиссии</TableHead>
                  <TableHead>Продажи с вычетом комиссии</TableHead>
                  <TableHead>Комиссия руб</TableHead>
                  <TableHead>Комиссия %</TableHead>
                  <TableHead>Возвраты шт</TableHead>
                  <TableHead>Возвраты руб</TableHead>
                  <TableHead>Логистика шт</TableHead>
                  <TableHead>Логистика руб</TableHead>
                  <TableHead>Штрафы</TableHead>
                  <TableHead>Реклама</TableHead>
                  <TableHead>Хранение</TableHead>
                  <TableHead>Платная приемка</TableHead>
                  <TableHead>От ВБ</TableHead>
                  <TableHead>Налог %</TableHead>
                  <TableHead>Налог руб</TableHead>
                  <TableHead>Остаток</TableHead>
                  <TableHead>Себестоимость (шт)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financeRows.map((row) => (
                  <React.Fragment key={row.nmId}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedFinanceRow(expandedFinanceRow === row.nmId ? null : row.nmId)}
                    >
                      <TableCell>
                        {expandedFinanceRow === row.nmId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </TableCell>
                      <TableCell className="sticky left-0 bg-white z-10 font-medium border-r">
                        <div className="w-48 truncate" title={row.title}>{row.title}</div>
                        <div className="text-xs text-muted-foreground">{row.vendorCode}</div>
                      </TableCell>
                      <TableCell>{row.salesCount}</TableCell>
                      <TableCell>{row.cogsTotal.toLocaleString()} ₽</TableCell>
                      <TableCell className={row.netProfit > 0 ? "text-green-600 font-bold" : row.netProfit < 0 ? "text-red-600 font-bold" : ""}>
                        {row.netProfit.toLocaleString()} ₽
                      </TableCell>
                      <TableCell className={row.roi > 0 ? "text-green-600" : row.roi < 0 ? "text-red-600" : ""}>
                        {row.roi.toFixed(1)}%
                      </TableCell>
                      <TableCell>{row.revenue.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.revenueAfterCommission.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.commissionRub.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.commissionPercent.toFixed(1)}%</TableCell>
                      <TableCell>{row.returnsCount}</TableCell>
                      <TableCell>{row.returnsRub.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.logisticsCount}</TableCell>
                      <TableCell>{row.logisticsRub.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.penalties.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.ads.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.storage.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.acceptance.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.forPay.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.taxPercent}%</TableCell>
                      <TableCell>{row.taxRub.toLocaleString()} ₽</TableCell>
                      <TableCell>{row.stock}</TableCell>
                      <TableCell>{row.cogsUnit.toLocaleString()} ₽</TableCell>
                    </TableRow>
                    {expandedFinanceRow === row.nmId && (
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                        <TableCell colSpan={23} className="p-0 border-b-2 border-purple-200">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                              {/* ПРОДАЖИ */}
                              <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-green-700"><TrendingUp size={16}/> Детализация продаж</h4>
                                <ScrollArea className="h-[200px]">
                                  <div className="space-y-2">
                                    {row.details.sales.length === 0 && <p className="text-xs text-muted-foreground">Нет данных</p>}
                                    {row.details.sales.map((s, i) => (
                                      <div key={i} className="flex justify-between text-xs border-b pb-1">
                                        <span className="text-muted-foreground">{format(new Date(s.date), "dd.MM")}</span>
                                        <span>{s.quantity} шт</span>
                                        <span className="font-medium">{s.amount} ₽</span>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>

                              {/* ВОЗВРАТЫ */}
                              <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-red-700"><TrendingDown size={16}/> Детализация возвратов</h4>
                                <ScrollArea className="h-[200px]">
                                  <div className="space-y-2">
                                    {row.details.returns.length === 0 && <p className="text-xs text-muted-foreground">Нет данных</p>}
                                    {row.details.returns.map((r, i) => (
                                      <div key={i} className="flex justify-between text-xs border-b pb-1">
                                        <span className="text-muted-foreground">{format(new Date(r.date), "dd.MM")}</span>
                                        <span>{r.quantity} шт</span>
                                        <span className="font-medium text-red-600">{r.amount} ₽</span>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>

                              {/* ЛОГИСТИКА */}
                              <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-blue-700"><Truck size={16}/> Логистика</h4>
                                <ScrollArea className="h-[200px]">
                                  <div className="space-y-2">
                                    {row.details.logistics.length === 0 && <p className="text-xs text-muted-foreground">Нет данных</p>}
                                    {row.details.logistics.map((l, i) => (
                                      <div key={i} className="flex justify-between text-xs border-b pb-1">
                                        <span className="text-muted-foreground">{format(new Date(l.date), "dd.MM")}</span>
                                        <span className="font-medium">{l.amount} ₽</span>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>

                              {/* ШТРАФЫ */}
                              <div className="bg-white p-4 rounded-xl border shadow-sm">
                                <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-orange-700"><AlertTriangle size={16}/> Штрафы и удержания</h4>
                                <ScrollArea className="h-[200px]">
                                  <div className="space-y-2">
                                    {row.details.penalties.length === 0 && <p className="text-xs text-muted-foreground">Нет данных</p>}
                                    {row.details.penalties.map((p, i) => (
                                      <div key={i} className="flex justify-between text-xs border-b pb-1">
                                        <span className="text-muted-foreground">{format(new Date(p.date), "dd.MM")}</span>
                                        <span className="truncate w-24" title={p.description}>{p.description}</span>
                                        <span className="font-medium text-orange-600">{p.amount} ₽</span>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
