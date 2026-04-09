const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const emailTemplates = {
  verifyEmailOtp: (name, otp, expiresInMinutes = 10) => ({
    subject: "VPad - Your Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .otp-box { background: #f8f9ff; border: 1px dashed #667eea; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0; }
          .otp-code { letter-spacing: 8px; font-size: 30px; font-weight: 700; color: #2f3f8f; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 VPad</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Use the following verification code to complete your signup:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p style="color: #6c757d; font-size: 14px;">This code expires in ${expiresInMinutes} minutes. For your security, never share this code with anyone.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VPad. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  verifyEmail: (name, verificationUrl) => ({
    subject: "VPad - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 VPad</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for signing up for VPad. Please verify your email address to get started with your learning journey.</p>
            <center><a href="${verificationUrl}" class="btn">Verify Email Address</a></center>
            <p style="color: #6c757d; font-size: 14px;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VPad. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  resetPassword: (name, resetUrl) => ({
    subject: "VPad - Reset Your Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 VPad</h1>
          </div>
          <div class="content">
            <h2>Hello, ${name}!</h2>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <center><a href="${resetUrl}" class="btn">Reset Password</a></center>
            <p style="color: #6c757d; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VPad. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  noteShared: (recipientName, senderName, noteTitle, noteUrl) => ({
    subject: `VPad - ${senderName} shared a note with you`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .note-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 VPad</h1>
          </div>
          <div class="content">
            <h2>Hello, ${recipientName}!</h2>
            <p><strong>${senderName}</strong> has shared a note with you.</p>
            <div class="note-card">
              <h3 style="margin: 0 0 10px 0;">${noteTitle}</h3>
              <p style="margin: 0; color: #6c757d;">Click below to view and collaborate on this note.</p>
            </div>
            <center><a href="${noteUrl}" class="btn">View Note</a></center>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VPad. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  adminInvite: (email, inviteUrl, permissions) => ({
    subject: "VPad - Admin Invitation",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .permissions { background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .permissions ul { margin: 10px 0; padding-left: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 VPad Admin</h1>
          </div>
          <div class="content">
            <h2>You've Been Invited!</h2>
            <p>You have been invited to join VPad as an administrator.</p>
            <div class="permissions">
              <strong>Your permissions will include:</strong>
              <ul>
                ${permissions.map((p) => `<li>${p.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</li>`).join("")}
              </ul>
            </div>
            <p>Click the button below to set up your admin account:</p>
            <center><a href="${inviteUrl}" class="btn">Accept Invitation</a></center>
            <p style="color: #6c757d; font-size: 14px;">This invitation will expire in 48 hours. If you didn't expect this invitation, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VPad. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  announcement: (userName, title, message) => ({
    subject: `VPad - ${title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .announcement { background: #fff3cd; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 VPad</h1>
          </div>
          <div class="content">
            <h2>Hello, ${userName}!</h2>
            <div class="announcement">
              <h3 style="margin: 0 0 10px 0;">📢 ${title}</h3>
              <p style="margin: 0;">${message}</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VPad. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

module.exports = {
  sendEmail,
  emailTemplates,
};
