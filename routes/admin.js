const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const db = require('../db');
const { verifyAdmin } = require('../middlewares/auth');
const { sendBulkEmail } = require('../utils/notifications');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadsDir = path.join(__dirname, '..', 'uploads');
const certificateBgUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => cb(null, 'certificate-bg.png'),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpeg|jpg)$/.test(file.mimetype);
    cb(null, !!ok);
  },
});

const certificateLogoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => cb(null, 'certificate-logo.png'),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpeg|jpg)$/.test(file.mimetype);
    cb(null, !!ok);
  },
});

const certificateSealUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => cb(null, 'certificate-seal.png'),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpeg|jpg|webp)$/.test(file.mimetype);
    cb(null, !!ok);
  },
});

const certificateSignatureUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => cb(null, 'certificate-signature.png'),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpeg|jpg|webp)$/.test(file.mimetype);
    cb(null, !!ok);
  },
});

const filesDir = path.join(uploadsDir, 'files');
const { ensureDeliverablesDir, DELIVERABLES_DIR } = require('../utils/delivery');
const deliverableUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDeliverablesDir();
      cb(null, DELIVERABLES_DIR);
    },
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '').toLowerCase();
      const safeBase = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .slice(0, 80);
      cb(null, `catalogue-${Date.now()}-${safeBase || 'file'}${ext || '.pdf'}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|zip|epub|docx?)$/i.test(file.originalname);
    cb(null, allowed);
  },
});
const moduleResourceUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });
      cb(null, filesDir);
    },
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '.pdf').toLowerCase();
      cb(null, `module-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^application\/pdf$/.test(file.mimetype) || /\.pdf$/i.test(file.originalname);
    cb(null, !!ok);
  },
});

