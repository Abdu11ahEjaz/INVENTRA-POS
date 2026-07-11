import { useState } from "react";
import { Plus, Filter, Download, Search, Upload, Pencil, Trash2, ChevronDown, ChevronRight, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrency } from "@/hooks/useCurrency";
import { useInventoryValuation } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import apiClient from "@/api/axios";
import { exportInventory } from "@/utils/exportUtils";

const CATEGORIES = ["Electronics","Sports","Lifestyle","Fashion","Food","Tools","Clothing","Other"];
const SIZES      = ["XS","S","M","L","XL","XXL","XXXL"];

const statusColor = {
  "In Stock":     "bg-success/15 text-success border-success/20",
  "Low Stock":    "bg-warning/15 text-[oklch(0.5_0.16_75)] border-warning/20",
  "Out of Stock": "bg-destructive/15 text-destructive border-destructive/20",
};

const emptyVariant = { name: "", size: "", color: "", sellingPrice: "", sku: "" };
const emptyForm    = { name: "", sku: "", category: "", brand: "", description: "", sellingPrice: "", imageFile: null, variants: [] };

export default function InventoryPage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: valuation }                = useInventoryValuation();
  const { formatCurrency, symbol }         = useCurrency();
  const deleteProduct = useDeleteProduct();
  const qc = useQueryClient();

  const [search,     setSearch]     = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [imgPreview, setImgPreview] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [expanded,   setExpanded]   = useState({});

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = products.length;
  const totalValue    = valuation?.totalValue || 0;
  const lowStock      = products.filter((p) => p.status === "Low Stock").length;
  const outOfStock    = products.filter((p) => p.status === "Out of Stock").length;

  const openCreate = () => { setEditId(null); setForm(emptyForm); setImgPreview(""); setShowForm(true); };
  const openEdit   = (p) => {
    setEditId(p._id || p.id);
    setForm({ name: p.name || "", sku: p.sku || "", category: p.category || "", brand: p.brand || "", description: p.description || "", sellingPrice: String(p.sellingPrice || ""), imageFile: null, variants: p.variants || [] });
    setImgPreview(p.image || "");
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, imageFile: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const addVariant    = () => setForm((f) => ({ ...f, variants: [...f.variants, { ...emptyVariant }] }));
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  const updateVariant = (i, field, value) => setForm((f) => {
    const variants = f.variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v);
    return { ...f, variants };
  });

  const handleSave = async () => {
    if (!form.name) { toast.error("Product name is required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",         form.name);
      fd.append("sku",          form.sku);
      fd.append("category",     form.category);
      fd.append("brand",        form.brand);
      fd.append("description",  form.description);
      fd.append("sellingPrice", form.sellingPrice || "0");
      if (form.variants.length > 0) fd.append("variants", JSON.stringify(form.variants));
      if (form.imageFile) fd.append("image", form.imageFile);

      if (editId) {
        await apiClient.put(`/products/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product updated");
      } else {
        await apiClient.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product added");
      }
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try { await deleteProduct.mutateAsync(id); toast.success("Product deleted"); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to delete"); }
  };

  const toggleExpand = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const handleExport = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    try {
      exportInventory(products, symbol);
      toast.success("Inventory export ready for printing");
    } catch (err) {
      toast.error("Failed to export inventory");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Product catalog with batch stock tracking"
        actions={<>
          <Button onClick={handleExport} variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button onClick={openCreate} className="rounded-full gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" />Add Product</Button>
        </>}
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Products",  value: totalProducts },
          { label: `Inventory Value (${symbol})`, value: formatCurrency(totalValue) },
          { label: "Low Stock",       value: lowStock },
          { label: "Out of Stock",    value: outOfStock },
        ].map((s) => (
          <Card key={s.label} className="border-border/60 p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border/60 p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, SKU, brand…" className="h-10 rounded-full bg-secondary pl-9" />
          </div>
          <Button variant="outline" className="rounded-full"><Filter className="mr-2 h-4 w-4" />Filter</Button>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Package className="h-8 w-8 opacity-30" />
            {search ? "No products match your search." : "No products yet. Click \"Add Product\" to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="w-8" />
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead className="text-right">Last Cost</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const pid = p._id || p.id;
                  const hasVariants = p.variants?.length > 0;
                  const isOpen = expanded[pid];
                  return [
                    <TableRow key={pid} className="border-border/60">
                      <TableCell>
                        {hasVariants && (
                          <button onClick={() => toggleExpand(pid)} className="text-muted-foreground hover:text-foreground transition">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.image ? <img src={p.image} alt={p.name} className="h-9 w-9 rounded-lg object-cover border border-border/60" />
                            : <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">{p.name?.[0] || "?"}</div>}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                      <TableCell><Badge variant="secondary" className="rounded-full">{p.category || "—"}</Badge></TableCell>
                      <TableCell className={cn("text-right font-semibold", (p.totalStock || 0) === 0 && "text-destructive")}>
                        {hasVariants ? p.variants.reduce((s, v) => s + (v.totalStock || 0), 0) : (p.totalStock || 0)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(p.sellingPrice || 0)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{p.lastPurchasePrice ? formatCurrency(p.lastPurchasePrice) : "—"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.inventoryValue || 0)}</TableCell>
                      <TableCell><Badge variant="outline" className={statusColor[p.status] || ""}>{p.status || "—"}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(pid)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>,
                    // Variant rows
                    ...(hasVariants && isOpen ? p.variants.map((v) => (
                      <TableRow key={`${pid}-${v._id}`} className="border-border/60 bg-muted/30">
                        <TableCell />
                        <TableCell className="pl-10">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">↳</span>
                            <span className="text-sm">{v.name}</span>
                            {v.size  && <Badge variant="outline" className="text-[10px] rounded-full">{v.size}</Badge>}
                            {v.color && <Badge variant="outline" className="text-[10px] rounded-full">{v.color}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{v.sku || "—"}</TableCell>
                        <TableCell />
                        <TableCell className={cn("text-right font-semibold text-sm", (v.totalStock || 0) === 0 && "text-destructive")}>{v.totalStock || 0}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(v.sellingPrice || 0)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{v.lastPurchasePrice ? formatCurrency(v.lastPurchasePrice) : "—"}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(v.inventoryValue || 0)}</TableCell>
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    )) : []),
                  ];
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Image */}
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted overflow-hidden">
                {imgPreview ? <img src={imgPreview} alt="preview" className="h-full w-full object-cover" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div>
                <Label className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition">
                  Upload Image<input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </Label>
                <p className="mt-1 text-[11px] text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 grid gap-1.5">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cotton T-Shirt" />
              </div>
              <div className="grid gap-1.5">
                <Label>SKU <span className="text-muted-foreground text-[10px]">(auto if blank)</span></Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU-0001" />
              </div>
              <div className="grid gap-1.5">
                <Label>Brand</Label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Nike, Adidas…" />
              </div>
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Default Selling Price ({symbol})</Label>
                <Input type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} placeholder="0.00" />
              </div>
              <div className="col-span-2 grid gap-1.5">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional product description" />
              </div>
            </div>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Variants <span className="text-muted-foreground text-[10px]">(size/color — optional)</span></Label>
                <Button type="button" variant="outline" size="sm" onClick={addVariant} className="h-7 rounded-full text-xs"><Plus className="mr-1 h-3 w-3" />Add Variant</Button>
              </div>
              {form.variants.length > 0 && (
                <div className="space-y-2 rounded-lg border border-border p-3">
                  {form.variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-3">
                        <Select value={v.size} onValueChange={(val) => updateVariant(i, "size", val)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Size" /></SelectTrigger>
                          <SelectContent>{SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} placeholder="Color" className="h-8 text-xs" />
                      </div>
                      <div className="col-span-3">
                        <Input type="number" value={v.sellingPrice} onChange={(e) => updateVariant(i, "sellingPrice", e.target.value)} placeholder={`Price (${symbol})`} className="h-8 text-xs" />
                      </div>
                      <div className="col-span-2">
                        <Input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} placeholder="SKU" className="h-8 text-xs" />
                      </div>
                      <div className="col-span-1">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeVariant(i)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground">
              {saving ? "Saving…" : editId ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
