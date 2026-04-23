import React, { RefObject } from "react";
import { motion } from "motion/react";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WBSettings } from "../../types";

interface SettingsTabProps {
  settings: WBSettings;
  settingsFormRef: RefObject<HTMLFormElement>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
  handleSaveSettings: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SettingsTab({ settings, settingsFormRef, hasUnsavedChanges, setHasUnsavedChanges, handleSaveSettings }: SettingsTabProps) {
  return (
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
          <form ref={settingsFormRef} onSubmit={handleSaveSettings} className="space-y-6" onChange={() => setHasUnsavedChanges(true)}>
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

            <div className="flex gap-3">
              <Button type="submit" className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                <Save size={16} className="mr-2" />
                Сохранить настройки
              </Button>
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 self-center">
                  Есть несохранённые изменения
                </Badge>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
