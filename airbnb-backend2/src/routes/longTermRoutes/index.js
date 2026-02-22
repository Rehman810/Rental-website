import express from 'express';
import {
    applyForLease,
    preApproveLease,
    uploadLeaseDocuments,
    generateLeaseAgreement,
    sendOtp,
    verifyOtp,
    activateLease,
    getAgreement,
    getPayments,
    // Legacy mapping support
    createAgreement,
    uploadVerification,
    signAgreement
} from '../../controller/longTermController/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';
import upload from '../../config/cloudnry/index.js';

const router = express.Router();

const longTermRoutes = (app) => {
    app.use('/long-term', router);

    // --- New Refactored Flow Endpoints ---

    // 1. Application
    router.post('/apply', combinedAuthenticate, applyForLease);

    // 2. Landlord Approval
    router.patch('/:id/preapprove', combinedAuthenticate, preApproveLease);

    // 3. Document Upload (Specific to Lease)
    router.post(
        '/:id/upload-documents',
        combinedAuthenticate,
        upload.fields([
            { name: 'cnicFront', maxCount: 1 },
            { name: 'cnicBack', maxCount: 1 },
            { name: 'selfie', maxCount: 1 },
        ]),
        uploadLeaseDocuments
    );

    // 4. Agreement Generation
    router.post('/:id/generate-agreement', combinedAuthenticate, generateLeaseAgreement);

    // 5. Signing (OTP)
    router.post('/:id/send-otp', combinedAuthenticate, sendOtp);
    router.post('/:id/verify-otp', combinedAuthenticate, verifyOtp);

    // 6. Payment/Activation
    router.post('/:id/activate', combinedAuthenticate, activateLease);

    // Getters
    router.get('/agreement/:id', combinedAuthenticate, getAgreement);
    router.get('/payments/:agreementId', combinedAuthenticate, getPayments);

    // --- Legacy / Compatibility Endpoints ---
    // Mapping old endpoints to new logic where applicable or keeping them if needed
    router.post('/agreement', combinedAuthenticate, createAgreement); // Mapped to applyForLease
    router.post(
        '/verification',
        combinedAuthenticate,
        upload.fields([
            { name: 'cnicFront', maxCount: 1 },
            { name: 'cnicBack', maxCount: 1 },
            { name: 'selfie', maxCount: 1 },
            { name: 'fingerprints', maxCount: 5 },
        ]),
        uploadVerification // Mapped to uploadLeaseDocuments (careful with params)
    );
    router.post('/agreement/:id/sign', combinedAuthenticate, signAgreement); // Mapped to verifyOtp
};

export default longTermRoutes;
