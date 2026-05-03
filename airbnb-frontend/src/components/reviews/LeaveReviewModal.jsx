import React, { useState, useEffect } from "react";
import { getAuthToken } from "../../utils/cookieUtils";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Stack,
  alpha,
  useTheme,
  Fade,
  Zoom,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";
import { createReview } from "../../config/ServiceApi/serviceApi";

const RatingCategory = ({ label, value, onChange, theme }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      mb: 2,
      p: 1.5,
      borderRadius: 3,
      bgcolor: alpha(theme.palette.action.hover, 0.05),
      border: "1px solid",
      borderColor: alpha(theme.palette.divider, 0.05),
      transition: "all 0.2s ease",
      "&:hover": {
        bgcolor: alpha(theme.palette.action.hover, 0.08),
        borderColor: alpha(theme.palette.primary.main, 0.2),
      },
    }}
  >
    <Typography fontWeight={700} color="var(--text-primary)">
      {label}
    </Typography>
    <Rating
      name={label}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      sx={{
        color: "var(--primary-color)",
        "& .MuiRating-iconEmpty": {
          color: "var(--text-primary)",
        },
      }}
    />
  </Box>
);

const LeaveReviewModal = ({ open, onClose, listingId, bookingId, onReviewSubmitted }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({
    cleanliness: 0,
    location: 0,
    communication: 0,
    value: 0,
  });
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    if (!open) {
      setRatings({ cleanliness: 0, location: 0, communication: 0, value: 0 });
      setComment("");
      setPhotos([]);
      setPreviewUrls([]);
    }
  }, [open]);

  const handleRatingChange = (category, value) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    setPhotos((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (Object.values(ratings).some((r) => r === 0)) {
      toast.error("Please rate all categories");
      return;
    }
    if (comment.length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("listingId", listingId);
    formData.append("bookingId", bookingId);
    formData.append("ratings", JSON.stringify(ratings));
    formData.append("comment", comment);
    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Not authenticated");

      await createReview(formData);
      toast.success("Review submitted successfully!");
      onReviewSubmitted();
      onClose();
    } catch (error) {
      const msg = error.message || "Failed to submit review";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const overallRating =
    (ratings.cleanliness + ratings.location + ratings.communication + ratings.value) / 4 || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 500 }}
      PaperProps={{
        sx: {
          borderRadius: 6,
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(20px)",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.1),
          boxShadow: theme.shadows[24],
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={950} sx={{ letterSpacing: "-0.02em" }}>
            Write a Review
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: alpha(theme.palette.action.hover, 0.05),
              "&:hover": { bgcolor: alpha(theme.palette.action.hover, 0.1) },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1 }}>
        <Typography variant="h6" fontWeight={800} color="var(--text-primary)" sx={{ mb: 3 }}>
          How was your stay?
        </Typography>

        <Box sx={{ mb: 4 }}>
          <RatingCategory
            label="Cleanliness"
            value={ratings.cleanliness}
            onChange={(v) => handleRatingChange("cleanliness", v)}
            theme={theme}
          />
          <RatingCategory
            label="Location"
            value={ratings.location}
            onChange={(v) => handleRatingChange("location", v)}
            theme={theme}
          />
          <RatingCategory
            label="Communication"
            value={ratings.communication}
            onChange={(v) => handleRatingChange("communication", v)}
            theme={theme}
          />
          <RatingCategory
            label="Value"
            value={ratings.value}
            onChange={(v) => handleRatingChange("value", v)}
            theme={theme}
          />

          <Box
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: "1px dashed",
              borderColor: alpha(theme.palette.primary.main, 0.2),
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="h6" fontWeight={900}>
                Overall Score
              </Typography>
              <Typography variant="h4" fontWeight={950} color="var(--primary-color)">
                {overallRating.toFixed(1)}
              </Typography>
            </Box>
            <Rating
              value={overallRating}
              precision={0.1}
              readOnly
              sx={{
                color: theme.palette.primary.main,
                fontSize: "2rem",
              }}
            />
          </Box>
        </Box>

        <TextField
          label="Share your experience"
          placeholder="Tell others about your stay..."
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={comment.length > 0 && comment.length < 10}
          helperText={
            comment.length > 0 && comment.length < 10 ? "Minimum 10 characters required" : ""
          }
          sx={{
            mb: 4,
            "& .MuiOutlinedInput-root": {
              borderRadius: 4,
              // bgcolor: alpha(theme.palette.background.paper, 0.5),
              color: "var(--text-primary)",
            },
          }}
        />

        <Box>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="raised-button-file"
            multiple
            type="file"
            onChange={handlePhotoUpload}
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoCamera />}
              sx={{
                borderRadius: 3,
                fontWeight: 800,
                textTransform: "none",
                px: 3,
                py: 1,
                borderWidth: 2,
                "&:hover": { borderWidth: 2 },
              }}
            >
              Add Photos
            </Button>
          </label>
          <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
            {previewUrls.map((url, index) => (
              <Zoom in key={index}>
                <Box sx={{ position: "relative" }}>
                  <img
                    src={url}
                    alt="preview"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 12,
                      border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: theme.palette.background.paper,
                      boxShadow: theme.shadows[2],
                      "&:hover": { bgcolor: theme.palette.error.main, color: "#fff" },
                    }}
                    onClick={() => removePhoto(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Zoom>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 3,
            fontWeight: 800,
            color: "var(--text-primary)",
            textTransform: "none",
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || Object.values(ratings).some((r) => r === 0) || comment.length < 10}
          sx={{
            borderRadius: 4,
            fontWeight: 900,
            textTransform: "none",
            px: 5,
            py: 1.5,
            boxShadow: "none",
            "&:hover": { boxShadow: theme.shadows[4] },
            "&.Mui-disabled": {
              opacity: 0.5,
              bgcolor: alpha(theme.palette.action.disabledBackground, 0.1),
              color: "var(--text-secondary)",
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveReviewModal;

