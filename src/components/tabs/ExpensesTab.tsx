import React, { useState } from "react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { Plus, Trash2, Edit2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { OperatingExpense } from "../../types";

const CATEGORIES = [
  "Аренда",
  "Зарплата",
  "Маркетинг (внешний)",
  "Налоги (прочие)",
  "ПО и сервисы",
  "Офисные расходы",
  "Банковские комиссии",
  "Прочее"
];

interface ExpensesTabProps {
  expenses: OperatingExpense[];
  onAddExpense: (expense: Omit<OperatingExpense, 'id' | 'user_id'>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

export function ExpensesTab({ expenses, onAddExpense, onDeleteExpense }: ExpensesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: CATEGORIES[0],
    amount: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || isNaN(Number(formData.amount))) return;

    setLoading(true);
    await onAddExpense({
      date: formData.date,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description
    });
    setLoading(false);
    setIsDialogOpen(false);
    setFormData({ ...formData, amount: '', description: '' });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <motion.div
      key="expenses"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Операционные расходы</h2>
            <p className="text-muted-foreground text-sm">Учет затрат на бизнес (не связанных с ВБ напрямую)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Итого расходов за период</p>
          <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} ₽</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] flex justify-between items-center">
          <h3 className="font-semibold text-lg">Журнал расходов</h3>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
            <Plus size={16} className="mr-2" /> Добавить расход
          </Button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Receipt size={48} className="mb-4 text-gray-300" />
            <p>Нет записей об операционных расходах</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(new Date(expense.date), 'dd.MM.yyyy')}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{expense.description || '—'}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">-{expense.amount.toLocaleString()} ₽</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onDeleteExpense(expense.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить расход</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Дата</Label>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Категория</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Сумма (₽)</Label>
              <Input
                type="number"
                required
                min="0"
                placeholder="15000"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Описание (необязательно)</Label>
              <Input
                placeholder="Например, Оплата интернета"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
              <Button type="submit" disabled={loading} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
