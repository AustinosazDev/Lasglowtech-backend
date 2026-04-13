const strip = (v) => {
  const s = v != null ? String(v).trim() : '';
  return s ? s.replace(/\/$/, '') : '';
};

/**
 * Public SPA origin (certificate QR, verify links).
 * Uses FRONTEND_URL / SITE_URL if set, otherwise your .env client apps:
 * - production: REMOTE_CLIENT_APP
 * - otherwise: LOCAL_CLIENT_APP, then REMOTE_CLIENT_APP as fallback
 */
const getPublicClientOrigin = () => {
  const explicit = strip(process.env.FRONTEND_URL) || strip(process.env.SITE_URL);
  if (explicit) return explicit;

  const isProd = String(process.env.NODE_ENV).toLowerCase() === 'production';
  if (isProd) {
    return strip(process.env.REMOTE_CLIENT_APP) || strip(process.env.LOCAL_CLIENT_APP);
  }
  return strip(process.env.LOCAL_CLIENT_APP) || strip(process.env.REMOTE_CLIENT_APP);
};

module.exports = { getPublicClientOrigin };
