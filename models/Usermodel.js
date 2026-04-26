import mongoose from "mongoose";

const Userschema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    oldpassword: String,
    otp: String,
    otpExpiry: Date,
    role: {
        type: String,
        default: 'user'
    },
    salary: {
        type: Number,
        default: 0,
    }
});

export const usermodel = mongoose.model("Users", Userschema, "data");
