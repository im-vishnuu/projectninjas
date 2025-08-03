const pool = require('../config/db');

// Create a new access request
exports.createRequest = async (req, res) => {
  console.log('[CONTROLLER LOG]: --- createRequest function has been hit ---');
  console.log('[CONTROLLER LOG]: User from token:', req.user);
  console.log('[CONTROLLER LOG]: Request body received:', req.body);
  const { projectId } = req.body;
  // FIX: Correctly get the user ID from the token payload
  const requesterId = req.user.userId;
  
  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required.' });
  }
  try {
    const existingRequest = await pool.query(
      'SELECT * FROM "AccessRequests" WHERE "projectId" = $1 AND "requesterId" = $2',
      [projectId, requesterId]
    );
    if (existingRequest.rows.length > 0) {
      return res.status(409).json({ message: 'You have already requested access to this project.' });
    }

    const newRequest = await pool.query(
      // FIX: Use correct, quoted column names for the database
      'INSERT INTO "AccessRequests" ("projectId", "requesterId", status) VALUES ($1, $2, $3) RETURNING *',
      [projectId, requesterId, 'pending']
    );
    return res.status(201).json(newRequest.rows[0]);
  } catch (err) {
    console.error("CREATE REQUEST ERROR:", err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Get all requests for projects owned by the current user
exports.getRequestsForMyProjects = async (req, res) => {
  const ownerId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT ar.*, p.title as "projectTitle", u.email as "requesterEmail"
       FROM "AccessRequests" ar
       JOIN "Projects" p ON ar."projectId" = p."projectId"
       JOIN "Users" u ON ar."requesterId" = u."userId"
       WHERE p."ownerId" = $1`,
      [ownerId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET MY REQUESTS ERROR:", err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
// Respond to an access request (approve/deny)
exports.respondToRequest = async (req, res) => {
  const ownerId = req.user.userId;
  const { requestId } = req.params;
  const { status } = req.body;

  if (!['approved', 'denied'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  try {
    const check = await pool.query(
      `SELECT p."ownerId" FROM "AccessRequests" ar
       JOIN "Projects" p ON ar."projectId" = p."projectId"
       WHERE ar."requestId" = $1`,
      [requestId]
    );
    if (check.rows.length === 0 || check.rows[0].ownerId !== ownerId) {
      return res.status(403).json({ message: 'Not authorized to respond to this request.' });
    }
    const updatedRequest = await pool.query(
      'UPDATE "AccessRequests" SET status = $1 WHERE "requestId" = $2 RETURNING *',
      [status, requestId]
    );
    return res.status(200).json(updatedRequest.rows[0]);
  } catch (err) {
    console.error("RESPOND TO REQUEST ERROR:", err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
// Add this entire function to your requestController.js file

exports.getMySentRequests = async (req, res) => {
  const requesterId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT ar.*, p.title as "projectTitle"
       FROM "AccessRequests" ar
       JOIN "Projects" p ON ar."projectId" = p."projectId"
       WHERE ar."requesterId" = $1`,
      [requesterId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET MY SENT REQUESTS ERROR:", err);
    return res.status(500).json({ message: 'Server error.' });
  }
};