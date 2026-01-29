const User = require('../models/user_model');
const bcrypt = require('bcryptjs');
const { sendSecurityAlert, sendOTP } = require('../utils/emailSender');

const register = async (username, email, password) => {
    const dbUser = await User.findOne({ email });
    if (dbUser) {
        throw new Error("Email already registered");
    }

    const dbUsername = await User.findOne({ username });
    if (dbUsername) {
        throw new Error('Username already taken!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });
    return await newUser.save();
}

const login = async (email, password, lat, long) => {
    const user = await User.findOne({ email });
    if (!user) {
        return { success: false, status: 400, message: "User not found" };
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
            sendSecurityAlert(user.email, user.username, lat, long);
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

const verifyOTP = async (username, otp) => {
    const user = await User.findOne({ username });
    if (!user) return { success: false, status: 400, message: "User not found" };

    // OTP ရှိမရှိ နဲ့ သက်တမ်းကုန်မကုန် စစ်မယ်
    if (!user.otp || user.otp !== otp) {
        return { success: false, status: 400, message: "Invalid OTP" };
    }

    if (user.otpExpires < Date.now()) {
        return { success: false, status: 400, message: "OTP Expired" };
    }

    // မှန်ရင် OTP ကို ပြန်ဖျက်မယ်
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { success: true, message: "Login Fully Successful! Access Granted." }
}

module.exports = {
    register,
    login, 
    verifyOTP
}