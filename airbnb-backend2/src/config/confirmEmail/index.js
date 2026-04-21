import Listing from '../../model/listingModel/index.js';
import { sendEmail as resendSendEmail } from '../../services/emailService.js';

const sendConfirmationEmail = async (userId, confirmedBooking) => {
  try {
    const emailTemplate = `
        <html>
          <head>
            <style>
              .container { font-family: Arial, sans-serif; color: #333; }
              .header { background-color: #ff385c; color: white; padding: 10px; text-align: center; }
              .footer { background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #777; }
              .body { padding: 20px; }
              .button { background-color: #ff385c; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; }
              img { max-width: 150px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                 <h2>Booking Confirmation</h2>
              </div>
              <div class="body">
                <p>Hello,</p>
                <p>We are excited to confirm your booking for the listing:</p>
                <p><strong>Listing Title: ${confirmedBooking.listingId.title}</strong></p>
                <p>Your booking details are as follows:</p>
                <ul>
                  <li><strong>Start Date:</strong> ${new Date(confirmedBooking.startDate).toLocaleDateString()}</li>
                  <li><strong>End Date:</strong> ${new Date(confirmedBooking.endDate).toLocaleDateString()}</li>
                  <li><strong>Guest Capacity:</strong> ${confirmedBooking.guestCapacity}</li>
                  <li><strong>Total Price:</strong> $${confirmedBooking.totalPrice}</li>
                </ul>
                <p>Thank you for booking with us. We hope you have a wonderful stay!</p>
                <a href="${process.env.FRONTEND_BASE_URL}/my-bookings" class="button">View Your Booking</a>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || "Mehman"}. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;

    await resendSendEmail({
      to: confirmedBooking.email || process.env.RESEND_FROM_EMAIL, // Fallback if email is missing
      subject: 'Your Booking is Confirmed!',
      html: emailTemplate,
    });

  } catch (error) {
    console.error('Error sending confirmation email:', error.message);
  }
};

export default sendConfirmationEmail;