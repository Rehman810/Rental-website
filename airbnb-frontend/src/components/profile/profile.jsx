import React, { useMemo, useState } from "react";
import { setAuthCookies, getAuthToken, getAuthUser } from "../../utils/cookieUtils";
import {
  Grid,
  Typography,
  Avatar,
  Box,
  Button,
  Paper,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  TextField,
  Stack,
  Chip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";

import { updateDataById } from "../../config/ServiceApi/serviceApi";
import toast from "react-hot-toast";

const ProfileSection = () => {
  const initialUser = getAuthUser();
  const [user, setUser] = useState(initialUser);

  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [openEmailVerify, setOpenEmailVerify] = useState(false);

  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const token = getAuthToken();

  const isCnicUploaded = useMemo(() => {
    return initialUser?.isCNICUploaded || false;
  }, [initialUser]);

  const isVerifiedCnic = useMemo(() => {
    return initialUser?.isCNICVerified || false;
  }, [initialUser]);

  const handleSaveProfile = async () => {
    setIsEditing(false);

    const changes = { ...editedFields };
    if (Object.keys(changes).length === 0) return;

    try {
      const res = await updateDataById("update-profile", token, user._id, changes);

      if (res?.updatedHost) {
        const updatedUser = { ...user, ...res.updatedHost };
        setAuthCookies(token, updatedUser);
        setUser(updatedUser);
        setEditedFields({});
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error saving profile changes:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleImageUpload = (file, type) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      if (type === "profile") {
        const newPhoto = reader.result;

        // update local
        const updatedUser = { ...user, photoProfile: newPhoto };
        setUser(updatedUser);
        setAuthCookies(token, updatedUser);

        // upload server
        const formData = new FormData();
        formData.append("profileImage", file);

        try {
          await updateDataById("update-profile", token, user._id, formData);
          toast.success("Profile photo updated!");
        } catch (error) {
          console.error("Error updating profile photo:", error);
          toast.error("Failed to update profile photo");
        }
      }

      if (type === "cnicFront") {
        setCnicFront(reader.result);
        setFrontImage(file);
      }

      if (type === "cnicBack") {
        setCnicBack(reader.result);
        setBackImage(file);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleCnicUpload = async () => {
    if (!frontImage || !backImage) {
      toast.error("Please upload both CNIC front and back images.");
      return;
    }

    const formData = new FormData();
    formData.append("CNIC", frontImage);
    formData.append("CNIC", backImage);

    const toastId = toast.loading("Uploading CNIC...");

    try {
      const response = await updateDataById("update-profile", token, user._id, formData);

      const updatedUser = response?.updatedHost;
      if (updatedUser) {
        setAuthCookies(token, updatedUser);
        setUser(updatedUser);
      }

      toast.success("CNIC uploaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Error uploading CNIC:", error);
      toast.error("Failed to upload CNIC", { id: toastId });
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.2, md: 2.8 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, rgba(25,118,210,0.06), rgba(156,39,176,0.04))",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={900}>
          Profile
        </Typography>
        <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.5 }}>
          Manage your personal information and verification details.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* LEFT - Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={user?.photoProfile}
                  sx={{
                    width: 104,
                    height: 104,
                    fontSize: 38,
                    bgcolor: "primary.main",
                    fontWeight: 900,
                    border: "3px solid rgba(25,118,210,0.18)",
                  }}
                >
                  {user?.userName?.charAt(0)?.toUpperCase()}
                </Avatar>

                <Tooltip title="Update profile photo" arrow>
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      right: -6,
                      bottom: -6,
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "background.paper",
                      boxShadow: "var(--shadow-md)",
                      "&:hover": {
                        backgroundColor: "var(--bg-secondary)",
                      },
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleImageUpload(e.target.files?.[0], "profile")}
                    />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box textAlign="center">
                <Typography variant="h6" fontWeight={900}>
                  {user?.userName}
                </Typography>
                <Typography variant="body2" color="var(--text-secondary)">
                  Guest Account
                </Typography>
              </Box>

              <Divider sx={{ width: "100%" }} />

              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                <Chip
                  icon={<EmailIcon />}
                  label={user?.email || "No email"}
                  variant="outlined"
                  sx={{ borderRadius: 2, fontWeight: 700, color: "var(--text-primary)" }}
                />
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT - About */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  About {user?.userName}
                </Typography>
                <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.4 }}>
                  Keep your details updated for smoother bookings.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                {isEditing ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 900,
                      px: 2.2,
                    }}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 900,
                      px: 2.2,
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Stack>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider", bgcolor: "rgba(0,0,0,0.02)" }}>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Box sx={{ width: 38, height: 38, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "rgba(25,118,210,0.10)", color: "primary.main", flexShrink: 0 }}>
                      <EmailIcon fontSize="small" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="var(--text-secondary)" fontWeight={800}>Email</Typography>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography fontWeight={900} sx={{ mt: 0.2 }}>{user?.email || "No email"}</Typography>
                        {!user?.isEmailVerified && (
                          <Button size="small" variant="text" onClick={() => setOpenEmailVerify(true)} sx={{ minWidth: 0, p: 0.5, fontWeight: 800 }}>Verify</Button>
                        )}
                        {!!user?.isEmailVerified && <CheckCircleIcon color="success" fontSize="small" />}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "rgba(0,0,0,0.02)",
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: "rgba(25,118,210,0.10)",
                        color: "primary.main",
                        flexShrink: 0,
                      }}
                    >
                      <PhoneIphoneIcon fontSize="small" />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="var(--text-secondary)" fontWeight={800}>
                        Phone
                      </Typography>

                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Enter phone number"
                          value={editedFields.phoneNumber ?? user.phoneNumber ?? ""}
                          onChange={(e) =>
                            setEditedFields((prev) => ({
                              ...prev,
                              phoneNumber: e.target.value,
                            }))
                          }
                          sx={{ mt: 0.7 }}
                        />
                      ) : (
                        <Typography fontWeight={900} sx={{ mt: 0.2 }}>
                          {user?.phoneNumber || "Not added"}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* CNIC Upload */}
          {!isCnicUploaded && (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Upload CNIC
                  </Typography>
                  <Typography variant="body2" color="var(--text-secondary)" sx={{ mt: 0.4 }}>
                    Upload both sides for verification. Your data stays secure.
                  </Typography>
                </Box>

                <Chip
                  icon={<BadgeIcon />}
                  label="Verification required"
                  color="warning"
                  variant="outlined"
                  sx={{ borderRadius: 2, fontWeight: 900 }}
                />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <UploadCard
                    title="CNIC Front"
                    preview={cnicFront}
                    onUpload={(file) => handleImageUpload(file, "cnicFront")}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <UploadCard
                    title="CNIC Back"
                    preview={cnicBack}
                    onUpload={(file) => handleImageUpload(file, "cnicBack")}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleCnicUpload}
                  disabled={!frontImage || !backImage}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 900,
                    px: 2.4,
                    py: 1.1,

                    /* normal */
                    boxShadow: "var(--shadow-sm)",

                    /* 🌙 disabled state — IMPORTANT */
                    "&.Mui-disabled": {
                      backgroundColor: "var(--bg-tertiary)",
                      color: "var(--text-tertiary)",
                      border: "1px solid var(--border-muted)",
                      boxShadow: "none",
                      cursor: "not-allowed",
                    },

                    "&.Mui-disabled:hover": {
                      backgroundColor: "var(--bg-tertiary)",
                    },

                    transition: "all 0.18s ease",
                  }}
                >
                  Submit CNIC
                </Button>

              </Stack>
            </Paper>
          )}

          {/* Verified Info */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "rgba(0,0,0,0.02)",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={900}>
                Confirmed information
              </Typography>

              <Chip
                icon={isVerifiedCnic ? <CheckCircleIcon /> : <CloseIcon />}
                label={isVerifiedCnic ? "Verified" : "Not verified"}
                color={isVerifiedCnic ? "success" : "default"}
                variant="outlined"
                sx={{ borderRadius: 2, fontWeight: 900, color: "var(--text-primary)" }}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              {isVerifiedCnic ? (
                <CheckCircleIcon sx={{ color: "var(--text-primary)" }} />
              ) : (
                <CloseIcon sx={{ color: "var(--text-primary)" }} />
              )}
              <Typography fontWeight={800}>CNIC</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <EmailVerificationDialog
        open={openEmailVerify}
        onClose={() => setOpenEmailVerify(false)}
        email={user?.email}
        token={token}
        onSuccess={(updatedUser) => {
          const merged = { ...user, ...updatedUser };
          setUser(merged);
          setAuthCookies(token, merged);
          toast.success("Email verified successfully!");
        }}
      />
    </Box>
  );
};

