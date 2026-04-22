import React from "react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { Wallet, ShoppingCart, TrendingUp, Box, Key, Package, Calculator, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { WBSettings, WBProduct, WBSale, WBOrder } from "../../types";

export function StatCard({ title, value, trend, up, icon }: { title: string, value: string, trend: string, up: boolean, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-muted/50 rounded-lg">
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-green-600' : 'text-red-600'}`}>
            {up ? "↗" : "↘"}
            {trend}
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      </CardContent>
    </Card>
  );
}

interface DashboardTabProps {
  stats: { revenue: number, profit: number, ordersCount: number, salesCount: number, avgCheck: number };
  chartData: any[];
  settings: WBSettings;
  products: WBProduct[];
  sales: WBSale[];
  handleTabChange: (tab: string) => void;
}

export function DashboardTab({ stats, chartData, settings, products, sales, handleTabChange }: DashboardTabProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Выручка (30д)"
          value={`${stats.revenue.toLocaleString()} ₽`}
          trend="+12.5%"
          up={true}
          icon={<Wallet className="text-blue-600" />}
        />
        <StatCard
          title="Заказы (30д)"
          value={stats.ordersCount.toString()}
          trend="+5.2%"
          up={true}
          icon={<ShoppingCart className="text-purple-600" />}
        />
        <StatCard
          title="Прибыль (факт)"
          value={`${stats.profit.toLocaleString()} ₽`}
          trend="-2.1%"
          up={false}
          icon={<TrendingUp className="text-green-600" />}
        />
        <StatCard
          title="Средний чек"
          value={`${stats.avgCheck.toLocaleString()} ₽`}
          trend="+0.8%"
          up={true}
          icon={<Box className="text-orange-600" />}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-lg font-semibold">Динамика продаж</CardTitle>
              <CardDescription>Сравнение заказов и выкупов за неделю</CardDescription>
            </div>
            <Tabs defaultValue="7d">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="7d">7д</TabsTrigger>
                <TabsTrigger value="30d">30д</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#94A3B8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info Widget */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Быстрая информация</CardTitle>
            <CardDescription>Сводка по ключевым метрикам</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <div className={`p-2 rounded-lg ${settings.tokens.statistics ? 'bg-green-100' : 'bg-red-100'}`}>
                <Key size={18} className={settings.tokens.statistics ? 'text-green-600' : 'text-red-600'} />
              </div>
              <div>
                <p className="text-sm font-medium">API Wildberries</p>
                <p className={`text-xs ${settings.tokens.statistics ? 'text-green-600' : 'text-red-500'}`}>
                  {settings.tokens.statistics ? 'Подключено' : 'Токен не настроен'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <div className="p-2 rounded-lg bg-purple-100">
                <Package size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Товаров</p>
                <p className="text-xs text-muted-foreground">{products.length} шт</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
              <div className="p-2 rounded-lg bg-orange-100">
                <Calculator size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Налоговая ставка</p>
                <p className="text-xs text-muted-foreground">УСН {settings.taxRate}%</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => handleTabChange("settings")}
            >
              <Settings size={16} className="mr-2" />
              Перейти в настройки
            </Button>
          </CardContent>
        </Card>

        {/* Recent Sales Table */}
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Последние продажи</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[#F1F5F9]">
                  <TableHead className="text-xs uppercase tracking-wider font-bold">Дата</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-bold">Артикул</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-bold">Сумма</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-bold">К перечислению</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider font-bold">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.slice(0, 5).map((sale, idx) => (
                  <TableRow key={idx} className="border-[#F1F5F9] hover:bg-[#F8F9FA] transition-colors">
                    <TableCell className="font-medium">{format(new Date(sale.date), "dd.MM HH:mm")}</TableCell>
                    <TableCell className="font-mono text-xs">{sale.supplierArticle}</TableCell>
                    <TableCell>{sale.finishedPrice.toLocaleString()} ₽</TableCell>
                    <TableCell className="text-green-600 font-semibold">{sale.forPay.toLocaleString()} ₽</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                        Выкуп
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
