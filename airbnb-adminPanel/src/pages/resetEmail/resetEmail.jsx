import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../assets/styles/mainScreen.css";
import { postData } from "../../config/apiServices/apiServices";
import LoadingBar from "react-top-loading-bar";

const ResetEmail = () => {
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
        "forgot-password",
        data
      );
      setTimeout(() => {
        setProgress(100);
        navigate("/otp");
      }, 2000);
    } catch (error) {
      setError(error.message);
      Swal.fire({
        icon: "error",
        title: "Failed to send email",
        text: error.message,
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
          Reset Email
        </div>

        <form
          className="form"
          onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email"className="inputColor">Email</label>
            <input
              type="email"
              id="email"
              className="inputColor"
              {...register("email", {
                required: "Email is required",
              })}
              placeholder="Enter your Email"
            />
            {errors.email && (
              <p className="error-message">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            className="form-submit-btn"
            type="submit"
            disabled={loading}>
            {loading
              ? "Sending Email..."
              : "Send"}
          </button>
        </form>
        {error && (
          <p className="error-message">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ResetEmail;
