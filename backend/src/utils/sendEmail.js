/**
 * Brevo (Sendinblue) Transactional Email Service
 * Sends branded HTML emails via Brevo REST API v3
 */
export const sendBrevoEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'support@sportxwear.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'SPORT X WEAR';

  if (!apiKey) {
    console.warn(
      '\n[BREVO WARNING] BREVO_API_KEY is not defined in backend/.env.\n' +
      `Email would be sent to: ${toEmail}\n` +
      `Subject: ${subject}\n`
    );
    return {
      success: false,
      isSimulated: true,
      message: 'BREVO_API_KEY is missing. Check server logs for simulated OTP.',
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail.split('@')[0],
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Brevo API Error]:', data);
      throw new Error(data.message || `Brevo API error: ${response.statusText}`);
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('[Brevo Dispatch Error]:', error.message);
    throw error;
  }
};

/**
 * Generate branded OTP email template
 */
export const getOtpEmailTemplate = (name, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your SPORT X WEAR Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f3f0; margin: 0; padding: 30px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e5e5e5;">
    <!-- Brand Header -->
    <div style="background-color: #0a0a0a; padding: 28px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; font-style: italic;">
        SPORT <span style="color: #e60000; font-style: italic;">X</span> WEAR
      </h1>
      <p style="color: #a3a3a3; margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
        BUILT FOR CHAMPIONS
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px; text-align: center;">
      <h2 style="color: #171717; margin: 0 0 10px; font-size: 20px; font-weight: 800; text-transform: uppercase;">
        VERIFY YOUR ATHLETE ACCOUNT
      </h2>
      <p style="color: #525252; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        Hi <strong>${name || 'Champion'}</strong>, use the 6-digit one-time password below to verify your email and activate your account.
      </p>

      <!-- 6-digit OTP Box -->
      <div style="background: #f7f7f6; border: 2px dashed #e60000; border-radius: 10px; padding: 18px 24px; display: inline-block; margin: 0 auto 24px;">
        <span style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0a0a0a; display: block;">
          ${otp}
        </span>
      </div>

      <p style="color: #737373; font-size: 12px; margin: 0 0 20px;">
        ⏳ This code expires in <strong>10 minutes</strong>. Do not share this OTP with anyone.
      </p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <p style="color: #a3a3a3; font-size: 11px; margin: 0;">
        If you did not initiate this request, you can safely disregard this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #fafafa; padding: 16px 20px; text-align: center; border-top: 1px solid #eeeeee;">
      <p style="color: #737373; font-size: 11px; margin: 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
        SPORT X WEAR • HIGH PERFORMANCE ATHLETIC APPAREL
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate branded Password Reset OTP email template
 */
export const getPasswordResetOtpTemplate = (name, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your SPORT X WEAR Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f3f0; margin: 0; padding: 30px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e5e5e5;">
    <!-- Brand Header -->
    <div style="background-color: #0a0a0a; padding: 28px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; font-style: italic;">
        SPORT <span style="color: #e60000; font-style: italic;">X</span> WEAR
      </h1>
      <p style="color: #a3a3a3; margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
        BUILT FOR CHAMPIONS
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 28px; text-align: center;">
      <h2 style="color: #171717; margin: 0 0 10px; font-size: 20px; font-weight: 800; text-transform: uppercase;">
        PASSWORD RESET REQUEST
      </h2>
      <p style="color: #525252; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        Hi <strong>${name || 'Athlete'}</strong>, we received a request to reset the password for your SPORT X WEAR account. Use the 6-digit OTP below to proceed with setting a new password.
      </p>

      <!-- 6-digit OTP Box -->
      <div style="background: #f7f7f6; border: 2px dashed #e60000; border-radius: 10px; padding: 18px 24px; display: inline-block; margin: 0 auto 24px;">
        <span style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0a0a0a; display: block;">
          ${otp}
        </span>
      </div>

      <p style="color: #737373; font-size: 12px; margin: 0 0 20px;">
        ⏳ This code expires in <strong>10 minutes</strong>. If you did not request this, your account is safe and you can ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

      <p style="color: #a3a3a3; font-size: 11px; margin: 0;">
        For account security, never share this OTP with anyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #fafafa; padding: 16px 20px; text-align: center; border-top: 1px solid #eeeeee;">
      <p style="color: #737373; font-size: 11px; margin: 0; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
        SPORT X WEAR • HIGH PERFORMANCE ATHLETIC APPAREL
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
