import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import API_CONFIG from "../../config/api/api";
import LoadingBar from "react-top-loading-bar";
import { showSuccessToast } from "../../components/toast/toast";

function OTP({
  separator,
  length,
  value,
  onChange,
  onSendOTP,
}) {
  const inputRefs = React.useRef(
    new Array(length).fill(null)
  );

  const focusInput = (targetIndex) =>
    inputRefs.current[targetIndex].focus();
  const selectInput = (targetIndex) =>
    inputRefs.current[targetIndex].select();

  const handleKeyDown = (event, currentIndex) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        if (currentIndex > 0)
          focusInput(currentIndex - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        if (currentIndex < length - 1)
          focusInput(currentIndex + 1);
        break;
      case "Delete":
      case "Backspace":
        event.preventDefault();
        onChange(
          (prevOtp) =>
            prevOtp.slice(0, currentIndex) +
            prevOtp.slice(currentIndex + 1)
        );
        if (
          event.key === "Backspace" &&
          currentIndex > 0
        )
          focusInput(currentIndex - 1);
        break;
      default:
        break;
    }
  };

  const handleChange = (event, currentIndex) => {
    const currentValue = event.target.value;
    onChange((prev) => {
      const otpArray = prev.split("");
      otpArray[currentIndex] =
        currentValue.slice(-1);
      return otpArray.join("");
    });
    if (currentValue && currentIndex < length - 1)
      focusInput(currentIndex + 1);
  };

  const handlePaste = (event, currentIndex) => {
    event.preventDefault();
    const pastedText = event.clipboardData
      .getData("text/plain")
      .substring(0, length);
    onChange((prev) => {
      const otpArray = prev.split("");
      for (
        let i = currentIndex;
        i < length;
        i++
      ) {
        otpArray[i] =
          pastedText[i - currentIndex] ?? " ";
      }
      return otpArray.join("");
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
      }}>
      {new Array(length)
        .fill(null)
        .map((_, index) => (
          <React.Fragment key={index}>
            <InputElement
              aria-label={`Digit ${
                index + 1
              } of OTP`}
              ref={(ele) =>
                (inputRefs.current[index] = ele)
              }
              onKeyDown={(event) =>
                handleKeyDown(event, index)
              }
              onChange={(event) =>
                handleChange(event, index)
              }
              onClick={() => selectInput(index)}
              onPaste={(event) =>
                handlePaste(event, index)
              }
              value={value[index] ?? ""}
            />
            {index !== length - 1 && separator}
          </React.Fragment>
        ))}
    </Box>
  );
}

OTP.propTypes = {
  length: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  separator: PropTypes.node,
  value: PropTypes.string.isRequired,
  onSendOTP: PropTypes.func.isRequired,
};

export default function OTPInput() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { apiKey } = API_CONFIG;

  const checkOtp = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const res = await axios.post(
        `${apiKey}/verify-reset-code`,
        { code: otp }
      );
      setProgress(100);
      if (res.status === 200) {
        showSuccessToast(
          "OTP verified successfully!"
        );
        setTimeout(() => {
          setProgress(100);
          navigate("/forgot-password", {
            state: { fromSentEmail: true },
          });
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Invalid OTP!",
        });
      }
    } catch (err) {
      setProgress(100);
      setError(
        "Something went wrong. Please try again later."
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
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
        <div className="logo-container inputColor">
          Verify OTP
        </div>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            checkOtp();
          }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#00203F"
            }}>
            <OTP
              separator={<span>-</span>}
              value={otp}
              onChange={setOtp}
              length={6}
              onSendOTP={checkOtp}
            />
          </div>

          <button
            className="form-submit-btn"
            type="submit"
            disabled={loading}>
            {loading
              ? "Verifying OTP..."
              : "Verify OTP"}
          </button>
        </form>
        {error && (
          <p className="error-message">{error}</p>
        )}
      </div>
    </div>
  );
}

const blue = {
  100: "#DAECFF",
  200: "#80BFFF",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  700: "#0059B2",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const InputElement = styled("input")(
  ({ theme }) => `
  width: 40px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  padding: 8px 0px;
  border-radius: 8px;
  text-align: center;
  color: ${
    theme.palette.mode === "dark"
      ? grey[300]
      : grey[900]
  };
  background: ${
    theme.palette.mode === "dark"
      ? grey[900]
      : "#fff"
  };
  border: 1px solid ${
    theme.palette.mode === "dark"
      ? grey[700]
      : grey[200]
  };
  box-shadow: 0px 2px 4px ${
    theme.palette.mode === "dark"
      ? "rgba(0,0,0, 0.5)"
      : "rgba(0,0,0, 0.05)"
  };

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${
      theme.palette.mode === "dark"
        ? blue[600]
        : blue[200]
    };
  }

  &:focus-visible {
    outline: 0;
  }
`
);
