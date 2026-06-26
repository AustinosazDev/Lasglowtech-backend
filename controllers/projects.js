const db = require('../db');
const config = require('../config');
const { getPublicClientOrigin } = require('../utils/publicClientOrigin');

const localServerApi = process.env.LOCAL_SERVER_API || `http://localhost:${config.port || 5000}`;
const remoteServerApi = config.remote_server_api || '';

const DEFAULT_CATEGORIES = ['Websites', 'Branding', 'Graphics', 'Web/UI'];

/** Normalize image path for database storage. */
const normalizeImageStorage = (imageUrl = '') => {
  const trimmed = String(imageUrl || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/projects/') || trimmed.startsWith('/uploads/')) return trimmed;
  if (trimmed.startsWith('/upload/images/')) {
    return trimmed.replace('/upload/images/', '/uploads/images/');
  }
  return trimmed;
};

const buildImageUrl = (imagePath = '') => {
  const raw = String(imagePath || '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace('/upload/images/', '/uploads/images/');
  }

  if (raw.startsWith('/projects/')) {
    return `${getPublicClientOrigin()}${raw}`;
  }

  const normalized = raw.startsWith('/')
    ? raw.replace('/upload/images/', '/uploads/images/')
    : `/uploads/images/${raw}`;

  const isLocal = process.env.NODE_ENV !== 'production';
  return `${isLocal ? localServerApi : remoteServerApi}${normalized}`;
};

const mapProject = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  category: row.category,
  imageUrl: buildImageUrl(row.image_url),
  externalLink: row.external_link || '',
  sortOrder: row.sort_order,
  isFeatured: Boolean(row.is_featured),
  isPublished: Boolean(row.is_published),
  isCaseStudy: Boolean(row.is_case_study),
  summary: row.summary || '',
  challenge: row.challenge || '',
  solution: row.solution || '',
  result: row.result || '',
  ctaLabel: row.cta_label || 'View project',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeCategory = (value) => {
  const trimmed = String(value || '').trim();
  return trimmed || 'Uncategorized';
};

const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT category
       FROM projects
       WHERE category IS NOT NULL AND TRIM(category) != ''
       ORDER BY category ASC`
    );
    const fromDb = rows.map((row) => row.category);
    const merged = [...new Set([...DEFAULT_CATEGORIES, ...fromDb])].sort((a, b) =>
      a.localeCompare(b)
    );
    return res.status(200).json(merged);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getPublicCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT category
       FROM projects
       WHERE is_published = 1
         AND is_case_study = 0
         AND category IS NOT NULL
         AND TRIM(category) != ''
       ORDER BY category ASC`
    );
    return res.status(200).json(rows.map((row) => row.category));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM projects
       WHERE is_published = 1 AND is_case_study = 0
       ORDER BY sort_order ASC, id DESC`
    );
    return res.status(200).json(rows.map(mapProject));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCaseStudies = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM projects
       WHERE is_published = 1 AND is_case_study = 1
       ORDER BY sort_order ASC, id DESC`
    );
    return res.status(200).json(rows.map(mapProject));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAdminProjects = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects ORDER BY sort_order ASC, id DESC');
    return res.status(200).json(rows.map(mapProject));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createProject = async (req, res) => {
  const {
    title,
    description,
    category,
    imageUrl,
    externalLink,
    sortOrder,
    isFeatured,
    isPublished,
    isCaseStudy,
    summary,
    challenge,
    solution,
    result: resultText,
    ctaLabel,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  try {
    const [insertResult] = await db.query(
      `INSERT INTO projects
      (title, description, category, image_url, external_link, sort_order, is_featured, is_published, is_case_study,
       summary, challenge, solution, result, cta_label)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        normalizeCategory(category),
        normalizeImageStorage(imageUrl),
        externalLink || '',
        Number(sortOrder || 0),
        isFeatured ? 1 : 0,
        isPublished !== false ? 1 : 0,
        isCaseStudy ? 1 : 0,
        summary || '',
        challenge || '',
        solution || '',
        resultText || '',
        ctaLabel || 'View project',
      ]
    );

    return res.status(201).json({ id: insertResult.insertId, message: 'Project created.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    imageUrl,
    externalLink,
    sortOrder,
    isFeatured,
    isPublished,
    isCaseStudy,
    summary,
    challenge,
    solution,
    result: resultText,
    ctaLabel,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required.' });
  }

  try {
    const [exists] = await db.query('SELECT id FROM projects WHERE id = ? LIMIT 1', [id]);
    if (!exists.length) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    await db.query(
      `UPDATE projects SET
        title = ?, description = ?, category = ?, image_url = ?, external_link = ?,
        sort_order = ?, is_featured = ?, is_published = ?, is_case_study = ?,
        summary = ?, challenge = ?, solution = ?, result = ?, cta_label = ?
       WHERE id = ?`,
      [
        title,
        description || '',
        normalizeCategory(category),
        normalizeImageStorage(imageUrl),
        externalLink || '',
        Number(sortOrder || 0),
        isFeatured ? 1 : 0,
        isPublished ? 1 : 0,
        isCaseStudy ? 1 : 0,
        summary || '',
        challenge || '',
        solution || '',
        resultText || '',
        ctaLabel || 'View project',
        id,
      ]
    );

    return res.status(200).json({ message: 'Project updated.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const [deleteResult] = await db.query('DELETE FROM projects WHERE id = ?', [id]);
    if (!deleteResult.affectedRows) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.status(200).json({ message: 'Project deleted.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProjects,
  getCaseStudies,
  getCategories,
  getPublicCategories,
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
};
