const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const { dbAll, dbGet, dbRun } = require('../db');
require('dotenv').config();

const router = express.Router();
const C_ENGINE = path.resolve(process.env.C_ENGINE_PATH || './c_engine/hash_search.exe');

function runCEngine(inputJson) {
  return new Promise((resolve, reject) => {
    const proc = spawn(C_ENGINE, [], { timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code !== 0) { reject(new Error(`C engine exited ${code}: ${stderr}`)); return; }
      try { resolve(JSON.parse(stdout)); }
      catch (e) { reject(new Error(`Parse error: ${stdout.slice(0, 300)}`)); }
    });
    proc.on('error', (err) => reject(err));
    proc.stdin.write(JSON.stringify(inputJson));
    proc.stdin.end();
  });
}

// ── POST /api/search ─────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== 'string') return res.status(400).json({ error: 'Username is required.' });

    const target = username.trim();
    if (target.length < 1 || target.length > 50) return res.status(400).json({ error: 'Username must be 1–50 characters.' });

    const users = await dbAll('SELECT id, username, display_name, email, bio, photo_url, category FROM users ORDER BY id ASC');

    const engineInput = {
      target,
      users: users.map(u => ({ id: u.id, username: u.username, display_name: u.display_name, email: u.email, bio: u.bio, photo_url: u.photo_url || '' })),
    };

    const result = await runCEngine(engineInput);

    // Log search
    try {
      await dbRun('INSERT INTO search_history (user_id, query, result) VALUES (?,?,?)',
        [req.session.userId || null, target, result.search?.result || 'not_found']);
    } catch (_) {}

    // Enrich found user with full DB details
    if (result.search?.result === 'found' && result.search?.user) {
      const fullUser = await dbGet(
        'SELECT id, username, display_name, email, bio, photo_url, category, followers, following, posts, created_at FROM users WHERE username = ?',
        [result.search.user.username]
      );
      if (fullUser) result.search.user = fullUser;
    }

    res.json(result);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
});

// ── POST /api/search/compare ──────────────────────────────────
router.post('/compare', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required.' });

    const users = await dbAll('SELECT id, username, display_name, email, bio, photo_url FROM users ORDER BY id ASC');
    const result = await runCEngine({ target: username.trim(), users: users.map(u => ({ ...u, photo_url: u.photo_url || '' })) });

    res.json({
      hash_comparisons: result.search?.comparisons || 0,
      linear_comparisons: result.linear_search?.comparisons || 0,
      total_users: users.length,
      bucket_index: result.search?.bucket_index,
      found: result.search?.result === 'found',
    });
  } catch (err) {
    console.error('Compare error:', err);
    res.status(500).json({ error: 'Comparison failed.' });
  }
});

module.exports = router;
