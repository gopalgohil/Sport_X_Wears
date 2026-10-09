import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary SDK with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage for athletic apparel product images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sportxwear/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [
      { width: 1400, height: 1400, crop: 'limit', quality: 'auto:best', fetch_format: 'webp' },
    ],
    public_id: (req, file) => {
      const cleanFileName = file.originalname
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      return `${Date.now()}_${cleanFileName}`;
    },
  },
});

// File filter restricting uploads to valid image formats
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type: Only image formats (JPEG, PNG, WebP, AVIF) are supported'), false);
  }
};

// Multer instance with file size and quantity constraints
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5,                  // Maximum 5 images per product
  },
  fileFilter: imageFileFilter,
});

// Multi-image upload middleware for product gallery
export const uploadProductImages = upload.array('images', 5);

// Single-image upload middleware for categories/banners
export const uploadBannerImage = upload.single('bannerImage');

export { cloudinary };
export default upload;
