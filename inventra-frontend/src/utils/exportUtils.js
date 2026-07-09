/**
 * Export utilities for generating printable A4 PDF documents
 * Supports: Products/Inventory, Invoices, Ledger entries, Reports, Purchases
 */

export const exportInventory = (products, symbol = "Rs") => {
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  // Calculate totals
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.inventoryValue || 0), 0);
  const lowStockCount = products.filter(p => p.status === "Low Stock").length;
  const outOfStockCount = products.filter(p => p.status === "Out of Stock").length;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Inventory Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body {
            font-family: 'Arial', sans-serif;
            background: white;
            color: #333;
            padding: 20mm;
            line-height: 1.5;
          }
          .container { max-width: 100%; margin: 0 auto; }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 12px;
            color: #6b7280;
          }
          
          .meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            font-size: 11px;
          }
          
          .meta-item {
            padding: 10px;
            background: #f3f4f6;
            border-left: 3px solid #4f46e5;
          }
          
          .meta-label {
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 3px;
          }
          
          .meta-value {
            font-size: 16px;
            font-weight: bold;
            color: #111827;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          thead {
            background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
            color: white;
          }
          
          thead th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }
          
          tbody td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
          }
          
          tbody tr:nth-child(odd) {
            background: #f9fafb;
          }
          
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          
          .page-break { page-break-after: always; margin-top: 40px; }
          
          @media print {
            body { padding: 10mm; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>INVENTORY REPORT</h1>
            <p>Inventra POS System</p>
          </div>
          
          <div class="meta">
            <div class="meta-item">
              <div class="meta-label">Total Products</div>
              <div class="meta-value">${totalProducts}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Total Value</div>
              <div class="meta-value">${symbol} ${totalValue.toFixed(2)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Low Stock Items</div>
              <div class="meta-value">${lowStockCount}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Out of Stock</div>
              <div class="meta-value">${outOfStockCount}</div>
            </div>
          </div>
          
          <div class="meta" style="margin-bottom: 20px; background: white; border: 1px solid #e5e7eb; padding: 10px;">
            <div style="font-size: 11px; color: #6b7280;"><strong>Generated:</strong> ${currentDate} at ${currentTime}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Brand</th>
                <th class="text-right">Stock</th>
                <th class="text-right">Selling Price</th>
                <th class="text-right">Value</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td><strong>${p.name || "—"}</strong></td>
                  <td>${p.sku || "—"}</td>
                  <td>${p.category || "—"}</td>
                  <td>${p.brand || "—"}</td>
                  <td class="text-right">${p.totalStock || 0}</td>
                  <td class="text-right">${symbol} ${(p.sellingPrice || 0).toFixed(2)}</td>
                  <td class="text-right"><strong>${symbol} ${(p.inventoryValue || 0).toFixed(2)}</strong></td>
                  <td class="text-center"><strong>${p.status || "—"}</strong></td>
                </tr>
                ${p.variants && p.variants.length > 0 ? p.variants.map(v => `
                  <tr style="background: #f3f4f6;">
                    <td style="padding-left: 30px;">↳ ${v.name}</td>
                    <td>${v.sku || "—"}</td>
                    <td colspan="2">${v.size ? v.size : ""} ${v.color ? v.color : ""}</td>
                    <td class="text-right">${v.totalStock || 0}</td>
                    <td class="text-right">${symbol} ${(v.sellingPrice || 0).toFixed(2)}</td>
                    <td class="text-right">${symbol} ${(v.inventoryValue || 0).toFixed(2)}</td>
                    <td></td>
                  </tr>
                `).join("") : ""}
              `).join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is an autogenerated report from Inventra POS System</p>
            <p>For internal use only</p>
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

export const exportInvoices = (invoices, symbol = "Rs") => {
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  // Calculate totals
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === "Paid").length;
  const pendingInvoices = invoices.filter(inv => inv.status === "Pending").length;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoices Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body {
            font-family: 'Arial', sans-serif;
            background: white;
            color: #333;
            padding: 20mm;
            line-height: 1.5;
          }
          .container { max-width: 100%; margin: 0 auto; }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 12px;
            color: #6b7280;
          }
          
          .meta {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
            font-size: 11px;
          }
          
          .meta-item {
            padding: 10px;
            background: #f3f4f6;
            border-left: 3px solid #4f46e5;
          }
          
          .meta-label {
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 3px;
          }
          
          .meta-value {
            font-size: 16px;
            font-weight: bold;
            color: #111827;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          thead {
            background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
            color: white;
          }
          
          thead th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }
          
          tbody td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
          }
          
          tbody tr:nth-child(odd) {
            background: #f9fafb;
          }
          
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
          }
          
          .badge-paid { background: #d1fae5; color: #065f46; }
          .badge-pending { background: #fef3c7; color: #92400e; }
          .badge-overdue { background: #fee2e2; color: #991b1b; }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          
          @media print {
            body { padding: 10mm; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>INVOICES REPORT</h1>
            <p>Inventra POS System</p>
          </div>
          
          <div class="meta">
            <div class="meta-item">
              <div class="meta-label">Total Invoices</div>
              <div class="meta-value">${invoices.length}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Total Amount</div>
              <div class="meta-value">${symbol} ${totalAmount.toFixed(2)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Paid/Pending</div>
              <div class="meta-value">${paidInvoices}/${pendingInvoices}</div>
            </div>
          </div>
          
          <div class="meta" style="margin-bottom: 20px; background: white; border: 1px solid #e5e7eb; padding: 10px; grid-template-columns: 1fr;">
            <div style="font-size: 11px; color: #6b7280;"><strong>Generated:</strong> ${currentDate} at ${currentTime}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th class="text-right">Amount</th>
                <th class="text-right">COGS</th>
                <th class="text-right">Profit</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map(inv => `
                <tr>
                  <td><strong>${inv.invoiceNumber || inv.id?.slice(-6) || "—"}</strong></td>
                  <td>${inv.client || "—"}</td>
                  <td>${inv.issued ? new Date(inv.issued).toLocaleDateString() : "—"}</td>
                  <td>${inv.due ? new Date(inv.due).toLocaleDateString() : "—"}</td>
                  <td class="text-right"><strong>${symbol} ${(inv.amount || 0).toFixed(2)}</strong></td>
                  <td class="text-right">${symbol} ${(inv.totalCost || 0).toFixed(2)}</td>
                  <td class="text-right">${symbol} ${(inv.grossProfit || 0).toFixed(2)}</td>
                  <td class="text-center">
                    <span class="badge badge-${inv.status?.toLowerCase() || 'pending'}">${inv.status || "Pending"}</span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is an autogenerated report from Inventra POS System</p>
            <p>For internal use only</p>
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

export const exportLedger = (entries, symbol = "Rs") => {
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  // Calculate totals
  const totalDebit = entries.reduce((sum, e) => sum + (e.type === "Debit" ? e.amount || 0 : 0), 0);
  const totalCredit = entries.reduce((sum, e) => sum + (e.type === "Credit" ? e.amount || 0 : 0), 0);
  const balance = totalDebit - totalCredit;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Ledger Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body {
            font-family: 'Arial', sans-serif;
            background: white;
            color: #333;
            padding: 20mm;
            line-height: 1.5;
          }
          .container { max-width: 100%; margin: 0 auto; }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 12px;
            color: #6b7280;
          }
          
          .meta {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
            font-size: 11px;
          }
          
          .meta-item {
            padding: 10px;
            background: #f3f4f6;
            border-left: 3px solid #4f46e5;
          }
          
          .meta-label {
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 3px;
          }
          
          .meta-value {
            font-size: 16px;
            font-weight: bold;
            color: #111827;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          thead {
            background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
            color: white;
          }
          
          thead th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }
          
          tbody td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
          }
          
          tbody tr:nth-child(odd) {
            background: #f9fafb;
          }
          
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          .debit { color: #10b981; font-weight: bold; }
          .credit { color: #ef4444; font-weight: bold; }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          
          @media print {
            body { padding: 10mm; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LEDGER REPORT</h1>
            <p>Inventra POS System</p>
          </div>
          
          <div class="meta">
            <div class="meta-item">
              <div class="meta-label">Total Debit</div>
              <div class="meta-value debit">${symbol} ${totalDebit.toFixed(2)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Total Credit</div>
              <div class="meta-value credit">${symbol} ${totalCredit.toFixed(2)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Balance</div>
              <div class="meta-value">${symbol} ${balance.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="meta" style="margin-bottom: 20px; background: white; border: 1px solid #e5e7eb; padding: 10px; grid-template-columns: 1fr;">
            <div style="font-size: 11px; color: #6b7280;"><strong>Generated:</strong> ${currentDate} at ${currentTime}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Description</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${entry.date ? new Date(entry.date).toLocaleDateString() : "—"}</td>
                  <td><strong>${entry.account || "—"}</strong></td>
                  <td>${entry.description || "—"}</td>
                  <td class="text-right debit">${entry.type === "Debit" ? symbol + " " + (entry.amount || 0).toFixed(2) : "—"}</td>
                  <td class="text-right credit">${entry.type === "Credit" ? symbol + " " + (entry.amount || 0).toFixed(2) : "—"}</td>
                  <td class="text-right"><strong>${symbol} ${(entry.balance || 0).toFixed(2)}</strong></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is an autogenerated report from Inventra POS System</p>
            <p>For internal use only</p>
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


export const exportPurchases = (purchases, symbol = "Rs") => {
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  // Calculate totals
  const totalAmount = purchases.reduce((sum, p) => sum + (p.totalAmount || p.total || 0), 0);
  const totalItems = purchases.reduce((sum, p) => sum + (p.totalItems || 0), 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Purchases Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body {
            font-family: 'Arial', sans-serif;
            background: white;
            color: #333;
            padding: 20mm;
            line-height: 1.5;
          }
          .container { max-width: 100%; margin: 0 auto; }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 12px;
            color: #6b7280;
          }
          
          .meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            font-size: 11px;
          }
          
          .meta-item {
            padding: 10px;
            background: #f3f4f6;
            border-left: 3px solid #4f46e5;
          }
          
          .meta-label {
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 3px;
          }
          
          .meta-value {
            font-size: 16px;
            font-weight: bold;
            color: #111827;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          thead {
            background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
            color: white;
          }
          
          thead th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }
          
          tbody td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
          }
          
          tbody tr:nth-child(odd) {
            background: #f9fafb;
          }
          
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          
          @media print {
            body { padding: 10mm; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PURCHASES REPORT</h1>
            <p>Inventra POS System</p>
          </div>
          
          <div class="meta">
            <div class="meta-item">
              <div class="meta-label">Total Purchases</div>
              <div class="meta-value">${purchases.length}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Total Amount</div>
              <div class="meta-value">${symbol} ${totalAmount.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="meta" style="margin-bottom: 20px; background: white; border: 1px solid #e5e7eb; padding: 10px; grid-template-columns: 1fr;">
            <div style="font-size: 11px; color: #6b7280;"><strong>Generated:</strong> ${currentDate} at ${currentTime}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Supplier</th>
                <th>Date</th>
                <th class="text-right">Items</th>
                <th class="text-right">Amount</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${purchases.map(p => `
                <tr>
                  <td><strong>${p.referenceNumber || p.id?.slice(-6) || "—"}</strong></td>
                  <td>${p.supplier || p.supplierName || "—"}</td>
                  <td>${p.date ? new Date(p.date).toLocaleDateString() : "—"}</td>
                  <td class="text-right">${p.totalItems || 0}</td>
                  <td class="text-right"><strong>${symbol} ${(p.totalAmount || p.total || 0).toFixed(2)}</strong></td>
                  <td class="text-center"><strong>${p.status || "—"}</strong></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is an autogenerated report from Inventra POS System</p>
            <p>For internal use only</p>
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

export const exportReports = (reportData, year, symbol = "Rs") => {
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  const { totalRevenue = 0, totalCOGS = 0, grossProfit = 0, topProducts = [], trend = [] } = reportData;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Reports & Analytics Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body {
            font-family: 'Arial', sans-serif;
            background: white;
            color: #333;
            padding: 20mm;
            line-height: 1.5;
          }
          .container { max-width: 100%; margin: 0 auto; }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 12px;
            color: #6b7280;
          }
          
          .meta {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
            font-size: 11px;
          }
          
          .meta-item {
            padding: 10px;
            background: #f3f4f6;
            border-left: 3px solid #4f46e5;
          }
          
          .meta-label {
            font-weight: bold;
            color: #6b7280;
            margin-bottom: 3px;
          }
          
          .meta-value {
            font-size: 16px;
            font-weight: bold;
            color: #111827;
          }
          
          .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #111827;
            margin-top: 25px;
            margin-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          thead {
            background: linear-gradient(90deg, #4f46e5 0%, #4338ca 100%);
            color: white;
          }
          
          thead th {
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
          }
          
          tbody td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
          }
          
          tbody tr:nth-child(odd) {
            background: #f9fafb;
          }
          
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          
          @media print {
            body { padding: 10mm; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            @page { size: A4; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>REPORTS & ANALYTICS - ${year}</h1>
            <p>Inventra POS System — Profit & Loss Analysis</p>
          </div>
          
          <div class="meta">
            <div class="meta-item">
              <div class="meta-label">Total Revenue (${symbol})</div>
              <div class="meta-value">${symbol} ${totalRevenue.toFixed(2)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Total COGS (${symbol})</div>
              <div class="meta-value">${symbol} ${totalCOGS.toFixed(2)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Gross Profit (${symbol})</div>
              <div class="meta-value">${symbol} ${grossProfit.toFixed(2)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Gross Margin</div>
              <div class="meta-value">${grossMargin}%</div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px; background: white; border: 1px solid #e5e7eb; padding: 10px;">
            <div style="font-size: 11px; color: #6b7280;"><strong>Generated:</strong> ${currentDate} at ${currentTime}</div>
          </div>
          
          <div class="section-title">Top Selling Products</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th class="text-right">Units Sold</th>
                <th class="text-right">Revenue (${symbol})</th>
                <th class="text-right">Profit (${symbol})</th>
                <th class="text-right">Margin</th>
              </tr>
            </thead>
            <tbody>
              ${(topProducts || []).length === 0 ? 
                '<tr><td colspan="7" class="text-center">No sales data available</td></tr>' :
                topProducts.map((p, i) => {
                  const margin = p.totalRevenue > 0 ? ((p.grossProfit / p.totalRevenue) * 100).toFixed(1) : "0";
                  return `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${p.name || "—"}</td>
                      <td class="text-right">${p.sku || "—"}</td>
                      <td class="text-right">${p.totalQty || 0}</td>
                      <td class="text-right">${symbol} ${(p.totalRevenue || 0).toFixed(2)}</td>
                      <td class="text-right">${symbol} ${(p.grossProfit || 0).toFixed(2)}</td>
                      <td class="text-right">${margin}%</td>
                    </tr>
                  `;
                }).join("")
              }
            </tbody>
          </table>
          
          <div class="footer">
            <p>This is an autogenerated report from Inventra POS System</p>
            <p>For internal use only</p>
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
