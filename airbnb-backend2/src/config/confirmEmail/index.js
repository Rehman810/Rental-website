import Listing from '../../model/listingModel/index.js';
import nodemailer from 'nodemailer'
const sendConfirmationEmail = async (userId, confirmedBooking) => {
    try {
      // const user = await Listing.findById(userId); 
      // console.log("User",user)
      // if (!user) {
      //   throw new Error('User not found');
      // }
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL, 
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const emailTemplate = `
        <html>
          <head>
            <style>
              .container { font-family: Arial, sans-serif; color: #333; }
              .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
              .footer { background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 12px; color: #777; }
              .body { padding: 20px; }
              .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold; }
              img { max-width: 150px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://s.rozee.pk/company_logos/00/cpl_34362578003607.png" alt="Logo" />
                <h2>Booking Confirmation</h2>
              </div>
              <div class="body">
                <p>Hello ${'Asghar Ali'},</p>
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
                <a href="https://your-booking-website.com/my-bookings" class="button">View Your Booking</a>
              </div>
              <div class="footer">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
  
      const mailOptions = {
        from: process.env.EMAIL, 
        to: process.env.EMAIL,
        subject: 'Your Booking is Confirmed!',
        html: emailTemplate,
      };
  
      await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent to:', process.env.EMAIL);
    } catch (error) {
      console.error('Error sending email:', error.message);
    }
  };
  
  export default sendConfirmationEmail