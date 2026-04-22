import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Settings, 
  RefreshCw, 
  AlertCircle,
  Wallet,
  ShoppingCart,
  LogOut,
  Save,
  X,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format, subDays, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { buildProductsFromData, getSales, getOrders, getStocks, getReportDetailByPeriod } from "./services/wbService";
import { WBProduct, WBSale, WBOrder, WBSettings, WBReportDetail } from "./types";
import { calculateFinancialReport } from "./lib/financeEngine";
import { supabase } from "@/lib/supabase";
import { Auth } from "@/components/Auth";
import { Session } from "@supabase/supabase-js";

import { DashboardTab, ProductsTab, OrdersTab, FinanceTab, SettingsTab } from "./components/tabs";

const DEFAULT_WB_TOKEN = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjIwMjYwMzAydjEiLCJ0eXAiOiJKV1QifQ.eyJhY2MiOjEsImVudCI6MSwiZXhwIjoxNzkwNzE2ODQzLCJpZCI6IjAxOWQ0MzMxLWZmMTItN2U2Yi1iNDNhLWNmMWFiYzViY2NmZiIsImlpZCI6MjY1MTMwMjAsIm9pZCI6MjUwMDIxNTcxLCJzIjoxMjMyNCwic2lkIjoiOGM2NjhmNzMtZTc0ZS00ZjJhLTk3N2QtMDk4ODg5MDY2MzA2IiwidCI6ZmFsc2UsInVpZCI6MjY1MTMwMjB9.JbVY1aKfpSgcJY6aA2l1RZRjCtw8wF3AOIL20_re7w47-Szc33KMnwqcebMIX9Ze97x5eqgQ85E8dCgFyQM4Zg";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [settings, setSettings] = useState<WBSettings>({
    tokens: { standard: "", statistics: DEFAULT_WB_TOKEN, ads: "" },
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

  // --- Состояние для диалога подтверждения несохранённых изменений ---
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const settingsFormRef = useRef<HTMLFormElement>(null);

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
        const loadedSettings = settingsData.settings;
        if (!loadedSettings.tokens.statistics) {
          loadedSettings.tokens.statistics = DEFAULT_WB_TOKEN;
        }
        setSettings(loadedSettings);
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

    const { error: saveError } = await supabase.from('user_settings').upsert({
      user_id: session.user.id,
      settings: newSettings,
      updated_at: new Date().toISOString()
    });

    if (saveError) {
      toast.error("Ошибка сохранения", {
        description: saveError.message || "Не удалось сохранить настройки в базу данных",
      });
    } else {
      toast.success("Сохранено", {
        description: "Настройки успешно обновлены",
      });
      setHasUnsavedChanges(false);
    }
  };

  const handleUpdateCogs = async (nmId: number, cost: number) => {
    if (!session?.user) return;

    const newCogs = { ...cogs, [nmId]: cost };
    setCogs(newCogs);
    
    const { error: cogsError } = await supabase.from('product_cogs').upsert({
      user_id: session.user.id,
      nm_id: nmId,
      cost: cost,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, nm_id' });

    if (cogsError) {
      toast.error("Ошибка сохранения себестоимости", {
        description: cogsError.message,
      });
    } else {
      toast.success("Сохранено", {
        description: `Себестоимость обновлена: ${cost} ₽`,
      });
    }
  };

  const [activeTab, setActiveTab] = useState("dashboard");

  // --- Переключение вкладок с проверкой несохранённых изменений ---
  const handleTabChange = (tab: string) => {
    if (activeTab === "settings" && hasUnsavedChanges && tab !== "settings") {
      setPendingTab(tab);
      setShowUnsavedDialog(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleSaveAndSwitch = async () => {
    if (settingsFormRef.current) {
      // Программно сабмитим форму настроек
      settingsFormRef.current.requestSubmit();
    }
    setShowUnsavedDialog(false);
    if (pendingTab) {
      // Небольшая задержка чтобы сохранение обработалось
      setTimeout(() => {
        setActiveTab(pendingTab!);
        setPendingTab(null);
      }, 300);
    }
  };

  // --- Экспорт отчета ---
  const handleExportReport = () => {
    if (financeRows.length === 0) {
      toast.error("Нет данных для экспорта", {
        description: "Загрузите данные перед экспортом отчета",
      });
      return;
    }

    // Формируем CSV
    const headers = ["Товар", "Артикул", "Продажи шт", "Выручка", "Комиссия", "Логистика", "Штрафы", "Чистая прибыль", "Рентабельность"];
    const rows = financeRows.map(r => [
      r.title,
      r.vendorCode,
      r.salesCount,
      r.revenue,
      r.commissionRub,
      r.logisticsRub,
      r.penalties,
      r.netProfit,
      `${r.roi.toFixed(1)}%`
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(row => row.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wb-finance-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Отчёт экспортирован", {
      description: "CSV-файл скачан",
    });
  };

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
            onClick={() => handleTabChange("dashboard")}
          />
          <NavItem 
            icon={<Package size={20} />} 
            label="Товары" 
            active={activeTab === "products"} 
            onClick={() => handleTabChange("products")}
          />
          <NavItem 
            icon={<ShoppingCart size={20} />} 
            label="Заказы" 
            active={activeTab === "orders"} 
            onClick={() => handleTabChange("orders")}
          />
          <NavItem 
            icon={<Wallet size={20} />} 
            label="Финансы" 
            active={activeTab === "finance"} 
            onClick={() => handleTabChange("finance")}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Настройки" 
            active={activeTab === "settings"} 
            onClick={() => handleTabChange("settings")}
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
            <Button size="sm" className="bg-[#7C3AED] hover:bg-[#6D28D9]" onClick={handleExportReport}>
              <Download size={16} className="mr-2" />
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
            <DashboardTab
              stats={stats}
              chartData={chartData}
              settings={settings}
              products={products}
              sales={sales}
              handleTabChange={handleTabChange}
            />
          )}

          {activeTab === "products" && (
            <ProductsTab
              products={products}
              cogs={cogs}
              handleUpdateCogs={handleUpdateCogs}
              handleUpdatePrice={handleUpdatePrice}
            />
          )}

          {activeTab === "orders" && (
            <OrdersTab orders={orders} />
          )}

          {activeTab === "finance" && (
            <FinanceTab
              financeSummary={financeSummary}
              profitChartData={profitChartData}
              financeRows={financeRows}
              taxRate={settings.taxRate}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              settings={settings}
              settingsFormRef={settingsFormRef}
              hasUnsavedChanges={hasUnsavedChanges}
              setHasUnsavedChanges={setHasUnsavedChanges}
              handleSaveSettings={handleSaveSettings}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Toast провайдер */}
      <Toaster position="top-right" richColors closeButton />

      {/* Диалог подтверждения несохранённых изменений */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Несохранённые изменения</DialogTitle>
            <DialogDescription>
              У вас есть несохранённые изменения в настройках. Что вы хотите сделать?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDiscardChanges}>
              <X size={16} className="mr-2" />
              Не сохранять
            </Button>
            <Button className="bg-[#7C3AED] hover:bg-[#6D28D9]" onClick={handleSaveAndSwitch}>
              <Save size={16} className="mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
