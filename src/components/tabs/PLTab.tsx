import React, { useMemo } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FinancialReportRow, OperatingExpense } from "../../types";

interface PLTabProps {
  financeRows: FinancialReportRow[];
  expenses: OperatingExpense[];
}

export function PLTab({ financeRows, expenses }: PLTabProps) {
  const pl = useMemo(() => {
    // 1. Revenue
    const revenue = financeRows.reduce((sum, r) => sum + r.revenue, 0);

    // 2. COGS (Себестоимость реализованной продукции)
    const cogs = financeRows.reduce((sum, r) => sum + r.cogsTotal, 0);

    // 3. Gross Profit (Валовая прибыль)
    const grossProfit = revenue - cogs;

    // 4. WB Expenses (Расходы на продажи / Маркетплейс)
    const wbCommission = financeRows.reduce((sum, r) => sum + r.commissionRub, 0);
    const wbLogistics = financeRows.reduce((sum, r) => sum + r.logisticsRub, 0);
    const wbPenalties = financeRows.reduce((sum, r) => sum + r.penalties, 0);
    const wbAds = financeRows.reduce((sum, r) => sum + r.ads, 0);
    const totalWbExpenses = wbCommission + wbLogistics + wbPenalties + wbAds;

    // 5. Contribution Margin (Маржинальная прибыль)
    const contributionMargin = grossProfit - totalWbExpenses;

    // 6. Operating Expenses (Операционные расходы / ОРЕХ)
    const operatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 7. Operating Profit (EBITDA / Операционная прибыль)
    const operatingProfit = contributionMargin - operatingExpenses;

    // 8. Taxes
    const taxes = financeRows.reduce((sum, r) => sum + r.taxRub, 0);

    // 9. Net Profit (Чистая прибыль)
    const netProfit = operatingProfit - taxes;

    const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue,
      cogs,
      grossProfit,
      wbCommission,
      wbLogistics,
      wbPenalties,
      wbAds,
      totalWbExpenses,
      contributionMargin,
      operatingExpenses,
      operatingProfit,
      taxes,
      netProfit,
      netProfitMargin
    };
  }, [financeRows, expenses]);

  return (
    <motion.div
      key="pl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-purple-600" />
              <p className="text-sm font-medium text-muted-foreground">Выручка (GMV)</p>
            </div>
            <h3 className="text-3xl font-bold">{pl.revenue.toLocaleString()} ₽</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-orange-600" />
              <p className="text-sm font-medium text-muted-foreground">Маржинальная прибыль</p>
            </div>
            <h3 className="text-3xl font-bold">{pl.contributionMargin.toLocaleString()} ₽</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {pl.revenue > 0 ? ((pl.contributionMargin / pl.revenue) * 100).toFixed(1) : 0}% от выручки
            </p>
          </CardContent>
        </Card>

        <Card className={`border-none shadow-sm bg-gradient-to-br ${pl.netProfit >= 0 ? 'from-green-50' : 'from-red-50'} to-white`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              {pl.netProfit >= 0 ? <TrendingUp className="text-green-600" /> : <TrendingDown className="text-red-600" />}
              <p className="text-sm font-medium text-muted-foreground">Чистая прибыль (Net Profit)</p>
            </div>
            <h3 className={`text-3xl font-bold ${pl.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {pl.netProfit.toLocaleString()} ₽
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Рентабельность по чистой прибыли: {pl.netProfitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Отчет о прибылях и убытках (P&L)</CardTitle>
          <CardDescription>Сводный управленческий отчет</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
            <Table>
              <TableBody>
                {/* REVENUE */}
                <TableRow className="bg-[#F8F9FA]">
                  <TableCell className="font-bold py-4">1. Выручка от продаж</TableCell>
                  <TableCell className="text-right font-bold py-4">{pl.revenue.toLocaleString()} ₽</TableCell>
                </TableRow>

                {/* COGS */}
                <TableRow>
                  <TableCell className="pl-8 text-muted-foreground">Себестоимость товаров (COGS)</TableCell>
                  <TableCell className="text-right text-red-600">-{pl.cogs.toLocaleString()} ₽</TableCell>
                </TableRow>

                {/* GROSS PROFIT */}
                <TableRow className="bg-[#F8F9FA]">
                  <TableCell className="font-bold py-3">2. Валовая прибыль</TableCell>
                  <TableCell className="text-right font-bold py-3">{pl.grossProfit.toLocaleString()} ₽</TableCell>
                </TableRow>

                {/* WB EXPENSES */}
                <TableRow>
                  <TableCell className="pl-8 text-muted-foreground">Комиссия маркетплейса</TableCell>
                  <TableCell className="text-right text-red-600">-{pl.wbCommission.toLocaleString()} ₽</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8 text-muted-foreground">Логистика маркетплейса</TableCell>
                  <TableCell className="text-right text-red-600">-{pl.wbLogistics.toLocaleString()} ₽</TableCell>
                </TableRow>
                {pl.wbPenalties !== 0 && (
                  <TableRow>
                    <TableCell className="pl-8 text-muted-foreground">Штрафы и удержания ВБ</TableCell>
                    <TableCell className="text-right text-red-600">-{pl.wbPenalties.toLocaleString()} ₽</TableCell>
                  </TableRow>
                )}

                {/* CONTRIBUTION MARGIN */}
                <TableRow className="bg-[#F8F9FA]">
                  <TableCell className="font-bold py-3">3. Маржинальная прибыль</TableCell>
                  <TableCell className="text-right font-bold py-3">{pl.contributionMargin.toLocaleString()} ₽</TableCell>
                </TableRow>

                {/* OPERATING EXPENSES */}
                <TableRow>
                  <TableCell className="pl-8 text-muted-foreground">Операционные расходы (ОРЕХ)</TableCell>
                  <TableCell className="text-right text-red-600">-{pl.operatingExpenses.toLocaleString()} ₽</TableCell>
                </TableRow>

                {/* OPERATING PROFIT */}
                <TableRow className="bg-[#F8F9FA]">
                  <TableCell className="font-bold py-3">4. Операционная прибыль (EBITDA)</TableCell>
                  <TableCell className="text-right font-bold py-3">{pl.operatingProfit.toLocaleString()} ₽</TableCell>
                </TableRow>

                {/* TAXES */}
                <TableRow>
                  <TableCell className="pl-8 text-muted-foreground">Налоги</TableCell>
                  <TableCell className="text-right text-red-600">-{pl.taxes.toLocaleString()} ₽</TableCell>
                </TableRow>

                {/* NET PROFIT */}
                <TableRow className="bg-purple-50">
                  <TableCell className="font-bold text-lg py-4 text-purple-900">5. Чистая прибыль (Net Profit)</TableCell>
                  <TableCell className={`text-right font-bold text-lg py-4 ${pl.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pl.netProfit.toLocaleString()} ₽
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
