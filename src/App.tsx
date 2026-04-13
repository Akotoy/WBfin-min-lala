import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Settings, 
  RefreshCw, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ShoppingCart,
  Box,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Truck,
  AlertTriangle,
  Calculator,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { format, subDays, startOfDay, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { buildProductsFromData, getSales, getOrders, getStocks, getReportDetailByPeriod } from "./services/wbService";
import { WBProduct, WBSale, WBOrder, FinancialStats, WBSettings, WBReportDetail, FinancialReportRow } from "./types";
import { calculateFinancialReport } from "./lib/financeEngine";
import { supabase } from "@/lib/supabase";
import { Auth } from "@/components/Auth";
import { Session } from "@supabase/supabase-js";


export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [settings, setSettings] = useState<WBSettings>({
    tokens: { standard: "", statistics: "", ads: "" },
    taxRate: 6
  });
  const [cogs, setCogs] = useState<Record<number, number>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<WBProduct[]>([]);
  const [sales, setSales] = useState<WBSale[]>([]);
  const [orders, setOrders] = useState<WBOrder[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [reports, setReports] = useState<WBReportDetail[]>([]);

  const fetchData = async () => {
    if (!settings.tokens.statistics) return;
    setLoading(true);
    setError(null);
    try {
      // Общие данные (продажи, заказы на дашборд) за 30 дней
      const dateFrom = format(subDays(new Date(), 30), "yyyy-MM-dd");
      // Финансовый отчет строго за прошлую неделю (Пн-Вс)
      const prevWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
      const prevWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
      const financeDateFrom = format(prevWeekStart, "yyyy-MM-dd");
      const financeDateTo = format(prevWeekEnd, "yyyy-MM-dd");
      const dateTo = format(new Date(), "yyyy-MM-dd");
      
      const [s, o, st, r] = await Promise.all([
        getSales(settings.tokens.statistics, dateFrom),
        getOrders(settings.tokens.statistics, dateFrom),
        getStocks(settings.tokens.statistics).catch(() => []),
        getReportDetailByPeriod(settings.tokens.statistics, financeDateFrom, financeDateTo).catch(() => [])
      ]);
      setSales(s);
      setOrders(o);
      setStocks(st);
      setReports(r);
      // Собираем список товаров из данных статистики (без Content API)
      setProducts(buildProductsFromData(s, r, st));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    
    const loadUserData = async () => {
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (settingsData && settingsData.settings) {
        setSettings(settingsData.settings);
      }

      const { data: cogsData } = await supabase
        .from('product_cogs')
        .select('nm_id, cost')
        .eq('user_id', session.user.id);
        
      if (cogsData) {
        const cogsMap: Record<number, number> = {};
        cogsData.forEach(row => cogsMap[row.nm_id] = row.cost);
        setCogs(cogsMap);
      }
    };
    
    loadUserData();
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [settings.tokens.statistics]);

  const stats = useMemo(() => {
    const revenue = sales.reduce((acc, s) => acc + s.finishedPrice, 0);
    const profit = sales.reduce((acc, s) => acc + s.forPay, 0);
    const ordersCount = orders.length;
    const salesCount = sales.length;
    const avgCheck = salesCount > 0 ? Math.round(revenue / salesCount) : 0;

    return { revenue, profit, ordersCount, salesCount, avgCheck };
  }, [sales, orders]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = format(subDays(new Date(), 6 - i), "dd.MM");
      const daySales = sales.filter(s => format(new Date(s.date), "dd.MM") === date);
      const dayOrders = orders.filter(o => format(new Date(o.date), "dd.MM") === date);
      
      return {
        name: date,
        sales: daySales.reduce((acc, s) => acc + s.finishedPrice, 0),
        orders: dayOrders.reduce((acc, o) => acc + o.priceWithDisc, 0),
      };
    });
    return last7Days;
  }, [sales, orders]);

  const financeRows = useMemo(() => {
    return calculateFinancialReport(reports, products, cogs, settings.taxRate);
  }, [reports, products, cogs, settings.taxRate]);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) return;

    const formData = new FormData(e.currentTarget);
    const newSettings: WBSettings = {
      tokens: {
        standard: formData.get("standardToken") as string,
        statistics: formData.get("statisticsToken") as string,
        ads: formData.get("adsToken") as string,
      },
      taxRate: Number(formData.get("taxRate")) || 6,
    };
    setSettings(newSettings);

    await supabase.from('user_settings').upsert({
      user_id: session.user.id,
      settings: newSettings,
      updated_at: new Date().toISOString()
    });
  };

  const handleUpdateCogs = async (nmId: number, cost: number) => {
    if (!session?.user) return;

    const newCogs = { ...cogs, [nmId]: cost };
    setCogs(newCogs);
    
    await supabase.from('product_cogs').upsert({
      user_id: session.user.id,
      nm_id: nmId,
      cost: cost,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, nm_id' });
  };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedFinanceRow, setExpandedFinanceRow] = useState<number | null>(null);

  const financeSummary = useMemo(() => {
    let revenue = 0;
    let profit = 0;
    let tax = 0;
    let commission = 0;
    let logistics = 0;
    
    financeRows.forEach(r => {
      revenue += r.revenue;
      profit += r.netProfit;
      tax += r.taxRub;
      commission += r.commissionRub;
      logistics += r.logisticsRub;
    });

    const roi = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, profit, tax, commission, logistics, roi };
  }, [financeRows]);

  const profitChartData = useMemo(() => {
    return [...financeRows]
      .sort((a, b) => b.netProfit - a.netProfit) // Sort by profit descending
      .map(row => ({
        name: row.vendorCode,
        fullName: row.title,
        profit: row.netProfit
      }));
  }, [financeRows]);

  const handleUpdatePrice = async (nmId: number, newPrice: number) => {
    setLoading(true);
    try {
      // In a real app, we'd call the service
      // await updatePrice(token, nmId, newPrice);
      setError("Функция обновления цен в разработке (требует специфических прав API)");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">Загрузка...</div>;
  }

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E5E7EB] p-6 hidden md:block">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">WB Finance</h1>
        </div>

        <nav className="space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Дашборд" 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem 
            icon={<Package size={20} />} 
            label="Товары" 
            active={activeTab === "products"} 
            onClick={() => setActiveTab("products")}
          />
          <NavItem 
            icon={<ShoppingCart size={20} />} 
            label="Заказы" 
            active={activeTab === "orders"} 
            onClick={() => setActiveTab("orders")}
          />
          <NavItem 
            icon={<Wallet size={20} />} 
            label="Финансы" 
            active={activeTab === "finance"} 
            onClick={() => setActiveTab("finance")}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Настройки" 
            active={activeTab === "settings"} 
            onClick={() => setActiveTab("settings")}
          />
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 mb-2">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Статус API</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${settings.tokens.statistics ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">{settings.tokens.statistics ? 'Подключено' : 'Ожидает токен'}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full text-left justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut size={20} className="mr-3" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Обзор кабинета</h2>
            <p className="text-muted-foreground">Последнее обновление: {format(new Date(), "HH:mm:ss")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button size="sm" className="bg-[#7C3AED] hover:bg-[#6D28D9]">
              Экспорт отчета
            </Button>
          </div>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
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

                {/* Token Settings */}
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Быстрые настройки API</CardTitle>
                    <CardDescription>Перейдите в Настройки для полного управления</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Токен (Статистика)</label>
                        <Input 
                          name="statisticsToken" 
                          type="password" 
                          placeholder="Введите токен статистики..." 
                          defaultValue={settings.tokens.statistics}
                          className="rounded-xl border-[#E5E7EB]"
                        />
                        <input type="hidden" name="standardToken" value={settings.tokens.standard} />
                        <input type="hidden" name="adsToken" value={settings.tokens.ads} />
                        <input type="hidden" name="taxRate" value={settings.taxRate} />
                      </div>
                      <Button type="submit" className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] rounded-xl">
                        Сохранить токен
                      </Button>
                    </form>
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
          )}

          {activeTab === "products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Товары и остатки</CardTitle>
                    <CardDescription>Управление ценами и мониторинг склада</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Поиск по артикулу..." className="w-64" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Товар</TableHead>
                        <TableHead>Артикул</TableHead>
                        <TableHead>Категория</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Скидка</TableHead>
                        <TableHead>Остаток</TableHead>
                        <TableHead>Себестоимость (шт)</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.nmId}>
                          <TableCell className="font-medium">{product.title}</TableCell>
                          <TableCell className="font-mono text-xs">{product.vendorCode}</TableCell>
                          <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                          <TableCell>{product.price} ₽</TableCell>
                          <TableCell>{product.discount}%</TableCell>
                          <TableCell>
                            <span className={product.stock < 10 ? "text-red-500 font-bold" : ""}>
                              {product.stock} шт.
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              className="w-24 h-8" 
                              value={cogs[product.nmId] || ""} 
                              onChange={(e) => handleUpdateCogs(product.nmId, Number(e.target.value))}
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleUpdatePrice(product.nmId, product.price + 100)}>
                              +100 ₽
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>История заказов</CardTitle>
                  <CardDescription>Все заказы за последние 30 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Дата</TableHead>
                        <TableHead>Артикул</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Склад</TableHead>
                        <TableHead>Регион</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{format(new Date(order.date), "dd.MM HH:mm")}</TableCell>
                          <TableCell className="font-mono text-xs">{order.supplierArticle}</TableCell>
                          <TableCell>{order.priceWithDisc} ₽</TableCell>
                          <TableCell>{order.warehouseName}</TableCell>
                          <TableCell>{order.regionName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {activeTab === "finance" && (
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
                  trend={`${settings.taxRate}% от выручки`} 
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
          )}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-none shadow-sm max-w-2xl">
                <CardHeader>
                  <CardTitle>Настройки интеграции</CardTitle>
                  <CardDescription>Управление токенами API и финансовыми параметрами</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Токены API Wildberries</h3>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Токен (Статистика) *</label>
                        <Input name="statisticsToken" type="password" defaultValue={settings.tokens.statistics} placeholder="Для получения отчетов и продаж" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Токен (Стандартный)</label>
                        <Input name="standardToken" type="password" defaultValue={settings.tokens.standard} placeholder="Для управления товарами и ценами" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Токен (Реклама)</label>
                        <Input name="adsToken" type="password" defaultValue={settings.tokens.ads} placeholder="Для получения затрат на продвижение" />
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Финансовые параметры</h3>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Налоговая ставка (%)</label>
                        <Input name="taxRate" type="number" step="0.1" defaultValue={settings.taxRate} />
                        <p className="text-xs text-muted-foreground">Пример: 6 для УСН 6%</p>
                      </div>
                    </div>

                    <Button type="submit" className="bg-[#7C3AED] hover:bg-[#6D28D9]">Сохранить настройки</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
        ${active 
          ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-100' 
          : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1A1A1A]'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, up, icon }: { title: string, value: string, trend: string, up: boolean, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-muted/50 rounded-lg">
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-green-600' : 'text-red-600'}`}>
            {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      </CardContent>
    </Card>
  );
}
