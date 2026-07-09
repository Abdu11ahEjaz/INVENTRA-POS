import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/pageHeader";
import { Download, Filter } from "lucide-react";
import { useSalesTrend, useTopProducts, useInventoryValuation, useProfitLoss } from "@/hooks/useAnalytics";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";
import { exportReports } from "@/utils/exportUtils";

const YEARS = [2025, 2024, 2023];

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { formatCurrency, symbol } = useCurrency();

  const { data: trend = [] }       = useSalesTrend(year);
  const { data: topProducts = [] } = useTopProducts(10);
  const { data: valuation }        = useInventoryValuation();
  const { data: pl }               = useProfitLoss();

  const totalRevenue  = pl?.totalRevenue  || 0;
  const totalCOGS     = pl?.totalCOGS     || 0;
  const grossProfit   = pl?.grossProfit   || 0;
  const grossMargin   = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0";

  const handleExport = () => {
    try {
      exportReports({
        totalRevenue,
        totalCOGS,
        grossProfit,
        topProducts,
        trend,
      }, year, symbol);
      toast.success("Reports export ready for printing");
    } catch (err) {
      toast.error("Failed to export reports");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" description="FIFO-based P&L, inventory valuation, and sales analytics"
        actions={
          <div className="flex items-center gap-2">
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="h-9 w-32 rounded-full gap-1 border-border/60">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Year</span>
                <SelectValue placeholder="2025" />
              </SelectTrigger>
              <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />Export</Button>
          </div>
        }
      />

      {/* P&L Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: `Total Revenue (${symbol})`, v: formatCurrency(totalRevenue),  color: "text-foreground" },
          { l: `COGS (${symbol})`,          v: formatCurrency(totalCOGS),     color: "text-foreground" },
          { l: `Gross Profit (${symbol})`,  v: formatCurrency(grossProfit),   color: grossProfit >= 0 ? "text-success" : "text-destructive" },
          { l: "Gross Margin",              v: `${grossMargin}%`,             color: Number(grossMargin) >= 30 ? "text-success" : "text-warning" },
        ].map((s) => (
          <Card key={s.l} className="border-border/60 p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className={`mt-2 text-2xl font-semibold ${s.color}`}>{s.v}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 p-5 shadow-soft">
          <h3 className="text-base font-semibold">Monthly Sales vs Purchases ({symbol})</h3>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} formatter={(v, n) => [formatCurrency(v), n === "sales" ? "Revenue" : "Purchases"]} />
                <Bar dataKey="sales"    fill="var(--color-chart-1)" radius={[6,6,0,0]} name="Revenue" />
                <Bar dataKey="purchase" fill="var(--color-chart-2)" radius={[6,6,0,0]} name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/60 p-5 shadow-soft">
          <h3 className="text-base font-semibold">Profit Trend ({symbol})</h3>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} formatter={(v, n) => [formatCurrency(v), n === "profit" ? "Gross Profit" : "Revenue"]} />
                <Line type="monotone" dataKey="sales"  stroke="var(--color-chart-1)" strokeWidth={2.5} dot={{ r: 4 }} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="var(--color-chart-3)" strokeWidth={2.5} dot={{ r: 4 }} name="Gross Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border-border/60 p-5 shadow-soft">
        <h3 className="mb-4 text-base font-semibold">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead>#</TableHead><TableHead>Product</TableHead><TableHead>SKU</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Revenue ({symbol})</TableHead>
                <TableHead className="text-right">COGS ({symbol})</TableHead>
                <TableHead className="text-right">Profit ({symbol})</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No sales data yet.</TableCell></TableRow>
              ) : topProducts.map((p, i) => {
                const margin = p.totalRevenue > 0 ? ((p.grossProfit / p.totalRevenue) * 100).toFixed(1) : "0";
                return (
                  <TableRow key={p._id || i} className="border-border/60">
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku || "—"}</TableCell>
                    <TableCell className="text-right">{p.totalQty}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(p.totalRevenue)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(p.totalCOGS)}</TableCell>
                    <TableCell className={`text-right font-semibold ${p.grossProfit >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(p.grossProfit)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={Number(margin) >= 30 ? "bg-success/15 text-success border-success/20" : "bg-warning/15 text-warning border-warning/20"}>
                        {margin}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Inventory Valuation */}
      <Card className="border-border/60 p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Inventory Valuation</h3>
            <p className="text-xs text-muted-foreground">Current stock value at purchase cost (FIFO batches)</p>
          </div>
          <p className="text-lg font-bold">{formatCurrency(valuation?.totalValue || 0)}</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead>Product</TableHead><TableHead>SKU</TableHead><TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Last Cost ({symbol})</TableHead>
                <TableHead className="text-right">Value ({symbol})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(valuation?.items || []).length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No inventory data.</TableCell></TableRow>
              ) : (valuation?.items || []).map((item, i) => (
                <TableRow key={i} className="border-border/60">
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.sku || "—"}</TableCell>
                  <TableCell><Badge variant="secondary" className="rounded-full">{item.category || "—"}</Badge></TableCell>
                  <TableCell className="text-right">{item.totalStock}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.lastPurchasePrice)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(item.inventoryValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
