import asyncHandler from "express-async-handler";
import Invoice from "../models/Invoice.js";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import InventoryBatch from "../models/InventoryBatch.js";
import { getAllStockSummary } from "../services/stockService.js";
import { generateExpiryReport } from "../services/batchExpiryService.js";

// GET /api/analytics/dashboard
export const getDashboard = asyncHandler(async (_req, res) => {
  const [invoices, purchases, stockSummary] = await Promise.all([
    Invoice.find(),
    Purchase.find({ status: "Received" }),
    getAllStockSummary(),
  ]);

  const totalRevenue   = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.total, 0);
  const totalCOGS      = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + (i.totalCost || 0), 0);
  const grossProfit    = totalRevenue - totalCOGS;
  const totalExpenses  = purchases.reduce((s, p) => s + p.total, 0);
  const netProfit      = grossProfit;
  const invoiceDue     = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + i.total, 0);
  const inventoryValue = stockSummary.reduce((s, b) => s + b.inventoryValue, 0);

  res.json({ totalRevenue, totalCOGS, grossProfit, netProfit, totalExpenses, invoiceDue, inventoryValue });
});

// GET /api/analytics/net-profit?from=&to=&operatingExpenses=
export const getNetProfit = asyncHandler(async (req, res) => {
  const { from, to, operatingExpenses } = req.query;
  
  const filter = { status: "Paid" };

  if (from || to) {
    filter.issued = {};
    if (from) filter.issued.$gte = new Date(from);
    if (to)   filter.issued.$lte = new Date(to);
  }

  const invoices = await Invoice.find(filter);
  
  const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);
  const totalCOGS = invoices.reduce((s, i) => s + (i.totalCost || 0), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const opEx = Number(operatingExpenses) || 0;
  const netProfit = grossProfit - opEx;

  res.json({
    totalRevenue,
    totalCOGS,
    grossProfit,
    operatingExpenses: opEx,
    netProfit,
  });
});

