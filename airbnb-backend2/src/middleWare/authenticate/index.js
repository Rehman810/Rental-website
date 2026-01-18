import jwt from 'jsonwebtoken';
import User from '../../model/hostModel/index.js'


export const authenticateHost = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    req.user = user; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
