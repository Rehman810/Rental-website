import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import Swal from "sweetalert2";
import "../../assets/styles/mainScreen.css";
import { postData } from "../../config/apiServices/apiServices";
import LoadingBar from "react-top-loading-bar";
import toast from "react-hot-toast";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setProgress(50);
    try {
      const response = await postData(
        "auth",
        data
      );
      localStorage.setItem(
        "token",
        response.token
      );
      setProgress(100);
      console.log(response);

      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error) {
      setError(error.message);
      toast.error("Login Failed", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <div className="mainForm">
      <LoadingBar
        color="#4599B4"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className="form-container">
        <div className="logo-container inputColor" style={{ fontSize: "20px" }}>
          Admin Login
        </div>

        <form
          className="form"
          onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email" className="inputColor">
              Username
            </label>
            <input className="inputColor"
              type="text"
              id="userName"
              {...register("userName", {
                required: "Username is required",
              })}
              placeholder="Enter your Username"
            />
            {errors.email && (
              <p className="error-message">
                {errors.email.message}
              </p>
            )}

            <label htmlFor="password" className="inputColor">
              Password
            </label>
            <input className="inputColor"
              type="password"
              id="password"
              {...register("password", {
                required: "Password is required",
              })}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="error-message">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            className="form-submit-btn"
            type="submit"
            disabled={loading}>
            {loading ? "Logging In..." : "LogIn"}
          </button>
        </form>

        {error && (
          <p className="error-message">{error}</p>
        )}

        <p className="signup-link">
          <Link
            to="/reset-email"
            className="signup-link link">
            Forgot Password
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
