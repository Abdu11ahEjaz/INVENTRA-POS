import dotenv from "dotenv";
import cors from 'cors'
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import seedSuperAdmin from "./config/seedSuperAdmin.js";

const PORT = process.env.PORT || 5000;
 
const start = async () => {
  await connectDB();
  await seedSuperAdmin(); // auto-create SuperAdmin if not exists
 
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://your-frontend.onrender.com"
    ],
    credentials: true
}));

  app.listen(PORT, () => {
    console.log(`✅ Inventra POS backend running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  });
};
 
start();
