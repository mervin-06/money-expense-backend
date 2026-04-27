import mongoose from "mongoose";

const ExpenseSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    type: String,
    title: String,
    amount: Number,
    catagory: String,
    balance: Number,
    description: String,
    date: {
        type: Date,
        default: Date.now,
    }
});

export const ExpenseModel = mongoose.model("Expensemodel", ExpenseSchema);
