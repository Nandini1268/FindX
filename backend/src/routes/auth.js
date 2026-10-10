const express = require('express');
const bcrypt = require('bcryptjs');
const { dbRun, dbGet, dbAll } = require('../db');
const upload = require('../middleware/upload');

const router = express.Router();

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { username, display_name, email, password, bio, category } = req.body;

    if (!username || !display_name || !email || !password) {
      return res.status(400).json({ error: 'Username, display name, email, and password are required.' });
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be 3–30 characters, letters/numbers/underscores only.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const byUser = await dbGet('SELECT id FROM users WHERE username = ?', [username]);
    if (byUser) return res.status(409).json({ error: 'Username already taken.' });
    const byEmail = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (byEmail) return res.status(409).json({ error: 'Email already registered.' });

    const password_hash = await bcrypt.hash(password, 12);
    let photo_url = '';
    if (req.file) photo_url = `/uploads/${req.file.filename}`;

    const result = await dbRun(
      'INSERT INTO users (username, display_name, email, password_hash, bio, photo_url, category) VALUES (?,?,?,?,?,?,?)',
      [username, display_name, email, password_hash, bio || '', photo_url, category || 'User']
    );

    const newUser = await dbGet(
      'SELECT id, username, display_name, email, bio, photo_url, category, followers, following, posts, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    res.status(201).json({ message: 'Account created successfully!', user: newUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });

    const user = await dbGet(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    if (!user) return res.status(401).json({ error: 'Invalid username or password.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid username or password.' });

    req.session.userId = user.id;
    req.session.username = user.username;

    const { password_hash, ...safeUser } = user;
    res.json({ message: 'Logged in successfully!', user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed.' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully.' });
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated.' });
  try {
    const user = await dbGet(
      'SELECT id, username, display_name, email, bio, photo_url, category, followers, following, posts, created_at FROM users WHERE id = ?',
      [req.session.userId]
    );
    if (!user) return res.status(401).json({ error: 'Session invalid.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
