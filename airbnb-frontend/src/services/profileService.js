import apiClient from '../config/ServiceApi/apiClient';
import API_CONFIG from '../config/Api/Api';

const { apiKey } = API_CONFIG;

export const getHostProfile = async (hostId) => {
    try {
        const response = await apiClient.get(`${apiKey}/api/profiles/host/${hostId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching host profile:', error);
        throw error;
    }
};

export const getGuestProfile = async (guestId) => {
    try {
        const response = await apiClient.get(`${apiKey}/api/profiles/guest/${guestId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching guest profile:', error);
        throw error;
    }
};
