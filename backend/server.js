require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
// Serve static files from the uploads directory
app.use('/project_uploads', express.static(path.join(__dirname, 'project_uploads')));

// --- Routes ---
// Import your route handlers from the /src/routes folder
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const requestRoutes = require('./src/routes/requestRoutes');

// Tell the app to use these route files for specific API paths
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes); // This correctly points to the file we've been working on
app.use('/api/requests', requestRoutes);

// A simple root route to confirm the API is running
app.get('/', (req, res) => {
  res.json({ message: "ProjectNinjas API is running successfully." });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});