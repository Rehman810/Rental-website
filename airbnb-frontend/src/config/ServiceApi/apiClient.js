import axios from "axios";
import API_CONFIG from "../Api/Api";
import { getAuthToken } from "../../utils/cookieUtils";

const apiClient = axios.create({
    baseURL: API_CONFIG.apiKey,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
