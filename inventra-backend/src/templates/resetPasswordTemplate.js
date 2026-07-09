/**
 * Professional responsive HTML email template for password reset.
 * @param {string} name     - user's full name
 * @param {string} resetUrl - password reset URL
 * @returns {string} HTML string
 */
export const resetPasswordTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#38bdf8,#6366f1);border-radius:14px;padding:12px 16px;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">? inventra POS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px 36px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
                Hi ${name} ??
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;line-height:1.6;">
                We received a request to reset the password for your inventra POS account.
                Click the button below to set a new password. This link is valid for
                <strong style="color:#f8fafc;">15 minutes</strong>.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#38bdf8,#6366f1);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 24px;" />

              <!-- Security note -->
              <p style="margin:0 0 12px;font-size:13px;color:#64748b;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;color:#38bdf8;word-break:break-all;">
                ${resetUrl}
              </p>

              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 6px;font-size:12px;color:#334155;">
                © ${new Date().getFullYear()} inventra POS · All rights reserved
              </p>
              <p style="margin:0;font-size:12px;color:#334155;">
                Need help? Contact us at
                <a href="mailto:${process.env.EMAIL_FROM || "support@inventra.com"}"
                   style="color:#38bdf8;text-decoration:none;">
                  ${process.env.EMAIL_FROM || "support@inventra.com"}
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
