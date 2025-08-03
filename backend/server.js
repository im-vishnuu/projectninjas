require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./src/config/db');
const authMiddleware = require('./src/middleware/authMiddleware'); // Import the auth middleware

const app = express();
const PORT = 5000;
// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/project_uploads', express.static(path.join(__dirname, 'project_uploads')));
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);


// --- Combined Controller & Routes Logic ---

// GET /api/projects - Get all projects (Public)
const getAllProjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Projects"');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("GET ALL PROJECTS ERROR:", err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/projects/:id - Get a single project (Public)
const getProjectById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM "Projects" WHERE "projectId" = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("GET PROJECT BY ID ERROR:", err);
        return res.status(500).json({ message: 'Server error.' });
    }
};

// POST /api/projects - Create a new project (Protected)
const createProject = async (req, res) => {
  const { title, abstract, keywords } = req.body;
  const ownerId = req.user.userId; // Get user ID from the token via authMiddleware
  if (!title || !abstract || !keywords) {
    return res.status(400).json({ message: 'Title, abstract, and keywords are required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO "Projects" (title, abstract, keywords, "ownerId") VALUES ($1, $2, $3, $4) RETURNING *',
      [title, abstract, keywords, ownerId]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/projects/:id - Update a project (Protected)
const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, abstract, keywords } = req.body;
    const ownerId = req.user.userId;
    try {
        const projectResult = await pool.query('SELECT "ownerId" FROM "Projects" WHERE "projectId" = $1', [id]);
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        if (projectResult.rows[0].ownerId !== ownerId) {
            return res.status(403).json({ message: 'You are not authorized to edit this project.' });
        }
        const updateResult = await pool.query(
            `UPDATE "Projects" SET title = $1, abstract = $2, keywords = $3 WHERE "projectId" = $4 RETURNING *`,
            [title, abstract, keywords, id]
        );
        return res.status(200).json(updateResult.rows[0]);
    } catch (err) {
        console.error("UPDATE PROJECT ERROR:", err);
        return res.status(500).json({ message: 'Server error while updating project.' });
    }
};

// --- Define the Project Router ---
const projectRouter = express.Router();
projectRouter.get('/', getAllProjects);
projectRouter.get('/:id', getProjectById);
projectRouter.post('/', authMiddleware, createProject); // This route is now protected
projectRouter.put('/:id', authMiddleware, updateProject); // This route is now protected

// --- Use the Routers ---



app.get('/', (req, res) => {
  res.json({ message: "ProjectNinjas API is running" });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});