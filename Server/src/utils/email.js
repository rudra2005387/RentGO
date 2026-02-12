const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send booking confirmation email
 */
exports.sendBookingConfirmation = async (userEmail, userName, bookingDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Booking Confirmation - RentGo',
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <ul>
          <li><strong>Property:</strong> ${bookingDetails.propertyTitle}</li>
          <li><strong>Check-in:</strong> ${bookingDetails.checkInDate}</li>
          <li><strong>Check-out:</strong> ${bookingDetails.checkOutDate}</li>
          <li><strong>Total Amount:</strong> ${bookingDetails.totalAmount}</li>
          <li><strong>Booking Reference:</strong> ${bookingDetails.bookingReference}</li>
        </ul>
        <p>Thank you for using RentGo!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    // Don't throw error, just log it
  }
};

/**
 * Send review request email
 */
exports.sendReviewRequest = async (userEmail, userName, bookingDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Share your experience - RentGo',
      html: `
        <h2>We'd love to hear from you!</h2>
        <p>Hi ${userName},</p>
        <p>Your stay at ${bookingDetails.propertyTitle} has ended. Please share your experience by leaving a review.</p>
        <p><a href="${process.env.CLIENT_URL}/reviews/${bookingDetails.bookingId}">Leave a Review</a></p>
        <p>Your feedback helps other travelers and hosts improve their experience on RentGo.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Review request email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending review request email:', error);
  }
};

/**
 * Send booking cancellation email
 */
exports.sendCancellationEmail = async (userEmail, userName, bookingDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Booking Cancelled - RentGo',
      html: `
        <h2>Booking Cancelled</h2>
        <p>Hi ${userName},</p>
        <p>Your booking has been cancelled.</p>
        <ul>
          <li><strong>Property:</strong> ${bookingDetails.propertyTitle}</li>
          <li><strong>Booking Reference:</strong> ${bookingDetails.bookingReference}</li>
          <li><strong>Refund Amount:</strong> ${bookingDetails.refundAmount}</li>
        </ul>
        <p>If you have any questions, please contact our support team.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Cancellation email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
  }
};

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to RentGo!',
      html: `
        <h2>Welcome to RentGo!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for joining RentGo. We're excited to have you as part of our community.</p>
        <p>Whether you're looking to book a place or list your own property, we've got you covered.</p>
        <p><a href="${process.env.CLIENT_URL}">Get Started</a></p>
        <p>Happy travels!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Reset Your RentGo Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
  }
};

/**
 * Send notification email
 */
exports.sendNotificationEmail = async (userEmail, subject, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: `<p>${message}</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Notification email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
  }
};
