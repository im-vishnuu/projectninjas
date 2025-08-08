const pool = require('../config/db');
const fs = require('fs/promises'); 
const path = require('path');
const fsSync = require('fs');
const upload = require('../middleware/uploadMiddleware');
const sharp = require('sharp');
const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');

const uploadDir = path.join(__dirname, '../../project_uploads');
if (!fsSync.existsSync(uploadDir)) {
  // FIX: Corrected typo from fs.SyncmkdirSync to fsSync.mkdirSync
  fsSync.mkdirSync(uploadDir, { recursive: true }); 
}



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
    const userId = req.user.userId;

    try {
        // 1. Get file details, project ID, and the project owner's ID
        const fileResult = await pool.query(
            `SELECT pf."filePath", pf."fileName", p."ownerId", p."projectId"
             FROM "ProjectFiles" pf
             JOIN "Projects" p ON pf."projectId" = p."projectId"
             WHERE pf."fileId" = $1`,
            [fileId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({ message: 'File not found.' });
        }

        const file = fileResult.rows[0];
        let authorized = false;

        // --- THIS IS THE CORRECTED AUTHORIZATION LOGIC ---

        // 2. First, check if the user is the project owner
        if (file.ownerId === userId) {
            authorized = true;
        } else {
            // 3. If not the owner, then check for an approved access request
            const requestResult = await pool.query(
                `SELECT "requestId" FROM "AccessRequests"
                 WHERE "projectId" = $1 AND "requesterId" = $2 AND status = 'approved'`,
                [file.projectId, userId]
            );
            if (requestResult.rows.length > 0) {
                authorized = true;
            }
        }

        // 4. Send the file only if the user is authorized
        if (authorized) {
            const absolutePath = path.join(__dirname, '..', '..', file.filePath);
            res.download(absolutePath, file.fileName);
        } else {
            // This is the error User B is getting, because the check was failing
            return res.status(403).json({ message: 'You are not authorized to download this file.' });
        }
    } catch (err) {
        console.error("DOWNLOAD FILE ERROR:", err);
        res.status(500).json({ message: 'Server error.' });
    }
};


// ... (your requires at the top of the file)

// ... (your requires at the top of the file)


