import express from "express";
import {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getProductBatches, batchSummary,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Batch summary must come before /:id routes to avoid matching /batch-summary as an ID
router.post("/batch-summary", protect, batchSummary);

router.route("/")
  .get(protect, getProducts)
  .post(protect, authorize("SuperAdmin","Admin","Manager"), uploadSingle, createProduct);

router.route("/:id")
  .get(protect, getProductById)
  .put(protect, authorize("SuperAdmin","Admin","Manager"), uploadSingle, updateProduct)
  .delete(protect, authorize("SuperAdmin","Admin"), deleteProduct);

router.get("/:id/batches", protect, getProductBatches);

export default router;
