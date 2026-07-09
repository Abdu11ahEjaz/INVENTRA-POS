/**
 * Sync Service — processes offline action queue from Electron/frontend client.
 */
import { createBatch, deductFIFO } from "./stockService.js";
import { createInvoiceWithEffects } from "./invoiceService.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import Purchase from "../models/Purchase.js";
import Ledger from "../models/Ledger.js";

export const processQueue = async (actions = [], userId) => {
  const results = [];

  for (const action of actions) {
    try {
      let result;

      switch (action.type) {
        case "CREATE_PRODUCT":
          result = await Product.create(action.payload);
          break;

        case "UPDATE_PRODUCT":
          result = await Product.findByIdAndUpdate(action.payload.id, action.payload, { new: true });
          break;

        case "CREATE_SUPPLIER":
          result = await Supplier.create(action.payload);
          break;

        case "CREATE_PURCHASE": {
          const purchase = await Purchase.create({ ...action.payload, createdBy: userId });
          if (action.payload.status === "Received") {
            for (const item of action.payload.items) {
              await createBatch({
                productId:     item.product,
                variantId:     item.variantId || null,
                supplierId:    action.payload.supplier,
                purchaseId:    purchase._id,
                quantity:      item.qty,
                purchasePrice: item.unitCost,
                purchaseDate:  action.payload.date,
              });
            }
          }
          result = purchase;
          break;
        }

        case "CREATE_INVOICE":
          result = await createInvoiceWithEffects(action.payload, userId);
          break;

        case "ADJUST_STOCK":
          result = await createBatch({
            productId:     action.payload.productId,
            variantId:     action.payload.variantId || null,
            supplierId:    action.payload.supplierId || null,
            quantity:      Math.abs(action.payload.delta),
            purchasePrice: 0,
            purchaseDate:  new Date(),
          });
          break;

        case "CREATE_LEDGER_ENTRY":
          result = await Ledger.create({ ...action.payload, createdBy: userId });
          break;

        default:
          result = { skipped: true, reason: `Unknown action type: ${action.type}` };
      }

      results.push({ action: action.type, success: true, result });
    } catch (err) {
      results.push({ action: action.type, success: false, error: err.message });
    }
  }

  return results;
};
