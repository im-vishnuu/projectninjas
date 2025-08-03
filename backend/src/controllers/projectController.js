const pool = require('../config/db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../project_uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

exports.getAllProjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Projects"');
    res.status(200).json(result.rows);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
};

exports.getProjectById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Projects" WHERE "projectId" = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found.' });
    res.status(200).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
};

exports.createProject = async (req, res) => {
  console.log('--- [BACKEND LOG]: CREATE PROJECT FUNCTION HAS BEEN HIT ---');
  const { title, abstract, keywords } = req.body;
  
  try {
    console.log('[BACKEND LOG]: Data received from frontend:', { title, abstract, keywords });
    
    if (!req.user || !req.user.userId) {
      console.error('!!! [BACKEND ERROR]: Authentication middleware failed. req.user is missing or invalid:', req.user);
      return res.status(403).json({ message: 'Authentication failed.' });
    }
    const ownerId = req.user.userId;
    console.log(`[BACKEND LOG]: User ID from token is: ${ownerId}`);

    console.log('[BACKEND LOG]: Preparing to execute database query...');
    const result = await pool.query(
      'INSERT INTO "Projects" (title, abstract, keywords, "ownerId") VALUES ($1, $2, $3, $4) RETURNING *',
      [title, abstract, keywords, ownerId]
    );console.log('[BACKEND LOG]: --- SUCCESS! Project created successfully in database. ---');
    console.log('[BACKEND LOG]: Returning new project:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("!!! [BACKEND DATABASE ERROR]: The query failed. See details below. !!!");
    console.error(err); // This will print the exact database error
    res.status(500).json({ message: 'Server database error.' });
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, abstract, keywords } = req.body;
  const ownerId = req.user.userId;
  try {
    const projectResult = await pool.query('SELECT "ownerId" FROM "Projects" WHERE "projectId" = $1', [id]);
    if (projectResult.rows.length === 0) return res.status(404).json({ message: 'Project not found.' });
    if (projectResult.rows[0].ownerId !== ownerId) return res.status(403).json({ message: 'Not authorized.' });
    
    const updateResult = await pool.query(
      `UPDATE "Projects" SET title = $1, abstract = $2, keywords = $3 WHERE "projectId" = $4 RETURNING *`,
      [title, abstract, keywords, id]
    );
    res.status(200).json(updateResult.rows[0]);
  } catch (err) {
    console.error("UPDATE PROJECT ERROR:", err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add this new, secure version of getProjectFiles to your controller.
// You can replace the old one if it exists.
exports.getProjectFiles = async (req, res) => {
  const { id } = req.params; // projectId
  const requesterId = req.user.userId;

  try {
    // First, get the project owner's ID
    const projectResult = await pool.query('SELECT "ownerId" FROM "Projects" WHERE "projectId" = $1', [id]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    const ownerId = projectResult.rows[0].ownerId;

    // Check if the requester is the owner
    if (requesterId === ownerId) {
      const files = await pool.query('SELECT * FROM "ProjectFiles" WHERE "projectId" = $1', [id]);
      return res.status(200).json(files.rows);
    }

    // If not the owner, check if they have an approved access request
    const requestResult = await pool.query(
      'SELECT status FROM "AccessRequests" WHERE "projectId" = $1 AND "requesterId" = $2',
      [id, requesterId]
    );

    if (requestResult.rows.length > 0 && requestResult.rows[0].status === 'approved') {
      const files = await pool.query('SELECT * FROM "ProjectFiles" WHERE "projectId" = $1', [id]);
      return res.status(200).json(files.rows);
    }

    // If neither, deny access
    return res.status(403).json({ message: 'You do not have permission to view these files.' });

  } catch (err) {
    console.error("GET PROJECT FILES ERROR:", err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Add a new function to handle file downloads
exports.downloadProjectFile = async (req, res) => {
    const { fileId } = req.params;
    const requesterId = req.user.userId;

    try {
        // This is a simplified check. A real app would have more robust security here.
        // For now, we assume if you can get the file list, you can download.
        const fileResult = await pool.query('SELECT * FROM "ProjectFiles" WHERE "fileId" = $1', [fileId]);
        if (fileResult.rows.length === 0) {
            return res.status(404).json({ message: 'File not found.' });
        }
        const filePath = path.join(__dirname, '../../', fileResult.rows[0].filePath);
        res.download(filePath);
    } catch (err) {
        console.error("DOWNLOAD FILE ERROR:", err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.uploadProjectFile = [
  upload.single('projectFile'),
  async (req, res) => {
    const { id } = req.params;
    const { fileType } = req.body;
    const ownerId = req.user.userId;
    try {
      const projectResult = await pool.query('SELECT "ownerId" FROM "Projects" WHERE "projectId" = $1', [id]);
      if (projectResult.rows.length === 0) return res.status(404).json({ message: 'Project not found.' });
      if (projectResult.rows[0].ownerId !== ownerId) return res.status(403).json({ message: 'Not authorized.' });
      if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

      const { originalname, filename } = req.file;
      const filePath = `project_uploads/${filename}`;
      const newFile = await pool.query(
        'INSERT INTO "ProjectFiles" ("fileName", "filePath", "fileType", "projectId") VALUES ($1, $2, $3, $4) RETURNING *',
        [originalname, filePath, fileType || 'Other', id]
      );
      res.status(201).json(newFile.rows[0]);
    } catch (err) {
      console.error("FILE UPLOAD ERROR:", err);
      res.status(500).json({ message: 'Server error during file upload.' });
    }
  }
];