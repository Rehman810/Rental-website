
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: `"Airbnb" <${process.env.EMAIL}>`,
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        return false;
    }
};

export default transporter;
