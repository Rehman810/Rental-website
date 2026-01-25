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

export const sendVerificationCode = async (email, code) => {
    if (!email) throw new Error("Recipient email is required");

    const currentYear = new Date().getFullYear();

    const mailOptions = {
        from: `"Airbnb" <${process.env.EMAIL}>`,
        to: email,
        subject: "Verify your email address",
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Email</title>
</head>
<body style="margin:0; padding:0; background:#f6f7fb; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background:#f6f7fb;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#ff385c; padding:22px 26px;">
              <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:700;">Airbnb</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 26px;">
              <h2 style="margin:0 0 10px; color:#111827; font-size:20px;">Verify your email</h2>
              <p style="margin:0 0 14px; color:#4b5563; font-size:14px; line-height:1.7;">
                Use the following code to verify your email address. This code will expire in 10 minutes.
              </p>
              <div style="background:#f9fafb; border:1px solid #eef2f7; padding:14px; border-radius:12px; margin:18px 0; text-align:center;">
                <p style="margin:0; color:#111827; font-size:24px; font-weight:700; letter-spacing: 2px;">
                  ${code}
                </p>
              </div>
              <p style="margin:18px 0 0; color:#9ca3af; font-size:12px; line-height:1.6;">
                If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb; padding:16px 26px; text-align:center; border-top:1px solid #eef2f7;">
              <p style="margin:0; color:#9ca3af; font-size:12px;">© ${currentYear} Airbnb. All rights reserved.</p>
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
