import express from "express";
import {
  getSuppliers, getSupplierById,
  createSupplier, updateSupplier, deleteSupplier,
  getSupplierProducts,
  getSupplierPurchases,
} from "../controllers/supplierController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getSuppliers)
  .post(protect, authorize("Admin", "SuperAdmin", "Manager"), createSupplier);

router.route("/:id")
  .get(protect, getSupplierById)
  .put(protect, authorize("Admin", "SuperAdmin", "Manager"), updateSupplier)
  .delete(protect, authorize("Admin", "SuperAdmin"), deleteSupplier);

router.get("/:id/products", protect, getSupplierProducts);
router.get("/:id/purchases", protect, getSupplierPurchases);

export default router;
