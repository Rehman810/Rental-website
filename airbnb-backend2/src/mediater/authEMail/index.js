import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const authEmail = async (email, userName = "User") => {
  if (!email) throw new Error("Recipient email is required");

  const currentYear = new Date().getFullYear();

  const mailOptions = {
    from: `"Airbnb" <${process.env.EMAIL}>`,
    to: email,
    subject: "Welcome to Airbnb — Account Created Successfully",
    text: `
Hi ${userName},

Your Airbnb account has been created successfully.

You can now log in and start using the platform.

If you did not create this account, please contact support immediately.

Regards,
Airbnb Team
    `,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Account Created</title>
</head>
<body style="margin:0; padding:0; background:#f6f7fb; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background:#f6f7fb;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:#ff385c; padding:22px 26px;">
              <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:700; letter-spacing:0.4px;">
                Airbnb
              </h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.9); font-size:13px;">
                Account Notification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 26px;">
              <h2 style="margin:0 0 10px; color:#111827; font-size:20px;">
                Welcome, ${userName} 👋
              </h2>

              <p style="margin:0 0 14px; color:#4b5563; font-size:14px; line-height:1.7;">
                Your account has been successfully created. You can now log in and start exploring listings,
                managing bookings, and accessing all platform features.
              </p>

              <div style="background:#f9fafb; border:1px solid #eef2f7; padding:14px; border-radius:12px; margin:18px 0;">
                <p style="margin:0; color:#111827; font-size:13px; font-weight:600;">
                  Account Email
                </p>
                <p style="margin:6px 0 0; color:#374151; font-size:13px;">
                  ${email}
                </p>
              </div>

              <p style="margin:0 0 18px; color:#6b7280; font-size:13px; line-height:1.7;">
                If you did not create this account, please contact our support team immediately.
              </p>

              <div style="text-align:center; margin:22px 0 6px;">
                <a href="#"
                   style="display:inline-block; background:#ff385c; color:#ffffff; text-decoration:none;
                          padding:12px 22px; border-radius:10px; font-size:14px; font-weight:600;">
                  Go to Dashboard
                </a>
              </div>

              <p style="margin:18px 0 0; color:#9ca3af; font-size:12px; line-height:1.6;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:16px 26px; text-align:center; border-top:1px solid #eef2f7;">
              <p style="margin:0; color:#9ca3af; font-size:12px;">
                © ${currentYear} Airbnb. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default authEmail;
