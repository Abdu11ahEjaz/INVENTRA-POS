import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    sku:           { type: String, required: true, unique: true, uppercase: true, trim: true },
    category:      { type: String, trim: true },
    quantity:      { type: Number, default: 0, min: 0 },
    purchasePrice: { type: Number, default: 0 },
    sellingPrice:  { type: Number, default: 0 },
    expiryDate:    { type: Date },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    image:      { type: String, default: null },
    imagePublicId: { type: String, default: null },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
  },
  { timestamps: true }
);

inventorySchema.pre("save", function () {
  if (this.quantity <= 0)       this.status = "Out of Stock";
  else if (this.quantity <= 10) this.status = "Low Stock";
  else                          this.status = "In Stock";
});

inventorySchema.pre("deleteOne", { document: true }, async function () {
  const inventoryId = this._id;
  const Purchase = mongoose.model("Purchase");

  const purchases = await Purchase.find({ "items.product": inventoryId });

  for (const purchase of purchases) {
    purchase.items = purchase.items.filter(item => String(item.product) !== String(inventoryId));

    if (purchase.items.length === 0) {
      await Purchase.deleteOne({ _id: purchase._id });
    } else {
      purchase.total = purchase.items.reduce((s, i) => s + (i.qty * i.unitCost), 0);
      await purchase.save();
    }
  }
});

inventorySchema.pre("deleteMany", async function () {
  const query = this.getFilter();
  const inventoryDocs = await this.model.find(query);
  const Purchase = mongoose.model("Purchase");

  for (const inv of inventoryDocs) {
    const purchases = await Purchase.find({ "items.product": inv._id });
    for (const purchase of purchases) {
      purchase.items = purchase.items.filter(item => String(item.product) !== String(inv._id));
      if (purchase.items.length === 0) {
        await Purchase.deleteOne({ _id: purchase._id });
      } else {
        purchase.total = purchase.items.reduce((s, i) => s + (i.qty * i.unitCost), 0);
        await purchase.save();
      }
    }
  }
});

export default mongoose.model("Inventory", inventorySchema);