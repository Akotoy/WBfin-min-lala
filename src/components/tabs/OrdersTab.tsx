import React from "react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WBOrder } from "../../types";

interface OrdersTabProps {
  orders: WBOrder[];
}

export function OrdersTab({ orders }: OrdersTabProps) {
  return (
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
  );
}
