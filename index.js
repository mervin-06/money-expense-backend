import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/UserRoutes.js";
import expenseRoutes from "./routes/ExpenseRoute.js";
// Initialize
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: "*"
}));

// Routes
app.use("/users", userRoutes);
app.use("/users/expense", expenseRoutes);

// Connect to database and start server
const PORT = process.env.PORT;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server running on port http://localhost:${PORT}/users`);
    });
});