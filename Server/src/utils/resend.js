const { Resend } = require('resend');
const { APIError } = require('../middleware/error.middleware');

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new APIError('Resend API key is not configured', 500);
  }

  return new Resend(process.env.RESEND_API_KEY);
};

const getFromEmail = () => {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new APIError('Resend from email is not configured', 500);
  }
  return from;
};

exports.sendOtpEmail = async (toEmail, otpCode) => {
  const resend = getResendClient();
  const from = getFromEmail();

  const subject = 'Your RentGo OTP Code';
  const html = `
    <h2>RentGo Sign-In Code</h2>
    <p>Your one-time password is:</p>
    <p style="font-size: 24px; letter-spacing: 2px;"><strong>${otpCode}</strong></p>
    <p>This code expires in 5 minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  await resend.emails.send({
    from,
    to: toEmail,
    subject,
    html
  });
};
