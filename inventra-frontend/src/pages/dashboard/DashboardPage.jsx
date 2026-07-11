import { TrendingUp, FileText, Wallet, BarChart2, MoreHorizontal, ChevronDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatCard from "@/components/dashboard/StatCard";
import { useCurrency } from "@/hooks/useCurrency";
import { useDashboardStats, useSalesTrend, useTopProducts } from "@/hooks/useAnalytics";
import { useInvoices } from "@/hooks/useInvoices";

const statusColor = {
  Paid:    "bg-success/15 text-success border-success/20",
  Pending: "bg-warning/15 text-[oklch(0.5_0.16_75)] border-warning/20",
  Overdue: "bg-destructive/15 text-destructive border-destructive/20",
};

const getId = (obj) => String(obj?._id || obj?.id || "");

export default function Dashboard() {
  const { formatCurrency } = useCurrency();
  const { data: stats }    = useDashboardStats();
  const { data: trend = [] } = useSalesTrend(new Date().getFullYear());
  const { data: topProducts = [] } = useTopProducts(5);
  const { data: rawInvoices = [] } = useInvoices();

  const invoices = rawInvoices.map((i) => ({
    ...i, id: getId(i), amount: i.total ?? i.amount ?? 0,
    issued: i.issued ? new Date(i.issued).toLocaleDateString() : "—",
  }));

  const recentTransactions = invoices.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue"    value={formatCurrency(stats?.totalRevenue   || 0)} delta="+20%" trend="up"   Icon={TrendingUp} tint="blue"  />
        <StatCard label="Gross Profit"     value={formatCurrency(stats?.grossProfit    || 0)} delta="+15%" trend="up"   Icon={BarChart2}  tint="green" />
        <StatCard label="Total Expenses"   value={formatCurrency(stats?.totalExpenses  || 0)} delta="+8%"  trend="up"   Icon={Wallet}     tint="amber" />
        <StatCard label="Invoice Due"      value={formatCurrency(stats?.invoiceDue     || 0)} delta="-5%"  trend="down" Icon={FileText}   tint="rose"  />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Bar chart — monthly sales vs purchases */}
        <Card className="border-border/60 p-5 shadow-soft lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold">Sales vs Purchases</h3>
              <p className="text-xs text-muted-foreground">Monthly · {new Date().getFullYear()}</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
          <div className="mt-6 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, { maximumFractionDigits: 0 })} />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(value, name) => [formatCurrency(value), name === "sales" ? "Revenue" : name === "purchase" ? "Purchases" : "Profit"]}
                />
                <Bar dataKey="sales"    fill="var(--color-chart-1)" radius={[6,6,0,0]} name="Revenue" />
                <Bar dataKey="purchase" fill="var(--color-chart-2)" radius={[6,6,0,0]} name="Purchases" />
                <Bar dataKey="profit"   fill="var(--color-chart-3)" radius={[6,6,0,0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie chart — top products */}
        <Card className="border-border/60 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Top Products</h3>
            <Button variant="outline" size="sm" className="rounded-full">By Revenue <ChevronDown className="ml-1 h-3.5 w-3.5" /></Button>
          </div>
          <div className="relative mt-4 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topProducts} dataKey="totalRevenue" nameKey="name" innerRadius={56} outerRadius={80} paddingAngle={3} stroke="none">
                  {topProducts.map((_, i) => <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />)}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value), name]}
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-semibold">{topProducts.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Products</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {topProducts.map((p, i) => (
              <div key={p._id || i} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `var(--color-chart-${(i % 5) + 1})` }} />
                <span className="truncate text-xs text-muted-foreground flex-1">{p.name}</span>
                <span className="text-xs font-semibold">{formatCurrency(p.totalRevenue)}</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No sales data yet</p>}
          </div>
        </Card>
      </div>

      {/* Inventory value + P&L summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">Inventory Value</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(stats?.inventoryValue || 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Current stock at cost</p>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">Total COGS</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(stats?.totalCOGS || 0)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Cost of goods sold</p>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">Net Profit</p>
          <p className={`mt-2 text-2xl font-semibold ${(stats?.netProfit || 0) >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCurrency(stats?.netProfit || 0)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Revenue − COGS</p>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-border/60 p-5 shadow-soft">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Recent Invoices</h3>
          <p className="text-xs text-muted-foreground">Latest activity with FIFO profit tracking</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead>Client</TableHead><TableHead>Date</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">COGS</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No transactions yet.</TableCell></TableRow>
              ) : recentTransactions.map((t) => (
                <TableRow key={t.id} className="border-border/60">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback>{(t.client || "?")[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium">{t.client}</p>
                        <p className="text-xs text-muted-foreground">{t.invoiceNumber || t.id?.slice(-8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.issued}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(t.amount)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(t.totalCost || 0)}</TableCell>
                  <TableCell className={`text-right font-semibold ${(t.grossProfit || 0) >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(t.grossProfit || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[t.status] || ""}>{t.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
