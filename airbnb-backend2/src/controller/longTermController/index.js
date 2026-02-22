import LongTermAgreement from '../../model/longTermAgreement/index.js';
import IdentityVerification from '../../model/identityVerification/index.js';
import Listing from '../../model/listingModel/index.js';
import Host from '../../model/hostModel/index.js';
import MonthlyPayment from '../../model/monthlyPayment/index.js';
import crypto from 'crypto';

// Encryption Helper
const encrypt = (text) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32); // In production, use a consistent secret key
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
        key: key.toString('hex') // In production, do NOT return/store key like this near data
    };
};

export const applyForLease = async (req, res) => {
    try {
        const {
            listingId,
            monthlyRent,
            income,
            employer,
            currentAddress,
            moveInDate,
            employmentDuration // Added to schema
        } = req.body;

        const tenantId = req.user._id;

        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        // Calculate Risk Score
        // Base score: 100
        // Rent to Income Ratio > 40% -> -30
        // Employment < 6 months -> -20
        let riskScore = 100;
        const rentToIncome = monthlyRent / income;
        if (rentToIncome > 0.4) riskScore -= 30;
        if (employmentDuration < 6) riskScore -= 20;

        const agreement = new LongTermAgreement({
            listingId,
            tenantId,
            hostId: listing.hostId,
            startDate: moveInDate,
            endDate: new Date(new Date(moveInDate).setMonth(new Date(moveInDate).getMonth() + 11)), // 11 Months default
            monthlyRent,
            securityDeposit: monthlyRent * 2, // Default 2 months
            income,
            employer,
            currentAddress,
            employmentDuration,
            riskScore,
            status: 'pending',
            verificationCompleted: false,
            agreementGenerated: false,
            otpVerified: false
        });

        await agreement.save();
        res.status(201).json({ agreement, message: "Application submitted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const preApproveLease = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' (documentsRequested) or 'rejected'

        // Map frontend action to internal status
        // If approved -> 'documentsRequested'
        // If rejected -> 'rejected'

        let newStatus = 'pending';
        if (status === 'approve') newStatus = 'documentsRequested';
        else if (status === 'reject') newStatus = 'rejected';
        else return res.status(400).json({ message: "Invalid action" });

        const agreement = await LongTermAgreement.findByIdAndUpdate(
            id,
            { status: newStatus },
            { new: true }
        );

        if (!agreement) return res.status(404).json({ message: 'Lease not found' });

        res.json({ agreement, message: `Lease ${newStatus === 'documentsRequested' ? 'pre-approved' : 'rejected'}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadLeaseDocuments = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("DEBUG: uploadLeaseDocuments ID:", id);

        // Extract files from Multer (Cloudinary)
        let cnicFront, cnicBack, selfie;
        if (req.files) {
            if (req.files.cnicFront) cnicFront = req.files.cnicFront[0].path;
            if (req.files.cnicBack) cnicBack = req.files.cnicBack[0].path;
            if (req.files.selfie) selfie = req.files.selfie[0].path;
        }

        // Fallback to body if provided as text
        if (!cnicFront) cnicFront = req.body.cnicFront;
        if (!cnicBack) cnicBack = req.body.cnicBack;
        if (!selfie) selfie = req.body.selfie;

        console.log("DEBUG: Files extracted:", { cnicFront, cnicBack, selfie });

        const agreement = await LongTermAgreement.findById(id);

        if (!agreement) {
            console.log("DEBUG: Agreement not found for ID:", id);
            return res.status(404).json({ message: 'Lease not found' });
        }

        console.log("DEBUG: Current Status:", agreement.status);

        if (agreement.status !== 'documentsRequested' && agreement.status !== 'preApproved') {
            return res.status(400).json({ message: `Documents not requested. Current status: ${agreement.status}` });
        }

        // Update or Create Identity Verification Record
        let verification = await IdentityVerification.findOne({ userId: agreement.tenantId });
        if (!verification) {
            verification = new IdentityVerification({
                userId: agreement.tenantId,
                consentGiven: true
            });
        }

        // Encrypt CNIC (Mocking encryption logic)
        // const encryptedCnicFront = encrypt(cnicFront || 'mock-front');

        verification.cnicFrontUrl = cnicFront || "https://mock.url/front";
        verification.cnicBackUrl = cnicBack || "https://mock.url/back";
        verification.selfieUrl = selfie || "https://mock.url/selfie";
        verification.status = 'verified';
        verification.verifiedAt = new Date();
        await verification.save();

        agreement.status = 'verified';
        agreement.verificationCompleted = true;
        await agreement.save();

        res.json({ agreement, message: "Documents uploaded and verified." });
    } catch (error) {
        console.error("DEBUG: uploadLeaseDocuments Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const generateLeaseAgreement = async (req, res) => {
    try {
        const { id } = req.params;
        const agreement = await LongTermAgreement.findById(id);

        if (!agreement) return res.status(404).json({ message: 'Lease not found' });
        if (agreement.status !== 'verified') return res.status(400).json({ message: "Lease not verified yet." });

        // Generate PDF Logic (Mock)
        const pdfUrl = `https://s3.aws.com/agreements/${id}.pdf`;
        const agreementHash = crypto.createHash('sha256').update(JSON.stringify(agreement)).digest('hex');

        agreement.agreementPdfUrl = pdfUrl;
        agreement.agreementHash = agreementHash;
        agreement.status = 'approved'; // Ready for signing
        agreement.agreementGenerated = true;

        await agreement.save();

        res.json({ agreement, message: "Agreement generated." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { id } = req.params;
        // Mock OTP sending
        // In production: await specificOtpProvider.send(...)
        res.json({ message: "OTP sent to registered mobile number.", otpDebug: "1234" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { id } = req.params;
        const { otp } = req.body;

        const agreement = await LongTermAgreement.findById(id);
        if (!agreement) return res.status(404).json({ message: 'Lease not found' });

        if (otp !== '1234') { // Mock verification
            return res.status(400).json({ message: "Invalid OTP" });
        }

        agreement.status = 'agreementSigned';
        agreement.otpVerified = true;

        // Also mark tenant signature
        agreement.tenantSignature = {
            signedAt: new Date(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            signatureHash: crypto.createHash('sha256').update('OTP-SIGNED:' + id).digest('hex')
        };

        await agreement.save();

        res.json({ agreement, message: "Agreement signed via OTP." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAgreement = async (req, res) => {
    try {
        const { id } = req.params;
        const agreement = await LongTermAgreement.findById(id)
            .populate('listingId')
            .populate('tenantId', 'firstName lastName email')
            .populate('hostId', 'firstName lastName email');

        if (!agreement) return res.status(404).json({ message: 'Agreement not found' });

        res.json(agreement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const activateLease = async (req, res) => {
    // This replaces the old signAgreement payment generation part
    try {
        const { id } = req.params; // Agreement ID
        // Verify payment success (Mock logic or integrate stripe)

        const agreement = await LongTermAgreement.findById(id);
        if (!agreement) return res.status(404).json({ message: 'Lease not found' });

        if (agreement.status !== 'agreementSigned') {
            return res.status(400).json({ message: "Agreement must be signed first." });
        }

        agreement.status = 'active';

        // Generate Monthly Payments
        const terms = 11; // 11 months
        const payments = [];
        let currentDate = new Date(agreement.startDate);

        for (let i = 1; i <= terms; i++) {
            currentDate.setMonth(currentDate.getMonth() + 1); // Next month
            payments.push({
                agreementId: agreement._id,
                tenantId: agreement.tenantId,
                hostId: agreement.hostId,
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear(),
                dueDate: new Date(currentDate),
                amount: agreement.monthlyRent,
                status: 'pending'
            });
        }
        await MonthlyPayment.insertMany(payments);

        await agreement.save();
        res.json({ agreement, message: "Lease activated and payments generated." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPayments = async (req, res) => {
    try {
        const { agreementId } = req.params;
        const payments = await MonthlyPayment.find({ agreementId }).sort({ dueDate: 1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Deprecated or Renamed Exports for Backward Compatibility/Clean up
export const createAgreement = applyForLease; // Alias if old routes use it
export const uploadVerification = uploadLeaseDocuments; // Alias
export const signAgreement = verifyOtp; // Alias, though semantics changed

