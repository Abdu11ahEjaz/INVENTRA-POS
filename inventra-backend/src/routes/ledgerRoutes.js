import express from "express";
import {
  getLedger, createLedgerEntry, deleteLedgerEntry,
} from "../controllers/ledgerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getLedger)
  .post(protect, authorize("Admin", "SuperAdmin"), createLedgerEntry);

router.delete("/:id", protect, authorize("Admin", "SuperAdmin"), deleteLedgerEntry);

export default router;
