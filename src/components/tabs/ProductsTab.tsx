import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WBProduct } from "../../types";

interface ProductsTabProps {
  products: WBProduct[];
  cogs: Record<number, number>;
  handleUpdateCogs: (nmId: number, cost: number) => void;
  handleUpdatePrice: (nmId: number, newPrice: number) => void;
}

export function ProductsTab({ products, cogs, handleUpdateCogs, handleUpdatePrice }: ProductsTabProps) {
  return (
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
  );
}
