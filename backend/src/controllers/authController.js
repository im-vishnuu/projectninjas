const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// It's critical that this is loaded from a .env file in a real app
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secure_random_jwt_secret_1234567890';
const { validationResult } = require('express-validator');
// Register a new user and return a token immediately
exports.register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const userCheck = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user and get their ID back
    const newUserResult = await pool.query(
      'INSERT INTO "Users" (email, "passwordHash") VALUES ($1, $2) RETURNING "userId", email',
      [email, hashedPassword]
    );
    
    const newUser = newUserResult.rows[0];

    // --- NEW LOGIC: Create and send token directly ---
    const token = jwt.sign({ userId: newUser.userId, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        userId: newUser.userId,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const userResult = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    
    // Return the user object along with the token
    return res.status(200).json({ 
        token, 
        user: {
            userId: user.userId,
            email: user.email
        }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};