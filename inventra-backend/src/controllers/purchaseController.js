import asyncHandler from "express-async-handler";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import Ledger from "../models/Ledger.js";
import { createBatch } from "../services/stockService.js";

export const getPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find()
    .populate("supplier", "name email phone")
    .populate("items.product", "name sku")
    .sort("-createdAt");
  res.json(purchases);
});

export const getPurchaseById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const purchase = await Purchase.findById(id)
    .populate("supplier")
    .populate("items.product");
  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }
  res.json(purchase);
});

export const createPurchase = asyncHandler(async (req, res) => {
  const { supplier: supplierId, items, status, date, notes } = req.body;

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    item.productName = product.name;
    if (item.variantId) {
      const variant = product.variants?.id(item.variantId);
      item.variantName = variant?.name || "";
    }
  }

  const total = items.reduce((s, i) => s + i.qty * i.unitCost, 0);

  const purchase = await Purchase.create({
    supplier: supplierId,
    supplierName: supplier.name,
    items,
    total,
    status: status || "Pending",
    date: date || new Date(),
    notes,
    createdBy: req.user._id,
  });

  if (purchase.status === "Received") {
    await _receivePurchase(purchase, supplierId, req.user._id);
  }

  res.status(201).json(purchase);
});

export const updatePurchaseStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const id = req.params.id;

  const purchase = await Purchase.findById(id);
  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }

  const wasReceived = purchase.status === "Received";

  purchase.status = status;
  await purchase.save();

  if (!wasReceived && status === "Received") {
    await _receivePurchase(purchase, purchase.supplier, req.user._id);
  }

  res.json(purchase);
});

export const deletePurchase = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const purchase = await Purchase.findById(id);
  if (!purchase) {
    res.status(404);
    throw new Error("Purchase not found");
  }

  if (purchase.status === "Received") {
    await Ledger.create({
      account: "Inventory",
      description: `[REVERSAL] Purchase ${purchase.poNumber} from ${purchase.supplierName} - deletion reversal`,
      debit: 0,
      credit: purchase.total,
      refId: purchase._id.toString(),
      refType: "purchase_reversal",
      createdBy: req.user._id,
    });
  } else {
    await Ledger.deleteMany({
      refId: purchase._id.toString(),
      refType: "purchase",
    });
  }

  await purchase.deleteOne();

  res.json({
    success: true,
    message: purchase.status === "Received"
      ? "Purchase deleted - reversal entry created in ledger"
      : "Purchase deleted successfully",
  });
});

async function _receivePurchase(purchase, supplierId, userId) {
  for (const item of purchase.items) {
    await createBatch({
      productId: item.product,
      variantId: item.variantId || null,
      supplierId,
      purchaseId: purchase._id,
      quantity: item.qty,
      purchasePrice: item.unitCost,
      purchaseDate: purchase.date,
      expiryDate: item.expiryDate || null,
    });
  }

  await Ledger.create({
    account: "Inventory",
    description: `Purchase ${purchase.poNumber} received from ${purchase.supplierName}`,
    debit: purchase.total,
    credit: 0,
    refId: purchase._id.toString(),
    refType: "purchase",
    createdBy: userId,
  });
}
