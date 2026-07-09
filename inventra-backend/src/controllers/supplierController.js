import asyncHandler from "express-async-handler";
import Supplier from "../models/Supplier.js";
import Purchase from "../models/Purchase.js";

export const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort("-createdAt");
  res.json(suppliers);
});

export const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  res.json(supplier);
});

export const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json(supplier);
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  res.json(supplier);
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplierId = req.params.id;

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  const purchasesDeleted = await Purchase.deleteMany({ supplier: supplierId });

  await Supplier.findByIdAndDelete(supplierId);

  res.json({
    success: true,
    message: `Supplier deleted along with ${purchasesDeleted.deletedCount} associated purchases`,
  });
});

export const getSupplierProducts = asyncHandler(async (req, res) => {
  const products = await Inventory.find({ supplier: req.params.id });
  res.json(products);
});

export const getSupplierPurchases = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({ supplier: req.params.id })
    .populate("supplier", "name")
    .sort("-date");

  res.json(purchases);
});
