const express = require('express');
const jsonServer = require('json-server');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
//stripe payment portal
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const jwt = require('jsonwebtoken');
const multer = require('multer');

const port = process.env.PORT || 3500;
const DB_FILE = path.join(__dirname, 'db.json');
const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️ STRIPE_SECRET_KEY missing or empty in backend/.env');
  process.exit(1);
}




function ensureDb() {
  if (!fs.existsSync(DB_FILE)) {
    let seed = { reservations: [] };
    const seedPath = path.join(__dirname, 'data.cjs');
    if (fs.existsSync(seedPath)) {
      const dataFactory = require('./data.cjs');
      seed = dataFactory();
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    console.log('Initialized db.json');
  }
}
ensureDb();

const app = express();
app.use(cors({ exposedHeaders: ['Authorization', 'X-Total-Count'] }));
app.use(express.json());
//Login
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ sub: username, role: 'admin' }, SECRET, { expiresIn: '4h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});



function authGuard(req, res, next) {
  const write = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!write.includes(req.method)) return next();

  // ✅ Treat /api/tickets as open (no token required)
  const fullPath = req.originalUrl || (req.baseUrl + req.path) || req.path;
   // ✅ public writes
   if (fullPath.startsWith('/api/tickets') || fullPath.startsWith('/api/checkout/session')) {
    return next();
  }


  // Otherwise require a valid Bearer token
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  try {
    if (!token) throw new Error('no token');
    jwt.verify(token, SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, Date.now() + '_' + safe);
  }
});
const upload = multer({ storage });

app.post('/upload', authGuard, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});
app.use('/uploads', express.static(uploadsDir));

const router = jsonServer.router(DB_FILE);
const middlewares = jsonServer.defaults();

// Create Stripe Checkout Session (public)
app.post('/api/checkout/session', async (req, res) => {
  try {
    const { reservationId, name, email, quantity } = req.body || {};
    const UNIT_AMOUNT = 2500; // $25.00 CAD per ticket

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: { name: `Ticket – ${name || 'Reservation #' + reservationId}` },
            unit_amount: UNIT_AMOUNT,
          },
          quantity: Math.max(1, Number(quantity) || 1),
        },
      ],
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cancel',
      metadata: { reservationId: String(reservationId || '') },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Stripe session error' });
  }
});

app.use('/api', middlewares, authGuard, router);

app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
