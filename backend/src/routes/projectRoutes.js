const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Routes
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.get('/:id/files', authMiddleware, projectController.getProjectFiles);

// Protected Routes
router.post('/', authMiddleware, projectController.createProject);
router.put('/:id', authMiddleware, projectController.updateProject);
router.post('/:id/upload', authMiddleware, projectController.uploadProjectFile);
router.get('/files/:fileId/download', authMiddleware, projectController.downloadProjectFile)

module.exports = router;