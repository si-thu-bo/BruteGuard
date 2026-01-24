const authService = require('../services/auth_service');

exports.register = async (req, res) => {
    try {
        const { username,email, password } = req.body;
        await authService.register(username,email,  password);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

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
        const { username, otp } = req.body;
        const result = await authService.verifyOTP(username, otp);

        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};