import { ExpenseModel } from "../models/Expensemodel.js";
import { usermodel } from "../models/Usermodel.js";

// Get all expenses for a user
export const getUserExpenses = async (req, res) => {
    try {
        const expenses = await ExpenseModel.find({ user: req.userId }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new expense
export const addExpense = async (req, res) => {
    try {
        const { title, amount, type, description } = req.body;
        
        if (!title?.trim() || amount == null || !type?.trim()) {
            return res.status(400).json({ message: "Title, amount and type are required" });
        }
        
        const user = await usermodel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const salary = Number(user.salary);
        const expenseAmount = await ExpenseModel.find({ user: req.userId });

        const total = expenseAmount.reduce((sum, e) => sum + Number(e.amount), 0);

        const balance = salary - (total + amount);

        const expense = new ExpenseModel({
            title,
            amount,
            type,
            description,
            user: req.userId,
            balance: Number(balance)
        });

        await expense.save();

        res.status(201).json({ message: "Expense added successfully", expense });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get expense history
export const getExpenseHistory = async (req, res) => {
    try {
        const user = await usermodel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const salary = Number(user.salary);
        const expenses = await ExpenseModel.find({ user: req.userId }).sort({ date: 1 }); // old → new

        let totalSpent = 0;
        const updatedExpenses = expenses.map(e => {
            totalSpent += Number(e.amount);
            return {
                ...e._doc,
                balance: salary - totalSpent
            };
        });

        res.json({ expense: updatedExpenses.reverse() }); // reverse to show latest first
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
