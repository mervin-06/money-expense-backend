import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/UserRoutes.js";
import expenseRoutes from "./routes/ExpenseRoute.js";

const app = express();
dotenv.config();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/expense", expenseRoutes);

const PORT = process.env.PORT;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});