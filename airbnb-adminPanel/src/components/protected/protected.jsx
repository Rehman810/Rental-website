import React, {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../../config/api/api";
import Loader from "../loader/loader";
import { showErrorToast } from "../toast/toast";

const Protected = ({
  Component,
  allowedRoles,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const verifyTokenWithBackend = async () => {
      try {
        const { apiKey } = API_CONFIG;
        const response = await axios.get(
          `${apiKey}/verify-token`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
// console.log(response);

        if (response.data.code !== 200) {
          handleUnauthorized();
        } else {
          handleAuthorized(response.data.isValid);
        }
      } catch (error) {
        console.error(
          "Token verification failed",
          error
        );
        handleUnauthorized();
      }
    };

    const handleUnauthorized = () => {
      localStorage.removeItem("token");
      navigate("/login");
    };

    const handleAuthorized = (role) => {
      if (role !== true) {
        navigate("/login");
        return;
      }
      setIsAuthenticated(true);
    };

    verifyTokenWithBackend();
  }, [navigate, location, allowedRoles]);

  return isAuthenticated ? (
    <Component />
  ) : (
    <Loader />
  );
};

export default Protected;
