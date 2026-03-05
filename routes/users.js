const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const db = require('../db');
const { verifyToken } = require('../middlewares/auth');
const { sendPasswordResetEmail } = require('../utils/notifications');

const router = express.Router();

const jwtSecret = config.secret || process.env.JWT_SECRET || 'lasglowtech-dev-secret';

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
});

const getClientBaseUrl = () => {
  if (config.local_client_app && process.env.NODE_ENV !== 'production') {
    return config.local_client_app;
  }
  return config.remote_client_app || config.local_client_app || 'http://localhost:5173';
};

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields.' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const normalizedRole = (() => {
      const value = String(role || 'client').toLowerCase();
      if (value === 'student') return 'student';
      if (value === 'learner') return 'learner';
      if (value === 'talent') return 'talent';
      return 'client';
    })();

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, normalizedRole]
    );

    const user = {
      id: result.insertId,
      username,
      email,
      role: normalizedRole,
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: config.expires_in || '7d',
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const cleanUser = sanitizeUser(user);
    const token = jwt.sign(
      { id: cleanUser.id, email: cleanUser.email, role: cleanUser.role },
      jwtSecret,
      {
        expiresIn: config.expires_in || '7d',
      }
    );

    return res.status(200).json({
      message: 'Login successful.',
      user: cleanUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const [rows] = await db.query('SELECT id, username, email FROM users WHERE email = ? LIMIT 1', [email]);

    if (!rows.length) {
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const user = rows[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.query('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0', [user.id]);
    await db.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at, used) VALUES (?, ?, ?, 0)',
      [user.id, tokenHash, expiresAt]
    );

    const resetUrl = `${getClientBaseUrl()}/auth/reset-password/${rawToken}`;
    await sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      resetUrl,
    });

    return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const [rows] = await db.query(
      `SELECT id, user_id, expires_at, used
       FROM password_resets
       WHERE token_hash = ?
       LIMIT 1`,
      [tokenHash]
    );

    if (!rows.length) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const resetRow = rows[0];
    const isExpired = new Date(resetRow.expires_at).getTime() < Date.now();
    if (resetRow.used || isExpired) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetRow.user_id]);
    await db.query('UPDATE password_resets SET used = 1 WHERE id = ?', [resetRow.id]);

    return res.status(200).json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, email, role FROM users WHERE id = ? LIMIT 1', [req.user.id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user: sanitizeUser(rows[0]) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
