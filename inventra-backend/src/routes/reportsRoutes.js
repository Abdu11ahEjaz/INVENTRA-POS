import express from "express";
import {
  salesReport,
  purchaseReport,
  inventoryValuationReport,
  profitLossReport,
  supplierPurchaseReport,
  exportReport,
} from "../controllers/reportsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All reports require authentication, most require manager+ role
router.get("/sales", protect, authorize("SuperAdmin", "Admin", "Manager"), salesReport);
router.get("/purchases", protect, authorize("SuperAdmin", "Admin", "Manager"), purchaseReport);
router.get("/inventory-valuation", protect, authorize("SuperAdmin", "Admin", "Manager"), inventoryValuationReport);
router.get("/profit-loss", protect, authorize("SuperAdmin", "Admin", "Manager"), profitLossReport);
router.get("/supplier-purchases", protect, authorize("SuperAdmin", "Admin", "Manager"), supplierPurchaseReport);

// Generic export endpoint
router.post("/export/:type", protect, authorize("SuperAdmin", "Admin", "Manager"), exportReport);

export default router;

