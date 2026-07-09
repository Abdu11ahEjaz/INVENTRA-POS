import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    product:      { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId:    { type: mongoose.Schema.Types.ObjectId, default: null },
    productName:  { type: String },
    variantName:  { type: String },
    qty:          { type: Number, required: true, min: 1 },
    unitCost:     { type: Number, required: true, min: 0 },
    expiryDate:   { type: Date, default: null },
    batchId:      { type: mongoose.Schema.Types.ObjectId, ref: "InventoryBatch" },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    poNumber:     { type: String, unique: true },
    supplier:     { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    supplierName: { type: String },
    items:        [purchaseItemSchema],
    total:        { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Received", "Cancelled"],
      default: "Pending",
    },
    date:      { type: Date, default: Date.now },
    notes:     { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

purchaseSchema.pre("save", async function () {
  if (!this.poNumber) {
    const count = await mongoose.model("Purchase").countDocuments();
    this.poNumber = `PO-${String(count + 1).padStart(4, "0")}`;
  }
});

purchaseSchema.pre("deleteOne", { document: true }, async function () {
  const purchaseId = this._id;
  const InventoryBatch = mongoose.model("InventoryBatch");
  await InventoryBatch.deleteMany({ purchase: purchaseId });
});

purchaseSchema.pre("deleteMany", async function () {
  const query = this.getFilter();
  const purchaseDocs = await this.model.find(query);
  const InventoryBatch = mongoose.model("InventoryBatch");

  for (const purchase of purchaseDocs) {
    await InventoryBatch.deleteMany({ purchase: purchase._id });
  }
});

export default mongoose.model("Purchase", purchaseSchema);
