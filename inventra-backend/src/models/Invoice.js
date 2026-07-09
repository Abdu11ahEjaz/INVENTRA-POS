import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    product:      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    variantId:    { type: mongoose.Schema.Types.ObjectId, default: null },
    name:         { type: String, required: true },
    variantName:  { type: String },
    qty:          { type: Number, required: true, min: 1 },
    unitPrice:    { type: Number, required: true, min: 0 },
    unitCost:     { type: Number, default: 0 },
    total:        { type: Number, default: 0 },
    totalCost:    { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    client:        { type: String, required: true, trim: true },
    email:         { type: String },
    phone:         { type: String },
    address:       { type: String },
    items:    [invoiceItemSchema],
    subtotal:     { type: Number, default: 0 },
    tax:          { type: Number, default: 0 },
    discount:     { type: Number, default: 0 },
    total:        { type: Number, default: 0 },
    totalCost:    { type: Number, default: 0 },
    grossProfit:  { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Cancelled"],
      default: "Pending",
    },
    issued:    { type: Date, default: Date.now },
    due:       { type: Date },
    notes:     { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

invoiceSchema.pre("save", async function () {
  if (!this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments();
    const year  = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, "0")}`;
  }

  this.items = this.items.map((item) => ({
    ...item,
    total:     item.qty * item.unitPrice,
    totalCost: item.qty * (item.unitCost || 0),
  }));

  this.subtotal    = this.items.reduce((s, i) => s + i.total, 0);
  this.totalCost   = this.items.reduce((s, i) => s + i.totalCost, 0);
  const taxAmt     = (this.subtotal * (this.tax || 0)) / 100;
  this.total       = this.subtotal + taxAmt - (this.discount || 0);
  this.grossProfit = this.total - this.totalCost;
});

export default mongoose.model("Invoice", invoiceSchema);
