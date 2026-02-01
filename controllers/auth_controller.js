const authService = require('../services/auth_service');
 
const LoginHistory = require('../models/login_history');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const result = await authService.register(username, email, password);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyRegistration = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyRegistration(email, otp);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// exports.login = async (req, res) => {
//     try {
//         // lat, long ပါ လက်ခံမယ်
//         const { email, password, lat, long, device } = req.body;
//         let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
//         // Service ကို lat, long ပါ ထည့်ပေးလိုက်မယ်
//         const result = await authService.login(email, password, lat, long, device, ip);

//         if (!result.success) {
//             return res.status(result.status).json({ message: result.message });
//         }
//         res.json(result);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// (1) Model ကို import လုပ်ဖို့ မမေ့ပါနဲ့ (လမ်းကြောင်းမှန်အောင် စစ်ပါ)


// exports.login = async (req, res) => {
//     try {
//         const { email, password, lat, long, device } = req.body;
//         let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

//         const result = await authService.login(email, password, lat, long, device, ip);

//         if (!result.success) {
//             return res.status(result.status).json({ message: result.message });
//         }

//         // Login History သိမ်းခြင်း
//         try {
//             const history = new LoginHistory({
//                 email: email,
//                 device: device || "Unknown Device",
//                 ip: ip,
//                 lat: lat,
//                 long: long,
//                 loginTime: Date.now()
//             });
//             await history.save();
//         } catch (historyError) {
//             console.error("History Save Error:", historyError.message);
//         }

//         res.json(result);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

exports.login = async (req, res) => {
    try {
        const { email, password, lat, long, device } = req.body;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

        const result = await authService.login(email, password, lat, long, device, ip);

        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        
        // ⚠️ ဒီနေရာမှာ History သိမ်းတာကို ဖျက်လိုက်ပါပြီ ⚠️
        // (OTP မှန်မှ သိမ်းမှာမို့လို့ပါ)

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Verify OTP (Login OTP)
// exports.verifyOTP = async (req, res) => {
//     try {
//         const { email, otp } = req.body; // Flutter က email နဲ့ otp ပို့ရင် email နဲ့ဖမ်းပါ
//         // Username နဲ့ဆိုရင် const { username, otp } = req.body;
        
//         const result = await authService.verifyOTP(email, otp); // Service မှာ email လက်ခံအောင်ပြင်ထားရမယ်

//         if (!result.success) {
//             return res.status(400).json({ message: result.message });
//         }
//         res.json(result);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

exports.verifyOTP = async (req, res) => {
    try {
        // Flutter ကနေ device, lat, long ပါ ပို့ပေးရပါမယ်
        const { email, otp, device, lat, long } = req.body; 
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

        const result = await authService.verifyOTP(email, otp); // Service မှာ email လက်ခံအောင်ပြင်ထားရမယ်

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        // ✅ OTP မှန်မှ History သိမ်းမယ့် Code ✅
        try {
            const history = new LoginHistory({
                email: email,
                device: device || "Unknown Device", // Device name
                ip: ip,
                lat: lat,
                long: long,
                loginTime: Date.now()
            });
            await history.save();
        } catch (historyError) {
            console.error("History Save Error:", historyError.message);
        }
        // **********************************

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// 5. Get History (ဒီကောင်ပျောက်နေလို့ Error တက်တာပါ)
exports.getHistory = async (req, res) => {
    try {
        const { email } = req.params;
        const history = await authService.getLoginHistory(email);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ... ကျန်တဲ့ function တွေ (register, etc.) က အတူတူပါပဲ ...

// exports.getHistory = async (req, res) => {
//     try {
//         const { email } = req.params;
//         const history = await authService.getLoginHistory(email);
//         res.json(history);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

exports.verifyOTP = async (req, res) => {
    try {
        // Flutter က { email, otp } ပို့လိုက်တာမို့ ဒီလို ဖမ်းရပါမယ်
        const { email, otp, lat, long, device } = req.body;
        let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        // Service ကို email ပို့ပေးပါ
        const result = await authService.verifyOTP(email, otp, ip, device, lat, long);

        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


