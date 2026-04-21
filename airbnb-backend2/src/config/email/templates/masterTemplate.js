
const currentYear = new Date().getFullYear();

const masterTemplate = ({
  title = "Notification",
  greeting = "Hello",
  message = "",
  details = [], // Array of { label, value }
  action = null, // { label, url }
  supportEmail = "support@" + process.env.APP_NAME + ".com",
  footerText = "",
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background:#f6f7fb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background:#f6f7fb;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
          
          <!-- Header -->
          <tr>
            <td style="background:#ff385c; padding:24px; text-align: center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:bold; letter-spacing:1px;">
                ${process.env.APP_NAME}
              </h1>
              <p style="margin:5px 0 0; color:rgba(255,255,255,0.9); font-size:14px;">
                ${title}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px;">
              <h2 style="margin:0 0 16px; color:#222222; font-size:20px; font-weight: 600;">
                ${greeting}
              </h2>

              <p style="margin:0 0 20px; color:#484848; font-size:16px; line-height:1.6;">
                ${message}
              </p>

              ${details && details.length > 0
      ? `
                <div style="background:#f7f7f7; border-radius:8px; padding:20px; margin:24px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${details
        .map(
          (item) => `
                      <tr>
                        <td style="padding:8px 0; border-bottom:1px solid #eaeaea; color:#717171; font-size:14px; width: 40%;">
                          ${item.label}
                        </td>
                        <td style="padding:8px 0; border-bottom:1px solid #eaeaea; color:#222222; font-size:14px; font-weight:600; text-align:right;">
                          ${item.value}
                        </td>
                      </tr>
                    `
        )
        .join("")}
                  </table>
                </div>
                `
      : ""
    }

              ${action
      ? `
                <div style="text-align:center; margin:32px 0;">
                  <a href="${action.url}"
                     style="display:inline-block; background:#ff385c; color:#ffffff; text-decoration:none;
                            padding:14px 28px; border-radius:8px; font-size:16px; font-weight:600; box-shadow: 0 2px 4px rgba(255, 56, 92, 0.2);">
                    ${action.label}
                  </a>
                </div>
                `
      : ""
    }

              <p style="margin:24px 0 0; color:#717171; font-size:14px; line-height:1.5; border-top: 1px solid #eaeaea; padding-top: 20px;">
                Need help? Contact us at <a href="mailto:${supportEmail}" style="color:#ff385c; text-decoration:none;">${supportEmail}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f7f7; padding:20px; text-align:center; border-top:1px solid #eaeaea;">
              <p style="margin:0; color:#999999; font-size:12px;">
                © ${currentYear} ${process.env.APP_NAME}. All rights reserved.
              </p>
              ${footerText
      ? `<p style="margin:8px 0 0; color:#999999; font-size:12px;">${footerText}</p>`
      : ""
    }
              <div style="margin-top: 10px;">
                <a href="#" style="color:#999999; text-decoration:none; margin: 0 5px; font-size: 12px;">Privacy</a>
                <span style="color:#999999;">•</span>
                <a href="#" style="color:#999999; text-decoration:none; margin: 0 5px; font-size: 12px;">Terms</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export default masterTemplate;
