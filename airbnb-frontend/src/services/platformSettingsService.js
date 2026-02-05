import axios from 'axios';
import API_CONFIG from '../config/Api/Api';
import { getAuthToken } from '../utils/cookieUtils';

const { apiKey } = API_CONFIG;

export const getPlatformSettings = async () => {
    const token = getAuthToken();
    if (!token) return null;

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await axios.get(`${apiKey}/platform-settings`, config);
        return response.data;
    } catch (error) {
        console.error('Error fetching platform settings:', error);
        // Don't throw, just return null or defaults to avoid crashing app on settings fetch fail
        return null;
    }
};

export const updatePlatformSettings = async (settings) => {
    const token = getAuthToken();
    if (!token) return null;

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await axios.put(`${apiKey}/platform-settings`, settings, config);
        return response.data;
    } catch (error) {
        console.error('Error updating platform settings:', error);
        throw error;
    }
};
