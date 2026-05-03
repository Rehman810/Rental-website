import { sendEmail as resendSendEmail } from "../../services/emailService.js";

const sendResetEmail = async (email, code) => {
    await resendSendEmail({
        to: email,
        subject: 'Password Reset',
        html: `<p>You requested a password reset. Your reset code is: <strong>${code}</strong></p>`,
        text: `You requested a password reset. Your reset code is: ${code}`,
        from: 'Mehman <[EMAIL_ADDRESS]>'
    });
};

export default sendResetEmail;
