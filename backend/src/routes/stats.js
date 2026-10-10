const express = require('express');
const { dbAll, dbRun, dbGet } = require('../db');

const router = express.Router();

// ── GET /api/stats ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const countRow = await dbGet('SELECT COUNT(*) as c FROM users');
    const categories = await dbAll('SELECT category, COUNT(*) as count FROM users GROUP BY category ORDER BY count DESC');
    const recentSearches = await dbAll('SELECT query, result, created_at FROM search_history ORDER BY created_at DESC LIMIT 10');
    const searchCount = await dbGet('SELECT COUNT(*) as c FROM search_history');

    res.json({
      total_users: countRow.c,
      total_searches: searchCount.c,
      table_size: 16,
      categories,
      recent_searches: recentSearches,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

module.exports = router;