// GET /api/analytics/sales-trend — monthly for current year
export const getSalesTrend = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const data = await Promise.all(months.map(async (month, i) => {
    const start = new Date(year, i, 1);
    const end = new Date(year, i + 1, 0, 23, 59, 59);

    const [salesAgg, purchaseAgg] = await Promise.all([
      Invoice.aggregate([
        { $match: { issued: { $gte: start, $lte: end }, status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$total" }, cogs: { $sum: "$totalCost" } } },
      ]),
      Purchase.aggregate([
        { $match: { date: { $gte: start, $lte: end }, status: "Received" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    return {
      month,
      sales: salesAgg[0]?.total || 0,
      cogs: salesAgg[0]?.cogs || 0,
      profit: (salesAgg[0]?.total || 0) - (salesAgg[0]?.cogs || 0),
      purchase: purchaseAgg[0]?.total || 0,
    };
  }));

  res.json(data);
});

// GET /api/analytics/top-products — top selling by revenue
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;

  try {
    const result = await Invoice.aggregate([
      { $match: { status: "Paid" } },
      { $unwind: "$items" },
      { $match: { "items.product": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$items.product",
          totalQty: { $sum: "$items.qty" },
          totalRevenue: { $sum: "$items.total" },
          totalCOGS: { $sum: "$items.totalCost" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmpty: true } },
      {
        $project: {
          name: { $ifNull: ["$product.name", "Unknown"] },
          sku: "$product.sku",
          totalQty: 1,
          totalRevenue: 1,
          totalCOGS: 1,
          grossProfit: { $subtract: ["$totalRevenue", "$totalCOGS"] },
        },
      },
    ]);

    res.json(result || []);
  } catch (err) {
    res.json([]);
  }
});

// GET /api/analytics/top-products-by-quantity — top selling by quantity
export const getTopProductsByQuantity = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;

  const result = await Invoice.aggregate([
    { $match: { status: "Paid" } },
    { $unwind: "$items" },
    { $match: { "items.product": { $exists: true, $ne: null } } },
    {
      $group: {
        _id: "$items.product",
        totalQty: { $sum: "$items.qty" },
        totalRevenue: { $sum: "$items.total" },
        totalCOGS: { $sum: "$items.totalCost" },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmpty: true } },
    {
      $project: {
        name:         { $ifNull: ["$product.name", "Unknown"] },
        sku:          "$product.sku",
        totalQty:     1,
        totalRevenue: 1,
        totalCOGS:    1,
        grossProfit:  { $subtract: ["$totalRevenue", "$totalCOGS"] },
      },
    },
  ]);

  res.json(result);
});

// GET /api/analytics/inventory-turnover — turnover rate for products
export const getInventoryTurnover = asyncHandler(async (req, res) => {
  const months = Number(req.query.months) || 12;
  
  const dateThreshold = new Date(new Date().getTime() - months * 30 * 24 * 60 * 60 * 1000);

  // Get total sales qty per product
  const salesByProduct = await Invoice.aggregate([
    { $match: { status: "Paid", issued: { $gte: dateThreshold } } },
    { $unwind: "$items" },
    { $match: { "items.product": { $exists: true, $ne: null } } },
    {
      $group: {
        _id:        "$items.product",
        totalSold:  { $sum: "$items.qty" },
        totalRevenue: { $sum: "$items.total" },
      },
    },
  ]);

  // Get current inventory per product
  const currentStock = await getAllStockSummary();

  // Calculate turnover rate (sold / current)
  const result = salesByProduct.map(sale => {
    const stock = currentStock.find(s => String(s.productId) === String(sale._id));
    const currentQty = stock?.totalStock || 0;
    const turnoverRate = currentQty > 0 ? (sale.totalSold / currentQty).toFixed(2) : 0;

    return {
      productId:    sale._id,
      unitsSold:    sale.totalSold,
      currentStock: currentQty,
      turnoverRate: Number(turnoverRate),
      revenue:      sale.totalRevenue,
    };
  });

  // Enrich with product info
  const productIds = result.map(r => r.productId);
  const products = await Product.find({ _id: { $in: productIds } }, "name sku category");
  const productMap = Object.fromEntries(products.map(p => [String(p._id), p]));

  const enriched = result.map(r => ({
    ...r,
    productName: productMap[String(r.productId)]?.name || "Unknown",
    sku:         productMap[String(r.productId)]?.sku  || "",
  }));

  res.json({ months, period: `Last ${months} months`, data: enriched });
});

// GET /api/analytics/stock-age — batch age analysis
export const getStockAgeAnalysis = asyncHandler(async (req, res) => {
  const ageThreshold = Number(req.query.days) || 90;

  const result = await InventoryBatch.aggregate([
    {
      $match: {
        isActive: true,
        remainingQuantity: { $gt: 0 },
      },
    },
    {
      $addFields: {
        ageInDays: {
          $divide: [
            { $subtract: [new Date(), "$purchaseDate"] },
            1000 * 60 * 60 * 24,
          ],
        },
        ageCategory: {
          $cond: [
            { $lt: [{ $divide: [{ $subtract: [new Date(), "$purchaseDate"] }, 1000 * 60 * 60 * 24] }, 30] },
            "Fresh (0-30 days)",
            {
              $cond: [
                { $lt: [{ $divide: [{ $subtract: [new Date(), "$purchaseDate"] }, 1000 * 60 * 60 * 24] }, 60] },
                "Medium (30-60 days)",
                {
                  $cond: [
                    { $lt: [{ $divide: [{ $subtract: [new Date(), "$purchaseDate"] }, 1000 * 60 * 60 * 24] }, 90] },
                    "Aged (60-90 days)",
                    "Very Aged (90+ days)",
                  ],
                },
              ],
            },
          ],
        },
        inventoryValue: {
          $multiply: ["$remainingQuantity", "$purchasePrice"],
        },
      },
    },
    {
      $lookup: {
        from:         "products",
        localField:   "product",
        foreignField: "_id",
        as:           "productData",
      },
    },
    {
      $unwind: {
        path: "$productData",
        preserveNullAndEmpty: true,
      },
    },
    {
      $group: {
        _id: "$ageCategory",
        count: { $sum: 1 },
        totalQty: { $sum: "$remainingQuantity" },
        totalValue: { $sum: "$inventoryValue" },
        avgAgeInDays: { $avg: "$ageInDays" },
        batches: {
          $push: {
            batchNumber: "$batchNumber",
            productName: "$productData.name",
            sku: "$productData.sku",
            quantity: "$remainingQuantity",
            purchaseDate: "$purchaseDate",
            ageInDays: { $round: ["$ageInDays"] },
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ ageThreshold, analysis: result });
});

// GET /api/analytics/inventory-valuation
export const getInventoryValuation = asyncHandler(async (req, res) => {
  const stockSummary = await getAllStockSummary();

  // Enrich with product names
  const productIds = [...new Set(stockSummary.map(s => String(s.productId)))];
  const products   = await Product.find({ _id: { $in: productIds } }, "name sku category");
  const productMap = Object.fromEntries(products.map(p => [String(p._id), p]));

  const enriched = stockSummary.map(s => ({
    ...s,
    productName: productMap[String(s.productId)]?.name     || "Unknown",
    sku:         productMap[String(s.productId)]?.sku      || "",
    category:    productMap[String(s.productId)]?.category || "",
  }));

  const totalValue = enriched.reduce((s, e) => s + e.inventoryValue, 0);
  
  res.json({ items: enriched, totalValue });
});

// GET /api/analytics/profit-loss
export const getProfitLoss = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  
  const filter = { status: "Paid" };
  if (from || to) {
    filter.issued = {};
    if (from) filter.issued.$gte = new Date(from);
    if (to)   filter.issued.$lte = new Date(to);
  }

  const invoices  = await Invoice.find(filter);
  const purchases = await Purchase.find({ status: "Received", ...(from || to ? { date: filter.issued } : {}) });

  const totalRevenue  = invoices.reduce((s, i) => s + i.total, 0);
  const totalCOGS     = invoices.reduce((s, i) => s + (i.totalCost || 0), 0);
  const grossProfit   = totalRevenue - totalCOGS;
  const totalPurchases = purchases.reduce((s, p) => s + p.total, 0);

  res.json({ totalRevenue, totalCOGS, grossProfit, totalPurchases, netProfit: grossProfit });
});

// GET /api/analytics/expiry-report — batch expiry and age analysis
export const getExpiryReport = asyncHandler(async (req, res) => {
  const report = await generateExpiryReport();
  res.json(report);
});
