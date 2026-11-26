require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Assignment requirement: users are stored in an in-memory array.
const users = [];

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const createToken = (user) =>
  jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

// POST /register
app.post('/register', async (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  const cleanUsername = username.trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const existingUser = users.find(
    (user) => user.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({ message: 'Username is already registered.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: String(Date.now()) + String(Math.floor(Math.random() * 10000)),
      username: cleanUsername,
      password: hashedPassword
    };
    users.push(user);

    return res.status(201).json({
      message: 'Registration successful. Please log in.'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not register user.' });
  }
});

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = users.find(
    (item) => item.username.toLowerCase() === username.trim().toLowerCase()
  );

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const token = createToken(user);
  return res.status(200).json({
    message: 'Login successful.',
    token,
    username: user.username
  });
});

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token is required.' });
  }

  jwt.verify(token, JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = decoded;
    next();
  });
};

// GET /protected
app.get('/protected', authenticateToken, (req, res) => {
  return res.status(200).json({
    message: `Welcome ${req.user.username}! You accessed the protected route.`,
    user: {
      id: req.user.userId,
      username: req.user.username
    }
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'JWT Auth API is running.' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON request body.' });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal server error.' });
});

if (!JWT_SECRET) {
  console.error('JWT_SECRET is missing. Add it to backend/.env');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Authentication API running at http://localhost:${PORT}`);
});