exports.uploadProjectFile = [
  upload.single('projectFile'),
  async (req, res) => {
    const { id: projectId } = req.params;
    let { fileType } = req.body; // Use 'let' as we may change it
    const ownerId = req.user.userId;

    try {
      // ... (Authorization and file checks remain the same)
      if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
      
      const { originalname, path: tempFilePath, mimetype } = req.file;
      let { filename } = req.file; // Use 'let' for filename
      const watermarkText = "ProjectNinjas";
      
      let finalFileBuffer;

      // --- NEW LOGIC: CONVERT IMAGES TO PDF ---
      if (mimetype.startsWith('image/')) {
        console.log(`[CONVERT & WATERMARK]: Converting image ${filename} to PDF.`);
        
        // 1. Convert the image to a PDF buffer
        const imageBuffer = await fs.readFile(tempFilePath);
        const image = await sharp(imageBuffer).toBuffer(); // Ensure it's a standard format
        const pdfDoc = await PDFDocument.create();
        const embeddedImage = await pdfDoc.embedJpg(image);
        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, { x: 0, y: 0 });

        // 2. Now, apply the same PDF watermarking logic
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        for (const p of pages) {
            const { width, height } = p.getSize();
            for (let i = 0; i < 5; i++) {
                p.drawText(watermarkText, {
                    x: (width / 4) * (i % 2),
                    y: (height / 5) * i,
                    font: helveticaFont, size: 50, color: rgb(0.5, 0.5, 0.5), opacity: 0.5, rotate: degrees(45)
                });
            }
        }
        
        finalFileBuffer = await pdfDoc.save();
        fileType = 'Documentation'; // Update fileType since it's now a PDF
        filename = `${path.parse(filename).name}.pdf`; // Change file extension to .pdf
        
      } else if (mimetype === 'application/pdf') {
        // ... (The PDF watermarking logic remains the same)
        console.log(`[WATERMARK]: Applying PDF watermark to ${filename}`);
        const existingPdfBytes = await fs.readFile(tempFilePath);
        // Watermark and save to finalFileBuffer
        // (Same logic as before, just outputting to the buffer)
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();
            for (let i = 0; i < 5; i++) {
                page.drawText(watermarkText, { x: (width / 4) * (i % 2), y: (height / 5) * i, font: helveticaFont, size: 50, color: rgb(0.5, 0.5, 0.5), opacity: 0.5, rotate: degrees(45) });
            }
        }
        finalFileBuffer = await pdfDoc.save();
      }

      // 3. Save the final processed file
      const finalRelativePath = path.join('project_uploads', filename);
      const finalAbsolutePath = path.join(__dirname, '..', '..', finalRelativePath);
      
      if (finalFileBuffer) {
        await fs.writeFile(finalAbsolutePath, finalFileBuffer);
        await fs.unlink(tempFilePath); // Delete the original temporary upload
      } else {
        // If it was another file type (like .zip), just move it
        await fs.rename(tempFilePath, finalAbsolutePath);
      }
      
      // 4. Save the final path to the database
      const newFile = await pool.query(
        'INSERT INTO "ProjectFiles" ("fileName", "filePath", "fileType", "projectId") VALUES ($1, $2, $3, $4) RETURNING *',
        [path.parse(originalname).name + path.extname(filename), finalRelativePath, fileType || 'Other', projectId]
      );

      res.status(201).json(newFile.rows[0]);

    } catch (err) {
      console.error("UPLOAD FILE ERROR:", err);
      if (req.file) { await fs.unlink(req.file.path).catch(e => console.error("Failed to clean up file", e)); }
      res.status(500).json({ message: 'Server error during file upload.' });
    }
  }
];
// DELETE /api/projects/files/:fileId
exports.deleteProjectFile = async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user.userId;

  try {
    // 1. Get file details and verify ownership
    const fileResult = await pool.query(
      `SELECT
         pf."filePath",
         p."ownerId"
       FROM "ProjectFiles" AS pf
       JOIN "Projects" AS p
         ON pf."projectId" = p."projectId"
       WHERE pf."fileId" = $1`,
      [fileId]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ message: 'File not found.' });
    }
    if (fileResult.rows[0].ownerId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this file.' });
    }

    // --- THIS IS THE FIX ---
    // Get the filePath from the database result before you use it.
    const { filePath } = fileResult.rows[0];

    // 2. Delete the physical file from the server
    const absolutePath = path.join(__dirname, '..', '..', filePath);
    await fs.unlink(absolutePath);

    // 3. Delete the file record from the database
    await pool.query('DELETE FROM "ProjectFiles" WHERE "fileId" = $1', [fileId]);

    res.status(200).json({ message: 'File deleted successfully.' });
  } catch (err) {
    console.error("DELETE FILE ERROR:", err);
    res.status(500).json({ message: 'Server error.' });
  }
};
// DELETE /api/projects/:projectId
exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;

  const client = await pool.connect(); // Use a client for transaction support

  try {
    // 1. Authorization: Verify the user is the project owner
    const projectResult = await client.query(
      'SELECT "ownerId" FROM "Projects" WHERE "projectId" = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    if (projectResult.rows[0].ownerId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this project.' });
    }

    // Begin transaction
    await client.query('BEGIN');

    // 2. Get all associated files to delete them from the server
    const filesResult = await client.query(
      'SELECT "filePath" FROM "ProjectFiles" WHERE "projectId" = $1',
      [projectId]
    );

    // Delete each physical file
    for (const file of filesResult.rows) {
      const absolutePath = path.join(__dirname, '..', '..', file.filePath);
      try {
        await fs.unlink(absolutePath);
      } catch (fileErr) {
        // Log error if a file is missing, but don't stop the whole process
        console.warn(`Could not delete file ${absolutePath}, it may have already been removed.`);
      }
    }

    // 3. Delete all associated records from the database
    // Note: If you set up "ON DELETE CASCADE" in your database schema, these first two queries are not needed.
    await client.query('DELETE FROM "AccessRequests" WHERE "projectId" = $1', [projectId]);
    await client.query('DELETE FROM "ProjectFiles" WHERE "projectId" = $1', [projectId]);
    
    // Finally, delete the project itself
    await client.query('DELETE FROM "Projects" WHERE "projectId" = $1', [projectId]);

    // Commit the transaction
    await client.query('COMMIT');

    res.status(200).json({ message: 'Project and all associated files have been deleted.' });

  } catch (err) {
    await client.query('ROLLBACK'); // Roll back changes if any step fails
    console.error("DELETE PROJECT ERROR:", err);
    res.status(500).json({ message: 'Server error during project deletion.' });
  } finally {
    client.release(); // Release the client back to the pool
  }
};