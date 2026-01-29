const nodemailer = require('nodemailer');
const sendSecurityAlert = async (email, username, lat, long) => {
    try {
        const locationLink = (lat && long)
            ? `https://www.google.com/maps?q=${lat},${long}`
            : "Location not available";

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: `"BruteGuard Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `🚨 Security Alert: Suspicious Login Detected`,
            html: `
      <h3>Dear ${username},</h3>
      <p>We detected multiple failed login attempts on your account.</p>
      <p style="color: red; font-weight: bold;">Your account has been temporarily locked.</p>
      
      <hr>
      <p><strong>Device Location:</strong></p>
      <p>The login attempt came from these coordinates:</p>
      <p>
         <a href="${locationLink}" style="background-color: #d9534f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Attacker's Location on Google Maps
         </a>
      </p>
      <p>Coordinates: ${lat}, ${long}</p>
      <hr>
      
      <p>Regards,<br>BruteGuard Team</p>
    `
        };

        await transporter.sendMail(mailOptions);
        console.log("📧 Security Alert with Location Sent!");
    } catch (error) {
        console.error("❌ Email Sending Failed:", error.message);
    }
}

const sendOTP = async (email, otpCode) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"BruteGuard Security" <${process.env.EMAIL_USER}`,
            to: email,
            subject: '🔐 Login Verification Code',
            html: `
            <h3>Verify it's you</h3>
            <p>Someone entered your password correctly.</p>
            <p>If this was you, please use the code below to complete the login:</p>
            <h1 style="color: blue; letter-spacing: 5px;">${otpCode}</h1>
            <p>This code expires in 10 minutes.</p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log("📨 OTP Sent to " + email);

    } catch (error) {
        console.error("❌ OTP Email Error:", error.message);
    }
}

module.exports = { sendSecurityAlert, sendOTP }; 