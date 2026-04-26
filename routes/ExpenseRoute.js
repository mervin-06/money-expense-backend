import express from "express";
import {
    getUserExpenses,
    addExpense,
    getExpenseHistory
} from "../controller/expenseController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// All expense routes require authentication
router.get("/", verifyToken, getUserExpenses);
router.post("/", verifyToken, addExpense);
router.get("/history", verifyToken, getExpenseHistory);

export default router;
