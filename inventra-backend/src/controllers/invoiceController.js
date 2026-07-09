import asyncHandler from "express-async-handler";
import Invoice from "../models/Invoice.js";
import Ledger from "../models/Ledger.js";
import { createInvoiceWithEffects } from "../services/invoiceService.js";

export const getInvoices = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (search) filter.client = { $regex: search, $options: "i" };

  const invoices = await Invoice.find(filter)
    .populate("items.product", "name sku")
    .sort("-createdAt");

  res.json(invoices);
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate("items.product");
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  res.json(invoice);
});

export const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await createInvoiceWithEffects(req.body, req.user._id);
  res.status(201).json(invoice);
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  res.json(invoice);
});

export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  invoice.status = status;
  await invoice.save({ validateBeforeSave: false });

  if (status === "Paid") {
    await Ledger.create({
      account: "Cash",
      description: `Payment received - ${invoice.invoiceNumber} (${invoice.client})`,
      debit: 0,
      credit: invoice.total,
      refId: invoice._id.toString(),
      refType: "invoice",
      createdBy: req.user._id,
    });
  }

  res.json(invoice);
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  await Ledger.deleteMany({
    refId: invoice._id.toString(),
    refType: "invoice",
  });

  if (invoice.status === "Paid") {
    await Ledger.create({
      account: "Cash",
      description: `[REVERSAL] Payment cancellation - ${invoice.invoiceNumber} (${invoice.client})`,
      debit: invoice.total,
      credit: 0,
      refId: invoice._id.toString(),
      refType: "invoice_reversal",
      createdBy: req.user._id,
    });
  }

  await Invoice.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Invoice deleted - ledger entries cleaned up",
  });
});
