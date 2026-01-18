import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('Only image files are allowed!');
    }
    return {
      folder: 'listings',
      format: 'jpg', 
      allowed_formats: ['jpg', 'jpeg', 'png'], 
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, 
    };
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'), false);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

export default upload;
