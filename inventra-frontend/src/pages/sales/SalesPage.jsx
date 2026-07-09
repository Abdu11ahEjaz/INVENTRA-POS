import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/pageHeader.jsx";
import { useInvoices } from "@/hooks/useInvoices";
import { useCurrency } from "@/hooks/useCurrency";
import { salesData } from "@/lib/mock-data";

const getId = (obj) => String(obj?._id || obj?.id || "");

export default function SalesPage() {
  const { data: rawInvoices = [], isLoading } = useInvoices();
  const { formatCurrency, symbol } = useCurrency();

  const invoices = rawInvoices.map((i) => ({ ...i, id: getId(i), amount: i.total ?? i.amount ?? 0 }));

  const paidInvoices = invoices.filter((i) => i.status === "Paid");
  const today = new Date().toDateString();
  const todayRevenue  = paidInvoices.filter((i) => new Date(i.issued || i.createdAt).toDateString() === today).reduce((s, i) => s + i.amount, 0);
  const weekRevenue   = paidInvoices.filter((i) => { const d = new Date(i.issued || i.createdAt); return (Date.now() - d.getTime()) < 7 * 86400000; }).reduce((s, i) => s + i.amount, 0);
  const monthRevenue  = paidInvoices.filter((i) => { const d = new Date(i.issued || i.createdAt); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Sales" description="Track orders, revenue and customer activity"
        actions={<>
          <Button variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button className="rounded-full gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" />New Sale</Button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Today",      v: formatCurrency(todayRevenue) },
          { l: "This Week",  v: formatCurrency(weekRevenue) },
          { l: "This Month", v: formatCurrency(monthRevenue) },
        ].map((s) => (
          <Card key={s.l} className="border-border/60 p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="mt-2 text-2xl font-semibold">{s.v}</p>
            <p className="mt-1 text-xs text-success">Live from invoices</p>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 p-5 shadow-soft">
        <h3 className="text-base font-semibold">Revenue Trend</h3>
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }}
                formatter={(value) => [formatCurrency(value), "Sales"]}
              />
              <Area type="monotone" dataKey="sales" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-border/60 p-5 shadow-soft">
        <h3 className="text-base font-semibold">Recent Sales</h3>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead>Invoice #</TableHead><TableHead>Client</TableHead><TableHead>Date</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-right">Total ({symbol})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
              : invoices.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No sales yet.</TableCell></TableRow>
              : invoices.slice(0, 10).map((t) => (
                <TableRow key={t.id} className="border-border/60">
                  <TableCell className="font-mono text-xs">{t.invoiceNumber || t.id.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{t.client}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.issued ? new Date(t.issued).toLocaleDateString() : "—"}</TableCell>
                  <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(t.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
