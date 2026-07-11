import { createTransporter } from "../config/mail.js";
import { resetPasswordTemplate } from "../templates/resetPasswordTemplate.js";

export const sendWelcomeEmail = async (toEmail, toName, loginUrl) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[Email] Not configured — skipping welcome email");
    return;
  }

  const transporter = createTransporter();
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .content { color: #333; line-height: 1.6; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Inventra POS!</h1>
        </div>
        <div class="content">
          <p>Hi ${toName},</p>
          <p>Your account has been created successfully. You can now login to Inventra POS.</p>
          <p>Click the button below to login:</p>
          <a href="${loginUrl}" class="button">Login to Inventra POS</a>
          <p>Or copy this link: ${loginUrl}</p>
          <p>If you have any questions, feel free to contact support.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Inventra POS · All rights reserved</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from:    `"${process.env.EMAIL_FROM_NAME || "Inventra POS"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to:      toEmail,
      subject: "Welcome to Inventra POS",
      html,
    });

    return info;
  } catch (err) {
    console.error("[Email] Welcome email failed:", err.message);
    throw err;
  }
};

export const sendPasswordResetEmail = async (toEmail, toName, resetUrl) => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[Email] Not configured — cannot send password reset email");
    console.warn("[Debug] EMAIL_USER:", !!process.env.EMAIL_USER, "EMAIL_PASS:", !!process.env.EMAIL_PASS);
    throw new Error(
      "Email service not properly configured on server. Please contact administrator."
    );
  }

  const transporter = createTransporter();
  const html = resetPasswordTemplate(toName, resetUrl);

  try {
    const info = await transporter.sendMail({
      from:    `"${process.env.EMAIL_FROM_NAME || "Inventra POS"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to:      toEmail,
      subject: "Reset Your Inventra POS Password",
      html,
    });

    console.log("[Email] Password reset email sent to:", toEmail);
    return info;
  } catch (err) {
    console.error("[Email] Password reset failed:", err.message);
    console.error("[Email] Error code:", err.code);
    console.error("[Email] Error details:", err);
    throw err;
  }
};
