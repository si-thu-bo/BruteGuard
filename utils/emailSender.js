const nodemailer = require('nodemailer');
const sendSecurityAlert = async (email, username, lat, long, device, ip) => {
  
  // Google Maps Link
  const locationLink = (lat && long) 
    ? `https://www.google.com/maps?q=${lat},${long}` 
    : "Location not available";

  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const mailOptions = {
    from: `"BruteGuard Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🚨 Security Alert: Suspicious Login Detected`,
    html: `
      <h3>Dear ${username},</h3>
      <p>We detected multiple failed login attempts on your account.</p>
      <p style="color: red; font-weight: bold;">Your account has been temporarily locked.</p>
      
      <div style="border: 1px solid #ccc; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">
        <p><strong>🛑 Attacker Details:</strong></p>
        <ul>
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Device:</strong> ${device}</li>
          <li><strong>Coordinates:</strong> ${lat}, ${long}</li>
        </ul>
        
        <p>
           <a href="${locationLink}" style="background-color: #d9534f; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
              View Location on Google Maps
           </a>
        </p>
      </div>

      <p>If this wasn't you, please change your password immediately.</p>
      <p>Regards,<br>BruteGuard Team</p>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log("📧 Full Security Alert Sent to " + email);
};

const sendRegistrationOTP = async (email, otpCode) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
        from: `"BruteGuard Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '📩 Verify your email address',
        html: `
      <h3>Welcome to BruteGuard!</h3>
      <p>Please enter the following code to verify your account:</p>
      <h1 style="color: green;">${otpCode}</h1>
      <p>This code expires in 10 minutes.</p>
    `
    });
    console.log("📨 Registration OTP Sent to " + email);
};

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

module.exports = { sendSecurityAlert, sendOTP, sendRegistrationOTP }; 