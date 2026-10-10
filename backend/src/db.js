const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_PATH = path.resolve(process.env.DB_PATH || './findx.db');
let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH);
    db.serialize(() => {
      db.run('PRAGMA journal_mode = WAL');
      db.run('PRAGMA foreign_keys = ON');
    });
  }
  return db;
}

// Promise wrappers
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ── Sample users (Unsplash photos, licensed for free use) ────
const SAMPLE_USERS = [
  {
    username: 'alex_dev',
    display_name: 'Alex Rivera',
    email: 'alex@findx.dev',
    bio: 'Full-Stack Developer | React & Node.js enthusiast. Building cool products.',
    category: 'Developer',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    posts: 28,
    followers: 320,
    following: 210,
  },
  {
    username: 'sara_designs',
    display_name: 'Sara Patel',
    email: 'sara@findx.dev',
    bio: 'UI/UX Designer crafting beautiful interfaces. Figma lover.',
    category: 'Designer',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    posts: 42,
    followers: 850,
    following: 340,
  },
  {
    username: 'mike_creates',
    display_name: 'Mike Thompson',
    email: 'mike@findx.dev',
    bio: 'Content Creator & Filmmaker. Telling stories through video.',
    category: 'Creator',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=face',
    posts: 19,
    followers: 410,
    following: 195,
  },
  {
    username: 'priya_learns',
    display_name: 'Priya Sharma',
    email: 'priya@findx.dev',
    bio: 'CS Student | DSA & ML enthusiast. Always learning.',
    category: 'Student',
    photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face',
    posts: 15,
    followers: 290,
    following: 160,
  },
  {
    username: 'james_code',
    display_name: 'James Wilson',
    email: 'james@findx.dev',
    bio: 'Backend Engineer | Python & Go. Open source contributor.',
    category: 'Developer',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    posts: 34,
    followers: 620,
    following: 280,
  },
  {
    username: 'luna_art',
    display_name: 'Luna Chen',
    email: 'luna@findx.dev',
    bio: 'Digital Artist & Illustrator. Creating worlds with pixels.',
    category: 'Designer',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    posts: 56,
    followers: 980,
    following: 410,
  },
  {
    username: 'raj_student',
    display_name: 'Raj Kumar',
    email: 'raj@findx.dev',
    bio: 'Engineering Student | Competitive programmer. Problem solver.',
    category: 'Student',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    posts: 12,
    followers: 175,
    following: 130,
  },
  {
    username: 'emma_writes',
    display_name: 'Emma Johnson',
    email: 'emma@findx.dev',
    bio: 'Tech Writer & Content Creator. Making complex topics simple.',
    category: 'Creator',
    photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    posts: 23,
    followers: 510,
    following: 220,
  },
  {
    username: 'carlos_dev',
    display_name: 'Carlos Mendez',
    email: 'carlos@findx.dev',
    bio: 'Mobile Developer | Flutter & React Native. Building for billions.',
    category: 'Developer',
    photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    posts: 31,
    followers: 460,
    following: 205,
  },
  {
    username: 'aisha_design',
    display_name: 'Aisha Okafor',
    email: 'aisha@findx.dev',
    bio: 'Brand Designer | Typography & Color Theory. Visual storyteller.',
    category: 'Designer',
    photo_url: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=200&h=200&fit=crop&crop=face',
    posts: 27,
    followers: 390,
    following: 180,
  },
];

async function initialize() {
  // Create tables
  await dbRun(`CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    UNIQUE NOT NULL COLLATE NOCASE,
    display_name TEXT   NOT NULL,
    email       TEXT    UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT  NOT NULL,
    bio         TEXT    DEFAULT '',
    photo_url   TEXT    DEFAULT '',
    category    TEXT    DEFAULT 'User',
    followers   INTEGER DEFAULT 0,
    following   INTEGER DEFAULT 0,
    posts       INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER NOT NULL,
    followee_id INTEGER NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  await dbRun(`CREATE TABLE IF NOT EXISTS search_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    query       TEXT    NOT NULL,
    result      TEXT    DEFAULT 'not_found',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Update existing zero-stat rows if seeded previously
  const bcrypt = require('bcryptjs');
  const seedPassword = await bcrypt.hash('FindX2024!', 10);

  for (const u of SAMPLE_USERS) {
    const existing = await dbGet('SELECT id FROM users WHERE username = ?', [u.username]);
    if (!existing) {
      await dbRun(
        'INSERT INTO users (username, display_name, email, password_hash, bio, photo_url, category, posts, followers, following) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [u.username, u.display_name, u.email, seedPassword, u.bio, u.photo_url, u.category, u.posts, u.followers, u.following]
      );
    } else {
      await dbRun(
        'UPDATE users SET posts = ?, followers = ?, following = ? WHERE id = ? AND (followers = 0 OR posts = 0)',
        [u.posts, u.followers, u.following, existing.id]
      );
    }
  }

  console.log(`✅ Seeded & updated sample user stats`);
  console.log(`✅ Database initialized at ${DB_PATH}`);
}

module.exports = { getDb, initialize, dbRun, dbGet, dbAll };
