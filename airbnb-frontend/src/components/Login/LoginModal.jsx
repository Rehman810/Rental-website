import React, { useState } from "react";
import { APP_NAME } from "../../config/env";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { loginUser } from "../../config/ServiceApi/serviceApi";
import toast from "react-hot-toast";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../../config/ServiceApi/serviceApi';
import { useWishlist } from "../../context/wishlistProvider";
import { setAuthCookies } from "../../utils/cookieUtils";

// Custom Google Icon SVG
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

const LoginModal = ({ open, onClose, signUp, isSignUp }) => {
  const { mergeLocalToBackend } = useWishlist();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const res = await googleLogin(credential);

      if (res) {
        setAuthCookies(res.token, res.user);

        await mergeLocalToBackend();

        toast.success("Welcome back 👋", {
          duration: 2000,
        });

        onClose();
      }
    } catch (error) {
      onClose();
      toast.error("Google Login Failed", {
        duration: 2000,
      });
      console.error("Google Login Error:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await (signUp
        ? loginUser("signUp", {
          userName: data.userName,
          email: data.email,
          password: data.password,
        })
        : loginUser("login", { email: data.email, password: data.password }));

      if (res) {
        setAuthCookies(res.token, res.user);

        await mergeLocalToBackend();

        toast.success("Welcome back 👋", {
          duration: 2000,
        });

        onClose();
      }
    } catch (error) {
      // onClose(); // Don't close on error so they can retry
      toast.error(error.message, {
        duration: 2000,
      });

      console.error("Login Error:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "92%", sm: 420 },
          bgcolor: "var(--bg-card)",
          borderRadius: "18px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1" fontWeight={900}>
            {signUp ? "Sign up" : "Log in"}
          </Typography>

          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ px: 2.5, py: 2.5 }}>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 0.5 }}>
            Welcome to {APP_NAME}
          </Typography>
          <Typography variant="body2" color="var(--text-secondary)" sx={{ mb: 2 }}>
            {signUp
              ? "Create your account in a few seconds."
              : "Log in to continue booking and hosting."}
          </Typography>

          <Stack spacing={1.6}>
            {signUp && (
              <TextField
                fullWidth
                label="Full Name"
                placeholder="e.g. Abdul Rehman"
                {...register("userName", { required: "Name is required" })}
                error={!!errors.userName}
                helperText={errors.userName?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                  },
                }}
              />
            )}

            <TextField
              fullWidth
              label="Email"
              placeholder="example@email.com"
              {...register("email", { required: "Email is required" })}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              placeholder="Enter password"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? (
                        <VisibilityIcon fontSize="small" />
                      ) : (
                        <VisibilityOffIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 0.5,
                borderRadius: "12px",
                py: 1.5,
                fontWeight: 800,
                fontSize: "1rem",
                textTransform: "none",
                background: "linear-gradient(90deg, #ff385c, #d70466)",
                boxShadow: "0 8px 20px rgba(215, 4, 102, 0.2)",
                "&:hover": {
                  background: "linear-gradient(90deg, #ff385c, #c8045f)",
                  boxShadow: "0 10px 25px rgba(215, 4, 102, 0.3)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {isSubmitting ? "Please wait..." : "Continue"}
            </Button>

            <Typography variant="body2" sx={{ textAlign: "center" }}>
              {signUp ? "Already have an account?" : "Don’t have an account?"}{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                  color: "var(--primary)",
                  cursor: "pointer",
                }}
                onClick={() => isSignUp(!signUp)}
              >
                {signUp ? "Log in" : "Sign up"}
              </Box>
            </Typography>

            <Divider sx={{ my: 1.5 }}>
              <Typography variant="caption" sx={{ color: "var(--text-tertiary)", fontWeight: 700, letterSpacing: '1px' }}>
                OR
              </Typography>
            </Divider>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                useFedCM={true}
              >
                <Box sx={{ 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'var(--border-medium)',
                    backgroundColor: 'rgba(0,0,0,0.02)'
                  }
                }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      toast.error("Google Login Failed");
                    }}
                    shape="rectangular"
                    width="380px"
                    text="continue_with"
                    theme="outline"
                    useOneTap={false}
                    auto_select={false}
                  />
                </Box>
              </GoogleOAuthProvider>
            </Box>

            <Typography
              variant="caption"
              color="var(--text-secondary)"
              sx={{ textAlign: "center", display: "block", mt: 1, opacity: 0.8 }}
            >
              By continuing, you agree to our Terms & Privacy Policy.
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

const SocialButton = ({ icon, text, onClick }) => {
  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={icon}
      onClick={onClick}
      sx={{
        borderRadius: "12px",
        borderColor: "var(--border-light)",
        color: "var(--text-primary)",
        textTransform: "none",
        fontWeight: 600,
        py: 1.4,
        fontSize: "0.95rem",
        display: "flex",
        justifyContent: "center",
        position: "relative",
        transition: "all 0.2s ease",
        backgroundColor: "var(--bg-card)",
        "& .MuiButton-startIcon": {
          position: "absolute",
          left: "20px",
        },
        "&:active": {
          transform: "translateY(0)",
        }
      }}
    >
      {text}
    </Button>
  );
};

export default LoginModal;
