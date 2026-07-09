/**
 * Product — pure catalog model.
 * Stock is computed dynamically from InventoryBatch.
 */
import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    size:         { type: String, trim: true },
    color:        { type: String, trim: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    sku:          { type: String, trim: true, uppercase: true },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    sku:         { type: String, required: true, unique: true, uppercase: true, trim: true },
    category:    { type: String, trim: true },
    brand:       { type: String, trim: true },
    description: { type: String, trim: true },
    image:         { type: String, default: null },
    imagePublicId: { type: String, default: null },
    variants: [variantSchema],
    sellingPrice: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.virtual("totalStock");

export default mongoose.model("Product", productSchema);
