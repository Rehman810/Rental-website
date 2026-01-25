import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import authUser from '../../model/hostModel/index.js';
import { sendAppEmail, EMAIL_TYPES } from '../../config/email/sendAppEmail.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

const googleAuthController = {
    googleLogin: async (req, res) => {
        try {
            const { credential } = req.body;

            if (!credential) {
                return res.status(400).json({ message: 'Google credential is required' });
            }

            // Verify Google Token
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { email, name, picture, sub: googleId } = payload;

            // Check if user exists
            let user = await authUser.findOne({ email });

            if (user) {
                // User exists
                if (!user.googleId) {
                    user.googleId = googleId;
                    if (user.authProvider === 'local') {
                        // Merge account logic: Allow logging in, but maybe update provider or keep as local but linked
                        // We just save the googleId so next time they can login via Google too
                    }
                    await user.save();
                }
            } else {
                // Create new user
                user = new authUser({
                    userName: name,
                    email,
                    photoProfile: picture,
                    googleId,
                    authProvider: 'google',
                    role: 'guest',
                    isVerify: true, // Google emails are verified
                    verifyToken: '' // Initialize
                });
                await user.save();

                await sendAppEmail({
                    to: email,
                    type: EMAIL_TYPES.AUTH_GOOGLE_WELCOME,
                    payload: {
                        userName: name,
                        email,
                    }
                });
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '10h' }
            );

            // Update user token in DB (preserving existing flow)
            user.verifyToken = token;
            await user.save();

            res.status(200).json({
                status: true,
                token,
                user: {
                    _id: user._id,
                    userName: user.userName,
                    email: user.email,
                    photoProfile: user.photoProfile,
                    role: user.role,
                    authProvider: user.authProvider
                }
            });

        } catch (error) {
            console.error("Google Auth Error:", error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

export default googleAuthController;
