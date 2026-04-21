import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authUser from '../../model/hostModel/index.js';
import { sendAppEmail, EMAIL_TYPES } from '../../config/email/sendAppEmail.js';
import { createNotification, NOTIFICATION_TYPES } from '../../config/notifications/notificationService.js';
import { sendVerificationEmail } from '../../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
  /**
   * Example usage of the centralized email service.
   * Demonstrates sending a verification email manually.
   */
  testEmail: async (req, res) => {
    try {
      const { email } = req.body;
      const verificationLink = `${process.env.FRONTEND_BASE_URL}/verify?token=example-token`;

      await sendVerificationEmail(email, verificationLink);

      return res.status(200).json({ message: 'Example verification email sent successfully via Resend.' });
    } catch (error) {
      console.error('Test Email Error:', error.message);
      return res.status(500).json({ message: 'Failed to send test email', error: error.message });
    }
  },

  signUp: async (req, res) => {
    try {
      const { userName, email, password } = req.body;
      const existingUser = await authUser.findOne({ email });
      if (existingUser) {
        return res.status(403).json({ message: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new authUser({ userName, email, password: hashedPassword });
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '10h' });
      user.verifyToken = token;

      await user.save();

      sendAppEmail({
        to: email,
        type: EMAIL_TYPES.AUTH_WELCOME,
        payload: { userName, email }
      }).catch(err => {
        console.error("Email failed:", err.message);
      });

      createNotification({
        userId: user._id,
        role: 'guest',
        type: NOTIFICATION_TYPES.AUTH_WELCOME,
        title: `Welcome to ${process.env.APP_NAME}!`,
        message: `Welcome ${userName}, thank you for joining our community.`,
        data: { actionUrl: '/user/profile' }
      }).catch(err => {
        console.error("Notification failed:", err.message);
      });

      res.status(201).json({ message: 'User created successfully', token, user });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    };
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await authUser.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      if (!password || !user.password) {
        return res.status(400).json({ message: 'Invalid email or password. If you signed up with Google, please log in with Google.' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '10h' });
      user.verifyToken = token;
      await user.save();
      res.status(200).json({ token, user });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  updateProfile: async (req, res) => {
    try {
      console.log("UPDATE PROFILE - BODY:", req.body);
      console.log("UPDATE PROFILE - FILES:", req.files);
      const { hostId } = req.params;
      const dataUpdate = { ...req.body };

      const host = await authUser.findById(hostId);
      if (!host) {
        return res.status(404).json({ message: "Host Not Found" });
      }
      if (req.files && req.files.profileImage && req.files.profileImage[0]) {
        dataUpdate.photoProfile = req.files.profileImage[0].path;
      }

      if (dataUpdate.email) {
        return res.status(400).send({ message: "Email cannot be updated." });
      }

      if (req.files && req.files.CNIC && req.files.CNIC.length === 2) {
        const cnicImages = req.files.CNIC.map(file => file.path);
        dataUpdate.CNIC = { images: cnicImages };
      } else if (req.files && req.files.CNIC && req.files.CNIC.length !== 2) {
        return res.status(400).json({ message: "Both front and back CNIC images are required." });
      }

      console.log("DATA UPDATE OBJECT:", dataUpdate);

      const updatedHost = await authUser.findByIdAndUpdate(
        hostId,
        { $set: dataUpdate },
        { new: true }
      );

      console.log("UPDATED HOST RESULT:", updatedHost);

      if (!updatedHost) {
        return res.status(404).json({ message: "Host Not Found" });
      }

      return res.status(200).json({ message: "Profile updated successfully", updatedHost });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  verifyToken: async (req, res) => {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        console.log("User ", decoded)
        if (err) {
          return res.status(400).json({ message: 'Token is invalid or expired' });
        }
        const user = await authUser.findOne({ _id: decoded.userId });
        console.log("User", user)
        if (!user || user.verifyToken !== token) {
          return res.status(400).json({ message: 'Invalid token' });
        }
        res.status(200).json({ message: 'Token verified successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(400).json({ message: 'Token is invalid or expired' });
        }
        const { userId } = decoded;
        const user = await authUser.findById(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        if (!user.verifyToken || user.verifyToken !== token) {
          return res.status(400).json({ message: 'Already logged out or token is invalid' });
        }

        user.verifyToken = null;
        await user.save();

        res.status(200).json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },


  sendEmailVerification: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await authUser.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.emailVerifyCode = code;
      user.emailVerifyExpiry = expiry;
      await user.save();

      await sendAppEmail({
        to: email,
        type: EMAIL_TYPES.AUTH_EMAIL_VERIFY_OTP,
        payload: {
          userName: user.userName,
          otpCode: code,
        }
      });

      res.status(200).json({ message: "Verification code sent to email" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  verifyEmailCode: async (req, res) => {
    try {
      const { email, code } = req.body;
      const user = await authUser.findOne({ email }).select('+emailVerifyCode +emailVerifyExpiry');

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.emailVerifyCode || user.emailVerifyCode !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      if (user.emailVerifyExpiry < new Date()) {
        return res.status(400).json({ message: "Verification code expired" });
      }

      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      user.emailVerifyCode = undefined;
      user.emailVerifyExpiry = undefined;

      await user.save();

      await createNotification({
        userId: user._id,
        role: 'guest',
        type: NOTIFICATION_TYPES.AUTH_EMAIL_VERIFIED,
        title: 'Email Verified',
        message: 'Your email has been successfully verified.',
        data: { actionUrl: '/user/profile' }
      });

      res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }
};

export default authController;
