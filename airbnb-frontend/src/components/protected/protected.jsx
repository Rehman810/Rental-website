import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../../config/Api/Api";
import Loader from "../loader/loader";
import LoginModal from "../Login/LoginModal";
import { getAuthToken, clearAuthCookies } from "../../utils/cookieUtils";
import apiClient from "../../config/ServiceApi/apiClient";

const Protected = ({ Component, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [signUp, setSignUp] = useState(true);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      clearAuthCookies();
    }

    const verifyTokenWithBackend = async () => {
      try {
        const { apiKey } = API_CONFIG;
        const response = await apiClient.post(
          `${apiKey}/verify-token`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsAuthenticated(true);
      } catch (error) {
        setIsLoginModalOpen(true);
        clearAuthCookies();
      }
    };

    verifyTokenWithBackend();
  }, [navigate, location, allowedRoles]);

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
    navigate("/");
  };

  return (
    <>
      {isAuthenticated ? (
        <Component />
      ) : (
        <>
          <Loader open={true} />
          <LoginModal
            open={isLoginModalOpen}
            onClose={handleLoginModalClose}
            signUp={signUp}
            isSignUp={setSignUp}
          />
        </>
      )}
    </>
  );
};

export default Protected;
