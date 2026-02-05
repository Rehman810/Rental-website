import axios from "axios";
import API_CONFIG from "../../config/Api/Api";
import { getAuthToken, clearAuthCookies } from "../../utils/cookieUtils";
import apiClient from "../../config/ServiceApi/apiClient";

const handleLogout = async (navigate) => {
  const { apiKey } = API_CONFIG;

  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No token found");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await apiClient.post(`${apiKey}/logout`, {}, config);

    window.location.reload();

    clearAuthCookies();
    navigate("/");
  } catch (error) {
    console.error("Logout error:", error.message || error);
    // Even if API logout fails, clear local cookies
    clearAuthCookies();
    navigate("/");
  }
};

export default handleLogout;
