
import Cookies from 'js-cookie';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'userInfo';

// Configure cookie options
const getCookieOptions = () => ({
    expires: 7, // 7 days expiration
    path: '/',
    secure: window.location.protocol === 'https:',
    sameSite: 'Lax',
});

// Set authentication cookies
export const setAuthCookies = (token, user) => {
    if (token) {
        Cookies.set(TOKEN_KEY, token, getCookieOptions());
    }
    if (user) {
        const minimalUser = {
            _id: user._id,
            userName: user.userName || user.name,
            email: user.email,
            role: user.role,
            isCNICUploaded:
                Array.isArray(user?.CNIC?.images) &&
                user.CNIC.images.length > 0, phoneNumber: user.phoneNumber || null,
            isPhoneVerified: Boolean(user.phoneNumber),

            isCNICVerified: Boolean(user?.CNIC?.isVerified),
            isEmailVerified: Boolean(user?.isEmailVerified),

            photoProfile: user.photoProfile || null,
        };

        Cookies.set(USER_KEY, JSON.stringify(minimalUser), getCookieOptions());
    }
};

// Get authentication token
export const getAuthToken = () => {
    return Cookies.get(TOKEN_KEY);
};

// Get authenticated user info
export const getAuthUser = () => {
    const userStr = Cookies.get(USER_KEY);
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        return null;
    }
};

// Clear authentication cookies
export const clearAuthCookies = () => {
    Cookies.remove(TOKEN_KEY, { path: '/' });
    Cookies.remove(USER_KEY, { path: '/' });
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getAuthToken();
};
