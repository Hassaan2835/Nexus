const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadDocument,
  getDocuments,
  shareDocument,
  signDocument,
  deleteDocument
} = require('../controllers/documentController');

const router = express.Router();
const { protect } = require('../middleware/auth');

// Setup multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'public/uploads/';
    // Create directory if it doesn't exist
    if (!require('fs').existsSync(uploadDir)){
        require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /pdf|doc|docx|png|jpg|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only Documents & Images Allowed!');
    }
  }
});

router.use(protect);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getDocuments);
router.put('/:id/share', shareDocument);
router.put('/:id/sign', signDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
