import express from "express";
import { registerAdmin, loginAdmin, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Routes (မည်သူမဆို ခေါ်ယူနိုင်သည်)
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected Route (Token ပါမှ ခေါ်ယူနိုင်သည်)
router.get("/me", protect, getMe);

export default router;