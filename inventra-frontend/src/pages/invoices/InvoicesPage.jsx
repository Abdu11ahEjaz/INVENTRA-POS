import { useState, useRef } from "react";
import { Plus, Printer, Download, Eye, Trash2, TrendingUp, Clock, AlertCircle, CheckCircle, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/common/PageHeader";
import InvoiceReceipt from "@/components/common/InvoiceReceipt";
import { useInvoices, useAddInvoice, useUpdateInvoiceStatus } from "@/hooks/useInvoices";
import { useProducts } from "@/hooks/useProducts";
import { useCurrency } from "@/hooks/useCurrency";
import { useSalesTrend } from "@/hooks/useAnalytics";
import { toast } from "sonner";
import { exportInvoices } from "@/utils/exportUtils";

const statusColor = {
  Paid:    "bg-success/15 text-success border-success/20",
  Pending: "bg-warning/15 text-[oklch(0.5_0.16_75)] border-warning/20",
  Overdue: "bg-destructive/15 text-destructive border-destructive/20",
};

const getId = (obj) => String(obj?._id || obj?.id || "");

const defaultForm = () => ({
  client: "", due: "", notes: "Thank you for your business!",
  items: [{ product: "", variantId: "", name: "", qty: 1, unitPrice: 0 }],
});

export default function InvoicesPage() {
  const { data: rawInvoices = [], isLoading } = useInvoices();
  const { data: rawProducts = [] }            = useProducts();
  const { data: trend = [] }                  = useSalesTrend(new Date().getFullYear());
  const { formatCurrency, symbol }            = useCurrency();
  const addInvoice          = useAddInvoice();
  const updateInvoiceStatus = useUpdateInvoiceStatus();

  const invoices = rawInvoices.map((inv) => ({
    ...inv, id: getId(inv),
    amount: inv.total ?? inv.amount ?? 0,
    issued: inv.issued ? new Date(inv.issued).toLocaleDateString() : "—",
    due:    inv.due    ? new Date(inv.due).toLocaleDateString()    : "—",
  }));

  const products = rawProducts.map((p) => ({ ...p, id: getId(p) }));

  // Revenue stats
  const paidInvoices  = invoices.filter((i) => i.status === "Paid");
  const today         = new Date().toDateString();
  const todayRevenue  = paidInvoices.filter((i) => new Date(i.issued || i.createdAt).toDateString() === today).reduce((s, i) => s + i.amount, 0);
  const monthRevenue  = paidInvoices.filter((i) => { const d = new Date(i.issued || i.createdAt); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).reduce((s, i) => s + i.amount, 0);

  const [preview,  setPreview]  = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(defaultForm);
  const printRef = useRef(null);

  // ── Form helpers ──────────────────────────────────────────────
  const addLine    = () => setForm((f) => ({ ...f, items: [...f.items, { product: "", variantId: "", name: "", qty: 1, unitPrice: 0 }] }));
  const removeLine = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const setLineField = (i, field, value) => {
    setForm((f) => {
      const items = f.items.map((item, idx) => {
        if (idx !== i) return item;
        const updated = { ...item, [field]: value };
        if (field === "product") {
          const prod = products.find((p) => p.id === value);
          updated.name      = prod?.name || "";
          updated.unitPrice = prod?.sellingPrice || 0;
          updated.variantId = "";
        }
        if (field === "variantId" && value) {
          const prod    = products.find((p) => p.id === item.product);
          const variant = prod?.variants?.find((v) => getId(v) === value);
          if (variant) {
            updated.name      = `${prod.name} — ${variant.name}`;
            updated.unitPrice = variant.sellingPrice || item.unitPrice;
          }
        }
        return updated;
      });
      return { ...f, items };
    });
  };

  const lineTotal  = (item) => (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
  const grandTotal = form.items.reduce((s, i) => s + lineTotal(i), 0);

  const openForm  = () => { setForm(defaultForm()); setShowForm(true); };
  const closeForm = () => setShowForm(false);

  const handleExport = () => {
    if (invoices.length === 0) {
      toast.error("No invoices to export");
      return;
    }
    try {
      exportInvoices(invoices, symbol);
      toast.success("Invoices export ready for printing");
    } catch (err) {
      toast.error("Failed to export invoices");
    }
  };

  const handleSave = async () => {
    if (!form.client.trim()) { toast.error("Client name is required"); return; }
    if (form.items.some((i) => !i.name.trim())) { toast.error("Fill in all line items"); return; }
    try {
      await addInvoice.mutateAsync({
        client: form.client, due: form.due, notes: form.notes,
        items: form.items.map((i) => ({
          product:   (i.product && i.product !== "__custom") ? i.product : undefined,
          variantId: i.variantId || undefined,
          name:      i.name,
          qty:       Number(i.qty),
          unitPrice: Number(i.unitPrice),
        })),
        amount: grandTotal, status: "Pending",
      });
      toast.success("Invoice created — FIFO stock deducted");
      closeForm();
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to create invoice"); }
  };

  const handleStatusChange = async (inv, newStatus) => {
    if (inv.status === newStatus) return;
    try { await updateInvoiceStatus.mutateAsync({ id: inv.id, status: newStatus }); toast.success(`Invoice marked as ${newStatus}`); }
    catch (err) { toast.error(err?.response?.data?.message || "Failed to update status"); }
  };

  const handlePrint = (inv) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=900,height=1200");
    
    // Create complete HTML with all styles inline
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${inv.invoiceNumber || inv.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html {
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              color: #1f2937;
              padding: 20px;
              line-height: 1.6;
              margin: 0;
            }
            
            .invoice-container {
              max-width: 100%;
              margin: 0 auto;
              background: white;
            }
            
            /* Header Section */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 25px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .logo-section {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            
            .logo {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 50px;
              height: 50px;
              border-radius: 8px;
              background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
              color: white;
              font-weight: bold;
              font-size: 18px;
              flex-shrink: 0;
            }
            
            .company-info h2 {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            
            .company-info p {
              font-size: 11px;
              color: #6b7280;
            }
            
            .invoice-title {
              font-size: 40px;
              font-weight: bold;
              color: #111827;
              margin-left: auto;
            }
            
            /* Invoice Info Bar */
            .info-bar {
              display: flex;
              align-items: center;
              gap: 20px;
              margin-bottom: 25px;
              padding-bottom: 20px;
              flex-wrap: wrap;
            }
            
            .invoice-number-badge {
              background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
              color: white;
              padding: 10px 20px;
              border-radius: 0 25px 25px 0;
              font-weight: bold;
              font-size: 12px;
              white-space: nowrap;
              flex-shrink: 0;
            }
            
            .info-item {
              display: flex;
              flex-direction: column;
              gap: 3px;
            }
            
            .info-item label {
              font-size: 10px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
            }
            
            .info-item value {
              font-size: 12px;
              font-weight: bold;
              color: #111827;
            }
            
            .status-paid { color: #10b981; }
            .status-pending { color: #f59e0b; }
            .status-overdue { color: #ef4444; }
            
            /* Bill To Section */
            .bill-to {
              margin-bottom: 25px;
            }
            
            .bill-to-label {
              font-size: 10px;
              font-weight: bold;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 6px;
            }
            
            .bill-to-name {
              font-size: 16px;
              font-weight: bold;
              color: #111827;
            }
            
            .bill-to-details {
              font-size: 11px;
              color: #6b7280;
              margin-top: 3px;
            }
            
            /* Table Section */
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              table-layout: fixed;
            }
            
            thead tr {
              background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
              color: white;
            }
            
            thead th {
              padding: 10px 8px;
              text-align: left;
              font-weight: bold;
              font-size: 11px;
              word-wrap: break-word;
            }
            
            tbody tr:nth-child(odd) {
              background-color: #f9fafb;
            }
            
            tbody tr:nth-child(even) {
              background-color: white;
            }
            
            tbody td {
              padding: 10px 8px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 11px;
              word-wrap: break-word;
            }
            
            td.text-right {
              text-align: right;
            }
            
            td.text-center {
              text-align: center;
            }
            
            td.font-bold {
              font-weight: bold;
            }
            
            tbody tr:last-child td {
              border-bottom: none;
            }
            
            /* Totals Section */
            .totals-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 30px;
            }
            
            .totals-box {
              width: 280px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #d1d5db;
              font-size: 11px;
            }
            
            .total-row.final {
              background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
              color: white;
              padding: 12px 15px;
              border-radius: 0 25px 25px 0;
              font-weight: bold;
              font-size: 13px;
              border: none;
              margin-top: 8px;
              justify-content: space-between;
              align-items: center;
            }
            
            .total-label {
              font-weight: 600;
            }
            
            .total-value {
              text-align: right;
              font-weight: bold;
            }
            
            /* Payment Info */
            .payment-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
              padding: 15px 0;
              border-top: 1px solid #e5e7eb;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .payment-section h3 {
              font-size: 11px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            
            .payment-info-content {
              font-size: 10px;
              color: #6b7280;
              line-height: 1.6;
            }
            
            .payment-info-content strong {
              font-weight: 600;
              color: #111827;
              display: block;
              margin-top: 5px;
            }
            
            /* Signature */
            .signature-section {
              margin: 30px 0;
            }
            
            .signature-line {
              width: 150px;
              border-top: 2px solid #111827;
              padding-top: 6px;
              text-align: center;
              font-size: 10px;
              font-weight: bold;
              color: #111827;
            }
            
            /* Footer */
            .footer {
              background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
              color: white;
              padding: 12px 15px;
              border-radius: 25px 0 0 25px;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
              margin-top: 20px;
            }
            
            /* Print Styles */
            @media print {
              html, body {
                width: 100%;
                height: 100%;
                margin: 0 !important;
                padding: 0 !important;
                background: white;
              }
              
              body {
                padding: 10mm !important;
              }
              
              .invoice-container {
                width: 100%;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none;
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              @page {
                size: A4;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="logo-section">
                <div class="logo">IN</div>
                <div class="company-info">
                  <h2>Inventra POS</h2>
                  <p>Point of Sale System</p>
                </div>
              </div>
              <div class="invoice-title">INVOICE</div>
            </div>
            
            <!-- Invoice Info -->
            <div class="info-bar">
              <div class="invoice-number-badge">Invoice # ${inv.invoiceNumber || inv.id?.slice(-6).toUpperCase()}</div>
              <div class="info-item">
                <label>Date</label>
                <value>${inv.issued || new Date().toLocaleDateString()}</value>
              </div>
              <div class="info-item">
                <label>Due Date</label>
                <value>${inv.due || "—"}</value>
              </div>
              <div class="info-item">
                <label>Status</label>
                <value class="status-${inv.status?.toLowerCase() || 'pending'}">${inv.status || "Pending"}</value>
              </div>
            </div>
            
            <!-- Bill To -->
            <div class="bill-to">
              <div class="bill-to-label">Invoice to:</div>
              <div class="bill-to-name">${inv.client}</div>
              ${inv.clientEmail ? `<div class="bill-to-details">${inv.clientEmail}</div>` : ""}
              ${inv.clientPhone ? `<div class="bill-to-details">${inv.clientPhone}</div>` : ""}
            </div>
            
            <!-- Items Table -->
            <table>
              <thead>
                <tr>
                  <th style="width: 8%;">SL.</th>
                  <th style="width: 45%;">Item Description</th>
                  <th style="width: 15%; text-align: right;">Price</th>
                  <th style="width: 12%; text-align: center;">Qty.</th>
                  <th style="width: 20%; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${((inv.items?.length ? inv.items : [{ name: "Services", qty: 1, unitPrice: inv.amount }]).map((item, idx) => `
                  <tr>
                    <td style="width: 8%; text-align: center;">${idx + 1}</td>
                    <td style="width: 45%;">${item.name}</td>
                    <td style="width: 15%; text-align: right;">${symbol}${(Number(item.unitPrice) || 0).toFixed(2)}</td>
                    <td style="width: 12%; text-align: center;">${item.qty}</td>
                    <td style="width: 20%; text-align: right; font-weight: bold;">${symbol}${((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}</td>
                  </tr>
                `).join(""))}
                
                <!-- Empty rows for spacing -->
                ${Array.from({ length: Math.max(0, 3 - (inv.items?.length || 1)) }).map(() => `
                  <tr>
                    <td colspan="5" style="height: 35px; border-bottom: 1px solid #e5e7eb;"></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            
            <!-- Totals -->
            <div class="totals-section">
              <div class="totals-box">
                <div class="total-row">
                  <span class="total-label">Sub Total:</span>
                  <span class="total-value">${symbol}${(inv.amount || 0).toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span class="total-label">Tax (0%):</span>
                  <span class="total-value">${symbol}0.00</span>
                </div>
                <div class="total-row final">
                  <span class="total-label">Total:</span>
                  <span class="total-value">${symbol}${(inv.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <!-- Payment Info -->
            <div class="payment-section">
              <div>
                <h3>Payment Information:</h3>
                <div class="payment-info-content">
                  <strong>Account #:</strong>
                  Your bank account number
                  <strong>A/C Name:</strong>
                  Inventra POS
                  <strong>Bank Details:</strong>
                  Add your bank details here
                </div>
              </div>
              <div>
                <h3>Terms & Conditions:</h3>
                <div class="payment-info-content">
                  ${inv.notes || "Payment must be received within the due date. Late payments may incur additional charges. Thank you for your business."}
                </div>
              </div>
            </div>
            
            <!-- Signature -->
            <div class="signature-section">
              <div class="signature-line">Authorised Signature</div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              Thank you for your business
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Write content to print window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print after content loads
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // -- Handle Thermal Printer Receipt Print ---
  const handlePrintThermal = (inv) => {
    // Create a new window for printing (80mm width)
    const printWindow = window.open("", "_blank", "width=400,height=600");
    
    const items = inv.items?.length ? inv.items : [{ name: "Services", qty: 1, unitPrice: inv.amount }];
    const subtotal = inv.amount || 0;
    
    // Thermal receipt HTML with 80mm width
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Receipt ${inv.invoiceNumber || inv.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 80mm;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Courier New', monospace;
              background: white;
              color: #000;
              padding: 5mm;
              line-height: 1.4;
            }
            
            .receipt-container {
              width: 100%;
              text-align: center;
            }
            
            /* Header */
            .header {
              margin-bottom: 8mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 5mm;
            }
            
            .company-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 2mm;
            }
            
            .company-tag {
              font-size: 9px;
              color: #666;
              margin-bottom: 3mm;
            }
            
            /* Invoice Info */
            .invoice-info {
              font-size: 9px;
              margin-bottom: 8mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 5mm;
              text-align: left;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2mm;
            }
            
            .info-label {
              font-weight: bold;
            }
            
            .info-value {
              text-align: right;
            }
            
            /* Client */
            .client-section {
              font-size: 10px;
              font-weight: bold;
              margin-bottom: 6mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 4mm;
              text-align: left;
            }
            
            .client-label {
              font-size: 8px;
              color: #666;
              margin-bottom: 1mm;
            }
            
            /* Items Table */
            .items-section {
              margin-bottom: 6mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 4mm;
            }
            
            .table-header {
              font-size: 8px;
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding-bottom: 2mm;
              margin-bottom: 3mm;
              display: grid;
              grid-template-columns: 30px 1fr 35px;
              gap: 2mm;
              text-align: right;
            }
            
            .table-header div:first-child {
              text-align: left;
            }
            
            .item-row {
              font-size: 8px;
              margin-bottom: 2mm;
              display: grid;
              grid-template-columns: 30px 1fr 35px;
              gap: 2mm;
              text-align: right;
            }
            
            .item-row div:first-child {
              text-align: left;
            }
            
            .item-name {
              font-size: 8px;
              text-align: left;
              word-break: break-word;
            }
            
            /* Totals */
            .totals-section {
              font-size: 9px;
              margin-bottom: 6mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 4mm;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2mm;
              padding: 2mm 0;
            }
            
            .total-row.final {
              font-weight: bold;
              font-size: 11px;
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 4mm 0;
              margin-top: 2mm;
            }
            
            /* Footer */
            .footer {
              font-size: 8px;
              text-align: center;
              margin-top: 6mm;
              color: #666;
            }
            
            .thank-you {
              font-weight: bold;
              font-size: 10px;
              margin: 4mm 0;
              color: #000;
            }
            
            .timestamp {
              font-size: 7px;
              margin-top: 2mm;
            }
            
            /* Print Styles */
            @media print {
              body {
                width: 80mm;
                margin: 0;
                padding: 3mm;
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              @page {
                size: 80mm auto;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- Header -->
            <div class="header">
              <div class="company-name">INVENTRA POS</div>
              <div class="company-tag">Receipt/Invoice</div>
            </div>
            
            <!-- Invoice Info -->
            <div class="invoice-info">
              <div class="info-row">
                <span class="info-label">Receipt #:</span>
                <span class="info-value">${inv.invoiceNumber || inv.id?.slice(-6).toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${inv.issued || new Date().toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Time:</span>
                <span class="info-value">${new Date().toLocaleTimeString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${inv.status || "Pending"}</span>
              </div>
            </div>
            
            <!-- Client -->
            <div class="client-section">
              <div class="client-label">SOLD TO:</div>
              <div>${inv.client}</div>
            </div>
            
            <!-- Items -->
            <div class="items-section">
              <div class="table-header">
                <div>Item</div>
                <div style="text-align: center;">Qty</div>
                <div>Amount</div>
              </div>
              
              ${items.map((item, idx) => `
                <div class="item-row">
                  <div class="item-name">${item.name}</div>
                  <div style="text-align: center;">${item.qty}x${(Number(item.unitPrice) || 0).toFixed(0)}</div>
                  <div>${symbol}${((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}</div>
                </div>
              `).join("")}
            </div>
            
            <!-- Totals -->
            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${symbol}${subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Tax (0%):</span>
                <span>${symbol}0.00</span>
              </div>
              <div class="total-row final">
                <span>TOTAL:</span>
                <span>${symbol}${subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="thank-you">Thank you!</div>
              <div>Please come again</div>
              <div class="timestamp">${new Date().toLocaleString()}</div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Sales & Invoices" description="Create sales invoices — FIFO stock deducted, COGS tracked automatically"
        actions={<>
          <Button onClick={handleExport} variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button onClick={openForm} className="rounded-full gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" />New Invoice</Button>
        </>}
      />

      {/* Revenue stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-sky-400" /><p className="text-xs text-muted-foreground">Today's Revenue</p></div>
          <p className="text-2xl font-semibold">{formatCurrency(todayRevenue)}</p>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-success" /><p className="text-xs text-muted-foreground">Paid</p></div>
          <p className="text-2xl font-semibold">{invoices.filter(i => i.status === "Paid").length}</p>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Pending</p></div>
          <p className="text-2xl font-semibold">{invoices.filter(i => i.status === "Pending").length}</p>
        </Card>
        <Card className="border-border/60 p-5 shadow-soft">
          <div className="flex items-center gap-2 mb-1"><AlertCircle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Overdue</p></div>
          <p className="text-2xl font-semibold">{invoices.filter(i => i.status === "Overdue").length}</p>
        </Card>
      </div>

      {/* Revenue trend chart */}
      <Card className="border-border/60 p-5 shadow-soft">
        <h3 className="text-base font-semibold mb-4">Revenue Trend — {new Date().getFullYear()}</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} formatter={(v) => [formatCurrency(v), "Revenue"]} />
              <Area type="monotone" dataKey="sales" stroke="var(--color-chart-1)" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Invoices table */}
      <Card className="border-border/60 p-5 shadow-soft">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead><TableHead>Client</TableHead><TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Revenue ({symbol})</TableHead>
                <TableHead className="text-right">COGS ({symbol})</TableHead>
                <TableHead className="text-right">Profit ({symbol})</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
              ) : invoices.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No invoices yet. Click "New Invoice" to create one.</TableCell></TableRow>
              ) : invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.invoiceNumber || inv.id.slice(-8)}</TableCell>
                  <TableCell className="font-medium">{inv.client}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.issued}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.due}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(inv.amount)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(inv.totalCost || 0)}</TableCell>
                  <TableCell className={`text-right font-semibold ${(inv.grossProfit || 0) >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(inv.grossProfit || 0)}
                  </TableCell>
                  <TableCell>
                    {/* Use native select to avoid Radix dialog conflict */}
                    <select
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv, e.target.value)}
                      className="h-7 rounded-full border border-border bg-background px-2 text-xs focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setPreview(inv)}><Eye className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handlePrint(inv)} title="Print as A4 Invoice"><Printer className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handlePrintThermal(inv)} title="Print as Receipt (Thermal)"><Receipt className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Preview Dialog ── */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Invoice Receipt</DialogTitle></DialogHeader>
          {preview && (
            <div ref={printRef} className="bg-white rounded-lg overflow-hidden">
              <InvoiceReceipt invoice={preview} companyName="Inventra POS" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
            <Button onClick={() => preview && handlePrintThermal(preview)} className="gap-2">
              <Receipt className="h-4 w-4" />
              Print Receipt
            </Button>
            <Button onClick={() => preview && handlePrint(preview)} className="gradient-primary text-primary-foreground">
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Invoice Dialog ── */}
      {/* Using a separate mounted component pattern to avoid Radix Select/Dialog conflict */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader><DialogTitle>New Sales Invoice</DialogTitle></DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-4">
            {/* Client + Due */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Client Name *</Label>
                <Input
                  value={form.client}
                  onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))}
                  placeholder="Acme Corp"
                  autoFocus
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={form.due} onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))} />
              </div>
            </div>

            {/* Line items */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine} className="h-7 rounded-full text-xs">
                  <Plus className="mr-1 h-3 w-3" />Add Line
                </Button>
              </div>

              <div className="space-y-2">
                {form.items.map((item, i) => {
                  const selectedProduct = products.find((p) => p.id === item.product);
                  return (
                    <div key={i} className="rounded-lg border border-border/40 p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Product — native select avoids Radix dialog conflict */}
                        <div className="grid gap-1">
                          <Label className="text-[10px] text-muted-foreground">Product</Label>
                          <select
                            value={item.product}
                            onChange={(e) => setLineField(i, "product", e.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="">Select product…</option>
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            <option value="__custom">Custom item…</option>
                          </select>
                        </div>

                        {/* Variant */}
                        <div className="grid gap-1">
                          <Label className="text-[10px] text-muted-foreground">Variant</Label>
                          <select
                            value={item.variantId}
                            onChange={(e) => setLineField(i, "variantId", e.target.value)}
                            disabled={!selectedProduct?.variants?.length}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                          >
                            <option value="">No variant</option>
                            {(selectedProduct?.variants || []).map((v) => (
                              <option key={getId(v)} value={getId(v)}>{v.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Item name (editable for custom) */}
                      {(item.product === "__custom" || !item.product) && (
                        <div className="grid gap-1">
                          <Label className="text-[10px] text-muted-foreground">Item Name *</Label>
                          <Input value={item.name} onChange={(e) => setLineField(i, "name", e.target.value)} placeholder="Custom item description" className="h-8 text-sm" />
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="grid gap-1">
                          <Label className="text-[10px] text-muted-foreground">Qty</Label>
                          <Input type="number" min="1" value={item.qty} onChange={(e) => setLineField(i, "qty", e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-[10px] text-muted-foreground">Price ({symbol})</Label>
                          <Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => setLineField(i, "unitPrice", e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="text-sm font-semibold text-muted-foreground">{formatCurrency(lineTotal(item))}</span>
                          {form.items.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLine(i)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-end text-sm font-bold">
                Grand Total: {formatCurrency(grandTotal)}
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={closeForm}>Cancel</Button>
            <Button onClick={handleSave} disabled={addInvoice.isPending} className="gradient-primary text-primary-foreground">
              {addInvoice.isPending ? "Creating…" : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
