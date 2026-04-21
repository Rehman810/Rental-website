const env = {
    APP_NAME: import.meta.env.VITE_APP_NAME || "Mehman",
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    FRONTEND_BASE_URL: import.meta.env.VITE_FRONTEND_BASE_URL || "http://localhost:5174",
    CURRENCY: import.meta.env.VITE_CURRENCY || "PKR",
};

export const { APP_NAME, API_BASE_URL, FRONTEND_BASE_URL, CURRENCY } = env;

export default env;
