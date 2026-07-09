import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import InventoryBatch from "../models/InventoryBatch.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { getAllStockSummary } from "../services/stockService.js";

export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, brand } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (search) filter.name = { $regex: search, $options: "i" };

  const products = await Product.find(filter).sort("-createdAt");
  const stockMap = await getAllStockSummary();
  const allBatches = await InventoryBatch.find({ isActive: true });

  const enriched = products.map((p) => {
    const pObj = p.toObject();
    const baseStock = stockMap.find(
      (s) => String(s.productId) === String(p._id) && !s.variantId
    );
    pObj.totalStock = baseStock?.totalStock || 0;
    pObj.inventoryValue = baseStock?.inventoryValue || 0;
    pObj.lastPurchasePrice = baseStock?.lastPurchasePrice || 0;
    pObj.lastPurchaseDate = baseStock?.lastPurchaseDate || null;

    const thirtyDaysOut = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringBatches = allBatches.filter(b =>
      String(b.product) === String(p._id) &&
      b.expiryDate &&
      b.expiryDate >= new Date() &&
      b.expiryDate <= thirtyDaysOut &&
      b.remainingQuantity > 0
    );
    pObj.expiringBatches = expiringBatches.length;

    pObj.variants = (pObj.variants || []).map((v) => {
      const vs = stockMap.find(
        (s) => String(s.productId) === String(p._id) && String(s.variantId) === String(v._id)
      );
      const variantExpiringBatches = allBatches.filter(b =>
        String(b.product) === String(p._id) &&
        String(b.variantId) === String(v._id) &&
        b.expiryDate &&
        b.expiryDate >= new Date() &&
        b.expiryDate <= thirtyDaysOut &&
        b.remainingQuantity > 0
      );
      return {
        ...v,
        totalStock: vs?.totalStock || 0,
        inventoryValue: vs?.inventoryValue || 0,
        lastPurchasePrice: vs?.lastPurchasePrice || 0,
        expiringBatches: variantExpiringBatches.length,
      };
    });

    const allStock = pObj.totalStock + pObj.variants.reduce((s, v) => s + v.totalStock, 0);
    pObj.status = allStock <= 0 ? "Out of Stock" : allStock <= 10 ? "Low Stock" : "In Stock";
    return pObj;
  });

  res.json(enriched);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const stockMap = await getAllStockSummary();
  const pObj = product.toObject();
  const baseStock = stockMap.find(
    (s) => String(s.productId) === String(product._id) && !s.variantId
  );
  pObj.totalStock = baseStock?.totalStock || 0;
  pObj.inventoryValue = baseStock?.inventoryValue || 0;
  pObj.lastPurchasePrice = baseStock?.lastPurchasePrice || 0;

  pObj.variants = (pObj.variants || []).map((v) => {
    const vs = stockMap.find(
      (s) => String(s.productId) === String(product._id) && String(s.variantId) === String(v._id)
    );
    return { ...v, totalStock: vs?.totalStock || 0, lastPurchasePrice: vs?.lastPurchasePrice || 0 };
  });

  res.json(pObj);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, brand, description, sellingPrice, variants } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Product name is required");
  }

  let finalSku = sku?.trim().toUpperCase();
  if (!finalSku) {
    const count = await Product.countDocuments();
    finalSku = `SKU-${String(count + 1).padStart(4, "0")}`;
  }

  const data = {
    name: name.trim(),
    sku: finalSku,
    category: category || "",
    brand: brand || "",
    description: description || "",
    sellingPrice: Number(sellingPrice) || 0,
  };

  if (variants && Array.isArray(variants)) {
    data.variants = variants
      .filter(v => v && (v.name || v.size || v.color))
      .map(v => ({
        name: v.name || `${v.size || ""} ${v.color || ""}`.trim(),
        size: v.size || "",
        color: v.color || "",
        sellingPrice: Number(v.sellingPrice) || Number(sellingPrice) || 0,
        sku: v.sku || "",
      }));
  }

  if (req.file) {
    try {
      const { url, public_id } = await uploadToCloudinary(req.file.buffer, "inventra/products");
      data.image = url;
      data.imagePublicId = public_id;
    } catch (err) {
      // Don't fail product creation if image upload fails
    }
  }

  const product = await Product.create(data);
  res.status(201).json({ ...product.toObject(), totalStock: 0, inventoryValue: 0 });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const { name, sku, category, brand, description, sellingPrice, variants, isActive } = req.body;

  if (name !== undefined) product.name = name;
  if (sku !== undefined) product.sku = sku.toUpperCase();
  if (category !== undefined) product.category = category;
  if (brand !== undefined) product.brand = brand;
  if (description !== undefined) product.description = description;
  if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
  if (isActive !== undefined) product.isActive = isActive;
  if (variants !== undefined) {
    product.variants = typeof variants === "string" ? JSON.parse(variants) : variants;
  }

  if (req.file) {
    if (product.imagePublicId) await deleteFromCloudinary(product.imagePublicId);
    const { url, public_id } = await uploadToCloudinary(req.file.buffer, "inventra/products");
    product.image = url;
    product.imagePublicId = public_id;
  }

  const updated = await product.save();
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const activeBatches = await InventoryBatch.countDocuments({ product: product._id, isActive: true });
  if (activeBatches > 0) {
    res.status(400);
    throw new Error(`Cannot delete - product has ${activeBatches} active stock batch(es)`);
  }

  if (product.imagePublicId) await deleteFromCloudinary(product.imagePublicId);
  await product.deleteOne();
  res.json({ success: true });
});

export const getProductBatches = asyncHandler(async (req, res) => {
  const batches = await InventoryBatch.find({ product: req.params.id })
    .populate("supplier", "name")
    .populate("purchase", "poNumber")
    .sort({ purchaseDate: 1 });
  res.json(batches);
});

export const batchSummary = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("productId is required");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const batches = await InventoryBatch.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isActive: true,
        remainingQuantity: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: "$variantId",
        totalQty: { $sum: "$remainingQuantity" },
        batchCount: { $sum: 1 },
        totalValue: { $sum: { $multiply: ["$remainingQuantity", "$purchasePrice"] } },
        avgCost: { $avg: "$purchasePrice" },
        batches: {
          $push: {
            batchNumber: "$batchNumber",
            quantity: "$remainingQuantity",
            purchasePrice: "$purchasePrice",
            purchaseDate: "$purchaseDate",
            expiryDate: "$expiryDate",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const summary = {
    productId,
    productName: product.name,
    sku: product.sku,
    variants: batches.map(b => {
      const variant = b._id ? product.variants?.find(v => String(v._id) === String(b._id)) : null;
      return {
        variantId: b._id || "BASE",
        variantName: variant?.name || "Base Product",
        totalStock: b.totalQty,
        batchCount: b.batchCount,
        totalValue: b.totalValue,
        averageCost: b.avgCost,
        batches: b.batches,
      };
    }),
    overallTotalStock: batches.reduce((s, b) => s + b.totalQty, 0),
    overallTotalValue: batches.reduce((s, b) => s + b.totalValue, 0),
  };

  res.json(summary);
});
