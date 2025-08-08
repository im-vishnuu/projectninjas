const multer = require('multer');
const path = require('path');

// Configure how files are stored
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files to the 'project_uploads' directory
    cb(null, 'project_uploads/');
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s/g, '_'));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;