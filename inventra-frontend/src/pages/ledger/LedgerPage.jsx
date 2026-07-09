import { useState } from "react";
import { Plus, Download, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/common/pageHeader.jsx";
import { useLedger, useAddLedgerEntry, useDeleteLedgerEntry } from "@/hooks/useLedger";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";
import { exportLedger } from "@/utils/exportUtils";

const ACCOUNTS = ["Sales Revenue","Inventory","Accounts Receivable","Cash","Office Expense","Accounts Payable","Tax Payable","Other"];

export default function LedgerPage() {
  const { data, isLoading, isError } = useLedger();
  const { formatCurrency, symbol } = useCurrency();

  const entries = Array.isArray(data) ? data : [];

  const addEntry = useAddLedgerEntry();
  const deleteEntry = useDeleteLedgerEntry();

  const [showForm, setShowForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [form, setForm] = useState({ account: "", description: "", debit: "", credit: "", date: new Date().toISOString().split("T")[0] });

  const totalDebit  = entries.reduce((a, e) => a + (Number(e.debit)  || 0), 0);
  const totalCredit = entries.reduce((a, e) => a + (Number(e.credit) || 0), 0);
  const balance     = totalCredit - totalDebit;

  const handleSave = async () => {
    if (!form.account || !form.description) { toast.error("Account and description are required"); return; }
    try {
      await addEntry.mutateAsync({ ...form, debit: Number(form.debit) || 0, credit: Number(form.credit) || 0 });
      toast.success("Entry added");
      setShowForm(false);
      setForm({ account: "", description: "", debit: "", credit: "", date: new Date().toISOString().split("T")[0] });
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to add entry"); }
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteEntry.mutateAsync(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete entry");
    }
  };

  const handleExport = () => {
    if (entries.length === 0) {
      toast.error("No ledger entries to export");
      return;
    }
    try {
      exportLedger(entries, symbol);
      toast.success("Ledger export ready for printing");
    } catch (err) {
      toast.error("Failed to export ledger");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Ledger" description="Double-entry accounting and journal entries"
        actions={<>
          <Button onClick={handleExport} variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button onClick={() => setShowForm(true)} className="rounded-full gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" />New Entry</Button>
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">Total Debit ({symbol})</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalDebit)}</p>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">Total Credit ({symbol})</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalCredit)}</p>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">Balance ({symbol})</p>
          <p className={`mt-2 text-2xl font-semibold ${balance >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(balance)}</p>
        </Card>
      </div>

      <Card className="border-border/60 p-5 shadow-soft">
        <h3 className="text-base font-semibold">Journal Entries</h3>
        <div className="mt-4 overflow-x-auto">
          {isLoading && <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading entries…</div>}
          {isError   && <div className="flex h-32 items-center justify-center text-sm text-destructive">Failed to load. Please refresh.</div>}
          {!isLoading && !isError && entries.length === 0 && <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No journal entries yet.</div>}
          {!isLoading && !isError && entries.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead>Date</TableHead><TableHead>Reference</TableHead><TableHead>Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit ({symbol})</TableHead>
                  <TableHead className="text-right">Credit ({symbol})</TableHead>
                  <TableHead className="w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e._id || e.id} className="border-border/60">
                    <TableCell className="text-sm text-muted-foreground">{e.date ? new Date(e.date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{String(e._id || e.id || "").slice(-8)}</TableCell>
                    <TableCell className="font-medium">{e.account}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.description}</TableCell>
                    <TableCell className="text-right font-semibold">{e.debit  ? formatCurrency(e.debit)  : "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-success">{e.credit ? formatCurrency(e.credit) : "—"}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(e._id || e.id)}
                        disabled={deleteEntry.isPending}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Account *</Label>
              <Select value={form.account} onValueChange={(v) => setForm({ ...form, account: v })}>
                <SelectTrigger><SelectValue placeholder="Select account…" /></SelectTrigger>
                <SelectContent>{ACCOUNTS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Description *</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Journal entry description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Debit ({symbol})</Label>
                <Input type="number" min="0" value={form.debit} onChange={(e) => setForm({ ...form, debit: e.target.value })} placeholder="0" />
              </div>
              <div className="grid gap-1.5">
                <Label>Credit ({symbol})</Label>
                <Input type="number" min="0" value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={addEntry.isPending} className="gradient-primary text-primary-foreground">
              {addEntry.isPending ? "Saving…" : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ledger Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the entry and the ledger totals will be recalculated. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteEntry.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteEntry.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
