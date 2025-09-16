const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';

router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    if (username) {
      const usernameTaken = await User.findOne({ username: username.trim() });
      if (usernameTaken) return res.status(409).json({ error: 'Username already taken' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase().trim(), passwordHash, username: (username||'').trim() });
    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ token, user: { _id: user._id, email: user.email, username: user.username } });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { _id: user._id, email: user.email, username: user.username } });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;

// Profile routes (after export for clarity with CommonJS)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    let payload; try { payload = jwt.verify(token, JWT_SECRET) } catch { return res.status(401).json({ error: 'Invalid token' }); }
    const user = await User.findById(payload.sub).select('_id email name bio username');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ _id: user._id, email: user.email, name: user.name || '', bio: user.bio || '', username: user.username || '' });
  } catch (err) {
    console.error('Profile get error', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    let payload; try { payload = jwt.verify(token, JWT_SECRET) } catch { return res.status(401).json({ error: 'Invalid token' }); }
    const { name, bio, username } = req.body;
    const update = { name: (name||'').trim(), bio: (bio||'').trim() };
    if (username && username.trim()) {
      const exists = await User.findOne({ username: username.trim(), _id: { $ne: payload.sub } });
      if (exists) return res.status(409).json({ error: 'Username already taken' });
      update.username = username.trim();
    }
    const user = await User.findByIdAndUpdate(payload.sub, update, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ _id: user._id, email: user.email, name: user.name || '', bio: user.bio || '', username: user.username || '' });
  } catch (err) {
    console.error('Profile update error', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


