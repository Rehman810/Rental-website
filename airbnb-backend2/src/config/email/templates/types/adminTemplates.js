
import masterTemplate from '../masterTemplate.js';
import { EMAIL_TYPES } from '../../emailTypes.js';
import { FRONTEND_BASE_URL } from '../../../appConfig.js';

export const getAdminEmailContent = (type, payload) => {
    const { userName, listingTitle, rejectionReason } = payload;

    switch (type) {
        case EMAIL_TYPES.ADMIN_CNIC_VERIFIED:
            return masterTemplate({
                title: 'Identity Verified',
                greeting: `Hello ${userName},`,
                message: 'Your CNIC verification has been approved by our admin team! You are now a verified member of our community.',
                action: { label: 'Go to Profile', url: `${FRONTEND_BASE_URL}/account` },
            });

        case EMAIL_TYPES.ADMIN_EMAIL_VERIFIED:
            return masterTemplate({
                title: 'Email Verified',
                greeting: `Hi ${userName},`,
                message: 'Your email address has been manually verified by our administration team.',
                action: { label: 'Go to Home', url: `${FRONTEND_BASE_URL}` },
            });

        case EMAIL_TYPES.ADMIN_LISTING_VERIFIED:
            return masterTemplate({
                title: 'Listing Approved',
                greeting: `Congratulations ${userName},`,
                message: `Your listing "${listingTitle}" has been verified and approved by our team. It is now live for guests to book!`,
                action: { label: 'View Listing', url: `${FRONTEND_BASE_URL}/host/listings` },
            });

        case EMAIL_TYPES.ADMIN_LISTING_REJECTED:
            return masterTemplate({
                title: 'Listing Not Approved',
                greeting: `Hello ${userName},`,
                message: `Your listing "${listingTitle}" was reviewed but could not be approved at this time.`,
                details: [
                    { label: 'Reason', value: rejectionReason || 'Does not meet our community guidelines' }
                ],
                action: { label: 'Edit Listing', url: `${FRONTEND_BASE_URL}/host/listings` },
            });

        default:
            throw new Error(`Unknown admin email type: ${type}`);
    }
};
