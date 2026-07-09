/**
 * InventoryBatch — one record per purchase receipt per product/variant.
 * Stock is the SUM of remainingQuantity across all active batches.
 * FIFO: oldest purchaseDate batch is consumed first.
 */
import mongoose from "mongoose";

const inventoryBatchSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, unique: true },
    product:   { type: mongoose.Schema.Types.ObjectId, ref: "Product",  required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    supplier:  { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    purchase:  { type: mongoose.Schema.Types.ObjectId, ref: "Purchase" },
    quantity:          { type: Number, required: true, min: 1 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 },
    purchaseDate:  { type: Date, default: Date.now },
    expiryDate:    { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

inventoryBatchSchema.pre("save", async function () {
  if (!this.batchNumber) {
    const count = await mongoose.model("InventoryBatch").countDocuments();
    this.batchNumber = `BATCH-${String(count + 1).padStart(5, "0")}`;
  }
  if (this.remainingQuantity <= 0) this.isActive = false;
});

inventoryBatchSchema.index({ product: 1, variantId: 1, purchaseDate: 1, isActive: 1 });

export default mongoose.model("InventoryBatch", inventoryBatchSchema);
