import apiClient from '../config/ServiceApi/apiClient';
import { API_BASE_URL } from '../config/env';

export const hostListingApi = {
    getAll: async (page = 1, limit = 10) => {
        const response = await apiClient.get(`${API_BASE_URL}/api/host/listings?page=${page}&limit=${limit}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await apiClient.get(`${API_BASE_URL}/api/host/listings/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await apiClient.put(`${API_BASE_URL}/api/host/listings/${id}`, data);
        return response.data;
    },
};
