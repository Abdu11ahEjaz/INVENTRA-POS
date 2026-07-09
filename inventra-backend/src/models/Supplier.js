import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    contact:    { type: String, trim: true },
    email:      { type: String, lowercase: true, trim: true },
    phone:      { type: String, trim: true },
    address:    { type: String },
    categories: { type: [String], default: [] },
    status:     { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);