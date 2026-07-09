import { useState } from "react";
import { Plus, Download, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/pageHeader.jsx";
import { usePurchases, useAddPurchase, useUpdatePurchaseStatus, useDeletePurchase } from "@/hooks/usePurchases";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProducts } from "@/hooks/useProducts";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";
import { exportPurchases } from "@/utils/exportUtils";

const STATUS_COLORS = {
  Received:     "bg-success/15 text-success border-success/20",
  "In Transit": "bg-warning/15 text-[oklch(0.5_0.16_75)] border-warning/20",
  Pending:      "bg-muted text-muted-foreground",
  Cancelled:    "bg-destructive/15 text-destructive border-destructive/20",
};

const getId   = (obj) => String(obj?._id || obj?.id || "");
const getName = (obj) => obj?.name || "";
const emptyLine = { product: "", variantId: "", productName: "", variantName: "", qty: 1, unitCost: 0, expiryDate: "" };

export default function PurchasesPage() {
  const { data: rawPurchases = [], isLoading } = usePurchases();
  const { data: rawSuppliers = [] }            = useSuppliers();
  const { data: rawProducts  = [] }            = useProducts();
  const { formatCurrency, symbol }             = useCurrency();

  const addPurchase          = useAddPurchase();
  const updatePurchaseStatus = useUpdatePurchaseStatus();
  const deletePurchase        = useDeletePurchase();

  const suppliers = rawSuppliers.map((s) => ({ ...s, id: getId(s) }));
  const products  = rawProducts.map((p)  => ({ ...p, id: getId(p) }));
  const purchases = rawPurchases.map((p) => ({ ...p, id: getId(p) }));

  const [showForm, setShowForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, poNumber: "" });
  const [form, setForm] = useState({
    supplierId: "", date: new Date().toISOString().split("T")[0],
    status: "Pending", items: [{ ...emptyLine }],
  });

  const totalSpend = purchases.filter((p) => p.status === "Received").reduce((s, p) => s + (p.total || 0), 0);

  const addLine    = () => setForm((f) => ({ ...f, items: [...f.items, { ...emptyLine }] }));
  const removeLine = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const updateLine = (i, field, value) => {
    setForm((f) => {
      const items = f.items.map((item, idx) => {
        if (idx !== i) return item;
        const updated = { ...item, [field]: value };
        if (field === "product") {
          const prod = products.find((p) => p.id === value);
          updated.productName = prod?.name || "";
          updated.variantId   = "";
          updated.variantName = "";
          updated.unitCost    = prod?.lastPurchasePrice || 0;
        }
        if (field === "variantId") {
          const prod    = products.find((p) => p.id === item.product);
          const variant = prod?.variants?.find((v) => getId(v) === value);
          updated.variantName = variant?.name || "";
        }
        return updated;
      });
      return { ...f, items };
    });
  };

  const lineTotal  = (item) => (Number(item.qty) || 0) * (Number(item.unitCost) || 0);
  const grandTotal = form.items.reduce((s, i) => s + lineTotal(i), 0);

  const handleExport = () => {
    if (purchases.length === 0) {
      toast.error("No purchases to export");
      return;
    }
    try {
      exportPurchases(purchases, symbol);
      toast.success("Purchases export ready for printing");
    } catch (err) {
      toast.error("Failed to export purchases");
    }
  };

  const handleSave = async () => {
    if (!form.supplierId) { toast.error("Please select a supplier"); return; }
    if (form.items.some((i) => !i.product)) { toast.error("Select a product for each line"); return; }
    const supplier = suppliers.find((s) => s.id === form.supplierId);
    try {
      await addPurchase.mutateAsync({
        supplier:     form.supplierId,
        supplierName: getName(supplier),
        date:         form.date,
        status:       form.status,
        items:        form.items.map((i) => ({
          product:     i.product,
          variantId:   i.variantId || undefined,
          productName: i.productName,
          variantName: i.variantName,
          qty:         Number(i.qty),
          unitCost:    Number(i.unitCost),
          expiryDate:  i.expiryDate || undefined,
        })),
        total: grandTotal,
      });
      toast.success("Purchase order created" + (form.status === "Received" ? " — stock batches created" : ""));
      setShowForm(false);
      setForm({ supplierId: "", date: new Date().toISOString().split("T")[0], status: "Pending", items: [{ ...emptyLine }] });
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to create purchase order"); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updatePurchaseStatus.mutateAsync({ id, status });
      toast.success(`Status → ${status}` + (status === "Received" ? " — inventory batches created" : ""));
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to update status"); }
  };

  const handleDeleteClick = (p) => {
    setDeleteDialog({ open: true, id: p.id, poNumber: p.poNumber || p.id.slice(-8) });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deletePurchase.mutateAsync(deleteDialog.id);
      toast.success("Purchase order deleted");
      setDeleteDialog({ open: false, id: null, poNumber: "" });
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to delete purchase"); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Purchases" description="Supplier orders — received purchases create FIFO inventory batches"
        actions={<>
          <Button onClick={handleExport} variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button onClick={() => setShowForm(true)} className="rounded-full gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" />New Purchase</Button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { l: "Total POs",   v: purchases.length },
          { l: "Pending",     v: purchases.filter((p) => p.status === "Pending").length },
          { l: "In Transit",  v: purchases.filter((p) => p.status === "In Transit").length },
          { l: "Total Spend", v: formatCurrency(totalSpend) },
        ].map((s) => (
          <Card key={s.l} className="border-border/60 p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="mt-2 text-2xl font-semibold">{s.v}</p>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 p-5 shadow-soft">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead>PO #</TableHead><TableHead>Supplier</TableHead><TableHead>Date</TableHead>
                <TableHead>Items</TableHead><TableHead className="text-right">Total ({symbol})</TableHead>
                <TableHead>Status</TableHead><TableHead className="w-36">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
              : purchases.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No purchase orders yet.</TableCell></TableRow>
              : purchases.map((p) => (
                <TableRow key={p.id} className="border-border/60">
                  <TableCell className="font-mono text-xs">{p.poNumber || p.id.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{p.supplierName || getName(p.supplier)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.date ? new Date(p.date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>{p.items?.length || 0}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(p.total || 0)}</TableCell>
                  <TableCell><Badge variant="outline" className={STATUS_COLORS[p.status] || ""}>{p.status}</Badge></TableCell>
                  <TableCell>
                    {p.status !== "Received" && p.status !== "Cancelled" && (
                      <Select onValueChange={(v) => handleStatusChange(p.id, v)}>
                        <SelectTrigger className="h-7 text-xs rounded-full"><SelectValue placeholder="Update…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In Transit">In Transit</SelectItem>
                          <SelectItem value="Received">Mark Received ✓</SelectItem>
                          <SelectItem value="Cancelled">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {p.status === "Received" && <span className="text-xs text-success font-medium">Batches created</span>}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(p)} className="ml-2 h-7 w-7">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create PO Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 grid gap-1.5">
                <Label>Supplier *</Label>
                <Select value={form.supplierId} onValueChange={(v) => setForm({ ...form, supplierId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                  <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine} className="h-7 rounded-full text-xs"><Plus className="mr-1 h-3 w-3" />Add Line</Button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, i) => {
                  const selectedProduct = products.find((p) => p.id === item.product);
                  return (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end rounded-lg border border-border/40 p-2">
                      {/* Product */}
                      <div className="col-span-4">
                        <Label className="text-[10px] text-muted-foreground">Product</Label>
                        <Select value={item.product} onValueChange={(v) => updateLine(i, "product", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Product…" /></SelectTrigger>
                          <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      {/* Variant */}
                      <div className="col-span-2">
                        <Label className="text-[10px] text-muted-foreground">Variant</Label>
                        <Select value={item.variantId || "none"} onValueChange={(v) => updateLine(i, "variantId", v === "none" ? "" : v)} disabled={!selectedProduct?.variants?.length}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No variant</SelectItem>
                            {(selectedProduct?.variants || []).map((v) => <SelectItem key={getId(v)} value={getId(v)}>{v.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Qty */}
                      <div className="col-span-1">
                        <Label className="text-[10px] text-muted-foreground">Qty</Label>
                        <Input type="number" min="1" value={item.qty} onChange={(e) => updateLine(i, "qty", e.target.value)} className="h-8 text-xs" />
                      </div>
                      {/* Unit cost */}
                      <div className="col-span-2">
                        <Label className="text-[10px] text-muted-foreground">Cost ({symbol})</Label>
                        <Input type="number" min="0" step="0.01" value={item.unitCost} onChange={(e) => updateLine(i, "unitCost", e.target.value)} className="h-8 text-xs" />
                      </div>
                      {/* Expiry */}
                      <div className="col-span-2">
                        <Label className="text-[10px] text-muted-foreground">Expiry</Label>
                        <Input type="date" value={item.expiryDate} onChange={(e) => updateLine(i, "expiryDate", e.target.value)} className="h-8 text-xs" />
                      </div>
                      {/* Remove */}
                      <div className="col-span-1 flex items-end">
                        {form.items.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLine(i)}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
                      </div>
                      {/* Line total */}
                      <div className="col-span-12 text-right text-xs text-muted-foreground pr-1">
                        Line total: {formatCurrency(lineTotal(item))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-end text-sm font-semibold">Grand Total: {formatCurrency(grandTotal)}</div>
            </div>

            <div className="grid gap-1.5">
              <Label>Initial Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Received">Received — creates stock batches immediately</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={addPurchase.isPending} className="gradient-primary text-primary-foreground">
              {addPurchase.isPending ? "Creating…" : "Create Purchase Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Purchase Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: null, poNumber: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 mt-2">
              <p>This will permanently delete purchase order <strong>{deleteDialog.poNumber}</strong> and all associated inventory batches.</p>
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-destructive">
                ⚠️ This action cannot be undone.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Purchase Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
