const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new access request
router.post('/', authMiddleware, requestController.createRequest);

// Get all pending requests for projects owned by the current user
router.get('/mine', authMiddleware, requestController.getRequestsForMyProjects);

// Respond to an access request (approve/deny)
router.put('/:requestId', authMiddleware, requestController.respondToRequest);

// ... (keep your other routes: POST /, GET /mine, PUT /:requestId)

// --- ADD THIS NEW ROUTE ---
router.get('/sent', authMiddleware, requestController.getMySentRequests);

module.exports = router;
