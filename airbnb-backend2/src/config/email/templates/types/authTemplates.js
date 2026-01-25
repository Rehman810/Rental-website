
import masterTemplate from '../masterTemplate.js';
import { EMAIL_TYPES } from '../../emailTypes.js';

export const getAuthEmailContent = (type, payload) => {
    const { userName, email, otpCode, actionUrl } = payload;

    switch (type) {
        case EMAIL_TYPES.AUTH_WELCOME:
            return masterTemplate({
                title: 'Welcome to Airbnb!',
                greeting: `Welcome, ${userName}!`,
                message: 'We are thrilled to have you join our community. Your account has been successfully created.',
                details: [
                    { label: 'Username', value: userName },
                    { label: 'Email', value: email },
                ],
                action: { label: 'Explore Homes', url: 'http://localhost:3000/' }, // Update with env var in real app
            });

        case EMAIL_TYPES.AUTH_GOOGLE_WELCOME:
            return masterTemplate({
                title: 'Welcome to Airbnb!',
                greeting: `Hi ${userName},`,
                message: 'You have successfully signed up using your Google account. We are excited to have you on board!',
                details: [
                    { label: 'Account', value: email },
                ],
                action: { label: 'Go to Dashboard', url: 'http://localhost:3000/dashboard' },
            });

        case EMAIL_TYPES.AUTH_EMAIL_VERIFY_OTP:
            return masterTemplate({
                title: 'Verify Your Email',
                greeting: `Hello ${userName},`,
                message: 'Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes.',
                details: [
                    { label: 'Verification Code', value: otpCode },
                ],
                footerText: 'If you did not request this code, please ignore this email.',
            });

        case EMAIL_TYPES.AUTH_PASSWORD_RESET:
            return masterTemplate({
                title: 'Reset Your Password',
                greeting: `Hello ${userName},`,
                message: 'We received a request to reset your password. Use the OTP below to proceed.',
                details: [
                    { label: 'Reset Code', value: otpCode },
                ],
                footerText: 'If you did not request a password reset, please secure your account immediately.',
            });

        default:
            throw new Error(`Unknown auth email type: ${type}`);
    }
};
