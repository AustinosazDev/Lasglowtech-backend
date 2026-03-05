const db = require('../db');
const config = require('../config');

const localServerApi = process.env.LOCAL_SERVER_API || `http://localhost:${config.port || 5000}`;
const remoteServerApi = config.remote_server_api || '';

const slugify = (text = '') =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildImageUrl = (imagePath = '') => {
  if (!imagePath) return '';

  // Already absolute URL
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath.replace('/upload/images/', '/uploads/images/');
  }

  const normalized = imagePath.startsWith('/')
    ? imagePath.replace('/upload/images/', '/uploads/images/')
    : `/uploads/images/${imagePath}`;

  const isLocal = process.env.NODE_ENV !== 'production';
  return `${isLocal ? localServerApi : remoteServerApi}${normalized}`;
};

const mapCatalogue = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  summary: row.summary,
  description: row.description,
  imageUrl: buildImageUrl(row.image_url),
  price: Number(row.price),
  packageTier: row.package_tier || 'standard',
  isPopular: Boolean(row.is_popular),
  features: (() => {
    try {
      const parsed = JSON.parse(row.features_json || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  })(),
  paymentType: row.payment_type,
  currency: row.currency,
  isPaymentEnabled: Boolean(row.is_payment_enabled),
  isPublished: Boolean(row.is_published),
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getCatalogues = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM catalogues
       WHERE is_published = 1
       ORDER BY sort_order ASC, id DESC`
    );
    return res.status(200).json(rows.map(mapCatalogue));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCataloguePreview = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, title, slug, summary, image_url, price, package_tier, is_popular, features_json, payment_type, currency, is_payment_enabled
       FROM catalogues
       WHERE is_published = 1
       ORDER BY sort_order ASC, id DESC
       LIMIT 3`
    );
    return res.status(200).json(rows.map(mapCatalogue));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCatalogueBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM catalogues WHERE slug = ? AND is_published = 1 LIMIT 1',
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Catalogue not found.' });
    }

    return res.status(200).json(mapCatalogue(rows[0]));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAdminCatalogues = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM catalogues ORDER BY id DESC');
    return res.status(200).json(rows.map(mapCatalogue));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createCatalogue = async (req, res) => {
  const {
    title,
    summary,
    description,
    imageUrl,
    price,
    packageTier,
    isPopular,
    features,
    paymentType,
    currency,
    isPaymentEnabled,
    isPublished,
    sortOrder,
  } = req.body;

  if (!title || !summary) {
    return res.status(400).json({ error: 'title and summary are required.' });
  }

  const slug = slugify(title);

  try {
    const [exists] = await db.query('SELECT id FROM catalogues WHERE slug = ? LIMIT 1', [slug]);
    if (exists.length) {
      return res.status(409).json({ error: 'Catalogue title already exists.' });
    }

    const [result] = await db.query(
      `INSERT INTO catalogues
      (title, slug, summary, description, image_url, price, package_tier, is_popular, features_json, payment_type, currency, is_payment_enabled, is_published, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        summary,
        description || '',
        (imageUrl || '').replace('/upload/images/', '/uploads/images/'),
        Number(price || 0),
        ['starter', 'standard', 'premium'].includes(packageTier) ? packageTier : 'standard',
        isPopular ? 1 : 0,
        JSON.stringify(Array.isArray(features) ? features : []),
        paymentType || 'full',
        currency || 'NGN',
        isPaymentEnabled ? 1 : 0,
        isPublished ? 1 : 0,
        Number(sortOrder || 0),
      ]
    );

    return res.status(201).json({ id: result.insertId, slug, message: 'Catalogue created.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateCatalogue = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    summary,
    description,
    imageUrl,
    price,
    packageTier,
    isPopular,
    features,
    paymentType,
    currency,
    isPaymentEnabled,
    isPublished,
    sortOrder,
  } = req.body;

  if (!title || !summary) {
    return res.status(400).json({ error: 'title and summary are required.' });
  }

  const slug = slugify(title);

  try {
    const [exists] = await db.query('SELECT id FROM catalogues WHERE slug = ? AND id != ? LIMIT 1', [slug, id]);
    if (exists.length) {
      return res.status(409).json({ error: 'Another catalogue with this title exists.' });
    }

    await db.query(
      `UPDATE catalogues
       SET title = ?, slug = ?, summary = ?, description = ?, image_url = ?, price = ?, package_tier = ?, is_popular = ?, features_json = ?, payment_type = ?,
           currency = ?, is_payment_enabled = ?, is_published = ?, sort_order = ?
       WHERE id = ?`,
      [
        title,
        slug,
        summary,
        description || '',
        (imageUrl || '').replace('/upload/images/', '/uploads/images/'),
        Number(price || 0),
        ['starter', 'standard', 'premium'].includes(packageTier) ? packageTier : 'standard',
        isPopular ? 1 : 0,
        JSON.stringify(Array.isArray(features) ? features : []),
        paymentType || 'full',
        currency || 'NGN',
        isPaymentEnabled ? 1 : 0,
        isPublished ? 1 : 0,
        Number(sortOrder || 0),
        id,
      ]
    );

    return res.status(200).json({ message: 'Catalogue updated.', slug });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteCatalogue = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM catalogues WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Catalogue deleted.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCatalogues,
  getCataloguePreview,
  getCatalogueBySlug,
  getAdminCatalogues,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
};
