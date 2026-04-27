import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { usermodel } from "../models/Usermodel.js";

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.OFFICIAL_EMAIL,
            pass: process.env.OFFICIAL_PASS,
        }
    });
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await usermodel.find().select("-password -otp -otpExpiry -__v -oldpassword");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await usermodel.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "User Not Exist" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }
        
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        
        return res.json({
            message: "Welcome Admin",
            token,
            role: user.role,
            salary: user.salary,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User Registration/Signup
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPass = await bcrypt.hash(password, 10);

        const userExisting = await usermodel.findOne({ email });
        
        if (userExisting) {
            return res.status(401).send({ message: "Email is Already registered!" });
        }

        const role = email === process.env.ADMIN_EMAIL ? "admin" : "user";
        
        const user = new usermodel({
            name,
            email,
            password: hashedPass,
            role: role,
        });

        const savedUser = await user.save();

        const msgforSignup = `Hello,

Your account has been created successfully in our Expense Tracker platform.
You can now manage your daily expenses, track your spending, and monitor your financial habits easily.
Our goal is to help you stay organized and make smarter financial decisions.
Log in to your account and start recording your expenses today.

Thank you for joining us!
`;

        const transporter = createTransporter();

        await transporter.sendMail({
            from: process.env.OFFICIAL_EMAIL,
            to: email,
            subject: "Email For SignUp OurSite",
            text: msgforSignup,
        });

        res.json(savedUser);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Get user by email
export const getUserByEmail = async (req, res) => {
    try {
        const email = req.params.email;
        const user = await usermodel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "user Cant Exist" });
        }
        
        res.json({ name: user.name, email: user.email, salary: user.salary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update salary
export const updateSalary = async (req, res) => {
    try {
        const { salary } = req.body;

        if (salary == null) {
            return res.status(400).send({ message: "Salary required" });
        }

        const user = await usermodel.findById(req.userId);
        if (!user) {
            return res.status(404).send({ message: "User Not found!" });
        }

        user.salary = salary;
        await user.save();

        res.json({ message: "Salary updated successfully", salary: user.salary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update password by email
export const updatePassword = async (req, res) => {
    try {
        const { currpassword, Newpassword } = req.body;
        const email = req.params.email;
        
        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "user not found" });
        }
        
        const isMatch = await bcrypt.compare(currpassword, user.password);
        if (isMatch) {
            const hashedPass = await bcrypt.hash(Newpassword, 10);
            user.oldpassword = user.password;
            user.password = hashedPass;
            await user.save();
            return res.json({ message: "updated successfully" });
        }
        
        res.status(500).send({ message: "Currrent password is Wrong" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send OTP for password reset
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await usermodel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "user Cant Exist" });
        }
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        
        const messageForEmail = `Money Expense – Security Alert

Your One-Time Password (OTP) is strictly confidential. Do not share it with anyone.

This OTP is valid for a limited time and is used to securely verify your identity. The Money Expense team will never ask for your OTP. Sharing this code may allow unauthorized access to your account and financial data.

If you did not request this OTP, please ignore this message or contact Money Expense support immediately.      
                                Your OTP Is ${otp}
                                `;
        
        await user.save();
        
        const transporter = createTransporter();

        await transporter.sendMail({
            from: process.env.OFFICIAL_EMAIL,
            to: user.email,
            subject: "OTP for Reset Password",
            text: messageForEmail
        });
        
        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
    try {
        const email = req.params.email;
        const { otp } = req.body;
        
        const user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "user Cant Exist" });
        }
        
        if (otp !== user.otp) {
            return res.status(400).json({ message: "Wrong OTP" });
        }
        
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }
        
        res.json({ message: "Corrct Otp" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    try {
        const email = req.params.email;
        const { password } = req.body;
        
        const hashedPass = await bcrypt.hash(password, 10);
        const user = await usermodel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "Cant Find User" });
        }
        
        user.oldpassword = user.password;
        user.password = hashedPass;
        await user.save();
        
        return res.json({ message: "Password Updated Sucessfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await usermodel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        if (userId === req.userId) {
            return res.status(403).json({ message: "Admin Cant Delete Itself..!" });
        }

        const msgForDelete = `Dear User,

Your Money Expense account has been successfully deleted by the Admin. All information linked to your account has been permanently removed.

If you need any help or further clarification, please contact the Admin.

Thank you for using our application.
`;

        await usermodel.findByIdAndDelete(userId);

        const transporter = createTransporter();

        await transporter.sendMail({
            from: process.env.OFFICIAL_EMAIL,
            to: user.email,
            subject: "Admin Delete Your Account",
            text: msgForDelete
        });

        return res.json({ message: "User Deleted Successfully..!" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
