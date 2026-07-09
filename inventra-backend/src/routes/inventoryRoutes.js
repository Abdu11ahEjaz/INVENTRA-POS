import express from "express";
import {
  getInventory, getInventoryById,
  createInventory, updateInventory,
  deleteInventory, patchStock,
} from "../controllers/inventoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getInventory)
  .post(protect, authorize("Admin", "SuperAdmin", "Manager"), uploadSingle, createInventory);

router.route("/:id")
  .get(protect, getInventoryById)
  .put(protect, authorize("Admin", "SuperAdmin", "Manager"), uploadSingle, updateInventory)
  .delete(protect, authorize("Admin", "SuperAdmin"), deleteInventory);

router.patch("/:id/stock", protect, authorize("Admin", "SuperAdmin", "Manager"), patchStock);

export default router;
