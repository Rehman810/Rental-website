import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../../model/adminAuth/index.js';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SECRET;

const adminService = {
  login: async ({ userName, password }) => {
    const admin = await Admin.findOne({ userName });
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (match) {
        const token = jwt.sign({ userName: admin.userName, role: admin.role }, secretKey, { expiresIn: '10h' });
        admin.sessions.push({ token });
        await admin.save();
        return token;
      }
    }
    return null;
  },

  logout: async (token) => {
    try {
      const admin = await Admin.findOne({ 'sessions.token': token });
      if (admin) {
        admin.sessions = admin.sessions.filter(session => session.token !== token);
          await admin.save();
  
        return true;
      }
  
      return false; 
    } catch (error) {
      console.error('Error logging out user:', error);
      return false;
    }
  },
  
  saveResetCode: async (code, email) => {
    const admin = await Admin.findOne({ email });
    if (admin) {
      admin.resetCode = code;
      await admin.save();
      return true;
    }
    return false;
  },

  validateResetCode: async (code) => {
    const admin = await Admin.findOne({ resetCode: code });
    return !!admin;
  },
  updatePassword: async (newPassword) => {
    try {
      const email = 'rajaasgharali009@gmail.com'; // Fixed email
      const admin = await Admin.findOne({ email });
      if (admin) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        admin.password = hashedPassword;
        admin.resetCode = undefined; 
        await admin.save();
        return true;
      }
      return false
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Failed to update password');
    }
  },


  verifyToken: async (token) => {
    try {
      const decoded = jwt.verify(token, secretKey); 
      console.log('Decoded userName:', decoded.userName);
      const admin = await Admin.findOne({ userName: decoded.userName });
      console.log('Admin found:', admin);
      if (admin && admin.sessions.some((session) => session.token === token)) {
        return { isValid: true };
      }
  
      return { isValid: false }; 
    } catch (error) {
      console.error('Error verifying token:', error.message);
      return { isValid: false }; 
    }
  },
  
};

export default adminService;
