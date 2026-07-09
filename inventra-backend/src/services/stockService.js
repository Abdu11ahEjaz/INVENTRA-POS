/**
 * FIFO Stock Service
 */
import InventoryBatch from "../models/InventoryBatch.js";

export const getStock = async (productId, variantId = null) => {
  const filter = { product: productId, isActive: true, remainingQuantity: { $gt: 0 } };
  if (variantId) filter.variantId = variantId;
  const batches = await InventoryBatch.find(filter);
  return batches.reduce((s, b) => s + b.remainingQuantity, 0);
};

export const createBatch = async ({
  productId, variantId = null, supplierId, purchaseId,
  quantity, purchasePrice, purchaseDate, expiryDate = null,
}) => {
  const batch = await InventoryBatch.create({
    product:           productId,
    variantId:         variantId || null,
    supplier:          supplierId,
    purchase:          purchaseId,
    quantity,
    remainingQuantity: quantity,
    purchasePrice,
    purchaseDate:      purchaseDate || new Date(),
    expiryDate,
  });
  return batch;
};

export const deductFIFO = async (productId, variantId = null, qtyNeeded) => {
  const filter = {
    product:           productId,
    isActive:          true,
    remainingQuantity: { $gt: 0 },
  };
  if (variantId) filter.variantId = variantId;

  const batches = await InventoryBatch.find(filter).sort({ purchaseDate: 1 });

  const totalAvailable = batches.reduce((s, b) => s + b.remainingQuantity, 0);
  if (totalAvailable < qtyNeeded) {
    throw new Error(
      `Insufficient stock. Needed: ${qtyNeeded}, Available: ${totalAvailable}`
    );
  }

  const consumed = [];
  let remaining  = qtyNeeded;

  for (const batch of batches) {
    if (remaining <= 0) break;

    const take = Math.min(batch.remainingQuantity, remaining);
    batch.remainingQuantity -= take;
    if (batch.remainingQuantity === 0) batch.isActive = false;
    await batch.save();

    consumed.push({
      batchId:   batch._id,
      qty:       take,
      unitCost:  batch.purchasePrice,
      totalCost: take * batch.purchasePrice,
    });

    remaining -= take;
  }

  return consumed;
};

export const restoreStock = async (productId, variantId = null, qty) => {
  const filter = { product: productId };
  if (variantId) filter.variantId = variantId;

  const batch = await InventoryBatch.findOne(filter).sort({ purchaseDate: -1 });
  if (!batch) throw new Error(`No batch found for product ${productId}`);

  batch.remainingQuantity += qty;
  batch.isActive = true;
  await batch.save();
  return batch;
};

export const getInventoryValue = async (productId) => {
  const batches = await InventoryBatch.find({ product: productId, isActive: true });
  return batches.reduce((s, b) => s + b.remainingQuantity * b.purchasePrice, 0);
};

export const getAllStockSummary = async () => {
  const result = await InventoryBatch.aggregate([
    { $match: { isActive: true, remainingQuantity: { $gt: 0 } } },
    {
      $group: {
        _id:               { product: "$product", variantId: "$variantId" },
        totalStock:        { $sum: "$remainingQuantity" },
        inventoryValue:    { $sum: { $multiply: ["$remainingQuantity", "$purchasePrice"] } },
        lastPurchasePrice: { $last: "$purchasePrice" },
        lastPurchaseDate:  { $max: "$purchaseDate" },
      },
    },
    {
      $project: {
        productId:         "$_id.product",
        variantId:         "$_id.variantId",
        totalStock:        1,
        inventoryValue:    1,
        lastPurchasePrice: 1,
        lastPurchaseDate:  1,
        _id:               0,
      },
    },
  ]);
  return result;
};
