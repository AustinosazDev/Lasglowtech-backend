// index.js
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(__dirname, '.env.production') });
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');

const config = require('./config');
const { ensureTables } = require('./bootstrap');
const fileUpload = require('./middlewares/upload'); // for /upload/files route

const postRoutes = require('./routes/posts.js');

const contactRoutes = require('./routes/contacts.js');
const subscribRoutes = require('./routes/subscribe.js');
const paymentRoutes = require('./routes/payments.js');
const userRoutes = require('./routes/users.js');
const catalogueRoutes = require('./routes/catalogues.js');
const adminRoutes = require('./routes/admin.js');
const careerRoutes = require('./routes/careers.js');
const lmsRoutes = require('./routes/lms.js');



const { port, allowedDomains } = config;

const app = express();

// 1️⃣ CORS & Middlewares
app.use(cors({
  origin: allowedDomains,
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 2️⃣ Environment detection
const isDev = process.env.NODE_ENV !== 'production';

// 3️⃣ Static serving of production uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4️⃣ Utility to ensure a directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 5️⃣ Multer storage (images only; files use fileUpload middleware)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = file.originalname.toLowerCase().split('.').pop();

    // base folder differs by env
    // In development this project uses `Lasglowtech-website/public/upload`.
    const base = path.join(__dirname, 'uploads');

    const sub = ext === 'pdf' ? 'files' : 'images';
    const uploadDir = path.join(base, sub);

    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// 6️⃣ Multer instance for image uploads
// 6️⃣ Multer instance for image uploads
const imageUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    cb(null, allowed.test(ext));
  }
});

// 7️⃣ Routes for uploadsn only
app.post(
  '/upload/images',
  imageUpload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.status(200).json(req.file.filename);
  }
);


// 8️⃣ API routes
app.use('/posts', postRoutes);

app.use('/subscribe', subscribRoutes);
app.use('/contacts', contactRoutes);
app.use('/payments', paymentRoutes);
app.use('/users', userRoutes);
app.use('/catalogues', catalogueRoutes);
app.use('/admin', adminRoutes);
app.use('/careers', careerRoutes);
app.use('/lms', lmsRoutes);


// health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// 9️⃣ Start the server with graceful shutdown (production / PM2)
let server;
function startServer() {
  const host = process.env.HOST || '0.0.0.0';
  server = app.listen(port, host, () => {
    console.log(`Server listening on ${host}:${port} (dev: ${isDev})`);
  });
}

function shutdown(signal) {
  console.log(`${signal} received, closing server...`);
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

ensureTables()
  .then(() => {
    console.log('Database tables ensured!');
  })
  .catch((error) => {
    console.error('Bootstrap failed:', error.message);
    // Do NOT exit, just continue
  })
  .finally(() => {
    startServer();
  });