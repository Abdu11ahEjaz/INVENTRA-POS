/**
 * Reports Controller
 * Comprehensive reporting: sales, purchases, inventory valuation, P&L, supplier analysis
 * CSV export support for all report types
 */
import asyncHandler from "express-async-handler";
import Invoice from "../models/Invoice.js";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import InventoryBatch from "../models/InventoryBatch.js";
import { getAllStockSummary } from "../services/stockService.js";

/**
 * CSV Helper — converts array of objects to CSV format
 */
const generateCSV = (data, headers) => {
  if (!data || data.length === 0) return "";

  const cols = headers || Object.keys(data[0]);
  const csv = [];

  csv.push(cols.map(h => `"${h}"`).join(","));

  data.forEach(row => {
    const values = cols.map(col => {
      let val = row[col];
      if (val === null || val === undefined) val = "";
      if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csv.push(values.join(","));
  });

  return csv.join("\n");
};

// GET /api/reports/sales
export const salesReport = asyncHandler(async (req, res) => {
  const { from, to, productId, categoryFilter, salesperson, export: exportType } = req.query;

  const filter = { status: "Paid" };

  if (from || to) {
    filter.issued = {};
    if (from) filter.issued.$gte = new Date(from);
    if (to) filter.issued.$lte = new Date(to);
  }

  let invoices = await Invoice.find(filter)
    .populate("createdBy", "name email")
    .sort({ issued: -1 });

  if (productId) {
    invoices = invoices.filter(inv =>
      inv.items.some(item => String(item.product) === productId)
    );
  }

  if (salesperson) {
    invoices = invoices.filter(inv =>
      inv.createdBy && inv.createdBy.name.includes(salesperson)
    );
  }

  const productIds = new Set();
  invoices.forEach(inv => inv.items.forEach(item => {
    if (item.product) productIds.add(String(item.product));
  }));

  const products = await Product.find({ _id: { $in: Array.from(productIds) } });
  const productMap = Object.fromEntries(products.map(p => [String(p._id), p]));

  const data = [];
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      const prod = productMap[String(item.product)];
      if (categoryFilter && prod?.category !== categoryFilter) return;

      data.push({
        invoiceNumber: inv.invoiceNumber,
        date: inv.issued?.toISOString().split("T")[0],
        client: inv.client,
        productName: prod?.name || "Unknown",
        sku: prod?.sku || "",
        category: prod?.category || "",
        variantName: item.variantName || "",
        quantity: item.qty,
        unitPrice: item.unitPrice,
        unitCost: item.unitCost || 0,
        total: item.total,
        totalCost: item.totalCost || 0,
        grossProfit: (item.total || 0) - (item.totalCost || 0),
        salesperson: inv.createdBy?.name || "Unknown",
      });
    });
  });

  const summary = {
    totalSales: data.reduce((s, d) => s + d.total, 0),
    totalQty: data.reduce((s, d) => s + d.quantity, 0),
    totalCOGS: data.reduce((s, d) => s + d.totalCost, 0),
    totalGrossProfit: data.reduce((s, d) => s + d.grossProfit, 0),
  };

  if (exportType === "csv") {
    const csv = generateCSV(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="sales-report.csv"');
    return res.send(csv);
  }

  res.json({ data, summary });
});