/* ---------------- Small Components ---------------- */

import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { postData } from "../../config/ServiceApi/serviceApi";

const EmailVerificationDialog = ({ open, onClose, email, token, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Send, 2: Verify
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      // POST needs to be imported or used from serviceApi
      await postData("auth/send-email-verification", { email }, token);
      setStep(2);
      toast.success("Verification code sent!");
    } catch (e) {
      // console.error(e);
      // handled by serviceApi toast usually, or catch
      toast.error(e.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await postData("auth/verify-email-code", { email, code }, token);
      onSuccess({ isEmailVerified: true, emailVerifiedAt: new Date() });
      onClose();
    } catch (e) {
      toast.error(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={800}>{step === 1 ? "Verify Email" : "Enter Code"}</DialogTitle>
      <DialogContent dividers>
        {step === 1 ? (
          <Typography>
            Send a 6-digit verification code to <b>{email}</b>?
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2">
              Enter the code sent to {email}.
            </Typography>
            <TextField
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              fullWidth
              autoFocus
              inputProps={{ maxLength: 6, style: { fontSize: 24, letterSpacing: 8, textAlign: 'center' } }}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {step === 1 ? (
          <Button variant="contained" onClick={handleSend} disabled={loading}>{loading ? "Sending..." : "Send Code"}</Button>
        ) : (
          <Button variant="contained" onClick={handleVerify} disabled={loading || code.length < 6}>{loading ? "Verifying..." : "Verify"}</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const FieldCard = ({ icon, label, value }) => {
  // ... existing FieldCard code
  // ...

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(0,0,0,0.02)",
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            backgroundColor: "rgba(25,118,210,0.10)",
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { fontSize: "small" })}
        </Box>

        <Box>
          <Typography variant="caption" color="var(--text-secondary)" fontWeight={800}>
            {label}
          </Typography>
          <Typography fontWeight={900} sx={{ mt: 0.2 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

const UploadCard = ({ title, preview, onUpload }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ pb: 1.5 }}>
        <Typography fontWeight={900} sx={{ mb: 1 }}>
          {title}
        </Typography>

        <Button
          variant="outlined"
          component="label"
          startIcon={<AddPhotoAlternateIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 900,
            mb: 1.5,
          }}
        >
          Upload image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
        </Button>

        <Box
          sx={{
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
            backgroundColor: "rgba(0,0,0,0.02)",
            height: 190,
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
          }}
        >
          {preview ? (
            <CardMedia
              component="img"
              image={preview}
              alt={title}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Typography variant="body2" color="var(--text-secondary)" fontWeight={700}>
              Preview will appear here
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
