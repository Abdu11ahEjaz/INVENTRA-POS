import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    account:     { type: String, required: true, trim: true },
    description: { type: String, required: true },
    debit:       { type: Number, default: 0 },
    credit:      { type: Number, default: 0 },
    date:        { type: Date, default: Date.now },

    // Reference to source document
    refId:   { type: String },
    refType: {
      type: String,
      enum: ["purchase", "invoice", "sale", "manual", "adjustment"],
      default: "manual",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Ledger", ledgerSchema);