// GET /api/reports/purchases
export const purchaseReport = asyncHandler(async (req, res) => {
  const { from, to, supplierId, productId, export: exportType } = req.query;
  const filter = { status: "Received" };

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  let purchases = await Purchase.find(filter)
    .populate("supplier", "name email")
    .populate("createdBy", "name")
    .sort({ date: -1 });

  if (supplierId) {
    purchases = purchases.filter(p => String(p.supplier?._id) === supplierId);
  }

  const productIds = new Set();
  purchases.forEach(p => p.items.forEach(item => {
    if (item.product) productIds.add(String(item.product));
  }));

  const products = await Product.find({ _id: { $in: Array.from(productIds) } });
  const productMap = Object.fromEntries(products.map(p => [String(p._id), p]));

  const data = [];
  purchases.forEach(p => {
    p.items.forEach(item => {
      if (productId && String(item.product) !== productId) return;

      const prod = productMap[String(item.product)];
      data.push({
        poNumber: p.poNumber,
        date: p.date?.toISOString().split("T")[0],
        supplier: p.supplier?.name || "Unknown",
        productName: prod?.name || "Unknown",
        sku: prod?.sku || "",
        variantName: item.variantName || "",
        quantity: item.qty,
        unitCost: item.unitCost,
        total: item.qty * item.unitCost,
        expiryDate: item.expiryDate?.toISOString().split("T")[0] || "N/A",
        createdBy: p.createdBy?.name || "",
      });
    });
  });

  const summary = {
    totalPurchases: data.reduce((s, d) => s + d.total, 0),
    totalQty: data.reduce((s, d) => s + d.quantity, 0),
  };

  if (exportType === "csv") {
    const csv = generateCSV(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="purchase-report.csv"');
    return res.send(csv);
  }

  res.json({ data, summary });
});

// GET /api/reports/inventory-valuation
export const inventoryValuationReport = asyncHandler(async (req, res) => {
  const { export: exportType } = req.query;

  const batches = await InventoryBatch.aggregate([
    { $match: { isActive: true, remainingQuantity: { $gt: 0 } } },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $lookup: {
        from: "suppliers",
        localField: "supplier",
        foreignField: "_id",
        as: "supplierData",
      },
    },
    {
      $unwind: {
        path: "$productData",
        preserveNullAndEmpty: true,
      },
    },
    {
      $unwind: {
        path: "$supplierData",
        preserveNullAndEmpty: true,
      },
    },
    {
      $addFields: {
        batchValue: {
          $multiply: ["$remainingQuantity", "$purchasePrice"],
        },
      },
    },
    {
      $project: {
        batchNumber: 1,
        productName: "$productData.name",
        sku: "$productData.sku",
        category: "$productData.category",
        supplier: "$supplierData.name",
        quantity: "$remainingQuantity",
        unitCost: "$purchasePrice",
        batchValue: 1,
        purchaseDate: 1,
        expiryDate: 1,
      },
    },
    { $sort: { purchaseDate: 1 } },
  ]);

  const data = batches.map(b => ({
    batchNumber: b.batchNumber,
    productName: b.productName || "Unknown",
    sku: b.sku || "",
    category: b.category || "",
    supplier: b.supplier || "Unknown",
    quantity: b.quantity,
    unitCost: b.unitCost,
    totalValue: b.batchValue,
    purchaseDate: b.purchaseDate?.toISOString().split("T")[0],
    expiryDate: b.expiryDate?.toISOString().split("T")[0] || "N/A",
  }));

  const totalValue = data.reduce((s, d) => s + d.totalValue, 0);

  if (exportType === "csv") {
    const csv = generateCSV(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="inventory-valuation.csv"');
    return res.send(csv);
  }

  res.json({ data, totalValue, itemCount: data.length });
});

// GET /api/reports/profit-loss
export const profitLossReport = asyncHandler(async (req, res) => {
  const { from, to, export: exportType } = req.query;
  const filter = { status: "Paid" };

  if (from || to) {
    filter.issued = {};
    if (from) filter.issued.$gte = new Date(from);
    if (to) filter.issued.$lte = new Date(to);
  }

  const invoices = await Invoice.find(filter);

  const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
  const totalCOGS = invoices.reduce((s, i) => s + (i.totalCost || 0), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : 0;

  const operatingExpenses = Number(req.query.operatingExpenses) || 0;
  const netProfit = grossProfit - operatingExpenses;
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

  const data = [
    { metric: "Total Revenue", value: totalRevenue },
    { metric: "Total COGS", value: totalCOGS },
    { metric: "Gross Profit", value: grossProfit },
    { metric: "Gross Margin %", value: grossMargin },
    { metric: "Operating Expenses", value: operatingExpenses },
    { metric: "Net Profit", value: netProfit },
    { metric: "Net Margin %", value: netMargin },
  ];

  if (exportType === "csv") {
    const csv = generateCSV(data, ["metric", "value"]);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="profit-loss.csv"');
    return res.send(csv);
  }

  res.json({
    period: `${from || "All time"} to ${to || "Today"}`,
    totalRevenue,
    totalCOGS,
    grossProfit,
    grossMargin: Number(grossMargin),
    operatingExpenses,
    netProfit,
    netMargin: Number(netMargin),
  });
});

// GET /api/reports/supplier-purchases
export const supplierPurchaseReport = asyncHandler(async (req, res) => {
  const { export: exportType } = req.query;

  const result = await Purchase.aggregate([
    { $match: { status: "Received" } },
    {
      $lookup: {
        from: "suppliers",
        localField: "supplier",
        foreignField: "_id",
        as: "supplierData",
      },
    },
    {
      $unwind: {
        path: "$supplierData",
        preserveNullAndEmpty: true,
      },
    },
    {
      $group: {
        _id: "$supplier",
        supplierName: { $first: "$supplierData.name" },
        totalPurchases: { $sum: "$total" },
        totalOrders: { $sum: 1 },
        lastPurchaseDate: { $max: "$date" },
      },
    },
    { $sort: { totalPurchases: -1 } },
  ]);

  const data = result.map(r => ({
    supplier: r.supplierName || "Unknown",
    totalPurchases: r.totalPurchases,
    totalOrders: r.totalOrders,
    averageOrderValue: (r.totalPurchases / r.totalOrders).toFixed(2),
    lastPurchaseDate: r.lastPurchaseDate?.toISOString().split("T")[0],
  }));

  const summary = {
    totalSupplierSpend: data.reduce((s, d) => s + d.totalPurchases, 0),
    uniqueSuppliers: data.length,
    averageSpenderPerSupplier: (data.reduce((s, d) => s + d.totalPurchases, 0) / data.length).toFixed(2),
  };

  if (exportType === "csv") {
    const csv = generateCSV(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="supplier-purchases.csv"');
    return res.send(csv);
  }

  res.json({ data, summary });
});

// POST /api/reports/export/:type
export const exportReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  let reportData = [];
  let filename = "report.csv";

  switch (type) {
    case "sales":
      const invoices = await Invoice.find({ status: "Paid" });
      reportData = [];
      invoices.forEach(inv => {
        inv.items.forEach(item => {
          reportData.push({
            invoice: inv.invoiceNumber,
            client: inv.client,
            product: item.name,
            qty: item.qty,
            price: item.unitPrice,
            total: item.total,
          });
        });
      });
      filename = "sales-export.csv";
      break;

    case "purchases":
      const purchases = await Purchase.find({ status: "Received" });
      reportData = [];
      purchases.forEach(p => {
        p.items.forEach(item => {
          reportData.push({
            po: p.poNumber,
            supplier: p.supplierName,
            product: item.productName,
            qty: item.qty,
            cost: item.unitCost,
            total: item.qty * item.unitCost,
          });
        });
      });
      filename = "purchases-export.csv";
      break;

    case "inventory":
      const batches = await InventoryBatch.find({ isActive: true })
        .populate("product", "name sku")
        .populate("supplier", "name");
      reportData = batches.map(b => ({
        batch: b.batchNumber,
        product: b.product?.name,
        sku: b.product?.sku,
        qty: b.remainingQuantity,
        cost: b.purchasePrice,
        value: b.remainingQuantity * b.purchasePrice,
      }));
      filename = "inventory-export.csv";
      break;

    default:
      return res.status(400).json({ error: "Invalid report type" });
  }

  const csv = generateCSV(reportData);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
});
