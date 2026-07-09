import express from "express";
import {
  getDashboard, getSalesTrend, getTopProducts, getTopProductsByQuantity,
  getInventoryValuation, getProfitLoss, getNetProfit,
  getInventoryTurnover, getStockAgeAnalysis, getExpiryReport,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard",              protect, getDashboard);
router.get("/sales-trend",            protect, getSalesTrend);
router.get("/top-products",           protect, getTopProducts);
router.get("/top-products-quantity",  protect, getTopProductsByQuantity);
router.get("/net-profit",             protect, getNetProfit);
router.get("/inventory-valuation",    protect, getInventoryValuation);
router.get("/profit-loss",            protect, getProfitLoss);
router.get("/inventory-turnover",     protect, getInventoryTurnover);
router.get("/stock-age",              protect, getStockAgeAnalysis);
router.get("/expiry-report",          protect, getExpiryReport);

export default router;
