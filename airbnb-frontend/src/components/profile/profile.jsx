import React, { useState } from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { updateDataById } from "../../config/ServiceApi/serviceApi";
import { showSuccessToast } from "../toast/toast";

const ProfileSection = () => {
  const initialUser = JSON.parse(localStorage.getItem("user"));
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);
  const [frontImage, setFrontImage] = useState();
  const [backImage, setBackImage] = useState();
  const token = localStorage.getItem("token");
  const isVerifiedEmail = initialUser.CNIC.isVerified || false
  const handleSaveProfile = async () => {
    setIsEditing(false);
    const changes = { ...editedFields };

    if (Object.keys(changes).length > 0) {
      try {
        const response = await updateDataById(
          "update-profile",
          token,
          user._id,
          changes
        );
        console.log(response);
        if (response && response.updatedHost) {
          const updatedUser = { ...user, ...response.updatedHost };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
          setEditedFields({});
        }
      } catch (error) {
        console.error("Error saving profile changes:", error);
      }
    }
  };

  const handleImageUpload = (file, type) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (type === "profile") {
        // Update profile photo locally and in localStorage
        const newPhoto = reader.result;
        const updatedUser = { ...user, photoProfile: newPhoto };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Upload profile photo to the server
        const formData = new FormData();
        formData.append("profileImage", file);

        try {
          const response = await updateDataById(
            "update-profile",
            token,
            user._id,
            formData
          );
          console.log("Profile photo updated successfully:", response);
        } catch (error) {
          console.error("Error updating profile photo:", error);
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
      alert("Please upload both CNIC front and back images.");
      return;
    }

    const formData = new FormData();

    formData.append("CNIC", frontImage);
    formData.append("CNIC", backImage);

    try {
      const response = await updateDataById(
        "update-profile",
        token,
        user._id,
        formData
      );
      const updatedUser = response.updatedHost;
      localStorage.setItem("user", JSON.stringify(response.updatedHost));
      console.log("CNIC uploaded successfully:", response);
      showSuccessToast("CNIC Uploaded Successfully!");
      setUser(updatedUser);
    } catch (error) {
      console.error("Error uploading CNIC:", error);
    }
  };

  return (
    <Grid
      container
      spacing={4}
      sx={{ maxWidth: 800, padding: 3, margin: {md: "auto", sx: 0}}}
    >
      {/* Profile Section */}
      <Grid item xs={12} md={4} >
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            textAlign: "center",
            borderRadius: 2,
            position: "relative",
          }}
        >
          <Tooltip title="Click to upload a new profile picture" arrow>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: 40,
                  bgcolor: "primary.main",
                  margin: "auto",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
                src={user.photoProfile}
              >
                {user.userName.charAt(0).toUpperCase()}
              </Avatar>
              <IconButton
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "white",
                  boxShadow: 1,
                  "&:hover": { backgroundColor: "primary.light" },
                }}
              >
                <PhotoCameraIcon />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    handleImageUpload(e.target.files[0], "profile");
                  }}
                />
              </IconButton>
            </Box>
          </Tooltip>
          <Typography variant="h6" sx={{ mt: 2 }}>
            {user.userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Guest
          </Typography>
        </Paper>
      </Grid>

      {/* About Section */}
      <Grid item xs={12} md={8}>
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            About {user.userName}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Phone:</strong>{" "}
            {isEditing ? (
              <TextField
                size="small"
                value={editedFields.phoneNumber || user.phoneNumber}
                onChange={(e) =>
                  setEditedFields({
                    ...editedFields,
                    phoneNumber: e.target.value,
                  })
                }
                variant="outlined"
              />
            ) : (
              user.phoneNumber || editedFields.phoneNumber
            )}
          </Typography>
          <Button
            variant="contained"
            color={isEditing ? "success" : "primary"}
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            sx={{ mt: 2, textTransform: "none" }}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </Box>
      </Grid>
      {!initialUser.CNIC.images.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Upload CNIC
          </Typography>
          <Grid container spacing={2}>
            {/* CNIC Front */}
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
                <CardContent>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    CNIC Front
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{ textTransform: "none", mb: 2 }}
                  >
                    Upload CNIC Front
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        handleImageUpload(e.target.files[0], "cnicFront")
                      }
                    />
                  </Button>
                  {cnicFront && (
                    <CardMedia
                      component="img"
                      src={cnicFront}
                      alt="CNIC Front"
                      sx={{ height: 200, objectFit: "cover", borderRadius: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* CNIC Back */}
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
                <CardContent>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    CNIC Back
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{ textTransform: "none", mb: 2 }}
                  >
                    Upload CNIC Back
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        handleImageUpload(e.target.files[0], "cnicBack")
                      }
                    />
                  </Button>
                  {cnicBack && (
                    <CardMedia
                      component="img"
                      src={cnicBack}
                      alt="CNIC Back"
                      sx={{ height: 200, objectFit: "cover", borderRadius: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
              <Box sx={{ textAlign: "right", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleCnicUpload}
                  disabled={!frontImage || !backImage}
                >
                  Upload CNIC
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper
          elevation={2}
          sx={{
            padding: 2,
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {user.userName}'s confirmed information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {isVerifiedEmail ? (
              <CheckCircleIcon color="success" />
            ) : (
              <CloseIcon color="error" />
            )}
            <Typography variant="body1">CNIC</Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ProfileSection;
