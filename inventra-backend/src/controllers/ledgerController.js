import asyncHandler from "express-async-handler";
import Ledger from "../models/Ledger.js";

export const getLedger = asyncHandler(async (req, res) => {
  const { account, refType, from, to } = req.query;

  const filter = {};

  if (account) filter.account = { $regex: account, $options: "i" };
  if (refType) filter.refType = refType;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const entries = await Ledger.find(filter).sort("-date");

  res.json(entries);
});

export const createLedgerEntry = asyncHandler(async (req, res) => {
  const entry = await Ledger.create({ ...req.body, createdBy: req.user._id });

  res.status(201).json(entry);
});

export const deleteLedgerEntry = asyncHandler(async (req, res) => {
  const deleted = await Ledger.findByIdAndDelete(req.params.id);

  if (!deleted) {
    res.status(404);
    throw new Error("Ledger entry not found");
  }

  res.json({ success: true, message: "Entry deleted and ledger totals recalculated" });
});
