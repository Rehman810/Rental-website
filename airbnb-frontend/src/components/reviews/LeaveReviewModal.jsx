import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Rating, TextField, Button, IconButton,
    CircularProgress, Grid, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';
import { createReview } from '../../config/ServiceApi/serviceApi';

const RatingCategory = ({ label, value, onChange }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography component="legend">{label}</Typography>
        <Rating
            name={label}
            value={value}
            onChange={(event, newValue) => onChange(newValue)}
        />
    </Box>
);

const LeaveReviewModal = ({ open, onClose, listingId, bookingId, onReviewSubmitted }) => {
    const [loading, setLoading] = useState(false);
    const [ratings, setRatings] = useState({
        cleanliness: 0,
        location: 0,
        communication: 0,
        value: 0
    });
    const [comment, setComment] = useState('');
    const [photos, setPhotos] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        if (!open) {
            setRatings({ cleanliness: 0, location: 0, communication: 0, value: 0 });
            setComment('');
            setPhotos([]);
            setPreviewUrls([]);
        }
    }, [open]);

    const handleRatingChange = (category, value) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + photos.length > 5) {
            toast.error('Maximum 5 photos allowed');
            return;
        }
        setPhotos(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validation
        if (Object.values(ratings).some(r => r === 0)) {
            toast.error('Please rate all categories');
            return;
        }
        if (comment.length < 10) {
            toast.error('Comment must be at least 10 characters');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('listingId', listingId);
        formData.append('bookingId', bookingId);
        formData.append('ratings', JSON.stringify(ratings));
        formData.append('comment', comment);
        photos.forEach(photo => {
            formData.append('photos', photo);
        });

        try {
            const user = localStorage.getItem('token');
            if (!user) throw new Error('Not authenticated');

            await createReview(formData, user);
            toast.success('Review submitted successfully!');
            onReviewSubmitted();
            onClose();
        } catch (error) {
            // Extract error message potentially
            const msg = error.message || 'Failed to submit review';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const overallRating = (
        (ratings.cleanliness + ratings.location + ratings.communication + ratings.value) / 4
    ) || 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    Write a Review
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="h6" gutterBottom>How was your stay?</Typography>

                <Box sx={{ mb: 3 }}>
                    <RatingCategory label="Cleanliness" value={ratings.cleanliness} onChange={(v) => handleRatingChange('cleanliness', v)} />
                    <RatingCategory label="Location" value={ratings.location} onChange={(v) => handleRatingChange('location', v)} />
                    <RatingCategory label="Communication" value={ratings.communication} onChange={(v) => handleRatingChange('communication', v)} />
                    <RatingCategory label="Value" value={ratings.value} onChange={(v) => handleRatingChange('value', v)} />

                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">Overall:</Typography>
                        <Rating value={overallRating} precision={0.1} readOnly />
                        <Typography>({overallRating.toFixed(1)})</Typography>
                    </Box>
                </Box>

                <TextField
                    label="Share your experience"
                    multiline
                    rows={4}
                    fullWidth
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    error={comment.length > 0 && comment.length < 10}
                    helperText={comment.length > 0 && comment.length < 10 ? "Minimum 10 characters required" : ""}
                    sx={{ mb: 3 }}
                />

                <Box>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        multiple
                        type="file"
                        onChange={handlePhotoUpload}
                    />
                    <label htmlFor="raised-button-file">
                        <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                            Upload Photos
                        </Button>
                    </label>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                        {previewUrls.map((url, index) => (
                            <Box key={index} sx={{ position: 'relative' }}>
                                <img src={url} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                                <IconButton
                                    size="small"
                                    sx={{ position: 'absolute', top: -5, right: -5, bgcolor: 'background.paper' }}
                                    onClick={() => removePhoto(index)}
                                >
                                    <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </Box>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || Object.values(ratings).some(r => r === 0) || comment.length < 10}
                >
                    {loading ? <CircularProgress size={24} /> : 'Submit Review'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LeaveReviewModal;
