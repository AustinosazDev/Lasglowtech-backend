const db = require('../db');

/**
 * Get the first admin user's email from the database (for notifications, etc.).
 * Use this instead of process.env.ADMIN_EMAIL so it works in production.
 * @returns {Promise<string|null>}
 */
async function getAdminEmail() {
  const [rows] = await db.query(
    "SELECT email FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
  );
  return rows.length ? (rows[0].email || null) : null;
}

module.exports = { getAdminEmail };
