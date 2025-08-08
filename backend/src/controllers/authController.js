const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secure_secret';

// Register a new user
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const userCheck = await pool.query('SELECT "userId" FROM "Users" WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: 'A user with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUserResult = await pool.query(
            'INSERT INTO "Users" (email, "passwordHash") VALUES ($1, $2) RETURNING "userId", email',
            [email, passwordHash]
        );
        
        const newUser = newUserResult.rows[0];
        const token = jwt.sign({ userId: newUser.userId, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });

        return res.status(201).json({ token, user: newUser });

    } catch (err) {
        console.error('REGISTRATION ERROR:', err);
        return res.status(500).json({ message: 'Server error during registration.' });
    }
};

// Login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;
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
        
        const userForFrontend = {
            userId: user.userId,
            email: user.email
        };
        
        return res.status(200).json({ token, user: userForFrontend });

    } catch (err) {
        console.error('LOGIN ERROR:', err);
        return res.status(500).json({ message: 'Server error during login.' });
    }
};