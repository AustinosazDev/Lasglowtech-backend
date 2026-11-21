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
const { isEnabled: cloudinaryEnabled, uploadBuffer: cloudinaryUpload } = require('./utils/cloudinary');

const postRoutes = require('./routes/posts.js');
const blogRoutes = require('./routes/blog.js');
const newsletterRoutes = require('./routes/newsletters.js');
const { processScheduledNewsletters } = require('./controllers/newsletters');

const contactRoutes = require('./routes/contacts.js');
const subscribRoutes = require('./routes/subscribe.js');
const paymentRoutes = require('./routes/payments.js');
const userRoutes = require('./routes/users.js');
const googleAuthRoutes = require('./routes/googleAuth.js');
const catalogueRoutes = require('./routes/catalogues.js');
const adminRoutes = require('./routes/admin.js');
const careerRoutes = require('./routes/careers.js');
const lmsRoutes = require('./routes/lms.js');
const projectRoutes = require('./routes/projects.js');



const { port, allowedDomains } = config;

const app = express();

// CORS & Middlewares
app.use(cors({
  origin: allowedDomains,
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 2 Environment detection
const isDev = process.env.NODE_ENV !== 'production';

// 3 Static serving of production uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4 Utility to ensure a directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 5 Multer storage (images only; files use fileUpload middleware)
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

// 6 Multer instance for image uploads

const imageUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    cb(null, allowed.test(ext));
  }
});

// 7️Routes for uploadsn only
app.post(
  '/upload/images',
  imageUpload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // When Cloudinary is configured, push the file to the CDN and return its
    // public URL. Otherwise keep the legacy local-disk filename behaviour.
    if (cloudinaryEnabled) {
      try {
        const buffer = fs.readFileSync(req.file.path);
        const url = await cloudinaryUpload(buffer, {
          folder: 'lasglowtech/images',
          resourceType: 'image',
        });
        fs.unlink(req.file.path, () => {});
        return res.status(200).json(url);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    res.status(200).json(req.file.filename);
  }
);


// 8️⃣ API routes
app.use('/posts', postRoutes);
app.use('/blog', blogRoutes);
app.use('/', newsletterRoutes);

app.use('/subscribe', subscribRoutes);
app.use('/contacts', contactRoutes);
app.use('/payments', paymentRoutes);
app.use('/users', userRoutes);
app.use('/auth/google', googleAuthRoutes);
app.use('/catalogues', catalogueRoutes);
app.use('/admin', adminRoutes);
app.use('/careers', careerRoutes);
app.use('/lms', lmsRoutes);
app.use('/projects', projectRoutes);


// health check endpoint (includes DB connectivity check)
app.get('/api/health', async (req, res) => {
  try {
    const db = require('./db');
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'up' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'down', message: err.message });
  }
});

// 9️⃣ Start the server with graceful shutdown (production / PM2)
let server;
function startServer() {
  // Render/other PaaS require binding to 0.0.0.0; ignore HOST=localhost.
  const host = process.env.HOST && process.env.HOST !== 'localhost' ? process.env.HOST : '0.0.0.0';
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
    console.error('Bootstrap failed:', error && (error.stack || error.message || error));
    // Do NOT exit, just continue
  })
  .finally(() => {
    startServer();
    setInterval(() => processScheduledNewsletters().catch((error) => console.error('Scheduled newsletter check failed:', error && (error.stack || error.message || error))), 60 * 1000);
  });
