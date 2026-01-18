import axios from "axios";
import API_CONFIG from "../../config/api/api";

const handleLogout = async () => {
  const { apiKey } = API_CONFIG;

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      `${apiKey}/logout`,
      {},
      config
    );

    console.log(
      "Logout successful:",
      response.data
    );

    localStorage.removeItem("token");

    window.location.reload();
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export default handleLogout;
