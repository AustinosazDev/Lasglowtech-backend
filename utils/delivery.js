const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { getPublicClientOrigin } = require('./publicClientOrigin');

const DELIVERABLES_DIR = path.join(__dirname, '..', 'private', 'deliverables');

const ensureDeliverablesDir = () => {
  if (!fs.existsSync(DELIVERABLES_DIR)) {
    fs.mkdirSync(DELIVERABLES_DIR, { recursive: true });
  }
};

const generateDownloadToken = () => crypto.randomBytes(32).toString('hex');

const getDownloadPageUrl = (token) => {
  const origin = getPublicClientOrigin() || '';
  return `${origin}/download/${token}`;
};

const config = require('../config');

const getApiBase = () => {
  const explicit = (process.env.SITE_URL || process.env.API_URL || process.env.LOCAL_SERVER_API || '').replace(/\/$/, '');
  if (explicit) return explicit;
  return `http://localhost:${config.port || 5000}`;
};

const getApiDownloadUrl = (token) => `${getApiBase()}/payments/download/${token}`;

const isDigitalDelivery = (deliveryType) =>
  deliveryType === 'digital_file' || deliveryType === 'digital_link';

const getStoredFilePath = (storedName) => path.join(DELIVERABLES_DIR, storedName);

const parseStoredFileName = (deliverableFileUrl = '') => {
  if (!deliverableFileUrl) return '';
  const normalized = String(deliverableFileUrl).replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || '';
};

const mapDeliveryMeta = (catalogueRow = {}) => {
  const deliveryType = catalogueRow.delivery_type || 'service';
  const isDigital = isDigitalDelivery(deliveryType);
  const hasUploadedFile = deliveryType === 'digital_file' && Boolean(catalogueRow.deliverable_file_url);
  const hasExternalLink =
    deliveryType === 'digital_link' && Boolean(catalogueRow.deliverable_external_url);

  return {
    deliveryType,
    isDigitalProduct: isDigital,
    hasInstantDownload: hasUploadedFile,
    hasExternalDelivery: hasExternalLink,
    deliverableFileName: catalogueRow.deliverable_file_name || '',
  };
};

module.exports = {
  DELIVERABLES_DIR,
  ensureDeliverablesDir,
  generateDownloadToken,
  getDownloadPageUrl,
  getApiDownloadUrl,
  isDigitalDelivery,
  getStoredFilePath,
  parseStoredFileName,
  mapDeliveryMeta,
};
