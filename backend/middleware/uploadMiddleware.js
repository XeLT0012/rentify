const multer = require('multer');
const path = require('path');

// Save images inside backend/uploads/
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // ✅ relative to backend/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const imageUpload = multer({ storage: imageStorage });

module.exports = { imageUpload };
