const authService = require('../services/auth_service');

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

exports.login = async (req, res) => {
    try {
        // lat, long ပါ လက်ခံမယ်
        const { email, password, lat, long } = req.body;

        // Service ကို lat, long ပါ ထည့်ပေးလိုက်မယ်
        const result = await authService.login(email, password, lat, long);

        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.verifyOTP = async (req, res) => {
    try {
        // Flutter က { email, otp } ပို့လိုက်တာမို့ ဒီလို ဖမ်းရပါမယ်
        const { email, otp } = req.body;

        console.log("Controller received:", email, otp);

        // Service ကို email ပို့ပေးပါ
        const result = await authService.verifyOTP(email, otp);

        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

