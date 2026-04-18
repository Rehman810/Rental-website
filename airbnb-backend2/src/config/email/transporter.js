
import { sendEmail as resendSendEmail } from '../../services/emailService.js';

export const sendEmail = async ({ to, subject, html }) => {
    try {
        await resendSendEmail({ to, subject, html });
        return true;
    } catch (error) {
        console.error('Error sending email via transporter wrapper:', error.message);
        return false;
    }
};

// Exporting a dummy transporter for backward compatibility if needed, 
// though direct use of sendMail will now fail if anything relies on the specific nodemailer transporter instance.
const transporter = {
    sendMail: async (options) => {
        return await resendSendEmail({
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            from: options.from
        });
    }
};

export default transporter;
