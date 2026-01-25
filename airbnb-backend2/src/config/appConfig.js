import dotenv from 'dotenv';
dotenv.config();

export const APP_NAME = process.env.APP_NAME || 'ThePakbnb';
export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:5000';
export const CURRENCY = process.env.CURRENCY || 'PKR';

const appConfig = {
    APP_NAME,
    FRONTEND_BASE_URL,
    BACKEND_BASE_URL,
    CURRENCY
};

export default appConfig;
