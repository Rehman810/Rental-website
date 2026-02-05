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
import { GoogleOAuthProvider } from '@react-oauth/google';

import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../../config/ServiceApi/serviceApi';
import { useWishlist } from "../../context/wishlistProvider";
import { setAuthCookies } from "../../utils/cookieUtils";

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
        ? loginUser("signup", {
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
      toast.error("Login Failed", {
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
                borderRadius: "999px",
                py: 1.2,
                fontWeight: 900,
                textTransform: "none",
                background: "linear-gradient(90deg, #ff385c, #d70466)",
                boxShadow: "0 14px 30px rgba(215, 4, 102, 0.25)",
                "&:hover": {
                  background: "linear-gradient(90deg, #ff385c, #c8045f)",
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

            <Divider sx={{ my: 1.2 }}>or</Divider>

            <Grid container spacing={1.5}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleOAuthProvider
                  clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                  useFedCM={true}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      console.log('Login Failed');
                      toast.error("Google Login was unsuccessful", {
                        duration: 2000,
                      });
                    }}
                    shape="pill"
                    width="350px"
                    text="continue_with"
                    theme="filled_blue"
                    useOneTap={false}
                    auto_select={false}
                  /></GoogleOAuthProvider>
              </Grid>
            </Grid>

            <Typography
              variant="caption"
              color="var(--text-secondary)"
              sx={{ textAlign: "center", display: "block", mt: 1 }}
            >
              By continuing, you agree to our Terms & Privacy Policy.
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

const SocialButton = ({ icon, text }) => {
  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={icon}
      sx={{
        borderRadius: "999px",
        borderColor: "var(--border-light)",
        color: "var(--text-primary)",
        textTransform: "none",
        fontWeight: 800,
        py: 1.1,
        "&:hover": {
          borderColor: "var(--border-medium)",
          backgroundColor: "var(--bg-secondary)",
        },
      }}
    >
      {text}
    </Button>
  );
};

export default LoginModal;
