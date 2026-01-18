import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'listings', 
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

export default upload;
