
import masterTemplate from '../masterTemplate.js';
import { EMAIL_TYPES } from '../../emailTypes.js';
import { FRONTEND_BASE_URL, CURRENCY } from '../../../appConfig.js';

const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
});

export const getBookingEmailContent = (type, payload) => {
    const {
        userName,
        listingTitle,
        startDate,
        endDate,
        totalPrice,
        guestCapacity,
        bookingId,
        rejectionReason,
        actionUrl,
        fullAddress,
        hostPhone,
        wifiPassword,
        checkInInstructions
    } = payload;

    const commonDetails = [
        { label: 'Listing', value: listingTitle },
        { label: 'Check-in', value: formatDate(startDate) },
        { label: 'Check-out', value: formatDate(endDate) },
        { label: 'Guests', value: guestCapacity },
        { label: 'Total Price', value: `${CURRENCY} ${totalPrice}` },
        { label: 'Booking ID', value: bookingId },
    ];

    switch (type) {
        case EMAIL_TYPES.BOOKING_PENDING_HOST:
            return masterTemplate({
                title: 'New Booking Request',
                greeting: `Hello ${userName},`,
                message: 'You have received a new booking request! Please review and respond within 24 hours to secure this booking.',
                details: commonDetails,
                action: { label: 'Review Request', url: actionUrl || `${FRONTEND_BASE_URL}/host/dashboard` },
            });

        case EMAIL_TYPES.BOOKING_PENDING_GUEST:
            return masterTemplate({
                title: 'Booking Request Sent',
                greeting: `Hi ${userName},`,
                message: 'Your booking request has been sent to the host. We will notify you once they accept or reject your request.',
                details: commonDetails,
                action: { label: 'View Booking', url: actionUrl || `${FRONTEND_BASE_URL}/trips` },
            });

        case EMAIL_TYPES.BOOKING_CONFIRMED_HOST:
            return masterTemplate({
                title: 'Booking Confirmed!',
                greeting: `Great news ${userName},`,
                message: 'You have approved the booking. The guest has been notified and payment is clear.',
                details: commonDetails,
                action: { label: 'View Details', url: actionUrl || `${FRONTEND_BASE_URL}/host/dashboard` },
            });

        case EMAIL_TYPES.BOOKING_CONFIRMED_GUEST:
            return masterTemplate({
                title: 'Booking Confirmed!',
                greeting: `Hooray ${userName}!`,
                message: 'Your booking request has been accepted by the host. Get ready for your trip!',
                details: commonDetails,
                action: { label: 'View Trip', url: actionUrl || `${FRONTEND_BASE_URL}/trips` },
            });

        case EMAIL_TYPES.BOOKING_REJECTED_GUEST:
            return masterTemplate({
                title: 'Booking Request Declined',
                greeting: `Hi ${userName},`,
                message: 'Unfortunately, the host has declined your booking request.',
                details: [
                    ...commonDetails,
                    ...(rejectionReason ? [{ label: 'Reason', value: rejectionReason }] : [])
                ],
                action: { label: 'Find Other Stays', url: `${FRONTEND_BASE_URL}` },
            });

        case EMAIL_TYPES.BOOKING_EXPIRED_GUEST:
            return masterTemplate({
                title: 'Booking Request Expired',
                greeting: `Hi ${userName},`,
                message: 'Your booking request was not accepted by the host within 24 hours and has officially expired. You have not been charged.',
                details: commonDetails,
                action: { label: 'Search Again', url: `${FRONTEND_BASE_URL}` },
            });

        case EMAIL_TYPES.BOOKING_REMINDER_HOST:
            return masterTemplate({
                title: 'Upcoming Check-in Reminder',
                greeting: `Hello ${userName},`,
                message: 'This is a reminder that you have a guest checking in tomorrow.',
                details: commonDetails,
                action: { label: 'View Booking', url: actionUrl || `${FRONTEND_BASE_URL}/host/dashboard` },
            });

        case EMAIL_TYPES.BOOKING_REMINDER_GUEST:
            return masterTemplate({
                title: 'Trip Reminder: Check-in Tomorrow!',
                greeting: `Ready for your trip, ${userName}?`,
                message: 'Your stay begins tomorrow! Your full stay details are below.',
                details: [
                    ...commonDetails,
                    { label: 'Address', value: fullAddress || 'See details in app' },
                    { label: 'Host Phone', value: hostPhone || 'N/A' },
                    { label: 'WiFi Password', value: wifiPassword || 'Provided at check-in' },
                    ...(checkInInstructions ? [{ label: 'Instructions', value: checkInInstructions }] : [])
                ],
                action: { label: 'View Trip Info', url: actionUrl || `${FRONTEND_BASE_URL}/trips` },
            });

        default:
            throw new Error(`Unknown booking email type: ${type}`);
    }
};
