// server.js — Express API server (port 3001)
const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const db       = require('./database');

const app  = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static(__dirname));

// ── Health check ────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ══════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════

// Sign up — create new user
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing)
    return res.status(409).json({ error: 'An account with this email already exists.' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(name, email, hashed);

    res.json({ success: true, user: { id: result.lastInsertRowid, name, email } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Sign in — verify credentials
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user)
    return res.status(401).json({ error: 'No account found with this email.' });

  try {
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Incorrect password.' });

    // Return user info (no password)
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Sign in failed. Please try again.' });
  }
});

// Get all users — admin view (no passwords)
app.get('/api/users', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, name, email, created_at FROM users ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ══════════════════════════════════════════════════
//  ENQUIRIES
// ══════════════════════════════════════════════════

app.post('/api/enquiry', (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email)
    return res.status(400).json({ error: 'Name and email are required.' });

  try {
    const result = db.prepare(
      'INSERT INTO enquiries (name, email, phone, message) VALUES (?, ?, ?, ?)'
    ).run(name, email, phone || '', message || '');

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('Enquiry error:', err);
    res.status(500).json({ error: 'Failed to save enquiry.' });
  }
});

app.get('/api/enquiries', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM enquiries ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch enquiries.' });
  }
});

// ══════════════════════════════════════════════════
//  PG LISTINGS
// ══════════════════════════════════════════════════

app.post('/api/list-pg', (req, res) => {
  const {
    owner_name, email, phone, pg_name,
    area, address, type, price,
    amenities, rooms, description
  } = req.body;

  if (!owner_name || !email || !phone || !pg_name || !area || !address || !type || !price)
    return res.status(400).json({ error: 'Please fill in all required fields.' });

  try {
    const result = db.prepare(`
      INSERT INTO pg_listings
        (owner_name, email, phone, pg_name, area, address, type, price, amenities, rooms, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      owner_name, email, phone, pg_name,
      area, address, type, Number(price),
      Array.isArray(amenities) ? amenities.join(',') : (amenities || ''),
      Number(rooms) || 0,
      description || ''
    );
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('PG listing error:', err);
    res.status(500).json({ error: 'Failed to save listing.' });
  }
});

app.get('/api/listings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM pg_listings ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings.' });
  }
});

// ── Start ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Odyssey API running → http://localhost:${PORT}`);
});
