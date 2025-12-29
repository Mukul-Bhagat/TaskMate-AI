const nodemailer = require('nodemailer');

const sendEmail = async (to, name, password) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // Connects as the SMTP User (e.g. Brevo ID)
        pass: process.env.EMAIL_PASS  // SMTP Key
      }
    });

    const loginLink = "http://localhost:5173/login";

    const mailOptions = {
      from: `"TaskMate Admin" <${process.env.EMAIL_FROM}>`, // Sends as verified sender
      to: to,
      subject: 'Welcome to TaskMate - Your Login Details',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ef4444; padding: 20px; text-align: center;">
             <h1 style="color: white; margin: 0; font-size: 24px;">TaskMate</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome Aboard!</h2>
            <p style="color: #4b5563; line-height: 1.6;">Hi ${name},</p>
            <p style="color: #4b5563; line-height: 1.6;">You have been virtually invited to join the <b>TaskMate</b> workspace. Utilize the credentials below to access your account.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">Login Email</p>
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #1f2937; font-size: 16px;">${to}</p>

              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">Login URL</p>
              <a href="${loginLink}" style="display: block; color: #ef4444; text-decoration: none; font-weight: bold; font-size: 16px; margin-bottom: 15px;">${loginLink}</a>
              
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">Temporary Password</p>
              <code style="background-color: #ffffff; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 16px; color: #111827; display: inline-block;">${password}</code>
            </div>
            
            <p style="color: #4b5563; font-size: 14px;">For security, please reset your password immediately after your first login.</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${loginLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Dashboard</a>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
            &copy; ${new Date().getFullYear()} TaskMate AI. All rights reserved.
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent! Message ID:", info.messageId);

  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = sendEmail;
