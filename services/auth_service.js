const User = require('../models/user_model');
const bcrypt = require('bcryptjs');
const emailValidator = require('deep-email-validator');
const { sendSecurityAlert, sendOTP, sendRegistrationOTP } = require('../utils/emailSender');
const login_history_model = require('../models/login_history_model');

const register = async (username, email, password) => {

    // (A) Deep Email Validation (gmaill.com တို့ကို စစ်မယ်)
    const res = await emailValidator.validate(email);
    if (!res.valid) {
        throw new Error("Invalid email domain. Please use a real email address.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("Email already registered");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // (B) OTP ထုတ်မယ်
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        otp: otpCode, // OTP သိမ်းမယ်
        otpExpires: Date.now() + 10 * 60 * 1000,
        isVerified: false // Verified မဖြစ်သေးဘူး
    });

    await newUser.save();

    sendRegistrationOTP(email, otpCode);

    return { message: "OTP sent to email. Please verify to complete registration." };
};

const verifyRegistration = async (email, otp) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    if (user.isVerified) throw new Error("User already verified");

    // OTP စစ်မယ်
    if (user.otp !== otp || user.otpExpires < Date.now()) {
        throw new Error("Invalid or Expired OTP");
    }

    // မှန်ရင် Verified ဖြစ်ပြီလို့ ပြောင်းမယ်
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { success: true, message: "Email Verified Successfully! You can now login." };
};

const login = async (email, password, lat, long, device, ip) => {
    const user = await User.findOne({ email });
    if (!user) {
        return { success: false, status: 400, message: "User not found" };
    }

    if (!user.isVerified) {
        return { success: false, status: 403, message: "Please verify your email first." };
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
        return {
            success: false,
            status: 403,
            message: `Account locked. Try again in ${remainingTime} seconds.`
        };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otpCode;
        user.otpExpires = Date.now() + 10 * 60 * 1000;


        user.loginAttempts = 0;
        user.lockUntil = undefined;

        await user.save();

        sendOTP(user.email, otpCode);

        // (D) Controller ဆီကို OTP လိုတယ်ဆိုတဲ့ flag နဲ့ ပြန်ပြောမယ်
        return {
            success: true,
            requireOTP: true,
            message: "Password correct. Please verify OTP sent to your email."
        };
    } else {
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
            user.lockUntil = Date.now() + 1 * 60 * 1000; // 1 Minute Lock
            sendSecurityAlert(user.email, user.username,lat, long, device, ip);
            await user.save();
            return {
                success: false,
                status: 403,
                message: "Too many failed attempts. Account locked for 1 minute."
            };
        }

        await user.save();
        return {
            success: false,
            status: 401,
            message: `Incorrect Password. Attempts remaining: ${5 - user.loginAttempts}`
        };
    }
}

const verifyOTP = async (email, otp, ip, device, lat, long) => {

    console.log("Received Email:", email); // Log ထုတ်ကြည့်မယ်

    // (2) Database မှာ username နဲ့ မရှာဘဲ email နဲ့ ရှာပါမယ်
    const user = await User.findOne({ email });

    if (!user) return { success: false, status: 400, message: "User not found" };

    // OTP ရှိမရှိ နဲ့ သက်တမ်းကုန်မကုန် စစ်မယ်
    if (!user.otp || user.otp !== otp) {
        return { success: false, status: 400, message: "Invalid OTP" };
    }

    if (user.otpExpires < Date.now()) {
        return { success: false, status: 400, message: "OTP Expired" };
    }
    await login_history_model.create({
        email: user.email,
        ip: ip,
        device: device || "Unknown Device",
        location: `${lat}, ${long}`
    });
    // မှန်ရင် OTP ကို ပြန်ဖျက်မယ်
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { success: true, message: "Login Fully Successful! Access Granted." }
}

const getLoginHistory = async (email) => {
    const results = await login_history_model.find({ email }).sort({ loginTime: -1 }).limit(10);
    return results;
}

module.exports = {
    register,
    login,
    verifyOTP,
    verifyRegistration,
    getLoginHistory
}