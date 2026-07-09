import asyncHandler from "express-async-handler";
import Inventory from "../models/Inventory.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

function mapPayload(body) {
  const mapped = {};
  if (body.name !== undefined) mapped.name = body.name;
  if (body.sku !== undefined) mapped.sku = body.sku;
  if (body.category !== undefined) mapped.category = body.category;
  if (body.description !== undefined) mapped.description = body.description;
  if (body.expiryDate !== undefined) mapped.expiryDate = body.expiryDate;
  if (body.price !== undefined) mapped.sellingPrice = Number(body.price);
  if (body.sellingPrice !== undefined) mapped.sellingPrice = Number(body.sellingPrice);
  if (body.purchasePrice !== undefined) mapped.purchasePrice = Number(body.purchasePrice);
  if (body.stock !== undefined) mapped.quantity = Number(body.stock);
  if (body.quantity !== undefined) mapped.quantity = Number(body.quantity);
  if (body.supplierId !== undefined) mapped.supplier = body.supplierId || undefined;
  if (body.supplier !== undefined) mapped.supplier = body.supplier || undefined;
  if (body.imageUrl !== undefined) mapped.image = body.imageUrl || undefined;
  return mapped;
}

export const getInventory = asyncHandler(async (req, res) => {
  const { category, status, search } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) filter.name = { $regex: search, $options: "i" };

  const items = await Inventory.find(filter).populate("supplier", "name email phone").sort("-createdAt");

  res.json(items);
});

export const getInventoryById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const item = await Inventory.findById(id).populate("supplier");

  if (!item) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(item);
});

export const createInventory = asyncHandler(async (req, res) => {
  const data = mapPayload(req.body);

  // VALIDATION: Supplier is required
  if (!data.supplier) {
    res.status(400);
    throw new Error("Supplier is required when creating inventory items");
  }

  if (!data.sku) {
    const count = await Inventory.countDocuments();
    data.sku = `SKU-${String(count + 1).padStart(4, "0")}`;
  }

  if (req.file) {
    const { url, public_id } = await uploadToCloudinary(req.file.buffer, "inventra/products");
    data.image = url;
    data.imagePublicId = public_id;
  }

  const item = await Inventory.create(data);
  await item.populate("supplier", "name email phone");

  res.status(201).json(item);
});

export const updateInventory = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const item = await Inventory.findById(id);

  if (!item) {
    res.status(404);
    throw new Error("Product not found");
  }

  const data = mapPayload(req.body);

  if (req.file) {
    if (item.imagePublicId) {
      await deleteFromCloudinary(item.imagePublicId);
    }
    const { url, public_id } = await uploadToCloudinary(req.file.buffer, "inventra/products");
    data.image = url;
    data.imagePublicId = public_id;
  }

  Object.assign(item, data);
  const updated = await item.save();
  await updated.populate("supplier", "name email phone");

  res.json(updated);
});

export const deleteInventory = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const item = await Inventory.findById(id);

  if (!item) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (item.imagePublicId) {
    await deleteFromCloudinary(item.imagePublicId);
  }

  await item.deleteOne();

  res.json({ success: true, message: "Product deleted" });
});

export const patchStock = asyncHandler(async (req, res) => {
  const { delta } = req.body;
  const id = req.params.id;

  if (delta === undefined) {
    res.status(400);
    throw new Error("delta is required");
  }

  const item = await Inventory.findById(id);

  if (!item) {
    res.status(404);
    throw new Error("Product not found");
  }

  const newQty = item.quantity + Number(delta);

  if (newQty < 0) {
    res.status(400);
    throw new Error("Stock cannot go below 0");
  }

  item.quantity = newQty;
  await item.save();

  res.json(item);
});
