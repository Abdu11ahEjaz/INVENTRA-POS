import express from "express";
import asyncHandler from "express-async-handler";
import { processQueue } from "../services/syncService.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/sync  — process offline action queue from client
router.post("/", protect, asyncHandler(async (req, res) => {
  const { actions } = req.body;
  if (!Array.isArray(actions)) {
    res.status(400);
    throw new Error("actions must be an array");
  }
  const results = await processQueue(actions, req.user._id);
  res.json({ processed: results.length, results });
}));

export default router;
