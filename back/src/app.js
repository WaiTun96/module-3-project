import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import connectDB from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import gemRoutes from "./routes/gem.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Project Root အောက်ရှိ uploads folder ကို absolute path ဖြင့် ယူခြင်း
const uploadsDir = path.resolve("uploads");

// uploads folder မရှိပါက uploads folder တည်ဆောက်ခြင်း
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

// CORS Error မတက်စေရန် Header ထည့်ပြီး Static Folder Serve လုပ်ခြင်း
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/gems", gemRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📂 Uploads Absolute Path: ${uploadsDir}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();