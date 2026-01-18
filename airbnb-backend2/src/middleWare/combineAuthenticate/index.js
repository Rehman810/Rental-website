import adminService from '../../service/AdminAuthService/index.js';
import jwt from 'jsonwebtoken';
import Admin from '../../model/adminAuth/index.js';
import Host from '../../model/hostModel/index.js';

const secretKey = process.env.JWT_SECRET; // Ensure this environment variable is properly set

const combinedAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let user;
    let decoded;

    try {
      console.log('Attempting to validate admin token...');
      decoded = jwt.verify(token, secretKey);
      user = await Admin.findOne({ userName: decoded.userName });
      if (user) {
        req.user = user;
        console.log('Admin token validated successfully, proceeding to next middleware');
        return next();
      }
    } catch (error) {
      console.log('Admin token validation failed:', error.message);
    }

    try {
      console.log('Attempting to validate Host token...');
      decoded = jwt.verify(token, secretKey);
      user = await Host.findOne({ email: decoded.email }); 
      if (user) {
        req.user = user;
        console.log('Host token validated successfully, proceeding to next middleware');
        return next();
      }
    } catch (error) {
      console.log('Host token validation failed:', error.message);
    }

    console.log('Both admin and host token validations failed');
    return res.status(403).json({ message: 'Forbidden: Invalid token' });

  } catch (error) {
    console.log('Internal Server Error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export default combinedAuthenticate;