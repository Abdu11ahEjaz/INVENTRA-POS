import Invoice from "../models/Invoice.js";
import Ledger from "../models/Ledger.js";
import { deductFIFO } from "./stockService.js";

export const createInvoiceWithEffects = async (data, userId) => {
  const enrichedItems = [];

  for (const item of data.items) {
    if (item.product && item.product !== "__custom") {
      const consumed = await deductFIFO(
        item.product,
        item.variantId || null,
        item.qty
      );

      const totalCost = consumed.reduce((s, c) => s + c.totalCost, 0);
      const unitCost  = totalCost / item.qty;

      enrichedItems.push({ ...item, unitCost, totalCost });
    } else {
      enrichedItems.push({ ...item, unitCost: 0, totalCost: 0 });
    }
  }

  const invoice = await Invoice.create({
    ...data,
    items:     enrichedItems,
    createdBy: userId,
  });

  await Ledger.create({
    account:     "Accounts Receivable",
    description: `Invoice ${invoice.invoiceNumber} — ${invoice.client}`,
    debit:       invoice.total,
    credit:      0,
    refId:       invoice._id.toString(),
    refType:     "invoice",
    createdBy:   userId,
  });

  await Ledger.create({
    account:     "Cost of Goods Sold",
    description: `COGS — Invoice ${invoice.invoiceNumber}`,
    debit:       invoice.totalCost,
    credit:      0,
    refId:       invoice._id.toString(),
    refType:     "invoice",
    createdBy:   userId,
  });

  return invoice;
};
