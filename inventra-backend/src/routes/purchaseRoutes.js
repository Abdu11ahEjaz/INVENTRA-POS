import express from "express";
import {
  getPurchases, getPurchaseById,
  createPurchase, updatePurchaseStatus, deletePurchase,
} from "../controllers/purchaseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getPurchases)
  .post(protect, authorize("SuperAdmin","Admin","Manager"), createPurchase);

router.route("/:id")
  .get(protect, getPurchaseById)
  .delete(protect, authorize("SuperAdmin","Admin"), deletePurchase);

router.patch("/:id/status", protect, authorize("SuperAdmin","Admin","Manager"), updatePurchaseStatus);

export default router;
