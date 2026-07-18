import { escapeHtml } from "../helpers/escape-html";

/**
 * Generates a professional HTML email for employee email verification.
 * The email contains the verification token (to be manually entered) and the user's email address.
 *
 * @param {string} plainToken - The raw verification token (displayed as a code).
 * @param {string} email - The employee's email address.
 * @returns {string} - Complete HTML email body as a string.
 */
export function EmployeeVerificationHtml(plainToken: string, email: string) {
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify your email – BD Travel Spirit Guide System</title>
  <style type="text/css">
    body, table, td, p, a { 
      font-family: Arial, Helvetica, sans-serif; 
      line-height: 1.5; 
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
    }
    .logo-mark {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #006666, #008080, #009999);
      border-radius: 16px;
      box-shadow: 0 8px 20px rgba(0, 102, 102, 0.3);
      text-align: center;
      line-height: 60px;
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
    }
    .token-box {
      background: #f1f5f9;
      border-left: 4px solid #006666;
      padding: 16px 20px;
      font-family: 'Courier New', monospace;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #0f172a;
      border-radius: 8px;
      word-break: break-all;
      margin: 24px 0;
    }
    @media only screen and (max-width: 480px) {
      .brand-name { font-size: 18px !important; }
      .token-box { font-size: 18px !important; padding: 12px 16px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5;">
  <!--[if (gte mso 9)|(IE)]>
    <table width="600" align="center" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
  <![endif]-->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:16px; box-shadow:0 4px 10px rgba(0,0,0,0.05); border-collapse:separate;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 24px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="70" style="vertical-align:middle;">
                    <div class="logo-mark" style="width:60px; height:60px; background:linear-gradient(135deg, #006666, #008080, #009999); border-radius:16px; text-align:center; line-height:60px; font-size:28px; font-weight:bold; color:#ffffff;">
                      BD
                    </div>
                  </td>
                  <td style="padding-left:16px; vertical-align:middle;">
                    <div class="brand-name" style="font-size:22px; font-weight:bold; color:#1e293b; letter-spacing:-0.5px;">BD Travel Spirit Guide</div>
                    <div style="font-size:13px; font-weight:600; color:#006666; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px;">Employee Verification</div>
                    <div style="height:3px; width:60px; background:linear-gradient(to right, #006666, #009999); border-radius:2px; margin-top:6px;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Main content -->
          <tr>
            <td style="padding:0 24px 24px 24px;">
              <h2 style="color:#0f172a; font-size:24px; font-weight:600; margin:0 0 8px 0;">Verify your email address</h2>
              <p style="color:#334155; font-size:16px; line-height:1.5; margin:0 0 16px 0;">Hello,</p>
              <p style="color:#334155; font-size:16px; line-height:1.5; margin:0 0 16px 0;">
                You're being onboarded as an employee of <strong>BD Travel Spirit Guide</strong>.
                Please verify your email address <strong>${escapeHtml(email)}</strong> by entering the verification token below on the verification page.
              </p>

              <!-- Token display box -->
              <div class="token-box" style="background:#f1f5f9; border-left:4px solid #006666; padding:16px 20px; font-family:'Courier New', monospace; font-size:24px; font-weight:bold; letter-spacing:2px; color:#0f172a; border-radius:8px; word-break:break-all; margin:24px 0;">
                ${escapeHtml(plainToken)}
              </div>

              <p style="color:#334155; font-size:16px; line-height:1.5; margin:24px 0 16px 0;">
                <strong>Instructions:</strong> Copy the token above and paste it into the verification form.
                The token will expire in <strong>1 hour</strong>. If you didn't request this verification, please ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px; border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8; font-size:13px; margin:0;">&copy; 2025 BD Travel Spirit Guide System. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <!--[if (gte mso 9)|(IE)]>
        </td>
      </tr>
    </table>
  <![endif]-->
</body>
</html>`;
}
