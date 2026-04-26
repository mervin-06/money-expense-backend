import express from "express";
import {
    getAllUsers,
    loginUser,
    registerUser,
    getUserByEmail,
    updateSalary,
    updatePassword,
    sendOTP,
    verifyOTP,
    resetPassword,
    deleteUser
} from "../controller/userController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllUsers);
router.post("/login", loginUser);
router.post("/", registerUser);
router.get("/:email", getUserByEmail);
router.post("/send-otp", sendOTP);
router.post("/verify-otp/:email", verifyOTP);
router.put("/reset/:email", resetPassword);

// Protected routes
router.put("/salary", verifyToken, updateSalary);
router.put("/:email", updatePassword);
router.delete("/del/:id", verifyToken, deleteUser);

export default router;

