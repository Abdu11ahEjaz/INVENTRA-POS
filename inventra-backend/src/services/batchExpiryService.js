/**
 * Batch Expiry & Age Service
 * Tracks expiring batches, expired batches, and aged inventory for reporting.
 */
import InventoryBatch from "../models/InventoryBatch.js";

/**
 * Get batches expiring within N days from today.
 * @param {number} daysUntilExpiry - Days until expiry (e.g., 30)
 * @returns {Promise<Array>} List of expiring batches with product/supplier details
 */
export const getExpiringBatches = async (daysUntilExpiry = 30) => {
  const today = new Date();
  const futureDate = new Date(today.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000);

  const batches = await InventoryBatch.aggregate([
    {
      $match: {
        isActive: true,
        remainingQuantity: { $gt: 0 },
        expiryDate: { $gte: today, $lte: futureDate },
      },
    },
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
      $lookup: {
        from: "purchases",
        localField: "purchase",
        foreignField: "_id",
        as: "purchaseData",
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
      $unwind: {
        path: "$purchaseData",
        preserveNullAndEmpty: false,
      },
    },
    {
      $addFields: {
        daysUntilExpiry: {
          $divide: [
            { $subtract: ["$expiryDate", new Date()] },
            1000 * 60 * 60 * 24,
          ],
        },
        inventoryValue: {
          $multiply: ["$remainingQuantity", "$purchasePrice"],
        },
      },
    },
    {
      $project: {
        batchNumber: 1,
        productName: "$productData.name",
        productSku: "$productData.sku",
        variantId: 1,
        supplierName: "$supplierData.name",
        remainingQuantity: 1,
        purchasePrice: 1,
        inventoryValue: 1,
        expiryDate: 1,
        daysUntilExpiry: { $round: ["$daysUntilExpiry"] },
        purchaseDate: 1,
        poNumber: "$purchaseData.poNumber",
      },
    },
    {
      $sort: { expiryDate: 1 },
    },
  ]);

  return batches;
};

/**
 * Get batches that have already expired.
 * @returns {Promise<Array>} List of expired batches
 */
export const getExpiredBatches = async () => {
  const today = new Date();

  const batches = await InventoryBatch.aggregate([
    {
      $match: {
        expiryDate: { $lt: today },
        remainingQuantity: { $gt: 0 },
      },
    },
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
        daysSinceExpiry: {
          $divide: [
            { $subtract: [new Date(), "$expiryDate"] },
            1000 * 60 * 60 * 24,
          ],
        },
        inventoryValue: {
          $multiply: ["$remainingQuantity", "$purchasePrice"],
        },
      },
    },
    {
      $project: {
        batchNumber: 1,
        productName: "$productData.name",
        productSku: "$productData.sku",
        variantId: 1,
        supplierName: "$supplierData.name",
        remainingQuantity: 1,
        purchasePrice: 1,
        inventoryValue: 1,
        expiryDate: 1,
        daysSinceExpiry: { $round: ["$daysSinceExpiry"] },
        purchaseDate: 1,
      },
    },
    {
      $sort: { expiryDate: 1 },
    },
  ]);

  return batches;
};

/**
 * Get batches older than N days (without expiry date, based on purchase date).
 * @param {number} daysOld - Age threshold in days
 * @returns {Promise<Array>} List of aged batches
 */
export const getAgedBatches = async (daysOld = 90) => {
  const pastDate = new Date(new Date().getTime() - daysOld * 24 * 60 * 60 * 1000);

  const batches = await InventoryBatch.aggregate([
    {
      $match: {
        isActive: true,
        remainingQuantity: { $gt: 0 },
        purchaseDate: { $lt: pastDate },
      },
    },
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
        ageInDays: {
          $divide: [
            { $subtract: [new Date(), "$purchaseDate"] },
            1000 * 60 * 60 * 24,
          ],
        },
        inventoryValue: {
          $multiply: ["$remainingQuantity", "$purchasePrice"],
        },
      },
    },
    {
      $project: {
        batchNumber: 1,
        productName: "$productData.name",
        productSku: "$productData.sku",
        variantId: 1,
        supplierName: "$supplierData.name",
        remainingQuantity: 1,
        purchasePrice: 1,
        inventoryValue: 1,
        purchaseDate: 1,
        ageInDays: { $round: ["$ageInDays"] },
        expiryDate: 1,
      },
    },
    {
      $sort: { purchaseDate: 1 },
    },
  ]);

  return batches;
};

/**
 * Generate comprehensive expiry/age analysis report.
 * @returns {Promise<Object>} Expiry analysis with categories
 */
export const generateExpiryReport = async () => {
  const today = new Date();
  const thirtyDaysOut = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysOut = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

  const batches = await InventoryBatch.aggregate([
    {
      $match: {
        remainingQuantity: { $gt: 0 },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $unwind: {
        path: "$productData",
        preserveNullAndEmpty: true,
      },
    },
    {
      $addFields: {
        status: {
          $cond: [
            { $lt: ["$expiryDate", today] },
            "EXPIRED",
            {
              $cond: [
                { $lte: ["$expiryDate", thirtyDaysOut] },
                "URGENT (0-30 days)",
                {
                  $cond: [
                    { $lte: ["$expiryDate", sixtyDaysOut] },
                    "WARNING (30-60 days)",
                    {
                      $cond: [
                        { $eq: ["$expiryDate", null] },
                        "NO EXPIRY",
                        "SAFE (60+ days)",
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        ageInDays: {
          $divide: [
            { $subtract: [new Date(), "$purchaseDate"] },
            1000 * 60 * 60 * 24,
          ],
        },
        inventoryValue: {
          $multiply: ["$remainingQuantity", "$purchasePrice"],
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalQty: { $sum: "$remainingQuantity" },
        totalValue: { $sum: "$inventoryValue" },
        batches: {
          $push: {
            batchNumber: "$batchNumber",
            productName: "$productData.name",
            quantity: "$remainingQuantity",
            expiryDate: "$expiryDate",
          },
        },
      },
    },
  ]);

  // Get aged inventory (90+ days without expiry)
  const agedBatches = await InventoryBatch.aggregate([
    {
      $match: {
        isActive: true,
        remainingQuantity: { $gt: 0 },
        purchaseDate: { $lt: ninetyDaysAgo },
      },
    },
    {
      $addFields: {
        inventoryValue: {
          $multiply: ["$remainingQuantity", "$purchasePrice"],
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalQty: { $sum: "$remainingQuantity" },
        totalValue: { $sum: "$inventoryValue" },
      },
    },
  ]);

  return {
    generatedAt: new Date(),
    expiryBreakdown: batches,
    agedInventory: agedBatches[0] || {
      count: 0,
      totalQty: 0,
      totalValue: 0,
    },
  };
};

