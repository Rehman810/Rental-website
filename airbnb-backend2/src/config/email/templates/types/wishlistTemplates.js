import { EMAIL_TYPES } from '../../emailTypes.js';

export const getWishlistEmailContent = (type, payload) => {
    const { userName, trip, trips, data } = payload;
    const appName = process.env.APP_NAME || 'Mehman';
    const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

    const baseHeader = `
        <div style="background:#ff385c; padding:22px 26px;">
            <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:700;">${appName}</h1>
        </div>
    `;

    const baseFooter = `
        <div style="background:#f9fafb; padding:16px 26px; text-align:center; border-top:1px solid #eef2f7;">
            <p style="margin:0; color:#9ca3af; font-size:12px;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        </div>
    `;

    switch (type) {
        case EMAIL_TYPES.WISHLIST_REMINDER:
            return `
                <html>
                <head><title>Reminder: Your trip to ${trip.title}</title></head>
                <body style="font-family: Arial, sans-serif; margin:0; padding:0; background:#f6f7fb;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" style="background:#ffffff; border-radius:14px; overflow:hidden;">
                                    <tr><td>${baseHeader}</td></tr>
                                    <tr>
                                        <td style="padding:28px 26px;">
                                            <h2 style="margin:0 0 10px; color:#111827;">Hi ${userName}!</h2>
                                            <p style="color:#4b5563; font-size:14px; line-height:1.7;">
                                                You added <b>${trip.title}</b> to your wishlist recently. It's still available for booking!
                                            </p>
                                            <div style="border: 1px solid #eee; border-radius: 12px; padding: 15px; margin: 20px 0;">
                                                <img src="${trip.photos?.[0]}" style="width: 100%; border-radius: 8px;" />
                                                <h3 style="margin:15px 0 5px;">${trip.title}</h3>
                                                <p style="color:#ff385c; font-weight:bold;">$${trip.weekdayPrice} per night</p>
                                            </div>
                                            <div style="text-align:center; margin-top:25px;">
                                                <a href="${frontendUrl}/listing/${trip._id}" style="background: #ff385c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight:bold; display: inline-block;">Book Now</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr><td>${baseFooter}</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `;

        case EMAIL_TYPES.WISHLIST_DIGEST:
            const tripItems = trips.map(t => `
                <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                    <img src="${t.photos?.[0]}" style="width: 100px; height: 75px; object-fit: cover; border-radius: 8px; float: left; margin-right: 15px;" />
                    <div>
                        <h4 style="margin: 0; color:#111827;">${t.title}</h4>
                        <p style="color: #ff385c; font-size: 14px; font-weight:bold; margin:5px 0;">Now $${t.weekdayPrice}/night</p>
                        <a href="${frontendUrl}/listing/${t._id}" style="color: #ff385c; font-size: 13px; text-decoration:none;">View Details →</a>
                    </div>
                    <div style="clear: both;"></div>
                </div>
            `).join('');

            return `
                <html>
                <head><title>Your Weekly Wishlist Digest</title></head>
                <body style="font-family: Arial, sans-serif; margin:0; padding:0; background:#f6f7fb;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" style="background:#ffffff; border-radius:14px; overflow:hidden;">
                                    <tr><td>${baseHeader}</td></tr>
                                    <tr>
                                        <td style="padding:28px 26px;">
                                            <h2 style="margin:0 0 10px; color:#111827;">Your Weekly Digest</h2>
                                            <p style="color:#4b5563; font-size:14px; line-height:1.7;">
                                                Here are the top picks from your wishlist this week:
                                            </p>
                                            <div style="margin: 25px 0;">
                                                ${tripItems}
                                            </div>
                                            ${data.showViewAll ? `
                                                <div style="text-align:center; margin-top:20px;">
                                                    <a href="${frontendUrl}/wishlist" style="color: #ff385c; font-weight: bold; text-decoration:none;">View All ${data.totalCount} items →</a>
                                                </div>
                                            ` : ''}
                                        </td>
                                    </tr>
                                    <tr><td>${baseFooter}</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `;

        case EMAIL_TYPES.WISHLIST_PRICE_DROP:
            return `
                <html>
                <head><title>Price Drop Alert!</title></head>
                <body style="font-family: Arial, sans-serif; margin:0; padding:0; background:#f6f7fb;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" style="background:#ffffff; border-radius:14px; overflow:hidden; border: 2px solid #ff385c;">
                                    <tr><td>${baseHeader}</td></tr>
                                    <tr>
                                        <td style="padding:28px 26px;">
                                            <h2 style="margin:0 0 10px; color:#ff385c;">Great news, ${userName}!</h2>
                                            <p style="color:#4b5563; font-size:14px; line-height:1.7;">
                                                The price for <b>${trip.title}</b> just dropped.
                                            </p>
                                            <div style="background:#fff5f6; border-radius:12px; padding:20px; text-align:center; margin:20px 0;">
                                                <p style="margin:0; font-size:16px; color:#9ca3af; text-decoration:line-through;">Was $${data.oldPrice}</p>
                                                <p style="margin:5px 0 0; font-size:28px; color:#ff385c; font-weight:bold;">Now $${data.newPrice}</p>
                                            </div>
                                            <img src="${trip.photos?.[0]}" style="width: 100%; border-radius: 8px; margin-bottom:20px;" />
                                            <div style="text-align:center;">
                                                <a href="${frontendUrl}/listing/${trip._id}" style="background: #ff385c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight:bold; display: inline-block;">Grab this deal</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr><td>${baseFooter}</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `;

        case EMAIL_TYPES.WISHLIST_AVAILABILITY_LOW:
            return `
                <html>
                <head><title>Urgent: Limited Availability for ${trip.title}</title></head>
                <body style="font-family: Arial, sans-serif; margin:0; padding:0; background:#f6f7fb;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" style="background:#ffffff; border-radius:14px; overflow:hidden; border: 2px solid #ff385c;">
                                    <tr><td>${baseHeader}</td></tr>
                                    <tr>
                                        <td style="padding:28px 26px;">
                                            <h2 style="margin:0 0 10px; color:#111827;">Don't Miss Out!</h2>
                                            <p style="color:#4b5563; font-size:14px; line-height:1.7;">
                                                Hi ${userName}, we noticed <b>${trip.title}</b> is booking up fast.
                                            </p>
                                            <div style="background:#fff5f6; border: 1px dashed #ff385c; border-radius:12px; padding:15px; text-align:center; margin:20px 0;">
                                                <p style="margin:0; font-size:18px; color:#ff385c; font-weight:bold;">
                                                    Only ${data.daysLeft} available days left in the next 30 days!
                                                </p>
                                            </div>
                                            <img src="${trip.photos?.[0]}" style="width: 100%; border-radius: 8px; margin-bottom:20px;" />
                                            <div style="text-align:center;">
                                                <a href="${frontendUrl}/listing/${trip._id}" style="background: #ff385c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight:bold; display: inline-block;">Check Availability</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr><td>${baseFooter}</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `;

        default:
            return '';
    }
};