const jwtSecret = config.secret || process.env.JWT_SECRET || 'lasglowtech-dev-secret';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, email, password FROM users WHERE email = ? AND role = 'admin' LIMIT 1",
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const admin = rows[0];
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      jwtSecret,
      { expiresIn: config.expires_in || '1d' }
    );

    return res.status(200).json({
      message: 'Admin login successful.',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * One-time setup: create first admin with plain email/password (hashed automatically).
 * Only works when no admin exists. Call once from Postman/browser when deploying.
 * POST /admin/setup { "email": "...", "password": "..." }
 */
router.post('/setup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );
    if (existing.length) {
      return res.status(403).json({
        message: 'Admin already exists. Use login or create-admin script to add more.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0] || 'admin';

    await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'admin']
    );

    return res.status(201).json({
      message: 'Admin created. You can now use POST /admin/login with this email and password.',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const normalizeEmails = (input) => {
  if (!input) return [];
  const raw = Array.isArray(input) ? input.join(',') : String(input);
  const matches = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return [...new Set(matches.map((e) => e.trim().toLowerCase()))];
};

const csvEmails = (buffer) => {
  const text = String(buffer || '');
  return normalizeEmails(text);
};

const isTruthy = (value) => String(value).toLowerCase() === 'true' || String(value) === '1';

const resolveRecipients = async ({ emails, includeSubscribers }) => {
  let recipients = normalizeEmails(emails);
  if (includeSubscribers) {
    const [rows] = await db.query(
      `SELECT email FROM email_subscriptions
       UNION
       SELECT email FROM users
       UNION
       SELECT email FROM career_applications`
    );
    recipients = [...new Set([...recipients, ...rows.map((r) => String(r.email || '').toLowerCase())])];
  }
  return recipients;
};

const allowedAttachmentExt = new Set(['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg']);
const buildAttachments = (files = []) => {
  return files
    .filter((file) => allowedAttachmentExt.has(path.extname(file.originalname || '').toLowerCase()))
    .map((file) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype || undefined,
    }));
};

const toHtml = (message = '') => {
  const lines = String(message || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length ? `<p style="font-size:14px;line-height:1.7;">${lines.join('<br/>')}</p>` : '<p></p>';
};

const persistCampaign = async ({ subject, bodyHtml, results, createdBy }) => {
  const totalRecipients = results.length;
  const totalSent = results.filter((r) => r.status === 'sent').length;
  const totalFailed = totalRecipients - totalSent;

  const [campaignResult] = await db.query(
    `INSERT INTO bulk_email_campaigns (subject, body_html, total_recipients, total_sent, total_failed, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [subject, bodyHtml, totalRecipients, totalSent, totalFailed, createdBy || 'admin']
  );

  if (results.length) {
    const values = results.map((row) => [
      campaignResult.insertId,
      row.email,
      row.status === 'sent' ? 'sent' : 'failed',
      row.errorMessage || '',
      row.status === 'sent' ? new Date() : null,
    ]);
    await db.query(
      `INSERT INTO bulk_email_recipients (campaign_id, email, status, error_message, sent_at)
       VALUES ?`,
      [values]
    );
  }

  return { totalRecipients, totalSent, totalFailed, campaignId: campaignResult.insertId };
};

router.post('/bulk-email/send', verifyAdmin, async (req, res) => {
  const { subject, message, emails, includeSubscribers } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ message: 'subject and message are required.' });
  }

  try {
    const recipients = await resolveRecipients({ emails, includeSubscribers });

    if (!recipients.length) {
      return res.status(400).json({ message: 'No valid recipient emails found.' });
    }

    const bodyHtml = toHtml(message);
    const results = await sendBulkEmail({
      recipients,
      subject,
      messageHtml: bodyHtml,
    });
    const stats = await persistCampaign({
      subject,
      bodyHtml,
      results,
      createdBy: req.user?.email || 'admin',
    });

    return res.status(200).json({
      message: 'Bulk email completed.',
      ...stats,
      preview: results.slice(0, 10),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/bulk-email/send-with-files', verifyAdmin, upload.array('attachments', 5), async (req, res) => {
  const { subject, message, emails, includeSubscribers } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ message: 'subject and message are required.' });
  }

  try {
    const recipients = await resolveRecipients({
      emails,
      includeSubscribers: isTruthy(includeSubscribers),
    });
    if (!recipients.length) {
      return res.status(400).json({ message: 'No valid recipient emails found.' });
    }

    const bodyHtml = toHtml(message);
    const attachments = buildAttachments(req.files || []);
    const results = await sendBulkEmail({
      recipients,
      subject,
      messageHtml: bodyHtml,
      attachments,
    });
    const stats = await persistCampaign({
      subject,
      bodyHtml,
      results,
      createdBy: req.user?.email || 'admin',
    });

    return res.status(200).json({
      message: 'Bulk email with attachments completed.',
      ...stats,
      attachmentsIncluded: attachments.length,
      preview: results.slice(0, 10),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/bulk-email/send-csv', verifyAdmin, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'attachments', maxCount: 5 },
]), async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ message: 'subject and message are required.' });
  }
  const csvFile = req.files?.file?.[0];
  if (!csvFile?.buffer) {
    return res.status(400).json({ message: 'CSV file is required.' });
  }

  try {
    const recipients = csvEmails(csvFile.buffer);
    if (!recipients.length) {
      return res.status(400).json({ message: 'No valid emails found in file.' });
    }

    const bodyHtml = toHtml(message);
    const results = await sendBulkEmail({
      recipients,
      subject,
      messageHtml: bodyHtml,
      attachments: buildAttachments(req.files?.attachments || []),
    });
    const stats = await persistCampaign({
      subject,
      bodyHtml,
      results,
      createdBy: req.user?.email || 'admin',
    });

    return res.status(200).json({
      message: 'Bulk email from CSV completed.',
      ...stats,
      preview: results.slice(0, 10),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/bulk-email/campaigns', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, subject, total_recipients, total_sent, total_failed, created_by, created_at
       FROM bulk_email_campaigns
       ORDER BY id DESC
       LIMIT 100`
    );
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * Upload certificate background image (PNG/JPEG). Replaces existing.
 */
router.post(
  '/upload/certificate-background',
  verifyAdmin,
  certificateBgUpload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file" and PNG or JPEG.' });
    }
    const baseUrl = (process.env.API_URL || process.env.SITE_URL || '').replace(/\/$/, '');
    const url = baseUrl ? `${baseUrl}/uploads/certificate-bg.png` : '/uploads/certificate-bg.png';
    return res.status(200).json({ message: 'Certificate background updated.', url });
  }
);

/**
 * Upload certificate logo (PNG/JPEG). Replaces existing. Used on certificates.
 */
router.post(
  '/upload/certificate-logo',
  verifyAdmin,
  certificateLogoUpload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file" and PNG or JPEG.' });
    }
    const baseUrl = (process.env.SITE_URL || process.env.API_URL || '').replace(/\/$/, '');
    const url = baseUrl ? `${baseUrl}/uploads/certificate-logo.png` : '/uploads/certificate-logo.png';
    return res.status(200).json({ message: 'Certificate logo updated.', url });
  }
);

/**
 * Upload certificate seal image (PNG/JPEG/WEBP). Replaces uploads/certificate-seal.png.
 */
router.post(
  '/upload/certificate-seal',
  verifyAdmin,
  certificateSealUpload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file" and PNG, JPEG, or WEBP.' });
    }
    const baseUrl = (process.env.API_URL || process.env.SITE_URL || '').replace(/\/$/, '');
    const url = baseUrl ? `${baseUrl}/uploads/certificate-seal.png` : '/uploads/certificate-seal.png';
    return res.status(200).json({ message: 'Certificate seal updated.', url });
  }
);

