const multer = require('multer');
const path = require('path');

// Memory storage — files kept as buffers for direct Cloudinary upload
const storage = multer.memoryStorage();

// Accept only image files
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
  }
};

const singleUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
}).single('image');

const multipleUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).array('images', 10);

// Wraps multer to return proper JSON errors
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE: 'File size cannot exceed 5 MB',
        LIMIT_FILE_COUNT: 'Maximum 10 files allowed',
        LIMIT_UNEXPECTED_FILE: 'Unexpected file field'
      };
      return res.status(400).json({
        success: false,
        message: messages[err.code] || err.message
      });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = {
  uploadSingleImage: handleUpload(singleUpload),
  uploadMultipleImages: handleUpload(multipleUpload)
};
