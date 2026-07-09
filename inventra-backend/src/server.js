import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import seedSuperAdmin from "./config/seedSuperAdmin.js";

const PORT = process.env.PORT || 5000;
 
const start = async () => {
  await connectDB();
  await seedSuperAdmin(); // auto-create SuperAdmin if not exists
 
  app.listen(PORT, () => {
    console.log(`✅ Inventra POS backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  });
};

start();
