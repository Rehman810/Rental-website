import React, { useState } from "react";
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

const LoginModal = ({ open, onClose, signUp, isSignUp }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

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
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        Swal.fire({
          icon: "success",
          title: signUp ? "Account Created" : "Login Successful",
          text: `Welcome ${res.user.userName}!`,
        });

        onClose();
      }
    } catch (error) {
      onClose();
      Swal.fire({
        icon: "error",
        title: signUp ? "Signup Failed" : "Login Failed",
        text: "Invalid credentials. Please try again.",
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
          bgcolor: "background.paper",
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
            borderBottom: "1px solid #eee",
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
            Welcome to ThePakbnb
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                  color: "#1976d2",
                  cursor: "pointer",
                }}
                onClick={() => isSignUp(!signUp)}
              >
                {signUp ? "Log in" : "Sign up"}
              </Box>
            </Typography>

            <Divider sx={{ my: 1.2 }}>or</Divider>

            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <SocialButton icon={<FaGoogle />} text="Continue with Google" />
              </Grid>
              <Grid item xs={12}>
                <SocialButton
                  icon={<FaFacebookF color="#1877f2" />}
                  text="Continue with Facebook"
                />
              </Grid>
            </Grid>

            <Typography
              variant="caption"
              color="text.secondary"
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
        borderColor: "#e6e6e6",
        color: "#111",
        textTransform: "none",
        fontWeight: 800,
        py: 1.1,
        "&:hover": {
          borderColor: "#cfcfcf",
          backgroundColor: "#fafafa",
        },
      }}
    >
      {text}
    </Button>
  );
};

export default LoginModal;
