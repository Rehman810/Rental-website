import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Stack, Checkbox, FormControlLabel, CircularProgress, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { uploadLeaseDocuments } from '../../config/ServiceApi/longTermService';
import { getAuthToken } from '../../utils/cookieUtils';
import toast from 'react-hot-toast';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReplayIcon from '@mui/icons-material/Replay';

const VerificationPage = () => {
    const { agreementId } = useParams();
    const navigate = useNavigate();
    const token = getAuthToken();

    // Data State
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [consent, setConsent] = useState(false);

    // Captures
    const [cnicFront, setCnicFront] = useState(null);
    const [cnicBack, setCnicBack] = useState(null);
    const [selfie, setSelfie] = useState(null); // Base64

    // Camera State
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);

    const steps = ['Identity Documents', 'Live Selfie', 'Consent & Review'];

    // Cleanup camera on unmount
    useEffect(() => {
        return () => stopCamera();
    }, []);

    const startCamera = async (facingMode = 'user') => {
        try {
            stopCamera();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraError(null);
        } catch (err) {
            console.error("Camera Error:", err);
            setCameraError("Camera access denied or unavailable. Please enable permissions.");
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const captureFrame = (quality = 0.6) => {
        if (!videoRef.current || !canvasRef.current) return null;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Optional: mirror if selfie
        // if (activeStep === 1) {
        //     context.translate(canvas.width, 0);
        //     context.scale(-1, 1);
        // }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', quality);
    };

    const handleSelfieCapture = () => {
        const image = captureFrame();
        if (image) {
            setSelfie(image);
            stopCamera();
        }
    };

    const handleRetry = () => {
        if (activeStep === 1) setSelfie(null);
        startCamera('user');
    };

    const handleNext = () => {
        if (activeStep === 0 && (!cnicFront || !cnicBack)) return toast.error("Please upload CNIC images.");
        if (activeStep === 1 && !selfie) return toast.error("Please capture a live selfie.");

        setActiveStep((prev) => prev + 1);

        // Start camera for next step proactively
        if (activeStep === 0) startCamera('user'); // For Selfie
        if (activeStep >= 1) stopCamera();
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        if (activeStep === 1) startCamera('user');
    };

    const handleSubmit = async () => {
        if (!consent) return toast.error("Please provide your consent.");
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("cnicFront", cnicFront);
            formData.append("cnicBack", cnicBack);

            const selfieBlob = await fetch(selfie).then(r => r.blob());
            formData.append("selfie", selfieBlob, "selfie.jpg");

            // No fingerprints anymore!

            await uploadLeaseDocuments(agreementId, formData, token);
            toast.success("Documents Verified Successfully");

            navigate(`/long-term/agreement/${agreementId}`);

        } catch (err) {
            toast.error(err.message || "Verification Failed");
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Stack spacing={3}>
                        <Alert severity="info">Please upload clear photos of your CNIC (National ID Card).</Alert>
                        <UploadBox label="CNIC Front" fileState={cnicFront} setFileState={setCnicFront} icon={<BadgeIcon fontSize="large" />} />
                        <UploadBox label="CNIC Back" fileState={cnicBack} setFileState={setCnicBack} icon={<BadgeIcon fontSize="large" />} />
                        <Button variant="contained" onClick={handleNext} size="large">Continue to Selfie</Button>
                    </Stack>
                );
            case 1:
                return (
                    <Stack spacing={3} alignItems="center">
                        <Typography variant="h6">Live Identity Verification</Typography>
                        <Alert severity="info">Make sure your face is clearly visible and poorly lit.</Alert>

                        {!selfie ? (
                            <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, height: 400, bgcolor: '#000', borderRadius: 4, overflow: 'hidden' }}>
                                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {!cameraStream && !cameraError && <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', ml: -2, mt: -2 }} />}
                                {cameraError && <Typography color="error" sx={{ position: 'absolute', top: '50%', textAlign: 'center', width: '100%' }}>{cameraError}</Typography>}

                                <Box sx={{ position: 'absolute', bottom: 20, width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <Button variant="contained" color="error" onClick={handleSelfieCapture} startIcon={<CameraAltIcon />} sx={{ borderRadius: 20 }}>
                                        Capture Selfie
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center' }}>
                                <img src={selfie} alt="Selfie" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 16 }} />
                                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button variant="outlined" startIcon={<ReplayIcon />} onClick={handleRetry}>Retake</Button>
                                    <Button variant="contained" onClick={handleNext}>Confirm Photo</Button>
                                </Box>
                            </Box>
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </Stack>
                );
            case 2:
                return (
                    <Stack spacing={3}>
                        <Alert severity="success">Identity data captured successfully.</Alert>
                        <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
                            <Typography variant="h6" gutterBottom>Review & Consent</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">CNIC</Typography>
                                    <Typography>Uploaded ✓</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Selfie</Typography>
                                    <Typography>Live Captured ✓</Typography>
                                </Box>
                            </Box>

                            <FormControlLabel
                                control={<Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />}
                                label={
                                    <Typography variant="body2">
                                        I confirm that the provided documents are authentic and belong to me.
                                    </Typography>
                                }
                            />
                        </Box>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleSubmit}
                            disabled={!consent || loading}
                            sx={{ py: 1.5, fontSize: '1.1rem' }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Documents"}
                        </Button>
                    </Stack>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto", mt: 4, mb: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" fontWeight={900} align="center" gutterBottom>Identity Verification</Typography>
                <Typography align="center" color="text.secondary" mb={4}>Secure Document Upload</Typography>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent(activeStep)}
            </Paper>
        </Box>
    );
};

const UploadBox = ({ label, fileState, setFileState, icon }) => (
    <Button
        variant="outlined"
        component="label"
        fullWidth
        sx={{
            height: 100,
            borderStyle: 'dashed',
            borderColor: fileState ? 'success.main' : 'divider',
            color: fileState ? 'success.main' : 'text.secondary',
            bgcolor: fileState ? 'rgba(46, 125, 50, 0.04)' : 'transparent',
            display: 'flex', flexDirection: 'column', gap: 1
        }}
    >
        {fileState ? <CheckCircleIcon /> : icon}
        <Typography>{fileState ? `${label} Selected` : `Upload ${label}`}</Typography>
        <input type="file" hidden onChange={(e) => setFileState(e.target.files[0])} />
    </Button>
);

const BadgeIcon = () => <VerifiedUserIcon fontSize="large" />;

export default VerificationPage;
