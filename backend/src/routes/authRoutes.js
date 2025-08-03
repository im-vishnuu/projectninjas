const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator'); // Import body for validation

router.post(
  '/register',
  [
    // Validation chain for registration
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  ],
  authController.register
);
router.post('/login', authController.login);

module.exports = router;