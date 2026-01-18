import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Swal from "sweetalert2";
import "../../assets/styles/mainScreen.css";
import { updateData } from "../../config/apiServices/apiServices";
import LoadingBar from "react-top-loading-bar";
import { showSuccessToast } from "../../components/toast/toast";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const password = watch("password");
  const confirmPassword = watch(
    "confirmPassword"
  );

  const location = useLocation();

  if (
    !location.state ||
    !location.state.fromSentEmail
  ) {
    return <Navigate to="/" />;
  }

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setProgress(50);

    console.log(data.password);

    try {
      const res = await updateData(
        "reset-password",
        {
          password: data.password,
        }
      );
      showSuccessToast(
        "Password updated successfully"
      );
      navigate("/login");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
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
        <div className="logo-container inputColor" style={{fontSize: "20px"}}>
          Change Password
        </div>

        <form
          className="form"
          onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="password" className="inputColor">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="inputColor"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 5,
                  message:
                    "Password must be at least 5 characters",
                },
              })}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="error-message">
                {errors.password.message}
              </p>
            )}

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword", {
                required:
                  "Please confirm your password",
                validate: {
                  matchesPreviousPassword: (
                    value
                  ) => {
                    const match =
                      value === password;
                    return (
                      match ||
                      "Passwords do not match!"
                    );
                  },
                },
              })}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="error-message">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            className="form-submit-btn"
            type="submit"
            disabled={loading}>
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>
        </form>

        {error && (
          <p className="error-message">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
