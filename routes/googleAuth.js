const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

const router = express.Router();

const jwtSecret = config.secret || process.env.JWT_SECRET || 'lasglowtech-dev-secret';
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri =
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.REMOTE_SERVER_API || `http://localhost:${config.port || 5000}`}/auth/google/callback`;

const getClientBaseUrl = () => {
  if (config.local_client_app && process.env.NODE_ENV !== 'production') {
    return config.local_client_app;
  }
  return config.remote_client_app || config.local_client_app || 'http://localhost:5173';
};

const failRedirect = (res, reason) => {
  return res.redirect(`${getClientBaseUrl()}/auth/login?error=${encodeURIComponent(reason)}`);
};

// GET /auth/google — start Google OAuth flow
router.get('/', (req, res) => {
  if (!clientId || !clientSecret) {
    return res.status(500).json({ message: 'Google login is not configured on the server.' });
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('google_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// GET /auth/google/callback — exchange code, upsert user, issue JWT, redirect to frontend
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) return failRedirect(res, 'google_denied');
    if (!code) return failRedirect(res, 'missing_code');

    const savedState = req.cookies?.google_oauth_state;
    res.clearCookie('google_oauth_state');
    if (!savedState || savedState !== state) {
      return failRedirect(res, 'invalid_state');
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) return failRedirect(res, 'token_exchange_failed');
    const tokenData = await tokenRes.json();

    const userinfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userinfoRes.ok) return failRedirect(res, 'userinfo_failed');
    const profile = await userinfoRes.json();

    if (!profile.email) return failRedirect(res, 'no_email');

    const email = String(profile.email).toLowerCase();
    let [rows] = await db.query('SELECT id, username, email, role FROM users WHERE email = ? LIMIT 1', [email]);

    let user;
    if (rows.length) {
      user = rows[0];
    } else {
      let username = (profile.name || email.split('@')[0] || 'user')
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 60) || 'user';

      // ensure username uniqueness
      const [nameClash] = await db.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
      if (nameClash.length) username = `${username}${crypto.randomBytes(3).toString('hex')}`;

      // Google users have no local password; store an unusable random hash
      const unusablePassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const [result] = await db.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, unusablePassword, 'client']
      );
      user = { id: result.insertId, username, email, role: 'client' };
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: config.expires_in || '7d',
    });

    const payload = encodeURIComponent(JSON.stringify({ token, user }));
    return res.redirect(`${getClientBaseUrl()}/auth/callback?session=${payload}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return failRedirect(res, 'server_error');
  }
});

module.exports = router;