/**
 * Upload handwritten signature (PNG with transparency recommended). Replaces uploads/certificate-signature.png.
 */
router.post(
  '/upload/certificate-signature',
  verifyAdmin,
  certificateSignatureUpload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file" and PNG, JPEG, or WEBP.' });
    }
    const baseUrl = (process.env.API_URL || process.env.SITE_URL || '').replace(/\/$/, '');
    const url = baseUrl ? `${baseUrl}/uploads/certificate-signature.png` : '/uploads/certificate-signature.png';
    return res.status(200).json({ message: 'Certificate signature image updated.', url });
  }
);

/**
 * Upload module resource PDF (course note). Saved to uploads/files. Returns URL for resourceUrl.
 */
router.post(
  '/upload/module-resource',
  verifyAdmin,
  moduleResourceUpload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file" and a PDF.' });
    }
    if (req.file.size === 0) {
      return res.status(400).json({ error: 'Uploaded file is empty' });
    }
    const baseUrl = (process.env.SITE_URL || process.env.API_URL || '').replace(/\/$/, '');
    const url = baseUrl ? `${baseUrl}/uploads/files/${req.file.filename}` : `/uploads/files/${req.file.filename}`;
    return res.status(200).json({ message: 'Course note PDF uploaded.', url });
  }
);

router.post(
  '/upload/catalogue-deliverable',
  verifyAdmin,
  deliverableUpload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file" (PDF, ZIP, EPUB, DOC).' });
    }
    if (req.file.size === 0) {
      return res.status(400).json({ error: 'Uploaded file is empty' });
    }
    return res.status(200).json({
      message: 'Deliverable uploaded.',
      storedName: req.file.filename,
      originalName: req.file.originalname,
    });
  }
);

/**
 * Get certificate default settings (message, signature label).
 */
router.get('/certificate-settings', verifyAdmin, async (req, res) => {
  try {
    const [[row]] = await db.query('SELECT default_message, default_signature_label FROM certificate_settings WHERE id = 1 LIMIT 1');
    return res.status(200).json({
      defaultMessage: row?.default_message ?? '',
      defaultSignatureLabel: row?.default_signature_label ?? 'Authorized Signatory',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Update certificate default settings.
 */
router.put('/certificate-settings', verifyAdmin, async (req, res) => {
  const { defaultMessage, defaultSignatureLabel } = req.body || {};
  try {
    await db.query(
      `INSERT INTO certificate_settings (id, default_message, default_signature_label)
       VALUES (1, ?, ?)
       ON DUPLICATE KEY UPDATE default_message = VALUES(default_message), default_signature_label = VALUES(default_signature_label)`,
      [defaultMessage != null ? String(defaultMessage) : '', defaultSignatureLabel != null ? String(defaultSignatureLabel) : 'Authorized Signatory']
    );
    return res.status(200).json({ message: 'Certificate settings saved.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
