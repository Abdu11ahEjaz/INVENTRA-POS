import express from "express";
import {
  getInvoices, getInvoiceById, createInvoice,
  updateInvoice, updateInvoiceStatus, deleteInvoice,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getInvoices)
  .post(protect, authorize("SuperAdmin","Admin","Manager","Sales"), createInvoice);

router.route("/:id")
  .get(protect, getInvoiceById)
  .put(protect, authorize("SuperAdmin","Admin"), updateInvoice)
  .delete(protect, authorize("SuperAdmin","Admin"), deleteInvoice);

router.patch("/:id/status", protect, authorize("SuperAdmin","Admin","Manager"), updateInvoiceStatus);

export default router;
