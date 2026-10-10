const express = require('express');
const { dbRun, dbGet, dbAll } = require('../db');
const upload = require('../middleware/upload');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// ── GET /api/users ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    let sql = 'SELECT id, username, display_name, email, bio, photo_url, category, followers, following, posts, created_at FROM users';
    const params = [];
    const conditions = [];

    if (category && category !== 'All') { conditions.push('category = ?'); params.push(category); }
    if (search) {
      conditions.push('(username LIKE ? OR display_name LIKE ? OR bio LIKE ?)');
      const q = `%${search}%`; params.push(q, q, q);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const users = await dbAll(sql, params);
    res.json({ users, total: users.length });
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ── PUT /api/users/me ─────────────────────────────────────────
router.put('/me', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const { display_name, bio, category } = req.body;
    const userId = req.session.userId;
    const current = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!current) return res.status(404).json({ error: 'User not found.' });

    let photo_url = current.photo_url;
    if (req.file) photo_url = `/uploads/${req.file.filename}`;

    await dbRun(
      'UPDATE users SET display_name=?, bio=?, photo_url=?, category=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [display_name || current.display_name, bio !== undefined ? bio : current.bio, photo_url, category || current.category, userId]
    );
    const updated = await dbGet(
      'SELECT id, username, display_name, email, bio, photo_url, category, followers, following, posts, created_at FROM users WHERE id = ?',
      [userId]
    );
    res.json({ message: 'Profile updated!', user: updated });
  } catch (err) {
    console.error('PUT /users/me error:', err);
    res.status(500).json({ error: 'Update failed.' });
  }
});

// ── GET /api/users/:username ──────────────────────────────────
router.get('/:username', async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, username, display_name, email, bio, photo_url, category, followers, following, posts, created_at FROM users WHERE username = ?',
      [req.params.username]
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// ── POST /api/users ───────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  const bcrypt = require('bcryptjs');
  try {
    const { username, display_name, email, password, bio, category } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields.' });
    const hash = await bcrypt.hash(password, 12);
    const result = await dbRun(
      'INSERT INTO users (username, display_name, email, password_hash, bio, category) VALUES (?,?,?,?,?,?)',
      [username, display_name || username, email, hash, bio || '', category || 'User']
    );
    res.status(201).json({ id: result.lastID, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/users/:username ───────────────────────────────
router.delete('/:username', requireAuth, async (req, res) => {
  try {
    const user = await dbGet('SELECT id FROM users WHERE username = ?', [req.params.username]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.id !== req.session.userId) return res.status(403).json({ error: 'Forbidden.' });
    await dbRun('DELETE FROM users WHERE id = ?', [user.id]);
    req.session.destroy(() => {});
    res.json({ message: 'Account deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed.' });
  }
});

// ── POST /api/users/:username/follow ─────────────────────────
router.post('/:username/follow', requireAuth, async (req, res) => {
  try {
    const target = await dbGet('SELECT id FROM users WHERE username = ?', [req.params.username]);
    if (!target) return res.status(404).json({ error: 'User not found.' });
    if (target.id === req.session.userId) return res.status(400).json({ error: 'Cannot follow yourself.' });

    const existing = await dbGet('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?', [req.session.userId, target.id]);
    if (existing) {
      await dbRun('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?', [req.session.userId, target.id]);
      await dbRun('UPDATE users SET followers = MAX(0, followers - 1) WHERE id = ?', [target.id]);
      await dbRun('UPDATE users SET following = MAX(0, following - 1) WHERE id = ?', [req.session.userId]);
      return res.json({ following: false });
    } else {
      await dbRun('INSERT INTO follows (follower_id, followee_id) VALUES (?,?)', [req.session.userId, target.id]);
      await dbRun('UPDATE users SET followers = followers + 1 WHERE id = ?', [target.id]);
      await dbRun('UPDATE users SET following = following + 1 WHERE id = ?', [req.session.userId]);
      return res.json({ following: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Follow action failed.' });
  }
});

module.exports = router;
