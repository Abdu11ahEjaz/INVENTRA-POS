import { useState } from "react";
import { Plus, Pencil, Trash2, Search, Phone, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/common/PageHeader";
import { useSuppliers, useAddSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/useSuppliers";
import { toast } from "sonner";

const CATEGORIES = ["Electronics", "Sports", "Lifestyle", "Fashion", "Food", "Tools", "Other"];

const emptyForm = { name: "", contact: "", email: "", phone: "", address: "", categories: [], status: "Active" };

// Normalize MongoDB _id → id
const getId = (obj) => String(obj?._id || obj?.id || "");

export default function SuppliersPage() {
  const { data: rawSuppliers = [], isLoading } = useSuppliers();
  const addSupplier    = useAddSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  // Normalize all suppliers to consistent id field
  const suppliers = rawSuppliers.map((s) => ({ ...s, id: getId(s) }));

  const [search,   setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm);

  const filtered = suppliers.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditId(s.id);
    setForm({
      name:       s.name       || "",
      contact:    s.contact    || "",
      email:      s.email      || "",
      phone:      s.phone      || "",
      address:    s.address    || "",
      categories: s.categories || [],
      status:     s.status     || "Active",
    });
    setShowForm(true);
  };

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Supplier name is required"); return; }
    try {
      if (editId) {
        await updateSupplier.mutateAsync({ id: editId, payload: form });
        toast.success("Supplier updated");
      } else {
        await addSupplier.mutateAsync(form);
        toast.success("Supplier added");
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save supplier");
    }
  };

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: "", purchaseCount: 0 });

  const handleDeleteClick = (s) => {
    setDeleteDialog({ open: true, id: s.id, name: s.name, purchaseCount: 0 });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteSupplier.mutateAsync(deleteDialog.id);
      toast.success("Supplier deleted");
      setDeleteDialog({ open: false, id: null, name: "", purchaseCount: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete supplier");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage supplier relationships and batch tracking"
        actions={
          <Button onClick={openCreate} className="rounded-full gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />Add Supplier
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Suppliers", value: suppliers.length },
          { label: "Active",          value: suppliers.filter((s) => s.status === "Active").length },
          { label: "Categories",      value: [...new Set(suppliers.flatMap((s) => s.categories || []))].length },
        ].map((s) => (
          <Card key={s.label} className="border-border/60 p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border/60 p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suppliers…" className="h-10 rounded-full bg-secondary pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {search ? "No suppliers match your search." : "No suppliers yet. Click \"Add Supplier\" to get started."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id} className="border-border/60">
                    <TableCell>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{s.id.slice(-8)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        {s.contact && <p className="font-medium text-foreground">{s.contact}</p>}
                        {s.email   && <p className="flex items-center gap-1"><Mail  className="h-3 w-3" />{s.email}</p>}
                        {s.phone   && <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(s.categories || []).map((c) => (
                          <Badge key={c} variant="secondary" className="rounded-full text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={s.status === "Active"
                          ? "bg-success/15 text-success border-success/20"
                          : "bg-muted text-muted-foreground"}
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(s)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 grid gap-1.5">
                <Label>Company Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Global Tech Distributors"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Contact Person</Label>
                <Input
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1-555-0101"
                />
              </div>
              <div className="col-span-2 grid gap-1.5">
                <Label>Email</Label>
                <Input
                  type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@supplier.com"
                />
              </div>
              <div className="col-span-2 grid gap-1.5">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main St, City"
                />
              </div>
              <div className="col-span-2 grid gap-1.5">
                <Label>Product Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat} type="button" onClick={() => toggleCategory(cat)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        form.categories.includes(cat)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={addSupplier.isPending || updateSupplier.isPending}
              className="gradient-primary text-primary-foreground"
            >
              {addSupplier.isPending || updateSupplier.isPending
                ? "Saving…"
                : editId ? "Save Changes" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog with Cascade Warning */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: null, name: "", purchaseCount: 0 })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Supplier?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 mt-2">
              <p>Deleting <strong>{deleteDialog.name}</strong> will also permanently delete all purchases associated with this supplier.</p>
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-destructive">
                ⚠️ This action cannot be undone.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Supplier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
