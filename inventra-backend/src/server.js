import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import seedSuperAdmin from "./config/seedSuperAdmin.js";
import authRoutes      from "./routes/authRoutes.js";
import userRoutes      from "./routes/userRoutes.js";
import auditLogsRoutes from "./routes/auditLogsRoutes.js";
import sessionRoutes   from "./routes/sessionRoutes.js";
import productRoutes   from "./routes/productRoutes.js";      
import supplierRoutes  from "./routes/supplierRoutes.js";
import purchaseRoutes  from "./routes/purchaseRoutes.js";
import invoiceRoutes   from "./routes/invoiceRoutes.js";
import ledgerRoutes    from "./routes/ledgerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";   
import reportsRoutes   from "./routes/reportsRoutes.js";     
import syncRoutes      from "./routes/syncRoutes.js";

// Legacy inventory route kept for backward compat during migration
import inventoryRoutes from "./routes/inventoryRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS Configuration 
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:4173", "app://."],
  credentials: true,
}));

// ── Middleware 
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Health Check 
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.get("/api/deploy-test", (req, res) => {
  res.json({
    message: "Backend updated",
    version: "July-09-2026-1"
  });
});

// ── Routes 
app.use("/api/auth",       authRoutes);
app.use("/api/users",      userRoutes);
app.use("/api/audit-logs", auditLogsRoutes);
app.use("/api/sessions",   sessionRoutes);
app.use("/api/products",   productRoutes);     
app.use("/api/inventory",  inventoryRoutes);   
app.use("/api/suppliers",  supplierRoutes);
app.use("/api/purchases",  purchaseRoutes);
app.use("/api/invoices",   invoiceRoutes);
app.use("/api/ledger",     ledgerRoutes);
app.use("/api/analytics",  analyticsRoutes);
app.use("/api/reports",    reportsRoutes);
app.use("/api/sync",       syncRoutes);

// ── Error Handling 
app.use(notFound);
app.use(errorHandler);


// ── Server Startup 
const start = async () => {
  await connectDB();
  await seedSuperAdmin(); // auto-create SuperAdmin if not exists
  app.listen(PORT, () => {
    console.log(` Inventra POS backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  });
};

start();
