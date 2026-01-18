import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
} from "@mui/material";

const EditMeasurementsModal = ({ open, handleClose, stretchData, handleSave }) => {
  const [editedData, setEditedData] = useState(stretchData || {});

  const handleChange = (e, section, field) => {
    setEditedData({
      ...editedData,
      [section]: {
        ...editedData[section],
        [field]: e.target.value,
      },
    });
  };

  const saveChanges = () => {
    handleClose();
    handleSave(editedData);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          width: 600,
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Edit Measurements
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {/* Kameez Measurements */}
        <Typography variant="h6">Kameez Measurements</Typography>
        <br />
        <Grid container spacing={2}>
          {[
            { label: "Armhole Circumference", field: "armholeCircumference" },
            { label: "Bicep Circumference", field: "bicepCircumference" },
            { label: "Bust Circumference", field: "bustCircumference" },
            { label: "Waist Circumference", field: "waistCircumference" },
            { label: "Hip Circumference", field: "hipCircumference" },
            { label: "Length of Kameez", field: "lengthOfKameez" },
            { label: "Shoulder Width", field: "shoulderWidth" },
            { label: "Neck Depth", field: "neckDepth" },
            { label: "Cuff Circumference", field: "cuffCircumference" },
          ].map(({ label, field }) => (
            <Grid item xs={6} key={field}>
              <TextField
                fullWidth
                label={label}
                value={editedData.kameez?.[field] || ""}
                onChange={(e) => handleChange(e, "kameez", field)}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Shalwar Measurements */}
        <Typography variant="h6">Shalwar Measurements</Typography>
        <br />
        <Grid container spacing={2}>
          {[
            { label: "Waist Circumference", field: "waistCircumferenceShalwar" },
            { label: "Hip Circumference", field: "hipCircumferenceShalwar" },
            { label: "Thigh Circumference", field: "thighCircumference" },
            { label: "Knee Circumference", field: "kneeCircumference" },
            { label: "Ankle Circumference", field: "ankleCircumference" },
            { label: "Length of Shalwar", field: "lengthOfShalwar" },
          ].map(({ label, field }) => (
            <Grid item xs={6} key={field}>
              <TextField
                fullWidth
                label={label}
                value={editedData.shalwar?.[field] || ""}
                onChange={(e) => handleChange(e, "shalwar", field)}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Fit Preferences */}
        <Typography variant="h6">Fit Preferences</Typography>
        <br />
        <Grid container spacing={2}>
          {[
            { label: "Fit Type (Loose/Fitted)", field: "fitType" },
            { label: "Sleeve Type (Short/Long)", field: "sleeveType" },
            { label: "Neck Style", field: "neckStyle" },
          ].map(({ label, field }) => (
            <Grid item xs={6} key={field}>
              <TextField
                fullWidth
                label={label}
                value={editedData.fitPreferences?.[field] || ""}
                onChange={(e) => handleChange(e, "fitPreferences", field)}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, textAlign: "right" }}>
          <Button onClick={handleClose} sx={{ mr: 2, color: "#00203F" }}>
            Cancel
          </Button>
          <Button variant="contained" color="#00203F" onClick={saveChanges} style={{backgroundColor: "#ADF0D1"}}>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditMeasurementsModal;
