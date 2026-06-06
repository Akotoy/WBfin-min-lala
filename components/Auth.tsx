import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.session) {
          onAuthSuccess();
        } else {
          setSuccessMsg("Аккаунт создан! В целях безопасности Supabase требует подтвердить почту — зайдите на свою почту и перейдите по ссылке (проверьте папку Спам). Если вы отключили 'Confirm email' в настройках Supabase, можете просто войти в систему прямо сейчас.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при аутентификации.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-200">
            <TrendingUp size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">WB Finance</h1>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{isLogin ? "С возвращением" : "Создать аккаунт"}</CardTitle>
            <CardDescription>
              {isLogin ? "Войдите в свой аккаунт для доступа к дашборду" : "Заполните данные для начала работы"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2 text-green-700 text-sm">
                  <TrendingUp size={16} className="mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-[#E5E7EB]"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-[#E5E7EB]"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] h-11 text-base font-medium"
              >
                {loading ? "Загрузка..." : (isLogin ? "Войти в систему" : "Зарегистрироваться")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setSuccessMsg(null);
                  setError(null);
                }} 
                className="text-[#7C3AED] font-semibold hover:underline"
              >
                {isLogin ? "Зарегистрироваться" : "Войти"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
