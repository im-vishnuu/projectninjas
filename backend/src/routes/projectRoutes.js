const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Routes
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.get('/:id/files', authMiddleware, projectController.getProjectFiles);

// Protected Routes

router.post('/', authMiddleware, projectController.createProject);
router.put('/:id', authMiddleware, projectController.updateProject);
router.post('/:id/upload', authMiddleware, projectController.uploadProjectFile);
router.get('/files/:fileId/download', authMiddleware, projectController.downloadProjectFile);

// ... (your other routes)

// --- ADD THIS NEW ROUTE ---
router.delete('/files/:fileId', authMiddleware, projectController.deleteProjectFile);
router.delete('/:projectId', authMiddleware, projectController.deleteProject);


module.exports = router;