
import { sendEmail } from './transporter.js';
import { EMAIL_TYPES } from './emailTypes.js';
import { getAuthEmailContent } from './templates/types/authTemplates.js';
import { getBookingEmailContent } from './templates/types/bookingTemplates.js';
import { getAdminEmailContent } from './templates/types/adminTemplates.js';

export const sendAppEmail = async ({ to, type, payload }) => {
    if (!to || !type) {
        console.error('sendAppEmail missing "to" or "type"');
        return false;
    }

    let htmlContent = '';
    // Determine which template generator to use
    try {
        if (type.startsWith('AUTH_')) {
            htmlContent = getAuthEmailContent(type, payload);
        } else if (type.startsWith('BOOKING_')) {
            htmlContent = getBookingEmailContent(type, payload);
        } else if (type.startsWith('ADMIN_')) {
            htmlContent = getAdminEmailContent(type, payload);
        } else {
            console.warn('Unknown email type category:', type);
            return false;
        }

        // Extract subject/title roughly from the HTML if possible, or mapping
        // Ideally the template builder could return subject too, but we can infer or pass it.
        // For now, let's extract the <title> tag or use a simple switch map for Subjects if needed.
        // But simplistic way: regex the title tag.
        const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
        const subject = titleMatch ? titleMatch[1] : 'Notification from Airbnb';

        return await sendEmail({
            to,
            subject,
            html: htmlContent
        });

    } catch (error) {
        console.error(`Error generating email content for type ${type}:`, error);
        return false;
    }
};

export { EMAIL_TYPES };
