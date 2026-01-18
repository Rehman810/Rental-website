import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Auth from '../../model/adminAuth/index.js'; // Adjust the path and file extension

dotenv.config();

const uri = process.env.MONGO_URI;
  console.error('Error: MONGODB_URI is not defined ...');

if (!uri) {
  console.error('Error: MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(uri, {
 
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const initializeAdmin = async () => {
  try {
    const admin = await Auth.findOne({ userName: 'admin' });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin', 10);

      const newAdmin = new Auth({
        userName: 'admin',
        password: hashedPassword,
        email: process.env.ADMIN_EMAIL || 'admin@admin.com',
        adminId: 786,
      });

      await newAdmin.save();
      console.log('Initial admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

initializeAdmin();
