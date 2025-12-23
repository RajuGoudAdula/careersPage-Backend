// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

connectDB();


app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/company",companyRoutes);
app.use("/api/alert",alertRoutes);


app.get("/", (req, res) => {
  res.send("API running successfully...");
});


app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
