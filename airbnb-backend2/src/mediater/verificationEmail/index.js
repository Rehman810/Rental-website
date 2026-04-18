import { sendVerificationEmail as resendVerificationEmail } from "../../services/emailService.js";

export const sendVerificationCode = async (email, code) => {
    if (!email) throw new Error("Recipient email is required");
    return await resendVerificationEmail(email, code);
};
