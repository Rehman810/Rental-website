const env = {
    APP_NAME: import.meta.env.VITE_APP_NAME || "ThePakbnb Admin",
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
};

export const { APP_NAME, API_BASE_URL } = env;

export default env;
